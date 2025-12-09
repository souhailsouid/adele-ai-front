/**
 * Ticker Activity Service
 * 
 * Agrège toutes les activités institutionnelles, hedge funds, whales pour un ticker
 * Utilise SQLite pour le cache et éviter les chargements infinis
 */

import fmpUWClient from "/lib/api/fmpUnusualWhalesClient";
import whaleTrackerService from "/services/whaleTrackerService";
import {
  quoteCache,
  ownershipCache,
  activityCache,
  hedgeFundCache,
  insiderCache,
  congressCache,
  optionsCache,
  darkPoolCache,
} from "/lib/db/sqlite";

class TickerActivityService {
  /**
   * Récupérer une activité spécifique pour un ticker (chargement asynchrone par onglet)
   * @param {string} symbol - Ticker symbol
   * @param {string} activityType - Type d'activité (ownership, activity, hedgeFunds, insiders, congress, options, darkPool, quote)
   * @param {Object} options - Options
   * @returns {Promise<Object>} Données de l'activité
   */
  async getTickerActivityByType(symbol, activityType, options = {}) {
    const { limit = 100, forceRefresh = false } = options;

    try {
      console.log(`[TickerActivity] Fetching ${activityType} for ${symbol}...`);

      // Vérifier le cache d'abord (sauf si forceRefresh)
      if (!forceRefresh) {
        let cachedData = null;

        switch (activityType) {
          case "quote":
            cachedData = quoteCache.get(symbol);
            break;
          case "ownership":
            cachedData = ownershipCache.get(symbol);
            break;
          case "activity":
            cachedData = activityCache.get(symbol, limit);
            break;
          case "hedgeFunds":
            cachedData = hedgeFundCache.get(symbol);
            break;
          case "insiders":
            cachedData = insiderCache.get(symbol, limit);
            break;
          case "congress":
            cachedData = congressCache.get(symbol, limit);
            break;
          case "options":
            cachedData = optionsCache.get(symbol, limit);
            break;
          case "darkPool":
            cachedData = darkPoolCache.get(symbol, limit);
            break;
        }

        if (cachedData) {
          console.log(`[TickerActivity] Using cached data for ${symbol} - ${activityType}`);
          return {
            type: activityType,
            data: cachedData,
            cached: true,
            timestamp: new Date().toISOString(),
          };
        }
      }

      // Si pas de cache, récupérer depuis l'API
      let data = [];
      switch (activityType) {
        case "quote":
          const quote = await fmpUWClient.getFMPQuote(symbol).catch(() => null);
          if (quote) {
            quoteCache.set(symbol, quote);
            data = quote;
          }
          break;

        case "ownership":
          data = await this.getInstitutionalOwnership(symbol, { limit });
          if (data && data.length > 0) {
            ownershipCache.set(symbol, data);
          }
          break;

        case "activity":
          // OPTIMISATION: Limiter à 20 institutions max pour éviter les boucles infinies
          data = await this.getInstitutionalActivity(symbol, { limit: 20 });
          if (data && data.length > 0) {
            activityCache.set(symbol, data);
          }
          break;

        case "hedgeFunds":
          data = await this.getHedgeFundHoldings(symbol, { limit });
          if (data && data.length > 0) {
            hedgeFundCache.set(symbol, data);
          }
          break;

        case "insiders":
          data = await this.getInsiderTransactions(symbol, { limit });
          if (data && data.length > 0) {
            insiderCache.set(symbol, data);
          }
          break;

        case "congress":
          data = await this.getCongressTrades(symbol, { limit });
          if (data && data.length > 0) {
            congressCache.set(symbol, data);
          }
          break;

        case "options":
          data = await this.getOptionsFlow(symbol, { limit });
          if (data && data.length > 0) {
            optionsCache.set(symbol, data);
          }
          break;

        case "darkPool":
          data = await this.getDarkPoolTrades(symbol, { limit });
          if (data && data.length > 0) {
            darkPoolCache.set(symbol, data);
          }
          break;

        default:
          data = [];
      }

      return {
        type: activityType,
        data: Array.isArray(data) ? data : (data ? [data] : []),
        cached: false,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`[TickerActivity] Error fetching ${activityType} for ${symbol}:`, error);
      return {
        type: activityType,
        data: [],
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Récupérer toutes les activités pour un ticker (méthode complète - gardée pour compatibilité)
   * @param {string} symbol - Ticker symbol
   * @param {Object} options - Options
   * @returns {Promise<Object>} Toutes les activités agrégées
   */
  async getTickerActivity(symbol, options = {}) {
    const {
      includeInstitutions = true,
      includeHedgeFunds = true,
      includeInsiders = true,
      includeCongress = true,
      includeOptions = true,
      includeDarkPool = true,
      limit = 100,
    } = options;

    try {
      console.log(`[TickerActivity] Fetching all activities for ${symbol}...`);

      const results = await Promise.allSettled([
        // 1. Ownership institutionnelle (qui détient ce ticker)
        includeInstitutions
          ? this.getInstitutionalOwnership(symbol, { limit })
          : Promise.resolve([]),
        
        // 2. Activité institutionnelle (transactions récentes) - LIMITÉ pour éviter les boucles
        includeInstitutions
          ? this.getInstitutionalActivity(symbol, { limit: 20 })
          : Promise.resolve([]),
        
        // 3. Holdings des hedge funds
        includeHedgeFunds
          ? this.getHedgeFundHoldings(symbol, { limit })
          : Promise.resolve([]),
        
        // 4. Transactions des insiders
        includeInsiders
          ? this.getInsiderTransactions(symbol, { limit })
          : Promise.resolve([]),
        
        // 5. Transactions du Congrès
        includeCongress
          ? this.getCongressTrades(symbol, { limit })
          : Promise.resolve([]),
        
        // 6. Options flow
        includeOptions
          ? this.getOptionsFlow(symbol, { limit })
          : Promise.resolve([]),
        
        // 7. Dark pool trades
        includeDarkPool
          ? this.getDarkPoolTrades(symbol, { limit })
          : Promise.resolve([]),
        
        // 8. Quote actuelle
        fmpUWClient.getFMPQuote(symbol).catch(() => null),
      ]);

      // Extraire les résultats
      const [
        ownershipResult,
        activityResult,
        hedgeFundsResult,
        insidersResult,
        congressResult,
        optionsResult,
        darkPoolResult,
        quoteResult,
      ] = results;

      const ownership = ownershipResult.status === "fulfilled" 
        ? (Array.isArray(ownershipResult.value) ? ownershipResult.value : [])
        : [];
      
      const activity = activityResult.status === "fulfilled"
        ? (Array.isArray(activityResult.value) ? activityResult.value : [])
        : [];
      
      const hedgeFunds = hedgeFundsResult.status === "fulfilled"
        ? (Array.isArray(hedgeFundsResult.value) ? hedgeFundsResult.value : [])
        : [];
      
      const insiders = insidersResult.status === "fulfilled"
        ? (Array.isArray(insidersResult.value) ? insidersResult.value : (insidersResult.value?.data || []))
        : [];
      
      const congress = congressResult.status === "fulfilled"
        ? (Array.isArray(congressResult.value) ? congressResult.value : [])
        : [];
      
      const options = optionsResult.status === "fulfilled"
        ? (Array.isArray(optionsResult.value) ? optionsResult.value : [])
        : [];
      
      const darkPool = darkPoolResult.status === "fulfilled"
        ? (Array.isArray(darkPoolResult.value) ? darkPoolResult.value : [])
        : [];
      
      const quote = quoteResult.status === "fulfilled" ? quoteResult.value : null;

      // Sauvegarder dans le cache
      if (quote) quoteCache.set(symbol, quote);
      if (ownership.length > 0) ownershipCache.set(symbol, ownership);
      if (activity.length > 0) activityCache.set(symbol, activity);
      if (hedgeFunds.length > 0) hedgeFundCache.set(symbol, hedgeFunds);
      if (insiders.length > 0) insiderCache.set(symbol, insiders);
      if (congress.length > 0) congressCache.set(symbol, congress);
      if (options.length > 0) optionsCache.set(symbol, options);
      if (darkPool.length > 0) darkPoolCache.set(symbol, darkPool);

      // Calculer les statistiques agrégées
      const stats = this.calculateAggregatedStats({
        ownership,
        activity,
        hedgeFunds,
        insiders,
        congress,
        options,
        darkPool,
        quote,
      });

      return {
        symbol,
        timestamp: new Date().toISOString(),
        quote,
        stats,
        data: {
          ownership, // Qui détient
          activity, // Transactions récentes
          hedgeFunds, // Holdings hedge funds
          insiders, // Transactions insiders
          congress, // Transactions Congrès
          options, // Options flow
          darkPool, // Dark pool trades
        },
      };
    } catch (error) {
      console.error(`[TickerActivity] Error fetching all activities for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Récupérer l'ownership institutionnel pour un ticker
   */
  async getInstitutionalOwnership(symbol, options = {}) {
    try {
      const ownership = await fmpUWClient.getUWInstitutionOwnership(symbol, {
        limit: options.limit || 100,
      });

      return Array.isArray(ownership) ? ownership : (ownership?.data || []);
    } catch (error) {
      console.warn(`[TickerActivity] Error fetching ownership for ${symbol}:`, error.message);
      return [];
    }
  }

  /**
   * Récupérer l'activité institutionnelle pour un ticker
   * OPTIMISÉ: Limite à 10 institutions max pour éviter les boucles infinies
   */
  async getInstitutionalActivity(symbol, options = {}) {
    try {
      // OPTIMISATION: Récupérer d'abord l'ownership (limité)
      const ownership = await this.getInstitutionalOwnership(symbol, { limit: 10 });
      
      if (ownership.length === 0) {
        return [];
      }

      // Pour chaque institution, récupérer les transactions (LIMITÉ à 10)
      const allTransactions = [];
      const maxInstitutions = Math.min(10, ownership.length); // MAX 10 institutions
      
      for (let i = 0; i < maxInstitutions; i++) {
        const inst = ownership[i];
        try {
          const instName = inst.name || inst.institution_name;
          if (!instName) continue;

          const transactions = await fmpUWClient.getUWInstitutionActivity(symbol, instName, {
            limit: 20,
          });
          
          const instTransactions = Array.isArray(transactions) ? transactions : (transactions?.data || []);
          
          // Filtrer par ticker
          const tickerTransactions = instTransactions.filter(t => 
            (t.ticker || t.symbol || "").toUpperCase() === symbol.toUpperCase()
          );
          
          allTransactions.push(...tickerTransactions.map(t => ({
            ...t,
            institution_name: instName,
          })));
          
          // Délai pour respecter les rate limits (1 seconde entre chaque appel)
          if (i < maxInstitutions - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (err) {
          console.warn(`[TickerActivity] Error fetching transactions for ${inst.name}:`, err.message);
          // Continuer avec la prochaine institution même en cas d'erreur
        }
      }

      // Limiter le nombre total de transactions retournées
      return allTransactions.slice(0, options.limit || 100);
    } catch (error) {
      console.warn(`[TickerActivity] Error fetching institutional activity:`, error.message);
      return [];
    }
  }

  /**
   * Récupérer les holdings des hedge funds pour un ticker
   */
  async getHedgeFundHoldings(symbol, options = {}) {
    try {
      // Utiliser les données de ownership et filtrer les hedge funds
      const ownership = await this.getInstitutionalOwnership(symbol, { limit: options.limit || 100 });
      
      // Filtrer les hedge funds (basé sur is_hedge_fund ou nom)
      const hedgeFunds = ownership.filter(inst => 
        inst.is_hedge_fund === true || 
        (inst.name && this.isHedgeFundName(inst.name))
      );

      return hedgeFunds;
    } catch (error) {
      console.warn(`[TickerActivity] Error fetching hedge fund holdings:`, error.message);
      return [];
    }
  }

  /**
   * Vérifier si un nom d'institution est un hedge fund
   */
  isHedgeFundName(name) {
    const hedgeFundKeywords = [
      "hedge fund",
      "capital",
      "partners",
      "management",
      "advisors",
      "investment",
      "fund",
      "llc",
      "lp",
      "llp",
    ];
    
    const lowerName = name.toLowerCase();
    return hedgeFundKeywords.some(keyword => lowerName.includes(keyword));
  }

  /**
   * Récupérer les transactions des insiders pour un ticker
   */
  async getInsiderTransactions(symbol, options = {}) {
    try {
      const insiders = await fmpUWClient.getUWInsiderTransactions(symbol, {
        limit: options.limit || 100,
      });

      return Array.isArray(insiders) ? insiders : (insiders?.data || []);
    } catch (error) {
      console.warn(`[TickerActivity] Error fetching insider transactions:`, error.message);
      return [];
    }
  }

  /**
   * Récupérer les transactions du Congrès pour un ticker
   */
  async getCongressTrades(symbol, options = {}) {
    try {
      const congress = await fmpUWClient.getUWCongressRecentTrades(symbol, {
        limit: options.limit || 100,
      });

      return Array.isArray(congress) ? congress : (congress?.data || []);
    } catch (error) {
      console.warn(`[TickerActivity] Error fetching congress trades:`, error.message);
      return [];
    }
  }

  /**
   * Récupérer le flow d'options pour un ticker
   */
  async getOptionsFlow(symbol, options = {}) {
    try {
      const flow = await fmpUWClient.getUWFlowAlerts(symbol, {
        limit: options.limit || 100,
        min_premium: 10000,
      });

      return Array.isArray(flow) ? flow : (flow?.data || []);
    } catch (error) {
      console.warn(`[TickerActivity] Error fetching options flow:`, error.message);
      return [];
    }
  }

  /**
   * Récupérer les dark pool trades pour un ticker
   */
  async getDarkPoolTrades(symbol, options = {}) {
    try {
      const darkPool = await fmpUWClient.getUWDarkPoolTrades(symbol, {
        limit: options.limit || 100,
      });

      return Array.isArray(darkPool) ? darkPool : (darkPool?.data || []);
    } catch (error) {
      console.warn(`[TickerActivity] Error fetching dark pool trades:`, error.message);
      return [];
    }
  }

  /**
   * Calculer les statistiques agrégées
   */
  calculateAggregatedStats({ ownership, activity, hedgeFunds, insiders, congress, options, darkPool, quote }) {
    const currentPrice = parseFloat(quote?.price || quote?.close || 0);
    
    const totalInstitutionalShares = ownership.reduce((sum, inst) => {
      return sum + (parseFloat(inst.shares || inst.units || 0));
    }, 0);

    const recentBuys = activity.filter(t => {
      const change = parseFloat(t.units_change || t.change || 0);
      return change > 0;
    }).length;

    const recentSells = activity.filter(t => {
      const change = parseFloat(t.units_change || t.change || 0);
      return change < 0;
    }).length;

    const callPremium = options
      .filter(o => o.type === "call")
      .reduce((sum, o) => sum + (parseFloat(o.total_premium || o.premium || 0)), 0);
    
    const putPremium = options
      .filter(o => o.type === "put")
      .reduce((sum, o) => sum + (parseFloat(o.total_premium || o.premium || 0)), 0);

    const darkPoolVolume = darkPool.reduce((sum, t) => {
      return sum + (parseFloat(t.volume || t.size || 0));
    }, 0);

    return {
      totalInstitutions: ownership.length,
      totalHedgeFunds: hedgeFunds.length,
      totalInstitutionalShares,
      totalInstitutionalValue: totalInstitutionalShares * currentPrice,
      recentBuys,
      recentSells,
      netActivity: recentBuys - recentSells,
      insiderTrades: insiders.length,
      congressTrades: congress.length,
      optionsFlow: {
        totalAlerts: options.length,
        callPremium,
        putPremium,
        putCallRatio: callPremium > 0 ? putPremium / callPremium : 0,
      },
      darkPool: {
        totalTrades: darkPool.length,
        totalVolume: darkPoolVolume,
      },
    };
  }
}

export const tickerActivityService = new TickerActivityService();
export default tickerActivityService;
