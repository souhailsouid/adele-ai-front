/**
 * Cartographie des liquidations (style Glassnode)
 * Visualisation des zones de liquidation
 */

import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";

function LiquidationsMap({ data = [] }) {
  // Générer des données de démonstration si aucune donnée n'est fournie
  const generateDemoData = () => {
    const tickers = ["BTC", "ETH", "AAPL", "TSLA", "NVDA", "SPY", "QQQ"];
    return tickers.map((ticker) => ({
      ticker,
      liquidationPrice: Math.random() * 100 + 50,
      currentPrice: Math.random() * 100 + 50,
      liquidationAmount: Math.random() * 10000000,
      distance: Math.random() * 20,
    }));
  };

  const liquidations = data.length > 0 ? data : generateDemoData();

  const getRiskLevel = (distance) => {
    if (distance < 5) return { level: "Critique", color: "error" };
    if (distance < 10) return { level: "Élevé", color: "warning" };
    if (distance < 15) return { level: "Modéré", color: "info" };
    return { level: "Faible", color: "success" };
  };

  return (
    <MDBox>
      <MDBox
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 2,
        }}
      >
        {liquidations.map((liq, index) => {
          const risk = getRiskLevel(liq.distance || 0);
          const distance = liq.distance || 0;
          const progress = Math.min((distance / 20) * 100, 100);

          return (
            <MDBox
              key={index}
              sx={{
                p: 2,
                backgroundColor: "grey.50",
                borderRadius: 2,
                border: `2px solid`,
                borderColor: risk.color === "error" ? "error.main" : 
                           risk.color === "warning" ? "warning.main" :
                           risk.color === "info" ? "info.main" : "success.main",
              }}
            >
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <MDTypography variant="h6" fontWeight="bold">
                  {liq.ticker}
                </MDTypography>
                <Chip label={risk.level} size="small" color={risk.color} />
              </MDBox>

              <MDBox mb={1}>
                <MDTypography variant="caption" color="text.secondary">
                  Prix actuel
                </MDTypography>
                <MDTypography variant="body2" fontWeight="bold">
                  ${Number(liq.currentPrice || 0).toFixed(2)}
                </MDTypography>
              </MDBox>

              <MDBox mb={1}>
                <MDTypography variant="caption" color="text.secondary">
                  Liquidation à
                </MDTypography>
                <MDTypography variant="body2" fontWeight="bold" color="error">
                  ${Number(liq.liquidationPrice || 0).toFixed(2)}
                </MDTypography>
              </MDBox>

              <MDBox mb={1}>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <MDTypography variant="caption" color="text.secondary">
                    Distance
                  </MDTypography>
                  <MDTypography variant="caption" fontWeight="bold" color={risk.color}>
                    {distance.toFixed(1)}%
                  </MDTypography>
                </MDBox>
                <MDBox
                  sx={{
                    width: "100%",
                    height: 8,
                    backgroundColor: "grey.300",
                    borderRadius: 1,
                    overflow: "hidden",
                  }}
                >
                  <MDBox
                    sx={{
                      width: `${progress}%`,
                      height: "100%",
                      backgroundColor: risk.color === "error" ? "error.main" : 
                                     risk.color === "warning" ? "warning.main" :
                                     risk.color === "info" ? "info.main" : "success.main",
                      transition: "width 0.3s",
                    }}
                  />
                </MDBox>
              </MDBox>

              {liq.liquidationAmount && (
                <MDBox display="flex" alignItems="center" gap={0.5}>
                  <Icon fontSize="small" color="text.secondary">
                    attach_money
                  </Icon>
                  <MDTypography variant="caption" color="text.secondary">
                    ${(liq.liquidationAmount / 1000000).toFixed(2)}M
                  </MDTypography>
                </MDBox>
              )}
            </MDBox>
          );
        })}
      </MDBox>

      {liquidations.length === 0 && (
        <MDBox textAlign="center" py={4}>
          <MDTypography variant="body2" color="text.secondary">
            Aucune donnée de liquidation disponible
          </MDTypography>
        </MDBox>
      )}
    </MDBox>
  );
}

export default LiquidationsMap;



