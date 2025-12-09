# 📱 Brief Frontend : Nouveaux Services FMP + Unusual Whales

## 🎯 Vue d'ensemble

Le backend a été enrichi avec **12 nouveaux services** combinant les données **FMP (Financial Modeling Prep)** et **Unusual Whales** pour offrir une analyse complète des tickers, institutions et marchés.

---

## 🔗 Architecture API

### 2 API Gateways

**API Gateway 1** (`@baseUrlMain`) : Application principale
- Base URL : `https://tsdd1sibd1.execute-api.eu-west-3.amazonaws.com/prod`
- Routes : Analyse, scoring, surveillance, alertes, smart money, market analysis

**API Gateway 2** (`@baseUrlData`) : Données brutes
- Base URL : `https://faq9dl95v7.execute-api.eu-west-3.amazonaws.com/prod`
- Routes : `/fmp/*` et `/unusual-whales/*` (données brutes uniquement)

### Authentification
Tous les endpoints nécessitent un **Bearer Token** dans le header :
```
Authorization: Bearer {ACCESS_TOKEN}
```

---

## 📊 Nouveaux Endpoints Disponibles

### 1. Analyse Combinée (FMP + UW) - 8 endpoints

#### Analyse Complète
```
GET /analysis/{ticker}/complete
```
**Description** : Combine fundamentals (FMP) + sentiment de marché (UW)  
**Réponse** : `fundamentalScore`, `sentimentScore`, `recommendation`, `details`

#### Détection de Divergences
```
GET /analysis/{ticker}/divergence
```
**Description** : Détecte les divergences entre fundamentals et sentiment  
**Réponse** : `divergenceType`, `fundamentalScore`, `sentimentScore`, `signals`

#### Valuation Complète
```
GET /analysis/{ticker}/valuation
```
**Description** : DCF + Sentiment Multiplier pour valuation ajustée  
**Réponse** : `dcfValue`, `currentPrice`, `sentimentMultiplier`, `adjustedValue`, `upside`

#### Prédiction d'Earnings
```
GET /analysis/{ticker}/earnings-prediction?earningsDate=YYYY-MM-DD
```
**Description** : Prédiction de surprise d'earnings multi-sources  
**Réponse** : `predictedSurprise`, `confidence`, `signals` (options, insiders, dark pool, analysts)

#### Screening Multi-Critères
```
POST /screener/multi-criteria
Body: {
  "minMarketCap": 1000000000,
  "maxPERatio": 30,
  "minSentimentScore": 60,
  "sector": "Technology",
  "limit": 10
}
```
**Description** : Screening FMP + filtrage par sentiment UW  
**Réponse** : `tickers[]` avec scores combinés

#### Analyse de Risque
```
GET /analysis/{ticker}/risk
```
**Description** : Analyse complète des risques (financier + marché)  
**Réponse** : `overallRisk`, `riskLevel`, `breakdown` (financial, market, liquidity)

#### Tracking d'Institutions
```
GET /institutions/{name}/tracking
```
**Description** : Tracking d'institutions (activity + holdings + sectors)  
**Réponse** : `recentActivity`, `topPositions`, `sectorExposure`, `performance`

#### Analyse de Secteur
```
GET /analysis/sector/{sector}
```
**Description** : Analyse de secteur (FMP fundamentals + UW sentiment)  
**Réponse** : `topPerformers`, `averagePE`, `sentiment`, `recommendations`

---

### 2. Services Avancés - 6 endpoints

#### Scoring Automatique
```
GET /ticker-analysis/{ticker}/score
GET /ticker-analysis/{ticker}/breakdown
```
**Description** : Score composite 0-100 basé sur options flow, insiders, dark pool, short interest, greeks  
**Réponse** : `overallScore`, `signals`, `recommendation`, `confidence`

#### Gamma Squeeze Detection
```
GET /ticker-analysis/{ticker}/gamma-squeeze
```
**Description** : Détection de gamma squeeze potentiel  
**Réponse** : `squeezeProbability`, `riskLevel`, `indicators`, `recommendation`, `timeframe`

