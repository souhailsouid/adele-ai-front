/**
 * RadarChart - Graphique radar pour le scoring breakdown
 */

import { useMemo } from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import Card from "@mui/material/Card";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import colors from "/assets/theme/base/colors";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

function RadarChart({ title, breakdown, maxScore = 100 }) {
  const chartData = useMemo(() => {
    if (!breakdown) {
      return null;
    }

    const labels = Object.keys(breakdown).map((key) =>
      key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim()
    );

    const data = Object.values(breakdown);

    return {
      labels,
      datasets: [
        {
          label: "Score",
          data,
          backgroundColor: "rgba(33, 150, 243, 0.2)",
          borderColor: colors.info.main,
          borderWidth: 2,
          pointBackgroundColor: colors.info.main,
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: colors.info.main,
        },
      ],
    };
  }, [breakdown]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          max: maxScore,
          ticks: {
            stepSize: 20,
            font: {
              size: 10,
            },
          },
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
          },
          pointLabels: {
            font: {
              size: 11,
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `${context.label}: ${context.parsed.r}/${maxScore}`;
            },
          },
        },
      },
    }),
    [maxScore]
  );

  if (!chartData) {
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

  return (
    <Card>
      <MDBox p={3}>
        {title && (
          <MDTypography variant="h6" fontWeight="medium" mb={2}>
            {title}
          </MDTypography>
        )}
        <MDBox sx={{ height: "400px", position: "relative" }}>
          <Radar data={chartData} options={chartOptions} />
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default RadarChart;



