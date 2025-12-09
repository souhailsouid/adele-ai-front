/**
 * Composant de notification toast utilisant Material-UI Snackbar
 * Fallback si react-toastify n'est pas disponible
 */

import { useState, useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";

// Système de notifications global
let notificationQueue = [];
let notificationListeners = [];

function addNotification(notification) {
  notificationQueue.push(notification);
  notificationListeners.forEach((listener) => listener(notificationQueue));
}

function removeNotification(id) {
  notificationQueue = notificationQueue.filter((n) => n.id !== id);
  notificationListeners.forEach((listener) => listener(notificationQueue));
}

function subscribe(listener) {
  notificationListeners.push(listener);
  return () => {
    notificationListeners = notificationListeners.filter((l) => l !== listener);
  };
}

// Exporter les fonctions pour utilisation globale
if (typeof window !== "undefined") {
  window.showNotification = ({ message, type = "info", duration = 3000 }) => {
    const id = Date.now();
    addNotification({
      id,
      message,
      type,
      duration,
    });
  };
}

function ToastNotification() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribe((queue) => {
      setNotifications(queue);
      if (queue.length > 0 && !open) {
        setCurrentNotification(queue[0]);
        setOpen(true);
      }
    });

    return unsubscribe;
  }, [open]);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
    if (currentNotification) {
      setTimeout(() => {
        removeNotification(currentNotification.id);
        if (notifications.length > 1) {
          setCurrentNotification(notifications[1]);
          setOpen(true);
        } else {
          setCurrentNotification(null);
        }
      }, 300);
    }
  };

  if (!currentNotification) {
    return null;
  }

  const getSeverity = (type) => {
    switch (type) {
      case "success":
        return "success";
      case "error":
        return "error";
      case "warning":
        return "warning";
      default:
        return "info";
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={currentNotification.duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={handleClose}
        severity={getSeverity(currentNotification.type)}
        sx={{ width: "100%" }}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
          >
            <Icon fontSize="small">close</Icon>
          </IconButton>
        }
      >
        {currentNotification.message}
      </Alert>
    </Snackbar>
  );
}

export default ToastNotification;



