# Configuration FMP API

## 📋 Prérequis

Pour utiliser les fonctionnalités de trading, vous devez avoir un compte **FMP Starter** ($19/mois) et configurer votre clé API.

## 🔑 Configuration de la clé API

1. **Obtenir votre clé API FMP** :
   - Créez un compte sur [Financial Modeling Prep](https://financialmodelingprep.com/)
   - Souscrivez au plan Starter
   - Récupérez votre clé API dans votre dashboard

2. **Ajouter la clé dans `.env.local`** :
   ```env
   NEXT_PUBLIC_FMP_API_KEY=votre_cle_api_ici
   ```

3. **Redémarrer le serveur** :
   ```bash
   npm run dev
   ```

## 🚀 Fonctionnalités Disponibles

### 1. Screener Intelligent
- **Earnings Opportunities** : Détecte les opportunités avant les earnings (7 prochains jours)
- **Oversold Bounces** : Identifie les rebonds sur actions oversold (RSI < 30)
- **Unusual Volume** : Détecte les volumes anormaux (> 3x moyenne)

### 2. Dashboard Marché
- **Indices Majeurs** : SPY, QQQ, DIA, IWM
- **Performance Secteurs** : Vue d'ensemble par secteur
- **Earnings du Jour** : Calendrier des earnings du jour

### 3. Système d'Alertes
- **Alertes Prix** : Alerte quand un prix atteint un niveau spécifique
- **Alertes Volume** : Alerte sur volume anormal
- **Alertes RSI** : Alerte sur conditions oversold/overbought
- **Alertes Earnings** : Alerte 24h avant les earnings importants

## 📍 Accès au Dashboard

Une fois configuré, accédez au dashboard trading via :
- **URL** : `http://localhost:3000/dashboards/trading`
- **Navigation** : Dashboards > Trading (dans le menu latéral)

## 🔧 Limitations du Plan Starter

Avec le plan Starter, vous avez :
- ✅ 300 appels API/minute
- ✅ Données historiques 5 ans
- ✅ Données fondamentales annuelles
- ✅ Actualités marché
- ✅ Crypto & Forex
- ✅ 150+ endpoints disponibles

## ⚠️ Gestion du Rate Limiting

Le client FMP gère automatiquement les erreurs, mais faites attention à :
- Ne pas faire trop d'appels simultanés
- Le dashboard se rafraîchit automatiquement toutes les minutes
- Les alertes sont vérifiées de manière optimisée

## 🐛 Dépannage

### Erreur "FMP API key not configured"
- Vérifiez que `NEXT_PUBLIC_FMP_API_KEY` est bien dans `.env.local`
- Redémarrez le serveur après modification de `.env.local`

### Erreur "FMP API error: 429"
- Vous avez dépassé la limite de 300 appels/minute
- Attendez quelques secondes avant de réessayer

### Pas de données affichées
- Vérifiez votre connexion internet
- Vérifiez que votre clé API est valide
- Consultez la console du navigateur pour les erreurs détaillées

## 📚 Documentation FMP

Pour plus d'informations sur l'API FMP :
- [Documentation officielle](https://site.financialmodelingprep.com/developer/docs/)
- [Liste des endpoints](https://site.financialmodelingprep.com/developer/docs/#Stock-API)


