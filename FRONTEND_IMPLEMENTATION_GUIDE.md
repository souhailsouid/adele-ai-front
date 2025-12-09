# 📘 Guide d'Implémentation Frontend - Services FMP + Unusual Whales

## 🎯 Objectif de ce document

Ce document fournit **toutes les informations nécessaires** pour implémenter efficacement les nouveaux services backend dans le frontend, avec :
- **Finalité business** de chaque service
- **Fonctionnalités attendues** et cas d'usage
- **Optimisations** et patterns d'utilisation
- **Architecture recommandée** côté frontend
- **Exemples concrets** d'intégration

---

## 🏗️ Architecture API

### 2 API Gateways - Pourquoi cette séparation ?

**API Gateway 1** (`@baseUrlMain`) : **Application & Intelligence**
- **URL** : `https://tsdd1sibd1.execute-api.eu-west-3.amazonaws.com/prod`
- **Finalité** : Services métier qui **combinent et analysent** les données
- **Routes** : Analyse combinée, scoring, surveillance, alertes, smart money, market analysis
- **Performance** : 2-5 secondes (appels multiples aux APIs externes)
- **Cache** : Oui, certaines réponses sont mises en cache

**API Gateway 2** (`@baseUrlData`) : **Données Brutes**
- **URL** : `https://faq9dl95v7.execute-api.eu-west-3.amazonaws.com/prod`
- **Finalité** : Accès direct aux **données brutes** FMP et Unusual Whales
- **Routes** : `/fmp/*` et `/unusual-whales/*`
- **Performance** : 500ms - 2 secondes (appels directs)
- **Cache** : Oui, agressif (24h pour la plupart)

**Pourquoi 2 gateways ?**
- Limite AWS : 300 routes par API Gateway
- Séparation logique : Intelligence vs Données
- Optimisation : Routes de données peuvent être mises en cache différemment
- Scalabilité : Possibilité de scaler indépendamment

---

## 📊 Services Disponibles - Finalité & Implémentation

### 1. Analyse Combinée (FMP + UW)

#### 1.1 Analyse Complète - `/analysis/{ticker}/complete`

**🎯 Finalité Business** :
Identifier les **meilleures opportunités d'investissement** en combinant :
- **Fundamentals (FMP)** : "L'entreprise est-elle solide financièrement ?"
- **Sentiment (UW)** : "Les traders sont-ils optimistes ?"

**💡 Cas d'Usage** :
- **Dashboard principal** : Vue d'ensemble d'un ticker
- **Recherche d'opportunités** : Identifier les tickers où fundamentals ET sentiment sont alignés positivement
- **Décision d'investissement** : Aide à la décision avec score combiné

**📋 Fonctionnalités Attendues** :
```typescript
interface CompleteAnalysis {
  ticker: string;
  fundamental: {
    score: number; // 0-100
    undervalued: boolean;
    strongRatios: boolean;
    growingRevenue: boolean;
    details: {
      peRatio?: number;
      debtToEquity?: number;
      revenueGrowth?: number;
    };
  };
  sentiment: {
    score: number; // 0-100
    bullishOptions: boolean;
    darkPoolActivity: boolean;
    lowShortInterest: boolean;
    details: {
      callPutRatio?: number;
      darkPoolTrades?: number;
      shortPercentOfFloat?: number;
    };
  };
  convergence: {
    aligned: boolean; // Fundamentals et sentiment alignés
    divergence: number; // Différence entre scores
    type: 'bullish_aligned' | 'bearish_aligned' | 'bullish_divergence' | 'bearish_divergence';
    opportunity: boolean; // Opportunité si divergence significative
  };
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  confidence: number; // 0-100
}
```

**⚡ Optimisations Frontend** :
1. **Cache agressif** : Cachez la réponse pendant **10 minutes** (les fundamentals ne changent pas souvent)
2. **Loading state** : Afficher un skeleton avec 2 sections (Fundamentals + Sentiment)
3. **Affichage progressif** : Afficher d'abord les scores, puis les détails
4. **Refresh conditionnel** : Ne rafraîchir que si l'utilisateur demande explicitement

**🎨 UI Recommandée** :
```
┌─────────────────────────────────────┐
│  AAPL - Complete Analysis           │
├─────────────────────────────────────┤
│  Overall Score: 72/100 [BUY]        │
│  Confidence: 85%                     │
├─────────────────────────────────────┤
│  Fundamental Score: 75/100          │
│  ✓ Undervalued  ✓ Strong Ratios    │
│  PE: 28.5  Debt/Equity: 0.3        │
├─────────────────────────────────────┤
│  Sentiment Score: 68/100            │
│  ✓ Bullish Options  ✓ Low Short     │
│  Call/Put: 1.8  Dark Pool: 15      │
├─────────────────────────────────────┤
│  Convergence: Aligned Bullish      │
│  → Strong buy opportunity           │
└─────────────────────────────────────┘
```

