/**
 * Trading Dashboard - Option Contracts
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

// Services
import unusualWhalesClient from "/lib/unusual-whales/client";
import metricsService from "/services/metricsService";
import { searchStocks } from "/config/stockSymbols";

// Composants
import OptionContractFlow from "/pagesComponents/dashboards/trading/components/OptionContractFlow";
import OptionContractHistoric from "/pagesComponents/dashboards/trading/components/OptionContractHistoric";
import OptionContractIntraday from "/pagesComponents/dashboards/trading/components/OptionContractIntraday";
import OptionContractVolumeProfile from "/pagesComponents/dashboards/trading/components/OptionContractVolumeProfile";
import ExpiryBreakdown from "/pagesComponents/dashboards/trading/components/ExpiryBreakdown";
import OptionContractsList from "/pagesComponents/dashboards/trading/components/OptionContractsList";

function TradingOptionContracts() {
  const router = useRouter();
  
  // Onglets internes
  const [internalTab, setInternalTab] = useState("option-contracts");
  
  // États pour chaque vue
  const [optionContracts, setOptionContracts] = useState([]);
  const [expiryBreakdown, setExpiryBreakdown] = useState([]);
  const [contractFlow, setContractFlow] = useState([]);
  const [contractHistoric, setContractHistoric] = useState([]);
  const [contractIntraday, setContractIntraday] = useState([]);
  const [contractVolumeProfile, setContractVolumeProfile] = useState([]);
  
  // États de chargement
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filtres
  const [selectedTicker, setSelectedTicker] = useState("");
  const [tickerInput, setTickerInput] = useState("");
  const [selectedContractId, setSelectedContractId] = useState("");
  const [contractIdInput, setContractIdInput] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [minPremium, setMinPremium] = useState("");
  const [side, setSide] = useState("ALL");

  // Extraire les données
  const extractData = (response) => {
    if (Array.isArray(response)) return response;
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (response?.chains && Array.isArray(response.chains)) return response.chains;
    if (response?.data && !Array.isArray(response.data)) return [response.data];
    // Pour expiry-breakdown, si c'est un objet unique avec expires/expiry, le transformer en tableau
    if (response && (response.expires || response.expiry)) {
      return [response];
    }
    // Pour volume-profile, si c'est un objet unique avec date et price, le transformer en tableau
    if (response && response.date && response.price !== undefined) {
      return [response];
    }
    return [];
  };

  // Charger les contrats d'options
  const loadOptionContracts = async () => {
    if (!selectedTicker.trim()) {
      setError("Veuillez entrer un ticker");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = {
        limit: 500,
      };

      const data = await unusualWhalesClient.getOptionContracts(selectedTicker.trim().toUpperCase(), params).catch((err) => {
        console.error("Error loading option contracts:", err);
        throw err;
      });

      setOptionContracts(extractData(data));
    } catch (err) {
      console.error("Error loading Option Contracts:", err);
      setError(err.message || "Erreur lors du chargement des contrats d'options");
      setOptionContracts([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculer la date la plus ancienne disponible (7 jours de trading en arrière)
  const getEarliestAvailableDate = () => {
    const today = new Date();
    let daysBack = 0;
    let tradingDays = 0;
    
    // Compter 7 jours de trading (exclure weekends)
    while (tradingDays < 7) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - daysBack);
      const dayOfWeek = checkDate.getDay();
      
      // Si ce n'est pas un weekend (0 = dimanche, 6 = samedi)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        tradingDays++;
      }
      
      if (tradingDays < 7) {
        daysBack++;
      }
    }
    
    const earliestDate = new Date(today);
    earliestDate.setDate(today.getDate() - daysBack);
    return earliestDate.toISOString().split('T')[0];
  };

  // Vérifier si une date est trop ancienne
  const isDateTooOld = (dateString) => {
    if (!dateString) return false;
    const earliestDate = getEarliestAvailableDate();
    return dateString < earliestDate;
  };

  // Charger l'expiry breakdown
  const loadExpiryBreakdown = async () => {
    if (!selectedTicker.trim()) {
      setError("Veuillez entrer un ticker");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Vérifier si la date est trop ancienne
      if (selectedDate && isDateTooOld(selectedDate)) {
        const earliestDate = getEarliestAvailableDate();
        setError(`La date sélectionnée est trop ancienne. La date la plus ancienne disponible est ${earliestDate} (7 jours de trading). Pour accéder aux données historiques complètes, contactez dan@unusualwhales.com.`);
        setLoading(false);
        return;
      }

      const params = {};
      if (selectedDate) params.date = selectedDate;

      const data = await unusualWhalesClient.getExpiryBreakdown(selectedTicker.trim().toUpperCase(), params).catch((err) => {
        console.error("Error loading expiry breakdown:", err);
        
        // Gérer les erreurs spécifiques de l'API
        if (err.code === "historic_data_access_missing" || err.status === 403) {
          const earliestDate = getEarliestAvailableDate();
          throw new Error(`Accès aux données historiques limité. La date la plus ancienne disponible est ${earliestDate} (7 jours de trading). Pour accéder aux données historiques complètes, contactez dan@unusualwhales.com.`);
        }
        throw err;
      });

      setExpiryBreakdown(extractData(data));
    } catch (err) {
      console.error("Error loading Expiry Breakdown:", err);
      setError(err.message || "Erreur lors du chargement de l'expiry breakdown");
      setExpiryBreakdown([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger le flow d'un contrat
  const loadContractFlow = async () => {
    if (!contractIdInput.trim()) {
      setError("Veuillez entrer un ID de contrat (ex: TSLA230526P00167500)");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Vérifier si la date est trop ancienne
      if (selectedDate && isDateTooOld(selectedDate)) {
        const earliestDate = getEarliestAvailableDate();
        setError(`La date sélectionnée est trop ancienne. La date la plus ancienne disponible est ${earliestDate} (7 jours de trading). Pour accéder aux données historiques complètes, contactez dan@unusualwhales.com.`);
        setLoading(false);
        return;
      }

      const params = {
        limit: 50,
      };
      if (selectedDate) params.date = selectedDate;
      if (minPremium) params.min_premium = parseInt(minPremium);
      if (side !== "ALL") params.side = side;

      const data = await unusualWhalesClient.getOptionContractFlow(contractIdInput.trim(), params).catch((err) => {
        console.error("Error loading contract flow:", err);
        
        // Gérer les erreurs spécifiques de l'API
        if (err.code === "historic_data_access_missing" || err.status === 403) {
          const earliestDate = getEarliestAvailableDate();
          throw new Error(`Accès aux données historiques limité. La date la plus ancienne disponible est ${earliestDate} (7 jours de trading). Pour accéder aux données historiques complètes, contactez dan@unusualwhales.com.`);
        }
        throw err;
      });

      setContractFlow(extractData(data));
    } catch (err) {
      console.error("Error loading Contract Flow:", err);
      setError(err.message || "Erreur lors du chargement du flow du contrat");
      setContractFlow([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données historiques
  const loadContractHistoric = async () => {
    if (!contractIdInput.trim()) {
      setError("Veuillez entrer un ID de contrat");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = {
        limit: 100,
      };

      const data = await unusualWhalesClient.getOptionContractHistoric(contractIdInput.trim(), params).catch((err) => {
        console.error("Error loading contract historic:", err);
        throw err;
      });

      setContractHistoric(extractData(data));
    } catch (err) {
      console.error("Error loading Contract Historic:", err);
      setError(err.message || "Erreur lors du chargement des données historiques");
      setContractHistoric([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données intraday
  const loadContractIntraday = async () => {
    if (!contractIdInput.trim()) {
      setError("Veuillez entrer un ID de contrat");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Vérifier si la date est trop ancienne
      if (selectedDate && isDateTooOld(selectedDate)) {
        const earliestDate = getEarliestAvailableDate();
        setError(`La date sélectionnée est trop ancienne. La date la plus ancienne disponible est ${earliestDate} (7 jours de trading). Pour accéder aux données historiques complètes, contactez dan@unusualwhales.com.`);
        setLoading(false);
        return;
      }

      const params = {};
      if (selectedDate) params.date = selectedDate;

      const data = await unusualWhalesClient.getOptionContractIntraday(contractIdInput.trim(), params).catch((err) => {
        console.error("Error loading contract intraday:", err);
        
        // Gérer les erreurs spécifiques de l'API
        if (err.code === "historic_data_access_missing" || err.status === 403) {
          const earliestDate = getEarliestAvailableDate();
          throw new Error(`Accès aux données historiques limité. La date la plus ancienne disponible est ${earliestDate} (7 jours de trading). Pour accéder aux données historiques complètes, contactez dan@unusualwhales.com.`);
        }
        throw err;
      });

      setContractIntraday(extractData(data));
    } catch (err) {
      console.error("Error loading Contract Intraday:", err);
      setError(err.message || "Erreur lors du chargement des données intraday");
      setContractIntraday([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger le volume profile
  const loadContractVolumeProfile = async () => {
    if (!contractIdInput.trim()) {
      setError("Veuillez entrer un ID de contrat");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Vérifier si la date est trop ancienne
      if (selectedDate && isDateTooOld(selectedDate)) {
        const earliestDate = getEarliestAvailableDate();
        setError(`La date sélectionnée est trop ancienne. La date la plus ancienne disponible est ${earliestDate} (7 jours de trading). Pour accéder aux données historiques complètes, contactez dan@unusualwhales.com.`);
        setLoading(false);
        return;
      }

      const params = {};
      if (selectedDate) params.date = selectedDate;

      const data = await unusualWhalesClient.getOptionContractVolumeProfile(contractIdInput.trim(), params).catch((err) => {
        console.error("Error loading contract volume profile:", err);
        
        // Gérer les erreurs spécifiques de l'API
        if (err.code === "historic_data_access_missing" || err.status === 403) {
          const earliestDate = getEarliestAvailableDate();
          throw new Error(`Accès aux données historiques limité. La date la plus ancienne disponible est ${earliestDate} (7 jours de trading). Pour accéder aux données historiques complètes, contactez dan@unusualwhales.com.`);
        }
        throw err;
      });

      setContractVolumeProfile(extractData(data));
    } catch (err) {
      console.error("Error loading Contract Volume Profile:", err);
      setError(err.message || "Erreur lors du chargement du volume profile");
      setContractVolumeProfile([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données selon l'onglet interne
  const handleSearch = () => {
    if (internalTab === "option-contracts") {
      loadOptionContracts();
    } else if (internalTab === "expiry-breakdown") {
      loadExpiryBreakdown();
    } else if (internalTab === "flow") {
      loadContractFlow();
    } else if (internalTab === "historic") {
      loadContractHistoric();
    } else if (internalTab === "intraday") {
      loadContractIntraday();
    } else if (internalTab === "volume-profile") {
      loadContractVolumeProfile();
    }
  };

  const handleInternalTabChange = (event, newValue) => {
    setInternalTab(newValue);
  };

  useEffect(() => {
    metricsService.trackFeatureUsage("option-contracts");
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold" mb={1}>
            Option Contracts
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Analyse détaillée des contrats d&apos;options
          </MDTypography>
        </MDBox>

        {/* Onglets Internes */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={internalTab} onChange={handleInternalTabChange} aria-label="option contracts internal tabs" variant="scrollable" scrollButtons="auto">
            <Tab label="Option Contracts" value="option-contracts" />
            <Tab label="Expiry Breakdown" value="expiry-breakdown" />
            <Tab label="Flow Data" value="flow" />
            <Tab label="Historic Data" value="historic" />
            <Tab label="Intraday Data" value="intraday" />
            <Tab label="Volume Profile" value="volume-profile" />
          </Tabs>
        </Box>

        {/* Filtres */}
        <MDBox mb={3}>
          <Card>
            <MDBox p={2}>
              <Grid container spacing={2} alignItems="center">
                {(internalTab === "option-contracts" || internalTab === "expiry-breakdown") && (
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
                {(internalTab === "flow" || internalTab === "historic" || internalTab === "intraday" || internalTab === "volume-profile") && (
                  <Grid item xs={12} md={4}>
                    <MDInput
                      label="Contract ID"
                      placeholder="Ex: TSLA230526P00167500"
                      value={contractIdInput}
                      onChange={(e) => setContractIdInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                      fullWidth
                    />
                  </Grid>
                )}
                {(internalTab === "expiry-breakdown" || internalTab === "flow" || internalTab === "intraday" || internalTab === "volume-profile") && (
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
                          minDate: getEarliestAvailableDate(),
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
                      <MDTypography variant="caption" color="text.secondary" mt={0.5} display="block">
                        Données disponibles: 7 derniers jours de trading
                      </MDTypography>
                    </MDBox>
                  </Grid>
                )}
                {internalTab === "flow" && (
                  <>
                    <Grid item xs={12} md={2}>
                      <MDInput
                        label="Min Premium"
                        placeholder="50000"
                        value={minPremium}
                        onChange={(e) => setMinPremium(e.target.value)}
                        type="number"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl variant="standard" fullWidth>
                        <InputLabel>Side</InputLabel>
                        <Select value={side} onChange={(e) => setSide(e.target.value)} label="Side">
                          <MenuItem value="ALL">ALL</MenuItem>
                          <MenuItem value="ASK">ASK</MenuItem>
                          <MenuItem value="BID">BID</MenuItem>
                          <MenuItem value="MID">MID</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}
                <Grid item xs={12} md={internalTab === "flow" ? 2 : 4}>
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
            <MDTypography variant="body2" color="error">
              {error}
            </MDTypography>
          </MDBox>
        )}

        {loading ? (
          <LinearProgress />
        ) : (
          <Grid container spacing={3}>
            {internalTab === "option-contracts" && (
              <Grid item xs={12}>
                <OptionContractsList data={optionContracts} loading={loading} ticker={selectedTicker} />
              </Grid>
            )}
            {internalTab === "expiry-breakdown" && (
              <Grid item xs={12}>
                <ExpiryBreakdown data={expiryBreakdown} loading={loading} ticker={selectedTicker} />
              </Grid>
            )}
            {internalTab === "flow" && (
              <Grid item xs={12}>
                <OptionContractFlow data={contractFlow} loading={loading} contractId={contractIdInput} />
              </Grid>
            )}
            {internalTab === "historic" && (
              <Grid item xs={12}>
                <OptionContractHistoric data={contractHistoric} loading={loading} contractId={contractIdInput} />
              </Grid>
            )}
            {internalTab === "intraday" && (
              <Grid item xs={12}>
                <OptionContractIntraday data={contractIntraday} loading={loading} contractId={contractIdInput} />
              </Grid>
            )}
            {internalTab === "volume-profile" && (
              <Grid item xs={12}>
                <OptionContractVolumeProfile data={contractVolumeProfile} loading={loading} contractId={contractIdInput} />
              </Grid>
            )}
          </Grid>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TradingOptionContracts;

