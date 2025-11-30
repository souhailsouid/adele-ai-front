/**
 * Onglet Insider Trades - FMP
 */

import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DataTable from "/examples/Tables/DataTable";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import MDInput from "/components/MDInput";
import MDButton from "/components/MDButton";
import Icon from "@mui/material/Icon";
import { formatDate } from "/utils/formatting";
import whaleTrackerService from "/services/whaleTrackerService";

function FMPInsiderTradesTab() {
  const [fmpInsiderTrades, setFmpInsiderTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [symbol, setSymbol] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (searchSymbol = "") => {
    try {
      setLoading(true);
      setError(null);
      const trades = await whaleTrackerService.loadFMPInsiderTrades({
        symbol: searchSymbol || undefined,
        limit: 50,
      });
      setFmpInsiderTrades(trades);
    } catch (err) {
      console.error("Error loading FMP insider trades:", err);
      setError(err.message || "Erreur lors du chargement des insider trades FMP");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadData(symbol);
  };

  const handleClear = () => {
    setSymbol("");
    loadData();
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Card>
      <MDBox p={3}>
        <MDBox mb={3} display="flex" gap={2} alignItems="center">
          <MDInput
            label="Symbole (optionnel)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Ex: AAPL"
            variant="standard"
            sx={{ flex: 1, maxWidth: 200 }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <MDButton
            variant="gradient"
            color="info"
            size="small"
            onClick={handleSearch}
          >
            <Icon>search</Icon>&nbsp;Rechercher
          </MDButton>
          {symbol && (
            <MDButton
              variant="outlined"
              color="dark"
              size="small"
              onClick={handleClear}
            >
              <Icon>clear</Icon>&nbsp;Effacer
            </MDButton>
          )}
        </MDBox>

        {error && (
          <MDBox mb={2}>
            <MDTypography variant="body2" color="error">
              {error}
            </MDTypography>
          </MDBox>
        )}

        <MDTypography variant="h6" fontWeight="medium" mb={2}>
          Insider Transactions (FMP) ({fmpInsiderTrades.length})
        </MDTypography>
        {fmpInsiderTrades.length > 0 ? (
          <DataTable
            table={{
              columns: [
                {
                  Header: "Symbole",
                  accessor: "symbol",
                  width: "10%",
                  Cell: ({ value }) => (
                    <MDTypography variant="body2" fontWeight="medium" color="text">
                      {value || "N/A"}
                    </MDTypography>
                  ),
                },
                {
                  Header: "Nom",
                  accessor: "reportingName",
                  width: "20%",
                },
                {
                  Header: "Type Owner",
                  accessor: "typeOfOwner",
                  width: "12%",
                },
                {
                  Header: "Type Transaction",
                  accessor: "transactionType",
                  width: "15%",
                  Cell: ({ value, row }) => {
                    const isBuy = value?.includes("Award") || value?.includes("Purchase") || row.original.acquisitionOrDisposition === "A";
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
                  Header: "Shares",
                  accessor: "securitiesTransacted",
                  width: "12%",
                  Cell: ({ value }) => value ? parseInt(value).toLocaleString() : "N/A",
                },
                {
                  Header: "Prix",
                  accessor: "price",
                  width: "10%",
                  Cell: ({ value }) => value ? `$${parseFloat(value).toFixed(2)}` : "$0",
                },
                {
                  Header: "Transaction",
                  accessor: "transactionDate",
                  width: "12%",
                  Cell: ({ value }) => formatDate(value),
                },
                {
                  Header: "Filing",
                  accessor: "filingDate",
                  width: "12%",
                  Cell: ({ value }) => formatDate(value),
                },
              ],
              rows: fmpInsiderTrades.sort((a, b) => {
                const dateA = new Date(a.transactionDate || a.filingDate || 0);
                const dateB = new Date(b.transactionDate || b.filingDate || 0);
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
            Aucune transaction insider FMP disponible
          </MDTypography>
        )}
      </MDBox>
    </Card>
  );
}

export default FMPInsiderTradesTab;

