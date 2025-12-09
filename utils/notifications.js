/**
 * Système de notifications toast
 */

import { toast } from "react-toastify";

// Vérifier si react-toastify est installé, sinon utiliser une implémentation simple
let useToast = false;

try {
  // Essayer d'importer react-toastify
  require("react-toastify");
  useToast = true;
} catch {
  // Fallback vers une implémentation simple avec Material-UI Snackbar
  useToast = false;
}

/**
 * Afficher une notification de succès
 */
export function showSuccess(message, options = {}) {
  if (useToast) {
    const { toast } = require("react-toastify");
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      ...options,
    });
  } else {
    // Fallback: utiliser console ou un système simple
    console.log(`✅ ${message}`);
    // Pour une vraie implémentation, on pourrait utiliser MUI Snackbar
    if (typeof window !== "undefined" && window.showNotification) {
      window.showNotification({ message, type: "success" });
    }
  }
}

/**
 * Afficher une notification d'erreur
 */
export function showError(message, options = {}) {
  if (useToast) {
    const { toast } = require("react-toastify");
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      ...options,
    });
  } else {
    console.error(`❌ ${message}`);
    if (typeof window !== "undefined" && window.showNotification) {
      window.showNotification({ message, type: "error" });
    }
  }
}

/**
 * Afficher une notification d'information
 */
export function showInfo(message, options = {}) {
  if (useToast) {
    const { toast } = require("react-toastify");
    toast.info(message, {
      position: "top-right",
      autoClose: 3000,
      ...options,
    });
  } else {
    console.info(`ℹ️ ${message}`);
    if (typeof window !== "undefined" && window.showNotification) {
      window.showNotification({ message, type: "info" });
    }
  }
}

/**
 * Afficher une notification d'avertissement
 */
export function showWarning(message, options = {}) {
  if (useToast) {
    const { toast } = require("react-toastify");
    toast.warning(message, {
      position: "top-right",
      autoClose: 4000,
      ...options,
    });
  } else {
    console.warn(`⚠️ ${message}`);
    if (typeof window !== "undefined" && window.showNotification) {
      window.showNotification({ message, type: "warning" });
    }
  }
}

/**
 * Composant ToastContainer pour Material-UI (fallback)
 */
export function ToastContainer() {
  // Si react-toastify n'est pas disponible, retourner null
  // L'utilisateur devra implémenter son propre système de notifications
  return null;
}



