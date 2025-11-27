/**
 * Client API 13F Filings
 * Documentation: Backend API 13F Filings
 */

import authService from "/lib/auth/authService";

class Filings13FClient {
  constructor() {
    this.baseUrl = "https://tsdd1sibd1.execute-api.eu-west-3.amazonaws.com/prod";
  }

  /**
   * Obtenir le token JWT pour l'authentification
   */
  getAuthToken() {
    const token = authService.getIdToken();
    if (!token) {
      throw new Error("Not authenticated. Please sign in first.");
    }
    return token;
  }

  /**
   * Faire une requête authentifiée à l'API
   */
  async request(endpoint, options = {}) {
    const token = this.getAuthToken();

    const url = `${this.baseUrl}${endpoint}`;

    // Log pour le debugging
    console.log("13F Filings API Request:", {
      method: options.method || "GET",
      url,
      hasToken: !!token,
      tokenLength: token?.length,
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      console.log("13F Filings API Response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("13F Filings API Error Response:", errorText);
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { error: errorText || `HTTP ${response.status}` };
        }

        // Gestion spécifique des erreurs
        if (response.status === 401) {
          throw new Error("Non authentifié. Veuillez vous reconnecter.");
        } else if (response.status === 404) {
          throw new Error("Ressource non trouvée.");
        } else {
          throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log("13F Filings API Response Data:", data);
      return data;
    } catch (error) {
      // Gestion spécifique de "Failed to fetch"
      if (error.message === "Failed to fetch" || error.name === "TypeError") {
        console.error("Network error - vérifiez:");
        console.error("1. URL correcte:", this.baseUrl);
        console.error("2. CORS configuré pour votre origine");
        console.error("3. Token JWT valide");
        console.error("4. Connexion réseau active");
        throw new Error(
          "Erreur de connexion. Vérifiez votre connexion réseau et la configuration CORS."
        );
      }
      throw error;
    }
  }

  /**
   * Récupérer la liste des fonds
   * @returns {Promise<Array<Fund>>}
   */
  async getFunds() {
    return this.request("/funds");
  }

  /**
   * Récupérer les détails d'un fund
   * @param {number} id - ID du fund
   * @returns {Promise<Fund>}
   */
  async getFund(id) {
    return this.request(`/funds/${id}`);
  }

  /**
   * Récupérer les holdings d'un fund
   * @param {number} fundId - ID du fund
   * @param {number} limit - Nombre maximum de holdings (défaut: 100)
   * @returns {Promise<Array<Holding>>}
   */
  async getFundHoldings(fundId, limit = 100) {
    return this.request(`/funds/${fundId}/holdings?limit=${limit}`);
  }

  /**
   * Récupérer les filings 13F d'un fund
   * @param {number} fundId - ID du fund
   * @returns {Promise<Array<Filing>>}
   */
  async getFundFilings(fundId) {
    return this.request(`/funds/${fundId}/filings`);
  }

  /**
   * Créer un nouveau fund
   * @param {Object} input - Données du fund
   * @param {string} input.name - Nom du fund
   * @param {string} input.cik - CIK (10 chiffres avec zéros à gauche)
   * @param {number} [input.tier_influence] - Tier d'influence (défaut: 3)
   * @param {string} [input.category] - Catégorie (défaut: 'hedge_fund')
   * @returns {Promise<{fund: Fund, message: string}>}
   */
  async createFund(input) {
    return this.request("/funds", {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        cik: input.cik,
        tier_influence: input.tier_influence ?? 3,
        category: input.category ?? "hedge_fund",
      }),
    });
  }
}

// Export singleton
const filings13FClient = new Filings13FClient();
export default filings13FClient;

