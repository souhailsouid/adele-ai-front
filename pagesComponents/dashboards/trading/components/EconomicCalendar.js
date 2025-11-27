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
    period: "thisMonth",
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

  // Calculer les dates selon la période
  const getPeriodDates = (periodValue, customFrom, customTo) => {
    if (periodValue === "custom" && customFrom && customTo) {
      return { from: customFrom, to: customTo };
    }
    
    const today = new Date();
    let from, to;
    
    switch (periodValue) {
      case "thisWeek":
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1);
        from = monday.toISOString().split("T")[0];
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        to = sunday.toISOString().split("T")[0];
        break;
      case "nextWeek":
        const nextMonday = new Date(today);
        nextMonday.setDate(today.getDate() - today.getDay() + 8);
        from = nextMonday.toISOString().split("T")[0];
        const nextSunday = new Date(nextMonday);
        nextSunday.setDate(nextMonday.getDate() + 6);
        to = nextSunday.toISOString().split("T")[0];
        break;
      case "thisMonth":
        from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0];
        break;
      case "nextMonth":
        from = new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString().split("T")[0];
        to = new Date(today.getFullYear(), today.getMonth() + 2, 0).toISOString().split("T")[0];
        break;
      case "thisQuarter":
        const quarter = Math.floor(today.getMonth() / 3);
        from = new Date(today.getFullYear(), quarter * 3, 1).toISOString().split("T")[0];
        to = new Date(today.getFullYear(), (quarter + 1) * 3, 0).toISOString().split("T")[0];
        break;
      case "next30Days":
        from = today.toISOString().split("T")[0];
        const future30 = new Date(today);
        future30.setDate(today.getDate() + 30);
        to = future30.toISOString().split("T")[0];
        break;
      default:
        from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0];
    }
    
    return { from, to };
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Calculer les dates selon la période
      const { from, to } = getPeriodDates(filters.period, filters.customFrom, filters.customTo);
      
      // Récupérer les événements avec les filtres et les dates spécifiques
      // Les trois pays autorisés : US, Chine, Japon
      const allowedCountries = ["US", "CN", "JP"];
      let data = [];
      
      // Déterminer les pays à filtrer
      // Si "all" est sélectionné, on prend les 3 pays autorisés
      // Sinon, on prend uniquement le pays sélectionné (mais on vérifie qu'il est autorisé)
      const countriesToFilter = filters.country !== "all" 
        ? (allowedCountries.includes(filters.country) ? [filters.country] : allowedCountries)
        : allowedCountries;
      
      const impact = filters.impact !== "all" ? filters.impact : null;
      
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
      
      // Filtrer pour s'assurer qu'on n'a que les pays autorisés (sécurité)
      data = data.filter((e) => allowedCountries.includes(e.country));
      
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
      
      // Filtrer les événements invalides
      const validEvents = data.filter((event) => {
        return event && typeof event === 'object' && event.date && event.event;
      });
      
      // Trier par date (croissant ou décroissant)
      validEvents.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (filters.sortOrder === "desc") {
          return dateB - dateA; // Décroissant (plus récent en premier)
        } else {
          return dateA - dateB; // Croissant (plus ancien en premier)
        }
      });
      
      setEvents(validEvents);
    } catch (err) {
      console.error("Error loading economic calendar:", err);
      setError(err.message || "Erreur lors du chargement du calendrier économique");
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
          <MDTypography variant="body2" color="text">
            Chargement...
          </MDTypography>
        ) : error ? (
          <MDTypography variant="body2" color="error">
            {error}
          </MDTypography>
        ) : events.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucun événement économique prévu
          </MDTypography>
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
                    key={index}
                    sx={{
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    <DataTableBodyCell align="left">
                      <MDBox>
                        <MDTypography variant="body2" fontWeight="medium">
                          {economicCalendarService.formatEventDate(event.date, event.country)}
                        </MDTypography>
                      </MDBox>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left">
                      <MDBox display="flex" alignItems="center" gap={0.5}>
                        <MDTypography variant="body2">
                          {getCountryFlag(event.country)}
                        </MDTypography>
                        <MDTypography variant="body2">
                          {event.country}
                        </MDTypography>
                      </MDBox>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left">
                      <MDTypography variant="body2" fontWeight="medium">
                        {event.event}
                      </MDTypography>
                      {event.currency && (
                        <MDTypography variant="caption" color="text.secondary">
                          {event.currency}
                        </MDTypography>
                      )}
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
                        label={event.impact || "N/A"}
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

