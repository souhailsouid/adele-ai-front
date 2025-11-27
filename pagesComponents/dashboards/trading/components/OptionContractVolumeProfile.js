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

function OptionContractVolumeProfile({ data = [], loading = false, contractId = "" }) {
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
        day: "numeric"
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
            Volume Profile
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
            Volume Profile {contractId ? `(${contractId})` : ""} ({data.length})
          </MDTypography>
          <Tooltip title="Volume profile (volume par prix de fill) pour le contrat sélectionné">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucune donnée de volume profile disponible. Veuillez entrer un Contract ID.
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="10%" align="left">Date</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Prix</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Volume Total</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Ask Vol</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Bid Vol</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Mid Vol</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Sweep Vol</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Multi Vol</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Cross Vol</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Floor Vol</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.map((item, index) => {
                  const price = parseNumber(item.price);
                  const volume = parseNumber(item.volume);
                  const askVol = parseNumber(item.ask_vol || 0);
                  const bidVol = parseNumber(item.bid_vol || 0);
                  const midVol = parseNumber(item.mid_vol || 0);
                  const sweepVol = parseNumber(item.sweep_vol || 0);
                  const multiVol = parseNumber(item.multi_vol || 0);
                  const crossVol = parseNumber(item.cross_vol || 0);
                  const floorVol = parseNumber(item.floor_vol || 0);
                  const transactions = parseNumber(item.transactions || 0);

                  return (
                    <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="body2" fontWeight="medium">
                          {formatDate(item.date)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="bold" color="primary">
                          ${price.toFixed(2)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium" color="primary">
                          {formatNumber(volume)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="error.main">
                          {formatNumber(askVol)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="success.main">
                          {formatNumber(bidVol)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary">
                          {formatNumber(midVol)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="warning.main">
                          {formatNumber(sweepVol)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="info.main">
                          {formatNumber(multiVol)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary">
                          {formatNumber(crossVol)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary">
                          {formatNumber(floorVol)}
                        </MDTypography>
                        {transactions > 0 && (
                          <MDTypography variant="caption" color="text.secondary" display="block">
                            ({transactions} trades)
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

export default OptionContractVolumeProfile;

