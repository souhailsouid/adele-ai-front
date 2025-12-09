/**
 * Hook personnalisé pour Smart Money
 */

import { useState, useEffect, useCallback } from "react";
import intelligenceService from "/services/intelligenceService";

export function useTopHedgeFunds(period = '3M', options = {}) {
  const { forceRefresh = false, enabled = true } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadFunds = useCallback(async () => {
    if (!enabled) {
      setData(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await intelligenceService.getTopHedgeFunds(period, forceRefresh);
      setData(result);
    } catch (err) {
      console.error("Error loading top hedge funds:", err);
      setError(err.message || "Erreur lors du chargement des hedge funds");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [period, forceRefresh, enabled]);

  useEffect(() => {
    loadFunds();
  }, [loadFunds]);

  const refetch = useCallback(() => {
    loadFunds();
  }, [loadFunds]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

export function useCopyTrades(institution, ticker, options = {}) {
  const { enabled = true } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTrades = useCallback(async () => {
    if (!institution || !ticker || !enabled) {
      setData(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await intelligenceService.getCopyTrades(institution, ticker);
      setData(result);
    } catch (err) {
      console.error("Error loading copy trades:", err);
      setError(err.message || "Erreur lors du chargement des copy trades");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [institution, ticker, enabled]);

  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  const refetch = useCallback(() => {
    loadTrades();
  }, [loadTrades]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

export default { useTopHedgeFunds, useCopyTrades };



