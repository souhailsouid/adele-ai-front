import { useState, useEffect } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import LinearProgress from "@mui/material/LinearProgress";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import unusualWhalesClient from "/lib/unusual-whales/client";
import MiniStatisticsCard from "/examples/Cards/StatisticsCards/MiniStatisticsCard";
import { formatDateTime } from "./utils";

function StockState({ ticker = "", onError = () => {}, onLoading = () => {} }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticker) {
      setData(null);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        onLoading(true);
        setError(null);
        const response = await unusualWhalesClient.getStockState(ticker);
        const extracted = response?.data || response;
        setData(extracted);
      } catch (err) {
        console.error("Error loading stock state:", err);
        const errMsg = err.message || "Erreur lors du chargement";
        setError(errMsg);
        onError(errMsg);
        setData(null);
      } finally {
        setLoading(false);
        onLoading(false);
      }
    };

    loadData();
  }, [ticker]);

  if (!ticker) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Veuillez sélectionner un ticker pour voir l&apos;état du stock.
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <LinearProgress />
        </MDBox>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="error">
            {error}
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Aucune donnée disponible.
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  const tapeTime = formatDateTime(data.tape_time);
  const close = parseFloat(data.close || 0);
  const prevClose = parseFloat(data.prev_close || 0);
  const change = close - prevClose;
  const changePercent = prevClose > 0 ? ((change / prevClose) * 100).toFixed(2) : "0.00";
  const isPositive = change >= 0;

  const formatVolume = (vol) => {
    const num = parseInt(vol || 0);
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(2) + "K";
    return num.toLocaleString();
  };

  const getMarketTimeColor = (marketTime) => {
    if (marketTime === "regular") return "success";
    if (marketTime === "pr") return "warning";
    if (marketTime === "po") return "info";
    return "default";
  };

  const getMarketTimeLabel = (marketTime) => {
    if (marketTime === "regular") return "Regular";
    if (marketTime === "pr") return "Premarket";
    if (marketTime === "po") return "Postmarket";
    return marketTime || "N/A";
  };

  return (
    <Card>
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDTypography variant="h6">
            Stock State - {ticker}
          </MDTypography>
          <Tooltip title="État actuel du stock : prix OHLC, volume, et informations de marché">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>

        {/* Cartes principales */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <MiniStatisticsCard
              title={{ text: "Close" }}
              count={`$${close.toFixed(2)}`}
              percentage={{ 
                color: isPositive ? "success" : "error",
                text: ""
              }}
              icon={{ 
                color: isPositive ? "success" : "error", 
                component: isPositive ? "trending_up" : "trending_down" 
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MiniStatisticsCard
              title={{ text: "Change" }}
              count={`${isPositive ? "+" : ""}$${change.toFixed(2)}`}
              percentage={{ 
                color: isPositive ? "success" : "error",
                text: `(${isPositive ? "+" : ""}${changePercent}%)`
              }}
              icon={{ 
                color: isPositive ? "success" : "error", 
                component: isPositive ? "arrow_upward" : "arrow_downward" 
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MiniStatisticsCard
              title={{ text: "Total Volume" }}
              count={formatVolume(data.total_volume)}
              icon={{ color: "info", component: "bar_chart" }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MiniStatisticsCard
              title={{ text: "Volume" }}
              count={formatVolume(data.volume)}
              icon={{ color: "success", component: "show_chart" }}
            />
          </Grid>
        </Grid>

        {/* Détails OHLC */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <MDBox p={2}>
                <MDTypography variant="caption" color="text.secondary" display="block" mb={0.5}>
                  Open
                </MDTypography>
                <MDTypography variant="h6" fontWeight="bold">
                  ${parseFloat(data.open || 0).toFixed(2)}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <MDBox p={2}>
                <MDTypography variant="caption" color="text.secondary" display="block" mb={0.5}>
                  High
                </MDTypography>
                <MDTypography variant="h6" fontWeight="bold" color="success">
                  ${parseFloat(data.high || 0).toFixed(2)}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <MDBox p={2}>
                <MDTypography variant="caption" color="text.secondary" display="block" mb={0.5}>
                  Low
                </MDTypography>
                <MDTypography variant="h6" fontWeight="bold" color="error">
                  ${parseFloat(data.low || 0).toFixed(2)}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <MDBox p={2}>
                <MDTypography variant="caption" color="text.secondary" display="block" mb={0.5}>
                  Previous Close
                </MDTypography>
                <MDTypography variant="h6" fontWeight="bold">
                  ${prevClose.toFixed(2)}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* Informations supplémentaires */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <MDBox
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: "grey.100",
              }}
            >
              <MDTypography variant="caption" color="text.secondary" display="block" mb={0.5}>
                Market Time
              </MDTypography>
              <Chip
                label={getMarketTimeLabel(data.market_time)}
                color={getMarketTimeColor(data.market_time)}
                size="small"
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDBox
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: "grey.100",
              }}
            >
              <MDTypography variant="caption" color="text.secondary" display="block" mb={0.5}>
                Tape Time
              </MDTypography>
              <MDTypography variant="body2" fontWeight="medium">
                {tapeTime.date} {tapeTime.time}
              </MDTypography>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
    </Card>
  );
}

export default StockState;

