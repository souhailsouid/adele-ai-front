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

function InstitutionActivity({ data = [], loading = false, institutionName = "" }) {
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

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Institution Activity
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
            Activity: {institutionName} ({data.length})
          </MDTypography>
          <Tooltip title="Activité de trading de l'institution. Montre les changements de positions avec les prix d'achat/vente.">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucune activité disponible
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="12%" align="left">Ticker</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Units</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Change</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">Buy Price</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">Sell Price</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">Avg Price</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">Close</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="left">Report Date</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="center">Type</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.slice(0, 100).map((activity, index) => {
                  const units = parseNumber(activity.units) || 0;
                  const unitsChange = parseNumber(activity.units_change) || 0;
                  const buyPrice = parseNumber(activity.buy_price);
                  const sellPrice = parseNumber(activity.sell_price);
                  const avgPrice = parseNumber(activity.avg_price) || 0;
                  const close = parseNumber(activity.close) || 0;
                  const priceOnFiling = parseNumber(activity.price_on_filing) || 0;
                  const priceOnReport = parseNumber(activity.price_on_report) || 0;

                  return (
                    <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="button" fontWeight="bold" color="primary">
                          {activity.ticker || "N/A"}
                        </MDTypography>
                        {activity.security_type && (
                          <MDTypography variant="caption" color="text.secondary" display="block">
                            {activity.security_type}
                          </MDTypography>
                        )}
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
                        {buyPrice > 0 ? (
                          <MDTypography variant="body2" color="success.main" fontWeight="medium">
                            ${buyPrice.toFixed(2)}
                          </MDTypography>
                        ) : (
                          <MDTypography variant="caption" color="text.secondary">-</MDTypography>
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        {sellPrice > 0 ? (
                          <MDTypography variant="body2" color="error.main" fontWeight="medium">
                            ${sellPrice.toFixed(2)}
                          </MDTypography>
                        ) : (
                          <MDTypography variant="caption" color="text.secondary">-</MDTypography>
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary">
                          ${avgPrice.toFixed(2)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium">
                          ${close.toFixed(2)}
                        </MDTypography>
                        {priceOnFiling > 0 && (
                          <MDTypography variant="caption" color="text.secondary" display="block">
                            Filing: ${priceOnFiling.toFixed(2)}
                          </MDTypography>
                        )}
                        {priceOnReport > 0 && (
                          <MDTypography variant="caption" color="text.secondary" display="block">
                            Report: ${priceOnReport.toFixed(2)}
                          </MDTypography>
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="caption" color="text.secondary">
                          {formatDate(activity.report_date)}
                        </MDTypography>
                        {activity.filing_date && (
                          <MDTypography variant="caption" color="text.secondary" display="block">
                            Filing: {formatDate(activity.filing_date)}
                          </MDTypography>
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        {activity.put_call ? (
                          <Chip
                            label={activity.put_call.toUpperCase()}
                            size="small"
                            color={activity.put_call === "call" ? "success" : "error"}
                            sx={{ height: 20, fontSize: "0.7rem" }}
                          />
                        ) : (
                          <MDTypography variant="caption" color="text.secondary">-</MDTypography>
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

export default InstitutionActivity;

