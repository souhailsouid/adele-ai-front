/**
 * Page dédiée pour l'analyse AI d'un ticker
 * Affiche TickerActivityAnalysis et OptionsFlowAnalysis
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import MDInput from "/components/MDInput";
import MDButton from "/components/MDButton";
import Autocomplete from "@mui/material/Autocomplete";
import { searchStocks, POPULAR_STOCKS } from "/config/stockSymbols";

import { useAuth } from "/hooks/useAuth";
import withAuth from "/hocs/withAuth";
import fmpUWClient2 from "/lib/api/fmpUWClient2";
import { 
  TickerActivityAnalysis,
  TickerOptionsAnalysis,
  TickerInstitutionalAnalysis,
  TickerNewsEventsAnalysis
} from "/pagesComponents/dashboards/trading/components/ai";

function AITickerAnalysis() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [ticker, setTicker] = useState("");
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [stockOptions, setStockOptions] = useState([]);
  const [allTickers, setAllTickers] = useState([]);
  const [loadingTickers, setLoadingTickers] = useState(false);
  const [firstAnalysisComplete, setFirstAnalysisComplete] = useState(false);
  const [secondAnalysisComplete, setSecondAnalysisComplete] = useState(false);
  const [thirdAnalysisComplete, setThirdAnalysisComplete] = useState(false);
  const [fourthAnalysisComplete, setFourthAnalysisComplete] = useState(false);

  // Charger la liste de tickers depuis l'API au montage
  useEffect(() => {
    const loadTickers = async () => {
      try {
        setLoadingTickers(true);
        // Récupérer les top tickers par net premium (tickers les plus actifs)
        const topTickers = await fmpUWClient2.getUWTopNetImpact({ limit: 500 }).catch(() => []);
        
        // Extraire les tickers uniques
        const tickerSet = new Set();
        const tickerList = [];
        
        // Ajouter d'abord les tickers populaires de la config (POPULAR_STOCKS)
        POPULAR_STOCKS.forEach(stock => {
          if (!tickerSet.has(stock.symbol)) {
            tickerSet.add(stock.symbol);
            tickerList.push({
              symbol: stock.symbol,
              name: stock.name || stock.symbol
            });
          }
        });
        
        // Ajouter aussi les tickers de searchStocks (qui peut contenir plus de tickers)
        searchStocks("").forEach(stock => {
          if (!tickerSet.has(stock.symbol)) {
            tickerSet.add(stock.symbol);
            tickerList.push({
              symbol: stock.symbol,
              name: stock.name || stock.symbol
            });
          }
        });
        
        // Ajouter les tickers de l'API (top net impact)
        const extractTickers = (data) => {
          if (Array.isArray(data)) return data;
          if (data?.data && Array.isArray(data.data)) return data.data;
          return [];
        };
        
        extractTickers(topTickers).forEach(item => {
          const tickerSymbol = item.ticker_symbol || item.ticker || item.symbol;
          if (tickerSymbol && !tickerSet.has(tickerSymbol)) {
            tickerSet.add(tickerSymbol);
            tickerList.push({
              symbol: tickerSymbol,
              name: item.name || item.company_name || tickerSymbol
            });
          }
        });
        
        setAllTickers(tickerList);
      } catch (err) {
        console.error("Error loading tickers:", err);
        // En cas d'erreur, utiliser la liste locale
        const localTickers = searchStocks("").map(stock => ({
          symbol: stock.symbol,
          name: stock.name || stock.symbol
        }));
        setAllTickers(localTickers);
      } finally {
        setLoadingTickers(false);
      }
    };
    
    loadTickers();
  }, []);

  // Tous les hooks doivent être appelés avant tout return conditionnel
  const handleSearch = useCallback((value) => {
    if (value && value.trim()) {
      const tickerUpper = value.trim().toUpperCase();
      // Si le ticker change, réinitialiser tous les états
      if (selectedTicker !== tickerUpper) {
        setSelectedTicker(tickerUpper);
        // Réinitialiser tous les états pour un nouveau ticker
        setFirstAnalysisComplete(false);
        setSecondAnalysisComplete(false);
        setThirdAnalysisComplete(false);
        setFourthAnalysisComplete(false);
      }
    }
  }, [selectedTicker]);

  const handleFirstAnalysisComplete = useCallback((data) => {
    console.log("Ticker Activity Analysis completed:", data);
    // Attendre 2 secondes après la première analyse avant de lancer la deuxième
    setTimeout(() => {
      setFirstAnalysisComplete(true);
    }, 2000);
  }, []);

  const handleSecondAnalysisComplete = useCallback((data) => {
    console.log("Ticker Options Analysis completed:", data);
    // Attendre 2 secondes avant de lancer la troisième
    setTimeout(() => {
      setSecondAnalysisComplete(true);
    }, 2000);
  }, []);

  const handleThirdAnalysisComplete = useCallback((data) => {
    console.log("Ticker Institutional Analysis completed:", data);
    // Attendre 2 secondes avant de lancer la quatrième
    setTimeout(() => {
      setThirdAnalysisComplete(true);
    }, 2000);
  }, []);

  const handleFourthAnalysisComplete = useCallback((data) => {
    console.log("Ticker News Events Analysis completed:", data);
  }, []);

  // Options filtrées pour l'autocomplete
  const filteredStockOptions = useMemo(() => {
    if (!ticker || ticker.trim().length < 1) {
      return allTickers.slice(0, 50); // Afficher les 50 premiers par défaut
    }
    
    const searchTerm = ticker.trim().toUpperCase();
    return allTickers
      .filter(stock => {
        const symbol = (stock.symbol || "").toUpperCase();
        const name = (stock.name || "").toUpperCase();
        return symbol.includes(searchTerm) || name.includes(searchTerm);
      })
      .slice(0, 50); // Limiter à 50 résultats
  }, [ticker, allTickers]);

  const handleInputChange = (event, newInputValue) => {
    setTicker(newInputValue);
  };

  const handleAutocompleteChange = useCallback((event, newValue) => {
    if (newValue) {
      const tickerValue = typeof newValue === "string" ? newValue : newValue.symbol || newValue.value || "";
      setTicker(tickerValue);
      if (tickerValue) {
        handleSearch(tickerValue);
      }
    }
  }, [handleSearch]);

  // Vérifier l'authentification après tous les hooks
  if (!authLoading && !isAuthenticated()) {
    router.push("/authentication/sign-in?redirect=/dashboards/trading/ai-ticker-analysis");
    return null;
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold" mb={1}>
            🤖 Analyse AI - Ticker
          </MDTypography>
          <MDTypography variant="body2" color="text.secondary">
            Analyse LLM enrichie de l&apos;activité complète et du Options Flow d&apos;un ticker
          </MDTypography>
        </MDBox>

        {/* Recherche de ticker */}
        <Card sx={{ mb: 3 }}>
          <MDBox p={3}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Autocomplete
                  freeSolo
                  options={filteredStockOptions}
                  value={ticker}
                  onInputChange={handleInputChange}
                  onChange={handleAutocompleteChange}
                  loading={loadingTickers}
                  getOptionLabel={(option) => {
                    if (typeof option === "string") return option;
                    return option.symbol || option.value || option.label || "";
                  }}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <MDBox>
                        <MDTypography variant="body2" fontWeight="bold">
                          {typeof option === "string" ? option : option.symbol || option.value}
                        </MDTypography>
                        {typeof option === "object" && option.name && option.name !== option.symbol && (
                          <MDTypography variant="caption" color="text.secondary">
                            {option.name}
                          </MDTypography>
                        )}
                      </MDBox>
                    </li>
                  )}
                  renderInput={(params) => (
                    <MDInput
                      {...params}
                      label="Rechercher un ticker"
                      placeholder="Ex: NVDA, AAPL, MSFT"
                      variant="standard"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && ticker) {
                          handleSearch(ticker);
                        }
                      }}
                    />
                  )}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <MDButton
                  variant="gradient"
                  color="dark"
                  onClick={() => handleSearch(ticker)}
                  disabled={!ticker}
                  fullWidth
                >
                  Analyser
                </MDButton>
              </Grid>
            </Grid>
          </MDBox>
        </Card>

        {/* Analyses AI */}
        {selectedTicker ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TickerActivityAnalysis
                ticker={selectedTicker}
                onAnalysisComplete={handleFirstAnalysisComplete}
              />
            </Grid>
            {firstAnalysisComplete && (
              <Grid item xs={12}>
                <TickerOptionsAnalysis
                  ticker={selectedTicker}
                  delay={2000}
                  onAnalysisComplete={handleSecondAnalysisComplete}
                />
              </Grid>
            )}
            {secondAnalysisComplete && (
              <Grid item xs={12}>
                <TickerInstitutionalAnalysis
                  ticker={selectedTicker}
                  onAnalysisComplete={handleThirdAnalysisComplete}
                />
              </Grid>
            )}
            {thirdAnalysisComplete && (
              <Grid item xs={12}>
                <TickerNewsEventsAnalysis
                  ticker={selectedTicker}
                  onAnalysisComplete={handleFourthAnalysisComplete}
                />
              </Grid>
            )}
          </Grid>
        ) : (
          <Card>
            <MDBox p={3} textAlign="center">
              <MDTypography variant="body2" color="text.secondary">
                Recherchez un ticker pour commencer l&apos;analyse AI
              </MDTypography>
            </MDBox>
          </Card>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default withAuth(AITickerAnalysis);

