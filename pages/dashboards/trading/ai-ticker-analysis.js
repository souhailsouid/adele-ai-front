/**
 * Page dédiée pour l'analyse AI d'un ticker
 * Affiche TickerActivityAnalysis et OptionsFlowAnalysis
 */

import { useState, useCallback } from "react";
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
import { searchStocks } from "/config/stockSymbols";
import { useAuth } from "/hooks/useAuth";
import withAuth from "/hocs/withAuth";
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
  const [firstAnalysisComplete, setFirstAnalysisComplete] = useState(false);
  const [secondAnalysisComplete, setSecondAnalysisComplete] = useState(false);
  const [thirdAnalysisComplete, setThirdAnalysisComplete] = useState(false);
  const [fourthAnalysisComplete, setFourthAnalysisComplete] = useState(false);

  // Tous les hooks doivent être appelés avant tout return conditionnel
  const handleSearch = useCallback((value) => {
    if (value && value.trim()) {
      const tickerUpper = value.trim().toUpperCase();
      setSelectedTicker(tickerUpper);
      // Réinitialiser tous les états pour un nouveau ticker
      setFirstAnalysisComplete(false);
      setSecondAnalysisComplete(false);
      setThirdAnalysisComplete(false);
      setFourthAnalysisComplete(false);
    }
  }, []);

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

  // Vérifier l'authentification après tous les hooks
  if (!authLoading && !isAuthenticated()) {
    router.push("/authentication/sign-in?redirect=/dashboards/trading/ai-ticker-analysis");
    return null;
  }

  const handleAutocompleteChange = (event, newValue) => {
    if (newValue) {
      const tickerValue = typeof newValue === "string" ? newValue : newValue.symbol || newValue.value || "";
      setTicker(tickerValue);
      if (tickerValue) {
        handleSearch(tickerValue);
      }
    }
  };

  const handleInputChange = (event, newInputValue) => {
    setTicker(newInputValue);
    if (newInputValue && newInputValue.length >= 1) {
      const results = searchStocks(newInputValue);
      setStockOptions(results.slice(0, 20));
    } else {
      setStockOptions([]);
    }
  };

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
                  options={stockOptions}
                  value={ticker}
                  onInputChange={handleInputChange}
                  onChange={handleAutocompleteChange}
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
                        {typeof option === "object" && option.name && (
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