**📝 Exemple d'Intégration** :
```typescript
// hooks/useCompleteAnalysis.ts
export function useCompleteAnalysis(ticker: string) {
  const [data, setData] = useState<CompleteAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Cache côté frontend (10 minutes)
    const cacheKey = `complete_analysis_${ticker}`;
    const cached = localStorage.getItem(cacheKey);
    const cachedTime = cached ? JSON.parse(cached).timestamp : 0;
    const now = Date.now();
    
    if (cached && (now - cachedTime < 10 * 60 * 1000)) {
      setData(JSON.parse(cached).data);
      setLoading(false);
      return;
    }
    
    fetch(`${API_MAIN_URL}/analysis/${ticker}/complete`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setData(result.data);
          // Mettre en cache
          localStorage.setItem(cacheKey, JSON.stringify({
            data: result.data,
            timestamp: now
          }));
        }
      })
      .finally(() => setLoading(false));
  }, [ticker]);
  
  return { data, loading };
}
```

---

#### 1.2 Détection de Divergences - `/analysis/{ticker}/divergence`

**🎯 Finalité Business** :
Détecter les **opportunités d'arbitrage** où le sentiment ne correspond pas aux fundamentals :
- **Fundamentals forts + Sentiment faible** = Opportunité d'achat (marché sous-estime)
- **Fundamentals faibles + Sentiment fort** = Risque de vente (marché sur-estime)

**💡 Cas d'Usage** :
- **Contrarian investing** : Identifier les tickers sous-évalués par le marché
- **Alertes de divergence** : Notifier quand une divergence significative apparaît
- **Timing d'entrée** : Entrer quand fundamentals > sentiment (achat) ou inversement (vente)

**📋 Fonctionnalités Attendues** :
```typescript
interface DivergenceAnalysis {
  ticker: string;
  fundamentalScore: number; // 0-100
  sentimentScore: number; // 0-100
  divergence: number; // Positif = fundamentals meilleurs que sentiment
  type: 'fundamental_bullish_sentiment_bearish' | // Opportunité d'achat
        'fundamental_bearish_sentiment_bullish' | // Risque de vente
        'aligned_bullish' | // Tout est positif
        'aligned_bearish'; // Tout est négatif
  opportunity: {
    isOpportunity: boolean;
    type: 'buy' | 'sell' | 'hold';
    confidence: number;
    reasoning: string;
    timeframe?: string;
  };
  signals: {
    fundamental: FundamentalSignals;
    sentiment: SentimentSignals;
  };
}
```

**⚡ Optimisations Frontend** :
1. **Calcul côté frontend** : Si vous avez déjà les scores, calculez la divergence localement
2. **Alertes automatiques** : Surveiller les divergences > 20 points
3. **Historique** : Stocker l'historique des divergences pour détecter les tendances

**🎨 UI Recommandée** :
```
┌─────────────────────────────────────┐
│  Divergence Analysis: AAPL         │
├─────────────────────────────────────┤
│  Fundamental: 75  Sentiment: 50     │
│  Divergence: +25 (Fundamental >)   │
│  Type: Fundamental Bullish /        │
│        Sentiment Bearish            │
├─────────────────────────────────────┤
│  🎯 OPPORTUNITY DETECTED            │
│  Type: BUY                          │
│  Confidence: 80%                    │
│  Reasoning: Strong fundamentals    │
│  but market sentiment is negative.  │
│  Potential undervaluation.          │
│  Timeframe: Medium-term             │
└─────────────────────────────────────┘
```

---

#### 1.3 Valuation Complète - `/analysis/{ticker}/valuation`

**🎯 Finalité Business** :
Calculer la **valeur intrinsèque ajustée** en combinant :
- **DCF (FMP)** : Valeur basée sur les cash flows futurs
- **Sentiment Multiplier (UW)** : Ajustement basé sur le sentiment de marché

**💡 Cas d'Usage** :
- **Décision d'achat/vente** : Comparer prix actuel vs valeur intrinsèque ajustée
- **Target price** : Déterminer un prix cible réaliste
- **Upside/Downside** : Calculer le potentiel de gain/perte

**📋 Fonctionnalités Attendues** :
```typescript
interface ComprehensiveValuation {
  ticker: string;
  currentPrice: number;
  dcfValue: number; // Valeur DCF pure
  sentimentMultiplier: number; // 0.8 - 1.2 (ajustement sentiment)
  adjustedValue: number; // DCF * Sentiment Multiplier
  upside: number; // % de hausse potentielle
  downside: number; // % de baisse potentielle
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  confidence: number;
  breakdown: {
    dcf: { value: number; method: string };
    sentiment: { multiplier: number; reasoning: string };
  };
}
```

