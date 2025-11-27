/**
 * Trading Dashboard - Vue d'ensemble (données essentielles uniquement)
 */

import { useState, useEffect, useCallback } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import { useRouter } from "next/router";

// Services
import marketService from "/services/marketService";
import metricsService from "/services/metricsService";

// Composants
import MarketIndices from "/pagesComponents/dashboards/trading/components/MarketIndices";
import SectorPerformance from "/pagesComponents/dashboards/trading/components/SectorPerformance";
import EarningsToday from "/pagesComponents/dashboards/trading/components/EarningsToday";
import CompanyFilter from "/pagesComponents/dashboards/trading/components/CompanyFilter";
import SuccessMetrics from "/pagesComponents/dashboards/trading/components/SuccessMetrics";

// Config
import { getWatchlistSymbols } from "/config/watchlist";

function TradingOverview() {
  const router = useRouter();
  const [marketData, setMarketData] = useState({
    indices: [],
    sectors: [],
    earningsToday: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSymbols, setSelectedSymbols] = useState(getWatchlistSymbols());

  // Charger uniquement les données essentielles (indices, secteurs, earnings du jour)
  const loadMarketData = useCallback(async (symbols = selectedSymbols) => {
    try {
      setError(null);
      const market = await marketService.getMarketOverview(symbols);
      setMarketData(market);
    } catch (err) {
      console.error("Error loading market data:", err);
      setError(err.message || "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }, [selectedSymbols]);

  const handleFilterChange = useCallback((newSymbols) => {
    setSelectedSymbols(newSymbols);
    loadMarketData(newSymbols).catch((err) => {
      console.error("Error loading filtered data:", err);
      setError(err.message || "Erreur lors du chargement des données filtrées");
    });
  }, [loadMarketData]);


  useEffect(() => {
    loadMarketData();
    
    // Track l'utilisation de la vue d'ensemble
    metricsService.trackFeatureUsage("screener");
    
    // Rafraîchir toutes les 5 minutes (moins fréquent pour économiser les appels)
    const interval = setInterval(() => loadMarketData(), 300000);
    return () => clearInterval(interval);
  }, [loadMarketData]);

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDTypography variant="h6">Chargement...</MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDTypography variant="h6" color="error">
            Erreur: {error}
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Dashboard Trading
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Vue d&apos;ensemble du marché
          </MDTypography>
        </MDBox>

        {/* Filtre de compagnies */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12}>
            <CompanyFilter onFilterChange={handleFilterChange} />
          </Grid>
        </Grid>

        {/* Indices et Secteurs */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6}>
            <MarketIndices data={marketData.indices} />
          </Grid>
          <Grid item xs={12} md={6}>
            <SectorPerformance data={marketData.sectors} />
          </Grid>
        </Grid>

        {/* Earnings du jour */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12}>
            <EarningsToday data={marketData.earningsToday} />
          </Grid>
        </Grid>

        {/* Métriques de succès */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <SuccessMetrics />
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TradingOverview;

