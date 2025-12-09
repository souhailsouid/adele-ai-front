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
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import DataTable from "/examples/Tables/DataTable";
import MiniStatisticsCard from "/examples/Cards/StatisticsCards/MiniStatisticsCard";

// Services
import financialAnalysisService from "/services/financialAnalysisService";
import fmpUWClient from "/lib/api/fmpUnusualWhalesClient";
import withAuth from "/hocs/withAuth";
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
  
  // Nouveaux états pour les nouveaux endpoints
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [cashFlow, setCashFlow] = useState(null);
  const [keyMetrics, setKeyMetrics] = useState(null);
  const [dcf, setDCF] = useState(null);
  const [analystEstimates, setAnalystEstimates] = useState(null);
  const [financialSubTab, setFinancialSubTab] = useState("income");

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

  // Analyser une entreprise
  const loadAnalysis = useCallback(async (symbolToAnalyze = symbol) => {
    if (!symbolToAnalyze) return;

    try {
      setLoading(true);
      setError(null);
      const symbolUpper = symbolToAnalyze.toUpperCase();
      
      // Charger toutes les données en parallèle
      const [
        financialResult,
        balanceSheetData,
        cashFlowData,
        keyMetricsData,
        dcfData,
        analystEstimatesData,
      ] = await Promise.allSettled([
        financialAnalysisService.analyzeFinancialStatements(symbolUpper, period, 5),
        fmpUWClient.getFMPBalanceSheet(symbolUpper, period, 5),
        fmpUWClient.getFMPCashFlow(symbolUpper, period, 5),
        fmpUWClient.getFMPKeyMetrics(symbolUpper, period, 5),
        fmpUWClient.getFMPDCF(symbolUpper),
        fmpUWClient.getFMPAnalystEstimates(symbolUpper, period, 10),
      ]);
   console.log('nalystEstimatesData', analystEstimatesData);  
      if (financialResult.status === "fulfilled") {
        setAnalysis(financialResult.value);
      }
      if (balanceSheetData.status === "fulfilled") {
        setBalanceSheet(Array.isArray(balanceSheetData.value) ? balanceSheetData.value : []);
      }
      if (cashFlowData.status === "fulfilled") {
        setCashFlow(Array.isArray(cashFlowData.value) ? cashFlowData.value : []);
      }
      if (keyMetricsData.status === "fulfilled") {
        setKeyMetrics(Array.isArray(keyMetricsData.value) ? keyMetricsData.value : []);
      }
      if (dcfData.status === "fulfilled") {
        // L'API peut retourner un tableau ou un objet unique
        const dcfValue = dcfData.value;
        if (Array.isArray(dcfValue) && dcfValue.length > 0) {
          setDCF(dcfValue[0]); // Prendre le premier élément si c'est un tableau
        } else if (dcfValue && typeof dcfValue === 'object') {
          setDCF(dcfValue);
        } else {
          setDCF(null);
        }
      }
      if (analystEstimatesData.status === "fulfilled") {
        setAnalystEstimates(Array.isArray(analystEstimatesData.value) ? analystEstimatesData.value : []);
      }

    } catch (err) {
      console.error("Error loading analysis:", err);
      setError(err.message || "Erreur lors du chargement de l'analyse");
    } finally {
      setLoading(false);
    }
  }, [symbol, period]);