**⚡ Optimisations Frontend** :
1. **Cache long** : Cachez 1 heure (DCF ne change pas souvent)
2. **Visualisation** : Graphique comparant prix actuel, DCF, et valeur ajustée
3. **Alertes** : Notifier quand upside > 20% ou downside > 15%

**🎨 UI Recommandée** :
```
┌─────────────────────────────────────┐
│  Valuation: AAPL                    │
├─────────────────────────────────────┤
│  Current Price: $175.50              │
│  DCF Value: $200.00                  │
│  Sentiment Multiplier: 0.95         │
│  Adjusted Value: $190.00             │
├─────────────────────────────────────┤
│  Upside: +8.3%                       │
│  Downside: -7.7%                     │
│  Recommendation: BUY                 │
├─────────────────────────────────────┤
│  [Graphique: Prix actuel vs DCF vs  │
│   Valeur ajustée]                   │
└─────────────────────────────────────┘
```

---

#### 1.4 Prédiction d'Earnings - `/analysis/{ticker}/earnings-prediction`

**🎯 Finalité Business** :
Prédire les **surprises d'earnings** avant la publication en combinant :
- **Historique (FMP)** : Pattern des surprises passées
- **Options flow (UW)** : Activité pré-earnings (beaucoup de calls = positif)
- **Insiders (UW)** : Transactions des dirigeants avant earnings
- **Analystes (FMP)** : Estimations et upgrades/downgrades

**💡 Cas d'Usage** :
- **Trading pré-earnings** : Positionner avant la publication
- **Alertes earnings** : Notifier 7 jours avant avec prédiction
- **Gestion de risque** : Éviter les positions risquées avant earnings

**📋 Fonctionnalités Attendues** :
```typescript
interface EarningsPrediction {
  ticker: string;
  earningsDate?: string;
  predictedSurprise: number; // % de surprise (positif = beat, négatif = miss)
  confidence: number; // 0-100
  signals: {
    options: {
      score: number;
      callVolume: number;
      putVolume: number;
      unusualActivity: number;
      interpretation: string;
    };
    insiders: {
      score: number;
      buys: number;
      sells: number;
      interpretation: string;
    };
    darkPool: {
      score: number;
      volume: number;
      interpretation: string;
    };
    analysts: {
      score: number;
      upgrades: number;
      downgrades: number;
      interpretation: string;
    };
    historical: {
      score: number;
      averageSurprise: number;
      beatRate: number; // % de fois qu'ils ont beat
      interpretation: string;
    };
  };
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
}
```

**⚡ Optimisations Frontend** :
1. **Refresh fréquent** : Rafraîchir tous les jours avant earnings (les signaux changent)
2. **Timeline** : Afficher un timeline avec les signaux au fil du temps
3. **Comparaison** : Comparer la prédiction avec les estimations des analystes

**🎨 UI Recommandée** :
```
┌─────────────────────────────────────┐
│  Earnings Prediction: AAPL           │
│  Earnings Date: 2025-01-30           │
├─────────────────────────────────────┤
│  Predicted Surprise: +5.2%           │
│  Confidence: 75%                     │
│  Recommendation: BUY                 │
├─────────────────────────────────────┤
│  Signals:                            │
│  ✓ Options: Bullish (1.8x calls)    │
│  ✓ Insiders: 2 buys, 0 sells        │
│  ✓ Dark Pool: High activity          │
│  ✓ Analysts: 3 upgrades              │
│  ✓ Historical: 80% beat rate        │
└─────────────────────────────────────┘
```

---

#### 1.5 Screening Multi-Critères - `POST /screener/multi-criteria`

**🎯 Finalité Business** :
Trouver des **tickers qui matchent plusieurs critères** simultanément :
- **Fundamentals (FMP)** : Market cap, PE ratio, revenue growth, etc.
- **Sentiment (UW)** : Options flow, dark pool, short interest, etc.

**💡 Cas d'Usage** :
- **Recherche d'opportunités** : Trouver des tickers sous-évalués avec sentiment positif
- **Filtrage de portefeuille** : Filtrer un watchlist par critères
- **Découverte** : Découvrir de nouveaux tickers intéressants

**📋 Fonctionnalités Attendues** :
```typescript
interface ScreeningCriteria {
  // Fundamentals
  minMarketCap?: number;
  maxMarketCap?: number;
  minPERatio?: number;
  maxPERatio?: number;
  minRevenueGrowth?: number;
  maxDebtToEquity?: number;
  sector?: string;
  
  // Sentiment
  minSentimentScore?: number;
  minCallPutRatio?: number;
  maxShortInterest?: number;
  
  // Résultats
  limit?: number;
  sortBy?: 'marketCap' | 'sentimentScore' | 'fundamentalScore' | 'combinedScore';
}

interface ScreeningResult {
  tickers: Array<{
    ticker: string;
    fundamentalScore: number;
    sentimentScore: number;
    combinedScore: number;
    marketCap: number;
    peRatio: number;
    revenueGrowth: number;
    sentiment: {
      callPutRatio: number;
      shortInterest: number;
    };
  }>;
  total: number;
  criteria: ScreeningCriteria;
}
```

