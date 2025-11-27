/**
 * Trading Dashboard - Opportunités Earnings
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
import smartScreener from "/services/screener";
import metricsService from "/services/metricsService";
import CompanyFilter from "/pagesComponents/dashboards/trading/components/CompanyFilter";
import EarningsOpportunities from "/pagesComponents/dashboards/trading/components/EarningsOpportunities";

// Config
import { getWatchlistSymbols } from "/config/watchlist";

function TradingEarnings() {
  const router = useRouter();
  const [earningsOpportunities, setEarningsOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEarningsData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const opportunities = await smartScreener.findEarningsOpportunities(7);
      setEarningsOpportunities(opportunities || []);
    } catch (err) {
      console.error("Error loading earnings opportunities:", err);
      setError(err.message || "Erreur lors du chargement des opportunités");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEarningsData();
    // Track l'utilisation de la page earnings
    metricsService.trackFeatureUsage("earnings");
  }, [loadEarningsData]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Opportunités Earnings
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Opportunités de trading avant les annonces de résultats
          </MDTypography>
        </MDBox>

        {loading ? (
          <MDTypography variant="body2" color="text">
            Chargement des opportunités...
          </MDTypography>
        ) : error ? (
          <MDTypography variant="body2" color="error">
            {error}
          </MDTypography>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <EarningsOpportunities data={earningsOpportunities} />
            </Grid>
          </Grid>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TradingEarnings;

