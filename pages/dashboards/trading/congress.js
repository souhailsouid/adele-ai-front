/**
 * Trading Dashboard - Congress Trades
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
import MDInput from "/components/MDInput";
import MDButton from "/components/MDButton";
import Card from "@mui/material/Card";

// Services
import unusualWhalesClient from "/lib/unusual-whales/client";
import metricsService from "/services/metricsService";

// Composants
import CongressTrades from "/pagesComponents/dashboards/trading/components/CongressTrades";

function TradingCongress() {
  const router = useRouter();
  
  // Onglets internes
  const [internalTab, setInternalTab] = useState("recent-trades");
  
  // États pour chaque vue
  const [recentTrades, setRecentTrades] = useState([]);
  const [lateReports, setLateReports] = useState([]);
  const [congressTrader, setCongressTrader] = useState([]);
  
  // États de chargement
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filtres
  const [memberName, setMemberName] = useState("");
  const [tickerFilter, setTickerFilter] = useState("");


  // Extraire les données
  const extractData = (response) => {
    if (Array.isArray(response)) return response;
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (response?.data && !Array.isArray(response.data)) return [response.data];
    return [];
  };

  // Charger les transactions récentes
  const loadRecentTrades = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        limit: 200,
      };

      if (tickerFilter.trim()) {
        params.ticker = tickerFilter.trim().toUpperCase();
      }

      const tradesData = await unusualWhalesClient.getCongressRecentTrades(params).catch((err) => {
        console.error("Error loading recent trades:", err);
        return { data: [] };
      });

      setRecentTrades(extractData(tradesData));
    } catch (err) {
      console.error("Error loading Recent Trades:", err);
      setError(err.message || "Erreur lors du chargement des transactions récentes");
    } finally {
      setLoading(false);
    }
  };

  // Charger les rapports en retard
  const loadLateReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        limit: 200,
      };

      if (tickerFilter.trim()) {
        params.ticker = tickerFilter.trim().toUpperCase();
      }

      const reportsData = await unusualWhalesClient.getCongressLateReports(params).catch((err) => {
        console.error("Error loading late reports:", err);
        return { data: [] };
      });

      setLateReports(extractData(reportsData));
    } catch (err) {
      console.error("Error loading Late Reports:", err);
      setError(err.message || "Erreur lors du chargement des rapports en retard");
    } finally {
      setLoading(false);
    }
  };

  // Charger les transactions d'un membre spécifique
  const loadCongressTrader = async () => {
    if (!memberName.trim()) {
      setError("Veuillez entrer un nom de membre du Congrès");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = {
        limit: 200,
      };

      if (tickerFilter.trim()) {
        params.ticker = tickerFilter.trim().toUpperCase();
      }

      const traderData = await unusualWhalesClient.getCongressTrader(memberName.trim(), params).catch((err) => {
        console.error("Error loading congress trader:", err);
        throw err;
      });

      setCongressTrader(extractData(traderData));
    } catch (err) {
      console.error("Error loading Congress Trader:", err);
      setError(err.message || "Erreur lors du chargement des transactions du membre");
      setCongressTrader([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données selon l'onglet interne
  useEffect(() => {
    if (internalTab === "recent-trades") {
      loadRecentTrades();
    } else if (internalTab === "late-reports") {
      loadLateReports();
    } else if (internalTab === "congress-trader") {
      // Ne charge pas automatiquement, nécessite un nom
    }
    metricsService.trackFeatureUsage("congress");
  }, [internalTab]);

  const handleInternalTabChange = (event, newValue) => {
    setInternalTab(newValue);
  };

  const handleSearch = () => {
    if (internalTab === "recent-trades") {
      loadRecentTrades();
    } else if (internalTab === "late-reports") {
      loadLateReports();
    } else if (internalTab === "congress-trader") {
      loadCongressTrader();
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold" mb={1}>
            Congress Trades
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Transactions des membres du Congrès américain
          </MDTypography>
        </MDBox>

        {/* Onglets Internes */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={internalTab} onChange={handleInternalTabChange} aria-label="congress internal tabs">
            <Tab label="Recent Trades" value="recent-trades" />
            <Tab label="Late Reports" value="late-reports" />
            <Tab label="Congress Trader" value="congress-trader" />
          </Tabs>
        </Box>

        {/* Filtres */}
        <MDBox mb={3}>
          <Card>
            <MDBox p={2}>
              <Grid container spacing={2} alignItems="center">
                {internalTab === "congress-trader" && (
                  <Grid item xs={12} md={4}>
                    <MDInput
                      label="Nom du membre"
                      placeholder="Ex: Nancy Pelosi, Adam Kinzinger"
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                      variant="standard"
                      fullWidth
                    />
                  </Grid>
                )}
                <Grid item xs={12} md={internalTab === "congress-trader" ? 4 : 6}>
                  <MDInput
                    label="Filtrer par Ticker"
                    placeholder="Ex: AAPL, MSFT"
                    value={tickerFilter}
                    onChange={(e) => setTickerFilter(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                    variant="standard"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={internalTab === "congress-trader" ? 4 : 6}>
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
            {internalTab === "recent-trades" && (
              <Grid item xs={12}>
                <CongressTrades data={recentTrades} loading={loading} title="Recent Trades" />
              </Grid>
            )}
            {internalTab === "late-reports" && (
              <Grid item xs={12}>
                <CongressTrades data={lateReports} loading={loading} title="Late Reports" />
              </Grid>
            )}
            {internalTab === "congress-trader" && (
              <Grid item xs={12}>
                <CongressTrades data={congressTrader} loading={loading} title={`Congress Trader: ${memberName || "N/A"}`} />
              </Grid>
            )}
          </Grid>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TradingCongress;

