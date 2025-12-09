/**
 * Service pour la logique métier du Whale Tracker
 * Centralise tous les appels API et la logique de chargement des données
 */

import fmpUWClient from "/lib/api/fmpUnusualWhalesClient";
import filings13FClient from "/lib/13f-filings/client";
import HEDGE_FUNDS from "/config/hedgeFunds";

class WhaleTrackerService {
  // Flow Alerts
  async loadFlowAlerts(options = {}) {
    try {
      const data = await fmpUWClient.getUWFlowAlerts(null, {
        limit: options.limit || 50,
        min_premium: options.min_premium || 100000,
      });
      return Array.isArray(data) ? data : (data?.data || []);
    } catch (err) {
      console.error("Error loading flow alerts:", err);
      return [];
    }
  }

  // Dark Pool Trades
  async loadDarkpoolTrades(options = {}) {
    try {
      const data = await fmpUWClient.getUWDarkPoolTrades(null, {
        limit: options.limit || 50,
        min_premium: options.min_premium || 500000,
      });
      return Array.isArray(data) ? data : (data?.data || []);
    } catch (err) {
      console.error("Error loading darkpool trades:", err);
      return [];
    }
  }

  // Insider Trades (Unusual Whales)
  async loadInsiderTrades(options = {}) {
    try {
      const data = await fmpUWClient.getUWInsiderTransactions(null, {
        limit: options.limit || 50,
      });
      const trades = Array.isArray(data) ? data : (data?.data || []);
      console.log("Insider trades loaded:", trades.length, trades[0] ? Object.keys(trades[0]) : "No data");
      return trades;
    } catch (err) {
      console.error("Error loading insider trades:", err);
      return [];
    }
  }

  // Insider Trades (FMP)
  async loadFMPInsiderTrades(options = {}) {
    try {
      const data = await fmpUWClient.getFMPInsiderTrades(options.symbol, {
        limit: Math.min(options.limit || 50, 100), // Cap à 100 pour Starter plan
      });
      return Array.isArray(data) ? data : (data?.data || []);
    } catch (err) {
      console.error("Error loading FMP insider trades:", err);
      return [];
    }
  }

  // Congress Trades
  async loadCongressTrades(options = {}) {
    try {
      const data = await fmpUWClient.getUWCongressRecentTrades(null, {
        limit: options.limit || 50,
      });
      const trades = Array.isArray(data) ? data : (data?.data || []);
      console.log("Congress trades loaded:", trades.length, trades[0] ? Object.keys(trades[0]) : "No data");
      return trades;
    } catch (err) {
      console.error("Error loading congress trades:", err);
      return [];
    }
  }

  // Institutional Activity
  async loadInstitutionalActivity(options = {}) {
    try {
      const data = await fmpUWClient.getUWLatestInstitutionalFilings({
        limit: options.limit || 100,
      });
      return Array.isArray(data) ? data : (data?.data || []);
    } catch (err) {
      console.error("Error loading institutional activity:", err);
      return [];
    }
  }

  // Institution Transactions
  async loadInstitutionTransactions(institutionName, options = {}) {
    try {
      const data = await fmpUWClient.getUWInstitutionActivity(null, institutionName, {
        limit: options.limit || 100,
      });
      return Array.isArray(data) ? data : (data?.data || []);
    } catch (err) {
      console.error(`Error loading transactions for ${institutionName}:`, err);
      throw err;
    }
  }

