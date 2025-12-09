# 🔍 Guide de Débogage CloudWatch - Erreur 500

## 📋 Logs Actuels

Vous voyez dans CloudWatch :
```json
{
  "requestId": "U9VNUigdCGYEJ8Q=",
  "routeKey": "GET /ticker-activity/{ticker}/activity",
  "status": "500"
}
```

**Problème** : Ces logs ne montrent pas l'erreur exacte. Il faut trouver les logs détaillés.

## 🔎 Étapes pour Trouver les Logs Détaillés

### 1. Vérifier les Log Groups

Dans CloudWatch, vérifiez **TOUS** les log groups :

#### A. Log Group Lambda
- Nom : `/aws/lambda/your-lambda-function-name`
- Cherchez les logs avec le même `requestId` : `U9VNUigdCGYEJ8Q=`
- Filtrez par : `requestId U9VNUigdCGYEJ8Q`

#### B. Log Group API Gateway
- Nom : `/aws/apigateway/your-api-name`
- Cherchez les logs avec le même timestamp : `2025-12-02T11:36:01.661Z`

#### C. Log Group Custom (si le backend utilise un logger)
- Cherchez les logs avec `ERROR`, `Exception`, `Traceback`

### 2. Filtrer les Logs

Dans CloudWatch Logs Insights, utilisez cette requête :

```sql
fields @timestamp, @message
| filter @message like /U9VNUigdCGYEJ8Q/
| sort @timestamp desc
```

Ou pour trouver toutes les erreurs :

```sql
fields @timestamp, @message, @logStream
| filter @message like /ERROR/ or @message like /Exception/ or @message like /500/
| filter @timestamp > "2025-12-02T11:35:00Z"
| sort @timestamp desc
```

### 3. Vérifier les Logs de Stack Trace

Cherchez des lignes contenant :
- `ERROR`
- `Exception`
- `Traceback`
- `at Error`
- `stack trace`
- Le nom de votre fonction Lambda

### 4. Vérifier les Variables d'Environnement

Dans Lambda → Configuration → Environment variables :
- Vérifier que toutes les variables sont définies
- Vérifier les API keys (Unusual Whales, FMP)
- Vérifier l'URL de la base de données

## 🎯 Problème Spécifique : Endpoint `/activity`

L'erreur se produit uniquement sur `/activity`. Vérifiez :

### 1. Tester les Autres Endpoints

Testez si les autres endpoints fonctionnent :

```bash
# Quote (devrait fonctionner)
GET /ticker-activity/TSLA/quote

# Ownership (devrait fonctionner)
GET /ticker-activity/TSLA/ownership

# Activity (échoue avec 500)
GET /ticker-activity/TSLA/activity
```

### 2. Vérifier la Logique Backend pour `/activity`

L'endpoint `/activity` récupère les transactions institutionnelles. Vérifiez :

1. **Appel à Unusual Whales API** :
   - L'API key est-elle valide ?
   - Y a-t-il un rate limit ?
   - La réponse est-elle dans le format attendu ?

2. **Traitement des données** :
   - Y a-t-il une transformation de données qui échoue ?
   - Y a-t-il un champ manquant dans la réponse ?

3. **Base de données** :
   - Y a-t-il une requête SQL qui échoue ?
   - Y a-t-il un problème de connexion ?

## 🔧 Actions Immédiates

### 1. Demander au Backend d'Ajouter Plus de Logs

Le backend devrait logger :
```python
# Exemple Python
import logging
logger = logging.getLogger()

def get_activity(ticker):
    try:
        logger.info(f"Fetching activity for {ticker}")
        
        # Appel API
        response = unusual_whales_client.get_institution_activity(ticker)
        logger.info(f"API response: {response.status_code}")
        
        # Traitement
        data = process_activity(response.json())
        logger.info(f"Processed {len(data)} activities")
        
        return data
    except Exception as e:
        logger.error(f"Error in get_activity: {str(e)}", exc_info=True)
        raise
```

### 2. Vérifier les Logs avec Plus de Détails

Dans CloudWatch, cherchez des logs qui contiennent :
- Le ticker (`TSLA`)
- Le mot "activity"
- Le requestId (`U9VNUigdCGYEJ8Q`)

### 3. Tester avec un Ticker Différent

Testez avec un autre ticker pour voir si c'est spécifique à `TSLA` :
```bash
GET /ticker-activity/AAPL/activity
GET /ticker-activity/MSFT/activity
```

## 📊 Structure de la Requête Attendue

L'endpoint `/activity` devrait :
1. Récupérer les institutions qui détiennent le ticker
2. Pour chaque institution, récupérer son activité récente
3. Filtrer par ticker
4. Retourner les transactions

**Problème possible** : Si une institution retourne une erreur, tout l'endpoint échoue.

## 🛠️ Solution Temporaire : Ajouter un Try-Catch

Le backend devrait gérer les erreurs partielles :

```python
def get_activity(ticker):
    activities = []
    institutions = get_institutions_for_ticker(ticker)
    
    for institution in institutions:
        try:
            activity = get_institution_activity(institution.name, ticker)
            activities.extend(activity)
        except Exception as e:
            logger.warning(f"Failed to get activity for {institution.name}: {e}")
            continue  # Continuer avec les autres institutions
    
    return activities
```

## 🔍 Checklist de Débogage

- [ ] Vérifier tous les log groups dans CloudWatch
- [ ] Utiliser Logs Insights pour filtrer par requestId
- [ ] Chercher les logs avec "ERROR", "Exception", "Traceback"
- [ ] Tester les autres endpoints (quote, ownership) pour voir s'ils fonctionnent
- [ ] Tester avec un autre ticker (AAPL, MSFT)
- [ ] Vérifier les variables d'environnement Lambda
- [ ] Vérifier les API keys (Unusual Whales, FMP)
- [ ] Demander au backend d'ajouter plus de logs détaillés
- [ ] Vérifier les logs de l'API Gateway (pas seulement Lambda)

## 📝 Informations à Collecter

Pour aider le backend à déboguer, collectez :

1. **RequestId** : `U9VNUigdCGYEJ8Q=`
2. **Timestamp** : `2025-12-02T11:36:01.661Z`
3. **Ticker testé** : `TSLA`
4. **Endpoint** : `GET /ticker-activity/{ticker}/activity`
5. **Logs CloudWatch complets** (pas seulement le status)
6. **Variables d'environnement** (sans les valeurs sensibles)
7. **Autres endpoints testés** (quote, ownership fonctionnent-ils ?)

## ✅ Prochaines Étapes

1. **Immédiat** : Chercher les logs détaillés dans CloudWatch avec Logs Insights
2. **Court terme** : Tester les autres endpoints pour isoler le problème
3. **Moyen terme** : Demander au backend d'ajouter plus de logging
4. **Long terme** : Implémenter une gestion d'erreur robuste (try-catch par institution)





