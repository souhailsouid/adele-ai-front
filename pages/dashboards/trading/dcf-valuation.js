/**
 * Trading Dashboard - Valorisation DCF
 * Page dédiée à la valorisation Discounted Cash Flow
 */

import { useState, useEffect, useCallback, useRef } from "react";
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
import DataTable from "/examples/Tables/DataTable";
import MiniStatisticsCard from "/examples/Cards/StatisticsCards/MiniStatisticsCard";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

// Services
import fmpClient from "/lib/fmp/client";
import metricsService from "/services/metricsService";

function TradingDCFValuation() {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [dcf, setDCF] = useState(null);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // États pour le screener multi-symboles
  const [valuationsList, setValuationsList] = useState([]);
  const [loadingScreener, setLoadingScreener] = useState(false);
  const [valuationFilter, setValuationFilter] = useState("all"); // "all", "undervalued", "overvalued"
  const [currentTab, setCurrentTab] = useState(0); // 0 = Single, 1 = Screener
  const [screenerInitialized, setScreenerInitialized] = useState(false);

  // Recherche d'entreprises
  const searchTimeoutRef = useRef(null);
  
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
  
  // Debounce pour la recherche
  const debouncedSearch = useCallback((query) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 300);
  }, [handleSearch]);

  // Charger la valorisation DCF
  const loadDCF = useCallback(async (symbol) => {
    if (!symbol) return;
    try {
      setLoading(true);
      setError(null);
      const [dcfData, quoteData] = await Promise.allSettled([
        fmpClient.getDCF(symbol.toUpperCase()),
        fmpClient.getQuote(symbol.toUpperCase()),
      ]);
      
      if (dcfData.status === "fulfilled") {
        // L'API retourne un tableau, prendre le premier élément
        const dcfValue = dcfData.value;
        if (Array.isArray(dcfValue) && dcfValue.length > 0) {
          setDCF(dcfValue[0]);
        } else if (dcfValue && typeof dcfValue === 'object') {
          setDCF(dcfValue);
        } else {
          setDCF(null);
        }
      }
      if (quoteData.status === "fulfilled") {
        setQuote(quoteData.value);
      }
    } catch (err) {
      console.error("Error loading DCF:", err);
      setError(err.message || "Erreur lors du chargement de la valorisation DCF");
      setDCF(null);
    } finally {
      setLoading(false);
    }
  }, []);
  console.log('dcf', dcf);

  // Charger les données au montage initial uniquement
  useEffect(() => {
    if (selectedSymbol && currentTab === 0) {
      loadDCF(selectedSymbol);
    }
    metricsService.trackFeatureUsage("dcf-valuation");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Charger uniquement au montage
  
  // Charger les données DCF pour plusieurs symboles (screener)
  const loadMultipleDCF = useCallback(async (symbols) => {
    if (!symbols || symbols.length === 0) {
      setValuationsList([]);
      return;
    }
    
    try {
      setLoadingScreener(true);
      setError(null);
      
      // Charger les données pour tous les symboles en parallèle (avec limite)
      const batchSize = 5; // Limiter à 5 symboles à la fois pour éviter le rate limit
      const results = [];
      
      for (let i = 0; i < symbols.length; i += batchSize) {
        const batch = symbols.slice(i, i + batchSize);
        const batchPromises = batch.map(async (symbol) => {
          try {
            const [dcfData, quoteData] = await Promise.allSettled([
              fmpClient.getDCF(symbol),
              fmpClient.getQuote(symbol),
            ]);
            
            let dcfObj = null;
            if (dcfData.status === "fulfilled") {
              const dcfValue = dcfData.value;
              if (Array.isArray(dcfValue) && dcfValue.length > 0) {
                dcfObj = dcfValue[0];
              } else if (dcfValue && typeof dcfValue === 'object') {
                dcfObj = dcfValue;
              }
            }
            
            const quoteObj = quoteData.status === "fulfilled" ? quoteData.value : null;
            
            if (dcfObj && quoteObj && quoteObj.price) {
              const currentPrice = quoteObj.price || 0;
              const dcfPrice = dcfObj.dcf || dcfObj['Stock Price'] || 0;
              const difference = dcfPrice - currentPrice;
              const percentage = currentPrice > 0 ? (difference / currentPrice) * 100 : 0;
              const isUndervalued = dcfPrice > currentPrice;
              
              return {
                symbol,
                name: quoteObj.name || symbol,
                currentPrice,
                dcfPrice,
                difference,
                percentage,
                isUndervalued,
                date: dcfObj.date || null,
              };
            }
            return null;
          } catch (err) {
            console.error(`Error loading DCF for ${symbol}:`, err);
            return null;
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults.filter(r => r !== null));
        
        // Attendre un peu entre les batches pour respecter le rate limit
        if (i + batchSize < symbols.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      setValuationsList(results);
    } catch (err) {
      console.error("Error loading multiple DCF:", err);
      setError(err.message || "Erreur lors du chargement des valorisations");
      setValuationsList([]);
    } finally {
      setLoadingScreener(false);
    }
  }, []);
  
  // Charger automatiquement les actions populaires au montage de l'onglet screener
  useEffect(() => {
    if (currentTab === 1 && !screenerInitialized) {
      // Liste de symboles populaires (top actions US)
      const popularSymbols = [
        "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "BRK.B", "V", "UNH",
        "JNJ", "WMT", "JPM", "MA", "PG", "HD", "DIS", "BAC", "ADBE", "NFLX",
        "PYPL", "CMCSA", "NKE", "XOM", "VZ", "CVX", "ABT", "COST", "PEP", "TMO"
      ];
      
      loadMultipleDCF(popularSymbols);
      setScreenerInitialized(true);
    }
  }, [currentTab, screenerInitialized, loadMultipleDCF]);
  
  // Filtrer les valorisations selon le filtre sélectionné
  const filteredValuations = valuationsList.filter(v => {
    if (valuationFilter === "all") return true;
    if (valuationFilter === "undervalued") return v.isUndervalued;
    if (valuationFilter === "overvalued") return !v.isUndervalued;
    return true;
  });
  
  // Calculer l'écart et le pourcentage
  // dcf peut être un objet ou un tableau (on prend le premier élément si c'est un tableau)
  const dcfObj = Array.isArray(dcf) ? dcf[0] : dcf;
  const valuation = dcfObj && quote ? {
    currentPrice: quote.price || 0,
    dcfPrice: dcfObj.dcf || dcfObj['Stock Price'] || 0,
    difference: (dcfObj.dcf || dcfObj['Stock Price'] || 0) - (quote.price || 0),
    percentage: ((dcfObj.dcf || dcfObj['Stock Price'] || 0) - (quote.price || 0)) / (quote.price || 1) * 100,
    isUndervalued: (dcfObj.dcf || dcfObj['Stock Price'] || 0) > (quote.price || 0),
  } : null;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Valorisation DCF (Discounted Cash Flow)
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Évaluation de la valeur intrinsèque d&apos;une action basée sur les flux de trésorerie futurs
          </MDTypography>
        </MDBox>

        {/* Tabs pour Single vs Screener */}
        <MDBox mb={3}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
              <Tab label="Analyse Unique" />
              <Tab label="Sous-évaluées / Sur-évaluées" />
            </Tabs>
          </Box>
        </MDBox>

        {/* Contenu selon l'onglet */}
        {currentTab === 0 ? (
          <>
        {/* Recherche */}
        <MDBox mb={3}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Autocomplete
                freeSolo
                options={searchResults.map((result) => ({
                  label: `${result.symbol} - ${result.name}`,
                  symbol: result.symbol,
                }))}
                onInputChange={(event, newValue) => {
                  setSearchQuery(newValue);
                  debouncedSearch(newValue);
                }}
                onChange={(event, newValue) => {
                  if (newValue && newValue.symbol) {
                    setSelectedSymbol(newValue.symbol);
                    loadDCF(newValue.symbol);
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
            <Grid item xs={12} md={4}>
              <MDInput
                label="Symbole"
                value={selectedSymbol}
                onChange={(e) => {
                  const newSymbol = e.target.value.toUpperCase();
                  setSelectedSymbol(newSymbol);
                }}
                onBlur={(e) => {
                  // Charger les données seulement quand l'utilisateur quitte le champ
                  const symbol = e.target.value.toUpperCase().trim();
                  if (symbol && symbol !== selectedSymbol) {
                    loadDCF(symbol);
                  }
                }}
                onKeyPress={(e) => {
                  // Charger les données quand l'utilisateur appuie sur Enter
                  if (e.key === 'Enter') {
                    const symbol = selectedSymbol.trim();
                    if (symbol) {
                      loadDCF(symbol);
                    }
                  }
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <MDButton
                variant="gradient"
                color="info"
                onClick={() => loadDCF(selectedSymbol)}
                disabled={loading}
                fullWidth
              >
                Calculer la Valorisation DCF
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

        {/* Statistiques de valorisation */}
        {valuation && (
          <MDBox mb={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <MiniStatisticsCard
                  title={{ text: "Prix Actuel", fontWeight: "medium" }}
                  count={`$${valuation.currentPrice.toFixed(2)}`}
                  percentage={{ color: "info", text: "" }}
                  icon={{ color: "info", component: "attach_money" }}
                  direction="right"
                  bgColor="white"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MiniStatisticsCard
                  title={{ text: "Prix Cible DCF", fontWeight: "medium" }}
                  count={`$${valuation.dcfPrice.toFixed(2)}`}
                  percentage={{ color: valuation.isUndervalued ? "success" : "error", text: "" }}
                  icon={{ color: valuation.isUndervalued ? "success" : "error", component: "trending_up" }}
                  direction="right"
                  bgColor="white"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MiniStatisticsCard
                  title={{ text: "Écart", fontWeight: "medium" }}
                  count={`$${Math.abs(valuation.difference).toFixed(2)}`}
                  percentage={{ color: valuation.isUndervalued ? "success" : "error", text: "" }}
                  icon={{ color: valuation.isUndervalued ? "success" : "error", component: valuation.isUndervalued ? "arrow_upward" : "arrow_downward" }}
                  direction="right"
                  bgColor="white"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MiniStatisticsCard
                  title={{ text: "Évaluation", fontWeight: "medium" }}
                  count={valuation.isUndervalued ? "Sous-évaluée" : "Sur-évaluée"}
                  percentage={{ color: valuation.isUndervalued ? "success" : "error", text: `${valuation.percentage > 0 ? "+" : ""}${valuation.percentage.toFixed(2)}%` }}
                  icon={{ color: valuation.isUndervalued ? "success" : "error", component: valuation.isUndervalued ? "trending_up" : "trending_down" }}
                  direction="right"
                  bgColor="white"
                />
              </Grid>
            </Grid>
          </MDBox>
        )}

        {/* Détails DCF */}
        {loading ? (
          <MDBox p={3}>
            <LinearProgress />
          </MDBox>
        ) : dcfObj ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Valorisation DCF - {selectedSymbol}
                  </MDTypography>
                  {valuation && (
                    <MDBox mb={3}>
                      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <MDTypography variant="body2" color="text.secondary">
                          Prix Actuel
                        </MDTypography>
                        <MDTypography variant="h5" fontWeight="bold">
                          ${valuation.currentPrice.toFixed(2)}
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <MDTypography variant="body2" color="text.secondary">
                          Prix Cible DCF
                        </MDTypography>
                        <MDTypography variant="h5" fontWeight="bold" color={valuation.isUndervalued ? "success.main" : "error.main"}>
                          ${valuation.dcfPrice.toFixed(2)}
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <MDTypography variant="body2" color="text.secondary">
                          Écart
                        </MDTypography>
                        <Chip
                          label={`${valuation.percentage > 0 ? "+" : ""}${valuation.percentage.toFixed(2)}%`}
                          color={valuation.isUndervalued ? "success" : "error"}
                          size="large"
                          icon={<Icon>{valuation.isUndervalued ? "trending_up" : "trending_down"}</Icon>}
                        />
                      </MDBox>
                      <MDBox>
                        <MDTypography variant="body2" color="text" fontWeight="medium" mb={1}>
                          Recommandation:
                        </MDTypography>
                        <MDTypography variant="body2" color={valuation.isUndervalued ? "success.main" : "error.main"}>
                          {valuation.isUndervalued
                            ? "L'action est sous-évaluée selon le modèle DCF. Potentiel d'appréciation."
                            : "L'action est sur-évaluée selon le modèle DCF. Risque de correction."}
                        </MDTypography>
                      </MDBox>
                    </MDBox> 
                  )}
                </MDBox>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Détails DCF
                  </MDTypography>
                  {dcfObj ? (
                    <DataTable
                        table={{
                          columns: [
                            { Header: "Paramètre", accessor: "key", width: "50%" },
                            { Header: "Valeur", accessor: "value", width: "50%" },
                          ],
                          rows: Object.keys(dcfObj)
                            .filter((k) => !["dcf", "Stock Price"].includes(k))
                            .map((key) => {
                              const value = dcfObj[key];
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
                                displayValue = JSON.stringify(value);
                              }
                              
                              return {
                                key: key.replace(/([A-Z])/g, " $1").trim(),
                                value: displayValue
                              };
                            })
                        }}
                      
                      canSearch={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder={false}
                    />
                  ) : (
                    <MDTypography variant="body2" color="text.secondary">
                      Détails non disponibles
                    </MDTypography>
                  )}
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <MDBox p={3}>
            <MDTypography variant="body2" color="text">
              {selectedSymbol
                ? `Aucune valorisation DCF disponible pour ${selectedSymbol}`
                : "Sélectionnez un symbole pour voir la valorisation DCF"}
            </MDTypography>
          </MDBox>
        )}
          </>
        ) : (
          <>
            {/* Screener Multi-Symboles */}
            <MDBox mb={3}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Filtrer par Valorisation</InputLabel>
                    <Select
                      value={valuationFilter}
                      onChange={(e) => setValuationFilter(e.target.value)}
                      label="Filtrer par Valorisation"
                    >
                      <MenuItem value="all">Toutes les actions</MenuItem>
                      <MenuItem value="undervalued">Sous-évaluées uniquement</MenuItem>
                      <MenuItem value="overvalued">Sur-évaluées uniquement</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <MDBox display="flex" alignItems="center" justifyContent="space-between" height="100%">
                    <MDTypography variant="body2" color="text">
                      {filteredValuations.length} action(s) trouvée(s) 
                      {valuationFilter !== "all" && ` (${valuationsList.length} au total)`}
                    </MDTypography>
                    <MDButton
                      variant="outlined"
                      color="info"
                      size="small"
                      onClick={() => {
                        setScreenerInitialized(false);
                        setValuationsList([]);
                      }}
                    >
                      <Icon>refresh</Icon>&nbsp;Actualiser
                    </MDButton>
                  </MDBox>
                </Grid>
              </Grid>
            </MDBox>

            {/* Résultats du screener */}
            {loadingScreener ? (
              <Card>
                <MDBox p={3}>
                  <LinearProgress />
                  <MDTypography variant="body2" color="text" mt={2} textAlign="center">
                    Chargement des valorisations DCF des actions populaires...
                  </MDTypography>
                </MDBox>
              </Card>
            ) : filteredValuations.length > 0 ? (
              <Card>
                <MDBox p={3}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <MDTypography variant="h6" fontWeight="medium">
                      Screener DCF - Actions {valuationFilter === "undervalued" ? "Sous-évaluées" : valuationFilter === "overvalued" ? "Sur-évaluées" : "Populaires"}
                    </MDTypography>
                    <Chip
                      label={`${filteredValuations.length} résultat(s)`}
                      color="info"
                      size="small"
                    />
                  </MDBox>
                  <DataTable
                    table={{
                      columns: [
                        { 
                          Header: "Symbole", 
                          accessor: "symbol", 
                          width: "10%",
                          Cell: ({ value }) => (
                            <MDTypography variant="body2" fontWeight="medium" color="text">
                              {value}
                            </MDTypography>
                          )
                        },
                        { 
                          Header: "Nom de l'entreprise", 
                          accessor: "name", 
                          width: "25%",
                          Cell: ({ value }) => (
                            <MDTypography variant="body2" color="text">
                              {value}
                            </MDTypography>
                          )
                        },
                        { 
                          Header: "Prix Actuel", 
                          accessor: "currentPrice", 
                          width: "12%", 
                          Cell: ({ value }) => (
                            <MDTypography variant="body2" fontWeight="medium" color="text">
                              ${value.toFixed(2)}
                            </MDTypography>
                          )
                        },
                        { 
                          Header: "Prix DCF", 
                          accessor: "dcfPrice", 
                          width: "12%", 
                          Cell: ({ value }) => (
                            <MDTypography variant="body2" fontWeight="medium" color="info">
                              ${value.toFixed(2)}
                            </MDTypography>
                          )
                        },
                        { 
                          Header: "Écart ($)", 
                          accessor: "difference", 
                          width: "12%", 
                          Cell: ({ value }) => (
                            <MDTypography variant="body2" fontWeight="medium" color={value > 0 ? "success.main" : "error.main"}>
                              {value > 0 ? "+" : ""}${value.toFixed(2)}
                            </MDTypography>
                          )
                        },
                        { 
                          Header: "Écart (%)", 
                          accessor: "percentage", 
                          width: "12%", 
                          Cell: ({ value }) => (
                            <Chip
                              label={`${value > 0 ? "+" : ""}${value.toFixed(2)}%`}
                              color={value > 0 ? "success" : "error"}
                              size="small"
                              icon={<Icon>{value > 0 ? "trending_up" : "trending_down"}</Icon>}
                            />
                          )
                        },
                        { 
                          Header: "Statut", 
                          accessor: "isUndervalued", 
                          width: "12%", 
                          Cell: ({ value }) => (
                            <Chip
                              label={value ? "Sous-évaluée" : "Sur-évaluée"}
                              color={value ? "success" : "error"}
                              size="small"
                              icon={<Icon>{value ? "trending_up" : "trending_down"}</Icon>}
                            />
                          )
                        },
                        { 
                          Header: "Date", 
                          accessor: "date", 
                          width: "5%",
                          Cell: ({ value }) => value ? (
                            <MDTypography variant="caption" color="text.secondary">
                              {new Date(value).toLocaleDateString('fr-FR')}
                            </MDTypography>
                          ) : "N/A"
                        },
                      ],
                      rows: filteredValuations.sort((a, b) => b.percentage - a.percentage), // Trier par pourcentage décroissant
                    }}
                    canSearch={true}
                    entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
                    showTotalEntries={true}
                    pagination={{ variant: "gradient", color: "dark" }}
                    isSorted={true}
                    noEndBorder={false}
                  />
                </MDBox>
              </Card>
            ) : valuationsList.length === 0 && !loadingScreener ? (
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="body2" color="text" textAlign="center">
                    Chargement des données...
                  </MDTypography>
                </MDBox>
              </Card>
            ) : (
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="body2" color="text" textAlign="center">
                    Aucune action trouvée avec le filtre sélectionné ({valuationsList.length} action(s) au total)
                  </MDTypography>
                </MDBox>
              </Card>
            )}
          </>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TradingDCFValuation;

