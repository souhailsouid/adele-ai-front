/**
 * Carte pour afficher un scénario (bullish, bearish, neutral)
 */

import Card from "@mui/material/Card";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Chip from "@mui/material/Chip";
import ConfidenceBar from "./ConfidenceBar";

function ScenarioCard({ type, probability, priceTarget, priceRange, conditions }) {
  const config = {
    bullish: {
      color: "success",
      icon: "trending_up",
      label: "Haussier",
      gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    },
    bearish: {
      color: "error",
      icon: "trending_down",
      label: "Baissier",
      gradient: "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)",
    },
    neutral: {
      color: "info",
      icon: "trending_flat",
      label: "Neutre",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
  };

  const typeConfig = config[type] || config.neutral;
  const percentage = Math.round((probability || 0) * 100);

  return (
    <Card
      sx={{
        height: "100%",
        background: typeConfig.gradient,
        color: "white",
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
            <MDTypography variant="h6" fontWeight="bold" color="white">
              {typeConfig.label}
            </MDTypography>
            <Chip
              label={`${percentage}%`}
              size="small"
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                fontWeight: "bold",
              }}
            />
          </MDBox>
        </MDBox>

        {priceTarget && (
          <MDBox mb={1.5}>
            <MDTypography variant="caption" color="rgba(255, 255, 255, 0.8)">
              Objectif de prix
            </MDTypography>
            <MDTypography variant="h5" fontWeight="bold" color="white">
              ${priceTarget}
            </MDTypography>
          </MDBox>
        )}

        {priceRange && Array.isArray(priceRange) && priceRange.length === 2 && (
          <MDBox mb={1.5}>
            <MDTypography variant="caption" color="rgba(255, 255, 255, 0.8)">
              Fourchette de prix
            </MDTypography>
            <MDTypography variant="h5" fontWeight="bold" color="white">
              ${priceRange[0]} - ${priceRange[1]}
            </MDTypography>
          </MDBox>
        )}

        <MDBox mb={1.5}>
          <ConfidenceBar
            confidence={probability}
            label=""
            showPercentage={false}
          />
        </MDBox>

        {conditions && (
          <MDBox>
            <MDTypography variant="caption" color="rgba(255, 255, 255, 0.9)" sx={{ fontSize: "0.75rem" }}>
              {conditions}
            </MDTypography>
          </MDBox>
        )}
      </MDBox>
    </Card>
  );
}

export default ScenarioCard;

