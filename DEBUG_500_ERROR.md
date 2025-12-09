# 🔥 Guide de Débogage - Erreur 500 API Gateway

## 🎯 Diagnostic Initial

Une erreur **500** signifie que :
- ✅ L'authentification fonctionne (sinon ce serait 401)
- ✅ La requête atteint le backend
- ❌ Le backend rencontre une erreur lors du traitement

## 📋 Checklist de Débogage

### 1. Vérifier la Console Navigateur

Ouvrir la console (F12) et chercher les logs `[TickerActivityClient]` :

```javascript
[TickerActivityClient] ❌ Error 500: {
  status: 500,
  statusText: "Internal Server Error",
  url: "https://tsdd1sibd1.execute-api.eu-west-3.amazonaws.com/prod/ticker-activity/TSLA/ownership",
  errorText: "..."
}
```

**Copier l'erreur complète** pour l'analyser.

### 2. Vérifier la Structure de la Requête

Dans DevTools → Network :
1. Cliquer sur la requête qui retourne 500
2. Vérifier :
   - **Request URL** : Format correct ?
   - **Request Method** : GET ?
   - **Request Headers** : `Authorization: Bearer ...` présent ?
   - **Response** : Quel est le message d'erreur exact ?

### 3. Vérifier les Logs Backend

#### Option A : CloudWatch Logs (AWS)

1. Aller dans AWS Console → CloudWatch
2. Logs → Log groups
3. Chercher le log group de votre Lambda/API Gateway
4. Filtrer par timestamp de l'erreur
5. Chercher les erreurs (ERROR, Exception, etc.)

#### Option B : Logs API Gateway

1. AWS Console → API Gateway
2. Sélectionner votre API
3. Stages → prod (ou votre stage)
4. Logs → Voir les logs de requête

### 4. Vérifier le Format de la Requête

L'API Gateway attend :
```
GET /ticker-activity/{ticker}/{type}?limit=100&force_refresh=false
```

**Vérifier** :
- ✅ Le ticker est en majuscules : `TSLA` (pas `tsla`)
- ✅ Le type est correct : `ownership`, `activity`, `hedge-funds`, etc.
- ✅ Les query params sont optionnels

### 5. Tester avec cURL

Tester directement l'API Gateway pour isoler le problème :

```bash
# Récupérer votre ACCESS TOKEN depuis localStorage
# Dans la console navigateur :
# localStorage.getItem('cognito_access_token')

# Puis tester avec cURL
curl -X GET \
  "https://tsdd1sibd1.execute-api.eu-west-3.amazonaws.com/prod/ticker-activity/TSLA/ownership?limit=100" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -v
```

**Analyser la réponse** :
- Si cURL fonctionne → Problème côté frontend
- Si cURL échoue aussi → Problème côté backend

## 🔍 Erreurs Communes et Solutions

### Erreur 1 : "Invalid ticker format"

**Symptôme** : Le backend ne reconnaît pas le ticker

**Solution** :
```javascript
// S'assurer que le ticker est en majuscules
const ticker = "TSLA".toUpperCase();
```

### Erreur 2 : "Type not found" ou "Invalid type"

**Symptôme** : Le type n'est pas reconnu

**Solution** :
```javascript
// Vérifier le mapping des types
const typeMap = {
  ownership: "ownership",      // ✅
  activity: "activity",         // ✅
  hedgeFunds: "hedge-funds",   // ✅ (avec tiret)
  insiders: "insiders",         // ✅
  congress: "congress",        // ✅
  options: "options",          // ✅
  darkPool: "dark-pool",       // ✅ (avec tiret)
};
```

### Erreur 3 : "Database connection error"

**Symptôme** : Le backend ne peut pas se connecter à la base de données

**Solution** :
- Vérifier les credentials de la base de données
- Vérifier que la base de données est accessible depuis Lambda
- Vérifier les VPC/security groups

### Erreur 4 : "External API error" (Unusual Whales, FMP)

