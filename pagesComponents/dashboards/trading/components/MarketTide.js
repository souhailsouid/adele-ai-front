import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

function MarketTide({ data = null, loading = false, interval = "5m", onIntervalChange = null }) {
  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "-";
    const absNum = Math.abs(num);
    const sign = num < 0 ? "-" : "";
    
    if (absNum >= 1_000_000_000) {
      return `${sign}$${(absNum / 1_000_000_000).toFixed(2)}B`;
    }
    if (absNum >= 1_000_000) {
      return `${sign}$${(absNum / 1_000_000).toFixed(2)}M`;
    }
    if (absNum >= 1_000) {
      return `${sign}$${(absNum / 1_000).toFixed(2)}K`;
    }
    return `${sign}$${absNum.toFixed(2)}`;
  };

  const formatCompactNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "-";
    const absNum = Math.abs(num);
    const sign = num < 0 ? "-" : "";
    
    if (absNum >= 1_000_000_000) {
      return `${sign}$${(absNum / 1_000_000_000).toFixed(1)}B`;
    }
    if (absNum >= 1_000_000) {
      return `${sign}$${(absNum / 1_000_000).toFixed(1)}M`;
    }
    if (absNum >= 1_000) {
      return `${sign}$${(absNum / 1_000).toFixed(1)}K`;
    }
    return `${sign}$${absNum.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const parseNumber = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const getTideColor = (value) => {
    if (value > 0) return "success";
    if (value < 0) return "error";
    return "default";
  };

  const getTideIcon = (value) => {
    if (value > 0) return <TrendingUpIcon fontSize="small" />;
    if (value < 0) return <TrendingDownIcon fontSize="small" />;
    return null;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return timestamp;
    }
  };

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Market Tide
          </MDTypography>
          <LinearProgress />
        </MDBox>
      </Card>
    );
  }

  // Gérer les données : peut être un array ou un objet unique
  let tideData = [];
  if (Array.isArray(data)) {
    tideData = data;
  } else if (data?.data && Array.isArray(data.data)) {
    tideData = data.data;
  } else if (data) {
    tideData = [data];
  }

  if (tideData.length === 0) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Aucune donnée Market Tide disponible
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  // Calculer les totaux et la dernière valeur
  const latest = tideData[tideData.length - 1];
  const netCallPremium = parseNumber(latest.net_call_premium || 0);
  const netPutPremium = parseNumber(latest.net_put_premium || 0);
  // Net premium = net_call_premium - net_put_premium
  // net_call_premium positif = bullish (plus d'achats calls)
  // net_put_premium négatif = bullish (moins de ventes puts)
  const netPremium = netCallPremium - netPutPremium;
  const netVolume = parseNumber(latest.net_volume || 0);

  // Calculer les totaux sur toute la journée
  const totalNetCallPremium = tideData.reduce((sum, item) => sum + parseNumber(item.net_call_premium || 0), 0);
  const totalNetPutPremium = tideData.reduce((sum, item) => sum + parseNumber(item.net_put_premium || 0), 0);
  const totalNetVolume = tideData.reduce((sum, item) => sum + parseNumber(item.net_volume || 0), 0);
  
  // Calculer les moyennes pour voir la tendance
  const avgNetCallPremium = totalNetCallPremium / tideData.length;
  const avgNetPutPremium = totalNetPutPremium / tideData.length;

  return (
    <Card>
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDTypography variant="h6">
            Market Tide
          </MDTypography>
          <MDBox display="flex" alignItems="center" gap={2}>
            {onIntervalChange && (
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Intervalle</InputLabel>
                <Select
                  value={interval}
                  label="Intervalle"
                  onChange={(e) => onIntervalChange(e.target.value)}
                >
                  <MenuItem value="1m">1 minute</MenuItem>
                  <MenuItem value="5m">5 minutes</MenuItem>
                  <MenuItem value="15m">15 minutes</MenuItem>
                  <MenuItem value="30m">30 minutes</MenuItem>
                  <MenuItem value="1h">1 heure</MenuItem>
                  <MenuItem value="4h">4 heures</MenuItem>
                  <MenuItem value="1d">1 jour</MenuItem>
                </Select>
              </FormControl>
            )}
            <Tooltip title="Sentiment général du marché basé sur le flux d'options. Net Call Premium = (Call Ask) - (Call Bid). Net Put Premium = (Put Ask) - (Put Bid). Positif = bullish, Négatif = bearish.">
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </MDBox>
        </MDBox>

        <Grid container spacing={3}>
          {/* Dernière valeur - Net Premium */}
          <Grid item xs={12} md={4}>
            <MDBox
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: getTideColor(netPremium) === "success" ? "success.lighter" : getTideColor(netPremium) === "error" ? "error.lighter" : "grey.100",
              }}
            >
              <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <MDTypography variant="body2" fontWeight="medium" color="text.secondary">
                  Net Premium (Dernier)
                </MDTypography>
                {getTideIcon(netPremium)}
              </MDBox>
              <MDTypography
                variant="h5"
                fontWeight="bold"
                color={getTideColor(netPremium) === "success" ? "success.main" : getTideColor(netPremium) === "error" ? "error.main" : "text"}
              >
                {formatNumber(netPremium)}
              </MDTypography>
              <MDTypography variant="caption" color="text.secondary" mt={0.5} display="block">
                {formatTime(latest.timestamp)}
              </MDTypography>
              <MDBox mt={1.5}>
                <MDBox display="flex" justifyContent="space-between" mb={0.5}>
                  <MDTypography variant="caption" color="text.secondary">
                    Net Call:
                  </MDTypography>
                  <MDTypography 
                    variant="caption" 
                    fontWeight="medium"
                    color={netCallPremium > 0 ? "success.main" : "error.main"}
                  >
                    {formatCompactNumber(netCallPremium)}
                  </MDTypography>
                </MDBox>
                <MDBox display="flex" justifyContent="space-between">
                  <MDTypography variant="caption" color="text.secondary">
                    Net Put:
                  </MDTypography>
                  <MDTypography 
                    variant="caption" 
                    fontWeight="medium"
                    color={netPutPremium < 0 ? "success.main" : "error.main"}
                  >
                    {formatCompactNumber(netPutPremium)}
                  </MDTypography>
                </MDBox>
              </MDBox>
              <MDTypography variant="caption" color="text.secondary" mt={1} display="block" sx={{ fontSize: "0.65rem" }}>
                Net Call = (Call Ask) - (Call Bid) | Net Put = (Put Ask) - (Put Bid)
              </MDTypography>
            </MDBox>
          </Grid>

          {/* Total Net Premium (Journée) */}
          <Grid item xs={12} md={4}>
            <MDBox
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "grey.100",
              }}
            >
              <MDTypography variant="body2" fontWeight="medium" color="text.secondary" mb={1}>
                Net Premium Total (Journée)
              </MDTypography>
              <MDTypography
                variant="h5"
                fontWeight="bold"
                color={getTideColor(totalNetCallPremium - totalNetPutPremium) === "success" ? "success.main" : getTideColor(totalNetCallPremium - totalNetPutPremium) === "error" ? "error.main" : "text"}
              >
                {formatCompactNumber(totalNetCallPremium - totalNetPutPremium)}
              </MDTypography>
              <MDBox mt={1.5}>
                <MDBox display="flex" justifyContent="space-between" mb={0.5}>
                  <MDTypography variant="caption" color="text.secondary">
                    Total Net Call:
                  </MDTypography>
                  <MDTypography 
                    variant="caption" 
                    fontWeight="medium"
                    color={totalNetCallPremium > 0 ? "success.main" : "error.main"}
                  >
                    {formatCompactNumber(totalNetCallPremium)}
                  </MDTypography>
                </MDBox>
                <MDBox display="flex" justifyContent="space-between" mb={0.5}>
                  <MDTypography variant="caption" color="text.secondary">
                    Total Net Put:
                  </MDTypography>
                  <MDTypography 
                    variant="caption" 
                    fontWeight="medium"
                    color={totalNetPutPremium < 0 ? "success.main" : "error.main"}
                  >
                    {formatCompactNumber(totalNetPutPremium)}
                  </MDTypography>
                </MDBox>
                <MDBox display="flex" justifyContent="space-between" mt={1} pt={1} sx={{ borderTop: 1, borderColor: "divider" }}>
                  <MDTypography variant="caption" color="text.secondary">
                    Moyenne:
                  </MDTypography>
                  <MDBox display="flex" gap={1}>
                    <MDTypography variant="caption" color="text.secondary">
                      Call {formatCompactNumber(avgNetCallPremium)}
                    </MDTypography>
                    <MDTypography variant="caption" color="text.secondary">
                      |
                    </MDTypography>
                    <MDTypography variant="caption" color="text.secondary">
                      Put {formatCompactNumber(avgNetPutPremium)}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </MDBox>
            </MDBox>
          </Grid>

          {/* Net Volume */}
          <Grid item xs={12} md={4}>
            <MDBox
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "grey.100",
              }}
            >
              <MDTypography variant="body2" fontWeight="medium" color="text.secondary" mb={1}>
                Net Volume
              </MDTypography>
              <MDTypography
                variant="h5"
                fontWeight="bold"
                color={getTideColor(netVolume) === "success" ? "success.main" : getTideColor(netVolume) === "error" ? "error.main" : "text"}
              >
                {formatCompactNumber(netVolume)}
              </MDTypography>
              <MDBox mt={1.5}>
                <MDBox display="flex" justifyContent="space-between" mb={0.5}>
                  <MDTypography variant="caption" color="text.secondary">
                    Dernier:
                  </MDTypography>
                  <MDTypography variant="caption" fontWeight="medium" color="text">
                    {formatTime(latest.timestamp)}
                  </MDTypography>
                </MDBox>
                <MDBox display="flex" justifyContent="space-between">
                  <MDTypography variant="caption" color="text.secondary">
                    Total journée:
                  </MDTypography>
                  <MDTypography variant="caption" fontWeight="medium" color="text">
                    {formatCompactNumber(totalNetVolume)}
                  </MDTypography>
                </MDBox>
              </MDBox>
            </MDBox>
          </Grid>

          {/* Dernières valeurs (tableau) */}
          <Grid item xs={12}>
            <MDBox
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "grey.100",
              }}
            >
              <MDTypography variant="body2" fontWeight="medium" color="text.secondary" mb={1}>
                Dernières valeurs (5 dernières)
              </MDTypography>
              <MDBox display="flex" gap={2} flexWrap="wrap">
                {tideData.slice(-5).map((item, index) => {
                  const itemNetCall = parseNumber(item.net_call_premium || 0);
                  const itemNetPut = parseNumber(item.net_put_premium || 0);
                  const itemNet = itemNetCall - itemNetPut;
                  return (
                    <MDBox key={index} sx={{ minWidth: 150 }}>
                      <MDTypography variant="caption" color="text.secondary" display="block">
                        {formatTime(item.timestamp)}
                      </MDTypography>
                      <MDTypography
                        variant="body2"
                        fontWeight="bold"
                        color={getTideColor(itemNet) === "success" ? "success.main" : getTideColor(itemNet) === "error" ? "error.main" : "text"}
                      >
                        {formatNumber(itemNet)}
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

export default MarketTide;

