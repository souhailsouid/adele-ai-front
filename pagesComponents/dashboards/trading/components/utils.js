/**
 * Utilitaires de formatage pour les composants Trading
 * 
 * Note: Pour les fonctions de formatage générales, voir /utils/formatting.js
 * Ce fichier contient des fonctions spécifiques aux composants trading
 */

// Ré-exporter les fonctions du fichier centralisé pour compatibilité
export {
  formatCurrency,
  formatVolume,
  formatDate,
  formatDateOnly,
  formatNumber,
  formatPercentage,
} from "/utils/formatting";

/**
 * Formate une date avec date et heure séparées
 * @param {string|Date|null|undefined} dateString - Date à formater
 * @returns {object} Objet avec date et time séparés
 */
export const formatDateTime = (dateString) => {
    if (!dateString) return { date: "N/A", time: "N/A" };
    try {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }),
            time: date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        };
    } catch {
        return { date: dateString, time: "N/A" };
    }
};

/**
 * Formate une valeur en pourcentage (alias pour compatibilité)
 * @param {number|null|undefined} value - Valeur à formater (déjà en pourcentage)
 * @returns {string} Valeur formatée (ex: "15.50%")
 */
export const formatPercent = (value) => {
    if (value === null || value === undefined) return "N/A";
    return `${value?.toFixed(2)}%`;
};

/**
 * Formate un ratio (nombre décimal)
 * @param {number|null|undefined} value - Valeur à formater
 * @returns {string} Valeur formatée (ex: "15.50")
 */
export const formatRatio = (value) => {
    if (value === null || value === undefined) return "N/A";
    return value.toFixed(2);
};