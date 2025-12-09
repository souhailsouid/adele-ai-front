/**
 * HOC (Higher Order Component) pour protéger les pages nécessitant une authentification
 * 
 * Usage:
 * export default withAuth(MyPage);
 * 
 * Ou avec options:
 * export default withAuth(MyPage, { requireAuth: true });
 */

import { useRouter } from "next/router";
import { useAuth } from "/hooks/useAuth";
import { useEffect, useState } from "react";
import MDBox from "/components/MDBox";
import CircularProgress from "@mui/material/CircularProgress";

/**
 * HOC withAuth
 * @param {React.Component} Component - Composant à protéger
 * @param {Object} options - Options
 * @param {boolean} options.requireAuth - Si true, nécessite l'authentification (défaut: true)
 * @returns {React.Component} Composant protégé
 */
export default function withAuth(Component, options = {}) {
  const { requireAuth = true } = options;

  return function AuthenticatedComponent(props) {
    const router = useRouter();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
      // Ne rien faire si on est en train de charger l'auth
      if (authLoading) return;

      // Si l'authentification est requise et que l'utilisateur n'est pas authentifié
      if (requireAuth && !isAuthenticated()) {
        setIsRedirecting(true);
        
        // Sauvegarder l'URL actuelle pour rediriger après login
        const currentPath = router.asPath;
        const redirectUrl = currentPath !== "/authentication/sign-in" 
          ? `/authentication/sign-in?redirect=${encodeURIComponent(currentPath)}`
          : "/authentication/sign-in";
        
        console.log("[withAuth] Not authenticated, redirecting to:", redirectUrl);
        router.push(redirectUrl);
      }
    }, [authLoading, isAuthenticated, requireAuth, router]);

    // Afficher un loader pendant le chargement de l'auth ou la redirection
    if (authLoading || (requireAuth && !isAuthenticated() && isRedirecting)) {
      return (
        <MDBox
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
        </MDBox>
      );
    }

    // Si l'auth est requise et que l'utilisateur n'est pas authentifié, ne rien afficher
    // (la redirection est en cours)
    if (requireAuth && !isAuthenticated()) {
      return (
        <MDBox
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
        </MDBox>
      );
    }

    // Afficher le composant si authentifié ou si l'auth n'est pas requise
    return <Component {...props} />;
  };
}





