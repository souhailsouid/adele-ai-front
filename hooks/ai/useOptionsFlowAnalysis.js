/**
 * Hook personnalisé pour l'analyse LLM enrichie du Options Flow
 */

import { useState, useEffect, useCallback } from "react";
import intelligenceClient from "/lib/api/intelligenceClient";

export function useOptionsFlowAnalysis(ticker, options = {}) {
  const { enabled = true, onSuccess, onError } = options;
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
      const response = await intelligenceClient.getOptionsFlowAnalysis(ticker);
      
      if (response.success) {
        setData(response);
        if (onSuccess) {
          onSuccess(response);
        }
      } else {
        throw new Error(response.error || "Erreur lors du chargement de l'analyse");
      }
    } catch (err) {
      console.error("Error loading options flow analysis:", err);
      const errorMessage = err.message || "Erreur lors du chargement de l'analyse";
      setError(errorMessage);
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [ticker, enabled, onSuccess, onError]);

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

export default useOptionsFlowAnalysis;

