/**
 * Service pour récupérer les insights agrégées d'un ticker
 * 
 * Utilise l'endpoint /ticker-insights/{ticker} qui retourne toutes les informations
 * qui pourraient influencer le cours d'un ticker en une seule requête.
 */

import tickerActivityClient from "/lib/api/tickerActivityClient";

class TickerInsightsService {
  /**
   * Récupérer toutes les insights pour un ticker
   * @param {string} ticker - Symbole du ticker (ex: "NVDA")
   * @returns {Promise<Object>} Objet contenant toutes les données agrégées
   */
  async getInsights(ticker) {
    if (!ticker) {
      throw new Error("Ticker is required");
    }

    try {
      const result = await tickerActivityClient.getInsights(ticker);
      return result.data;
    } catch (error) {
      console.error(`[TickerInsightsService] Error fetching insights for ${ticker}:`, error);
      throw error;
    }
  }

  /**
   * Formater les données d'activité institutionnelle pour l'affichage
   */
  formatInstitutionalActivity(data) {
    if (!data || !data.institutionalActivity) {
      return null;
    }

    return {
      topHolders: data.institutionalActivity.topHolders || [],
      recentActivity: data.institutionalActivity.recentActivity || [],
      stats: data.institutionalActivity.stats || {},
    };
  }

  /**
   * Formater les données d'activité des insiders
   */
  formatInsiderActivity(data) {
    if (!data || !data.insiderActivity) {
      return null;
    }

    return {
      recentTransactions: data.insiderActivity.recentTransactions || [],
      stats: data.insiderActivity.stats || {},
    };
  }

  /**
   * Formater les données de dark pool
   */
  formatDarkPool(data) {
    if (!data || !data.darkPool) {
      return null;
    }

    return {
      recentTrades: data.darkPool.recentTrades || [],
      stats: data.darkPool.stats || {},
    };
  }

  /**
   * Formater les données d'options flow
   */
  formatOptionsFlow(data) {
    if (!data || !data.optionsFlow) {
      return null;
    }

    return {
      ...data.optionsFlow,
      greeks: data.optionsFlow.greeks || {},
    };
  }

  /**
   * Formater les données d'earnings
   */
  formatEarnings(data) {
    if (!data || !data.earnings) {
      return null;
    }

    return {
      nextEarningsDate: data.earnings.nextEarningsDate,
      lastEarningsDate: data.earnings.lastEarningsDate,
      lastEarnings: data.earnings.lastEarnings || {},
      upcomingEarnings: data.earnings.upcomingEarnings || [],
    };
  }
}

export const tickerInsightsService = new TickerInsightsService();
export default tickerInsightsService;




