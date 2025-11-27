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

function IVRankTicker({ ticker = "", date = "", timespan = "1y" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticker) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = { timespan };
        if (date) params.date = date;
        
        const response = await unusualWhalesClient.getStockIVRank(ticker, params);
        const extracted = Array.isArray(response) ? response : (response?.data || []);
        // Trier par date
        extracted.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA - dateB;
        });
        setData(extracted);
      } catch (err) {
        console.error("Error loading IV rank:", err);
        setError(err.message || "Erreur lors du chargement");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ticker, date, timespan]);

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

  // Préparer les données pour le graphique
  const chartData = useMemo(() => {
    const labels = data.map((item) => formatDate(item.date));
    const ivRank = data.map((item) => parseNumber(item.iv_rank_1y) * 100);
    const volatility = data.map((item) => parseNumber(item.volatility) * 100);

    return {
      ivRankChart: {
        labels,
        datasets: [
          {
            label: "IV Rank %",
            color: "warning",
            data: ivRank,
          },
        ],
      },
      volatilityChart: {
        labels,
        datasets: [
          {
            label: "Volatility %",
            color: "info",
            data: volatility,
          },
        ],
      },
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
        <MDBox mb={3}>
          <MDBox display="flex" gap={3}>
            <MDBox flex={1}>
              <DefaultLineChart
                icon={{ color: "warning", component: "trending_up" }}
                title={`${ticker} - IV Rank`}
                description="IV Rank sur 1 an"
                chart={chartData.ivRankChart}
              />
            </MDBox>
            <MDBox flex={1}>
              <DefaultLineChart
                icon={{ color: "info", component: "show_chart" }}
                title={`${ticker} - Volatility`}
                description="Volatilité implicite"
                chart={chartData.volatilityChart}
              />
            </MDBox>
          </MDBox>
        </MDBox>
      )}
      <Card>
        <MDBox p={3}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h6">
              IV Rank ({ticker}) ({data.length})
            </MDTypography>
            <Tooltip title="IV Rank mesure où se situe la volatilité implicite actuelle par rapport à sa plage historique">
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
                    <DataTableHeadCell width="20%" align="left">Date</DataTableHeadCell>
                    <DataTableHeadCell width="15%" align="right">Close Price</DataTableHeadCell>
                    <DataTableHeadCell width="20%" align="right">IV Rank (1Y)</DataTableHeadCell>
                    <DataTableHeadCell width="20%" align="right">Volatility</DataTableHeadCell>
                    <DataTableHeadCell width="25%" align="left">Updated At</DataTableHeadCell>
                  </TableRow>
                </MDBox>
                <TableBody>
                  {data.map((item, index) => {
                    const ivRank = parseNumber(item.iv_rank_1y);
                    const volatility = parseNumber(item.volatility);
                    const closePrice = parseNumber(item.close);

                    return (
                      <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                        <DataTableBodyCell align="left">
                          <MDTypography variant="body2" fontWeight="medium">
                            {formatDate(item.date)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" color="primary">
                            ${closePrice.toFixed(2)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <Chip
                            label={formatPercentage(ivRank)}
                            color={ivRank > 0.75 ? "error" : ivRank > 0.5 ? "warning" : "success"}
                            size="small"
                          />
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" color="info.main">
                            {formatPercentage(volatility)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="left">
                          <MDTypography variant="caption" color="text.secondary">
                            {formatDate(item.updated_at)}
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

export default IVRankTicker;

