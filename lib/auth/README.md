# Architecture d'Authentification

Cette architecture suit les meilleures pratiques pour une authentification propre et maintenable avec AWS Cognito.

## Structure

```
lib/auth/
├── config.js              # Configuration Cognito (variables d'environnement)
├── cognitoClient.js       # Client AWS SDK pour Cognito
├── authService.js         # Service principal d'authentification
└── errors.js              # Gestion des erreurs Cognito

context/
└── AuthContext.js         # Contexte React pour l'état d'authentification

hooks/
└── useAuth.js             # Hook personnalisé pour utiliser l'auth
```

## Design Patterns Utilisés

### 1. **Service Layer Pattern**
- `authService.js` encapsule toute la logique d'authentification
- Séparation claire entre la logique métier et les composants React
- Facilite les tests et la maintenance

### 2. **Context API Pattern**
- `AuthContext` fournit l'état d'authentification global
- Évite le prop drilling
- Centralise la gestion de l'état utilisateur

### 3. **Custom Hooks Pattern**
- `useAuth()` simplifie l'utilisation de l'authentification
- API cohérente dans toute l'application
- Réutilisable et testable

### 4. **Error Handling Pattern**
- Gestion centralisée des erreurs Cognito
- Messages d'erreur user-friendly
- Traduction des codes d'erreur techniques

## Utilisation

### Dans un composant

```javascript
import { useAuth } from '/hooks/useAuth';

function MyComponent() {
  const { user, signIn, signOut, isAuthenticated, loading } = useAuth();
  
  if (loading) return <div>Chargement...</div>;
  
  if (!isAuthenticated()) {
    return <div>Non connecté</div>;
  }
  
  return (
    <div>
      <p>Bonjour {user.firstName}!</p>
      <button onClick={signOut}>Déconnexion</button>
    </div>
  );
}
```

### Inscription

```javascript
const { signUp } = useAuth();

try {
  const result = await signUp(
    'user@example.com',
    'password123',
    {
      firstName: 'John',
      lastName: 'Doe',
    }
  );
  
  if (result.success) {
    // Rediriger vers la page de vérification
    router.push('/authentication/verify-email?email=user@example.com');
  }
} catch (error) {
  // L'erreur est déjà gérée par le contexte
  console.error(error.message);
}
```

### Connexion

```javascript
const { signIn } = useAuth();

try {
  await signIn('user@example.com', 'password123');
  // Redirection automatique vers le dashboard
} catch (error) {
  console.error(error.message);
}
```

## Configuration

1. Copier `.env.example` vers `.env.local`
2. Remplir les valeurs depuis le backend (voir `COGNITO_CREDENTIALS.md`)
3. Les variables doivent commencer par `NEXT_PUBLIC_` pour être accessibles côté client

## Sécurité

- Les tokens sont stockés dans `localStorage` (peut être changé pour `httpOnly` cookies)
- Validation des tokens côté client
- Gestion automatique de l'expiration
- Nettoyage des tokens lors de la déconnexion

## Améliorations Futures

- [ ] Refresh token automatique
- [ ] Support des cookies httpOnly pour plus de sécurité
- [ ] Cache des informations utilisateur
- [ ] Support de la réinitialisation de mot de passe
- [ ] Support MFA (Multi-Factor Authentication)


