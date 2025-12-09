/**
 * Composant pour afficher les détails d'un filing 13F
 * Affiche les holdings et l'activité de trading d'une institution
 */

import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";
import fmpUWClient from "/lib/api/fmpUnusualWhalesClient";
import fmpUWClient2 from "/lib/api/fmpUWClient2";
import Icon from "@mui/material/Icon";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

function Institution13FDetails({ open, onClose, filing }) {
  const [activeTab, setActiveTab] = useState(0);
  const [holdings, setHoldings] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && filing && filing.cik) {
      loadData();
    } else {
      setHoldings([]);
      setActivity([]);
      setError(null);
    }
  }, [open, filing]);

  const loadData = async () => {
    if (!filing || !filing.cik) return;

    try {
      setLoading(true);
      setError(null);

      // Le CIK sera normalisé par la méthode API (format 10 chiffres avec zéros en tête)
      const cik = String(filing.cik).trim();
      const reportDate = filing.reportDate || filing.report_date;

      // Charger les holdings et l'activité en parallèle
      const [holdingsData, activityData] = await Promise.allSettled([
        fmpUWClient2.getUWInstitutionHoldingsByCIK(cik, {
        //   date: reportDate,
          limit: 100,
          order: "value",
          order_direction: "desc",
        }).catch(() => []),
        fmpUWClient2.getUWInstitutionActivityByCIK(cik, {
          date: reportDate,
          limit: 100,
        }).catch(() => []),
      ]);

      if (holdingsData.status === "fulfilled") {
        const data = holdingsData.value;
        setHoldings(Array.isArray(data) ? data : (data?.data || []));
      }

      if (activityData.status === "fulfilled") {
        const data = activityData.value;
        setActivity(Array.isArray(data) ? data : (data?.data || []));
      }
    } catch (err) {
      console.error("Error loading 13F details:", err);
      setError(err.message || "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "N/A";
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${typeof value === "number" ? value.toFixed(2) : value}`;
  };

  const formatNumber = (value) => {
    if (!value && value !== 0) return "N/A";
    return value.toLocaleString();
  };

  // Préparer les données pour le graphique d'évolution des holdings
  const prepareHistoricalChart = (holding) => {
    if (!holding.historical_units || !Array.isArray(holding.historical_units)) {
      return null;
    }

    const historicalData = holding.historical_units.slice().reverse(); // Plus ancien en premier
    return {
      labels: historicalData.map((_, idx) => `P${idx + 1}`),
      datasets: [
        {
          label: holding.ticker || "Units",
          data: historicalData.map((h) => h.units || 0),
          borderColor: "#1976d2",
          backgroundColor: "rgba(25, 118, 210, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  if (!filing) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle>
        <MDBox display="flex" justifyContent="space-between" alignItems="center">
          <MDBox>
            <MDTypography variant="h5" fontWeight="bold">
              {filing.institutionName && filing.institutionName !== "None"
                ? filing.institutionName
                : "Institution"}
            </MDTypography>
            <MDTypography variant="caption" color="text.secondary">
              CIK: {filing.cik} • {filing.formType} • {filing.reportDate || filing.report_date}
            </MDTypography>
          </MDBox>
          <IconButton onClick={onClose} size="small">
            <Icon>close</Icon>
          </IconButton>
        </MDBox>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Holdings" />
            <Tab label="Activity" />
          </Tabs>
        </Box>

        {loading ? (
          <LinearProgress />
        ) : error ? (
          <MDTypography variant="body2" color="error">
            {error}
          </MDTypography>
        ) : (
          <>
            {/* Tab 0: Holdings */}
            {activeTab === 0 && (
              <TableContainer sx={{ maxHeight: 500 }}>
                <Table stickyHeader size="small">
                  <MDBox component="thead">
                    <TableRow>
                      <DataTableHeadCell width="15%">Ticker</DataTableHeadCell>
                      <DataTableHeadCell width="15%" align="right">
                        Units
                      </DataTableHeadCell>
                      <DataTableHeadCell width="15%" align="right">
                        Change
                      </DataTableHeadCell>
                      <DataTableHeadCell width="15%" align="right">
                        Value
                      </DataTableHeadCell>
                      <DataTableHeadCell width="15%">First Buy</DataTableHeadCell>
                      <DataTableHeadCell width="25%">Evolution</DataTableHeadCell>
                    </TableRow>
                  </MDBox>
                  <TableBody>
                    {holdings.map((holding, index) => {
                      const unitsChange = holding.units_change || 0;
                      const chartData = prepareHistoricalChart(holding);

                      return (
                        <TableRow
                          key={`holding-${index}-${holding.ticker}`}
                          sx={{ "&:hover": { backgroundColor: "action.hover" } }}
                        >
                          <DataTableBodyCell>
                            <MDTypography variant="body2" fontWeight="bold">
                              {holding.ticker || "N/A"}
                            </MDTypography>
                          </DataTableBodyCell>
                          <DataTableBodyCell align="right">
                            <MDTypography variant="body2">
                              {formatNumber(holding.units)}
                            </MDTypography>
                          </DataTableBodyCell>
                          <DataTableBodyCell align="right">
                            <MDBox display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                              <Chip
                                label={unitsChange >= 0 ? `+${formatNumber(unitsChange)}` : formatNumber(unitsChange)}
                                size="small"
                                color={unitsChange >= 0 ? "success" : "error"}
                                sx={{ fontWeight: "bold" }}
                              />
                            </MDBox>
                          </DataTableBodyCell>
                          <DataTableBodyCell align="right">
                            <MDTypography variant="body2" fontWeight="medium">
                              {formatCurrency(holding.value)}
                            </MDTypography>
                          </DataTableBodyCell>
                          <DataTableBodyCell>
                            <MDTypography variant="caption">
                              {holding.first_buy || "N/A"}
                            </MDTypography>
                          </DataTableBodyCell>
                          <DataTableBodyCell>
                            {chartData ? (
                              <MDBox height={50}>
                                <Line
                                  data={chartData}
                                  options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                      legend: { display: false },
                                      tooltip: { enabled: true },
                                    },
                                    scales: {
                                      x: { display: false },
                                      y: { display: false },
                                    },
                                  }}
                                />
                              </MDBox>
                            ) : (
                              <MDTypography variant="caption" color="text.secondary">
                                No history
                              </MDTypography>
                            )}
                          </DataTableBodyCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Tab 1: Activity */}
            {activeTab === 1 && (
              <TableContainer sx={{ maxHeight: 500 }}>
                <Table stickyHeader size="small">
                  <MDBox component="thead">
                    <TableRow>
                      <DataTableHeadCell width="15%">Ticker</DataTableHeadCell>
                      <DataTableHeadCell width="12%" align="right">
                        Buy Price
                      </DataTableHeadCell>
                      <DataTableHeadCell width="12%" align="right">
                        Sell Price
                      </DataTableHeadCell>
                      <DataTableHeadCell width="15%" align="right">
                        Units Change
                      </DataTableHeadCell>
                      <DataTableHeadCell width="15%">Filing Date</DataTableHeadCell>
                      <DataTableHeadCell width="15%">Report Date</DataTableHeadCell>
                      <DataTableHeadCell width="16%">Type</DataTableHeadCell>
                    </TableRow>
                  </MDBox>
                  <TableBody>
                    {activity.map((transaction, index) => {
                      const unitsChange = transaction.units_change || 0;
                      const isBuy = unitsChange > 0;

                      return (
                        <TableRow
                          key={`activity-${index}-${transaction.ticker}`}
                          sx={{ "&:hover": { backgroundColor: "action.hover" } }}
                        >
                          <DataTableBodyCell>
                            <MDTypography variant="body2" fontWeight="bold">
                              {transaction.ticker || "N/A"}
                            </MDTypography>
                          </DataTableBodyCell>
                          <DataTableBodyCell align="right">
                            <MDTypography variant="body2" color="success">
                              {transaction.buy_price
                                ? formatCurrency(transaction.buy_price)
                                : "-"}
                            </MDTypography>
                          </DataTableBodyCell>
                          <DataTableBodyCell align="right">
                            <MDTypography variant="body2" color="error">
                              {transaction.sell_price
                                ? formatCurrency(transaction.sell_price)
                                : "-"}
                            </MDTypography>
                          </DataTableBodyCell>
                          <DataTableBodyCell align="right">
                            <Chip
                              label={isBuy ? `+${formatNumber(unitsChange)}` : formatNumber(unitsChange)}
                              size="small"
                              color={isBuy ? "success" : "error"}
                              icon={<Icon fontSize="small">{isBuy ? "arrow_upward" : "arrow_downward"}</Icon>}
                            />
                          </DataTableBodyCell>
                          <DataTableBodyCell>
                            <MDTypography variant="caption">
                              {transaction.filing_date || "N/A"}
                            </MDTypography>
                          </DataTableBodyCell>
                          <DataTableBodyCell>
                            <MDTypography variant="caption">
                              {transaction.report_date || "N/A"}
                            </MDTypography>
                          </DataTableBodyCell>
                          <DataTableBodyCell>
                            <Chip
                              label={isBuy ? "BUY" : "SELL"}
                              size="small"
                              color={isBuy ? "success" : "error"}
                            />
                          </DataTableBodyCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {activeTab === 0 && holdings.length === 0 && (
              <MDBox textAlign="center" py={4}>
                <MDTypography variant="body2" color="text.secondary">
                  Aucun holding disponible pour cette institution
                </MDTypography>
              </MDBox>
            )}

            {activeTab === 1 && activity.length === 0 && (
              <MDBox textAlign="center" py={4}>
                <MDTypography variant="body2" color="text.secondary">
                  Aucune activité disponible pour cette institution
                </MDTypography>
              </MDBox>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <MDButton onClick={onClose} color="secondary">
          Fermer
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

export default Institution13FDetails;

