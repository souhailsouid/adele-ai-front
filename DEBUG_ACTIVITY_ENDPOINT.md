# 🔥 Débogage Spécifique - Endpoint `/activity`

## 🎯 Problème Identifié

L'endpoint `GET /ticker-activity/{ticker}/activity` retourne une erreur **500**.

## 📋 Comment Fonctionne `/activity`

D'après la spécification backend, l'endpoint `/activity` :

1. **Étape 1** : Récupère les institutions qui détiennent le ticker
   - Appel à `/ticker-activity/{ticker}/ownership`
   - Limite à **10 institutions maximum** (pour éviter les boucles infinies)

2. **Étape 2** : Pour chaque institution, récupère son activité récente
   - Appel à Unusual Whales : `GET /api/institutions/{institution_name}/activity`
   - Filtre par ticker dans les résultats

3. **Étape 3** : Agrège toutes les transactions et retourne

## 🔍 Causes Possibles de l'Erreur 500

### 1. Problème avec `/ownership` (Étape 1)

Si `/ownership` échoue, `/activity` échoue aussi.

**Test** :
```bash
# Tester si ownership fonctionne
GET /ticker-activity/TSLA/ownership
```

**Si ownership échoue** :
- Vérifier les logs CloudWatch pour `/ownership`
- Vérifier l'API Unusual Whales pour l'endpoint ownership

### 2. Problème avec l'API Unusual Whales (Étape 2)

Si l'appel à Unusual Whales échoue pour une institution, tout l'endpoint peut échouer.

**Causes possibles** :
- Rate limit (429) → Le backend devrait gérer ça
- API key invalide ou expirée
- Format de réponse inattendu
- Timeout (l'API prend trop de temps)

### 3. Problème de Traitement des Données

Si le backend ne peut pas parser ou transformer les données :
- Format de réponse inattendu
- Champ manquant dans la réponse
- Erreur de transformation

### 4. Problème de Base de Données

Si le cache ou la base de données échoue :
- Connexion perdue
- Timeout
- Erreur SQL

## 🛠️ Plan de Débogage

### Étape 1 : Tester les Endpoints Individuellement

Testez dans cet ordre :

```bash
# 1. Quote (le plus simple)
GET /ticker-activity/TSLA/quote
# ✅ Devrait fonctionner

# 2. Ownership (prérequis pour activity)
GET /ticker-activity/TSLA/ownership
# ✅ Devrait fonctionner

# 3. Activity (dépend de ownership)
GET /ticker-activity/TSLA/activity
# ❌ Échoue avec 500
```

**Si ownership fonctionne mais activity échoue** → Le problème est dans l'étape 2 (récupération de l'activité par institution).

### Étape 2 : Chercher les Logs Détaillés dans CloudWatch

#### A. Utiliser CloudWatch Logs Insights

1. Aller dans CloudWatch → Logs → Insights
2. Sélectionner le log group de votre Lambda
3. Utiliser cette requête :

```sql
fields @timestamp, @message, @logStream
| filter @message like /activity/ or @message like /U9VNUigdCGYEJ8Q/
| filter @timestamp > "2025-12-02T11:35:00Z"
| sort @timestamp desc
| limit 100
```

#### B. Chercher les Erreurs Spécifiques

```sql
fields @timestamp, @message
| filter @message like /ERROR/ or @message like /Exception/ or @message like /Traceback/
| filter @message like /activity/ or @message like /institution/
| filter @timestamp > "2025-12-02T11:35:00Z"
| sort @timestamp desc
```

#### C. Chercher les Appels API

```sql
fields @timestamp, @message
| filter @message like /unusual.whales/ or @message like /UW_API/
| filter @timestamp > "2025-12-02T11:35:00Z"
| sort @timestamp desc
```

### Étape 3 : Vérifier les Variables d'Environnement

Dans Lambda → Configuration → Environment variables :

- ✅ `UNUSUAL_WHALES_API_KEY` : Présent et valide ?
- ✅ `FMP_API_KEY` : Présent et valide ?
- ✅ `DATABASE_URL` : Présent et accessible ?

### Étape 4 : Tester avec un Autre Ticker

Testez avec un ticker qui a moins d'institutions :

```bash
# TSLA (beaucoup d'institutions)
GET /ticker-activity/TSLA/activity

# AAPL (beaucoup d'institutions aussi)
GET /ticker-activity/AAPL/activity

# Un ticker moins populaire
GET /ticker-activity/AMD/activity
```