#### Surveillance Continue
```
POST /surveillance/watch
Body: {
  "ticker": "AAPL",
  "minPremium": 50000,
  "callVolumeThreshold": 1000000,
  "shortInterestThreshold": 20,
  "checkInterval": 5,
  "notificationChannels": ["webhook", "email"],
  "active": true
}

GET /surveillance/watches
GET /surveillance/watch/{id}/alerts
DELETE /surveillance/watch/{id}
POST /surveillance/watch/{id}/check  # Trigger manuel
```
**Description** : Surveillance continue avec alertes automatiques  
**Réponse** : `watch`, `alerts[]`, `total`

#### Alertes Multi-Signaux
```
POST /alerts
Body: {
  "ticker": "AAPL",
  "name": "Alerte Options Flow + Insiders",
  "conditions": [
    { "signal": "options_flow", "operator": "gt", "value": 1000000 },
    { "signal": "insider_activity", "operator": "gt", "value": 2 }
  ],
  "logic": "AND",
  "notificationChannels": ["webhook", "email"],
  "active": true
}

GET /alerts
GET /alerts/{id}
PUT /alerts/{id}
POST /alerts/{id}/test
DELETE /alerts/{id}
```
**Description** : Alertes multi-signaux avec logique AND/OR  
**Réponse** : `alert`, `evaluationResult`, `history`

#### Smart Money
```
GET /smart-money/top-hedge-funds?period=3M
GET /smart-money/institution/{name}/copy-trades/{ticker}
```
**Description** : Top hedge funds + copy trades  
**Note** : Pour les institutions, utiliser le **CIK** si le nom ne fonctionne pas (ex: `0001697748` pour Berkshire Hathaway)  
**Réponse** : `funds[]`, `trades[]`, `recommendation`

#### Market Analysis
```
GET /market-analysis/sector-rotation
GET /market-analysis/market-tide
```
**Description** : Rotations sectorielles + sentiment global du marché  
**Réponse** : `currentRotation`, `predictedRotation`, `sectors[]`, `overall`, `sentiment`

---

## 🔑 Points Importants pour le Frontend

### 1. Gestion des Erreurs
- Tous les endpoints retournent `{ success: boolean, data?: any, error?: string }`
- En cas d'erreur 500 de l'API UW, certains endpoints retournent `data: []` avec un `message` informatif
- Vérifier toujours `success === true` avant d'utiliser `data`

### 2. Institutions (Smart Money)
- L'API UW accepte **à la fois les noms et les CIK**
- Pour certaines institutions, le **CIK est plus fiable** que le nom
- **CIK connus** :
  - Berkshire Hathaway: `0001697748`
  - BlackRock: `0001364742`
  - Vanguard: `0000102909`
- Si une requête avec un nom retourne 500, suggérer d'utiliser le CIK

### 3. Valeurs Suspectes à Surveiller
- `sentiment.score = 50` → Valeur par défaut (données UW absentes)
- `callVolume = 0` et `putVolume = 0` → Pas de données options
- `currentPrice = 0` → Prix non extrait
- `totalHoldings = 0` → Pas de holdings
- `averagePE = 0` → PE non calculé

### 4. Performance
- Les endpoints combinés peuvent prendre **2-5 secondes** (appels multiples)
- Implémenter un **loading state** approprié
- Certains endpoints supportent le **cache** (vérifier `cached: true` dans la réponse)

### 5. Pagination & Limites
- La plupart des endpoints retournent toutes les données (pas de pagination)
- Le screening multi-critères accepte un paramètre `limit`
- Les endpoints UW bruts supportent `limit` et `page`

---

## 📝 Exemples de Réponses

### Analyse Complète
```json
{
  "success": true,
  "data": {
    "ticker": "AAPL",
    "fundamentalScore": 75,
    "sentimentScore": 68,
    "overallScore": 71.5,
    "recommendation": "BUY",
    "fundamentals": {
      "peRatio": 28.5,
      "revenueGrowth": 5.2,
      "profitMargin": 25.3
    },
    "sentiment": {
      "score": 68,
      "details": {
        "callPutRatio": 1.8,
        "darkPoolTrades": 15,
        "insiderActivity": 3
      }
    }
  }
}
```

### Scoring
```json
{
  "success": true,
  "data": {
    "ticker": "AAPL",
    "overallScore": 72,
    "recommendation": "BUY",
    "confidence": 85,
    "signals": {
      "options": { "score": 75, "callVolume": 1500000 },
      "insiders": { "score": 60, "buyCount": 2 },
      "darkPool": { "score": 70, "volume": 5000000 },
      "shortInterest": { "score": 80, "percent": 2.5 },
      "greeks": { "score": 65, "gamma": 0.15 }
    }
  }
}
```

