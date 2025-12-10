/**
* Client API pour FMP et Unusual Whales
* 
* Remplace les clients FMP et Unusual Whales qui exposaient les clés API côté client.
* Toutes les requêtes passent maintenant par le backend sécurisé.
* 
* Utilise ACCESS TOKEN pour l'authentification.
*/

import BaseApiClient2 from "./baseClient2";

class FMPUWClient2 extends BaseApiClient2 {
 constructor() {
   super('access'); // Utilise ACCESS TOKEN pour les APIs backend 2
 }

 


 /**
  * Obtenir les holdings d'une institution par CIK (13F)
  * @param {string} cik - CIK de l'institution (format: 0001364742 ou 1364742)
  * @param {Object} options - Options (date, start_date, end_date, limit, order, order_direction)
  * @returns {Promise<Array>} Holdings avec units, units_change, value, historical_units, etc.
  */
 async getUWInstitutionHoldingsByCIK(cik, options = {}) {
   // Normaliser le CIK (enlever les zéros en tête si nécessaire, mais garder le format avec zéros)
   const normalizedCIK = cik.startsWith('000') ? cik : `000${cik}`.slice(-10);
   const params = new URLSearchParams(options).toString();
   return this.request(`/unusual-whales/institution/${normalizedCIK}/holdings?${params}`);
 }

 /**
  * Obtenir l'activité de trading d'une institution par CIK (13F)
  * @param {string} cik - CIK de l'institution (format: 0001364742 ou 1364742)
  * @param {Object} options - Options (date, limit, etc.)
  * @returns {Promise<Array>} Transactions avec buy_price, sell_price, units_change, etc.
  */
 async getUWInstitutionActivityByCIK(cik, options = {}) {
   // Normaliser le CIK
   const normalizedCIK = cik.startsWith('000') ? cik : `000${cik}`.slice(-10);
   const params = new URLSearchParams(options).toString();
   return this.request(`/unusual-whales/institution/${normalizedCIK}/activity?${params}`);
 }

 /**
  * Obtenir la liste des institutions
  * @param {Object} options - Options (limit, order, order_direction, etc.)
  * @returns {Promise<Array>} Liste des institutions avec cik, name, total_value, etc.
  */
 async getUWInstitutions(options = {}) {
   const params = new URLSearchParams(options).toString();
   return this.request(`/unusual-whales/institutions?${params}`);
 }

 /**
  * Obtenir le top net impact (top tickers par net premium) - utile pour obtenir une liste de tickers populaires
  * @param {Object} options - Options (date, limit, etc.)
  * @returns {Promise<Array>} Liste des tickers avec ticker_symbol, net_premium, etc.
  */
 async getUWTopNetImpact(options = {}) {
   const params = new URLSearchParams(options).toString();
   return this.request(`/unusual-whales/market/top-net-impact?${params}`);
 }

 // Autres méthodes UW si nécessaire...
 // (getUWOptionChains, getUWShortData, getUWNews, getUWFDACalendar, etc.)
}

// Export singleton instance
const fmpUWClient2 = new FMPUWClient2();
export default fmpUWClient2;

