import { useMemo } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import VerticalBarChart from "/examples/Charts/BarCharts/VerticalBarChart";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

function TickerMonthlySeasonality({ data = [], loading = false, ticker = "" }) {
  const parseNumber = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const formatPercentage = (value) => {
    const num = parseNumber(value);
    return `${(num * 100).toFixed(2)}%`;
  };

  const getPercentageColor = (value) => {
    const num = parseNumber(value);
    if (num > 0) return "success";
    if (num < 0) return "error";
    return "text";
  };

  // Trier les données par mois
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => a.month - b.month);
  }, [data]);

  // Préparer les données pour le graphique
  const chartData = useMemo(() => {
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    const labels = sortedData.map((item) => monthNames[item.month - 1]);
    const avgChanges = sortedData.map((item) => parseNumber(item.avg_change) * 100);

    return {
      labels,
      datasets: [
        {
          label: "Avg Change %",
          color: "dark",
          data: avgChanges,
        },
      ],
    };
  }, [sortedData]);

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Ticker Monthly Seasonality
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
              Saisonnalité Mensuelle {ticker ? `(${ticker})` : ""} ({data.length} mois)
            </MDTypography>
            <Tooltip title="Rendement moyen par mois pour ce ticker">
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </MDBox>
          {data.length === 0 ? (
            <MDTypography variant="body2" color="text">
              Aucune donnée de saisonnalité disponible. Veuillez rechercher un ticker.
            </MDTypography>
          ) : (
            <>
              <VerticalBarChart
                icon={{ color: "info", component: "bar_chart" }}
                title={`${ticker} - Rendement moyen par mois`}
                description="Analyse de la saisonnalité mensuelle"
                chart={chartData}
              />
              <MDBox mt={3}>
                <TableContainer>
                  <Table size="small">
                    <MDBox component="thead">
                      <TableRow>
                        <DataTableHeadCell width="10%" align="left">Mois</DataTableHeadCell>
                        <DataTableHeadCell width="12%" align="right">Avg Change %</DataTableHeadCell>
                        <DataTableHeadCell width="12%" align="right">Median Change %</DataTableHeadCell>
                        <DataTableHeadCell width="12%" align="right">Max Change %</DataTableHeadCell>
                        <DataTableHeadCell width="12%" align="right">Min Change %</DataTableHeadCell>
                        <DataTableHeadCell width="12%" align="right">Positive Months %</DataTableHeadCell>
                        <DataTableHeadCell width="12%" align="right">Positive Closes</DataTableHeadCell>
                        <DataTableHeadCell width="12%" align="right">Years</DataTableHeadCell>
                      </TableRow>
                    </MDBox>
                    <TableBody>
                      {sortedData.map((item, index) => {
                        const monthNames = [
                          "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
                          "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
                        ];
                        const avgChange = parseNumber(item.avg_change);
                        const medianChange = parseNumber(item.median_change);
                        const maxChange = parseNumber(item.max_change);
                        const minChange = parseNumber(item.min_change);
                        const positiveMonthsPerc = parseNumber(item.positive_months_perc);

                        return (
                          <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                            <DataTableBodyCell align="left">
                              <MDTypography variant="body2" fontWeight="medium">
                                {monthNames[item.month - 1]}
                              </MDTypography>
                            </DataTableBodyCell>
                            <DataTableBodyCell align="right">
                              <MDTypography 
                                variant="body2" 
                                fontWeight="medium"
                                color={getPercentageColor(avgChange)}
                              >
                                {formatPercentage(avgChange)}
                              </MDTypography>
                            </DataTableBodyCell>
                            <DataTableBodyCell align="right">
                              <MDTypography 
                                variant="body2" 
                                color={getPercentageColor(medianChange)}
                              >
                                {formatPercentage(medianChange)}
                              </MDTypography>
                            </DataTableBodyCell>
                            <DataTableBodyCell align="right">
                              <MDTypography variant="body2" color="success.main">
                                {formatPercentage(maxChange)}
                              </MDTypography>
                            </DataTableBodyCell>
                            <DataTableBodyCell align="right">
                              <MDTypography variant="body2" color="error.main">
                                {formatPercentage(minChange)}
                              </MDTypography>
                            </DataTableBodyCell>
                            <DataTableBodyCell align="right">
                              <MDTypography variant="body2" fontWeight="medium" color="primary">
                                {formatPercentage(positiveMonthsPerc)}
                              </MDTypography>
                            </DataTableBodyCell>
                            <DataTableBodyCell align="right">
                              <MDTypography variant="body2" color="text.secondary">
                                {item.positive_closes || 0}
                              </MDTypography>
                            </DataTableBodyCell>
                            <DataTableBodyCell align="right">
                              <MDTypography variant="body2" color="text.secondary">
                                {item.years || 0}
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

export default TickerMonthlySeasonality;

