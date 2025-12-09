# 🧠 Intelligence Features - Documentation

## Vue d'ensemble

La catégorie **Intelligence** regroupe toutes les fonctionnalités avancées combinant FMP (Financial Modeling Prep) et Unusual Whales pour offrir une analyse complète et intelligente des marchés.

## Architecture

### Structure des fichiers

```
lib/api/
  └── intelligenceClient.js      # Client API pour les endpoints Intelligence

services/
  └── intelligenceService.js     # Service avec cache et logique métier

hooks/intelligence/
  ├── useCompleteAnalysis.js     # Hook pour l'analyse complète
  ├── useTickerScore.js          # Hook pour le scoring
  ├── useMarketIntelligence.js  # Hook pour market intelligence
  ├── useSurveillance.js         # Hook pour la surveillance
  ├── useSmartMoney.js           # Hook pour smart money
  └── index.js                   # Export centralisé

pages/dashboards/intelligence/
  ├── overview.js                # Vue d'ensemble
  ├── complete-analysis.js       # Analyse complète
  ├── ticker-scoring.js          # Scoring
  ├── market.js                  # Market Intelligence
  ├── surveillance.js            # Surveillance
  └── smart-money.js             # Smart Money

pagesComponents/dashboards/intelligence/components/
  ├── ScoreCard.js               # Composant score réutilisable
  └── AnalysisCard.js            # Composant analyse réutilisable
```

## Fonctionnalités Disponibles

### 1. Analyse Complète (`/dashboards/intelligence/complete-analysis`)

**Description** : Analyse combinée fundamentals (FMP) + sentiment de marché (UW)

**Utilisation** :
```javascript
import { useCompleteAnalysis } from "/hooks/intelligence";

function MyComponent() {
  const { data, loading, error, refetch } = useCompleteAnalysis("AAPL");
  
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <AnalysisDisplay data={data} />;
}
```

**Données retournées** :
- `fundamental`: Score et détails fondamentaux
- `sentiment`: Score et détails sentiment
- `convergence`: Analyse de convergence/divergence
- `recommendation`: STRONG_BUY, BUY, HOLD, SELL, STRONG_SELL
- `confidence`: Niveau de confiance (0-100)

### 2. Ticker Scoring (`/dashboards/intelligence/ticker-scoring`)

**Description** : Score composite 0-100 basé sur options, insiders, dark pool, short interest, greeks

**Utilisation** :
```javascript
import { useTickerScore } from "/hooks/intelligence";

function MyComponent() {
  const { data, loading, error } = useTickerScore("AAPL");
  
  // data contient:
  // - overall: score global
  // - breakdown: scores par catégorie
  // - signals: détails des signaux
  // - recommendation: recommandation
  // - confidence: niveau de confiance
}
```

**Pondérations** :
- Options: 30%
- Insiders: 20%
- Dark Pool: 20%
- Short Interest: 15%
- Greeks: 15%

### 3. Market Intelligence (`/dashboards/intelligence/market`)

**Description** : Sector rotation et sentiment global du marché

**Utilisation** :
```javascript
import { useMarketIntelligence } from "/hooks/intelligence";

function MyComponent() {
  const { marketTide, sectorRotation, loading, error } = useMarketIntelligence();
  
  // marketTide: sentiment global
  // sectorRotation: rotations sectorielles
}
```

**Types de rotation** :
- `RISK_ON`: Rotation vers secteurs risqués (Tech, Growth)
- `RISK_OFF`: Rotation vers secteurs défensifs (Utilities, Consumer Staples)
- `VALUE`: Rotation vers la valeur (Financials, Energy)
- `GROWTH`: Rotation vers la croissance (Tech, Healthcare)
- `NEUTRAL`: Pas de rotation claire

### 4. Surveillance (`/dashboards/intelligence/surveillance`)

**Description** : Surveillance continue avec alertes automatiques

**Utilisation** :
```javascript
import { useSurveillance } from "/hooks/intelligence";

function MyComponent() {
  const { 
    watches, 
    alerts, 
    loading, 
    createWatch, 
    deleteWatch,
    checkWatch 
  } = useSurveillance({ autoRefresh: true, refreshInterval: 30000 });
  
  // Créer une surveillance
  await createWatch({
    ticker: "AAPL",
    minPremium: 50000,
    callVolumeThreshold: 1000000,
    shortInterestThreshold: 20,
    checkInterval: 5,
    active: true,
  });
}
```

**Configuration** :
- `ticker`: Ticker à surveiller
- `minPremium`: Premium minimum pour filtrer les options
- `callVolumeThreshold`: Seuil volume calls ($)
- `putVolumeThreshold`: Seuil volume puts ($)
- `darkPoolVolumeThreshold`: Seuil dark pool ($)
- `shortInterestThreshold`: Seuil short interest (%)
- `checkInterval`: Intervalle de vérification (minutes)
- `active`: Actif ou non

### 5. Smart Money (`/dashboards/intelligence/smart-money`)

**Description** : Top hedge funds et copy trades

**Utilisation** :
```javascript
import { useTopHedgeFunds, useCopyTrades } from "/hooks/intelligence";

// Top hedge funds
function FundsComponent() {
  const { data, loading } = useTopHedgeFunds('3M');
  // data.funds: liste des hedge funds
}

// Copy trades
function TradesComponent() {
  const { data, loading } = useCopyTrades('0001697748', 'AAPL');
  // data.trades: liste des trades
}
```

