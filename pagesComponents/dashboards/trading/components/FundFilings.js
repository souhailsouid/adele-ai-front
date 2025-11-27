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
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Link from "@mui/material/Link";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

function FundFilings({ data = [], loading = false, fundName = "", fundCik = "" }) {
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

  const getStatusColor = (status) => {
    const colors = {
      PARSED: "success",
      DISCOVERED: "warning",
      FAILED: "error",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      PARSED: "Parsed",
      DISCOVERED: "Discovered",
      FAILED: "Failed",
    };
    return labels[status] || status;
  };

  // Construire l'URL SEC pour un filing 13F
  // Les 13F ne sont pas en XBRL, donc on utilise l'URL directe vers la page d'index
  const getSECUrl = (accessionNumber, filingCik) => {
    const cik = filingCik || fundCik;
    if (!cik || !accessionNumber) return null;
    
    // Nettoyer le CIK (enlever les zéros à gauche pour l'URL SEC)
    const cleanCik = cik.replace(/^0+/, "") || cik;
    
    // Nettoyer l'accession_number (enlever les tirets)
    const cleanAccession = accessionNumber.replace(/-/g, "");
    
    // Construire l'URL vers la page d'index du filing
    // Format: https://www.sec.gov/Archives/edgar/data/{CIK}/{ACCESSION}/
    return `https://www.sec.gov/Archives/edgar/data/${cleanCik}/${cleanAccession}/`;
  };

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Filings
          </MDTypography>
          <LinearProgress />
        </MDBox>
      </Card>
    );
  }

  // Trier par date décroissante
  const sortedFilings = [...data].sort((a, b) => {
    const dateA = new Date(a.filing_date);
    const dateB = new Date(b.filing_date);
    return dateB - dateA;
  });

  return (
    <Card>
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDTypography variant="h6">
            Filings: {fundName} ({data.length})
          </MDTypography>
          <Tooltip title="Liste des filings 13F du fund avec leur statut de parsing">
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
                  <DataTableHeadCell width="15%" align="left">Filing Date</DataTableHeadCell>
                  <DataTableHeadCell width="18%" align="left">Accession Number</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="left">CIK</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="left">Form Type</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="center">Status</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="left">Created At</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="left">Updated At</DataTableHeadCell>
                  <DataTableHeadCell width="13%" align="center">Actions</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {sortedFilings.map((filing) => (
                  <TableRow
                    key={filing.id}
                    sx={{ "&:hover": { backgroundColor: "action.hover" } }}
                  >
                    <DataTableBodyCell align="left">
                      <MDTypography variant="body2" fontWeight="medium">
                        {formatDate(filing.filing_date)}
                      </MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left">
                      <MDTypography variant="body2" color="text.secondary">
                        {filing.accession_number || "N/A"}
                      </MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left">
                      <MDTypography variant="body2" fontWeight="medium">
                        {filing.cik || fundCik || "N/A"}
                      </MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left">
                      <MDTypography variant="body2">
                        {filing.form_type || "N/A"}
                      </MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="center">
                      <Chip
                        label={getStatusLabel(filing.status)}
                        color={getStatusColor(filing.status)}
                        size="small"
                      />
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left">
                      <MDTypography variant="caption" color="text.secondary">
                        {formatDate(filing.created_at)}
                      </MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left">
                      <MDTypography variant="caption" color="text.secondary">
                        {formatDate(filing.updated_at)}
                      </MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="center">
                      {getSECUrl(filing.accession_number, filing.cik) ? (
                        <Link
                          href={getSECUrl(filing.accession_number, filing.cik)}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                        >
                          <OpenInNewIcon fontSize="small" />
                          <MDTypography variant="caption" color="primary">
                            SEC
                          </MDTypography>
                        </Link>
                      ) : (
                        <MDTypography variant="caption" color="text.secondary">
                          -
                        </MDTypography>
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

export default FundFilings;

