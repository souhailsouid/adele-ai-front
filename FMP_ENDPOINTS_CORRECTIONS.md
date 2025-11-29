# 🔧 Corrections des Endpoints FMP

## ✅ Endpoints Corrigés selon la Documentation Officielle

### 1. **Ratios Financiers** ✅
**Avant:** `/ratios/${symbol}`
**Après:** `/ratios?symbol={symbol}&period={period}&limit={limit}`
- ✅ Corrigé pour utiliser les paramètres de requête au lieu du path

### 2. **Market News** ✅
**Avant:** `/stock_news`
**Après:** 
- Avec symbole: `/news/stock?symbols={symbol}&page={page}&limit={limit}`
- Sans symbole: `/news/stock-latest?page={page}&limit={limit}`
- ✅ Utilise maintenant les endpoints officiels selon la documentation

### 3. **Insider Trades** ✅
**Avant:** `/insider-trading?symbol={symbol}`
**Après:**
- Avec symbole: `/insider-trading/search?symbol={symbol}&page={page}&limit={limit}`
- Sans symbole: `/insider-trading/latest?page={page}&limit={limit}`
- ✅ Utilise les endpoints corrects selon la documentation

### 4. **Earnings Transcript** ✅
**Avant:** `/earnings_transcript?symbol={symbol}&quarter={quarter}&year={year}`
**Après:** `/earning-call-transcript?symbol={symbol}&year={year}&quarter={quarter}`
- ✅ Nom d'endpoint corrigé et ordre des paramètres ajusté (year avant quarter)
- ✅ Quarter est maintenant un nombre (1-4) au lieu d'une string ("Q1")

### 5. **SEC Filings** ✅
**Avant:** `/sec_filings?symbol={symbol}`
**Après:**
- Avec type: `/sec-filings-search/form-type?formType={type}&from={from}&to={to}&page={page}&limit={limit}`
- Sans type: `/sec-filings-search/symbol?symbol={symbol}&from={from}&to={to}&page={page}&limit={limit}`
- ✅ Utilise les endpoints de recherche officiels

### 6. **Senate Trading** ✅
**Avant:** `/senate-trading?symbol={symbol}`
**Après:**
- Avec symbole: `/senate-trades?symbol={symbol}`
- Sans symbole: `/senate-latest?page={page}&limit={limit}`
- ✅ Utilise les endpoints corrects selon la documentation

### 7. **ESG Score** ✅
**Avant:** `/esg-score?symbol={symbol}`
**Après:** `/esg-ratings?symbol={symbol}`
- ✅ Nom d'endpoint corrigé

### 8. **Earnings Surprises** ✅
**Avant:** `/earnings-surprises-bulk/${symbol}`
**Après:** `/earnings-surprises?symbol={symbol}`
- ✅ Utilise l'endpoint avec paramètres de requête

### 9. **Earnings Estimates** ✅
**Avant:** `/earnings_calendar?symbol={symbol}`
**Après:** `/earnings?symbol={symbol}`
- ✅ Utilise l'endpoint Earnings Report

### 10. **Technical Indicators** ✅
**RSI:**
- ✅ `/technical-indicators/rsi?symbol={symbol}&periodLength={period}&timeframe={timeframe}`

**MACD:**
- ✅ `/technical-indicators/macd?symbol={symbol}&timeframe={timeframe}`

**SMA:**
- ✅ `/technical-indicators/sma?symbol={symbol}&periodLength={period}&timeframe={timeframe}`

**EMA (Nouveau):**
- ✅ `/technical-indicators/ema?symbol={symbol}&periodLength={period}&timeframe={timeframe}`

---

## 📋 Endpoints Déjà Corrects

Ces endpoints étaient déjà conformes à la documentation :

- ✅ `/profile?symbol={symbol}` - Company Profile
- ✅ `/quote?symbol={symbol}` - Stock Quote
- ✅ `/income-statement?symbol={symbol}&period={period}&limit={limit}` - Income Statement
- ✅ `/balance-sheet-statement?symbol={symbol}&period={period}&limit={limit}` - Balance Sheet
- ✅ `/cash-flow-statement?symbol={symbol}&period={period}&limit={limit}` - Cash Flow
- ✅ `/key-metrics?symbol={symbol}&period={period}&limit={limit}` - Key Metrics
- ✅ `/analyst-estimates?symbol={symbol}&period={period}&page={page}&limit={limit}` - Analyst Estimates
- ✅ `/discounted-cash-flow?symbol={symbol}` - DCF Valuation
- ✅ `/historical-price-eod/full?symbol={symbol}&from={from}&to={to}` - Historical Data
- ✅ `/earnings-calendar?from={from}&to={to}` - Earnings Calendar
- ✅ `/economic-calendar?from={from}&to={to}` - Economic Calendar
- ✅ `/search-name?query={query}` - Company Search
- ✅ `/etf-list` - ETF List
- ✅ `/sp500-constituent` - S&P 500 Constituents
- ✅ `/stock-list?exchange={exchange}` - Stock List

---

## 🔄 Changements de Signature de Fonctions

### `getEarningsTranscript(symbol, year, quarter)`
**Avant:** `getEarningsTranscript(symbol, quarter, year)`
**Après:** `getEarningsTranscript(symbol, year, quarter)`
- L'ordre des paramètres a été inversé pour correspondre à la documentation
- `quarter` est maintenant un nombre (1-4) au lieu d'une string ("Q1", "Q2", etc.)

### `getInsiderTrades(symbol, limit, page)`
**Avant:** `getInsiderTrades(symbol, limit)`
**Après:** `getInsiderTrades(symbol, limit, page)`
- Ajout du paramètre `page` pour la pagination

### `getSECFilings(symbol, type, from, to, page, limit)`
**Avant:** `getSECFilings(symbol, type, page)`
**Après:** `getSECFilings(symbol, type, from, to, page, limit)`
- Ajout des paramètres `from`, `to`, et `limit` pour plus de flexibilité

### `getMarketNews(symbol, limit, page)`
**Avant:** `getMarketNews(symbol, limit)`
**Après:** `getMarketNews(symbol, limit, page)`
- Ajout du paramètre `page` pour la pagination

---

## ✅ Tous les Endpoints sont Maintenant Conformes

Tous les endpoints utilisés dans le client FMP sont maintenant conformes à la documentation officielle de Financial Modeling Prep.

