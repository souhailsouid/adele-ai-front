/**
 * Gamma Squeeze Detection - Détection de gamma squeeze potentiel
 * 
 * Détecte le potentiel de gamma squeeze basé sur GEX, options flow, short interest, greeks
 */

import { useState, useEffect, useCallback } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import Card from "@mui/material/Card";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import MDButton from "/components/MDButton";
import MDInput from "/components/MDInput";
import Autocomplete from "@mui/material/Autocomplete";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { formatCurrency, formatPercentage } from "/utils/formatting";
import { POPULAR_STOCKS } from "/config/stockSymbols";
import intelligenceClient from "/lib/api/intelligenceClient";
import { useRouter } from "next/router";
import { useAuth } from "/hooks/useAuth";
import withAuth from "/hocs/withAuth";
import { addToHistory } from "/utils/historyUtils";
import { isFavorite, toggleFavorite } from "/utils/favoritesUtils";
import { showSuccess, showWarning } from "/utils/notifications";
import IconButton from "@mui/material/IconButton";

function GammaSqueeze() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [symbol, setSymbol] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [gammaAnalysis, setGammaAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favorite, setFavorite] = useState(false);

  // Charger l'analyse
  const loadAnalysis = useCallback(async (ticker) => {
    if (!ticker) return;

    try {
      setLoading(true);
      setError(null);
      const response = await intelligenceClient.getGammaSqueezeAnalysis(ticker);
      
      if (response.success && response.data) {
        setGammaAnalysis(response.data);
        addToHistory(ticker, "gamma-squeeze", response.data);
        setFavorite(isFavorite(ticker));
        
        // Alerte si probabilité élevée
        if (response.data.squeezeProbability > 70) {
          showWarning(`Gamma squeeze probable (${response.data.squeezeProbability}%)`);
        }
      } else {
        throw new Error(response.error || "Erreur lors du chargement de l'analyse");
      }
    } catch (err) {
      console.error("Error loading gamma squeeze analysis:", err);
      setError(err.message || "Erreur lors du chargement de l'analyse");
      setGammaAnalysis(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Gérer la recherche
  const handleSearch = () => {
    if (symbol.trim()) {
      const ticker = symbol.trim().toUpperCase();
      setSelectedSymbol(ticker);
      loadAnalysis(ticker);
    }
  };

  // Récupérer la couleur selon le niveau de risque
  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'LOW':
        return 'success';
      case 'MEDIUM':
        return 'warning';
      case 'HIGH':
        return 'error';
      case 'VERY_HIGH':
        return 'error';
      default:
        return 'default';
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
            Gamma Squeeze Detection
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Détection du potentiel de gamma squeeze (mouvement de prix explosif)
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
                  {loading ? "Chargement..." : "Analyser"}
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

        {/* Analyse */}
        {gammaAnalysis && !loading && (
          <Grid container spacing={3}>
            {/* Header */}
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <MDTypography variant="h5" fontWeight="bold">
                        {gammaAnalysis.ticker}
                      </MDTypography>
                      <MDBox display="flex" alignItems="center" mt={1} gap={1}>
                        <Chip
                          label={`Risk: ${gammaAnalysis.riskLevel || 'N/A'}`}
                          color={getRiskColor(gammaAnalysis.riskLevel)}
                          size="medium"
                        />
                        <Chip
                          label={gammaAnalysis.recommendation?.replace('_', ' ') || 'N/A'}
                          color={getRecommendationColor(gammaAnalysis.recommendation)}
                          size="medium"
                        />
                        {gammaAnalysis.timeframe && (
                          <Chip
                            label={gammaAnalysis.timeframe.replace('_', ' ')}
                            color="info"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDBox display="flex" justifyContent="flex-end" alignItems="center">
                        <MDBox textAlign="right" mr={2}>
                          <MDTypography variant="body2" color="text">
                            Squeeze Probability
                          </MDTypography>
                          <MDTypography
                            variant="h2"
                            fontWeight="bold"
                            color={gammaAnalysis.squeezeProbability > 70 ? 'error' : gammaAnalysis.squeezeProbability > 50 ? 'warning' : 'success'}
                          >
                            {gammaAnalysis.squeezeProbability}%
                          </MDTypography>
                        </MDBox>
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

            {/* Alerte si probabilité élevée */}
            {gammaAnalysis.squeezeProbability > 70 && (
              <Grid item xs={12}>
                <Alert severity="warning" icon={<Icon>warning</Icon>}>
                  <MDTypography variant="body1" fontWeight="medium">
                    Gamma Squeeze Probable!
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    La probabilité de gamma squeeze est élevée ({gammaAnalysis.squeezeProbability}%).
                    Surveillez attentivement les mouvements de prix et les niveaux de gamma.
                  </MDTypography>
                </Alert>
              </Grid>
            )}

            {/* Indicateurs */}
            {gammaAnalysis.indicators && (
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={3}>
                      Indicateurs
                    </MDTypography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <MDBox mb={2}>
                          <MDTypography variant="body2" color="text" mb={1}>
                            Gamma Exposure (GEX)
                          </MDTypography>
                          <MDTypography variant="h5" fontWeight="bold" color="info">
                            {formatCurrency(gammaAnalysis.indicators.gex)}
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <MDBox mb={2}>
                          <MDTypography variant="body2" color="text" mb={1}>
                            Call Flow Ratio
                          </MDTypography>
                          <MDTypography variant="h5" fontWeight="bold" color="success">
                            {gammaAnalysis.indicators.callFlowRatio?.toFixed(2) || 'N/A'}
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <MDBox mb={2}>
                          <MDTypography variant="body2" color="text" mb={1}>
                            Short Ratio
                          </MDTypography>
                          <MDTypography variant="h5" fontWeight="bold" color="warning">
                            {gammaAnalysis.indicators.shortRatio?.toFixed(2) || 'N/A'}
                          </MDTypography>
                        </MDBox>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <MDBox mb={2}>
                          <MDTypography variant="body2" color="text" mb={1}>
                            Gamma Level
                          </MDTypography>
                          <MDTypography variant="h5" fontWeight="bold" color="info">
                            {gammaAnalysis.indicators.gammaLevel?.toFixed(4) || 'N/A'}
                          </MDTypography>
                        </MDBox>
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

export default withAuth(GammaSqueeze);



