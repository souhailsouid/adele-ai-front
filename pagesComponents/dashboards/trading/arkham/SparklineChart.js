/**
 * Graphique Sparkline animé
 * Mini graphique de tendance pour les prix
 */

import { useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip
);

function SparklineChart({ symbol, price, change }) {
  const chartRef = useRef(null);

  // Générer des données de prix simulées pour le sparkline
  const generateSparklineData = () => {
    const dataPoints = 20;
    const basePrice = price || 100;
    const variation = (change || 0) / 100;
    const data = [];
    
    for (let i = 0; i < dataPoints; i++) {
      const progress = i / (dataPoints - 1);
      const randomVariation = (Math.random() - 0.5) * 0.02;
      const trend = variation * progress;
      data.push(basePrice * (1 + trend + randomVariation));
    }
    
    return data;
  };

  const data = generateSparklineData();
  const isPositive = (change || 0) >= 0;

  const chartData = {
    labels: data.map((_, i) => ""),
    datasets: [
      {
        label: symbol,
        data: data,
        borderColor: isPositive ? "#4caf50" : "#f44336",
        backgroundColor: isPositive
          ? "rgba(76, 175, 80, 0.1)"
          : "rgba(244, 67, 54, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart",
    },
  };

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
}

export default SparklineChart;



