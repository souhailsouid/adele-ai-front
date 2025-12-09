# 🔌 Intégration Backend - Ticker Activity Service

## ✅ Statut

Le backend a été déployé avec succès et est prêt à être utilisé.

## 🔗 Configuration

### URL de l'API Gateway

D'après `TICKER_ACTIVITY_SUCCESS.md`, l'API Gateway est déployée sur :
```
https://tsdd1sibd1.execute-api.eu-west-3.amazonaws.com/prod
```

### Variable d'Environnement

Ajouter dans `.env.local` :
```env
NEXT_PUBLIC_API_URL=https://tsdd1sibd1.execute-api.eu-west-3.amazonaws.com/prod
```

## 📡 Endpoints Disponibles

Tous les endpoints suivent le format :
```
GET /ticker-activity/{ticker}/{type}
```

### Types disponibles :
- `quote` - Quote actuel
- `ownership` - Ownership institutionnel
- `activity` - Transactions institutionnelles
- `hedge-funds` - Hedge funds
- `insiders` - Transactions insiders
- `congress` - Transactions Congrès
- `options` - Options flow
- `dark-pool` - Dark pool trades
- `stats` - Statistiques agrégées

## 🔄 Format de Réponse

Le backend retourne toujours :
```json
{
  "success": true,
  "data": [...],
  "cached": true/false,
  "count": 123,
  "timestamp": "2025-12-01T14:31:14.93434+00:00"
}
```

## 🔐 Authentification

Tous les endpoints nécessitent un JWT token dans le header :
```
Authorization: Bearer {ID_TOKEN}
```

Le token est automatiquement récupéré via `authService.getIdToken()`.

## 📝 Exemples

### Quote
```javascript
const quote = await tickerActivityClient.getQuote("TSLA");
// Retourne: { symbol, price, change, changePercent, volume, marketCap, timestamp }
```

### Ownership
```javascript
const ownership = await tickerActivityClient.getOwnership("TSLA", { limit: 100 });
// Retourne: { data: [...], cached: true, count: 150 }
```

### Activity
```javascript
const activity = await tickerActivityClient.getActivity("TSLA", { 
  limit: 100, 
  forceRefresh: false 
});
// Retourne: { data: [...], cached: false, count: 45 }
```

## 🚀 Utilisation dans le Frontend

Le client `tickerActivityClient` est maintenant utilisé dans :
- `/pages/api/ticker-activity-by-type.js` - Route API proxy
- `/pages/dashboards/trading/ticker-activity.js` - Page frontend

## ⚠️ Notes Importantes

1. **Authentification requise** : L'utilisateur doit être connecté (JWT token)
2. **Cache** : Le backend gère le cache automatiquement (TTL: 1h pour quotes, 24h pour autres)
3. **Rate limiting** : Le backend gère les rate limits des APIs externes
4. **Optimisation** : L'endpoint `/activity` est limité à 10 institutions max

## 🧪 Test

1. Vérifier que `NEXT_PUBLIC_API_URL` est configuré dans `.env.local`
2. Se connecter pour obtenir un JWT token
3. Tester avec un ticker (ex: TSLA)
4. Vérifier les logs dans la console pour voir les appels API

## 📚 Documentation

- **TICKER_ACTIVITY_SUCCESS.md** - Statut du déploiement backend
- **BACKEND_SPEC_TICKER_ACTIVITY.md** - Spécification complète
- **API_ENDPOINTS_REFERENCE.md** - Référence des endpoints





