/**
 * Trading Dashboard - Greek Flow
 */

import { useState } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import Autocomplete from "@mui/material/Autocomplete";
import MDInput from "/components/MDInput";
import MDButton from "/components/MDButton";
import Card from "@mui/material/Card";

// Services
import metricsService from "/services/metricsService";
import { searchStocks } from "/config/stockSymbols";

// Composants
import GreekFlow from "/pagesComponents/dashboards/trading/components/GreekFlow";

function TradingGreekFlow() {
    const [selectedTicker, setSelectedTicker] = useState("");
    const [tickerInput, setTickerInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = () => {
        const ticker = tickerInput.trim().toUpperCase();
        if (ticker) {
            setSelectedTicker(ticker);
            setError(null);
            metricsService.trackFeatureUsage("greek-flow");
        }
    };

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox py={3}>
                <MDBox mb={3}>
                    <MDTypography variant="h4" fontWeight="bold" mb={1}>
                        Greek Flow
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                        Flux des grecs (delta, vega) pour un ticker spécifique
                    </MDTypography>
                </MDBox>

                <MDBox mb={3}>
                    <Card>
                        <MDBox p={2}>
                            <MDBox display="flex" gap={2} alignItems="center">
                                <Autocomplete
                                    freeSolo
                                    options={searchStocks(tickerInput).slice(0, 10).map((stock) => stock.symbol)}
                                    value={tickerInput}
                                    onInputChange={(event, newValue) => setTickerInput(newValue || "")}
                                    renderInput={(params) => (
                                        <MDInput
                                            {...params}
                                            label="Symbole"
                                            placeholder="Ex: AAPL, TSLA, MSFT"
                                            variant="standard"
                                            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                                        />
                                    )}
                                    sx={{ flexGrow: 1 }}
                                />
                                <MDButton variant="gradient" color="dark" onClick={handleSearch} disabled={loading}>
                                    Rechercher
                                </MDButton>
                            </MDBox>
                        </MDBox>
                    </Card>
                </MDBox>

                {error && (
                    <MDBox mb={3}>
                        <MDTypography variant="body2" color="error">{error}</MDTypography>
                    </MDBox>
                )}

                {selectedTicker ? (
                    <GreekFlow 
                        ticker={selectedTicker} 
                        onError={setError} 
                        onLoading={setLoading} 
                    />
                ) : (
                    <MDBox>
                        <MDTypography variant="body2" color="text">
                            Entrez un symbole pour voir le Greek Flow
                        </MDTypography>
                    </MDBox>
                )}
            </MDBox>
            <Footer />
        </DashboardLayout>
    );
}

export default TradingGreekFlow;

