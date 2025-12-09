/**
 * Service pour les données de marché globales
 */

import fmpUWClient from "/lib/api/fmpUnusualWhalesClient";
import { getWatchlistSymbols } from "/config/watchlist";

export class MarketService {
  /**
   * Obtenir les données du marché global
   */
  async getMarketOverview(symbols = null) {
    try {
      const [indices, sectors, earningsToday] = await Promise.all([
        this.getMajorIndices(),
        this.getSectorPerformance(),
        this.getEarningsToday(symbols),
      ]);
console.log('getMarketOverview_____indices', indices)
console.log('getMarketOverview_____sectors', sectors)
console.log('getMarketOverview_____earningsToday', earningsToday)
      return {
        indices,
        sectors,
        earningsToday,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error getting market overview:", error);
      throw error;
    }
  }

  /**
   * Normaliser les données de quote (gérer changePercent vs changePercentage)
   */
  normalizeQuote(quote) {
    if (!quote) return null;
    return {
      ...quote,
      changePercent: quote.changePercentage || quote.changePercent || 0,
      change: quote.change || 0,
    };
  }

  /**
   * Obtenir les indices majeurs
   */
  async getMajorIndices() {
    try {
      const indices = await fmpUWClient.getFMPMajorIndices();
      return indices.map((index) => {
        const normalized = this.normalizeQuote(index);
        return {
          symbol: normalized.symbol,
          name: this.getIndexName(normalized.symbol),
          price: normalized.price,
          change: normalized.change,
          changePercent: normalized.changePercent,
        };
      });
    } catch (error) {
      console.error("Error getting major indices:", error);
      return [];
    }
  }

  /**
   * Obtenir la performance par secteur
   * Retourne les données groupées par bourse (NASDAQ, NYSE, AMEX, CBOE)
   */
  async getSectorPerformance() {
    try {
      // Récupérer les données de toutes les bourses principales
      const sectors = await fmpUWClient.getFMPSectorPerformance();
      
      // L'API retourne un tableau avec { date, sector, exchange, averageChange }
      const allSectors = sectors.map((sector) => ({
        sector: sector.sector || "Unknown",
        changesPercentage: sector.averageChange || 0, // averageChange est en décimal (ex: 0.5 = 50%)
        exchange: sector.exchange || "NASDAQ",
        date: sector.date,
      }));

      // Grouper par bourse
      const groupedByExchange = {};
      allSectors.forEach((sector) => {
        const exchange = sector.exchange || "NASDAQ";
        if (!groupedByExchange[exchange]) {
          groupedByExchange[exchange] = [];
        }
        groupedByExchange[exchange].push(sector);
      });

      // Trier chaque groupe par performance
      Object.keys(groupedByExchange).forEach((exchange) => {
        groupedByExchange[exchange].sort(
          (a, b) => b.changesPercentage - a.changesPercentage
        );
      });

      return {
        all: allSectors.sort((a, b) => b.changesPercentage - a.changesPercentage),
        byExchange: groupedByExchange,
        exchanges: Object.keys(groupedByExchange).sort(),
      };
    } catch (error) {
      console.error("Error getting sector performance:", error);
      return {
        all: [],
        byExchange: {},
        exchanges: [],
      };
    }
  }

  /**
   * Obtenir les earnings du jour (filtrés par la watchlist)
   */
  async getEarningsToday(symbols = null) {
    try {
      const today = new Date().toISOString().split("T")[0];
      const earnings = await fmpUWClient.getFMPEarningsCalendar(today, today);
      
      if (!earnings || earnings.length === 0) {
        return [];
      }

      // Filtrer pour ne garder que les compagnies de la watchlist
      const watchlistSymbols = symbols || getWatchlistSymbols();
      const filteredEarnings = earnings.filter((earning) =>
        watchlistSymbols.includes(earning.symbol?.toUpperCase())
      );

      return filteredEarnings;
    } catch (error) {
      console.error("Error getting earnings today:", error);
      return [];
    }
  }

  /**
   * Obtenir les actualités du marché
   */
  async getMarketNews(limit = 10) {
    try {
      return await fmpUWClient.getFMPMarketNews(null, limit);
    } catch (error) {
      console.error("Error getting market news:", error);
      return [];
    }
  }

  /**
   * Obtenir les actualités pour un symbole spécifique
   */
  async getStockNews(symbol, limit = 10) {
    try {
      return await fmpUWClient.getFMPMarketNews(symbol, limit);
    } catch (error) {
      console.error(`Error getting news for ${symbol}:`, error);
      return [];
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Obtenir le nom d'un indice
   */
  getIndexName(symbol) {
    const names = {
      SPY: "S&P 500",
      QQQ: "NASDAQ 100",
      DIA: "Dow Jones",
      IWM: "Russell 2000",
    };
    return names[symbol] || symbol;
  }
}

export const marketService = new MarketService();
export default marketService;