**Symptôme** : Le backend ne peut pas appeler les APIs externes

**Solution** :
- Vérifier les API keys dans les variables d'environnement Lambda
- Vérifier les rate limits
- Vérifier la connectivité réseau depuis Lambda

### Erreur 5 : "Timeout" ou "Function timed out"

**Symptôme** : La Lambda prend trop de temps

**Solution** :
- Augmenter le timeout de la Lambda
- Optimiser les appels API (parallélisation, cache)
- Vérifier les logs pour identifier les opérations lentes

## 🛠️ Outils de Débogage

### 1. Ajouter des Logs Détaillés

Dans le client frontend, ajouter des logs avant l'appel :

```javascript
console.log("[DEBUG] Avant appel API:", {
  ticker,
  type,
  url: `${baseUrl}/ticker-activity/${ticker}/${type}`,
  hasToken: !!token,
});
```

### 2. Tester avec Postman/Insomnia

Créer une requête dans Postman :

```
GET https://tsdd1sibd1.execute-api.eu-west-3.amazonaws.com/prod/ticker-activity/TSLA/ownership
Headers:
  Authorization: Bearer YOUR_ACCESS_TOKEN
  Content-Type: application/json
```

### 3. Vérifier les Variables d'Environnement

Dans AWS Lambda :
- Vérifier que toutes les variables d'environnement sont définies
- Vérifier les API keys (Unusual Whales, FMP)
- Vérifier l'URL de la base de données

### 4. Tester les Endpoints Individuellement

Tester chaque endpoint séparément :

```bash
# Quote
GET /ticker-activity/TSLA/quote

# Ownership
GET /ticker-activity/TSLA/ownership

# Activity
GET /ticker-activity/TSLA/activity

# etc.
```

Identifier quel endpoint échoue pour isoler le problème.

## 📊 Structure de la Réponse Attendue

Le backend devrait retourner :

```json
{
  "success": true,
  "data": [...],
  "cached": false,
  "count": 10,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

En cas d'erreur 500, la réponse peut être :

```json
{
  "error": "Error message",
  "message": "Detailed error message",
  "stack": "Error stack trace (en dev)"
}
```

## 🔧 Actions Correctives

### Si l'erreur vient du backend :

1. **Vérifier les logs CloudWatch** pour l'erreur exacte
2. **Vérifier les variables d'environnement** Lambda
3. **Vérifier la connectivité** (DB, APIs externes)
4. **Vérifier les permissions** IAM de la Lambda
5. **Tester localement** si possible

### Si l'erreur vient du frontend :

1. **Vérifier le format de la requête** (URL, headers)
2. **Vérifier que le token est valide** (non expiré)
3. **Vérifier les logs console** pour plus de détails
4. **Tester avec cURL** pour isoler le problème

## 📝 Template de Rapport de Bug

Si vous devez signaler le bug au backend :

```
**Endpoint** : GET /ticker-activity/TSLA/ownership
**Timestamp** : 2025-01-15 10:30:00 UTC
**Status Code** : 500
**Request Headers** :
  Authorization: Bearer eyJ...
  Content-Type: application/json
**Response Body** :
  {
    "error": "...",
    "message": "..."
  }
**CloudWatch Logs** :
  [Timestamp] ERROR: ...
**Reproduction Steps** :
  1. Appeler GET /ticker-activity/TSLA/ownership
  2. Erreur 500 immédiate
**Expected Behavior** :
  Retourner les données d'ownership
**Actual Behavior** :
  Erreur 500 avec message "..."
```

## ✅ Vérification Finale

Avant de considérer le problème résolu :

- [ ] Les logs CloudWatch montrent l'erreur exacte
- [ ] Le format de la requête est correct
- [ ] Le token est valide et non expiré
- [ ] Les variables d'environnement sont correctes
- [ ] La base de données est accessible
- [ ] Les APIs externes répondent correctement
- [ ] Le test avec cURL fonctionne (ou échoue de la même manière)





