/**
 * Risk Analysis - Analyse de risque complète
 * 
 * Évalue les risques globaux d'un investissement en combinant :
 * - Risques financiers (FMP)
 * - Risques de marché (UW)
 * - Risques de liquidité
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
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { POPULAR_STOCKS } from "/config/stockSymbols";
import intelligenceClient from "/lib/api/intelligenceClient";
import { useRouter } from "next/router";
import { useAuth } from "/hooks/useAuth";
import withAuth from "/hocs/withAuth";
import { addToHistory } from "/utils/historyUtils";
import { isFavorite, toggleFavorite } from "/utils/favoritesUtils";
import { showSuccess } from "/utils/notifications";
import IconButton from "@mui/material/IconButton";
import RadarChart from "/pagesComponents/dashboards/intelligence/components/RadarChart";

function RiskAnalysis() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [symbol, setSymbol] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favorite, setFavorite] = useState(false);

  // Charger l'analyse
  const loadAnalysis = useCallback(async (ticker) => {
    if (!ticker) return;

    try {
      setLoading(true);
      setError(null);
      const response = await intelligenceClient.getRiskAnalysis(ticker);
      
      if (response.success && response.data) {
        setRiskAnalysis(response.data);
        addToHistory(ticker, "risk", response.data);
        setFavorite(isFavorite(ticker));
      } else {
        throw new Error(response.error || "Erreur lors du chargement de l'analyse");
      }
    } catch (err) {
      console.error("Error loading risk analysis:", err);
      setError(err.message || "Erreur lors du chargement de l'analyse");
      setRiskAnalysis(null);
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

  // Préparer les données pour le graphique radar
  const getRadarData = () => {
    if (!riskAnalysis?.breakdown) return null;
    
    return {
      financial: riskAnalysis.breakdown.financial?.score || 0,
      market: riskAnalysis.breakdown.market?.score || 0,
      liquidity: riskAnalysis.breakdown.liquidity?.score || 0,
    };
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold">
            Risk Analysis
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Analyse complète des risques (financier, marché, liquidité)
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
        {riskAnalysis && !loading && (
          <Grid container spacing={3}>
            {/* Header */}
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <MDTypography variant="h5" fontWeight="bold">
                        {riskAnalysis.ticker}
                      </MDTypography>
                      <MDBox display="flex" alignItems="center" mt={1}>
                        <Chip
                          label={`Risk: ${riskAnalysis.riskLevel || 'N/A'}`}
                          color={getRiskColor(riskAnalysis.riskLevel)}
                          size="medium"
                        />
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDBox display="flex" justifyContent="flex-end" alignItems="center">
                        <MDBox textAlign="right" mr={2}>
                          <MDTypography variant="body2" color="text">
                            Overall Risk
                          </MDTypography>
                          <MDTypography
                            variant="h2"
                            fontWeight="bold"
                            color={getRiskColor(riskAnalysis.riskLevel)}
                          >
                            {riskAnalysis.overallRisk}/100
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

            {/* Graphique Radar */}
            {getRadarData() && (
              <Grid item xs={12} md={6}>
                <RadarChart
                  title="Risk Breakdown"
                  breakdown={getRadarData()}
                  maxScore={100}
                />
              </Grid>
            )}

            {/* Breakdown détaillé */}
            <Grid item xs={12} md={6}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={3}>
                    Risk Breakdown
                  </MDTypography>
                  
                  {/* Financial Risk */}
                  {riskAnalysis.breakdown?.financial && (
                    <MDBox mb={3}>
                      <MDTypography variant="subtitle2" fontWeight="medium" mb={1}>
                        Financial Risk: {riskAnalysis.breakdown.financial.score}/100
                      </MDTypography>
                      <LinearProgress
                        variant="determinate"
                        value={riskAnalysis.breakdown.financial.score}
                        color={riskAnalysis.breakdown.financial.score < 30 ? 'success' : riskAnalysis.breakdown.financial.score < 60 ? 'warning' : 'error'}
                        sx={{ height: 8, borderRadius: 1, mb: 2 }}
                      />
                      {riskAnalysis.breakdown.financial.factors && (
                        <MDBox>
                          <MDTypography variant="caption" color="text">
                            Debt Level: {riskAnalysis.breakdown.financial.factors.debtLevel}
                          </MDTypography>
                          <br />
                          <MDTypography variant="caption" color="text">
                            Cash Flow: {riskAnalysis.breakdown.financial.factors.cashFlow}
                          </MDTypography>
                          <br />
                          <MDTypography variant="caption" color="text">
                            Profitability: {riskAnalysis.breakdown.financial.factors.profitability}
                          </MDTypography>
                        </MDBox>
                      )}
                    </MDBox>
                  )}

                  {/* Market Risk */}
                  {riskAnalysis.breakdown?.market && (
                    <MDBox mb={3}>
                      <MDTypography variant="subtitle2" fontWeight="medium" mb={1}>
                        Market Risk: {riskAnalysis.breakdown.market.score}/100
                      </MDTypography>
                      <LinearProgress
                        variant="determinate"
                        value={riskAnalysis.breakdown.market.score}
                        color={riskAnalysis.breakdown.market.score < 30 ? 'success' : riskAnalysis.breakdown.market.score < 60 ? 'warning' : 'error'}
                        sx={{ height: 8, borderRadius: 1, mb: 2 }}
                      />
                      {riskAnalysis.breakdown.market.factors && (
                        <MDBox>
                          <MDTypography variant="caption" color="text">
                            Short Interest: {riskAnalysis.breakdown.market.factors.shortInterest}
                          </MDTypography>
                          <br />
                          <MDTypography variant="caption" color="text">
                            Volatility: {riskAnalysis.breakdown.market.factors.volatility}
                          </MDTypography>
                          <br />
                          <MDTypography variant="caption" color="text">
                            Options Flow: {riskAnalysis.breakdown.market.factors.optionsFlow}
                          </MDTypography>
                        </MDBox>
                      )}
                    </MDBox>
                  )}

                  {/* Liquidity Risk */}
                  {riskAnalysis.breakdown?.liquidity && (
                    <MDBox>
                      <MDTypography variant="subtitle2" fontWeight="medium" mb={1}>
                        Liquidity Risk: {riskAnalysis.breakdown.liquidity.score}/100
                      </MDTypography>
                      <LinearProgress
                        variant="determinate"
                        value={riskAnalysis.breakdown.liquidity.score}
                        color={riskAnalysis.breakdown.liquidity.score < 30 ? 'success' : riskAnalysis.breakdown.liquidity.score < 60 ? 'warning' : 'error'}
                        sx={{ height: 8, borderRadius: 1, mb: 2 }}
                      />
                      {riskAnalysis.breakdown.liquidity.factors && (
                        <MDBox>
                          <MDTypography variant="caption" color="text">
                            Average Volume: {riskAnalysis.breakdown.liquidity.factors.averageVolume}
                          </MDTypography>
                          <br />
                          <MDTypography variant="caption" color="text">
                            Bid/Ask Spread: {riskAnalysis.breakdown.liquidity.factors.bidAskSpread}
                          </MDTypography>
                        </MDBox>
                      )}
                    </MDBox>
                  )}
                </MDBox>
              </Card>
            </Grid>

            {/* Recommendations */}
            {riskAnalysis.recommendations && riskAnalysis.recommendations.length > 0 && (
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Recommendations
                    </MDTypography>
                    <List>
                      {riskAnalysis.recommendations.map((rec, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Icon color={
                              rec.type === 'reduce_position' ? 'error' :
                              rec.type === 'hedge' ? 'warning' :
                              rec.type === 'monitor' ? 'info' : 'success'
                            }>
                              {rec.type === 'reduce_position' ? 'warning' :
                               rec.type === 'hedge' ? 'shield' :
                               rec.type === 'monitor' ? 'visibility' : 'check_circle'}
                            </Icon>
                          </ListItemIcon>
                          <ListItemText
                            primary={rec.type?.replace(/_/g, ' ').toUpperCase()}
                            secondary={rec.reasoning}
                          />
                          <Chip
                            label={rec.priority}
                            color={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'default'}
                            size="small"
                          />
                        </ListItem>
                      ))}
                    </List>
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

export default withAuth(RiskAnalysis);



