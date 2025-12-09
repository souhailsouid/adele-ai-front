/**
 * Utilitaires pour la gestion des favoris (tickers)
 */

const FAVORITES_KEY = "intelligence_favorites";

/**
 * Récupérer tous les favoris
 */
export function getFavorites() {
  if (typeof window === "undefined") return [];
  
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error("Error reading favorites:", error);
    return [];
  }
}

/**
 * Ajouter un ticker aux favoris
 */
export function addFavorite(ticker) {
  if (!ticker) return false;
  
  try {
    const favorites = getFavorites();
    const upperTicker = ticker.toUpperCase();
    
    if (!favorites.includes(upperTicker)) {
      favorites.push(upperTicker);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error adding favorite:", error);
    return false;
  }
}

/**
 * Retirer un ticker des favoris
 */
export function removeFavorite(ticker) {
  if (!ticker) return false;
  
  try {
    const favorites = getFavorites();
    const upperTicker = ticker.toUpperCase();
    const filtered = favorites.filter((fav) => fav !== upperTicker);
    
    if (filtered.length !== favorites.length) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error removing favorite:", error);
    return false;
  }
}

/**
 * Vérifier si un ticker est dans les favoris
 */
export function isFavorite(ticker) {
  if (!ticker) return false;
  
  const favorites = getFavorites();
  return favorites.includes(ticker.toUpperCase());
}

/**
 * Toggle favori (ajouter si absent, retirer si présent)
 */
export function toggleFavorite(ticker) {
  if (isFavorite(ticker)) {
    return removeFavorite(ticker);
  } else {
    return addFavorite(ticker);
  }
}

/**
 * Vider tous les favoris
 */
export function clearFavorites() {
  try {
    localStorage.removeItem(FAVORITES_KEY);
    return true;
  } catch (error) {
    console.error("Error clearing favorites:", error);
    return false;
  }
}



