/**
 * Calendrier économique Chine
 * Affiche les événements économiques chinois importants
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
import LinearProgress from "@mui/material/LinearProgress";
import economicCalendarService from "/services/economicCalendarService";
import EconomicEventItem from "./EconomicEventItem";

function ChinaCalendar() {
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
      
      // Récupérer les événements chinois
      const cnEvents = await economicCalendarService.getCountryEvents("CN", daysAhead, impactFilter);
      
      // Filtrer pour garder uniquement les événements importants
      // High impact OU événements avec mots-clés importants
      const importantKeywords = /(gdp|gross domestic product|cpi|inflation|consumer price|pmi|manufacturing|services|trade balance|current account|retail sales|industrial production|unemployment|employment|central bank|pboc|people's bank of china|interest rate|policy rate)/i;
      
      const filteredEvents = cnEvents.filter((e) => {
        // Garder High impact
        if (e.impact === "High") return true;
        
        // OU événements avec mots-clés importants
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
      console.error("Error loading China calendar:", err);
      setError(err.message || "Erreur lors du chargement du calendrier chinois");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      {loading && <LinearProgress color="info" />}
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
            🇨🇳 Chine
          </MDTypography>
          <MDTypography variant="caption" color="text.secondary">
            Événements économiques chinois importants
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
      <MDBox px={2} pb={2}>
        {error ? (
          <MDTypography variant="body2" color="error">
            {error}
          </MDTypography>
        ) : events.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucun événement prévu
          </MDTypography>
        ) : (
          <MDBox component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
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

export default ChinaCalendar;

