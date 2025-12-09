/**
 * SectorChart - Graphique en secteurs pour la rotation sectorielle
 */

import { useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import Card from "@mui/material/Card";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import colors from "/assets/theme/base/colors";

ChartJS.register(ArcElement, Tooltip, Legend);

function SectorChart({ title, sectors, type = "performance" }) {
  const chartData = useMemo(() => {
    if (!sectors || sectors.length === 0) {
      return null;
    }

    const colorPalette = [
      colors.info.main,
      colors.success.main,
      colors.warning.main,
      colors.error.main,
      colors.dark.main,
      colors.primary.main,
      colors.secondary.main,
    ];

    const labels = sectors.map((sector) => sector.sector);
    const data = sectors.map((sector) => {
      if (type === "performance") {
        return sector.change || 0;
      } else if (type === "tide") {
        return Math.abs(sector.currentTide || 0);
      }
      return 0;
    });

    const backgroundColors = sectors.map((_, index) => {
      const color = colorPalette[index % colorPalette.length];
      return color;
    });

    return {
      labels,
      datasets: [
        {
          label: type === "performance" ? "Performance (%)" : "Tide",
          data,
          backgroundColor: backgroundColors.map((color) => `${color}80`),
          borderColor: backgroundColors,
          borderWidth: 2,
        },
      ],
    };
  }, [sectors, type]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            padding: 15,
            font: {
              size: 11,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || "";
              const value = context.parsed || 0;
              return `${label}: ${value > 0 ? "+" : ""}${value.toFixed(1)}${type === "performance" ? "%" : ""}`;
            },
          },
        },
      },
    }),
    [type]
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
          <Doughnut data={chartData} options={chartOptions} />
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default SectorChart;



