# 🔒 Migration des APIs FMP et Unusual Whales vers le Backend

## ⚠️ Problème de Sécurité Actuel

Les clés API de **FMP (Financial Modeling Prep)** et **Unusual Whales** sont actuellement exposées côté client via les variables d'environnement `NEXT_PUBLIC_*`, ce qui les rend visibles dans le navigateur (inspect Chrome → Sources → Environment variables).

### Clés API Exposées
- `NEXT_PUBLIC_FMP_API_KEY` - Clé API FMP
- `NEXT_PUBLIC_UNUSUAL_WHALES` - Clé API Unusual Whales

---

## 📁 Fichiers Utilisant FMP API

### 1. Client Principal
- **`lib/fmp/client.js`** ⚠️ **CRITIQUE**
  - Classe `FMPClient` qui contient toute la logique d'appel API
  - Utilise `process.env.NEXT_PUBLIC_FMP_API_KEY`
  - Base URL: `https://financialmodelingprep.com/stable/`
  - Rate limiting: 300 calls/minute

### 2. Services Utilisant FMP Client
- **`services/aladdinService.js`**
  - Utilise FMP pour calculer les features (valuation_score, momentum_score)
  - Appels: `getQuote`, `getKeyMetrics`, `getDCF`, `getRatios`, `getMarketNews`

- **`services/tickerActivityService.js`**
  - Utilise FMP pour récupérer les holdings de hedge funds
  - Appels: `getHedgeFundHoldings`

- **`services/financialAnalysisService.js`**
  - Analyse financière complète
  - Appels multiples: `getIncomeStatement`, `getBalanceSheet`, `getCashFlow`, `getRatios`, `getKeyMetrics`, `getDCF`, etc.

- **`services/metricsService.js`**
  - Métriques financières
  - Appels: `getKeyMetrics`, `getRatios`, `getEnterpriseValue`

- **`services/marketService.js`**
  - Données de marché
  - Appels: `getQuote`, `getHistoricalPrice`, `getMarketCap`

- **`services/screener.js`**
  - Screener de stocks
  - Appels: `getScreener`

- **`services/economicCalendarService.js`**
  - Calendrier économique
  - Appels: `getEconomicCalendar`

- **`services/alertService.js`**
  - Alertes de marché
  - Appels: `getMarketNews`, `getEarningsCalendar`

### 3. Pages Utilisant FMP Client (Directement ou via Services)

#### Pages Directes
- **`pages/dashboards/trading/financial-analysis.js`**
  - Analyse financière complète
  - Utilise `fmpClient` directement

- **`pages/dashboards/trading/dcf-valuation.js`**
  - Valuation DCF
  - Utilise `fmpClient.getDCF()` directement

- **`pages/dashboards/trading/earnings.js`**
  - Données de résultats
  - Utilise `fmpClient.getEarnings()`, `getEarningsTranscript()`, `getEarningsEstimates()`

- **`pages/dashboards/trading/analyst-estimates.js`**
  - Estimations d'analystes
  - Utilise `fmpClient.getAnalystEstimates()` directement

- **`pages/dashboards/trading/insider-buysells.js`**
  - Transactions d'insiders
  - Utilise `fmpClient.getInsiderTrades()` directement

- **`pages/dashboards/trading/price-history.js`**
  - Historique des prix
  - Utilise `fmpClient.getHistoricalPrice()` directement

#### Pages via Services
- **`pages/dashboards/trading/portfolio-intelligence.js`**
  - Utilise `aladdinService` qui appelle FMP

- **`pages/dashboards/trading/opportunities-scanner.js`**
  - Utilise `aladdinService` qui appelle FMP

- **`pages/dashboards/trading/whale-tracker.js`**
  - Utilise `whaleTrackerService` qui peut utiliser FMP

- **`pages/dashboards/trading/ticker-activity.js`**
  - Utilise `tickerActivityService` qui appelle FMP pour hedge funds

### 4. Composants Utilisant FMP
- **`pagesComponents/dashboards/trading/components/FMPInsiderTradesTab.js`**
  - Onglet pour transactions d'insiders FMP
  - Utilise `fmpClient.getInsiderTrades()` directement

---

## 📁 Fichiers Utilisant Unusual Whales API

### 1. Client Principal
- **`lib/unusual-whales/client.js`** ⚠️ **CRITIQUE**
  - Classe `UnusualWhalesClient` qui contient toute la logique d'appel API
  - Utilise `process.env.NEXT_PUBLIC_UNUSUAL_WHALES`
  - Base URL: `https://api.unusualwhales.com`
  - Rate limiting: 120 requests/minute

### 2. Services Utilisant Unusual Whales Client
- **`services/aladdinService.js`**
  - Utilise UW pour calculer les features (options_bullish_score, darkpool_score, insider_score, congress_buy_score, smart_money_score)
  - Appels: `getOptionsFlow`, `getDarkPoolTrades`, `getInsiderTrades`, `getCongressTrades`, `getInstitutionActivity`

