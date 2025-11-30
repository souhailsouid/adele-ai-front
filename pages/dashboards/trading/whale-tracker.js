/**
 * Trading Dashboard - Whale Tracker
 * Suivi des baleines (gurus) qui peuvent faire trembler les marchés
 * Combine: Unusual Whales, FMP, 13F
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
import DataTable from "/examples/Tables/DataTable";
import MiniStatisticsCard from "/examples/Cards/StatisticsCards/MiniStatisticsCard";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import MDButton from "/components/MDButton";
import Alert from "@mui/material/Alert";

// Services
import unusualWhalesClient from "/lib/unusual-whales/client";
import fmpClient from "/lib/fmp/client";
import metricsService from "/services/metricsService";
import HEDGE_FUNDS from "/config/hedgeFunds";

function TradingWhaleTracker() {
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // secondes

  // États pour chaque type de données
  const [flowAlerts, setFlowAlerts] = useState([]);
  const [darkpoolTrades, setDarkpoolTrades] = useState([]);
  const [insiderTrades, setInsiderTrades] = useState([]);
  const [congressTrades, setCongressTrades] = useState([]);
  const [institutionalActivity, setInstitutionalActivity] = useState([]);
  const [fmpInsiderTrades, setFmpInsiderTrades] = useState([]);
  const [hedgeFundActivity, setHedgeFundActivity] = useState([]);
  const [selectedHedgeFund, setSelectedHedgeFund] = useState(null);
  const [hedgeFundHoldings, setHedgeFundHoldings] = useState([]);

  // Statistiques
  const [stats, setStats] = useState({
    totalAlerts: 0,
    totalPremium: 0,
    topTicker: null,
    biggestTrade: null,
  });

  // Charger les Flow Alerts (gros trades options)
  const loadFlowAlerts = useCallback(async () => {
    try {
      const data = await unusualWhalesClient.getFlowAlerts({
        limit: 50,
        min_premium: 100000, // Minimum 100k$ pour filtrer les vraies baleines
      });
        const alerts = Array.isArray(data) ? data : (data?.data || []);
        setFlowAlerts(alerts);
        return alerts;
    } catch (err) {
      console.error("Error loading flow alerts:", err);
      return [];
    }
  }, []);

  // Charger les Dark Pool trades
  const loadDarkpoolTrades = useCallback(async () => {
    try {
      const data = await unusualWhalesClient.getRecentDarkpoolTrades({
        limit: 50,
        min_premium: 500000, // Minimum 500k$ pour dark pool
      });
      const trades = Array.isArray(data) ? data : (data?.data || []);
      setDarkpoolTrades(trades);
      return trades;
    } catch (err) {
      console.error("Error loading darkpool trades:", err);
      return [];
    }
  }, []);

  // Charger les Insider Transactions (Unusual Whales)
  const loadInsiderTrades = useCallback(async () => {
    try {
      const data = await unusualWhalesClient.getInsiderTransactions({
        limit: 50,
      });
      const trades = Array.isArray(data) ? data : (data?.data || []);
      setInsiderTrades(trades);
      return trades;
    } catch (err) {
      console.error("Error loading insider trades:", err);
      return [];
    }
  }, []);

  // Charger les Congress Trades
  const loadCongressTrades = useCallback(async () => {
    try {
      const data = await unusualWhalesClient.getCongressRecentTrades({
        limit: 50,
      });
      const trades = Array.isArray(data) ? data : (data?.data || []);
      setCongressTrades(trades);
      return trades;
    } catch (err) {
      console.error("Error loading congress trades:", err);
      return [];
    }
  }, []);

  // Charger l'activité institutionnelle
  const loadInstitutionalActivity = useCallback(async () => {
    try {
      const data = await unusualWhalesClient.getLatestInstitutionalFilings({
        limit: 50,
      });
      const activity = Array.isArray(data) ? data : (data?.data || []);
      setInstitutionalActivity(activity);
      return activity;
    } catch (err) {
      console.error("Error loading institutional activity:", err);
      return [];
    }
  }, []);

  // Charger les Insider Trades FMP
  const loadFMPInsiderTrades = useCallback(async () => {
    try {
      const data = await fmpClient.getInsiderTrades(null, 50, 0);
      const trades = Array.isArray(data) ? data : [];
      setFmpInsiderTrades(trades);
      return trades;
    } catch (err) {
      console.error("Error loading FMP insider trades:", err);
      return [];
    }
  }, []);

  // Charger toutes les données
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        alerts,
        darkpool,
        insiders,
        congress,
        institutional,
        fmpInsiders,
      ] = await Promise.all([
        loadFlowAlerts(),
        loadDarkpoolTrades(),
        loadInsiderTrades(),
        loadCongressTrades(),
        loadInstitutionalActivity(),
        loadFMPInsiderTrades(),
      ]);

      // Calculer les statistiques
      const allAlerts = [...alerts, ...darkpool];
      const totalPremium = allAlerts.reduce((sum, alert) => {
        // Flow alerts utilisent total_premium, darkpool utilise premium
        const premium = parseFloat(alert.total_premium || alert.premium || 0);
        return sum + premium;
      }, 0);

      // Trouver le ticker le plus actif
      const tickerCounts = {};
      allAlerts.forEach((alert) => {
        const ticker = alert.ticker || alert.ticker_symbol || "N/A";
        tickerCounts[ticker] = (tickerCounts[ticker] || 0) + 1;
      });
      const topTicker = Object.entries(tickerCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || null;

      // Trouver le plus gros trade
      const biggestTrade = allAlerts.reduce((max, alert) => {
        const premium = parseFloat(alert.total_premium || alert.premium || 0);
        const maxPremium = parseFloat(max?.total_premium || max?.premium || 0);
        return premium > maxPremium ? alert : max;
      }, null);

      setStats({
        totalAlerts: allAlerts.length,
        totalPremium,
        topTicker,
        biggestTrade,
      });
    } catch (err) {
      console.error("Error loading whale data:", err);
      setError(err.message || "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }, [
    loadFlowAlerts,
    loadDarkpoolTrades,
    loadInsiderTrades,
    loadCongressTrades,
    loadInstitutionalActivity,
    loadFMPInsiderTrades,
  ]);

  // Charger les hedge funds quand on change d'onglet
  useEffect(() => {
    if (currentTab === 6) {
      loadHedgeFundActivity();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab]);

  // Auto-refresh
  useEffect(() => {
    loadAllData();
    metricsService.trackFeatureUsage("whale-tracker");

    if (autoRefresh) {
      const interval = setInterval(() => {
        loadAllData();
        // Recharger les hedge funds si on est sur l'onglet
        if (currentTab === 6) {
          loadHedgeFundActivity();
        }
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadAllData, autoRefresh, refreshInterval, currentTab]);

  // Formater le montant
  const formatCurrency = (value) => {
    if (!value) return "$0";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Colonnes pour Flow Alerts
  const flowAlertsColumns = [
    {
      Header: "Ticker",
      accessor: "ticker",
      width: "10%",
      Cell: ({ value }) => (
        <MDTypography variant="body2" fontWeight="medium" color="text">
          {value || "N/A"}
        </MDTypography>
      ),
    },
    {
      Header: "Type",
      accessor: "type",
      width: "8%",
      Cell: ({ value }) => (
        <Chip
          label={value === "call" ? "CALL" : value === "put" ? "PUT" : value || "N/A"}
          size="small"
          color={value === "call" ? "success" : "error"}
        />
      ),
    },
    {
      Header: "Premium",
      accessor: "total_premium",
      width: "12%",
      Cell: ({ value }) => (
        <MDTypography variant="body2" fontWeight="medium" color="info">
          {formatCurrency(value)}
        </MDTypography>
      ),
    },
    {
      Header: "Strike",
      accessor: "strike",
      width: "10%",
      Cell: ({ value }) => value ? `$${value}` : "N/A",
    },
    {
      Header: "Expiry",
      accessor: "expiry",
      width: "10%",
      Cell: ({ value }) => value ? new Date(value).toLocaleDateString('fr-FR') : "N/A",
    },
    {
      Header: "Volume",
      accessor: "volume",
      width: "10%",
    },
    {
      Header: "OI",
      accessor: "open_interest",
      width: "8%",
    },
    {
      Header: "Trade Count",
      accessor: "trade_count",
      width: "10%",
    },
    {
      Header: "Date",
      accessor: "created_at",
      width: "15%",
      Cell: ({ value }) => formatDate(value),
    },
  ];

  // Colonnes pour Dark Pool
  const darkpoolColumns = [
    {
      Header: "Ticker",
      accessor: "ticker",
      width: "15%",
      Cell: ({ value }) => (
        <MDTypography variant="body2" fontWeight="medium" color="text">
          {value || "N/A"}
        </MDTypography>
      ),
    },
    {
      Header: "Premium",
      accessor: "premium",
      width: "15%",
      Cell: ({ value }) => (
        <MDTypography variant="body2" fontWeight="bold" color="warning">
          {formatCurrency(value)}
        </MDTypography>
      ),
    },
    {
      Header: "Prix",
      accessor: "price",
      width: "12%",
      Cell: ({ value }) => value ? `$${parseFloat(value).toFixed(2)}` : "N/A",
    },
    {
      Header: "Volume",
      accessor: "volume",
      width: "15%",
      Cell: ({ value }) => value ? parseInt(value).toLocaleString() : "N/A",
    },
    {
      Header: "Market Center",
      accessor: "market_center",
      width: "12%",
    },
    {
      Header: "Date",
      accessor: "executed_at",
      width: "20%",
      Cell: ({ value }) => formatDate(value),
    },
  ];

  // Colonnes pour Insider Trades (Unusual Whales)
  const insiderColumns = [
    {
      Header: "Ticker",
      accessor: "ticker",
      width: "10%",
      Cell: ({ value }) => (
        <MDTypography variant="body2" fontWeight="medium" color="text">
          {value || "N/A"}
        </MDTypography>
      ),
    },
    {
      Header: "Nom",
      accessor: "owner_name",
      width: "20%",
    },
    {
      Header: "Titre",
      accessor: "officer_title",
      width: "15%",
    },
    {
      Header: "Type",
      accessor: "transaction_code",
      width: "10%",
      Cell: ({ value, row }) => {
        const isBuy = value === "A" || value === "P" || (row.original.acquisitionOrDisposition === "A");
        return (
          <Chip
            label={value || "N/A"}
            size="small"
            color={isBuy ? "success" : "error"}
          />
        );
      },
    },
    {
      Header: "Montant",
      accessor: "amount",
      width: "12%",
      Cell: ({ value }) => {
        const numValue = typeof value === "string" ? parseFloat(value) : value;
        return (
          <MDTypography variant="body2" fontWeight="medium" color={numValue > 0 ? "success.main" : "error.main"}>
            {formatCurrency(Math.abs(numValue))}
          </MDTypography>
        );
      },
    },
    {
      Header: "Shares",
      accessor: "shares_owned_after",
      width: "10%",
      Cell: ({ value }) => value ? parseInt(value).toLocaleString() : "N/A",
    },
    {
      Header: "Transaction",
      accessor: "transaction_date",
      width: "12%",
      Cell: ({ value }) => formatDate(value),
    },
    {
      Header: "Filing",
      accessor: "filing_date",
      width: "11%",
      Cell: ({ value }) => formatDate(value),
    },
    ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            🐋 Whale Tracker - Suivi des Baleines
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Surveillez les gros acteurs (institutions, insiders, congress) qui peuvent faire trembler les marchés
          </MDTypography>
        </MDBox>

        {/* Contrôles */}
        <MDBox mb={3}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <MDBox display="flex" gap={2} alignItems="center">
                <MDButton
                  variant={autoRefresh ? "gradient" : "outlined"}
                  color={autoRefresh ? "success" : "dark"}
                  size="small"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  <Icon>{autoRefresh ? "refresh" : "pause"}</Icon>
                  &nbsp;{autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
                </MDButton>
                <MDButton
                  variant="outlined"
                  color="info"
                  size="small"
                  onClick={loadAllData}
                  disabled={loading}
                >
                  <Icon>refresh</Icon>
                  &nbsp;Actualiser
                </MDButton>
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6}>
              <MDBox display="flex" justifyContent="flex-end">
                <Chip
                  label={`Refresh: ${refreshInterval}s`}
                  size="small"
                  color="info"
                  variant="outlined"
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* Statistiques */}
        {stats.totalAlerts > 0 && (
          <MDBox mb={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <MiniStatisticsCard
                  title={{ text: "Total Alertes", fontWeight: "medium" }}
                  count={stats.totalAlerts}
                  icon={{ color: "info", component: "notifications" }}
                  direction="right"
                  bgColor="white"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MiniStatisticsCard
                  title={{ text: "Premium Total", fontWeight: "medium" }}
                  count={formatCurrency(stats.totalPremium)}
                  icon={{ color: "success", component: "attach_money" }}
                  direction="right"
                  bgColor="white"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MiniStatisticsCard
                  title={{ text: "Ticker le plus actif", fontWeight: "medium" }}
                  count={stats.topTicker || "N/A"}
                  icon={{ color: "warning", component: "trending_up" }}
                  direction="right"
                  bgColor="white"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MiniStatisticsCard
                  title={{ text: "Plus gros trade", fontWeight: "medium" }}
                  count={
                    stats.biggestTrade
                      ? `${stats.biggestTrade.ticker || stats.biggestTrade.ticker_symbol || "N/A"}: ${formatCurrency(stats.biggestTrade.total_premium || stats.biggestTrade.premium)}`
                      : "N/A"
                  }
                  icon={{ color: "error", component: "show_chart" }}
                  direction="right"
                  bgColor="white"
                />
              </Grid>
            </Grid>
          </MDBox>
        )}

        {/* Erreur */}
        {error && (
          <MDBox mb={3}>
            <Alert severity="error">{error}</Alert>
          </MDBox>
        )}

        {/* Tabs */}
        <MDBox mb={3}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={currentTab}
              onChange={(e, newValue) => setCurrentTab(newValue)}
            >
              <Tab label="Flow Alerts" icon={<Icon>flash_on</Icon>} iconPosition="start" />
              <Tab label="Dark Pool" icon={<Icon>water_drop</Icon>} iconPosition="start" />
              <Tab label="Insiders (UW)" icon={<Icon>person</Icon>} iconPosition="start" />
              <Tab label="Insiders (FMP)" icon={<Icon>account_circle</Icon>} iconPosition="start" />
              <Tab label="Congress" icon={<Icon>gavel</Icon>} iconPosition="start" />
              <Tab label="Institutions" icon={<Icon>business</Icon>} iconPosition="start" />
              <Tab label="Hedge Funds" icon={<Icon>account_balance</Icon>} iconPosition="start" />
            </Tabs>
          </Box>
        </MDBox>

        {/* Contenu selon l'onglet */}
        {loading && currentTab === 0 ? (
          <MDBox p={3}>
            <LinearProgress />
          </MDBox>
        ) : (
          <>
            {/* Flow Alerts */}
            {currentTab === 0 && (
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Flow Alerts - Gros Trades Options
                  </MDTypography>
                  {flowAlerts.length > 0 ? (
                    <DataTable
                      table={{
                        columns: flowAlertsColumns,
                      rows: flowAlerts.sort(
                        (a, b) =>
                          (parseFloat(b.total_premium || b.premium || 0)) -
                          (parseFloat(a.total_premium || a.premium || 0))
                      ),
                      }}
                      canSearch={true}
                      entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
                      showTotalEntries={true}
                      pagination={{ variant: "gradient", color: "dark" }}
                      isSorted={true}
                      noEndBorder={false}
                    />
                  ) : (
                    <MDTypography variant="body2" color="text">
                      Aucune alerte de flow disponible
                    </MDTypography>
                  )}
                </MDBox>
              </Card>
            )}

            {/* Dark Pool */}
            {currentTab === 1 && (
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Dark Pool Trades - Transactions OTC
                  </MDTypography>
                  {darkpoolTrades.length > 0 ? (
                    <DataTable
                      table={{
                        columns: darkpoolColumns,
                        rows: darkpoolTrades.sort(
                          (a, b) =>
                            (parseFloat(b.premium) || 0) -
                            (parseFloat(a.premium) || 0)
                        ),
                      }}
                      canSearch={true}
                      entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
                      showTotalEntries={true}
                      pagination={{ variant: "gradient", color: "dark" }}
                      isSorted={true}
                      noEndBorder={false}
                    />
                  ) : (
                    <MDTypography variant="body2" color="text">
                      Aucun trade dark pool disponible
                    </MDTypography>
                  )}
                </MDBox>
              </Card>
            )}

            {/* Insider Trades (Unusual Whales) */}
            {currentTab === 2 && (
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Insider Transactions (Unusual Whales)
                  </MDTypography>
                  {insiderTrades.length > 0 ? (
                    <DataTable
                      table={{
                        columns: insiderColumns,
                        rows: insiderTrades.sort((a, b) => {
                          const dateA = new Date(a.transaction_date || a.filing_date || 0);
                          const dateB = new Date(b.transaction_date || b.filing_date || 0);
                          return dateB - dateA;
                        }),
                      }}
                      canSearch={true}
                      entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
                      showTotalEntries={true}
                      pagination={{ variant: "gradient", color: "dark" }}
                      isSorted={true}
                      noEndBorder={false}
                    />
                  ) : (
                    <MDTypography variant="body2" color="text">
                      Aucune transaction insider disponible
                    </MDTypography>
                  )}
                </MDBox>
              </Card>
            )}

            {/* Insider Trades (FMP) */}
            {currentTab === 3 && (
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Insider Transactions (FMP)
                  </MDTypography>
                  {fmpInsiderTrades.length > 0 ? (
                    <DataTable
                      table={{
                        columns: [
                          {
                            Header: "Symbole",
                            accessor: "symbol",
                            width: "10%",
                            Cell: ({ value }) => (
                              <MDTypography variant="body2" fontWeight="medium" color="text">
                                {value || "N/A"}
                              </MDTypography>
                            ),
                          },
                          {
                            Header: "Nom",
                            accessor: "reportingName",
                            width: "20%",
                          },
                          {
                            Header: "Type Owner",
                            accessor: "typeOfOwner",
                            width: "12%",
                          },
                          {
                            Header: "Type Transaction",
                            accessor: "transactionType",
                            width: "15%",
                            Cell: ({ value, row }) => {
                              const isBuy = value?.includes("Award") || value?.includes("Purchase") || row.original.acquisitionOrDisposition === "A";
                              return (
                                <Chip
                                  label={value || "N/A"}
                                  size="small"
                                  color={isBuy ? "success" : "error"}
                                />
                              );
                            },
                          },
                          {
                            Header: "Shares",
                            accessor: "securitiesTransacted",
                            width: "12%",
                            Cell: ({ value }) => value ? parseInt(value).toLocaleString() : "N/A",
                          },
                          {
                            Header: "Prix",
                            accessor: "price",
                            width: "10%",
                            Cell: ({ value }) => value ? `$${parseFloat(value).toFixed(2)}` : "$0",
                          },
                          {
                            Header: "Transaction",
                            accessor: "transactionDate",
                            width: "12%",
                            Cell: ({ value }) => formatDate(value),
                          },
                          {
                            Header: "Filing",
                            accessor: "filingDate",
                            width: "12%",
                            Cell: ({ value }) => formatDate(value),
                          },
                        ],
                        rows: fmpInsiderTrades.sort((a, b) => {
                          const dateA = new Date(a.transactionDate || a.filingDate || 0);
                          const dateB = new Date(b.transactionDate || b.filingDate || 0);
                          return dateB - dateA;
                        }),
                      }}
                      canSearch={true}
                      entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
                      showTotalEntries={true}
                      pagination={{ variant: "gradient", color: "dark" }}
                      isSorted={true}
                      noEndBorder={false}
                    />
                  ) : (
                    <MDTypography variant="body2" color="text">
                      Aucune transaction insider FMP disponible
                    </MDTypography>
                  )}
                </MDBox>
              </Card>
            )}

            {/* Congress Trades */}
            {currentTab === 4 && (
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Congress Trades - Transactions des Politiques
                  </MDTypography>
                  {congressTrades.length > 0 ? (
                    <DataTable
                      table={{
                        columns: [
                          {
                            Header: "Nom",
                            accessor: "name",
                            width: "18%",
                          },
                          {
                            Header: "Type",
                            accessor: "member_type",
                            width: "10%",
                            Cell: ({ value }) => (
                              <Chip
                                label={value === "senate" ? "Sénat" : value === "house" ? "Chambre" : value || "N/A"}
                                size="small"
                                color={value === "senate" ? "info" : "primary"}
                                variant="outlined"
                              />
                            ),
                          },
                          {
                            Header: "Ticker",
                            accessor: "ticker",
                            width: "10%",
                            Cell: ({ value }) => (
                              <MDTypography variant="body2" fontWeight="medium" color="text">
                                {value || "N/A"}
                              </MDTypography>
                            ),
                          },
                          {
                            Header: "Type Transaction",
                            accessor: "txn_type",
                            width: "12%",
                            Cell: ({ value }) => (
                              <Chip
                                label={value || "N/A"}
                                size="small"
                                color={value === "Buy" ? "success" : "error"}
                              />
                            ),
                          },
                          {
                            Header: "Montant",
                            accessor: "amounts",
                            width: "15%",
                            Cell: ({ value }) => (
                              <MDTypography variant="body2" fontWeight="medium" color="text">
                                {value || "N/A"}
                              </MDTypography>
                            ),
                          },
                          {
                            Header: "Issuer",
                            accessor: "issuer",
                            width: "12%",
                          },
                          {
                            Header: "Transaction",
                            accessor: "transaction_date",
                            width: "12%",
                            Cell: ({ value }) => formatDate(value),
                          },
                          {
                            Header: "Filing",
                            accessor: "filed_at_date",
                            width: "11%",
                            Cell: ({ value }) => formatDate(value),
                          },
                        ],
                        rows: congressTrades.sort((a, b) => {
                          const dateA = new Date(a.transaction_date || a.filed_at_date || 0);
                          const dateB = new Date(b.transaction_date || b.filed_at_date || 0);
                          return dateB - dateA;
                        }),
                      }}
                      canSearch={true}
                      entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
                      showTotalEntries={true}
                      pagination={{ variant: "gradient", color: "dark" }}
                      isSorted={true}
                      noEndBorder={false}
                    />
                  ) : (
                    <MDTypography variant="body2" color="text">
                      Aucune transaction du Congrès disponible
                    </MDTypography>
                  )}
                </MDBox>
              </Card>
            )}

            {/* Institutional Activity */}
            {currentTab === 5 && (
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Activité Institutionnelle - Derniers Filings
                  </MDTypography>
                  {institutionalActivity.length > 0 ? (
                    <DataTable
                      table={{
                        columns: [
                          {
                            Header: "Institution",
                            accessor: "name",
                            width: "30%",
                            Cell: ({ value, row }) => (
                              <MDBox>
                                <MDTypography variant="body2" fontWeight="medium" color="text">
                                  {value || "N/A"}
                                </MDTypography>
                                {row.original.short_name && (
                                  <MDTypography variant="caption" color="text.secondary">
                                    {row.original.short_name}
                                  </MDTypography>
                                )}
                              </MDBox>
                            ),
                          },
                          {
                            Header: "CIK",
                            accessor: "cik",
                            width: "12%",
                            Cell: ({ value }) => (
                              <MDTypography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                                {value || "N/A"}
                              </MDTypography>
                            ),
                          },
                          {
                            Header: "Hedge Fund",
                            accessor: "is_hedge_fund",
                            width: "12%",
                            Cell: ({ value }) => (
                              <Chip
                                label={value ? "Oui" : "Non"}
                                size="small"
                                color={value ? "warning" : "default"}
                                variant="outlined"
                              />
                            ),
                          },
                          {
                            Header: "Filing Date",
                            accessor: "filing_date",
                            width: "15%",
                            Cell: ({ value }) => formatDate(value),
                          },
                          {
                            Header: "Tags",
                            accessor: "tags",
                            width: "20%",
                            Cell: ({ value }) => {
                              if (!value || !Array.isArray(value) || value.length === 0) return "N/A";
                              return (
                                <MDBox display="flex" gap={0.5} flexWrap="wrap">
                                  {value.slice(0, 3).map((tag, idx) => (
                                    <Chip key={idx} label={tag} size="small" variant="outlined" />
                                  ))}
                                  {value.length > 3 && (
                                    <Chip label={`+${value.length - 3}`} size="small" />
                                  )}
                                </MDBox>
                              );
                            },
                          },
                        ],
                        rows: institutionalActivity.sort((a, b) => {
                          const dateA = new Date(a.filing_date || 0);
                          const dateB = new Date(b.filing_date || 0);
                          return dateB - dateA;
                        }),
                      }}
                      canSearch={true}
                      entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
                      showTotalEntries={true}
                      pagination={{ variant: "gradient", color: "dark" }}
                      isSorted={true}
                      noEndBorder={false}
                    />
                  ) : (
                    <MDTypography variant="body2" color="text">
                      Aucune activité institutionnelle disponible
                    </MDTypography>
                  )}
                </MDBox>
              </Card>
            )}

            {/* Hedge Funds */}
            {currentTab === 6 && (
              <>
                <MDBox mb={3}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <MDTypography variant="h6" fontWeight="medium" mb={1}>
                        🏦 Hedge Funds - Top 20 + Notables
                      </MDTypography>
                      <MDTypography variant="body2" color="text.secondary">
                        Suivi de l&apos;activité des plus grands hedge funds du monde
                      </MDTypography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDBox display="flex" justifyContent="flex-end" alignItems="center" height="100%">
                        <Chip
                          label={`${hedgeFundActivity.length} hedge fund(s) actif(s)`}
                          color="info"
                          size="medium"
                        />
                      </MDBox>
                    </Grid>
                  </Grid>
                </MDBox>

                {/* Liste des Top 20 Hedge Funds */}
                <Card sx={{ mb: 3 }}>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Top 20 Hedge Funds (par AUM - Juin 2024)
                    </MDTypography>
                    <DataTable
                      table={{
                        columns: [
                          {
                            Header: "Rang",
                            accessor: "rank",
                            width: "8%",
                            Cell: ({ row }) => (
                              <MDTypography variant="body2" fontWeight="bold" color="text">
                                #{row.index + 1}
                              </MDTypography>
                            ),
                          },
                          {
                            Header: "Nom",
                            accessor: "name",
                            width: "40%",
                            Cell: ({ value, row }) => (
                              <MDBox>
                                <MDTypography variant="body2" fontWeight="medium" color="text">
                                  {value}
                                </MDTypography>
                                <MDTypography variant="caption" color="text.secondary">
                                  {row.original.location}
                                </MDTypography>
                              </MDBox>
                            ),
                          },
                          {
                            Header: "AUM",
                            accessor: "aum",
                            width: "15%",
                            Cell: ({ value }) => (
                              <MDTypography variant="body2" fontWeight="bold" color="success.main">
                                ${(value / 1000).toFixed(1)}B
                              </MDTypography>
                            ),
                          },
                          {
                            Header: "Actions",
                            width: "15%",
                            Cell: ({ row }) => (
                              <MDButton
                                variant="outlined"
                                color="info"
                                size="small"
                                onClick={() => {
                                  setSelectedHedgeFund(row.original.name);
                                  loadHedgeFundHoldings(row.original.name);
                                }}
                              >
                                <Icon>visibility</Icon>&nbsp;Holdings
                              </MDButton>
                            ),
                          },
                        ],
                        rows: HEDGE_FUNDS.top20,
                      }}
                      canSearch={true}
                      entriesPerPage={{ defaultValue: 10, entries: [5, 10, 20] }}
                      showTotalEntries={true}
                      pagination={{ variant: "gradient", color: "dark" }}
                      isSorted={true}
                      noEndBorder={false}
                    />
                  </MDBox>
                </Card>

                {/* Activité récente des Hedge Funds */}
                <Card sx={{ mb: 3 }}>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Activité Récente des Hedge Funds
                    </MDTypography>
                    {hedgeFundActivity.length > 0 ? (
                      <DataTable
                        table={{
                          columns: [
                            {
                              Header: "Hedge Fund",
                              accessor: "name",
                              width: "35%",
                              Cell: ({ value, row }) => (
                                <MDBox>
                                  <MDTypography variant="body2" fontWeight="medium" color="text">
                                    {value || "N/A"}
                                  </MDTypography>
                                  {row.original.short_name && (
                                    <MDTypography variant="caption" color="text.secondary">
                                      {row.original.short_name}
                                    </MDTypography>
                                  )}
                                </MDBox>
                              ),
                            },
                            {
                              Header: "CIK",
                              accessor: "cik",
                              width: "12%",
                              Cell: ({ value }) => (
                                <MDTypography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                                  {value || "N/A"}
                                </MDTypography>
                              ),
                            },
                            {
                              Header: "Hedge Fund",
                              accessor: "is_hedge_fund",
                              width: "12%",
                              Cell: ({ value }) => (
                                <Chip
                                  label={value ? "Oui" : "Non"}
                                  size="small"
                                  color={value ? "warning" : "default"}
                                  variant="outlined"
                                />
                              ),
                            },
                            {
                              Header: "Filing Date",
                              accessor: "filing_date",
                              width: "15%",
                              Cell: ({ value }) => formatDate(value),
                            },
                            {
                              Header: "Actions",
                              width: "15%",
                              Cell: ({ row }) => (
                                <MDButton
                                  variant="outlined"
                                  color="info"
                                  size="small"
                                  onClick={() => {
                                    setSelectedHedgeFund(row.original.name);
                                    loadHedgeFundHoldings(row.original.name);
                                  }}
                                >
                                  <Icon>visibility</Icon>&nbsp;Détails
                                </MDButton>
                              ),
                            },
                          ],
                          rows: hedgeFundActivity.sort((a, b) => {
                            const dateA = new Date(a.filing_date || 0);
                            const dateB = new Date(b.filing_date || 0);
                            return dateB - dateA;
                          }),
                        }}
                        canSearch={true}
                        entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
                        showTotalEntries={true}
                        pagination={{ variant: "gradient", color: "dark" }}
                        isSorted={true}
                        noEndBorder={false}
                      />
                    ) : (
                      <MDTypography variant="body2" color="text">
                        Aucune activité de hedge fund détectée récemment. Les données sont filtrées depuis les filings institutionnels.
                      </MDTypography>
                    )}
                  </MDBox>
                </Card>

                {/* Holdings d'un hedge fund sélectionné */}
                {selectedHedgeFund && (
                  <Card>
                    <MDBox p={3}>
                      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <MDTypography variant="h6" fontWeight="medium">
                          Holdings de {selectedHedgeFund}
                        </MDTypography>
                        <MDButton
                          variant="outlined"
                          color="dark"
                          size="small"
                          onClick={() => {
                            setSelectedHedgeFund(null);
                            setHedgeFundHoldings({ activity: [], holdings: [] });
                          }}
                        >
                          <Icon>close</Icon>
                        </MDButton>
                      </MDBox>
                      {loading ? (
                        <LinearProgress />
                      ) : hedgeFundHoldings.holdings && hedgeFundHoldings.holdings.length > 0 ? (
                        <DataTable
                          table={{
                            columns: [
                              {
                                Header: "Ticker",
                                accessor: "ticker",
                                width: "12%",
                                Cell: ({ value }) => (
                                  <MDTypography variant="body2" fontWeight="medium" color="text">
                                    {value || "N/A"}
                                  </MDTypography>
                                ),
                              },
                              {
                                Header: "Nom",
                                accessor: "name",
                                width: "30%",
                              },
                              {
                                Header: "Shares",
                                accessor: "shares",
                                width: "15%",
                                Cell: ({ value }) => value ? parseInt(value).toLocaleString() : "N/A",
                              },
                              {
                                Header: "Valeur",
                                accessor: "value",
                                width: "15%",
                                Cell: ({ value }) => formatCurrency(value),
                              },
                              {
                                Header: "% Portfolio",
                                accessor: "weight",
                                width: "12%",
                                Cell: ({ value }) => value ? `${parseFloat(value).toFixed(2)}%` : "N/A",
                              },
                              {
                                Header: "Date",
                                accessor: "date",
                                width: "12%",
                                Cell: ({ value }) => formatDate(value),
                              },
                            ],
                            rows: hedgeFundHoldings.holdings.sort((a, b) => {
                              const valueA = parseFloat(a.value || 0);
                              const valueB = parseFloat(b.value || 0);
                              return valueB - valueA;
                            }),
                          }}
                          canSearch={true}
                          entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
                          showTotalEntries={true}
                          pagination={{ variant: "gradient", color: "dark" }}
                          isSorted={true}
                          noEndBorder={false}
                        />
                      ) : (
                        <MDTypography variant="body2" color="text">
                          Aucun holding disponible pour {selectedHedgeFund}. Les données peuvent ne pas être disponibles via l&apos;API.
                        </MDTypography>
                      )}
                    </MDBox>
                  </Card>
                )}
              </>
            )}
          </>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TradingWhaleTracker;

