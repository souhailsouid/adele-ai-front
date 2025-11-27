/**
 * Service de screening intelligent pour détecter des opportunités de trading
 */

import fmpClient from "/lib/fmp/client";
import { getWatchlistSymbols } from "/config/watchlist";

export class SmartScreener {
  /**
   * Calculer le volume moyen à partir des données historiques
   * Les données historiques de FMP contiennent: date, open, high, low, close, volume, etc.
   */
  calculateAverageVolume(history, days = 20) {
    if (!history || history.length === 0) {
      console.log("calculateAverageVolume: history is empty or null");
      return 0;
    }
    
    // Les données historiques sont déjà un tableau d'objets
    // Chaque objet contient: { date, open, high, low, close, volume, ... }
    if (!Array.isArray(history)) {
      console.log("calculateAverageVolume: history is not an array", typeof history);
      return 0;
    }
    
    // Prendre les N derniers jours (les données sont généralement triées du plus récent au plus ancien)
    const recentHistory = history.slice(0, Math.min(days, history.length));
    
    // Extraire les volumes (le champ est "volume" dans l'API FMP)
    const volumes = recentHistory
      .map((h) => {
        const vol = h.volume;
        return typeof vol === 'number' && vol > 0 ? vol : null;
      })
      .filter((v) => v !== null);
    
    if (volumes.length === 0) {
      console.log("calculateAverageVolume: no valid volumes found", {
        historyLength: history.length,
        sampleItem: history[0] || null,
        sampleKeys: history[0] ? Object.keys(history[0]) : []
      });
      return 0;
    }
    
    const sum = volumes.reduce((acc, v) => acc + v, 0);
    const avg = Math.round(sum / volumes.length);
    console.log(`calculateAverageVolume: calculated avg = ${avg} from ${volumes.length} days`);
    return avg;
  }

