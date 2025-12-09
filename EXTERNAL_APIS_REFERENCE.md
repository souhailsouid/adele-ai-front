# 🔌 Référence des APIs Externes - Ticker Activity

## 📋 APIs Utilisées

### 1. Unusual Whales API

**Base URL** : `https://api.unusualwhales.com/api`

**Authentification** :
```
Authorization: Bearer {UNUSUAL_WHALES_API_KEY}
```

**Rate Limits** :
- 60 requêtes par minute
- Headers de réponse :
  - `x-uw-req-per-minute-remaining` : Requêtes restantes
  - `x-uw-req-per-minute-reset` : Timestamp de reset

---

#### Endpoint 1: Ownership Institutionnel
```
GET /institution/{ticker}/ownership?limit={limit}
```

**Exemple** :
```bash
curl -X GET "https://api.unusualwhales.com/api/institution/TSLA/ownership?limit=100" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

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

**Paramètres** :
- `ticker` (path, required) : Symbole boursier
- `limit` (query, optional) : Nombre max de résultats (défaut: 100)

---

#### Endpoint 2: Activité d'une Institution
```
GET /institution/{institution_name}/activity?ticker={ticker}&limit={limit}
```

**⚠️ IMPORTANT** : Utiliser cet endpoint pour chaque institution (MAX 10 institutions).

**Exemple** :
```bash
curl -X GET "https://api.unusualwhales.com/api/institution/VANGUARD%20GROUP%20INC/activity?ticker=TSLA&limit=20" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Réponse** :
```json
[
  {
    "ticker": "TSLA",
    "institution_name": "Vanguard Group Inc",
    "units_change": 1000000,
    "change": 1000000,
    "avg_price": 250.00,
    "buy_price": 250.00,
    "sell_price": null,
    "filing_date": "2024-11-15",
    "report_date": "2024-09-30",
    "price_on_filing": 252.50,
    "price_on_report": 248.00,
    "close": 250.50
  }
]
```

**Paramètres** :
- `institution_name` (path, required) : Nom de l'institution (URL encoded)
- `ticker` (query, optional) : Filtrer par ticker
- `limit` (query, optional) : Nombre max de résultats (défaut: 100)

**Note** : Encoder le nom de l'institution dans l'URL (ex: `VANGUARD%20GROUP%20INC`)

---

#### Endpoint 3: Transactions Insiders
```
GET /insider/transactions?ticker={ticker}&limit={limit}
```

**Exemple** :
```bash
curl -X GET "https://api.unusualwhales.com/api/insider/transactions?ticker=TSLA&limit=100" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Réponse** :
```json
[
  {
    "ticker": "TSLA",
    "owner_name": "Elon Musk",
    "officer_title": "CEO",
    "transaction_code": "A",
    "acquisitionOrDisposition": "A",
    "amount": 10000000,
    "transaction_date": "2024-11-10",
    "shares": 40000,
    "price": 250.00
  }
]
```

**Paramètres** :
- `ticker` (query, required) : Symbole boursier
- `limit` (query, optional) : Nombre max de résultats (défaut: 100)

---

#### Endpoint 4: Transactions du Congrès
```
GET /congress/recent-trades?ticker={ticker}&limit={limit}
```

**Exemple** :
```bash
curl -X GET "https://api.unusualwhales.com/api/congress/recent-trades?ticker=TSLA&limit=100" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Réponse** :
```json
[
  {
    "ticker": "TSLA",
    "name": "Nancy Pelosi",
    "member_type": "house",
    "txn_type": "Buy",
    "amounts": "$500,000 - $1,000,000",
    "transaction_date": "2024-11-05"
  }
]
```

**Paramètres** :
- `ticker` (query, required) : Symbole boursier
- `limit` (query, optional) : Nombre max de résultats (défaut: 100)

---

#### Endpoint 5: Options Flow
```
GET /flow/alerts?ticker={ticker}&min_premium={min_premium}&limit={limit}
```

**Exemple** :
```bash
curl -X GET "https://api.unusualwhales.com/api/flow/alerts?ticker=TSLA&min_premium=10000&limit=100" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Réponse** :
```json
[
  {
    "ticker": "TSLA",
    "type": "call",
    "strike": 260.00,
    "total_premium": 500000,
    "premium": 500000,
    "volume": 1000,
    "expiry": "2025-01-17",
    "created_at": "2025-01-15T10:00:00Z",
    "open_interest": 5000
  }
]
```

**Paramètres** :
- `ticker` (query, optional) : Filtrer par ticker
- `min_premium` (query, optional) : Premium minimum (défaut: 0)
- `limit` (query, optional) : Nombre max de résultats (défaut: 100)

---

#### Endpoint 6: Dark Pool Trades
```
GET /darkpool/recent?ticker={ticker}&limit={limit}
```

**Exemple** :
```bash
curl -X GET "https://api.unusualwhales.com/api/darkpool/recent?ticker=TSLA&limit=100" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Réponse** :
```json
[
  {
    "ticker": "TSLA",
    "date": "2025-01-15",
    "volume": 1000000,
    "size": 1000000,
    "price": 250.25,
    "value": 250250000
  }
]
```

**Paramètres** :
- `ticker` (query, optional) : Filtrer par ticker
- `limit` (query, optional) : Nombre max de résultats (défaut: 100)

---

### 2. Financial Modeling Prep (FMP) API

**Base URL** : `https://financialmodelingprep.com/api/v3`

**Authentification** :
```
Query parameter: apikey={FMP_API_KEY}
```

