# 🚀 Composants d'Analyse LLM Enrichies

Ce dossier contient les composants React pour afficher les analyses LLM enrichies des fonctionnalités d'intelligence artificielle.

## 📦 Composants Disponibles

### Composants Principaux

1. **`OptionsFlowAnalysis`** - Analyse LLM enrichie du Options Flow
2. **`InstitutionMovesAnalysis`** - Analyse LLM enrichie des mouvements institutionnels
3. **`TickerActivityAnalysis`** - Analyse LLM de l'activité complète d'un ticker

### Composants Réutilisables

1. **`AttentionLevelBadge`** - Badge pour afficher le niveau d'attention (faible, moyen, élevé, critique)
2. **`ConfidenceBar`** - Barre de progression pour afficher un niveau de confiance (0-1)
3. **`ScenarioCard`** - Carte pour afficher un scénario (bullish, bearish, neutral)
4. **`RecommendationCard`** - Carte pour afficher une recommandation d'action

## 🔧 Utilisation

### Options Flow Analysis

```jsx
import { OptionsFlowAnalysis } from "/pagesComponents/dashboards/trading/components/ai";

function MyComponent() {
  const [ticker, setTicker] = useState("NVDA");

  return (
    <OptionsFlowAnalysis 
      ticker={ticker}
      onAnalysisComplete={(data) => {
        console.log("Analysis completed:", data);
      }}
    />
  );
}
```

### Institution Moves Analysis

```jsx
import { InstitutionMovesAnalysis } from "/pagesComponents/dashboards/trading/components/ai";

function MyComponent() {
  return (
    <InstitutionMovesAnalysis 
      institution_cik="0001364742"
      institution_name="BLACKROCK, INC."
      period="3M"
      onAnalysisComplete={(data) => {
        console.log("Analysis completed:", data);
      }}
    />
  );
}
```

### Ticker Activity Analysis

```jsx
import { TickerActivityAnalysis } from "/pagesComponents/dashboards/trading/components/ai";

function MyComponent() {
  const [ticker, setTicker] = useState("NVDA");

  return (
    <TickerActivityAnalysis 
      ticker={ticker}
      onAnalysisComplete={(data) => {
        console.log("Analysis completed:", data);
      }}
    />
  );
}
```

## 🎣 Hooks Personnalisés

### useOptionsFlowAnalysis

```jsx
import { useOptionsFlowAnalysis } from "/hooks/ai";

function MyComponent() {
  const { data, loading, error, refetch } = useOptionsFlowAnalysis("NVDA", {
    enabled: true,
    onSuccess: (data) => console.log("Success:", data),
    onError: (error) => console.error("Error:", error),
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  return <div>{/* Render analysis */}</div>;
}
```

### useInstitutionMovesAnalysis

```jsx
import { useInstitutionMovesAnalysis } from "/hooks/ai";

function MyComponent() {
  const { data, loading, error, refetch } = useInstitutionMovesAnalysis(
    "0001364742",
    "BLACKROCK, INC.",
    "3M",
    {
      enabled: true,
      onSuccess: (data) => console.log("Success:", data),
    }
  );

  // ...
}
```

### useTickerActivityAnalysis

```jsx
import { useTickerActivityAnalysis } from "/hooks/ai";

function MyComponent() {
  const { data, loading, error, refetch } = useTickerActivityAnalysis("NVDA", {
    enabled: true,
  });

  // ...
}
```

## 📊 Structure des Données

### Options Flow Analysis Response

```typescript
{
  success: boolean;
  ticker: string;
  signal_type: "unusual_options_flow" | "gamma_squeeze" | "dark_pool_spike" | "insider_activity";
  metrics: {
    volume_vs_avg?: number;
    call_put_ratio?: number;
    open_interest_change?: { ... };
    implied_volatility?: { ... };
    max_pain?: { ... };
    price_action?: { ... };
    // ...
  };
  analysis: {
    observation: string;
    interpretation: string;
    attention_level: "faible" | "moyen" | "élevé" | "critique";
    strategy_hypothesis?: { ... };
    key_insights?: Array<{ ... }>;
    scenarios?: { ... };
    recommendations?: Array<{ ... }>;
    warnings?: string[];
    next_signals_to_watch?: string[];
  };
  cached: boolean;
  timestamp: string;
}
```

### Institution Moves Analysis Response

```typescript
{
  success: boolean;
  institution_cik: string;
  institution_name: string;
  analysis: {
    summary: string;
    strategy_insight?: { ... };
    key_moves: Array<{ ... }>;
    portfolio_analysis?: { ... };
    performance_analysis?: { ... };
    copy_trade_opportunities?: Array<{ ... }>;
    attention_level: "faible" | "moyen" | "élevé" | "critique";
    warnings?: string[];
    next_moves_to_watch?: string[];
  };
  period?: string;
  cached: boolean;
  timestamp: string;
}
```

### Ticker Activity Analysis Response

```typescript
{
  success: boolean;
  ticker: string;
  analysis: {
    overview: string;
    key_signals: Array<{ ... }>;
    attention_level: "faible" | "moyen" | "élevé" | "critique";
    narrative: string;
    recommendations?: string[];
  };
  cached: boolean;
  timestamp: string;
}
```

## 🎨 Personnalisation

Tous les composants utilisent Material-UI et peuvent être personnalisés via les props ou en modifiant les styles directement dans les composants.

### Exemple de Personnalisation

```jsx
<OptionsFlowAnalysis 
  ticker="NVDA"
  sx={{
    // Styles personnalisés
    '& .MuiCard-root': {
      boxShadow: 3,
    }
  }}
/>
```

## 🔗 Endpoints API

Les composants utilisent les endpoints suivants via `intelligenceClient`:

- `POST /ai/options-flow-analysis`
- `POST /ai/institution-moves-analysis`
- `POST /ai/ticker-activity-analysis`

Tous les endpoints nécessitent une authentification Bearer Token.

## 📝 Notes

- Les analyses peuvent prendre 5-10 secondes à charger
- Les réponses peuvent être mises en cache (champ `cached: true`)
- Gérer les erreurs 500 (timeout API externe) avec retry
- Afficher des skeletons pendant le chargement
- Adapter l'affichage pour mobile (cartes au lieu de tableaux)

## ✅ Checklist d'Implémentation

### Options Flow Analysis
- [x] Afficher les métriques enrichies (OI, IV, Volume Profile)
- [x] Afficher Strategy Hypothesis avec confidence
- [x] Afficher les 3 scénarios avec probabilités
- [x] Afficher les recommandations avec strikes/expiries
- [x] Afficher les warnings en alertes
- [x] Afficher Next Signals to Watch

### Institution Moves Analysis
- [x] Afficher Strategy Insight avec evidence
- [x] Afficher Key Moves avec conviction et copy trade potential
- [x] Afficher Portfolio Analysis (concentration, sector bets, style)
- [x] Afficher Performance Analysis (top/underperformers)
- [x] Afficher Copy Trade Opportunities avec entry strategies
- [x] Afficher les warnings

### Ticker Activity Analysis
- [x] Afficher l'analyse actuelle
- [ ] Préparer la structure pour les enrichissements futurs (Phase 1.5/1.6)