**⚡ Optimisations Frontend** :
1. **Debouncing** : Attendre 500ms après la dernière modification de critère
2. **Pagination** : Limiter à 20 résultats par page
3. **Sauvegarde** : Permettre de sauvegarder les critères de recherche
4. **Export** : Exporter les résultats en CSV

**🎨 UI Recommandée** :
```
┌─────────────────────────────────────┐
│  Multi-Criteria Screener            │
├─────────────────────────────────────┤
│  Fundamentals:                      │
│  Market Cap: [1B - 100B]            │
│  PE Ratio: [< 30]                   │
│  Revenue Growth: [> 5%]              │
│  Sector: [Technology ▼]             │
├─────────────────────────────────────┤
│  Sentiment:                         │
│  Min Sentiment Score: [60]          │
│  Max Short Interest: [10%]           │
├─────────────────────────────────────┤
│  [Search] [Save Criteria]           │
├─────────────────────────────────────┤
│  Results (15 found):                │
│  AAPL  | F:75 S:68 | Combined: 72  │
│  MSFT  | F:80 S:65 | Combined: 73   │
│  ...                                 │
└─────────────────────────────────────┘
```

---

#### 1.6 Analyse de Risque - `/analysis/{ticker}/risk`

**🎯 Finalité Business** :
Évaluer les **risques globaux** d'un investissement en combinant :
- **Risques financiers (FMP)** : Dette, liquidité, solvabilité
- **Risques de marché (UW)** : Volatilité, short interest, options flow

**💡 Cas d'Usage** :
- **Due diligence** : Évaluer les risques avant d'investir
- **Gestion de portefeuille** : Identifier les positions à risque
- **Alertes de risque** : Notifier quand le risque augmente

**📋 Fonctionnalités Attendues** :
```typescript
interface RiskAnalysis {
  ticker: string;
  overallRisk: number; // 0-100 (0 = aucun risque, 100 = très risqué)
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  breakdown: {
    financial: {
      score: number;
      debtRisk: boolean;
      liquidityRisk: boolean;
      solvencyRisk: boolean;
    };
    market: {
      score: number;
      volatilityRisk: boolean;
      shortSqueezeRisk: boolean;
      optionsRisk: boolean;
    };
    liquidity: {
      score: number;
      volumeRisk: boolean;
      spreadRisk: boolean;
    };
  };
  recommendations: string[];
}
```

**⚡ Optimisations Frontend** :
1. **Visualisation** : Graphique radar avec les 3 types de risques
2. **Historique** : Suivre l'évolution du risque dans le temps
3. **Comparaison** : Comparer le risque avec d'autres tickers du même secteur

---

#### 1.7 Tracking d'Institutions - `/institutions/{name}/tracking`

**🎯 Finalité Business** :
Suivre les **mouvements des institutions** (hedge funds, fonds) pour :
- **Copy trading** : Copier les trades des meilleurs gestionnaires
- **Détection de rotations** : Identifier quand les institutions changent de stratégie
- **Analyse sectorielle** : Comprendre les expositions sectorielles

**💡 Cas d'Usage** :
- **Smart money tracking** : Suivre les top hedge funds
- **Alertes institutionnelles** : Notifier quand une institution achète/vend
- **Analyse de portefeuille** : Voir comment les institutions sont positionnées

**📋 Fonctionnalités Attendues** :
```typescript
interface InstitutionTracking {
  institutionName: string;
  recentActivity: Array<{
    ticker: string;
    transactionType: 'BUY' | 'SELL' | 'HOLD';
    shares: number;
    value: number;
    date: string;
  }>;
  topPositions: Array<{
    ticker: string;
    shares: number;
    value: number;
    weight: number; // % du portefeuille
    change: number; // Changement récent
  }>;
  sectorExposure: Array<{
    sector: string;
    weight: number;
    value: number;
  }>;
  performance: {
    period: string;
    return: number; // %
  };
}
```

**⚡ Optimisations Frontend** :
1. **CIK vs Nom** : Utiliser le CIK si le nom ne fonctionne pas (ex: `0001697748` pour Berkshire)
2. **Cache moyen** : Cachez 1 heure (les positions changent lentement)
3. **Visualisation** : Graphique en secteurs pour l'exposition sectorielle

---

#### 1.8 Analyse de Secteur - `/analysis/sector/{sector}`

**🎯 Finalité Business** :
Analyser un **secteur entier** en combinant :
- **Fundamentals (FMP)** : PE moyen, croissance, profitabilité
- **Sentiment (UW)** : Options flow sectoriel, dark pool, short interest

