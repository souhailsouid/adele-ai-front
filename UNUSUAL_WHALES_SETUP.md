# Configuration Unusual Whales API

## Variables d'environnement

Ajoutez la clé API Unusual Whales dans votre fichier `.env.local` :

```bash
NEXT_PUBLIC_UNUSUAL_WHALES=925866f5-e97f-459d-850d-5d5856fef716
```

## Endpoints disponibles

Le client Unusual Whales expose les endpoints suivants :

### Alertes
- `getAlerts(params)` - Récupérer les alertes déclenchées
- `getAlertConfigurations()` - Récupérer les configurations d'alertes
- `getFlowAlerts(params)` - Récupérer les flow alerts (options)

### Darkpool
- `getRecentDarkpoolTrades(params)` - Darkpool trades récents
- `getDarkpoolTrades(ticker, params)` - Darkpool trades pour un ticker

### Stocks
- `getTickerInfo(ticker)` - Informations sur un ticker
- `getStockState(ticker)` - État actuel (prix, volume)
- `getTickerOptionsVolume(ticker, params)` - Volume d'options
- `getTickerGreeks(ticker)` - Greeks (delta, gamma, theta, vega)
- `getMaxPain(ticker)` - Max pain
- `getNOPE(ticker, params)` - NOPE (Net Options Pricing Effect)
- `getGreekFlow(ticker, params)` - Greek flow
- `getGreekFlowByExpiry(ticker, expiry, params)` - Greek flow par expiry
- `getATMChains(ticker, params)` - ATM chains
- `getSectorTickers(sector)` - Tickers d'un secteur

### Market
- `getTopNetImpact(params)` - Top tickers par net premium
- `getMarketTide(params)` - Market tide
- `getSectorTide(sector, params)` - Sector tide
- `getOIChange(params)` - Changements d'open interest
- `getInsiderBuySells(params)` - Insider buy/sells
- `getCorrelations(tickers, params)` - Corrélations entre tickers
- `getEconomicCalendar()` - Calendrier économique
- `getFDACalendar(params)` - Calendrier FDA
- `getTotalOptionsVolume(params)` - Total options volume
- `getETFTide(ticker, params)` - ETF tide
- `getSectorETFs(params)` - Sector ETFs
- `getSPIKE(params)` - SPIKE

### Institution
- `getInstitutionActivity(name, params)` - Activité d'une institution
- `getInstitutionHoldings(name, params)` - Holdings d'une institution
- `getInstitutionSectors(name, params)` - Exposition sectorielle d'une institution
- `getInstitutionOwnership(ticker, params)` - Propriété institutionnelle d'un ticker
- `getInstitutions(params)` - Liste des institutions
- `getLatestInstitutionalFilings(params)` - Derniers filings institutionnels

### Insiders
- `getInsiderTransactions(params)` - Transactions d'insiders
- `getInsiderSectorFlow(sector)` - Flux insider pour un secteur
- `getInsiders(ticker)` - Insiders pour un ticker
- `getInsiderTickerFlow(ticker)` - Flux insider pour un ticker

### Earnings
- `getPremarketEarnings(params)` - Earnings premarket
- `getAfterhoursEarnings(params)` - Earnings afterhours
- `getTickerEarnings(ticker)` - Earnings historiques

### Congress
- `getCongressRecentTrades(params)` - Trades récents du Congrès
- `getCongressTrader(name, params)` - Rapports d'un trader du Congrès
- `getCongressLateReports(params)` - Rapports en retard du Congrès

### Option Trades
- `getFullTape(date)` - Full tape pour une date (nécessite scope websocket)

### ETFs
- `getETFExposure(ticker)` - Exposition d'un ticker dans les ETFs
- `getETFHoldings(ticker)` - Holdings d'un ETF
- `getETFInOutflow(ticker)` - Inflow & outflow d'un ETF
- `getETFInfo(ticker)` - Informations d'un ETF
- `getETFWeights(ticker)` - Poids sectoriels et par pays d'un ETF

## Exemple d'utilisation

```javascript
import unusualWhalesClient from "/lib/unusual-whales/client";

// Récupérer les flow alerts
const alerts = await unusualWhalesClient.getFlowAlerts({
  ticker_symbol: "AAPL",
  min_premium: 50000,
  limit: 20
});

// Récupérer le top net impact
const topImpact = await unusualWhalesClient.getTopNetImpact({
  date: "2025-12-19",
  limit: 50
});

// Récupérer les informations d'un ticker
const tickerInfo = await unusualWhalesClient.getTickerInfo("AAPL");

// Récupérer les darkpool trades
const darkpool = await unusualWhalesClient.getRecentDarkpoolTrades({
  min_premium: 100000,
  limit: 100
});

// Récupérer l'activité d'une institution
const activity = await unusualWhalesClient.getInstitutionActivity("BERKSHIRE HATHAWAY INC", {
  limit: 50
});

// Récupérer les insiders pour un ticker
const insiders = await unusualWhalesClient.getInsiders("AAPL");

// Récupérer les corrélations
const correlations = await unusualWhalesClient.getCorrelations("AAPL,MSFT,GOOGL", {
  interval: "1m"
});
```

## Limitations du Plan ($150/mois)

- ✅ 120 requêtes/minute
- ✅ 15K requêtes/jour
- ✅ Options order flow, stocks, congressional & insider trades
- ✅ Market data et outils propriétaires
- ✅ Support email & Discord
- ❌ Pas de websockets (données live)

