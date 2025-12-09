/**
 * Composant principal pour l'analyse LLM enrichie du Options Flow
 */

import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import intelligenceClient from "/lib/api/intelligenceClient";
import AttentionLevelBadge from "./AttentionLevelBadge";
import ConfidenceBar from "./ConfidenceBar";
import ScenarioCard from "./ScenarioCard";
import RecommendationCard from "./RecommendationCard";
import { formatCurrency, formatPercentage, formatVolume } from "/utils/formatting";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

function OptionsFlowAnalysis({ ticker, onAnalysisComplete, delay = 0 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!ticker || hasLoaded) return;

    const loadAnalysis = async () => {
      // Délai optionnel pour éviter les appels simultanés
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Vérifier à nouveau après le délai (au cas où le ticker aurait changé)
      if (!ticker) return;

      try {
        setLoading(true);
        setError(null);
        const response = await intelligenceClient.getOptionsFlowAnalysis(ticker);
        
        if (response.success) {
          setData(response);
          setHasLoaded(true);
          if (onAnalysisComplete) {
            onAnalysisComplete(response);
          }
        } else {
          throw new Error(response.error || "Erreur lors du chargement de l'analyse");
        }
      } catch (err) {
        console.error("Error loading options flow analysis:", err);
        // Gérer spécifiquement les erreurs 503
        if (err.message && err.message.includes("503")) {
          setError("Service temporairement indisponible. Veuillez réessayer dans quelques instants.");
        } else {
          setError(err.message || "Erreur lors du chargement de l'analyse");
        }
        setHasLoaded(true); // Marquer comme chargé même en cas d'erreur pour éviter les boucles
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [ticker]); // Retirer onAnalysisComplete et delay des dépendances

  // Réinitialiser quand le ticker change
  useEffect(() => {
    setHasLoaded(false);
    setData(null);
    setError(null);
  }, [ticker]);

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="text" width="40%" height={24} sx={{ mt: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2, borderRadius: 1 }} />
        </MDBox>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <MDBox p={3}>
          <Alert severity="error">{error}</Alert>
        </MDBox>
      </Card>
    );
  }

  if (!data || !data.analysis) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text.secondary">
            Aucune analyse disponible pour {ticker}
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  const { analysis, metrics, signal_type } = data;

  return (
    <Card>
      <MDBox p={3}>
        {/* Header */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDBox>
            <MDTypography variant="h5" fontWeight="bold" mb={0.5}>
              Options Flow Analysis - {ticker}
            </MDTypography>
            <MDBox display="flex" alignItems="center" gap={1} mt={0.5}>
              <Chip
                label={signal_type?.replace(/_/g, " ").toUpperCase() || "UNKNOWN"}
                size="small"
                color="primary"
              />
              <AttentionLevelBadge level={analysis.attention_level} />
            </MDBox>
          </MDBox>
        </MDBox>

        {/* Observation & Interpretation */}
        <MDBox mb={3}>
          <MDTypography variant="h6" fontWeight="medium" mb={1}>
            Observation
          </MDTypography>
          <MDTypography variant="body2" color="text" sx={{ mb: 2, lineHeight: 1.8 }}>
            {analysis.observation}
          </MDTypography>
          <MDTypography variant="h6" fontWeight="medium" mb={1}>
            Interprétation
          </MDTypography>
          <MDTypography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            {analysis.interpretation}
          </MDTypography>
        </MDBox>

        <Divider sx={{ my: 3 }} />

        {/* Strategy Hypothesis */}
        {analysis.strategy_hypothesis && (
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Hypothèse de Stratégie
            </MDTypography>
            <MDBox display="flex" alignItems="center" gap={2} mb={1}>
              <Chip
                label={analysis.strategy_hypothesis.primary?.replace(/_/g, " ").toUpperCase() || "UNKNOWN"}
                color="info"
                size="small"
              />
              <ConfidenceBar
                confidence={analysis.strategy_hypothesis.confidence}
                label=""
              />
            </MDBox>
            <MDTypography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {analysis.strategy_hypothesis.reasoning}
            </MDTypography>
          </MDBox>
        )}

        {/* Key Insights */}
        {analysis.key_insights && analysis.key_insights.length > 0 && (
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Insights Clés
            </MDTypography>
            <Grid container spacing={2}>
              {analysis.key_insights.map((insight, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <MDBox
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      backgroundColor: "grey.50",
                      borderLeft: 3,
                      borderColor:
                        insight.impact === "critique"
                          ? "error.main"
                          : insight.impact === "élevé"
                          ? "warning.main"
                          : "info.main",
                    }}
                  >
                    <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <AttentionLevelBadge level={insight.impact} />
                    </MDBox>
                    <MDTypography variant="body2" color="text" sx={{ mb: 0.5 }}>
                      {insight.insight}
                    </MDTypography>
                    {insight.evidence && (
                      <MDTypography variant="caption" color="text.secondary">
                        {insight.evidence}
                      </MDTypography>
                    )}
                  </MDBox>
                </Grid>
              ))}
            </Grid>
          </MDBox>
        )}

        {/* Métriques Enrichies */}
        {metrics && (
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Métriques Enrichies
            </MDTypography>
            <Grid container spacing={2}>
              {/* Métriques de base */}
              {(metrics.volume_vs_avg !== undefined || metrics.call_put_ratio !== undefined || metrics.total_premium) && (
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <MDBox p={2}>
                      <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                        Métriques de Base
                      </MDTypography>
                      {metrics.volume_vs_avg !== undefined && (
                        <MDTypography variant="body2" color="text.secondary" mb={0.5}>
                          Volume vs Moyenne: {metrics.volume_vs_avg > 0 ? `${metrics.volume_vs_avg.toFixed(1)}x` : "N/A"}
                        </MDTypography>
                      )}
                      {metrics.call_put_ratio !== undefined && (
                        <MDTypography variant="body2" color="text.secondary" mb={0.5}>
                          Call/Put Ratio: {metrics.call_put_ratio > 0 ? metrics.call_put_ratio.toFixed(2) : "0.00"}
                        </MDTypography>
                      )}
                      {metrics.total_premium && (
                        <MDTypography variant="body2" color="text.secondary">
                          Total Premium: {typeof metrics.total_premium === "string" && metrics.total_premium.length > 50 
                            ? "Voir détails" 
                            : formatCurrency(typeof metrics.total_premium === "number" ? metrics.total_premium : parseFloat(metrics.total_premium) || 0)}
                        </MDTypography>
                      )}
                      {metrics.unusual_volume !== undefined && (
                        <MDBox mt={1}>
                          <Chip
                            label={metrics.unusual_volume ? "Volume inhabituel" : "Volume normal"}
                            color={metrics.unusual_volume ? "warning" : "default"}
                            size="small"
                          />
                        </MDBox>
                      )}
                    </MDBox>
                  </Card>
                </Grid>
              )}

              {/* Biggest Trade */}
              {metrics.biggest_trade && (
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <MDBox p={2}>
                      <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                        Plus Grande Transaction
                      </MDTypography>
                      <MDTypography variant="body2" color="text.secondary" mb={0.5}>
                        Taille: {formatCurrency(metrics.biggest_trade.size || 0)}
                      </MDTypography>
                      <MDBox display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Chip
                          label={metrics.biggest_trade.direction?.toUpperCase() || "N/A"}
                          color={metrics.biggest_trade.direction === "call" ? "success" : "error"}
                          size="small"
                        />
                        {metrics.biggest_trade.strike && (
                          <MDTypography variant="caption" color="text.secondary">
                            Strike: ${metrics.biggest_trade.strike}
                          </MDTypography>
                        )}
                      </MDBox>
                      {metrics.biggest_trade.expiry && (
                        <MDTypography variant="caption" color="text.secondary">
                          Expiry: {new Date(metrics.biggest_trade.expiry).toLocaleDateString("fr-FR")}
                        </MDTypography>
                      )}
                    </MDBox>
                  </Card>
                </Grid>
              )}

              {/* Expirations */}
              {metrics.expirations && metrics.expirations.length > 0 && (
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <MDBox p={2}>
                      <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                        Expirations ({metrics.expirations.length})
                      </MDTypography>
                      <MDBox component="ul" sx={{ pl: 2, m: 0 }}>
                        {metrics.expirations.slice(0, 5).map((expiry, idx) => (
                          <MDTypography key={idx} component="li" variant="caption" color="text.secondary">
                            {new Date(expiry).toLocaleDateString("fr-FR")}
                          </MDTypography>
                        ))}
                      </MDBox>
                    </MDBox>
                  </Card>
                </Grid>
              )}

              {/* Open Interest Change */}
              {metrics.open_interest_change && (
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <MDBox p={2}>
                      <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                        Open Interest
                      </MDTypography>
                      <MDTypography variant="body2" color="text.secondary">
                        Total: {formatCurrency(metrics.open_interest_change.total_change)}
                      </MDTypography>
                      <MDTypography variant="body2" color="success.main">
                        Calls: {formatCurrency(metrics.open_interest_change.call_oi_change)}
                      </MDTypography>
                      <MDTypography variant="body2" color="error.main">
                        Puts: {formatCurrency(metrics.open_interest_change.put_oi_change)}
                      </MDTypography>
                    </MDBox>
                  </Card>
                </Grid>
              )}

              {/* Implied Volatility */}
              {metrics.implied_volatility && (
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <MDBox p={2}>
                      <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                        Implied Volatility
                      </MDTypography>
                      <MDTypography variant="h6" fontWeight="bold">
                        {(metrics.implied_volatility.current * 100).toFixed(1)}%
                      </MDTypography>
                      {metrics.implied_volatility.percentile !== undefined && (
                        <MDBox mt={1}>
                          <MDTypography variant="caption" color="text.secondary">
                            Percentile: {metrics.implied_volatility.percentile}%
                          </MDTypography>
                          <LinearProgress
                            variant="determinate"
                            value={metrics.implied_volatility.percentile}
                            color={metrics.implied_volatility.percentile >= 70 ? "error" : "warning"}
                            sx={{ mt: 0.5, height: 6, borderRadius: 1 }}
                          />
                        </MDBox>
                      )}
                    </MDBox>
                  </Card>
                </Grid>
              )}

              {/* Max Pain */}
              {metrics.max_pain && (
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <MDBox p={2}>
                      <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                        Max Pain
                      </MDTypography>
                      <MDTypography variant="h6" fontWeight="bold">
                        ${metrics.max_pain.current}
                      </MDTypography>
                      {metrics.price_action?.current_price && (
                        <MDTypography variant="body2" color="text.secondary" mt={0.5}>
                          Prix actuel: ${metrics.price_action.current_price}
                        </MDTypography>
                      )}
                      {metrics.max_pain.price_distance !== undefined && (
                        <MDTypography variant="caption" color="text.secondary">
                          Distance: {formatPercentage(metrics.max_pain.price_distance)}
                        </MDTypography>
                      )}
                    </MDBox>
                  </Card>
                </Grid>
              )}
            </Grid>

            {/* Volume Profile */}
            {metrics.volume_profile && (
              <MDBox mt={3}>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Volume Profile
                </MDTypography>
                <Grid container spacing={2}>
                  {/* Volume Profile by Strike */}
                  {metrics.volume_profile.by_strike && metrics.volume_profile.by_strike.length > 0 && (
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <MDBox p={2}>
                          <MDTypography variant="subtitle2" fontWeight="bold" mb={2}>
                            Par Strike (Top 10)
                          </MDTypography>
                          <TableContainer sx={{ maxHeight: 300 }}>
                            <Table size="small" stickyHeader>
                              <MDBox component="thead">
                                <TableRow>
                                  <DataTableHeadCell>Strike</DataTableHeadCell>
                                  <DataTableHeadCell align="right">Calls</DataTableHeadCell>
                                  <DataTableHeadCell align="right">Puts</DataTableHeadCell>
                                </TableRow>
                              </MDBox>
                              <TableBody>
                                {metrics.volume_profile.by_strike.slice(0, 10).map((item, idx) => (
                                  <TableRow key={idx}>
                                    <DataTableBodyCell>${item.strike}</DataTableBodyCell>
                                    <DataTableBodyCell align="right" color="success">
                                      {formatVolume(item.call_volume || 0)}
                                    </DataTableBodyCell>
                                    <DataTableBodyCell align="right" color="error">
                                      {formatVolume(item.put_volume || 0)}
                                    </DataTableBodyCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </MDBox>
                      </Card>
                    </Grid>
                  )}

                  {/* Volume Profile by Expiry */}
                  {metrics.volume_profile.by_expiry && metrics.volume_profile.by_expiry.length > 0 && (
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <MDBox p={2}>
                          <MDTypography variant="subtitle2" fontWeight="bold" mb={2}>
                            Par Expiry
                          </MDTypography>
                          <TableContainer sx={{ maxHeight: 300 }}>
                            <Table size="small" stickyHeader>
                              <MDBox component="thead">
                                <TableRow>
                                  <DataTableHeadCell>Expiry</DataTableHeadCell>
                                  <DataTableHeadCell align="right">Volume Total</DataTableHeadCell>
                                  <DataTableHeadCell align="right">Call Ratio</DataTableHeadCell>
                                </TableRow>
                              </MDBox>
                              <TableBody>
                                {metrics.volume_profile.by_expiry.map((item, idx) => (
                                  <TableRow key={idx}>
                                    <DataTableBodyCell>
                                      {new Date(item.expiry).toLocaleDateString("fr-FR")}
                                    </DataTableBodyCell>
                                    <DataTableBodyCell align="right" fontWeight="bold">
                                      {formatVolume(item.total_volume || 0)}
                                    </DataTableBodyCell>
                                    <DataTableBodyCell align="right">
                                      {(item.call_ratio * 100).toFixed(1)}%
                                    </DataTableBodyCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </MDBox>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              </MDBox>
            )}
          </MDBox>
        )}

        {/* Scénarios */}
        {analysis.scenarios && (
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Scénarios
            </MDTypography>
            <Grid container spacing={2}>
              {analysis.scenarios.bullish && (
                <Grid item xs={12} md={4}>
                  <ScenarioCard
                    type="bullish"
                    probability={analysis.scenarios.bullish.probability}
                    priceTarget={analysis.scenarios.bullish.price_target}
                    conditions={analysis.scenarios.bullish.conditions}
                  />
                </Grid>
              )}
              {analysis.scenarios.bearish && (
                <Grid item xs={12} md={4}>
                  <ScenarioCard
                    type="bearish"
                    probability={analysis.scenarios.bearish.probability}
                    priceTarget={analysis.scenarios.bearish.price_target}
                    conditions={analysis.scenarios.bearish.conditions}
                  />
                </Grid>
              )}
              {analysis.scenarios.neutral && (
                <Grid item xs={12} md={4}>
                  <ScenarioCard
                    type="neutral"
                    probability={analysis.scenarios.neutral.probability}
                    priceRange={analysis.scenarios.neutral.price_range}
                    conditions={analysis.scenarios.neutral.conditions}
                  />
                </Grid>
              )}
            </Grid>
          </MDBox>
        )}

        {/* Recommandations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Recommandations
            </MDTypography>
            <Grid container spacing={2}>
              {analysis.recommendations.map((rec, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <RecommendationCard
                    action={rec.action}
                    strike={rec.strike}
                    expiry={rec.expiry}
                    reasoning={rec.reasoning}
                    riskLevel={rec.risk_level}
                  />
                </Grid>
              ))}
            </Grid>
          </MDBox>
        )}

        {/* Warnings */}
        {analysis.warnings && analysis.warnings.length > 0 && (
          <MDBox mb={3}>
            {analysis.warnings.map((warning, idx) => (
              <Alert severity="warning" key={idx} sx={{ mb: 1 }}>
                {warning}
              </Alert>
            ))}
          </MDBox>
        )}

        {/* Next Signals to Watch */}
        {analysis.next_signals_to_watch && analysis.next_signals_to_watch.length > 0 && (
          <MDBox>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Signaux à Surveiller
            </MDTypography>
            <MDBox component="ul" sx={{ pl: 2 }}>
              {analysis.next_signals_to_watch.map((signal, idx) => (
                <MDTypography
                  key={idx}
                  component="li"
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  {signal}
                </MDTypography>
              ))}
            </MDBox>
          </MDBox>
        )}
      </MDBox>
    </Card>
  );
}

export default OptionsFlowAnalysis;

