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

function InstitutionOwnership({ data = [], loading = false, ticker = "" }) {
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

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Institution Ownership
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
            Ownership: {ticker} ({data.length})
          </MDTypography>
          <Tooltip title="Propriété institutionnelle d'un ticker. Montre quelles institutions détiennent ce ticker et en quelle quantité.">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucune donnée d&apos;ownership disponible
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="20%" align="left">Institution</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">Units</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">Change</DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="right">Value</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">Avg Price</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">% Outstanding</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="left">First Buy</DataTableHeadCell>
                  <DataTableHeadCell width="5%" align="center">Tags</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.slice(0, 100).map((item, index) => {
                  const units = parseNumber(item.units) || 0;
                  const unitsChange = parseNumber(item.units_change) || 0;
                  const value = parseNumber(item.value) || 0;
                  const avgPrice = parseNumber(item.avg_price) || 0;
                  const percOutstanding = parseNumber(item.perc_outstanding) || 0;
                  const instValue = parseNumber(item.inst_value) || 0;
                  const instShareValue = parseNumber(item.inst_share_value) || 0;

                  return (
                    <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="button" fontWeight="bold" color="primary">
                          {item.short_name || item.name || "N/A"}
                        </MDTypography>
                        {item.name && item.name !== item.short_name && (
                          <MDTypography variant="caption" color="text.secondary" display="block" noWrap sx={{ maxWidth: 200 }}>
                            {item.name}
                          </MDTypography>
                        )}
                        {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
                          <MDBox display="flex" gap={0.5} mt={0.5} flexWrap="wrap">
                            {item.tags.slice(0, 1).map((tag, idx) => (
                              <Chip key={idx} label={tag} size="small" color="default" sx={{ height: 18, fontSize: "0.65rem" }} />
                            ))}
                          </MDBox>
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
                        <MDTypography variant="body2" fontWeight="bold">
                          {formatNumber(value)}
                        </MDTypography>
                        {instShareValue > 0 && (
                          <MDTypography variant="caption" color="text.secondary" display="block">
                            Share: {formatNumber(instShareValue)}
                          </MDTypography>
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary">
                          ${avgPrice.toFixed(2)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium">
                          {formatPercentage(percOutstanding)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="caption" color="text.secondary">
                          {formatDate(item.first_buy)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        {item.tags && Array.isArray(item.tags) && item.tags.length > 1 && (
                          <Tooltip title={item.tags.slice(1).join(", ")}>
                            <Chip label={`+${item.tags.length - 1}`} size="small" sx={{ height: 18, fontSize: "0.65rem" }} />
                          </Tooltip>
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

export default InstitutionOwnership;

