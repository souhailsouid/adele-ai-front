/**
 * Calendrier économique combiné - High Impact uniquement
 * Combine les événements High Impact des 3 zones : US, Chine, Japon
 * Scrollable pour respecter la hauteur de la carte
 */

import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Skeleton from "@mui/material/Skeleton";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import economicCalendarService from "/services/economicCalendarService";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";
import Icon from "@mui/material/Icon";

function CombinedHighImpactCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Date d'aujourd'hui (début de journée)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const fromDate = today.toISOString().split("T")[0];
      
      // 90 jours dans le futur
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + 90);
      const toDate = futureDate.toISOString().split("T")[0];
      
      console.log(`[CombinedHighImpactCalendar] Loading High Impact events from ${fromDate} (today) to ${toDate}`);
      
      // Récupérer les événements High Impact des 3 zones en parallèle
      // Utiliser getEconomicEvents avec filtres par pays et impact
      const [usEvents, cnEvents, jpEvents] = await Promise.all([
        economicCalendarService.getEconomicEvents(90, "High", ["US"], fromDate, toDate).catch(() => []),
        economicCalendarService.getEconomicEvents(90, "High", ["CN"], fromDate, toDate).catch(() => []),
        economicCalendarService.getEconomicEvents(90, "High", ["JP"], fromDate, toDate).catch(() => []),
      ]);
      
      // Combiner tous les événements
      const allEvents = [...usEvents, ...cnEvents, ...jpEvents];
      
      // Filtrer uniquement High Impact et à partir d'aujourd'hui
      const todayStr = fromDate;
      const highImpactEvents = allEvents.filter((e) => {
        if (e.impact !== "High") return false;
        
        // Extraire la date de l'événement (peut être "2025-12-09" ou "2025-12-09 03:30:00")
        const eventDateStr = e.date ? e.date.split(" ")[0] : null;
        if (!eventDateStr) return false;
        
        // Ne garder que les événements à partir d'aujourd'hui
        return eventDateStr >= todayStr;
      });
      
      // Trier par date (croissant)
      highImpactEvents.sort((a, b) => {
        const dateA = a.date ? a.date.split(" ")[0] : "";
        const dateB = b.date ? b.date.split(" ")[0] : "";
        if (dateA !== dateB) {
          return dateA.localeCompare(dateB);
        }
        // Si même date, trier par heure
        const timeA = a.time || (a.date && a.date.includes(" ") ? a.date.split(" ")[1] : "00:00:00");
        const timeB = b.time || (b.date && b.date.includes(" ") ? b.date.split(" ")[1] : "00:00:00");
        return timeA.localeCompare(timeB);
      });
      
      console.log(`[CombinedHighImpactCalendar] Loaded ${highImpactEvents.length} High Impact events from today (${todayStr})`);
      setEvents(highImpactEvents);
    } catch (err) {
      console.error("Error loading combined High Impact calendar:", err);
      setError(err.message || "Erreur lors du chargement du calendrier");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      // Format compact : "lun. 8 déc" (sans année pour économiser de l'espace)
      return date.toLocaleDateString("fr-FR", {
        month: "short",
        day: "numeric",
        weekday: "short",
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      // Si la date contient une heure (format "2025-12-09 03:30:00")
      if (dateString.includes(" ")) {
        const timePart = dateString.split(" ")[1];
        return timePart.substring(0, 5); // HH:MM
      }
      return "";
    } catch {
      return "";
    }
  };

  const getCountryFlag = (country) => {
    const flags = {
      US: "🇺🇸",
      CN: "🇨🇳",
      JP: "🇯🇵",
    };
    return flags[country] || country;
  };

  const getCountryColor = (country) => {
    const colors = {
      US: "primary",
      CN: "error",
      JP: "warning",
    };
    return colors[country] || "default";
  };

  if (loading) {
    return (
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <MDBox p={1.5} sx={{ borderBottom: 1, borderColor: "divider" }}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <Skeleton variant="text" width={180} height={24} />
            <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 1 }} />
          </MDBox>
          <Skeleton variant="text" width={200} height={16} sx={{ mt: 0.25 }} />
        </MDBox>
        <TableContainer sx={{ flexGrow: 1, overflowY: "auto", maxHeight: "calc(100vh - 300px)" }}>
          <Table size="small" sx={{ "& .MuiTableCell-root": { padding: "6px 8px" } }}>
            <MDBox component="thead">
              <TableRow>
                <DataTableHeadCell width="22%" align="left">
                  <Skeleton variant="text" width={60} height={20} />
                </DataTableHeadCell>
                <DataTableHeadCell width="18%" align="left">
                  <Skeleton variant="text" width={50} height={20} />
                </DataTableHeadCell>
                <DataTableHeadCell width="60%" align="left">
                  <Skeleton variant="text" width={80} height={20} />
                </DataTableHeadCell>
              </TableRow>
            </MDBox>
            <TableBody>
              {[...Array(8)].map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <DataTableBodyCell align="left">
                    <Skeleton variant="text" width={80} height={20} />
                    <Skeleton variant="text" width={50} height={16} sx={{ mt: 0.25 }} />
                  </DataTableBodyCell>
                  <DataTableBodyCell align="left">
                    <Skeleton variant="rectangular" width={70} height={22} sx={{ borderRadius: 1 }} />
                  </DataTableBodyCell>
                  <DataTableBodyCell align="left">
                    <Skeleton variant="text" width="90%" height={20} />
                    <Skeleton variant="text" width="60%" height={16} sx={{ mt: 0.25 }} />
                  </DataTableBodyCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height: "100%" }}>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Calendrier High Impact
          </MDTypography>
          <MDTypography variant="body2" color="error">
            {error}
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <MDBox p={1.5} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h6" fontWeight="medium" sx={{ fontSize: "1rem" }}>
            Calendrier High Impact
          </MDTypography>
          <Chip
            label={`${events.length}`}
            size="small"
            color="error"
            icon={<Icon fontSize="small" sx={{ fontSize: "0.875rem !important" }}>event</Icon>}
            sx={{ 
              height: "24px",
              fontSize: "0.75rem",
              "& .MuiChip-label": { padding: "0 6px" }
            }}
          />
        </MDBox>
        <MDTypography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem", mt: 0.25 }}>
          US • Chine • Japon • À partir d&apos;aujourd&apos;hui
        </MDTypography>
      </MDBox>

      <TableContainer sx={{ flexGrow: 1, overflowY: "auto", maxHeight: "calc(100vh - 300px)" }}>
        <Table stickyHeader size="small" sx={{ "& .MuiTableCell-root": { padding: "6px 8px" } }}>
          <MDBox component="thead">
            <TableRow>
              <DataTableHeadCell width="22%" align="left" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>Date</DataTableHeadCell>
              <DataTableHeadCell width="18%" align="left" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>Pays</DataTableHeadCell>
              <DataTableHeadCell width="60%" align="left" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>Événement</DataTableHeadCell>
            </TableRow>
          </MDBox>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <DataTableBodyCell colSpan={3} align="center">
                  <MDTypography variant="body2" color="text.secondary" py={2} sx={{ fontSize: "0.8rem" }}>
                    Aucun événement High Impact prévu
                  </MDTypography>
                </DataTableBodyCell>
              </TableRow>
            ) : (
              events.map((event, index) => {
                const time = formatTime(event.date || event.time);
                return (
                  <TableRow
                    key={`event-${index}-${event.date}-${event.event}`}
                    sx={{ "&:hover": { backgroundColor: "action.hover" } }}
                  >
                    <DataTableBodyCell align="left" sx={{ py: 0.75 }}>
                      <MDBox>
                        <MDTypography variant="caption" fontWeight="medium" sx={{ fontSize: "0.75rem", lineHeight: 1.2 }}>
                          {formatDate(event.date)}
                        </MDTypography>
                        {time && (
                          <MDTypography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem", display: "block", mt: 0.25 }}>
                            {time}
                          </MDTypography>
                        )}
                      </MDBox>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left" sx={{ py: 0.75 }}>
                      <Chip
                        label={`${getCountryFlag(event.country)} ${event.country}`}
                        size="small"
                        color={getCountryColor(event.country)}
                        sx={{ 
                          fontSize: "0.7rem",
                          height: "22px",
                          "& .MuiChip-label": { padding: "0 6px" }
                        }}
                      />
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left" sx={{ py: 0.75 }}>
                      <MDTypography 
                        variant="caption" 
                        fontWeight="medium" 
                        sx={{ 
                          fontSize: "0.8rem", 
                          lineHeight: 1.3,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {event.event || "N/A"}
                      </MDTypography>
                      {event.currency && (
                        <MDTypography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem", display: "block", mt: 0.25 }}>
                          {event.currency}
                        </MDTypography>
                      )}
                    </DataTableBodyCell>
             
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

export default CombinedHighImpactCalendar;

