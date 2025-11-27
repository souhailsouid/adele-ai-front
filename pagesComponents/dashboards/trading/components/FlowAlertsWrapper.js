import { useState, useEffect } from "react";
import unusualWhalesClient from "/lib/unusual-whales/client";
import FlowAlerts from "./FlowAlerts";

function FlowAlertsWrapper({ ticker = "" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ticker) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await unusualWhalesClient.getStockFlowAlerts(ticker);
        const extracted = Array.isArray(response) ? response : (response?.data || []);
        setData(extracted);
      } catch (err) {
        console.error("Error loading flow alerts:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ticker]);

  return <FlowAlerts data={data} loading={loading} />;
}

export default FlowAlertsWrapper;


