/**
 * Service de gestion des alertes personnalisées
 */

import fmpUWClient from "/lib/api/fmpUnusualWhalesClient";

export class AlertService {
  constructor() {
    this.activeAlerts = new Map();
    this.loadAlertsFromStorage();
  }

  /**
   * Charger les alertes depuis le localStorage
   */
  loadAlertsFromStorage() {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem("fmp_alerts");
      if (stored) {
        const alerts = JSON.parse(stored);
        alerts.forEach((alert) => {
          this.activeAlerts.set(alert.id, alert);
        });
      }
    } catch (error) {
      console.error("Error loading alerts from storage:", error);
    }
  }

  /**
   * Sauvegarder les alertes dans le localStorage
   */
  saveAlertsToStorage() {
    if (typeof window === "undefined") return;

    try {
      const alerts = Array.from(this.activeAlerts.values());
      localStorage.setItem("fmp_alerts", JSON.stringify(alerts));
    } catch (error) {
      console.error("Error saving alerts to storage:", error);
    }
  }

  /**
   * Créer une nouvelle alerte
   */
  createAlert(alert) {
    const id = alert.id || `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newAlert = {
      ...alert,
      id,
      createdAt: new Date().toISOString(),
      triggered: false,
      triggeredAt: null,
    };

    this.activeAlerts.set(id, newAlert);
    this.saveAlertsToStorage();
    return newAlert;
  }

  /**
   * Supprimer une alerte
   */
  deleteAlert(alertId) {
    this.activeAlerts.delete(alertId);
    this.saveAlertsToStorage();
  }

  /**
   * Obtenir toutes les alertes actives
   */
  getActiveAlerts() {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Obtenir les alertes par type
   */
  getAlertsByType(type) {
    return this.getActiveAlerts().filter((alert) => alert.type === type);
  }

  /**
   * Vérifier toutes les alertes de prix
   */
  async checkPriceAlerts() {
    const priceAlerts = this.getAlertsByType("price");
    const triggered = [];

    for (const alert of priceAlerts) {
      if (alert.triggered) continue;

      try {
        const quote = await fmpUWClient.getFMPQuote(alert.symbol);
        if (!quote) continue;

        const isTriggered = this.isPriceAlertTriggered(alert, quote);

        if (isTriggered) {
          alert.triggered = true;
          alert.triggeredAt = new Date().toISOString();
          this.activeAlerts.set(alert.id, alert);
          this.saveAlertsToStorage();
          triggered.push({ alert, quote });
        }
      } catch (error) {
        console.error(`Error checking price alert for ${alert.symbol}:`, error);
      }
    }

    return triggered;
  }

  /**
   * Vérifier les alertes de volume
   */
  async checkVolumeAlerts() {
    const volumeAlerts = this.getAlertsByType("volume");
    const triggered = [];

    for (const alert of volumeAlerts) {
      if (alert.triggered) continue;

      try {
        const quote = await fmpUWClient.getFMPQuote(alert.symbol);
        if (!quote || !quote.avgVolume) continue;

        const volumeRatio = quote.volume / quote.avgVolume;

        if (volumeRatio >= alert.threshold) {
          alert.triggered = true;
          alert.triggeredAt = new Date().toISOString();
          this.activeAlerts.set(alert.id, alert);
          this.saveAlertsToStorage();

          triggered.push({
            alert,
            quote,
            volumeRatio: volumeRatio.toFixed(2),
          });
        }
      } catch (error) {
        console.error(`Error checking volume alert for ${alert.symbol}:`, error);
      }
    }

    return triggered;
  }

  /**
   * Vérifier les alertes RSI
   */
  async checkRSIAlerts() {
    const rsiAlerts = this.getAlertsByType("rsi");
    const triggered = [];

    for (const alert of rsiAlerts) {
      if (alert.triggered) continue;

      try {
        const rsi = await fmpUWClient.getFMPRSI(alert.symbol, 14, "1day");
        if (!rsi) continue;

        const rsiValue = typeof rsi === "number" ? rsi : rsi.rsi;
        const isTriggered =
          (alert.condition === "oversold" && rsiValue < 30) ||
          (alert.condition === "overbought" && rsiValue > 70);

        if (isTriggered) {
          alert.triggered = true;
          alert.triggeredAt = new Date().toISOString();
          this.activeAlerts.set(alert.id, alert);
          this.saveAlertsToStorage();

          triggered.push({
            alert,
            rsi: rsiValue,
            condition: alert.condition,
          });
        }
      } catch (error) {
        console.error(`Error checking RSI alert for ${alert.symbol}:`, error);
      }
    }

    return triggered;
  }

  /**
   * Vérifier les alertes earnings
   */
  async checkEarningsAlerts() {
    const earningsAlerts = this.getAlertsByType("earnings");
    const triggered = [];

    for (const alert of earningsAlerts) {
      if (alert.triggered) continue;

      try {
        const today = new Date();
        const alertDate = new Date(alert.earningsDate);

        // Vérifier si l'earnings est dans les 24h
        const hoursUntilEarnings =
          (alertDate - today) / (1000 * 60 * 60);

        if (hoursUntilEarnings <= 24 && hoursUntilEarnings > 0) {
          alert.triggered = true;
          alert.triggeredAt = new Date().toISOString();
          this.activeAlerts.set(alert.id, alert);
          this.saveAlertsToStorage();

          triggered.push({
            alert,
            hoursUntilEarnings: hoursUntilEarnings.toFixed(1),
          });
        }
      } catch (error) {
        console.error(
          `Error checking earnings alert for ${alert.symbol}:`,
          error
        );
      }
    }

    return triggered;
  }

  /**
   * Vérifier toutes les alertes
   */
  async checkAllAlerts() {
    const [price, volume, rsi, earnings] = await Promise.all([
      this.checkPriceAlerts(),
      this.checkVolumeAlerts(),
      this.checkRSIAlerts(),
      this.checkEarningsAlerts(),
    ]);

    return {
      price,
      volume,
      rsi,
      earnings,
      total: price.length + volume.length + rsi.length + earnings.length,
    };
  }

  // ==================== HELPER METHODS ====================

  /**
   * Vérifier si une alerte de prix est déclenchée
   */
  isPriceAlertTriggered(alert, quote) {
    const price = quote.price;

    switch (alert.condition) {
      case "above":
        return price >= alert.targetPrice;
      case "below":
        return price <= alert.targetPrice;
      case "change_percent":
        return Math.abs(quote.changePercent) >= alert.threshold;
      default:
        return false;
    }
  }

  /**
   * Envoyer une notification (peut être étendue avec Telegram, Email, etc.)
   */
  async sendNotification(alert, data) {
    // Pour l'instant, on log simplement
    // Peut être étendu avec Telegram, Email, Webhooks, etc.
    console.log("🔔 Alert triggered:", {
      type: alert.type,
      symbol: alert.symbol,
      data,
    });

    // Exemple d'intégration Telegram (à configurer)
    if (process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN && alert.notifyTelegram) {
      // await this.sendTelegramAlert(alert, data);
    }
  }
}

export const alertService = new AlertService();
export default alertService;


