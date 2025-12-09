# 🧠 Architecture Aladdin - Service d'Analyse Intelligent

## 📋 Vue d'ensemble

Système d'analyse et de prise de décision inspiré d'Aladdin (BlackRock), qui agrège les données de **Unusual Whales** et **FMP** pour générer des signaux, scores et recommandations actionnables.

## 🏗️ Architecture Backend (Next.js API Routes)

### Structure

```
pages/api/aladdin/
├── portfolio-signals.js    # Signaux pour un portefeuille
├── ticker-analysis.js       # Analyse complète d'un ticker
└── opportunities.js         # Scanner d'opportunités

services/
└── aladdinService.js        # Moteur d'analyse et de décision
```

### Pourquoi Backend ?

✅ **Sécurité** : Clés API protégées côté serveur  
✅ **Rate Limiting** : Contrôle centralisé des appels API  
✅ **Caching** : Possibilité de mettre en cache les résultats  
✅ **Scalabilité** : Jobs planifiés, traitement asynchrone  
✅ **Logique métier** : Calculs complexes côté serveur

## 🧮 Feature Engine (Moteur de Features)

Le service `aladdinService` calcule des **features** (caractéristiques) pour chaque ticker :

### Features Calculées

1. **Options Flow Scores**
   - `options_bullish_score` : Score bullish (0-1)
   - `options_bearish_score` : Score bearish (0-1)
   - `options_unusual_score` : Activité inhabituelle (0-1)
   - `flow_skew` : Skew call/put (-1 à +1)

2. **Dark Pool Score**
   - `darkpool_score` : Activité dark pool (0-1)

3. **Insider Score**
   - `insider_score` : Net insider activity (-1 à +1)

4. **Congress Scores**
   - `congress_buy_score` : Achats du Congrès (0-1)
   - `congress_sell_score` : Ventes du Congrès (0-1)

5. **Smart Money Score**
   - `smart_money_score` : Activité institutionnelle (0-1)
   - `institutional_ownership_change` : Changement de propriété

6. **Valuation Score**
   - `valuation_score` : Score de valorisation basé sur P/E, P/B (-1 à +1)

7. **Momentum Score**
   - `momentum_score` : Momentum basé sur variation de prix (-1 à +1)

### Composite Score

Score global calculé avec pondération :
- Options Bullish: 25%
- Options Unusual: 20%
- Smart Money: 20%
- Insider: 15%
- Congress Buy: 10%
- Momentum: 10%

## 🎯 Decision Engine (Moteur de Décision)

Génère des recommandations structurées :

### Types de Décisions

- **RENFORCER** : Score > 0.7 → Signaux très positifs
- **SURVEILLER** : Score -0.4 à 0.7 → Signaux neutres à positifs
- **ALLÉGER** : Score < -0.4 → Signaux négatifs

### Structure de Recommandation

```javascript
{
  decision: "RENFORCER" | "SURVEILLER" | "ALLÉGER",
  composite_score: 0.75,
  reasoning: [
    "Signaux très positifs : options flow bullish",
    "Accumulation par les institutions",
    "Achats significatifs par les insiders"
  ],
  actions: [
    "Considérer un ajout de position",
    "Surveiller les niveaux de résistance"
  ],
  risk_level: "LOW" | "MEDIUM" | "HIGH"
}
```

## 📊 Pages Frontend

### 1. Portfolio Intelligence (`/dashboards/trading/portfolio-intelligence`)

**Fonctionnalités** :
- Gestion du portefeuille (ajout/suppression de tickers)
- Analyse des signaux pour tous les tickers
- Vue d'ensemble avec statistiques globales
- Tableau détaillé avec scores par ticker
- Modal d'analyse détaillée par ticker

**API** : `POST /api/aladdin/portfolio-signals`

### 2. Opportunities Scanner (`/dashboards/trading/opportunities-scanner`)

**Fonctionnalités** :
- Scanner d'opportunités selon différentes stratégies
- Filtres par stratégie (Squeeze, Smart Money, Congress, All)
- Tableau des meilleures opportunités triées par score

**Stratégies** :
- **Squeeze** : Options unusual + momentum
- **Smart Money** : Accumulation institutionnelle
- **Congress** : Alignement avec trades du Congrès
- **All** : Toutes les opportunités

**API** : `GET /api/aladdin/opportunities?strategy=squeeze&limit=20`

## 🔄 Flux de Données

```
Frontend (React)
    ↓
API Routes (Next.js) ← Clés API sécurisées
    ↓
aladdinService
    ↓
Unusual Whales API + FMP API
    ↓
Feature Engine (calcul des scores)
    ↓
Decision Engine (génération de recommandations)
    ↓
Retour au Frontend (JSON)
```

## 🚀 Utilisation

### 1. Portfolio Intelligence

```javascript
// Ajouter des tickers à votre portefeuille
// Cliquer sur "Analyser"
// Voir les signaux agrégés pour chaque ticker
```

### 2. Opportunities Scanner

```javascript
// Sélectionner une stratégie
// Cliquer sur "Scanner"
// Voir les meilleures opportunités
```

### 3. API Directe

```javascript
// Analyser un ticker
const response = await fetch('/api/aladdin/ticker-analysis?symbol=AAPL');
const analysis = await response.json();

// Analyser un portefeuille
const response = await fetch('/api/aladdin/portfolio-signals', {
  method: 'POST',
  body: JSON.stringify({ tickers: ['AAPL', 'NVDA', 'PLTR'] })
});
```

## 📈 Prochaines Étapes (Améliorations Futures)

1. **Base de Données** : Stocker l'historique des signaux
2. **Jobs Planifiés** : Mise à jour automatique toutes les X minutes
3. **Alertes** : Notifications quand un signal change
4. **Backtesting** : Tester les performances des signaux
5. **LLM Integration** : Explications naturelles avec IA
6. **Scénarios** : Stress tests et simulations
7. **Portfolio Optimization** : Suggestions d'allocation

## 🔐 Sécurité

- ✅ Clés API dans `.env.local` (jamais exposées au client)
- ✅ API Routes Next.js (exécution côté serveur uniquement)
- ✅ Rate limiting intégré dans les clients API
- ✅ Gestion d'erreurs robuste

## 📝 Notes

- Les calculs sont effectués en temps réel (pas de cache pour l'instant)
- Les rate limits sont respectés avec des délais entre les appels
- Les scores sont normalisés entre -1 et +1 pour faciliter l'interprétation
- Le composite score peut être ajusté selon vos préférences de trading





