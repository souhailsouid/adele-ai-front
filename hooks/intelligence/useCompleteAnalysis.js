/**
 * Hook personnalisé pour l'analyse complète d'un ticker
 */

import { useState, useEffect, useCallback } from "react";
import intelligenceService from "/services/intelligenceService";

export function useCompleteAnalysis(ticker, options = {}) {
  const { forceRefresh = false, enabled = true } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAnalysis = useCallback(async () => {
    if (!ticker || !enabled) {
      setData(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await intelligenceService.getCompleteAnalysis(ticker, forceRefresh);
      setData(result);
    } catch (err) {
      console.error("Error loading complete analysis:", err);
      setError(err.message || "Erreur lors du chargement de l'analyse");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [ticker, forceRefresh, enabled]);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  const refetch = useCallback(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

export default useCompleteAnalysis;



