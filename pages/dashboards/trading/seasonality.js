/**
 * Trading Dashboard - Seasonality
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
import MarketSeasonality from "/pagesComponents/dashboards/trading/components/MarketSeasonality";
import MonthPerformers from "/pagesComponents/dashboards/trading/components/MonthPerformers";
import TickerMonthlySeasonality from "/pagesComponents/dashboards/trading/components/TickerMonthlySeasonality";
import TickerYearMonthSeasonality from "/pagesComponents/dashboards/trading/components/TickerYearMonthSeasonality";

function TradingSeasonality() {
  const router = useRouter();
  
  // Onglets internes
  const [internalTab, setInternalTab] = useState("market");
  
  // États pour chaque vue
  const [marketSeasonality, setMarketSeasonality] = useState([]);
  const [monthPerformers, setMonthPerformers] = useState([]);
  const [tickerMonthly, setTickerMonthly] = useState([]);
  const [tickerYearMonth, setTickerYearMonth] = useState([]);
  
  // États de chargement
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filtres
  const [selectedTicker, setSelectedTicker] = useState("");
  const [tickerInput, setTickerInput] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [limit, setLimit] = useState("50");
  const [minYears, setMinYears] = useState("10");
  const [orderBy, setOrderBy] = useState("positive_months_perc");
  const [orderDirection, setOrderDirection] = useState("desc");

  // Extraire les données
  const extractData = (response) => {
    if (Array.isArray(response)) return response;
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (response?.data && !Array.isArray(response.data)) return [response.data];
    return [];
  };

  // Charger la saisonnalité du marché
  const loadMarketSeasonality = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await unusualWhalesClient.getMarketSeasonality().catch((err) => {
        console.error("Error loading market seasonality:", err);
        throw err;
      });

      setMarketSeasonality(extractData(data));
    } catch (err) {
      console.error("Error loading Market Seasonality:", err);
      setError(err.message || "Erreur lors du chargement de la saisonnalité du marché");
      setMarketSeasonality([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les meilleurs performeurs du mois
  const loadMonthPerformers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        limit: parseInt(limit) || 50,
        min_years: parseInt(minYears) || 10,
        order: orderBy,
        order_direction: orderDirection,
      };

      const data = await unusualWhalesClient.getMonthPerformers(selectedMonth, params).catch((err) => {
        console.error("Error loading month performers:", err);
        throw err;
      });

      setMonthPerformers(extractData(data));
    } catch (err) {
      console.error("Error loading Month Performers:", err);
      setError(err.message || "Erreur lors du chargement des meilleurs performeurs du mois");
      setMonthPerformers([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger la saisonnalité mensuelle d'un ticker
  const loadTickerMonthly = async () => {
    if (!selectedTicker.trim()) {
      setError("Veuillez entrer un ticker");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await unusualWhalesClient.getTickerMonthlySeasonality(selectedTicker.trim().toUpperCase()).catch((err) => {
        console.error("Error loading ticker monthly seasonality:", err);
        throw err;
      });

      setTickerMonthly(extractData(data));
    } catch (err) {
      console.error("Error loading Ticker Monthly Seasonality:", err);
      setError(err.message || "Erreur lors du chargement de la saisonnalité mensuelle");
      setTickerMonthly([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger la saisonnalité année-mois d'un ticker
  const loadTickerYearMonth = async () => {
    if (!selectedTicker.trim()) {
      setError("Veuillez entrer un ticker");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await unusualWhalesClient.getTickerYearMonthSeasonality(selectedTicker.trim().toUpperCase()).catch((err) => {
        console.error("Error loading ticker year-month seasonality:", err);
        throw err;
      });

      setTickerYearMonth(extractData(data));
    } catch (err) {
      console.error("Error loading Ticker Year-Month Seasonality:", err);
      setError(err.message || "Erreur lors du chargement de la saisonnalité année-mois");
      setTickerYearMonth([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données selon l'onglet interne
  const handleSearch = () => {
    if (internalTab === "market") {
      loadMarketSeasonality();
    } else if (internalTab === "month-performers") {
      loadMonthPerformers();
    } else if (internalTab === "ticker-monthly") {
      loadTickerMonthly();
    } else if (internalTab === "ticker-year-month") {
      loadTickerYearMonth();
    }
  };

  const handleInternalTabChange = (event, newValue) => {
    setInternalTab(newValue);
  };

  // Charger automatiquement la saisonnalité du marché au montage
  useEffect(() => {
    if (internalTab === "market") {
      loadMarketSeasonality();
    }
    metricsService.trackFeatureUsage("seasonality");
  }, [internalTab]);

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold" mb={1}>
            Seasonality
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Analyse de la saisonnalité des marchés et des tickers
          </MDTypography>
        </MDBox>

        {/* Onglets Internes */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={internalTab} onChange={handleInternalTabChange} aria-label="seasonality internal tabs" variant="scrollable" scrollButtons="auto">
            <Tab label="Market Seasonality" value="market" />
            <Tab label="Month Performers" value="month-performers" />
            <Tab label="Ticker Monthly" value="ticker-monthly" />
            <Tab label="Ticker Year-Month" value="ticker-year-month" />
          </Tabs>
        </Box>

        {/* Filtres */}
        <MDBox mb={3}>
          <Card>
            <MDBox p={2}>
              <Grid container spacing={2} alignItems="center">
                {(internalTab === "ticker-monthly" || internalTab === "ticker-year-month") && (
                  <Grid item xs={12} md={4}>
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
                          placeholder="Ex: AAPL, TSLA"
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
                )}
                {internalTab === "month-performers" && (
                  <>
                    <Grid item xs={12} md={3}>
                      <FormControl variant="standard" fullWidth>
                        <InputLabel>Mois</InputLabel>
                        <Select
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                          label="Mois"
                        >
                          {monthNames.map((name, index) => (
                            <MenuItem key={index + 1} value={index + 1}>
                              {name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <MDInput
                        label="Limit"
                        placeholder="50"
                        value={limit}
                        onChange={(e) => setLimit(e.target.value)}
                        type="number"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <MDInput
                        label="Min Years"
                        placeholder="10"
                        value={minYears}
                        onChange={(e) => setMinYears(e.target.value)}
                        type="number"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl variant="standard" fullWidth>
                        <InputLabel>Order By</InputLabel>
                        <Select
                          value={orderBy}
                          onChange={(e) => setOrderBy(e.target.value)}
                          label="Order By"
                        >
                          <MenuItem value="positive_months_perc">Positive Months %</MenuItem>
                          <MenuItem value="median_change">Median Change</MenuItem>
                          <MenuItem value="avg_change">Avg Change</MenuItem>
                          <MenuItem value="max_change">Max Change</MenuItem>
                          <MenuItem value="min_change">Min Change</MenuItem>
                          <MenuItem value="positive_closes">Positive Closes</MenuItem>
                          <MenuItem value="years">Years</MenuItem>
                          <MenuItem value="month">Month</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={1}>
                      <FormControl variant="standard" fullWidth>
                        <InputLabel>Direction</InputLabel>
                        <Select
                          value={orderDirection}
                          onChange={(e) => setOrderDirection(e.target.value)}
                          label="Direction"
                        >
                          <MenuItem value="desc">Desc</MenuItem>
                          <MenuItem value="asc">Asc</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}
                <Grid item xs={12} md={internalTab === "market" ? 12 : internalTab === "month-performers" ? 2 : 4}>
                  <MDButton variant="gradient" color="dark" onClick={handleSearch} disabled={loading} fullWidth>
                    {internalTab === "market" ? "Actualiser" : "Rechercher"}
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
            {internalTab === "market" && (
              <Grid item xs={12}>
                <MarketSeasonality data={marketSeasonality} loading={loading} />
              </Grid>
            )}
            {internalTab === "month-performers" && (
              <Grid item xs={12}>
                <MonthPerformers data={monthPerformers} loading={loading} month={selectedMonth} />
              </Grid>
            )}
            {internalTab === "ticker-monthly" && (
              <Grid item xs={12}>
                <TickerMonthlySeasonality data={tickerMonthly} loading={loading} ticker={selectedTicker} />
              </Grid>
            )}
            {internalTab === "ticker-year-month" && (
              <Grid item xs={12}>
                <TickerYearMonthSeasonality data={tickerYearMonth} loading={loading} ticker={selectedTicker} />
              </Grid>
            )}
          </Grid>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TradingSeasonality;


