import { useState, useEffect } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import unusualWhalesClient from "/lib/unusual-whales/client";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

function OIChangeTicker({ ticker = "", date = "" }) {
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
        
        const response = await unusualWhalesClient.getStockOIChange(ticker, params);
        const extracted = Array.isArray(response) ? response : (response?.data || []);
        setData(extracted);
      } catch (err) {
        console.error("Error loading OI change:", err);
        setError(err.message || "Erreur lors du chargement");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ticker, date]);

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

  const formatPercentage = (value) => {
    const num = parseNumber(value);
    if (num === 0) return "0%";
    const sign = num >= 0 ? "+" : "";
    return `${sign}${(num * 100).toFixed(2)}%`;
  };

  const getChangeColor = (change) => {
    const num = parseNumber(change);
    if (num > 0) return "success";
    if (num < 0) return "error";
    return "default";
  };

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
    <Card>
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDTypography variant="h6">
            OI Change ({ticker}) ({data.length})
          </MDTypography>
          <Tooltip title="Changements d'open interest des contrats d'options ordonnés par changement absolu">
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
                  <DataTableHeadCell width="15%" align="left">Option Symbol</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Current OI</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Last OI</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">OI Change</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">OI Change %</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Volume</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Trades</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Avg Price</DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="left">Date</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.slice(0, 100).map((item, index) => {
                  const currOI = parseNumber(item.curr_oi);
                  const lastOI = parseNumber(item.last_oi);
                  const oiChange = parseNumber(item.oi_change);
                  const oiDiff = parseNumber(item.oi_diff_plain);
                  const volume = parseNumber(item.volume);
                  const trades = parseNumber(item.trades);
                  const avgPrice = parseNumber(item.avg_price);

                  return (
                    <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="caption" fontWeight="medium" color="text.secondary">
                          {item.option_symbol || "N/A"}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="primary">
                          {formatNumber(currOI)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary">
                          {formatNumber(lastOI)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDBox display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                          {getChangeColor(oiDiff) === "success" && <TrendingUpIcon fontSize="small" color="success" />}
                          {getChangeColor(oiDiff) === "error" && <TrendingDownIcon fontSize="small" color="error" />}
                          <MDTypography variant="body2" fontWeight="medium" color={getChangeColor(oiDiff)}>
                            {formatNumber(oiDiff)}
                          </MDTypography>
                        </MDBox>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <Chip
                          label={formatPercentage(oiChange)}
                          color={getChangeColor(oiChange)}
                          size="small"
                        />
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="info.main">
                          {formatNumber(volume)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary">
                          {formatNumber(trades)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary">
                          ${avgPrice.toFixed(2)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="caption" color="text.secondary">
                          {item.curr_date || "N/A"}
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
  );
}

export default OIChangeTicker;


