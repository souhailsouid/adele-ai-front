/**
 * Trading Dashboard - Screener (Oversold Bounces & Unusual Volume)
 */

import { useState, useEffect, useCallback } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { useRouter } from "next/router";

// Services
import smartScreener from "/services/screener";
import metricsService from "/services/metricsService";
import OversoldBounces from "/pagesComponents/dashboards/trading/components/OversoldBounces";
import UnusualVolume from "/pagesComponents/dashboards/trading/components/UnusualVolume";
import CompanyFilter from "/pagesComponents/dashboards/trading/components/CompanyFilter";

// Config
import { getWatchlistSymbols } from "/config/watchlist";

function TradingScreener() {
  const router = useRouter();
  const [oversoldBounces, setOversoldBounces] = useState([]);
  const [unusualVolume, setUnusualVolume] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSymbols, setSelectedSymbols] = useState(getWatchlistSymbols());
  const [currentTab, setCurrentTab] = useState("screener");

  const loadScreenerData = useCallback(async (symbols = selectedSymbols) => {
    try {
      setError(null);
      setLoading(true);
      const [bounces, volume] = await Promise.all([
        smartScreener.findOversoldBounces(symbols),
        smartScreener.findUnusualVolume(3, symbols),
      ]);
      setOversoldBounces(bounces || []);
      setUnusualVolume(volume || []);
    } catch (err) {
      console.error("Error loading screener data:", err);
      setError(err.message || "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }, [selectedSymbols]);

  const handleFilterChange = useCallback((newSymbols) => {
    setSelectedSymbols(newSymbols);
    loadScreenerData(newSymbols).catch((err) => {
      console.error("Error loading filtered data:", err);
      setError(err.message || "Erreur lors du chargement des données filtrées");
    });
  }, [loadScreenerData]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    router.push(`/dashboards/trading/${newValue}`);
  };

  useEffect(() => {
    loadScreenerData();
    // Track l'utilisation du screener
    metricsService.trackFeatureUsage("screener");
  }, [loadScreenerData]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Screener Intelligent
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Rebonds oversold et volumes inhabituels
          </MDTypography>
        </MDBox>


        {/* Filtre de compagnies */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12}>
            <CompanyFilter onFilterChange={handleFilterChange} />
          </Grid>
        </Grid>

        {loading ? (
          <MDTypography variant="body2" color="text">
            Chargement des données...
          </MDTypography>
        ) : error ? (
          <MDTypography variant="body2" color="error">
            {error}
          </MDTypography>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <OversoldBounces data={oversoldBounces} />
            </Grid>
            <Grid item xs={12} md={6}>
              <UnusualVolume data={unusualVolume} />
            </Grid>
          </Grid>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TradingScreener;

