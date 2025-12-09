# 🔐 Guide du Middleware d'Authentification

## ✅ Architecture Créée

### 1. **Client API de Base** (`lib/api/baseClient.js`)
- Client réutilisable avec logique commune
- Gère les deux types de tokens (ID/ACCESS)
- Configuration centralisée de l'URL

### 2. **Clients Spécialisés**
- **`lib/api/client.js`** - APIs 13F/organizations (ID TOKEN)
- **`lib/api/tickerActivityClient.js`** - Ticker Activity (ACCESS TOKEN)
- **`lib/api/fmpUnusualWhalesClient.js`** - FMP/Unusual Whales (ACCESS TOKEN) ⭐ **NOUVEAU**

### 3. **Protection des Pages**
- **`components/AuthGuard.js`** - Composant wrapper
- **`hocs/withAuth.js`** - HOC (Higher Order Component)

---

## 🛡️ Utilisation du Middleware d'Authentification

### Option 1 : Utiliser le Composant AuthGuard

```javascript
import AuthGuard from "/components/AuthGuard";

function MyProtectedPage() {
  return (
    <AuthGuard>
      <div>Contenu protégé</div>
    </AuthGuard>
  );
}
```

### Option 2 : Utiliser le HOC withAuth (Recommandé)

```javascript
import withAuth from "/hocs/withAuth";

function MyProtectedPage() {
  return <div>Contenu protégé</div>;
}

// Protéger la page
export default withAuth(MyProtectedPage);

// Ou avec options
export default withAuth(MyProtectedPage, { requireAuth: true });
```

---

## 📝 Exemple : Protéger une Page Trading

### Avant (❌ Pas de protection)

```javascript
// pages/dashboards/trading/ticker-activity.js
function TickerActivity() {
  // ... code de la page
}
export default TickerActivity;
```

### Après (✅ Protégé)

```javascript
// pages/dashboards/trading/ticker-activity.js
import withAuth from "/hocs/withAuth";

function TickerActivity() {
  // ... code de la page
}

// Protéger la page - redirige vers login si non authentifié
export default withAuth(TickerActivity);
```

---

## 🔄 Flux de Redirection

1. **Utilisateur non authentifié** accède à `/dashboards/trading/ticker-activity`
2. **withAuth détecte** qu'il n'est pas authentifié
3. **Redirection** vers `/authentication/sign-in?redirect=/dashboards/trading/ticker-activity`
4. **Utilisateur se connecte**
5. **Page sign-in** redirige vers `/dashboards/trading/ticker-activity` (depuis `router.query.redirect`)

---

## 📋 Pages à Protéger

### Pages Trading (Nécessitent authentification)
- ✅ `pages/dashboards/trading/ticker-activity.js`
- ✅ `pages/dashboards/trading/whale-tracker.js`
- ✅ `pages/dashboards/trading/portfolio-intelligence.js`
- ✅ `pages/dashboards/trading/opportunities-scanner.js`
- ✅ `pages/dashboards/trading/guru-flow-tracker.js`
- ✅ `pages/dashboards/trading/institutions.js`
- ✅ `pages/dashboards/trading/congress.js`
- ✅ `pages/dashboards/trading/unusual-whales.js`
- ✅ Toutes les pages qui utilisent FMP/Unusual Whales

### Pages Publiques (Pas de protection)
- ❌ `pages/authentication/sign-in/index.js`
- ❌ `pages/authentication/sign-up/index.js`
- ❌ `pages/index.js` (page d'accueil)

---

## 🔧 Migration des Services

### Avant (❌ Clés exposées)

```javascript
import fmpClient from "/lib/fmp/client";
import unusualWhalesClient from "/lib/unusual-whales/client";

const quote = await fmpClient.getQuote("AAPL");
const alerts = await unusualWhalesClient.getFlowAlerts({ ticker: "TSLA" });
```

### Après (✅ Sécurisé)

```javascript
import fmpUWClient from "/lib/api/fmpUnusualWhalesClient";

const quote = await fmpUWClient.getFMPQuote("AAPL");
const alerts = await fmpUWClient.getUWFlowAlerts("TSLA");
```

---

## ✅ Checklist de Migration

### Phase 1 : Architecture (✅ COMPLÉTÉ)
- [x] Créer `lib/api/baseClient.js`
- [x] Créer `lib/api/fmpUnusualWhalesClient.js`
- [x] Refactoriser `lib/api/client.js`
- [x] Refactoriser `lib/api/tickerActivityClient.js`
- [x] Créer `components/AuthGuard.js`
- [x] Créer `hocs/withAuth.js`

### Phase 2 : Protection des Pages (⏳ À FAIRE)
- [ ] Appliquer `withAuth` à `ticker-activity.js`
- [ ] Appliquer `withAuth` à `whale-tracker.js`
- [ ] Appliquer `withAuth` à `portfolio-intelligence.js`
- [ ] Appliquer `withAuth` à `opportunities-scanner.js`
- [ ] Appliquer `withAuth` à toutes les pages trading

### Phase 3 : Migration des Services (⏳ À FAIRE)
- [ ] Migrer `services/aladdinService.js`
- [ ] Migrer `services/tickerActivityService.js`
- [ ] Migrer `services/whaleTrackerService.js`
- [ ] Migrer tous les autres services

### Phase 4 : Nettoyage (⏳ À FAIRE)
- [ ] Supprimer `lib/fmp/client.js`
- [ ] Supprimer `lib/unusual-whales/client.js`
- [ ] Supprimer variables `NEXT_PUBLIC_FMP_API_KEY` et `NEXT_PUBLIC_UNUSUAL_WHALES`
- [ ] Mettre à jour tous les imports

---

## 🎯 Prochaines Étapes

1. **Appliquer `withAuth`** aux pages trading critiques
2. **Migrer les services** un par un vers le nouveau client
3. **Tester** chaque migration
4. **Supprimer** les anciens clients une fois tout migré

---

**Date de création**: 2025-01-XX  
**Statut**: ✅ Architecture créée, ⏳ Migration en cours