- **`services/tickerActivityService.js`**
  - Service principal pour l'activité par ticker
  - Appels multiples:
    - `getInstitutionOwnership` - Propriété institutionnelle
    - `getInstitutionActivity` - Transactions récentes
    - `getInsiderTransactions` - Transactions d'insiders
    - `getCongressRecentTrades` - Transactions du Congrès
    - `getFlowAlerts` - Alertes de flow
    - `getDarkPoolTrades` - Dark pool trades
    - `getOptionsFlow` - Options flow

- **`services/whaleTrackerService.js`**
  - Service pour tracker les "whales"
  - Appels: `getFlowAlerts`, `getDarkPoolTrades`, `getInsiderTransactions`, `getCongressRecentTrades`, `getInstitutionActivity`, `getInstitutionOwnership`

- **`services/institutionalFlowDetector.js`**
  - Détection de flow institutionnel
  - Appels: `getOptionsFlow`, `getDarkPoolTrades`, `getInstitutionActivity`

### 3. Pages Utilisant Unusual Whales Client (Directement ou via Services)

#### Pages Directes
- **`pages/dashboards/trading/unusual-whales.js`**
  - Page principale Unusual Whales
  - Utilise `unusualWhalesClient` directement

- **`pages/dashboards/trading/unusual-whales-screener.js`**
  - Screener Unusual Whales
  - Utilise `unusualWhalesClient` directement

- **`pages/dashboards/trading/congress.js`**
  - Transactions du Congrès
  - Utilise `unusualWhalesClient.getCongressTrades()` directement

- **`pages/dashboards/trading/institutions.js`**
  - Données institutionnelles
  - Utilise `unusualWhalesClient` directement

- **`pages/dashboards/trading/insider-buysells.js`**
  - Transactions d'insiders (utilise aussi UW)
  - Utilise `unusualWhalesClient.getInsiderTrades()` directement

#### Pages via Services
- **`pages/dashboards/trading/whale-tracker.js`**
  - Utilise `whaleTrackerService` qui appelle UW

- **`pages/dashboards/trading/ticker-activity.js`**
  - Utilise `tickerActivityService` qui appelle UW

- **`pages/dashboards/trading/portfolio-intelligence.js`**
  - Utilise `aladdinService` qui appelle UW

- **`pages/dashboards/trading/opportunities-scanner.js`**
  - Utilise `aladdinService` qui appelle UW

- **`pages/dashboards/trading/guru-flow-tracker.js`**
  - Utilise `institutionalFlowDetector` qui appelle UW

### 4. Composants Utilisant Unusual Whales

#### Composants de Whale Tracker
- **`pagesComponents/dashboards/trading/components/FlowAlertsTab.js`**
  - Utilise `whaleTrackerService.getFlowAlerts()`

- **`pagesComponents/dashboards/trading/components/DarkPoolTab.js`**
  - Utilise `whaleTrackerService.getDarkPoolTrades()`

- **`pagesComponents/dashboards/trading/components/InsiderTradesTab.js`**
  - Utilise `whaleTrackerService.getInsiderTransactions()`

- **`pagesComponents/dashboards/trading/components/CongressTradesTab.js`**
  - Utilise `whaleTrackerService.getCongressRecentTrades()`

- **`pagesComponents/dashboards/trading/components/InstitutionsTab.js`**
  - Utilise `whaleTrackerService.getInstitutionActivity()`

- **`pagesComponents/dashboards/trading/components/HedgeFundsTab.js`**
  - Utilise `whaleTrackerService.getHedgeFundActivity()`

#### Autres Composants
- **`pagesComponents/dashboards/trading/components/FlowAlerts.js`**
  - Utilise `unusualWhalesClient.getFlowAlerts()` directement

- **`pagesComponents/dashboards/trading/components/FlowRecent.js`**
  - Utilise `unusualWhalesClient.getOptionsFlow()` directement

- **`pagesComponents/dashboards/trading/components/InsiderBuySellsTicker.js`**
  - Utilise `unusualWhalesClient.getInsiderTrades()` directement

- **`pagesComponents/dashboards/trading/hooks/useGreekFlow.js`**
  - Hook pour Greek Flow
  - Utilise `unusualWhalesClient.getGreekFlow()` directement

---

## 🔧 Endpoints FMP à Migrer

### Endpoints Principaux Utilisés

1. **Quote & Market Data**
   - `getQuote(symbol)` - Prix actuel
   - `getHistoricalPrice(symbol, period)` - Historique des prix
   - `getMarketCap(symbol)` - Market cap

2. **Financial Statements**
   - `getIncomeStatement(symbol, period, limit)` - État des résultats
   - `getBalanceSheet(symbol, period, limit)` - Bilan
   - `getCashFlow(symbol, period, limit)` - Flux de trésorerie

3. **Financial Metrics**
   - `getKeyMetrics(symbol, period, limit)` - Métriques clés
   - `getRatios(symbol, period, limit)` - Ratios financiers
   - `getDCF(symbol)` - Valuation DCF
   - `getEnterpriseValue(symbol, period, limit)` - Enterprise value