**Note** : Pour les institutions, utiliser le CIK si le nom ne fonctionne pas :
- Berkshire Hathaway: `0001697748`
- BlackRock: `0001364742`
- Vanguard: `0000102909`

## Service Intelligence

### Utilisation directe du service

```javascript
import intelligenceService from "/services/intelligenceService";

// Avec cache automatique
const analysis = await intelligenceService.getCompleteAnalysis("AAPL");

// Forcer le refresh
const freshAnalysis = await intelligenceService.getCompleteAnalysis("AAPL", true);

// Autres méthodes
const score = await intelligenceService.getTickerScore("AAPL");
const marketTide = await intelligenceService.getMarketTide();
const sectorRotation = await intelligenceService.getSectorRotation();
const topFunds = await intelligenceService.getTopHedgeFunds('3M');
```

### Cache

Le service implémente un cache en mémoire avec des durées différentes :
- **Complete Analysis**: 10 minutes
- **Ticker Score**: 5 minutes
- **Market Tide**: 1 heure
- **Sector Rotation**: 1 heure
- **Top Funds**: 1 heure

## Composants Réutilisables

### ScoreCard

```javascript
import ScoreCard from "/pagesComponents/dashboards/intelligence/components/ScoreCard";

<ScoreCard
  title="Score Global"
  score={75}
  maxScore={100}
  color="info"
  recommendation="BUY"
  confidence={85}
  breakdown={{
    options: 80,
    insiders: 70,
    darkPool: 75,
  }}
/>
```

### AnalysisCard

```javascript
import AnalysisCard from "/pagesComponents/dashboards/intelligence/components/AnalysisCard";

<AnalysisCard
  title="Fundamental Analysis"
  score={75}
  color="info"
  indicators={[
    { label: "Undervalued", value: true },
    { label: "Strong Ratios", value: true },
  ]}
  details={{
    peRatio: 28.5,
    debtToEquity: 0.3,
    revenueGrowth: 5.2,
  }}
/>
```

## Configuration

### Variables d'environnement

Ajouter dans `.env.local` :
```env
NEXT_PUBLIC_API_MAIN_URL=https://tsdd1sibd1.execute-api.eu-west-3.amazonaws.com/prod
```

### Routes

Les routes sont automatiquement ajoutées dans le menu de navigation sous la catégorie "Intelligence".

## API Endpoints

Tous les endpoints utilisent l'**API Gateway 1** (Application Principale) :

- `/analysis/{ticker}/complete` - Analyse complète
- `/analysis/{ticker}/divergence` - Détection de divergences
- `/analysis/{ticker}/valuation` - Valuation complète
- `/analysis/{ticker}/earnings-prediction` - Prédiction earnings
- `/analysis/{ticker}/risk` - Analyse de risque
- `/ticker-analysis/{ticker}/score` - Score composite
- `/ticker-analysis/{ticker}/breakdown` - Breakdown détaillé
- `/ticker-analysis/{ticker}/gamma-squeeze` - Gamma squeeze
- `/market-analysis/sector-rotation` - Sector rotation
- `/market-analysis/market-tide` - Market tide
- `/smart-money/top-hedge-funds` - Top hedge funds
- `/smart-money/institution/{name}/copy-trades/{ticker}` - Copy trades
- `/surveillance/watch` - CRUD surveillances
- `/alerts` - CRUD alertes

## Exemples d'utilisation

### Dashboard avec plusieurs analyses

```javascript
import { useCompleteAnalysis, useTickerScore } from "/hooks/intelligence";

function Dashboard({ ticker }) {
  const { data: analysis, loading: loadingAnalysis } = useCompleteAnalysis(ticker);
  const { data: score, loading: loadingScore } = useTickerScore(ticker);
  
  if (loadingAnalysis || loadingScore) {
    return <LoadingSkeleton />;
  }
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <CompleteAnalysisCard data={analysis} />
      </Grid>
      <Grid item xs={12} md={6}>
        <ScoreCard data={score} />
      </Grid>
    </Grid>
  );
}
```

### Surveillance avec polling

```javascript
import { useSurveillance } from "/hooks/intelligence";

function SurveillancePage() {
  const { watches, alerts, createWatch } = useSurveillance({
    autoRefresh: true,
    refreshInterval: 30000, // 30 secondes
  });
  
  // Les alertes sont automatiquement mises à jour toutes les 30 secondes
  return (
    <div>
      {watches.map(watch => (
        <WatchCard 
          key={watch.id} 
          watch={watch} 
          alerts={alerts[watch.id] || []} 
        />
      ))}
    </div>
  );
}
```

## Bonnes Pratiques

1. **Utiliser les hooks** : Préférer les hooks personnalisés plutôt que d'appeler directement le service
2. **Gérer les erreurs** : Toujours gérer les états `loading` et `error`
3. **Cache** : Le service gère automatiquement le cache, pas besoin de le faire manuellement
4. **Refresh** : Utiliser `refetch()` ou `forceRefresh: true` pour forcer un refresh
5. **Polling** : Pour la surveillance, utiliser `autoRefresh: true` dans le hook

## Support

Pour toute question :
- Consulter `FRONTEND_IMPLEMENTATION_GUIDE.md` pour les détails techniques
- Vérifier `api-tests.http` pour des exemples d'endpoints
- Consulter les types TypeScript dans `/Users/souhailsouid/startup/personamy/backend/services/api/src/types/`



