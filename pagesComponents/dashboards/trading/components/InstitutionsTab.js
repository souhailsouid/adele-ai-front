/**
 * Onglet Institutions - Activité Institutionnelle
 */

import { useState, useEffect, useCallback } from "react";
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
import TransactionsModal from "./TransactionsModal";

function InstitutionsTab() {
  const [institutionalActivity, setInstitutionalActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [institutionTransactions, setInstitutionTransactions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const activity = await whaleTrackerService.loadInstitutionalActivity({ limit: 100 });
      setInstitutionalActivity(activity);
    } catch (err) {
      console.error("Error loading institutional activity:", err);
      setError(err.message || "Erreur lors du chargement de l'activité institutionnelle");
    } finally {
      setLoading(false);
    }
  };

  const loadInstitutionTransactions = useCallback(async (name) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedInstitution(name);
      const transactions = await whaleTrackerService.loadInstitutionTransactions(name, { limit: 100 });
      setInstitutionTransactions(transactions);
      setModalOpen(true);
    } catch (err) {
      console.error(`Error loading transactions for ${name}:`, err);
      setError(err.message || `Erreur lors du chargement des transactions pour ${name}`);
      setInstitutionTransactions([]);
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedInstitution(null);
    setInstitutionTransactions([]);
  };

  if (loading && !modalOpen) {
    return <LinearProgress />;
  }

  return (
    <>
      <Card>
        <MDBox p={3}>
          {error && !modalOpen && (
            <MDBox mb={2}>
              <MDTypography variant="body2" color="error">
                {error}
              </MDTypography>
            </MDBox>
          )}

          <MDTypography variant="h6" fontWeight="medium" mb={2}>
            Activité Institutionnelle - Derniers Filings ({institutionalActivity.length})
          </MDTypography>
          {institutionalActivity.length > 0 ? (
            <DataTable
              table={{
                columns: [
                  {
                    Header: "Institution",
                    accessor: "name",
                    width: "30%",
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
                        onClick={() => loadInstitutionTransactions(row.original.name || row.original.short_name)}
                      >
                        <Icon>visibility</Icon>&nbsp;Transactions
                      </MDButton>
                    ),
                  },
                ],
                rows: institutionalActivity.sort((a, b) => {
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
              Aucune activité institutionnelle disponible
            </MDTypography>
          )}
        </MDBox>
      </Card>

      {/* Modal pour transactions institutionnelles */}
      <TransactionsModal
        open={modalOpen}
        onClose={handleCloseModal}
        title={selectedInstitution ? `Transactions de ${selectedInstitution}` : "Transactions"}
        loading={loading}
        transactions={institutionTransactions}
        emptyMessage="Aucune transaction disponible"
      />
    </>
  );
}

export default InstitutionsTab;

