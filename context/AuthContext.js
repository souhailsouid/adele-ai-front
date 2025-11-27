/**
 * Contexte d'authentification
 * Fournit l'état d'authentification et les méthodes à toute l'application
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import authService from '/lib/auth/authService';
import { getCognitoErrorMessage } from '/lib/auth/errors';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  /**
   * Charger l'utilisateur depuis les tokens stockés
   */
  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!authService.isAuthenticated()) {
        setUser(null);
        setLoading(false);
        return;
      }

      const tokens = authService.getTokens();
      if (!tokens) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Récupérer les informations de l'utilisateur
      const userData = await authService.getCurrentUser(tokens.accessToken);
      
      setUser({
        ...userData,
        email: userData.attributes.email,
        firstName: userData.attributes.given_name || userData.attributes.firstName,
        lastName: userData.attributes.family_name || userData.attributes.lastName,
      });
    } catch (err) {
      console.error('Erreur lors du chargement de l\'utilisateur:', err);
      // Si l'erreur est due à un token invalide, on déconnecte
      authService.clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Inscription
   */
  const signUp = useCallback(async (email, password, attributes = {}) => {
    try {
      setError(null);
      const result = await authService.signUp(email, password, attributes);
      return result;
    } catch (err) {
      const errorMessage = getCognitoErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Confirmation de l'inscription
   */
  const confirmSignUp = useCallback(async (email, confirmationCode) => {
    try {
      setError(null);
      const result = await authService.confirmSignUp(email, confirmationCode);
      return result;
    } catch (err) {
      const errorMessage = getCognitoErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Renvoyer le code de confirmation
   */
  const resendConfirmationCode = useCallback(async (email) => {
    try {
      setError(null);
      const result = await authService.resendConfirmationCode(email);
      return result;
    } catch (err) {
      const errorMessage = getCognitoErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Connexion
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @param {boolean} autoRedirect - Si true, redirige automatiquement (défaut: false)
   * @returns {Promise<Object>}
   */
  const signIn = useCallback(async (email, password, autoRedirect = false) => {
    try {
      setError(null);
      const result = await authService.signIn(email, password);
      
      if (result.success) {
        // Recharger l'utilisateur
        await loadUser();
        
        // Rediriger seulement si demandé
        if (autoRedirect) {
          router.push('/dashboards/analytics');
        }
      }
      
      return result;
    } catch (err) {
      const errorMessage = getCognitoErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadUser, router]);

  /**
   * Déconnexion
   */
  const signOut = useCallback(async () => {
    try {
      setError(null);
      const tokens = authService.getTokens();
      
      if (tokens?.accessToken) {
        await authService.signOut(tokens.accessToken);
      } else {
        authService.clearTokens();
      }
      
      setUser(null);
      router.push('/authentication/sign-in');
    } catch (err) {
      // Même en cas d'erreur, on déconnecte localement
      authService.clearTokens();
      setUser(null);
      router.push('/authentication/sign-in');
    }
  }, [router]);

  /**
   * Obtenir le token d'accès pour les requêtes API
   */
  const getAccessToken = useCallback(() => {
    return authService.getAccessToken();
  }, []);

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  const isAuthenticated = useCallback(() => {
    return authService.isAuthenticated() && user !== null;
  }, [user]);

  /**
   * Demander un code de réinitialisation de mot de passe
   */
  const forgotPassword = useCallback(async (email) => {
    try {
      setError(null);
      const result = await authService.forgotPassword(email);
      return result;
    } catch (err) {
      const errorMessage = getCognitoErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Confirmer la réinitialisation du mot de passe
   */
  const confirmForgotPassword = useCallback(async (email, confirmationCode, newPassword) => {
    try {
      setError(null);
      const result = await authService.confirmForgotPassword(email, confirmationCode, newPassword);
      return result;
    } catch (err) {
      const errorMessage = getCognitoErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Charger l'utilisateur au montage
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const value = {
    user,
    loading,
    error,
    signUp,
    confirmSignUp,
    resendConfirmationCode,
    signIn,
    signOut,
    getAccessToken,
    isAuthenticated,
    loadUser,
    forgotPassword,
    confirmForgotPassword,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook pour utiliser le contexte d'authentification
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

