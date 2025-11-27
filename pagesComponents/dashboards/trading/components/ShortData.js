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

function ShortData({ data = [], loading = false, ticker = "" }) {
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

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Short Data
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
            Short Data {ticker ? `(${ticker})` : ""} ({data.length})
          </MDTypography>
          <Tooltip title="Données de short incluant rebate rate et short shares available">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucune donnée de short disponible. Veuillez rechercher un ticker.
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="15%" align="left">Timestamp</DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="left">Symbol</DataTableHeadCell>
                  <DataTableHeadCell width="25%" align="left">Company Name</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">Rebate Rate %</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">Fee Rate %</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">Short Shares Available</DataTableHeadCell>
                  <DataTableHeadCell width="9%" align="left">Currency</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.map((item, index) => {
                  const rebateRate = parseNumber(item.rebate_rate);
                  const feeRate = parseNumber(item.fee_rate);
                  const shortShares = parseNumber(item.short_shares_available);

                  return (
                    <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="caption" color="text.secondary">
                          {formatDate(item.timestamp)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="button" fontWeight="bold" color="primary">
                          {item.symbol || "N/A"}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="body2">
                          {item.name || "N/A"}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium" color="success.main">
                          {rebateRate > 0 ? `${rebateRate.toFixed(2)}%` : "N/A"}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="error.main">
                          {feeRate > 0 ? `${feeRate.toFixed(2)}%` : "N/A"}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium" color="primary">
                          {formatNumber(shortShares)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <Chip label={item.currency || "N/A"} size="small" />
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

export default ShortData;


