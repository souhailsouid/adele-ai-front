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
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import unusualWhalesClient from "/lib/unusual-whales/client";
import DefaultLineChart from "/examples/Charts/LineCharts/DefaultLineChart";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

function OHLCTicker({ ticker = "", date = "", endDate = "", timeframe = "1Y" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [candleSize, setCandleSize] = useState("5m");

  useEffect(() => {
    if (!ticker) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = { timeframe };
        if (date) params.date = date;
        if (endDate) params.end_date = endDate;
        
        const response = await unusualWhalesClient.getStockOHLC(ticker, candleSize, params);
        const extracted = Array.isArray(response) ? response : (response?.data || []);
        // Trier par start_time
        extracted.sort((a, b) => {
          const timeA = new Date(a.start_time || a.end_time || 0);
          const timeB = new Date(b.start_time || b.end_time || 0);
          return timeA - timeB;
        });
        setData(extracted);
      } catch (err) {
        console.error("Error loading OHLC:", err);
        setError(err.message || "Erreur lors du chargement");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ticker, date, endDate, timeframe, candleSize]);

  const parseNumber = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("fr-FR", { 
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

  const getMarketTimeColor = (marketTime) => {
    if (!marketTime) return "default";
    if (marketTime === "pr") return "info";
    if (marketTime === "r") return "success";
    if (marketTime === "po") return "warning";
    return "default";
  };

  const getMarketTimeLabel = (marketTime) => {
    if (!marketTime) return "N/A";
    if (marketTime === "pr") return "Premarket";
    if (marketTime === "r") return "Regular";
    if (marketTime === "po") return "Postmarket";
    return marketTime;
  };

  // Préparer les données pour le graphique
  const chartData = useMemo(() => {
    const labels = data.map((item) => {
      const time = item.start_time || item.end_time || "";
      return formatDateTime(time);
    });
    const closes = data.map((item) => parseNumber(item.close));
    const highs = data.map((item) => parseNumber(item.high));
    const lows = data.map((item) => parseNumber(item.low));

    return {
      labels,
      datasets: [
        {
          label: "Close",
          color: "info",
          data: closes,
        },
        {
          label: "High",
          color: "success",
          data: highs,
        },
        {
          label: "Low",
          color: "error",
          data: lows,
        },
      ],
    };
  }, [data]);

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
      {/* Filtre Candle Size */}
      <Card sx={{ mb: 3 }}>
        <MDBox p={2}>
          <FormControl variant="standard" fullWidth>
            <InputLabel>Candle Size</InputLabel>
            <Select
              value={candleSize}
              onChange={(e) => setCandleSize(e.target.value)}
              label="Candle Size"
            >
              <MenuItem value="1m">1 Minute</MenuItem>
              <MenuItem value="5m">5 Minutes</MenuItem>
              <MenuItem value="10m">10 Minutes</MenuItem>
              <MenuItem value="15m">15 Minutes</MenuItem>
              <MenuItem value="30m">30 Minutes</MenuItem>
              <MenuItem value="1h">1 Hour</MenuItem>
              <MenuItem value="4h">4 Hours</MenuItem>
              <MenuItem value="1d">1 Day</MenuItem>
            </Select>
          </FormControl>
        </MDBox>
      </Card>

      {data.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <MDBox p={3}>
            <DefaultLineChart
              icon={{ color: "info", component: "show_chart" }}
              title={`${ticker} - OHLC (${candleSize})`}
              description="Prix Open, High, Low, Close"
              chart={chartData}
            />
          </MDBox>
        </Card>
      )}

      <Card>
        <MDBox p={3}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h6">
              OHLC ({ticker}) ({data.length} candles)
            </MDTypography>
            <Tooltip title="Données de bougies OHLC (Open High Low Close) pour le ticker donné. Limité à 2500 éléments.">
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
                    <DataTableHeadCell width="15%" align="left">Start Time</DataTableHeadCell>
                    <DataTableHeadCell width="15%" align="left">End Time</DataTableHeadCell>
                    <DataTableHeadCell width="10%" align="right">Open</DataTableHeadCell>
                    <DataTableHeadCell width="10%" align="right">High</DataTableHeadCell>
                    <DataTableHeadCell width="10%" align="right">Low</DataTableHeadCell>
                    <DataTableHeadCell width="10%" align="right">Close</DataTableHeadCell>
                    <DataTableHeadCell width="10%" align="right">Volume</DataTableHeadCell>
                    <DataTableHeadCell width="10%" align="right">Total Volume</DataTableHeadCell>
                    <DataTableHeadCell width="10%" align="center">Market</DataTableHeadCell>
                  </TableRow>
                </MDBox>
                <TableBody>
                  {data.slice(0, 100).map((item, index) => {
                    const open = parseNumber(item.open);
                    const high = parseNumber(item.high);
                    const low = parseNumber(item.low);
                    const close = parseNumber(item.close);
                    const volume = parseNumber(item.volume);
                    const totalVolume = parseNumber(item.total_volume);

                    return (
                      <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                        <DataTableBodyCell align="left">
                          <MDTypography variant="caption" color="text.secondary">
                            {formatDateTime(item.start_time)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="left">
                          <MDTypography variant="caption" color="text.secondary">
                            {formatDateTime(item.end_time)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" color="text.secondary">
                            ${open.toFixed(2)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" color="success.main">
                            ${high.toFixed(2)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" color="error.main">
                            ${low.toFixed(2)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" fontWeight="medium" color="primary">
                            ${close.toFixed(2)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" color="info.main">
                            {volume.toLocaleString()}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" color="text.secondary">
                            {totalVolume.toLocaleString()}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="center">
                          <Chip
                            label={getMarketTimeLabel(item.market_time)}
                            color={getMarketTimeColor(item.market_time)}
                            size="small"
                          />
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

export default OHLCTicker;


