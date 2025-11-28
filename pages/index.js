/**
 * Page d'accueil - Dashboard principal
 * Regroupe les informations clés de toutes les sections (Trading, Unusual Whales, FMP)
 */

import { useState, useEffect, useCallback } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import MiniStatisticsCard from "/examples/Cards/StatisticsCards/MiniStatisticsCard";
import DefaultInfoCard from "/examples/Cards/InfoCards/DefaultInfoCard";
import { useRouter } from "next/router";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Badge from "@mui/material/Badge";

// Services
import marketService from "/services/marketService";
import alertService from "/services/alertService";
import smartScreener from "/services/screener";
import financialAnalysisService from "/services/financialAnalysisService";
import fmpClient from "/lib/fmp/client";
import unusualWhalesClient from "/lib/unusual-whales/client";
import metricsService from "/services/metricsService";
import { getWatchlistSymbols } from "/config/watchlist";

// Composants
import MarketIndices from "/pagesComponents/dashboards/trading/components/MarketIndices";
import EarningsToday from "/pagesComponents/dashboards/trading/components/EarningsToday";
import TradingTimeline from "/pagesComponents/dashboards/trading/components/TradingTimeline";
import TradingCalendar from "/pagesComponents/dashboards/trading/components/TradingCalendar";
import MarketTide from "/pagesComponents/dashboards/trading/components/MarketTide";
import { formatCurrency, formatPercent } from "/pagesComponents/dashboards/trading/components/utils";

