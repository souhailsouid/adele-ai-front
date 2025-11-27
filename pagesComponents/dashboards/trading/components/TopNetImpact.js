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

function TopNetImpact({ data = [], loading = false }) {
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

  const getNetImpactColor = (netPremium) => {
    if (netPremium > 0) return "success";
    if (netPremium < 0) return "error";
    return "default";
  };

  const getNetImpactIcon = (netPremium) => {
    if (netPremium > 0) return <TrendingUpIcon fontSize="small" />;
    if (netPremium < 0) return <TrendingDownIcon fontSize="small" />;
    return null;
  };

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Top Net Impact
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
            Top Net Impact ({data.length})
          </MDTypography>
          <Tooltip title="Top tickers par net premium (différence entre premium bullish et bearish)">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucune donnée disponible
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="10%" align="center">
                    Rang
                  </DataTableHeadCell>
                  <DataTableHeadCell width="30%" align="left">
                    Symbole
                  </DataTableHeadCell>
                  <DataTableHeadCell width="30%" align="right">
                    Net Premium
                  </DataTableHeadCell>
                  <DataTableHeadCell width="30%" align="center">
                    Impact
                  </DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.slice(0, 20).map((item, index) => {
                  const netPremium = parseNumber(item.net_premium || 0);
                  return (
                    <TableRow
                      key={index}
                      sx={{
                        "&:hover": { backgroundColor: "action.hover" },
                      }}
                    >
                      <DataTableBodyCell align="center">
                        <MDTypography variant="body2" fontWeight="bold" color="text.secondary">
                          #{index + 1}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="button" fontWeight="bold" color="primary">
                          {item.ticker || item.symbol || "N/A"}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDBox display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                          {getNetImpactIcon(netPremium)}
                          <MDTypography
                            variant="body2"
                            fontWeight="bold"
                            color={getNetImpactColor(netPremium) === "success" ? "success.main" : "error.main"}
                          >
                            {formatNumber(netPremium)}
                          </MDTypography>
                        </MDBox>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        <Chip
                          label={netPremium > 0 ? "BULL" : netPremium < 0 ? "BEAR" : "NEUTRAL"}
                          color={getNetImpactColor(netPremium)}
                          size="small"
                        />
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

export default TopNetImpact;

