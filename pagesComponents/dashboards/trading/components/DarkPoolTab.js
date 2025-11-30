/**
 * Onglet Dark Pool - Transactions OTC
 */

import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DataTable from "/examples/Tables/DataTable";
import LinearProgress from "@mui/material/LinearProgress";
import { formatCurrency, formatDate } from "/utils/formatting";
import whaleTrackerService from "/services/whaleTrackerService";

function DarkPoolTab() {
  const [darkpoolTrades, setDarkpoolTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const trades = await whaleTrackerService.loadDarkpoolTrades({
        limit: 50,
        min_premium: 500000,
      });
      setDarkpoolTrades(trades);
    } catch (err) {
      console.error("Error loading darkpool trades:", err);
      setError(err.message || "Erreur lors du chargement des dark pool trades");
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
          Dark Pool Trades - Transactions OTC ({darkpoolTrades.length})
        </MDTypography>
        {darkpoolTrades.length > 0 ? (
          <DataTable
            table={{
              columns: [
                {
                  Header: "Ticker",
                  accessor: "ticker",
                  width: "15%",
                  Cell: ({ value }) => (
                    <MDTypography variant="body2" fontWeight="medium" color="text">
                      {value || "N/A"}
                    </MDTypography>
                  ),
                },
                {
                  Header: "Premium",
                  accessor: "premium",
                  width: "15%",
                  Cell: ({ value }) => (
                    <MDTypography variant="body2" fontWeight="bold" color="warning">
                      {formatCurrency(value)}
                    </MDTypography>
                  ),
                },
                {
                  Header: "Prix",
                  accessor: "price",
                  width: "12%",
                  Cell: ({ value }) => value ? `$${parseFloat(value).toFixed(2)}` : "N/A",
                },
                {
                  Header: "Volume",
                  accessor: "volume",
                  width: "15%",
                  Cell: ({ value }) => value ? parseInt(value).toLocaleString() : "N/A",
                },
                {
                  Header: "Market Center",
                  accessor: "market_center",
                  width: "12%",
                },
                {
                  Header: "Date",
                  accessor: "executed_at",
                  width: "20%",
                  Cell: ({ value }) => formatDate(value),
                },
              ],
              rows: darkpoolTrades.sort(
                (a, b) =>
                  (parseFloat(b.premium) || 0) -
                  (parseFloat(a.premium) || 0)
              ),
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
            Aucun trade dark pool disponible
          </MDTypography>
        )}
      </MDBox>
    </Card>
  );
}

export default DarkPoolTab;

