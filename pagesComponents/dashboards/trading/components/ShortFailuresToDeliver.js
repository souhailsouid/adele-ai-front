import { useMemo } from "react";
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
import DefaultLineChart from "/examples/Charts/LineCharts/DefaultLineChart";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

function ShortFailuresToDeliver({ data = [], loading = false, ticker = "" }) {
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", { 
        year: "numeric", 
        month: "short", 
        day: "numeric"
      });
    } catch {
      return dateString;
    }
  };

  // Trier les données par date
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });
  }, [data]);

  // Préparer les données pour le graphique
  const chartData = useMemo(() => {
    const labels = sortedData.map((item) => formatDate(item.date));
    const quantities = sortedData.map((item) => parseNumber(item.quantity));

    return {
      labels,
      datasets: [
        {
          label: "Failures to Deliver",
          color: "error",
          data: quantities,
        },
      ],
    };
  }, [sortedData]);

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Failures to Deliver
          </MDTypography>
          <LinearProgress />
        </MDBox>
      </Card>
    );
  }

  return (
    <MDBox>
      <Card sx={{ mb: 3 }}>
        <MDBox p={3}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h6">
              Failures to Deliver {ticker ? `(${ticker})` : ""} ({data.length} jours)
            </MDTypography>
            <Tooltip title="Nombre de shares qui ont échoué à être livrées dans le processus de vente à découvert">
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </MDBox>
          {data.length === 0 ? (
            <MDTypography variant="body2" color="text">
              Aucune donnée de failures to deliver disponible. Veuillez rechercher un ticker.
            </MDTypography>
          ) : (
            <>
              <DefaultLineChart
                icon={{ color: "error", component: "trending_down" }}
                title={`${ticker} - Failures to Deliver`}
                description="Évolution des failures to deliver"
                chart={chartData}
              />
              <MDBox mt={3}>
                <TableContainer>
                  <Table size="small">
                    <MDBox component="thead">
                      <TableRow>
                        <DataTableHeadCell width="25%" align="left">Date</DataTableHeadCell>
                        <DataTableHeadCell width="25%" align="right">Price</DataTableHeadCell>
                        <DataTableHeadCell width="50%" align="right">Quantity</DataTableHeadCell>
                      </TableRow>
                    </MDBox>
                    <TableBody>
                      {sortedData.map((item, index) => {
                        const price = parseNumber(item.price);
                        const quantity = parseNumber(item.quantity);

                        return (
                          <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                            <DataTableBodyCell align="left">
                              <MDTypography variant="body2" fontWeight="medium">
                                {formatDate(item.date)}
                              </MDTypography>
                            </DataTableBodyCell>
                            <DataTableBodyCell align="right">
                              <MDTypography variant="body2" color="primary">
                                ${price.toFixed(2)}
                              </MDTypography>
                            </DataTableBodyCell>
                            <DataTableBodyCell align="right">
                              <MDTypography variant="body2" fontWeight="medium" color="error.main">
                                {formatNumber(quantity)}
                              </MDTypography>
                            </DataTableBodyCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </MDBox>
            </>
          )}
        </MDBox>
      </Card>
    </MDBox>
  );
}

export default ShortFailuresToDeliver;

