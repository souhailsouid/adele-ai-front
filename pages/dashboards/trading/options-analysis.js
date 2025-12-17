/**
 * Page Options Analysis : Analyse complète des options avec bias, niveaux clés et rapport détaillé
 * Utilise /ai/options-analysis qui prend en paramètre le payload de getOptionsFiveFactors
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
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { searchStocks, POPULAR_STOCKS } from "/config/stockSymbols";

import { useAuth } from "/hooks/useAuth";
import withAuth from "/hocs/withAuth";
import { OptionsAnalysis } from "/pagesComponents/dashboards/trading/components/ai";

function OptionsAnalysisPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [ticker, setTicker] = useState("");
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [allTickers, setAllTickers] = useState([]);
  const [loadingTickers, setLoadingTickers] = useState(false);
  const [refresh, setRefresh] = useState(true);

  // Charger la liste de tickers (liste écrite locale uniquement)
  useEffect(() => {
    const loadTickers = async () => {
      setLoadingTickers(true);
      const tickerSet = new Set();
      const tickerList = [];

      // Tickers populaires (liste écrite)
      POPULAR_STOCKS.forEach((stock) => {
        if (!tickerSet.has(stock.symbol)) {
          tickerSet.add(stock.symbol);
          tickerList.push({ symbol: stock.symbol, name: stock.name || stock.symbol });
        }
      });

      // Tickers issus de searchStocks (liste locale étendue)
      searchStocks("").forEach((stock) => {
        if (!tickerSet.has(stock.symbol)) {
          tickerSet.add(stock.symbol);
          tickerList.push({ symbol: stock.symbol, name: stock.name || stock.symbol });
        }
      });

      setAllTickers(tickerList);
      setLoadingTickers(false);
    };

    loadTickers();
  }, []);

  const handleSearch = useCallback((value) => {
    if (value && value.trim()) {
      const tickerUpper = value.trim().toUpperCase();
      setSelectedTicker(tickerUpper);
    }
  }, []);

  const filteredStockOptions = useMemo(() => {
    if (!ticker || ticker.trim().length < 1) {
      return allTickers.slice(0, 50);
    }
    const searchTerm = ticker.trim().toUpperCase();
    return allTickers
      .filter((stock) => {
        const symbol = (stock.symbol || "").toUpperCase();
        const name = (stock.name || "").toUpperCase();
        return symbol.includes(searchTerm) || name.includes(searchTerm);
      })
      .slice(0, 50);
  }, [ticker, allTickers]);

  const handleInputChange = (event, newInputValue) => {
    setTicker(newInputValue);
  };

  const handleAutocompleteChange = useCallback(
    (event, newValue) => {
      if (newValue) {
        const tickerValue = typeof newValue === "string" ? newValue : newValue.symbol || newValue.value || "";
        setTicker(tickerValue);
        if (tickerValue) {
          handleSearch(tickerValue);
        }
      }
    },
    [handleSearch]
  );

  if (authLoading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <MDTypography>Chargement...</MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    router.push("/authentication/sign-in");
    return null;
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDBox display="flex" alignItems="center" gap={1} mb={3}>
                  <MDTypography variant="h4" fontWeight="bold">
                    Options Analysis
                  </MDTypography>
                  <Tooltip
                    title={
                      <MDBox>
                        <MDTypography variant="body2" fontWeight="bold" mb={1}>
                          Analyse Complète des Options
                        </MDTypography>
                        <MDTypography variant="caption" component="div">
                          Cette analyse utilise les données de Radar Options (Five Factors) pour générer :
                          <br />• Un biais directionnel (bullish/bearish/neutral)
                          <br />• Des niveaux clés (pivot, résistance, zone de risque)
                          <br />• Un rapport détaillé avec contradictions et scénarios
                          <br />• Une évaluation de la qualité du signal
                        </MDTypography>
                      </MDBox>
                    }
                    arrow
                  >
                    <InfoOutlinedIcon fontSize="small" color="action" />
                  </Tooltip>
                </MDBox>

                <MDBox mb={3}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                      <Autocomplete
                        freeSolo
                        options={filteredStockOptions}
                        getOptionLabel={(option) =>
                          typeof option === "string" ? option : option.symbol || option.value || ""
                        }
                        renderOption={(props, option) => (
                          <li {...props} key={option.symbol}>
                            <MDBox>
                              <MDTypography variant="body2" fontWeight="medium">
                                {typeof option === "string" ? option : option.symbol}
                              </MDTypography>
                              {typeof option !== "string" && option.name && (
                                <MDTypography variant="caption" color="text.secondary">
                                  {option.name}
                                </MDTypography>
                              )}
                            </MDBox>
                          </li>
                        )}
                        inputValue={ticker}
                        onInputChange={handleInputChange}
                        onChange={handleAutocompleteChange}
                        loading={loadingTickers}
                        renderInput={(params) => (
                          <MDInput
                            {...params}
                            label="Rechercher un ticker"
                            variant="outlined"
                            fullWidth
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {loadingTickers ? "Chargement..." : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={refresh}
                            onChange={(e) => setRefresh(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Rafraîchir les données"
                      />
                    </Grid>
                  </Grid>
                </MDBox>

                {selectedTicker && (
                  <MDBox mt={3}>
                    <OptionsAnalysis ticker={selectedTicker} refresh={refresh} />
                  </MDBox>
                )}

                {!selectedTicker && (
                  <MDBox textAlign="center" py={6}>
                    <MDTypography variant="body1" color="text.secondary">
                      Sélectionnez un ticker pour lancer l&apos;analyse
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default withAuth(OptionsAnalysisPage);

