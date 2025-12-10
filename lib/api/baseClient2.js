/**
 * Client API de base réutilisable
 * 
 * Fournit la logique commune pour tous les clients API :
 * - Configuration de l'URL de base
 * - Authentification (ID TOKEN ou ACCESS TOKEN)
 * - Gestion des requêtes HTTP
 * - Gestion d'erreurs
 */

import { config } from "/lib/auth/config";
import authService from "/lib/auth/authService";

class BaseApiClient2 {
  constructor(tokenType = 'access') {
    // Utiliser l'URL de l'API Gateway depuis les variables d'environnement
    this.baseUrl = config.apiUrl2 || process.env.NEXT_PUBLIC_API_URL_2;
    this.tokenType = tokenType; // 'access' ou 'id'
    console.log(`[${this.constructor.name}] baseUrl:`, this.baseUrl);
    console.log(`[${this.constructor.name}] config.apiUrl2:`, config.apiUrl2);
    console.log(`[${this.constructor.name}] process.env.NEXT_PUBLIC_API_URL_2:`, process.env.NEXT_PUBLIC_API_URL_2);
    if (!this.baseUrl) {
      console.error(`❌ NEXT_PUBLIC_API_URL_2 not configured. ${this.constructor.name} will not work.`);
      console.error(`❌ Please set NEXT_PUBLIC_API_URL_2 in your environment variables (Amplify Console > App settings > Environment variables)`);
    }
  }

  /**
   * Obtenir le token approprié selon le type
   * @returns {string|null} Token JWT
   */
  getToken() {
    return this.tokenType === 'access' 
      ? authService.getAccessToken()
      : authService.getIdToken();
  }

  /**
   * Faire une requête authentifiée vers le backend
   * @param {string} endpoint - Endpoint relatif (ex: "/fmp/quote/AAPL")
   * @param {RequestInit} options - Options de requête fetch
   * @returns {Promise<any>} Données JSON
   */
  async request(endpoint, options = {}) {
    if (!this.baseUrl) {
      throw new Error("API URL not configured. Please set NEXT_PUBLIC_API_URL in .env.local");
    }

    const token = this.getToken();
    
    if (!token) {
      const tokenTypeName = this.tokenType === 'access' ? 'ACCESS' : 'ID';
      console.error(`[${this.constructor.name}] No ${tokenTypeName} token found. User must be authenticated.`);
      throw new Error("Not authenticated. Please sign in first.");
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

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
      console.error(`[${this.constructor.name}] Request failed: ${endpoint}`, error);
      throw error;
    }
  }
}

export default BaseApiClient2;



