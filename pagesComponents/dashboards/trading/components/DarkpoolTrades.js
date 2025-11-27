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
import { formatDateTime } from "./utils";
function DarkpoolTrades({ data = [], loading = false }) {
  const formatNumber = (num) => {
    if (!num || num === 0) return "-";
    if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

 

  const getSizeColor = (size) => {
    if (!size || size === 0) return "default";
    if (size >= 1_000_000) return "error";
    if (size >= 500_000) return "warning";
    return "info";
  };

  const parseNumber = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Darkpool Trades
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
            Darkpool Trades ({data.length})
          </MDTypography>
          <Tooltip title="Trades exécutés sur les dark pools (marchés privés)">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucun trade darkpool disponible
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="12%" align="left">
                    Date/Heure
                  </DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="left">
                    Symbole
                  </DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">
                    Prix
                  </DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">
                    Taille
                  </DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">
                    Volume
                  </DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="right">
                    Premium
                  </DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="center">
                    Market Center
                  </DataTableHeadCell>
                  <DataTableHeadCell width="13%" align="center">
                    NBBO
                  </DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.slice(0, 20).map((trade, index) => {
                  const dateTime = formatDateTime(trade.executed_at);
                  const price = parseNumber(trade.price);
                  const size = parseNumber(trade.size);
                  const volume = parseNumber(trade.volume);
                  const premium = parseNumber(trade.premium);
                  const nbboBid = parseNumber(trade.nbbo_bid);
                  const nbboAsk = parseNumber(trade.nbbo_ask);
                  return (
                    <TableRow
                      key={index}
                      sx={{
                        "&:hover": { backgroundColor: "action.hover" },
                      }}
                    >
                      <DataTableBodyCell align="left">
                        <MDBox>
                          <MDTypography variant="caption" color="text.secondary" display="block">
                            {dateTime.date}
                          </MDTypography>
                          <MDTypography variant="caption" color="text.secondary">
                            {dateTime.time}
                          </MDTypography>
                        </MDBox>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="button" fontWeight="bold" color="primary">
                          {trade.ticker}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium">
                          ${price.toFixed(2)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <Chip
                          label={formatNumber(size)}
                          color={getSizeColor(size)}
                          size="small"
                        />
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2">
                          {formatNumber(volume)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium" color="primary">
                          {formatNumber(premium)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        <MDTypography variant="caption" color="text.secondary">
                          {trade.market_center || "N/A"}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        <MDBox>
                          <MDTypography variant="caption" color="success.main" display="block">
                            Bid: ${nbboBid.toFixed(2)}
                          </MDTypography>
                          <MDTypography variant="caption" color="error.main">
                            Ask: ${nbboAsk.toFixed(2)}
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

export default DarkpoolTrades;

