/**
 * Trading Dashboard - Unusual Whales Screeners
 */

import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { useRouter } from "next/router";
import LinearProgress from "@mui/material/LinearProgress";
import Autocomplete from "@mui/material/Autocomplete";
import MDInput from "/components/MDInput";
import MDButton from "/components/MDButton";
import MDDatePicker from "/components/MDDatePicker";
import Card from "@mui/material/Card";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";

// Services
import unusualWhalesClient from "/lib/unusual-whales/client";
import metricsService from "/services/metricsService";
import { searchStocks } from "/config/stockSymbols";

// Composants
import AnalystRatings from "/pagesComponents/dashboards/trading/components/AnalystRatings";
import OptionContractsScreener from "/pagesComponents/dashboards/trading/components/OptionContractsScreener";
import StockScreener from "/pagesComponents/dashboards/trading/components/StockScreener";

function TradingUnusualWhalesScreener() {
  const router = useRouter();
  
  // Onglets internes
  const [internalTab, setInternalTab] = useState("analyst-ratings");
  
  // États pour chaque vue
  const [analystRatings, setAnalystRatings] = useState([]);
  const [optionContracts, setOptionContracts] = useState([]);
  const [stocks, setStocks] = useState([]);
  
  // États de chargement
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filtres communs
  const [selectedTicker, setSelectedTicker] = useState("");
  const [tickerInput, setTickerInput] = useState("");
  const [limit, setLimit] = useState("500");
  const [selectedDate, setSelectedDate] = useState("");

  // Filtres Analyst Ratings
  const [action, setAction] = useState("");
  const [recommendation, setRecommendation] = useState("");

  // Extraire les données
  const extractData = (response) => {
    if (Array.isArray(response)) return response;
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (response?.data && !Array.isArray(response.data)) return [response.data];
    return [];
  };

  // Charger les notes d'analystes
  const loadAnalystRatings = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        limit: parseInt(limit) || 500,
      };
      if (selectedTicker.trim()) params.ticker = selectedTicker.trim().toUpperCase();
      if (action) params.action = action;
      if (recommendation) params.recommendation = recommendation;

      const data = await unusualWhalesClient.getAnalystRatings(params).catch((err) => {
        console.error("Error loading analyst ratings:", err);
        throw err;
      });

      setAnalystRatings(extractData(data));
    } catch (err) {
      console.error("Error loading Analyst Ratings:", err);
      setError(err.message || "Erreur lors du chargement des notes d'analystes");
      setAnalystRatings([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les contrats d'options (Hottest Chains)
  const loadOptionContractsScreener = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        limit: parseInt(limit) || 50,
      };
      if (selectedDate) params.date = selectedDate;
      if (selectedTicker.trim()) params.ticker_symbol = selectedTicker.trim().toUpperCase();

      const data = await unusualWhalesClient.getOptionContractsScreener(params).catch((err) => {
        console.error("Error loading option contracts screener:", err);
        throw err;
      });

      setOptionContracts(extractData(data));
    } catch (err) {
      console.error("Error loading Option Contracts Screener:", err);
      setError(err.message || "Erreur lors du chargement du screener de contrats d'options");
      setOptionContracts([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger le screener d'actions
  const loadStockScreener = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        limit: parseInt(limit) || 500,
      };
      if (selectedDate) params.date = selectedDate;
      if (selectedTicker.trim()) params.ticker = selectedTicker.trim().toUpperCase();

      const data = await unusualWhalesClient.getStockScreener(params).catch((err) => {
        console.error("Error loading stock screener:", err);
        throw err;
      });

      setStocks(extractData(data));
    } catch (err) {
      console.error("Error loading Stock Screener:", err);
      setError(err.message || "Erreur lors du chargement du screener d'actions");
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données selon l'onglet interne
  const handleSearch = () => {
    if (internalTab === "analyst-ratings") {
      loadAnalystRatings();
    } else if (internalTab === "option-contracts") {
      loadOptionContractsScreener();
    } else if (internalTab === "stocks") {
      loadStockScreener();
    }
  };

  const handleInternalTabChange = (event, newValue) => {
    setInternalTab(newValue);
  };

  // Charger automatiquement au montage
  useEffect(() => {
    metricsService.trackFeatureUsage("unusual-whales-screener");
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold" mb={1}>
            Unusual Whales Screeners
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Screeners avancés pour analystes, contrats d&apos;options et actions
          </MDTypography>
        </MDBox>

        {/* Onglets Internes */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={internalTab} onChange={handleInternalTabChange} aria-label="unusual whales screener internal tabs" variant="scrollable" scrollButtons="auto">
            <Tab label="Analyst Ratings" value="analyst-ratings" />
            <Tab label="Hottest Chains" value="option-contracts" />
            <Tab label="Stock Screener" value="stocks" />
          </Tabs>
        </Box>

        {/* Filtres */}
        <MDBox mb={3}>
          <Card>
            <MDBox p={2}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <Autocomplete
                    freeSolo
                    options={searchStocks(tickerInput).slice(0, 10)}
                    value={selectedTicker ? (typeof selectedTicker === "string" ? selectedTicker : selectedTicker.symbol || selectedTicker) : ""}
                    getOptionLabel={(option) => {
                      if (typeof option === "string") return option;
                      return option.symbol || option.name || "";
                    }}
                    onInputChange={(event, newInputValue) => {
                      setTickerInput(newInputValue);
                    }}
                    onChange={(event, newValue) => {
                      if (typeof newValue === "string") {
                        setSelectedTicker(newValue.toUpperCase().trim());
                      } else if (newValue && newValue.symbol) {
                        setSelectedTicker(newValue.symbol.toUpperCase().trim());
                      } else {
                        setSelectedTicker("");
                      }
                    }}
                    renderInput={(params) => (
                      <MDInput
                        {...params}
                        label="Ticker"
                        placeholder="Ex: AAPL, TSLA (optionnel)"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const value = e.target.value.trim().toUpperCase();
                            if (value) {
                              setSelectedTicker(value);
                            }
                          }
                          params.inputProps?.onKeyDown?.(e);
                        }}
                      />
                    )}
                  />
                </Grid>
                {(internalTab === "option-contracts" || internalTab === "stocks") && (
                  <Grid item xs={12} md={3}>
                    <MDBox>
                      <MDDatePicker
                        input={{
                          label: "Date",
                          placeholder: "Sélectionner une date",
                          variant: "standard",
                          fullWidth: true,
                        }}
                        options={{
                          dateFormat: "Y-m-d",
                          mode: "single",
                          allowInput: false,
                          maxDate: "today",
                        }}
                        value={selectedDate || undefined}
                        onChange={(date) => {
                          let dateStr = "";
                          if (date && Array.isArray(date) && date.length > 0) {
                            dateStr = date[0].toISOString().split('T')[0];
                          } else if (date && typeof date === 'string') {
                            dateStr = date;
                          }
                          setSelectedDate(dateStr);
                        }}
                      />
                    </MDBox>
                  </Grid>
                )}
                {internalTab === "analyst-ratings" && (
                  <>
                    <Grid item xs={12} md={2}>
                      <FormControl variant="standard" fullWidth>
                        <InputLabel>Action</InputLabel>
                        <Select
                          value={action}
                          onChange={(e) => setAction(e.target.value)}
                          label="Action"
                        >
                          <MenuItem value="">Toutes</MenuItem>
                          <MenuItem value="initiated">Initiated</MenuItem>
                          <MenuItem value="reiterated">Reiterated</MenuItem>
                          <MenuItem value="downgraded">Downgraded</MenuItem>
                          <MenuItem value="upgraded">Upgraded</MenuItem>
                          <MenuItem value="maintained">Maintained</MenuItem>
                          <MenuItem value="target raised">Target Raised</MenuItem>
                          <MenuItem value="target lowered">Target Lowered</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl variant="standard" fullWidth>
                        <InputLabel>Recommendation</InputLabel>
                        <Select
                          value={recommendation}
                          onChange={(e) => setRecommendation(e.target.value)}
                          label="Recommendation"
                        >
                          <MenuItem value="">Toutes</MenuItem>
                          <MenuItem value="buy">Buy</MenuItem>
                          <MenuItem value="hold">Hold</MenuItem>
                          <MenuItem value="sell">Sell</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}
                <Grid item xs={12} md={2}>
                  <MDInput
                    label="Limit"
                    placeholder={internalTab === "option-contracts" ? "50" : "500"}
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    type="number"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <MDButton variant="gradient" color="dark" onClick={handleSearch} disabled={loading} fullWidth>
                    Rechercher
                  </MDButton>
                </Grid>
              </Grid>
            </MDBox>
          </Card>
        </MDBox>

        {error && (
          <MDBox mb={3}>
            <Alert severity="error">{error}</Alert>
          </MDBox>
        )}

        {loading ? (
          <LinearProgress />
        ) : (
          <Grid container spacing={3}>
            {internalTab === "analyst-ratings" && (
              <Grid item xs={12}>
                <AnalystRatings data={analystRatings} loading={loading} />
              </Grid>
            )}
            {internalTab === "option-contracts" && (
              <Grid item xs={12}>
                <OptionContractsScreener data={optionContracts} loading={loading} />
              </Grid>
            )}
            {internalTab === "stocks" && (
              <Grid item xs={12}>
                <StockScreener data={stocks} loading={loading} />
              </Grid>
            )}
          </Grid>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TradingUnusualWhalesScreener;


