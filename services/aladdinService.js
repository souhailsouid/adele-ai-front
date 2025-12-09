/**
 * Service Aladdin - Moteur d'analyse et de décision
 * 
 * Ce service agrège les données de Unusual Whales + FMP
 * et génère des signaux, scores et recommandations
 */

import fmpUWClient from "/lib/api/fmpUnusualWhalesClient";
import whaleTrackerService from "/services/whaleTrackerService";

class AladdinService {
  /**
   * Calculer les features pour un ticker
   * @param {string} symbol - Ticker symbol
   * @returns {Promise<Object>} Features calculées
   */
  async calculateTickerFeatures(symbol) {
    try {
      console.log(`[Aladdin] Calculating features for ${symbol}...`);
      
      // Récupérer les données en parallèle avec meilleure gestion d'erreurs
      const [
        flowAlertsResult,
        darkpoolTradesResult,
        insiderTradesResult,
        congressTradesResult,
        institutionalActivityResult,
        quoteResult,
        keyMetricsResult,
      ] = await Promise.allSettled([
        fmpUWClient.getUWFlowAlerts(symbol, { limit: 20 }),
        fmpUWClient.getUWDarkPoolTrades(symbol, { limit: 10 }),
        fmpUWClient.getUWInsiderTransactions(symbol, { limit: 10 }),
        fmpUWClient.getUWCongressRecentTrades(symbol, { limit: 10 }),
        fmpUWClient.getUWInstitutionOwnership(symbol, { limit: 10 }),
        fmpUWClient.getFMPQuote(symbol),
        fmpUWClient.getFMPKeyMetrics(symbol, "annual", 1),
      ]);

      // Extraire les données avec gestion d'erreurs
      const flowAlerts = flowAlertsResult.status === "fulfilled" 
        ? (Array.isArray(flowAlertsResult.value) ? flowAlertsResult.value : (flowAlertsResult.value?.data || []))
        : [];
      const darkpoolTrades = darkpoolTradesResult.status === "fulfilled"
        ? (Array.isArray(darkpoolTradesResult.value) ? darkpoolTradesResult.value : (darkpoolTradesResult.value?.data || []))
        : [];
      const insiderTrades = insiderTradesResult.status === "fulfilled"
        ? (Array.isArray(insiderTradesResult.value) ? insiderTradesResult.value : (insiderTradesResult.value?.data || []))
        : [];
      const congressTrades = congressTradesResult.status === "fulfilled"
        ? (Array.isArray(congressTradesResult.value) ? congressTradesResult.value : (congressTradesResult.value?.data || []))
        : [];
      const institutionalActivity = institutionalActivityResult.status === "fulfilled"
        ? (Array.isArray(institutionalActivityResult.value) ? institutionalActivityResult.value : (institutionalActivityResult.value?.data || []))
        : [];
      const quote = quoteResult.status === "fulfilled" ? quoteResult.value : null;
      const keyMetrics = keyMetricsResult.status === "fulfilled"
        ? (Array.isArray(keyMetricsResult.value) ? keyMetricsResult.value : [])
        : [];

      // Log pour déboguer
      console.log(`[Aladdin] ${symbol} - Data fetched:`, {
        flowAlerts: flowAlerts.length,
        darkpool: darkpoolTrades.length,
        insiders: insiderTrades.length,
        congress: congressTrades.length,
        institutions: institutionalActivity.length,
        quote: quote ? "OK" : "NULL",
        keyMetrics: keyMetrics.length,
      });
      
      // Log des erreurs si présentes
      if (flowAlertsResult.status === "rejected") {
        console.warn(`[Aladdin] ${symbol} - Flow alerts error:`, flowAlertsResult.reason?.message);
      }
      if (quoteResult.status === "rejected") {
        console.warn(`[Aladdin] ${symbol} - Quote error:`, quoteResult.reason?.message);
      }
      
      // Si aucune donnée avec filtre ticker, essayer sans filtre puis filtrer manuellement
      let flowAlertsFallback = flowAlerts;
      if (flowAlerts.length === 0) {
        try {
          console.log(`[Aladdin] ${symbol} - Trying fallback: fetching all flow alerts...`);
          const allAlerts = await fmpUWClient.getUWFlowAlerts(null, { limit: 100, min_premium: 100000 });
          const allAlertsArray = Array.isArray(allAlerts) ? allAlerts : (allAlerts?.data || []);
          console.log(`[Aladdin] ${symbol} - Total alerts fetched: ${allAlertsArray.length}`);
          
          // Filtrer par ticker
          flowAlertsFallback = allAlertsArray.filter(a => {
            const alertTicker = (a.ticker || a.symbol || "").toUpperCase();
            return alertTicker === symbol.toUpperCase();
          });
          console.log(`[Aladdin] ${symbol} - Flow Alerts (fallback filtered): ${flowAlertsFallback.length}`);
        } catch (e) {
          console.warn(`[Aladdin] Fallback flow alerts failed for ${symbol}:`, e.message);
        }
      }

      // Même logique pour les autres données
      let insiderTradesFallback = insiderTrades;
      if (insiderTrades.length === 0) {
        try {
          const allInsiders = await fmpUWClient.getUWInsiderTransactions(null, { limit: 100 });
          const allInsidersArray = Array.isArray(allInsiders) ? allInsiders : (allInsiders?.data || []);
          insiderTradesFallback = allInsidersArray.filter(t => 
            (t.ticker || t.symbol || "").toUpperCase() === symbol.toUpperCase()
          );
          console.log(`[Aladdin] ${symbol} - Insider Trades (fallback): ${insiderTradesFallback.length}`);
        } catch (e) {
          console.warn(`[Aladdin] Fallback insider trades failed:`, e.message);
        }
      }

      let congressTradesFallback = congressTrades;
      if (congressTrades.length === 0) {
        try {
          const allCongress = await fmpUWClient.getUWCongressRecentTrades(null, { limit: 100 });
          const allCongressArray = Array.isArray(allCongress) ? allCongress : (allCongress?.data || []);
          congressTradesFallback = allCongressArray.filter(t => 
            (t.ticker || t.symbol || "").toUpperCase() === symbol.toUpperCase()
          );
          console.log(`[Aladdin] ${symbol} - Congress Trades (fallback): ${congressTradesFallback.length}`);
        } catch (e) {
          console.warn(`[Aladdin] Fallback congress trades failed:`, e.message);
        }
      }

      // Utiliser les données fallback si disponibles
      const finalFlowAlerts = flowAlertsFallback.length > 0 ? flowAlertsFallback : flowAlerts;
      const finalInsiderTrades = insiderTradesFallback.length > 0 ? insiderTradesFallback : insiderTrades;
      const finalCongressTrades = congressTradesFallback.length > 0 ? congressTradesFallback : congressTrades;
      
      // Calculer les scores
      const features = {
        symbol,
        timestamp: new Date().toISOString(),
        
        // Options Flow Scores
        options_bullish_score: this.calculateOptionsBullishScore(finalFlowAlerts),
        options_bearish_score: this.calculateOptionsBearishScore(finalFlowAlerts),
        options_unusual_score: this.calculateUnusualScore(finalFlowAlerts),
        flow_skew: this.calculateFlowSkew(finalFlowAlerts),
        
        // Dark Pool Score
        darkpool_score: this.calculateDarkpoolScore(darkpoolTrades),
        
        // Insider Score
        insider_score: this.calculateInsiderScore(finalInsiderTrades),
        
        // Congress Score
        congress_buy_score: this.calculateCongressBuyScore(finalCongressTrades),
        congress_sell_score: this.calculateCongressSellScore(finalCongressTrades),
        
        // Smart Money Score (Institutions)
        smart_money_score: this.calculateSmartMoneyScore(institutionalActivity),
        institutional_ownership_change: this.calculateInstitutionalChange(institutionalActivity),
        
        // Valuation Score
        valuation_score: this.calculateValuationScore(keyMetrics, quote),
        
        // Momentum Score
        momentum_score: this.calculateMomentumScore(quote),
        
        // Raw data counts
        flow_alerts_count: finalFlowAlerts.length,
        darkpool_trades_count: darkpoolTrades.length,
        insider_trades_count: finalInsiderTrades.length,
        congress_trades_count: finalCongressTrades.length,
      };

      console.log(`[Aladdin] ${symbol} - Features calculated:`, {
        flow_alerts: finalFlowAlerts.length,
        insider_trades: finalInsiderTrades.length,
        congress_trades: finalCongressTrades.length,
        options_bullish: features.options_bullish_score,
        smart_money: features.smart_money_score,
        momentum: features.momentum_score,
      });

      return features;
    } catch (error) {
      console.error(`Error calculating features for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Calculer le score bullish des options
   */
  calculateOptionsBullishScore(flowAlerts) {
    if (!Array.isArray(flowAlerts) || flowAlerts.length === 0) return 0;

    const calls = flowAlerts.filter(a => a.type === "call");
    const totalPremium = flowAlerts.reduce((sum, a) => {
      return sum + (parseFloat(a.total_premium || a.premium || 0));
    }, 0);
    const callPremium = calls.reduce((sum, a) => {
      return sum + (parseFloat(a.total_premium || a.premium || 0));
    }, 0);

    if (totalPremium === 0) return 0;
    return Math.min(1, callPremium / totalPremium);
  }

  /**
   * Calculer le score bearish des options
   */
  calculateOptionsBearishScore(flowAlerts) {
    if (!Array.isArray(flowAlerts) || flowAlerts.length === 0) return 0;

    const puts = flowAlerts.filter(a => a.type === "put");
    const totalPremium = flowAlerts.reduce((sum, a) => {
      return sum + (parseFloat(a.total_premium || a.premium || 0));
    }, 0);
    const putPremium = puts.reduce((sum, a) => {
      return sum + (parseFloat(a.total_premium || a.premium || 0));
    }, 0);

    if (totalPremium === 0) return 0;
    return Math.min(1, putPremium / totalPremium);
  }

  /**
   * Calculer le score d'activité inhabituelle
   */
  calculateUnusualScore(flowAlerts) {
    if (!Array.isArray(flowAlerts) || flowAlerts.length === 0) return 0;
    
    // Plus il y a d'alertes, plus c'est inhabituel
    // Normalisé sur une échelle 0-1 (20+ alertes = 1.0)
    return Math.min(1, flowAlerts.length / 20);
  }

  /**
   * Calculer le skew du flow (call vs put)
   */
  calculateFlowSkew(flowAlerts) {
    if (!Array.isArray(flowAlerts) || flowAlerts.length === 0) return 0;

    const calls = flowAlerts.filter(a => a.type === "call").length;
    const puts = flowAlerts.filter(a => a.type === "put").length;
    const total = calls + puts;

    if (total === 0) return 0;
    // -1 (tout puts) à +1 (tout calls)
    return (calls - puts) / total;
  }

  /**
   * Calculer le score dark pool
   */
  calculateDarkpoolScore(darkpoolTrades) {
    if (!Array.isArray(darkpoolTrades) || darkpoolTrades.length === 0) return 0;
    
    // Plus il y a de trades dark pool, plus c'est significatif
    return Math.min(1, darkpoolTrades.length / 10);
  }

  /**
   * Calculer le score insider
   */
  calculateInsiderScore(insiderTrades) {
    if (!Array.isArray(insiderTrades) || insiderTrades.length === 0) return 0;

    // Compter les achats vs ventes
    const buys = insiderTrades.filter(t => {
      const code = t.transaction_code || t.acquisitionOrDisposition;
      return code === "A" || code === "P" || code === "Award";
    }).length;

    const sells = insiderTrades.filter(t => {
      const code = t.transaction_code || t.acquisitionOrDisposition;
      return code === "D" || code === "F" || code === "S";
    }).length;

    const total = buys + sells;
    if (total === 0) return 0;
    
    // Score positif si plus d'achats, négatif si plus de ventes
    return (buys - sells) / total;
  }

  /**
   * Calculer le score d'achat du Congrès
   */
  calculateCongressBuyScore(congressTrades) {
    if (!Array.isArray(congressTrades) || congressTrades.length === 0) return 0;

    const buys = congressTrades.filter(t => 
      t.txn_type === "Buy" || t.transaction_type === "Purchase"
    ).length;

    return Math.min(1, buys / 5); // Normalisé sur 5 trades
  }

  /**
   * Calculer le score de vente du Congrès
   */
  calculateCongressSellScore(congressTrades) {
    if (!Array.isArray(congressTrades) || congressTrades.length === 0) return 0;

    const sells = congressTrades.filter(t => 
      t.txn_type === "Sell" || t.transaction_type === "Sale"
    ).length;

    return Math.min(1, sells / 5);
  }

  /**
   * Calculer le score Smart Money (institutions)
   */
  calculateSmartMoneyScore(institutionalActivity) {
    if (!Array.isArray(institutionalActivity) || institutionalActivity.length === 0) return 0;

    // Plus il y a d'activité institutionnelle, plus c'est significatif
    return Math.min(1, institutionalActivity.length / 20);
  }

  /**
   * Calculer le changement de propriété institutionnelle
   */
  calculateInstitutionalChange(institutionalActivity) {
    if (!Array.isArray(institutionalActivity) || institutionalActivity.length === 0) return 0;

    // Simplifié : on compte le nombre de nouvelles positions
    // Dans une vraie implémentation, on comparerait avec l'historique
    return institutionalActivity.length;
  }

  /**
   * Calculer le score de valorisation
   */
  calculateValuationScore(keyMetrics, quote) {
    if (!keyMetrics || keyMetrics.length === 0 || !quote) return 0;

    const metrics = keyMetrics[0];
    const peRatio = parseFloat(metrics.peRatio) || 0;
    const priceToBook = parseFloat(metrics.priceToBookRatio) || 0;

    // Score basé sur P/E et P/B
    // Plus les ratios sont bas, plus c'est attractif (score positif)
    let score = 0;
    
    if (peRatio > 0 && peRatio < 15) score += 0.3;
    else if (peRatio > 15 && peRatio < 25) score += 0.1;
    else if (peRatio > 25) score -= 0.2;

    if (priceToBook > 0 && priceToBook < 2) score += 0.2;
    else if (priceToBook > 2 && priceToBook < 5) score += 0.1;
    else if (priceToBook > 5) score -= 0.1;

    return Math.max(-1, Math.min(1, score));
  }

  /**
   * Calculer le score de momentum
   */
  calculateMomentumScore(quote) {
    if (!quote) return 0;

    // Essayer différents champs pour la variation
    const changePercent = parseFloat(
      quote.changesPercentage || 
      quote.changePercent || 
      quote.change || 
      quote.percentChange ||
      0
    );
    
    // Si pas de changePercent, calculer depuis price et previousClose
    if (changePercent === 0 && quote.price && quote.previousClose) {
      const price = parseFloat(quote.price);
      const prevClose = parseFloat(quote.previousClose);
      if (prevClose > 0) {
        const calcChange = ((price - prevClose) / prevClose) * 100;
        return Math.max(-1, Math.min(1, calcChange / 10));
      }
    }
    
    // Score basé sur la variation de prix
    // Normalisé sur -1 à +1 (10% = 1.0)
    return Math.max(-1, Math.min(1, changePercent / 10));
  }

  /**
   * Calculer le composite score (score global)
   */
  calculateCompositeScore(features) {
    // Pondération des différents scores
    const weights = {
      options_bullish_score: 0.25,
      options_unusual_score: 0.20,
      smart_money_score: 0.20,
      insider_score: 0.15,
      congress_buy_score: 0.10,
      momentum_score: 0.10,
    };

    let composite = 0;
    let totalWeight = 0;

    Object.keys(weights).forEach(key => {
      if (features[key] !== undefined) {
        composite += features[key] * weights[key];
        totalWeight += weights[key];
      }
    });

    return totalWeight > 0 ? composite / totalWeight : 0;
  }

  /**
   * Générer une recommandation basée sur les features
   */
  generateRecommendation(features) {
    const composite = this.calculateCompositeScore(features);
    
    let decision = "SURVEILLER";
    let reasoning = [];
    const actions = [];

    // Logique de décision
    if (composite > 0.7) {
      decision = "RENFORCER";
      reasoning.push("Signaux très positifs : options flow bullish, smart money accumulation");
      actions.push("Considérer un ajout de position");
      actions.push("Surveiller les niveaux de résistance");
    } else if (composite > 0.4) {
      decision = "SURVEILLER";
      reasoning.push("Signaux modérément positifs");
      actions.push("Maintenir la position");
      actions.push("Définir des alertes sur les niveaux clés");
    } else if (composite > 0) {
      decision = "SURVEILLER";
      reasoning.push("Signaux neutres à légèrement positifs");
      actions.push("Maintenir la vigilance");
    } else if (composite > -0.4) {
      decision = "SURVEILLER";
      reasoning.push("Signaux neutres à légèrement négatifs");
      actions.push("Surveiller les niveaux de support");
    } else {
      decision = "ALLÉGER";
      reasoning.push("Signaux négatifs : considérer une réduction de position");
      actions.push("Définir un stop-loss");
      actions.push("Considérer une réduction progressive");
    }

    // Ajouter des détails spécifiques
    if (features.options_unusual_score > 0.8) {
      reasoning.push("Activité options très inhabituelle détectée");
    }
    if (features.smart_money_score > 0.6) {
      reasoning.push("Accumulation par les institutions");
    }
    if (features.insider_score > 0.5) {
      reasoning.push("Achats significatifs par les insiders");
    }
    if (features.congress_buy_score > 0.3) {
      reasoning.push("Activité d'achat du Congrès");
    }

    return {
      decision,
      composite_score: composite,
      reasoning,
      actions,
      risk_level: composite < -0.3 ? "HIGH" : composite < 0 ? "MEDIUM" : "LOW",
    };
  }

  /**
   * Obtenir les signaux pour un portefeuille
   */
  async getPortfolioSignals(tickers) {
    const signals = [];

    for (const ticker of tickers) {
      try {
        const features = await this.calculateTickerFeatures(ticker);
        const recommendation = this.generateRecommendation(features);

        signals.push({
          ticker,
          features,
          recommendation,
        });

        // Délai pour respecter les rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing ${ticker}:`, error);
        signals.push({
          ticker,
          error: error.message,
        });
      }
    }

