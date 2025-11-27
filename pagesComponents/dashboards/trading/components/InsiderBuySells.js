import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

function InsiderBuySells({ data = [], loading = false }) {
  const formatNumber = (num) => {
    if (!num || num === 0) return "-";
    if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
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
            Insider Buy/Sells
          </MDTypography>
          <LinearProgress />
        </MDBox>
      </Card>
    );
  }

  // Gérer les données : peut être un array ou un objet avec data
  let insiderData = [];
  if (Array.isArray(data)) {
    insiderData = data;
  } else if (data?.data && Array.isArray(data.data)) {
    insiderData = data.data;
  } else if (data) {
    insiderData = [data];
  }

  // Calculer les totaux à partir des données
  const totalBuys = insiderData.reduce((sum, item) => sum + (parseNumber(item.purchases) || 0), 0);
  const totalSells = insiderData.reduce((sum, item) => sum + (parseNumber(item.sells) || 0), 0);
  const buyValue = insiderData.reduce((sum, item) => sum + Math.abs(parseNumber(item.purchases_notional) || 0), 0);
  const sellValue = insiderData.reduce((sum, item) => sum + Math.abs(parseNumber(item.sells_notional) || 0), 0);
  const netValue = buyValue - sellValue;
  const netCount = totalBuys - totalSells;

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

  return (
    <Card>
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDTypography variant="h6">
            Insider Buy/Sells (Agrégé)
          </MDTypography>
          <Tooltip title="Vue d'ensemble agrégée des achats et ventes d'insiders. Indicateur de sentiment des dirigeants.">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>

        <Grid container spacing={3}>
          {/* Total Buys */}
          <Grid item xs={12} md={3}>
            <MDBox
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "success.lighter",
              }}
            >
              <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <MDTypography variant="body2" fontWeight="medium" color="text.secondary">
                  Total Achats
                </MDTypography>
                <TrendingUpIcon fontSize="small" color="success" />
              </MDBox>
              <MDTypography variant="h5" fontWeight="bold" color="success.main">
                {formatNumber(totalBuys)}
              </MDTypography>
              <MDTypography variant="caption" color="text.secondary" mt={0.5} display="block">
                Valeur: {formatNumber(buyValue)}
              </MDTypography>
            </MDBox>
          </Grid>

          {/* Total Sells */}
          <Grid item xs={12} md={3}>
            <MDBox
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "error.lighter",
              }}
            >
              <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <MDTypography variant="body2" fontWeight="medium" color="text.secondary">
                  Total Ventes
                </MDTypography>
                <TrendingDownIcon fontSize="small" color="error" />
              </MDBox>
              <MDTypography variant="h5" fontWeight="bold" color="error.main">
                {formatNumber(totalSells)}
              </MDTypography>
              <MDTypography variant="caption" color="text.secondary" mt={0.5} display="block">
                Valeur: {formatNumber(sellValue)}
              </MDTypography>
            </MDBox>
          </Grid>

          {/* Net Count */}
          <Grid item xs={12} md={3}>
            <MDBox
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: netCount > 0 ? "success.lighter" : netCount < 0 ? "error.lighter" : "grey.100",
              }}
            >
              <MDTypography variant="body2" fontWeight="medium" color="text.secondary" mb={1}>
                Net (Comptage)
              </MDTypography>
              <MDTypography
                variant="h5"
                fontWeight="bold"
                color={netCount > 0 ? "success.main" : netCount < 0 ? "error.main" : "text"}
              >
                {netCount > 0 ? "+" : ""}{netCount}
              </MDTypography>
              <MDTypography variant="caption" color="text.secondary" mt={0.5} display="block">
                {netCount > 0 ? "Plus d'achats" : netCount < 0 ? "Plus de ventes" : "Équilibré"}
              </MDTypography>
            </MDBox>
          </Grid>

          {/* Net Value */}
          <Grid item xs={12} md={3}>
            <MDBox
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: netValue > 0 ? "success.lighter" : netValue < 0 ? "error.lighter" : "grey.100",
              }}
            >
              <MDTypography variant="body2" fontWeight="medium" color="text.secondary" mb={1}>
                Net (Valeur)
              </MDTypography>
              <MDTypography
                variant="h5"
                fontWeight="bold"
                color={netValue > 0 ? "success.main" : netValue < 0 ? "error.main" : "text"}
              >
                {formatNumber(Math.abs(netValue))}
              </MDTypography>
              <MDTypography variant="caption" color="text.secondary" mt={0.5} display="block">
                {netValue > 0 ? "Sentiment positif" : netValue < 0 ? "Sentiment négatif" : "Neutre"}
              </MDTypography>
            </MDBox>
          </Grid>
        </Grid>

        {/* Tableau des données par date */}
        {insiderData.length > 0 && (
          <MDBox mt={3}>
            <MDTypography variant="h6" mb={2}>
              Détails par Date ({insiderData.length} jours)
            </MDTypography>
            <TableContainer>
              <Table size="small">
                <MDBox component="thead">
                  <TableRow>
                    <DataTableHeadCell width="15%" align="left">Date</DataTableHeadCell>
                    <DataTableHeadCell width="15%" align="right">Achats</DataTableHeadCell>
                    <DataTableHeadCell width="20%" align="right">Valeur Achats</DataTableHeadCell>
                    <DataTableHeadCell width="15%" align="right">Ventes</DataTableHeadCell>
                    <DataTableHeadCell width="20%" align="right">Valeur Ventes</DataTableHeadCell>
                    <DataTableHeadCell width="15%" align="right">Net (Valeur)</DataTableHeadCell>
                  </TableRow>
                </MDBox>
                <TableBody>
                  {insiderData.slice(0, 30).map((item, index) => {
                    const purchases = parseNumber(item.purchases) || 0;
                    const sells = parseNumber(item.sells) || 0;
                    const purchasesNotional = Math.abs(parseNumber(item.purchases_notional) || 0);
                    const sellsNotional = Math.abs(parseNumber(item.sells_notional) || 0);
                    const netNotional = purchasesNotional - sellsNotional;

                    return (
                      <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                        <DataTableBodyCell align="left">
                          <MDTypography variant="body2">{formatDate(item.filing_date)}</MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" fontWeight="medium" color="success.main">
                            {purchases}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" fontWeight="medium" color="success.main">
                            {formatNumber(purchasesNotional)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" fontWeight="medium" color="error.main">
                            {sells}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" fontWeight="medium" color="error.main">
                            {formatNumber(sellsNotional)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography
                            variant="body2"
                            fontWeight="bold"
                            color={netNotional > 0 ? "success.main" : netNotional < 0 ? "error.main" : "text"}
                          >
                            {formatNumber(Math.abs(netNotional))}
                          </MDTypography>
                        </DataTableBodyCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            {insiderData.length > 30 && (
              <MDTypography variant="caption" color="text.secondary" mt={1} display="block">
                Affichage des 30 derniers jours sur {insiderData.length} jours disponibles
              </MDTypography>
            )}
          </MDBox>
        )}

        {insiderData.length === 0 && (
          <MDBox mt={3}>
            <MDTypography variant="body2" color="text">
              Aucune donnée Insider Buy/Sells disponible
            </MDTypography>
          </MDBox>
        )}
      </MDBox>
    </Card>
  );
}

export default InsiderBuySells;

