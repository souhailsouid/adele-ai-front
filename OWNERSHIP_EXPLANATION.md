# 📊 Explication Complète - Onglet "Propriété Institutionnelle"

## 🎯 Contexte Métier

### Qu'est-ce que la "Propriété Institutionnelle" ?

La **Propriété Institutionnelle** (Institutional Ownership) représente **qui détient les actions d'une entreprise** parmi les investisseurs institutionnels (fonds, banques, assureurs, etc.).

### Pourquoi cette donnée est importante ?

1. **Analyse de la concentration** : Savoir si le titre est largement détenu par des institutions ou par des particuliers
2. **Suivi des "smart money"** : Les institutions sont souvent considérées comme des investisseurs sophistiqués
3. **Détection de mouvements** : Identifier les institutions qui augmentent ou réduisent leurs positions
4. **Conformité réglementaire** : Les institutions doivent déclarer leurs positions via les formulaires 13F (SEC)

### Source Réglementaire : Formulaires 13F

Les données proviennent des **formulaires 13F** déposés auprès de la SEC (Securities and Exchange Commission) :
- **Obligation** : Toute institution gérant plus de $100M doit déclarer ses positions
- **Fréquence** : Déclarations trimestrielles (Q1, Q2, Q3, Q4)
- **Délai** : Déclaration dans les 45 jours suivant la fin du trimestre

---

## 🏗️ Architecture Technique

### Flux de Données Complet

```
┌─────────────────┐
│   Frontend      │
│  (React/Next.js)│
└────────┬────────┘
         │
         │ 1. GET /ticker-activity/TSLA/ownership
         │    Authorization: Bearer {ACCESS_TOKEN}
         │
         ▼
┌─────────────────┐
│  API Gateway     │
│  (AWS)          │
└────────┬────────┘
         │
         │ 2. Vérification JWT
         │    Cache check (PostgreSQL/Supabase)
         │
         ▼
┌─────────────────┐
│  Backend Lambda  │
│  (Node.js/Python)│
└────────┬────────┘
         │
         │ 3. Cache hit ? → Retourner données
         │    Cache miss ? → Appel API externe
         │
         ▼
┌─────────────────┐
│  Unusual Whales  │
│  API             │
└────────┬────────┘
         │
         │ 4. GET /api/institution/TSLA/ownership?limit=100
         │    Authorization: Bearer {UW_API_KEY}
         │
         ▼
┌─────────────────┐
│  Base de Données│
│  (PostgreSQL)   │
└─────────────────┘
         │
         │ 5. Stocker dans le cache
         │    TTL: 24 heures
```

### Étapes Détaillées

#### 1. **Frontend** (`ticker-activity.js`)

```javascript
// L'utilisateur sélectionne un ticker (ex: TSLA)
const result = await tickerActivityClient.getActivityByType("TSLA", "ownership", {
  limit: 100,
});
```

**Fichier** : `pages/dashboards/trading/ticker-activity.js` (ligne 157)

#### 2. **Client API** (`tickerActivityClient.js`)

```javascript
async getOwnership(ticker, options = {}) {
  const { limit = 100 } = options;
  const response = await this.request(
    `/ticker-activity/${ticker.toUpperCase()}/ownership?limit=${limit}`
  );
  return {
    data: response.data || [],
    cached: response.cached || false,
    count: response.count || 0,
  };
}
```

**Fichier** : `lib/api/tickerActivityClient.js` (ligne 157-167)

**Action** :
- Construit l'URL : `GET /ticker-activity/TSLA/ownership?limit=100`
- Ajoute le header `Authorization: Bearer {ACCESS_TOKEN}`
- Envoie la requête à l'API Gateway

#### 3. **Backend API Gateway** (AWS)

**Endpoint** : `GET /ticker-activity/{ticker}/ownership`

**Actions** :
1. **Authentification** : Vérifie le JWT (ACCESS TOKEN)
2. **Cache Check** : Vérifie si les données sont en cache (PostgreSQL/Supabase)
   - **Cache Hit** : Retourne les données avec `cached: true`
   - **Cache Miss** : Continue vers l'API externe

