/**
 * Gestion des erreurs Cognito
 * Traduit les codes d'erreur Cognito en messages utilisateur-friendly
 */

const COGNITO_ERROR_MESSAGES = {
  // Erreurs d'inscription
  'UsernameExistsException': 'Cet email est déjà utilisé. Connectez-vous ou réinitialisez votre mot de passe.',
  'InvalidPasswordException': 'Le mot de passe ne respecte pas les exigences de sécurité.',
  'InvalidParameterException': 'Les informations fournies sont invalides. Vérifiez votre email et mot de passe.',
  'CodeMismatchException': 'Le code de vérification est incorrect.',
  'ExpiredCodeException': 'Le code de vérification a expiré. Veuillez en demander un nouveau.',
  'NotAuthorizedException': 'Email ou mot de passe incorrect. Si vous venez de réinitialiser votre mot de passe, assurez-vous d\'utiliser le nouveau mot de passe.',
  'UserNotFoundException': 'Aucun compte trouvé avec cet email.',
  'UserNotConfirmedException': 'Votre compte n\'est pas encore vérifié. Vérifiez votre email.',
  'LimitExceededException': 'Trop de tentatives. Veuillez réessayer plus tard.',
  'TooManyRequestsException': 'Trop de requêtes. Veuillez réessayer dans quelques instants.',
  'InvalidUserPoolConfigurationException': 'Configuration du pool utilisateur invalide.',
  'PasswordResetRequiredException': 'Vous devez réinitialiser votre mot de passe avant de vous connecter.',
  
  // Erreurs génériques
  'NetworkError': 'Erreur de connexion. Vérifiez votre connexion internet.',
  'UnknownError': 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
};

/**
 * Extrait le message d'erreur depuis une exception Cognito
 */
export const getCognitoErrorMessage = (error) => {
  if (!error) return COGNITO_ERROR_MESSAGES.UnknownError;
  
  // Si c'est déjà un message string
  if (typeof error === 'string') {
    return COGNITO_ERROR_MESSAGES[error] || error;
  }
  
  // Si c'est un objet Error
  if (error instanceof Error) {
    const code = error.code || error.name || error.__type;
    
    if (code && COGNITO_ERROR_MESSAGES[code]) {
      return COGNITO_ERROR_MESSAGES[code];
    }
    
    // Message personnalisé Cognito
    if (error.message) {
      return error.message;
    }
  }
  
  // Si c'est un objet avec code/name
  const code = error.code || error.name || error.__type;
  if (code && COGNITO_ERROR_MESSAGES[code]) {
    return COGNITO_ERROR_MESSAGES[code];
  }
  
  // Message par défaut
  return error.message || COGNITO_ERROR_MESSAGES.UnknownError;
};

/**
 * Classe d'erreur personnalisée pour Cognito
 */
export class CognitoError extends Error {
  constructor(code, message, originalError = null) {
    super(message || getCognitoErrorMessage(code));
    this.name = 'CognitoError';
    this.code = code;
    this.originalError = originalError;
  }
}

export default getCognitoErrorMessage;

