/**
 * Trading Dashboard - Stock State
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

// Services
import unusualWhalesClient from "/lib/unusual-whales/client";
import metricsService from "/services/metricsService";
import { searchStocks} from "/config/stockSymbols";

// Composants
import StockState from "/pagesComponents/dashboards/trading/components/StockState";

function TradingStockState() {
  const [selectedTicker, setSelectedTicker] = useState("");
  const [tickerInput, setTickerInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    metricsService.trackFeatureUsage("stock-state");
  }, []);

  const handleSearch = () => {
    const ticker = tickerInput.trim().toUpperCase();
    if (ticker) {
      setSelectedTicker(ticker);
      setError(null);
    }
  };


  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold" mb={1}>
            Stock State
          </MDTypography>
          <MDTypography variant="body2" color="text">
            État actuel d&apos;un stock (prix, volume, etc.)
          </MDTypography>
        </MDBox>

        {/* Recherche de ticker */}
        <MDBox mb={3}>
          <Card>
            <MDBox p={2}>
              <MDBox display="flex" gap={2} alignItems="center">
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
                      placeholder="Ex: AAPL, TSLA, MSFT"
                      variant="standard"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearch();
                        }
                      }}
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
            <MDTypography variant="body2" color="error">
              {error}
            </MDTypography>
          </MDBox>
        )}

        {selectedTicker ? (
          <StockState ticker={selectedTicker} onError={setError} onLoading={setLoading} />
        ) : (
          <MDBox>
            <MDTypography variant="body2" color="text">
              Entrez un symbole pour voir l&apos;état du stock
            </MDTypography>
          </MDBox>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TradingStockState;

