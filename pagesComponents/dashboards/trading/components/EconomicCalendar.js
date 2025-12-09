import { useState, useEffect } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";
import economicCalendarService from "/services/economicCalendarService";
import EconomicCalendarFilters from "./EconomicCalendarFilters";

function EconomicCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("high"); // "high", "veryImportant", "all"
  const [filters, setFilters] = useState({
    period: "next30Days", // Par défaut, afficher les 30 prochains jours à partir d'aujourd'hui
    impact: "all",
    country: "all",
    customFrom: "",
    customTo: "",
    search: "",
    specificDate: "",
    sortOrder: "asc",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    if (newFilters.search !== undefined) {
      setSearchTerm(newFilters.search);
    }
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setFilters({ ...filters, search: value });
  };

  const handleSortChange = (sortOrder) => {
    setFilters({ ...filters, sortOrder });
  };

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, filters]);

  // Calculer les dates selon la période (toujours dynamique à partir de la date du jour)
  const getPeriodDates = (periodValue, customFrom, customTo) => {
    if (periodValue === "custom" && customFrom && customTo) {
      return { from: customFrom, to: customTo };
    }
    
    // Toujours utiliser la date du jour actuelle (dynamique)
    const today = new Date();
    // S'assurer que l'heure est à minuit pour éviter les problèmes de fuseau horaire
    today.setHours(0, 0, 0, 0);
    
    let from, to;
    
    switch (periodValue) {
      case "today":
        // Aujourd'hui uniquement
        from = today.toISOString().split("T")[0];
        to = today.toISOString().split("T")[0];
        break;
      case "thisWeek":
        // Semaine en cours (du lundi au dimanche)
        const monday = new Date(today);
        const dayOfWeek = today.getDay(); // 0 = dimanche, 1 = lundi, etc.
        const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        monday.setDate(today.getDate() + daysToMonday);
        monday.setHours(0, 0, 0, 0);
        from = monday.toISOString().split("T")[0];
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        to = sunday.toISOString().split("T")[0];
        break;
      case "nextWeek":
        // Semaine prochaine
        const nextMonday = new Date(today);
        const nextDayOfWeek = today.getDay();
        const nextDaysToMonday = dayOfWeek === 0 ? 1 : 8 - nextDayOfWeek;
        nextMonday.setDate(today.getDate() + nextDaysToMonday);
        nextMonday.setHours(0, 0, 0, 0);
        from = nextMonday.toISOString().split("T")[0];
        const nextSunday = new Date(nextMonday);
        nextSunday.setDate(nextMonday.getDate() + 6);
        to = nextSunday.toISOString().split("T")[0];
        break;
      case "thisMonth":
        // Mois en cours (du 1er au dernier jour du mois)
        from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0];
        break;
      case "nextMonth":
        // Mois prochain
        from = new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString().split("T")[0];
        to = new Date(today.getFullYear(), today.getMonth() + 2, 0).toISOString().split("T")[0];
        break;
      case "thisQuarter":
        // Trimestre en cours
        const quarter = Math.floor(today.getMonth() / 3);
        from = new Date(today.getFullYear(), quarter * 3, 1).toISOString().split("T")[0];
        to = new Date(today.getFullYear(), (quarter + 1) * 3, 0).toISOString().split("T")[0];
        break;
      case "next30Days":
        // 30 prochains jours à partir d'aujourd'hui
        from = today.toISOString().split("T")[0];
        const future30 = new Date(today);
        future30.setDate(today.getDate() + 30);
        to = future30.toISOString().split("T")[0];
        break;
      case "next90Days":
        // 90 prochains jours à partir d'aujourd'hui
        from = today.toISOString().split("T")[0];
        const future90 = new Date(today);
        future90.setDate(today.getDate() + 90);
        to = future90.toISOString().split("T")[0];
        break;
      default:
        // Par défaut : 30 prochains jours à partir d'aujourd'hui
        from = today.toISOString().split("T")[0];
        const defaultFuture = new Date(today);
        defaultFuture.setDate(today.getDate() + 30);
        to = defaultFuture.toISOString().split("T")[0];
    }
    
    console.log(`[EconomicCalendar] Calculated dates for period "${periodValue}": from ${from} to ${to}`);
    return { from, to };
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Calculer les dates selon la période
      const { from, to } = getPeriodDates(filters.period, filters.customFrom, filters.customTo);
      
      console.log("[EconomicCalendar] Loading events with filters:", {
        filter,
        filters,
        from,
        to,
      });
      
      // Récupérer les événements avec les filtres et les dates spécifiques
      // Pour les événements High impact, on inclut tous les pays majeurs (US, CN, JP, EU, GB, etc.)
      // Pour les autres filtres, on peut restreindre aux pays majeurs
      const majorCountries = ["US", "CN", "JP", "EU", "GB", "DE", "FR", "CA", "AU", "NZ"];
      const allowedCountries = ["US", "CN", "JP"]; // Pays par défaut pour les filtres normaux
      let data = [];
      
      // Déterminer les pays à filtrer
      // Si "all" est sélectionné, on prend tous les pays majeurs pour voir plus d'événements
      // Sinon, on prend uniquement le pays sélectionné
      const countriesToFilter = filters.country !== "all" 
        ? (majorCountries.includes(filters.country) ? [filters.country] : allowedCountries)
        : majorCountries; // Utiliser majorCountries au lieu de allowedCountries pour voir plus d'événements
      
      const impact = filters.impact !== "all" ? filters.impact : null;
      
      console.log("[EconomicCalendar] Calling API with:", {
        daysAhead: 90,
        impact: filter === "high" ? "High" : impact,
        countries: countriesToFilter,
        from,
        to,
      });
      
      // Utiliser directement l'API avec from/to
      if (filter === "high") {
        // Uniquement High impact
        data = await economicCalendarService.getEconomicEvents(
          90, // daysAhead de secours
          "High",
          countriesToFilter, // Utiliser le filtre de pays
          from, // Utiliser les dates calculées
          to
        );
      } else if (filter === "veryImportant") {
        // High impact + événements importants
        const allEvents = await economicCalendarService.getEconomicEvents(
          90,
          null,
          countriesToFilter, // Utiliser le filtre de pays
          from,
          to
        );
        console.log("[EconomicCalendar] Received", allEvents?.length || 0, "events before filtering");
        // Appliquer le filtre "très importants" manuellement
        data = allEvents.filter((e) => {
          // Vérifier d'abord que le pays correspond au filtre
          if (!countriesToFilter.includes(e.country)) return false;
          
          // Garder uniquement les événements High impact
          if (e.impact === "High") return true;
          // OU les événements qui correspondent aux mots-clés importants pour les pays majeurs
          const importantKeywords = /(interest rate|fed|fomc|ecb|boj|boc|boe|rba|riksbank|snb|cpi|inflation|gdp|gross domestic product|non-farm payrolls|unemployment rate|retail sales|tankan|pboc|people's bank of china)/i;
          if (importantKeywords.test(e.event)) {
            return true;
          }
          return false;
        });
      } else {
        // Tous les événements avec les filtres appliqués
        data = await economicCalendarService.getEconomicEvents(
          90, // daysAhead de secours
          impact,
          countriesToFilter, // Utiliser le filtre de pays
          from, // Utiliser les dates calculées
          to
        );
      }
      
      console.log("[EconomicCalendar] Received", data?.length || 0, "events from API");
      
      // Filtrer pour s'assurer qu'on n'a que les pays majeurs (sécurité)
      // Mais seulement si un filtre de pays spécifique est appliqué
      if (filters.country !== "all") {
        const beforeCountryFilter = data.length;
        const targetCountries = filters.country !== "all" 
          ? (majorCountries.includes(filters.country) ? [filters.country] : allowedCountries)
          : majorCountries;
        data = data.filter((e) => targetCountries.includes(e.country));
        console.log("[EconomicCalendar] After country filter:", data.length, "events (was", beforeCountryFilter, ")");
      } else {
        // Si "all" est sélectionné, on garde tous les pays majeurs
        const beforeCountryFilter = data.length;
        data = data.filter((e) => majorCountries.includes(e.country));
        console.log("[EconomicCalendar] After major countries filter:", data.length, "events (was", beforeCountryFilter, ")");
      }
      
      // Filtrer par date spécifique si sélectionnée
      if (filters.specificDate) {
        const specificDateStr = filters.specificDate;
        data = data.filter((event) => {
          if (!event.date) return false;
          const eventDate = new Date(event.date).toISOString().split("T")[0];
          return eventDate === specificDateStr;
        });
      }
      
      // Filtrer par recherche (si terme de recherche)
      if (searchTerm && searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        data = data.filter((event) => {
          return (
            (event.event && event.event.toLowerCase().includes(searchLower)) ||
            (event.country && event.country.toLowerCase().includes(searchLower))
          );
        });
      }
      
      // Filtrer les événements invalides et normaliser les données
      // Note: Le service normalise déjà les données, mais on s'assure qu'elles sont complètes
      const validEvents = data
        .filter((event) => {
          return event && typeof event === 'object' && (event.date || event.event);
        })
        .map((event) => {
          // Les données sont déjà normalisées par le service, mais on ajoute des valeurs par défaut si nécessaire
          // Extraire l'heure de la date si elle contient une heure (format "2025-12-09 03:30:00")
          let time = event.time || null;
          if (!time && event.date && typeof event.date === 'string' && event.date.includes(' ')) {
            const dateParts = event.date.split(' ');
            if (dateParts.length > 1) {
              time = dateParts[1].substring(0, 5); // Prendre seulement HH:MM
            }
          }
          
          return {
            date: event.date || event.releaseDate || '',
            event: event.event || event.name || event.title || 'N/A',
            country: event.country || event.countryCode || 'N/A',
            currency: event.currency || null,
            previous: event.previous !== undefined && event.previous !== null ? Number(event.previous) : null,
            estimate: event.estimate !== undefined && event.estimate !== null ? Number(event.estimate) : null,
            actual: event.actual !== undefined && event.actual !== null ? Number(event.actual) : null,
            change: event.change !== undefined && event.change !== null ? Number(event.change) : null,
            changePercentage: event.changePercentage !== undefined && event.changePercentage !== null ? Number(event.changePercentage) : null,
            impact: event.impact || event.importance || 'N/A',
            unit: event.unit || null,
            source: event.source || 'FMP', // BOTH, FMP, ou UW
            time: time,
          };
        });
      
      // Trier par date (croissant ou décroissant)
      validEvents.sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        if (filters.sortOrder === "desc") {
          return dateB - dateA; // Décroissant (plus récent en premier)
        } else {
          return dateA - dateB; // Croissant (plus ancien en premier)
        }
      });
      
      console.log(`[EconomicCalendar] Loaded ${validEvents.length} valid economic events`);
      
      if (validEvents.length === 0 && data.length > 0) {
        console.warn("[EconomicCalendar] Warning: Received data but no valid events after filtering");
        setError("Aucun événement ne correspond aux filtres sélectionnés. Essayez de modifier les filtres.");
      } else if (validEvents.length === 0) {
        console.warn("[EconomicCalendar] Warning: No events received from API");
        setError("Aucun événement économique disponible pour la période sélectionnée.");
      }
      
      setEvents(validEvents);
    } catch (err) {
      console.error("[EconomicCalendar] Error loading economic calendar:", err);
      console.error("[EconomicCalendar] Error details:", {
        message: err.message,
        stack: err.stack,
        response: err.response,
      });
      setError(err.message || "Erreur lors du chargement du calendrier économique. Vérifiez votre connexion et réessayez.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setFilter(newValue);
  };

  const getCountryFlag = (country) => {
    const flags = {
      US: "🇺🇸",
      EU: "🇪🇺",
      GB: "🇬🇧",
      JP: "🇯🇵",
      CN: "🇨🇳",
      DE: "🇩🇪",
      FR: "🇫🇷",
      CA: "🇨🇦",
      AU: "🇦🇺",
    };
    return flags[country] || country;
  };

  return (
    <Card>
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDTypography variant="h6">
            Calendrier Économique
          </MDTypography>
          {events.length > 0 && (
            <MDBox display="flex" alignItems="center" gap={1}>
              <Icon fontSize="small" color="text.secondary">
                {filters.sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
              </Icon>
              <MDTypography variant="caption" color="text.secondary">
                {events.length} événement{events.length > 1 ? "s" : ""} - Tri {filters.sortOrder === "asc" ? "croissant" : "décroissant"}
              </MDTypography>
            </MDBox>
          )}
        </MDBox>

        {/* Filtres intuitifs pour traders */}
        <EconomicCalendarFilters
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
          onSortChange={handleSortChange}
          initialFilters={filters}
        />

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={filter}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 48,
              "& .MuiTab-root": {
                minHeight: 48,
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.875rem",
                padding: "12px 16px",
              },
              "& .Mui-selected": {
                fontWeight: 600,
              },
            }}
          >
            <Tab label="High Impact" value="high" />
            <Tab label="Très Importants" value="veryImportant" />

          </Tabs>
        </Box>

        {loading ? (
          <MDBox textAlign="center" py={4}>
            <MDTypography variant="body2" color="text">
              Chargement des événements économiques...
            </MDTypography>
          </MDBox>
        ) : error ? (
          <MDBox p={3} sx={{ backgroundColor: "error.lighter", borderRadius: 1 }}>
            <MDBox display="flex" alignItems="center" gap={1} mb={1}>
              <Icon color="error">error</Icon>
              <MDTypography variant="h6" color="error">
                Erreur
              </MDTypography>
            </MDBox>
            <MDTypography variant="body2" color="error">
              {error}
            </MDTypography>
            <MDBox mt={2}>
              <MDTypography variant="caption" color="text.secondary">
                Vérifiez votre connexion internet et réessayez. Si le problème persiste, contactez le support.
              </MDTypography>
            </MDBox>
          </MDBox>
        ) : events.length === 0 ? (
          <MDBox textAlign="center" py={4}>
            <Icon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}>event_busy</Icon>
            <MDTypography variant="h6" color="text.secondary" mb={1}>
              Aucun événement économique prévu
            </MDTypography>
            <MDTypography variant="body2" color="text.secondary">
              Essayez de modifier les filtres ou la période pour voir plus d&apos;événements.
            </MDTypography>
          </MDBox>
        ) : (
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="15%" align="left">
                    Date
                  </DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="left">
                    Pays
                  </DataTableHeadCell>
                  <DataTableHeadCell width="35%" align="left">
                    Événement
                  </DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">
                    Précédent
                  </DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">
                    Estimé
                  </DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">
                    Réel
                  </DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="center">
                    Impact
                  </DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {events.map((event, index) => (
                  <TableRow
                    key={`event-${index}-${event.date}-${event.event}`}
                    sx={{
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    <DataTableBodyCell align="left">
                      <MDBox>
                        <MDTypography variant="body2" fontWeight="medium">
                          {economicCalendarService.formatEventDate(
                            event.time 
                              ? `${event.date} ${event.time}` 
                              : event.date, 
                            event.country
                          )}
                        </MDTypography>
                      </MDBox>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left">
                      <MDBox display="flex" alignItems="center" gap={0.5}>
                        <MDTypography variant="body2">
                          {event.country && event.country !== 'N/A' ? getCountryFlag(event.country) : ''}
                        </MDTypography>
                        <MDTypography variant="body2">
                          {event.country && event.country !== 'N/A' ? event.country : 'N/A'}
                        </MDTypography>
                      </MDBox>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left">
                      <MDBox>
                        <MDTypography variant="body2" fontWeight="medium">
                          {event.event}
                        </MDTypography>
                        <MDBox display="flex" alignItems="center" gap={1} mt={0.5}>
                          {event.currency && (
                            <MDTypography variant="caption" color="text.secondary">
                              {event.currency}
                            </MDTypography>
                          )}
                          {event.source && (
                            <Chip
                              label={event.source}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                '& .MuiChip-label': {
                                  padding: '0 6px',
                                },
                              }}
                              color={
                                event.source === 'BOTH' ? 'success' :
                                event.source === 'FMP' ? 'primary' :
                                event.source === 'UW' ? 'secondary' : 'default'
                              }
                            />
                          )}
                        </MDBox>
                      </MDBox>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="right">
                      <MDTypography variant="body2" color="text.secondary">
                        {event.previous !== null && event.previous !== undefined && typeof event.previous === 'number'
                          ? event.previous.toFixed(2)
                          : "N/A"}
                      </MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="right">
                      <MDTypography variant="body2" color="info">
                        {event.estimate !== null && event.estimate !== undefined && typeof event.estimate === 'number'
                          ? event.estimate.toFixed(2)
                          : "N/A"}
                      </MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="right">
                      {event.actual !== null && event.actual !== undefined && typeof event.actual === 'number' ? (
                        <MDBox>
                          <MDTypography
                            variant="body2"
                            fontWeight="bold"
                            color={
                              event.change !== null && event.change !== undefined && typeof event.change === 'number'
                                ? (event.change >= 0 ? "success" : "error")
                                : "text"
                            }
                          >
                            {event.actual.toFixed(2)}
                          </MDTypography>
                          {event.change !== null &&
                            event.change !== undefined &&
                            typeof event.change === 'number' && (
                              <MDTypography
                                variant="caption"
                                color={
                                  event.change >= 0
                                    ? "success"
                                    : "error"
                                }
                              >
                                {event.change >= 0 ? "+" : ""}
                                {event.change.toFixed(2)}
                              </MDTypography>
                            )}
                        </MDBox>
                      ) : (
                        <MDTypography variant="body2" color="text.secondary">
                          N/A
                        </MDTypography>
                      )}
                    </DataTableBodyCell>
                    <DataTableBodyCell align="center">
                      <Chip
                        label={event.impact && event.impact !== 'N/A' ? event.impact : "N/A"}
                        color={economicCalendarService.getImpactColor(
                          event.impact
                        )}
                        size="small"
                      />
                    </DataTableBodyCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </MDBox>
    </Card>
  );
}

export default EconomicCalendar;

