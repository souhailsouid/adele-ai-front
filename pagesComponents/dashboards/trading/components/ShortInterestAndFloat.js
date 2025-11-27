import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";

function ShortInterestAndFloat({ data = null, loading = false, ticker = "" }) {
  const formatNumber = (num) => {
    if (!num || num === 0) return "-";
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
    return num.toString();
  };

  const parseNumber = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", { 
        year: "numeric", 
        month: "short", 
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Short Interest & Float
          </MDTypography>
          <LinearProgress />
        </MDBox>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Short Interest & Float {ticker ? `(${ticker})` : ""}
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Aucune donnée disponible. Veuillez rechercher un ticker.
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  const percentReturned = parseNumber(data.percent_returned);
  const daysToCover = parseNumber(data.days_to_cover_returned);
  const siFloat = parseNumber(data.si_float_returned);
  const totalFloat = parseNumber(data.total_float_returned);

  return (
    <Card>
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDTypography variant="h6">
            Short Interest & Float {ticker ? `(${ticker})` : ""}
          </MDTypography>
          <Tooltip title="Pourcentage du float qui est shorté, et le nombre de jours pour couvrir toutes les positions short">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <MDBox
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "background.default",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <MDTypography variant="caption" color="text.secondary" mb={1}>
                Percent of Float Shorted
              </MDTypography>
              <MDTypography variant="h4" fontWeight="bold" color="error.main">
                {percentReturned > 0 ? `${percentReturned.toFixed(2)}%` : "N/A"}
              </MDTypography>
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6}>
            <MDBox
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "background.default",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <MDTypography variant="caption" color="text.secondary" mb={1}>
                Days to Cover
              </MDTypography>
              <MDTypography variant="h4" fontWeight="bold" color="warning.main">
                {daysToCover > 0 ? `${daysToCover.toFixed(1)} jours` : "N/A"}
              </MDTypography>
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6}>
            <MDBox
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "background.default",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <MDTypography variant="caption" color="text.secondary" mb={1}>
                Short Interest (Shares Shorted)
              </MDTypography>
              <MDTypography variant="h5" fontWeight="bold" color="error.main">
                {formatNumber(siFloat)}
              </MDTypography>
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6}>
            <MDBox
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "background.default",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <MDTypography variant="caption" color="text.secondary" mb={1}>
                Total Float (Available Shares)
              </MDTypography>
              <MDTypography variant="h5" fontWeight="bold" color="primary">
                {formatNumber(totalFloat)}
              </MDTypography>
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={3} p={2} sx={{ backgroundColor: "background.default", borderRadius: 2 }}>
          <MDTypography variant="caption" color="text.secondary" display="block" mb={1}>
            Symbol: <Chip label={data.symbol || "N/A"} size="small" />
          </MDTypography>
          <MDTypography variant="caption" color="text.secondary" display="block" mb={1}>
            Market Date: {data.market_date || "N/A"}
          </MDTypography>
          <MDTypography variant="caption" color="text.secondary" display="block">
            Created At: {formatDate(data.created_at)}
          </MDTypography>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default ShortInterestAndFloat;


