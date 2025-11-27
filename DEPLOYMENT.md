# Guide de Déploiement

Ce guide explique comment déployer l'application sur AWS Amplify en utilisant GitHub Actions.

## 🚀 Déploiement Rapide

### Option 1 : Script automatique (Recommandé)

```bash
npm run deploy
# ou avec un message personnalisé
npm run deploy "feat: ajout nouvelle fonctionnalité"
```

### Option 2 : Commandes manuelles

```bash
# 1. Ajouter les changements
git add .

# 2. Commit (le [skip ci] évite de redéclencher le workflow)
git commit -m "votre message [skip ci]"

# 3. Push vers GitHub
git push origin main
```

## 📋 Configuration Initiale

### 1. Configurer les Secrets GitHub

Allez sur votre repository GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Ajoutez les secrets suivants :

| Secret | Description | Où le trouver |
|--------|-------------|---------------|
| `AWS_ACCESS_KEY_ID` | Clé d'accès AWS | Console AWS → IAM → Users → Security credentials |
| `AWS_SECRET_ACCESS_KEY` | Clé secrète AWS | Console AWS → IAM → Users → Security credentials |
| `AMPLIFY_APP_ID` | ID de l'app Amplify (optionnel) | Console Amplify → App settings → General |

### 2. Configurer AWS Amplify

#### Méthode 1 : Connexion GitHub (Recommandé)

1. Allez sur [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Cliquez sur **New app** → **Host web app**
3. Sélectionnez **GitHub** et connectez votre repository
4. Sélectionnez la branche `main` ou `master`
5. Amplify détectera automatiquement `amplify.yml`
6. Configurez les variables d'environnement si nécessaire
7. Cliquez sur **Save and deploy**

#### Méthode 2 : Déploiement via API

Si vous préférez déclencher les builds via l'API :
1. Récupérez votre `AMPLIFY_APP_ID` depuis la console Amplify
2. Ajoutez-le comme secret GitHub (`AMPLIFY_APP_ID`)
3. Le workflow déclenchera automatiquement un build via l'API

### 3. Variables d'Environnement

Configurez les variables d'environnement dans **AWS Amplify Console** :

1. Allez sur votre app Amplify
2. **App settings** → **Environment variables**
3. Ajoutez vos variables (ex: `NEXT_PUBLIC_API_URL`, etc.)

## 🔄 Workflow GitHub Actions

### Workflows disponibles

1. **`deploy-amplify.yml`** : Déploiement principal
   - Build et test sur chaque push
   - Déploiement automatique sur Amplify
   - Auto-commit optionnel

2. **`ci.yml`** : CI pour les Pull Requests
   - Lint et build sur chaque PR

### Déclencheurs

- **Push sur `main`/`master`** : Build + Deploy
- **Pull Request** : Build + Test seulement
- **Workflow dispatch** : Déclenchement manuel

## 📝 Utilisation

### Déploiement standard

```bash
# 1. Faire vos modifications
# 2. Commit et push
git add .
git commit -m "feat: nouvelle fonctionnalité [skip ci]"
git push origin main
```

Le workflow se déclenchera automatiquement et :
1. ✅ Build l'application
2. ✅ Lance les tests
3. ✅ Déploie sur Amplify

### Déploiement avec script

```bash
# Utilise le script de déploiement
npm run deploy "votre message de commit"
```

Le script :
- ✅ Vérifie la branche
- ✅ Récupère les dernières modifications
- ✅ Commit les changements
- ✅ Push vers GitHub
- ✅ Déclenche le workflow

## 🔍 Vérification du Déploiement

### GitHub Actions

1. Allez sur votre repository GitHub
2. Cliquez sur l'onglet **Actions**
3. Vérifiez le statut du workflow

### AWS Amplify

1. Allez sur [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Sélectionnez votre app
3. Vérifiez l'onglet **Deployments**

## 🐛 Dépannage

### Le workflow ne se déclenche pas

- ✅ Vérifiez que vous êtes sur `main` ou `master`
- ✅ Vérifiez que le workflow existe dans `.github/workflows/`
- ✅ Vérifiez les logs dans l'onglet **Actions**

### Erreur de build

- ✅ Vérifiez que toutes les dépendances sont installées
- ✅ Vérifiez les variables d'environnement
- ✅ Consultez les logs du job `build`

### Erreur de déploiement Amplify

- ✅ Vérifiez que `AMPLIFY_APP_ID` est correct (si utilisé)
- ✅ Vérifiez que les credentials AWS sont valides
- ✅ Vérifiez que l'application Amplify existe
- ✅ Vérifiez la configuration dans `amplify.yml`

### Erreur de permissions

- ✅ Vérifiez que les secrets GitHub sont bien configurés
- ✅ Vérifiez que l'utilisateur AWS a les permissions nécessaires :
  - `amplify:StartJob`
  - `amplify:GetApp`
  - `amplify:GetBranch`

## 📚 Ressources

- [Documentation AWS Amplify](https://docs.aws.amazon.com/amplify/)
- [Documentation GitHub Actions](https://docs.github.com/en/actions)
- [Documentation Next.js Deployment](https://nextjs.org/docs/deployment)

## 🔐 Sécurité

⚠️ **Important** :
- Ne commitez jamais les secrets dans le code
- Utilisez toujours les GitHub Secrets pour les credentials
- Utilisez `[skip ci]` dans les messages de commit pour éviter les boucles infinies
- Vérifiez régulièrement les permissions AWS

## 📞 Support

En cas de problème :
1. Consultez les logs dans GitHub Actions
2. Consultez les logs dans AWS Amplify Console
3. Vérifiez la documentation ci-dessus
4. Créez une issue sur GitHub si nécessaire

