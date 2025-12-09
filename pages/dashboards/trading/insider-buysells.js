/**
 * Trading Dashboard - Insider Buy/Sells (Agrégé)
 */

import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import LinearProgress from "@mui/material/LinearProgress";

// Services
import unusualWhalesClient from "/lib/unusual-whales/client";
import fmpClient from "/lib/fmp/client";
import metricsService from "/services/metricsService";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import MDInput from "/components/MDInput";
import MDButton from "/components/MDButton";
import Autocomplete from "@mui/material/Autocomplete";
import DataTable from "/examples/Tables/DataTable";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";

// Composants
import InsiderBuySells from "/pagesComponents/dashboards/trading/components/InsiderBuySells";

function TradingInsiderBuySells() {
    const [activeTab, setActiveTab] = useState(0);
    const [insiderData, setInsiderData] = useState([]);
    const [fmpInsiderData, setFmpInsiderData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingFMP, setLoadingFMP] = useState(false);
    const [error, setError] = useState(null);
    const [selectedSymbol, setSelectedSymbol] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);





    const loadInsiderBuySells = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await unusualWhalesClient.getInsiderBuySells({
                limit: 100,
            }).catch((err) => {
                console.error("Error loading insider buy/sells:", err);
                return { data: [] };
            });

            // Extraire les données
            const extractData = (response) => {
                if (Array.isArray(response)) return response;
                if (response?.data && Array.isArray(response.data)) return response.data;
                if (response?.data && !Array.isArray(response.data)) return [response.data];
                return [];
            };

            setInsiderData(extractData(data));
        } catch (err) {
            console.error("Error loading Insider Buy/Sells:", err);
            setError(err.message || "Erreur lors du chargement des données Insider Buy/Sells");
        } finally {
            setLoading(false);
        }
    };

    // Recherche d'entreprises
    const handleSearch = async (query) => {
        if (!query || query.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const results = await fmpUWClient.searchCompanyByName(query);
            setSearchResults(results.slice(0, 10));
        } catch (err) {
            console.error("Error searching companies:", err);
            setSearchResults([]);
        }
    };

    // Charger les données FMP Insider Trades
    const loadFMPInsiderTrades = async (symbol = null) => {
        try {
            setLoadingFMP(true);
            setError(null);
            const data = await fmpUWClient.getFMPInsiderTrades(symbol, 50); // Limite réduite pour plan Starter
            setFmpInsiderData(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error loading FMP insider trades:", err);
            setError(err.message || "Erreur lors du chargement des données FMP");
            setFmpInsiderData([]);
        } finally {
            setLoadingFMP(false);
        }
    };

    useEffect(() => {
        loadInsiderBuySells();
        loadFMPInsiderTrades();
        metricsService.trackFeatureUsage("insider-buysells");
    }, []);

    useEffect(() => {
        if (activeTab === 1 && selectedSymbol) {
            loadFMPInsiderTrades(selectedSymbol);
        } else if (activeTab === 1) {
            loadFMPInsiderTrades();
        }
    }, [activeTab, selectedSymbol]);


    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox py={3}>
                <MDBox mb={3}>
                    <MDTypography variant="h4" fontWeight="bold" mb={1}>
                        Insider Buy/Sells
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                        Vue d&apos;ensemble agrégée des achats et ventes d&apos;insiders
                    </MDTypography>
                </MDBox>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                    <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
                        <Tab label="Unusual Whales" icon={<Icon>account_circle</Icon>} iconPosition="start" />
                        <Tab label="FMP Insider Trades" icon={<Icon>trending_up</Icon>} iconPosition="start" />
                    </Tabs>
                </Box>

                {/* Filtre pour FMP */}
                {activeTab === 1 && (
                    <MDBox mb={3}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={6}>
                                <Autocomplete
                                    freeSolo
                                    options={searchResults.map((result) => ({
                                        label: `${result.symbol} - ${result.name}`,
                                        symbol: result.symbol,
                                    }))}
                                    onInputChange={(event, newValue) => {
                                        setSearchQuery(newValue);
                                        handleSearch(newValue);
                                    }}
                                    onChange={(event, newValue) => {
                                        if (newValue && newValue.symbol) {
                                            setSelectedSymbol(newValue.symbol);
                                            loadFMPInsiderTrades(newValue.symbol);
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <MDInput
                                            {...params}
                                            label="Rechercher une entreprise (optionnel)"
                                            placeholder="Ex: Apple, AAPL - Laisser vide pour toutes"
                                            fullWidth
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <MDInput
                                    label="Symbole"
                                    value={selectedSymbol}
                                    onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <MDButton
                                    variant="gradient"
                                    color="info"
                                    onClick={() => loadFMPInsiderTrades(selectedSymbol || null)}
                                    disabled={loadingFMP}
                                    fullWidth
                                >
                                    {selectedSymbol ? `Charger ${selectedSymbol}` : "Charger Tous"}
                                </MDButton>
                            </Grid>
                        </Grid>
                    </MDBox>
                )}


                {error && (
                    <MDBox mb={3}>
                        <MDTypography variant="body2" color="error">
                            {error}
                        </MDTypography>
                    </MDBox>
                )}

                {/* Onglet Unusual Whales */}
                {activeTab === 0 && (
                    <>
                        {loading ? (
                            <LinearProgress />
                        ) : (
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <InsiderBuySells data={insiderData} loading={loading} />
                                </Grid>
                            </Grid>
                        )}
                    </>
                )}

                {/* Onglet FMP Insider Trades */}
                {activeTab === 1 && (
                    <>
                        {loadingFMP ? (
                            <MDBox p={3}>
                                <LinearProgress />
                            </MDBox>
                        ) : fmpInsiderData && fmpInsiderData.length > 0 ? (
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Card>
                                        <MDBox p={3}>
                                            <MDTypography variant="h6" fontWeight="medium" mb={2}>
                                                Insider Trades {selectedSymbol ? `- ${selectedSymbol}` : "(Toutes les entreprises)"}
                                            </MDTypography>
                                            <DataTable
                                                table={{
                                                    columns: [
                                                        { Header: "Symbole", accessor: "symbol", width: "10%" },
                                                        { Header: "Nom", accessor: "name", width: "20%" },
                                                        { Header: "Type", accessor: "transactionType", width: "12%", Cell: ({ value }) => (
                                                            <Chip
                                                                label={value || "N/A"}
                                                                size="small"
                                                                color={value?.toLowerCase().includes("buy") || value?.toLowerCase().includes("purchase") ? "success" : value?.toLowerCase().includes("sell") ? "error" : "default"}
                                                                icon={<Icon fontSize="small">{value?.toLowerCase().includes("buy") ? "arrow_upward" : "arrow_downward"}</Icon>}
                                                            />
                                                        )},
                                                        { Header: "Titre", accessor: "title", width: "15%" },
                                                        { Header: "Date", accessor: "transactionDate", width: "12%" },
                                                        { Header: "Quantité", accessor: "securitiesTransacted", width: "12%", Cell: ({ value }) => value ? value.toLocaleString() : "N/A" },
                                                        { Header: "Prix", accessor: "price", width: "10%", Cell: ({ value }) => value ? `$${value.toFixed(2)}` : "N/A" },
                                                        { Header: "Valeur", accessor: "value", width: "12%", Cell: ({ value }) => value ? `$${(value / 1000).toFixed(2)}K` : "N/A" },
                                                    ],
                                                    rows: fmpInsiderData,
                                                }}
                                                canSearch={true}
                                                entriesPerPage={{ defaultValue: 25, entries: [10, 25, 50, 100] }}
                                                showTotalEntries={true}
                                                pagination={{ variant: "gradient", color: "dark" }}
                                                isSorted={true}
                                                noEndBorder={false}
                                            />
                                        </MDBox>
                                    </Card>
                                </Grid>
                            </Grid>
                        ) : (
                            <MDBox p={3}>
                                <MDTypography variant="body2" color="text">
                                    {selectedSymbol ? `Aucune transaction insider trouvée pour ${selectedSymbol}` : "Aucune transaction insider trouvée"}
                                </MDTypography>
                            </MDBox>
                        )}
                    </>
                )}
            </MDBox>
            <Footer />
        </DashboardLayout>
    );
}

export default withAuth(TradingInsiderBuySells);

