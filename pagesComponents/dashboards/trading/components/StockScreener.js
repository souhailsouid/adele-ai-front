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

function StockScreener({ data = [], loading = false }) {
  const formatNumber = (num) => {
    if (!num || num === 0) return "-";
    if (num >= 1_000_000_000_000) return `${(num / 1_000_000_000_000).toFixed(2)}T`;
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

  const formatPercentage = (value) => {
    const num = parseNumber(value);
    if (num === 0) return "0%";
    const sign = num >= 0 ? "+" : "";
    return `${sign}${(num * 100).toFixed(2)}%`;
  };

  const getPercentageColor = (value) => {
    const num = parseNumber(value);
    if (num > 0) return "success";
    if (num < 0) return "error";
    return "text";
  };

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Stock Screener
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
            Stock Screener ({data.length})
          </MDTypography>
          <Tooltip title="Screener d'actions avec filtres avancés sur options, volume, volatilité, etc.">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucune action disponible. Utilisez les filtres pour rechercher.
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="8%" align="left">Ticker</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">Price</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">Change %</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">Market Cap</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">Call Volume</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">Put Volume</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">Total Volume</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">Call Premium</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">Put Premium</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">Net Premium</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">IV Rank</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">Put/Call Ratio</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="left">Sector</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.map((stock, index) => {
                  const price = parseNumber(stock.close);
                  const change = parseNumber(stock.perc_change);
                  const marketcap = parseNumber(stock.marketcap);
                  const callVolume = parseNumber(stock.call_volume);
                  const putVolume = parseNumber(stock.put_volume);
                  const totalVolume = callVolume + putVolume;
                  const callPremium = parseNumber(stock.call_premium);
                  const putPremium = parseNumber(stock.put_premium);
                  const netPremium = parseNumber(stock.net_premium);
                  const ivRank = parseNumber(stock.iv_rank);
                  const putCallRatio = parseNumber(stock.put_call_ratio);

                  return (
                    <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="button" fontWeight="bold" color="primary">
                          {stock.ticker || "N/A"}
                        </MDTypography>
                        {stock.issue_type && (
                          <MDTypography variant="caption" color="text.secondary" display="block">
                            {stock.issue_type}
                          </MDTypography>
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="bold" color="primary">
                          ${price.toFixed(2)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography 
                          variant="body2" 
                          fontWeight="medium"
                          color={getPercentageColor(change)}
                        >
                          {formatPercentage(change)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary">
                          {formatNumber(marketcap)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="success.main">
                          {formatNumber(callVolume)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="error.main">
                          {formatNumber(putVolume)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium" color="primary">
                          {formatNumber(totalVolume)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="success.main">
                          {formatNumber(callPremium)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="error.main">
                          {formatNumber(putPremium)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography 
                          variant="body2" 
                          fontWeight="medium"
                          color={netPremium >= 0 ? "success.main" : "error.main"}
                        >
                          {formatNumber(netPremium)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        {ivRank > 0 ? (
                          <MDTypography variant="body2" color="warning.main">
                            {ivRank.toFixed(1)}%
                          </MDTypography>
                        ) : (
                          <MDTypography variant="body2" color="text.secondary">
                            N/A
                          </MDTypography>
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary">
                          {putCallRatio > 0 ? putCallRatio.toFixed(3) : "N/A"}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        {stock.sector ? (
                          <Chip label={stock.sector} size="small" color="info" />
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

export default StockScreener;

