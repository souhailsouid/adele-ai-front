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

function OptionContractsScreener({ data = [], loading = false }) {
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

  const getCallPutColor = (optionSymbol) => {
    if (!optionSymbol) return "default";
    return optionSymbol.includes("C") ? "success" : "error";
  };

  const getCallPutLabel = (optionSymbol) => {
    if (!optionSymbol) return "N/A";
    return optionSymbol.includes("C") ? "CALL" : "PUT";
  };

  const parseOptionSymbol = (optionSymbol) => {
    if (!optionSymbol) return { ticker: "N/A", strike: "N/A", expiry: "N/A", type: "N/A" };
    // Format: TICKERYYMMDDC/PSTRIKE (e.g., TSLA230908C00255000)
    const match = optionSymbol.match(/^([A-Z]+)(\d{6})([CP])(\d+)$/);
    if (match) {
      const [, ticker, dateStr, type, strike] = match;
      const year = "20" + dateStr.substring(0, 2);
      const month = dateStr.substring(2, 4);
      const day = dateStr.substring(4, 6);
      const expiry = `${year}-${month}-${day}`;
      const strikePrice = (parseInt(strike) / 1000).toFixed(2);
      return {
        ticker,
        strike: strikePrice,
        expiry,
        type: type === "C" ? "CALL" : "PUT"
      };
    }
    return { ticker: optionSymbol, strike: "N/A", expiry: "N/A", type: "N/A" };
  };

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Hottest Chains (Option Contracts Screener)
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
            Hottest Chains ({data.length})
          </MDTypography>
          <Tooltip title="Contrats d'options avec volume > 200, filtrés par différents critères">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucun contrat d&apos;option disponible. Utilisez les filtres pour rechercher.
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="12%" align="left">Option Symbol</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="left">Ticker</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="center">Type</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">Strike</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="left">Expiry</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">Stock Price</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">Volume</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">Open Interest</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">Premium</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">Avg Price</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="left">Sector</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.map((contract, index) => {
                  const optionInfo = parseOptionSymbol(contract.option_symbol);
                  const volume = parseNumber(contract.volume);
                  const openInterest = parseNumber(contract.open_interest);
                  const premium = parseNumber(contract.premium);
                  const avgPrice = parseNumber(contract.avg_price);
                  const stockPrice = parseNumber(contract.stock_price);

                  return (
                    <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="caption" fontWeight="medium" color="text.secondary">
                          {contract.option_symbol || "N/A"}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="button" fontWeight="bold" color="primary">
                          {optionInfo.ticker}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        <Chip
                          label={getCallPutLabel(contract.option_symbol)}
                          color={getCallPutColor(contract.option_symbol)}
                          size="small"
                        />
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium">
                          ${optionInfo.strike}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="caption" color="text.secondary">
                          {optionInfo.expiry}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="bold" color="primary">
                          ${stockPrice.toFixed(2)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="primary">
                          {formatNumber(volume)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary">
                          {formatNumber(openInterest)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium" color="success.main">
                          {formatNumber(premium)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary">
                          ${avgPrice.toFixed(4)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        {contract.sector ? (
                          <Chip label={contract.sector} size="small" color="info" />
                        ) : (
                          <MDTypography variant="caption" color="text.secondary">
                            N/A
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

export default OptionContractsScreener;


