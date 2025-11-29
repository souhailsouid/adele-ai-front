# 📊 Guide des Endpoints FMP API Disponibles

## ✅ Rubriques Disponibles avec votre Plan Starter

Basé sur vos fonctionnalités (5 ans d'historique, US Coverage, Fundamentals, etc.), voici les rubriques que vous pouvez utiliser :

---

## 🔥 **Rubriques Déjà Implémentées** (dans `/lib/fmp/client.js`)

### 1. **Company Information** ✅
**Endpoint:** `/profile?symbol={symbol}&apikey={key}`
- ✅ Profil complet de l'entreprise
- ✅ Capitalisation boursière, secteur, PDG
- ✅ Prix actuel, volume
- **Utilisé dans:** `getCompanyProfile()`

### 2. **Quote** ✅ HOT
**Endpoint:** `/quote?symbol={symbol}&apikey={key}`
- ✅ Prix en temps réel
- ✅ Volume, variation, high/low
- **Utilisé dans:** `getQuote()`

### 3. **Financial Statements** ✅ HOT
**Endpoint:** `/income-statement?symbol={symbol}&period={annual|quarter}&limit={n}&apikey={key}`
- ✅ Compte de résultat (5 ans)
- ✅ Revenus, bénéfices, coûts
- **Utilisé dans:** `getIncomeStatement()`

### 4. **Charts** ✅ Popular
**Endpoint:** `/historical-price-eod/full?symbol={symbol}&from={date}&to={date}&apikey={key}`
- ✅ Données historiques (jusqu'à 5 ans)
- ✅ OHLCV (Open, High, Low, Close, Volume)
- **Utilisé dans:** `getHistoricalData()`

### 5. **Economics** ✅
**Endpoint:** `/economic-calendar?from={date}&to={date}&apikey={key}`
- ✅ Calendrier économique
- ✅ Filtres par impact et pays
- **Utilisé dans:** `getEconomicCalendar()`

### 6. **Earnings, Dividends, Splits** ✅
**Endpoint:** `/earnings-calendar?from={date}&to={date}&apikey={key}`
- ✅ Calendrier des earnings
- ✅ Surprises d'earnings
- **Utilisé dans:** `getEarningsCalendar()`, `getEarningsSurprises()`

### 7. **News** ✅
**Endpoint:** `/stock_news?tickers={symbol}&limit={n}&apikey={key}`
- ✅ Actualités marché
- ✅ News par symbole
- **Utilisé dans:** `getMarketNews()`

### 8. **Technical Indicators** ✅
**Endpoints:**
- `/technical-indicators/rsi?symbol={symbol}&periodLength={n}&timeframe={1day}&apikey={key}`
- `/macd/{symbol}?timeframe={1day}&apikey={key}`
- `/sma/{symbol}?period={n}&timeframe={1day}&apikey={key}`
- ✅ RSI, MACD, SMA
- **Utilisé dans:** `getRSI()`, `getMACD()`, `getSMA()`

### 9. **Crypto** ✅
**Endpoint:** `/quote/{symbol}USD?apikey={key}`
- ✅ Prix crypto
- **Utilisé dans:** `getCryptoPrice()`

### 10. **Forex** ✅
**Endpoint:** `/fx/{from}{to}?apikey={key}`
- ✅ Taux de change
- **Utilisé dans:** `getForexRate()`

---

## 🆕 **Rubriques Disponibles mais NON Implémentées** (à ajouter)

### 11. **Analyst** ⭐ RECOMMANDÉ
**Endpoint:** `/analyst-estimates?symbol={symbol}&period={annual|quarter}&page={n}&limit={n}&apikey={key}`
- 📊 Estimations d'analystes (revenus, EPS, EBITDA)
- 📊 Consensus et fourchettes
- **Utilité:** Prédire les performances futures, comparer avec les résultats réels
- **Exemple:** `https://financialmodelingprep.com/stable/analyst-estimates?symbol=AAPL&period=annual&page=0&limit=10&apikey=YOUR_KEY`

### 12. **Ratios** ⭐ RECOMMANDÉ (partiellement implémenté)
**Endpoint:** `/ratios/{symbol}?period={annual|quarter}&limit={n}&apikey={key}`
- 📊 Ratios financiers (P/E, P/B, ROE, etc.)
- **Note:** Déjà dans le code mais peut être amélioré
- **Utilité:** Évaluer la valorisation et la santé financière

### 13. **Balance Sheet** ⭐ RECOMMANDÉ
**Endpoint:** `/balance-sheet-statement?symbol={symbol}&period={annual|quarter}&limit={n}&apikey={key}`
- 📊 Bilan comptable
- 📊 Actifs, passifs, capitaux propres
- **Utilité:** Analyser la structure financière

### 14. **Cash Flow Statement** ⭐ RECOMMANDÉ
**Endpoint:** `/cash-flow-statement?symbol={symbol}&period={annual|quarter}&limit={n}&apikey={key}`
- 📊 État des flux de trésorerie
- 📊 Cash flow opérationnel, investissement, financement
- **Utilité:** Évaluer la liquidité et la génération de cash

### 15. **Key Metrics** ⭐ RECOMMANDÉ
**Endpoint:** `/key-metrics?symbol={symbol}&period={annual|quarter}&limit={n}&apikey={key}`
- 📊 Métriques clés (EV, EV/Revenue, etc.)
- **Utilité:** Métriques avancées de valorisation

### 16. **Discounted Cash Flow (DCF)** ⭐ RECOMMANDÉ
**Endpoint:** `/discounted-cash-flow?symbol={symbol}&apikey={key}`
- 📊 Valorisation DCF
- 📊 Prix cible basé sur les flux de trésorerie
- **Utilité:** Évaluer si une action est sous/sur-évaluée

### 17. **Earnings Transcript** 📝
**Endpoint:** `/earnings_transcript?symbol={symbol}&quarter={Q1|Q2|Q3|Q4}&year={YYYY}&apikey={key}`
- 📝 Transcripts des conférences earnings
- **Utilité:** Analyser les commentaires de la direction

### 18. **Form 13F** 📋
**Endpoint:** `/form-thirteen?date={YYYY-MM-DD}&apikey={key}`
- 📋 Filings 13F (positions institutionnelles)
- **Utilité:** Voir les positions des hedge funds
- **Note:** Déjà utilisé via `/lib/13f-filings/client.js` mais peut être complété

### 19. **Insider Trades** ⭐ RECOMMANDÉ
**Endpoint:** `/insider-trading?symbol={symbol}&limit={n}&apikey={key}`
- 📊 Transactions d'insiders
- 📊 Achat/vente par dirigeants
- **Utilité:** Signaux d'achat/vente (insiders achètent = bon signe)

### 20. **ETF & Mutual Funds** 📊
**Endpoint:** `/etf-list?apikey={key}`
- 📊 Liste des ETF
- 📊 Holdings d'ETF
- **Utilité:** Analyser les ETF et leurs positions

### 21. **Indexes** 📊
**Endpoint:** `/sp500_constituent?apikey={key}`
- 📊 Constituants des indices (S&P 500, NASDAQ, etc.)
- **Utilité:** Liste des actions dans les indices

### 22. **Market Performance** 📊
**Endpoint:** `/sector-performance-snapshot?date={YYYY-MM-DD}&exchange={NASDAQ|NYSE}&apikey={key}`
- 📊 Performance par secteur
- **Note:** Déjà implémenté dans `getSectorPerformance()`

### 23. **SEC Filings** 📋
**Endpoint:** `/sec_filings?symbol={symbol}&type={10-K|10-Q|8-K}&page={n}&apikey={key}`
- 📋 Documents SEC (10-K, 10-Q, 8-K)
- **Utilité:** Accéder aux documents réglementaires

### 24. **Stock Directory** 📋
**Endpoint:** `/stock/list?exchange={NASDAQ|NYSE|AMEX}&apikey={key}`
- 📋 Liste complète des actions
- **Utilité:** Obtenir tous les symboles disponibles

### 25. **Company Search** ✅
**Endpoint:** `/search-name?query={name}&apikey={key}`
- ✅ Recherche d'entreprise par nom
- **Note:** Déjà implémenté dans `searchCompanyByName()`

### 26. **Senate** 🏛️
**Endpoint:** `/senate-trading?symbol={symbol}&apikey={key}`
- 🏛️ Transactions des sénateurs US
- **Utilité:** Suivre les trades des politiciens (comme Unusual Whales)

### 27. **ESG** 🌱
**Endpoint:** `/esg-score?symbol={symbol}&apikey={key}`
- 🌱 Score ESG (Environnement, Social, Gouvernance)
- **Utilité:** Investissement responsable

### 28. **Commitment Of Traders** 📊
**Endpoint:** `/commitment_of_traders_report?symbol={symbol}&apikey={key}`
- 📊 Rapport COT (futures)
- **Utilité:** Analyser les positions des traders institutionnels

---

## 🎯 **Recommandations par Priorité**

### 🔥 **Priorité 1 - À Implémenter en Premier**
1. **Analyst Estimates** - Estimations d'analystes (très utile pour trading)
2. **Balance Sheet** - Bilan comptable (analyse fondamentale)
3. **Cash Flow Statement** - Flux de trésorerie (analyse fondamentale)
4. **Insider Trades** - Transactions d'insiders (signaux de trading)
5. **Discounted Cash Flow** - Valorisation DCF (évaluation)

### ⭐ **Priorité 2 - Utiles**
6. **Key Metrics** - Métriques avancées
7. **Earnings Transcript** - Transcripts (analyse qualitative)
8. **SEC Filings** - Documents réglementaires
9. **Senate** - Trades des sénateurs (comme Unusual Whales)

### 📊 **Priorité 3 - Complémentaires**
10. **ETF & Mutual Funds** - Analyse ETF
11. **Indexes** - Constituants d'indices
12. **ESG** - Score ESG
13. **Stock Directory** - Liste complète

---

## 📝 **Format d'Endpoint Standard**

Tous les endpoints suivent ce format :
```
https://financialmodelingprep.com/stable/{endpoint}?{params}&apikey={YOUR_KEY}
```

**Exemple avec Analyst Estimates:**
```
https://financialmodelingprep.com/stable/analyst-estimates?symbol=AAPL&period=annual&page=0&limit=10&apikey=YOUR_KEY
```

---

## 🚀 **Prochaines Étapes**

1. **Ajouter les endpoints prioritaires** dans `/lib/fmp/client.js`
2. **Créer des services** pour utiliser ces données
3. **Intégrer dans les pages** du dashboard (financial-analysis, screener, etc.)

---

## 📚 **Documentation Officielle**

- [Documentation FMP](https://site.financialmodelingprep.com/developer/docs/)
- [API Viewer](https://site.financialmodelingprep.com/developer/docs/#Stock-API) - Pour tester les endpoints

---

## ⚠️ **Limites du Plan Starter**

- **Rate Limit:** 300 calls/minute (5 calls/second)
- **Historique:** Jusqu'à 5 ans
- **Coverage:** US uniquement
- **Données:** Annual et Quarterly fundamentals

