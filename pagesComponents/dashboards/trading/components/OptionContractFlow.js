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
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";
import { formatDateTime } from "./utils";

function OptionContractFlow({ data = [], loading = false, contractId = "" }) {
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

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Flow Data
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
            Flow Data {contractId ? `(${contractId})` : ""} ({data.length})
          </MDTypography>
          <Tooltip title="Dernières 50 transactions d'options pour le contrat sélectionné">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucune donnée de flow disponible. Veuillez entrer un Contract ID.
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="12%" align="left">Date/Heure</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="left">Symbole</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="center">Type</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Prix</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Premium</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">Volume</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">OI</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">IV</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">Greeks</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="center">Volumes</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.map((trade, index) => {
                  const dateTime = formatDateTime(trade.executed_at);
                  const price = parseNumber(trade.price);
                  const premium = parseNumber(trade.premium);
                  const volume = parseNumber(trade.volume);
                  const openInterest = parseNumber(trade.open_interest);
                  const impliedVol = parseNumber(trade.implied_volatility);
                  const delta = parseNumber(trade.delta);
                  const gamma = parseNumber(trade.gamma);
                  const theta = parseNumber(trade.theta);
                  const vega = parseNumber(trade.vega);
                  const askVol = parseNumber(trade.ask_vol);
                  const bidVol = parseNumber(trade.bid_vol);
                  const midVol = parseNumber(trade.mid_vol);

                  return (
                    <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="caption" color="text.secondary" display="block">
                          {dateTime.date}
                        </MDTypography>
                        <MDTypography variant="caption" color="text.secondary">
                          {dateTime.time}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="button" fontWeight="bold" color="primary">
                          {trade.underlying_symbol || "N/A"}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        {trade.option_type && (
                          <Chip label={trade.option_type.toUpperCase()} color={getCallPutColor(trade.option_type)} size="small" />
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium">
                          ${price.toFixed(2)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium" color="primary">
                          {formatNumber(premium)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2">{formatNumber(volume)}</MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary">
                          {formatNumber(openInterest)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2">{(impliedVol * 100).toFixed(1)}%</MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDBox>
                          <MDTypography variant="caption" color="text.secondary" display="block">
                            Δ: {delta.toFixed(3)}
                          </MDTypography>
                          <MDTypography variant="caption" color="text.secondary" display="block">
                            Γ: {gamma.toFixed(4)}
                          </MDTypography>
                          <MDTypography variant="caption" color="text.secondary" display="block">
                            Θ: {theta.toFixed(4)}
                          </MDTypography>
                          <MDTypography variant="caption" color="text.secondary">
                            ν: {vega.toFixed(4)}
                          </MDTypography>
                        </MDBox>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        <MDBox>
                          <MDTypography variant="caption" color="error.main" display="block">
                            Ask: {formatNumber(askVol)}
                          </MDTypography>
                          <MDTypography variant="caption" color="success.main" display="block">
                            Bid: {formatNumber(bidVol)}
                          </MDTypography>
                          <MDTypography variant="caption" color="text.secondary">
                            Mid: {formatNumber(midVol)}
                          </MDTypography>
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

export default OptionContractFlow;


