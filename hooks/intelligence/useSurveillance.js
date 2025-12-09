/**
 * Hook personnalisé pour la surveillance
 */

import { useState, useEffect, useCallback } from "react";
import intelligenceService from "/services/intelligenceService";

export function useSurveillance(options = {}) {
  const { autoRefresh = true, refreshInterval = 30000 } = options;
  const [watches, setWatches] = useState([]);
  const [alerts, setAlerts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadWatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const watchesData = await intelligenceService.getSurveillances();
      setWatches(watchesData.watches || []);
      
      // Charger les alertes pour chaque surveillance
      const alertsPromises = (watchesData.watches || []).map(async (watch) => {
        try {
          const alertsData = await intelligenceService.getSurveillanceAlerts(watch.id);
          return { watchId: watch.id, alerts: alertsData.alerts || [] };
        } catch (err) {
          console.error(`Error loading alerts for watch ${watch.id}:`, err);
          return { watchId: watch.id, alerts: [] };
        }
      });
      
      const alertsResults = await Promise.all(alertsPromises);
      const alertsMap = {};
      alertsResults.forEach(({ watchId, alerts: watchAlerts }) => {
        alertsMap[watchId] = watchAlerts;
      });
      setAlerts(alertsMap);
    } catch (err) {
      console.error("Error loading watches:", err);
      setError(err.message || "Erreur lors du chargement des surveillances");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWatches();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadWatches();
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [loadWatches, autoRefresh, refreshInterval]);

  const createWatch = useCallback(async (config) => {
    try {
      const result = await intelligenceService.createSurveillance(config);
      await loadWatches();
      return result;
    } catch (err) {
      console.error("Error creating watch:", err);
      throw err;
    }
  }, [loadWatches]);

  const deleteWatch = useCallback(async (watchId) => {
    try {
      await intelligenceService.deleteSurveillance(watchId);
      await loadWatches();
    } catch (err) {
      console.error("Error deleting watch:", err);
      throw err;
    }
  }, [loadWatches]);

  const checkWatch = useCallback(async (watchId) => {
    try {
      await intelligenceService.checkSurveillance(watchId);
      await loadWatches();
    } catch (err) {
      console.error("Error checking watch:", err);
      throw err;
    }
  }, [loadWatches]);

  return {
    watches,
    alerts,
    loading,
    error,
    createWatch,
    deleteWatch,
    checkWatch,
    refetch: loadWatches,
  };
}

export default useSurveillance;

