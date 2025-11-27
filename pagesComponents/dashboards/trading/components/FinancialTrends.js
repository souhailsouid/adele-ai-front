/**
 * Composant pour afficher les tendances financières
 */

import { Card } from "@mui/material";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function FinancialTrends({ analysis = null, loading = false }) {
  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Chargement...
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  if (!analysis || !analysis.incomeStatements || analysis.incomeStatements.length === 0) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Aucune donnée disponible
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  const statements = analysis.incomeStatements;
  const labels = statements.map((s) => s.date || "N/A").reverse();
  const revenueData = statements.map((s) => s.revenue || 0).reverse();
  const netIncomeData = statements.map((s) => s.netIncome || 0).reverse();
  const costData = statements.map((s) => s.costOfRevenue || 0).reverse();

  // Normaliser les données pour l'affichage (en millions)
  const normalize = (value) => value / 1_000_000;

  const revenueChartData = {
    labels,
    datasets: [
      {
        label: "Revenus (M$)",
        data: revenueData.map(normalize),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const profitChartData = {
    labels,
    datasets: [
      {
        label: "Résultat Net (M$)",
        data: netIncomeData.map(normalize),
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Coût des Revenus (M$)",
        data: costData.map(normalize),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const marginChartData = {
    labels,
    datasets: [
      {
        label: "Marge Brute (%)",
        data: analysis.grossProfitMargin ? [...analysis.grossProfitMargin].reverse() : [],
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Marge Nette (%)",
        data: analysis.netProfitMargin ? [...analysis.netProfitMargin].reverse() : [],
        borderColor: "rgb(255, 159, 64)",
        backgroundColor: "rgba(255, 159, 64, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  const getTrendLabel = (trend) => {
    const labels = {
      strong_growth: "Forte Croissance",
      moderate_growth: "Croissance Modérée",
      stable: "Stable",
      moderate_decline: "Déclin Modéré",
      strong_decline: "Forte Baisse",
      insufficient_data: "Données Insuffisantes",
    };
    return labels[trend] || trend;
  };

  const getTrendColor = (trend) => {
    const colors = {
      strong_growth: "success",
      moderate_growth: "info",
      stable: "text",
      moderate_decline: "warning",
      strong_decline: "error",
      insufficient_data: "text",
    };
    return colors[trend] || "text";
  };

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" fontWeight="medium" mb={3}>
          Tendances Financières
        </MDTypography>

        {/* Indicateurs de tendance */}
        <MDBox mb={3}>
          <MDBox display="flex" gap={2} flexWrap="wrap">
            <MDBox>
              <MDTypography variant="caption" color="text">
                Revenus:{" "}
              </MDTypography>
              <MDTypography
                variant="body2"
                fontWeight="medium"
                color={getTrendColor(analysis.trends?.revenue)}
              >
                {getTrendLabel(analysis.trends?.revenue)}
              </MDTypography>
            </MDBox>
            <MDBox>
              <MDTypography variant="caption" color="text">
                Résultat Net:{" "}
              </MDTypography>
              <MDTypography
                variant="body2"
                fontWeight="medium"
                color={getTrendColor(analysis.trends?.netIncome)}
              >
                {getTrendLabel(analysis.trends?.netIncome)}
              </MDTypography>
            </MDBox>
            <MDBox>
              <MDTypography variant="caption" color="text">
                Profitabilité:{" "}
              </MDTypography>
              <MDTypography
                variant="body2"
                fontWeight="medium"
                color={getTrendColor(analysis.trends?.profitability)}
              >
                {getTrendLabel(analysis.trends?.profitability)}
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>

        {/* Graphiques */}
        <MDBox mb={3}>
          <MDTypography variant="body2" fontWeight="medium" mb={2}>
            Évolution des Revenus
          </MDTypography>
          <MDBox height="250px">
            <Line data={revenueChartData} options={chartOptions} />
          </MDBox>
        </MDBox>

        <MDBox mb={3}>
          <MDTypography variant="body2" fontWeight="medium" mb={2}>
            Résultat Net vs Coûts
          </MDTypography>
          <MDBox height="250px">
            <Line data={profitChartData} options={chartOptions} />
          </MDBox>
        </MDBox>

        <MDBox>
          <MDTypography variant="body2" fontWeight="medium" mb={2}>
            Évolution des Marges
          </MDTypography>
          <MDBox height="250px">
            <Line data={marginChartData} options={chartOptions} />
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default FinancialTrends;