console.log('analystEstimates', analystEstimates);
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
          <Tabs value={currentTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab label="Analyse d'Entreprise" value="analysis" icon={<Icon>assessment</Icon>} iconPosition="start" />
            <Tab label="Comparaison" value="comparison" icon={<Icon>compare</Icon>} iconPosition="start" />
            <Tab label="Opportunités" value="opportunities" icon={<Icon>trending_up</Icon>} iconPosition="start" />
            <Tab label="Estimations Analystes" value="analyst" icon={<Icon>analytics</Icon>} iconPosition="start" />
            <Tab label="Valorisation DCF" value="dcf" icon={<Icon>calculate</Icon>} iconPosition="start" />
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
              <>
                <Grid container spacing={3} mb={3}>
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
                  
                  {/* Statistiques rapides avec Key Metrics */}
                  {keyMetrics && keyMetrics.length > 0 && (
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <MiniStatisticsCard
                            title={{ text: "Enterprise Value", fontWeight: "medium" }}
                            count={keyMetrics[0]?.enterpriseValue ? `$${(keyMetrics[0].enterpriseValue / 1_000_000_000).toFixed(2)}B` : "N/A"}
                            percentage={{ color: "info", text: "" }}
                            icon={{ color: "info", component: "account_balance" }}
                            direction="right"
                            bgColor="white"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <MiniStatisticsCard
                            title={{ text: "EV/Revenue", fontWeight: "medium" }}
                            count={keyMetrics[0]?.evToRevenue ? keyMetrics[0].evToRevenue.toFixed(2) : "N/A"}
                            percentage={{ color: "success", text: "" }}
                            icon={{ color: "success", component: "trending_up" }}
                            direction="right"
                            bgColor="white"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <MiniStatisticsCard
                            title={{ text: "EV/EBITDA", fontWeight: "medium" }}
                            count={keyMetrics[0]?.evToOperatingCashFlow ? keyMetrics[0].evToOperatingCashFlow.toFixed(2) : "N/A"}
                            percentage={{ color: "warning", text: "" }}
                            icon={{ color: "warning", component: "assessment" }}
                            direction="right"
                            bgColor="white"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <MiniStatisticsCard
                            title={{ text: "PEG Ratio", fontWeight: "medium" }}
                            count={keyMetrics[0]?.pegRatio ? keyMetrics[0].pegRatio.toFixed(2) : "N/A"}
                            percentage={{ color: "primary", text: "" }}
                            icon={{ color: "primary", component: "show_chart" }}
                            direction="right"
                            bgColor="white"
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  )}
                </Grid>

                {/* Sous-onglets pour les états financiers */}
                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                  <Tabs value={financialSubTab} onChange={(e, v) => setFinancialSubTab(v)}>
                    <Tab label="Compte de Résultat" value="income" />
                    <Tab label="Bilan" value="balance" />
                    <Tab label="Flux de Trésorerie" value="cashflow" />
                    <Tab label="Ratios" value="ratios" />
                  </Tabs>
                </Box>

                {financialSubTab === "income" && (
                  <Grid container spacing={3}>
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
                )}

                {financialSubTab === "balance" && (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Card>
                        <MDBox p={3}>
                          <MDTypography variant="h6" fontWeight="medium" mb={2}>
                            Bilan Comptable (Balance Sheet)
                          </MDTypography>
                          {balanceSheet && balanceSheet.length > 0 ? (
                            <DataTable
                              table={{
                                columns: [
                                  { Header: "Date", accessor: "date", width: "15%" },
                                  { Header: "Actifs Totaux", accessor: "totalAssets", width: "15%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
                                  { Header: "Passifs Totaux", accessor: "totalLiabilities", width: "15%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
                                  { Header: "Capitaux Propres", accessor: "totalStockholdersEquity", width: "15%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
                                  { Header: "Trésorerie", accessor: "cashAndCashEquivalents", width: "15%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
                                  { Header: "Dette Totale", accessor: "totalDebt", width: "15%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
                                ],
                                rows: balanceSheet,
                              }}
                              canSearch={false}
                              entriesPerPage={false}
                              showTotalEntries={false}
                              noEndBorder={false}
                            />
                          ) : (
                            <MDTypography variant="body2" color="text.secondary">
                              Aucune donnée de bilan disponible
                            </MDTypography>
                          )}
                        </MDBox>
                      </Card>
                    </Grid>
                  </Grid>
                )}

                {financialSubTab === "cashflow" && (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Card>
                        <MDBox p={3}>
                          <MDTypography variant="h6" fontWeight="medium" mb={2}>
                            État des Flux de Trésorerie (Cash Flow Statement)
                          </MDTypography>
                          {cashFlow && cashFlow.length > 0 ? (
                            <DataTable
                              table={{
                                columns: [
                                  { Header: "Date", accessor: "date", width: "15%" },
                                  { Header: "CF Opérationnel", accessor: "operatingCashFlow", width: "20%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
                                  { Header: "CF Investissement", accessor: "capitalExpenditure", width: "20%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
                                  { Header: "CF Financement", accessor: "netCashUsedForInvestingActivites", width: "20%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
                                  { Header: "CF Net", accessor: "netChangeInCash", width: "15%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
                                ],
                                rows: cashFlow,
                              }}
                              canSearch={false}
                              entriesPerPage={false}
                              showTotalEntries={false}
                              noEndBorder={false}
                            />
                          ) : (
                            <MDTypography variant="body2" color="text.secondary">
                              Aucune donnée de flux de trésorerie disponible
                            </MDTypography>
                          )}
                        </MDBox>
                      </Card>
                    </Grid>
                  </Grid>
                )}

                {financialSubTab === "ratios" && (
                  <Grid container spacing={3}>
                    <Grid item xs={12} lg={6}>
                      <FinancialRatios analysis={analysis} loading={loading} />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                      {keyMetrics && keyMetrics.length > 0 && (
                        <Card>
                          <MDBox p={3}>
                            <MDTypography variant="h6" fontWeight="medium" mb={2}>
                              Métriques Clés
                            </MDTypography>
                            <DataTable
                              table={{
                                columns: [
                                  { Header: "Date", accessor: "date", width: "20%" },
                                  { Header: "Métrique", accessor: "metric", width: "30%" },
                                  { Header: "Valeur", accessor: "value", width: "50%" },
                                ],
                                rows: Object.keys(keyMetrics[0] || {}).filter(k => !['date', 'symbol', 'calendarYear'].includes(k)).map(key => ({
                                  date: keyMetrics[0].date || keyMetrics[0].calendarYear || "N/A",
                                  metric: key.replace(/([A-Z])/g, ' $1').trim(),
                                  value: typeof keyMetrics[0][key] === 'number' ? keyMetrics[0][key].toFixed(2) : keyMetrics[0][key] || "N/A",
                                })),
                              }}
                              canSearch={true}
                              entriesPerPage={false}
                              showTotalEntries={false}
                              noEndBorder={false}
                            />
                          </MDBox>
                        </Card>
                      )}
                    </Grid>
                  </Grid>
                )}
              </>
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

        {currentTab === "analyst" && (
          <>
            {loading && !analystEstimates ? (
              <MDBox p={3}>
                <LinearProgress />
              </MDBox>
            ) : analystEstimates && analystEstimates.length > 0 ? (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <MDBox p={3}>
                      <MDTypography variant="h6" fontWeight="medium" mb={2}>
                        Estimations des Analystes - {symbol}
                      </MDTypography>
                      <DataTable
                        table={{
                          columns: [
                            { Header: "Date", accessor: "date", width: "12%" },
                            { Header: "Revenus Avg", accessor: "revenueAvg", width: "14%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
                            { Header: "Revenus Low", accessor: "revenueLow", width: "12%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
                            { Header: "Revenus High", accessor: "revenueHigh", width: "12%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
                            { Header: "EBITDA Avg", accessor: "ebitdaAvg", width: "14%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
                            { Header: "EBITDA Low", accessor: "ebitdaLow", width: "12%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
                            { Header: "EBITDA High", accessor: "ebitdaHigh", width: "12%", Cell: ({ value }) => value ? `$${(value / 1_000_000).toFixed(2)}M` : "N/A" },
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
                  Aucune estimation d&apos;analyste disponible pour {symbol}
                </MDTypography>
              </MDBox>
            )}
          </>
        )}

        {currentTab === "dcf" && (
          <>
            {loading && !dcf ? (
              <MDBox p={3}>
                <LinearProgress />
              </MDBox>
            ) : dcf ? (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <MDBox p={3}>
                      <MDTypography variant="h6" fontWeight="medium" mb={2}>
                        Valorisation DCF - {symbol}
                      </MDTypography>
                      <MDBox>
                        <MDTypography variant="body2" color="text.secondary" mb={1}>
                          Prix Actuel
                        </MDTypography>
                        {(() => {
                          // Gérer différentes clés possibles pour le prix
                          const stockPrice = typeof dcf.stockPrice === 'number' 
                            ? dcf.stockPrice 
                            : (dcf['Stock Price'] && typeof dcf['Stock Price'] === 'number' 
                              ? dcf['Stock Price'] 
                              : null);
                          const dcfPrice = typeof dcf.dcf === 'number' ? dcf.dcf : null;
                          const isUndervalued = dcfPrice && stockPrice ? dcfPrice > stockPrice : null;
                          
                          return (
                            <>
                              <MDTypography variant="h5" fontWeight="bold" mb={3}>
                                ${stockPrice ? stockPrice.toFixed(2) : "N/A"}
                              </MDTypography>
                              
                              <MDTypography variant="body2" color="text.secondary" mb={1}>
                                Prix Cible DCF
                              </MDTypography>
                              <MDTypography variant="h5" fontWeight="bold" color={isUndervalued !== null ? (isUndervalued ? "success.main" : "error.main") : "text"} mb={3}>
                                ${dcfPrice ? dcfPrice.toFixed(2) : "N/A"}
                              </MDTypography>

                              {dcfPrice && stockPrice && (
                                <>
                                  <MDTypography variant="body2" color="text.secondary" mb={1}>
                                    Écart
                                  </MDTypography>
                                  <Chip
                                    label={`${((dcfPrice - stockPrice) / stockPrice * 100).toFixed(2)}%`}
                                    color={isUndervalued ? "success" : "error"}
                                    size="large"
                                    icon={<Icon>{isUndervalued ? "trending_up" : "trending_down"}</Icon>}
                                  />
                                  <MDBox mt={2}>
                                    <MDTypography variant="body2" color="text">
                                      {isUndervalued 
                                        ? "L&apos;action est sous-évaluée selon le modèle DCF"
                                        : "L&apos;action est sur-évaluée selon le modèle DCF"}
                                    </MDTypography>
                                  </MDBox>
                                </>
                              )}
                            </>
                          );
                        })()}
                      </MDBox>
                    </MDBox>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <MDBox p={3}>
                      <MDTypography variant="h6" fontWeight="medium" mb={2}>
                        Détails DCF
                      </MDTypography>
                      <MDBox>
                        {Object.keys(dcf)
                          .filter(k => !['dcf', 'stockPrice', 'Stock Price'].includes(k))
                          .map(key => {
                            const value = dcf[key];
                            // Gérer les différents types de valeurs
                            let displayValue = "N/A";
                            if (value === null || value === undefined) {
                              displayValue = "N/A";
                            } else if (typeof value === 'number') {
                              displayValue = value.toFixed(2);
                            } else if (typeof value === 'string') {
                              displayValue = value;
                            } else if (typeof value === 'boolean') {
                              displayValue = value ? 'Oui' : 'Non';
                            } else if (typeof value === 'object') {
                              // Si c'est un objet, afficher une représentation JSON ou ignorer
                              displayValue = JSON.stringify(value);
                            }
                            
                            return (
                              <MDBox key={key} mb={2}>
                                <MDTypography variant="caption" color="text.secondary">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </MDTypography>
                                <MDTypography variant="body2" fontWeight="medium">
                                  {displayValue}
                                </MDTypography>
                              </MDBox>
                            );
                          })}
                      </MDBox>
                    </MDBox>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <MDBox p={3}>
                <MDTypography variant="body2" color="text">
                  Aucune valorisation DCF disponible pour {symbol}
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

export default withAuth(TradingFinancialAnalysis);

