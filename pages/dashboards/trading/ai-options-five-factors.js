/**
 * Page dédiée pour l'analyse AI "Five Factors" des options
 * Affichage qualitatif et non-directionnel du marché options
 */

import { useEffect } from "react";
import { useRouter } from "next/router";

function LegacyRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboards/trading/radar-options");
  }, [router]);
  return null;
}

export default LegacyRedirect;

