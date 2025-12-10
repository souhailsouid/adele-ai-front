/**
 * Composant pour l'analyse LLM enrichie des options d'un ticker (nouvelle route)
 * Utilise POST /ai/ticker-options-analysis
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

function TickerOptionsAnalysis({ ticker, onAnalysisComplete, delay = 0 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Réinitialiser quand le ticker change
  useEffect(() => {
    setHasLoaded(false);
    setData(null);
    setError(null);
    setLoading(false);
  }, [ticker]);

  useEffect(() => {
    if (!ticker || hasLoaded) return;

    const loadAnalysis = async () => {
      // Délai optionnel pour éviter les appels simultanés
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Vérifier à nouveau après le délai (au cas où le ticker aurait changé)
      if (!ticker || hasLoaded) return;

      try {
        setLoading(true);
        setError(null);
        const response = await intelligenceClient.getTickerOptionsAnalysis(ticker);
        
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
        console.error("Error loading ticker options analysis:", err);
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
  }, [ticker, hasLoaded, delay]); // Ajouter hasLoaded pour éviter les rechargements multiples

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

  if (!data || !data.analysis || !data.metrics) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text.secondary">
            Aucune analyse Options Flow disponible pour {ticker}
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  const { analysis, metrics } = data;

  return (
    <Card>
      <MDBox p={3}>
        {/* Header */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDBox>
            <MDTypography variant="h5" fontWeight="bold" mb={0.5}>
              Options Analysis (Enrichie) - {ticker}
            </MDTypography>
            <MDBox display="flex" alignItems="center" gap={1}>
              <Chip label={data.signal_type?.replace(/_/g, " ").toUpperCase() || "N/A"} size="small" color="primary" />
              <AttentionLevelBadge level={analysis.attention_level} />
            </MDBox>
          </MDBox>
        </MDBox>

        {/* Observation & Interpretation */}
        <MDBox mb={3}>
          <MDTypography variant="h6" fontWeight="medium" mb={1}>
            Observation
          </MDTypography>
          <MDTypography variant="body2" color="text" sx={{ lineHeight: 1.8 }}>
            {analysis.observation}
          </MDTypography>
          <MDTypography variant="h6" fontWeight="medium" mt={2} mb={1}>
            Interprétation
          </MDTypography>
          <MDTypography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, fontStyle: "italic" }}>
            {analysis.interpretation}
          </MDTypography>
        </MDBox>

        <Divider sx={{ my: 3 }} />

        {/* Strategy Hypothesis */}
        {analysis.strategy_hypothesis && (
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={1}>
              Hypothèse de Stratégie
            </MDTypography>
            <MDBox display="flex" alignItems="center" gap={1} mb={1}>
              <Chip label={analysis.strategy_hypothesis.primary?.replace(/_/g, " ").toUpperCase() || "N/A"} size="small" color="secondary" />
              <MDTypography variant="body2" color="text.secondary">
                (Confiance: <ConfidenceBar confidence={analysis.strategy_hypothesis.confidence} />)
              </MDTypography>
            </MDBox>
            <MDTypography variant="body2" color="text" sx={{ lineHeight: 1.8 }}>
              {analysis.strategy_hypothesis.reasoning}
            </MDTypography>
          </MDBox>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Key Insights */}
        {analysis.key_insights && analysis.key_insights.length > 0 && (
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Insights Clés
            </MDTypography>
            {analysis.key_insights.map((insight, idx) => (
              <MDBox
                key={idx}
                sx={{
                  p: 2,
                  mb: 1.5,
                  borderRadius: 1,
                  backgroundColor: "grey.50",
                  borderLeft: 3,
                  borderColor:
                    insight.impact === "critique"
                      ? "error.main"
                      : insight.impact === "élevé"
                      ? "warning.main"
                      : insight.impact === "moyen"
                      ? "info.main"
                      : "default",
                }}
              >
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <MDTypography variant="subtitle2" fontWeight="bold">
                    Insight {idx + 1}
                  </MDTypography>
                  <AttentionLevelBadge level={insight.impact} />
                </MDBox>
                <MDTypography variant="body2" color="text">
                  {insight.insight}
                </MDTypography>
                {insight.evidence && (
                  <MDTypography variant="caption" color="text.secondary" mt={1} display="block">
                    Preuve: {insight.evidence}
                  </MDTypography>
                )}
              </MDBox>
            ))}
          </MDBox>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Métriques Enrichies */}
        {metrics && (
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Métriques Enrichies
            </MDTypography>
            <Grid container spacing={2}>
              {/* Volume Total */}
              {metrics.total_volume !== undefined && (
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <MDBox p={2}>
                      <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                        Volume Total
                      </MDTypography>
                      <MDTypography variant="h6" fontWeight="bold">
                        {formatVolume(metrics.total_volume)}
                      </MDTypography>
                      {metrics.unusual && (
                        <Chip
                          label="Volume inhabituel"
                          color="warning"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </MDBox>
                  </Card>
                </Grid>
              )}

              {/* Call/Put Ratio */}
              {metrics.call_put_ratio !== undefined && (
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <MDBox p={2}>
                      <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                        Call/Put Ratio
                      </MDTypography>
                      <MDTypography variant="h6" fontWeight="bold">
                        {metrics.call_put_ratio > 0 ? metrics.call_put_ratio.toFixed(2) : "0.00"}
                      </MDTypography>
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
                        Total: {formatVolume(metrics.open_interest_change.total_change)}
                      </MDTypography>
                      <MDTypography variant="body2" color="success.main">
                        Calls: {formatVolume(metrics.open_interest_change.call_oi_change)}
                      </MDTypography>
                      <MDTypography variant="body2" color="error.main">
                        Puts: {formatVolume(metrics.open_interest_change.put_oi_change)}
                      </MDTypography>
                    </MDBox>
                  </Card>
                </Grid>
              )}

              {/* Implied Volatility */}
              {metrics.implied_volatility && metrics.implied_volatility.current !== null && (
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

              {/* Volume Profile by Strike */}
              {metrics.volume_profile && metrics.volume_profile.by_strike && (
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <MDBox p={2}>
                      <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                        Volume Profile par Strike
                      </MDTypography>
                      <TableContainer sx={{ maxHeight: 200, overflowY: 'auto' }}>
                        <Table size="small">
                          <MDBox component="thead">
                            <TableRow>
                              <DataTableHeadCell sx={{ fontSize: "0.7rem", py: 0.5 }}>Strike</DataTableHeadCell>
                              <DataTableHeadCell sx={{ fontSize: "0.7rem", py: 0.5 }} align="right">Volume</DataTableHeadCell>
                            </TableRow>
                          </MDBox>
                          <TableBody>
                            {Object.entries(metrics.volume_profile.by_strike)
                              .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
                              .slice(0, 10)
                              .map(([strike, volume]) => (
                                <TableRow key={strike}>
                                  <DataTableBodyCell sx={{ fontSize: "0.7rem", py: 0.5 }}>{formatCurrency(parseFloat(strike))}</DataTableBodyCell>
                                  <DataTableBodyCell sx={{ fontSize: "0.7rem", py: 0.5 }} align="right">{formatVolume(volume)}</DataTableBodyCell>
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
              {metrics.volume_profile && metrics.volume_profile.by_expiry && (
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <MDBox p={2}>
                      <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                        Volume Profile par Expiry
                      </MDTypography>
                      <TableContainer sx={{ maxHeight: 200, overflowY: 'auto' }}>
                        <Table size="small">
                          <MDBox component="thead">
                            <TableRow>
                              <DataTableHeadCell sx={{ fontSize: "0.7rem", py: 0.5 }}>Expiry</DataTableHeadCell>
                              <DataTableHeadCell sx={{ fontSize: "0.7rem", py: 0.5 }} align="right">Volume</DataTableHeadCell>
                            </TableRow>
                          </MDBox>
                          <TableBody>
                            {Object.entries(metrics.volume_profile.by_expiry)
                              .sort(([a], [b]) => new Date(a) - new Date(b))
                              .slice(0, 10)
                              .map(([expiry, volume]) => (
                                <TableRow key={expiry}>
                                  <DataTableBodyCell sx={{ fontSize: "0.7rem", py: 0.5 }}>{new Date(expiry).toLocaleDateString("fr-FR")}</DataTableBodyCell>
                                  <DataTableBodyCell sx={{ fontSize: "0.7rem", py: 0.5 }} align="right">{formatVolume(volume)}</DataTableBodyCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </MDBox>
                  </Card>
                </Grid>
              )}

              {/* Unusual Activity */}
              {metrics.unusual_activity && (
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <MDBox p={2}>
                      <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                        Activité Inhabituelle
                      </MDTypography>
                      {metrics.unusual_activity.sweeps !== undefined && (
                        <MDTypography variant="body2" color="text.secondary" mb={0.5}>
                          Sweeps: {metrics.unusual_activity.sweeps}
                        </MDTypography>
                      )}
                      {metrics.unusual_activity.blocks !== undefined && (
                        <MDTypography variant="body2" color="text.secondary" mb={0.5}>
                          Blocks: {metrics.unusual_activity.blocks}
                        </MDTypography>
                      )}
                    </MDBox>
                  </Card>
                </Grid>
              )}

              {/* Max Pain */}
              {metrics.max_pain && metrics.max_pain.current !== null && (
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <MDBox p={2}>
                      <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                        Max Pain
                      </MDTypography>
                      <MDTypography variant="h6" fontWeight="bold">
                        {formatCurrency(metrics.max_pain.current)}
                      </MDTypography>
                    </MDBox>
                  </Card>
                </Grid>
              )}
            </Grid>
          </MDBox>
        )}

        <Divider sx={{ my: 3 }} />

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

        <Divider sx={{ my: 3 }} />

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
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Avertissements
            </MDTypography>
            {analysis.warnings.map((warning, idx) => (
              <Alert key={idx} severity="warning" sx={{ mb: 1 }}>
                {warning}
              </Alert>
            ))}
          </MDBox>
        )}

        {/* Next Signals to Watch */}
        {analysis.next_signals_to_watch && analysis.next_signals_to_watch.length > 0 && (
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Prochains Signaux à Surveiller
            </MDTypography>
            <MDBox component="ul" sx={{ pl: 2 }}>
              {analysis.next_signals_to_watch.map((signal, idx) => (
                <MDTypography key={idx} component="li" variant="body2" color="text" sx={{ mb: 0.5 }}>
                  {signal}
                </MDTypography>
              ))}
            </MDBox>
          </MDBox>
        )}

        {data.cached && (
          <MDTypography variant="caption" color="text.secondary" mt={3} display="block">
            Données mises en cache. Dernière mise à jour: {new Date(data.timestamp).toLocaleString()}
          </MDTypography>
        )}
      </MDBox>
    </Card>
  );
}

export default TickerOptionsAnalysis;

