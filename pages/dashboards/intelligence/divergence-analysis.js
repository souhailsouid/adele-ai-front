/**
 * Divergence Analysis - Détection de divergences fundamentals vs sentiment
 * 
 * Détecte les opportunités d'arbitrage où le sentiment ne correspond pas aux fundamentals
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
import { formatPercentage } from "/utils/formatting";
import { POPULAR_STOCKS } from "/config/stockSymbols";
import intelligenceClient from "/lib/api/intelligenceClient";
import { useRouter } from "next/router";
import { useAuth } from "/hooks/useAuth";
import withAuth from "/hocs/withAuth";
import { addToHistory } from "/utils/historyUtils";
import { isFavorite, toggleFavorite } from "/utils/favoritesUtils";
import { showSuccess } from "/utils/notifications";
import IconButton from "@mui/material/IconButton";

function DivergenceAnalysis() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [symbol, setSymbol] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favorite, setFavorite] = useState(false);

  // Charger l'analyse
  const loadAnalysis = useCallback(async (ticker) => {
    if (!ticker) return;

    try {
      setLoading(true);
      setError(null);
      const response = await intelligenceClient.getDivergenceAnalysis(ticker);
      
      if (response.success && response.data) {
        setAnalysis(response.data);
        addToHistory(ticker, "divergence", response.data);
        setFavorite(isFavorite(ticker));
      } else {
        throw new Error(response.error || "Erreur lors du chargement de l'analyse");
      }
    } catch (err) {
      console.error("Error loading divergence analysis:", err);
      setError(err.message || "Erreur lors du chargement de l'analyse");
      setAnalysis(null);
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

  // Récupérer la couleur selon le type d'opportunité
  const getOpportunityColor = (type) => {
    if (type === 'buy') return 'success';
    if (type === 'sell') return 'error';
    return 'warning';
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold">
            Divergence Analysis
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Détection d{`'`}opportunités d{`'`}arbitrage fundamentals vs sentiment
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
        {analysis && !loading && (
          <Grid container spacing={3}>
            {/* Header */}
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <MDTypography variant="h5" fontWeight="bold">
                        {analysis.ticker}
                      </MDTypography>
                      <MDBox display="flex" alignItems="center" mt={1}>
                        <Chip
                          label={analysis.type?.replace(/_/g, ' ').toUpperCase() || 'N/A'}
                          color={
                            analysis.type?.includes('bullish') ? 'success' :
                            analysis.type?.includes('bearish') ? 'error' : 'default'
                          }
                          size="medium"
                        />
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDBox display="flex" justifyContent="flex-end" alignItems="center">
                        <MDBox textAlign="right" mr={2}>
                          <MDTypography variant="body2" color="text">
                            Divergence
                          </MDTypography>
                          <MDTypography
                            variant="h4"
                            fontWeight="bold"
                            color={analysis.divergence > 0 ? 'success' : 'error'}
                          >
                            {analysis.divergence > 0 ? '+' : ''}{analysis.divergence.toFixed(1)}
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

            {/* Scores */}
            <Grid item xs={12} md={6}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Fundamental Score
                  </MDTypography>
                  <MDBox mb={2}>
                    <MDBox display="flex" justifyContent="space-between" mb={1}>
                      <MDTypography variant="body2" color="text">
                        Score
                      </MDTypography>
                      <MDTypography variant="h4" fontWeight="bold" color="info">
                        {analysis.fundamentalScore}/100
                      </MDTypography>
                    </MDBox>
                    <LinearProgress
                      variant="determinate"
                      value={analysis.fundamentalScore}
                      color="info"
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Sentiment Score
                  </MDTypography>
                  <MDBox mb={2}>
                    <MDBox display="flex" justifyContent="space-between" mb={1}>
                      <MDTypography variant="body2" color="text">
                        Score
                      </MDTypography>
                      <MDTypography variant="h4" fontWeight="bold" color="warning">
                        {analysis.sentimentScore}/100
                      </MDTypography>
                    </MDBox>
                    <LinearProgress
                      variant="determinate"
                      value={analysis.sentimentScore}
                      color="warning"
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>

            {/* Opportunity */}
            {analysis.opportunity && analysis.opportunity.isOpportunity && (
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    <MDBox display="flex" alignItems="center" mb={2}>
                      <Icon fontSize="large" color={getOpportunityColor(analysis.opportunity.type)}>
                        {analysis.opportunity.type === 'buy' ? 'trending_up' : 'trending_down'}
                      </Icon>
                      <MDTypography variant="h5" fontWeight="bold" ml={2}>
                        OPPORTUNITÉ DÉTECTÉE
                      </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                      <Chip
                        label={analysis.opportunity.type.toUpperCase()}
                        color={getOpportunityColor(analysis.opportunity.type)}
                        size="large"
                      />
                      <MDBox mt={2}>
                        <MDTypography variant="body2" color="text" mb={1}>
                          <strong>Confiance:</strong> {analysis.opportunity.confidence}%
                        </MDTypography>
                        <MDTypography variant="body2" color="text" mb={1}>
                          <strong>Raisonnement:</strong> {analysis.opportunity.reasoning}
                        </MDTypography>
                        {analysis.opportunity.timeframe && (
                          <MDTypography variant="body2" color="text">
                            <strong>Timeframe:</strong> {analysis.opportunity.timeframe}
                          </MDTypography>
                        )}
                      </MDBox>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
            )}

            {/* Signals */}
            {analysis.signals && (
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={3}>
                      Signaux
                    </MDTypography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <MDTypography variant="subtitle2" fontWeight="medium" mb={2}>
                          Fundamental Signals
                        </MDTypography>
                        {analysis.signals.fundamental && (
                          <MDBox>
                            <MDTypography variant="body2" color="text" mb={1}>
                              Revenue Growth: {formatPercentage(analysis.signals.fundamental.revenueGrowth)}
                            </MDTypography>
                            <MDTypography variant="body2" color="text" mb={1}>
                              Earnings Growth: {formatPercentage(analysis.signals.fundamental.earningsGrowth)}
                            </MDTypography>
                            <MDTypography variant="body2" color="text" mb={1}>
                              PE Ratio: {analysis.signals.fundamental.peRatio?.toFixed(2) || 'N/A'}
                            </MDTypography>
                            <MDTypography variant="body2" color="text">
                              Debt/Equity: {analysis.signals.fundamental.debtToEquity?.toFixed(2) || 'N/A'}
                            </MDTypography>
                          </MDBox>
                        )}
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <MDTypography variant="subtitle2" fontWeight="medium" mb={2}>
                          Sentiment Signals
                        </MDTypography>
                        {analysis.signals.sentiment && (
                          <MDBox>
                            <MDTypography variant="body2" color="text" mb={1}>
                              Options Flow: {analysis.signals.sentiment.optionsFlow?.toLocaleString() || 'N/A'}
                            </MDTypography>
                            <MDTypography variant="body2" color="text" mb={1}>
                              Dark Pool Activity: {analysis.signals.sentiment.darkPoolActivity || 'N/A'}
                            </MDTypography>
                            <MDTypography variant="body2" color="text" mb={1}>
                              Short Interest: {formatPercentage(analysis.signals.sentiment.shortInterest)}
                            </MDTypography>
                            <MDTypography variant="body2" color="text">
                              Institutional Activity: {analysis.signals.sentiment.institutionalActivity?.toLocaleString() || 'N/A'}
                            </MDTypography>
                          </MDBox>
                        )}
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

export default withAuth(DivergenceAnalysis);

