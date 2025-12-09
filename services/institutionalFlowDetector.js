/**
 * Institutional Flow Detector
 * 
 * Détecte les mouvements institutionnels AVANT la publication des 13F
 * Analyse les signaux : options, dark pools, volumes, patterns
 */

import fmpUWClient from "/lib/api/fmpUnusualWhalesClient";
import whaleTrackerService from "/services/whaleTrackerService";

class InstitutionalFlowDetector {
  /**
   * Détecter les signaux de vente institutionnelle pour un ticker
   * @param {string} symbol - Ticker symbol
   * @param {Object} options - Options de détection
   * @returns {Promise<Object>} Signaux détectés
   */
  async detectInstitutionalSelling(symbol, options = {}) {
    const {
      lookbackDays = 30,
      minVolumeThreshold = 1.5, // 1.5x volume moyen
      minPremiumThreshold = 1000000, // $1M minimum
    } = options;

    try {
      console.log(`[FlowDetector] Analyzing ${symbol} for institutional selling signals...`);

      // 1. Analyser les options flow (puts inhabituels, calls vendus)
      const optionsSignals = await this.analyzeOptionsFlow(symbol, {
        lookbackDays,
        minPremium: minPremiumThreshold,
      });

      // 2. Analyser les dark pool trades
      const darkPoolSignals = await this.analyzeDarkPoolActivity(symbol, {
        lookbackDays,
      });

      // 3. Analyser les volumes anormaux
      const volumeSignals = await this.analyzeVolumeAnomalies(symbol, {
        lookbackDays,
        threshold: minVolumeThreshold,
      });

      // 4. Analyser les patterns de prix/volume
      const priceVolumeSignals = await this.analyzePriceVolumePatterns(symbol, {
        lookbackDays,
      });

      // 5. Analyser les filings SEC récents (13F, 13D/G)
      const filingSignals = await this.analyzeRecentFilings(symbol, {
        lookbackDays: 90, // 3 mois pour les filings
      });

      // 6. Calculer le score composite de vente institutionnelle
      const sellingScore = this.calculateSellingScore({
        options: optionsSignals,
        darkPool: darkPoolSignals,
        volume: volumeSignals,
        priceVolume: priceVolumeSignals,
        filings: filingSignals,
      });

      // 7. Détecter le pattern de vente (VWAP, Block, Options)
      const sellingPattern = this.detectSellingPattern({
        options: optionsSignals,
        darkPool: darkPoolSignals,
        volume: volumeSignals,
      });

      return {
        symbol,
        timestamp: new Date().toISOString(),
        sellingScore,
        sellingPattern,
        confidence: this.calculateConfidence({
          options: optionsSignals,
          darkPool: darkPoolSignals,
          volume: volumeSignals,
        }),
        signals: {
          options: optionsSignals,
          darkPool: darkPoolSignals,
          volume: volumeSignals,
          priceVolume: priceVolumeSignals,
          filings: filingSignals,
        },
        recommendation: this.generateRecommendation(sellingScore, sellingPattern),
      };
    } catch (error) {
      console.error(`[FlowDetector] Error detecting selling for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Analyser le flow d'options pour détecter des signaux de vente
   */
  async analyzeOptionsFlow(symbol, options = {}) {
    try {
      const { lookbackDays = 30, minPremium = 1000000 } = options;

      // Récupérer les flow alerts récents
      const flowAlerts = await fmpUWClient.getUWFlowAlerts(symbol, {
        limit: 100,
        min_premium: minPremium,
      });

      const alertsArray = Array.isArray(flowAlerts) ? flowAlerts : (flowAlerts?.data || []);

      // Filtrer les alertes récentes
      const recentAlerts = alertsArray.filter(alert => {
        const alertDate = new Date(alert.created_at || alert.timestamp);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);
        return alertDate >= cutoffDate;
      });

      // Analyser les patterns
      const puts = recentAlerts.filter(a => a.type === "put");
      const calls = recentAlerts.filter(a => a.type === "call");

      const putPremium = puts.reduce((sum, a) => sum + (parseFloat(a.total_premium || a.premium || 0)), 0);
      const callPremium = calls.reduce((sum, a) => sum + (parseFloat(a.total_premium || a.premium || 0)), 0);
      const totalPremium = putPremium + callPremium;

      // Signaux de vente :
      // 1. Ratio puts/calls élevé
      // 2. Puts à strike proche du prix actuel (hedging)
      // 3. Calls vendus (covered calls = réduction d'exposition)

      const putCallRatio = callPremium > 0 ? putPremium / callPremium : putPremium > 0 ? 10 : 0;

      // Détecter les covered calls (calls vendus avec strike proche)
      const coveredCalls = calls.filter(call => {
        const strike = parseFloat(call.strike || 0);
        // À implémenter : récupérer le prix actuel et vérifier si strike est proche
        return true; // Placeholder
      });

      return {
        totalAlerts: recentAlerts.length,
        putCallRatio,
        putPremium,
        callPremium,
        coveredCallsCount: coveredCalls.length,
        sellingSignal: putCallRatio > 1.5 || coveredCalls.length > 5,
        strength: Math.min(1, putCallRatio / 3), // Normalisé sur 0-1
        details: {
          puts: puts.length,
          calls: calls.length,
          unusualActivity: recentAlerts.length > 20,
        },
      };
    } catch (error) {
      console.warn(`[FlowDetector] Options flow analysis failed for ${symbol}:`, error.message);
      return {
        totalAlerts: 0,
        putCallRatio: 0,
        sellingSignal: false,
        strength: 0,
      };
    }
  }

  /**
   * Analyser l'activité dark pool
   */
  async analyzeDarkPoolActivity(symbol, options = {}) {
    try {
      const { lookbackDays = 30 } = options;

      const darkPoolTrades = await fmpUWClient.getUWDarkPoolTrades(symbol, {
        limit: 100,
      });

      const tradesArray = Array.isArray(darkPoolTrades) ? darkPoolTrades : (darkPoolTrades?.data || []);

      // Filtrer les trades récents
      const recentTrades = tradesArray.filter(trade => {
        const tradeDate = new Date(trade.date || trade.timestamp);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);
        return tradeDate >= cutoffDate;
      });

      // Analyser les patterns
      // Dark pools = souvent des ventes institutionnelles discrètes
      const totalVolume = recentTrades.reduce((sum, t) => sum + (parseFloat(t.volume || t.size || 0)), 0);
      const avgSize = recentTrades.length > 0 ? totalVolume / recentTrades.length : 0;

      // Signaux :
      // 1. Volume dark pool élevé = possible vente institutionnelle
      // 2. Trades de grande taille = blocs institutionnels
      // 3. Fréquence élevée = vente progressive (VWAP-like)

      return {
        totalTrades: recentTrades.length,
        totalVolume,
        avgSize,
        sellingSignal: recentTrades.length > 10 || avgSize > 100000, // > 100k shares = institutionnel
        strength: Math.min(1, recentTrades.length / 20), // Normalisé
        pattern: avgSize > 500000 ? "BLOCK" : recentTrades.length > 15 ? "VWAP" : "NORMAL",
        details: {
          largeBlocks: recentTrades.filter(t => parseFloat(t.volume || t.size || 0) > 500000).length,
        },
      };
    } catch (error) {
      console.warn(`[FlowDetector] Dark pool analysis failed for ${symbol}:`, error.message);
      return {
        totalTrades: 0,
        sellingSignal: false,
        strength: 0,
        pattern: "NORMAL",
      };
    }
  }

  /**
   * Analyser les anomalies de volume
   */
  async analyzeVolumeAnomalies(symbol, options = {}) {
    try {
      const { lookbackDays = 30, threshold = 1.5 } = options;

      // Récupérer les données de volume via FMP (daily historical)
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - lookbackDays);
      const historicalData = await fmpUWClient.getFMPHistoricalData(
        symbol,
        "1day",
        fromDate.toISOString().split("T")[0],
        toDate.toISOString().split("T")[0]
      );
      
      if (!Array.isArray(historicalData) || historicalData.length === 0) {
        return {
          anomaly: false,
          strength: 0,
          details: {},
        };
      }

      // Calculer la moyenne de volume
      const volumes = historicalData.map(d => parseFloat(d.volume || 0));
      const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;

      // Volume récent
      const recentVolumes = volumes.slice(-5); // 5 derniers jours
      const recentAvgVolume = recentVolumes.reduce((sum, v) => sum + v, 0) / recentVolumes.length;

      // Détecter les anomalies
      const volumeRatio = avgVolume > 0 ? recentAvgVolume / avgVolume : 0;
      const isAnomaly = volumeRatio > threshold;

      // Pattern : volume élevé avec prix qui baisse = possible vente institutionnelle
      const recentPrices = historicalData.slice(-5).map(d => parseFloat(d.close || d.price || 0));
      const priceChange = recentPrices.length > 1 
        ? ((recentPrices[recentPrices.length - 1] - recentPrices[0]) / recentPrices[0]) * 100
        : 0;

      return {
        volumeRatio,
        isAnomaly,
        sellingSignal: isAnomaly && priceChange < -2, // Volume élevé + prix qui baisse
        strength: Math.min(1, (volumeRatio - 1) / 2), // Normalisé
        details: {
          avgVolume,
          recentAvgVolume,
          priceChange,
          pattern: volumeRatio > 2 && priceChange < -3 ? "INSTITUTIONAL_SELLING" : "NORMAL",
        },
      };
    } catch (error) {
      console.warn(`[FlowDetector] Volume analysis failed for ${symbol}:`, error.message);
      return {
        anomaly: false,
        sellingSignal: false,
        strength: 0,
      };
    }
  }

  /**
   * Analyser les patterns prix/volume
   */
  async analyzePriceVolumePatterns(symbol, options = {}) {
    try {
      const { lookbackDays = 30 } = options;

      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - lookbackDays);
      const historicalData = await fmpUWClient.getFMPHistoricalData(
        symbol,
        "1day",
        fromDate.toISOString().split("T")[0],
        toDate.toISOString().split("T")[0]
      );
      
      if (!Array.isArray(historicalData) || historicalData.length < 10) {
        return {
          pattern: "INSUFFICIENT_DATA",
          strength: 0,
        };
      }

      // Analyser les patterns
      const data = historicalData.map(d => ({
        date: d.date,
        price: parseFloat(d.close || d.price || 0),
        volume: parseFloat(d.volume || 0),
      }));

      // Pattern 1: Distribution (volume élevé, prix qui stagne/baisse)
      const recentData = data.slice(-10);
      const avgVolume = recentData.reduce((sum, d) => sum + d.volume, 0) / recentData.length;
      const priceTrend = recentData.length > 1
        ? ((recentData[recentData.length - 1].price - recentData[0].price) / recentData[0].price) * 100
        : 0;

      // Pattern 2: VWAP-like (volume régulier, légère baisse de prix)
      const volumeStdDev = this.calculateStdDev(recentData.map(d => d.volume));
      const volumeConsistency = avgVolume > 0 ? 1 - (volumeStdDev / avgVolume) : 0;

      let pattern = "NORMAL";
      let strength = 0;

      if (avgVolume > 0 && priceTrend < -2 && volumeConsistency > 0.7) {
        pattern = "VWAP_SELLING";
        strength = Math.min(1, Math.abs(priceTrend) / 10);
      } else if (avgVolume > 0 && priceTrend < -5) {
        pattern = "AGGRESSIVE_SELLING";
        strength = Math.min(1, Math.abs(priceTrend) / 15);
      }

      return {
        pattern,
        strength,
        details: {
          priceTrend,
          volumeConsistency,
          avgVolume,
        },
      };
    } catch (error) {
      console.warn(`[FlowDetector] Price/volume pattern analysis failed:`, error.message);
      return {
        pattern: "ERROR",
        strength: 0,
      };
    }
  }

  /**
   * Analyser les filings SEC récents
   */
  async analyzeRecentFilings(symbol, options = {}) {
    try {
      const { lookbackDays = 90 } = options;

      // Récupérer les filings 13F via FMP
      const filings = await fmpUWClient.getFMPSECFilings(symbol, null, 50);
      
      if (!Array.isArray(filings) || filings.length === 0) {
        return {
          recentFilings: 0,
          sellingSignal: false,
          details: {},
        };
      }

      // Filtrer les filings récents
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);

      const recentFilings = filings.filter(filing => {
        const filingDate = new Date(filing.filingDate || filing.date);
        return filingDate >= cutoffDate;
      });

      // Analyser les types de filings
      const form13F = recentFilings.filter(f => f.form === "13F-HR" || f.form === "13F");
      const form13D = recentFilings.filter(f => f.form === "13D" || f.form === "13D/A");
      const form13G = recentFilings.filter(f => f.form === "13G" || f.form === "13G/A");

      return {
        recentFilings: recentFilings.length,
        form13F: form13F.length,
        form13D: form13D.length,
        form13G: form13G.length,
        sellingSignal: false, // Les filings confirment mais ne prédisent pas
        details: {
          latestFiling: recentFilings.length > 0 ? recentFilings[0].filingDate : null,
        },
      };
    } catch (error) {
      console.warn(`[FlowDetector] Filings analysis failed:`, error.message);
      return {
        recentFilings: 0,
        sellingSignal: false,
      };
    }
  }

  /**
   * Calculer le score composite de vente institutionnelle
   */
  calculateSellingScore(signals) {
    const weights = {
      options: 0.30,
      darkPool: 0.25,
      volume: 0.25,
      priceVolume: 0.20,
    };

    let score = 0;
    let totalWeight = 0;

    if (signals.options?.sellingSignal) {
      score += signals.options.strength * weights.options;
      totalWeight += weights.options;
    }

    if (signals.darkPool?.sellingSignal) {
      score += signals.darkPool.strength * weights.darkPool;
      totalWeight += weights.darkPool;
    }

    if (signals.volume?.sellingSignal) {
      score += signals.volume.strength * weights.volume;
      totalWeight += weights.volume;
    }

    if (signals.priceVolume?.pattern !== "NORMAL") {
      score += signals.priceVolume.strength * weights.priceVolume;
      totalWeight += weights.priceVolume;
    }

    return totalWeight > 0 ? score / totalWeight : 0;
  }

  /**
   * Détecter le pattern de vente
   */
  detectSellingPattern(signals) {
    if (signals.darkPool?.pattern === "BLOCK") {
      return "BLOCK_TRADE";
    }
    if (signals.darkPool?.pattern === "VWAP" || signals.priceVolume?.pattern === "VWAP_SELLING") {
      return "VWAP";
    }
    if (signals.options?.coveredCallsCount > 5) {
      return "OPTIONS_HEDGE";
    }
    if (signals.volume?.details?.pattern === "INSTITUTIONAL_SELLING") {
      return "AGGRESSIVE";
    }
    return "NORMAL";
  }

  /**
   * Calculer la confiance dans la détection
   */
  calculateConfidence(signals) {
    let confidence = 0;
    let factors = 0;

    if (signals.options?.sellingSignal) {
      confidence += signals.options.strength * 0.3;
      factors += 0.3;
    }
    if (signals.darkPool?.sellingSignal) {
      confidence += signals.darkPool.strength * 0.3;
      factors += 0.3;
    }
    if (signals.volume?.sellingSignal) {
      confidence += signals.volume.strength * 0.4;
      factors += 0.4;
    }

    return factors > 0 ? Math.min(1, confidence / factors) : 0;
  }

  /**
   * Générer une recommandation
   */
  generateRecommendation(score, pattern) {
    if (score > 0.7) {
      return {
        action: "HIGH_ALERT",
        message: `Forte probabilité de vente institutionnelle détectée (pattern: ${pattern})`,
        urgency: "HIGH",
      };
    } else if (score > 0.4) {
      return {
        action: "MONITOR",
        message: `Signaux modérés de vente institutionnelle (pattern: ${pattern})`,
        urgency: "MEDIUM",
      };
    } else {
      return {
        action: "LOW",
        message: "Pas de signaux significatifs de vente institutionnelle",
        urgency: "LOW",
      };
    }
  }

  /**
   * Calculer l'écart-type
   */
  calculateStdDev(values) {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, d) => sum + d, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  /**
   * Scanner plusieurs tickers pour détecter les ventes institutionnelles
   */
  async scanMultipleTickers(tickers, options = {}) {
    const results = [];

    for (const ticker of tickers) {
      try {
        const detection = await this.detectInstitutionalSelling(ticker, options);
        results.push(detection);
        
        // Délai pour respecter les rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`[FlowDetector] Error scanning ${ticker}:`, error);
        results.push({
          symbol: ticker,
          error: error.message,
        });
      }
    }

    // Trier par score décroissant
    results.sort((a, b) => (b.sellingScore || 0) - (a.sellingScore || 0));

    return results;
  }
}

export const institutionalFlowDetector = new InstitutionalFlowDetector();
export default institutionalFlowDetector;

