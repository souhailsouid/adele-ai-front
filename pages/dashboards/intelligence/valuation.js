/**
 * Comprehensive Valuation - Valuation complète (DCF + Sentiment Multiplier)
 * 
 * Calcule la valeur intrinsèque ajustée en combinant DCF et sentiment de marché
 */

import { useState, useEffect, useCallback } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import MDButton from "/components/MDButton";
import MDInput from "/components/MDInput";
import Autocomplete from "@mui/material/Autocomplete";
import Alert from "@mui/material/Alert";
import { formatCurrency, formatPercentage } from "/utils/formatting";
import { POPULAR_STOCKS } from "/config/stockSymbols";
import intelligenceClient from "/lib/api/intelligenceClient";
import { useRouter } from "next/router";
import { useAuth } from "/hooks/useAuth";
import withAuth from "/hocs/withAuth";
import { addToHistory } from "/utils/historyUtils";
import { isFavorite, toggleFavorite } from "/utils/favoritesUtils";
import { showSuccess } from "/utils/notifications";
import IconButton from "@mui/material/IconButton";

function ComprehensiveValuation() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [symbol, setSymbol] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [valuation, setValuation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favorite, setFavorite] = useState(false);

  // Charger la valuation
  const loadValuation = useCallback(async (ticker) => {
    if (!ticker) return;

    try {
      setLoading(true);
      setError(null);
      const response = await intelligenceClient.getComprehensiveValuation(ticker);
      
      if (response.success && response.data) {
        setValuation(response.data);
        addToHistory(ticker, "valuation", response.data);
        setFavorite(isFavorite(ticker));
      } else {
        throw new Error(response.error || "Erreur lors du chargement de la valuation");
      }
    } catch (err) {
      console.error("Error loading valuation:", err);
      setError(err.message || "Erreur lors du chargement de la valuation");
      setValuation(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Gérer la recherche
  const handleSearch = () => {
    if (symbol.trim()) {
      const ticker = symbol.trim().toUpperCase();
      setSelectedSymbol(ticker);
      loadValuation(ticker);
    }
  };

  // Récupérer la couleur selon la recommandation
  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'STRONG_BUY':
        return 'success';
      case 'BUY':
        return 'info';
      case 'HOLD':
        return 'warning';
      case 'SELL':
        return 'error';
      case 'STRONG_SELL':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold">
            Comprehensive Valuation
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Valuation complète (DCF + Sentiment Multiplier)
          </MDTypography>
        </MDBox>

        {/* Recherche */}
        <Card sx={{ mb: 3 }}>
          <MDBox p={3}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Autocomplete
                  freeSolo
                  options={POPULAR_STOCKS.map((stock) => stock.symbol)}
                  value={symbol}
                  onInputChange={(event, newValue) => setSymbol(newValue)}
                  renderInput={(params) => (
                    <MDInput
                      {...params}
                      label="Rechercher un ticker"
                      placeholder="Ex: AAPL, TSLA, MSFT..."
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <MDButton
                  variant="gradient"
                  color="info"
                  fullWidth
                  onClick={handleSearch}
                  disabled={!symbol.trim() || loading}
                >
                  {loading ? "Chargement..." : "Valoriser"}
                </MDButton>
              </Grid>
            </Grid>
          </MDBox>
        </Card>

        {/* Loading */}
        {loading && (
          <Card>
            <MDBox p={3}>
              <Skeleton variant="text" height={40} />
              <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
            </MDBox>
          </Card>
        )}

        {/* Error */}
        {error && !loading && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Valuation */}
        {valuation && !loading && (
          <Grid container spacing={3}>
            {/* Header */}
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <MDTypography variant="h5" fontWeight="bold">
                        {valuation.ticker}
                      </MDTypography>
                      <MDBox display="flex" alignItems="center" mt={1}>
                        <Chip
                          label={valuation.recommendation?.replace('_', ' ') || 'N/A'}
                          color={getRecommendationColor(valuation.recommendation)}
                          size="medium"
                        />
                        <MDBox ml={2}>
                          <MDTypography variant="body2" color="text">
                            Confiance: <strong>{valuation.confidence}%</strong>
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDBox display="flex" justifyContent="flex-end" alignItems="center">
                        <IconButton
                          color={favorite ? "error" : "default"}
                          onClick={() => {
                            const newFavorite = toggleFavorite(selectedSymbol);
                            setFavorite(newFavorite);
                            showSuccess(newFavorite ? "Ajouté aux favoris" : "Retiré des favoris");
                          }}
                        >
                          <Icon>{favorite ? "favorite" : "favorite_border"}</Icon>
                        </IconButton>
                      </MDBox>
                    </Grid>
                  </Grid>
                </MDBox>
              </Card>
            </Grid>

            {/* Prix et Valeurs */}
            <Grid item xs={12} md={6}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={3}>
                    Prix Actuel vs Valeurs
                  </MDTypography>
                  <MDBox mb={2}>
                    <MDTypography variant="body2" color="text" mb={1}>
                      Prix Actuel
                    </MDTypography>
                    <MDTypography variant="h4" fontWeight="bold" color="dark">
                      {formatCurrency(valuation.currentPrice)}
                    </MDTypography>
                  </MDBox>
                  <MDBox mb={2}>
                    <MDTypography variant="body2" color="text" mb={1}>
                      DCF Value
                    </MDTypography>
                    <MDTypography variant="h4" fontWeight="bold" color="info">
                      {formatCurrency(valuation.fundamentalValue)}
                    </MDTypography>
                  </MDBox>
                  {valuation.leveredValue && (
                    <MDBox mb={2}>
                      <MDTypography variant="body2" color="text" mb={1}>
                        Levered DCF Value
                      </MDTypography>
                      <MDTypography variant="h4" fontWeight="bold" color="info">
                        {formatCurrency(valuation.leveredValue)}
                      </MDTypography>
                    </MDBox>
                  )}
                  <MDBox>
                    <MDTypography variant="body2" color="text" mb={1}>
                      Sentiment Multiplier
                    </MDTypography>
                    <MDTypography variant="h4" fontWeight="bold" color="warning">
                      {valuation.sentimentMultiplier?.toFixed(2) || 'N/A'}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>

            {/* Valeur Ajustée */}
            <Grid item xs={12} md={6}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={3}>
                    Valeur Ajustée
                  </MDTypography>
                  <MDBox mb={3}>
                    <MDTypography variant="body2" color="text" mb={1}>
                      Adjusted Value (DCF × Sentiment)
                    </MDTypography>
                    <MDTypography variant="h3" fontWeight="bold" color="success">
                      {formatCurrency(valuation.adjustedValue)}
                    </MDTypography>
                  </MDBox>
                  <MDBox mb={2}>
                    <MDTypography variant="body2" color="text" mb={1}>
                      Upside Potential
                    </MDTypography>
                    <MDTypography
                      variant="h4"
                      fontWeight="bold"
                      color={valuation.upside > 0 ? 'success' : 'error'}
                    >
                      {valuation.upside > 0 ? '+' : ''}{formatPercentage(valuation.upside)}
                    </MDTypography>
                  </MDBox>
                  {valuation.downside !== undefined && (
                    <MDBox>
                      <MDTypography variant="body2" color="text" mb={1}>
                        Downside Risk
                      </MDTypography>
                      <MDTypography variant="h4" fontWeight="bold" color="error">
                        {formatPercentage(valuation.downside)}
                      </MDTypography>
                    </MDBox>
                  )}
                </MDBox>
              </Card>
            </Grid>

            {/* Breakdown */}
            {valuation.breakdown && (
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Breakdown
                    </MDTypography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <MDTypography variant="body2" color="text" mb={1}>
                          <strong>DCF:</strong> {formatCurrency(valuation.breakdown.dcf)}
                        </MDTypography>
                        {valuation.breakdown.leveredDcf && (
                          <MDTypography variant="body2" color="text" mb={1}>
                            <strong>Levered DCF:</strong> {formatCurrency(valuation.breakdown.leveredDcf)}
                          </MDTypography>
                        )}
                        <MDTypography variant="body2" color="text">
                          <strong>Sentiment Adjustment:</strong> {formatPercentage(valuation.breakdown.sentimentAdjustment || 0)}
                        </MDTypography>
                      </Grid>
                    </Grid>
                  </MDBox>
                </Card>
              </Grid>
            )}
          </Grid>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default withAuth(ComprehensiveValuation);



