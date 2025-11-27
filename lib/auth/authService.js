/**
 * Service d'authentification Cognito
 * Encapsule toutes les opérations d'authentification
 */

import {
  getCognitoClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  ResendConfirmationCodeCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  GetUserCommand,
  GlobalSignOutCommand,
} from './cognitoClient';
import { config } from './config';
import { getCognitoErrorMessage, CognitoError } from './errors';

class AuthService {
  constructor() {
    this.client = getCognitoClient();
    this.userPoolId = config.userPoolId;
    this.clientId = config.clientId;
  }

  /**
   * Inscription d'un nouvel utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @param {Object} attributes - Attributs additionnels (firstName, lastName, etc.)
   * @returns {Promise<Object>} - Résultat de l'inscription
   */
  async signUp(email, password, attributes = {}) {
    try {
      const userAttributes = Object.entries(attributes)
        .filter(([key, value]) => value)
        .map(([key, value]) => ({
          Name: key === 'firstName' ? 'given_name' : key === 'lastName' ? 'family_name' : key,
          Value: String(value),
        }));

      // Email est toujours requis
      if (!userAttributes.find(attr => attr.Name === 'email')) {
        userAttributes.push({ Name: 'email', Value: email });
      }

      const command = new SignUpCommand({
        ClientId: this.clientId,
        Username: email,
        Password: password,
        UserAttributes: userAttributes,
      });

      const response = await this.client.send(command);
      
      return {
        success: true,
        userSub: response.UserSub,
        codeDeliveryDetails: response.CodeDeliveryDetails,
        requiresConfirmation: true,
      };
    } catch (error) {
      throw new CognitoError(
        error.name || error.__type,
        getCognitoErrorMessage(error),
        error
      );
    }
  }

