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
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

function OptionContractHistoric({ data = [], loading = false, contractId = "" }) {
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
      return date.toLocaleDateString("fr-FR", { 
        year: "numeric", 
        month: "short", 
        day: "numeric",
        weekday: "short"
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Historic Data
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
            Historic Data {contractId ? `(${contractId})` : ""} ({data.length})
          </MDTypography>
          <Tooltip title="Données historiques par jour de trading pour le contrat sélectionné">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucune donnée historique disponible. Veuillez entrer un Contract ID.
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="12%" align="left">Date</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Open</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">High</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Low</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Close</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Avg Price</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Volume</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">OI</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Premium</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">IV</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.map((item, index) => {
                  const openPrice = parseNumber(item.open_price);
                  const highPrice = parseNumber(item.high_price);
                  const lowPrice = parseNumber(item.low_price);
                  const lastPrice = parseNumber(item.last_price);
                  const avgPrice = parseNumber(item.avg_price);
                  const volume = parseNumber(item.volume);
                  const openInterest = parseNumber(item.open_interest);
                  const totalPremium = parseNumber(item.total_premium);
                  const impliedVol = parseNumber(item.implied_volatility);

                  return (
                    <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="body2" fontWeight="medium">
                          {formatDate(item.date)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2">${openPrice.toFixed(2)}</MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="success.main">
                          ${highPrice.toFixed(2)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="error.main">
                          ${lowPrice.toFixed(2)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium">
                          ${lastPrice.toFixed(2)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary">
                          ${avgPrice.toFixed(2)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium" color="primary">
                          {formatNumber(volume)}
                        </MDTypography>
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

export default OptionContractHistoric;

