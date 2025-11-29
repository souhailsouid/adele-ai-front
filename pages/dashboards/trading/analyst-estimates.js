/**
 * Trading Dashboard - Estimations Analystes
 * Page dédiée aux estimations d'analystes pour les entreprises
 */

import { useState, useEffect, useCallback } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import Card from "@mui/material/Card";
import MDInput from "/components/MDInput";
import MDButton from "/components/MDButton";
import Autocomplete from "@mui/material/Autocomplete";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import DataTable from "/examples/Tables/DataTable";
import MiniStatisticsCard from "/examples/Cards/StatisticsCards/MiniStatisticsCard";

// Services
import fmpClient from "/lib/fmp/client";
import metricsService from "/services/metricsService";

function TradingAnalystEstimates() {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [analystEstimates, setAnalystEstimates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("annual");
  const [activeTab, setActiveTab] = useState(0);

  // Recherche d'entreprises
  const handleSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await fmpClient.searchCompanyByName(query);
      setSearchResults(results.slice(0, 10));
    } catch (err) {
      console.error("Error searching companies:", err);
      setSearchResults([]);
    }
  }, []);

  // Charger les estimations d'analystes
  const loadAnalystEstimates = useCallback(async (symbol = selectedSymbol) => {
    if (!symbol) return;
    try {
      setLoading(true);
      setError(null);
      const estimatesData = await fmpClient.getAnalystEstimates(
        symbol.toUpperCase(),
        period,
        0,
        10 // Max 10 pour plan Starter
      );
      setAnalystEstimates(Array.isArray(estimatesData) ? estimatesData : []);
    } catch (err) {
      console.error("Error loading analyst estimates:", err);
      setError(err.message || "Erreur lors du chargement des estimations");
      setAnalystEstimates([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSymbol, period]);

  useEffect(() => {
    loadAnalystEstimates();
    metricsService.trackFeatureUsage("analyst-estimates");
  }, [loadAnalystEstimates]);

  // Calculer les statistiques
  const stats = analystEstimates && analystEstimates.length > 0 ? {
    avgRevenue: analystEstimates.reduce((sum, e) => sum + (e.revenueAvg || 0), 0) / analystEstimates.length,
    avgEps: analystEstimates.reduce((sum, e) => sum + (e.epsAvg || 0), 0) / analystEstimates.length,
    avgAnalysts: analystEstimates.reduce((sum, e) => sum + ((e.numAnalystsRevenue || 0) + (e.numAnalystsEps || 0)), 0) / analystEstimates.length / 2,
    latest: analystEstimates[0],
  } : null;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Estimations Analystes
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Estimations de revenus, EBITDA et EPS par les analystes
          </MDTypography>
        </MDBox>

        {/* Recherche */}
        <MDBox mb={3}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Autocomplete
                freeSolo
                options={searchResults.map((result) => ({
                  label: `${result.symbol} - ${result.name}`,
                  symbol: result.symbol,
                }))}
                onInputChange={(event, newValue) => {
                  setSearchQuery(newValue);
                  handleSearch(newValue);
                }}
                onChange={(event, newValue) => {
                  if (newValue && newValue.symbol) {
                    setSelectedSymbol(newValue.symbol);
                    loadAnalystEstimates(newValue.symbol);
                  }
                }}
                renderInput={(params) => (
                  <MDInput
                    {...params}
                    label="Rechercher une entreprise"
                    placeholder="Ex: Apple, AAPL"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <MDInput
                label="Symbole"
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <MDBox
                component="select"
                fullWidth
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                sx={{
                  padding: "12px 14px",
                  border: "1px solid rgba(0, 0, 0, 0.23)",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  fontFamily: "inherit",
                  backgroundColor: "transparent",
                  "&:focus": {
                    borderColor: "primary.main",
                    outline: "none",
                  },
                }}
              >
                <option value="annual">Annuel</option>
                <option value="quarter">Trimestriel</option>
              </MDBox>
            </Grid>
            <Grid item xs={12}>
              <MDButton
                variant="gradient"
                color="info"
                onClick={() => loadAnalystEstimates()}
                disabled={loading}
                fullWidth
              >
                Charger les Estimations
              </MDButton>
            </Grid>
          </Grid>
        </MDBox>

        {/* Erreur */}
        {error && (
          <MDBox mb={3}>
            <MDTypography variant="body2" color="error">
              {error}
            </MDTypography>
          </MDBox>
        )}

        {/* Statistiques */}
        {stats && stats.latest && (
          <MDBox mb={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <MiniStatisticsCard
                  title={{ text: "Revenus Estimés (Moy)", fontWeight: "medium" }}
                  count={stats.avgRevenue ? `$${(stats.avgRevenue / 1_000_000).toFixed(2)}M` : "N/A"}
                  percentage={{ color: "success", text: "" }}
                  icon={{ color: "success", component: "trending_up" }}
                  direction="right"
                  bgColor="white"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MiniStatisticsCard
                  title={{ text: "EPS Estimé (Moy)", fontWeight: "medium" }}
                  count={stats.avgEps ? `$${stats.avgEps.toFixed(2)}` : "N/A"}
                  percentage={{ color: "info", text: "" }}
                  icon={{ color: "info", component: "assessment" }}
                  direction="right"
                  bgColor="white"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MiniStatisticsCard
                  title={{ text: "Nb Analystes (Moy)", fontWeight: "medium" }}
                  count={stats.avgAnalysts ? Math.round(stats.avgAnalysts) : "N/A"}
                  percentage={{ color: "primary", text: "" }}
                  icon={{ color: "primary", component: "people" }}
                  direction="right"
                  bgColor="white"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MiniStatisticsCard
                  title={{ text: "Dernière Estimation", fontWeight: "medium" }}
                  count={stats.latest.date || "N/A"}
                  percentage={{ color: "warning", text: "" }}
                  icon={{ color: "warning", component: "calendar_today" }}
                  direction="right"
                  bgColor="white"
                />
              </Grid>
            </Grid>
          </MDBox>
        )}

        {/* Tableau des estimations */}
        {loading ? (
          <MDBox p={3}>
            <LinearProgress />
          </MDBox>
        ) : analystEstimates && analystEstimates.length > 0 ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Estimations des Analystes - {selectedSymbol}
                  </MDTypography>
                  <DataTable
                    table={{
                      columns: [
                        { Header: "Date", accessor: "date", width: "10%" },
                        { Header: "Revenus Avg", accessor: "revenueAvg", width: "12%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
                        { Header: "Revenus Low", accessor: "revenueLow", width: "11%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
                        { Header: "Revenus High", accessor: "revenueHigh", width: "11%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
                        { Header: "EBITDA Avg", accessor: "ebitdaAvg", width: "12%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
                        { Header: "EBITDA Low", accessor: "ebitdaLow", width: "10%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
                        { Header: "EBITDA High", accessor: "ebitdaHigh", width: "10%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
                        { Header: "EPS Avg", accessor: "epsAvg", width: "9%", Cell: ({ value }) => value ? `$${value.toFixed(2)}` : "N/A" },
                        { Header: "EPS Low", accessor: "epsLow", width: "8%", Cell: ({ value }) => value ? `$${value.toFixed(2)}` : "N/A" },
                        { Header: "EPS High", accessor: "epsHigh", width: "8%", Cell: ({ value }) => value ? `$${value.toFixed(2)}` : "N/A" },
                        { Header: "Nb Analystes Rev", accessor: "numAnalystsRevenue", width: "9%", Cell: ({ value }) => (
                          <Chip label={value || 0} size="small" color="primary" />
                        )},
                        { Header: "Nb Analystes EPS", accessor: "numAnalystsEps", width: "9%", Cell: ({ value }) => (
                          <Chip label={value || 0} size="small" color="info" />
                        )},
                      ],
                      rows: analystEstimates,
                    }}
                    canSearch={true}
                    entriesPerPage={{ defaultValue: 10, entries: [5, 10] }} // Max 10 pour plan Starter
                    showTotalEntries={true}
                    pagination={{ variant: "gradient", color: "dark" }}
                    isSorted={true}
                    noEndBorder={false}
                  />
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <MDBox p={3}>
            <MDTypography variant="body2" color="text">
              {selectedSymbol ? `Aucune estimation disponible pour ${selectedSymbol}` : "Sélectionnez un symbole pour voir les estimations"}
            </MDTypography>
          </MDBox>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TradingAnalystEstimates;

