/**
 * Utilitaires pour l'historique des scores et analyses
 */

const HISTORY_KEY = "intelligence_history";
const MAX_HISTORY_ITEMS = 100; // Limiter l'historique à 100 entrées

/**
 * Récupérer l'historique
 */
export function getHistory() {
  if (typeof window === "undefined") return [];
  
  try {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error("Error reading history:", error);
    return [];
  }
}

/**
 * Ajouter une entrée à l'historique
 */
export function addToHistory(ticker, type, data) {
  if (!ticker || !type || !data) return false;
  
  try {
    const history = getHistory();
    const entry = {
      ticker: ticker.toUpperCase(),
      type, // 'score', 'analysis', 'valuation', etc.
      data,
      timestamp: new Date().toISOString(),
    };
    
    // Ajouter au début
    history.unshift(entry);
    
    // Limiter la taille
    if (history.length > MAX_HISTORY_ITEMS) {
      history.splice(MAX_HISTORY_ITEMS);
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error("Error adding to history:", error);
    return false;
  }
}

/**
 * Récupérer l'historique d'un ticker spécifique
 */
export function getTickerHistory(ticker, type = null) {
  const history = getHistory();
  const upperTicker = ticker.toUpperCase();
  
  let filtered = history.filter((entry) => entry.ticker === upperTicker);
  
  if (type) {
    filtered = filtered.filter((entry) => entry.type === type);
  }
  
  return filtered;
}

/**
 * Récupérer l'historique d'un type spécifique
 */
export function getHistoryByType(type) {
  const history = getHistory();
  return history.filter((entry) => entry.type === type);
}

/**
 * Supprimer une entrée de l'historique
 */
export function removeFromHistory(timestamp) {
  try {
    const history = getHistory();
    const filtered = history.filter((entry) => entry.timestamp !== timestamp);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error removing from history:", error);
    return false;
  }
}

/**
 * Vider l'historique
 */
export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
    return true;
  } catch (error) {
    console.error("Error clearing history:", error);
    return false;
  }
}

/**
 * Récupérer l'évolution d'un score dans le temps
 */
export function getScoreEvolution(ticker) {
  const history = getTickerHistory(ticker, "score");
  
  return history.map((entry) => ({
    date: entry.timestamp,
    overall: entry.data?.overall || 0,
    breakdown: entry.data?.breakdown || {},
  }));
}



