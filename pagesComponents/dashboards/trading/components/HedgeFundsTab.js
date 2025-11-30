/**
 * Onglet Hedge Funds
 */

import { useState, useEffect, useCallback } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DataTable from "/examples/Tables/DataTable";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import MDButton from "/components/MDButton";
import Icon from "@mui/material/Icon";
import { formatDate } from "/utils/formatting";
import whaleTrackerService from "/services/whaleTrackerService";
import HEDGE_FUNDS from "/config/hedgeFunds";
import TransactionsModal from "./TransactionsModal";

function HedgeFundsTab() {
  const [hedgeFundActivity, setHedgeFundActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedHedgeFund, setSelectedHedgeFund] = useState(null);
  const [hedgeFundHoldings, setHedgeFundHoldings] = useState({ activity: [], holdings: [] });
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await whaleTrackerService.loadHedgeFundActivity();
      setHedgeFundActivity(data);
    } catch (err) {
      console.error("Error loading hedge fund activity:", err);
      setError(err.message || "Erreur lors du chargement des hedge funds");
    } finally {
      setLoading(false);
    }
  };

  const loadHedgeFundHoldings = useCallback(async (fundId, fundName) => {
    try {
      setLoading(true);
      setSelectedHedgeFund(fundName);
      const data = await whaleTrackerService.loadHedgeFundHoldings(fundId, fundName);
      setHedgeFundHoldings(data);
      setModalOpen(true);
    } catch (err) {
      console.error("Error loading hedge fund holdings:", err);
      setError(err.message || "Erreur lors du chargement des holdings");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedHedgeFund(null);
    setHedgeFundHoldings({ activity: [], holdings: [] });
  };

  return (
    <>
      <MDBox mb={3}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <MDTypography variant="h6" fontWeight="medium" mb={1}>
              🏦 Hedge Funds - Top 20 + Notables
            </MDTypography>
            <MDTypography variant="body2" color="text.secondary">
              Suivi de l&apos;activité des plus grands hedge funds du monde
            </MDTypography>
          </Grid>
          <Grid item xs={12} md={6}>
            <MDBox display="flex" justifyContent="flex-end" alignItems="center" height="100%">
              <Chip
                label={`${hedgeFundActivity.length} hedge fund(s) actif(s)`}
                color="info"
                size="medium"
              />
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>

      {/* Liste des Top 20 Hedge Funds */}
      <Card sx={{ mb: 3 }}>
        <MDBox p={3}>
          <MDTypography variant="h6" fontWeight="medium" mb={2}>
            Top 20 Hedge Funds (par AUM - Juin 2024)
          </MDTypography>
          {loading ? (
            <LinearProgress />
          ) : (
            <DataTable
              table={{
                columns: [
                  {
                    Header: "Rang",
                    accessor: "rank",
                    width: "8%",
                    Cell: ({ row }) => (
                      <MDTypography variant="body2" fontWeight="bold" color="text">
                        #{row.index + 1}
                      </MDTypography>
                    ),
                  },
                  {
                    Header: "Nom",
                    accessor: "name",
                    width: "40%",
                    Cell: ({ value, row }) => (
                      <MDBox>
                        <MDTypography variant="body2" fontWeight="medium" color="text">
                          {value}
                        </MDTypography>
                        <MDTypography variant="caption" color="text.secondary">
                          {row.original.location}
                        </MDTypography>
                      </MDBox>
                    ),
                  },
                  {
                    Header: "AUM",
                    accessor: "aum",
                    width: "15%",
                    Cell: ({ value }) => (
                      <MDTypography variant="body2" fontWeight="bold" color="success.main">
                        ${(value / 1000).toFixed(1)}B
                      </MDTypography>
                    ),
                  },
                  {
                    Header: "Actions",
                    width: "15%",
                    Cell: ({ row }) => (
                      <MDButton
                        variant="outlined"
                        color="info"
                        size="small"
                        onClick={() => loadHedgeFundHoldings(row.original.id || `static-${row.index}`, row.original.name)}
                      >
                        <Icon>visibility</Icon>&nbsp;Holdings
                      </MDButton>
                    ),
                  },
                ],
                rows: HEDGE_FUNDS.top20,
              }}
              canSearch={true}
              entriesPerPage={{ defaultValue: 10, entries: [5, 10, 20] }}
              showTotalEntries={true}
              pagination={{ variant: "gradient", color: "dark" }}
              isSorted={true}
              noEndBorder={false}
            />
          )}
        </MDBox>
      </Card>

      {/* Activité récente des Hedge Funds */}
      <Card sx={{ mb: 3 }}>
        <MDBox p={3}>
          <MDTypography variant="h6" fontWeight="medium" mb={2}>
            Activité Récente des Hedge Funds
          </MDTypography>
          {loading ? (
            <LinearProgress />
          ) : hedgeFundActivity.length > 0 ? (
            <DataTable
              table={{
                columns: [
                  {
                    Header: "Hedge Fund",
                    accessor: "name",
                    width: "35%",
                    Cell: ({ value, row }) => (
                      <MDBox>
                        <MDTypography variant="body2" fontWeight="medium" color="text">
                          {value || "N/A"}
                        </MDTypography>
                        {row.original.short_name && (
                          <MDTypography variant="caption" color="text.secondary">
                            {row.original.short_name}
                          </MDTypography>
                        )}
                      </MDBox>
                    ),
                  },
                  {
                    Header: "CIK",
                    accessor: "cik",
                    width: "12%",
                    Cell: ({ value }) => (
                      <MDTypography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                        {value || "N/A"}
                      </MDTypography>
                    ),
                  },
                  {
                    Header: "Hedge Fund",
                    accessor: "is_hedge_fund",
                    width: "12%",
                    Cell: ({ value }) => (
                      <Chip
                        label={value ? "Oui" : "Non"}
                        size="small"
                        color={value ? "warning" : "default"}
                        variant="outlined"
                      />
                    ),
                  },
                  {
                    Header: "Filing Date",
                    accessor: "filing_date",
                    width: "15%",
                    Cell: ({ value }) => formatDate(value),
                  },
                  {
                    Header: "Actions",
                    width: "15%",
                    Cell: ({ row }) => (
                      <MDButton
                        variant="outlined"
                        color="info"
                        size="small"
                        onClick={() => loadHedgeFundHoldings(row.original.id, row.original.name)}
                      >
                        <Icon>visibility</Icon>&nbsp;Détails
                      </MDButton>
                    ),
                  },
                ],
                rows: hedgeFundActivity.sort((a, b) => {
                  const dateA = new Date(a.filing_date || 0);
                  const dateB = new Date(b.filing_date || 0);
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
              Aucune activité de hedge fund détectée récemment. Les données sont filtrées depuis les filings institutionnels.
            </MDTypography>
          )}
        </MDBox>
      </Card>

      {/* Modal pour Holdings et Activity */}
      <TransactionsModal
        open={modalOpen}
        onClose={handleCloseModal}
        title={selectedHedgeFund ? `Holdings et Activité - ${selectedHedgeFund}` : "Holdings et Activité"}
        loading={loading}
        holdings={hedgeFundHoldings.holdings}
        activity={hedgeFundHoldings.activity}
        emptyMessage={`Aucune donnée disponible pour ${selectedHedgeFund}. Les données peuvent ne pas être disponibles via l'API.`}
      />
    </>
  );
}

export default HedgeFundsTab;