**💡 Cas d'Usage** :
- **Sector rotation** : Identifier les secteurs en rotation
- **Découverte** : Trouver les meilleurs tickers d'un secteur
- **Allocation** : Aider à l'allocation sectorielle du portefeuille

**📋 Fonctionnalités Attendues** :
```typescript
interface SectorAnalysis {
  sector: string;
  averagePE: number;
  averageRevenueGrowth: number;
  sentiment: {
    score: number;
    bullishOptions: boolean;
    lowShortInterest: boolean;
  };
  topPerformers: Array<{
    ticker: string;
    score: number;
    priceChange: number; // % sur période
  }>;
  recommendations: Array<{
    ticker: string;
    reason: string;
    action: 'BUY' | 'SELL' | 'HOLD';
  }>;
}
```

---

### 2. Services Avancés

#### 2.1 Scoring Automatique - `/ticker-analysis/{ticker}/score`

**🎯 Finalité Business** :
Calculer un **score composite 0-100** basé sur tous les signaux de marché pour :
- **Ranking** : Classer les tickers par score
- **Décision rapide** : Aide à la décision avec un seul nombre
- **Surveillance** : Surveiller l'évolution du score

**💡 Cas d'Usage** :
- **Dashboard principal** : Afficher le score en premier
- **Watchlist** : Trier la watchlist par score
- **Alertes** : Notifier quand le score change significativement

**📋 Fonctionnalités Attendues** :
```typescript
interface TickerScore {
  ticker: string;
  overall: number; // 0-100
  breakdown: {
    options: number; // 0-100 (pondération: 30%)
    insiders: number; // 0-100 (pondération: 20%)
    darkPool: number; // 0-100 (pondération: 20%)
    shortInterest: number; // 0-100 (pondération: 15%)
    greeks: number; // 0-100 (pondération: 15%)
  };
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  confidence: number; // 0-100
  signals: {
    options: {
      score: number;
      callPutRatio: number;
      callVolume: number;
      putVolume: number;
      unusualActivity: number;
    };
    insiders: {
      score: number;
      buys: number;
      sells: number;
    };
    darkPool: {
      score: number;
      volume: number;
    };
    shortInterest: {
      score: number;
      shortPercentOfFloat: number;
    };
    greeks: {
      score: number;
      gamma: number;
      maxPain: number;
    };
  };
}
```

**⚡ Optimisations Frontend** :
1. **Cache court** : Cachez 5 minutes (le score peut changer rapidement)
2. **Visualisation** : Graphique radar avec les 5 sous-scores
3. **Historique** : Suivre l'évolution du score dans le temps
4. **Comparaison** : Comparer le score avec d'autres tickers

**🎨 UI Recommandée** :
```
┌─────────────────────────────────────┐
│  Score: AAPL                       │
├─────────────────────────────────────┤
│  Overall: 72/100 [BUY]             │
│  Confidence: 85%                    │
├─────────────────────────────────────┤
│  Breakdown:                         │
│  Options:    75/100 (30%)           │
│  Insiders:   60/100 (20%)           │
│  Dark Pool:  70/100 (20%)           │
│  Short Int:  80/100 (15%)           │
│  Greeks:     65/100 (15%)           │
├─────────────────────────────────────┤
│  [Graphique radar]                  │
└─────────────────────────────────────┘
```

---

#### 2.2 Gamma Squeeze Detection - `/ticker-analysis/{ticker}/gamma-squeeze`

**🎯 Finalité Business** :
Détecter le **potentiel de gamma squeeze** (mouvement de prix explosif) basé sur :
- **GEX (Gamma Exposure)** : Impact des options sur le prix
- **Options flow** : Volume de calls vs puts
- **Short interest** : Niveau de shorting
- **Greeks** : Niveaux de gamma et max pain

**💡 Cas d'Usage** :
- **Trading à court terme** : Identifier les opportunités de squeeze
- **Gestion de risque** : Éviter les positions courtes risquées
- **Alertes** : Notifier quand un squeeze est probable

**📋 Fonctionnalités Attendues** :
```typescript
interface GammaSqueezeAnalysis {
  ticker: string;
  squeezeProbability: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  indicators: {
    gex: number; // Gamma Exposure
    callFlowRatio: number; // Ratio calls/puts
    shortRatio: number; // Short interest ratio
    gammaLevel: number; // Niveau de gamma
  };
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  timeframe: 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';
}
```

**⚡ Optimisations Frontend** :
1. **Refresh fréquent** : Rafraîchir toutes les 5 minutes (les conditions changent vite)
2. **Alertes** : Notifier quand probability > 70%
3. **Visualisation** : Graphique montrant l'évolution de la probabilité

---

#### 2.3 Surveillance Continue - `/surveillance/*`

