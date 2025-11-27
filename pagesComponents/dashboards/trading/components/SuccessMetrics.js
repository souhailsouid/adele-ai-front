/**
 * Composant d'affichage des métriques de succès
 */

import { useState, useEffect } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import metricsService from "/services/metricsService";

function SuccessMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = () => {
    try {
      const successMetrics = metricsService.getSuccessMetrics();
      setMetrics(successMetrics);
    } catch (error) {
      console.error("Error loading metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (value, target) => {
    const percentage = (value / target) * 100;
    if (percentage >= 100) return "success";
    if (percentage >= 80) return "info";
    if (percentage >= 60) return "warning";
    return "error";
  };

  const getProgressValue = (value, target) => {
    return Math.min((value / target) * 100, 100);
  };

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Chargement des métriques...
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <MDBox>
      <MDTypography variant="h5" fontWeight="medium" mb={3}>
        Métriques de Succès
      </MDTypography>

      <Grid container spacing={3}>
        {/* Screening Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" mb={3}>
                Performance du Screening
              </MDTypography>

              {/* Earnings Play Accuracy */}
              <MDBox mb={3}>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <MDTypography variant="body2" fontWeight="medium">
                    Earnings Plays
                  </MDTypography>
                  <Chip
                    label={`${metrics.screening.earningsPlayWinRate}%`}
                    color={getProgressColor(
                      metrics.screening.earningsPlayWinRate,
                      metrics.screening.earningsPlayTarget
                    )}
                    size="small"
                  />
                </MDBox>
                <LinearProgress
                  variant="determinate"
                  value={getProgressValue(
                    metrics.screening.earningsPlayWinRate,
                    metrics.screening.earningsPlayTarget
                  )}
                  color={getProgressColor(
                    metrics.screening.earningsPlayWinRate,
                    metrics.screening.earningsPlayTarget
                  )}
                  sx={{ height: 8, borderRadius: 1 }}
                />
                <MDTypography variant="caption" color="text.secondary" mt={0.5}>
                  {metrics.screening.earningsPlayAccuracy} | Cible: {metrics.screening.earningsPlayTarget}%
                </MDTypography>
              </MDBox>

              {/* Oversold Bounce Success */}
              <MDBox mb={3}>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <MDTypography variant="body2" fontWeight="medium">
                    Oversold Bounces (RSI &lt; 30)
                  </MDTypography>
                  <Chip
                    label={`${metrics.screening.oversoldBounceWinRate}%`}
                    color={getProgressColor(
                      metrics.screening.oversoldBounceWinRate,
                      metrics.screening.oversoldBounceTarget
                    )}
                    size="small"
                  />
                </MDBox>
                <LinearProgress
                  variant="determinate"
                  value={getProgressValue(
                    metrics.screening.oversoldBounceWinRate,
                    metrics.screening.oversoldBounceTarget
                  )}
                  color={getProgressColor(
                    metrics.screening.oversoldBounceWinRate,
                    metrics.screening.oversoldBounceTarget
                  )}
                  sx={{ height: 8, borderRadius: 1 }}
                />
                <MDTypography variant="caption" color="text.secondary" mt={0.5}>
                  {metrics.screening.oversoldBounceSuccess} | Cible: {metrics.screening.oversoldBounceTarget}%
                </MDTypography>
              </MDBox>

              {/* Alert Effectiveness */}
              <MDBox>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <MDTypography variant="body2" fontWeight="medium">
                    Efficacité des Alertes
                  </MDTypography>
                  <Chip
                    label={`${metrics.screening.alertEffectivenessRate}%`}
                    color={getProgressColor(
                      metrics.screening.alertEffectivenessRate,
                      metrics.screening.alertTarget
                    )}
                    size="small"
                  />
                </MDBox>
                <LinearProgress
                  variant="determinate"
                  value={getProgressValue(
                    metrics.screening.alertEffectivenessRate,
                    metrics.screening.alertTarget
                  )}
                  color={getProgressColor(
                    metrics.screening.alertEffectivenessRate,
                    metrics.screening.alertTarget
                  )}
                  sx={{ height: 8, borderRadius: 1 }}
                />
                <MDTypography variant="caption" color="text.secondary" mt={0.5}>
                  {metrics.screening.alertEffectiveness} | Cible: {metrics.screening.alertTarget}%
                </MDTypography>
              </MDBox>
            </MDBox>
          </Card>
        </Grid>

        {/* User Experience Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" mb={3}>
                Expérience Utilisateur
              </MDTypography>

              {/* Usage Stats */}
              <MDBox mb={3}>
                <MDTypography variant="body2" fontWeight="medium" mb={1}>
                  Utilisation (7 derniers jours)
                </MDTypography>
                <MDBox display="flex" flexDirection="column" gap={1}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center">
                    <MDBox display="flex" alignItems="center" gap={1}>
                      <Icon fontSize="small" color="primary">search</Icon>
                      <MDTypography variant="body2">Screener</MDTypography>
                    </MDBox>
                    <MDTypography variant="body2" fontWeight="medium">
                      {metrics.userExperience.featureUsage.screener} utilisations
                    </MDTypography>
                  </MDBox>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center">
                    <MDBox display="flex" alignItems="center" gap={1}>
                      <Icon fontSize="small" color="success">trending_up</Icon>
                      <MDTypography variant="body2">Earnings</MDTypography>
                    </MDBox>
                    <MDTypography variant="body2" fontWeight="medium">
                      {metrics.userExperience.featureUsage.earnings} utilisations
                    </MDTypography>
                  </MDBox>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center">
                    <MDBox display="flex" alignItems="center" gap={1}>
                      <Icon fontSize="small" color="warning">notifications</Icon>
                      <MDTypography variant="body2">Alertes</MDTypography>
                    </MDBox>
                    <MDTypography variant="body2" fontWeight="medium">
                      {metrics.userExperience.featureUsage.alerts} utilisations
                    </MDTypography>
                  </MDBox>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center">
                    <MDBox display="flex" alignItems="center" gap={1}>
                      <Icon fontSize="small" color="info">event</Icon>
                      <MDTypography variant="body2">Calendrier</MDTypography>
                    </MDBox>
                    <MDTypography variant="body2" fontWeight="medium">
                      {metrics.userExperience.featureUsage.calendar} utilisations
                    </MDTypography>
                  </MDBox>
                </MDBox>
                <MDBox mt={2} pt={2} sx={{ borderTop: 1, borderColor: "divider" }}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="body2" fontWeight="medium">
                      Total
                    </MDTypography>
                    <MDTypography variant="h6" fontWeight="bold" color="primary">
                      {metrics.userExperience.totalUsage}
                    </MDTypography>
                  </MDBox>
                  <MDTypography variant="caption" color="text.secondary">
                    Moyenne: {metrics.userExperience.dailyAverage} utilisations/jour
                  </MDTypography>
                </MDBox>
              </MDBox>

              {/* Last Active */}
              <MDBox>
                <MDTypography variant="body2" fontWeight="medium" mb={1}>
                  Dernière activité
                </MDTypography>
                <MDTypography variant="body2" color="text.secondary">
                  {metrics.userExperience.lastActive}
                </MDTypography>
              </MDBox>
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default SuccessMetrics;


