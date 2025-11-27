# Dépannage Authentification

## Problème : "Not authenticated" dans l'onboarding

### Causes possibles

1. **L'utilisateur n'est pas connecté**
   - Solution : Se connecter via `/authentication/sign-in` d'abord

2. **Les tokens ne sont pas stockés**
   - Vérifier dans DevTools → Application → Local Storage
   - Chercher : `cognito_access_token`, `cognito_id_token`
   - Si absents : Le sign-in n'a pas fonctionné

3. **Cognito ne permet pas USER_PASSWORD_AUTH**
   - Vérifier que `explicit_auth_flows` contient `ALLOW_USER_PASSWORD_AUTH`
   - Mettre à jour Terraform et redéployer

### Vérifications étape par étape

#### 1. Vérifier la connexion
```javascript
// Dans la console du navigateur
localStorage.getItem('cognito_access_token')
// Doit retourner un token (longue string)
```

#### 2. Vérifier la configuration Cognito
- Aller dans AWS Console → Cognito → User Pools
- Vérifier que le client a `ALLOW_USER_PASSWORD_AUTH` activé

#### 3. Tester la connexion manuellement
```javascript
// Dans la console
import authService from '/lib/auth/authService';
await authService.signIn('email@example.com', 'password');
// Vérifier que les tokens sont stockés
```

### Solution rapide

1. **Mettre à jour Cognito** (si nécessaire) :
```bash
cd /Users/souhailsouid/startup/personamy/backend/infra/terraform
terraform apply
```

2. **Créer un utilisateur de test** :
```bash
aws cognito-idp admin-create-user \
  --user-pool-id eu-west-3_D53kgIHIQ \
  --username test@example.com \
  --user-attributes Name=email,Value=test@example.com \
  --temporary-password TempPass123! \
  --message-action SUPPRESS

aws cognito-idp admin-set-user-password \
  --user-pool-id eu-west-3_D53kgIHIQ \
  --username test@example.com \
  --password YourPassword123! \
  --permanent
```

3. **Se connecter** avec cet utilisateur

4. **Vérifier les tokens** dans localStorage

5. **Tester l'onboarding**



