/**
 * Client API pour le Ticker Activity Service (Backend)
 * 
 * Utilise l'API Gateway déployée par le backend
 * Utilise ACCESS TOKEN pour l'authentification
 */

import BaseApiClient from "./baseClient";

class TickerActivityClient extends BaseApiClient {
  constructor() {
    super('access'); // Utilise ACCESS TOKEN pour l'API backend
  }

  /**
   * Faire une requête authentifiée vers le backend
   * Override pour ajouter des logs détaillés
   */
  async request(endpoint, options = {}) {
    const token = this.getToken();
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };
    
    console.log(`[TickerActivityClient] ${options.method || "GET"} ${url}`, {
      hasToken: !!token,
      tokenLength: token?.length,
      tokenPreview: token ? `${token.substring(0, 20)}...` : "none",
      hasAuthHeader: !!headers.Authorization,
      authHeaderPreview: headers.Authorization ? `${headers.Authorization.substring(0, 30)}...` : "none",
    });

    try {
      // Log de la requête complète avant envoi
      console.log(`[TickerActivityClient] 📤 Sending request:`, {
        method: options.method || "GET",
        url,
        headers: {
          ...headers,
          Authorization: headers.Authorization ? `${headers.Authorization.substring(0, 30)}...` : "Missing",
        },
        body: options.body || "None",
      });

      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Log de la réponse (même en cas de succès partiel)
      console.log(`[TickerActivityClient] 📥 Response received:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Logs détaillés pour déboguer
        console.error(`[TickerActivityClient] ❌ Error ${response.status}:`, {
          status: response.status,
          statusText: response.statusText,
          url,
          method: options.method || "GET",
          errorText,
          headersSent: {
            Authorization: headers.Authorization ? "Present" : "Missing",
            ContentType: headers["Content-Type"],
          },
        });
        
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { error: errorText || `HTTP ${response.status}` };
        }
        
        // Message d'erreur plus explicite pour 401
        if (response.status === 401) {
          console.error("[TickerActivityClient] 🔐 401 Unauthorized - Vérifier:");
          console.error("1. Token présent:", !!token);
          console.error("2. Token length:", token?.length);
          console.error("3. URL appelée:", url);
          console.error("4. Headers envoyés:", Object.keys(headers));
          throw new Error("Non authentifié. Veuillez vous reconnecter. (Utilisez l'ACCESS TOKEN)");
        }
        
        // Message d'erreur détaillé pour 500
        if (response.status === 500) {
          console.error("[TickerActivityClient] 🔥 500 Internal Server Error - Problème backend:");
          console.error("1. URL appelée:", url);
          console.error("2. Méthode:", options.method || "GET");
          console.error("3. Body envoyé:", options.body || "None");
          console.error("4. Réponse backend:", errorText);
          console.error("5. Erreur parsée:", error);
          console.error("\n📋 Actions à faire:");
          console.error("- Vérifier les logs CloudWatch du backend");
          console.error("- Vérifier que l'endpoint existe: GET /ticker-activity/{ticker}/{type}");
          console.error("- Vérifier que le format de la requête est correct");
          console.error("- Vérifier les logs Lambda/API Gateway");
          
          // Essayer de parser l'erreur pour donner plus d'infos
          const errorMessage = error.error || error.message || errorText || "Erreur serveur inconnue";
          throw new Error(`Erreur serveur (500): ${errorMessage}. Vérifier les logs backend.`);
        }
        
        throw new Error(error.error || error.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Le backend retourne { success, data, cached, count?, timestamp }
      if (!data.success) {
        throw new Error(data.error || "API request failed");
      }

      return data;
    } catch (error) {
      console.error(`[TickerActivityClient] Error:`, error);
      throw error;
    }
  }

  /**
   * Récupérer le quote d'un ticker
   */
  async getQuote(ticker) {
    const response = await this.request(`/ticker-activity/${ticker.toUpperCase()}/quote`);
    return response.data; // { symbol, price, change, changePercent, volume, marketCap, timestamp }
  }

  /**
   * Récupérer l'ownership institutionnel
   */
  async getOwnership(ticker, options = {}) {
    const { limit = 100 } = options;
    const response = await this.request(
      `/ticker-activity/${ticker.toUpperCase()}/ownership?limit=${limit}`
    );
    return {
      data: response.data || [],
      cached: response.cached || false,
      count: response.count || 0,
    };
  }

  /**
   * Récupérer les transactions institutionnelles
   */
  async getActivity(ticker, options = {}) {
    const { limit = 100, forceRefresh = false } = options;
    const forceParam = forceRefresh ? "&force_refresh=true" : "";
    const response = await this.request(
      `/ticker-activity/${ticker.toUpperCase()}/activity?limit=${limit}${forceParam}`
    );
    return {
      data: response.data || [],
      cached: response.cached || false,
      count: response.count || 0,
    };
  }

  /**
   * Récupérer les hedge funds
   */
  async getHedgeFunds(ticker, options = {}) {
    const { limit = 100 } = options;
    const response = await this.request(
      `/ticker-activity/${ticker.toUpperCase()}/hedge-funds?limit=${limit}`
    );
    return {
      data: response.data || [],
      cached: response.cached || false,
      count: response.count || 0,
    };
  }

  /**
   * Récupérer les transactions insiders
   */
  async getInsiders(ticker, options = {}) {
    const { limit = 100 } = options;
    const response = await this.request(
      `/ticker-activity/${ticker.toUpperCase()}/insiders?limit=${limit}`
    );
    return {
      data: response.data || [],
      cached: response.cached || false,
      count: response.count || 0,
    };
  }

  /**
   * Récupérer les transactions du Congrès
   */
  async getCongress(ticker, options = {}) {
    const { limit = 100 } = options;
    const response = await this.request(
      `/ticker-activity/${ticker.toUpperCase()}/congress?limit=${limit}`
    );
    return {
      data: response.data || [],
      cached: response.cached || false,
      count: response.count || 0,
    };
  }

  /**
   * Récupérer le flow d'options
   */
  async getOptions(ticker, options = {}) {
    const { limit = 100, minPremium = 10000 } = options;
    const response = await this.request(
      `/ticker-activity/${ticker.toUpperCase()}/options?limit=${limit}&min_premium=${minPremium}`
    );
    return {
      data: response.data || [],
      cached: response.cached || false,
      count: response.count || 0,
    };
  }

  /**
   * Récupérer les dark pool trades
   */
  async getDarkPool(ticker, options = {}) {
    const { limit = 100 } = options;
    const response = await this.request(
      `/ticker-activity/${ticker.toUpperCase()}/dark-pool?limit=${limit}`
    );
    return {
      data: response.data || [],
      cached: response.cached || false,
      count: response.count || 0,
    };
  }

  /**
   * Récupérer les statistiques agrégées
   */
  async getStats(ticker) {
    const response = await this.request(`/ticker-activity/${ticker.toUpperCase()}/stats`);
    return response.data;
  }

  /**
   * Récupérer toutes les insights agrégées pour un ticker
   * Endpoint: GET /ticker-insights/{ticker}
   * 
   * Retourne toutes les informations qui pourraient influencer le cours:
   * - companyInfo, quote, optionsFlow, institutionalActivity, insiderActivity,
   *   darkPool, earnings, news, economicEvents, shortInterest, financialMetrics, etc.
   */
  async getInsights(ticker) {
    const response = await this.request(`/ticker-insights/${ticker.toUpperCase()}`);
    return {
      data: response.data || null,
      cached: response.cached || false,
      timestamp: response.timestamp || new Date().toISOString(),
    };
  }

  /**
   * Récupérer une activité spécifique par type (méthode générique)
   */
  async getActivityByType(ticker, type, options = {}) {
    const { limit = 100, forceRefresh = false } = options;
    
    // Mapper les types frontend vers les endpoints backend
    const typeMap = {
      quote: "quote",
      ownership: "ownership",
      activity: "activity",
      hedgeFunds: "hedge-funds",
      insiders: "insiders",
      congress: "congress",
      options: "options",
      darkPool: "dark-pool",
    };

    const endpointType = typeMap[type] || type;
    const forceParam = forceRefresh ? "&force_refresh=true" : "";
    
    const response = await this.request(
      `/ticker-activity/${ticker.toUpperCase()}/${endpointType}?limit=${limit}${forceParam}`
    );

    return {
      type,
      data: response.data || [],
      cached: response.cached || false,
      count: response.count || 0,
      timestamp: response.timestamp || new Date().toISOString(),
    };
  }
}

export const tickerActivityClient = new TickerActivityClient();
export default tickerActivityClient;

