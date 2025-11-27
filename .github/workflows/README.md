# GitHub Actions Workflows

Ce dossier contient les workflows GitHub Actions pour automatiser le CI/CD du projet.

## Workflows disponibles

### 1. `deploy-amplify.yml`
Workflow principal pour déployer sur AWS Amplify.

**Déclencheurs :**
- Push sur `main` ou `master`
- Pull Request sur `main` ou `master`
- Déclenchement manuel (`workflow_dispatch`)

**Jobs :**
- **build** : Build et test de l'application
- **deploy** : Déploiement sur AWS Amplify (seulement sur push)
- **auto-commit** : Commit automatique des changements (optionnel)

### 2. `ci.yml`
Workflow de CI pour les Pull Requests.

**Déclencheurs :**
- Pull Request sur `main` ou `master`
- Push sur `main` ou `master`

**Jobs :**
- **lint-and-test** : Lint et build de l'application

## Configuration requise

### Secrets GitHub

Pour que le déploiement fonctionne, vous devez configurer les secrets suivants dans GitHub :

1. **AWS_ACCESS_KEY_ID** : Clé d'accès AWS
2. **AWS_SECRET_ACCESS_KEY** : Clé secrète AWS
3. **AMPLIFY_APP_ID** (optionnel) : ID de l'application Amplify

### Comment configurer les secrets

1. Allez sur votre repository GitHub
2. Cliquez sur **Settings** → **Secrets and variables** → **Actions**
3. Cliquez sur **New repository secret**
4. Ajoutez chaque secret

### Configuration AWS Amplify

#### Option 1 : Déploiement automatique (Recommandé)

AWS Amplify peut détecter automatiquement les push sur GitHub et déclencher un build. Dans ce cas :
- Connectez votre repository GitHub à Amplify
- Amplify détectera automatiquement les push
- Pas besoin de configurer `AMPLIFY_APP_ID`

#### Option 2 : Déploiement via API

Si vous voulez déclencher le build via l'API :
1. Récupérez votre `AMPLIFY_APP_ID` depuis la console Amplify
2. Ajoutez-le comme secret GitHub
3. Le workflow déclenchera automatiquement un build via l'API

## Variables d'environnement

Si votre application nécessite des variables d'environnement, configurez-les dans :
1. **GitHub Secrets** (pour le workflow)
2. **AWS Amplify Console** (pour l'application déployée)

## Auto-commit

Le job `auto-commit` est désactivé par défaut pour éviter les boucles infinies. Pour l'activer :
1. Modifiez la condition `if` dans le job `auto-commit`
2. Utilisez `[skip ci]` dans le message de commit pour éviter de redéclencher le workflow

## Dépannage

### Le déploiement ne se déclenche pas
- Vérifiez que les secrets sont bien configurés
- Vérifiez que la branche est `main` ou `master`
- Vérifiez les logs du workflow dans l'onglet "Actions"

### Erreur de build
- Vérifiez que toutes les dépendances sont installées
- Vérifiez que les variables d'environnement sont configurées
- Consultez les logs du job `build`

### Erreur de déploiement Amplify
- Vérifiez que `AMPLIFY_APP_ID` est correct
- Vérifiez que les credentials AWS sont valides
- Vérifiez que l'application Amplify existe et est configurée

