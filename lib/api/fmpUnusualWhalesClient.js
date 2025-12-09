/**
 * Client API pour FMP et Unusual Whales
 * 
 * Remplace les clients FMP et Unusual Whales qui exposaient les clés API côté client.
 * Toutes les requêtes passent maintenant par le backend sécurisé.
 * 
 * Utilise ACCESS TOKEN pour l'authentification.
 */

import BaseApiClient from "./baseClient";

class FMPUnusualWhalesClient extends BaseApiClient {
  constructor() {
    super('access'); // Utilise ACCESS TOKEN pour les APIs backend
  }

  // ==================== FMP METHODS ====================

  /**
   * Rechercher une entreprise par son nom
   * @param {string} query - Nom de l'entreprise
   * @param {Object} options - Options (limit, exchange)
   * @returns {Promise<Array>}
   */
  async searchCompanyByName(query, options = {}) {
    const params = new URLSearchParams({ query });
    if (options.limit) params.append('limit', options.limit);
    if (options.exchange) params.append('exchange', options.exchange);
    return this.request(`/fmp/search-name?${params.toString()}`);
  }

  /**
   * Rechercher un symbole boursier
   * @param {string} query - Symbole ou nom à rechercher
   * @param {Object} options - Options (limit, exchange)
   * @returns {Promise<Array>}
   */
  async searchSymbol(query, options = {}) {
    const params = new URLSearchParams({ query });
    if (options.limit) params.append('limit', options.limit);
    if (options.exchange) params.append('exchange', options.exchange);
    return this.request(`/fmp/search-symbol?${params.toString()}`);
  }

  /**
   * Rechercher par CIK (Central Index Key)
   * @param {string} cik - CIK number
   * @param {Object} options - Options (limit)
   * @returns {Promise<Array>}
   */
  async searchByCIK(cik, options = {}) {
    const params = new URLSearchParams({ cik });
    if (options.limit) params.append('limit', options.limit);
    return this.request(`/fmp/search-cik?${params.toString()}`);
  }

  /**
   * Rechercher par CUSIP
   * @param {string} cusip - CUSIP number
   * @returns {Promise<Array>}
   */
  async searchByCUSIP(cusip) {
    return this.request(`/fmp/search-cusip?cusip=${encodeURIComponent(cusip)}`);
  }

  /**
   * Rechercher par ISIN
   * @param {string} isin - ISIN number
   * @returns {Promise<Array>}
   */
  async searchByISIN(isin) {
    return this.request(`/fmp/search-isin?isin=${encodeURIComponent(isin)}`);
  }

