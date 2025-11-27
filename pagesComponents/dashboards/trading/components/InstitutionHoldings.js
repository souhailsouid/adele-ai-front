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

function InstitutionHoldings({ data = [], loading = false, institutionName = "" }) {
  const formatNumber = (num) => {
    if (!num || num === 0) return "-";
    const numValue = typeof num === "string" ? parseFloat(num) : num;
    if (isNaN(numValue)) return "-";
    if (numValue >= 1_000_000_000) return `$${(numValue / 1_000_000_000).toFixed(2)}B`;
    if (numValue >= 1_000_000) return `$${(numValue / 1_000_000).toFixed(2)}M`;
    if (numValue >= 1_000) return `$${(numValue / 1_000).toFixed(2)}K`;
    return `$${numValue.toFixed(2)}`;
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

  const formatPercentage = (value) => {
    if (!value && value !== 0) return "-";
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return "-";
    return `${(numValue * 100).toFixed(2)}%`;
  };

  const getSectorColor = (sector) => {
    const colors = {
      "Technology": "info",
      "Healthcare": "error",
      "Financial Services": "warning",
      "Consumer Cyclical": "success",
      "Communication Services": "primary",
      "Industrials": "default",
      "Energy": "error",
      "Consumer Defensive": "success",
      "Basic Materials": "warning",
      "Real Estate": "info",
      "Utilities": "default",
    };
    return colors[sector] || "default";
  };

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Institution Holdings
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
            Holdings: {institutionName} ({data.length})
          </MDTypography>
          <Tooltip title="Holdings détaillés de l'institution. Montre tous les titres détenus avec leurs quantités, valeurs et changements.">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucun holding disponible
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="12%" align="left">Ticker</DataTableHeadCell>
                  <DataTableHeadCell width="18%" align="left">Nom</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Units</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Change</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">Value</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Price</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Avg Price</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">% Total</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="center">Type</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.slice(0, 100).map((holding, index) => {
                  const units = parseNumber(holding.units) || 0;
                  const unitsChange = parseNumber(holding.units_change) || 0;
                  const value = parseNumber(holding.value) || 0;
                  const close = parseNumber(holding.close) || 0;
                  const avgPrice = parseNumber(holding.avg_price) || 0;
                  const percOfTotal = parseNumber(holding.perc_of_total) || 0;
                  const percOfShareValue = parseNumber(holding.perc_of_share_value) || 0;

                  return (
                    <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="button" fontWeight="bold" color="primary">
                          {holding.ticker || "N/A"}
                        </MDTypography>
                        {holding.sector && (
                          <Chip
                            label={holding.sector}
                            size="small"
                            color={getSectorColor(holding.sector)}
                            sx={{ height: 18, fontSize: "0.65rem", mt: 0.5 }}
                          />
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                          {holding.full_name || "N/A"}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium">
                          {formatNumber(units)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDBox display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                          {unitsChange > 0 && <TrendingUpIcon fontSize="small" color="success" />}
                          {unitsChange < 0 && <TrendingDownIcon fontSize="small" color="error" />}
                          <MDTypography
                            variant="body2"
                            fontWeight="bold"
                            color={unitsChange > 0 ? "success.main" : unitsChange < 0 ? "error.main" : "text"}
                          >
                            {unitsChange > 0 ? "+" : ""}{formatNumber(unitsChange)}
                          </MDTypography>
                        </MDBox>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="bold">
                          {formatNumber(value)}
                        </MDTypography>
                        {percOfShareValue > 0 && (
                          <MDTypography variant="caption" color="text.secondary" display="block">
                            {formatPercentage(percOfShareValue)} of share value
                          </MDTypography>
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary">
                          ${close.toFixed(2)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary">
                          ${avgPrice.toFixed(2)}
                        </MDTypography>
                        {holding.first_buy && (
                          <MDTypography variant="caption" color="text.secondary" display="block">
                            First: {formatDate(holding.first_buy)}
                          </MDTypography>
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium">
                          {formatPercentage(percOfTotal)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        <MDBox>
                          <Chip
                            label={holding.security_type || "N/A"}
                            size="small"
                            color={holding.put_call ? (holding.put_call === "call" ? "success" : "error") : "default"}
                            sx={{ height: 20, fontSize: "0.7rem" }}
                          />
                          {holding.put_call && (
                            <MDTypography variant="caption" color="text.secondary" display="block" mt={0.5}>
                              {holding.put_call.toUpperCase()}
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

export default InstitutionHoldings;

