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
import unusualWhalesClient from "/lib/unusual-whales/client";
import DefaultLineChart from "/examples/Charts/LineCharts/DefaultLineChart";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

function NetPremiumTicks({ ticker = "", date = "" }) {
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
        
        const response = await unusualWhalesClient.getStockNetPremTicks(ticker, params);
        const extracted = Array.isArray(response) ? response : (response?.data || []);
        setData(extracted);
      } catch (err) {
        console.error("Error loading net premium ticks:", err);
        setError(err.message || "Erreur lors du chargement");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ticker, date]);

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

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("fr-FR", { 
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch {
      return dateString;
    }
  };

  // Calculer les valeurs cumulatives selon la documentation
  const cumulativeData = useMemo(() => {
    const fieldsToSum = ["net_call_premium", "net_call_volume", "net_put_premium", "net_put_volume"];
    let result = [];
    
    data.forEach((e, idx) => {
      const item = { ...e };
      fieldsToSum.forEach((field) => {
        item[field] = parseNumber(e[field]);
        if (idx !== 0) {
          item[field] = item[field] + result[idx - 1][field];
        }
      });
      result.push(item);
    });
    
    return result;
  }, [data]);

  // Préparer les données pour les graphiques
  const chartData = useMemo(() => {
    const labels = cumulativeData.map((item) => formatTime(item.tape_time));
    const netCallPremium = cumulativeData.map((item) => parseNumber(item.net_call_premium));
    const netPutPremium = cumulativeData.map((item) => parseNumber(item.net_put_premium));
    const netPremium = cumulativeData.map((item) => {
      return parseNumber(item.net_call_premium) + parseNumber(item.net_put_premium);
    });

    return {
      netPremiumChart: {
        labels,
        datasets: [
          {
            label: "Net Call Premium",
            color: "success",
            data: netCallPremium,
          },
          {
            label: "Net Put Premium",
            color: "error",
            data: netPutPremium,
          },
          {
            label: "Net Premium",
            color: "info",
            data: netPremium,
          },
        ],
      },
    };
  }, [cumulativeData]);

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <LinearProgress />
        </MDBox>
      </Card>
    );
  }

  return (
    <MDBox>
      {cumulativeData.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <MDBox p={3}>
            <DefaultLineChart
              icon={{ color: "info", component: "show_chart" }}
              title={`${ticker} - Net Premium Ticks (Cumulative)`}
              description="Net premium cumulatif par minute de trading"
              chart={chartData.netPremiumChart}
            />
          </MDBox>
        </Card>
      )}
      <Card>
        <MDBox p={3}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h6">
              Net Premium Ticks ({ticker}) ({data.length} ticks)
            </MDTypography>
            <Tooltip title="Net premium pour chaque minute de trading. Les valeurs sont cumulatives pour construire un graphique quotidien.">
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </MDBox>
          {error && (
            <MDTypography variant="body2" color="error" mb={2}>
              {error}
            </MDTypography>
          )}
          {data.length === 0 ? (
            <MDTypography variant="body2" color="text">
              Aucune donnée disponible
            </MDTypography>
          ) : (
            <TableContainer>
              <Table size="small">
                <MDBox component="thead">
                  <TableRow>
                    <DataTableHeadCell width="12%" align="left">Time</DataTableHeadCell>
                    <DataTableHeadCell width="12%" align="right">Net Call Premium</DataTableHeadCell>
                    <DataTableHeadCell width="12%" align="right">Net Put Premium</DataTableHeadCell>
                    <DataTableHeadCell width="12%" align="right">Net Premium</DataTableHeadCell>
                    <DataTableHeadCell width="12%" align="right">Net Call Volume</DataTableHeadCell>
                    <DataTableHeadCell width="12%" align="right">Net Put Volume</DataTableHeadCell>
                    <DataTableHeadCell width="12%" align="right">Net Delta</DataTableHeadCell>
                    <DataTableHeadCell width="16%" align="left">Date</DataTableHeadCell>
                  </TableRow>
                </MDBox>
                <TableBody>
                  {cumulativeData.slice(0, 100).map((item, index) => {
                    const netCallPrem = parseNumber(item.net_call_premium);
                    const netPutPrem = parseNumber(item.net_put_premium);
                    const netPrem = netCallPrem + netPutPrem;
                    const netCallVol = parseNumber(item.net_call_volume);
                    const netPutVol = parseNumber(item.net_put_volume);
                    const netDelta = parseNumber(item.net_delta);

                    return (
                      <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                        <DataTableBodyCell align="left">
                          <MDTypography variant="caption" color="text.secondary">
                            {formatTime(item.tape_time)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" color="success.main">
                            {formatNumber(netCallPrem)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" color="error.main">
                            {formatNumber(netPutPrem)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" fontWeight="medium" color={netPrem >= 0 ? "success.main" : "error.main"}>
                            {formatNumber(netPrem)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" color="success.main">
                            {formatNumber(netCallVol)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" color="error.main">
                            {formatNumber(netPutVol)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" color="info.main">
                            {formatNumber(netDelta)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="left">
                          <MDTypography variant="caption" color="text.secondary">
                            {item.date || "N/A"}
                          </MDTypography>
                        </DataTableBodyCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </MDBox>
      </Card>
    </MDBox>
  );
}

export default NetPremiumTicks;

