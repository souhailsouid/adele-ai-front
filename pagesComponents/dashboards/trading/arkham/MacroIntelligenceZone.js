/**
 * Zone Macro Intelligence
 * Affiche les données macro : Market Tide, Sector Rotation, Calendrier économique
 */

import { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function MacroIntelligenceZone({ data = {}, loading = false }) {
  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Macro Intelligence
          </MDTypography>
          <LinearProgress />
        </MDBox>
      </Card>
    );
  }

  const marketTide = data.marketTide || {};
  const sectorRotation = data.sectorRotation || {};
  
  // S'assurer que economicCalendar est toujours un tableau
  let economicCalendar = data.economicCalendar;
  if (!Array.isArray(economicCalendar)) {
    // Si c'est un objet avec une propriété data ou events
    if (economicCalendar && typeof economicCalendar === 'object') {
      economicCalendar = economicCalendar.data || economicCalendar.events || economicCalendar.economicEvents || [];
    } else {
      economicCalendar = [];
    }
  }
  if (!Array.isArray(economicCalendar)) {
    economicCalendar = [];
  }

  // Préparer les données pour le graphique de rotation sectorielle
  const sectorData = Array.isArray(sectorRotation) 
    ? sectorRotation 
    : (sectorRotation.sectors || sectorRotation.data || []);
  
  const sectorChartData = {
    labels: sectorData.map((s) => s.sector || s.name || "N/A"),
    datasets: [
      {
        data: sectorData.map((s) => Math.abs(s.change || s.performance || s.value || 0)),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#FF6384",
          "#C9CBCF",
          "#4BC0C0",
          "#FF6384",
          "#36A2EB",
        ],
      },
    ],
  };

  // Filtrer les événements économiques importants
  const importantEvents = Array.isArray(economicCalendar)
    ? economicCalendar
        .filter((event) => {
          if (!event || typeof event !== 'object') return false;
          const eventName = (event.event || event.name || "").toLowerCase();
          return (
            event.impact === "High" ||
            eventName.includes("fed") ||
            eventName.includes("fomc") ||
            eventName.includes("boj") ||
            eventName.includes("ecb") ||
            eventName.includes("interest rate")
          );
        })
        .slice(0, 5)
    : [];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getMarketSentiment = (tide) => {
    if (!tide) return { label: "Neutre", color: "info", score: 50 };
    
    // Gérer différentes structures de réponse
    let overall = tide.overall;
    let sentimentStr = tide.sentiment;
    
    // Si overall n'est pas défini, essayer de le calculer depuis sentiment
    if (overall === undefined) {
      if (sentimentStr === "BULLISH") overall = 75;
      else if (sentimentStr === "BEARISH") overall = 25;
      else overall = 50;
    }
    
    // Convertir overall (0-100) en sentiment
    if (overall >= 70) return { label: "Très Bullish", color: "success", score: overall };
    if (overall >= 55) return { label: "Bullish", color: "success", score: overall };
    if (overall >= 45) return { label: "Neutre", color: "info", score: overall };
    if (overall >= 30) return { label: "Bearish", color: "warning", score: overall };
    return { label: "Très Bearish", color: "error", score: overall };
  };

  const sentiment = getMarketSentiment(marketTide);

  return (
    <Card>
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDTypography variant="h6" fontWeight="bold">
            Macro Intelligence
          </MDTypography>
          <Chip
            icon={<Icon>public</Icon>}
            label="Global"
            size="small"
            color="primary"
          />
        </MDBox>

        <Grid container spacing={3}>
          {/* Market Tide */}
          <Grid item xs={12}>
            <Card sx={{ p: 2, backgroundColor: "grey.50" }}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <MDTypography variant="body2" fontWeight="bold">
                  Market Tide
                </MDTypography>
                <Chip
                  label={sentiment.label}
                  size="small"
                  color={sentiment.color}
                />
              </MDBox>
              {sentiment.score !== undefined && (
                <MDBox>
                  <MDTypography variant="h4" fontWeight="bold" color={sentiment.color}>
                    {sentiment.score.toFixed(0)}/100
                  </MDTypography>
                  <MDTypography variant="caption" color="text.secondary">
                    Sentiment du marché
                  </MDTypography>
                  {marketTide.volatility && (
                    <MDBox mt={1}>
                      <Chip
                        label={`Volatilité: ${marketTide.volatility}`}
                        size="small"
                        color={
                          marketTide.volatility === "HIGH" ? "error" :
                          marketTide.volatility === "MEDIUM" ? "warning" : "info"
                        }
                      />
                    </MDBox>
                  )}
                </MDBox>
              )}
            </Card>
          </Grid>

          {/* Sector Rotation */}
          {sectorData.length > 0 && (
            <Grid item xs={12}>
              <MDBox mb={2}>
                <MDTypography variant="body2" fontWeight="bold" mb={1}>
                  Sector Rotation
                </MDTypography>
                <MDBox height={200}>
                  <Doughnut
                    data={sectorChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "right",
                          labels: {
                            boxWidth: 12,
                            font: { size: 10 },
                          },
                        },
                      },
                    }}
                  />
                </MDBox>
              </MDBox>
            </Grid>
          )}

          {/* Événements économiques importants */}
          {importantEvents.length > 0 && (
            <Grid item xs={12}>
              <MDTypography variant="body2" fontWeight="bold" mb={1}>
                Événements Macro Importants
              </MDTypography>
              <List dense>
                {importantEvents.map((event, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      backgroundColor: "grey.50",
                      mb: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    <ListItemIcon>
                      <Icon
                        color={
                          event.impact === "High"
                            ? "error"
                            : event.impact === "Medium"
                            ? "warning"
                            : "info"
                        }
                      >
                        {event.impact === "High" ? "warning" : "info"}
                      </Icon>
                    </ListItemIcon>
                    <ListItemText
                      primary={event.event || "N/A"}
                      secondary={
                        <>
                          {formatDate(event.date)} • {event.country}
                          {event.impact && (
                            <Chip
                              label={event.impact}
                              size="small"
                              sx={{ ml: 1, height: 18 }}
                              color={
                                event.impact === "High"
                                  ? "error"
                                  : event.impact === "Medium"
                                  ? "warning"
                                  : "info"
                              }
                            />
                          )}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          )}

          {!marketTide.sentiment && sectorData.length === 0 && importantEvents.length === 0 && (
            <Grid item xs={12}>
              <MDBox textAlign="center" py={4}>
                <MDTypography variant="body2" color="text.secondary">
                  Aucune donnée macro disponible
                </MDTypography>
              </MDBox>
            </Grid>
          )}
        </Grid>
      </MDBox>
    </Card>
  );
}

export default MacroIntelligenceZone;

