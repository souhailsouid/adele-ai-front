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

function ShortVolumeAndRatio({ data = [], loading = false, ticker = "" }) {
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

  const formatPercentage = (value) => {
    const num = parseNumber(value);
    return `${(num * 100).toFixed(2)}%`;
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
      const dateA = new Date(a.market_date);
      const dateB = new Date(b.market_date);
      return dateA - dateB;
    });
  }, [data]);

  // Préparer les données pour les graphiques
  const chartData = useMemo(() => {
    const labels = sortedData.map((item) => formatDate(item.market_date));
    const shortVolumes = sortedData.map((item) => parseNumber(item.short_volume));
    const totalVolumes = sortedData.map((item) => parseNumber(item.total_volume));
    const ratios = sortedData.map((item) => parseNumber(item.short_volume_ratio) * 100);

    return {
      volumeChart: {
        labels,
        datasets: [
          {
            label: "Short Volume",
            color: "error",
            data: shortVolumes,
          },
          {
            label: "Total Volume",
            color: "info",
            data: totalVolumes,
          },
        ],
      },
      ratioChart: {
        labels,
        datasets: [
          {
            label: "Short Volume Ratio %",
            color: "warning",
            data: ratios,
          },
        ],
      },
    };
  }, [sortedData]);

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Short Volume & Ratio
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
              Short Volume & Ratio {ticker ? `(${ticker})` : ""} ({data.length} jours)
            </MDTypography>
            <Tooltip title="Volume de short et ratio de short volume par rapport au volume total">
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </MDBox>
          {data.length === 0 ? (
            <MDTypography variant="body2" color="text">
              Aucune donnée de short volume disponible. Veuillez rechercher un ticker.
            </MDTypography>
          ) : (
            <>
              <MDBox mb={3}>
                <DefaultLineChart
                  icon={{ color: "info", component: "bar_chart" }}
                  title={`${ticker} - Short Volume vs Total Volume`}
                  description="Comparaison des volumes"
                  chart={chartData.volumeChart}
                />
              </MDBox>
              <MDBox mb={3}>
                <DefaultLineChart
                  icon={{ color: "warning", component: "trending_up" }}
                  title={`${ticker} - Short Volume Ratio`}
                  description="Ratio de short volume en pourcentage"
                  chart={chartData.ratioChart}
                />
              </MDBox>
              <TableContainer>
                <Table size="small">
                  <MDBox component="thead">
                    <TableRow>
                      <DataTableHeadCell width="25%" align="left">Date</DataTableHeadCell>
                      <DataTableHeadCell width="25%" align="right">Short Volume</DataTableHeadCell>
                      <DataTableHeadCell width="25%" align="right">Total Volume</DataTableHeadCell>
                      <DataTableHeadCell width="25%" align="right">Short Volume Ratio</DataTableHeadCell>
                    </TableRow>
                  </MDBox>
                  <TableBody>
                    {sortedData.map((item, index) => {
                      const shortVolume = parseNumber(item.short_volume);
                      const totalVolume = parseNumber(item.total_volume);
                      const ratio = parseNumber(item.short_volume_ratio);

                      return (
                        <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                          <DataTableBodyCell align="left">
                            <MDTypography variant="body2" fontWeight="medium">
                              {formatDate(item.market_date)}
                            </MDTypography>
                          </DataTableBodyCell>
                          <DataTableBodyCell align="right">
                            <MDTypography variant="body2" color="error">
                              {formatNumber(shortVolume)}
                            </MDTypography>
                          </DataTableBodyCell>
                          <DataTableBodyCell align="right">
                            <MDTypography variant="body2" color="info">
                              {formatNumber(totalVolume)}
                            </MDTypography>
                          </DataTableBodyCell>
                          <DataTableBodyCell align="right">
                            <MDTypography variant="body2" fontWeight="medium" color="warning">
                              {formatPercentage(ratio)}
                            </MDTypography>
                          </DataTableBodyCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </MDBox>
      </Card>
    </MDBox>
  );
}

export default ShortVolumeAndRatio;

