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
 * Formate une valeur monétaire avec unités (K, M, B)
 * @param {number|null|undefined} value - Valeur à formater
 * @returns {string} Valeur formatée (ex: "$1.23B", "$500K", "$0")
 */
export const formatCurrency = (value) => {
    if (value === null || value === undefined) return "N/A";
    if (value === 0) return "$0";
    if (Math.abs(value) >= 1_000_000_000) {
        return `$${(value / 1_000_000_000).toFixed(2)}B`;
    }
    if (Math.abs(value) >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    if (Math.abs(value) >= 1_000) {
        return `$${(value / 1_000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
};

/**
 * Formate une valeur en pourcentage
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

/**
 * Formate une valeur en pourcentage (alias pour compatibilité avec formatPercentage existant)
 * @param {number|null|undefined} value - Valeur à formater
 * @returns {string} Valeur formatée (ex: "15.50%")
 */
export const formatPercentage = (value) => {
    return formatPercent(value);
};