/**
 * Dashboard Trading - Redirection vers la vue d'ensemble
 */

import { useEffect } from "react";
import { useRouter } from "next/router";

function TradingDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la page overview
    router.replace("/dashboards/trading/overview");
  }, [router]);

  return null;
}

export default TradingDashboard;
