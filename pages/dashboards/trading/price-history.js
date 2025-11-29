/**
 * Trading Dashboard - Historique des Prix
 * Affiche l'historique des prix d'une action sur plusieurs années
 */

import { useState, useEffect, useMemo } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import LinearProgress from "@mui/material/LinearProgress";
import Autocomplete from "@mui/material/Autocomplete";
import MDInput from "/components/MDInput";
import MDButton from "/components/MDButton";
import Card from "@mui/material/Card";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";

// Services
import fmpClient from "/lib/fmp/client";
import metricsService from "/services/metricsService";
import { searchStocks } from "/config/stockSymbols";

// Composants
import DefaultLineChart from "/examples/Charts/LineCharts/DefaultLineChart";
import { formatCurrency, formatPercent } from "/pagesComponents/dashboards/trading/components/utils";

function TradingPriceHistory() {
    const [selectedTicker, setSelectedTicker] = useState("");
    const [tickerInput, setTickerInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [historicalData, setHistoricalData] = useState([]);
    const [period, setPeriod] = useState("5Y"); // 1Y, 2Y, 5Y, 10Y, MAX

    useEffect(() => {
        metricsService.trackFeatureUsage("price-history");
    }, []);

    const handleSearch = async () => {
        const ticker = tickerInput.trim().toUpperCase();
        if (!ticker) return;

        setSelectedTicker(ticker);
        setError(null);
        await loadHistoricalData(ticker);
    };

    const loadHistoricalData = async (ticker) => {
        try {
            setLoading(true);
            setError(null);

            const today = new Date();
            const fromDate = new Date();

            // Calculer la date de début selon la période
            switch (period) {
                case "1Y":
                    fromDate.setFullYear(today.getFullYear() - 1);
                    break;
                case "2Y":
                    fromDate.setFullYear(today.getFullYear() - 2);
                    break;
                case "5Y":
                    fromDate.setFullYear(today.getFullYear() - 5);
                    break;
                case "10Y":
                    fromDate.setFullYear(today.getFullYear() - 10);
                    break;
                case "MAX":
                    // Maximum disponible (généralement depuis l'IPO)
                    fromDate.setFullYear(2000); // Date arbitraire ancienne
                    break;
                default:
                    fromDate.setFullYear(today.getFullYear() - 5);
            }

            const from = fromDate.toISOString().split("T")[0];
            const to = today.toISOString().split("T")[0];

            const data = await fmpClient.getHistoricalData(ticker, null, from, to);

            if (!data || data.length === 0) {
                setError(`Aucune donnée historique disponible pour ${ticker}`);
                setHistoricalData([]);
                return;
            }

            // Trier par date (du plus ancien au plus récent pour le graphique)
            const sortedData = [...data].sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateA - dateB;
            });

            setHistoricalData(sortedData);
        } catch (err) {
            console.error("Error loading historical data:", err);
            setError(err.message || "Erreur lors du chargement des données historiques");
            setHistoricalData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedTicker) {
            loadHistoricalData(selectedTicker);
        }
    }, [period]);

    // Préparer les données pour le graphique
    const chartData = useMemo(() => {
        if (!historicalData || historicalData.length === 0) {
            return {
                labels: [],
                datasets: [],
            };
        }

        const labels = historicalData.map((item) => {
            const date = new Date(item.date);
            return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
        });

        const closePrices = historicalData.map((item) => parseFloat(item.close || 0));
        const volumes = historicalData.map((item) => parseFloat(item.volume || 0));

        // Calculer les statistiques
        const minPrice = Math.min(...closePrices);
        const maxPrice = Math.max(...closePrices);
        const firstPrice = closePrices[0];
        const lastPrice = closePrices[closePrices.length - 1];
        const totalChange = lastPrice - firstPrice;
        const totalChangePercent = firstPrice !== 0 ? ((totalChange / firstPrice) * 100) : 0;

        return {
            labels,
            datasets: [
                {
                    label: "Prix de clôture",
                    data: closePrices,
                    borderColor: totalChange >= 0 ? "rgb(75, 192, 192)" : "rgb(255, 99, 132)",
                    backgroundColor: totalChange >= 0 ? "rgba(75, 192, 192, 0.2)" : "rgba(255, 99, 132, 0.2)",
                    tension: 0.1,
                    fill: true,
                },
            ],
            stats: {
                minPrice,
                maxPrice,
                firstPrice,
                lastPrice,
                totalChange,
                totalChangePercent,
                dataPoints: historicalData.length,
            },
        };
    }, [historicalData]);

    const formatDateRange = () => {
        if (!historicalData || historicalData.length === 0) return "";
        const first = new Date(historicalData[0].date);
        const last = new Date(historicalData[historicalData.length - 1].date);
        return `${first.toLocaleDateString("fr-FR")} - ${last.toLocaleDateString("fr-FR")}`;
    };

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox py={3}>
                <MDBox mb={3}>
                    <MDTypography variant="h4" fontWeight="bold" mb={1}>
                        Historique des Prix
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                        Consultez l&apos;historique des prix d&apos;une action sur plusieurs années
                    </MDTypography>
                </MDBox>

                {/* Recherche de ticker */}
                <MDBox mb={3}>
                    <Card>
                        <MDBox p={2}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={4}>
                                    <Autocomplete
                                        freeSolo
                                        options={searchStocks(tickerInput).slice(0, 10).map((stock) => stock.symbol)}
                                        value={tickerInput}
                                        onInputChange={(event, newValue) => {
                                            setTickerInput(newValue || "");
                                        }}
                                        renderInput={(params) => (
                                            <MDInput
                                                {...params}
                                                label="Symbole"
                                                placeholder="Ex: NVDA, AAPL, TSLA"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleSearch();
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Période</InputLabel>
                                        <Select
                                            size="medium"
                                            value={period}
                                            label="Période"
                                            onChange={(e) => setPeriod(e.target.value)}
                                        >
                                            <MenuItem value="1Y">1 An</MenuItem>
                                            <MenuItem value="2Y">2 Ans</MenuItem>
                                            <MenuItem value="5Y">5 Ans</MenuItem>
                                            <MenuItem value="10Y">10 Ans</MenuItem>
                                            <MenuItem value="MAX">Maximum</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={2}>
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

                {loading && (
                    <MDBox mb={3}>
                        <LinearProgress />
                        <MDTypography variant="body2" color="text" mt={1} textAlign="center">
                            Chargement des données historiques...
                        </MDTypography>
                    </MDBox>
                )}

                {selectedTicker && historicalData.length > 0 && (
                    <>
                        {/* Statistiques */}
                        <MDBox mb={3}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card>
                                        <MDBox p={2}>
                                            <MDTypography variant="caption" color="text" display="block">
                                                Prix Actuel
                                            </MDTypography>
                                            <MDTypography variant="h6" fontWeight="bold">
                                                {formatCurrency(chartData.stats.lastPrice)}
                                            </MDTypography>
                                        </MDBox>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card>
                                        <MDBox p={2}>
                                            <MDTypography variant="caption" color="text" display="block">
                                                Variation Totale
                                            </MDTypography>
                                            <MDBox display="flex" alignItems="center" gap={1}>
                                                <MDTypography
                                                    variant="h6"
                                                    fontWeight="bold"
                                                    color={chartData.stats.totalChange >= 0 ? "success.main" : "error.main"}
                                                >
                                                    {formatCurrency(chartData.stats.totalChange)}
                                                </MDTypography>
                                                <Chip
                                                    label={formatPercent(chartData.stats.totalChangePercent)}
                                                    color={chartData.stats.totalChangePercent >= 0 ? "success" : "error"}
                                                    size="small"
                                                />
                                            </MDBox>
                                        </MDBox>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card>
                                        <MDBox p={2}>
                                            <MDTypography variant="caption" color="text" display="block">
                                                Prix Minimum
                                            </MDTypography>
                                            <MDTypography variant="h6" fontWeight="bold" color="error.main">
                                                {formatCurrency(chartData.stats.minPrice)}
                                            </MDTypography>
                                        </MDBox>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card>
                                        <MDBox p={2}>
                                            <MDTypography variant="caption" color="text" display="block">
                                                Prix Maximum
                                            </MDTypography>
                                            <MDTypography variant="h6" fontWeight="bold" color="success.main">
                                                {formatCurrency(chartData.stats.maxPrice)}
                                            </MDTypography>
                                        </MDBox>
                                    </Card>
                                </Grid>
                            </Grid>
                        </MDBox>

                        {/* Graphique */}
                        <MDBox mb={3}>
                            <Card>
                                <MDBox p={3}>
                                    <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <MDTypography variant="h6" fontWeight="medium">
                                            {selectedTicker} - Historique des Prix
                                        </MDTypography>
                                        <MDTypography variant="caption" color="text">
                                            {formatDateRange()} ({chartData.stats.dataPoints} points de données)
                                        </MDTypography>
                                    </MDBox>
                                    <Box sx={{ height: "500px", position: "relative" }}>
                                        <DefaultLineChart
                                            chart={{
                                                labels: chartData.labels,
                                                datasets: chartData.datasets,
                                            }}
                                        />
                                    </Box>
                                </MDBox>
                            </Card>
                        </MDBox>
                    </>
                )}

                {selectedTicker && !loading && historicalData.length === 0 && !error && (
                    <MDBox>
                        <Card>
                            <MDBox p={3} textAlign="center">
                                <MDTypography variant="body2" color="text">
                                    Aucune donnée disponible pour {selectedTicker}. Vérifiez que le symbole est correct.
                                </MDTypography>
                            </MDBox>
                        </Card>
                    </MDBox>
                )}

                {!selectedTicker && (
                    <MDBox>
                        <Card>
                            <MDBox p={3} textAlign="center">
                                <MDTypography variant="body2" color="text">
                                    Entrez un symbole (ex: NVDA, AAPL, TSLA) pour voir l&apos;historique des prix
                                </MDTypography>
                            </MDBox>
                        </Card>
                    </MDBox>
                )}
            </MDBox>
            <Footer />
        </DashboardLayout>
    );
}

export default TradingPriceHistory;

