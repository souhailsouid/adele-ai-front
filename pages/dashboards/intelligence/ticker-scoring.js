/**
 * Ticker Scoring - Score composite basé sur options, insiders, dark pool, etc.
 * 
 * Affiche :
 * - Score global 0-100
 * - Breakdown par catégorie (options, insiders, dark pool, short interest, greeks)
 * - Détails de chaque signal
 * - Recommendation
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
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { formatCurrency, formatPercentage } from "/utils/formatting";
import { POPULAR_STOCKS } from "/config/stockSymbols";
import intelligenceClient from "/lib/api/intelligenceClient";
import { useRouter } from "next/router";
import { useAuth } from "/hooks/useAuth";
import withAuth from "/hocs/withAuth";
import RadarChart from "/pagesComponents/dashboards/intelligence/components/RadarChart";
import { exportScoreToCSV } from "/utils/exportUtils";
import { addToHistory } from "/utils/historyUtils";
import { isFavorite, toggleFavorite } from "/utils/favoritesUtils";
import { showSuccess, showError } from "/utils/notifications";
import IconButton from "@mui/material/IconButton";

function TickerScoring() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [symbol, setSymbol] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [favorite, setFavorite] = useState(false);

  // Charger le score
  const loadScore = useCallback(async (ticker) => {
    if (!ticker) return;

    try {
      setLoading(true);
      setError(null);
      const response = await intelligenceClient.getTickerScore(ticker);
      
      if (response.success && response.data) {
        setScore(response.data);
        // Sauvegarder dans l'historique
        addToHistory(ticker, "score", response.data);
        // Vérifier si favori
        setFavorite(isFavorite(ticker));
      } else {
        throw new Error(response.error || "Erreur lors du chargement du score");
      }
    } catch (err) {
      console.error("Error loading score:", err);
      setError(err.message || "Erreur lors du chargement du score");
      setScore(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Gérer la recherche
  const handleSearch = () => {
    if (symbol.trim()) {
      const ticker = symbol.trim().toUpperCase();
      setSelectedSymbol(ticker);
      loadScore(ticker);
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
        return 'text';
    }
  };

  // Récupérer l'icône selon la recommandation
  const getRecommendationIcon = (recommendation) => {
    switch (recommendation) {
      case 'STRONG_BUY':
      case 'BUY':
        return 'trending_up';
      case 'HOLD':
        return 'trending_flat';
      case 'SELL':
      case 'STRONG_SELL':
        return 'trending_down';
      default:
        return 'help';
    }
  };

  // Pondérations des scores
  const weights = {
    options: 0.3,
    insiders: 0.2,
    darkPool: 0.2,
    shortInterest: 0.15,
    greeks: 0.15,
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold">
            Ticker Scoring
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Score composite 0-100 basé sur options, insiders, dark pool, short interest et greeks
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
                  {loading ? "Chargement..." : "Scorer"}
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

        {/* Score */}
        {score && !loading && (
          <Grid container spacing={3}>
            {/* Header avec score global */}
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <MDTypography variant="h5" fontWeight="bold">
                        {score.ticker}
                      </MDTypography>
                      <MDBox display="flex" alignItems="center" mt={1}>
                        <Chip
                          icon={<Icon>{getRecommendationIcon(score.recommendation)}</Icon>}
                          label={score.recommendation.replace('_', ' ')}
                          color={getRecommendationColor(score.recommendation)}
                          size="medium"
                        />
                        <MDBox ml={2}>
                          <MDTypography variant="body2" color="text">
                            Confiance: <strong>{score.confidence}%</strong>
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDBox display="flex" justifyContent="flex-end" alignItems="center">
                        <MDBox textAlign="right" mr={2}>
                          <MDTypography variant="body2" color="text">
                            Score Global
                          </MDTypography>
                          <MDTypography variant="h2" fontWeight="bold" color="info">
                            {score.overall}/100
                          </MDTypography>
                        </MDBox>
                        <MDBox>
                          <IconButton
                            color={favorite ? "error" : "default"}
                            onClick={() => {
                              const newFavorite = toggleFavorite(selectedSymbol);
                              setFavorite(newFavorite);
                              showSuccess(newFavorite ? "Ajouté aux favoris" : "Retiré des favoris");
                            }}
                            title={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                          >
                            <Icon>{favorite ? "favorite" : "favorite_border"}</Icon>
                          </IconButton>
                          <IconButton
                            color="info"
                            onClick={() => {
                              try {
                                exportScoreToCSV(score, selectedSymbol);
                                showSuccess("Export CSV réussi");
                              } catch (err) {
                                showError("Erreur lors de l'export");
                              }
                            }}
                            title="Exporter en CSV"
                          >
                            <Icon>download</Icon>
                          </IconButton>
                        </MDBox>
                      </MDBox>
                    </Grid>
                  </Grid>
                </MDBox>
              </Card>
            </Grid>

            {/* Breakdown avec Graphique Radar */}
            <Grid item xs={12} md={6}>
              <RadarChart
                title="Breakdown par Catégorie"
                breakdown={score.breakdown}
                maxScore={100}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={3}>
                    Détails par Catégorie
                  </MDTypography>
                  <Grid container spacing={3}>
                    {score.breakdown && Object.entries(score.breakdown).map(([key, value]) => (
                      <Grid item xs={12} sm={6} key={key}>
                        <MDBox mb={2}>
                          <MDBox display="flex" justifyContent="space-between" mb={1}>
                            <MDTypography variant="body2" color="text" textTransform="capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()} ({Math.round(weights[key] * 100)}%)
                            </MDTypography>
                            <MDTypography variant="body2" fontWeight="medium">
                              {value}/100
                            </MDTypography>
                          </MDBox>
                          <LinearProgress
                            variant="determinate"
                            value={value}
                            color={
                              value >= 70 ? 'success' :
                              value >= 50 ? 'info' :
                              value >= 30 ? 'warning' : 'error'
                            }
                            sx={{ height: 8, borderRadius: 1 }}
                          />
                        </MDBox>
                      </Grid>
                    ))}
                  </Grid>
                </MDBox>
              </Card>
            </Grid>

            {/* Détails des signaux */}
            {score.signals && (
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Détails des Signaux
                    </MDTypography>
                    <Tabs
                      value={currentTab}
                      onChange={(e, newValue) => setCurrentTab(newValue)}
                      sx={{ mb: 3 }}
                    >
                      {Object.keys(score.signals).map((key, index) => (
                        <Tab
                          key={key}
                          label={key.replace(/([A-Z])/g, ' $1').trim()}
                          value={index}
                        />
                      ))}
                    </Tabs>
                    {Object.entries(score.signals).map(([key, signal], index) => (
                      <Box key={key} hidden={currentTab !== index}>
                        {currentTab === index && (
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <MDBox mb={2}>
                                <MDTypography variant="body2" color="text" mb={1}>
                                  <strong>Score:</strong> {signal.score}/100
                                </MDTypography>
                                {signal.interpretation && (
                                  <MDTypography variant="body2" color="text">
                                    {signal.interpretation}
                                  </MDTypography>
                                )}
                              </MDBox>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              {key === 'options' && (
                                <MDBox>
                                  <MDTypography variant="body2" color="text" mb={1}>
                                    <strong>Call Volume:</strong> {formatCurrency(signal.callVolume)}
                                  </MDTypography>
                                  <MDTypography variant="body2" color="text" mb={1}>
                                    <strong>Put Volume:</strong> {formatCurrency(signal.putVolume)}
                                  </MDTypography>
                                  <MDTypography variant="body2" color="text">
                                    <strong>Call/Put Ratio:</strong> {signal.callPutRatio?.toFixed(2) || 'N/A'}
                                  </MDTypography>
                                </MDBox>
                              )}
                              {key === 'insiders' && (
                                <MDBox>
                                  <MDTypography variant="body2" color="text" mb={1}>
                                    <strong>Buys:</strong> {signal.buys || 0}
                                  </MDTypography>
                                  <MDTypography variant="body2" color="text">
                                    <strong>Sells:</strong> {signal.sells || 0}
                                  </MDTypography>
                                </MDBox>
                              )}
                              {key === 'darkPool' && (
                                <MDBox>
                                  <MDTypography variant="body2" color="text" mb={1}>
                                    <strong>Trades:</strong> {signal.trades || 0}
                                  </MDTypography>
                                  <MDTypography variant="body2" color="text">
                                    <strong>Volume:</strong> {formatCurrency(signal.volume)}
                                  </MDTypography>
                                </MDBox>
                              )}
                              {key === 'shortInterest' && (
                                <MDBox>
                                  <MDTypography variant="body2" color="text" mb={1}>
                                    <strong>Short % of Float:</strong> {formatPercentage(signal.shortPercentOfFloat)}
                                  </MDTypography>
                                  <MDTypography variant="body2" color="text">
                                    <strong>Days to Cover:</strong> {signal.daysToCover?.toFixed(1) || 'N/A'}
                                  </MDTypography>
                                </MDBox>
                              )}
                              {key === 'greeks' && (
                                <MDBox>
                                  <MDTypography variant="body2" color="text" mb={1}>
                                    <strong>Gamma:</strong> {signal.gamma?.toFixed(4) || 'N/A'}
                                  </MDTypography>
                                  <MDTypography variant="body2" color="text">
                                    <strong>Max Pain:</strong> {formatCurrency(signal.maxPain)}
                                  </MDTypography>
                                </MDBox>
                              )}
                            </Grid>
                          </Grid>
                        )}
                      </Box>
                    ))}
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

export default withAuth(TickerScoring);

