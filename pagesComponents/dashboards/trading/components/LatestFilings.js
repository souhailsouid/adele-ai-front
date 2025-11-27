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

function LatestFilings({ data = [], loading = false }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", { 
        year: "numeric", 
        month: "short", 
        day: "numeric",
        weekday: "short"
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
            Latest Filings
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
            Latest Filings ({data.length})
          </MDTypography>
          <Tooltip title="Derniers dépôts institutionnels (13F filings)">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucun filing disponible
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="20%" align="left">Institution</DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="left">Date de Filing</DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="left">CIK</DataTableHeadCell>
                  <DataTableHeadCell width="20%" align="left">Personnes</DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="center">Tags</DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="center">Type</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.slice(0, 100).map((filing, index) => (
                  <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                    <DataTableBodyCell align="left">
                      <MDTypography variant="button" fontWeight="bold" color="primary">
                        {filing.short_name || filing.name || "N/A"}
                      </MDTypography>
                      {filing.name && filing.name !== filing.short_name && (
                        <MDTypography variant="caption" color="text.secondary" display="block" noWrap sx={{ maxWidth: 250 }}>
                          {filing.name}
                        </MDTypography>
                      )}
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left">
                      <MDTypography variant="body2">{formatDate(filing.filing_date)}</MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left">
                      <MDTypography variant="caption" color="text.secondary">{filing.cik || "N/A"}</MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left">
                      {filing.people && Array.isArray(filing.people) && filing.people.length > 0 ? (
                        <MDBox display="flex" gap={0.5} flexWrap="wrap">
                          {filing.people.slice(0, 2).map((person, idx) => (
                            <Chip key={idx} label={person} size="small" color="default" sx={{ height: 20, fontSize: "0.7rem" }} />
                          ))}
                          {filing.people.length > 2 && (
                            <MDTypography variant="caption" color="text.secondary">+{filing.people.length - 2}</MDTypography>
                          )}
                        </MDBox>
                      ) : (
                        <MDTypography variant="caption" color="text.secondary">-</MDTypography>
                      )}
                    </DataTableBodyCell>
                    <DataTableBodyCell align="center">
                      {filing.tags && Array.isArray(filing.tags) && filing.tags.length > 0 ? (
                        <MDBox display="flex" gap={0.5} flexWrap="wrap" justifyContent="center">
                          {filing.tags.slice(0, 2).map((tag, idx) => (
                            <Chip key={idx} label={tag} size="small" color="default" sx={{ height: 20, fontSize: "0.7rem" }} />
                          ))}
                          {filing.tags.length > 2 && (
                            <MDTypography variant="caption" color="text.secondary">+{filing.tags.length - 2}</MDTypography>
                          )}
                        </MDBox>
                      ) : (
                        <MDTypography variant="caption" color="text.secondary">-</MDTypography>
                      )}
                    </DataTableBodyCell>
                    <DataTableBodyCell align="center">
                      {filing.is_hedge_fund && (
                        <Chip label="Hedge Fund" size="small" color="warning" />
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

export default LatestFilings;


