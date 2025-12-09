/**
 * Trading Dashboard - Whale Tracker (Refactorisé)
 * Suivi des baleines (gurus) qui peuvent faire trembler les marchés
 * Combine: Unusual Whales, FMP, 13F
 * 
 * Version refactorisée avec composants modulaires
 */

import { useState, useEffect, useCallback } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import Card from "@mui/material/Card";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import MiniStatisticsCard from "/examples/Cards/StatisticsCards/MiniStatisticsCard";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import MDButton from "/components/MDButton";
import Alert from "@mui/material/Alert";

// Composants d'onglets
import FlowAlertsTab from "/pagesComponents/dashboards/trading/components/FlowAlertsTab";
import DarkPoolTab from "/pagesComponents/dashboards/trading/components/DarkPoolTab";
import InsiderTradesTab from "/pagesComponents/dashboards/trading/components/InsiderTradesTab";
import FMPInsiderTradesTab from "/pagesComponents/dashboards/trading/components/FMPInsiderTradesTab";
import CongressTradesTab from "/pagesComponents/dashboards/trading/components/CongressTradesTab";
import InstitutionsTab from "/pagesComponents/dashboards/trading/components/InstitutionsTab";
import HedgeFundsTab from "/pagesComponents/dashboards/trading/components/HedgeFundsTab";
import TransactionsModal from "/pagesComponents/dashboards/trading/components/TransactionsModal";

// Services
import whaleTrackerService from "/services/whaleTrackerService";
import withAuth from "/hocs/withAuth";

function TradingWhaleTracker() {
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(60);

  // États pour les données (maintenus pour les stats)
  const [flowAlerts, setFlowAlerts] = useState([]);

  // Statistiques
  const [stats, setStats] = useState({
    totalAlerts: 0,
    totalPremium: 0,
    topTicker: null,
    biggestTrade: null,
  });

  // Charger les données pour l'onglet actif
  const loadTabData = useCallback(async (tabIndex = currentTab) => {
    try {
      setLoading(true);
      setError(null);

      // Délai entre les appels pour respecter les rate limits
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      switch (tabIndex) {
        case 0: // Flow Alerts - géré par FlowAlertsTab
          const alerts = await whaleTrackerService.loadFlowAlerts({ limit: 50, min_premium: 100000 });
          setFlowAlerts(alerts);
          const calculatedStats = whaleTrackerService.calculateStats(alerts);
          setStats(calculatedStats);
          break;
        case 1: // Dark Pool - géré par DarkPoolTab
        case 2: // Insiders (UW) - géré par InsiderTradesTab
        case 3: // Insiders (FMP) - géré par FMPInsiderTradesTab
        case 4: // Congress - géré par CongressTradesTab
        case 5: // Institutions - géré par InstitutionsTab
        case 6: // Hedge Funds - géré par HedgeFundsTab
          // Les composants gèrent leur propre chargement
          break;
        default:
          break;
      }
    } catch (err) {
      console.error(`Error loading tab ${currentTab} data:`, err);
      setError(err.message || `Erreur lors du chargement des données pour l'onglet ${currentTab}`);
      
      // Désactiver auto-refresh en cas d'erreur 429
      if (err.status === 429) {
        setAutoRefresh(false);
        setError(
          `Rate limit atteint. Auto-refresh désactivé. Réessayez dans ${err.resetTime ? Math.ceil((err.resetTime - Date.now()) / 1000) : 60} secondes.`
        );
      }
    } finally {
      setLoading(false);
    }
  }, [currentTab]);

  // Charger les données au changement d'onglet
  useEffect(() => {
    loadTabData(currentTab);
  }, [currentTab, loadTabData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadTabData(currentTab);
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, currentTab, loadTabData]);


  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* En-tête avec stats */}
        <MDBox mb={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <MiniStatisticsCard
                title="Total Alerts"
                count={stats.totalAlerts}
                icon={{ color: "info", component: "notifications" }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <MiniStatisticsCard
                title="Total Premium"
                count={stats.totalPremium ? `$${(stats.totalPremium / 1000000).toFixed(2)}M` : "$0"}
                icon={{ color: "success", component: "attach_money" }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <MiniStatisticsCard
                title="Top Ticker"
                count={stats.topTicker || "N/A"}
                icon={{ color: "warning", component: "trending_up" }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <MiniStatisticsCard
                title="Biggest Trade"
                count={stats.biggestTrade ? `$${(parseFloat(stats.biggestTrade.total_premium || stats.biggestTrade.premium || 0) / 1000000).toFixed(2)}M` : "N/A"}
                icon={{ color: "error", component: "show_chart" }}
              />
            </Grid>
          </Grid>
        </MDBox>

        {/* Contrôles */}
        <MDBox mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <MDBox>
            <MDButton
              variant={autoRefresh ? "contained" : "outlined"}
              color={autoRefresh ? "success" : "dark"}
              size="small"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Icon>{autoRefresh ? "pause" : "play_arrow"}</Icon>
              &nbsp;{autoRefresh ? "Pause" : "Auto-refresh"}
            </MDButton>
            {autoRefresh && (
              <Chip
                label={`Refresh: ${refreshInterval}s`}
                size="small"
                color="info"
                sx={{ ml: 1 }}
              />
            )}
          </MDBox>
          <MDButton
            variant="outlined"
            color="dark"
            size="small"
            onClick={() => loadTabData(currentTab)}
          >
            <Icon>refresh</Icon>
            &nbsp;Actualiser
          </MDButton>
        </MDBox>

        {/* Message d'erreur */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Onglets */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab label="Flow Alerts" icon={<Icon>flash_on</Icon>} iconPosition="start" />
            <Tab label="Dark Pool" icon={<Icon>visibility_off</Icon>} iconPosition="start" />
            <Tab label="Insiders (UW)" icon={<Icon>person</Icon>} iconPosition="start" />
            <Tab label="Insiders (FMP)" icon={<Icon>person_outline</Icon>} iconPosition="start" />
            <Tab label="Congress" icon={<Icon>account_balance</Icon>} iconPosition="start" />
            <Tab label="Institutions" icon={<Icon>business</Icon>} iconPosition="start" />
            <Tab label="Hedge Funds" icon={<Icon>account_balance</Icon>} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Contenu selon l'onglet */}
        {loading && currentTab === 0 ? (
          <LinearProgress />
        ) : (
          <>
            {/* Flow Alerts */}
            {currentTab === 0 && (
              <FlowAlertsTab onStatsUpdate={setStats} />
            )}

            {/* Dark Pool */}
            {currentTab === 1 && (
              <DarkPoolTab />
            )}

            {/* Insiders (UW) */}
            {currentTab === 2 && (
              <InsiderTradesTab />
            )}

            {/* Insiders (FMP) */}
            {currentTab === 3 && (
              <FMPInsiderTradesTab />
            )}

            {/* Congress */}
            {currentTab === 4 && (
              <CongressTradesTab />
            )}

            {/* Institutions */}
            {currentTab === 5 && (
              <InstitutionsTab />
            )}

            {/* Hedge Funds */}
            {currentTab === 6 && (
              <HedgeFundsTab />
            )}
          </>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default withAuth(TradingWhaleTracker);