#### 4. **Backend Lambda** (si cache miss)

**Actions** :
1. Appelle l'API Unusual Whales
2. Transforme les données si nécessaire
3. Stocke dans le cache (TTL: 24 heures)
4. Retourne les données au frontend

#### 5. **API Externe : Unusual Whales**

**Endpoint** : `GET /api/institution/{ticker}/ownership?limit={limit}`

**Base URL** : `https://api.unusualwhales.com/api`

**Authentification** :
```
Authorization: Bearer {UNUSUAL_WHALES_API_KEY}
```

**Rate Limit** : 60 requêtes par minute

**Réponse** :
```json
[
  {
    "name": "Vanguard Group Inc",
    "shares": 50000000,
    "units": 50000000,
    "value": 12500000000,
    "is_hedge_fund": false,
    "report_date": "2024-09-30",
    "filing_date": "2024-11-15"
  }
]
```

---

## 📋 Format des Données

### Structure de la Réponse Backend

```json
{
  "success": true,
  "data": [
    {
      "name": "Vanguard Group Inc",           // Nom de l'institution
      "shares": 50000000,                    // Nombre d'actions détenues
      "value": 12500000000,                  // Valeur totale (en USD)
      "is_hedge_fund": false,                // Est-ce un hedge fund ?
      "report_date": "2024-09-30",           // Date du rapport (fin de trimestre)
      "filing_date": "2024-11-15"            // Date de dépôt du formulaire 13F
    }
  ],
  "cached": true,                            // Données depuis le cache ?
  "count": 150,                              // Nombre total d'institutions
  "timestamp": "2025-01-15T10:30:00Z"      // Timestamp de la réponse
}
```

### Colonnes Affichées dans le Frontend

| Colonne | Source | Description |
|---------|--------|-------------|
| **Institution** | `name` | Nom de l'institution (ex: "Vanguard Group Inc") |
| **Shares** | `shares` ou `units` | Nombre d'actions détenues (formaté: 50M) |
| **Valeur** | Calculée | `shares × currentPrice` (prix actuel du ticker) |
| **Hedge Fund** | `is_hedge_fund` | Indicateur si c'est un hedge fund (Oui/Non) |
| **Report Date** | `report_date` | Date de fin du trimestre (ex: 2024-09-30) |
| **Filing Date** | `filing_date` | Date de dépôt du formulaire 13F (ex: 2024-11-15) |

**Fichier** : `pages/dashboards/trading/ticker-activity.js` (lignes 274-315)

---

## 🔍 Conformité au Contexte Métier

### ✅ Points Conformes

1. **Source de données réglementaire** ✅
   - Les données proviennent des formulaires 13F (SEC)
   - Conforme aux obligations légales américaines

2. **Dates importantes** ✅
   - `report_date` : Date de fin du trimestre (conforme 13F)
   - `filing_date` : Date de dépôt (conforme 13F)
   - Délai de 45 jours respecté (report_date + 45 jours = filing_date max)

3. **Identification des hedge funds** ✅
   - Champ `is_hedge_fund` permet de distinguer les hedge funds
   - Utile pour l'analyse des "smart money"

4. **Valeur calculée** ✅
   - La valeur est calculée avec le prix actuel (pas le prix historique)
   - Permet de voir la valeur actuelle des positions

5. **Limite de résultats** ✅
   - Paramètre `limit=100` pour éviter les surcharges
   - Pagination possible côté frontend

### ⚠️ Points d'Attention

1. **Délai de mise à jour** ⚠️
   - Les données 13F sont **trimestrielles** (pas en temps réel)
   - Délai de 45 jours après la fin du trimestre
   - **Exemple** : Pour Q3 2024 (fin: 30/09/2024), les données sont disponibles vers le 15/11/2024

2. **Cache TTL** ⚠️
   - Cache de 24 heures (conforme car les données ne changent pas quotidiennement)
   - Mais les données 13F ne changent que trimestriellement

