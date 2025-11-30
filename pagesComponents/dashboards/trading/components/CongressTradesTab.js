/**
 * Onglet Congress Trades - Transactions des Politiques
 */

import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DataTable from "/examples/Tables/DataTable";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import { formatDate } from "/utils/formatting";
import whaleTrackerService from "/services/whaleTrackerService";

function CongressTradesTab() {
  const [congressTrades, setCongressTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const trades = await whaleTrackerService.loadCongressTrades({ limit: 50 });
      console.log("CongressTradesTab - Received trades:", trades.length, trades[0]);
      setCongressTrades(trades);
      if (trades.length === 0) {
        setError("Aucune transaction du Congrès disponible. Vérifiez que l'API retourne des données.");
      }
    } catch (err) {
      console.error("Error loading congress trades:", err);
      setError(err.message || "Erreur lors du chargement des congress trades");
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
          Congress Trades - Transactions des Politiques ({congressTrades.length})
        </MDTypography>
        {congressTrades.length > 0 ? (
          <DataTable
            table={{
              columns: [
                {
                  Header: "Nom",
                  accessor: "name",
                  width: "18%",
                },
                {
                  Header: "Type",
                  accessor: "member_type",
                  width: "10%",
                  Cell: ({ value }) => (
                    <Chip
                      label={value === "senate" ? "Sénat" : value === "house" ? "Chambre" : value || "N/A"}
                      size="small"
                      color={value === "senate" ? "info" : "primary"}
                      variant="outlined"
                    />
                  ),
                },
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
                  Header: "Type Transaction",
                  accessor: "txn_type",
                  width: "12%",
                  Cell: ({ value }) => (
                    <Chip
                      label={value || "N/A"}
                      size="small"
                      color={value === "Buy" ? "success" : "error"}
                    />
                  ),
                },
                {
                  Header: "Montant",
                  accessor: "amounts",
                  width: "15%",
                  Cell: ({ value }) => (
                    <MDTypography variant="body2" fontWeight="medium" color="text">
                      {value || "N/A"}
                    </MDTypography>
                  ),
                },
                {
                  Header: "Issuer",
                  accessor: "issuer",
                  width: "12%",
                },
                {
                  Header: "Transaction",
                  accessor: "transaction_date",
                  width: "12%",
                  Cell: ({ value }) => formatDate(value),
                },
                {
                  Header: "Filing",
                  accessor: "filed_at_date",
                  width: "11%",
                  Cell: ({ value }) => formatDate(value),
                },
              ],
              rows: congressTrades.sort((a, b) => {
                const dateA = new Date(a.transaction_date || a.filed_at_date || 0);
                const dateB = new Date(b.transaction_date || b.filed_at_date || 0);
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
            Aucune transaction du Congrès disponible
          </MDTypography>
        )}
      </MDBox>
    </Card>
  );
}

export default CongressTradesTab;

