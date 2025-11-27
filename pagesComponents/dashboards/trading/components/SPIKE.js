import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import { formatDateTime } from "./utils";

function SPIKE({ data = [], loading = false }) {
  const parseNumber = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const getSpikeColor = (spike) => {
    if (spike >= 3) return "error"; // Très élevé
    if (spike >= 2) return "warning"; // Élevé
    if (spike >= 1) return "info"; // Modéré
    return "success"; // Faible = calme
  };

  const getSpikeLabel = (spike) => {
    if (spike >= 3) return "TRÈS ÉLEVÉ";
    if (spike >= 2) return "ÉLEVÉ";
    if (spike >= 1) return "MODÉRÉ";
    return "FAIBLE";
  };

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            SPIKE
          </MDTypography>
          <LinearProgress />
        </MDBox>
      </Card>
    );
  }

  // Gérer les données : peut être un array ou un objet avec data
  let spikeData = [];
  if (Array.isArray(data)) {
    spikeData = data;
  } else if (data?.data && Array.isArray(data.data)) {
    spikeData = data.data;
  } else if (data) {
    spikeData = [data];
  }

  if (spikeData.length === 0) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Aucune donnée SPIKE disponible
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  // Calculer les statistiques
  const latest = spikeData[spikeData.length - 1];
  const latestValue = parseNumber(latest.value || latest.spike || 0);
  const latestTime = latest.time || latest.timestamp || latest.publish_date;

  // Calculer min, max, moyenne
  const values = spikeData.map((item) => parseNumber(item.value || 0));
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;

  // Dernières valeurs (10 dernières)
  const recentValues = spikeData.slice(-10);

  return (
    <Card>
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDTypography variant="h6">
            SPIKE - Indicateur de Volatilité
          </MDTypography>
          <Tooltip title="Indicateur de volatilité du marché - détecte les mouvements importants. Valeur élevée = forte volatilité">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>

        <Grid container spacing={3}>
          {/* Valeur actuelle */}
          <Grid item xs={12} md={4}>
            <MDBox
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: getSpikeColor(latestValue) === "error" ? "error.lighter" : getSpikeColor(latestValue) === "warning" ? "warning.lighter" : getSpikeColor(latestValue) === "info" ? "info.lighter" : "success.lighter",
              }}
            >
              <MDTypography variant="body2" fontWeight="medium" color="text.secondary" mb={1}>
                Valeur Actuelle
              </MDTypography>
              <MDTypography
                variant="h4"
                fontWeight="bold"
                color={getSpikeColor(latestValue) === "error" ? "error.main" : getSpikeColor(latestValue) === "warning" ? "warning.main" : getSpikeColor(latestValue) === "info" ? "info.main" : "success.main"}
              >
                {latestValue.toFixed(2)}
              </MDTypography>
              <MDTypography variant="caption" color="text.secondary" mt={0.5} display="block">
                {formatDateTime(latestTime).time}
              </MDTypography>
              <Chip
                label={getSpikeLabel(latestValue)}
                color={getSpikeColor(latestValue)}
                size="small"
                sx={{ mt: 1 }}
              />
            </MDBox>
          </Grid>

          {/* Statistiques */}
          <Grid item xs={12} md={4}>
            <MDBox
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "grey.100",
              }}
            >
              <MDTypography variant="body2" fontWeight="medium" color="text.secondary" mb={1}>
                Statistiques (Journée)
              </MDTypography>
              <MDBox mb={1}>
                <MDTypography variant="caption" color="text.secondary" display="block">
                  Maximum
                </MDTypography>
                <MDTypography variant="h6" color="error.main" fontWeight="bold">
                  {maxValue.toFixed(2)}
                </MDTypography>
              </MDBox>
              <MDBox mb={1}>
                <MDTypography variant="caption" color="text.secondary" display="block">
                  Minimum
                </MDTypography>
                <MDTypography variant="h6" color="success.main" fontWeight="bold">
                  {minValue.toFixed(2)}
                </MDTypography>
              </MDBox>
              <MDBox>
                <MDTypography variant="caption" color="text.secondary" display="block">
                  Moyenne
                </MDTypography>
                <MDTypography variant="h6" fontWeight="bold">
                  {avgValue.toFixed(2)}
                </MDTypography>
              </MDBox>
            </MDBox>
          </Grid>

          {/* Évolution récente */}
          <Grid item xs={12} md={4}>
            <MDBox
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "grey.100",
              }}
            >
              <MDTypography variant="body2" fontWeight="medium" color="text.secondary" mb={1}>
                Évolution Récente (10 dernières)
              </MDTypography>
              <MDBox display="flex" gap={1} flexWrap="wrap">
                {recentValues.map((item, index) => {
                  const value = parseNumber(item.value || 0);
                  const time = formatDateTime(item.time || item.timestamp || item.publish_date);
                  return (
                    <MDBox key={index} sx={{ minWidth: 80 }}>
                      <MDTypography variant="caption" color="text.secondary" display="block">
                        {time.time}
                      </MDTypography>
                      <MDTypography
                        variant="body2"
                        fontWeight="bold"
                        color={getSpikeColor(value) === "error" ? "error.main" : getSpikeColor(value) === "warning" ? "warning.main" : getSpikeColor(value) === "info" ? "info.main" : "success.main"}
                      >
                        {value.toFixed(2)}
                      </MDTypography>
                    </MDBox>
                  );
                })}
              </MDBox>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
    </Card>
  );
}

export default SPIKE;

