import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import InfoIcon from "@mui/icons-material/Info";
import LaunchIcon from "@mui/icons-material/Launch";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

function LatestFilings({ data = [], loading = false, onFilingClick = null }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      // Format compact : "lun. 8 déc" (sans année pour économiser de l'espace)
      return date.toLocaleDateString("fr-FR", { 
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
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <MDBox p={1.5} sx={{ borderBottom: 1, borderColor: "divider" }}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <Skeleton variant="text" width={180} height={24} />
            <MDBox display="flex" alignItems="center" gap={0.5}>
              <Skeleton variant="rectangular" width={40} height={24} sx={{ borderRadius: 1 }} />
              <Skeleton variant="circular" width={24} height={24} />
            </MDBox>
          </MDBox>
        </MDBox>
        <TableContainer sx={{ flexGrow: 1, overflowY: "auto", maxHeight: "calc(100vh - 300px)" }}>
          <Table size="small">
            <MDBox component="thead">
              <TableRow>
                <DataTableHeadCell width="20%" align="left">
                  <Skeleton variant="text" width={100} height={20} />
                </DataTableHeadCell>
                <DataTableHeadCell width="12%" align="left">
                  <Skeleton variant="text" width={80} height={20} />
                </DataTableHeadCell>
                <DataTableHeadCell align="center">
                  <Skeleton variant="text" width={60} height={20} />
                </DataTableHeadCell>
                <DataTableHeadCell align="center">
                  <Skeleton variant="text" width={80} height={20} />
                </DataTableHeadCell>
              </TableRow>
            </MDBox>
            <TableBody>
              {[...Array(10)].map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <DataTableBodyCell align="left">
                    <Skeleton variant="text" width="80%" height={20} />
                    <Skeleton variant="text" width="60%" height={16} sx={{ mt: 0.5 }} />
                  </DataTableBodyCell>
                  <DataTableBodyCell align="left">
                    <Skeleton variant="text" width={70} height={20} />
                  </DataTableBodyCell>
                  <DataTableBodyCell align="left">
                    <Skeleton variant="text" width={100} height={20} />
                  </DataTableBodyCell>
                  <DataTableBodyCell align="center">
                    <MDBox display="flex" gap={0.5} justifyContent="center">
                      <Skeleton variant="circular" width={20} height={20} />
                      <Skeleton variant="text" width={40} height={20} />
                    </MDBox>
                  </DataTableBodyCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <MDBox p={1.5} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h6" fontWeight="medium" sx={{ fontSize: "1rem" }}>
            Latest Filings
          </MDTypography>
          <MDBox display="flex" alignItems="center" gap={0.5}>
            <Chip
              label={`${data.length}`}
              size="small"
              color="primary"
              sx={{ 
                height: "24px",
                fontSize: "0.75rem",
                "& .MuiChip-label": { padding: "0 6px" }
              }}
            />
            <Tooltip title="Derniers dépôts institutionnels (13F filings)">
              <IconButton size="small" sx={{ padding: "4px" }}>
                <InfoIcon fontSize="small" sx={{ fontSize: "0.875rem" }} />
              </IconButton>
            </Tooltip>
          </MDBox>
        </MDBox>
      </MDBox>
      {data.length === 0 ? (
        <MDBox p={3} textAlign="center">
          <MDTypography variant="body2" color="text.secondary">
            Aucun filing disponible
          </MDTypography>
        </MDBox>
      ) : (
        <TableContainer sx={{ flexGrow: 1, overflowY: "auto", maxHeight: "calc(100vh - 300px)" }}>
          <Table stickyHeader size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="20%" align="left">Institution</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="left">Date de Filing</DataTableHeadCell>
                  <DataTableHeadCell  align="center">CIK</DataTableHeadCell>
                 
                
                </TableRow>
              </MDBox>
              <TableBody>
                {data.slice(0, 80).map((filing, index) => (
                  <TableRow key={`filing-${index}-${filing.cik}-${filing.filing_date}`} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                    <DataTableBodyCell align="left">
                      <MDTypography variant="small" fontWeight="bold" color="primary">
                        {filing.institutionName || filing.name || filing.short_name || "N/A"}
                      </MDTypography>
                      {filing.name && filing.name !== filing.institutionName && filing.name !== filing.short_name && (
                        <MDTypography variant="small" color="text.secondary" display="block" noWrap sx={{ maxWidth: 250 }}>
                          {filing.name}
                        </MDTypography>
                      )}
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left">
                      <MDTypography variant="small">{formatDate(filing.filingDate || filing.filing_date || filing.reportDate || filing.report_date)}</MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left">
                      <MDTypography variant="caption" color="text.secondary">{filing.cik || "N/A"}</MDTypography>
                    </DataTableBodyCell>
                 
                
                    <DataTableBodyCell align="center">
                      <MDBox display="flex" gap={0.5} justifyContent="center" alignItems="center">
                        {onFilingClick && (
                        <VisibilityIcon fontSize="small" onClick={() => onFilingClick(filing)} sx={{ cursor: "pointer" }} />
                            
                        )}
                        {filing.url ? (
                          <Link 
                            href={filing.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                          >
                            <LaunchIcon fontSize="small" />
                            <MDTypography variant="caption">SEC</MDTypography>
                          </Link>
                        ) : (
                          <MDTypography variant="caption" color="text.secondary">-</MDTypography>
                        )}
                      </MDBox>
                    </DataTableBodyCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
    </Card>
  );
}

export default LatestFilings;


