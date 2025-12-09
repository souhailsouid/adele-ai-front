# 🔒 Résumé Migration APIs - Backend Team

## ⚠️ Problème Critique de Sécurité

Les clés API sont exposées côté client via `NEXT_PUBLIC_*` et visibles dans le navigateur.

**Clés exposées:**
- `NEXT_PUBLIC_FMP_API_KEY`
- `NEXT_PUBLIC_UNUSUAL_WHALES`

---

## 📊 Fichiers à Migrer

### 🔴 FMP API - 35 fichiers

#### Clients & Services (Priorité 1)
1. **`lib/fmp/client.js`** ⚠️ **CRITIQUE** - Client principal
2. **`services/aladdinService.js`** - Utilise FMP pour features
3. **`services/tickerActivityService.js`** - Hedge fund holdings
4. **`services/financialAnalysisService.js`** - Analyse financière
5. **`services/metricsService.js`** - Métriques
6. **`services/marketService.js`** - Données marché
7. **`services/screener.js`** - Screener
8. **`services/economicCalendarService.js`** - Calendrier économique
9. **`services/alertService.js`** - Alertes

#### Pages Directes (Priorité 2)
10. `pages/dashboards/trading/financial-analysis.js`
11. `pages/dashboards/trading/dcf-valuation.js`
12. `pages/dashboards/trading/earnings.js`
13. `pages/dashboards/trading/analyst-estimates.js`
14. `pages/dashboards/trading/insider-buysells.js`
15. `pages/dashboards/trading/price-history.js`
16. `pages/index.js`
17. `pages/dashboards/trading/portfolio-intelligence.js` (via service)
18. `pages/dashboards/trading/opportunities-scanner.js` (via service)
19. `pages/dashboards/trading/whale-tracker.js` (via service)
20. `pages/dashboards/trading/ticker-activity.js` (via service)

#### Composants
21. `pagesComponents/dashboards/trading/components/FMPInsiderTradesTab.js`

---

### 🔴 Unusual Whales API - 72 fichiers

#### Clients & Services (Priorité 1)
1. **`lib/unusual-whales/client.js`** ⚠️ **CRITIQUE** - Client principal
2. **`services/aladdinService.js`** - Features (options, dark pool, insider, congress)
3. **`services/tickerActivityService.js`** - Activité par ticker
4. **`services/whaleTrackerService.js`** - Tracker whales
5. **`services/institutionalFlowDetector.js`** - Détection flow institutionnel

#### Pages Directes (Priorité 2)
6. `pages/dashboards/trading/unusual-whales.js`
7. `pages/dashboards/trading/unusual-whales-screener.js`
8. `pages/dashboards/trading/congress.js`
9. `pages/dashboards/trading/institutions.js`
10. `pages/dashboards/trading/insider-buysells.js`
11. `pages/dashboards/trading/short-data.js`
12. `pages/dashboards/trading/news.js`
13. `pages/dashboards/trading/fda-calendar.js`
14. `pages/dashboards/trading/stock-state.js`
15. `pages/dashboards/trading/correlations.js`
16. `pages/dashboards/trading/politician-portfolios.js`
17. `pages/dashboards/trading/option-contracts.js`
18. `pages/dashboards/trading/seasonality.js`
19. `pages/dashboards/trading/ticker-analysis.js`
20. `pages/dashboards/trading/whale-tracker.js` (via service)
21. `pages/dashboards/trading/ticker-activity.js` (via service)
22. `pages/dashboards/trading/portfolio-intelligence.js` (via service)
23. `pages/dashboards/trading/opportunities-scanner.js` (via service)
24. `pages/dashboards/trading/guru-flow-tracker.js` (via service)
25. `pages/index.js`

#### Composants (30+ fichiers)
- `pagesComponents/dashboards/trading/components/FlowAlertsTab.js`
- `pagesComponents/dashboards/trading/components/DarkPoolTab.js`
- `pagesComponents/dashboards/trading/components/InsiderTradesTab.js`
- `pagesComponents/dashboards/trading/components/CongressTradesTab.js`
- `pagesComponents/dashboards/trading/components/InstitutionsTab.js`
- `pagesComponents/dashboards/trading/components/HedgeFundsTab.js`
- `pagesComponents/dashboards/trading/components/FlowAlerts.js`
- `pagesComponents/dashboards/trading/components/FlowRecent.js`
- `pagesComponents/dashboards/trading/components/InsiderBuySellsTicker.js`
- `pagesComponents/dashboards/trading/hooks/useGreekFlow.js`
- Et 20+ autres composants...

---

## 🔧 Endpoints à Créer (Backend)

### FMP Endpoints (`/api/fmp/*`)
```
GET /api/fmp/quote/:symbol
GET /api/fmp/historical-price/:symbol
GET /api/fmp/income-statement/:symbol
GET /api/fmp/balance-sheet/:symbol
GET /api/fmp/cash-flow/:symbol
GET /api/fmp/key-metrics/:symbol
GET /api/fmp/ratios/:symbol
GET /api/fmp/dcf/:symbol
GET /api/fmp/earnings/:symbol
GET /api/fmp/earnings-transcript/:symbol
GET /api/fmp/earnings-estimates/:symbol
GET /api/fmp/analyst-estimates/:symbol
GET /api/fmp/insider-trades/:symbol
GET /api/fmp/hedge-fund-holdings/:symbol
GET /api/fmp/market-news
GET /api/fmp/economic-calendar
GET /api/fmp/earnings-calendar
GET /api/fmp/screener
GET /api/fmp/sec-filings/:symbol
... (20+ endpoints)
```

### Unusual Whales Endpoints (`/api/unusual-whales/*`)
```
GET /api/unusual-whales/institution-ownership/:ticker
GET /api/unusual-whales/institution-activity/:ticker
GET /api/unusual-whales/institution-holdings/:ticker
GET /api/unusual-whales/options-flow/:ticker
GET /api/unusual-whales/flow-alerts/:ticker
GET /api/unusual-whales/greek-flow/:ticker
GET /api/unusual-whales/dark-pool-trades/:ticker
GET /api/unusual-whales/insider-trades/:ticker
GET /api/unusual-whales/insider-transactions/:ticker
GET /api/unusual-whales/congress-trades/:ticker
GET /api/unusual-whales/congress-recent-trades/:ticker
GET /api/unusual-whales/option-chains/:ticker
GET /api/unusual-whales/short-data/:ticker
GET /api/unusual-whales/news
GET /api/unusual-whales/fda-calendar
... (15+ endpoints)
```

---

## ✅ Action Items Backend

1. **Créer routes API Next.js** (`pages/api/fmp/*` et `pages/api/unusual-whales/*`)
2. **Déplacer clés API** vers variables serveur (`.env.local` sans `NEXT_PUBLIC_`)
3. **Implémenter rate limiting** côté serveur
4. **Ajouter authentification JWT** pour protéger les routes
5. **Migrer tous les endpoints** listés ci-dessus
6. **Tester** tous les endpoints
7. **Documenter** les nouvelles routes

---

## 📝 Variables d'Environnement

### À Créer (Backend uniquement)
```bash
FMP_API_KEY=your_key_here
UNUSUAL_WHALES_API_KEY=your_key_here
```

### À Supprimer (Frontend)
```bash
❌ NEXT_PUBLIC_FMP_API_KEY
❌ NEXT_PUBLIC_UNUSUAL_WHALES
```

---

**Document détaillé**: Voir `SECURITY_API_MIGRATION.md`  
**Priorité**: 🔴 **CRITIQUE** (Sécurité)