  /**
   * Confirmation de l'inscription avec code
   * @param {string} email - Email de l'utilisateur
   * @param {string} confirmationCode - Code de confirmation
   * @returns {Promise<Object>}
   */
  async confirmSignUp(email, confirmationCode) {
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: this.clientId,
        Username: email,
        ConfirmationCode: confirmationCode,
      });

      await this.client.send(command);
      
      return {
        success: true,
        message: 'Compte vérifié avec succès',
      };
    } catch (error) {
      throw new CognitoError(
        error.name || error.__type,
        getCognitoErrorMessage(error),
        error
      );
    }
  }

  /**
   * Renvoyer le code de confirmation
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise<Object>}
   */
  async resendConfirmationCode(email) {
    try {
      const command = new ResendConfirmationCodeCommand({
        ClientId: this.clientId,
        Username: email,
      });

      const response = await this.client.send(command);
      
      return {
        success: true,
        codeDeliveryDetails: response.CodeDeliveryDetails,
      };
    } catch (error) {
      throw new CognitoError(
        error.name || error.__type,
        getCognitoErrorMessage(error),
        error
      );
    }
  }

  /**
   * Connexion
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @returns {Promise<Object>} - Tokens d'authentification
   */
  async signIn(email, password) {
    try {
      const command = new InitiateAuthCommand({
        ClientId: this.clientId,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });

      const response = await this.client.send(command);

      // Si un challenge est requis (ex: nouveau mot de passe)
      if (response.ChallengeName) {
        console.log('Auth challenge required:', response.ChallengeName);
        return {
          requiresChallenge: true,
          challengeName: response.ChallengeName,
          session: response.Session,
        };
      }

      // Authentification réussie
      const tokens = {
        idToken: response.AuthenticationResult.IdToken,
        accessToken: response.AuthenticationResult.AccessToken,
        refreshToken: response.AuthenticationResult.RefreshToken,
        expiresIn: response.AuthenticationResult.ExpiresIn,
      };

      // Stocker les tokens
      this.storeTokens(tokens);

      return {
        success: true,
        tokens,
      };
    } catch (error) {
      // Log détaillé de l'erreur pour le débogage
      console.error('SignIn error details:', {
        name: error.name,
        code: error.code,
        __type: error.__type,
        message: error.message,
        originalError: error,
      });
      
      throw new CognitoError(
        error.name || error.__type,
        getCognitoErrorMessage(error),
        error
      );
    }
  }

  /**
   * Obtenir les informations de l'utilisateur actuel
   * @param {string} accessToken - Token d'accès
   * @returns {Promise<Object>}
   */
  async getCurrentUser(accessToken) {
    try {
      const command = new GetUserCommand({
        AccessToken: accessToken,
      });

      const response = await this.client.send(command);
      
      // Transformer les attributs en objet
      const attributes = {};
      if (response.UserAttributes) {
        response.UserAttributes.forEach(attr => {
          attributes[attr.Name] = attr.Value;
        });
      }

      return {
        username: response.Username,
        attributes,
        userStatus: response.UserStatus,
      };
    } catch (error) {
      throw new CognitoError(
        error.name || error.__type,
        getCognitoErrorMessage(error),
        error
      );
    }
  }

  /**
   * Déconnexion
   * @param {string} accessToken - Token d'accès
   * @returns {Promise<Object>}
   */
  async signOut(accessToken) {
    try {
      const command = new GlobalSignOutCommand({
        AccessToken: accessToken,
      });

      await this.client.send(command);
      
      // Supprimer les tokens du stockage
      this.clearTokens();
      
      return {
        success: true,
      };
    } catch (error) {
      // Même en cas d'erreur, on supprime les tokens localement
      this.clearTokens();
      throw new CognitoError(
        error.name || error.__type,
        getCognitoErrorMessage(error),
        error
      );
    }
  }

  /**
   * Stocker les tokens dans le localStorage
   * @private
   */
  storeTokens(tokens) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cognito_id_token', tokens.idToken);
      localStorage.setItem('cognito_access_token', tokens.accessToken);
      localStorage.setItem('cognito_refresh_token', tokens.refreshToken);
      localStorage.setItem('cognito_token_expires', String(Date.now() + tokens.expiresIn * 1000));
    }
  }

  /**
   * Récupérer les tokens depuis le localStorage
   * @returns {Object|null}
   */
  getTokens() {
    if (typeof window === 'undefined') return null;
    
    const idToken = localStorage.getItem('cognito_id_token');
    const accessToken = localStorage.getItem('cognito_access_token');
    const refreshToken = localStorage.getItem('cognito_refresh_token');
    
    if (!idToken || !accessToken) return null;
    
    return {
      idToken,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   * @returns {boolean}
   */
  isAuthenticated() {
    const tokens = this.getTokens();
    if (!tokens) return false;
    
    // Vérifier l'expiration
    const expiresAt = localStorage.getItem('cognito_token_expires');
    if (expiresAt && Date.now() > parseInt(expiresAt)) {
      this.clearTokens();
      return false;
    }
    
    return true;
  }

  /**
   * Supprimer les tokens du localStorage
   * @private
   */
  clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cognito_id_token');
      localStorage.removeItem('cognito_access_token');
      localStorage.removeItem('cognito_refresh_token');
      localStorage.removeItem('cognito_token_expires');
    }
  }

  /**
   * Obtenir le token d'accès pour les requêtes API
   * @returns {string|null}
   */
  getAccessToken() {
    const tokens = this.getTokens();
    return tokens?.accessToken || null;
  }

  /**
   * Obtenir l'ID token pour les requêtes API Gateway JWT
   * API Gateway JWT authorizer nécessite l'ID token (contient l'audience/client ID)
   * @returns {string|null}
   */
  getIdToken() {
    const tokens = this.getTokens();
    return tokens?.idToken || null;
  }

  /**
   * Demander un code de réinitialisation de mot de passe
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise<Object>}
   */
  async forgotPassword(email) {
    try {
      const command = new ForgotPasswordCommand({
        ClientId: this.clientId,
        Username: email,
      });

      const response = await this.client.send(command);
      
      return {
        success: true,
        codeDeliveryDetails: response.CodeDeliveryDetails,
      };
    } catch (error) {
      throw new CognitoError(
        error.name || error.__type,
        getCognitoErrorMessage(error),
        error
      );
    }
  }

  /**
   * Confirmer la réinitialisation du mot de passe avec le code
   * @param {string} email - Email de l'utilisateur
   * @param {string} confirmationCode - Code de confirmation reçu par email
   * @param {string} newPassword - Nouveau mot de passe
   * @returns {Promise<Object>}
   */
  async confirmForgotPassword(email, confirmationCode, newPassword) {
    try {
      const command = new ConfirmForgotPasswordCommand({
        ClientId: this.clientId,
        Username: email,
        ConfirmationCode: confirmationCode,
        Password: newPassword,
      });

      const response = await this.client.send(command);
      console.log('Password reset successful for:', email);
      
      return {
        success: true,
        message: 'Password reset successfully',
      };
    } catch (error) {
      console.error('ConfirmForgotPassword error details:', {
        name: error.name,
        code: error.code,
        __type: error.__type,
        message: error.message,
        originalError: error,
      });
      
      throw new CognitoError(
        error.name || error.__type,
        getCognitoErrorMessage(error),
        error
      );
    }
  }
}

// Export singleton
const authService = new AuthService();
export default authService;

