/**
 * Utilitaires de formatage pour l'application
 * Fonctions réutilisables pour formater les données (devises, dates, volumes, etc.)
 * 
 * Ce fichier centralise toutes les fonctions de formatage utilisées dans l'application.
 * Pour les fonctions spécifiques aux composants trading, voir aussi:
 * - pagesComponents/dashboards/trading/components/utils.js
 */

/**
 * Formate une valeur monétaire avec unités (K, M, B)
 * @param {number|string|null|undefined} value - Valeur à formater
 * @returns {string} Valeur formatée (ex: "$1.23B", "$500K", "$0")
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return "$0";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "$0";
  if (num === 0) return "$0";
  
  if (Math.abs(num) >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (Math.abs(num) >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(num) >= 1_000) {
    return `$${(num / 1_000).toFixed(2)}K`;
  }
  return `$${num.toFixed(2)}`;
};

/**
 * Formate une valeur monétaire avec Intl.NumberFormat (plus précis)
 * @param {number|string|null|undefined} value - Valeur à formater
 * @param {string} locale - Locale (défaut: "en-US")
 * @param {number} minDecimals - Nombre minimum de décimales (défaut: 2)
 * @param {number} maxDecimals - Nombre maximum de décimales (défaut: 2)
 * @returns {string} Valeur formatée
 */
export const formatCurrencyIntl = (value, locale = "en-US", minDecimals = 2, maxDecimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return "$0.00";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  }).format(value);
};

/**
 * Formate le volume (nombre d'actions) avec unités (K, M)
 * @param {number|string|null|undefined} value - Valeur à formater
 * @param {string} locale - Locale pour le formatage (défaut: "fr-FR")
 * @returns {string} Valeur formatée (ex: "1.5M", "2.5K", "1,234")
 */
export const formatVolume = (value, locale = "fr-FR") => {
  if (value === null || value === undefined) return "N/A";
  if (value === 0) return "0";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "N/A";
  
  if (Math.abs(num) >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(num) >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`;
  }
  return num.toLocaleString(locale);
};

/**
 * Formate une date avec heure
 * @param {string|Date|null|undefined} dateString - Date à formater
 * @param {string} locale - Locale (défaut: "fr-FR")
 * @param {boolean} includeTime - Inclure l'heure (défaut: true)
 * @returns {string} Date formatée (ex: "25/12/2024, 14:30")
 */
export const formatDate = (dateString, locale = "fr-FR", includeTime = true) => {
  if (!dateString) return "N/A";
  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    
    if (includeTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
    }
    
    return date.toLocaleString(locale, options);
  } catch {
    return "N/A";
  }
};

/**
 * Formate une date sans heure
 * @param {string|Date|null|undefined} dateString - Date à formater
 * @param {string} locale - Locale (défaut: "fr-FR")
 * @returns {string} Date formatée (ex: "25/12/2024")
 */
export const formatDateOnly = (dateString, locale = "fr-FR") => {
  return formatDate(dateString, locale, false);
};

/**
 * Formate une date avec jour de la semaine
 * @param {string|Date|null|undefined} dateString - Date à formater
 * @param {string} locale - Locale (défaut: "fr-FR")
 * @returns {string} Date formatée (ex: "lun. 25 déc. 2024")
 */
export const formatDateWithWeekday = (dateString, locale = "fr-FR") => {
  if (!dateString) return "N/A";
  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    
    return date.toLocaleDateString(locale, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
};

/**
 * Formate un nombre avec séparateurs de milliers
 * @param {number|string|null|undefined} value - Valeur à formater
 * @param {string} locale - Locale (défaut: "fr-FR")
 * @param {number} decimals - Nombre de décimales (défaut: 0)
 * @returns {string} Nombre formaté (ex: "1,234,567")
 */
export const formatNumber = (value, locale = "fr-FR", decimals = 0) => {
  if (value === null || value === undefined) return "N/A";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "N/A";
  
  return num.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Formate un pourcentage
 * @param {number|string|null|undefined} value - Valeur à formater (déjà en pourcentage)
 * @param {number} decimals - Nombre de décimales (défaut: 2)
 * @returns {string} Pourcentage formaté (ex: "15.50%")
 */
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined) return "N/A";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "N/A";
  
  return `${num.toFixed(decimals)}%`;
};

/**
 * Formate une valeur en pourcentage avec signe
 * @param {number|string|null|undefined} value - Valeur à formater
 * @param {number} decimals - Nombre de décimales (défaut: 2)
 * @returns {string} Pourcentage formaté avec signe (ex: "+15.50%", "-5.20%")
 */
export const formatPercentageWithSign = (value, decimals = 2) => {
  if (value === null || value === undefined) return "N/A";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "N/A";
  
  const sign = num >= 0 ? "+" : "";
  return `${sign}${num.toFixed(decimals)}%`;
};

