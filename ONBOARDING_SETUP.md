# Setup Onboarding - Checklist

## ✅ Configuration .env.local

**IMPORTANT** : Enlever la virgule après `NEXT_PUBLIC_COGNITO_USER_POOL_ID`

```env
# ❌ INCORRECT (avec virgule)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-west-3_D53kgIHIQ,

# ✅ CORRECT (sans virgule)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-west-3_D53kgIHIQ
```

**Fichier complet** :
```env
# Cognito Configuration
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-west-3_D53kgIHIQ
NEXT_PUBLIC_COGNITO_CLIENT_ID=2h1r5hmvabmhfq8nesdjtsvkml
NEXT_PUBLIC_COGNITO_DOMAIN=personamy-dev-auth
NEXT_PUBLIC_COGNITO_ISSUER=https://cognito-idp.eu-west-3.amazonaws.com/eu-west-3_D53kgIHIQ

# API Configuration
NEXT_PUBLIC_API_URL=https://tljoza65hl.execute-api.eu-west-3.amazonaws.com/prod

# Region
NEXT_PUBLIC_AWS_REGION=eu-west-3
```

---

## ✅ Ce qui est déjà implémenté

### Backend
- ✅ Endpoint `POST /orgs` créé
- ✅ Création organisation dans DynamoDB
- ✅ Déclenchement enrichissement via EventBridge
- ✅ Route API Gateway configurée

### Frontend
- ✅ Page onboarding (`/authentication/onboarding`)
- ✅ Client API (`lib/api/client.js`)
- ✅ Appel `apiClient.createOrganization()`
- ✅ Gestion d'erreurs avec Alert
- ✅ Redirection après succès

---

## 🧪 Test du flux complet

### 1. Démarrer le frontend
```bash
cd /Users/souhailsouid/Downloads/dashboard-alert
npm run dev
```

### 2. S'inscrire
1. Aller sur `http://localhost:3000/authentication/sign-up`
2. Remplir le formulaire
3. Vérifier l'email (ou utiliser AWS CLI pour créer un utilisateur)

### 3. Vérifier l'email
1. Aller sur `/authentication/verify-email`
2. Entrer le code
3. Redirection vers sign-in

### 4. Se connecter
1. Aller sur `/authentication/sign-in`
2. Se connecter
3. Redirection vers dashboard

### 5. Onboarding (PREMIÈRE CONNEXION)
1. **Rediriger manuellement** vers `/authentication/onboarding` (pour l'instant)
2. Remplir :
   - Company Website URL (ex: `https://stripe.com`)
   - Position (ex: "CEO / Founder")
3. Cliquer sur "Complete Profile & Continue"

**Ce qui se passe** :
- ✅ Appel API `POST /orgs` avec token JWT
- ✅ Création organisation dans DynamoDB
- ✅ Déclenchement enrichissement asynchrone (EventBridge)
- ✅ Redirection vers `/campaigns`

---

## 🔍 Vérification que ça fonctionne

### Dans le navigateur (DevTools)
1. **Console** : Vérifier `Organization created: { org_id, company_domain }`
2. **Network** : Vérifier la requête `POST /orgs` avec :
   - Status: 200
   - Headers: `Authorization: Bearer <token>`
   - Response: `{ org_id: "...", company_domain: "..." }`

### Dans AWS Console
1. **DynamoDB** → Table `personamy-dev-organizations`
   - Vérifier qu'une nouvelle organisation est créée
   - Vérifier `enrichment_status: "pending"`

2. **EventBridge** → Bus `personamy-dev-enrichment`
   - Vérifier qu'un événement a été envoyé

3. **Lambda** → Function `personamy-dev-enrichment-worker`
   - Vérifier les logs CloudWatch
   - L'enrichissement devrait prendre 1-2 minutes

4. **DynamoDB** → Table `personamy-dev-enrichment-cache`
   - Après 1-2 minutes, vérifier qu'un cache est créé avec le domaine

5. **DynamoDB** → Table `personamy-dev-organizations`
   - Vérifier que `enrichment_status: "completed"`
   - Vérifier que `enrichment_snapshot` contient les données

---

## 🐛 Dépannage

### Erreur "Not authenticated"
- **Cause** : Pas de token dans localStorage
- **Solution** : Se connecter d'abord avant l'onboarding

### Erreur 401 Unauthorized
- **Cause** : Token invalide ou expiré
- **Solution** : Se reconnecter

### Erreur 400 Bad Request
- **Cause** : Données invalides (URL mal formatée, etc.)
- **Solution** : Vérifier le format de l'URL (doit commencer par https://)

### L'enrichissement ne se déclenche pas
- **Vérifier** : Logs CloudWatch du worker Lambda
- **Vérifier** : EventBridge dans la console AWS
- **Vérifier** : Que `EVENT_BUS_NAME` est correct dans l'API Lambda

### CORS Error
- **Cause** : `http://localhost:3000` pas dans les origines autorisées
- **Solution** : Vérifier `frontend_allowed_origins` dans Terraform

---

## 📝 Améliorations futures

1. **Redirection automatique** : Si l'utilisateur n'a pas d'organisation, rediriger vers onboarding
2. **Loading state** : Afficher un loader pendant la création
3. **Message de succès** : Confirmer que l'organisation est créée
4. **Statut enrichissement** : Afficher le statut de l'enrichissement en temps réel
5. **Webhook** : Notifier le frontend quand l'enrichissement est terminé

---

## ✅ Checklist finale

- [ ] `.env.local` configuré (sans virgule)
- [ ] Frontend démarré (`npm run dev`)
- [ ] Utilisateur créé et connecté
- [ ] Onboarding accessible
- [ ] Formulaire rempli et soumis
- [ ] Organisation créée dans DynamoDB
- [ ] Enrichissement déclenché (vérifier EventBridge)
- [ ] Enrichissement terminé (vérifier après 1-2 min)



