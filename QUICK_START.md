# Quick Start - Frontend Setup

## ⚠️ IMPORTANT : Corriger .env.local

**Enlever la virgule** après `NEXT_PUBLIC_COGNITO_USER_POOL_ID` :

```env
# ❌ AVANT (incorrect)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-west-3_D53kgIHIQ,

# ✅ APRÈS (correct)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-west-3_D53kgIHIQ
```

---

## 🚀 Démarrage rapide

### 1. Installer les dépendances (si pas déjà fait)
```bash
cd /Users/souhailsouid/Downloads/dashboard-alert
npm install
```

### 2. Démarrer le serveur
```bash
npm run dev
```

### 3. Tester le flux

#### a) Inscription
- Aller sur `http://localhost:3000/authentication/sign-up`
- Remplir le formulaire
- Vérifier l'email (ou créer un utilisateur via AWS CLI)

#### b) Vérification Email
- Aller sur `/authentication/verify-email?email=votre@email.com`
- Entrer le code reçu

#### c) Connexion
- Aller sur `/authentication/sign-in`
- Se connecter

#### d) Onboarding ⭐
- **Aller sur `/authentication/onboarding`**
- Remplir :
  - Company Website URL (ex: `https://stripe.com`)
  - Position (ex: "CEO / Founder")
- Cliquer sur "Complete Profile & Continue"

**Résultat attendu** :
- ✅ Organisation créée dans DynamoDB
- ✅ Enrichissement déclenché en arrière-plan
- ✅ Redirection vers `/campaigns`

---

## 🔍 Vérification

### Dans le navigateur
1. **Console** : Voir `Organization created: { org_id, company_domain }`
2. **Network** : Voir la requête `POST /orgs` avec status 200

### Dans AWS
1. **DynamoDB** → `personamy-dev-organizations` : Voir la nouvelle organisation
2. **EventBridge** → Voir l'événement d'enrichissement
3. **Lambda Worker** → Voir les logs d'enrichissement (après 1-2 min)

---

## ✅ Tout est prêt !

L'onboarding est **déjà implémenté** et connecté à l'API. Il suffit de :
1. Corriger la virgule dans `.env.local`
2. Démarrer le serveur
3. Tester le flux

L'enrichissement s'exécute **automatiquement en arrière-plan** après la création de l'organisation.



