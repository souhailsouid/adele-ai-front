import { useMemo } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import Grid from "@mui/material/Grid";
import VerticalBarChart from "/examples/Charts/BarCharts/VerticalBarChart";

function MarketSeasonality({ data = [], loading = false }) {
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

  // Grouper les données par ticker
  const dataByTicker = useMemo(() => {
    const grouped = {};
    data.forEach((item) => {
      if (!grouped[item.ticker]) {
        grouped[item.ticker] = [];
      }
      grouped[item.ticker].push(item);
    });

    // Trier chaque groupe par mois
    Object.keys(grouped).forEach((ticker) => {
      grouped[ticker].sort((a, b) => a.month - b.month);
    });

    return grouped;
  }, [data]);

  // Préparer les données pour les graphiques
  const chartData = useMemo(() => {
    const tickers = Object.keys(dataByTicker);
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

    return tickers.map((ticker) => {
      const tickerData = dataByTicker[ticker];
      const labels = tickerData.map((item) => monthNames[item.month - 1]);
      const avgChanges = tickerData.map((item) => parseNumber(item.avg_change) * 100);

      return {
        ticker,
        chart: {
          labels,
          datasets: [
            {
              label: "Avg Change %",
              color: "dark",
              data: avgChanges,
            },
          ],
        },
      };
    });
  }, [dataByTicker]);

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Market Seasonality
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
              Market Seasonality ({Object.keys(dataByTicker).length} tickers)
            </MDTypography>
            <Tooltip title="Rendements moyens par mois pour SPY, QQQ, IWM, XLE, XLC, XLK, XLV, XLP, XLY, XLRE, XLF, XLI, XLB">
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </MDBox>
          {data.length === 0 ? (
            <MDTypography variant="body2" color="text">
              Aucune donnée de saisonnalité disponible
            </MDTypography>
          ) : (
            <Grid container spacing={3}>
              {chartData.map(({ ticker, chart }) => (
                <Grid item xs={12} md={6} lg={4} key={ticker}>
                  <VerticalBarChart
                    icon={{ color: "info", component: "bar_chart" }}
                    title={ticker}
                    description="Rendement moyen par mois"
                    chart={chart}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </MDBox>
      </Card>
    </MDBox>
  );
}

export default MarketSeasonality;


