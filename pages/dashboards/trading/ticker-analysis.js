/**
 * Trading Dashboard - Ticker Analysis
 * Comprehensive analysis page for individual tickers
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

// Composants (à créer progressivement)
import FlowAnalysis from "/pagesComponents/dashboards/trading/components/FlowAnalysis";
import GreekExposureAnalysis from "/pagesComponents/dashboards/trading/components/GreekExposureAnalysis";
import OpenInterestAnalysis from "/pagesComponents/dashboards/trading/components/OpenInterestAnalysis";
import VolatilityAnalysis from "/pagesComponents/dashboards/trading/components/VolatilityAnalysis";
import TickerOtherData from "/pagesComponents/dashboards/trading/components/TickerOtherData";
import CompaniesInSector from "/pagesComponents/dashboards/trading/components/CompaniesInSector";

function TradingTickerAnalysis() {
  const router = useRouter();
  
  // Onglets internes
  const [internalTab, setInternalTab] = useState("flow");
  
  // États de chargement
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filtres
  const [selectedTicker, setSelectedTicker] = useState("");
  const [tickerInput, setTickerInput] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSector, setSelectedSector] = useState("");

  // Tracking
  useEffect(() => {
    metricsService.trackFeatureUsage("ticker-analysis");
  }, []);

  const handleInternalTabChange = (event, newValue) => {
    setInternalTab(newValue);
  };

  const sectors = [
    "Basic Materials",
    "Communication Services",
    "Consumer Cyclical",
    "Consumer Defensive",
    "Energy",
    "Financial Services",
    "Healthcare",
    "Industrials",
    "Real Estate",
    "Technology",
    "Utilities",
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold" mb={1}>
            Ticker Analysis
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Analyse complète des données pour un ticker spécifique
          </MDTypography>
        </MDBox>

        {/* Onglets Internes */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={internalTab} onChange={handleInternalTabChange} aria-label="ticker analysis internal tabs" variant="scrollable" scrollButtons="auto">
            <Tab label="Flow Analysis" value="flow" />
            <Tab label="Greek Exposure" value="greek" />
            <Tab label="Open Interest" value="oi" />
            <Tab label="Volatility" value="volatility" />
            <Tab label="Other Data" value="other" />
            <Tab label="Sector Tickers" value="sector" />
          </Tabs>
        </Box>

        {/* Filtres */}
        <MDBox mb={3}>
          <Card>
            <MDBox p={2}>
              <Grid container spacing={2} alignItems="center">
                {internalTab !== "sector" && (
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
                {internalTab === "sector" && (
                  <Grid item xs={12} md={4}>
                    <FormControl variant="standard" fullWidth>
                      <InputLabel>Sector</InputLabel>
                      <Select
                        value={selectedSector}
                        onChange={(e) => setSelectedSector(e.target.value)}
                        label="Sector"
                      >
                        <MenuItem value="">Sélectionner un secteur</MenuItem>
                        {sectors.map((sector) => (
                          <MenuItem key={sector} value={sector}>
                            {sector}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                {(internalTab === "flow" || internalTab === "greek" || internalTab === "oi" || internalTab === "volatility" || internalTab === "other") && (
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
                <Grid item xs={12} md={internalTab === "sector" ? 4 : 3}>
                  <MDButton 
                    variant="gradient" 
                    color="dark" 
                    onClick={() => {
                      // Les composants enfants gèrent leur propre chargement
                      setError(null);
                    }} 
                    disabled={loading} 
                    fullWidth
                  >
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
            {internalTab === "flow" && (
              <Grid item xs={12}>
                <FlowAnalysis ticker={selectedTicker} date={selectedDate} onError={setError} onLoading={setLoading} />
              </Grid>
            )}
            {internalTab === "greek" && (
              <Grid item xs={12}>
                <GreekExposureAnalysis ticker={selectedTicker} date={selectedDate} onError={setError} onLoading={setLoading} />
              </Grid>
            )}
            {internalTab === "oi" && (
              <Grid item xs={12}>
                <OpenInterestAnalysis ticker={selectedTicker} date={selectedDate} onError={setError} onLoading={setLoading} />
              </Grid>
            )}
            {internalTab === "volatility" && (
              <Grid item xs={12}>
                <VolatilityAnalysis ticker={selectedTicker} date={selectedDate} onError={setError} onLoading={setLoading} />
              </Grid>
            )}
            {internalTab === "other" && (
              <Grid item xs={12}>
                <TickerOtherData ticker={selectedTicker} date={selectedDate} onError={setError} onLoading={setLoading} />
              </Grid>
            )}
            {internalTab === "sector" && (
              <Grid item xs={12}>
                <CompaniesInSector sector={selectedSector} onError={setError} onLoading={setLoading} />
              </Grid>
            )}
          </Grid>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TradingTickerAnalysis;


