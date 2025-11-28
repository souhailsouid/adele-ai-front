/**
 * Composant Timeline pour afficher les événements trading (news, earnings, résultats financiers)
 */

import TimelineList from "/examples/Timeline/TimelineList";
import TimelineItem from "/examples/Timeline/TimelineItem";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Chip from "@mui/material/Chip";
import { formatDateTime } from "./utils";

function TradingTimeline({ title = "Événements", events = [], loading = false }) {
  if (loading) {
    return (
      <TimelineList title={title}>
        <MDBox p={2}>
          <MDTypography variant="body2" color="text">
            Chargement...
          </MDTypography>
        </MDBox>
      </TimelineList>
    );
  }

  if (!events || events.length === 0) {
    return (
      <TimelineList title={title}>
        <MDBox p={2}>
          <MDTypography variant="body2" color="text">
            Aucun événement
          </MDTypography>
        </MDBox>
      </TimelineList>
    );
  }

  const getEventIcon = (type) => {
    const icons = {
      news: "article",
      earnings: "event",
      financial: "account_balance",
      alert: "notifications",
      performance: "trending_up",
      default: "circle",
    };
    return icons[type] || icons.default;
  };

  const getEventColor = (type) => {
    const colors = {
      news: "info",
      earnings: "warning",
      financial: "success",
      alert: "error",
      performance: "success",
      default: "primary",
    };
    return colors[type] || colors.default;
  };

  return (
    <TimelineList title={title} dark={false}>
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        const dateTime = event.dateTime || event.date || event.publishedDate;
        const formattedDate = dateTime
          ? formatDateTime(dateTime)
          : { date: "N/A", time: "" };

        return (
          <TimelineItem
            key={index}
            color={getEventColor(event.type)}
            icon={getEventIcon(event.type)}
            title={event.title || event.symbol || "Événement"}
            dateTime={`${formattedDate.date} ${formattedDate.time ? formattedDate.time : ""}`}
            description={
              <MDBox>
                {event.description && (
                  <MDTypography variant="body2" color="text" mb={1}>
                    {event.description}
                  </MDTypography>
                )}
                {event.symbol && (
                  <Chip
                    label={event.symbol}
                    size="small"
                    color="primary"
                    sx={{ mr: 1, mb: 0.5 }}
                  />
                )}
                {event.changePercent !== undefined && (
                  <Chip
                    label={`${event.changePercent >= 0 ? "+" : ""}${event.changePercent.toFixed(2)}%`}
                    size="small"
                    color={event.changePercent >= 0 ? "success" : "error"}
                    sx={{ mr: 1 }}
                  />
                )}
                {event.score && (
                  <Chip
                    label={`Score: ${event.score}`}
                    size="small"
                    color="info"
                  />
                )}
              </MDBox>
            }
            lastItem={isLast}
          />
        );
      })}
    </TimelineList>
  );
}

export default TradingTimeline;