    return signals;
  }

  /**
   * Analyse complète d'un ticker
   */
  async getTickerAnalysis(symbol) {
    const features = await this.calculateTickerFeatures(symbol);
    const recommendation = this.generateRecommendation(features);

    return {
      symbol,
      features,
      recommendation,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Scanner les opportunités selon différentes stratégies
   */
  async scanOpportunities({ strategy = "all", limit = 20, sector, minMarketCap }) {
    // Pour l'instant, on utilise les top tickers par flow alerts
    // Dans une vraie implémentation, on scannerait un univers plus large
    
    try {
      const flowAlerts = await fmpUWClient.getUWFlowAlerts(null, {
        limit: 100,
        min_premium: 500000, // Minimum 500k$ pour filtrer
      });

      const tickers = [...new Set(flowAlerts.map(a => a.ticker).filter(Boolean))];
      const opportunities = [];

      for (const ticker of tickers.slice(0, limit)) {
        try {
          const analysis = await this.getTickerAnalysis(ticker);
          
          // Filtrer selon la stratégie
          if (strategy === "squeeze" && analysis.features.options_unusual_score > 0.7) {
            opportunities.push(analysis);
          } else if (strategy === "smart_money" && analysis.features.smart_money_score > 0.5) {
            opportunities.push(analysis);
          } else if (strategy === "congress" && analysis.features.congress_buy_score > 0.3) {
            opportunities.push(analysis);
          } else if (strategy === "all") {
            opportunities.push(analysis);
          }

          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error analyzing ${ticker}:`, error);
        }
      }

      // Trier par composite score
      opportunities.sort((a, b) => 
        b.recommendation.composite_score - a.recommendation.composite_score
      );

      return opportunities.slice(0, limit);
    } catch (error) {
      console.error("Error scanning opportunities:", error);
      throw error;
    }
  }
}

export const aladdinService = new AladdinService();
export default aladdinService;

