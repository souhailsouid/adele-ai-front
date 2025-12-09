/**
 * Client API pour communiquer avec le backend
 * Utilise ID TOKEN pour les APIs 13F/organizations
 */

import BaseApiClient from "./baseClient";

class ApiClient extends BaseApiClient {
  constructor() {
    super('id'); // Utilise ID TOKEN pour APIs 13F/organizations
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

