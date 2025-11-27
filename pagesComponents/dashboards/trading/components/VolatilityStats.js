import { useState, useEffect } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import LinearProgress from "@mui/material/LinearProgress";
import Grid from "@mui/material/Grid";
import unusualWhalesClient from "/lib/unusual-whales/client";
import MiniStatisticsCard from "/examples/Cards/StatisticsCards/MiniStatisticsCard";

function VolatilityStats({ ticker = "", date = "", onError = () => {}, onLoading = () => {} }) {
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
        const params = {};
        if (date) params.date = date;
        const response = await unusualWhalesClient.getStockVolatilityStats(ticker, params);
        const extracted = response?.data || response;
        setData(extracted);
      } catch (err) {
        console.error("Error loading volatility stats:", err);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, date]);

  if (!ticker) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Veuillez sélectionner un ticker pour voir les statistiques de volatilité.
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

  const iv = parseFloat(data.iv || 0) * 100;
  const ivRank = parseFloat(data.iv_rank || 0) * 100;
  const rv = parseFloat(data.rv || 0) * 100;

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" mb={3}>
          Volatility Statistics - {ticker}
        </MDTypography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <MiniStatisticsCard
              title={{ text: "IV Rank" }}
              count={{ value: ivRank.toFixed(1) + "%", color: "info" }}
              icon={{ color: "info", component: "trending_up" }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <MiniStatisticsCard
              title={{ text: "Current IV" }}
              count={{ value: iv.toFixed(2) + "%", color: "success" }}
              icon={{ color: "success", component: "show_chart" }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <MiniStatisticsCard
              title={{ text: "Current RV" }}
              count={{ value: rv.toFixed(2) + "%", color: "warning" }}
              icon={{ color: "warning", component: "bar_chart" }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="caption" color="text.secondary">
                  IV Range
                </MDTypography>
                <MDTypography variant="body1">
                  {(parseFloat(data.iv_low || 0) * 100).toFixed(2)}% - {(parseFloat(data.iv_high || 0) * 100).toFixed(2)}%
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="caption" color="text.secondary">
                  RV Range
                </MDTypography>
                <MDTypography variant="body1">
                  {(parseFloat(data.rv_low || 0) * 100).toFixed(2)}% - {(parseFloat(data.rv_high || 0) * 100).toFixed(2)}%
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="caption" color="text.secondary">
                  Date
                </MDTypography>
                <MDTypography variant="body1">{data.date || "N/A"}</MDTypography>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </Card>
  );
}

export default VolatilityStats;