**Rate Limits** :
- Starter Plan : 250 requêtes/jour
- Certains endpoints limités à 10 résultats

---

#### Endpoint: Quote
```
GET /quote/{ticker}?apikey={FMP_API_KEY}
```

**Exemple** :
```bash
curl -X GET "https://financialmodelingprep.com/api/v3/quote/TSLA?apikey=YOUR_API_KEY"
```

**Réponse** :
```json
[
  {
    "symbol": "TSLA",
    "name": "Tesla, Inc.",
    "price": 250.50,
    "changesPercentage": 2.12,
    "change": 5.20,
    "dayLow": 245.00,
    "dayHigh": 252.00,
    "yearHigh": 300.00,
    "yearLow": 150.00,
    "marketCap": 800000000000,
    "priceAvg50": 240.00,
    "priceAvg200": 220.00,
    "volume": 50000000,
    "avgVolume": 45000000,
    "exchange": "NASDAQ",
    "open": 248.00,
    "previousClose": 245.30,
    "eps": 3.50,
    "pe": 71.57,
    "earningsAnnouncement": "2025-01-25T16:00:00.000+0000",
    "sharesOutstanding": 3200000000,
    "timestamp": 1642252800
  }
]
```

**Paramètres** :
- `ticker` (path, required) : Symbole boursier
- `apikey` (query, required) : Clé API FMP

**Note** : La réponse est un tableau, prendre le premier élément `[0]`

---

## 🔄 Workflow pour `/activity`

### Problème
L'endpoint `/activity` nécessite de récupérer les transactions pour chaque institution qui détient le ticker. Cela peut générer 50+ appels API.

### Solution Optimisée

```javascript
// 1. Récupérer l'ownership (1 appel API)
const ownership = await getOwnership(ticker);
// Retourne: [{ name: "Vanguard", shares: 50000000 }, ...]

// 2. Trier par shares et limiter à 10 institutions
const topInstitutions = ownership
  .sort((a, b) => b.shares - a.shares)
  .slice(0, 10); // MAX 10 institutions

// 3. Pour chaque institution, récupérer les transactions (10 appels max)
const allTransactions = [];
for (const inst of topInstitutions) {
  // Encoder le nom de l'institution
  const encodedName = encodeURIComponent(inst.name);
  
  // Appel API avec délai de 1 seconde
  const transactions = await getInstitutionActivity(encodedName, ticker);
  
  // Filtrer par ticker (si l'API ne le fait pas)
  const tickerTransactions = transactions.filter(t => 
    t.ticker === ticker
  );
  
  allTransactions.push(...tickerTransactions);
  
  // Délai de 1 seconde pour respecter les rate limits
  await sleep(1000);
}

// 4. Retourner les transactions agrégées
return allTransactions;
```

**Total d'appels API** : 1 (ownership) + 10 (activity) = **11 appels maximum**

---

## 📊 Structure des Données

### Ownership
```typescript
interface Ownership {
  name: string;
  shares: number;
  units: number;
  value: number;
  is_hedge_fund: boolean;
  report_date: string; // YYYY-MM-DD
  filing_date: string; // YYYY-MM-DD
  percentage?: number;
}
```

### Activity
```typescript
interface Activity {
  ticker: string;
  institution_name: string;
  units_change: number;
  change: number;
  avg_price: number;
  buy_price?: number;
  sell_price?: number;
  filing_date: string; // YYYY-MM-DD
  report_date: string; // YYYY-MM-DD
  price_on_filing: number;
  price_on_report: number;
  close: number;
  transaction_type: "BUY" | "SELL";
}
```

### Insider Trade
```typescript
interface InsiderTrade {
  ticker: string;
  owner_name: string;
  officer_title: string;
  transaction_code: string; // "A" = Acquisition, "D" = Disposition
  acquisitionOrDisposition: "A" | "D";
  amount: number;
  transaction_date: string; // YYYY-MM-DD
  shares?: number;
  price?: number;
}
```

### Congress Trade
```typescript
interface CongressTrade {
  ticker: string;
  name: string;
  member_type: "senate" | "house";
  txn_type: "Buy" | "Sell";
  amounts: string; // "$500,000 - $1,000,000"
  transaction_date: string; // YYYY-MM-DD
}
```

### Options Flow
```typescript
interface OptionsFlow {
  ticker: string;
  type: "call" | "put";
  strike: number;
  total_premium: number;
  premium: number;
  volume: number;
  expiry: string; // YYYY-MM-DD
  created_at: string; // ISO 8601
  open_interest?: number;
}
```

### Dark Pool Trade
```typescript
interface DarkPoolTrade {
  ticker: string;
  date: string; // YYYY-MM-DD
  volume: number;
  size: number;
  price: number;
  value: number;
}
```

---

## ⚠️ Points d'Attention

1. **Rate Limiting** : Toujours vérifier les headers `x-uw-req-per-minute-remaining`
2. **Délai entre appels** : Minimum 1 seconde entre chaque appel API
3. **Encodage URL** : Encoder les noms d'institutions dans les URLs
4. **Gestion d'erreurs** : Continuer même si une institution échoue
5. **Limite de 10 institutions** : CRITIQUE pour `/activity`

---

## 🔑 Variables d'Environnement Requises

```env
UNUSUAL_WHALES_API_KEY=your_api_key_here
FMP_API_KEY=your_api_key_here
```

---

## 📞 Support

Pour toute question sur les APIs externes :
- **Unusual Whales** : https://unusualwhales.com/api-docs
- **FMP** : https://site.financialmodelingprep.com/developer/docs/





