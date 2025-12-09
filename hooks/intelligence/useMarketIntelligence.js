/**
 * Hook personnalisé pour Market Intelligence (Market Tide + Sector Rotation)
 */

import { useState, useEffect, useCallback } from "react";
import intelligenceService from "/services/intelligenceService";

export function useMarketIntelligence(options = {}) {
  const { forceRefresh = false, enabled = true } = options;
  const [marketTide, setMarketTide] = useState(null);
  const [sectorRotation, setSectorRotation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (!enabled) {
      setMarketTide(null);
      setSectorRotation(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Charger en parallèle
      const [tide, rotation] = await Promise.all([
        intelligenceService.getMarketTide(forceRefresh),
        intelligenceService.getSectorRotation(forceRefresh),
      ]);
      
      setMarketTide(tide);
      setSectorRotation(rotation);
    } catch (err) {
      console.error("Error loading market intelligence:", err);
      setError(err.message || "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }, [forceRefresh, enabled]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refetch = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    marketTide,
    sectorRotation,
    loading,
    error,
    refetch,
  };
}

export default useMarketIntelligence;