### Surveillance Watch
```json
{
  "success": true,
  "data": {
    "watch": {
      "id": "ff9dcbd4-1e0a-4e48-8604-854cdb5ac407",
      "userId": "f1e9907e-5021-70fe-308e-3377782ba668",
      "ticker": "TSLA",
      "config": {
        "minPremium": 100000,
        "callVolumeThreshold": 2000000,
        "shortInterestThreshold": 15,
        "checkInterval": 5,
        "notificationChannels": ["webhook"],
        "active": true
      },
      "createdAt": "2025-12-07T11:49:44.370Z"
    }
  }
}
```

---

## 🧪 Tests & Validation

### Scripts de Test Disponibles
- `scripts/test-combined-analysis-endpoints.sh` : Teste les 8 endpoints combinés
- `scripts/validate-combined-analysis-data.sh` : Valide la présence des données UW
- `scripts/test-ticker-activity-api.sh` : Teste les endpoints ticker-activity
- `scripts/test-ticker-insights.sh` : Teste les endpoints ticker-insights
- `api-tests.http` : Fichier REST Client avec tous les exemples

### Utilisation
```bash
# Tester les endpoints combinés
ACCESS_TOKEN="your_token" ./scripts/test-combined-analysis-endpoints.sh

# Valider les données UW
ACCESS_TOKEN="your_token" ./scripts/validate-combined-analysis-data.sh
```

---

## 📚 Documentation Complète

- **Résumé d'implémentation** : `RESUME_IMPLEMENTATION.md`
- **Roadmap** : `ROADMAP_UNUSUAL_WHALES.md`
- **Synergie FMP + UW** : `FMP_UW_SYNERGY.md`
- **Statut d'implémentation** : `IMPLEMENTATION_STATUS.md`
- **Tests HTTP** : `api-tests.http`

---

## 🚀 Prochaines Étapes Frontend

1. **Intégrer les nouveaux endpoints** dans les composants existants
2. **Créer de nouveaux composants** pour :
   - Dashboard de scoring
   - Surveillance en temps réel
   - Alertes multi-signaux
   - Smart Money (top hedge funds)
   - Market Analysis (rotations sectorielles)
3. **Gérer les états de chargement** (endpoints peuvent prendre 2-5s)
4. **Implémenter la gestion d'erreurs** avec messages informatifs
5. **Ajouter des tooltips/explications** pour les scores et recommandations

---

## 📐 Structures de Données TypeScript

### Types Principaux

#### CompleteAnalysis
```typescript
interface CompleteAnalysis {
  ticker: string;
  fundamental: {
    score: number; // 0-100
    undervalued: boolean;
    strongRatios: boolean;
    details: {
      peRatio?: number;
      debtToEquity?: number;
      revenueGrowth?: number;
    };
  };
  sentiment: {
    score: number; // 0-100
    bullishOptions: boolean;
    details: {
      callPutRatio?: number;
      darkPoolTrades?: number;
    };
  };
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  confidence: number; // 0-100
}
```

#### TickerScore
```typescript
interface TickerScore {
  ticker: string;
  overall: number; // 0-100
  breakdown: {
    options: number;
    insiders: number;
    darkPool: number;
    shortInterest: number;
    greeks: number;
  };
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  confidence: number;
  signals: {
    options: { score: number; callVolume: number; putVolume: number };
    insiders: { score: number; buys: number; sells: number };
    darkPool: { score: number; volume: number };
    shortInterest: { score: number; shortPercentOfFloat: number };
    greeks: { score: number; gamma: number; maxPain: number };
  };
}
```

#### SurveillanceWatch
```typescript
interface SurveillanceWatch {
  id: string;
  userId: string;
  ticker: string;
  config: {
    ticker: string;
    minPremium?: number;
    callVolumeThreshold?: number;
    shortInterestThreshold?: number;
    checkInterval?: number; // minutes
    notificationChannels: ('email' | 'push' | 'sms' | 'webhook')[];
    active: boolean;
  };
  createdAt: string; // ISO date
  lastChecked?: string; // ISO date
  active: boolean;
}
```

