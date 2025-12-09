/**
 * Ticker Insights - Vue complète de toutes les informations agrégées pour un ticker
 * 
 * Affiche toutes les données qui pourraient influencer le cours d'un ticker :
 * - Informations de l'entreprise
 * - Quote actuel
 * - Options Flow
 * - Activité institutionnelle
 * - Activité des insiders
 * - Dark Pool
 * - Earnings
 * - News
 * - Événements économiques
 * - Short Interest
 * - Métriques financières
 * - Alertes
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
import Skeleton from "@mui/material/Skeleton";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import MDButton from "/components/MDButton";
import MDInput from "/components/MDInput";
import Autocomplete from "@mui/material/Autocomplete";
import DataTable from "/examples/Tables/DataTable";
import MiniStatisticsCard from "/examples/Cards/StatisticsCards/MiniStatisticsCard";
import Alert from "@mui/material/Alert";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { formatCurrency, formatVolume, formatDate, formatPercentage } from "/utils/formatting";
import { searchStocks, POPULAR_STOCKS } from "/config/stockSymbols";
import tickerInsightsService from "/services/tickerInsightsService";
import { useRouter } from "next/router";
import { useAuth } from "/hooks/useAuth";
import withAuth from "/hocs/withAuth";
import Tooltip from "@mui/material/Tooltip";
import Paper from "@mui/material/Paper";

function TickerInsights() {
    const router = useRouter();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [symbol, setSymbol] = useState("");
    const [selectedSymbol, setSelectedSymbol] = useState(null);
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentTab, setCurrentTab] = useState(0);

    const tabs = [
        { id: "overview", label: "Vue d'ensemble" },
        { id: "institutional", label: "Institutionnel" },
        { id: "insiders", label: "Insiders" },
        { id: "options", label: "Options" },
        { id: "darkpool", label: "Dark Pool" },
        { id: "earnings", label: "Earnings" },
        { id: "news", label: "News" },
        { id: "financials", label: "Financier" },
    ];

    // Vérifier l'authentification
    useEffect(() => {
        if (!authLoading && !isAuthenticated()) {
            router.push("/authentication/sign-in?redirect=/dashboards/trading/ticker-insights");
        }
    }, [authLoading, isAuthenticated, router]);

    // Charger les insights
    const loadInsights = useCallback(async (ticker) => {
        if (!ticker) return;

        try {
            setLoading(true);
            setError(null);
            const data = await tickerInsightsService.getInsights(ticker);
            setInsights(data);
        } catch (err) {
            console.error("Error loading insights:", err);
            setError(err.message || "Erreur lors du chargement des insights");
            setInsights(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Gérer la recherche
    const handleSearch = () => {
        if (symbol.trim()) {
            setSelectedSymbol(symbol.trim().toUpperCase());
            loadInsights(symbol.trim().toUpperCase());
        }
    };

    // Gérer le changement d'onglet
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    // Rendu de la vue d'ensemble
    const renderOverview = () => {
        if (!insights) return null;

        const { companyInfo, quote, optionsFlow, institutionalActivity, insiderActivity, darkPool, earnings, shortInterest, financialMetrics, alerts } = insights || {};
        
        // Vérifier que quote existe et a au moins un prix
        const hasQuote = quote && (quote.price !== undefined || quote.close !== undefined);

        return (
            <Grid container spacing={3}>
                {/* Informations de l'entreprise */}
                {companyInfo && (
                    <Grid item xs={12} md={6}>
                        <Card>
                            <MDBox p={3}>
                                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                                    Informations de l&apos;entreprise
                                </MDTypography>
                                <MDBox>
                                    <MDTypography variant="body2" color="text" mb={1}>
                                        <strong>Nom:</strong> {companyInfo.name}
                                    </MDTypography>
                                    <MDTypography variant="body2" color="text" mb={1}>
                                        <strong>Bourse:</strong> {companyInfo.exchange}
                                    </MDTypography>
                                    {companyInfo.ceo && (
                                        <MDTypography variant="body2" color="text" mb={1}>
                                            <strong>CEO:</strong> {companyInfo.ceo}
                                        </MDTypography>
                                    )}
                                    {companyInfo.website && (
                                        <MDTypography variant="body2" color="text">
                                            <strong>Site web:</strong>{" "}
                                            <a href={companyInfo.website} target="_blank" rel="noopener noreferrer">
                                                {companyInfo.website}
                                            </a>
                                        </MDTypography>
                                    )}
                                </MDBox>
                            </MDBox>
                        </Card>
                    </Grid>
                )}

                {/* Quote */}
                {hasQuote && (
                    <Grid item xs={12} md={6}>
                        <Card>
                            <MDBox p={3}>
                                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                                    Prix actuel
                                </MDTypography>
                                <MDBox>
                                    <MDTypography variant="h4" fontWeight="bold" color={((quote.change ?? 0) >= 0) ? "success" : "error"} mb={1}>
                                        {formatCurrency(quote.price || quote.close || 0)}
                                    </MDTypography>
                                    {(quote.change !== undefined && quote.change !== null) && (
                                        <MDBox display="flex" alignItems="center" gap={1}>
                                            <MDTypography variant="body2" color={((quote.change ?? 0) >= 0) ? "success" : "error"}>
                                                {(quote.change ?? 0) >= 0 ? "+" : ""}{formatCurrency(quote.change)} {quote.changePercent !== undefined && quote.changePercent !== null && `(${(quote.changePercent ?? 0) >= 0 ? "+" : ""}${quote.changePercent.toFixed(2)}%)`}
                                            </MDTypography>
                                        </MDBox>
                                    )}
                                    <Divider sx={{ my: 2 }} />
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <MDTypography variant="caption" color="text" fontWeight="medium">
                                                Volume
                                            </MDTypography>
                                            <MDTypography variant="body2" color="text">
                                                {formatVolume(quote.volume || 0)}
                                            </MDTypography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <MDTypography variant="caption" color="text" fontWeight="medium">
                                                Market Cap
                                            </MDTypography>
                                            <MDTypography variant="body2" color="text">
                                                {formatCurrency(quote.marketCap || 0)}
                                            </MDTypography>
                                        </Grid>
                                        {quote.dayLow && quote.dayHigh && (
                                            <>
                                                <Grid item xs={6}>
                                                    <MDTypography variant="caption" color="text" fontWeight="medium">
                                                        Jour (Low/High)
                                                    </MDTypography>
                                                    <MDTypography variant="body2" color="text">
                                                        {formatCurrency(quote.dayLow)} / {formatCurrency(quote.dayHigh)}
                                                    </MDTypography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <MDTypography variant="caption" color="text" fontWeight="medium">
                                                        Année (Low/High)
                                                    </MDTypography>
                                                    <MDTypography variant="body2" color="text">
                                                        {formatCurrency(quote.yearLow)} / {formatCurrency(quote.yearHigh)}
                                                    </MDTypography>
                                                </Grid>
                                            </>
                                        )}
                                    </Grid>
                                </MDBox>
                            </MDBox>
                        </Card>
                    </Grid>
                )}

                {/* Statistiques rapides */}
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        {institutionalActivity?.stats && (
                            <>
                                <Grid item xs={12} sm={6} md={3}>
                                    <MiniStatisticsCard
                                        title={{ text: "Institutions", fontWeight: "medium" }}
                                        count={institutionalActivity.stats.totalInstitutions || 0}
                                        percentage={{ color: "info", text: "" }}
                                        icon={{ color: "info", component: "business" }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <MiniStatisticsCard
                                        title={{ text: "Hedge Funds", fontWeight: "medium" }}
                                        count={institutionalActivity.stats.totalHedgeFunds || 0}
                                        percentage={{ color: "warning", text: "" }}
                                        icon={{ color: "warning", component: "account_balance" }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <MiniStatisticsCard
                                        title={{ text: "Activité Nette", fontWeight: "medium" }}
                                        count={institutionalActivity.stats.netActivity > 0 ? `+${institutionalActivity.stats.netActivity}` : institutionalActivity.stats.netActivity || 0}
                                        percentage={{ color: institutionalActivity.stats.netActivity > 0 ? "success" : "error", text: "" }}
                                        icon={{
                                            color: institutionalActivity.stats.netActivity > 0 ? "success" : "error",
                                            component: "trending_up"
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <MiniStatisticsCard
                                        title={{ text: "Valeur Totale", fontWeight: "medium" }}
                                        count={formatCurrency(institutionalActivity.stats.totalValue || 0)}
                                        percentage={{ color: "success", text: "" }}
                                        icon={{ color: "success", component: "attach_money" }}
                                    />
                                </Grid>
                            </>
                        )}
                        {insiderActivity?.stats && (
                            <Grid item xs={12} sm={6} md={3}>
                                <MiniStatisticsCard
                                    title={{ text: "Transactions Insiders", fontWeight: "medium" }}
                                    count={insiderActivity.stats.totalTransactions || 0}
                                    percentage={{ color: "info", text: "" }}
                                    icon={{ color: "info", component: "person" }}
                                />
                            </Grid>
                        )}
                        {optionsFlow && (
                            <Grid item xs={12} sm={6} md={3}>
                                <MiniStatisticsCard
                                    title={{ text: "Options Alerts", fontWeight: "medium" }}
                                    count={optionsFlow.totalAlerts || 0}
                                    percentage={{ color: "warning", text: "" }}
                                    icon={{ color: "warning", component: "flash_on" }}
                                />
                            </Grid>
                        )}
                        {darkPool?.stats && (
                            <Grid item xs={12} sm={6} md={3}>
                                <MiniStatisticsCard
                                    title={{ text: "Dark Pool Trades", fontWeight: "medium" }}
                                    count={darkPool.stats.totalTrades || 0}
                                    percentage={{ color: "dark", text: "" }}
                                    icon={{ color: "dark", component: "visibility_off" }}
                                />
                            </Grid>
                        )}
                    </Grid>
                </Grid>

                {/* Alertes */}
                {alerts && alerts.length > 0 && (
                    <Grid item xs={12}>
                        <Card>
                            <MDBox p={3}>
                                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                                    Alertes
                                </MDTypography>
                                {alerts.map((alert, index) => {
                                    // Mapper les severities invalides vers les valeurs valides
                                    const validSeverity = alert.severity === "medium" 
                                        ? "warning" 
                                        : (["error", "info", "success", "warning"].includes(alert.severity) 
                                            ? alert.severity 
                                            : "info");
                                    
                                    return (
                                    <Alert
                                        key={index}
                                        severity={validSeverity}
                                        sx={{ mb: 1 }}
                                    >
                                        <MDTypography variant="body2" fontWeight="medium">
                                            {alert.type}
                                        </MDTypography>
                                        <MDTypography variant="body2">
                                            {alert.message}
                                        </MDTypography>
                                        {alert.timestamp && (
                                            <MDTypography variant="caption" color="text.secondary">
                                                {formatDate(alert.timestamp)}
                                            </MDTypography>
                                        )}
                                    </Alert>
                                    );
                                })}
                            </MDBox>
                        </Card>
                    </Grid>
                )}
            </Grid>
        );
    };

    // Rendu de l'activité institutionnelle
    const renderInstitutional = () => {
        if (!insights?.institutionalActivity) return null;

        const { topHolders, recentActivity, stats } = insights.institutionalActivity;

        const holdersColumns = [
            { Header: "Institution", accessor: "name", width: "30%" },
            { Header: "Actions", accessor: "shares", width: "20%" },
            { Header: "Valeur", accessor: "value", width: "20%" },
            { Header: "Pourcentage", accessor: "percentage", width: "15%" },
            { Header: "Hedge Fund", accessor: "isHedgeFund", width: "15%" },
        ];

        const holdersRows = (topHolders || []).map((holder) => ({
            name: holder.name,
            shares: formatVolume(holder.shares || holder.units || 0),
            value: formatCurrency(holder.value || 0),
            percentage: holder.percentage ? formatPercentage(holder.percentage) : "N/A",
            isHedgeFund: holder.isHedgeFund ? "Oui" : "Non",
        }));

        const activityColumns = [
            { Header: "Institution", accessor: "institutionName", width: "25%" },
            { Header: "Type", accessor: "transactionType", width: "10%" },
            { Header: "Actions", accessor: "shares", width: "15%" },
            { Header: "Valeur", accessor: "value", width: "15%" },
            { Header: "Prix", accessor: "price", width: "10%" },
            { Header: "Date", accessor: "date", width: "15%" },
        ];

        const activityRows = (recentActivity || []).map((activity) => ({
            institutionName: activity.institutionName || activity.institution_name,
            transactionType: (
                <Chip
                    label={activity.transactionType || activity.transaction_type}
                    color={activity.transactionType === "BUY" || activity.transaction_type === "BUY" ? "success" : "error"}
                    size="small"
                />
            ),
            shares: formatVolume(Math.abs(activity.shares || activity.units_change || activity.change || 0)),
            value: formatCurrency(activity.value || 0),
            price: formatCurrency(activity.price || activity.avg_price || 0),
            date: formatDate(activity.date || activity.filing_date),
        }));

        return (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card>
                        <MDBox p={3}>
                            <MDTypography variant="h6" fontWeight="medium" mb={2}>
                                Top Détenteurs Institutionnels
                            </MDTypography>
                            {holdersRows.length > 0 ? (
                                <DataTable table={{ columns: holdersColumns, rows: holdersRows }} />
                            ) : (
                                <MDTypography variant="body2" color="text.secondary">
                                    Aucune donnée disponible
                                </MDTypography>
                            )}
                        </MDBox>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card>
                        <MDBox p={3}>
                            <MDTypography variant="h6" fontWeight="medium" mb={2}>
                                Activité Récente
                            </MDTypography>
                            {activityRows.length > 0 ? (
                                <DataTable table={{ columns: activityColumns, rows: activityRows }} />
                            ) : (
                                <MDTypography variant="body2" color="text.secondary">
                                    Aucune activité récente
                                </MDTypography>
                            )}
                        </MDBox>
                    </Card>
                </Grid>

                {stats && (
                    <Grid item xs={12}>
                        <Card>
                            <MDBox p={3}>
                                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                                    Statistiques
                                </MDTypography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDTypography variant="caption" color="text" fontWeight="medium">
                                            Total Institutions
                                        </MDTypography>
                                        <MDTypography variant="h6" color="text">
                                            {stats.totalInstitutions || 0}
                                        </MDTypography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDTypography variant="caption" color="text" fontWeight="medium">
                                            Total Hedge Funds
                                        </MDTypography>
                                        <MDTypography variant="h6" color="text">
                                            {stats.totalHedgeFunds || 0}
                                        </MDTypography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDTypography variant="caption" color="text" fontWeight="medium">
                                            Actions Totales
                                        </MDTypography>
                                        <MDTypography variant="h6" color="text">
                                            {formatVolume(stats.totalShares || 0)}
                                        </MDTypography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDTypography variant="caption" color="text" fontWeight="medium">
                                            Valeur Totale
                                        </MDTypography>
                                        <MDTypography variant="h6" color="text">
                                            {formatCurrency(stats.totalValue || 0)}
                                        </MDTypography>
                                    </Grid>
                                </Grid>
                            </MDBox>
                        </Card>
                    </Grid>
                )}
            </Grid>
        );
    };

    // Rendu de l'activité des insiders
    const renderInsiders = () => {
        if (!insights?.insiderActivity) return null;

        const { recentTransactions, stats } = insights.insiderActivity;

        const columns = [
            { Header: "Nom", accessor: "ownerName", width: "25%" },
            { Header: "Titre", accessor: "title", width: "20%" },
            { Header: "Type", accessor: "transactionType", width: "10%" },
            { Header: "Actions", accessor: "shares", width: "15%" },
            { Header: "Valeur", accessor: "value", width: "15%" },
            { Header: "Date", accessor: "date", width: "15%" },
        ];

        const rows = (recentTransactions || []).map((tx) => ({
            ownerName: tx.ownerName || tx.owner_name,
            title: tx.title || tx.officer_title || "N/A",
            transactionType: (
                <Chip
                    label={tx.transactionType || tx.transaction_code}
                    color={tx.transactionType === "BUY" || tx.transaction_code === "A" ? "success" : "error"}
                    size="small"
                />
            ),
            shares: formatVolume(Math.abs(tx.shares || tx.amount || 0)),
            value: formatCurrency(tx.value || 0),
            date: formatDate(tx.date || tx.transaction_date),
        }));

        return (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card>
                        <MDBox p={3}>
                            <MDTypography variant="h6" fontWeight="medium" mb={2}>
                                Transactions Récentes des Insiders
                            </MDTypography>
                            {rows.length > 0 ? (
                                <DataTable table={{ columns, rows }} />
                            ) : (
                                <MDTypography variant="body2" color="text.secondary">
                                    Aucune transaction récente
                                </MDTypography>
                            )}
                        </MDBox>
                    </Card>
                </Grid>

                {stats && (
                    <Grid item xs={12}>
                        <Card>
                            <MDBox p={3}>
                                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                                    Statistiques
                                </MDTypography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDTypography variant="caption" color="text" fontWeight="medium">
                                            Total Transactions
                                        </MDTypography>
                                        <MDTypography variant="h6" color="text">
                                            {stats.totalTransactions || 0}
                                        </MDTypography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDTypography variant="caption" color="text" fontWeight="medium">
                                            Achats
                                        </MDTypography>
                                        <MDTypography variant="h6" color="success">
                                            {stats.totalBuys || 0}
                                        </MDTypography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDTypography variant="caption" color="text" fontWeight="medium">
                                            Ventes
                                        </MDTypography>
                                        <MDTypography variant="h6" color="error">
                                            {stats.totalSells || 0}
                                        </MDTypography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <MDTypography variant="caption" color="text" fontWeight="medium">
                                            Activité Nette
                                        </MDTypography>
                                        <MDTypography variant="h6" color={stats.netActivity > 0 ? "success" : "error"}>
                                            {stats.netActivity > 0 ? "+" : ""}{stats.netActivity || 0}
                                        </MDTypography>
                                    </Grid>
                                </Grid>
                            </MDBox>
                        </Card>
                    </Grid>
                )}
            </Grid>
        );
    };

    // Rendu des options
    const renderOptions = () => {
        if (!insights?.optionsFlow) return null;

        const optionsFlow = insights.optionsFlow;

        return (
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <MDBox p={3}>
                            <MDTypography variant="h6" fontWeight="medium" mb={2}>
                                Options Flow - Statistiques
                            </MDTypography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <MDTypography variant="caption" color="text" fontWeight="medium">
                                        Total Alerts
                                    </MDTypography>
                                    <MDTypography variant="h6" color="text">
                                        {optionsFlow.totalAlerts || 0}
                                    </MDTypography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <MDTypography variant="caption" color="text" fontWeight="medium">
                                        Put/Call Ratio
                                    </MDTypography>
                                    <MDTypography variant="h6" color="text">
                                        {optionsFlow.putCallRatio ? optionsFlow.putCallRatio.toFixed(2) : "N/A"}
                                    </MDTypography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <MDTypography variant="caption" color="text" fontWeight="medium">
                                        Call Premium
                                    </MDTypography>
                                    <MDTypography variant="h6" color="success">
                                        {formatCurrency(optionsFlow.callPremium || 0)}
                                    </MDTypography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <MDTypography variant="caption" color="text" fontWeight="medium">
                                        Put Premium
                                    </MDTypography>
                                    <MDTypography variant="h6" color="error">
                                        {formatCurrency(optionsFlow.putPremium || 0)}
                                    </MDTypography>
                                </Grid>
                                {optionsFlow.maxPain && (
                                    <Grid item xs={12} sm={6}>
                                        <MDTypography variant="caption" color="text" fontWeight="medium">
                                            Max Pain
                                        </MDTypography>
                                        <MDTypography variant="h6" color="text">
                                            {formatCurrency(optionsFlow.maxPain)}
                                        </MDTypography>
                                    </Grid>
                                )}
                            </Grid>
                        </MDBox>
                    </Card>
                </Grid>

                {optionsFlow.greeks && (
                    <Grid item xs={12} md={6}>
                        <Card>
                            <MDBox p={3}>
                                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                                    Greeks
                                </MDTypography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <MDTypography variant="caption" color="text" fontWeight="medium">
                                            Delta
                                        </MDTypography>
                                        <MDTypography variant="body2" color="text">
                                            {optionsFlow.greeks.delta?.toFixed(4) || "N/A"}
                                        </MDTypography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <MDTypography variant="caption" color="text" fontWeight="medium">
                                            Gamma
                                        </MDTypography>
                                        <MDTypography variant="body2" color="text">
                                            {optionsFlow.greeks.gamma?.toFixed(4) || "N/A"}
                                        </MDTypography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <MDTypography variant="caption" color="text" fontWeight="medium">
                                            Theta
                                        </MDTypography>
                                        <MDTypography variant="body2" color="text">
                                            {optionsFlow.greeks.theta?.toFixed(4) || "N/A"}
                                        </MDTypography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <MDTypography variant="caption" color="text" fontWeight="medium">
                                            Vega
                                        </MDTypography>
                                        <MDTypography variant="body2" color="text">
                                            {optionsFlow.greeks.vega?.toFixed(4) || "N/A"}
                                        </MDTypography>
                                    </Grid>
                                </Grid>
                            </MDBox>
                        </Card>
                    </Grid>
                )}
            </Grid>
        );
    };

    // Rendu du dark pool
    const renderDarkPool = () => {
        if (!insights?.darkPool) return null;

        const { recentTrades, stats } = insights.darkPool;

        const columns = [
            { Header: "Date", accessor: "date", width: "20%" },
            { Header: "Volume", accessor: "volume", width: "20%" },
            { Header: "Prix", accessor: "price", width: "15%" },
            { Header: "Valeur", accessor: "value", width: "20%" },
            { Header: "Taille", accessor: "size", width: "15%" },
        ];

        const rows = (recentTrades || []).map((trade) => ({
            date: formatDate(trade.date),
            volume: formatVolume(trade.volume || 0),
            price: formatCurrency(trade.price || 0),
            value: formatCurrency(trade.value || 0),
            size: trade.size || "N/A",
        }));

        return (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card>
                        <MDBox p={3}>
                            <MDTypography variant="h6" fontWeight="medium" mb={2}>
                                Trades Dark Pool Récents
                            </MDTypography>
                            {rows.length > 0 ? (
                                <DataTable table={{ columns, rows }} />
                            ) : (
                                <MDTypography variant="body2" color="text.secondary">
                                    Aucun trade récent
                                </MDTypography>
                            )}
                        </MDBox>
                    </Card>
                </Grid>

                {stats && (
                    <Grid item xs={12}>
                        <Card>
                            <MDBox p={3}>
                                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                                    Statistiques Dark Pool
                                </MDTypography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <MDTypography variant="caption" color="text" fontWeight="medium">
                                            Total Trades
                                        </MDTypography>
                                        <MDTypography variant="h6" color="text">
                                            {stats.totalTrades || 0}
                                        </MDTypography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <MDTypography variant="caption" color="text" fontWeight="medium">
                                            Volume Total
                                        </MDTypography>
                                        <MDTypography variant="h6" color="text">
                                            {formatVolume(stats.totalVolume || 0)}
                                        </MDTypography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <MDTypography variant="caption" color="text" fontWeight="medium">
                                            Prix Moyen
                                        </MDTypography>
                                        <MDTypography variant="h6" color="text">
                                            {formatCurrency(stats.averagePrice || 0)}
                                        </MDTypography>
                                    </Grid>
                                </Grid>
                            </MDBox>
                        </Card>
                    </Grid>
                )}
            </Grid>
        );
    };

    // Rendu des earnings
    const renderEarnings = () => {
        if (!insights?.earnings) return null;

        const earnings = insights.earnings;

        return (
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <MDBox p={3}>
                            <MDTypography variant="h6" fontWeight="medium" mb={2}>
                                Derniers Earnings
                            </MDTypography>
                            {earnings.lastEarnings ? (
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <MDTypography variant="caption" color="text" fontWeight="medium">
                                            Date
                                        </MDTypography>
                                        <MDTypography variant="body2" color="text">
                                            {formatDate(earnings.lastEarningsDate)}
                                        </MDTypography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <MDTypography variant="caption" color="text" fontWeight="medium">
                                            EPS
                                        </MDTypography>
                                        <MDTypography variant="body2" color="text">
                                            {earnings.lastEarnings.eps || "N/A"}
                                        </MDTypography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <MDTypography variant="caption" color="text" fontWeight="medium">
                                            EPS Estimé
                                        </MDTypography>
                                        <MDTypography variant="body2" color="text">
                                            {earnings.lastEarnings.epsEstimated || "N/A"}
                                        </MDTypography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <MDTypography variant="caption" color="text" fontWeight="medium">
                                            Surprise
                                        </MDTypography>
                                        <MDTypography variant="body2" color={earnings.lastEarnings.surprise >= 0 ? "success" : "error"}>
                                            {earnings.lastEarnings.surprise >= 0 ? "+" : ""}{earnings.lastEarnings.surprise || 0} ({earnings.lastEarnings.surprisePercentage?.toFixed(2) || 0}%)
                                        </MDTypography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <MDTypography variant="caption" color="text" fontWeight="medium">
                                            Revenus
                                        </MDTypography>
                                        <MDTypography variant="body2" color="text">
                                            {formatCurrency(earnings.lastEarnings.revenue || 0)}
                                        </MDTypography>
                                    </Grid>
                                </Grid>
                            ) : (
                                <MDTypography variant="body2" color="text.secondary">
                                    Aucune donnée disponible
                                </MDTypography>
                            )}
                        </MDBox>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <MDBox p={3}>
                            <MDTypography variant="h6" fontWeight="medium" mb={2}>
                                Prochains Earnings
                            </MDTypography>
                            {earnings.nextEarningsDate ? (
                                <MDBox>
                                    <MDTypography variant="body2" color="text" mb={2}>
                                        <strong>Date:</strong> {formatDate(earnings.nextEarningsDate)}
                                    </MDTypography>
                                    {earnings.upcomingEarnings && earnings.upcomingEarnings.length > 0 && (
                                        <MDBox>
                                            {earnings.upcomingEarnings.map((upcoming, index) => (
                                                <MDBox key={index} mb={2}>
                                                    <MDTypography variant="caption" color="text" fontWeight="medium">
                                                        Estimations
                                                    </MDTypography>
                                                    <MDTypography variant="body2" color="text">
                                                        EPS Estimé: {upcoming.epsEstimated || "N/A"}
                                                    </MDTypography>
                                                    <MDTypography variant="body2" color="text">
                                                        Revenus Estimés: {formatCurrency(upcoming.revenueEstimated || 0)}
                                                    </MDTypography>
                                                </MDBox>
                                            ))}
                                        </MDBox>
                                    )}
                                </MDBox>
                            ) : (
                                <MDTypography variant="body2" color="text.secondary">
                                    Aucune date prévue
                                </MDTypography>
                            )}
                        </MDBox>
                    </Card>
                </Grid>
            </Grid>
        );
    };

    // Rendu des news
    const renderNews = () => {
        if (!insights?.news) return null;

        const { recentArticles, totalArticles } = insights.news;

        return (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card>
                        <MDBox p={3}>
                            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <MDTypography variant="h6" fontWeight="medium">
                                    News Récentes
                                </MDTypography>
                                <Chip label={`${totalArticles || 0} articles`} color="info" size="small" />
                            </MDBox>
                            {recentArticles && recentArticles.length > 0 ? (
                                <MDBox>
                                    {recentArticles.map((article, index) => (
                                        <MDBox key={index} mb={2} pb={2} sx={{ borderBottom: index < recentArticles.length - 1 ? 1 : 0, borderColor: "divider" }}>
                                            <MDTypography variant="h6" fontWeight="medium" mb={1}>
                                                <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                                                    {article.title}
                                                </a>
                                            </MDTypography>
                                            <MDBox display="flex" gap={2} alignItems="center">
                                                <MDTypography variant="caption" color="text.secondary">
                                                    {article.source || "Source inconnue"}
                                                </MDTypography>
                                                {article.publishedDate && (
                                                    <MDTypography variant="caption" color="text.secondary">
                                                        {formatDate(article.publishedDate)}
                                                    </MDTypography>
                                                )}
                                            </MDBox>
                                        </MDBox>
                                    ))}
                                </MDBox>
                            ) : (
                                <MDTypography variant="body2" color="text.secondary">
                                    Aucun article récent
                                </MDTypography>
                            )}
                        </MDBox>
                    </Card>
                </Grid>
            </Grid>
        );
    };

    // Rendu des métriques financières
    const renderFinancials = () => {
        if (!insights?.financialMetrics && !insights?.shortInterest) return null;

        return (
            <Grid container spacing={3}>
                {insights.financialMetrics && (
                    <Grid item xs={12} md={6}>
                        <Card>
                            <MDBox p={3}>
                                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                                    Métriques Financières
                                </MDTypography>
                                <Grid container spacing={2}>
                                    {insights.financialMetrics.peRatio && (
                                        <Grid item xs={6}>
                                            <MDTypography variant="caption" color="text" fontWeight="medium">
                                                P/E Ratio
                                            </MDTypography>
                                            <MDTypography variant="body2" color="text">
                                                {insights.financialMetrics.peRatio.toFixed(2)}
                                            </MDTypography>
                                        </Grid>
                                    )}
                                    {insights.financialMetrics.priceToBook && (
                                        <Grid item xs={6}>
                                            <MDTypography variant="caption" color="text" fontWeight="medium">
                                                Price/Book
                                            </MDTypography>
                                            <MDTypography variant="body2" color="text">
                                                {insights.financialMetrics.priceToBook.toFixed(2)}
                                            </MDTypography>
                                        </Grid>
                                    )}
                                    {insights.financialMetrics.debtToEquity !== undefined && (
                                        <Grid item xs={6}>
                                            <MDTypography variant="caption" color="text" fontWeight="medium">
                                                Debt/Equity
                                            </MDTypography>
                                            <MDTypography variant="body2" color="text">
                                                {insights.financialMetrics.debtToEquity.toFixed(2)}
                                            </MDTypography>
                                        </Grid>
                                    )}
                                    {insights.financialMetrics.returnOnEquity !== undefined && (
                                        <Grid item xs={6}>
                                            <MDTypography variant="caption" color="text" fontWeight="medium">
                                                ROE
                                            </MDTypography>
                                            <MDTypography variant="body2" color="text">
                                                {formatPercentage(insights.financialMetrics.returnOnEquity)}
                                            </MDTypography>
                                        </Grid>
                                    )}
                                </Grid>
                            </MDBox>
                        </Card>
                    </Grid>
                )}

                {insights.shortInterest && (
                    <Grid item xs={12} md={6}>
                        <Card>
                            <MDBox p={3}>
                                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                                    Short Interest
                                </MDTypography>
                                <Grid container spacing={2}>
                                    {insights.shortInterest.shortRatio && (
                                        <Grid item xs={6}>
                                            <MDTypography variant="caption" color="text" fontWeight="medium">
                                                Short Ratio
                                            </MDTypography>
                                            <MDTypography variant="body2" color="text">
                                                {insights.shortInterest.shortRatio.toFixed(2)}
                                            </MDTypography>
                                        </Grid>
                                    )}
                                    {insights.shortInterest.shortPercentOfFloat && (
                                        <Grid item xs={6}>
                                            <MDTypography variant="caption" color="text" fontWeight="medium">
                                                % du Float
                                            </MDTypography>
                                            <MDTypography variant="body2" color="text">
                                                {formatPercentage(insights.shortInterest.shortPercentOfFloat)}
                                            </MDTypography>
                                        </Grid>
                                    )}
                                    {insights.shortInterest.sharesShort && (
                                        <Grid item xs={12}>
                                            <MDTypography variant="caption" color="text" fontWeight="medium">
                                                Actions à Découvert
                                            </MDTypography>
                                            <MDTypography variant="body2" color="text">
                                                {formatVolume(insights.shortInterest.sharesShort)}
                                            </MDTypography>
                                        </Grid>
                                    )}
                                </Grid>
                            </MDBox>
                        </Card>
                    </Grid>
                )}

                {insights.economicEvents && insights.economicEvents.length > 0 && (
                    <Grid item xs={12}>
                        <Card>
                            <MDBox p={3}>
                                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                                    Événements Économiques
                                </MDTypography>
                                {insights.economicEvents.map((event, index) => (
                                    <MDBox key={index} mb={2} pb={2} sx={{ borderBottom: index < insights.economicEvents.length - 1 ? 1 : 0, borderColor: "divider" }}>
                                        <MDBox display="flex" justifyContent="space-between" alignItems="center">
                                            <MDBox>
                                                <MDTypography variant="body1" fontWeight="medium">
                                                    {event.event}
                                                </MDTypography>
                                                <MDTypography variant="caption" color="text.secondary">
                                                    {event.country || "N/A"} - {formatDate(event.date)}
                                                </MDTypography>
                                            </MDBox>
                                            <Chip
                                                label={event.impact || "N/A"}
                                                color={event.impact === "High" ? "error" : event.impact === "Medium" ? "warning" : "default"}
                                                size="small"
                                            />
                                        </MDBox>
                                    </MDBox>
                                ))}
                            </MDBox>
                        </Card>
                    </Grid>
                )}
            </Grid>
        );
    };

    // Rendu du contenu selon l'onglet
    const renderTabContent = () => {
        switch (tabs[currentTab].id) {
            case "overview":
                return renderOverview();
            case "institutional":
                return renderInstitutional();
            case "insiders":
                return renderInsiders();
            case "options":
                return renderOptions();
            case "darkpool":
                return renderDarkPool();
            case "earnings":
                return renderEarnings();
            case "news":
                return renderNews();
            case "financials":
                return renderFinancials();
            default:
                return null;
        }
    };

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox py={3}>
                <MDBox mb={3}>
                    <MDTypography variant="h4" fontWeight="bold">
                        Ticker Insights
                    </MDTypography>
                    <MDTypography variant="body2" color="text.secondary">
                        Vue complète de toutes les informations agrégées pour un ticker
                    </MDTypography>
                </MDBox>

                {/* Barre de recherche */}
                <Card sx={{ mb: 3 }}>
                    <MDBox p={3}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={8}>
                                <Autocomplete
                                    freeSolo
                                    options={searchStocks(symbol).slice(0, 20)}
                                    value={null}
                                    inputValue={symbol}
                                    onInputChange={(event, newInputValue, reason) => {
                                        if (reason !== "reset") {
                                            setSymbol(newInputValue);
                                        }
                                    }}
                                    onChange={(event, newValue) => {
                                        if (newValue && typeof newValue !== "string" && newValue.symbol) {
                                            setSymbol(newValue.symbol.toUpperCase().trim());
                                        } else if (newValue === null) {
                                            setSymbol("");
                                        }
                                    }}
                                    clearOnBlur={false}
                                    selectOnFocus={false}
                                    getOptionLabel={(option) => {
                                        if (typeof option === "string") return option;
                                        return option.symbol || option.name || "";
                                    }}
                                    renderInput={(params) => (
                                        <MDInput
                                            {...params}
                                            label="Rechercher un ticker (ex: NVDA, TSLA, AAPL)"
                                            fullWidth
                                            onKeyPress={(e) => {
                                                if (e.key === "Enter") {
                                                    handleSearch();
                                                }
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <Box component="li" {...props}>
                                            <MDBox>
                                                <MDTypography variant="body2" fontWeight="bold">
                                                    {option.symbol}
                                                </MDTypography>
                                                <MDTypography variant="caption" color="text.secondary">
                                                    {option.name}
                                                </MDTypography>
                                            </MDBox>
                                        </Box>
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <MDButton
                                    variant="gradient"
                                    color="info"
                                    fullWidth
                                    onClick={handleSearch}
                                    disabled={!symbol.trim() || loading}
                                >
                                    {loading ? "Chargement..." : "Rechercher"}
                                </MDButton>
                            </Grid>
                        </Grid>
                    </MDBox>
                </Card>

                {/* Message d'erreur */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Chargement */}
                {loading && (
                    <Card>
                        <MDBox p={3}>
                            <LinearProgress />
                            <MDTypography variant="body2" color="text.secondary" mt={2} textAlign="center">
                                Chargement des insights... Cela peut prendre quelques secondes.
                            </MDTypography>
                        </MDBox>
                    </Card>
                )}

                {/* Contenu */}
                {!loading && insights && (
                    <>
                        {/* Onglets */}
                        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                            <Tabs value={currentTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                                {tabs.map((tab, index) => (
                                    <Tab key={index} label={tab.label} />
                                ))}
                            </Tabs>
                        </Box>

                        {/* Contenu selon l'onglet */}
                        {renderTabContent()}
                    </>
                )}

                {!loading && !insights && !error && (
                    <Card>
                        <MDBox p={3} textAlign="center">
                            <MDTypography variant="body2" color="text.secondary">
                                Recherchez un symbole pour commencer
                            </MDTypography>
                        </MDBox>
                    </Card>
                )}
            </MDBox>
            <Footer />
        </DashboardLayout>
    );
}

export default withAuth(TickerInsights);