function HomePage() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState("overview");
  
  // États de chargement individuels
  const [loadingStates, setLoadingStates] = useState({
    indices: true,
    marketTide: true,
    stats: true,
    topOpportunities: true,
    earningsOpportunities: true,
    unusualVolume: true,
    marketNews: true,
    timeline: true,
    calendar: true,
  });
  
  const [error, setError] = useState(null);
  const [marketData, setMarketData] = useState({
    indices: [],
    earningsToday: [],
  });
  const [opportunities, setOpportunities] = useState([]);
  const [earningsOpportunities, setEarningsOpportunities] = useState([]);
  const [unusualVolume, setUnusualVolume] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [topOpportunities, setTopOpportunities] = useState([]);
  const [marketNews, setMarketNews] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [recentFinancials, setRecentFinancials] = useState([]);
  const [flowAlerts, setFlowAlerts] = useState([]);
  const [topNetImpact, setTopNetImpact] = useState([]);
  const [insiderTransactions, setInsiderTransactions] = useState([]);
  const [marketTide, setMarketTide] = useState(null);
  const [economicCalendar, setEconomicCalendar] = useState([]);

  // Fonction pour mettre à jour un état de chargement
  const setLoadingState = useCallback((key, value) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Charger les données de manière asynchrone par section
  const loadIndices = useCallback(async () => {
    try {
      setLoadingState("indices", true);
      const watchlist = getWatchlistSymbols();
      const market = await marketService.getMarketOverview(watchlist).catch(() => ({
        indices: [],
        earningsToday: [],
      }));
      setMarketData(market);
    } catch (error) {
      console.error("Error loading indices:", error);
    } finally {
      setLoadingState("indices", false);
    }
  }, [setLoadingState]);

  const loadStats = useCallback(async () => {
    try {
      setLoadingState("stats", true);
      const alerts = alertService.getActiveAlerts();
      setActiveAlerts(alerts);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoadingState("stats", false);
    }
  }, [setLoadingState]);

  const loadMarketTide = useCallback(async () => {
    try {
      setLoadingState("marketTide", true);
      const marketTideData = await unusualWhalesClient.getMarketTide({
        interval_5m: true,
      }).catch(() => null);
      
      if (marketTideData) {
        if (Array.isArray(marketTideData)) {
          setMarketTide(marketTideData);
        } else if (marketTideData.data && Array.isArray(marketTideData.data)) {
          setMarketTide(marketTideData.data);
        } else {
          setMarketTide([marketTideData]);
        }
      }
    } catch (error) {
      console.error("Error loading market tide:", error);
    } finally {
      setLoadingState("marketTide", false);
    }
  }, [setLoadingState]);

  const loadTopOpportunities = useCallback(async () => {
    try {
      setLoadingState("topOpportunities", true);
      const watchlist = getWatchlistSymbols();
      const financialOpps = await financialAnalysisService
        .findInvestmentOpportunities(
          watchlist.length > 0 ? watchlist : ["AAPL", "MSFT", "GOOGL", "AMZN"]
        )
        .catch(() => []);
      setTopOpportunities(financialOpps.slice(0, 3));
    } catch (error) {
      console.error("Error loading top opportunities:", error);
    } finally {
      setLoadingState("topOpportunities", false);
    }
  }, [setLoadingState]);

  const loadEarningsOpportunities = useCallback(async () => {
    try {
      setLoadingState("earningsOpportunities", true);
      const watchlist = getWatchlistSymbols();
      const opps = await smartScreener.findEarningsOpportunities(7).catch(() => []);
      setEarningsOpportunities(opps.slice(0, 3));
    } catch (error) {
      console.error("Error loading earnings opportunities:", error);
    } finally {
      setLoadingState("earningsOpportunities", false);
    }
  }, [setLoadingState]);

  const loadUnusualVolume = useCallback(async () => {
    try {
      setLoadingState("unusualVolume", true);
      const watchlist = getWatchlistSymbols();
      const volume = await smartScreener.findUnusualVolume(3, watchlist).catch(() => []);
      setUnusualVolume(volume.slice(0, 3));
    } catch (error) {
      console.error("Error loading unusual volume:", error);
    } finally {
      setLoadingState("unusualVolume", false);
    }
  }, [setLoadingState]);

  const loadMarketNews = useCallback(async () => {
    try {
      setLoadingState("marketNews", true);
      const news = await marketService.getMarketNews(5).catch(() => []);
      setMarketNews(news.slice(0, 5));
    } catch (error) {
      console.error("Error loading market news:", error);
    } finally {
      setLoadingState("marketNews", false);
    }
  }, [setLoadingState]);

  const loadTimeline = useCallback(async () => {
    try {
      setLoadingState("timeline", true);
      const watchlist = getWatchlistSymbols();
      
      const [news, flowAlertsData, topImpactData, insidersData] = await Promise.all([
        marketService.getMarketNews(5).catch(() => []),
        unusualWhalesClient.getFlowAlerts({
          limit: 10,
          min_premium: 50000,
        }).catch(() => ({ data: [] })),
        unusualWhalesClient.getTopNetImpact({
          limit: 10,
        }).catch(() => ({ data: [] })),
        unusualWhalesClient.getInsiderTransactions({
          limit: 10,
        }).catch(() => ({ data: [] })),
      ]);

      const extractData = (response) => {
        if (Array.isArray(response)) return response;
        if (response?.data && Array.isArray(response.data)) return response.data;
        if (response?.data && !Array.isArray(response.data)) return [response.data];
        return [];
      };

      setFlowAlerts(extractData(flowAlertsData));
      setTopNetImpact(extractData(topImpactData));
      setInsiderTransactions(extractData(insidersData));

      // Préparer les meilleures performances du jour
      const market = await marketService.getMarketOverview(watchlist).catch(() => ({
        indices: [],
        earningsToday: [],
      }));

      const indexPerformers = market.indices
        ?.filter((idx) => idx.changePercent !== undefined)
        .sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0))
        .slice(0, 3)
        .map((idx) => ({
          type: "performance",
          symbol: idx.symbol,
          title: `${idx.name || idx.symbol} - ${idx.changePercent >= 0 ? "+" : ""}${idx.changePercent.toFixed(2)}%`,
          description: `Prix: ${formatCurrency(idx.price)}`,
          changePercent: idx.changePercent,
          dateTime: new Date().toISOString(),
        })) || [];

      const topImpactPerformers = extractData(topImpactData).slice(0, 2).map((impact) => ({
        type: "performance",
        symbol: impact.ticker || impact.symbol,
        title: `${impact.ticker || impact.symbol} - Net Impact: $${(impact.net_impact || 0).toLocaleString()}`,
        description: `Premium: $${(impact.premium || 0).toLocaleString()}`,
        changePercent: impact.change_percent,
        dateTime: impact.timestamp || impact.date || new Date().toISOString(),
      }));

      setTopPerformers([...indexPerformers, ...topImpactPerformers]);

      // Préparer les breaking news pour Timeline
      const newsTimeline = news.slice(0, 3).map((article) => ({
        type: "news",
        title: article.title,
        description: article.text || article.description || "",
        dateTime: article.publishedDate || new Date().toISOString(),
        url: article.url,
      }));

      const flowAlertsTimeline = extractData(flowAlertsData).slice(0, 3).map((alert) => ({
        type: "alert",
        symbol: alert.ticker || alert.symbol,
        title: `Flow Alert: ${alert.ticker || alert.symbol}`,
        description: `${alert.type || "Option flow"} - Premium: $${(alert.premium || 0).toLocaleString()}`,
        dateTime: alert.timestamp || alert.date || new Date().toISOString(),
        changePercent: alert.change_percent,
      }));

      const insidersTimeline = extractData(insidersData).slice(0, 2).map((transaction) => ({
        type: "financial",
        symbol: transaction.ticker || transaction.symbol,
        title: `Insider: ${transaction.ticker || transaction.symbol}`,
        description: `${transaction.transaction_type || transaction.type || "Transaction"} - ${transaction.name || ""}`,
        dateTime: transaction.transaction_date || transaction.date || new Date().toISOString(),
      }));

      setRecentFinancials([...newsTimeline, ...flowAlertsTimeline, ...insidersTimeline]);
    } catch (error) {
      console.error("Error loading timeline:", error);
    } finally {
      setLoadingState("timeline", false);
    }
  }, [setLoadingState]);

  const loadCalendar = useCallback(async () => {
    try {
      setLoadingState("calendar", true);
      const [earningsCalendar, economicCalendarData] = await Promise.all([
        fmpClient.getEarningsCalendar(
          new Date().toISOString().split("T")[0],
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        ).catch(() => []),
        fmpClient.getEconomicCalendar(
          new Date().toISOString().split("T")[0],
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        ).catch(() => []),
      ]);

      setEconomicCalendar(economicCalendarData || []);

      const earningsEvents = (earningsCalendar || []).slice(0, 20).map((earning) => ({
        type: "earnings",
        date: earning.date,
        symbol: earning.symbol,
        name: earning.name,
        title: `${earning.symbol} - Earnings`,
        description: earning.name,
      }));

      const economicEvents = (economicCalendarData || []).slice(0, 10).map((event) => ({
        type: "economic",
        date: event.date,
        title: event.event || event.name,
        description: event.country || "",
        impact: event.impact,
        name: event.event || event.name,
      }));

      setUpcomingEvents([...earningsEvents, ...economicEvents]);
    } catch (error) {
      console.error("Error loading calendar:", error);
    } finally {
      setLoadingState("calendar", false);
    }
  }, [setLoadingState]);

  // Charger toutes les données de manière asynchrone
  const loadDashboardData = useCallback(async () => {
    // Charger les données critiques en premier (indices, stats)
    loadIndices();
    loadStats();

    // Charger les autres données en parallèle
    Promise.all([
      loadMarketTide(),
      loadTopOpportunities(),
      loadEarningsOpportunities(),
      loadUnusualVolume(),
      loadMarketNews(),
      loadTimeline(),
      loadCalendar(),
    ]).catch((error) => {
      console.error("Error loading dashboard sections:", error);
    });

  }, [
    loadIndices,
    loadStats,
    loadMarketTide,
    loadTopOpportunities,
    loadEarningsOpportunities,
    loadUnusualVolume,
    loadMarketNews,
    loadTimeline,
    loadCalendar,
  ]);

  useEffect(() => {
    loadDashboardData();
    metricsService.trackFeatureUsage("home-page");

    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(() => loadDashboardData(), 300000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);



  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDTypography variant="h6" color="error">
            Erreur: {error}
          </MDTypography>
          <MDTypography variant="body2" color="text" mt={2}>
            Vérifiez votre connexion et les clés API configurées.
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Composant Skeleton pour les cartes d'indices
  const IndicesSkeleton = () => (
    <Grid container spacing={3}>
      {[1, 2, 3, 4].map((idx) => (
        <Grid item xs={12} sm={6} lg={3} key={idx}>
          <Card>
            <MDBox p={2}>
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="80%" height={40} sx={{ mt: 1 }} />
              <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
            </MDBox>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Composant Skeleton pour les cartes d'info
  const InfoCardsSkeleton = () => (
    <Grid container spacing={3}>
      {[1, 2, 3, 4].map((idx) => (
        <Grid item xs={12} sm={6} md={3} key={idx}>
          <Card>
            <MDBox p={2}>
              <Skeleton variant="circular" width={64} height={64} sx={{ mx: "auto", mb: 2 }} />
              <Skeleton variant="text" width="80%" height={24} sx={{ mx: "auto" }} />
              <Skeleton variant="text" width="60%" height={20} sx={{ mx: "auto", mt: 1 }} />
            </MDBox>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Composant Skeleton pour les opportunités
  const OpportunitiesSkeleton = () => (
    <Grid container spacing={2}>
      {[1, 2, 3].map((idx) => (
        <Grid item xs={12} sm={6} md={4} key={idx}>
          <Card sx={{ p: 2 }}>
            <Skeleton variant="text" width="40%" height={28} />
            <Skeleton variant="text" width="80%" height={20} sx={{ mt: 1 }} />
            <Skeleton variant="text" width="60%" height={20} sx={{ mt: 1 }} />
            <MDBox mt={2} display="flex" gap={2}>
              <Skeleton variant="text" width="30%" height={40} />
              <Skeleton variant="text" width="30%" height={40} />
            </MDBox>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Composant Skeleton pour les actualités
  const NewsSkeleton = () => (
    <Grid container spacing={2}>
      {[1, 2, 3].map((idx) => (
        <Grid item xs={12} md={4} key={idx}>
          <Card sx={{ p: 2, height: "100%" }}>
            <Skeleton variant="text" width="100%" height={28} />
            <Skeleton variant="text" width="40%" height={16} sx={{ mt: 1 }} />
            <Skeleton variant="text" width="100%" height={16} sx={{ mt: 1 }} />
            <Skeleton variant="text" width="90%" height={16} sx={{ mt: 0.5 }} />
            <Skeleton variant="text" width="70%" height={16} sx={{ mt: 0.5 }} />
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox my={3}>
        {/* En-tête */}
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Dashboard Trading
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Vue d&apos;ensemble du marché et opportunités
          </MDTypography>
        </MDBox>

        {/* Onglets */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="dashboard tabs">
            <Tab
              label={
                <MDBox display="flex" alignItems="center" gap={1}>
                  <Icon>dashboard</Icon>
                  <span>Vue d&apos;ensemble</span>
                </MDBox>
              }
              value="overview"
            />
            <Tab
              label={
                <MDBox display="flex" alignItems="center" gap={1}>
                  <Icon>trending_up</Icon>
                  <span>Opportunités</span>
                  {topOpportunities.length > 0 && (
                    <Badge badgeContent={topOpportunities.length} color="error" />
                  )}
                </MDBox>
              }
              value="opportunities"
            />
            <Tab
              label={
                <MDBox display="flex" alignItems="center" gap={1}>
                  <Icon>article</Icon>
                  <span>Actualités & Événements</span>
                  {marketNews.length > 0 && (
                    <Badge badgeContent={marketNews.length} color="info" />
                  )}
                </MDBox>
              }
              value="news"
            />
          </Tabs>
        </Box>

        {/* Contenu des onglets */}
        {currentTab === "overview" && (
          <>
            {/* Statistiques principales - Indices */}
            <MDBox mb={3}>
              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Indices Marché
              </MDTypography>
              {loadingStates.indices ? (
                <IndicesSkeleton />
              ) : marketData.indices && marketData.indices.length > 0 ? (
                <Grid container spacing={3}>
                  {marketData.indices.slice(0, 4).map((index, idx) => (
                    <Grid item xs={12} sm={6} lg={3} key={idx}>
                      <MiniStatisticsCard
                        title={{ text: index.name || index.symbol }}
                        count={formatCurrency(index.price)}
                        percentage={{
                          color: index.changePercent >= 0 ? "success" : "error",
                          text: `${index.changePercent >= 0 ? "+" : ""}${index.changePercent.toFixed(2)}%`,
                        }}
                        icon={{
                          color: index.changePercent >= 0 ? "success" : "error",
                          component: index.changePercent >= 0 ? "trending_up" : "trending_down",
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="body2" color="text">
                      Aucun indice disponible. Vérifiez votre clé API FMP dans .env.local
                    </MDTypography>
                  </MDBox>
                </Card>
              )}
            </MDBox>

            {/* Market Tide - Sentiment du marché (Unusual Whales) */}
            <MDBox mb={3}>
              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Sentiment du Marché
              </MDTypography>
              {loadingStates.marketTide ? (
                <Card>
                  <MDBox p={3}>
                    <Skeleton variant="rectangular" width="100%" height={200} />
                  </MDBox>
                </Card>
              ) : marketTide && marketTide.length > 0 ? (
                <MarketTide
                  data={marketTide}
                  loading={false}
                  interval="5m"
                  onIntervalChange={null}
                />
              ) : null}
            </MDBox>

            {/* Statistiques secondaires */}
            <MDBox mb={3}>
              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Statistiques Rapides
              </MDTypography>
              {loadingStates.stats ? (
                <InfoCardsSkeleton />
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card
                      sx={{
                        p: 2,
                        cursor: "pointer",
                        "&:hover": { boxShadow: 4 },
                        height: "100%",
                      }}
                      onClick={() => router.push("/dashboards/trading/alerts")}
                    >
                      <MDBox display="flex" alignItems="center" gap={2} mb={1}>
                        <MDBox
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          bgColor="info"
                          color="white"
                          width="3rem"
                          height="3rem"
                          borderRadius="md"
                          variant="gradient"
                        >
                          <Icon fontSize="medium">notifications_active</Icon>
                        </MDBox>
                        <MDBox flex={1}>
                          <MDTypography variant="h6" fontWeight="bold" color="info">
                            {activeAlerts.length}
                          </MDTypography>
                          <MDTypography variant="caption" color="text">
                            Alertes Actives
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                      <MDTypography variant="caption" color="text.secondary">
                        Alertes configurées
                      </MDTypography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card
                      sx={{
                        p: 2,
                        cursor: "pointer",
                        "&:hover": { boxShadow: 4 },
                        height: "100%",
                      }}
                      onClick={() => {
                        setCurrentTab("opportunities");
                      }}
                    >
                      <MDBox display="flex" alignItems="center" gap={2} mb={1}>
                        <MDBox
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          bgColor="success"
                          color="white"
                          width="3rem"
                          height="3rem"
                          borderRadius="md"
                          variant="gradient"
                        >
                          <Icon fontSize="medium">trending_up</Icon>
                        </MDBox>
                        <MDBox flex={1}>
                          <MDTypography variant="h6" fontWeight="bold" color="success">
                            {topOpportunities.length}
                          </MDTypography>
                          <MDTypography variant="caption" color="text">
                            Opportunités
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                      <MDTypography variant="caption" color="text.secondary">
                        Meilleures opportunités
                      </MDTypography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card
                      sx={{
                        p: 2,
                        cursor: "pointer",
                        "&:hover": { boxShadow: 4 },
                        height: "100%",
                      }}
                      onClick={() => router.push("/dashboards/trading/earnings")}
                    >
                      <MDBox display="flex" alignItems="center" gap={2} mb={1}>
                        <MDBox
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          bgColor="warning"
                          color="white"
                          width="3rem"
                          height="3rem"
                          borderRadius="md"
                          variant="gradient"
                        >
                          <Icon fontSize="medium">event</Icon>
                        </MDBox>
                        <MDBox flex={1}>
                          <MDTypography variant="h6" fontWeight="bold" color="warning">
                            {marketData.earningsToday?.length || 0}
                          </MDTypography>
                          <MDTypography variant="caption" color="text">
                            Earnings Aujourd&apos;hui
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                      <MDTypography variant="caption" color="text.secondary">
                        Annonces de résultats
                      </MDTypography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card
                      sx={{
                        p: 2,
                        cursor: "pointer",
                        "&:hover": { boxShadow: 4 },
                        height: "100%",
                      }}
                      onClick={() => {
                        setCurrentTab("opportunities");
                      }}
                    >
                      <MDBox display="flex" alignItems="center" gap={2} mb={1}>
                        <MDBox
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          bgColor="error"
                          color="white"
                          width="3rem"
                          height="3rem"
                          borderRadius="md"
                          variant="gradient"
                        >
                          <Icon fontSize="medium">bar_chart</Icon>
                        </MDBox>
                        <MDBox flex={1}>
                          <MDTypography variant="h6" fontWeight="bold" color="error">
                            {unusualVolume.length}
                          </MDTypography>
                          <MDTypography variant="caption" color="text">
                            Volumes Anormaux
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                      <MDTypography variant="caption" color="text.secondary">
                        Détections récentes
                      </MDTypography>
                    </Card>
                  </Grid>
                </Grid>
              )}
            </MDBox>
          </>
        )}

        {currentTab === "opportunities" && (
          <>
            {/* Opportunités d'investissement */}
            <MDBox mb={3}>
              <Card>
                <MDBox p={3}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <MDTypography variant="h6" fontWeight="medium">
                      Top Opportunités d&apos;Investissement
                    </MDTypography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => router.push("/dashboards/trading/financial-analysis")}
                    >
                      Voir toutes
                    </Button>
                  </MDBox>
                {loadingStates.topOpportunities ? (
                  <OpportunitiesSkeleton />
                ) : topOpportunities.length > 0 ? (
                  <Grid container spacing={2}>
                    {topOpportunities.map((opp, idx) => (
                      <Grid item xs={12} sm={6} md={4} key={idx}>
                        <Card
                          sx={{
                            p: 2,
                            cursor: "pointer",
                            "&:hover": { boxShadow: 4 },
                          }}
                          onClick={() =>
                            router.push(
                              `/dashboards/trading/financial-analysis?symbol=${opp.symbol}`
                            )
                          }
                        >
                          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <MDTypography variant="h6" fontWeight="bold" color="primary">
                              {opp.symbol}
                            </MDTypography>
                            <Chip
                              label={`Score: ${opp.opportunityScore || 0}`}
                              color={
                                opp.opportunityScore >= 80
                                  ? "success"
                                  : opp.opportunityScore >= 60
                                  ? "info"
                                  : "warning"
                              }
                              size="small"
                            />
                          </MDBox>
                          <MDTypography variant="caption" color="text" display="block">
                            {opp.companyName}
                          </MDTypography>
                          <MDBox mt={1} display="flex" gap={2}>
                            <MDBox>
                              <MDTypography variant="caption" color="text">
                                Prix
                              </MDTypography>
                              <MDTypography variant="body2" fontWeight="medium">
                                {formatCurrency(opp.currentPrice)}
                              </MDTypography>
                            </MDBox>
                            <MDBox>
                              <MDTypography variant="caption" color="text">
                                P/E
                              </MDTypography>
                              <MDTypography variant="body2">
                                {opp.peRatio ? opp.peRatio.toFixed(2) : "N/A"}
                              </MDTypography>
                            </MDBox>
                          </MDBox>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <MDBox textAlign="center" py={4}>
                    <MDTypography variant="body2" color="text">
                      Aucune opportunité trouvée. Vérifiez votre watchlist et votre clé API FMP.
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </MDBox>

          {/* Opportunités Earnings */}
          <MDBox mb={3}>
            <Card>
              <MDBox p={3}>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <MDTypography variant="h6" fontWeight="medium">
                    Opportunités Earnings (7 prochains jours)
                  </MDTypography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => router.push("/dashboards/trading/earnings")}
                  >
                    Voir toutes
                  </Button>
                </MDBox>
                {loadingStates.earningsOpportunities ? (
                  <OpportunitiesSkeleton />
                ) : earningsOpportunities.length > 0 ? (
                  <Grid container spacing={2}>
                    {earningsOpportunities.map((opp, idx) => (
                      <Grid item xs={12} sm={6} md={4} key={idx}>
                        <Card
                          sx={{
                            p: 2,
                            cursor: "pointer",
                            "&:hover": { boxShadow: 4 },
                          }}
                          onClick={() =>
                            router.push(
                              `/dashboards/trading/ticker-analysis?ticker=${opp.symbol}`
                            )
                          }
                        >
                          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <MDTypography variant="h6" fontWeight="bold" color="primary">
                              {opp.symbol}
                            </MDTypography>
                            <Chip
                              label={`${opp.confidenceScore || 0}/100`}
                              color={
                                opp.confidenceScore >= 80
                                  ? "success"
                                  : opp.confidenceScore >= 60
                                  ? "info"
                                  : "warning"
                              }
                              size="small"
                            />
                          </MDBox>
                          <MDTypography variant="caption" color="text" display="block">
                            {opp.company}
                          </MDTypography>
                          <MDTypography variant="caption" color="text" display="block">
                            Earnings: {opp.earningsDate}
                          </MDTypography>
                          <MDBox mt={1} display="flex" gap={2}>
                            <MDBox>
                              <MDTypography variant="caption" color="text">
                                Prix
                              </MDTypography>
                              <MDTypography variant="body2" fontWeight="medium">
                                {formatCurrency(opp.currentPrice)}
                              </MDTypography>
                            </MDBox>
                            <MDBox>
                              <MDTypography variant="caption" color="text">
                                Change
                              </MDTypography>
                              <MDTypography
                                variant="body2"
                                color={opp.changePercent >= 0 ? "success" : "error"}
                              >
                                {formatPercent(opp.changePercent)}
                              </MDTypography>
                            </MDBox>
                          </MDBox>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <MDBox textAlign="center" py={4}>
                    <MDTypography variant="body2" color="text">
                      Aucune opportunité earnings trouvée. Vérifiez votre watchlist.
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </MDBox>

          {/* Volumes inhabituels */}
          <MDBox mb={3}>
            <Card>
              <MDBox p={3}>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <MDTypography variant="h6" fontWeight="medium">
                    Volumes Anormaux Détectés
                  </MDTypography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => router.push("/dashboards/trading/screener")}
                  >
                    Voir screener
                  </Button>
                </MDBox>
                {loadingStates.unusualVolume ? (
                  <OpportunitiesSkeleton />
                ) : unusualVolume.length > 0 ? (
                  <Grid container spacing={2}>
                    {unusualVolume.map((vol, idx) => (
                      <Grid item xs={12} sm={6} md={4} key={idx}>
                        <Card sx={{ p: 2 }}>
                          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <MDTypography variant="h6" fontWeight="bold" color="primary">
                              {vol.symbol}
                            </MDTypography>
                            <Chip
                              label={`${vol.volumeRatio}x`}
                              color="warning"
                              size="small"
                            />
                          </MDBox>
                          <MDBox mt={1} display="flex" gap={2}>
                            <MDBox>
                              <MDTypography variant="caption" color="text">
                                Prix
                              </MDTypography>
                              <MDTypography variant="body2" fontWeight="medium">
                                {formatCurrency(vol.price)}
                              </MDTypography>
                            </MDBox>
                            <MDBox>
                              <MDTypography variant="caption" color="text">
                                Change
                              </MDTypography>
                              <MDTypography
                                variant="body2"
                                color={vol.changePercent >= 0 ? "success" : "error"}
                              >
                                {formatPercent(vol.changePercent)}
                              </MDTypography>
                            </MDBox>
                          </MDBox>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <MDBox textAlign="center" py={4}>
                    <MDTypography variant="body2" color="text">
                      Aucun volume anormal détecté.
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </MDBox>
          </>
        )}

        {currentTab === "news" && (
          <>
            {/* Actualités marché */}
            <MDBox mb={3}>
              <Card>
                <MDBox p={3}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <MDTypography variant="h6" fontWeight="medium">
                      Actualités Marché
                    </MDTypography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => router.push("/dashboards/trading/news")}
                    >
                      Voir toutes
                    </Button>
                  </MDBox>
                {loadingStates.marketNews ? (
                  <NewsSkeleton />
                ) : marketNews.length > 0 ? (
                  <Grid container spacing={2}>
                    {marketNews.map((article, idx) => (
                      <Grid item xs={12} md={4} key={idx}>
                        <Card
                          sx={{
                            p: 2,
                            cursor: "pointer",
                            "&:hover": { boxShadow: 4 },
                            height: "100%",
                          }}
                          onClick={() => window.open(article.url, "_blank")}
                        >
                          <MDTypography variant="h6" fontWeight="medium" mb={1} noWrap>
                            {article.title}
                          </MDTypography>
                          <MDTypography variant="caption" color="text" display="block" mb={1}>
                            {article.publishedDate
                              ? new Date(article.publishedDate).toLocaleDateString("fr-FR")
                              : "N/A"}
                          </MDTypography>
                          <MDTypography variant="body2" color="text" sx={{ overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                            {article.text || article.description || "Aucune description"}
                          </MDTypography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <MDBox textAlign="center" py={4}>
                    <MDTypography variant="body2" color="text">
                      Aucune actualité disponible. Vérifiez votre clé API FMP.
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </MDBox>

          {/* Timeline et Calendar */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} lg={6}>
              <TradingTimeline
                title="Breaking News & Alerts"
                events={recentFinancials}
                loading={loadingStates.timeline}
              />
            </Grid>
            <Grid item xs={12} lg={6}>
              <TradingTimeline
                title="Meilleures Performances"
                events={topPerformers}
                loading={loadingStates.timeline}
              />
            </Grid>
            <Grid item xs={12}>
              <TradingCalendar
                title="Calendrier des Événements"
                events={upcomingEvents}
                loading={loadingStates.calendar}
              />
            </Grid>
          </Grid>
          </>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default HomePage;

