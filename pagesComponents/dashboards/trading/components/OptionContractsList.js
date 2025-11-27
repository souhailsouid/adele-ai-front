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

function OptionContractsList({ data = [], loading = false, ticker = "" }) {
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return dateString;
    }
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
            Option Contracts
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
            Option Contracts {ticker ? `(${ticker})` : ""} ({data.length})
          </MDTypography>
          <Tooltip title="Tous les contrats d'options disponibles pour le ticker sélectionné">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucun contrat d&apos;option disponible. Veuillez rechercher un ticker.
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="15%" align="left">Contrat</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="center">Type</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Prix</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Volume</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">OI</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Premium</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">IV</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">Ask Vol</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">Bid Vol</DataTableHeadCell>
                  <DataTableHeadCell width="3%" align="center">NBBO</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.slice(0, 100).map((contract, index) => {
                  const volume = parseNumber(contract.volume);
                  const openInterest = parseNumber(contract.open_interest);
                  const totalPremium = parseNumber(contract.total_premium);
                  const lastPrice = parseNumber(contract.last_price);
                  const avgPrice = parseNumber(contract.avg_price);
                  const impliedVol = parseNumber(contract.implied_volatility);
                  const askVolume = parseNumber(contract.ask_volume);
                  const bidVolume = parseNumber(contract.bid_volume);
                  const nbboAsk = parseNumber(contract.nbbo_ask);
                  const nbboBid = parseNumber(contract.nbbo_bid);

                  // Extraire le type (call/put) du symbol
                  const optionType = contract.option_symbol?.includes("C") ? "call" : contract.option_symbol?.includes("P") ? "put" : null;

                  return (
                    <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="caption" fontWeight="bold" color="primary" noWrap>
                          {contract.option_symbol || "N/A"}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        {optionType && (
                          <Chip label={optionType.toUpperCase()} color={getCallPutColor(optionType)} size="small" />
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium">
                          ${lastPrice.toFixed(2)}
                        </MDTypography>
                        <MDTypography variant="caption" color="text.secondary" display="block">
                          Avg: ${avgPrice.toFixed(2)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2">{formatNumber(volume)}</MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2">{formatNumber(openInterest)}</MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium" color="primary">
                          {formatNumber(totalPremium)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2">{(impliedVol * 100).toFixed(1)}%</MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="error.main">{formatNumber(askVolume)}</MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="success.main">{formatNumber(bidVolume)}</MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        <MDBox>
                          <MDTypography variant="caption" color="error.main" display="block">
                            A: ${nbboAsk.toFixed(2)}
                          </MDTypography>
                          <MDTypography variant="caption" color="success.main">
                            B: ${nbboBid.toFixed(2)}
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

export default OptionContractsList;

