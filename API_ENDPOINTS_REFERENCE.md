# 🔌 Référence des Endpoints API - Ticker Activity

## Base URL
```
https://api.votre-backend.com/api
```

## Authentification
Tous les endpoints nécessitent un header d'authentification :
```
Authorization: Bearer {JWT_TOKEN}
```

---

## 📡 Endpoints Disponibles

### 1. Quote
```
GET /ticker-activity/{ticker}/quote
```

**Exemple** :
```bash
curl -X GET "https://api.votre-backend.com/api/ticker-activity/TSLA/quote" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

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
    "marketCap": 800000000000
  },
  "cached": true,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

### 2. Ownership Institutionnel
```
GET /ticker-activity/{ticker}/ownership?limit=100
```

**Exemple** :
```bash
curl -X GET "https://api.votre-backend.com/api/ticker-activity/TSLA/ownership?limit=100" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "name": "Vanguard Group Inc",
      "shares": 50000000,
      "value": 12500000000,
      "is_hedge_fund": false,
      "report_date": "2024-09-30",
      "filing_date": "2024-11-15"
    }
  ],
  "cached": true,
  "count": 150,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

### 3. Transactions Institutionnelles
```
GET /ticker-activity/{ticker}/activity?limit=100&force_refresh=false
```

**⚠️ IMPORTANT** : Cet endpoint est limité à 10 institutions maximum pour éviter les boucles infinies.

**Exemple** :
```bash
curl -X GET "https://api.votre-backend.com/api/ticker-activity/TSLA/activity?limit=100" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "institution_name": "Vanguard Group Inc",
      "units_change": 1000000,
      "avg_price": 250.00,
      "filing_date": "2024-11-15",
      "transaction_type": "BUY"
    }
  ],
  "cached": false,
  "count": 45,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

### 4. Hedge Funds
```
GET /ticker-activity/{ticker}/hedge-funds?limit=100
```

**Exemple** :
```bash
curl -X GET "https://api.votre-backend.com/api/ticker-activity/TSLA/hedge-funds?limit=100" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 5. Insiders
```
GET /ticker-activity/{ticker}/insiders?limit=100
```

**Exemple** :
```bash
curl -X GET "https://api.votre-backend.com/api/ticker-activity/TSLA/insiders?limit=100" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 6. Congrès
```
GET /ticker-activity/{ticker}/congress?limit=100
```

**Exemple** :
```bash
curl -X GET "https://api.votre-backend.com/api/ticker-activity/TSLA/congress?limit=100" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 7. Options Flow
```
GET /ticker-activity/{ticker}/options?limit=100&min_premium=10000
```

**Exemple** :
```bash
curl -X GET "https://api.votre-backend.com/api/ticker-activity/TSLA/options?limit=100&min_premium=10000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 8. Dark Pool
```
GET /ticker-activity/{ticker}/dark-pool?limit=100
```

**Exemple** :
```bash
curl -X GET "https://api.votre-backend.com/api/ticker-activity/TSLA/dark-pool?limit=100" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 9. Statistiques
```
GET /ticker-activity/{ticker}/stats
```

**Exemple** :
```bash
curl -X GET "https://api.votre-backend.com/api/ticker-activity/TSLA/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

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

---

## 🔄 Codes de Réponse

- `200 OK` : Succès
- `400 Bad Request` : Paramètres invalides
- `401 Unauthorized` : Token manquant ou invalide
- `404 Not Found` : Ticker non trouvé
- `429 Too Many Requests` : Rate limit atteint
- `500 Internal Server Error` : Erreur serveur

---

## ⚠️ Rate Limits

- **Par utilisateur** : 100 requêtes/minute
- **Par ticker** : 10 requêtes/minute
- **Global** : 1000 requêtes/minute

Headers de réponse :
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642252800
```

---

## 📝 Notes

1. Tous les timestamps sont en UTC (format ISO 8601)
2. Les montants sont en USD
3. Les dates sont au format `YYYY-MM-DD`
4. Le paramètre `force_refresh=true` ignore le cache et force un appel API





