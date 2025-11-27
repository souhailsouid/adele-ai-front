/**
 * Client API Unusual Whales
 * Documentation: https://api.unusualwhales.com/docs
 */

class UnusualWhalesClient {
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_UNUSUAL_WHALES;
    this.baseUrl = "https://api.unusualwhales.com";
    
    // Rate limiting: 120 requests/minute = 2 requests/second max
    this.maxCallsPerSecond = 1.5; // On reste en dessous pour être sûr
    this.lastCallTime = 0;
    this.minDelayBetweenCalls = 1000 / this.maxCallsPerSecond; // ~667ms entre chaque appel
    
    if (!this.apiKey) {
      console.warn("⚠️ NEXT_PUBLIC_UNUSUAL_WHALES not configured. Some features may not work.");
    }
  }

  /**
   * Attendre avant de faire un nouvel appel pour respecter le rate limit
   */
  async throttle() {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    
    if (timeSinceLastCall < this.minDelayBetweenCalls) {
      const waitTime = this.minDelayBetweenCalls - timeSinceLastCall;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    
    this.lastCallTime = Date.now();
  }

  /**
   * Faire une requête à l'API Unusual Whales
   */
  async request(endpoint, params = {}) {
    if (!this.apiKey) {
      throw new Error("Unusual Whales API key not configured");
    }

    // Throttle pour respecter le rate limit
    await this.throttle();

    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Ajouter les paramètres de requête
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          // Pour les tableaux, utiliser la notation []
          value.forEach((item) => {
            url.searchParams.append(`${key}[]`, item);
          });
        } else {
          url.searchParams.append(key, value);
        }
      }
    });

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Accept": "application/json, text/plain",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { error: errorText || `HTTP ${response.status}` };
        }
        
        // Créer une erreur avec plus de détails
        const errorMessage = error.message || error.error || `HTTP ${response.status}`;
        const apiError = new Error(errorMessage);
        apiError.status = response.status;
        apiError.code = error.code;
        apiError.originalError = error;
        throw apiError;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching from Unusual Whales API (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Récupérer les alertes déclenchées
   * @param {Object} params - Paramètres de filtrage (newer_than, older_than, limit, etc.)
   */
  async getAlerts(params = {}) {
    return this.request("/api/alerts", params);
  }

  /**
   * Récupérer les configurations d'alertes
   */
  async getAlertConfigurations() {
    return this.request("/api/alerts/configuration");
  }

  /**
   * Récupérer les flow alerts (alertes de flux d'options)
   * @param {Object} params - Paramètres de filtrage
   */
  async getFlowAlerts(params = {}) {
    return this.request("/api/option-trades/flow-alerts", params);
  }

  /**
   * Récupérer les darkpool trades récents
   * @param {Object} params - Paramètres de filtrage (date, limit, min_premium, max_premium, etc.)
   */
  async getRecentDarkpoolTrades(params = {}) {
    return this.request("/api/darkpool/recent", params);
  }

  /**
   * Récupérer les darkpool trades pour un ticker
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres de filtrage
   */
  async getDarkpoolTrades(ticker, params = {}) {
    return this.request(`/api/darkpool/${ticker}`, params);
  }

  /**
   * Récupérer les informations sur un ticker
   * @param {string} ticker - Symbole du ticker
   */
  async getTickerInfo(ticker) {
    return this.request(`/api/stock/${ticker}/info`);
  }

  /**
   * Récupérer l'état actuel d'un stock (prix, volume, etc.)
   * @param {string} ticker - Symbole du ticker
   */
  async getStockState(ticker) {
    return this.request(`/api/stock/${ticker}/stock-state`);
  }

  /**
   * Récupérer les options volume pour un ticker
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date, etc.)
   */
  async getTickerOptionsVolume(ticker, params = {}) {
    return this.request(`/api/stock/${ticker}/options-volume`, params);
  }

  /**
   * Récupérer les greeks pour un ticker
   * @param {string} ticker - Symbole du ticker
   */
  async getTickerGreeks(ticker) {
    return this.request(`/api/stock/${ticker}/greeks`);
  }

  /**
   * Récupérer le max pain pour un ticker
   * @param {string} ticker - Symbole du ticker
   */
  async getMaxPain(ticker) {
    return this.request(`/api/stock/${ticker}/max-pain`);
  }

  /**
   * Récupérer le top net impact (top tickers par net premium)
   * @param {Object} params - Paramètres (date, limit, issue_types[])
   */
  async getTopNetImpact(params = {}) {
    return this.request("/api/market/top-net-impact", params);
  }

  /**
   * Récupérer le market tide
   * @param {Object} params - Paramètres (date, etc.)
   */
  async getMarketTide(params = {}) {
    return this.request("/api/market/market-tide", params);
  }

  /**
   * Récupérer le sector tide pour un secteur
   * @param {string} sector - Nom du secteur
   * @param {Object} params - Paramètres
   */
  async getSectorTide(sector, params = {}) {
    return this.request(`/api/market/${sector}/sector-tide`, params);
  }

  /**
   * Récupérer les changements d'open interest
   * @param {Object} params - Paramètres de filtrage
   */
  async getOIChange(params = {}) {
    return this.request("/api/market/oi-change", params);
  }

  /**
   * Récupérer les insider buy/sells
   * @param {Object} params - Paramètres de filtrage
   */
  async getInsiderBuySells(params = {}) {
    return this.request("/api/market/insider-buy-sells", params);
  }

  /**
   * Récupérer les corrélations entre tickers
   * @param {string} tickers - Liste de tickers séparés par des virgules
   * @param {Object} params - Paramètres (interval, start_date, end_date)
   */
  async getCorrelations(tickers, params = {}) {
    return this.request("/api/market/correlations", {
      tickers,
      ...params,
    });
  }

  /**
   * Récupérer le calendrier économique
   */
  async getEconomicCalendar() {
    return this.request("/api/market/economic-calendar");
  }

  /**
   * Récupérer le calendrier FDA
   * @param {Object} params - Paramètres de filtrage
   */
  async getFDACalendar(params = {}) {
    return this.request("/api/market/fda-calendar", params);
  }

  /**
   * Récupérer les earnings premarket
   * @param {Object} params - Paramètres (date, limit, page)
   */
  async getPremarketEarnings(params = {}) {
    return this.request("/api/earnings/premarket", params);
  }

  /**
   * Récupérer les earnings afterhours
   * @param {Object} params - Paramètres (date, limit, page)
   */
  async getAfterhoursEarnings(params = {}) {
    return this.request("/api/earnings/afterhours", params);
  }

  /**
   * Récupérer les earnings historiques pour un ticker
   * @param {string} ticker - Symbole du ticker
   */
  async getTickerEarnings(ticker) {
    return this.request(`/api/earnings/${ticker}`);
  }

  /**
   * Récupérer les trades récents du Congrès
   * @param {Object} params - Paramètres (date, ticker, limit)
   */
  async getCongressRecentTrades(params = {}) {
    return this.request("/api/congress/recent-trades", params);
  }

  /**
   * Récupérer les rapports récents d'un trader du Congrès
   * @param {string} name - Nom du trader
   * @param {Object} params - Paramètres (limit, page)
   */
  async getCongressTrader(name, params = {}) {
    return this.request(`/api/congress/congress-trader`, {
      name,
      ...params,
    });
  }

  /**
   * Récupérer les rapports en retard du Congrès
   * @param {Object} params - Paramètres (date, limit, page)
   */
  async getCongressLateReports(params = {}) {
    return this.request("/api/congress/late-reports", params);
  }

  // ========== INSTITUTION ENDPOINTS ==========

  /**
   * Récupérer l'activité d'une institution
   * @param {string} name - Nom de l'institution
   * @param {Object} params - Paramètres (date, limit, page)
   */
  async getInstitutionActivity(name, params = {}) {
    return this.request(`/api/institution/${encodeURIComponent(name)}/activity`, params);
  }

  /**
   * Récupérer les holdings d'une institution
   * @param {string} name - Nom de l'institution
   * @param {Object} params - Paramètres (date, start_date, end_date, limit, page, order, order_direction)
   */
  async getInstitutionHoldings(name, params = {}) {
    return this.request(`/api/institution/${encodeURIComponent(name)}/holdings`, params);
  }

  /**
   * Récupérer l'exposition sectorielle d'une institution
   * @param {string} name - Nom de l'institution
   * @param {Object} params - Paramètres (date, start_date, end_date)
   */
  async getInstitutionSectors(name, params = {}) {
    return this.request(`/api/institution/${encodeURIComponent(name)}/sectors`, params);
  }

  /**
   * Récupérer la propriété institutionnelle d'un ticker
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date, start_date, end_date, tags[], order, order_direction, limit, page)
   */
  async getInstitutionOwnership(ticker, params = {}) {
    return this.request(`/api/institution/${encodeURIComponent(ticker)}/ownership`, params);
  }

  /**
   * Récupérer la liste des institutions
   * @param {Object} params - Paramètres de filtrage (name, min_total_value, max_total_value, tags[], order, order_direction, limit, page)
   */
  async getInstitutions(params = {}) {
    return this.request("/api/institutions", params);
  }

  /**
   * Récupérer les derniers filings institutionnels
   * @param {Object} params - Paramètres (name, date, order, order_direction, limit, page)
   */
  async getLatestInstitutionalFilings(params = {}) {
    return this.request("/api/institutions/latest_filings", params);
  }

  // ========== INSIDERS ENDPOINTS ==========

  /**
   * Récupérer les transactions d'insiders
   * @param {Object} params - Paramètres de filtrage (date, ticker, limit, page, common_stock_only, transaction_codes[], security_ad_codes)
   */
  async getInsiderTransactions(params = {}) {
    return this.request("/api/insider/transactions", params);
  }

  /**
   * Récupérer le flux insider pour un secteur
   * @param {string} sector - Nom du secteur
   */
  async getInsiderSectorFlow(sector) {
    return this.request(`/api/insider/${encodeURIComponent(sector)}/sector-flow`);
  }

  /**
   * Récupérer les insiders pour un ticker
   * @param {string} ticker - Symbole du ticker
   */
  async getInsiders(ticker) {
    return this.request(`/api/insider/${ticker}`);
  }

  /**
   * Récupérer le flux insider pour un ticker
   * @param {string} ticker - Symbole du ticker
   */
  async getInsiderTickerFlow(ticker) {
    return this.request(`/api/insider/${ticker}/ticker-flow`);
  }

  // ========== OPTION TRADES ENDPOINTS ==========

  /**
   * Récupérer le full tape pour une date (nécessite scope websocket)
   * @param {string} date - Date au format YYYY-MM-DD
   */
  async getFullTape(date) {
    return this.request(`/api/option-trades/full-tape/${date}`);
  }

  // ========== STOCK ENDPOINTS (ADDITIONAL) ==========

  /**
   * Récupérer les tickers d'un secteur
   * @param {string} sector - Nom du secteur
   */
  async getSectorTickers(sector) {
    return this.request(`/api/stock/${encodeURIComponent(sector)}/tickers`);
  }

  /**
   * Récupérer les ATM chains pour un ticker
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres
   */
  async getATMChains(ticker, params = {}) {
    return this.request(`/api/stock/${ticker}/atm-chains`, params);
  }

  /**
   * Récupérer le NOPE (Net Options Pricing Effect) pour un ticker
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date, etc.)
   */
  async getNOPE(ticker, params = {}) {
    return this.request(`/api/stock/${ticker}/nope`, params);
  }

  /**
   * Récupérer le Greek flow pour un ticker
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date, etc.)
   */
  async getGreekFlow(ticker, params = {}) {
    return this.request(`/api/stock/${ticker}/greek-flow`, params);
  }

  /**
   * Récupérer le Greek flow par expiry pour un ticker
   * @param {string} ticker - Symbole du ticker
   * @param {string} expiry - Date d'expiration
   * @param {Object} params - Paramètres (date, etc.)
   */
  async getGreekFlowByExpiry(ticker, expiry, params = {}) {
    return this.request(`/api/stock/${ticker}/greek-flow/${expiry}`, params);
  }

  // ========== MARKET ENDPOINTS (ADDITIONAL) ==========

  /**
   * Récupérer le total options volume
   * @param {Object} params - Paramètres (date, etc.)
   */
  async getTotalOptionsVolume(params = {}) {
    return this.request("/api/market/total-options-volume", params);
  }

  /**
   * Récupérer le ETF tide pour un ticker
   * @param {string} ticker - Symbole du ticker ETF
   * @param {Object} params - Paramètres
   */
  async getETFTide(ticker, params = {}) {
    return this.request(`/api/market/${ticker}/etf-tide`, params);
  }

  /**
   * Récupérer les sector ETFs
   * @param {Object} params - Paramètres
   */
  async getSectorETFs(params = {}) {
    return this.request("/api/market/sector-etfs", params);
  }

  /**
   * Récupérer le SPIKE
   * @param {Object} params - Paramètres
   */
  async getSPIKE(params = {}) {
    return this.request("/api/market/spike", params);
  }

  // ========== ETFS ENDPOINTS ==========

  /**
   * Récupérer l'exposition d'un ticker dans les ETFs
   * @param {string} ticker - Symbole du ticker
   */
  async getETFExposure(ticker) {
    return this.request(`/api/etfs/${ticker}/exposure`);
  }

  /**
   * Récupérer les holdings d'un ETF
   * @param {string} ticker - Symbole de l'ETF
   */
  async getETFHoldings(ticker) {
    return this.request(`/api/etfs/${ticker}/holdings`);
  }

  /**
   * Récupérer l'inflow & outflow d'un ETF
   * @param {string} ticker - Symbole de l'ETF
   */
  async getETFInOutflow(ticker) {
    return this.request(`/api/etfs/${ticker}/in-outflow`);
  }

  /**
   * Récupérer les informations d'un ETF
   * @param {string} ticker - Symbole de l'ETF
   */
  async getETFInfo(ticker) {
    return this.request(`/api/etfs/${ticker}/info`);
  }

  /**
   * Récupérer les poids sectoriels et par pays d'un ETF
   * @param {string} ticker - Symbole de l'ETF
   */
  async getETFWeights(ticker) {
    return this.request(`/api/etfs/${ticker}/weights`);
  }

  // ========== NEWS ENDPOINTS ==========

  /**
   * Récupérer les dernières news headlines pour les marchés financiers
   * @param {Object} params - Paramètres (limit, major_only, page, search_term, sources)
   */
  async getNewsHeadlines(params = {}) {
    return this.request("/api/news/headlines", params);
  }

  // ========== OPTION CONTRACT ENDPOINTS ==========

  /**
   * Récupérer les dernières 50 transactions d'options pour un contrat donné
   * @param {string} id - ID du contrat d'option au format ISO (ex: TSLA230526P00167500)
   * @param {Object} params - Paramètres (date, limit, min_premium, side)
   */
  async getOptionContractFlow(id, params = {}) {
    return this.request(`/api/option-contract/${encodeURIComponent(id)}/flow`, params);
  }

  /**
   * Récupérer les données historiques pour chaque jour de trading pour un contrat d'option
   * @param {string} id - ID du contrat d'option au format ISO
   * @param {Object} params - Paramètres (limit)
   */
  async getOptionContractHistoric(id, params = {}) {
    return this.request(`/api/option-contract/${encodeURIComponent(id)}/historic`, params);
  }

  /**
   * Récupérer les données intraday (1 minute) pour un contrat d'option
   * @param {string} id - ID du contrat d'option au format ISO
   * @param {Object} params - Paramètres (date)
   */
  async getOptionContractIntraday(id, params = {}) {
    return this.request(`/api/option-contract/${encodeURIComponent(id)}/intraday`, params);
  }

  /**
   * Récupérer le volume profile (volume par prix de fill) pour un contrat d'option
   * @param {string} id - ID du contrat d'option au format ISO
   * @param {Object} params - Paramètres (date)
   */
  async getOptionContractVolumeProfile(id, params = {}) {
    return this.request(`/api/option-contract/${encodeURIComponent(id)}/volume-profile`, params);
  }

  /**
   * Récupérer toutes les expirations pour un ticker pour un jour de trading donné
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date)
   */
  async getExpiryBreakdown(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/expiry-breakdown`, params);
  }

  /**
   * Récupérer tous les contrats d'options pour un ticker
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (exclude_zero_dte, exclude_zero_oi_chains, exclude_zero_vol_chains, expiry, limit, maybe_otm_only, option_symbol, option_type, page, vol_greater_oi)
   */
  async getOptionContracts(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/option-contracts`, params);
  }

  // ========== POLITICIAN PORTFOLIOS ENDPOINTS ==========

  /**
   * Récupérer les détenteurs de portfolios de politiciens pour un ticker
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (aggregate_all_portfolios)
   */
  async getPoliticianPortfolioHolders(ticker, params = {}) {
    return this.request(`/api/politician-portfolios/holders/${encodeURIComponent(ticker)}`, params);
  }

  /**
   * Récupérer la liste de tous les politiciens
   */
  async getPoliticiansList() {
    return this.request("/api/politician-portfolios/people");
  }

  /**
   * Récupérer les transactions récentes des politiciens
   * @param {Object} params - Paramètres (date, disclosure_newer_than, disclosure_older_than, filter_late_reports, limit, page, politician_id, ticker, transaction_newer_than, transaction_older_than)
   */
  async getPoliticianTrades(params = {}) {
    return this.request("/api/politician-portfolios/recent_trades", params);
  }

  /**
   * Récupérer tous les portfolios et holdings d'un politicien
   * @param {string} politicianId - ID du politicien (UUID)
   * @param {Object} params - Paramètres (aggregate_all_portfolios)
   */
  async getPoliticianPortfolios(politicianId, params = {}) {
    return this.request(`/api/politician-portfolios/${encodeURIComponent(politicianId)}`, params);
  }

  // ========== SCREENER ENDPOINTS ==========

  /**
   * Récupérer les dernières notes d'analystes pour un ticker
   * @param {Object} params - Paramètres (action, limit, recommendation, ticker)
   */
  async getAnalystRatings(params = {}) {
    return this.request("/api/screener/analysts", params);
  }

  /**
   * Screener de contrats d'options (Hottest Chains)
   * @param {Object} params - Paramètres de filtrage (voir documentation pour la liste complète)
   */
  async getOptionContractsScreener(params = {}) {
    return this.request("/api/screener/option-contracts", params);
  }

  /**
   * Screener d'actions (Stock Screener)
   * @param {Object} params - Paramètres de filtrage (voir documentation pour la liste complète)
   */
  async getStockScreener(params = {}) {
    return this.request("/api/screener/stocks", params);
  }

  // ========== SEASONALITY ENDPOINTS ==========

  /**
   * Récupérer la saisonnalité du marché (SPY, QQQ, IWM, etc.)
   */
  async getMarketSeasonality() {
    return this.request("/api/seasonality/market");
  }

  /**
   * Récupérer les meilleurs performeurs pour un mois donné
   * @param {number} month - Numéro du mois (1-12)
   * @param {Object} params - Paramètres (limit, min_oi, min_years, order, order_direction, s_p_500_nasdaq_only, ticker_for_sector)
   */
  async getMonthPerformers(month, params = {}) {
    return this.request(`/api/seasonality/${month}/performers`, params);
  }

  /**
   * Récupérer le rendement moyen par mois pour un ticker
   * @param {string} ticker - Symbole du ticker
   */
  async getTickerMonthlySeasonality(ticker) {
    return this.request(`/api/seasonality/${encodeURIComponent(ticker)}/monthly`);
  }

  /**
   * Récupérer le changement de prix par mois et par année pour un ticker
   * @param {string} ticker - Symbole du ticker
   */
  async getTickerYearMonthSeasonality(ticker) {
    return this.request(`/api/seasonality/${encodeURIComponent(ticker)}/year-month`);
  }

  // ========== SHORT DATA ENDPOINTS ==========

  /**
   * Récupérer les données de short (rebate rate, short shares available)
   * @param {string} ticker - Symbole du ticker
   */
  async getShortData(ticker) {
    return this.request(`/api/shorts/${encodeURIComponent(ticker)}/data`);
  }

  /**
   * Récupérer les failures to deliver (FTDs) pour un ticker
   * @param {string} ticker - Symbole du ticker
   */
  async getShortFailuresToDeliver(ticker) {
    return this.request(`/api/shorts/${encodeURIComponent(ticker)}/ftds`);
  }

  /**
   * Récupérer le short interest et float pour un ticker
   * @param {string} ticker - Symbole du ticker
   */
  async getShortInterestAndFloat(ticker) {
    return this.request(`/api/shorts/${encodeURIComponent(ticker)}/interest-float`);
  }

  /**
   * Récupérer le short volume et ratio pour un ticker
   * @param {string} ticker - Symbole du ticker
   */
  async getShortVolumeAndRatio(ticker) {
    return this.request(`/api/shorts/${encodeURIComponent(ticker)}/volume-and-ratio`);
  }

  /**
   * Récupérer le short volume par exchange pour un ticker
   * @param {string} ticker - Symbole du ticker
   */
  async getShortVolumeByExchange(ticker) {
    return this.request(`/api/shorts/${encodeURIComponent(ticker)}/volumes-by-exchange`);
  }

  // ========== STOCK/TICKER SPECIFIC ENDPOINTS ==========

  /**
   * Récupérer la liste des tickers dans un secteur
   * @param {string} sector - Secteur financier
   */
  async getCompaniesInSector(sector) {
    return this.request(`/api/stock/${encodeURIComponent(sector)}/tickers`);
  }

  /**
   * Récupérer les flow alerts pour un ticker (déprécié mais toujours disponible)
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (is_ask_side, is_bid_side, limit)
   */
  async getStockFlowAlerts(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/flow-alerts`, params);
  }

  /**
   * Récupérer le flow par expiry pour un ticker
   * @param {string} ticker - Symbole du ticker
   */
  async getStockFlowPerExpiry(ticker) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/flow-per-expiry`);
  }

  /**
   * Récupérer le flow par strike pour un ticker
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date)
   */
  async getStockFlowPerStrike(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/flow-per-strike`, params);
  }

  /**
   * Récupérer le flow par strike intraday pour un ticker
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date, filter)
   */
  async getStockFlowPerStrikeIntraday(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/flow-per-strike-intraday`, params);
  }

  /**
   * Récupérer les flows récents pour un ticker
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (min_premium, side)
   */
  async getStockFlowRecent(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/flow-recent`, params);
  }

  /**
   * Récupérer le Greek Exposure pour un ticker
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date, timeframe)
   */
  async getStockGreekExposure(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/greek-exposure`, params);
  }

  /**
   * Récupérer le Greek Exposure par expiry pour un ticker
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date)
   */
  async getStockGreekExposureByExpiry(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/greek-exposure/expiry`, params);
  }

  /**
   * Récupérer le Greek Exposure par strike pour un ticker
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date)
   */
  async getStockGreekExposureByStrike(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/greek-exposure/strike`, params);
  }

  /**
   * Récupérer le Greek Exposure par strike et expiry pour un ticker
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date, expiry)
   */
  async getStockGreekExposureByStrikeAndExpiry(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/greek-exposure/strike-expiry`, params);
  }

  /**
   * Récupérer le Historical Risk Reversal Skew pour un ticker
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date, timeframe, delta, expiry)
   */
  async getStockHistoricalRiskReversalSkew(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/historical-risk-reversal-skew`, params);
  }

  /**
   * Récupérer les insider buy/sells pour un ticker
   * @param {string} ticker - Symbole du ticker
   */
  async getStockInsiderBuySells(ticker) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/insider-buy-sells`);
  }

  /**
   * Récupérer l'Interpolated IV pour un ticker
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date)
   */
  async getStockInterpolatedIV(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/interpolated-iv`, params);
  }

  /**
   * Récupérer l'IV Rank pour un ticker
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date, timespan)
   */
  async getStockIVRank(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/iv-rank`, params);
  }

  /**
   * Récupérer les Net Premium Ticks pour un ticker
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date)
   */
  async getStockNetPremTicks(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/net-prem-ticks`, params);
  }

  /**
   * Récupérer les données OHLC pour un ticker
   * @param {string} ticker - Symbole du ticker
   * @param {string} candleSize - Taille de la bougie (1m, 5m, 10m, 15m, 30m, 1h, 4h, 1d)
   * @param {Object} params - Paramètres (date, end_date, limit, timeframe)
   */
  async getStockOHLC(ticker, candleSize, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/ohlc/${encodeURIComponent(candleSize)}`, params);
  }

  /**
   * Récupérer l'OI Change pour un ticker
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date, limit, order, page)
   */
  async getStockOIChange(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/oi-change`, params);
  }

  /**
   * Récupérer l'OI par expiry pour un ticker
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date)
   */
  async getStockOIPerExpiry(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/oi-per-expiry`, params);
  }

  /**
   * Récupérer l'OI par strike pour un ticker
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date)
   */
  async getStockOIPerStrike(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/oi-per-strike`, params);
  }

  /**
   * Récupérer les option chains pour un ticker
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date)
   */
  async getStockOptionChains(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/option-chains`, params);
  }

  /**
   * Récupérer le volume call/put par niveau de prix du stock
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date)
   */
  async getStockOptionPriceLevels(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/option/stock-price-levels`, params);
  }

  /**
   * Récupérer le volume et OI total par expiry
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date)
   */
  async getStockVolumeOIExpiry(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/option/volume-oi-expiry`, params);
  }

  /**
   * Récupérer le volume et premium des options pour une date
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (limit)
   */
  async getStockOptionsVolume(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/options-volume`, params);
  }

  /**
   * Récupérer les expositions GEX spot par minute
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date)
   */
  async getStockSpotExposures(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/spot-exposures`, params);
  }

  /**
   * Récupérer les expositions GEX spot par strike et expiry
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date, limit, max_dte, max_strike, min_dte, min_strike, page, expirations[])
   */
  async getStockSpotExposuresByExpiryStrike(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/spot-exposures/expiry-strike`, params);
  }

  /**
   * Récupérer les expositions GEX spot par strike
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date, limit, max_strike, min_strike, page)
   */
  async getStockSpotExposuresByStrike(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/spot-exposures/strike`, params);
  }

  /**
   * Récupérer le dernier état du stock (OHLC, volume)
   * @param {string} ticker - Symbole du ticker
   */
  async getStockState(ticker) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/stock-state`);
  }

  /**
   * Récupérer le volume lit/off-lit par niveau de prix
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date)
   */
  async getStockVolumePriceLevels(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/stock-volume-price-levels`, params);
  }

  /**
   * Récupérer la volatilité réalisée vs implicite
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date, timeframe)
   */
  async getStockRealizedVolatility(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/volatility/realized`, params);
  }

  /**
   * Récupérer les statistiques de volatilité complètes
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date)
   */
  async getStockVolatilityStats(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/volatility/stats`, params);
  }

  /**
   * Récupérer la structure à terme de la volatilité implicite
   * @param {string} ticker - Symbole du ticker
   * @param {Object} params - Paramètres (date)
   */
  async getStockVolatilityTermStructure(ticker, params = {}) {
    return this.request(`/api/stock/${encodeURIComponent(ticker)}/volatility/term-structure`, params);
  }
}

// Export singleton
const unusualWhalesClient = new UnusualWhalesClient();
export default unusualWhalesClient;

