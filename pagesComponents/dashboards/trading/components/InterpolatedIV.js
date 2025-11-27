import { useState, useEffect, useMemo } from "react";
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
import Chip from "@mui/material/Chip";
import unusualWhalesClient from "/lib/unusual-whales/client";
import DefaultLineChart from "/examples/Charts/LineCharts/DefaultLineChart";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

function InterpolatedIV({ ticker = "", date = "" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticker) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = {};
        if (date) params.date = date;
        
        const response = await unusualWhalesClient.getStockInterpolatedIV(ticker, params);
        const extracted = Array.isArray(response) ? response : (response?.data || []);
        // Trier par days
        extracted.sort((a, b) => (a.days || 0) - (b.days || 0));
        setData(extracted);
      } catch (err) {
        console.error("Error loading interpolated IV:", err);
        setError(err.message || "Erreur lors du chargement");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ticker, date]);

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

  // Préparer les données pour le graphique
  const chartData = useMemo(() => {
    const labels = data.map((item) => `${item.days || 0}D`);
    const volatility = data.map((item) => parseNumber(item.volatility) * 100);

    return {
      labels,
      datasets: [
        {
          label: "Implied Volatility %",
          color: "info",
          data: volatility,
        },
      ],
    };
  }, [data]);

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <LinearProgress />
        </MDBox>
      </Card>
    );
  }

  return (
    <MDBox>
      {data.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <MDBox p={3}>
            <DefaultLineChart
              icon={{ color: "info", component: "show_chart" }}
              title={`${ticker} - Interpolated IV`}
              description="Volatilité implicite interpolée par horizon temporel"
              chart={chartData}
            />
          </MDBox>
        </Card>
      )}
      <Card>
        <MDBox p={3}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h6">
              Interpolated IV ({ticker}) ({data.length})
            </MDTypography>
            <Tooltip title="Volatilité implicite interpolée pour différents horizons temporels. Calculée via interpolation linéaire avec les 2 expirations les plus proches si aucune expiration n'est spécifiée.">
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </MDBox>
          {error && (
            <MDTypography variant="body2" color="error" mb={2}>
              {error}
            </MDTypography>
          )}
          {data.length === 0 ? (
            <MDTypography variant="body2" color="text">
              Aucune donnée disponible
            </MDTypography>
          ) : (
            <TableContainer>
              <Table size="small">
                <MDBox component="thead">
                  <TableRow>
                    <DataTableHeadCell width="15%" align="left">Days</DataTableHeadCell>
                    <DataTableHeadCell width="20%" align="right">Volatility</DataTableHeadCell>
                    <DataTableHeadCell width="20%" align="right">Implied Move %</DataTableHeadCell>
                    <DataTableHeadCell width="20%" align="right">Percentile</DataTableHeadCell>
                    <DataTableHeadCell width="25%" align="left">Date</DataTableHeadCell>
                  </TableRow>
                </MDBox>
                <TableBody>
                  {data.map((item, index) => {
                    const volatility = parseNumber(item.volatility);
                    const impliedMove = parseNumber(item.implied_move_perc);
                    const percentile = parseNumber(item.percentile);

                    return (
                      <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                        <DataTableBodyCell align="left">
                          <MDTypography variant="body2" fontWeight="bold" color="primary">
                            {item.days || 0}D
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" fontWeight="medium" color="info.main">
                            {formatPercentage(volatility)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" color="warning.main">
                            {formatPercentage(impliedMove)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <Chip
                            label={`${percentile.toFixed(1)}%`}
                            color={percentile > 75 ? "error" : percentile > 50 ? "warning" : "success"}
                            size="small"
                          />
                        </DataTableBodyCell>
                        <DataTableBodyCell align="left">
                          <MDTypography variant="caption" color="text.secondary">
                            {item.date || "N/A"}
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
    </MDBox>
  );
}

export default InterpolatedIV;


