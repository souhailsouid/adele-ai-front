/**
 * Trading Dashboard - Politician Portfolios
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
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";

// Services
import unusualWhalesClient from "/lib/unusual-whales/client";
import metricsService from "/services/metricsService";
import { searchStocks } from "/config/stockSymbols";

// Composants
import PoliticianPortfolioHolders from "/pagesComponents/dashboards/trading/components/PoliticianPortfolioHolders";
import PoliticiansList from "/pagesComponents/dashboards/trading/components/PoliticiansList";
import PoliticianTrades from "/pagesComponents/dashboards/trading/components/PoliticianTrades";
import PoliticianPortfolios from "/pagesComponents/dashboards/trading/components/PoliticianPortfolios";

function TradingPoliticianPortfolios() {
  const router = useRouter();
  
  // Onglets internes
  const [internalTab, setInternalTab] = useState("politicians-list");
  
  // États pour chaque vue
  const [politiciansList, setPoliticiansList] = useState([]);
  const [portfolioHolders, setPortfolioHolders] = useState([]);
  const [politicianTrades, setPoliticianTrades] = useState([]);
  const [politicianPortfolios, setPoliticianPortfolios] = useState([]);
  
  // États de chargement
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filtres
  const [selectedTicker, setSelectedTicker] = useState("");
  const [tickerInput, setTickerInput] = useState("");
  const [selectedPoliticianId, setSelectedPoliticianId] = useState("");
  const [politicianInput, setPoliticianInput] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [limit, setLimit] = useState("500");
  const [filterLateReports, setFilterLateReports] = useState(false);
  const [aggregatePortfolios, setAggregatePortfolios] = useState(false);

  // Extraire les données
  const extractData = (response) => {
    if (Array.isArray(response)) return response;
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (response?.data && !Array.isArray(response.data)) return [response.data];
    return [];
  };

  // Charger la liste des politiciens
  const loadPoliticiansList = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await unusualWhalesClient.getPoliticiansList().catch((err) => {
        console.error("Error loading politicians list:", err);
        throw err;
      });

      setPoliticiansList(extractData(data));
    } catch (err) {
      console.error("Error loading Politicians List:", err);
      setError(err.message || "Erreur lors du chargement de la liste des politiciens");
      setPoliticiansList([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les détenteurs de portfolios par ticker
  const loadPortfolioHolders = async () => {
    if (!selectedTicker.trim()) {
      setError("Veuillez entrer un ticker");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (aggregatePortfolios) params.aggregate_all_portfolios = true;

      const data = await unusualWhalesClient.getPoliticianPortfolioHolders(selectedTicker.trim().toUpperCase(), params).catch((err) => {
        console.error("Error loading portfolio holders:", err);
        throw err;
      });

      setPortfolioHolders(extractData(data));
    } catch (err) {
      console.error("Error loading Portfolio Holders:", err);
      setError(err.message || "Erreur lors du chargement des détenteurs de portfolios");
      setPortfolioHolders([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les transactions de politiciens
  const loadPoliticianTrades = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        limit: parseInt(limit) || 500,
      };
      if (selectedDate) params.date = selectedDate;
      if (selectedTicker.trim()) params.ticker = selectedTicker.trim().toUpperCase();
      if (selectedPoliticianId) params.politician_id = selectedPoliticianId;
      if (filterLateReports) params.filter_late_reports = true;

      const data = await unusualWhalesClient.getPoliticianTrades(params).catch((err) => {
        console.error("Error loading politician trades:", err);
        throw err;
      });

      setPoliticianTrades(extractData(data));
    } catch (err) {
      console.error("Error loading Politician Trades:", err);
      setError(err.message || "Erreur lors du chargement des transactions de politiciens");
      setPoliticianTrades([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les portfolios d'un politicien
  const loadPoliticianPortfolios = async () => {
    if (!selectedPoliticianId.trim()) {
      setError("Veuillez sélectionner un politicien");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (aggregatePortfolios) params.aggregate_all_portfolios = true;

      const data = await unusualWhalesClient.getPoliticianPortfolios(selectedPoliticianId.trim(), params).catch((err) => {
        console.error("Error loading politician portfolios:", err);
        throw err;
      });

      setPoliticianPortfolios(extractData(data));
    } catch (err) {
      console.error("Error loading Politician Portfolios:", err);
      setError(err.message || "Erreur lors du chargement des portfolios du politicien");
      setPoliticianPortfolios([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données selon l'onglet interne
  const handleSearch = () => {
    if (internalTab === "politicians-list") {
      loadPoliticiansList();
    } else if (internalTab === "portfolio-holders") {
      loadPortfolioHolders();
    } else if (internalTab === "trades") {
      loadPoliticianTrades();
    } else if (internalTab === "portfolios") {
      loadPoliticianPortfolios();
    }
  };

  const handleInternalTabChange = (event, newValue) => {
    setInternalTab(newValue);
  };

  // Charger automatiquement la liste des politiciens au montage
  useEffect(() => {
    if (internalTab === "politicians-list") {
      loadPoliticiansList();
    }
    metricsService.trackFeatureUsage("politician-portfolios");
  }, [internalTab]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold" mb={1}>
            Politician Portfolios
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Portfolios et transactions des membres du Congrès
          </MDTypography>
        </MDBox>

        <Alert severity="info" sx={{ mb: 3 }}>
          <MDTypography variant="body2">
            <strong>Endpoint Enterprise:</strong> Ces endpoints nécessitent un accès enterprise. 
            Contactez dan@unusualwhales.com pour plus d&apos;informations.
          </MDTypography>
        </Alert>

        {/* Onglets Internes */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={internalTab} onChange={handleInternalTabChange} aria-label="politician portfolios internal tabs" variant="scrollable" scrollButtons="auto">
            <Tab label="Politicians List" value="politicians-list" />
            <Tab label="Portfolio Holders" value="portfolio-holders" />
            <Tab label="Politician Trades" value="trades" />
            <Tab label="Politician Portfolios" value="portfolios" />
          </Tabs>
        </Box>

        {/* Filtres */}
        <MDBox mb={3}>
          <Card>
            <MDBox p={2}>
              <Grid container spacing={2} alignItems="center">
                {(internalTab === "portfolio-holders" || internalTab === "trades") && (
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
                {(internalTab === "trades" || internalTab === "portfolios") && (
                  <Grid item xs={12} md={4}>
                    <Autocomplete
                      freeSolo
                      options={politiciansList}
                      value={politicianInput}
                      getOptionLabel={(option) => {
                        if (typeof option === "string") return option;
                        return option.name || option.id || "";
                      }}
                      onInputChange={(event, newInputValue) => {
                        setPoliticianInput(newInputValue);
                      }}
                      onChange={(event, newValue) => {
                        if (typeof newValue === "string") {
                          // Chercher par nom
                          const found = politiciansList.find(p => p.name.toLowerCase().includes(newValue.toLowerCase()));
                          if (found) {
                            setSelectedPoliticianId(found.id);
                            setPoliticianInput(found.name);
                          } else {
                            setSelectedPoliticianId(newValue);
                            setPoliticianInput(newValue);
                          }
                        } else if (newValue && newValue.id) {
                          setSelectedPoliticianId(newValue.id);
                          setPoliticianInput(newValue.name);
                        } else {
                          setSelectedPoliticianId("");
                          setPoliticianInput("");
                        }
                      }}
                      renderInput={(params) => (
                        <MDInput
                          {...params}
                          label="Politicien"
                          placeholder="Rechercher un politicien"
                        />
                      )}
                    />
                  </Grid>
                )}
                {internalTab === "trades" && (
                  <>
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
                    <Grid item xs={12} md={2}>
                      <MDInput
                        label="Limit"
                        placeholder="500"
                        value={limit}
                        onChange={(e) => setLimit(e.target.value)}
                        type="number"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl variant="standard" fullWidth>
                        <InputLabel>Options</InputLabel>
                        <Select
                          value={filterLateReports ? "filter" : "all"}
                          onChange={(e) => setFilterLateReports(e.target.value === "filter")}
                          label="Options"
                        >
                          <MenuItem value="all">Toutes les transactions</MenuItem>
                          <MenuItem value="filter">Filtrer rapports tardifs</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}
                {(internalTab === "portfolio-holders" || internalTab === "portfolios") && (
                  <Grid item xs={12} md={2}>
                    <FormControl variant="standard" fullWidth>
                      <InputLabel>Agrégation</InputLabel>
                      <Select
                        value={aggregatePortfolios ? "aggregate" : "separate"}
                        onChange={(e) => setAggregatePortfolios(e.target.value === "aggregate")}
                        label="Agrégation"
                      >
                        <MenuItem value="separate">Séparés</MenuItem>
                        <MenuItem value="aggregate">Agrégés</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                <Grid item xs={12} md={internalTab === "trades" ? 2 : internalTab === "portfolio-holders" || internalTab === "portfolios" ? 2 : 4}>
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
            {internalTab === "politicians-list" && (
              <Grid item xs={12}>
                <PoliticiansList data={politiciansList} loading={loading} onSelectPolitician={(id) => {
                  setSelectedPoliticianId(id);
                  setInternalTab("portfolios");
                }} />
              </Grid>
            )}
            {internalTab === "portfolio-holders" && (
              <Grid item xs={12}>
                <PoliticianPortfolioHolders data={portfolioHolders} loading={loading} ticker={selectedTicker} />
              </Grid>
            )}
            {internalTab === "trades" && (
              <Grid item xs={12}>
                <PoliticianTrades data={politicianTrades} loading={loading} />
              </Grid>
            )}
            {internalTab === "portfolios" && (
              <Grid item xs={12}>
                <PoliticianPortfolios data={politicianPortfolios} loading={loading} politicianId={selectedPoliticianId} />
              </Grid>
            )}
          </Grid>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TradingPoliticianPortfolios;


