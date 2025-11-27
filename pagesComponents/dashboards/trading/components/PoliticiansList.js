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
import MDButton from "/components/MDButton";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

function PoliticiansList({ data = [], loading = false, onSelectPolitician = null }) {
  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Politicians List
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
            Politicians List ({data.length})
          </MDTypography>
          <Tooltip title="Liste de tous les politiciens avec leurs IDs">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucun politicien disponible
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="70%" align="left">Nom</DataTableHeadCell>
                  <DataTableHeadCell width="30%" align="center">Actions</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.map((politician, index) => (
                  <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                    <DataTableBodyCell align="left">
                      <MDTypography variant="body2" fontWeight="medium">
                        {politician.name || "N/A"}
                      </MDTypography>
                      <MDTypography variant="caption" color="text.secondary" display="block">
                        ID: {politician.id || "N/A"}
                      </MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="center">
                      {onSelectPolitician && (
                        <MDButton
                          variant="outlined"
                          color="dark"
                          size="small"
                          onClick={() => onSelectPolitician(politician.id)}
                        >
                          Voir Portfolios
                        </MDButton>
                      )}
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

export default PoliticiansList;

