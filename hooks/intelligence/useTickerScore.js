/**
 * Hook personnalisé pour le score d'un ticker
 */

import { useState, useEffect, useCallback } from "react";
import intelligenceService from "/services/intelligenceService";

export function useTickerScore(ticker, options = {}) {
  const { forceRefresh = false, enabled = true } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadScore = useCallback(async () => {
    if (!ticker || !enabled) {
      setData(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await intelligenceService.getTickerScore(ticker, forceRefresh);
      setData(result);
    } catch (err) {
      console.error("Error loading ticker score:", err);
      setError(err.message || "Erreur lors du chargement du score");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [ticker, forceRefresh, enabled]);

  useEffect(() => {
    loadScore();
  }, [loadScore]);

  const refetch = useCallback(() => {
    loadScore();
  }, [loadScore]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

export default useTickerScore;



