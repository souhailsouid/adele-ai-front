import { useMemo } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import LinearProgress from "@mui/material/LinearProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import InfoIcon from "@mui/icons-material/Info";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";
import DefaultLineChart from "/examples/Charts/LineCharts/DefaultLineChart";
import MiniStatisticsCard from "/examples/Cards/StatisticsCards/MiniStatisticsCard";
import { formatDateTime } from "./utils";
import useGreekFlow from "../hooks/useGreekFlow";

function formatNumber(num) {
  if (!num && num !== 0) return "0";
  const n = parseFloat(num);
  if (isNaN(n)) return "0";
  if (Math.abs(n) >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return n.toFixed(2);
}

function parseNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function GreekFlow({ ticker = "", onError = () => {}, onLoading = () => {} }) {
  // Utiliser le hook personnalisé pour récupérer les données
  const { data, loading, error } = useGreekFlow(ticker, onError, onLoading);

  // Calculer les totaux pour la journée (doit être avant les return conditionnels)
  const totals = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalTransactions: 0,
        totalVolume: 0,
        totalDirDeltaFlow: 0,
        totalDirVegaFlow: 0,
        totalOtmDirDeltaFlow: 0,
        totalOtmDirVegaFlow: 0,
      };
    }
    return data.reduce(
      (acc, item) => {
        acc.totalTransactions += parseNumber(item.transactions);
        acc.totalVolume += parseNumber(item.volume);
        acc.totalDirDeltaFlow += parseNumber(item.dir_delta_flow);
        acc.totalDirVegaFlow += parseNumber(item.dir_vega_flow);
        acc.totalOtmDirDeltaFlow += parseNumber(item.otm_dir_delta_flow);
        acc.totalOtmDirVegaFlow += parseNumber(item.otm_dir_vega_flow);
        return acc;
      },
      {
        totalTransactions: 0,
        totalVolume: 0,
        totalDirDeltaFlow: 0,
        totalDirVegaFlow: 0,
        totalOtmDirDeltaFlow: 0,
        totalOtmDirVegaFlow: 0,
      }
    );
  }, [data]);

  // Préparer les données pour les graphiques (doit être avant les return conditionnels)
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        deltaChart: { labels: [], datasets: [] },
        vegaChart: { labels: [], datasets: [] },
      };
    }
    // Réduire le nombre de labels pour améliorer la lisibilité (afficher toutes les 5 minutes)
    const labelInterval = Math.max(1, Math.floor(data.length / 20));
    const labels = data.map((item, index) => {
      const time = formatDateTime(item.timestamp);
      // Afficher le label seulement toutes les X entrées pour éviter la surcharge
      if (index % labelInterval === 0 || index === data.length - 1) {
        return time.time;
      }
      return "";
    });

    return {
      deltaChart: {
        labels,
        datasets: [
          {
            label: "Direct Delta Flow",
            data: data.map((item) => parseNumber(item.dir_delta_flow)),
            color: "info",
          },
          {
            label: "OTM Direct Delta Flow",
            data: data.map((item) => parseNumber(item.otm_dir_delta_flow)),
            color: "success",
          },
          {
            label: "Total Delta Flow",
            data: data.map((item) => parseNumber(item.total_delta_flow)),
            color: "warning",
          },
        ],
      },
      vegaChart: {
        labels,
        datasets: [
          {
            label: "Direct Vega Flow",
            data: data.map((item) => parseNumber(item.dir_vega_flow)),
            color: "error",
          },
          {
            label: "OTM Direct Vega Flow",
            data: data.map((item) => parseNumber(item.otm_dir_vega_flow)),
            color: "warning",
          },
          {
            label: "Total Vega Flow",
            data: data.map((item) => parseNumber(item.total_vega_flow)),
            color: "dark",
          },
        ],
      },
    };
  }, [data]);

  // Dernière entrée
  const latest = data && data.length > 0 ? data[data.length - 1] : null;

  if (!ticker) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Veuillez sélectionner un ticker pour voir le Greek Flow.
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

  if (data.length === 0) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Aucune donnée disponible pour ce ticker.
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  const getFlowColor = (value) => {
    const num = parseNumber(value);
    if (num > 0) return "success";
    if (num < 0) return "error";
    return "default";
  };

  const getFlowIcon = (value) => {
    const num = parseNumber(value);
    if (num > 0) return "trending_up";
    if (num < 0) return "trending_down";
    return "remove";
  };

  return (
    <MDBox>
      <Card sx={{ mb: 3 }}>
        <MDBox p={3}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h6">
              Greek Flow - {ticker}
            </MDTypography>
            <Tooltip title="Flux des grecs (delta, vega) au fil du temps. Direct Flow = flux direct, OTM = Out of The Money, Total = flux total.">
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </MDBox>

          {/* Cartes de résumé */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <MiniStatisticsCard
                title={{ text: "Dernier Delta Flow" }}
                count={formatNumber(latest?.dir_delta_flow || 0)}
                icon={{ color: getFlowColor(latest?.dir_delta_flow), component: getFlowIcon(latest?.dir_delta_flow) }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MiniStatisticsCard
                title={{ text: "Dernier Vega Flow" }}
                count={formatNumber(latest?.dir_vega_flow || 0)}
                icon={{ color: getFlowColor(latest?.dir_vega_flow), component: getFlowIcon(latest?.dir_vega_flow) }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MiniStatisticsCard
                title={{ text: "Total Transactions" }}
                count={formatNumber(totals.totalTransactions)}
                icon={{ color: "info", component: "swap_horiz" }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MiniStatisticsCard
                title={{ text: "Total Volume" }}
                count={formatNumber(totals.totalVolume)}
                icon={{ color: "success", component: "bar_chart" }}
              />
            </Grid>
          </Grid>

          {/* Graphiques */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={6}>
              <DefaultLineChart
                icon={{ component: "insights", color: "info" }}
                title="Delta Flow Over Time"
                description="Flux Delta au fil du temps"
                height="25rem"
                chart={chartData.deltaChart}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DefaultLineChart
                icon={{ component: "insights", color: "error" }}
                title="Vega Flow Over Time"
                description="Flux Vega au fil du temps"
                height="25rem"
                chart={chartData.vegaChart}
              />
            </Grid>
          </Grid>
        </MDBox>
      </Card>

      {/* Tableau détaillé */}
      <Card>
        <MDBox p={3}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <MDTypography variant="h6" fontWeight="bold">
              Détails par Timestamp
            </MDTypography>
            {data.length > 50 && (
              <MDTypography variant="caption" color="text.secondary">
                Affichage des 50 dernières entrées sur {data.length} totales
              </MDTypography>
            )}
          </MDBox>
          <TableContainer sx={{ maxHeight: "600px", overflow: "auto" }}>
            <Table stickyHeader>
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="12%" align="left">Timestamp</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">Transactions</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">Volume</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Dir Delta Flow</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Dir Vega Flow</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">OTM Dir Delta</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">OTM Dir Vega</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">OTM Total Delta</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">OTM Total Vega</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">Total Delta Flow</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">Total Vega Flow</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.slice(-50).map((item, index) => {
                  const time = formatDateTime(item.timestamp);
                  const dirDeltaFlow = parseNumber(item.dir_delta_flow);
                  const dirVegaFlow = parseNumber(item.dir_vega_flow);
                  const totalDeltaFlow = parseNumber(item.total_delta_flow);
                  const totalVegaFlow = parseNumber(item.total_vega_flow);

                  return (
                    <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                      <DataTableBodyCell align="left">
                        <MDBox>
                          <MDTypography variant="caption" color="text.secondary" display="block" fontWeight="medium">
                            {time.date}
                          </MDTypography>
                          <MDTypography variant="caption" color="text.secondary">
                            {time.time}
                          </MDTypography>
                        </MDBox>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium">
                          {parseInt(item.transactions || 0).toLocaleString()}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium">
                          {parseInt(item.volume || 0).toLocaleString()}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <Chip
                          label={formatNumber(item.dir_delta_flow)}
                          color={getFlowColor(item.dir_delta_flow)}
                          size="small"
                          sx={{ 
                            height: "auto", 
                            minWidth: 70,
                            "& .MuiChip-label": { 
                              py: 0.5, 
                              lineHeight: 1.5,
                              fontWeight: "medium",
                              fontSize: "0.75rem"
                            } 
                          }}
                        />
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <Chip
                          label={formatNumber(item.dir_vega_flow)}
                          color={getFlowColor(item.dir_vega_flow)}
                          size="small"
                          sx={{ 
                            height: "auto", 
                            minWidth: 70,
                            "& .MuiChip-label": { 
                              py: 0.5, 
                              lineHeight: 1.5,
                              fontWeight: "medium",
                              fontSize: "0.75rem"
                            } 
                          }}
                        />
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary" fontWeight="medium">
                          {formatNumber(item.otm_dir_delta_flow)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary" fontWeight="medium">
                          {formatNumber(item.otm_dir_vega_flow)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary" fontWeight="medium">
                          {formatNumber(item.otm_total_delta_flow)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary" fontWeight="medium">
                          {formatNumber(item.otm_total_vega_flow)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography 
                          variant="body2" 
                          fontWeight="bold" 
                          color={totalDeltaFlow >= 0 ? "success.main" : "error.main"}
                        >
                          {formatNumber(item.total_delta_flow)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography 
                          variant="body2" 
                          fontWeight="bold" 
                          color={totalVegaFlow >= 0 ? "success.main" : "error.main"}
                        >
                          {formatNumber(item.total_vega_flow)}
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

export default GreekFlow;

