/**
 * Onglet Flow Alerts - Gros trades options
 */

import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DataTable from "/examples/Tables/DataTable";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import { formatCurrency, formatDate } from "/utils/formatting";
import whaleTrackerService from "/services/whaleTrackerService";

function FlowAlertsTab({ onStatsUpdate }) {
  const [flowAlerts, setFlowAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const alerts = await whaleTrackerService.loadFlowAlerts({
        limit: 50,
        min_premium: 100000,
      });
      setFlowAlerts(alerts);
      
      // Mettre à jour les stats
      if (onStatsUpdate) {
        const stats = whaleTrackerService.calculateStats(alerts);
        onStatsUpdate(stats);
      }
    } catch (err) {
      console.error("Error loading flow alerts:", err);
      setError(err.message || "Erreur lors du chargement des flow alerts");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (error) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="error">
            {error}
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" fontWeight="medium" mb={2}>
          Flow Alerts - Gros Trades Options ({flowAlerts.length})
        </MDTypography>
        {flowAlerts.length > 0 ? (
          <DataTable
            table={{
              columns: [
                {
                  Header: "Ticker",
                  accessor: "ticker",
                  width: "10%",
                },
                {
                  Header: "Type",
                  accessor: "type",
                  width: "8%",
                  Cell: ({ value }) => (
                    <Chip
                      label={value === "call" ? "CALL" : value === "put" ? "PUT" : value || "N/A"}
                      size="small"
                      color={value === "call" ? "success" : "error"}
                      variant="outlined"
                    />
                  ),
                },
                {
                  Header: "Strike",
                  accessor: "strike",
                  width: "10%",
                  Cell: ({ value }) => value ? formatCurrency(value) : "N/A",
                },
                {
                  Header: "Premium",
                  accessor: "total_premium",
                  width: "12%",
                  Cell: ({ value, row }) => {
                    const premium = value || row.original.premium || 0;
                    return (
                      <MDTypography variant="body2" fontWeight="bold" color="info">
                        {formatCurrency(premium)}
                      </MDTypography>
                    );
                  },
                },
                {
                  Header: "Volume",
                  accessor: "volume",
                  width: "10%",
                  Cell: ({ value }) => value ? parseInt(value).toLocaleString() : "N/A",
                },
                {
                  Header: "OI",
                  accessor: "open_interest",
                  width: "8%",
                  Cell: ({ value }) => value ? parseInt(value).toLocaleString() : "N/A",
                },
                {
                  Header: "Expiry",
                  accessor: "expiry",
                  width: "10%",
                  Cell: ({ value }) => value ? formatDate(value, "fr-FR", false) : "N/A",
                },
                {
                  Header: "Date",
                  accessor: "created_at",
                  width: "12%",
                  Cell: ({ value, row }) => {
                    const date = value || row.original.timestamp;
                    return date ? formatDate(date, "fr-FR", true) : "N/A";
                  },
                },
              ],
              rows: flowAlerts.sort((a, b) => {
                const premiumA = parseFloat(a.total_premium || a.premium || 0);
                const premiumB = parseFloat(b.total_premium || b.premium || 0);
                return premiumB - premiumA;
              }),
            }}
            canSearch={true}
            entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
            showTotalEntries={true}
            pagination={{ variant: "gradient", color: "dark" }}
            isSorted={true}
            noEndBorder={false}
          />
        ) : (
          <MDTypography variant="body2" color="text">
            Aucun flow alert disponible
          </MDTypography>
        )}
      </MDBox>
    </Card>
  );
}

export default FlowAlertsTab;

