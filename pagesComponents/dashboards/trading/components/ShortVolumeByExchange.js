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

function ShortVolumeByExchange({ data = [], loading = false, ticker = "" }) {
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

  const formatPercentage = (shortVol, totalVol) => {
    const short = parseNumber(shortVol);
    const total = parseNumber(totalVol);
    if (total === 0) return "0%";
    return `${((short / total) * 100).toFixed(2)}%`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", { 
        year: "numeric", 
        month: "short", 
        day: "numeric"
      });
    } catch {
      return dateString;
    }
  };

  const getExchangeColor = (exchange) => {
    if (!exchange) return "default";
    const exch = exchange.toLowerCase();
    if (exch.includes("nyse")) return "primary";
    if (exch.includes("nasdaq")) return "info";
    if (exch.includes("amex")) return "success";
    return "default";
  };

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Short Volume by Exchange
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
            Short Volume by Exchange {ticker ? `(${ticker})` : ""} ({data.length} entrées)
          </MDTypography>
          <Tooltip title="Volume de short décomposé par exchange, permettant d'analyser où la vente à découvert est la plus concentrée">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucune donnée de short volume par exchange disponible. Veuillez rechercher un ticker.
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="15%" align="left">Date</DataTableHeadCell>
                  <DataTableHeadCell width="20%" align="left">Exchange</DataTableHeadCell>
                  <DataTableHeadCell width="20%" align="left">Market Center</DataTableHeadCell>
                  <DataTableHeadCell width="20%" align="right">Short Volume</DataTableHeadCell>
                  <DataTableHeadCell width="20%" align="right">Total Volume</DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="right">Short %</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.map((item, index) => {
                  const shortVolume = parseNumber(item.short_volume);
                  const totalVolume = parseNumber(item.total_volume);

                  return (
                    <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="body2" fontWeight="medium">
                          {formatDate(item.date)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <Chip
                          label={item.exchange_name || "N/A"}
                          color={getExchangeColor(item.exchange_name)}
                          size="small"
                        />
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="body2" color="text.secondary">
                          {item.market_center || "N/A"}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="error.main">
                          {formatNumber(shortVolume)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="info.main">
                          {formatNumber(totalVolume)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium" color="warning.main">
                          {formatPercentage(shortVolume, totalVolume)}
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

export default ShortVolumeByExchange;


