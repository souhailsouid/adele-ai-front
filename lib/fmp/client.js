/**
 * Client API Financial Modeling Prep (FMP)
 * Documentation: https://site.financialmodelingprep.com/developer/docs/
 */

class FMPClient {
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_FMP_API_KEY;
    this.baseUrl = "https://financialmodelingprep.com/stable/";
    
    // Rate limiting: 300 calls/minute = 5 calls/second max
    this.maxCallsPerSecond = 4; // On reste en dessous pour être sûr
    this.callQueue = [];
    this.lastCallTime = 0;
    this.minDelayBetweenCalls = 1000 / this.maxCallsPerSecond; // ~250ms entre chaque appel
    
    if (!this.apiKey) {
      console.warn("⚠️ FMP_API_KEY not configured. Some features may not work.");
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
   * Faire une requête à l'API FMP avec gestion du rate limiting
   */
  async request(endpoint, params = null, startAsQuery = true, retries = 2) {
    if (!this.apiKey) {
      throw new Error("FMP API key not configured");
    }

    // Throttle pour respecter le rate limit
    await this.throttle();

    const queryParams = new URLSearchParams({
      apikey: this.apiKey,
      ...params,
    });

    const url = `${this.baseUrl}${endpoint}${startAsQuery ? `?${queryParams}` : `&${queryParams}`}`;
    
    try {
      const response = await fetch(url);
      
      // Gérer le rate limiting (429 Too Many Requests)
      if (response.status === 429) {
        if (retries > 0) {
          // Attendre plus longtemps avant de réessayer
          const waitTime = 60000 / this.maxCallsPerSecond; // Attendre pour respecter la limite
          console.warn(`Rate limit atteint, attente de ${waitTime}ms avant réessai...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          return this.request(endpoint, params, startAsQuery, retries - 1);
        }
        throw new Error("Rate limit exceeded. Please wait before making more requests.");
      }
      
      if (!response.ok) {
        throw new Error(`FMP API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // FMP retourne parfois un objet avec une clé "Error Message"
      if (data["Error Message"]) {
        throw new Error(data["Error Message"]);
      }

      return data;
    } catch (error) {
      console.error("FMP API request failed:", error);
      throw error;
    }
  }

  // ==================== QUOTES & PRICE DATA ====================

  /**
   * Obtenir le prix en temps réel d'un symbole
   */
  async getQuote(symbol) {
    const data = await this.request(`/quote?symbol=${symbol}`, null, false);
    return data[0] || null;
  }


  /**
   * Données historiques (daily) avec volume et prix de clôture
   * Utilise l'endpoint historical-price-eod/full qui retourne:
   * - volume: pour calculer avgVolume
   * - close: pour analyser la tendance (preEarningsTrend)
   * Format: /historical-price-eod/full?symbol={symbol}&from=YYYY-MM-DD&to=YYYY-MM-DD
   */
  async getHistoricalData(symbol, period = "1day", from = null, to = null) {
    // Utiliser l'endpoint historical-price-eod/full pour obtenir les données complètes
    // Cet endpoint retourne: date, open, high, low, close, volume, change, changePercent, vwap
    let endpoint = `/historical-price-eod/full`;
    const params = {
      symbol: symbol
    };
    
    // Si from et to sont fournis, les utiliser
    if (from && to) {
      params.from = from;
      params.to = to;
    } else {
      // Sinon, calculer les dates selon le period
      const today = new Date();
      const pastDate = new Date();
      
      if (period === "1day") {
        pastDate.setDate(today.getDate() - 1);
      } else if (period === "1week") {
        pastDate.setDate(today.getDate() - 7);
      } else if (period === "1month") {
        pastDate.setDate(today.getDate() - 30);
      } else {
        // Par défaut, 30 jours pour avoir assez de données pour calculer avgVolume
        pastDate.setDate(today.getDate() - 30);
      }
      
      params.from = pastDate.toISOString().split("T")[0];
      params.to = today.toISOString().split("T")[0];
    }

    try {
      const data = await this.request(endpoint, params, true);
      // L'API retourne directement un tableau d'objets (pas un objet avec .historical):
      // [{ symbol, date, open, high, low, close, volume, change, changePercent, vwap }, ...]
      // Les données sont triées du plus récent au plus ancien
      if (Array.isArray(data) && data.length > 0) {
        console.log(`getHistoricalData for ${symbol}:`, {
          dataLength: data.length,
          sample: data[0],
          hasVolume: 'volume' in data[0],
          hasClose: 'close' in data[0]
        });
        return data;
      }
      console.warn(`getHistoricalData for ${symbol}: no data returned`);
      return [];
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      return [];
    }
  }

  // ==================== EARNINGS ====================

  /**
   * Calendrier des earnings
   */
  async getEarningsCalendar(from = null, to = null) {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    
    return this.request("/earnings-calendar", params);
  }

  /**
   * Historique des surprises d'earnings
   */
  async getEarningsSurprises(symbol) {
    return this.request(`/earnings-surprises-bulk/${symbol}`);
  }

  /**
   * Estimations d'earnings
   */
  async getEarningsEstimates(symbol) {
    return this.request(`/earnings_calendar`, { symbol });
  }

  // ==================== ECONOMIC CALENDAR ====================

  /**
   * Calendrier économique
   * @param {string} from - Date de début (YYYY-MM-DD)
   * @param {string} to - Date de fin (YYYY-MM-DD)
   * @param {string} impact - Filtrer par impact: "Low", "Medium", "High", "None" (optionnel)
   * @param {string} country - Filtrer par pays (ex: "US", "DE", "JP") (optionnel)
   */
  async getEconomicCalendar(from = null, to = null, impact = null, country = null) {
    const params = {};
    
    // Si from et to ne sont pas fournis, utiliser les 7 prochains jours par défaut
    if (!from || !to) {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 7);
      
      params.from = today.toISOString().split("T")[0];
      params.to = futureDate.toISOString().split("T")[0];
    } else {
      params.from = from;
      params.to = to;
    }
    
    // Ajouter les filtres optionnels
    if (impact) {
      params.impact = impact;
    }
    if (country) {
      params.country = country;
    }

    try {
      const data = await this.request("/economic-calendar", params, true);
      // S'assurer que data est un tableau
      if (Array.isArray(data)) {
        return data;
      }
      // Si data est un objet avec une erreur ou autre chose
      if (data && typeof data === 'object') {
        console.warn("Economic calendar returned non-array:", data);
        return [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching economic calendar:", error);
      return [];
    }
  }

  // ==================== INDICATORS & TECHNICAL ====================

  /**
   * RSI (Relative Strength Index)
   */
  async getRSI(symbol, period = 14, timeframe = "1day") {
      return this.request(`/technical-indicators/rsi?symbol=${symbol}&periodLength=${period}&timeframe=${timeframe}`, null, false);
  }

  /**
   * MACD
   */
  async getMACD(symbol, timeframe = "1day") {
    return this.request(`/macd/${symbol}`, { timeframe });
  }

  /**
   * SMA (Simple Moving Average)
   */
  async getSMA(symbol, period = 50, timeframe = "1day") {
    return this.request(`/sma/${symbol}`, { period, timeframe });
  }

  // ==================== MARKET DATA ====================

  /**
   * Indices majeurs (SPY, QQQ, DIA, IWM)
   * Fait les appels séquentiellement pour respecter le rate limit
   */
  async getMajorIndices() {
    const symbols = ["SPY", "QQQ", "DIA", "IWM"];
    
    // Faire les appels séquentiellement pour éviter le rate limiting
    const quotes = [];
    for (const symbol of symbols) {
      try {
        const quote = await this.getQuote(symbol);
        if (quote) quotes.push(quote);
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
      }
    }
    
    return quotes;
  }


  /**
   * Performance par secteur (snapshot actuel)
   * Utilise l'endpoint /sector-performance-snapshot avec la date d'aujourd'hui
   * @param {string} exchange - Bourse spécifique (NASDAQ, NYSE, AMEX, CBOE) ou null pour toutes
   * @param {string} date - Date au format YYYY-MM-DD ou null pour aujourd'hui
   */
  async getSectorPerformance(exchange = null, date = null) {
    const today = date || new Date().toISOString().split("T")[0];
    let endpoint = `/sector-performance-snapshot?date=${today}`;
    if (exchange) {
      endpoint += `&exchange=${exchange}`;
    }
    return this.request(endpoint, null, false);
  }

  /**
   * Récupérer la performance par secteur pour toutes les bourses principales
   * Fait les appels séquentiellement pour éviter le rate limiting
   */
  async getSectorPerformanceAllExchanges(date = null) {
    // Limiter à NASDAQ et NYSE pour réduire les appels (les plus importantes)
    const exchanges = ["NASDAQ", "NYSE"]; // AMEX et CBOE peuvent être ajoutés si nécessaire
    const today = date || new Date().toISOString().split("T")[0];
    
    // Récupérer les données séquentiellement avec délai pour éviter le rate limiting
    const results = [];
    for (const exchange of exchanges) {
      try {
        const data = await this.getSectorPerformance(exchange, today);
        results.push({ exchange, data: data || [] });
        // Petit délai entre chaque bourse pour être sûr
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`Error fetching ${exchange} sectors:`, error);
        results.push({ exchange, data: [] });
      }
    }

    // Combiner tous les résultats en un seul tableau
    const allSectors = [];
    results.forEach(({ exchange, data }) => {
      data.forEach((sector) => {
        allSectors.push({
          ...sector,
          exchange: exchange,
        });
      });
    });

    return allSectors;
  }

  /**
   * Performance historique d'un secteur
   */
  async getHistoricalSectorPerformance(sector, from = null, to = null) {
    let endpoint = `/historical-sector-performance?sector=${sector}`;
    if (from) endpoint += `&from=${from}`;
    if (to) endpoint += `&to=${to}`;
    return this.request(endpoint, null, false);
  }

  /**
   * Actualités marché
   */
  async getMarketNews(symbol = null, limit = 50) {
    const params = { limit };
    if (symbol) params.tickers = symbol;
    return this.request("/stock_news", params);
  }

  // ==================== FUNDAMENTAL DATA ====================

  /**
   * Profil de l'entreprise
   */
  async getCompanyProfile(symbol) {
    const data = await this.request(`/profile/${symbol}`);
    return data[0] || null;
  }

  /**
   * Données fondamentales annuelles
   */
  async getAnnualFundamentals(symbol) {
    return this.request(`/income-statement/${symbol}`, { period: "annual", limit: 5 });
  }

  /**
   * Ratios financiers
   */
  async getRatios(symbol, period = "annual") {
    return this.request(`/ratios/${symbol}`, { period, limit: 5 });
  }

  // ==================== CRYPTO & FOREX ====================

  /**
   * Prix crypto
   */
  async getCryptoPrice(symbol) {
    return this.request(`/quote/${symbol}USD`);
  }

  /**
   * Taux de change Forex
   */
  async getForexRate(from, to) {
    return this.request(`/fx/${from}${to}`);
  }

  // ==================== SCREENER ====================

  /**
   * Screener d'actions avec filtres
   */
  async screenStocks(filters = {}) {
    // FMP ne fournit pas de screener direct, on utilise les endpoints disponibles
    // Cette méthode peut être étendue selon les besoins
    const params = {};
    
    if (filters.marketCapMin) params.marketCapMin = filters.marketCapMin;
    if (filters.marketCapMax) params.marketCapMax = filters.marketCapMax;
    
    return this.request("/stock-screener", params);
  }
}

// Export singleton instance
export const fmpClient = new FMPClient();
export default fmpClient;

