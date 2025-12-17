/**
 * Page Radar Options : lecture qualitative et non-directionnelle du marché options
 * Objectif : aider à décider si un signal vaut la peine d'être creusé (pas d'aide au trade)
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
import { OptionsFiveFactorsAnalysis } from "/pagesComponents/dashboards/trading/components/ai";

function RadarOptionsPage() {
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

  const handleAnalysisComplete = useCallback((data) => {
    console.log("Radar Options Analysis completed:", data);
  }, []);

  // Auth
  if (!authLoading && !isAuthenticated()) {
    router.push("/authentication/sign-in?redirect=/dashboards/trading/radar-options");
    return null;
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDBox display="flex" alignItems="center" gap={1} mb={0.5}>
            <MDTypography variant="h4" fontWeight="bold">
              📡 Radar Options
            </MDTypography>
            <Tooltip
              placement="right"
              title={
                <MDBox maxWidth={380}>
                  <MDTypography variant="caption" display="block" mb={0.5}>
                    L’analyse “Radar Options” ne prédit pas le prix. Elle résume et qualifie l’état du marché options d’un
                    ticker à partir de blocs déjà agrégés par le backend.
                  </MDTypography>
                  <MDTypography variant="caption" display="block" mb={0.5}>
                    Utilise (données déterministes) : flows récents, variation d’OI, OI par strike, IV rank, max pain,
                    greeks/gamma, régime prix (trend/range + ADX + vol réalisée), catalysts (earnings), dark pool,
                    répétition/contexte de flow.
                  </MDTypography>
                  <MDTypography variant="caption" display="block" mb={0.5}>
                    Produit (qualitatif) : observation, interpretation (hedging/speculation/gamma/mixed, sans conseil),
                    signal_quality (high/medium/low, high rare), zones_to_watch, risks & why_not_clear, data_quality (missing +
                    fraîcheur), evidence (flow/structure/context).
                  </MDTypography>
                  <MDTypography variant="caption" display="block">
                    Garde-fous : si pin/gamma/hedge probable, signal_quality=high est bloqué. Si intent= mixed, wording neutre
                    (pas “principalement”).
                  </MDTypography>
                </MDBox>
              }
            >
              <InfoOutlinedIcon fontSize="small" color="action" />
            </Tooltip>
          </MDBox>
          <MDTypography variant="body2" color="text">
            Objectif : décider rapidement si ce signal mérite d’être creusé ou ignoré — pas d’aide au trading.
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
                    <MDTypography variant="caption" color="text">
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
                <MDButton variant="gradient" color="dark" onClick={() => handleSearch(ticker)} disabled={!ticker} fullWidth>
                  Analyser
                </MDButton>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch checked={refresh} onChange={(e) => setRefresh(e.target.checked)} color="primary" />}
                  label={
                    <MDTypography variant="body2" color="text">
                      Rafraîchir les données (best-effort, peut être plus lent)
                    </MDTypography>
                  }
                />
              </Grid>
            </Grid>
          </MDBox>
        </Card>

        {/* Analyse AI */}
        {selectedTicker ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <OptionsFiveFactorsAnalysis ticker={selectedTicker} refresh={refresh} onAnalysisComplete={handleAnalysisComplete} />
            </Grid>
          </Grid>
        ) : (
          <Card>
            <MDBox p={3} textAlign="center">
              <MDTypography variant="body2" color="text">
                Recherchez un ticker pour commencer l&apos;analyse Radar Options
              </MDTypography>
            </MDBox>
          </Card>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default withAuth(RadarOptionsPage);


