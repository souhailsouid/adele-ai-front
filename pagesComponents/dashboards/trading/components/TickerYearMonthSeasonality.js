import { useMemo } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import DefaultLineChart from "/examples/Charts/LineCharts/DefaultLineChart";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

function TickerYearMonthSeasonality({ data = [], loading = false, ticker = "" }) {
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

  const formatPrice = (value) => {
    const num = parseNumber(value);
    return `$${num.toFixed(2)}`;
  };

  const getPercentageColor = (value) => {
    const num = parseNumber(value);
    if (num > 0) return "success";
    if (num < 0) return "error";
    return "text";
  };

  // Trier les données par année puis par mois
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
  }, [data]);

  // Grouper par année pour le graphique
  const chartDataByYear = useMemo(() => {
    const years = [...new Set(sortedData.map((item) => item.year))];
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

    return years.map((year) => {
      const yearData = sortedData.filter((item) => item.year === year);
      const labels = yearData.map((item) => `${monthNames[item.month - 1]} ${year}`);
      const changes = yearData.map((item) => parseNumber(item.change) * 100);

      return {
        year,
        chart: {
          labels,
          datasets: [
            {
              label: "Change %",
              color: "info",
              data: changes,
            },
          ],
        },
      };
    });
  }, [sortedData]);

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Ticker Year-Month Seasonality
          </MDTypography>
          <LinearProgress />
        </MDBox>
      </Card>
    );
  }

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  return (
    <MDBox>
      <Card sx={{ mb: 3 }}>
        <MDBox p={3}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h6">
              Saisonnalité Année-Mois {ticker ? `(${ticker})` : ""} ({data.length} entrées)
            </MDTypography>
            <Tooltip title="Changement de prix relatif pour tous les mois passés sur plusieurs années">
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
              {chartDataByYear.map(({ year, chart }) => (
                <MDBox key={year} mb={3}>
                  <DefaultLineChart
                    icon={{ color: "info", component: "show_chart" }}
                    title={`${ticker} - ${year}`}
                    description="Changement de prix par mois"
                    chart={chart}
                  />
                </MDBox>
              ))}
              <MDBox mt={3}>
                <TableContainer>
                  <Table size="small">
                    <MDBox component="thead">
                      <TableRow>
                        <DataTableHeadCell width="10%" align="left">Année</DataTableHeadCell>
                        <DataTableHeadCell width="10%" align="left">Mois</DataTableHeadCell>
                        <DataTableHeadCell width="12%" align="right">Open</DataTableHeadCell>
                        <DataTableHeadCell width="12%" align="right">Close</DataTableHeadCell>
                        <DataTableHeadCell width="12%" align="right">Change %</DataTableHeadCell>
                      </TableRow>
                    </MDBox>
                    <TableBody>
                      {sortedData.map((item, index) => {
                        const change = parseNumber(item.change);

                        return (
                          <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                            <DataTableBodyCell align="left">
                              <MDTypography variant="body2" fontWeight="medium">
                                {item.year}
                              </MDTypography>
                            </DataTableBodyCell>
                            <DataTableBodyCell align="left">
                              <Chip label={monthNames[item.month - 1]} size="small" color="info" />
                            </DataTableBodyCell>
                            <DataTableBodyCell align="right">
                              <MDTypography variant="body2" color="text.secondary">
                                {formatPrice(item.open)}
                              </MDTypography>
                            </DataTableBodyCell>
                            <DataTableBodyCell align="right">
                              <MDTypography variant="body2" fontWeight="medium" color="primary">
                                {formatPrice(item.close)}
                              </MDTypography>
                            </DataTableBodyCell>
                            <DataTableBodyCell align="right">
                              <MDTypography 
                                variant="body2" 
                                fontWeight="medium"
                                color={getPercentageColor(change)}
                              >
                                {formatPercentage(change)}
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

export default TickerYearMonthSeasonality;