  // Hedge Fund Activity
  async loadHedgeFundActivity() {
    try {
      let hedgeFundsData = [];

      // Priorité 1: 13F Filings API
      try {
        const filings = await filings13FClient.getLatestFilings({ limit: 100 });
        const institutions = Array.isArray(filings) ? filings : (filings?.data || []);
        
        const hedgeFundNames = HEDGE_FUNDS.getAll().map(name => name.toLowerCase());
        
        hedgeFundsData = institutions.filter(inst => {
          const name = (inst.name || inst.short_name || "").toLowerCase();
          return hedgeFundNames.some(hfName => 
            name.includes(hfName) || hfName.includes(name)
          );
        }).map(inst => ({
          id: inst.cik || inst.id,
          name: inst.name || inst.short_name,
          cik: inst.cik,
          category: "hedge_fund",
          source: "13f-filings",
        }));
      } catch (err) {
        console.error("Error loading from 13F Filings:", err);
      }

      // Priorité 2: Unusual Whales si pas de données
      if (hedgeFundsData.length === 0) {
        try {
          const allInstitutions = await fmpUWClient.getUWLatestInstitutionalFilings({
            limit: 100,
          });
          const institutions = Array.isArray(allInstitutions) 
            ? allInstitutions 
            : (allInstitutions?.data || []);
          
          const hedgeFundNames = HEDGE_FUNDS.getAll().map(name => name.toLowerCase());
          
          hedgeFundsData = institutions.filter(inst => {
            const name = (inst.name || inst.short_name || "").toLowerCase();
            return hedgeFundNames.some(hfName => 
              name.includes(hfName) || hfName.includes(name)
            );
          }).map(inst => ({
            id: inst.cik || inst.id,
            name: inst.name || inst.short_name,
            cik: inst.cik,
            category: "hedge_fund",
            source: "unusual-whales",
          }));
        } catch (err) {
          console.error("Error loading from Unusual Whales:", err);
        }
      }

      // Priorité 3: Liste statique
      if (hedgeFundsData.length === 0) {
        hedgeFundsData = HEDGE_FUNDS.getTop20().map((fund, index) => ({
          id: `static-${index}`,
          name: fund.name,
          headquarters: fund.headquarters,
          aum: fund.aum,
          rank: fund.rank,
          source: "static",
        }));
      }

      return hedgeFundsData;
    } catch (err) {
      console.error("Error loading hedge fund activity:", err);
      // Fallback sur la liste statique
      return HEDGE_FUNDS.getTop20().map((fund, index) => ({
        id: `static-${index}`,
        name: fund.name,
        headquarters: fund.headquarters,
        aum: fund.aum,
        rank: fund.rank,
        source: "static",
      }));
    }
  }

  // Hedge Fund Holdings
  async loadHedgeFundHoldings(fundId, fundName) {
    if (!fundId && !fundName) {
      return { activity: [], holdings: [] };
    }

    try {
      let holdingsData = [];
      let activityData = [];

      // Priorité 1: 13F Filings API
      try {
        if (fundId && !fundId.startsWith("static-")) {
          const holdings = await filings13FClient.getHoldings(fundId);
          holdingsData = Array.isArray(holdings) ? holdings : (holdings?.data || []);
        }
      } catch (err) {
        console.error("Error loading from 13F Filings:", err);
      }

      // Priorité 2: Unusual Whales
      if (holdingsData.length === 0 && fundName) {
        try {
          const [holdings, activity] = await Promise.all([
            fmpUWClient.getUWInstitutionHoldings(null, fundName, { limit: 50 }),
            fmpUWClient.getUWInstitutionActivity(null, fundName, { limit: 20 }),
          ]);
          
          holdingsData = Array.isArray(holdings) ? holdings : (holdings?.data || []);
          activityData = Array.isArray(activity) ? activity : (activity?.data || []);
        } catch (err) {
          console.error("Error loading from Unusual Whales:", err);
        }
      }

      return {
        holdings: holdingsData,
        activity: activityData,
      };
    } catch (err) {
      console.error("Error loading hedge fund holdings:", err);
      return { activity: [], holdings: [] };
    }
  }

  // Calculer les statistiques
  calculateStats(flowAlerts = []) {
    const totalAlerts = flowAlerts.length;
    const totalPremium = flowAlerts.reduce((sum, alert) => {
      return sum + (parseFloat(alert.total_premium || alert.premium) || 0);
    }, 0);

    // Top ticker par volume
    const tickerCounts = {};
    flowAlerts.forEach(alert => {
      const ticker = alert.ticker || alert.symbol;
      if (ticker) {
        tickerCounts[ticker] = (tickerCounts[ticker] || 0) + 1;
      }
    });
    const topTicker = Object.keys(tickerCounts).length > 0 
      ? Object.keys(tickerCounts).reduce((a, b) => 
          tickerCounts[a] > tickerCounts[b] ? a : b
        )
      : null;

    // Biggest trade
    const biggestTrade = flowAlerts.reduce((max, alert) => {
      const premium = parseFloat(alert.total_premium || alert.premium) || 0;
      const maxPremium = parseFloat(max?.total_premium || max?.premium) || 0;
      return premium > maxPremium ? alert : max;
    }, null);

    return {
      totalAlerts,
      totalPremium,
      topTicker,
      biggestTrade,
    };
  }
}

export default new WhaleTrackerService();

