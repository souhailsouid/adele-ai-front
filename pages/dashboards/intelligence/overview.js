/**
 * Intelligence Dashboard - Vue d'ensemble
 * 
 * Affiche une vue d'ensemble des fonctionnalités d'intelligence disponibles :
 * - Analyse combinée (FMP + UW)
 * - Scoring automatique
 * - Market Intelligence
 * - Surveillance
 * - Smart Money
 */

import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MDButton from "/components/MDButton";
import { useRouter } from "next/router";
import { useAuth } from "/hooks/useAuth";
import withAuth from "/hocs/withAuth";
import intelligenceClient from "/lib/api/intelligenceClient";

function IntelligenceOverview() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [marketTide, setMarketTide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger le market tide pour la vue d'ensemble
  useEffect(() => {
    const loadMarketTide = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await intelligenceClient.getMarketTide();
        if (response.success && response.data) {
          setMarketTide(response.data);
        }
      } catch (err) {
        console.error("Error loading market tide:", err);
        setError(err.message || "Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated()) {
      loadMarketTide();
    }
  }, [isAuthenticated]);

  const features = [
    {
      title: "Analyse Complète",
      description: "Analyse combinée fundamentals (FMP) + sentiment de marché (UW)",
      icon: "analytics",
      route: "/dashboards/intelligence/complete-analysis",
      color: "info",
    },
    {
      title: "Scoring Ticker",
      description: "Score composite 0-100 basé sur options, insiders, dark pool, etc.",
      icon: "star",
      route: "/dashboards/intelligence/ticker-scoring",
      color: "warning",
    },
    {
      title: "Market Intelligence",
      description: "Sector rotation et sentiment global du marché",
      icon: "trending_up",
      route: "/dashboards/intelligence/market",
      color: "success",
    },
    {
      title: "Surveillance",
      description: "Surveillance continue avec alertes automatiques",
      icon: "monitoring",
      route: "/dashboards/intelligence/surveillance",
      color: "error",
    },
    {
      title: "Smart Money",
      description: "Top hedge funds et copy trades des meilleurs gestionnaires",
      icon: "account_balance",
      route: "/dashboards/intelligence/smart-money",
      color: "primary",
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold">
            Intelligence Dashboard
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Fonctionnalités avancées combinant FMP et Unusual Whales
          </MDTypography>
        </MDBox>

        {/* Market Tide Card */}
        {marketTide && (
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Market Tide
                  </MDTypography>
                  <MDBox display="flex" alignItems="center" mb={2}>
                    <MDTypography variant="h3" fontWeight="bold" color={
                      marketTide.sentiment === 'BULLISH' ? 'success' :
                      marketTide.sentiment === 'BEARISH' ? 'error' : 'text'
                    }>
                      {marketTide.overall > 0 ? '+' : ''}{marketTide.overall.toFixed(1)}
                    </MDTypography>
                    <MDBox ml={2}>
                      <MDTypography variant="body2" color="text">
                        Sentiment: <strong>{marketTide.sentiment}</strong>
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        Volatilité: <strong>{marketTide.volatility}</strong>
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                  {marketTide.sectors && (
                    <MDBox>
                      <MDTypography variant="body2" color="text" mb={1}>
                        <strong>Secteurs les plus forts:</strong> {marketTide.sectors.strongest?.join(', ') || 'N/A'}
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        <strong>Secteurs les plus faibles:</strong> {marketTide.sectors.weakest?.join(', ') || 'N/A'}
                      </MDTypography>
                    </MDBox>
                  )}
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Features Grid */}
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card>
                <MDBox p={3}>
                  <MDBox display="flex" alignItems="center" mb={2}>
                    <MDBox
                      width="48px"
                      height="48px"
                      borderRadius="50%"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      bgColor={feature.color}
                      color="white"
                      mr={2}
                    >
                      <Icon fontSize="medium">{feature.icon}</Icon>
                    </MDBox>
                    <MDTypography variant="h6" fontWeight="medium">
                      {feature.title}
                    </MDTypography>
                  </MDBox>
                  <MDTypography variant="body2" color="text" mb={2}>
                    {feature.description}
                  </MDTypography>
                  <MDButton
                    variant="outlined"
                    color={feature.color}
                    size="small"
                    onClick={() => router.push(feature.route)}
                  >
                    Accéder
                  </MDButton>
                </MDBox>
              </Card>
            </Grid>
          ))}
        </Grid>

        {error && (
          <MDBox mt={3}>
            <MDTypography variant="body2" color="error">
              {error}
            </MDTypography>
          </MDBox>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default withAuth(IntelligenceOverview);



