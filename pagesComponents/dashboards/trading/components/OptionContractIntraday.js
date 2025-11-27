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
import { formatDateTime } from "./utils";

function OptionContractIntraday({ data = [], loading = false, contractId = "" }) {
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

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Intraday Data
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
            Intraday Data {contractId ? `(${contractId})` : ""} ({data.length})
          </MDTypography>
          <Tooltip title="Données intraday (1 minute) pour le contrat sélectionné">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucune donnée intraday disponible. Veuillez entrer un Contract ID.
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="15%" align="left">Time</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Open</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">High</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Low</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Close</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Avg Price</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">IV Range</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">Premium Ask</DataTableHeadCell>
                  <DataTableHeadCell width="13%" align="right">Premium Bid</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.map((item, index) => {
                  const dateTime = formatDateTime(item.start_time);
                  const open = parseNumber(item.open);
                  const high = parseNumber(item.high);
                  const low = parseNumber(item.low);
                  const close = parseNumber(item.close);
                  const avgPrice = parseNumber(item.avg_price);
                  const ivHigh = parseNumber(item.iv_high);
                  const ivLow = parseNumber(item.iv_low);
                  const premiumAsk = parseNumber(item.premium_ask_side);
                  const premiumBid = parseNumber(item.premium_bid_side);

                  return (
                    <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="caption" color="text.secondary" display="block">
                          {dateTime.date}
                        </MDTypography>
                        <MDTypography variant="caption" color="text.secondary">
                          {dateTime.time}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2">${open.toFixed(2)}</MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="success.main">
                          ${high.toFixed(2)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="error.main">
                          ${low.toFixed(2)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium">
                          ${close.toFixed(2)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary">
                          ${avgPrice.toFixed(2)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDBox>
                          <MDTypography variant="caption" color="text.secondary" display="block">
                            High: {(ivHigh * 100).toFixed(1)}%
                          </MDTypography>
                          <MDTypography variant="caption" color="text.secondary">
                            Low: {(ivLow * 100).toFixed(1)}%
                          </MDTypography>
                        </MDBox>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="error.main">
                          {formatNumber(premiumAsk)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="success.main">
                          {formatNumber(premiumBid)}
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

export default OptionContractIntraday;


