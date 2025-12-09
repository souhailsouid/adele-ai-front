/**
 * Service de métriques de succès pour le dashboard de trading
 * Track les performances des signaux, alertes et utilisation
 */

import fmpUWClient from "/lib/api/fmpUnusualWhalesClient";

export class MetricsService {
  constructor() {
    this.storageKey = "trading_metrics";
    this.loadMetrics();
  }

  /**
   * Charger les métriques depuis le localStorage
   */
  loadMetrics() {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.metrics = JSON.parse(stored);
      } else {
        this.metrics = this.initializeMetrics();
      }
    } catch (error) {
      console.error("Error loading metrics:", error);
      this.metrics = this.initializeMetrics();
    }
  }

  /**
   * Initialiser la structure des métriques
   */
  initializeMetrics() {
    return {
      screening: {
        earningsPlays: {
          total: 0,
          profitable: 0,
          tracked: [], // { symbol, date, entryPrice, exitPrice, profit, timestamp }
        },
        oversoldBounces: {
          total: 0,
          profitable: 0,
          tracked: [],
        },
        unusualVolume: {
          total: 0,
          profitable: 0,
          tracked: [],
        },
      },
      alerts: {
        total: 0,
        triggered: 0,
        profitable: 0,
        tracked: [], // { alertId, symbol, type, triggeredAt, priceAtTrigger, priceAfter24h, profit }
      },
      usage: {
        dailyUsage: [], // { date, features: { screener, earnings, alerts, calendar } }
        sessionStart: null,
        lastActive: null,
      },
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Sauvegarder les métriques
   */
  saveMetrics() {
    if (typeof window === "undefined") return;
    try {
      this.metrics.lastUpdated = new Date().toISOString();
      localStorage.setItem(this.storageKey, JSON.stringify(this.metrics));
    } catch (error) {
      console.error("Error saving metrics:", error);
    }
  }

  /**
   * Track un signal de screening (earnings play)
   */
  trackEarningsPlay(symbol, entryPrice, metadata = {}) {
    if (!this.metrics.screening.earningsPlays.tracked) {
      this.metrics.screening.earningsPlays.tracked = [];
    }

    const play = {
      symbol,
      entryPrice,
      date: new Date().toISOString(),
      metadata,
      id: `earnings_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.metrics.screening.earningsPlays.tracked.push(play);
    this.metrics.screening.earningsPlays.total++;
    this.saveMetrics();
    return play;
  }

  /**
   * Mettre à jour le résultat d'un earnings play
   */
  updateEarningsPlayResult(playId, exitPrice, profit) {
    const play = this.metrics.screening.earningsPlays.tracked.find(
      (p) => p.id === playId
    );
    if (play) {
      play.exitPrice = exitPrice;
      play.profit = profit;
      play.profitPercentage = ((profit / play.entryPrice) * 100).toFixed(2);
      play.completed = true;
      play.completedAt = new Date().toISOString();

      if (profit > 0) {
        this.metrics.screening.earningsPlays.profitable++;
      }
      this.saveMetrics();
    }
  }

  /**
   * Track un oversold bounce
   */
  trackOversoldBounce(symbol, entryPrice, rsi, metadata = {}) {
    if (!this.metrics.screening.oversoldBounces.tracked) {
      this.metrics.screening.oversoldBounces.tracked = [];
    }

    const bounce = {
      symbol,
      entryPrice,
      rsi,
      date: new Date().toISOString(),
      metadata,
      id: `bounce_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.metrics.screening.oversoldBounces.tracked.push(bounce);
    this.metrics.screening.oversoldBounces.total++;
    this.saveMetrics();
    return bounce;
  }

  /**
   * Mettre à jour le résultat d'un oversold bounce
   */
  updateOversoldBounceResult(bounceId, exitPrice, profit) {
    const bounce = this.metrics.screening.oversoldBounces.tracked.find(
      (b) => b.id === bounceId
    );
    if (bounce) {
      bounce.exitPrice = exitPrice;
      bounce.profit = profit;
      bounce.profitPercentage = ((profit / bounce.entryPrice) * 100).toFixed(2);
      bounce.completed = true;
      bounce.completedAt = new Date().toISOString();

      if (profit > 0) {
        this.metrics.screening.oversoldBounces.profitable++;
      }
      this.saveMetrics();
    }
  }

  /**
   * Track une alerte déclenchée
   */
  trackAlertTrigger(alertId, symbol, type, priceAtTrigger) {
    if (!this.metrics.alerts.tracked) {
      this.metrics.alerts.tracked = [];
    }

    const alertTrack = {
      alertId,
      symbol,
      type,
      triggeredAt: new Date().toISOString(),
      priceAtTrigger,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.metrics.alerts.tracked.push(alertTrack);
    this.metrics.alerts.triggered++;
    this.metrics.alerts.total++;
    this.saveMetrics();
    return alertTrack;
  }

  /**
   * Mettre à jour le résultat d'une alerte (prix après 24h)
   */
  async updateAlertResult(alertTrackId, hoursAfter = 24) {
    const alertTrack = this.metrics.alerts.tracked.find(
      (a) => a.id === alertTrackId
    );
    if (!alertTrack) return;

    try {
      // Récupérer le prix actuel
        const quote = await fmpUWClient.getFMPQuote(alertTrack.symbol);
      if (quote && quote.price) {
        const currentPrice = quote.price;
        const profit = currentPrice - alertTrack.priceAtTrigger;
        const profitPercentage = ((profit / alertTrack.priceAtTrigger) * 100).toFixed(2);

        alertTrack.priceAfter = currentPrice;
        alertTrack.profit = profit;
        alertTrack.profitPercentage = profitPercentage;
        alertTrack.hoursAfter = hoursAfter;
        alertTrack.completed = true;
        alertTrack.completedAt = new Date().toISOString();

        if (profit > 0) {
          this.metrics.alerts.profitable++;
        }
        this.saveMetrics();
      }
    } catch (error) {
      console.error("Error updating alert result:", error);
    }
  }

  /**
   * Track l'utilisation d'une fonctionnalité
   */
  trackFeatureUsage(feature) {
    const today = new Date().toISOString().split("T")[0];
    
    if (!this.metrics.usage.dailyUsage) {
      this.metrics.usage.dailyUsage = [];
    }

    let todayUsage = this.metrics.usage.dailyUsage.find(
      (u) => u.date === today
    );

    if (!todayUsage) {
      todayUsage = {
        date: today,
        features: {
          screener: 0,
          earnings: 0,
          alerts: 0,
          calendar: 0,
        },
      };
      this.metrics.usage.dailyUsage.push(todayUsage);
    }

    if (todayUsage.features[feature] !== undefined) {
      todayUsage.features[feature]++;
    }

    this.metrics.usage.lastActive = new Date().toISOString();
    this.saveMetrics();
  }

  /**
   * Calculer les métriques de succès
   */
  calculateSuccessMetrics() {
    const metrics = this.metrics;

    // Earnings Plays Win Rate
    const earningsWinRate =
      metrics.screening.earningsPlays.total > 0
        ? (
            (metrics.screening.earningsPlays.profitable /
              metrics.screening.earningsPlays.total) *
            100
          ).toFixed(1)
        : 0;

    // Oversold Bounces Win Rate
    const oversoldWinRate =
      metrics.screening.oversoldBounces.total > 0
        ? (
            (metrics.screening.oversoldBounces.profitable /
              metrics.screening.oversoldBounces.total) *
            100
          ).toFixed(1)
        : 0;

    // Alert Effectiveness
    const alertEffectiveness =
      metrics.alerts.triggered > 0
        ? (
            (metrics.alerts.profitable / metrics.alerts.triggered) *
            100
          ).toFixed(1)
        : 0;

    // Usage Stats
    const last7Days = this.metrics.usage.dailyUsage.slice(-7);
    const totalUsage = last7Days.reduce((sum, day) => {
      return (
        sum +
        day.features.screener +
        day.features.earnings +
        day.features.alerts +
        day.features.calendar
      );
    }, 0);

    return {
      screening: {
        earningsPlayAccuracy: `${earningsWinRate}% win rate (${metrics.screening.earningsPlays.profitable}/${metrics.screening.earningsPlays.total})`,
        earningsPlayWinRate: parseFloat(earningsWinRate),
        earningsPlayTarget: 60,
        oversoldBounceSuccess: `${oversoldWinRate}% win rate (${metrics.screening.oversoldBounces.profitable}/${metrics.screening.oversoldBounces.total})`,
        oversoldBounceWinRate: parseFloat(oversoldWinRate),
        oversoldBounceTarget: 55,
        alertEffectiveness: `${alertEffectiveness}% profitable (${metrics.alerts.profitable}/${metrics.alerts.triggered})`,
        alertEffectivenessRate: parseFloat(alertEffectiveness),
        alertTarget: 70,
      },
      userExperience: {
        totalUsage: totalUsage,
        dailyAverage: (totalUsage / 7).toFixed(1),
        lastActive: metrics.usage.lastActive
          ? new Date(metrics.usage.lastActive).toLocaleString("fr-FR")
          : "Jamais",
        featureUsage: {
          screener: last7Days.reduce((sum, day) => sum + day.features.screener, 0),
          earnings: last7Days.reduce((sum, day) => sum + day.features.earnings, 0),
          alerts: last7Days.reduce((sum, day) => sum + day.features.alerts, 0),
          calendar: last7Days.reduce((sum, day) => sum + day.features.calendar, 0),
        },
      },
      raw: metrics,
    };
  }

  /**
   * Obtenir les métriques formatées pour l'affichage
   */
  getSuccessMetrics() {
    return this.calculateSuccessMetrics();
  }

  /**
   * Réinitialiser les métriques
   */
  resetMetrics() {
    this.metrics = this.initializeMetrics();
    this.saveMetrics();
  }
}

// Export singleton
const metricsService = new MetricsService();
export default metricsService;


