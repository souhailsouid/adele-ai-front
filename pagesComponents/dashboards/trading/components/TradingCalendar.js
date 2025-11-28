/**
 * Composant Calendar pour afficher les événements à venir (earnings, calendrier économique)
 */

import Calendar from "/examples/Calendar";
import { useMemo } from "react";

function TradingCalendar({ events = [], loading = false }) {
  // Transformer les événements en format FullCalendar
  const calendarEvents = useMemo(() => {
    if (!events || events.length === 0) return [];

    return events.map((event) => {
      // Déterminer la couleur selon le type
      let className = "info";
      if (event.type === "earnings") {
        className = "warning";
      } else if (event.type === "economic") {
        className = event.impact === "High" ? "error" : event.impact === "Medium" ? "warning" : "info";
      } else if (event.type === "fda") {
        className = "success";
      }

      // Formater la date
      const date = event.date || event.earningsDate || event.eventDate;
      const startDate = date ? new Date(date).toISOString().split("T")[0] : null;

      return {
        title: event.title || `${event.symbol || event.name} - ${event.type || "Event"}`,
        start: startDate,
        end: startDate,
        className: className,
        extendedProps: {
          symbol: event.symbol,
          type: event.type,
          description: event.description,
        },
      };
    });
  }, [events]);

  if (loading) {
    return (
      <Calendar
        header={{ title: "Calendrier Événements", date: new Date().toLocaleDateString("fr-FR") }}
        headerToolbar={false}
        initialView="dayGridMonth"
        initialDate={new Date().toISOString().split("T")[0]}
        events={[]}
        selectable={false}
        editable={false}
      />
    );
  }

  return (
    <Calendar
      header={{
        title: "Calendrier Événements",
        date: new Date().toLocaleDateString("fr-FR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      }}
      headerToolbar={false}
      initialView="dayGridMonth"
      initialDate={new Date().toISOString().split("T")[0]}
      events={calendarEvents}
      selectable={false}
      editable={false}
      eventClick={(info) => {
        // Optionnel: afficher plus d'infos au clic
        if (info.event.extendedProps.symbol) {
          console.log("Event clicked:", info.event.extendedProps);
        }
      }}
    />
  );
}

export default TradingCalendar;