  /**
   * Trouver des opportunités avant earnings
   */
  async findEarningsOpportunities(daysAhead = 7) {
    try {
      // Calculer les dates
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + daysAhead);
      
      const from = today.toISOString().split("T")[0];
      const to = futureDate.toISOString().split("T")[0];

      // Récupérer le calendrier earnings
      const earnings = await fmpClient.getEarningsCalendar(from, to);
      
      if (!earnings || earnings.length === 0) {
        return [];
      }

      // Filtrer pour ne garder que les compagnies de la watchlist
      const watchlistSymbols = getWatchlistSymbols();
      const filteredEarnings = earnings.filter((earning) =>
        watchlistSymbols.includes(earning.symbol?.toUpperCase())
      );

      // Si aucun earnings dans la watchlist, utiliser tous les earnings (limité à 20)
      const earningsToAnalyze =
        filteredEarnings.length > 0
          ? filteredEarnings
          : earnings.slice(0, 20);

      // Analyser chaque symbole séquentiellement pour éviter le rate limiting
      // Limiter à 10 pour ne pas dépasser les limites
      const opportunities = [];
      const limitedEarnings = earningsToAnalyze.slice(0, 10);
      
      for (const earning of limitedEarnings) {
        try {
          const symbol = earning.symbol;
          // Faire les appels séquentiellement avec un petit délai
          const quote = await fmpClient.getQuote(symbol).catch(() => null);
          if (!quote) continue;
          
          const [rsi, history] = await Promise.all([
            fmpClient.getRSI(symbol, 14, "1day").catch(() => null),
            fmpClient.getHistoricalData(symbol, "1month").catch(() => []),
          ]);

          console.log(`screener.js:203 avgVolume calculation for ${symbol}`, {
            historyLength: history?.length || 0,
            historyType: Array.isArray(history) ? 'array' : typeof history,
            historySample: history?.slice?.(0, 2) || history
          });

          // Calculer le volume moyen à partir de l'historique
          const avgVolume = this.calculateAverageVolume(history, 20);
          console.log(`screener.js:204 quote.volume for ${symbol}`, quote.volume);
          const volumeSpike = avgVolume > 0 && quote.volume > avgVolume * 2;
          const preEarningsTrend = this.analyzeTrend(history);
          
          const confidenceScore = this.calculateEarningsScore(
            earning,
            quote,
            rsi,
            preEarningsTrend,
            volumeSpike
          );

          const opportunity = {
            symbol,
            company: earning.name || symbol,
            earningsDate: earning.date,
            earningsTime: earning.time,
            currentPrice: quote.price,
            change: quote.change || 0,
            changePercent: quote.changePercentage || quote.changePercent || 0,
            rsi: rsi?.rsi || (typeof rsi === "number" ? rsi : null),
            preEarningsTrend,
            volumeSpike,
            volume: quote.volume || 0,
            avgVolume: avgVolume,
            confidenceScore,
          };

          opportunities.push(opportunity);
        } catch (error) {
          console.error(`Error analyzing ${earning.symbol}:`, error);
        }
        
        // Petit délai entre chaque analyse pour respecter le rate limit
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Filtrer les null et trier par score (les plus élevés en premier)
      // Afficher toutes les opportunités, même avec un score bas
      return opportunities
        .filter((opp) => opp !== null)
        .sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0));
    } catch (error) {
      console.error("Error finding earnings opportunities:", error);
      throw error;
    }
  }

  /**
   * Trouver des rebonds oversold (RSI < 30 + volume élevé)
   */
  async findOversoldBounces(symbols = null) {
    try {
      // Utiliser la watchlist par défaut si aucun symbole n'est fourni
      const watchlist = symbols || getWatchlistSymbols();

      const results = await Promise.all(
        watchlist.map(async (symbol) => {
          try {
            const [quote, rsi, history] = await Promise.all([
              fmpClient.getQuote(symbol).catch(() => null),
              fmpClient.getRSI(symbol, 14, "1day").catch(() => null),
              fmpClient.getHistoricalData(symbol, "1month").catch(() => []),
            ]);

            if (!quote || !rsi) return null;

            const rsiValue = typeof rsi === "number" ? rsi : rsi.rsi;
            
            // Calculer le volume moyen à partir de l'historique
            const avgVolume = this.calculateAverageVolume(history, 20);
            const volumeRatio =
              avgVolume > 0 && quote.volume
                ? quote.volume / avgVolume
                : 0;

            if (rsiValue < 30 && volumeRatio > 1.5) {
              return {
                symbol,
                price: quote.price,
                change: quote.change || 0,
                changePercent: quote.changePercentage || quote.changePercent || 0,
                rsi: rsiValue,
                volumeRatio: volumeRatio.toFixed(2),
                volume: quote.volume || 0,
                avgVolume: avgVolume,
                setup: "oversold_bounce",
                strength: this.calculateOversoldStrength(rsiValue, volumeRatio),
              };
            }
            return null;
          } catch (error) {
            console.error(`Error checking ${symbol}:`, error);
            return null;
          }
        })
      );

      return results
        .filter(Boolean)
        .sort((a, b) => b.strength - a.strength);
    } catch (error) {
      console.error("Error finding oversold bounces:", error);
      throw error;
    }
  }

  /**
   * Détecter des volumes anormaux
   */
  async findUnusualVolume(threshold = 3, symbols = null) {
    try {
      // Utiliser la watchlist par défaut si aucun symbole n'est fourni
      const watchlist = symbols || getWatchlistSymbols();

      const results = await Promise.all(
        watchlist.map(async (symbol) => {
          try {
            const [quote, history] = await Promise.all([
              fmpClient.getQuote(symbol).catch(() => null),
              fmpClient.getHistoricalData(symbol, "1month").catch(() => []),
            ]);
              console.log('quote ', quote)    
              console.log('history ', history)
            if (!quote) return null;

            // Calculer le volume moyen à partir de l'historique
              const avgVolume = this.calculateAverageVolume(history, 20);
              console.log('avgVolume ', avgVolume)
              console.log('quote.volume ', quote.volume)
            if (avgVolume === 0 || !quote.volume) return null;

            const volumeRatio = quote.volume / avgVolume;

            if (volumeRatio >= threshold) {
              return {
                symbol,
                price: quote.price,
                change: quote.change || 0,
                changePercent: quote.changePercentage || quote.changePercent || 0,
                volume: quote.volume,
                avgVolume: avgVolume,
                volumeRatio: volumeRatio.toFixed(2),
                direction: (quote.changePercentage || quote.changePercent || 0) > 0 ? "up" : "down",
              };
            }
            return null;
          } catch (error) {
            console.error(`Error checking ${symbol}:`, error);
            return null;
          }
        })
      );

      return results
        .filter(Boolean)
        .sort((a, b) => parseFloat(b.volumeRatio) - parseFloat(a.volumeRatio));
    } catch (error) {
      console.error("Error finding unusual volume:", error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Analyser la tendance avant earnings
   */
  analyzeTrend(history) {
    if (!history || history.length < 5) return "neutral";

    const recent = history.slice(0, 5);
    const prices = recent.map((h) => h.close);
    const firstPrice = prices[prices.length - 1];
    const lastPrice = prices[0];

    const change = ((lastPrice - firstPrice) / firstPrice) * 100;

    if (change > 3) return "bullish";
    if (change < -3) return "bearish";
    return "neutral";
  }

  /**
   * Calculer un score de confiance pour un earnings play
   */
  calculateEarningsScore(earning, quote, rsi, trend, volumeSpike) {
    let score = 50; // Base score

    const changePercent = quote.changePercentage || quote.changePercent || 0;

    // Momentum prix
    if (changePercent > 2) score += 15;
    else if (changePercent > 0) score += 5;
    else if (changePercent < -2) score -= 10;

    // RSI (ni trop oversold ni overbought)
    if (rsi) {
      const rsiValue = typeof rsi === "number" ? rsi : rsi.rsi;
      if (rsiValue >= 40 && rsiValue <= 70) score += 10;
      else if (rsiValue < 30) score -= 5; // Trop oversold
      else if (rsiValue > 80) score -= 10; // Trop overbought
    }

    // Tendance pré-earnings
    if (trend === "bullish") score += 15;
    else if (trend === "bearish") score -= 10;

    // Volume anormal
    if (volumeSpike) score += 10;

    // Market cap (liquidité) - si disponible
    if (quote.marketCap && quote.marketCap > 10_000_000_000) {
      score += 5; // Grande capitalisation = plus liquide
    }

    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * Calculer la force d'un setup oversold
   */
  calculateOversoldStrength(rsi, volumeRatio) {
    let strength = 50;

    // RSI très oversold = plus fort
    if (rsi < 20) strength += 30;
    else if (rsi < 25) strength += 20;
    else strength += 10;

    // Volume élevé = plus fort
    if (volumeRatio > 3) strength += 20;
    else if (volumeRatio > 2) strength += 10;

    return Math.min(strength, 100);
  }
}

export const smartScreener = new SmartScreener();
export default smartScreener;

