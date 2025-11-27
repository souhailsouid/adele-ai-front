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

function PoliticianPortfolioHolders({ data = [], loading = false, ticker = "" }) {
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

  const getOwnerLabel = (owner) => {
    if (!owner) return "N/A";
    const ownerMap = {
      self: "Soi-même",
      spouse: "Conjoint(e)",
      joint: "Joint",
      child: "Enfant",
      undisclosed: "Non divulgué",
    };
    return ownerMap[owner.toLowerCase()] || owner;
  };

  const getOwnerColor = (owner) => {
    if (!owner) return "default";
    const ownerMap = {
      self: "primary",
      spouse: "secondary",
      joint: "info",
      child: "warning",
      undisclosed: "default",
    };
    return ownerMap[owner.toLowerCase()] || "default";
  };

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Portfolio Holders
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
            Portfolio Holders {ticker ? `(${ticker})` : ""} ({data.length})
          </MDTypography>
          <Tooltip title="Tous les politiciens qui détiennent ce ticker dans leurs portfolios">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucun détenteur de portfolio disponible. Veuillez rechercher un ticker.
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="30%" align="left">Politicien</DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="center">Propriétaire</DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="right">Min Amount</DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="right">Mid Amount</DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="right">Max Amount</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="left">Portfolio ID</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.map((holder, index) => {
                  const minAmount = parseNumber(holder.min_amount);
                  const midAmount = parseNumber(holder.mid_amount);
                  const maxAmount = parseNumber(holder.max_amount);

                  return (
                    <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="body2" fontWeight="medium">
                          {holder.full_name || "N/A"}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        <Chip
                          label={getOwnerLabel(holder.owner)}
                          color={getOwnerColor(holder.owner)}
                          size="small"
                        />
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="error.main">
                          {formatNumber(minAmount)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium" color="primary">
                          {formatNumber(midAmount)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="success.main">
                          {formatNumber(maxAmount)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="caption" color="text.secondary" noWrap>
                          {holder.id || "N/A"}
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

export default PoliticianPortfolioHolders;

