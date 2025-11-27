/**
 * Watchlist par défaut - Liste des compagnies à surveiller
 * Mapping nom de compagnie -> symbole boursier
 */

export const DEFAULT_WATCHLIST = [
  { name: "Snowflake Inc.", symbol: "SNOW" },
  { name: "Palantir Technologies Inc.", symbol: "PLTR" },
  { name: "NVIDIA Corporation", symbol: "NVDA" },
  { name: "Robinhood Markets, Inc.", symbol: "HOOD" },
  { name: "CoreWeave, Inc.", symbol: null }, // Privée, pas de symbole
  { name: "Alphabet Inc.", symbol: "GOOGL" },
  { name: "Circle Internet Group, Inc.", symbol: null }, // Privée
  { name: "Oracle Corporation", symbol: "ORCL" },
  { name: "Semler Scientific, Inc.", symbol: "SMLR" },
  { name: "Microsoft Corporation", symbol: "MSFT" },
  { name: "Meta Platforms, Inc.", symbol: "META" },
  { name: "Northern Technologies International", symbol: "NTIC" },
  { name: "Amazon.com, Inc.", symbol: "AMZN" },
  { name: "Apple Inc.", symbol: "AAPL" },
  { name: "Dell Technologies, Inc.", symbol: "DELL" },
  { name: "Nestlé S.A.", symbol: "NSRGY" },
  { name: "UnitedHealth Group Incorporated", symbol: "UNH" },
  { name: "SoFi Technologies, Inc.", symbol: "SOFI" },
  { name: "Mercury Systems Inc", symbol: "MRCY" },
  { name: "Roku, Inc.", symbol: "ROKU" },
  { name: "Alibaba Group Holding Limited", symbol: "BABA" },
];

/**
 * Obtenir uniquement les symboles disponibles (filtre les compagnies privées)
 */
export function getWatchlistSymbols() {
  return DEFAULT_WATCHLIST
    .filter((company) => company.symbol !== null)
    .map((company) => company.symbol);
}

/**
 * Obtenir le symbole d'une compagnie par son nom
 */
export function getSymbolByName(companyName) {
  const company = DEFAULT_WATCHLIST.find(
    (c) => c.name.toLowerCase() === companyName.toLowerCase()
  );
  return company?.symbol || null;
}

/**
 * Obtenir le nom d'une compagnie par son symbole
 */
export function getNameBySymbol(symbol) {
  const company = DEFAULT_WATCHLIST.find(
    (c) => c.symbol?.toUpperCase() === symbol.toUpperCase()
  );
  return company?.name || null;
}

/**
 * Vérifier si un symbole est dans la watchlist
 */
export function isInWatchlist(symbol) {
  return DEFAULT_WATCHLIST.some(
    (c) => c.symbol?.toUpperCase() === symbol.toUpperCase()
  );
}

