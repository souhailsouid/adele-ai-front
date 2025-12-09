/**
 * Earnings Prediction - Prédiction de surprise d'earnings
 * 
 * Prédit les surprises d'earnings avant la publication en combinant :
 * - Historique (FMP)
 * - Options flow (UW)
 * - Insiders (UW)
 * - Dark pool (UW)
 * - Analystes (FMP)
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
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import { formatCurrency, formatPercentage, formatDate } from "/utils/formatting";
import { POPULAR_STOCKS } from "/config/stockSymbols";
import intelligenceClient from "/lib/api/intelligenceClient";
import { useRouter } from "next/router";
import { useAuth } from "/hooks/useAuth";
import withAuth from "/hocs/withAuth";
import { addToHistory } from "/utils/historyUtils";
import { isFavorite, toggleFavorite } from "/utils/favoritesUtils";
import { showSuccess } from "/utils/notifications";
import IconButton from "@mui/material/IconButton";

function EarningsPrediction() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [symbol, setSymbol] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [earningsDate, setEarningsDate] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favorite, setFavorite] = useState(false);

  // Charger la prédiction
  const loadPrediction = useCallback(async (ticker, date = null) => {
    if (!ticker) return;

    try {
      setLoading(true);
      setError(null);
      const response = await intelligenceClient.getEarningsPrediction(ticker, date);
      
      if (response.success && response.data) {
        setPrediction(response.data);
        addToHistory(ticker, "earnings-prediction", response.data);
        setFavorite(isFavorite(ticker));
      } else {
        throw new Error(response.error || "Erreur lors du chargement de la prédiction");
      }
    } catch (err) {
      console.error("Error loading earnings prediction:", err);
      setError(err.message || "Erreur lors du chargement de la prédiction");
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Gérer la recherche
  const handleSearch = () => {
    if (symbol.trim()) {
      const ticker = symbol.trim().toUpperCase();
      setSelectedSymbol(ticker);
      loadPrediction(ticker, earningsDate || null);
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
            Earnings Prediction
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Prédiction de surprise d&apos;earnings basée sur options, insiders, dark pool et analystes
          </MDTypography>
        </MDBox>

        {/* Recherche */}
        <Card sx={{ mb: 3 }}>
          <MDBox p={3}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
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
                <TextField
                  fullWidth
                  type="date"
                  label="Date des Earnings (optionnel)"
                  value={earningsDate}
                  onChange={(e) => setEarningsDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <MDButton
                  variant="gradient"
                  color="info"
                  fullWidth
                  onClick={handleSearch}
                  disabled={!symbol.trim() || loading}
                >
                  {loading ? "Chargement..." : "Prédire"}
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

        {/* Prédiction */}
        {prediction && !loading && (
          <Grid container spacing={3}>
            {/* Header */}
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <MDTypography variant="h5" fontWeight="bold">
                        {prediction.ticker}
                      </MDTypography>
                      {prediction.earningsDate && (
                        <MDTypography variant="body2" color="text" mt={1}>
                          Earnings Date: {formatDate(new Date(prediction.earningsDate))}
                        </MDTypography>
                      )}
                      <MDBox display="flex" alignItems="center" mt={1}>
                        <Chip
                          label={prediction.recommendation?.replace('_', ' ') || 'N/A'}
                          color={getRecommendationColor(prediction.recommendation)}
                          size="medium"
                        />
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDBox display="flex" justifyContent="flex-end" alignItems="center">
                        <MDBox textAlign="right" mr={2}>
                          <MDTypography variant="body2" color="text">
                            Predicted Surprise
                          </MDTypography>
                          <MDTypography
                            variant="h2"
                            fontWeight="bold"
                            color={prediction.predictedSurprise > 0 ? 'success' : 'error'}
                          >
                            {prediction.predictedSurprise > 0 ? '+' : ''}{formatPercentage(prediction.predictedSurprise)}
                          </MDTypography>
                          <MDTypography variant="body2" color="text" mt={1}>
                            Confiance: <strong>{prediction.confidence}%</strong>
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

            {/* Signals */}
            {prediction.signals && (
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={3}>
                      Signaux
                    </MDTypography>
                    <Grid container spacing={3}>
                      {/* Options Signal */}
                      {prediction.signals.options && (
                        <Grid item xs={12} md={6}>
                          <Card variant="outlined">
                            <MDBox p={2}>
                              <MDTypography variant="subtitle2" fontWeight="medium" mb={1}>
                                Options
                              </MDTypography>
                              <MDBox mb={1}>
                                <LinearProgress
                                  variant="determinate"
                                  value={prediction.signals.options.score}
                                  color="info"
                                  sx={{ height: 6, borderRadius: 1 }}
                                />
                                <MDTypography variant="caption" color="text">
                                  Score: {prediction.signals.options.score}/100
                                </MDTypography>
                              </MDBox>
                              <MDTypography variant="body2" color="text" mb={1}>
                                Call Volume: {formatCurrency(prediction.signals.options.callVolume)}
                              </MDTypography>
                              <MDTypography variant="body2" color="text" mb={1}>
                                Put Volume: {formatCurrency(prediction.signals.options.putVolume)}
                              </MDTypography>
                              <MDTypography variant="body2" color="text" mb={1}>
                                Call/Put Ratio: {prediction.signals.options.callPutRatio?.toFixed(2) || 'N/A'}
                              </MDTypography>
                              <MDTypography variant="body2" color="text">
                                {prediction.signals.options.interpretation}
                              </MDTypography>
                            </MDBox>
                          </Card>
                        </Grid>
                      )}

                      {/* Insiders Signal */}
                      {prediction.signals.insiders && (
                        <Grid item xs={12} md={6}>
                          <Card variant="outlined">
                            <MDBox p={2}>
                              <MDTypography variant="subtitle2" fontWeight="medium" mb={1}>
                                Insiders
                              </MDTypography>
                              <MDBox mb={1}>
                                <LinearProgress
                                  variant="determinate"
                                  value={prediction.signals.insiders.score}
                                  color="success"
                                  sx={{ height: 6, borderRadius: 1 }}
                                />
                                <MDTypography variant="caption" color="text">
                                  Score: {prediction.signals.insiders.score}/100
                                </MDTypography>
                              </MDBox>
                              <MDTypography variant="body2" color="text" mb={1}>
                                Buys: {prediction.signals.insiders.buys || 0}
                              </MDTypography>
                              <MDTypography variant="body2" color="text" mb={1}>
                                Sells: {prediction.signals.insiders.sells || 0}
                              </MDTypography>
                              <MDTypography variant="body2" color="text">
                                {prediction.signals.insiders.interpretation}
                              </MDTypography>
                            </MDBox>
                          </Card>
                        </Grid>
                      )}

                      {/* Dark Pool Signal */}
                      {prediction.signals.darkPool && (
                        <Grid item xs={12} md={6}>
                          <Card variant="outlined">
                            <MDBox p={2}>
                              <MDTypography variant="subtitle2" fontWeight="medium" mb={1}>
                                Dark Pool
                              </MDTypography>
                              <MDBox mb={1}>
                                <LinearProgress
                                  variant="determinate"
                                  value={prediction.signals.darkPool.score}
                                  color="warning"
                                  sx={{ height: 6, borderRadius: 1 }}
                                />
                                <MDTypography variant="caption" color="text">
                                  Score: {prediction.signals.darkPool.score}/100
                                </MDTypography>
                              </MDBox>
                              <MDTypography variant="body2" color="text" mb={1}>
                                Volume: {formatCurrency(prediction.signals.darkPool.volume)}
                              </MDTypography>
                              <MDTypography variant="body2" color="text">
                                {prediction.signals.darkPool.interpretation}
                              </MDTypography>
                            </MDBox>
                          </Card>
                        </Grid>
                      )}

                      {/* Analysts Signal */}
                      {prediction.signals.analysts && (
                        <Grid item xs={12} md={6}>
                          <Card variant="outlined">
                            <MDBox p={2}>
                              <MDTypography variant="subtitle2" fontWeight="medium" mb={1}>
                                Analysts
                              </MDTypography>
                              <MDBox mb={1}>
                                <LinearProgress
                                  variant="determinate"
                                  value={prediction.signals.analysts.score}
                                  color="info"
                                  sx={{ height: 6, borderRadius: 1 }}
                                />
                                <MDTypography variant="caption" color="text">
                                  Score: {prediction.signals.analysts.score}/100
                                </MDTypography>
                              </MDBox>
                              <MDTypography variant="body2" color="text" mb={1}>
                                Upgrades: {prediction.signals.analysts.upgrades || 0}
                              </MDTypography>
                              <MDTypography variant="body2" color="text" mb={1}>
                                Downgrades: {prediction.signals.analysts.downgrades || 0}
                              </MDTypography>
                              <MDTypography variant="body2" color="text">
                                {prediction.signals.analysts.interpretation}
                              </MDTypography>
                            </MDBox>
                          </Card>
                        </Grid>
                      )}

                      {/* Historical Signal */}
                      {prediction.signals.historical && (
                        <Grid item xs={12} md={6}>
                          <Card variant="outlined">
                            <MDBox p={2}>
                              <MDTypography variant="subtitle2" fontWeight="medium" mb={1}>
                                Historical
                              </MDTypography>
                              <MDBox mb={1}>
                                <LinearProgress
                                  variant="determinate"
                                  value={prediction.signals.historical.score}
                                  color="primary"
                                  sx={{ height: 6, borderRadius: 1 }}
                                />
                                <MDTypography variant="caption" color="text">
                                  Score: {prediction.signals.historical.score}/100
                                </MDTypography>
                              </MDBox>
                              <MDTypography variant="body2" color="text" mb={1}>
                                Average Surprise: {formatPercentage(prediction.signals.historical.averageSurprise)}
                              </MDTypography>
                              <MDTypography variant="body2" color="text" mb={1}>
                                Beat Rate: {formatPercentage(prediction.signals.historical.beatRate)}
                              </MDTypography>
                              <MDTypography variant="body2" color="text">
                                {prediction.signals.historical.interpretation}
                              </MDTypography>
                            </MDBox>
                          </Card>
                        </Grid>
                      )}
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

export default withAuth(EarningsPrediction);