**Si ça fonctionne avec un ticker mais pas un autre** → Problème lié au nombre d'institutions ou à une institution spécifique.

### Étape 5 : Vérifier les Rate Limits

L'endpoint `/activity` fait plusieurs appels API :
- 1 appel pour `/ownership`
- N appels pour l'activité de chaque institution (max 10)

**Si vous avez 10 institutions** :
- 1 appel ownership
- 10 appels activity
- **Total : 11 appels API**

**Vérifier** :
- Le rate limit Unusual Whales : 60 req/min
- Si vous avez déjà fait d'autres appels, vous pourriez être limité

## 🔧 Solutions Proposées au Backend

### Solution 1 : Gestion d'Erreur Robuste

Le backend devrait gérer les erreurs partielles :

```python
def get_activity(ticker):
    activities = []
    errors = []
    
    # Étape 1 : Récupérer les institutions
    try:
        institutions = get_ownership(ticker, limit=10)
    except Exception as e:
        logger.error(f"Failed to get ownership for {ticker}: {e}")
        raise  # Si ownership échoue, on ne peut pas continuer
    
    # Étape 2 : Pour chaque institution, récupérer l'activité
    for institution in institutions:
        try:
            activity = get_institution_activity(institution.name, ticker)
            activities.extend(activity)
        except Exception as e:
            logger.warning(f"Failed to get activity for {institution.name}: {e}")
            errors.append({
                "institution": institution.name,
                "error": str(e)
            })
            continue  # Continuer avec les autres institutions
    
    return {
        "data": activities,
        "errors": errors,  # Informer le frontend des erreurs partielles
        "count": len(activities)
    }
```

### Solution 2 : Timeout et Retry

```python
import time
from functools import wraps

def retry_with_backoff(max_retries=3, backoff=1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except RateLimitError:
                    wait_time = backoff * (2 ** attempt)
                    logger.warning(f"Rate limited, waiting {wait_time}s")
                    time.sleep(wait_time)
                except Exception as e:
                    if attempt == max_retries - 1:
                        raise
                    logger.warning(f"Attempt {attempt + 1} failed: {e}")
            return None
        return wrapper
    return decorator

@retry_with_backoff()
def get_institution_activity(institution_name, ticker):
    # Appel API avec retry
    pass
```

### Solution 3 : Limiter le Nombre d'Institutions

Si le problème vient du nombre d'institutions :

```python
def get_activity(ticker, max_institutions=5):  # Réduire à 5 au lieu de 10
    institutions = get_ownership(ticker, limit=max_institutions)
    # ...
```

### Solution 4 : Cache Agressif

Mettre en cache les résultats pour éviter les appels répétés :

```python
@cache(ttl=3600)  # Cache 1 heure
def get_activity(ticker):
    # ...
```

## 📊 Informations à Collecter pour le Backend

Pour aider le backend à déboguer, collectez :

1. **RequestId** : `U9VNUigdCGYEJ8Q=`
2. **Timestamp** : `2025-12-02T11:36:01.661Z`
3. **Ticker testé** : `TSLA`
4. **Autres endpoints testés** :
   - Quote : ✅ ou ❌
   - Ownership : ✅ ou ❌
   - Activity : ❌
5. **Logs CloudWatch complets** (pas seulement le status)
6. **Nombre d'institutions** pour ce ticker (si ownership fonctionne)

## ✅ Checklist de Débogage

- [ ] Tester `/quote` pour vérifier que l'API Gateway fonctionne
- [ ] Tester `/ownership` pour vérifier que l'étape 1 fonctionne
- [ ] Tester `/activity` pour confirmer l'erreur
- [ ] Chercher les logs détaillés dans CloudWatch avec Logs Insights
- [ ] Vérifier les variables d'environnement Lambda
- [ ] Tester avec un autre ticker (moins d'institutions)
- [ ] Vérifier les rate limits Unusual Whales
- [ ] Demander au backend d'ajouter plus de logging
- [ ] Vérifier si le problème est spécifique à une institution

## 🚀 Actions Immédiates

1. **Testez les autres endpoints** pour isoler le problème
2. **Utilisez CloudWatch Logs Insights** pour trouver les logs détaillés
3. **Partagez les logs complets** avec le backend
4. **Testez avec un ticker différent** pour voir si c'est spécifique à TSLA





