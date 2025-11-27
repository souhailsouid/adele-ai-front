/**
 * Trading Dashboard - Correlations
 */

import { useState, useEffect } from "react";
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
import Chip from "@mui/material/Chip";

// Services
import unusualWhalesClient from "/lib/unusual-whales/client";
import metricsService from "/services/metricsService";
import { searchStocks } from "/config/stockSymbols";

// Composants
import Correlations from "/pagesComponents/dashboards/trading/components/Correlations";

function TradingCorrelations() {
    const [tickers, setTickers] = useState([]);
    const [tickerInput, setTickerInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        metricsService.trackFeatureUsage("correlations");
    }, []);

    const handleAddTicker = () => {
        const ticker = tickerInput.trim().toUpperCase();
        if (ticker && !tickers.includes(ticker)) {
            setTickers([...tickers, ticker]);
            setTickerInput("");
        }
    };

    const handleRemoveTicker = (ticker) => {
        setTickers(tickers.filter(t => t !== ticker));
    };


    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox py={3}>
                <MDBox mb={3}>
                    <MDTypography variant="h4" fontWeight="bold" mb={1}>
                        Correlations
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                        Corrélations entre tickers (utile pour le hedging et la diversification)
                    </MDTypography>
                </MDBox>



                <MDBox mb={3}>
                    <Card>
                        <MDBox p={2}>
                            <MDBox display="flex" gap={2} alignItems="center" mb={2}>
                                <Autocomplete
                                    freeSolo
                                    options={searchStocks(tickerInput).slice(0, 10).map((stock) => stock.symbol)}
                                    value={tickerInput}
                                    onInputChange={(event, newValue) => setTickerInput(newValue || "")}
                                    renderInput={(params) => (
                                        <MDInput
                                            {...params}
                                            label="Symbole"
                                            placeholder="Ex: AAPL, TSLA"
                                            variant="standard"
                                            onKeyDown={(e) => { if (e.key === "Enter") handleAddTicker(); }}
                                        />
                                    )}
                                    sx={{ flexGrow: 1 }}
                                />
                                <MDButton variant="outlined" color="dark" onClick={handleAddTicker}>Ajouter</MDButton>
                            </MDBox>
                            {tickers.length > 0 && (
                                <MDBox display="flex" gap={1} flexWrap="wrap">
                                    {tickers.map((ticker) => (
                                        <Chip key={ticker} label={ticker} onDelete={() => handleRemoveTicker(ticker)} />
                                    ))}
                                </MDBox>
                            )}
                        </MDBox>
                    </Card>
                </MDBox>

                {error && (
                    <MDBox mb={3}>
                        <MDTypography variant="body2" color="error">{error}</MDTypography>
                    </MDBox>
                )}

                {tickers.length >= 2 ? (
                    <Correlations 
                        tickers={tickers.join(",")} 
                        onError={setError} 
                        onLoading={setLoading} 
                    />
                ) : (
                    <MDBox>
                        <MDTypography variant="body2" color="text">
                            Ajoutez au moins 2 symboles pour voir les corrélations
                        </MDTypography>
                    </MDBox>
                )}
            </MDBox>
            <Footer />
        </DashboardLayout>
    );
}

export default TradingCorrelations;

