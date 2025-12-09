/**
 * Composant AuthGuard - Protège les pages nécessitant une authentification
 * 
 * Redirige automatiquement vers la page de login si l'utilisateur n'est pas authentifié,
 * puis redirige vers la page demandée après connexion.
 */

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "/hooks/useAuth";
import MDBox from "/components/MDBox";
import CircularProgress from "@mui/material/CircularProgress";

/**
 * Composant AuthGuard
 * @param {React.ReactNode} children - Contenu à protéger
 * @param {boolean} requireAuth - Si true, nécessite l'authentification (défaut: true)
 */
export default function AuthGuard({ children, requireAuth = true }) {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    // Ne rien faire si on est en train de charger l'auth
    if (authLoading) return;

    // Si l'authentification est requise et que l'utilisateur n'est pas authentifié
    if (requireAuth && !isAuthenticated()) {
      // Sauvegarder l'URL actuelle pour rediriger après login
      const currentPath = router.asPath;
      const redirectUrl = currentPath !== "/authentication/sign-in" 
        ? `/authentication/sign-in?redirect=${encodeURIComponent(currentPath)}`
        : "/authentication/sign-in";
      
      console.log("[AuthGuard] Not authenticated, redirecting to:", redirectUrl);
      router.push(redirectUrl);
    }
  }, [authLoading, isAuthenticated, requireAuth, router]);

  // Afficher un loader pendant le chargement de l'auth
  if (authLoading) {
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

  // Afficher le contenu si authentifié ou si l'auth n'est pas requise
  return <>{children}</>;
}





