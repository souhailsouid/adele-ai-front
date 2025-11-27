import { useState, useEffect } from "react";
import unusualWhalesClient from "/lib/unusual-whales/client";

/**
 * Hook personnalisé pour récupérer les données Greek Flow d'un ticker
 * @param {string} ticker - Le symbole du ticker (ex: "GOOGL", "AAPL")
 * @param {Function} onError - Callback appelé en cas d'erreur
 * @param {Function} onLoading - Callback appelé lors des changements d'état de chargement
 * @returns {Object} { data, loading, error }
 */
function useGreekFlow(ticker = "", onError = () => {}, onLoading = () => {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticker) {
      setData([]);
      setLoading(false);
      setError(null);
      onLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        onLoading(true);
        setError(null);
        
        const response = await unusualWhalesClient.getGreekFlow(ticker);
        
        // L'API retourne { data: [...] } ou directement un tableau
        const extracted = Array.isArray(response?.data) 
          ? response.data 
          : (Array.isArray(response) ? response : []);
        
        // Trier par timestamp (du plus ancien au plus récent)
        extracted.sort((a, b) => {
          const timeA = new Date(a.timestamp || 0);
          const timeB = new Date(b.timestamp || 0);
          return timeA - timeB;
        });
        
        setData(extracted);
      } catch (err) {
        console.error("Error loading greek flow:", err);
        const errMsg = err.message || "Erreur lors du chargement";
        setError(errMsg);
        onError(errMsg);
        setData([]);
      } finally {
        setLoading(false);
        onLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker]);

  return { data, loading, error };
}

export default useGreekFlow;


