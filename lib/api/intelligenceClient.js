/**
 * Client API pour les fonctionnalités d'Intelligence
 * 
 * Gère toutes les nouvelles fonctionnalités avancées :
 * - Analyse combinée (FMP + UW)
 * - Scoring automatique
 * - Gamma squeeze detection
 * - Surveillance continue
 * - Alertes multi-signaux
 * - Smart Money
 * - Market Analysis
 * 
 * Utilise ACCESS TOKEN pour l'authentification.
 * Toutes les requêtes passent par l'API Gateway 1 (Application Principale).
 */

import BaseApiClient from "./baseClient";

class IntelligenceClient extends BaseApiClient {
  constructor() {
    super('access'); // Utilise ACCESS TOKEN
    // API Gateway 1 : Application Principale
    this.mainGatewayUrl = process.env.NEXT_PUBLIC_API_MAIN_URL || 'https://tsdd1sibd1.execute-api.eu-west-3.amazonaws.com/prod';
  }

  /**
   * Requête vers l'API Gateway 1 (Application Principale) avec retry pour les erreurs 503
   */
  async requestMain(endpoint, options = {}, retries = 3) {
    const token = this.getToken();
    
    if (!token) {
      throw new Error("Not authenticated. Please sign in first.");
    }

    const url = `${this.mainGatewayUrl}${endpoint}`;
    
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers,
        });

        // Gérer les erreurs 503 (Service Unavailable) avec retry
        if (response.status === 503) {
          if (attempt < retries - 1) {
            const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff, max 10s
            console.warn(`[IntelligenceClient] 503 Service Unavailable, retry ${attempt + 1}/${retries} after ${waitTime}ms`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue; // Réessayer
          } else {
            throw new Error("Service temporairement indisponible (503). Veuillez réessayer dans quelques instants.");
          }
        }

        if (!response.ok) {
          const errorText = await response.text();
          let error;
          try {
            error = JSON.parse(errorText);
          } catch {
            error = { error: errorText || `HTTP ${response.status}` };
          }
          throw new Error(error.error || error.message || `HTTP ${response.status} ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        // Si c'est la dernière tentative ou si l'erreur n'est pas un 503, on propage l'erreur
        if (attempt === retries - 1 || (error.message && !error.message.includes("503"))) {
          console.error(`[IntelligenceClient] Request failed: ${endpoint}`, error);
          throw error;
        }
        // Sinon, on continue la boucle pour réessayer
      }
    }
    
    // Ne devrait jamais arriver ici, mais au cas où
    throw new Error("Échec après plusieurs tentatives");
  }

  // ==================== ANALYSE COMBINÉE ====================

  /**
   * Analyse complète (fundamentals + sentiment)
   * @param {string} ticker - Symbole boursier
   * @returns {Promise<Object>}
   */
  async getCompleteAnalysis(ticker) {
    return this.requestMain(`/analysis/${ticker}/complete`);
  }

  /**
   * Détection de divergences
   * @param {string} ticker - Symbole boursier
   * @returns {Promise<Object>}
   */
  async getDivergenceAnalysis(ticker) {
    return this.requestMain(`/analysis/${ticker}/divergence`);
  }

  /**
   * Valuation complète (DCF + Sentiment Multiplier)
   * @param {string} ticker - Symbole boursier
   * @returns {Promise<Object>}
   */
  async getComprehensiveValuation(ticker) {
    return this.requestMain(`/analysis/${ticker}/valuation`);
  }

  /**
   * Prédiction d'earnings
   * @param {string} ticker - Symbole boursier
   * @param {string} earningsDate - Date des earnings (optionnel, format YYYY-MM-DD)
   * @returns {Promise<Object>}
   */
  async getEarningsPrediction(ticker, earningsDate = null) {
    const params = earningsDate ? `?earningsDate=${earningsDate}` : '';
    return this.requestMain(`/analysis/${ticker}/earnings-prediction${params}`);
  }

  /**
   * Analyse de risque
   * @param {string} ticker - Symbole boursier
   * @returns {Promise<Object>}
   */
  async getRiskAnalysis(ticker) {
    return this.requestMain(`/analysis/${ticker}/risk`);
  }

  /**
   * Analyse de secteur
   * @param {string} sector - Nom du secteur
   * @returns {Promise<Object>}
   */
  async getSectorAnalysis(sector) {
    return this.requestMain(`/analysis/sector/${encodeURIComponent(sector)}`);
  }

  /**
   * Screening multi-critères
   * @param {Object} criteria - Critères de recherche
   * @returns {Promise<Object>}
   */
  async multiCriteriaScreener(criteria) {
    return this.requestMain('/screener/multi-criteria', {
      method: 'POST',
      body: JSON.stringify(criteria),
    });
  }

  // ==================== SCORING ====================

  /**
   * Score composite d'un ticker
   * @param {string} ticker - Symbole boursier
   * @returns {Promise<Object>}
   */
  async getTickerScore(ticker) {
    return this.requestMain(`/ticker-analysis/${ticker}/score`);
  }

  /**
   * Breakdown détaillé du score
   * @param {string} ticker - Symbole boursier
   * @returns {Promise<Object>}
   */
  async getTickerBreakdown(ticker) {
    return this.requestMain(`/ticker-analysis/${ticker}/breakdown`);
  }

  /**
   * Détection de gamma squeeze
   * @param {string} ticker - Symbole boursier
   * @returns {Promise<Object>}
   */
  async getGammaSqueezeAnalysis(ticker) {
    return this.requestMain(`/ticker-analysis/${ticker}/gamma-squeeze`);
  }

  // ==================== SURVEILLANCE ====================

  /**
   * Créer une surveillance
   * @param {Object} config - Configuration de surveillance
   * @returns {Promise<Object>}
   */
  async createSurveillance(config) {
    return this.requestMain('/surveillance/watch', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  /**
   * Liste des surveillances de l'utilisateur
   * @returns {Promise<Object>}
   */
  async getSurveillances() {
    return this.requestMain('/surveillance/watches');
  }

  /**
   * Récupérer les alertes d'une surveillance
   * @param {string} watchId - ID de la surveillance
   * @returns {Promise<Object>}
   */
  async getSurveillanceAlerts(watchId) {
    return this.requestMain(`/surveillance/watch/${watchId}/alerts`);
  }

  /**
   * Déclencher manuellement la vérification d'une surveillance
   * @param {string} watchId - ID de la surveillance
   * @returns {Promise<Object>}
   */
  async checkSurveillance(watchId) {
    return this.requestMain(`/surveillance/watch/${watchId}/check`, {
      method: 'POST',
    });
  }

  /**
   * Supprimer une surveillance
   * @param {string} watchId - ID de la surveillance
   * @returns {Promise<Object>}
   */
  async deleteSurveillance(watchId) {
    return this.requestMain(`/surveillance/watch/${watchId}`, {
      method: 'DELETE',
    });
  }

  // ==================== ALERTES MULTI-SIGNAUX ====================

  /**
   * Créer une alerte multi-signaux
   * @param {Object} alertConfig - Configuration de l'alerte
   * @returns {Promise<Object>}
   */
  async createAlert(alertConfig) {
    return this.requestMain('/alerts', {
      method: 'POST',
      body: JSON.stringify(alertConfig),
    });
  }

  /**
   * Liste des alertes de l'utilisateur
   * @returns {Promise<Object>}
   */
  async getAlerts() {
    return this.requestMain('/alerts');
  }

  /**
   * Récupérer une alerte par ID
   * @param {string} alertId - ID de l'alerte
   * @returns {Promise<Object>}
   */
  async getAlert(alertId) {
    return this.requestMain(`/alerts/${alertId}`);
  }

  /**
   * Mettre à jour une alerte
   * @param {string} alertId - ID de l'alerte
   * @param {Object} updates - Mises à jour
   * @returns {Promise<Object>}
   */
  async updateAlert(alertId, updates) {
    return this.requestMain(`/alerts/${alertId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Tester une alerte
   * @param {string} alertId - ID de l'alerte
   * @returns {Promise<Object>}
   */
  async testAlert(alertId) {
    return this.requestMain(`/alerts/${alertId}/test`, {
      method: 'POST',
    });
  }

  /**
   * Supprimer une alerte
   * @param {string} alertId - ID de l'alerte
   * @returns {Promise<Object>}
   */
  async deleteAlert(alertId) {
    return this.requestMain(`/alerts/${alertId}`, {
      method: 'DELETE',
    });
  }

  // ==================== SMART MONEY ====================

  /**
   * Top hedge funds par performance
   * @param {string} period - Période (1M, 3M, 6M, 1Y)
   * @returns {Promise<Object>}
   */
  async getTopHedgeFunds(period = '3M') {
    return this.requestMain(`/smart-money/top-hedge-funds?period=${period}`);
  }

  /**
   * Copy trades d'une institution pour un ticker
   * @param {string} institution - Nom ou CIK de l'institution
   * @param {string} ticker - Symbole boursier
   * @returns {Promise<Object>}
   */
  async getCopyTrades(institution, ticker) {
    return this.requestMain(`/smart-money/institution/${encodeURIComponent(institution)}/copy-trades/${ticker}`);
  }

  /**
   * Tracking d'une institution
   * @param {string} institutionName - Nom ou CIK de l'institution
   * @returns {Promise<Object>}
   */
  async getInstitutionTracking(institutionName) {
    return this.requestMain(`/institutions/${encodeURIComponent(institutionName)}/tracking`);
  }

  // ==================== MARKET ANALYSIS ====================

  /**
   * Sector rotation
   * @returns {Promise<Object>}
   */
  async getSectorRotation() {
    return this.requestMain('/market-analysis/sector-rotation');
  }

  /**
   * Market tide (sentiment global du marché)
   * @returns {Promise<Object>}
   */
  async getMarketTide() {
    return this.requestMain('/market-analysis/market-tide');
  }

  // ==================== 13F FILINGS ====================

  /**
   * Récupérer les derniers filings 13F (combiné FMP + UW)
   * @param {Object} params - Paramètres (from, to, limit)
   * @param {string} params.from - Date de début (YYYY-MM-DD, optionnel)
   * @param {string} params.to - Date de fin (YYYY-MM-DD, optionnel)
   * @param {number} params.limit - Nombre de résultats (défaut: 100, max: 500)
   * @returns {Promise<Object>} Réponse avec success, data, count, timestamp, sources
   */
  async getLatest13FFilings(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const query = queryParams.toString();
    return this.requestMain(`/13f-filings/latest${query ? `?${query}` : ''}`);
  }

  // ==================== TICKER ACTIVITY ====================

  /**
   * Récupérer les flows d'options pour un ticker
   * @param {string} ticker - Symbole boursier
   * @param {Object} params - Paramètres de filtrage
   * @param {number} params.limit - Nombre de résultats (défaut: 100, max: 200)
   * @param {number} params.min_premium - Premium minimum
   * @param {number} params.max_premium - Premium maximum
   * @param {boolean} params.is_call - Filtrer les CALLs
   * @param {boolean} params.is_put - Filtrer les PUTs
   * @param {boolean} params.is_sweep - Filtrer les sweeps
   * @param {boolean} params.is_floor - Filtrer les floor trades
   * @param {boolean} params.is_otm - Filtrer les OTM
   * @param {number} params.min_size - Taille minimum
   * @param {number} params.max_size - Taille maximum
   * @param {number} params.min_dte - Days to Expiry minimum
   * @param {number} params.max_dte - Days to Expiry maximum
   * @param {number} params.min_volume - Volume minimum
   * @param {number} params.max_volume - Volume maximum
   * @returns {Promise<Object>} Réponse avec success, data, count, timestamp
   */
  async getTickerOptionsFlow(ticker, params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key].toString());
      }
    });
    
    const query = queryParams.toString();
    return this.requestMain(`/ticker-activity/${encodeURIComponent(ticker)}/options${query ? `?${query}` : ''}`);
  }

  // ==================== AI ANALYSIS (LLM ENRICHIES) ====================

  /**
   * Analyse LLM enrichie du Options Flow pour un ticker
   * @param {string} ticker - Symbole boursier (ex: "NVDA")
   * @returns {Promise<Object>} Réponse avec success, ticker, signal_type, metrics, analysis, cached, timestamp
   */
  async getOptionsFlowAnalysis(ticker) {
    return this.requestMain(`/ai/options-flow-analysis`, {
      method: 'POST',
      body: JSON.stringify({ ticker }),
    });
  }

  /**
   * Analyse LLM enrichie des mouvements institutionnels
   * @param {string} institution_cik - CIK de l'institution (ex: "0001364742")
   * @param {string} institution_name - Nom de l'institution (ex: "BLACKROCK, INC.")
   * @param {string} period - Période d'analyse ("1M" | "3M" | "6M" | "1Y", défaut: "3M")
   * @returns {Promise<Object>} Réponse avec success, institution_cik, institution_name, analysis, period, cached, timestamp
   */
  async getInstitutionMovesAnalysis(institution_cik, institution_name, period = "3M") {
    return this.requestMain(`/ai/institution-moves-analysis`, {
      method: 'POST',
      body: JSON.stringify({ 
        institution_cik,
        institution_name,
        period 
      }),
    });
  }

  /**
   * Analyse LLM de l'activité complète d'un ticker
   * @param {string} ticker - Symbole boursier (ex: "NVDA")
   * @returns {Promise<Object>} Réponse avec success, ticker, analysis, cached, timestamp
   */
  async getTickerActivityAnalysis(ticker) {
    return this.requestMain(`/ai/ticker-activity-analysis`, {
      method: 'POST',
      body: JSON.stringify({ ticker }),
    });
  }

  /**
   * Analyse LLM enrichie des options pour un ticker (nouvelle route)
   * @param {string} ticker - Symbole boursier (ex: "NVDA")
   * @returns {Promise<Object>} Réponse avec success, ticker, signal_type, metrics, analysis, cached, timestamp
   */
  async getTickerOptionsAnalysis(ticker) {
    return this.requestMain(`/ai/ticker-options-analysis`, {
      method: 'POST',
      body: JSON.stringify({ ticker }),
    });
  }

  /**
   * Analyse LLM enrichie de l'activité institutionnelle pour un ticker
   * @param {string} ticker - Symbole boursier (ex: "TSLA")
   * @returns {Promise<Object>} Réponse avec success, ticker, analysis, cached, timestamp
   */
  async getTickerInstitutionalAnalysis(ticker) {
    return this.requestMain(`/ai/ticker-institutional-analysis`, {
      method: 'POST',
      body: JSON.stringify({ ticker }),
    });
  }

  /**
   * Analyse LLM enrichie des nouvelles et événements pour un ticker
   * @param {string} ticker - Symbole boursier (ex: "NVDA")
   * @returns {Promise<Object>} Réponse avec success, ticker, analysis, cached, timestamp
   */
  async getTickerNewsEventsAnalysis(ticker) {
    return this.requestMain(`/ai/ticker-news-events-analysis`, {
      method: 'POST',
      body: JSON.stringify({ ticker }),
    });
  }
}

export const intelligenceClient = new IntelligenceClient();
export default intelligenceClient;

