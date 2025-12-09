/**
 * Trading Dashboard - Opportunités Earnings
 */

import { useState, useEffect, useCallback } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import { useRouter } from "next/router";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import MDInput from "/components/MDInput";
import MDButton from "/components/MDButton";
import Autocomplete from "@mui/material/Autocomplete";
import LinearProgress from "@mui/material/LinearProgress";
import DataTable from "/examples/Tables/DataTable";

// Services
import smartScreener from "/services/screener";
import fmpUWClient from "/lib/api/fmpUnusualWhalesClient";
import withAuth from "/hocs/withAuth";
import metricsService from "/services/metricsService";
import CompanyFilter from "/pagesComponents/dashboards/trading/components/CompanyFilter";
import EarningsOpportunities from "/pagesComponents/dashboards/trading/components/EarningsOpportunities";

// Config
import { getWatchlistSymbols } from "/config/watchlist";

function TradingEarnings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [earningsOpportunities, setEarningsOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour Analyst Estimates et Transcripts
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [analystEstimates, setAnalystEstimates] = useState(null);
  const [earningsTranscript, setEarningsTranscript] = useState(null);
  const [loadingEstimates, setLoadingEstimates] = useState(false);
  const [period, setPeriod] = useState("annual");

  const loadEarningsData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const opportunities = await smartScreener.findEarningsOpportunities(7);
      setEarningsOpportunities(opportunities || []);
    } catch (err) {
      console.error("Error loading earnings opportunities:", err);
      setError(err.message || "Erreur lors du chargement des opportunités");
    } finally {
      setLoading(false);
    }
  }, []);

  // Recherche d'entreprises
  const handleSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await fmpUWClient.searchCompanyByName(query);
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
      setLoadingEstimates(true);
      setError(null);
      const [estimatesData] = await Promise.allSettled([
        fmpUWClient.getFMPAnalystEstimates(symbol.toUpperCase(), period, 10), // Max 10 pour plan Starter
      ]);
      if (estimatesData.status === "fulfilled") {
        setAnalystEstimates(Array.isArray(estimatesData.value) ? estimatesData.value : []);
      }
    } catch (err) {
      console.error("Error loading analyst estimates:", err);
      setError(err.message || "Erreur lors du chargement des estimations");
    } finally {
      setLoadingEstimates(false);
    }
  }, [selectedSymbol, period]);

  // Charger le transcript d'earnings
  const loadEarningsTranscript = useCallback(async (symbol = selectedSymbol, year = new Date().getFullYear(), quarter = 1) => {
    if (!symbol) return;
    try {
      setLoadingEstimates(true);
      setError(null);
      const transcriptData = await fmpUWClient.getFMPEarningsTranscript(symbol.toUpperCase(), year, quarter);
      setEarningsTranscript(transcriptData);
    } catch (err) {
      console.error("Error loading earnings transcript:", err);
      setError(err.message || "Erreur lors du chargement du transcript");
      setEarningsTranscript(null);
    } finally {
      setLoadingEstimates(false);
    }
  }, [selectedSymbol]);

  useEffect(() => {
    loadEarningsData();
    // Track l'utilisation de la page earnings
    metricsService.trackFeatureUsage("earnings");
  }, [loadEarningsData]);

  useEffect(() => {
    if (activeTab === 1 && selectedSymbol) {
      loadAnalystEstimates();
    }
  }, [activeTab, selectedSymbol, period, loadAnalystEstimates]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Earnings & Estimations Analystes
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Opportunités de trading, estimations d&apos;analystes et transcripts
          </MDTypography>
        </MDBox>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
            <Tab label="Opportunités Earnings" icon={<Icon>trending_up</Icon>} iconPosition="start" />
            <Tab label="Estimations Analystes" icon={<Icon>analytics</Icon>} iconPosition="start" />
            <Tab label="Earnings Transcripts" icon={<Icon>description</Icon>} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Onglet Opportunités Earnings */}
        {activeTab === 0 && (
          <>
            {loading ? (
              <MDBox p={3}>
                <LinearProgress />
              </MDBox>
            ) : error ? (
              <MDTypography variant="body2" color="error">
                {error}
              </MDTypography>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <EarningsOpportunities data={earningsOpportunities} />
                </Grid>
              </Grid>
            )}
          </>
        )}

        {/* Onglet Estimations Analystes */}
        {activeTab === 1 && (
          <>
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
                <Grid item xs={12} md={12}>
                  <MDButton
                    variant="gradient"
                    color="info"
                    onClick={() => loadAnalystEstimates()}
                    disabled={loadingEstimates}
                    fullWidth
                  >
                    Charger les Estimations
                  </MDButton>
                </Grid>
              </Grid>
            </MDBox>

            {loadingEstimates ? (
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
                            { Header: "Date", accessor: "date", width: "12%" },
                            { Header: "Revenus Avg", accessor: "revenueAvg", width: "14%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
                            { Header: "Revenus Low", accessor: "revenueLow", width: "12%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
                            { Header: "Revenus High", accessor: "revenueHigh", width: "12%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
                            { Header: "EBITDA Avg", accessor: "ebitdaAvg", width: "14%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
                            { Header: "EBITDA Low", accessor: "ebitdaLow", width: "11%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
                            { Header: "EBITDA High", accessor: "ebitdaHigh", width: "11%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
                            { Header: "EPS Avg", accessor: "epsAvg", width: "10%", Cell: ({ value }) => value ? `$${value.toFixed(2)}` : "N/A" },
                            { Header: "EPS Low", accessor: "epsLow", width: "8%", Cell: ({ value }) => value ? `$${value.toFixed(2)}` : "N/A" },
                            { Header: "EPS High", accessor: "epsHigh", width: "8%", Cell: ({ value }) => value ? `$${value.toFixed(2)}` : "N/A" },
                            { Header: "Nb Analystes Rev", accessor: "numAnalystsRevenue", width: "10%", Cell: ({ value }) => value ? value : "N/A" },
                            { Header: "Nb Analystes EPS", accessor: "numAnalystsEps", width: "10%", Cell: ({ value }) => value ? value : "N/A" },
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
          </>
        )}

        {/* Onglet Earnings Transcripts */}
        {activeTab === 2 && (
          <>
            <MDBox mb={3}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
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
                <Grid item xs={12} md={2}>
                  <MDInput
                    label="Symbole"
                    value={selectedSymbol}
                    onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <MDBox
                    component="select"
                    fullWidth
                    id="quarter-select"
                    defaultValue={1}
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
                    <option value={1}>Q1</option>
                    <option value={2}>Q2</option>
                    <option value={3}>Q3</option>
                    <option value={4}>Q4</option>
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={2}>
                  <MDInput
                    label="Année"
                    type="number"
                    defaultValue={new Date().getFullYear()}
                    inputProps={{ id: "year-input" }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <MDButton
                    variant="gradient"
                    color="info"
                    onClick={() => {
                      const quarter = parseInt(document.getElementById("quarter-select")?.value || 1);
                      const year = parseInt(document.getElementById("year-input")?.value || new Date().getFullYear());
                      loadEarningsTranscript(selectedSymbol, year, quarter);
                    }}
                    disabled={loadingEstimates}
                    fullWidth
                  >
                    Charger Transcript
                  </MDButton>
                </Grid>
              </Grid>
            </MDBox>

            {loadingEstimates ? (
              <MDBox p={3}>
                <LinearProgress />
              </MDBox>
            ) : earningsTranscript ? (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <MDBox p={3}>
                      <MDTypography variant="h6" fontWeight="medium" mb={2}>
                        Earnings Transcript - {selectedSymbol}
                      </MDTypography>
                      <MDBox
                        sx={{
                          maxHeight: "600px",
                          overflowY: "auto",
                          whiteSpace: "pre-wrap",
                          fontFamily: "monospace",
                          fontSize: "0.875rem",
                          lineHeight: 1.6,
                        }}
                      >
                        {earningsTranscript.transcript || earningsTranscript.content || JSON.stringify(earningsTranscript, null, 2)}
                      </MDBox>
                    </MDBox>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <MDBox p={3}>
                <MDTypography variant="body2" color="text">
                  {selectedSymbol ? `Aucun transcript disponible pour ${selectedSymbol}` : "Sélectionnez un symbole pour voir le transcript"}
                </MDTypography>
              </MDBox>
            )}
          </>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default withAuth(TradingEarnings);

