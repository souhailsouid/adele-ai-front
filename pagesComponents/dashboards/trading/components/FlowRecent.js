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
import unusualWhalesClient from "/lib/unusual-whales/client";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";
import { formatDateTime } from "./utils";

function FlowRecent({ ticker = "" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticker) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await unusualWhalesClient.getStockFlowRecent(ticker);
        const extracted = Array.isArray(response) ? response : (response?.data || []);
        setData(extracted);
      } catch (err) {
        console.error("Error loading flow recent:", err);
        setError(err.message || "Erreur lors du chargement");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ticker]);

  const formatNumber = (num) => {
    if (!num || num === 0) return "-";
    if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const parseNumber = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const getCallPutColor = (optionType) => {
    if (!optionType) return "default";
    return optionType.toLowerCase() === "call" ? "success" : "error";
  };

  const getCallPutLabel = (optionType) => {
    if (!optionType) return "N/A";
    return optionType.toUpperCase();
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
            Recent Flows ({ticker}) ({data.length})
          </MDTypography>
          <Tooltip title="Dernières transactions d'options pour le ticker donné, optionnellement filtrées par min_premium et side">
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
                  <DataTableHeadCell width="12%" align="left">Date/Heure</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="left">Option Chain</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="center">Type</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">Strike</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="left">Expiry</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">Price</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">Premium</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">Volume</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">OI</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">Underlying</DataTableHeadCell>
                  <DataTableHeadCell width="14%" align="left">Tags</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.slice(0, 100).map((item, index) => {
                  const premium = parseNumber(item.premium);
                  const volume = parseNumber(item.volume);
                  const openInterest = parseNumber(item.open_interest);
                  const underlyingPrice = parseNumber(item.underlying_price);
                  const price = parseNumber(item.price);

                  return (
                    <TableRow key={item.id || index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="caption" color="text.secondary">
                          {formatDate(item.executed_at)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="caption" fontWeight="medium" color="text.secondary">
                          {item.option_chain_id || "N/A"}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        <Chip
                          label={getCallPutLabel(item.option_type)}
                          color={getCallPutColor(item.option_type)}
                          size="small"
                        />
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="bold" color="primary">
                          ${item.strike || "N/A"}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="caption" color="text.secondary">
                          {item.expiry || "N/A"}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="primary">
                          ${price.toFixed(2)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium" color="success.main">
                          {formatNumber(premium)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="info.main">
                          {formatNumber(volume)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary">
                          {formatNumber(openInterest)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium" color="primary">
                          ${underlyingPrice.toFixed(2)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        {item.tags && Array.isArray(item.tags) && item.tags.length > 0 ? (
                          <MDBox display="flex" gap={0.5} flexWrap="wrap">
                            {item.tags.slice(0, 2).map((tag, idx) => (
                              <Chip
                                key={idx}
                                label={tag}
                                size="small"
                                color={tag.includes("bullish") ? "success" : tag.includes("bearish") ? "error" : "default"}
                                sx={{ height: 20, fontSize: "0.65rem" }}
                              />
                            ))}
                            {item.tags.length > 2 && (
                              <MDTypography variant="caption" color="text.secondary">
                                +{item.tags.length - 2}
                              </MDTypography>
                            )}
                          </MDBox>
                        ) : (
                          <MDTypography variant="caption" color="text.secondary">
                            -
                          </MDTypography>
                        )}
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

export default FlowRecent;

