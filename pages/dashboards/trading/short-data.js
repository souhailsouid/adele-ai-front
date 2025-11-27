/**
 * Trading Dashboard - Short Data
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
import Alert from "@mui/material/Alert";

// Services
import unusualWhalesClient from "/lib/unusual-whales/client";
import metricsService from "/services/metricsService";
import { searchStocks } from "/config/stockSymbols";

// Composants
import ShortData from "/pagesComponents/dashboards/trading/components/ShortData";
import ShortFailuresToDeliver from "/pagesComponents/dashboards/trading/components/ShortFailuresToDeliver";
import ShortInterestAndFloat from "/pagesComponents/dashboards/trading/components/ShortInterestAndFloat";
import ShortVolumeAndRatio from "/pagesComponents/dashboards/trading/components/ShortVolumeAndRatio";
import ShortVolumeByExchange from "/pagesComponents/dashboards/trading/components/ShortVolumeByExchange";

function TradingShortData() {
  const router = useRouter();
  
  // Onglets internes
  const [internalTab, setInternalTab] = useState("short-data");
  
  // États pour chaque vue
  const [shortData, setShortData] = useState([]);
  const [ftds, setFtds] = useState([]);
  const [interestAndFloat, setInterestAndFloat] = useState(null);
  const [volumeAndRatio, setVolumeAndRatio] = useState([]);
  const [volumeByExchange, setVolumeByExchange] = useState([]);
  
  // États de chargement
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filtres
  const [selectedTicker, setSelectedTicker] = useState("");
  const [tickerInput, setTickerInput] = useState("");

  // Extraire les données
  const extractData = (response) => {
    if (Array.isArray(response)) return response;
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (response?.data && !Array.isArray(response.data)) return response.data; // Pour interest-float qui retourne un objet
    // Gérer le cas où les données sont dans response.si (comme pour volume-and-ratio)
    if (response?.si && Array.isArray(response.si)) return response.si;
    return [];
  };

  // Charger les données de short
  const loadShortData = async () => {
    if (!selectedTicker.trim()) {
      setError("Veuillez entrer un ticker");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await unusualWhalesClient.getShortData(selectedTicker.trim().toUpperCase()).catch((err) => {
        console.error("Error loading short data:", err);
        throw err;
      });

      setShortData(extractData(data));
    } catch (err) {
      console.error("Error loading Short Data:", err);
      setError(err.message || "Erreur lors du chargement des données de short");
      setShortData([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les failures to deliver
  const loadFailuresToDeliver = async () => {
    if (!selectedTicker.trim()) {
      setError("Veuillez entrer un ticker");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await unusualWhalesClient.getShortFailuresToDeliver(selectedTicker.trim().toUpperCase()).catch((err) => {
        console.error("Error loading failures to deliver:", err);
        throw err;
      });

      setFtds(extractData(data));
    } catch (err) {
      console.error("Error loading Failures to Deliver:", err);
      setError(err.message || "Erreur lors du chargement des failures to deliver");
      setFtds([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger le short interest et float
  const loadInterestAndFloat = async () => {
    if (!selectedTicker.trim()) {
      setError("Veuillez entrer un ticker");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await unusualWhalesClient.getShortInterestAndFloat(selectedTicker.trim().toUpperCase()).catch((err) => {
        console.error("Error loading interest and float:", err);
        throw err;
      });

      const extracted = extractData(data);
      setInterestAndFloat(Array.isArray(extracted) ? extracted[0] : extracted);
    } catch (err) {
      console.error("Error loading Interest and Float:", err);
      setError(err.message || "Erreur lors du chargement du short interest et float");
      setInterestAndFloat(null);
    } finally {
      setLoading(false);
    }
  };

  // Charger le short volume et ratio
  const loadVolumeAndRatio = async () => {
    if (!selectedTicker.trim()) {
      setError("Veuillez entrer un ticker");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await unusualWhalesClient.getShortVolumeAndRatio(selectedTicker.trim().toUpperCase()).catch((err) => {
        console.error("Error loading volume and ratio:", err);
        throw err;
      });

      setVolumeAndRatio(extractData(data));
    } catch (err) {
      console.error("Error loading Volume and Ratio:", err);
      setError(err.message || "Erreur lors du chargement du short volume et ratio");
      setVolumeAndRatio([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger le short volume par exchange
  const loadVolumeByExchange = async () => {
    if (!selectedTicker.trim()) {
      setError("Veuillez entrer un ticker");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await unusualWhalesClient.getShortVolumeByExchange(selectedTicker.trim().toUpperCase()).catch((err) => {
        console.error("Error loading volume by exchange:", err);
        throw err;
      });

      setVolumeByExchange(extractData(data));
    } catch (err) {
      console.error("Error loading Volume by Exchange:", err);
      setError(err.message || "Erreur lors du chargement du short volume par exchange");
      setVolumeByExchange([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données selon l'onglet interne
  const handleSearch = () => {
    if (internalTab === "short-data") {
      loadShortData();
    } else if (internalTab === "ftds") {
      loadFailuresToDeliver();
    } else if (internalTab === "interest-float") {
      loadInterestAndFloat();
    } else if (internalTab === "volume-ratio") {
      loadVolumeAndRatio();
    } else if (internalTab === "volume-exchange") {
      loadVolumeByExchange();
    }
  };

  const handleInternalTabChange = (event, newValue) => {
    setInternalTab(newValue);
  };

  // Tracking
  useEffect(() => {
    metricsService.trackFeatureUsage("short-data");
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold" mb={1}>
            Short Data
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Données de vente à découvert (short selling) pour les tickers
          </MDTypography>
        </MDBox>

        {/* Onglets Internes */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={internalTab} onChange={handleInternalTabChange} aria-label="short data internal tabs" variant="scrollable" scrollButtons="auto">
            <Tab label="Short Data" value="short-data" />
            <Tab label="Failures to Deliver" value="ftds" />
            <Tab label="Interest & Float" value="interest-float" />
            <Tab label="Volume & Ratio" value="volume-ratio" />
            <Tab label="Volume by Exchange" value="volume-exchange" />
          </Tabs>
        </Box>

        {/* Filtres */}
        <MDBox mb={3}>
          <Card>
            <MDBox p={2}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
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
                <Grid item xs={12} md={4}>
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
            {internalTab === "short-data" && (
              <Grid item xs={12}>
                <ShortData data={shortData} loading={loading} ticker={selectedTicker} />
              </Grid>
            )}
            {internalTab === "ftds" && (
              <Grid item xs={12}>
                <ShortFailuresToDeliver data={ftds} loading={loading} ticker={selectedTicker} />
              </Grid>
            )}
            {internalTab === "interest-float" && (
              <Grid item xs={12}>
                <ShortInterestAndFloat data={interestAndFloat} loading={loading} ticker={selectedTicker} />
              </Grid>
            )}
            {internalTab === "volume-ratio" && (
              <Grid item xs={12}>
                <ShortVolumeAndRatio data={volumeAndRatio} loading={loading} ticker={selectedTicker} />
              </Grid>
            )}
            {internalTab === "volume-exchange" && (
              <Grid item xs={12}>
                <ShortVolumeByExchange data={volumeByExchange} loading={loading} ticker={selectedTicker} />
              </Grid>
            )}
          </Grid>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TradingShortData;

