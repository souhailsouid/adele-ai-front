# 🐛 Debug - Ticker Activity API

## ✅ Vérifications à Faire

### 1. Vérifier que le client est bien importé

Dans `pages/dashboards/trading/ticker-activity.js`, vérifier :
```javascript
import tickerActivityClient from "/lib/api/tickerActivityClient";
```

### 2. Vérifier que les appels sont directs (pas via route API)

Le code doit appeler directement :
```javascript
const result = await tickerActivityClient.getActivityByType(ticker, tabId, {
  limit: 100,
  forceRefresh: false,
});
```

**❌ NE PAS utiliser** :
```javascript
const response = await fetch(`/api/ticker-activity-by-type?symbol=${ticker}&type=${tabId}`);
```

### 3. Vérifier l'URL de l'API Gateway

Dans `.env.local` :
```env
NEXT_PUBLIC_API_URL=https://tsdd1sibd1.execute-api.eu-west-3.amazonaws.com/prod
```

### 4. Vérifier l'authentification

Ouvrir la console du navigateur et vérifier :
- Le token est récupéré : `authService.getAccessToken()` retourne un token
- Le header Authorization est présent dans les logs
- L'URL appelée est correcte : `/ticker-activity/TSLA/ownership` (pas `/api/ticker-activity-by-type`)

### 5. Vérifier dans les DevTools Network

1. Ouvrir DevTools → Network
2. Filtrer par "ticker-activity"
3. Cliquer sur la requête
4. Vérifier :
   - **Request URL** : `https://tsdd1sibd1.execute-api.eu-west-3.amazonaws.com/prod/ticker-activity/TSLA/ownership`
   - **Request Headers** → `Authorization: Bearer eyJ...`
   - **Status** : 200 (pas 401)

## 🔍 Logs Attendus

Dans la console, vous devriez voir :
```
[TickerActivityClient] GET https://tsdd1sibd1.execute-api.eu-west-3.amazonaws.com/prod/ticker-activity/TSLA/ownership {
  hasToken: true,
  tokenLength: 1234,
  tokenPreview: "eyJraWQiOiJcL0V...",
  hasAuthHeader: true,
  authHeaderPreview: "Bearer eyJraWQiOiJcL0V..."
}
```

## ⚠️ Si vous voyez encore `/api/ticker-activity-by-type`

Cela signifie que le code n'a pas été mis à jour. Vérifier :
1. Le serveur Next.js a été redémarré
2. Le cache du navigateur est vidé (Ctrl+Shift+R)
3. Le fichier `ticker-activity.js` contient bien `tickerActivityClient.getActivityByType()`

## 🔧 Solution Rapide

Si le problème persiste, supprimer complètement la route API Next.js et appeler directement :

```javascript
// Dans ticker-activity.js
import tickerActivityClient from "/lib/api/tickerActivityClient";

// Appel direct
const result = await tickerActivityClient.getActivityByType("TSLA", "ownership", {
  limit: 100,
});
```





