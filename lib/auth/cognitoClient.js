/**
 * Client Cognito Identity Provider
 * Configure et exporte le client AWS Cognito
 */

import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { config } from './config';

// Créer une instance singleton du client Cognito
let cognitoClient = null;

/**
 * Obtenir ou créer le client Cognito
 * @returns {CognitoIdentityProviderClient}
 */
export function getCognitoClient() {
  if (!cognitoClient) {
    cognitoClient = new CognitoIdentityProviderClient({
      region: config.region || 'eu-west-3',
    });
  }
  
  return cognitoClient;
}

// Export des commandes AWS SDK pour faciliter les imports
export {
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  ResendConfirmationCodeCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  GetUserCommand,
  GlobalSignOutCommand,
} from '@aws-sdk/client-cognito-identity-provider';