**🎯 Finalité Business** :
Surveiller un ticker **en continu** et générer des **alertes automatiques** quand certains seuils sont dépassés.

**💡 Cas d'Usage** :
- **Surveillance passive** : Surveiller plusieurs tickers sans intervention
- **Alertes automatiques** : Recevoir des notifications quand quelque chose se passe
- **Gestion de portefeuille** : Surveiller les positions existantes

**📋 Fonctionnalités Attendues** :
```typescript
// Créer une surveillance
POST /surveillance/watch
Body: {
  ticker: "AAPL",
  minPremium: 50000, // Premium minimum pour filtrer
  callVolumeThreshold: 1000000, // Seuil volume calls ($)
  putVolumeThreshold: 500000, // Seuil volume puts ($)
  darkPoolVolumeThreshold: 5000000, // Seuil dark pool ($)
  shortInterestThreshold: 20, // Seuil short interest (%)
  insiderChangeThreshold: 10, // Seuil changement insider (%)
  checkInterval: 5, // Vérifier toutes les 5 minutes
  notificationChannels: ["webhook", "email"],
  active: true
}

// Récupérer les alertes
GET /surveillance/watch/{id}/alerts
Response: {
  alerts: Array<{
    id: string;
    type: 'options_flow_spike' | 'dark_pool_activity' | 'short_interest_change' | 'insider_activity';
    message: string;
    data: Record<string, any>;
    triggeredAt: string;
    read: boolean;
  }>;
  total: number;
}
```

**⚡ Optimisations Frontend** :
1. **Polling** : Poller `/surveillance/watch/{id}/alerts` toutes les 30 secondes
2. **WebSocket** : Si disponible, utiliser WebSocket pour les alertes en temps réel
3. **Filtres** : Permettre de filtrer les alertes par type
4. **Marquer comme lu** : API pour marquer les alertes comme lues

**🎨 UI Recommandée** :
```
┌─────────────────────────────────────┐
│  Surveillance: AAPL                │
│  [Active] [Pause] [Delete]          │
├─────────────────────────────────────┤
│  Config:                            │
│  ✓ Call Volume > $1M                │
│  ✓ Dark Pool > $5M                  │
│  ✓ Short Interest > 20%              │
│  Check: Every 5 minutes            │
├─────────────────────────────────────┤
│  Recent Alerts (3):                 │
│  🔔 Options Flow Spike (2h ago)     │
│     Call volume: $2.5M              │
│  🔔 Dark Pool Activity (5h ago)     │
│     Volume: $8M                     │
└─────────────────────────────────────┘
```

---

#### 2.4 Alertes Multi-Signaux - `/alerts/*`

**🎯 Finalité Business** :
Créer des **alertes personnalisées** avec logique AND/OR sur plusieurs signaux simultanément.

**💡 Cas d'Usage** :
- **Alertes complexes** : "Options flow élevé ET insiders achètent"
- **Conditions multiples** : "Dark pool élevé OU short interest élevé"
- **Stratégies personnalisées** : Créer des alertes selon votre stratégie

**📋 Fonctionnalités Attendues** :
```typescript
// Créer une alerte
POST /alerts
Body: {
  ticker: "AAPL",
  name: "Alerte Options Flow + Insiders",
  description: "Déclenche si options flow élevé ET insiders achètent",
  conditions: [
    {
      signal: "options_flow",
      operator: "gt", // greater than
      value: 1000000,
      params: { type: "call" }
    },
    {
      signal: "insider_activity",
      operator: "gt",
      value: 2 // Nombre de buys
    }
  ],
  logic: "AND", // Toutes les conditions doivent être remplies
  notificationChannels: ["webhook", "email"],
  active: true
}

// Tester une alerte
POST /alerts/{id}/test
Response: {
  triggered: boolean;
  conditions: Array<{
    condition: AlertCondition;
    met: boolean;
    value: any;
  }>;
}
```

**⚡ Optimisations Frontend** :
1. **Builder d'alertes** : Interface visuelle pour créer des alertes
2. **Prévisualisation** : Tester l'alerte avant de l'activer
3. **Historique** : Voir l'historique des déclenchements

---

#### 2.5 Smart Money - `/smart-money/*`

**🎯 Finalité Business** :
Identifier les **meilleurs hedge funds** et **copier leurs trades** pour :
- **Copy trading** : Suivre les meilleurs gestionnaires
- **Découverte** : Découvrir de nouvelles opportunités via les institutions
- **Validation** : Valider une idée en voyant si les institutions sont alignées

