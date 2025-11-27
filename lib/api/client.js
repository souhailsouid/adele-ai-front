/**
 * Client API pour communiquer avec le backend
 */

import { config } from "/lib/auth/config";
import authService from "/lib/auth/authService";

class ApiClient {
  constructor() {
    this.baseUrl = config.apiUrl || process.env.NEXT_PUBLIC_API_URL;
  }

  /**
   * Faire une requête authentifiée
   */
  async request(endpoint, options = {}) {
    // API Gateway JWT authorizer nécessite l'ID token (contient l'audience/client ID)
    const token = authService.getIdToken();
    
    if (!token) {
      console.error("No ID token found. Current tokens:", authService.getTokens());
      throw new Error("Not authenticated. Please sign in first.");
    }

    const url = `${this.baseUrl}${endpoint}`;
    console.log("API Request:", {
      method: options.method || "GET",
      url,
      hasToken: !!token,
      tokenLength: token?.length
    });
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    console.log("API Response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { error: errorText || `HTTP ${response.status}` };
      }
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response Data:", data);
    return data;
  }

  /**
   * Créer une organisation (onboarding)
   */
  async createOrganization(data) {
    return this.request("/orgs", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Récupérer une organisation
   */
  async getOrganization(orgId) {
    return this.request(`/orgs/${orgId}`);
  }

  /**
   * Mettre à jour une organisation
   */
  async updateOrganization(orgId, data) {
    return this.request(`/orgs/${orgId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  /**
   * Rafraîchir l'enrichissement (coûteux - utilise OpenAI)
   */
  async refreshEnrichment(orgId, force = false) {
    return this.request(`/orgs/${orgId}/enrichment/refresh`, {
      method: "POST",
      body: JSON.stringify({ force }),
    });
  }

  /**
   * Mettre à jour le snapshot d'enrichissement manuellement (gratuit)
   */
  async updateEnrichmentSnapshot(orgId, snapshot) {
    return this.request(`/orgs/${orgId}`, {
      method: "PATCH",
      body: JSON.stringify({ enrichment_snapshot: snapshot }),
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;