  /**
   * Stock Screener - Filtrer les actions selon des critères
   * @param {Object} criteria - Critères de recherche
   * @param {number} criteria.marketCapMoreThan - Market cap minimum
   * @param {number} criteria.marketCapLowerThan - Market cap maximum
   * @param {string} criteria.sector - Secteur
   * @param {string} criteria.industry - Industrie
   * @param {number} criteria.betaMoreThan - Beta minimum
   * @param {number} criteria.betaLowerThan - Beta maximum
   * @param {number} criteria.priceMoreThan - Prix minimum
   * @param {number} criteria.priceLowerThan - Prix maximum
   * @param {number} criteria.dividendMoreThan - Dividende minimum
   * @param {number} criteria.dividendLowerThan - Dividende maximum
   * @param {number} criteria.volumeMoreThan - Volume minimum
   * @param {number} criteria.volumeLowerThan - Volume maximum
   * @param {string} criteria.exchange - Bourse
   * @param {string} criteria.country - Pays
   * @param {boolean} criteria.isEtf - Est un ETF
   * @param {boolean} criteria.isFund - Est un fonds
   * @param {boolean} criteria.isActivelyTrading - Est activement tradé
   * @param {number} criteria.limit - Limite de résultats
   * @param {boolean} criteria.includeAllShareClasses - Inclure toutes les classes d'actions
   * @returns {Promise<Array>}
   */
  async stockScreener(criteria = {}) {
    const params = new URLSearchParams();
    
    // Ajouter tous les paramètres non-null/undefined
    Object.keys(criteria).forEach(key => {
      const value = criteria[key];
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    return this.request(`/fmp/company-screener?${params.toString()}`);
  }

  /**
   * Rechercher les variantes d'échange pour un symbole
   * @param {string} symbol - Symbole boursier
   * @returns {Promise<Array>}
   */
  async searchExchangeVariants(symbol) {
    return this.request(`/fmp/search-exchange-variants?symbol=${encodeURIComponent(symbol)}`);
  }

  /**
   * Obtenir le prix actuel d'un symbole
   * @param {string} symbol - Symbole boursier
   * @param {boolean} forceRefresh - Forcer le rafraîchissement (bypass cache)
   * @returns {Promise<Object>}
   */
  async getFMPQuote(symbol, forceRefresh = false) {
    const params = forceRefresh ? "?force_refresh=true" : "";
    return this.request(`/fmp/quote/${symbol}${params}`);
  }

  /**
   * Obtenir l'historique des prix
   * @param {string} symbol - Symbole boursier
   * @param {string} period - Période (1day, 5day, 1month, 3month, 1year, etc.)
   * @returns {Promise<Array>}
   */
  async getFMPHistoricalPrice(symbol, period = "1day") {
    return this.request(`/fmp/historical-price/${symbol}?period=${encodeURIComponent(period)}`);
  }

  /**
   * Obtenir l'historique des prix avec dates
   * @param {string} symbol - Symbole boursier
   * @param {string} from - Date de début (YYYY-MM-DD)
   * @param {string} to - Date de fin (YYYY-MM-DD)
   * @returns {Promise<Array>}
   */
  async getFMPHistoricalData(symbol, from, to) {
    return this.request(`/fmp/historical-data/${symbol}?from=${from}&to=${to}`);
  }

  /**
   * Obtenir le profil de l'entreprise
   * @param {string} symbol - Symbole boursier
   * @returns {Promise<Object>}
   */
  async getFMPCompanyProfile(symbol) {
    return this.request(`/fmp/company-profile/${symbol}`);
  }

  /**
   * Obtenir l'état des résultats
   * @param {string} symbol - Symbole boursier
   * @param {string} period - annual ou quarter
   * @param {number} limit - Nombre de périodes
   * @returns {Promise<Array>}
   */
  async getFMPIncomeStatement(symbol, period = "annual", limit = 5) {
    return this.request(`/fmp/income-statement/${symbol}?period=${period}&limit=${limit}`);
  }

  /**
   * Obtenir le bilan
   * @param {string} symbol - Symbole boursier
   * @param {string} period - annual ou quarter
   * @param {number} limit - Nombre de périodes
   * @returns {Promise<Array>}
   */
  async getFMPBalanceSheet(symbol, period = "annual", limit = 5) {
    return this.request(`/fmp/balance-sheet/${symbol}?period=${period}&limit=${limit}`);
  }

  /**
   * Obtenir le flux de trésorerie
   * @param {string} symbol - Symbole boursier
   * @param {string} period - annual ou quarter
   * @param {number} limit - Nombre de périodes
   * @returns {Promise<Array>}
   */
  async getFMPCashFlow(symbol, period = "annual", limit = 5) {
    return this.request(`/fmp/cash-flow/${symbol}?period=${period}&limit=${limit}`);
  }

  /**
   * Obtenir les métriques clés
   * @param {string} symbol - Symbole boursier
   * @param {string} period - annual ou quarter
   * @param {number} limit - Nombre de périodes
   * @returns {Promise<Array>}
   */
  async getFMPKeyMetrics(symbol, period = "annual", limit = 5) {
    return this.request(`/fmp/key-metrics/${symbol}?period=${period}&limit=${limit}`);
  }

  /**
   * Obtenir les ratios financiers
   * @param {string} symbol - Symbole boursier
   * @param {string} period - annual ou quarter
   * @param {number} limit - Nombre de périodes
   * @returns {Promise<Array>}
   */
  async getFMPRatios(symbol, period = "annual", limit = 5) {
    return this.request(`/fmp/ratios/${symbol}?period=${period}&limit=${limit}`);
  }

  /**
   * Obtenir la valuation DCF
   * @param {string} symbol - Symbole boursier
   * @returns {Promise<Object|Array>}
   */
  async getFMPDCF(symbol) {
    return this.request(`/fmp/dcf/${symbol}`);
  }

  /**
   * Obtenir l'enterprise value
   * @param {string} symbol - Symbole boursier
   * @param {string} period - annual ou quarter
   * @param {number} limit - Nombre de périodes
   * @returns {Promise<Array>}
   */
  async getFMPEnterpriseValue(symbol, period = "annual", limit = 5) {
    return this.request(`/fmp/enterprise-value/${symbol}?period=${period}&limit=${limit}`);
  }

  /**
   * Obtenir les résultats
   * @param {string} symbol - Symbole boursier
   * @param {number} limit - Nombre de résultats
   * @returns {Promise<Array>}
   */
  async getFMPEarnings(symbol, limit = 10) {
    return this.request(`/fmp/earnings/${symbol}?limit=${limit}`);
  }

  /**
   * Obtenir les transcripts de résultats
   * @param {string} symbol - Symbole boursier
   * @param {number} year - Année
   * @param {number} quarter - Trimestre
   * @returns {Promise<Array>}
   */
  async getFMPEarningsTranscript(symbol, year, quarter) {
    return this.request(`/fmp/earnings-transcript/${symbol}?year=${year}&quarter=${quarter}`);
  }

  /**
   * Obtenir les estimations de résultats
   * @param {string} symbol - Symbole boursier
   * @param {string} period - annual ou quarter
   * @param {number} limit - Nombre de résultats (max 10 pour plan Starter)
   * @returns {Promise<Array>}
   */
  async getFMPEarningsEstimates(symbol, period = "annual", limit = 10) {
    return this.request(`/fmp/earnings-estimates/${symbol}?period=${period}&limit=${Math.min(limit, 10)}`);
  }

  /**
   * Obtenir les surprises de résultats
   * @param {string} symbol - Symbole boursier
   * @param {number} limit - Nombre de résultats
   * @returns {Promise<Array>}
   */
  async getFMPEarningsSurprises(symbol, limit = 10) {
    return this.request(`/fmp/earnings-surprises/${symbol}?limit=${limit}`);
  }

  /**
   * Obtenir les estimations d'analystes
   * @param {string} symbol - Symbole boursier
   * @param {string} period - annual ou quarter
   * @param {number} limit - Nombre de résultats (max 10 pour plan Starter)
   * @returns {Promise<Array>}
   */
  async getFMPAnalystEstimates(symbol, period = "annual", limit = 10) {
    return this.request(`/fmp/analyst-estimates/${symbol}?period=${period}&limit=${Math.min(limit, 10)}`);
  }

  /**
   * Obtenir les transactions d'insiders
   * @param {string} symbol - Symbole boursier
   * @param {number} limit - Nombre de transactions
   * @returns {Promise<Array>}
   */
  async getFMPInsiderTrades(symbol, limit = 50) {
    return this.request(`/fmp/insider-trades/${symbol}?limit=${limit}`);
  }

  /**
   * Obtenir les holdings de hedge funds
   * @param {string} symbol - Symbole boursier
   * @param {number} limit - Nombre de holdings
   * @returns {Promise<Array>}
   */
  async getFMPHedgeFundHoldings(symbol, limit = 50) {
    return this.request(`/fmp/hedge-fund-holdings/${symbol}?limit=${limit}`);
  }

  /**
   * Obtenir les actualités de marché
   * @param {string} symbol - Symbole boursier (optionnel)
   * @param {number} limit - Nombre d'actualités
   * @returns {Promise<Array>}
   */
  async getFMPMarketNews(symbol = null, limit = 50) {
    const params = symbol ? `?symbol=${symbol}&limit=${limit}` : `?limit=${limit}`;
    return this.request(`/fmp/market-news${params}`);
  }

  /**
   * Obtenir le calendrier économique
   * @param {string} from - Date de début (YYYY-MM-DD)
   * @param {string} to - Date de fin (YYYY-MM-DD)
   * @returns {Promise<Array>}
   */
  async getFMPEconomicCalendar(from, to) {
    return this.request(`/economic-calendar?from=${from}&to=${to}`);
  }

  /**
   * Obtenir le calendrier des résultats
   * @param {string} from - Date de début (YYYY-MM-DD)
   * @param {string} to - Date de fin (YYYY-MM-DD)
   * @returns {Promise<Array>}
   */
  async getFMPEarningsCalendar(from, to) {
    return this.request(`/fmp/earnings-calendar?from=${from}&to=${to}`);
  }

  /**
   * Obtenir les dépôts SEC
   * @param {string} symbol - Symbole boursier
   * @param {string} type - Type de dépôt (10-K, 10-Q, etc.)
   * @param {number} limit - Nombre de dépôts
   * @returns {Promise<Array>}
   */
  async getFMPSECFilings(symbol, type = null, limit = 50) {
    const params = type ? `?type=${type}&limit=${limit}` : `?limit=${limit}`;
    return this.request(`/fmp/sec-filings/${symbol}${params}`);
  }

  /**
   * Obtenir le RSI
   * @param {string} symbol - Symbole boursier
   * @param {number} period - Période (14 par défaut)
   * @param {string} timeframe - Timeframe (1day, 1week, etc.)
   * @returns {Promise<Object>}
   */
  async getFMPRSI(symbol, period = 14, timeframe = "1day") {
    return this.request(`/fmp/rsi/${symbol}?period=${period}&timeframe=${timeframe}`);
  }

  /**
   * Obtenir les indices majeurs
   * @returns {Promise<Array>}
   */
  async getFMPMajorIndices() {
    return this.request(`/fmp/major-indices`);
  }

  /**
   * Obtenir la performance par secteur
   * @returns {Promise<Array>}
   */
  async getFMPSectorPerformance() {
    return this.request(`/fmp/sector-performance`);
  }

  /**
   * Screener de stocks
   * @param {Object} criteria - Critères de recherche
   * @returns {Promise<Array>}
   */
  async getFMPScreener(criteria = {}) {
    const params = new URLSearchParams(criteria).toString();
    return this.request(`/fmp/screener?${params}`);
  }

  // ==================== UNUSUAL WHALES METHODS ====================

  /**
   * Obtenir la propriété institutionnelle
   * @param {string} ticker - Symbole boursier
   * @param {Object} options - Options (limit, forceRefresh, etc.)
   * @returns {Promise<Array>}
   */
  async getUWInstitutionOwnership(ticker, options = {}) {
    const params = new URLSearchParams(options).toString();
    return this.request(`/unusual-whales/institution-ownership/${ticker}?${params}`);
  }

  /**
   * Obtenir l'activité institutionnelle
   * @param {string} ticker - Symbole boursier
   * @param {string} institutionName - Nom de l'institution (optionnel)
   * @param {Object} options - Options (limit, forceRefresh, etc.)
   * @returns {Promise<Array>}
   */
  async getUWInstitutionActivity(ticker, institutionName = null, options = {}) {
    const params = new URLSearchParams({
      ...options,
      ...(institutionName && { institution: institutionName }),
    }).toString();
    return this.request(`/unusual-whales/institution-activity/${ticker}?${params}`);
  }

  /**
   * Obtenir les holdings institutionnels
   * @param {string} ticker - Symbole boursier
   * @param {string} institutionName - Nom de l'institution
   * @param {Object} options - Options (limit, etc.)
   * @returns {Promise<Array>}
   */
  async getUWInstitutionHoldings(ticker, institutionName, options = {}) {
    const params = new URLSearchParams(options).toString();
    return this.request(`/unusual-whales/institution-holdings/${ticker}/${encodeURIComponent(institutionName)}?${params}`);
  }

  /**
   * Obtenir le flow d'options
   * @param {string} ticker - Symbole boursier
   * @param {Object} options - Options (limit, min_premium, etc.)
   * @returns {Promise<Array>}
   */
  async getUWOptionsFlow(ticker, options = {}) {
    const params = new URLSearchParams(options).toString();
    return this.request(`/unusual-whales/options-flow/${ticker}?${params}`);
  }

  /**
   * Obtenir les alertes de flow
   * @param {string} ticker - Symbole boursier (optionnel)
   * @param {Object} options - Options (limit, min_premium, etc.)
   * @returns {Promise<Array>}
   */
  async getUWFlowAlerts(ticker = null, options = {}) {
    const params = new URLSearchParams({
      ...options,
      ...(ticker && { ticker }),
    }).toString();
    const endpoint = ticker
      ? `/unusual-whales/flow-alerts/${ticker}?${params}`
      : `/unusual-whales/flow-alerts?${params}`;
    return this.request(endpoint);
  }

  /**
   * Obtenir le Greek flow
   * @param {string} ticker - Symbole boursier
   * @param {Object} options - Options
   * @returns {Promise<Object>}
   */
  async getUWGreekFlow(ticker, options = {}) {
    const params = new URLSearchParams(options).toString();
    return this.request(`/unusual-whales/greek-flow/${ticker}?${params}`);
  }

  /**
   * Obtenir les trades dark pool
   * @param {string} ticker - Symbole boursier
   * @param {Object} options - Options (limit, etc.)
   * @returns {Promise<Array>}
   */
  async getUWDarkPoolTrades(ticker, options = {}) {
    const params = new URLSearchParams(options).toString();
    return this.request(`/unusual-whales/dark-pool-trades/${ticker}?${params}`);
  }

  /**
   * Obtenir les transactions d'insiders
   * @param {string} ticker - Symbole boursier (optionnel)
   * @param {Object} options - Options (limit, etc.)
   * @returns {Promise<Array>}
   */
  async getUWInsiderTrades(ticker = null, options = {}) {
    const params = new URLSearchParams({
      ...options,
      ...(ticker && { ticker }),
    }).toString();
    const endpoint = ticker
      ? `/unusual-whales/insider-trades/${ticker}?${params}`
      : `/unusual-whales/insider-trades?${params}`;
    return this.request(endpoint);
  }

  /**
   * Obtenir les transactions d'insiders (format différent)
   * @param {string} ticker - Symbole boursier (optionnel)
   * @param {Object} options - Options (limit, etc.)
   * @returns {Promise<Array>}
   */
  async getUWInsiderTransactions(ticker = null, options = {}) {
    const params = new URLSearchParams({
      ...options,
      ...(ticker && { ticker }),
    }).toString();
    const endpoint = ticker
      ? `/unusual-whales/insider-transactions/${ticker}?${params}`
      : `/unusual-whales/insider-transactions?${params}`;
    return this.request(endpoint);
  }

  /**
   * Obtenir les transactions du Congrès
   * @param {string} ticker - Symbole boursier (optionnel)
   * @param {Object} options - Options (limit, etc.)
   * @returns {Promise<Array>}
   */
  async getUWCongressTrades(ticker = null, options = {}) {
    const params = new URLSearchParams({
      ...options,
      ...(ticker && { ticker }),
    }).toString();
    const endpoint = ticker
      ? `/unusual-whales/congress-trades/${ticker}?${params}`
      : `/unusual-whales/congress-trades?${params}`;
    return this.request(endpoint);
  }

  /**
   * Obtenir les transactions récentes du Congrès
   * @param {string} ticker - Symbole boursier (optionnel)
   * @param {Object} options - Options (limit, etc.)
   * @returns {Promise<Array>}
   */
  async getUWCongressRecentTrades(ticker = null, options = {}) {
    const params = new URLSearchParams({
      ...options,
      ...(ticker && { ticker }),
    }).toString();
    const endpoint = ticker
      ? `/unusual-whales/congress-recent-trades/${ticker}?${params}`
      : `/unusual-whales/congress-recent-trades?${params}`;
    return this.request(endpoint);
  }

  /**
   * Obtenir les dernières filings institutionnelles
   * @param {Object} options - Options (limit, tag, etc.)
   * @returns {Promise<Array>}
   */
  async getUWLatestInstitutionalFilings(options = {}) {
    const params = new URLSearchParams(options).toString();
    return this.request(`/unusual-whales/latest-institutional-filings?${params}`);
  }

  /**
   * Obtenir la liste des institutions
   * @param {Object} options - Options (limit, search, etc.)
   * @returns {Promise<Array>}
   */
  async getUWInstitutions(options = {}) {
    const params = new URLSearchParams(options).toString();
    return this.request(`/unusual-whales/institutions?${params}`);
  }

  /**
   * Obtenir les secteurs d'une institution
   * @param {string} institutionName - Nom de l'institution
   * @param {Object} options - Options
   * @returns {Promise<Array>}
   */
  async getUWInstitutionSectors(institutionName, options = {}) {
    const params = new URLSearchParams(options).toString();
    return this.request(`/unusual-whales/institution-sectors/${encodeURIComponent(institutionName)}?${params}`);
  }

}

// Export singleton instance
const fmpUWClient = new FMPUnusualWhalesClient();
export default fmpUWClient;

