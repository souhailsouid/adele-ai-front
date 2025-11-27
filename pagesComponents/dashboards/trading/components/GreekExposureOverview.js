import { useState, useEffect, useMemo } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import Grid from "@mui/material/Grid";
import unusualWhalesClient from "/lib/unusual-whales/client";
import DefaultLineChart from "/examples/Charts/LineCharts/DefaultLineChart";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

function GreekExposureOverview({ ticker = "", date = "", timeframe = "1Y" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticker) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = {};
        if (date) params.date = date;
        if (timeframe) params.timeframe = timeframe;
        
        const response = await unusualWhalesClient.getStockGreekExposure(ticker, params);
        const extracted = Array.isArray(response) ? response : (response?.data || []);
        setData(extracted);
      } catch (err) {
        console.error("Error loading greek exposure:", err);
        setError(err.message || "Erreur lors du chargement");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ticker, date, timeframe]);

  const formatNumber = (num) => {
    if (!num || num === 0) return "0";
    const numValue = typeof num === "string" ? parseFloat(num) : num;
    if (isNaN(numValue)) return "0";
    if (Math.abs(numValue) >= 1_000_000_000) return `${(numValue / 1_000_000_000).toFixed(2)}B`;
    if (Math.abs(numValue) >= 1_000_000) return `${(numValue / 1_000_000).toFixed(2)}M`;
    if (Math.abs(numValue) >= 1_000) return `${(numValue / 1_000).toFixed(2)}K`;
    return numValue.toFixed(2);
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
        day: "numeric"
      });
    } catch {
      return dateString;
    }
  };

  // Trier les données par date
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });
  }, [data]);

  // Préparer les données pour les graphiques
  const chartData = useMemo(() => {
    const labels = sortedData.map((item) => formatDate(item.date));
    
    // Gamma Exposure (call_gamma + put_gamma)
    const gammaData = sortedData.map((item) => {
      const callGamma = parseNumber(item.call_gamma);
      const putGamma = parseNumber(item.put_gamma);
      return callGamma + putGamma; // Net gamma
    });

    // Delta Exposure (call_delta + put_delta)
    const deltaData = sortedData.map((item) => {
      const callDelta = parseNumber(item.call_delta);
      const putDelta = parseNumber(item.put_delta);
      return callDelta + putDelta; // Net delta
    });

    return {
      gammaChart: {
        labels,
        datasets: [
          {
            label: "Net Gamma Exposure",
            color: "info",
            data: gammaData,
          },
        ],
      },
      deltaChart: {
        labels,
        datasets: [
          {
            label: "Net Delta Exposure",
            color: "success",
            data: deltaData,
          },
        ],
      },
    };
  }, [sortedData]);

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

  if (data.length === 0) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Aucune donnée disponible
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  // Calculer les totaux pour la dernière date
  const latest = sortedData[sortedData.length - 1];
  const callDelta = parseNumber(latest.call_delta);
  const putDelta = parseNumber(latest.put_delta);
  const callGamma = parseNumber(latest.call_gamma);
  const putGamma = parseNumber(latest.put_gamma);
  const callVanna = parseNumber(latest.call_vanna);
  const putVanna = parseNumber(latest.put_vanna);
  const callCharm = parseNumber(latest.call_charm);
  const putCharm = parseNumber(latest.put_charm);

  const netDelta = callDelta + putDelta;
  const netGamma = callGamma + putGamma;
  const netVanna = callVanna + putVanna;
  const netCharm = callCharm + putCharm;

  return (
    <MDBox>
      {/* Graphiques */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <DefaultLineChart
            icon={{ color: "info", component: "show_chart" }}
            title={`${ticker} - Gamma Exposure`}
            description="Exposition nette au gamma"
            chart={chartData.gammaChart}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DefaultLineChart
            icon={{ color: "success", component: "trending_up" }}
            title={`${ticker} - Delta Exposure`}
            description="Exposition nette au delta"
            chart={chartData.deltaChart}
          />
        </Grid>
      </Grid>

      {/* Cartes de résumé */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <MDBox p={2} sx={{ bgcolor: netGamma > 0 ? "success.lighter" : "error.lighter" }}>
              <MDTypography variant="caption" color="text.secondary" mb={1}>
                Net Gamma Exposure
              </MDTypography>
              <MDTypography variant="h5" fontWeight="bold" color={netGamma > 0 ? "success.main" : "error.main"}>
                {formatNumber(netGamma)}
              </MDTypography>
            </MDBox>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <MDBox p={2} sx={{ bgcolor: netDelta > 0 ? "success.lighter" : "error.lighter" }}>
              <MDTypography variant="caption" color="text.secondary" mb={1}>
                Net Delta Exposure
              </MDTypography>
              <MDTypography variant="h5" fontWeight="bold" color={netDelta > 0 ? "success.main" : "error.main"}>
                {formatNumber(netDelta)}
              </MDTypography>
            </MDBox>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <MDBox p={2}>
              <MDTypography variant="caption" color="text.secondary" mb={1}>
                Net Vanna Exposure
              </MDTypography>
              <MDTypography variant="h5" fontWeight="bold" color="info.main">
                {formatNumber(netVanna)}
              </MDTypography>
            </MDBox>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <MDBox p={2}>
              <MDTypography variant="caption" color="text.secondary" mb={1}>
                Net Charm Exposure
              </MDTypography>
              <MDTypography variant="h5" fontWeight="bold" color="warning.main">
                {formatNumber(netCharm)}
              </MDTypography>
            </MDBox>
          </Card>
        </Grid>
      </Grid>

      {/* Tableau détaillé */}
      <Card>
        <MDBox p={3}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h6">
              Greek Exposure History ({ticker}) ({data.length} jours)
            </MDTypography>
            <Tooltip title="Exposition aux grecs (Delta, Gamma, Vanna, Charm) pour les market makers">
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </MDBox>
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="12%" align="left">Date</DataTableHeadCell>
                  <DataTableHeadCell width="11%" align="right">Call Delta</DataTableHeadCell>
                  <DataTableHeadCell width="11%" align="right">Put Delta</DataTableHeadCell>
                  <DataTableHeadCell width="11%" align="right">Net Delta</DataTableHeadCell>
                  <DataTableHeadCell width="11%" align="right">Call Gamma</DataTableHeadCell>
                  <DataTableHeadCell width="11%" align="right">Put Gamma</DataTableHeadCell>
                  <DataTableHeadCell width="11%" align="right">Net Gamma</DataTableHeadCell>
                  <DataTableHeadCell width="11%" align="right">Call Vanna</DataTableHeadCell>
                  <DataTableHeadCell width="11%" align="right">Put Vanna</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {sortedData.slice(-30).map((item, index) => {
                  const cDelta = parseNumber(item.call_delta);
                  const pDelta = parseNumber(item.put_delta);
                  const cGamma = parseNumber(item.call_gamma);
                  const pGamma = parseNumber(item.put_gamma);
                  const cVanna = parseNumber(item.call_vanna);
                  const pVanna = parseNumber(item.put_vanna);
                  const nDelta = cDelta + pDelta;
                  const nGamma = cGamma + pGamma;

                  return (
                    <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="body2" fontWeight="medium">
                          {formatDate(item.date)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="success.main">
                          {formatNumber(cDelta)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="error.main">
                          {formatNumber(pDelta)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium" color={nDelta > 0 ? "success.main" : "error.main"}>
                          {formatNumber(nDelta)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="success.main">
                          {formatNumber(cGamma)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="error.main">
                          {formatNumber(pGamma)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium" color={nGamma > 0 ? "success.main" : "error.main"}>
                          {formatNumber(nGamma)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="info.main">
                          {formatNumber(cVanna)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="info.main">
                          {formatNumber(pVanna)}
                        </MDTypography>
                      </DataTableBodyCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </MDBox>
      </Card>
    </MDBox>
  );
}

export default GreekExposureOverview;

