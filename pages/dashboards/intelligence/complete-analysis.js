/**
 * Complete Analysis - Analyse combinée FMP + Unusual Whales
 * 
 * Affiche l'analyse complète d'un ticker combinant :
 * - Fundamentals (FMP) : PE ratio, revenue growth, debt, etc.
 * - Sentiment (UW) : Options flow, dark pool, short interest, etc.
 * - Convergence : Alignement ou divergence entre fundamentals et sentiment
 * - Recommendation : STRONG_BUY, BUY, HOLD, SELL, STRONG_SELL
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
import { formatCurrency, formatPercentage } from "/utils/formatting";
import { searchStocks, POPULAR_STOCKS } from "/config/stockSymbols";
import intelligenceClient from "/lib/api/intelligenceClient";
import { useRouter } from "next/router";
import { useAuth } from "/hooks/useAuth";
import withAuth from "/hocs/withAuth";
import Tooltip from "@mui/material/Tooltip";

function CompleteAnalysis() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [symbol, setSymbol] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger l'analyse
  const loadAnalysis = useCallback(async (ticker) => {
    if (!ticker) return;

    try {
      setLoading(true);
      setError(null);
      const response = await intelligenceClient.getCompleteAnalysis(ticker);
      
      if (response.success && response.data) {
        setAnalysis(response.data);
      } else {
        throw new Error(response.error || "Erreur lors du chargement de l'analyse");
      }
    } catch (err) {
      console.error("Error loading analysis:", err);
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

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold">
            Analyse Complète
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Analyse combinée fundamentals (FMP) + sentiment de marché (UW)
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
            {/* Header avec recommendation */}
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
                          icon={<Icon>{getRecommendationIcon(analysis.recommendation)}</Icon>}
                          label={analysis.recommendation.replace('_', ' ')}
                          color={getRecommendationColor(analysis.recommendation)}
                          size="medium"
                        />
                        <MDBox ml={2}>
                          <MDTypography variant="body2" color="text">
                            Confiance: <strong>{analysis.confidence}%</strong>
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDBox display="flex" justifyContent="flex-end">
                        <MDBox textAlign="right">
                          <MDTypography variant="body2" color="text">
                            Score Global
                          </MDTypography>
                          <MDTypography variant="h4" fontWeight="bold" color="info">
                            {((analysis.fundamental?.score || 0) + (analysis.sentiment?.score || 0)) / 2}
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                    </Grid>
                  </Grid>
                </MDBox>
              </Card>
            </Grid>

            {/* Fundamental Analysis */}
            <Grid item xs={12} md={6}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Fundamental Analysis
                  </MDTypography>
                  <MDBox mb={2}>
                    <MDBox display="flex" justifyContent="space-between" mb={1}>
                      <MDTypography variant="body2" color="text">
                        Score
                      </MDTypography>
                      <MDTypography variant="body2" fontWeight="medium">
                        {analysis.fundamental?.score || 0}/100
                      </MDTypography>
                    </MDBox>
                    <LinearProgress
                      variant="determinate"
                      value={analysis.fundamental?.score || 0}
                      color="info"
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </MDBox>
                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={6}>
                      <Chip
                        icon={<Icon>{analysis.fundamental?.undervalued ? 'check_circle' : 'cancel'}</Icon>}
                        label={analysis.fundamental?.undervalued ? 'Undervalued' : 'Fair/Overvalued'}
                        color={analysis.fundamental?.undervalued ? 'success' : 'default'}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Chip
                        icon={<Icon>{analysis.fundamental?.strongRatios ? 'check_circle' : 'cancel'}</Icon>}
                        label={analysis.fundamental?.strongRatios ? 'Strong Ratios' : 'Weak Ratios'}
                        color={analysis.fundamental?.strongRatios ? 'success' : 'default'}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                  {analysis.fundamental?.details && (
                    <Box>
                      <Divider sx={{ my: 2 }} />
                      <MDTypography variant="body2" color="text" mb={1}>
                        <strong>PE Ratio:</strong> {analysis.fundamental.details.peRatio?.toFixed(2) || 'N/A'}
                      </MDTypography>
                      <MDTypography variant="body2" color="text" mb={1}>
                        <strong>Debt/Equity:</strong> {analysis.fundamental.details.debtToEquity?.toFixed(2) || 'N/A'}
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        <strong>Revenue Growth:</strong> {formatPercentage(analysis.fundamental.details.revenueGrowth) || 'N/A'}
                      </MDTypography>
                    </Box>
                  )}
                </MDBox>
              </Card>
            </Grid>

            {/* Sentiment Analysis */}
            <Grid item xs={12} md={6}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Sentiment Analysis
                  </MDTypography>
                  <MDBox mb={2}>
                    <MDBox display="flex" justifyContent="space-between" mb={1}>
                      <MDTypography variant="body2" color="text">
                        Score
                      </MDTypography>
                      <MDTypography variant="body2" fontWeight="medium">
                        {analysis.sentiment?.score || 0}/100
                      </MDTypography>
                    </MDBox>
                    <LinearProgress
                      variant="determinate"
                      value={analysis.sentiment?.score || 0}
                      color="warning"
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </MDBox>
                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={6}>
                      <Chip
                        icon={<Icon>{analysis.sentiment?.bullishOptions ? 'check_circle' : 'cancel'}</Icon>}
                        label={analysis.sentiment?.bullishOptions ? 'Bullish Options' : 'Neutral/Bearish'}
                        color={analysis.sentiment?.bullishOptions ? 'success' : 'default'}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Chip
                        icon={<Icon>{analysis.sentiment?.lowShortInterest ? 'check_circle' : 'cancel'}</Icon>}
                        label={analysis.sentiment?.lowShortInterest ? 'Low Short Interest' : 'High Short Interest'}
                        color={analysis.sentiment?.lowShortInterest ? 'success' : 'default'}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                  {analysis.sentiment?.details && (
                    <Box>
                      <Divider sx={{ my: 2 }} />
                      <MDTypography variant="body2" color="text" mb={1}>
                        <strong>Call/Put Ratio:</strong> {analysis.sentiment.details.callPutRatio?.toFixed(2) || 'N/A'}
                      </MDTypography>
                      <MDTypography variant="body2" color="text" mb={1}>
                        <strong>Dark Pool Trades:</strong> {analysis.sentiment.details.darkPoolTrades || 'N/A'}
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        <strong>Short % of Float:</strong> {formatPercentage(analysis.sentiment.details.shortPercentOfFloat) || 'N/A'}
                      </MDTypography>
                    </Box>
                  )}
                </MDBox>
              </Card>
            </Grid>

            {/* Convergence Analysis */}
            {analysis.convergence && (
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Convergence Analysis
                    </MDTypography>
                    <MDBox display="flex" alignItems="center" mb={2}>
                      <Chip
                        label={analysis.convergence.aligned ? 'Aligned' : 'Divergence'}
                        color={analysis.convergence.aligned ? 'success' : 'warning'}
                        size="medium"
                      />
                      <MDBox ml={2}>
                        <MDTypography variant="body2" color="text">
                          Type: <strong>{analysis.convergence.type?.replace('_', ' ')}</strong>
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                    {analysis.convergence.opportunity && (
                      <Alert severity="info">
                        Opportunité détectée: {analysis.convergence.type?.replace('_', ' ')}
                      </Alert>
                    )}
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

export default withAuth(CompleteAnalysis);



