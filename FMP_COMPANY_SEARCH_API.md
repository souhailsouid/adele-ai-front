# 🔍 FMP Company Search API - Intégration

## ✅ Méthodes Ajoutées

Toutes les méthodes de la section "Company Search" de FMP ont été intégrées dans `lib/api/fmpUnusualWhalesClient.js`.

### 1. **searchSymbol** - Recherche par symbole
```javascript
const results = await fmpUWClient.searchSymbol("AAPL", {
  limit: 50,
  exchange: "NASDAQ"
});
```

### 2. **searchCompanyByName** - Recherche par nom (améliorée)
```javascript
// Déjà existante, maintenant avec options
const results = await fmpUWClient.searchCompanyByName("Apple", {
  limit: 50,
  exchange: "NASDAQ"
});
```

### 3. **searchByCIK** - Recherche par CIK
```javascript
const results = await fmpUWClient.searchByCIK("320193", {
  limit: 50
});
```

### 4. **searchByCUSIP** - Recherche par CUSIP
```javascript
const results = await fmpUWClient.searchByCUSIP("037833100");
```

### 5. **searchByISIN** - Recherche par ISIN
```javascript
const results = await fmpUWClient.searchByISIN("US0378331005");
```

### 6. **stockScreener** - Screener d'actions
```javascript
const results = await fmpUWClient.stockScreener({
  marketCapMoreThan: 1000000,
  marketCapLowerThan: 1000000000,
  sector: "Technology",
  industry: "Consumer Electronics",
  betaMoreThan: 0.5,
  betaLowerThan: 1.5,
  priceMoreThan: 10,
  priceLowerThan: 200,
  dividendMoreThan: 0.5,
  dividendLowerThan: 2,
  volumeMoreThan: 1000,
  volumeLowerThan: 1000000,
  exchange: "NASDAQ",
  country: "US",
  isEtf: false,
  isFund: false,
  isActivelyTrading: true,
  limit: 1000,
  includeAllShareClasses: false
});
```

### 7. **searchExchangeVariants** - Variantes d'échange
```javascript
const results = await fmpUWClient.searchExchangeVariants("AAPL");
```

---

## 📋 Endpoints Backend Attendus

Le backend doit implémenter ces endpoints :

- `GET /fmp/search-symbol?query={query}&limit={limit}&exchange={exchange}`
- `GET /fmp/search-name?query={query}&limit={limit}&exchange={exchange}` (déjà existant)
- `GET /fmp/search-cik?cik={cik}&limit={limit}`
- `GET /fmp/search-cusip?cusip={cusip}`
- `GET /fmp/search-isin?isin={isin}`
- `GET /fmp/company-screener?{criteria}`
- `GET /fmp/search-exchange-variants?symbol={symbol}`

---

## 🎯 Exemples d'Utilisation

### Recherche simple
```javascript
import fmpUWClient from "/lib/api/fmpUnusualWhalesClient";

// Rechercher "Apple"
const companies = await fmpUWClient.searchCompanyByName("Apple");

// Rechercher par symbole
const symbols = await fmpUWClient.searchSymbol("AAPL");
```

### Screener avancé
```javascript
// Trouver des actions tech avec market cap entre 1B et 100B
const techStocks = await fmpUWClient.stockScreener({
  sector: "Technology",
  marketCapMoreThan: 1000000000,
  marketCapLowerThan: 100000000000,
  isActivelyTrading: true,
  limit: 100
});
```

### Recherche par identifiant
```javascript
// Par CIK
const byCIK = await fmpUWClient.searchByCIK("320193");

// Par CUSIP
const byCUSIP = await fmpUWClient.searchByCUSIP("037833100");

// Par ISIN
const byISIN = await fmpUWClient.searchByISIN("US0378331005");
```

---

## ✅ Statut

- [x] Méthodes ajoutées au client
- [x] Documentation créée
- [ ] Backend endpoints à implémenter
- [ ] Tests à effectuer

---

**Date**: 2025-01-XX  
**Fichier**: `lib/api/fmpUnusualWhalesClient.js`





