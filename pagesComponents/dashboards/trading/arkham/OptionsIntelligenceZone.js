/**
 * Zone Options Intelligence
 * Affiche : Heatmap des options, Liquidations, Timing optimal
 */

import { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import LinearProgress from "@mui/material/LinearProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import OptionsHeatmap from "./OptionsHeatmap";
import LiquidationsMap from "./LiquidationsMap";

function OptionsIntelligenceZone({ data = {}, loading = false }) {
  const [activeTab, setActiveTab] = useState(0);

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Options Intelligence
          </MDTypography>
          <LinearProgress />
        </MDBox>
      </Card>
    );
  }

  const liquidations = data.liquidations || [];
  const openInterest = data.openInterest || [];
  const optimalTiming = data.optimalTiming || [];
  const flows = data.flows || [];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Card>
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDTypography variant="h6" fontWeight="bold">
            Options Intelligence
          </MDTypography>
          <MDBox display="flex" gap={1}>
            <Chip
              icon={<Icon>whatshot</Icon>}
              label="Heatmap"
              size="small"
              color="error"
            />
            <Chip
              icon={<Icon>trending_down</Icon>}
              label={`${liquidations.length} Liquidations`}
              size="small"
              color="warning"
            />
          </MDBox>
        </MDBox>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Heatmap" />
            <Tab label="Liquidations" />
            <Tab label="Timing" />
          </Tabs>
        </Box>

        {/* Tab 0: Heatmap */}
        {activeTab === 0 && (
          <MDBox>
            <MDTypography variant="body2" color="text.secondary" mb={2}>
              Heatmap des options par strike et expiration (basé sur {flows.length} flows récents, {openInterest.length} combinaisons strike/expiry)
            </MDTypography>
            <OptionsHeatmap data={openInterest} />
            {openInterest.length === 0 && flows.length > 0 && (
              <MDBox mt={2}>
                <MDTypography variant="caption" color="text.secondary">
                  Aucune donnée agrégée disponible. Vérifiez que les flows contiennent strike et expiry.
                </MDTypography>
              </MDBox>
            )}
            {openInterest.length === 0 && flows.length === 0 && (
              <MDBox mt={2}>
                <MDTypography variant="caption" color="text.secondary">
                  Aucune donnée d&apos;options disponible.
                </MDTypography>
              </MDBox>
            )}
          </MDBox>
        )}

        {/* Tab 1: Liquidations */}
        {activeTab === 1 && (
          <MDBox>
            <MDTypography variant="body2" color="text.secondary" mb={2}>
              Cartographie des liquidations (style Glassnode)
            </MDTypography>
            <LiquidationsMap data={liquidations} />
          </MDBox>
        )}

        {/* Tab 2: Timing Optimal */}
        {activeTab === 2 && (
          <MDBox>
            <MDTypography variant="body2" color="text.secondary" mb={2}>
              Timing optimal pour les trades d&apos;options
            </MDTypography>
            {optimalTiming.length > 0 ? (
              <Grid container spacing={2}>
                {optimalTiming.map((timing, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card sx={{ p: 2, backgroundColor: "grey.50" }}>
                      <MDBox display="flex" justifyContent="space-between" alignItems="center">
                        <MDBox>
                          <MDTypography variant="body2" fontWeight="bold">
                            {timing.ticker || "N/A"}
                          </MDTypography>
                          <MDTypography variant="caption" color="text.secondary">
                            {timing.strategy || "N/A"}
                          </MDTypography>
                        </MDBox>
                        <Chip
                          label={timing.score ? `${timing.score}/100` : "N/A"}
                          size="small"
                          color={timing.score >= 70 ? "success" : timing.score >= 50 ? "warning" : "error"}
                        />
                      </MDBox>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <MDBox textAlign="center" py={4}>
                <MDTypography variant="body2" color="text.secondary">
                  Aucune donnée de timing disponible
                </MDTypography>
              </MDBox>
            )}
          </MDBox>
        )}
      </MDBox>
    </Card>
  );
}

export default OptionsIntelligenceZone;

