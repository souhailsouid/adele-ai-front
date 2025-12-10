/**
 * Liste étendue de symboles boursiers populaires
 * Utilisée pour l'autocomplete sans consommer l'API
 */

// Liste des symboles populaires avec leurs noms de compagnies
export const POPULAR_STOCKS = [
  // Tech
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "GOOG", name: "Alphabet Inc. (Class A)" },
  { symbol: "AMZN", name: "Amazon.com, Inc." },
  { symbol: "META", name: "Meta Platforms, Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "TSLA", name: "Tesla, Inc." },
  { symbol: "NFLX", name: "Netflix, Inc." },
  { symbol: "AMD", name: "Advanced Micro Devices, Inc." },
  { symbol: "INTC", name: "Intel Corporation" },
  { symbol: "ORCL", name: "Oracle Corporation" },
  { symbol: "CRM", name: "Salesforce, Inc." },
  { symbol: "ADBE", name: "Adobe Inc." },
  { symbol: "CSCO", name: "Cisco Systems, Inc." },
  { symbol: "IBM", name: "International Business Machines Corporation" },
  { symbol: "DELL", name: "Dell Technologies, Inc." },
  { symbol: "HPQ", name: "HP Inc." },
  { symbol: "ROKU", name: "Roku, Inc." },
  { symbol: "SNOW", name: "Snowflake Inc." },
  { symbol: "PLTR", name: "Palantir Technologies Inc." },
  { symbol: "HOOD", name: "Robinhood Markets, Inc." },
  { symbol: "SOFI", name: "SoFi Technologies, Inc." },
  { symbol: "MARA", name: "Marathon Digital Holdings, Inc." },
  { symbol: "COIN", name: "Coinbase Global, Inc." },
  { symbol: "BABA", name: "Alibaba Group Holding Limited" },
  
  // Finance
  { symbol: "JPM", name: "JPMorgan Chase & Co." },
  { symbol: "BAC", name: "Bank of America Corp." },
  { symbol: "WFC", name: "Wells Fargo & Company" },
  { symbol: "GS", name: "The Goldman Sachs Group, Inc." },
  { symbol: "MS", name: "Morgan Stanley" },
  { symbol: "C", name: "Citigroup Inc." },
  { symbol: "V", name: "Visa Inc." },
  { symbol: "MA", name: "Mastercard Incorporated" },
  { symbol: "PYPL", name: "PayPal Holdings, Inc." },
  { symbol: "SQ", name: "Block, Inc." },
  
  // Healthcare
  { symbol: "UNH", name: "UnitedHealth Group Incorporated" },
  { symbol: "JNJ", name: "Johnson & Johnson" },
  { symbol: "PFE", name: "Pfizer Inc." },
  { symbol: "ABBV", name: "AbbVie Inc." },
  { symbol: "TMO", name: "Thermo Fisher Scientific Inc." },
  { symbol: "ABT", name: "Abbott Laboratories" },
  { symbol: "DHR", name: "Danaher Corporation" },
  { symbol: "BMY", name: "Bristol-Myers Squibb Company" },
  { symbol: "AMGN", name: "Amgen Inc." },
  { symbol: "GILD", name: "Gilead Sciences, Inc." },
  { symbol: "SMLR", name: "Semler Scientific, Inc." },
  { symbol: "MRCY", name: "Mercury Systems Inc" },
  { symbol: "NTIC", name: "Northern Technologies International" },
  
  // Consumer
  { symbol: "WMT", name: "Walmart Inc." },
  { symbol: "TGT", name: "Target Corporation" },
  { symbol: "HD", name: "The Home Depot, Inc." },
  { symbol: "MCD", name: "McDonald's Corporation" },
  { symbol: "SBUX", name: "Starbucks Corporation" },
  { symbol: "NKE", name: "Nike, Inc." },
  { symbol: "DIS", name: "The Walt Disney Company" },
  
  // Energy
  { symbol: "XOM", name: "Exxon Mobil Corporation" },
  { symbol: "CVX", name: "Chevron Corporation" },
  { symbol: "COP", name: "ConocoPhillips" },
  { symbol: "SLB", name: "Schlumberger Limited" },
  
  // Industrials
  { symbol: "BA", name: "The Boeing Company" },
  { symbol: "CAT", name: "Caterpillar Inc." },
  { symbol: "GE", name: "General Electric Company" },
  { symbol: "HON", name: "Honeywell International Inc." },
  { symbol: "RTX", name: "Raytheon Technologies Corporation" },
  
  // Communication
  { symbol: "T", name: "AT&T Inc." },
  { symbol: "VZ", name: "Verizon Communications Inc." },
  { symbol: "CMCSA", name: "Comcast Corporation" },
  
  // Utilities
  { symbol: "NEE", name: "NextEra Energy, Inc." },
  { symbol: "DUK", name: "Duke Energy Corporation" },
  
  // Real Estate
  { symbol: "AMT", name: "American Tower Corporation" },
  { symbol: "PLD", name: "Prologis, Inc." },
  
  // Materials
  { symbol: "LIN", name: "Linde plc" },
  { symbol: "APD", name: "Air Products and Chemicals, Inc." },
  
  // Indices & ETFs
  { symbol: "SPY", name: "SPDR S&P 500 ETF Trust" },
  { symbol: "QQQ", name: "Invesco QQQ Trust" },
  { symbol: "DIA", name: "SPDR Dow Jones Industrial Average ETF" },
  { symbol: "IWM", name: "iShares Russell 2000 ETF" },
  { symbol: "VTI", name: "Vanguard Total Stock Market ETF" },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF" },
  
  // International
  { symbol: "NSRGY", name: "Nestlé S.A." },
  { symbol: "ASML", name: "ASML Holding N.V." },
  { symbol: "TSM", name: "Taiwan Semiconductor Manufacturing Company Limited" },
  { symbol: "TCEHY", name: "Tencent Holdings Limited" },
  { symbol: "AVGO", name: "Broadcom Inc." },
];

/**
 * Rechercher des symboles par nom ou symbole
 */
export function searchStocks(query) {
  if (!query || query.trim() === "") {
    return POPULAR_STOCKS.slice(0, 50); // Limiter les résultats par défaut
  }

  const searchTerm = query.toLowerCase().trim();
  
  return POPULAR_STOCKS.filter((stock) => {
    const symbolMatch = stock.symbol.toLowerCase().includes(searchTerm);
    const nameMatch = stock.name.toLowerCase().includes(searchTerm);
    return symbolMatch || nameMatch;
  }).slice(0, 20); // Limiter à 20 résultats
}

/**
 * Obtenir un stock par symbole
 */
export function getStockBySymbol(symbol) {
  return POPULAR_STOCKS.find(
    (stock) => stock.symbol.toUpperCase() === symbol.toUpperCase()
  );
}

/**
 * Obtenir tous les symboles
 */
export function getAllSymbols() {
  return POPULAR_STOCKS.map((stock) => stock.symbol);
}

