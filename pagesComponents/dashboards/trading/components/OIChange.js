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

function OIChange({ data = [], loading = false }) {
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

  const getChangeColor = (change) => {
    if (change > 0) return "success";
    if (change < 0) return "error";
    return "default";
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <TrendingUpIcon fontSize="small" />;
    if (change < 0) return <TrendingDownIcon fontSize="small" />;
    return null;
  };

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            OI Change
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
            OI Change ({data.length})
          </MDTypography>
          <Tooltip title="Changements d'open interest - détecte les accumulations/distributions d'options">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucune donnée OI Change disponible
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="20%" align="left">
                    Symbole / Contrat
                  </DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="right">
                    OI Change
                  </DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="right">
                    OI Actuel
                  </DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="right">
                    Volume
                  </DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="right">
                    Premium
                  </DataTableHeadCell>
                  <DataTableHeadCell width="20%" align="center">
                    Impact
                  </DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.slice(0, 20).map((item, index) => {
                  const oiChangePercent = parseNumber(item.oi_change || 0);
                  const oiDiffPlain = parseNumber(item.oi_diff_plain || 0);
                  const currOI = parseNumber(item.curr_oi || 0);
                  const lastOI = parseNumber(item.last_oi || 0);
                  const volume = parseNumber(item.volume || 0);
                  const premium = parseNumber(item.prev_total_premium || 0);
                  const underlyingSymbol = item.underlying_symbol || item.ticker || "N/A";
                  const optionSymbol = item.option_symbol || "N/A";

                  return (
                    <TableRow
                      key={item.option_symbol || index}
                      sx={{
                        "&:hover": { backgroundColor: "action.hover" },
                      }}
                    >
                      <DataTableBodyCell align="left">
                        <MDBox>
                          <MDTypography variant="button" fontWeight="bold" color="primary">
                            {underlyingSymbol}
                          </MDTypography>
                          <MDTypography variant="caption" color="text.secondary" display="block" noWrap>
                            {optionSymbol}
                          </MDTypography>
                        </MDBox>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDBox>
                          <MDBox display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                            {getChangeIcon(oiDiffPlain)}
                            <MDTypography
                              variant="body2"
                              fontWeight="bold"
                              color={getChangeColor(oiDiffPlain) === "success" ? "success.main" : getChangeColor(oiDiffPlain) === "error" ? "error.main" : "text"}
                            >
                              {oiDiffPlain > 0 ? "+" : ""}{formatNumber(oiDiffPlain)}
                            </MDTypography>
                          </MDBox>
                          <MDTypography variant="caption" color="text.secondary" display="block">
                            {oiChangePercent > 0 ? "+" : ""}{oiChangePercent.toFixed(2)}%
                          </MDTypography>
                        </MDBox>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDBox>
                          <MDTypography variant="body2" fontWeight="medium">
                            {formatNumber(currOI)}
                          </MDTypography>
                          {lastOI > 0 && (
                            <MDTypography variant="caption" color="text.secondary" display="block">
                              Préc: {formatNumber(lastOI)}
                            </MDTypography>
                          )}
                        </MDBox>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDBox>
                          <MDTypography variant="body2" fontWeight="medium">
                            {formatNumber(volume)}
                          </MDTypography>
                          {item.trades && (
                            <MDTypography variant="caption" color="text.secondary" display="block">
                              {item.trades} trades
                            </MDTypography>
                          )}
                        </MDBox>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary">
                          {formatNumber(premium)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        <Chip
                          label={oiDiffPlain > 0 ? "ACCUMULATION" : oiDiffPlain < 0 ? "DISTRIBUTION" : "NEUTRAL"}
                          color={getChangeColor(oiDiffPlain)}
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

export default OIChange;

