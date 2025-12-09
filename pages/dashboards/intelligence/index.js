/**
 * Intelligence Dashboard - Redirection vers la vue d'ensemble
 */

import { useEffect } from "react";
import { useRouter } from "next/router";

function IntelligenceDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la page overview
    router.replace("/dashboards/intelligence/overview");
  }, [router]);

  return null;
}

export default IntelligenceDashboard;