3. **Valeur calculée vs valeur déclarée** ⚠️
   - Le frontend calcule `shares × currentPrice`
   - Mais le backend retourne aussi `value` (valeur au moment du rapport)
   - **Recommandation** : Afficher les deux valeurs (historique vs actuelle)

4. **Hedge Fund Detection** ⚠️
   - Le champ `is_hedge_fund` vient de l'API Unusual Whales
   - Vérifier que la détection est fiable (liste de hedge funds connus)

---

## 🎯 Cas d'Usage Métier

### 1. **Analyse de Concentration**

**Question** : "Qui détient TSLA ?"

**Réponse** : L'onglet montre les 100 principales institutions qui détiennent TSLA, triées par nombre d'actions.

**Utilisation** :
- Identifier les actionnaires majoritaires
- Détecter la concentration (risque si une institution détient >10%)

### 2. **Suivi des "Smart Money"**

**Question** : "Quels hedge funds détiennent TSLA ?"

**Réponse** : Filtrer par `is_hedge_fund: true` pour voir les hedge funds.

**Utilisation** :
- Suivre les décisions des investisseurs sophistiqués
- Identifier les tendances d'investissement

### 3. **Analyse Temporelle**

**Question** : "Quand les institutions ont-elles déclaré leurs positions ?"

**Réponse** : Colonnes `report_date` et `filing_date` montrent les dates.

**Utilisation** :
- Comprendre le délai entre la fin du trimestre et la déclaration
- Identifier les déclarations tardives (potentiel signal)

### 4. **Valeur des Positions**

**Question** : "Combien valent les positions institutionnelles ?"

**Réponse** : Colonne "Valeur" calcule `shares × currentPrice`.

**Utilisation** :
- Estimer l'exposition totale des institutions
- Comparer avec la capitalisation boursière

---

## 🔧 Améliorations Possibles

### 1. **Affichage de la Valeur Historique**

Actuellement, seule la valeur actuelle est affichée. Ajouter :
- Valeur au moment du rapport (`value` du backend)
- Comparaison avec la valeur actuelle
- Gain/Perte depuis le rapport

### 2. **Filtrage par Type d'Institution**

Ajouter des filtres :
- Tous
- Hedge Funds uniquement
- Banques
- Fonds de pension
- Autres

### 3. **Tri et Recherche Avancée**

Améliorer la recherche :
- Recherche par nom d'institution
- Tri par shares, valeur, date
- Export CSV/Excel

### 4. **Graphiques**

Ajouter des visualisations :
- Top 10 institutions (pie chart)
- Évolution temporelle (line chart)
- Distribution par type (bar chart)

---

## 📚 Références

### Documentation Technique

- **Frontend** : `pages/dashboards/trading/ticker-activity.js`
- **Client API** : `lib/api/tickerActivityClient.js`
- **Backend Spec** : `BACKEND_SPEC_TICKER_ACTIVITY.md`
- **API Reference** : `API_ENDPOINTS_REFERENCE.md`
- **External APIs** : `EXTERNAL_APIS_REFERENCE.md`

### Documentation Métier

- **SEC 13F Filings** : https://www.sec.gov/divisions/investment/13f.htm
- **Unusual Whales API** : https://unusualwhales.com/api-docs
- **Form 13F** : https://www.sec.gov/files/form13f.pdf

---

## ✅ Conclusion

L'onglet "Propriété Institutionnelle" est **conforme au contexte métier** :

1. ✅ **Source réglementaire** : Données 13F (SEC)
2. ✅ **Dates conformes** : report_date et filing_date
3. ✅ **Identification hedge funds** : Champ `is_hedge_fund`
4. ✅ **Valeur calculée** : Utilise le prix actuel
5. ✅ **Cache optimisé** : TTL de 24 heures (adapté aux données trimestrielles)

**Points d'amélioration** :
- Afficher la valeur historique vs actuelle
- Ajouter des filtres par type d'institution
- Améliorer les visualisations





