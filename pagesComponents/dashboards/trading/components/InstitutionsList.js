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
import Avatar from "@mui/material/Avatar";
import Link from "@mui/material/Link";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

function InstitutionsList({ data = [], loading = false }) {
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

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Institutions
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
            Liste des Institutions ({data.length})
          </MDTypography>
          <Tooltip title="Liste des institutions financières avec leurs holdings et valeurs de portefeuille">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucune institution disponible
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="25%" align="left">Institution</DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="right">Total Value</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">Share Value</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">Buy Value</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">Sell Value</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="center">Tags</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="center">Type</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.slice(0, 100).map((inst, index) => {
                  const totalValue = parseNumber(inst.total_value);
                  const shareValue = parseNumber(inst.share_value);
                  const buyValue = parseNumber(inst.buy_value);
                  const sellValue = parseNumber(inst.sell_value);

                  return (
                    <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                      <DataTableBodyCell align="left">
                        <MDBox display="flex" alignItems="center" gap={1}>
                          {inst.logo_url && (
                            <Avatar src={inst.logo_url} alt={inst.short_name || inst.name} sx={{ width: 32, height: 32 }} />
                          )}
                          <MDBox>
                            <MDTypography variant="button" fontWeight="bold" color="primary">
                              {inst.short_name || inst.name || "N/A"}
                            </MDTypography>
                            {inst.name && inst.name !== inst.short_name && (
                              <MDTypography variant="caption" color="text.secondary" display="block" noWrap sx={{ maxWidth: 200 }}>
                                {inst.name}
                              </MDTypography>
                            )}
                            {inst.website && (
                              <Link href={inst.website} target="_blank" rel="noopener" sx={{ fontSize: "0.7rem" }}>
                                Site web →
                              </Link>
                            )}
                          </MDBox>
                        </MDBox>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="bold">
                          {formatNumber(totalValue)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary">
                          {formatNumber(shareValue)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="success.main">
                          {formatNumber(buyValue)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="error.main">
                          {formatNumber(sellValue)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        {inst.tags && inst.tags.length > 0 ? (
                          <MDBox display="flex" gap={0.5} flexWrap="wrap" justifyContent="center">
                            {inst.tags.slice(0, 2).map((tag, idx) => (
                              <Chip key={idx} label={tag} size="small" color="default" sx={{ height: 20, fontSize: "0.7rem" }} />
                            ))}
                            {inst.tags.length > 2 && (
                              <MDTypography variant="caption" color="text.secondary">+{inst.tags.length - 2}</MDTypography>
                            )}
                          </MDBox>
                        ) : (
                          <MDTypography variant="caption" color="text.secondary">-</MDTypography>
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        {inst.is_hedge_fund && (
                          <Chip label="Hedge Fund" size="small" color="warning" />
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

export default InstitutionsList;