**📋 Fonctionnalités Attendues** :
```typescript
// Top hedge funds
GET /smart-money/top-hedge-funds?period=3M
Response: {
  funds: Array<{
    name: string;
    performance: number; // % sur la période
    totalValue: number;
    holdingsCount: number;
    topPositions: Array<{
      ticker: string;
      weight: number;
    }>;
  }>;
  period: '1M' | '3M' | '6M' | '1Y';
}

// Copy trades d'une institution
GET /smart-money/institution/{cik}/copy-trades/{ticker}
Response: {
  trades: Array<{
    ticker: string;
    tradeType: 'BUY' | 'SELL' | 'HOLD';
    shares: number;
    value: number;
    date: string;
    confidence: number;
    recommendation: 'FOLLOW' | 'AVOID' | 'MONITOR';
  }>;
  institutionName: string;
}
```

**⚡ Optimisations Frontend** :
1. **CIK lookup** : Permettre de rechercher une institution par nom et obtenir son CIK
2. **Cache long** : Cachez 1 heure (les positions changent lentement)
3. **Filtres** : Filtrer par période, performance, secteur

**⚠️ Important** : Utiliser le **CIK** si le nom ne fonctionne pas :
- Berkshire Hathaway: `0001697748`
- BlackRock: `0001364742`
- Vanguard: `0000102909`

---

#### 2.6 Market Analysis - `/market-analysis/*`

**🎯 Finalité Business** :
Analyser le **marché global** pour :
- **Sector rotation** : Identifier les rotations sectorielles (RISK_ON, RISK_OFF, VALUE, GROWTH)
- **Market tide** : Sentiment global du marché
- **Allocation** : Aider à l'allocation sectorielle

**📋 Fonctionnalités Attendues** :
```typescript
// Sector Rotation
GET /market-analysis/sector-rotation
Response: {
  currentRotation: 'RISK_ON' | 'RISK_OFF' | 'VALUE' | 'GROWTH' | 'NEUTRAL';
  predictedRotation: string;
  sectors: Array<{
    sector: string;
    currentTide: number; // 0-100
    performance: number; // % sur période
  }>;
  recommendations: Array<{
    sector: string;
    action: 'OVERWEIGHT' | 'UNDERWEIGHT' | 'NEUTRAL';
    reasoning: string;
  }>;
}

// Market Tide
GET /market-analysis/market-tide
Response: {
  overall: number; // 0-100
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  volatility: 'LOW' | 'MEDIUM' | 'HIGH';
  sectors: {
    strongest: string[]; // Top 3 secteurs
    weakest: string[]; // Bottom 3 secteurs
  };
}
```

**⚡ Optimisations Frontend** :
1. **Refresh quotidien** : Rafraîchir une fois par jour (le marché change lentement)
2. **Visualisation** : Graphique montrant les rotations dans le temps
3. **Alertes** : Notifier quand une rotation est détectée

---

## 🏗️ Architecture Frontend Recommandée

### Structure de Dossiers
```
src/
├── services/
│   ├── api/
│   │   ├── mainGateway.ts      # Client API Gateway 1
│   │   ├── dataGateway.ts       # Client API Gateway 2
│   │   └── types.ts             # Types TypeScript
│   ├── cache/
│   │   └── apiCache.ts          # Cache côté frontend
│   └── hooks/
│       ├── useCompleteAnalysis.ts
│       ├── useTickerScore.ts
│       ├── useSurveillance.ts
│       └── useAlerts.ts
├── components/
│   ├── analysis/
│   │   ├── CompleteAnalysis.tsx
│   │   ├── TickerScore.tsx
│   │   └── GammaSqueeze.tsx
│   ├── surveillance/
│   │   ├── WatchList.tsx
│   │   └── AlertList.tsx
│   └── smart-money/
│       ├── TopHedgeFunds.tsx
│       └── CopyTrades.tsx
└── utils/
    ├── apiClient.ts             # Client API centralisé
    └── errorHandler.ts           # Gestion d'erreurs
```

### Client API Centralisé
```typescript
// services/api/apiClient.ts
class ApiClient {
  private mainGateway = 'https://tsdd1sibd1.execute-api.eu-west-3.amazonaws.com/prod';
  private dataGateway = 'https://faq9dl95v7.execute-api.eu-west-3.amazonaws.com/prod';
  private cache = new Map<string, { data: any; timestamp: number }>();
  
  async request(
    gateway: 'main' | 'data',
    endpoint: string,
    options?: RequestInit,
    cacheTime?: number
  ) {
    const url = `${gateway === 'main' ? this.mainGateway : this.dataGateway}${endpoint}`;
    const cacheKey = `${gateway}:${endpoint}`;
    
    // Vérifier le cache
    if (cacheTime) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        return cached.data;
      }
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        ...options?.headers,
      },
    });
    
    const data = await response.json();
    
    // Mettre en cache
    if (cacheTime && data.success) {
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
    }
    
    return data;
  }
}
```

---

## ⚡ Optimisations Globales

### 1. Stratégie de Cache

**Endpoints à cacher longtemps (1h)** :
- `/analysis/{ticker}/valuation` (DCF ne change pas souvent)
- `/institutions/{name}/tracking` (positions changent lentement)
- `/market-analysis/*` (marché change lentement)

