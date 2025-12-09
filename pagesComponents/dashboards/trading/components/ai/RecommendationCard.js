/**
 * Carte pour afficher une recommandation d'action
 */

import Card from "@mui/material/Card";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";

function RecommendationCard({ action, strike, expiry, reasoning, riskLevel }) {
  const actionConfig = {
    buy_calls: {
      color: "success",
      icon: "trending_up",
      label: "Acheter Calls",
      emoji: "📈",
    },
    buy_puts: {
      color: "error",
      icon: "trending_down",
      label: "Acheter Puts",
      emoji: "📉",
    },
    sell_calls: {
      color: "warning",
      icon: "call_made",
      label: "Vendre Calls",
      emoji: "⬆️",
    },
    sell_puts: {
      color: "warning",
      icon: "call_received",
      label: "Vendre Puts",
      emoji: "⬇️",
    },
    spread: {
      color: "info",
      icon: "swap_horiz",
      label: "Spread",
      emoji: "↔️",
    },
    wait: {
      color: "default",
      icon: "schedule",
      label: "Attendre",
      emoji: "⏳",
    },
    avoid: {
      color: "error",
      icon: "block",
      label: "Éviter",
      emoji: "⚠️",
    },
  };

  const riskConfig = {
    low: { color: "success", label: "Risque Faible" },
    medium: { color: "warning", label: "Risque Moyen" },
    high: { color: "error", label: "Risque Élevé" },
  };

  const actionInfo = actionConfig[action] || actionConfig.wait;
  const riskInfo = riskConfig[riskLevel] || riskConfig.medium;

  return (
    <Card
      sx={{
        height: "100%",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
      }}
    >
      <MDBox p={2}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDBox display="flex" alignItems="center" gap={1}>
            <MDTypography variant="h4">{actionInfo.emoji}</MDTypography>
            <Chip
              icon={<Icon>{actionInfo.icon}</Icon>}
              label={actionInfo.label}
              color={actionInfo.color}
              size="small"
              sx={{ fontWeight: "bold" }}
            />
          </MDBox>
          <Chip
            label={riskInfo.label}
            color={riskInfo.color}
            size="small"
            variant="outlined"
          />
        </MDBox>

        {(strike || expiry) && (
          <MDBox mb={1.5}>
            {strike && (
              <MDBox mb={0.5}>
                <MDTypography variant="caption" color="text.secondary">
                  Strike
                </MDTypography>
                <MDTypography variant="body2" fontWeight="medium">
                  ${strike}
                </MDTypography>
              </MDBox>
            )}
            {expiry && (
              <MDBox>
                <MDTypography variant="caption" color="text.secondary">
                  Expiry
                </MDTypography>
                <MDTypography variant="body2" fontWeight="medium">
                  {new Date(expiry).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </MDTypography>
              </MDBox>
            )}
          </MDBox>
        )}

        {reasoning && (
          <MDBox>
            <MDTypography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem", lineHeight: 1.6 }}>
              {reasoning}
            </MDTypography>
          </MDBox>
        )}
      </MDBox>
    </Card>
  );
}

export default RecommendationCard;

