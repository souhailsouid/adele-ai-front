/**
 * Onglet Insider Trades - Unusual Whales
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

function InsiderTradesTab() {
  const [insiderTrades, setInsiderTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const trades = await whaleTrackerService.loadInsiderTrades({ limit: 50 });
      console.log("InsiderTradesTab - Received trades:", trades.length, trades[0]);
      setInsiderTrades(trades);
      if (trades.length === 0) {
        setError("Aucune transaction insider disponible. Vérifiez que l'API retourne des données.");
      }
    } catch (err) {
      console.error("Error loading insider trades:", err);
      setError(err.message || "Erreur lors du chargement des insider trades");
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
          Insider Transactions (Unusual Whales) ({insiderTrades.length})
        </MDTypography>
        {insiderTrades.length > 0 ? (
          <DataTable
            table={{
              columns: [
                {
                  Header: "Ticker",
                  accessor: "ticker",
                  width: "10%",
                  Cell: ({ value }) => (
                    <MDTypography variant="body2" fontWeight="medium" color="text">
                      {value || "N/A"}
                    </MDTypography>
                  ),
                },
                {
                  Header: "Nom",
                  accessor: "owner_name",
                  width: "20%",
                },
                {
                  Header: "Titre",
                  accessor: "officer_title",
                  width: "15%",
                },
                {
                  Header: "Type",
                  accessor: "transaction_code",
                  width: "10%",
                  Cell: ({ value, row }) => {
                    const isBuy = value === "A" || value === "P" || (row.original.acquisitionOrDisposition === "A");
                    return (
                      <Chip
                        label={value || "N/A"}
                        size="small"
                        color={isBuy ? "success" : "error"}
                      />
                    );
                  },
                },
                {
                  Header: "Montant",
                  accessor: "amount",
                  width: "12%",
                  Cell: ({ value }) => {
                    const numValue = typeof value === "string" ? parseFloat(value) : value;
                    return (
                      <MDTypography variant="body2" fontWeight="medium" color={numValue > 0 ? "success.main" : "error.main"}>
                        {formatCurrency(Math.abs(numValue))}
                      </MDTypography>
                    );
                  },
                },
                {
                  Header: "Shares",
                  accessor: "shares_owned_after",
                  width: "10%",
                  Cell: ({ value }) => value ? parseInt(value).toLocaleString() : "N/A",
                },
                {
                  Header: "Transaction",
                  accessor: "transaction_date",
                  width: "12%",
                  Cell: ({ value }) => formatDate(value),
                },
                {
                  Header: "Filing",
                  accessor: "filing_date",
                  width: "11%",
                  Cell: ({ value }) => formatDate(value),
                },
              ],
              rows: insiderTrades.sort((a, b) => {
                const dateA = new Date(a.transaction_date || a.filing_date || 0);
                const dateB = new Date(b.transaction_date || b.filing_date || 0);
                return dateB - dateA;
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
            Aucune transaction insider disponible
          </MDTypography>
        )}
      </MDBox>
    </Card>
  );
}

export default InsiderTradesTab;

