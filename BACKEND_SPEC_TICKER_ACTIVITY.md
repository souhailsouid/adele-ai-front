# 📋 Spécification Backend - Ticker Activity Service

## 🎯 Objectif

Développer un service backend qui agrège toutes les activités institutionnelles, hedge funds, insiders, et whales pour un ticker donné, avec un système de cache pour éviter les chargements infinis et optimiser les performances.

## 🏗️ Architecture Proposée

### Stack Technique Recommandée
- **Backend** : Node.js/Express ou Python/FastAPI
- **Base de données** : PostgreSQL ou MongoDB (pour le cache et l'historique)
- **Cache** : Redis (pour les données fréquemment accédées)
- **Queue** : Bull/BullMQ ou Celery (pour les jobs asynchrones)

## 📡 Endpoints API Requis

### 1. GET `/api/ticker-activity/{ticker}/quote`
**Description** : Récupère le quote actuel d'un ticker

**Paramètres** :
- `ticker` (path) : Symbole boursier (ex: TSLA, AAPL)

**Réponse** :
```json
{
  "success": true,
  "data": {
    "symbol": "TSLA",
    "price": 250.50,
    "change": 5.20,
    "changePercent": 2.12,
    "volume": 50000000,
    "marketCap": 800000000000,
    "timestamp": "2025-01-15T10:30:00Z"
  },
  "cached": true,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Cache TTL** : 1 heure

---

### 2. GET `/api/ticker-activity/{ticker}/ownership`
**Description** : Liste toutes les institutions qui détiennent ce ticker

**Paramètres** :
- `ticker` (path) : Symbole boursier
- `limit` (query, optional) : Nombre max de résultats (défaut: 100)

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "name": "Vanguard Group Inc",
      "shares": 50000000,
      "units": 50000000,
      "value": 12500000000,
      "is_hedge_fund": false,
      "report_date": "2024-09-30",
      "filing_date": "2024-11-15",
      "percentage": 1.5
    },
    {
      "name": "BlackRock Inc",
      "shares": 45000000,
      "units": 45000000,
      "value": 11250000000,
      "is_hedge_fund": false,
      "report_date": "2024-09-30",
      "filing_date": "2024-11-15",
      "percentage": 1.35
    }
  ],
  "cached": true,
  "count": 150,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Cache TTL** : 24 heures

**Source API** : Unusual Whales `GET /api/institution/{ticker}/ownership`

---

### 3. GET `/api/ticker-activity/{ticker}/activity`
**Description** : Transactions récentes des institutions pour ce ticker

**Paramètres** :
- `ticker` (path) : Symbole boursier
- `limit` (query, optional) : Nombre max de résultats (défaut: 100)
- `force_refresh` (query, optional) : Forcer le refresh depuis l'API (défaut: false)

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
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
      "close": 250.50,
      "transaction_type": "BUY"
    },
    {
      "institution_name": "BlackRock Inc",
      "units_change": -500000,
      "change": -500000,
      "avg_price": 251.00,
      "buy_price": null,
      "sell_price": 251.00,
      "filing_date": "2024-11-14",
      "report_date": "2024-09-30",
      "price_on_filing": 251.50,
      "price_on_report": 248.00,
      "close": 250.50,
      "transaction_type": "SELL"
    }
  ],
  "cached": false,
  "count": 45,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Cache TTL** : 24 heures

**Source API** : 
- Unusual Whales `GET /api/institution/{ticker}/ownership` (pour obtenir la liste des institutions)
- Puis pour chaque institution : `GET /api/institution/{institution_name}/activity?ticker={ticker}`

**⚠️ OPTIMISATION CRITIQUE** : Limiter à **10 institutions maximum** pour éviter les boucles infinies et respecter les rate limits.

---

### 4. GET `/api/ticker-activity/{ticker}/hedge-funds`
**Description** : Holdings des hedge funds pour ce ticker

**Paramètres** :
- `ticker` (path) : Symbole boursier
- `limit` (query, optional) : Nombre max de résultats (défaut: 100)

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "name": "Renaissance Technologies LLC",
      "shares": 5000000,
      "units": 5000000,
      "value": 1250000000,
      "report_date": "2024-09-30",
      "filing_date": "2024-11-15",
      "percentage": 0.15
    }
  ],
  "cached": true,
  "count": 25,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Cache TTL** : 24 heures

**Source API** : Filtrer les résultats de `/api/ticker-activity/{ticker}/ownership` où `is_hedge_fund = true`

---

### 5. GET `/api/ticker-activity/{ticker}/insiders`
**Description** : Transactions des insiders pour ce ticker

**Paramètres** :
- `ticker` (path) : Symbole boursier
- `limit` (query, optional) : Nombre max de résultats (défaut: 100)

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "owner_name": "Elon Musk",
      "officer_title": "CEO",
      "transaction_code": "A",
      "acquisitionOrDisposition": "A",
      "amount": 10000000,
      "transaction_date": "2024-11-10",
      "shares": 40000,
      "price": 250.00
    }
  ],
  "cached": true,
  "count": 12,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Cache TTL** : 24 heures

**Source API** : Unusual Whales `GET /api/insider/transactions?ticker={ticker}`

---

### 6. GET `/api/ticker-activity/{ticker}/congress`
**Description** : Transactions du Congrès pour ce ticker

**Paramètres** :
- `ticker` (path) : Symbole boursier
- `limit` (query, optional) : Nombre max de résultats (défaut: 100)

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "name": "Nancy Pelosi",
      "member_type": "house",
      "txn_type": "Buy",
      "amounts": "$500,000 - $1,000,000",
      "transaction_date": "2024-11-05"
    }
  ],
  "cached": true,
  "count": 5,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Cache TTL** : 24 heures

**Source API** : Unusual Whales `GET /api/congress/recent-trades?ticker={ticker}`

---

### 7. GET `/api/ticker-activity/{ticker}/options`
**Description** : Options flow pour ce ticker

**Paramètres** :
- `ticker` (path) : Symbole boursier
- `limit` (query, optional) : Nombre max de résultats (défaut: 100)
- `min_premium` (query, optional) : Premium minimum (défaut: 10000)

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "type": "call",
      "strike": 260.00,
      "total_premium": 500000,
      "premium": 500000,
      "volume": 1000,
      "expiry": "2025-01-17",
      "created_at": "2025-01-15T10:00:00Z",
      "open_interest": 5000
    }
  ],
  "cached": true,
  "count": 50,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Cache TTL** : 1 heure (données très volatiles)

**Source API** : Unusual Whales `GET /api/flow/alerts?ticker={ticker}&min_premium={min_premium}`

---

### 8. GET `/api/ticker-activity/{ticker}/dark-pool`
**Description** : Dark pool trades pour ce ticker

**Paramètres** :
- `ticker` (path) : Symbole boursier
- `limit` (query, optional) : Nombre max de résultats (défaut: 100)

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-01-15",
      "volume": 1000000,
      "size": 1000000,
      "price": 250.25,
      "value": 250250000
    }
  ],
  "cached": true,
  "count": 20,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Cache TTL** : 1 heure

**Source API** : Unusual Whales `GET /api/darkpool/recent?ticker={ticker}`

---

### 9. GET `/api/ticker-activity/{ticker}/stats`
**Description** : Statistiques agrégées pour ce ticker

**Paramètres** :
- `ticker` (path) : Symbole boursier

**Réponse** :
```json
{
  "success": true,
  "data": {
    "totalInstitutions": 150,
    "totalHedgeFunds": 25,
    "totalInstitutionalShares": 500000000,
    "totalInstitutionalValue": 125000000000,
    "recentBuys": 45,
    "recentSells": 30,
    "netActivity": 15,
    "insiderTrades": 12,
    "congressTrades": 5,
    "optionsFlow": {
      "totalAlerts": 50,
      "callPremium": 10000000,
      "putPremium": 5000000,
      "putCallRatio": 0.5
    },
    "darkPool": {
      "totalTrades": 20,
      "totalVolume": 50000000
    }
  },
  "cached": true,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Cache TTL** : 1 heure

---

## 🔌 Intégrations API Externes

### Unusual Whales API

**Base URL** : `https://api.unusualwhales.com/api`

**Endpoints utilisés** :
1. `GET /institution/{ticker}/ownership` - Ownership institutionnel
2. `GET /institution/{institution_name}/activity?ticker={ticker}` - Activité d'une institution
3. `GET /insider/transactions?ticker={ticker}` - Transactions insiders
4. `GET /congress/recent-trades?ticker={ticker}` - Transactions du Congrès
5. `GET /flow/alerts?ticker={ticker}&min_premium={min_premium}` - Options flow
6. `GET /darkpool/recent?ticker={ticker}` - Dark pool trades

**Rate Limits** :
- 60 requêtes par minute
- Headers à surveiller : `x-uw-req-per-minute-remaining`, `x-uw-req-per-minute-reset`

**Authentification** :
- Header : `Authorization: Bearer {API_KEY}`

### Financial Modeling Prep (FMP) API

**Base URL** : `https://financialmodelingprep.com/api/v3`

**Endpoints utilisés** :
1. `GET /quote/{ticker}?apikey={API_KEY}` - Quote actuel

**Rate Limits** :
- Starter Plan : 250 requêtes/jour
- Limite de 10 résultats pour certaines endpoints

**Authentification** :
- Query parameter : `apikey={API_KEY}`

---

## 🗄️ Schéma de Base de Données

### Table: `ticker_quotes`
```sql
CREATE TABLE ticker_quotes (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  price DECIMAL(10, 2),
  change DECIMAL(10, 2),
  change_percent DECIMAL(5, 2),
  volume BIGINT,
  market_cap BIGINT,
  data JSONB,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  UNIQUE(ticker)
);

CREATE INDEX idx_ticker_quotes_ticker ON ticker_quotes(ticker);
CREATE INDEX idx_ticker_quotes_expires ON ticker_quotes(expires_at);
```

### Table: `institutional_ownership`
```sql
CREATE TABLE institutional_ownership (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10) NOT NULL,
  institution_name VARCHAR(255) NOT NULL,
  shares BIGINT,
  units BIGINT,
  value DECIMAL(15, 2),
  is_hedge_fund BOOLEAN DEFAULT FALSE,
  report_date DATE,
  filing_date DATE,
  percentage DECIMAL(5, 2),
  data JSONB,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  UNIQUE(ticker, institution_name, report_date)
);

CREATE INDEX idx_ownership_ticker ON institutional_ownership(ticker);
CREATE INDEX idx_ownership_expires ON institutional_ownership(expires_at);
```

### Table: `institutional_activity`
```sql
CREATE TABLE institutional_activity (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10) NOT NULL,
  institution_name VARCHAR(255),
  units_change BIGINT,
  change BIGINT,
  avg_price DECIMAL(10, 2),
  buy_price DECIMAL(10, 2),
  sell_price DECIMAL(10, 2),
  filing_date DATE,
  report_date DATE,
  price_on_filing DECIMAL(10, 2),
  price_on_report DECIMAL(10, 2),
  close DECIMAL(10, 2),
  transaction_type VARCHAR(10),
  data JSONB,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

CREATE INDEX idx_activity_ticker ON institutional_activity(ticker);
CREATE INDEX idx_activity_expires ON institutional_activity(expires_at);
CREATE INDEX idx_activity_institution ON institutional_activity(institution_name);
```

### Table: `insider_trades`
```sql
CREATE TABLE insider_trades (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10) NOT NULL,
  owner_name VARCHAR(255),
  officer_title VARCHAR(255),
  transaction_code VARCHAR(10),
  acquisition_or_disposition VARCHAR(10),
  amount DECIMAL(15, 2),
  transaction_date DATE,
  shares BIGINT,
  price DECIMAL(10, 2),
  data JSONB,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

CREATE INDEX idx_insiders_ticker ON insider_trades(ticker);
CREATE INDEX idx_insiders_expires ON insider_trades(expires_at);
```

### Table: `congress_trades`
```sql
CREATE TABLE congress_trades (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10) NOT NULL,
  name VARCHAR(255),
  member_type VARCHAR(20),
  txn_type VARCHAR(10),
  amounts VARCHAR(100),
  transaction_date DATE,
  data JSONB,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

CREATE INDEX idx_congress_ticker ON congress_trades(ticker);
CREATE INDEX idx_congress_expires ON congress_trades(expires_at);
```

### Table: `options_flow`
```sql
CREATE TABLE options_flow (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10) NOT NULL,
  type VARCHAR(10),
  strike DECIMAL(10, 2),
  total_premium DECIMAL(15, 2),
  premium DECIMAL(15, 2),
  volume INTEGER,
  expiry DATE,
  created_at TIMESTAMP,
  open_interest INTEGER,
  data JSONB,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

CREATE INDEX idx_options_ticker ON options_flow(ticker);
CREATE INDEX idx_options_expires ON options_flow(expires_at);
```

### Table: `dark_pool_trades`
```sql
CREATE TABLE dark_pool_trades (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10) NOT NULL,
  date DATE,
  volume BIGINT,
  size BIGINT,
  price DECIMAL(10, 2),
  value DECIMAL(15, 2),
  data JSONB,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

CREATE INDEX idx_darkpool_ticker ON dark_pool_trades(ticker);
CREATE INDEX idx_darkpool_expires ON dark_pool_trades(expires_at);
```

---

## ⚡ Optimisations Critiques

### 1. Limite stricte pour `/activity`
**Problème** : Si un ticker est détenu par 50+ institutions, cela génère 50+ appels API.

**Solution** :
- Limiter à **10 institutions maximum** pour récupérer les transactions
- Prioriser les institutions avec le plus de shares
- Utiliser un délai de 1 seconde entre chaque appel API

```javascript
// Pseudo-code
const ownership = await getOwnership(ticker);
const topInstitutions = ownership
  .sort((a, b) => b.shares - a.shares)
  .slice(0, 10); // MAX 10

for (const inst of topInstitutions) {
  const transactions = await getInstitutionActivity(inst.name, ticker);
  // ... traiter les transactions
  await sleep(1000); // Délai de 1 seconde
}
```

### 2. Cache Strategy
- **Cache-first** : Vérifier le cache avant chaque appel API
- **TTL** : 
  - Quotes : 1 heure
  - Autres : 24 heures
- **Invalidation** : Supprimer les données expirées automatiquement

### 3. Rate Limiting
- Implémenter un rate limiter pour respecter les limites des APIs externes
- Utiliser Redis pour tracker les appels par minute
- Retourner une erreur 429 si limite atteinte

### 4. Jobs Asynchrones
- Utiliser une queue (Bull/BullMQ) pour mettre à jour le cache en arrière-plan
- Job quotidien pour rafraîchir les données expirées
- Job horaire pour les quotes

---

## 🚀 Roadmap de Développement

### Phase 1 : Infrastructure (Semaine 1)
- [ ] Setup base de données (PostgreSQL/MongoDB)
- [ ] Setup Redis pour le cache
- [ ] Setup queue system (Bull/BullMQ)
- [ ] Créer les tables/schémas
- [ ] Configuration des APIs externes (Unusual Whales, FMP)

### Phase 2 : Endpoints de Base (Semaine 2)
- [ ] `GET /api/ticker-activity/{ticker}/quote`
- [ ] `GET /api/ticker-activity/{ticker}/ownership`
- [ ] `GET /api/ticker-activity/{ticker}/hedge-funds`
- [ ] Système de cache basique

### Phase 3 : Endpoint Critique (Semaine 2-3)
- [ ] `GET /api/ticker-activity/{ticker}/activity` (avec limite de 10 institutions)
- [ ] Optimisation des appels API
- [ ] Gestion des rate limits

### Phase 4 : Endpoints Secondaires (Semaine 3)
- [ ] `GET /api/ticker-activity/{ticker}/insiders`
- [ ] `GET /api/ticker-activity/{ticker}/congress`
- [ ] `GET /api/ticker-activity/{ticker}/options`
- [ ] `GET /api/ticker-activity/{ticker}/dark-pool`

### Phase 5 : Statistiques et Optimisations (Semaine 4)
- [ ] `GET /api/ticker-activity/{ticker}/stats`
- [ ] Jobs asynchrones pour refresh du cache
- [ ] Monitoring et logging
- [ ] Tests de performance

### Phase 6 : Production (Semaine 5)
- [ ] Tests d'intégration
- [ ] Documentation API (Swagger/OpenAPI)
- [ ] Déploiement
- [ ] Monitoring en production

---

## 📊 Métriques de Performance Cibles

- **Temps de réponse (cache hit)** : < 50ms
- **Temps de réponse (cache miss)** : < 20 secondes (max 10 institutions)
- **Disponibilité** : 99.9%
- **Taux de cache hit** : > 80%

---

## 🔐 Sécurité

- Authentification : JWT ou API Key
- Rate limiting par utilisateur
- Validation des paramètres d'entrée
- Sanitization des données
- Logging des erreurs (sans exposer les clés API)

---

## 📝 Notes Importantes

1. **Limite de 10 institutions** : CRITIQUE pour éviter les boucles infinies
2. **Délai entre appels** : 1 seconde minimum entre chaque appel API
3. **Gestion d'erreurs** : Continuer même si une institution échoue
4. **Cache TTL** : Respecter les TTL pour éviter les données obsolètes
5. **Monitoring** : Surveiller les rate limits et les temps de réponse

---

## 📞 Contact

Pour toute question sur cette spécification, contacter l'équipe frontend.





