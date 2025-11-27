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
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

function FDACalendar({ data = [], loading = false }) {
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

  const formatNumber = (num) => {
    if (!num || num === 0) return "-";
    const numValue = typeof num === "string" ? parseFloat(num) : num;
    if (isNaN(numValue)) return "-";
    if (numValue >= 1_000_000_000) return `$${(numValue / 1_000_000_000).toFixed(2)}B`;
    if (numValue >= 1_000_000) return `$${(numValue / 1_000_000).toFixed(2)}M`;
    if (numValue >= 1_000) return `$${(numValue / 1_000).toFixed(2)}K`;
    return `$${numValue.toFixed(2)}`;
  };

  const getCatalystColor = (catalyst) => {
    if (!catalyst) return "default";
    const type = catalyst.toLowerCase();
    if (type.includes("pdufa")) return "error";
    if (type.includes("advisory") || type.includes("meeting")) return "warning";
    if (type.includes("decision")) return "info";
    return "default";
  };

  const getStatusColor = (status) => {
    if (!status) return "default";
    const stat = status.toUpperCase();
    if (stat === "NDA") return "primary";
    if (stat === "BLA") return "info";
    return "default";
  };

  const getOutcomeColor = (outcome) => {
    if (!outcome) return "default";
    const out = outcome.toLowerCase();
    if (out.includes("approv") || out.includes("accept")) return "success";
    if (out.includes("reject") || out.includes("deny") || out.includes("refuse")) return "error";
    if (out.includes("delay") || out.includes("postpone")) return "warning";
    return "default";
  };

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            FDA Calendar
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
            FDA Calendar ({data.length})
          </MDTypography>
          <Tooltip title="Calendrier des décisions FDA (PDUFA dates, Advisory Committee meetings, etc.). Important pour les actions biotech.">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucun événement FDA disponible
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="12%" align="left">Date</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="left">Ticker</DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="left">Médicament</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="center">Catalyst</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="center">Statut</DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="left">Indication</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="center">Résultat</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">Market Cap</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.slice(0, 100).map((event, index) => {
                  const startDate = formatDate(event.start_date);
                  const endDate = event.end_date && event.end_date !== event.start_date ? formatDate(event.end_date) : null;
                  
                  return (
                    <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="body2">{startDate}</MDTypography>
                        {endDate && (
                          <MDTypography variant="caption" color="text.secondary" display="block">→ {endDate}</MDTypography>
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDBox display="flex" alignItems="center" gap={0.5}>
                          <MDTypography variant="button" fontWeight="bold" color="primary">{event.ticker || "N/A"}</MDTypography>
                          {event.has_options && (
                            <Chip label="Options" size="small" color="info" sx={{ height: 18, fontSize: "0.65rem" }} />
                          )}
                        </MDBox>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="body2" fontWeight="medium">{event.drug || "N/A"}</MDTypography>
                        {event.description && (
                          <Tooltip title={event.description}>
                            <MDTypography variant="caption" color="text.secondary" display="block" noWrap sx={{ maxWidth: 150 }}>
                              {event.description.substring(0, 50)}...
                            </MDTypography>
                          </Tooltip>
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        <Chip
                          label={event.catalyst || "N/A"}
                          color={getCatalystColor(event.catalyst)}
                          size="small"
                        />
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        <Chip
                          label={event.status || "N/A"}
                          color={getStatusColor(event.status)}
                          size="small"
                        />
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="caption" color="text.secondary">{event.indication || "N/A"}</MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        {event.outcome ? (
                          <Tooltip title={event.outcome_brief || event.outcome}>
                            <Chip
                              label={event.outcome_brief || event.outcome}
                              color={getOutcomeColor(event.outcome)}
                              size="small"
                            />
                          </Tooltip>
                        ) : (
                          <MDTypography variant="caption" color="text.secondary">En attente</MDTypography>
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        {event.marketcap ? (
                          <MDTypography variant="body2">{formatNumber(event.marketcap)}</MDTypography>
                        ) : (
                          <MDTypography variant="caption" color="text.secondary">-</MDTypography>
                        )}
                      </DataTableBodyCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {/* Affichage des détails supplémentaires pour le premier événement (exemple) */}
        {data.length > 0 && data[0].notes && (
          <MDBox mt={2} p={2} sx={{ bgcolor: "grey.100", borderRadius: 1 }}>
            <MDTypography variant="caption" color="text.secondary" fontWeight="medium" display="block" mb={0.5}>
              Note importante:
            </MDTypography>
            <MDTypography variant="body2" color="text">
              {data[0].notes}
            </MDTypography>
            {data[0].source_link && (
              <Link href={data[0].source_link} target="_blank" rel="noopener" sx={{ mt: 1, display: "block" }}>
                <MDTypography variant="caption" color="primary">
                  Source →
                </MDTypography>
              </Link>
            )}
          </MDBox>
        )}
      </MDBox>
    </Card>
  );
}

export default FDACalendar;