#### Alert
```typescript
interface Alert {
  id: string;
  userId: string;
  ticker?: string;
  name: string;
  description?: string;
  conditions: Array<{
    signal: 'options_flow' | 'insider_activity' | 'dark_pool' | 'short_interest' | 'greeks';
    operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq';
    value: number | string;
    params?: Record<string, any>;
  }>;
  logic: 'AND' | 'OR';
  notificationChannels: ('email' | 'push' | 'sms' | 'webhook')[];
  active: boolean;
  createdAt: string; // ISO date
  lastTriggered?: string; // ISO date
}
```

---

## 🔒 Codes d'Erreur HTTP

### Codes de Réponse Standards
- **200 OK** : Requête réussie
- **400 Bad Request** : Paramètres manquants ou invalides
- **401 Unauthorized** : Token manquant ou invalide
- **404 Not Found** : Route ou ressource introuvable
- **500 Internal Server Error** : Erreur serveur (généralement erreur API externe)
- **502 Bad Gateway** : Erreur de l'API UW ou FMP

### Format d'Erreur
```json
{
  "success": false,
  "error": "Message d'erreur descriptif",
  "code": "ERROR_CODE",
  "statusCode": 500
}
```

### Gestion des Erreurs Recommandée
```typescript
// Exemple TypeScript
try {
  const response = await fetch(`${API_URL}/analysis/${ticker}/complete`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  
  if (!data.success) {
    // Gérer l'erreur
    console.error('API Error:', data.error);
    // Afficher un message à l'utilisateur
  } else {
    // Utiliser data.data
  }
} catch (error) {
  // Gérer les erreurs réseau
}
```

---

## ⚡ Rate Limiting & Performance

### Limitations
- **Pas de rate limiting explicite** côté API Gateway (géré par AWS)
- **Cache** : Certaines réponses incluent `cached: true` (données en cache)
- **Timeout** : 10 secondes par défaut pour les endpoints Lambda

### Optimisations Recommandées
1. **Mise en cache côté frontend** : Cachez les réponses pendant 5-10 minutes
2. **Debouncing** : Pour les recherches/screenings, attendre 500ms après la dernière saisie
3. **Loading states** : Afficher un spinner pour les requêtes > 1 seconde
4. **Pagination** : Pour les listes longues, implémenter une pagination côté frontend

---

## 🔔 Webhooks & Notifications

### Surveillance & Alertes
Les services de surveillance et d'alertes supportent les webhooks, mais **l'implémentation des notifications est en cours**.

**État actuel** :
- ✅ Structure de données prête
- ✅ Stockage des configurations de notification
- ⏳ Envoi des notifications (email/push/SMS/webhook) : **À implémenter**

**Pour l'instant** :
- Les alertes sont générées et stockées
- Les webhooks ne sont pas encore envoyés automatiquement
- Utiliser `GET /surveillance/watch/{id}/alerts` pour récupérer les alertes

---

## 📱 Exemples d'Intégration Frontend

### React/TypeScript - Hook personnalisé
```typescript
// hooks/useTickerAnalysis.ts
import { useState, useEffect } from 'react';

interface UseTickerAnalysisResult {
  data: any;
  loading: boolean;
  error: string | null;
}

export function useTickerAnalysis(ticker: string, endpoint: string): UseTickerAnalysisResult {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_MAIN_URL}/analysis/${ticker}/${endpoint}`,
          {
            headers: {
              'Authorization': `Bearer ${getAccessToken()}`,
            },
          }
        );
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'API Error');
        }
        
        setData(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (ticker) {
      fetchData();
    }
  }, [ticker, endpoint]);

  return { data, loading, error };
}
```

### Utilisation
```typescript
// Component
function TickerAnalysis({ ticker }: { ticker: string }) {
  const { data, loading, error } = useTickerAnalysis(ticker, 'complete');
  
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return null;
  
  return (
    <div>
      <Score value={data.fundamental.score} label="Fundamental" />
      <Score value={data.sentiment.score} label="Sentiment" />
      <Recommendation value={data.recommendation} />
    </div>
  );
}
```

---

## ❓ Questions / Support

Pour toute question sur les endpoints ou les structures de données, référez-vous à :
- `api-tests.http` pour des exemples concrets
- Les scripts de test pour voir les réponses attendues
- Les logs CloudWatch pour diagnostiquer les problèmes
- Les types TypeScript dans `services/api/src/types/` pour les structures complètes

