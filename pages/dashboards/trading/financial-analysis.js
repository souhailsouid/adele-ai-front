/**
 * Trading Dashboard - Analyse Financière
 * Accès aux états financiers en temps réel, calcul des ratios P/E,
 * comparaison des entreprises et identification d'opportunités
 */

import { useState, useEffect, useCallback } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MDInput from "/components/MDInput";
import MDButton from "/components/MDButton";
import LinearProgress from "@mui/material/LinearProgress";
import Autocomplete from "@mui/material/Autocomplete";

// Services
import financialAnalysisService from "/services/financialAnalysisService";
import fmpClient from "/lib/fmp/client";
import metricsService from "/services/metricsService";
import { getWatchlistSymbols } from "/config/watchlist";

// Composants
import FinancialStatements from "/pagesComponents/dashboards/trading/components/FinancialStatements";
import FinancialRatios from "/pagesComponents/dashboards/trading/components/FinancialRatios";
import FinancialTrends from "/pagesComponents/dashboards/trading/components/FinancialTrends";
import CompanyComparison from "/pagesComponents/dashboards/trading/components/CompanyComparison";
import InvestmentOpportunities from "/pagesComponents/dashboards/trading/components/InvestmentOpportunities";

function TradingFinancialAnalysis() {
  const [currentTab, setCurrentTab] = useState("analysis");
  const [symbol, setSymbol] = useState("AAPL");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [comparisonSymbols, setComparisonSymbols] = useState(["AAPL", "MSFT", "GOOGL"]);
  const [analysis, setAnalysis] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("annual");

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

  // Analyser une entreprise
  const loadAnalysis = useCallback(async (symbolToAnalyze = symbol) => {
    if (!symbolToAnalyze) return;

    try {
      setLoading(true);
      setError(null);
      const result = await financialAnalysisService.analyzeFinancialStatements(
        symbolToAnalyze.toUpperCase(),
        period,
        5
      );
      setAnalysis(result);
    } catch (err) {
      console.error("Error loading analysis:", err);
      setError(err.message || "Erreur lors du chargement de l'analyse");
    } finally {
      setLoading(false);
    }
  }, [symbol, period]);

  // Comparer des entreprises
  const loadComparison = useCallback(async () => {
    if (comparisonSymbols.length < 2) {
      setError("Sélectionnez au moins 2 entreprises à comparer");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await financialAnalysisService.compareCompanies(comparisonSymbols);
      setComparison(result);
    } catch (err) {
      console.error("Error loading comparison:", err);
      setError(err.message || "Erreur lors de la comparaison");
    } finally {
      setLoading(false);
    }
  }, [comparisonSymbols]);

  // Trouver des opportunités
  const loadOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const watchlist = getWatchlistSymbols();
      const result = await financialAnalysisService.findInvestmentOpportunities(
        watchlist.length > 0 ? watchlist : ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"]
      );
      setOpportunities(result);
    } catch (err) {
      console.error("Error loading opportunities:", err);
      setError(err.message || "Erreur lors du chargement des opportunités");
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger l'analyse au montage
  useEffect(() => {
    loadAnalysis();
    metricsService.trackFeatureUsage("financial-analysis");
  }, [loadAnalysis]);

  // Charger les opportunités au montage
  useEffect(() => {
    if (currentTab === "opportunities") {
      loadOpportunities();
    }
  }, [currentTab, loadOpportunities]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleSymbolSelect = (newSymbol) => {
    setSymbol(newSymbol);
    loadAnalysis(newSymbol);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Analyse Financière
          </MDTypography>
          <MDTypography variant="body2" color="text">
            États financiers en temps réel, ratios P/E, comparaison et opportunités
          </MDTypography>
        </MDBox>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="Analyse d'Entreprise" value="analysis" />
            <Tab label="Comparaison" value="comparison" />
            <Tab label="Opportunités" value="opportunities" />
          </Tabs>
        </Box>

        {/* Recherche d'entreprise (pour l'onglet Analyse) */}
        {currentTab === "analysis" && (
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
                      handleSymbolSelect(newValue.symbol);
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
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <MDButton
                  variant="gradient"
                  color="info"
                  onClick={() => loadAnalysis()}
                  fullWidth
                >
                  Analyser
                </MDButton>
              </Grid>
            </Grid>
          </MDBox>
        )}

        {/* Comparaison (pour l'onglet Comparaison) */}
        {currentTab === "comparison" && (
          <MDBox mb={3}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <MDTypography variant="body2" color="text" mb={2}>
                  Entrez les symboles à comparer (séparés par des virgules)
                </MDTypography>
                <TextField
                  label="Symboles (ex: AAPL, MSFT, GOOGL)"
                  value={comparisonSymbols.join(", ")}
                  onChange={(e) => {
                    const symbols = e.target.value
                      .split(",")
                      .map((s) => s.trim().toUpperCase())
                      .filter((s) => s.length > 0);
                    setComparisonSymbols(symbols);
                  }}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <MDButton
                  variant="gradient"
                  color="info"
                  onClick={loadComparison}
                  disabled={comparisonSymbols.length < 2}
                >
                  Comparer
                </MDButton>
              </Grid>
            </Grid>
          </MDBox>
        )}

        {/* Erreur */}
        {error && (
          <MDBox mb={3}>
            <MDTypography variant="body2" color="error">
              {error}
            </MDTypography>
          </MDBox>
        )}

        {/* Contenu selon l'onglet */}
        {currentTab === "analysis" && (
          <>
            {loading && !analysis ? (
              <MDBox p={3}>
                <LinearProgress />
              </MDBox>
            ) : analysis ? (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <MDBox mb={2}>
                    <MDTypography variant="h5" fontWeight="medium">
                      {analysis.companyName} ({analysis.symbol})
                    </MDTypography>
                    {analysis.currentPrice && (
                      <MDTypography variant="body2" color="text">
                        Prix: ${analysis.currentPrice.toFixed(2)} | Market Cap:{" "}
                        {analysis.marketCap
                          ? `$${(analysis.marketCap / 1_000_000_000).toFixed(2)}B`
                          : "N/A"}
                      </MDTypography>
                    )}
                  </MDBox>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <FinancialStatements
                    data={analysis.incomeStatements}
                    loading={loading}
                  />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <FinancialRatios analysis={analysis} loading={loading} />
                </Grid>
                <Grid item xs={12}>
                  <FinancialTrends analysis={analysis} loading={loading} />
                </Grid>
              </Grid>
            ) : (
              <MDBox p={3}>
                <MDTypography variant="body2" color="text">
                  Entrez un symbole pour commencer l&apos;analyse
                </MDTypography>
              </MDBox>
            )}
          </>
        )}

        {currentTab === "comparison" && (
          <>
            {loading && !comparison ? (
              <MDBox p={3}>
                <LinearProgress />
              </MDBox>
            ) : comparison ? (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <CompanyComparison data={comparison} loading={loading} />
                </Grid>
              </Grid>
            ) : (
              <MDBox p={3}>
                <MDTypography variant="body2" color="text">
                  Entrez au moins 2 symboles pour comparer
                </MDTypography>
              </MDBox>
            )}
          </>
        )}

        {currentTab === "opportunities" && (
          <>
            {loading && opportunities.length === 0 ? (
              <MDBox p={3}>
                <LinearProgress />
              </MDBox>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <InvestmentOpportunities data={opportunities} loading={loading} />
                </Grid>
              </Grid>
            )}
          </>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TradingFinancialAnalysis;

