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
import Grid from "@mui/material/Grid";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

function InstitutionSectors({ data = [], loading = false, institutionName = "" }) {
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return dateString;
    }
  };

  const getSectorColor = (sector) => {
    const colors = {
      "Technology": "info",
      "Healthcare": "error",
      "Financial Services": "warning",
      "Consumer Cyclical": "success",
      "Communication Services": "primary",
      "Industrials": "default",
      "Energy": "error",
      "Consumer Defensive": "success",
      "Basic Materials": "warning",
      "Real Estate": "info",
      "Utilities": "default",
    };
    return colors[sector] || "default";
  };

  // Fonction pour obtenir une couleur valide pour LinearProgress
  // LinearProgress n'accepte que: primary, secondary, error, info, success, warning
  const getLinearProgressColor = (sector) => {
    const color = getSectorColor(sector);
    // Mapper "default" vers "primary" car LinearProgress ne supporte pas "default"
    if (color === "default") {
      return "primary";
    }
    // Vérifier que la couleur est valide pour LinearProgress
    const validColors = ["primary", "secondary", "error", "info", "success", "warning"];
    return validColors.includes(color) ? color : "primary";
  };

  // Calculer le total pour les pourcentages
  const totalValue = Array.isArray(data) && data.length > 0 
    ? data.reduce((sum, item) => sum + parseNumber(item?.value || 0), 0)
    : 0;

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Sector Exposure
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
            Sector Exposure: {institutionName} ({data.length})
          </MDTypography>
          <Tooltip title="Exposition sectorielle de l'institution. Montre la répartition des investissements par secteur.">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucune donnée d&apos;exposition sectorielle disponible
          </MDTypography>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <MDBox component="thead">
                  <TableRow>
                    <DataTableHeadCell width="20%" align="left">Secteur</DataTableHeadCell>
                    <DataTableHeadCell width="15%" align="right">Valeur</DataTableHeadCell>
                    <DataTableHeadCell width="12%" align="right">% Total</DataTableHeadCell>
                    <DataTableHeadCell width="12%" align="right">Positions</DataTableHeadCell>
                    <DataTableHeadCell width="12%" align="right">Augmentées</DataTableHeadCell>
                    <DataTableHeadCell width="12%" align="right">Diminuées</DataTableHeadCell>
                    <DataTableHeadCell width="12%" align="right">Fermées</DataTableHeadCell>
                    <DataTableHeadCell width="5%" align="left">Date</DataTableHeadCell>
                  </TableRow>
                </MDBox>
                <TableBody>
                  {data.slice(0, 50).map((item, index) => {
                    const value = parseNumber(item.value);
                    const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
                    const positions = parseNumber(item.positions) || 0;
                    const increased = parseNumber(item.positions_increased) || 0;
                    const decreased = parseNumber(item.positions_decreased) || 0;
                    const closed = parseNumber(item.positions_closed) || 0;

                    return (
                      <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                        <DataTableBodyCell align="left">
                          <Chip
                            label={item.sector || "N/A"}
                            color={getSectorColor(item.sector)}
                            size="small"
                          />
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" fontWeight="bold">
                            {formatNumber(value)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDBox>
                            <MDTypography variant="body2" fontWeight="medium">
                              {percentage.toFixed(2)}%
                            </MDTypography>
                            {percentage > 0 && <LinearProgress
                              variant="determinate"
                              value={percentage}
                              color={getLinearProgressColor(item?.sector)}
                              sx={{ height: 4, borderRadius: 2, mt: 0.5 }}
                            />}
                          </MDBox>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2">{positions}</MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" color="success" fontWeight="medium">
                            {increased}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" color="error" fontWeight="medium">
                            {decreased}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" color="text.secondary">
                            {closed}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="left">
                          <MDTypography variant="caption" color="text.secondary">
                            {formatDate(item.report_date)}
                          </MDTypography>
                        </DataTableBodyCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Résumé visuel */}
            <MDBox mt={3}>
              <MDTypography variant="h6" mb={2}>Répartition par Secteur</MDTypography>
              <Grid container spacing={2}>
                {data.slice(0, 6).map((item, index) => {
                  const value = parseNumber(item.value);
                  const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <MDBox
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: "grey.100",
                        }}
                      >
                        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Chip
                            label={item.sector || "N/A"}
                            color={getSectorColor(item.sector)}
                            size="small"
                          />
                          <MDTypography variant="body2" fontWeight="bold">
                            {percentage.toFixed(1)}%
                          </MDTypography>
                        </MDBox>
                        <MDTypography variant="h6" fontWeight="bold">
                          {formatNumber(value)}
                        </MDTypography>
                        {/* <LinearProgress
                          variant="determinate"
                          value={percentage}
                          color={getSectorColor(item.sector)}
                          sx={{ height: 8, borderRadius: 2, mt: 1 }}
                        /> */}
                      </MDBox>
                    </Grid>
                  );
                })}
              </Grid>
            </MDBox>
          </>
        )}
      </MDBox>
    </Card>
  );
}

export default InstitutionSectors;