4. **Earnings & Estimates**
   - `getEarnings(symbol, limit)` - Résultats
   - `getEarningsTranscript(symbol, limit)` - Transcripts
   - `getEarningsEstimates(symbol, period, limit)` - Estimations
   - `getEarningsSurprises(symbol, limit)` - Surprises
   - `getAnalystEstimates(symbol, period, limit)` - Estimations d'analystes

5. **Insider & Institutional**
   - `getInsiderTrades(symbol, limit)` - Transactions d'insiders
   - `getHedgeFundHoldings(symbol, limit)` - Holdings de hedge funds

6. **Market Data**
   - `getMarketNews(symbol, limit)` - Actualités
   - `getEconomicCalendar(from, to)` - Calendrier économique
   - `getEarningsCalendar(from, to)` - Calendrier des résultats
   - `getScreener(criteria)` - Screener

7. **SEC Filings**
   - `getSECFilings(symbol, type, limit)` - Dépôts SEC

---

## 🔧 Endpoints Unusual Whales à Migrer

### Endpoints Principaux Utilisés

1. **Institutional Data**
   - `getInstitutionOwnership(ticker, options)` - Propriété institutionnelle
   - `getInstitutionActivity(ticker, institutionName, options)` - Activité institutionnelle
   - `getInstitutionHoldings(ticker, institutionName, options)` - Holdings institutionnels

2. **Options Flow**
   - `getOptionsFlow(ticker, options)` - Flow d'options
   - `getFlowAlerts(ticker, options)` - Alertes de flow
   - `getGreekFlow(ticker, options)` - Greek flow

3. **Dark Pool**
   - `getDarkPoolTrades(ticker, options)` - Trades dark pool

4. **Insider & Congress**
   - `getInsiderTrades(ticker, options)` - Transactions d'insiders
   - `getInsiderTransactions(ticker, options)` - Transactions d'insiders (format différent)
   - `getCongressTrades(ticker, options)` - Transactions du Congrès
   - `getCongressRecentTrades(ticker, options)` - Transactions récentes du Congrès

5. **Options Data**
   - `getOptionChains(ticker, options)` - Chaînes d'options
   - `getOptionPriceLevels(ticker, options)` - Niveaux de prix d'options
   - `getVolumeOIExpiry(ticker, options)` - Volume/OI par expiration

---

## 📋 Plan de Migration Recommandé

### Phase 1: Création des API Routes Backend
1. Créer des routes Next.js API (`pages/api/fmp/*` et `pages/api/unusual-whales/*`)
2. Déplacer les clés API vers variables d'environnement serveur (`FMP_API_KEY`, `UNUSUAL_WHALES_API_KEY`)
3. Implémenter le rate limiting côté serveur
4. Ajouter l'authentification JWT pour protéger les routes

### Phase 2: Migration Progressive
1. **Priorité Haute** (Sécurité critique):
   - `lib/fmp/client.js` → `pages/api/fmp/*`
   - `lib/unusual-whales/client.js` → `pages/api/unusual-whales/*`

2. **Priorité Moyenne** (Services):
   - Migrer `services/aladdinService.js`
   - Migrer `services/tickerActivityService.js`
   - Migrer `services/whaleTrackerService.js`

3. **Priorité Basse** (Pages):
   - Migrer les pages une par une
   - Créer des clients API frontend qui appellent les routes backend

### Phase 3: Nettoyage
1. Supprimer les variables `NEXT_PUBLIC_*` des fichiers d'environnement
2. Supprimer les clients frontend (`lib/fmp/client.js`, `lib/unusual-whales/client.js`)
3. Mettre à jour tous les imports

---

## 🔐 Variables d'Environnement à Créer (Backend)

### Fichier `.env.local` (Backend uniquement)
```bash
# FMP API
FMP_API_KEY=your_fmp_api_key_here

# Unusual Whales API
UNUSUAL_WHALES_API_KEY=your_unusual_whales_api_key_here
```

### Variables à Supprimer (Frontend)
```bash
# ❌ À SUPPRIMER
NEXT_PUBLIC_FMP_API_KEY=...
NEXT_PUBLIC_UNUSUAL_WHALES=...
```

---

## 📊 Statistiques

- **Fichiers utilisant FMP**: ~35 fichiers
- **Fichiers utilisant Unusual Whales**: ~72 fichiers
- **Endpoints FMP à migrer**: ~20+ endpoints
- **Endpoints Unusual Whales à migrer**: ~15+ endpoints
- **Services critiques**: 8 services
- **Pages critiques**: 15+ pages

---

## ✅ Checklist pour l'Équipe Backend

- [ ] Créer routes API pour FMP (`/api/fmp/*`)
- [ ] Créer routes API pour Unusual Whales (`/api/unusual-whales/*`)
- [ ] Implémenter rate limiting côté serveur
- [ ] Ajouter authentification JWT
- [ ] Migrer tous les endpoints FMP
- [ ] Migrer tous les endpoints Unusual Whales
- [ ] Tester tous les endpoints
- [ ] Documenter les nouvelles routes API
- [ ] Créer un client API frontend pour remplacer les clients actuels

---

**Date de création**: 2025-01-XX  
**Dernière mise à jour**: 2025-01-XX  
**Priorité**: 🔴 **CRITIQUE** (Sécurité)