**Endpoints à cacher moyen (10 min)** :
- `/analysis/{ticker}/complete` (fundamentals changent lentement)
- `/analysis/{ticker}/divergence`
- `/analysis/sector/{sector}`

**Endpoints à cacher court (5 min)** :
- `/ticker-analysis/{ticker}/score` (peut changer rapidement)
- `/ticker-analysis/{ticker}/gamma-squeeze` (conditions changent)

**Endpoints à ne pas cacher** :
- `/surveillance/watch/{id}/alerts` (données en temps réel)
- `/alerts/{id}/test` (test en temps réel)

### 2. Gestion des Erreurs

```typescript
// utils/errorHandler.ts
export function handleApiError(error: any, endpoint: string) {
  if (error.statusCode === 500) {
    // Erreur API externe (UW ou FMP)
    if (endpoint.includes('/smart-money/institution/')) {
      return {
        message: 'Institution name not recognized. Try using CIK instead.',
        suggestion: 'Use CIK format: 0001697748',
      };
    }
    return {
      message: 'External API error. Please try again later.',
      retry: true,
    };
  }
  
  if (error.statusCode === 401) {
    return {
      message: 'Authentication required. Please login again.',
      action: 'redirect_to_login',
    };
  }
  
  return {
    message: error.message || 'An error occurred',
    retry: false,
  };
}
```

### 3. Performance

**Lazy Loading** :
- Charger les détails seulement quand l'utilisateur clique
- Utiliser React.lazy() pour les composants lourds

**Pagination** :
- Pour les listes longues (screening, alerts), paginer côté frontend
- Limiter à 20-50 éléments par page

**Debouncing** :
- Pour les recherches/screenings, attendre 500ms après la dernière saisie

**Parallel Requests** :
- Pour un dashboard, faire plusieurs requêtes en parallèle avec `Promise.all()`

---

## 📱 Exemples d'Intégration Complets

### Dashboard Principal
```typescript
// components/Dashboard.tsx
function Dashboard({ ticker }: { ticker: string }) {
  // Requêtes en parallèle
  const { data: complete, loading: loadingComplete } = useCompleteAnalysis(ticker);
  const { data: score, loading: loadingScore } = useTickerScore(ticker);
  const { data: gamma, loading: loadingGamma } = useGammaSqueeze(ticker);
  
  if (loadingComplete || loadingScore || loadingGamma) {
    return <DashboardSkeleton />;
  }
  
  return (
    <div>
      <TickerHeader ticker={ticker} />
      <ScoreCard score={score} />
      <CompleteAnalysisCard analysis={complete} />
      <GammaSqueezeCard gamma={gamma} />
    </div>
  );
}
```

### Surveillance en Temps Réel
```typescript
// hooks/useSurveillance.ts
export function useSurveillance(watchId: string) {
  const [alerts, setAlerts] = useState([]);
  
  useEffect(() => {
    const pollAlerts = async () => {
      const response = await apiClient.request(
        'main',
        `/surveillance/watch/${watchId}/alerts`
      );
      if (response.success) {
        setAlerts(response.data.alerts);
      }
    };
    
    // Poller toutes les 30 secondes
    const interval = setInterval(pollAlerts, 30000);
    pollAlerts(); // Premier appel immédiat
    
    return () => clearInterval(interval);
  }, [watchId]);
  
  return { alerts };
}
```

---

## 🎯 Checklist d'Implémentation

### Phase 1 : Services de Base
- [ ] Intégrer `/analysis/{ticker}/complete` dans le dashboard
- [ ] Intégrer `/ticker-analysis/{ticker}/score` dans la watchlist
- [ ] Implémenter le cache côté frontend
- [ ] Gérer les états de chargement

### Phase 2 : Services Avancés
- [ ] Implémenter la surveillance continue
- [ ] Créer le système d'alertes
- [ ] Intégrer Smart Money (top hedge funds)
- [ ] Ajouter Market Analysis (sector rotation)

### Phase 3 : Optimisations
- [ ] Implémenter le cache stratégique
- [ ] Optimiser les requêtes parallèles
- [ ] Ajouter la pagination
- [ ] Implémenter les alertes en temps réel

---

## 📚 Ressources

- **Tests HTTP** : `api-tests.http` (exemples concrets)
- **Scripts de test** : `scripts/test-*.sh` (validation)
- **Types TypeScript** : `/Users/souhailsouid/startup/personamy/backend/services/api/src/types/` (structures complètes)
- **Documentation backend** : `FRONTEND_BRIEF.md` (référence rapide)

---

## ❓ Support

Pour toute question :
1. Consulter `api-tests.http` pour des exemples
2. Vérifier les logs CloudWatch pour les erreurs
3. Tester avec les scripts bash fournis

