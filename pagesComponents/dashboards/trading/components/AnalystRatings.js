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

function AnalystRatings({ data = [], loading = false }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", { 
        year: "numeric", 
        month: "short", 
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateString;
    }
  };

  const getRecommendationColor = (recommendation) => {
    if (!recommendation) return "default";
    const rec = recommendation.toLowerCase();
    if (rec === "buy") return "success";
    if (rec === "hold") return "warning";
    if (rec === "sell") return "error";
    return "default";
  };

  const getRecommendationLabel = (recommendation) => {
    if (!recommendation) return "N/A";
    return recommendation.toUpperCase();
  };

  const getActionColor = (action) => {
    if (!action) return "default";
    const act = action.toLowerCase();
    if (act.includes("upgrade") || act.includes("target raised")) return "success";
    if (act.includes("downgrade") || act.includes("target lowered")) return "error";
    if (act.includes("initiated")) return "info";
    return "default";
  };

  const getActionLabel = (action) => {
    if (!action) return "N/A";
    const act = action.toLowerCase();
    if (act === "initiated") return "Initiated";
    if (act === "reiterated") return "Reiterated";
    if (act === "downgraded") return "Downgraded";
    if (act === "upgraded") return "Upgraded";
    if (act === "maintained") return "Maintained";
    if (act === "target raised") return "Target Raised";
    if (act === "target lowered") return "Target Lowered";
    return action;
  };

  const parseNumber = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Analyst Ratings
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
            Analyst Ratings ({data.length})
          </MDTypography>
          <Tooltip title="Dernières notes d'analystes pour les tickers">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucune note d&apos;analyste disponible. Utilisez les filtres pour rechercher.
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="10%" align="left">Ticker</DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="left">Analyste</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="left">Firme</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="center">Action</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="center">Recommendation</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Target</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="left">Sector</DataTableHeadCell>
                  <DataTableHeadCell width="21%" align="left">Timestamp</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.map((rating, index) => {
                  const target = parseNumber(rating.target);

                  return (
                    <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="button" fontWeight="bold" color="primary">
                          {rating.ticker || "N/A"}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="body2" fontWeight="medium">
                          {rating.analyst_name || "N/A"}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="body2" color="text.secondary">
                          {rating.firm || "N/A"}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        <Chip
                          label={getActionLabel(rating.action)}
                          color={getActionColor(rating.action)}
                          size="small"
                        />
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        <Chip
                          label={getRecommendationLabel(rating.recommendation)}
                          color={getRecommendationColor(rating.recommendation)}
                          size="small"
                        />
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        {target !== null ? (
                          <MDTypography variant="body2" fontWeight="bold" color="primary">
                            ${target.toFixed(2)}
                          </MDTypography>
                        ) : (
                          <MDTypography variant="body2" color="text.secondary">
                            N/A
                          </MDTypography>
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        {rating.sector ? (
                          <Chip label={rating.sector} size="small" color="info" />
                        ) : (
                          <MDTypography variant="caption" color="text.secondary">
                            N/A
                          </MDTypography>
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="caption" color="text.secondary">
                          {formatDate(rating.timestamp)}
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

export default AnalystRatings;

