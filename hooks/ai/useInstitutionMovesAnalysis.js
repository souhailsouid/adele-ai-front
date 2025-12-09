/**
 * Hook personnalisé pour l'analyse LLM enrichie des mouvements institutionnels
 */

import { useState, useEffect, useCallback } from "react";
import intelligenceClient from "/lib/api/intelligenceClient";

export function useInstitutionMovesAnalysis(institution_cik, institution_name, period = "3M", options = {}) {
  const { enabled = true, onSuccess, onError } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAnalysis = useCallback(async () => {
    if (!institution_cik || !institution_name || !enabled) {
      setData(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await intelligenceClient.getInstitutionMovesAnalysis(
        institution_cik,
        institution_name,
        period
      );
      
      if (response.success) {
        setData(response);
        if (onSuccess) {
          onSuccess(response);
        }
      } else {
        throw new Error(response.error || "Erreur lors du chargement de l'analyse");
      }
    } catch (err) {
      console.error("Error loading institution moves analysis:", err);
      const errorMessage = err.message || "Erreur lors du chargement de l'analyse";
      setError(errorMessage);
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [institution_cik, institution_name, period, enabled, onSuccess, onError]);

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

export default useInstitutionMovesAnalysis;

