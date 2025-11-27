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

function FundsList({ data = [], loading = false, onFundSelect = () => {} }) {
  const getCategoryColor = (category) => {
    const colors = {
      hedge_fund: "error",
      family_office: "info",
      mutual_fund: "success",
      pension_fund: "warning",
      other: "default",
    };
    return colors[category] || "default";
  };

  const getCategoryLabel = (category) => {
    const labels = {
      hedge_fund: "Hedge Fund",
      family_office: "Family Office",
      mutual_fund: "Mutual Fund",
      pension_fund: "Pension Fund",
      other: "Other",
    };
    return labels[category] || category;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "short",
        day: "numeric",
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
            Funds List
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
            Funds ({data.length})
          </MDTypography>
          <Tooltip title="Liste des fonds suivis avec leurs informations principales">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucun fund disponible
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="30%" align="left">Name</DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="left">CIK</DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="center">Category</DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="center">Tier Influence</DataTableHeadCell>
                  <DataTableHeadCell width="25%" align="left">Created At</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.map((fund) => (
                  <TableRow
                    key={fund.id}
                    sx={{
                      "&:hover": { backgroundColor: "action.hover", cursor: "pointer" },
                    }}
                    onClick={() => onFundSelect(fund)}
                  >
                    <DataTableBodyCell align="left">
                      <MDTypography variant="body2" fontWeight="medium">
                        {fund.name || "N/A"}
                      </MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left">
                      <MDTypography variant="body2" color="text.secondary">
                        {fund.cik || "N/A"}
                      </MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="center">
                      <Chip
                        label={getCategoryLabel(fund.category)}
                        color={getCategoryColor(fund.category)}
                        size="small"
                      />
                    </DataTableBodyCell>
                    <DataTableBodyCell align="center">
                      <MDTypography variant="body2" fontWeight="medium">
                        {fund.tier_influence || "-"}
                      </MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left">
                      <MDTypography variant="caption" color="text.secondary">
                        {formatDate(fund.created_at)}
                      </MDTypography>
                    </DataTableBodyCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </MDBox>
    </Card>
  );
}

export default FundsList;

