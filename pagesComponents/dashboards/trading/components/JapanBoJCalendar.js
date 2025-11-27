/**
 * Calendrier économique Japon & BoJ
 * Affiche les événements économiques japonais importants
 */

import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import Grid from "@mui/material/Grid";
import economicCalendarService from "/services/economicCalendarService";
import EconomicEventItem from "./EconomicEventItem";

function JapanBoJCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("30");
  const [impact, setImpact] = useState("all");

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, impact]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const daysAhead = parseInt(period) || 30;
      const impactFilter = impact !== "all" ? impact : null;
      
      // Récupérer les événements japonais
      const jpEvents = await economicCalendarService.getCountryEvents("JP", daysAhead, impactFilter);
      
      // Filtrer pour garder uniquement les événements importants
      const importantKeywords = /(boj|bank of japan|interest rate|policy rate|monetary policy|cpi|inflation|consumer price|gdp|gross domestic product|unemployment|retail sales|employment|pmi|manufacturing|services|trade balance|current account|tankan)/i;
      
      const filteredEvents = jpEvents.filter((e) => {
        // Garder tous les High impact
        if (e.impact === "High") return true;
        // Garder les événements correspondant aux mots-clés importants
        if (importantKeywords.test(e.event)) return true;
        return false;
      });
      
      // Trier par date
      filteredEvents.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      });
      
      setEvents(filteredEvents);
    } catch (err) {
      console.error("Error loading Japan/BoJ calendar:", err);
      setError(err.message || "Erreur lors du chargement du calendrier Japon/BoJ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox
        pt={2}
        px={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <MDBox>
          <MDTypography variant="h6" fontWeight="medium">
            🇯🇵 Japon & BoJ
          </MDTypography>
          <MDTypography variant="caption" color="text.secondary">
            Événements économiques japonais importants
          </MDTypography>
        </MDBox>
      </MDBox>
      <MDBox px={2} mb={2}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControl variant="standard" fullWidth>
              <InputLabel>Période</InputLabel>
              <Select
                value={period}
                label="Période"
                onChange={(e) => setPeriod(e.target.value)}
              >
                <MenuItem value="7">7 jours</MenuItem>
                <MenuItem value="14">14 jours</MenuItem>
                <MenuItem value="30">30 jours</MenuItem>
                <MenuItem value="60">60 jours</MenuItem>
                <MenuItem value="90">90 jours</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl variant="standard" fullWidth>
              <InputLabel>Impact</InputLabel>
              <Select
                value={impact}
                label="Impact"
                onChange={(e) => setImpact(e.target.value)}
              >
                <MenuItem value="all">Tous</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </MDBox>
      <MDBox p={2}>
        {loading ? (
          <MDTypography variant="body2" color="text">
            Chargement...
          </MDTypography>
        ) : error ? (
          <MDTypography variant="body2" color="error">
            {error}
          </MDTypography>
        ) : events.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucun événement prévu
          </MDTypography>
        ) : (
          <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
            {events.map((event, index) => (
              <EconomicEventItem
                key={index}
                event={event}
                noGutter={index === events.length - 1}
              />
            ))}
          </MDBox>
        )}
      </MDBox>
    </Card>
  );
}

export default JapanBoJCalendar;

