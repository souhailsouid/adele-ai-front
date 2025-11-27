/**
 * Trading Dashboard - Unusual Whales Data
 */

import { useState, useEffect, useCallback } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import LinearProgress from "@mui/material/LinearProgress";

// Services
import unusualWhalesClient from "/lib/unusual-whales/client";
import metricsService from "/services/metricsService";

// Composants
import FlowAlerts from "/pagesComponents/dashboards/trading/components/FlowAlerts";
import DarkpoolTrades from "/pagesComponents/dashboards/trading/components/DarkpoolTrades";
import TopNetImpact from "/pagesComponents/dashboards/trading/components/TopNetImpact";
import InsiderTransactions from "/pagesComponents/dashboards/trading/components/InsiderTransactions";
import MarketTide from "/pagesComponents/dashboards/trading/components/MarketTide";
import OIChange from "/pagesComponents/dashboards/trading/components/OIChange";
import SPIKE from "/pagesComponents/dashboards/trading/components/SPIKE";

function TradingUnusualWhales() {
    const [flowAlerts, setFlowAlerts] = useState([]);
    const [darkpoolTrades, setDarkpoolTrades] = useState([]);
    const [topNetImpact, setTopNetImpact] = useState([]);
    const [insiderTransactions, setInsiderTransactions] = useState([]);
    const [marketTide, setMarketTide] = useState(null);
    const [marketTideInterval, setMarketTideInterval] = useState("5m");
    const [oiChange, setOIChange] = useState([]);
    const [spike, setSpike] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fonction pour recharger uniquement Market Tide avec un nouvel intervalle
    const loadMarketTide = useCallback(async (interval) => {
        try {
            setError(null);
            const marketTideData = await unusualWhalesClient.getMarketTide({
                [`interval_${interval}`]: true,
            }).catch((err) => {
                console.error("Error loading market tide:", err);
                return null;
            });

            if (marketTideData) {
                if (Array.isArray(marketTideData)) {
                    setMarketTide(marketTideData);
                } else if (marketTideData.data && Array.isArray(marketTideData.data)) {
                    setMarketTide(marketTideData.data);
                } else {
                    setMarketTide([marketTideData]);
                }
            }
        } catch (err) {
            console.error("Error loading Market Tide:", err);
            setError(err.message || "Erreur lors du chargement de Market Tide");
        }
    }, []);

    const handleIntervalChange = useCallback(async (newInterval) => {
        setMarketTideInterval(newInterval);
        await loadMarketTide(newInterval);
    }, [loadMarketTide]);

    const loadUnusualWhalesData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Charger les données en parallèle
            const [
                flowAlertsData,
                darkpoolData,
                topImpactData,
                insidersData,
                marketTideData,
                oiChangeData,
                spikeData,
            ] = await Promise.all([
                unusualWhalesClient.getFlowAlerts({
                    limit: 20,
                    min_premium: 50000,
                }).catch((err) => {
                    console.error("Error loading flow alerts:", err);
                    return { data: [] };
                }),
                unusualWhalesClient.getRecentDarkpoolTrades({
                    limit: 20,
                    min_premium: 100000,
                }).catch((err) => {
                    console.error("Error loading darkpool trades:", err);
                    return { data: [] };
                }),
                unusualWhalesClient.getTopNetImpact({
                    limit: 20,
                }).catch((err) => {
                    console.error("Error loading top net impact:", err);
                    return { data: [] };
                }),
                unusualWhalesClient.getInsiderTransactions({
                    limit: 20,
                }).catch((err) => {
                    console.error("Error loading insider transactions:", err);
                    return { data: [] };
                }),
                // Market Tide avec intervalle dynamique
                unusualWhalesClient.getMarketTide({
                    [`interval_${marketTideInterval}`]: true,
                }).catch((err) => {
                    console.error("Error loading market tide:", err);
                    return null;
                }),
                unusualWhalesClient.getOIChange({
                    limit: 20,
                    order: "desc",
                }).catch((err) => {
                    console.error("Error loading OI change:", err);
                    return { data: [] };
                }),
                unusualWhalesClient.getSPIKE({}).catch((err) => {
                    console.error("Error loading SPIKE:", err);
                    return { data: [] };
                }),
            ]);

            // Extraire les données de la réponse (l'API peut retourner directement un array ou un objet avec data)
            const extractData = (response) => {
                if (Array.isArray(response)) return response;
                if (response?.data && Array.isArray(response.data)) return response.data;
                if (response?.data && !Array.isArray(response.data)) return [response.data];
                return [];
            };

            setFlowAlerts(extractData(flowAlertsData));
            setDarkpoolTrades(extractData(darkpoolData));
            setTopNetImpact(extractData(topImpactData));
            setInsiderTransactions(extractData(insidersData));

            // Market Tide retourne un objet avec un array data
            if (marketTideData) {
                if (Array.isArray(marketTideData)) {
                    setMarketTide(marketTideData);
                } else if (marketTideData.data && Array.isArray(marketTideData.data)) {
                    setMarketTide(marketTideData.data);
                } else {
                    setMarketTide([marketTideData]);
                }
            }

            setOIChange(extractData(oiChangeData));

            // SPIKE: gérer spécifiquement la structure de réponse et fallback si data est vide
            let spikeExtracted = [];
            if (spikeData) {
                if (Array.isArray(spikeData)) {
                    spikeExtracted = spikeData;
                } else if (spikeData.data && Array.isArray(spikeData.data)) {
                    spikeExtracted = spikeData.data;
                } else if (spikeData.data && !Array.isArray(spikeData.data)) {
                    spikeExtracted = [spikeData.data];
                }
            }

            // Si data est vide, essayer avec une date passée (hier, puis avant-hier)
            if (spikeExtracted.length === 0) {
                console.log("SPIKE data is empty, trying with past dates...");
                let found = false;

                // Essayer avec hier, puis avant-hier, puis jusqu'à 5 jours en arrière
                for (let daysBack = 1; daysBack <= 5 && !found; daysBack++) {
                    try {
                        const pastDate = new Date();
                        pastDate.setDate(pastDate.getDate() - daysBack);
                        const dateStr = pastDate.toISOString().split('T')[0];
                        console.log(`Trying SPIKE with date: ${dateStr}`);

                        const fallbackSpike = await unusualWhalesClient.getSPIKE({ date: dateStr });

                        if (fallbackSpike) {
                            if (Array.isArray(fallbackSpike)) {
                                if (fallbackSpike.length > 0) {
                                    spikeExtracted = fallbackSpike;
                                    found = true;
                                    console.log(`SPIKE data found for ${dateStr}, ${fallbackSpike.length} entries`);
                                }
                            } else if (fallbackSpike.data && Array.isArray(fallbackSpike.data)) {
                                if (fallbackSpike.data.length > 0) {
                                    spikeExtracted = fallbackSpike.data;
                                    found = true;
                                    console.log(`SPIKE data found for ${dateStr}, ${fallbackSpike.data.length} entries`);
                                }
                            }
                        }
                    } catch (fallbackErr) {
                        console.error(`SPIKE fallback for ${daysBack} days ago failed:`, fallbackErr);
                    }
                }

                if (!found) {
                    console.log("No SPIKE data found for any past date");
                }
            }

            setSpike(spikeExtracted);
        } catch (err) {
            console.error("Error loading Unusual Whales data:", err);
            setError(err.message || "Erreur lors du chargement des données Unusual Whales");
        } finally {
            setLoading(false);
        }
    }, [marketTideInterval]);

    useEffect(() => {
        loadUnusualWhalesData();
        metricsService.trackFeatureUsage("unusual-whales");
    }, [loadUnusualWhalesData]);


    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox py={3}>
                <MDBox mb={3}>
                    <MDTypography variant="h4" fontWeight="bold" mb={1}>
                        Unusual Whales
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                        Données de flux d&apos;options, darkpool trades, et activité institutionnelle
                    </MDTypography>
                </MDBox>


                {error && (
                    <MDBox mb={3}>
                        <MDTypography variant="body2" color="error">
                            {error}
                        </MDTypography>
                    </MDBox>
                )}

                {loading ? (
                    <MDBox>
                        <LinearProgress />
                        <MDTypography variant="body2" color="text" mt={2}>
                            Chargement des données Unusual Whales...
                        </MDTypography>
                    </MDBox>
                ) : (
                    <Grid container spacing={3}>
                        {/* Market Tide - Sentiment général */}
                        <Grid item xs={12}>
                            <MarketTide
                                data={marketTide}
                                loading={false}
                                interval={marketTideInterval}
                                onIntervalChange={handleIntervalChange}
                            />
                        </Grid>

                        {/* SPIKE - Volatilité */}
                        <Grid item xs={12} md={6}>
                            <SPIKE data={spike} loading={false} />
                        </Grid>

                        {/* OI Change - Changements d'open interest */}
                        <Grid item xs={12} md={6}>
                            <OIChange data={oiChange} loading={false} />
                        </Grid>

                        {/* Flow Alerts */}
                        <Grid item xs={12}>
                            <FlowAlerts data={flowAlerts} loading={false} />
                        </Grid>

                        {/* Top Net Impact */}
                        <Grid item xs={12} md={6}>
                            <TopNetImpact data={topNetImpact} loading={false} />
                        </Grid>

                        {/* Darkpool Trades */}
                        <Grid item xs={12} md={6}>
                            <DarkpoolTrades data={darkpoolTrades} loading={false} />
                        </Grid>

                        {/* Insider Transactions */}
                        <Grid item xs={12}>
                            <InsiderTransactions data={insiderTransactions} loading={false} />
                        </Grid>
                    </Grid>
                )}
            </MDBox>
            <Footer />
        </DashboardLayout>
    );
}

export default TradingUnusualWhales;

