/**
 * Barre d'alertes en direct
 * Affiche les alertes importantes (FED, BOJ, etc.) en temps réel
 */

import { useState, useEffect } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import { keyframes } from "@mui/material/styles";

const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
`;

function LiveAlertsBar({ alerts = [] }) {
  const [expanded, setExpanded] = useState(true);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);

  // Rotation automatique des alertes
  useEffect(() => {
    if (alerts.length > 1) {
      const interval = setInterval(() => {
        setCurrentAlertIndex((prev) => (prev + 1) % alerts.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [alerts.length]);

  if (alerts.length === 0) return null;

  const currentAlert = alerts[currentAlertIndex];

  const getSeverity = (severity) => {
    switch (severity) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      default:
        return "info";
    }
  };

  const formatDate = (dateString, timeString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const dateStr = date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      });
      return timeString ? `${dateStr} à ${timeString}` : dateStr;
    } catch {
      return dateString;
    }
  };

  return (
    <Collapse in={expanded}>
      <Alert
        severity={getSeverity(currentAlert.severity)}
        icon={
          <Icon
            sx={{
              animation: `${pulse} 2s ease-in-out infinite`,
            }}
          >
            notifications_active
          </Icon>
        }
        action={
          <>
            {alerts.length > 1 && (
              <Chip
                label={`${currentAlertIndex + 1}/${alerts.length}`}
                size="small"
                sx={{ mr: 1 }}
              />
            )}
            <IconButton
              size="small"
              onClick={() => setExpanded(false)}
              sx={{ color: "inherit" }}
            >
              <Icon fontSize="small">close</Icon>
            </IconButton>
          </>
        }
        sx={{
          mb: 0,
          "& .MuiAlert-message": {
            width: "100%",
          },
        }}
      >
        <MDBox display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <MDBox>
            <MDTypography variant="body2" fontWeight="bold">
              {currentAlert.message}
            </MDTypography>
            {currentAlert.date && (
              <MDTypography variant="caption" color="text.secondary" display="block">
                {formatDate(currentAlert.date, currentAlert.time)}
              </MDTypography>
            )}
          </MDBox>
          {currentAlert.type === "macro" && (
            <Chip
              icon={<Icon>trending_up</Icon>}
              label="Macro Event"
              size="small"
              color="primary"
            />
          )}
        </MDBox>
      </Alert>
    </Collapse>
  );
}

export default LiveAlertsBar;



