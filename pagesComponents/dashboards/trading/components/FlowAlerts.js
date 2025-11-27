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
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";
import { formatDateTime } from "./utils";
function FlowAlerts({ data = [], loading = false }) {
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

  const getCallPutColor = (isCall) => {
    return isCall ? "success" : "error";
  };

  const getCallPutLabel = (isCall) => {
    return isCall ? "CALL" : "PUT";
  };

  const getSideColor = (isAsk) => {
    return isAsk ? "error" : "success";
  };

  const getSideLabel = (isAsk) => {
    return isAsk ? "ASK" : "BID";
  };

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Flow Alerts (Options)
          </MDTypography>
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
            Flow Alerts (Options) ({data.length})
          </MDTypography>
          <Tooltip title="Alertes de flux d'options importantes détectées par Unusual Whales">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucune alerte de flux disponible
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="10%" align="left">
                    Date/Heure
                  </DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="left">
                    Symbole
                  </DataTableHeadCell>
                  <DataTableHeadCell width="18%" align="left">
                    Contrat
                  </DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="center">
                    Type
                  </DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="center">
                    Bid/Ask
                  </DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">
                    Premium
                  </DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">
                    Volume
                  </DataTableHeadCell>
                  <DataTableHeadCell width="11%" align="right">
                    OI
                  </DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.slice(0, 20).map((alert, index) => {
                  const dateTime = formatDateTime(alert.created_at || alert.timestamp || alert.tape_time);
                  const isCall = alert.type === "call" || alert.type === "Call";
                  const totalPremium = parseNumber(alert.total_premium || alert.premium || 0);
                  const volume = parseNumber(alert.volume || 0);
                  const openInterest = parseNumber(alert.open_interest || 0);
                  const strike = parseNumber(alert.strike || 0);
                  const underlyingPrice = parseNumber(alert.underlying_price || alert.price || 0);

                  return (
                    <TableRow
                      key={alert.id || index}
                      sx={{
                        "&:hover": { backgroundColor: "action.hover" },
                      }}
                    >
                      <DataTableBodyCell align="left">
                        <MDBox>
                          <MDTypography variant="caption" color="text.secondary" display="block">
                            {dateTime.date}
                          </MDTypography>
                          <MDTypography variant="caption" color="text.secondary">
                            {dateTime.time}
                          </MDTypography>
                        </MDBox>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDBox>
                          <MDTypography variant="button" fontWeight="bold" color="primary">
                            {alert.ticker || "N/A"}
                          </MDTypography>
                          {alert.sector && (
                            <MDTypography variant="caption" color="text.secondary" display="block">
                              {alert.sector}
                            </MDTypography>
                          )}
                        </MDBox>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDBox>
                          <MDTypography variant="caption" color="text.secondary" noWrap>
                            {alert.option_chain || "N/A"}
                          </MDTypography>
                          {strike > 0 && (
                            <MDTypography variant="caption" color="text.secondary" display="block">
                              Strike: ${strike.toFixed(2)} | Exp: {alert.expiry || "N/A"}
                            </MDTypography>
                          )}
                        </MDBox>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        <Chip
                          label={getCallPutLabel(isCall)}
                          color={getCallPutColor(isCall)}
                          size="small"
                        />
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        <MDBox>
                          {alert.bid && alert.ask && (
                            <>
                              <MDTypography variant="caption" color="success.main" display="block">
                                Bid: ${parseNumber(alert.bid).toFixed(2)}
                              </MDTypography>
                              <MDTypography variant="caption" color="error.main">
                                Ask: ${parseNumber(alert.ask).toFixed(2)}
                              </MDTypography>
                            </>
                          )}
                          {alert.total_bid_side_prem && alert.total_ask_side_prem && (
                            <>
                              <MDTypography variant="caption" color="text.secondary" display="block" mt={0.5}>
                                Bid Prem: {formatNumber(parseNumber(alert.total_bid_side_prem))}
                              </MDTypography>
                              <MDTypography variant="caption" color="text.secondary">
                                Ask Prem: {formatNumber(parseNumber(alert.total_ask_side_prem))}
                              </MDTypography>
                            </>
                          )}
                        </MDBox>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDBox>
                          <MDTypography variant="body2" fontWeight="medium" color="primary">
                            {formatNumber(totalPremium)}
                          </MDTypography>
                          {underlyingPrice > 0 && (
                            <MDTypography variant="caption" color="text.secondary" display="block">
                              Underlying: ${underlyingPrice.toFixed(2)}
                            </MDTypography>
                          )}
                        </MDBox>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDBox>
                          <MDTypography variant="body2" fontWeight="medium">
                            {formatNumber(volume)}
                          </MDTypography>
                          {alert.volume_oi_ratio && (
                            <MDTypography variant="caption" color="text.secondary" display="block">
                              V/OI: {parseNumber(alert.volume_oi_ratio).toFixed(2)}
                            </MDTypography>
                          )}
                        </MDBox>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDBox>
                          <MDTypography variant="body2" fontWeight="medium">
                            {formatNumber(openInterest)}
                          </MDTypography>
                          {alert.trade_count && (
                            <MDTypography variant="caption" color="text.secondary" display="block">
                              {alert.trade_count} trades
                            </MDTypography>
                          )}
                        </MDBox>
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

export default FlowAlerts;

