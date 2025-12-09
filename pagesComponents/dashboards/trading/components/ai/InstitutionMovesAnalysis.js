/**
 * Composant principal pour l'analyse LLM enrichie des mouvements institutionnels
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
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import intelligenceClient from "/lib/api/intelligenceClient";
import AttentionLevelBadge from "./AttentionLevelBadge";
import ConfidenceBar from "./ConfidenceBar";
import RecommendationCard from "./RecommendationCard";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";
import { formatCurrency, formatPercentageage } from "/utils/formatting";

function InstitutionMovesAnalysis({ institution_cik, institution_name, period = "3M", onAnalysisComplete }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!institution_cik || !institution_name || hasLoaded) return;

    const loadAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await intelligenceClient.getInstitutionMovesAnalysis(
          institution_cik,
          institution_name,
          period
        );
        
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
        console.error("Error loading institution moves analysis:", err);
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
  }, [institution_cik, institution_name, period]); // Retirer onAnalysisComplete des dépendances

  // Réinitialiser quand les paramètres changent
  useEffect(() => {
    setHasLoaded(false);
    setData(null);
    setError(null);
  }, [institution_cik, institution_name, period]);

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
            Aucune analyse disponible pour {institution_name}
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  const { analysis } = data;

  const getActionColor = (action) => {
    switch (action) {
      case "buy":
        return "success";
      case "sell":
        return "error";
      case "hold":
        return "warning";
      case "trim":
        return "warning";
      default:
        return "default";
    }
  };

  const getMagnitudeColor = (magnitude) => {
    switch (magnitude) {
      case "critique":
        return "error";
      case "élevé":
        return "warning";
      case "moyen":
        return "info";
      default:
        return "default";
    }
  };

  const getConvictionColor = (level) => {
    switch (level) {
      case "very_high":
        return "success";
      case "high":
        return "info";
      case "medium":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Card>
      <MDBox p={3}>
        {/* Header */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDBox>
            <MDTypography variant="h5" fontWeight="bold" mb={0.5}>
              {institution_name}
            </MDTypography>
            <MDBox display="flex" alignItems="center" gap={1} mt={0.5}>
              <Chip label={`Période: ${period}`} size="small" />
              <Chip label={`CIK: ${institution_cik}`} size="small" variant="outlined" />
              <AttentionLevelBadge level={analysis.attention_level} />
            </MDBox>
          </MDBox>
        </MDBox>

        {/* Summary */}
        <MDBox mb={3}>
          <MDTypography variant="h6" fontWeight="medium" mb={1}>
            Résumé
          </MDTypography>
          <MDTypography variant="body2" color="text" sx={{ lineHeight: 1.8 }}>
            {analysis.summary}
          </MDTypography>
        </MDBox>

        <Divider sx={{ my: 3 }} />

        {/* Strategy Insight */}
        {analysis.strategy_insight && (
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Insight Stratégique
            </MDTypography>
            <MDBox display="flex" alignItems="center" gap={2} mb={1}>
              <Chip
                label={analysis.strategy_insight.primary_strategy?.replace(/_/g, " ").toUpperCase() || "UNKNOWN"}
                color="info"
                size="small"
              />
              <ConfidenceBar
                confidence={analysis.strategy_insight.confidence}
                label=""
              />
            </MDBox>
            <MDTypography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
              {analysis.strategy_insight.reasoning}
            </MDTypography>
            {analysis.strategy_insight.evidence && analysis.strategy_insight.evidence.length > 0 && (
              <MDBox>
                <MDTypography variant="caption" fontWeight="bold" color="text.secondary">
                  Preuves:
                </MDTypography>
                <MDBox component="ul" sx={{ pl: 2, mt: 0.5 }}>
                  {analysis.strategy_insight.evidence.map((evidence, idx) => (
                    <MDTypography
                      key={idx}
                      component="li"
                      variant="caption"
                      color="text.secondary"
                    >
                      {evidence}
                    </MDTypography>
                  ))}
                </MDBox>
              </MDBox>
            )}
          </MDBox>
        )}

        {/* Key Moves */}
        {analysis.key_moves && analysis.key_moves.length > 0 && (
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Mouvements Clés
            </MDTypography>
            <TableContainer>
              <Table size="small">
                <MDBox component="thead">
                  <TableRow>
                    <DataTableHeadCell>Ticker</DataTableHeadCell>
                    <DataTableHeadCell>Action</DataTableHeadCell>
                    <DataTableHeadCell>Magnitude</DataTableHeadCell>
                    <DataTableHeadCell align="right">Change %</DataTableHeadCell>
                    <DataTableHeadCell>Conviction</DataTableHeadCell>
                    <DataTableHeadCell>Copy Trade</DataTableHeadCell>
                    <DataTableHeadCell>Raison</DataTableHeadCell>
                  </TableRow>
                </MDBox>
                <TableBody>
                  {analysis.key_moves.map((move, idx) => (
                    <TableRow key={idx} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                      <DataTableBodyCell>
                        <MDTypography variant="body2" fontWeight="bold" color="primary">
                          {move.ticker}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell>
                        <Chip
                          label={move.action.toUpperCase()}
                          color={getActionColor(move.action)}
                          size="small"
                        />
                      </DataTableBodyCell>
                      <DataTableBodyCell>
                        <Chip
                          label={move.magnitude}
                          color={getMagnitudeColor(move.magnitude)}
                          size="small"
                          variant="outlined"
                        />
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        {move.change_pct !== undefined && (
                          <MDTypography
                            variant="body2"
                            fontWeight="bold"
                            color={move.change_pct >= 0 ? "success" : "error"}
                          >
                            {move.change_pct >= 0 ? "+" : ""}
                            {formatPercentageage(move.change_pct)}
                          </MDTypography>
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell>
                        {move.conviction_level && (
                          <Chip
                            label={move.conviction_level.replace(/_/g, " ").toUpperCase()}
                            color={getConvictionColor(move.conviction_level)}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell>
                        {move.copy_trade_potential && (
                          <Chip
                            label={move.copy_trade_potential.toUpperCase()}
                            color={
                              move.copy_trade_potential === "high"
                                ? "success"
                                : move.copy_trade_potential === "medium"
                                ? "warning"
                                : "default"
                            }
                            size="small"
                          />
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell>
                        <MDTypography variant="caption" color="text.secondary">
                          {move.reason}
                        </MDTypography>
                      </DataTableBodyCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </MDBox>
        )}

        {/* Portfolio Analysis */}
        {analysis.portfolio_analysis && (
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Analyse du Portefeuille
            </MDTypography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <MDBox p={2}>
                    <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                      Risque de Concentration
                    </MDTypography>
                    <Chip
                      label={analysis.portfolio_analysis.concentration_risk?.toUpperCase() || "N/A"}
                      color={
                        analysis.portfolio_analysis.concentration_risk === "high"
                          ? "error"
                          : analysis.portfolio_analysis.concentration_risk === "medium"
                          ? "warning"
                          : "success"
                      }
                      size="small"
                    />
                  </MDBox>
                </Card>
              </Grid>
              {analysis.portfolio_analysis.style_analysis && (
                <Grid item xs={12} md={8}>
                  <Card variant="outlined">
                    <MDBox p={2}>
                      <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                        Style d'Investissement
                      </MDTypography>
                      <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                        <Chip
                          label={analysis.portfolio_analysis.style_analysis.current_style?.toUpperCase() || "N/A"}
                          color="info"
                          size="small"
                        />
                        {analysis.portfolio_analysis.style_analysis.style_shift && (
                          <Chip label="CHANGEMENT" color="warning" size="small" />
                        )}
                      </MDBox>
                      <MDTypography variant="caption" color="text.secondary">
                        {analysis.portfolio_analysis.style_analysis.reasoning}
                      </MDTypography>
                    </MDBox>
                  </Card>
                </Grid>
              )}
            </Grid>
            {analysis.portfolio_analysis.sector_bets && analysis.portfolio_analysis.sector_bets.length > 0 && (
              <MDBox mt={2}>
                <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                  Paris Sectoriels
                </MDTypography>
                <Grid container spacing={1}>
                  {analysis.portfolio_analysis.sector_bets.map((bet, idx) => (
                    <Grid item xs={12} sm={6} md={4} key={idx}>
                      <Card variant="outlined">
                        <MDBox p={1.5}>
                          <MDTypography variant="body2" fontWeight="bold" mb={0.5}>
                            {bet.sector}
                          </MDTypography>
                          <Chip
                            label={bet.bet?.toUpperCase() || "N/A"}
                            color={
                              bet.bet === "overweight"
                                ? "success"
                                : bet.bet === "underweight"
                                ? "error"
                                : "default"
                            }
                            size="small"
                          />
                          <MDTypography variant="caption" color="text.secondary" display="block" mt={0.5}>
                            {bet.reasoning}
                          </MDTypography>
                        </MDBox>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </MDBox>
            )}
          </MDBox>
        )}

        {/* Performance Analysis */}
        {analysis.performance_analysis && (
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Analyse de Performance
            </MDTypography>
            <MDBox mb={2}>
              <Chip
                label={analysis.performance_analysis.overall_performance?.toUpperCase() || "N/A"}
                color={
                  analysis.performance_analysis.overall_performance === "outperforming"
                    ? "success"
                    : analysis.performance_analysis.overall_performance === "underperforming"
                    ? "error"
                    : "default"
                }
                size="small"
              />
            </MDBox>
            {analysis.performance_analysis.insights && (
              <MDTypography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {analysis.performance_analysis.insights}
              </MDTypography>
            )}
            <Grid container spacing={2}>
              {analysis.performance_analysis.top_performers && analysis.performance_analysis.top_performers.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <MDBox p={2}>
                      <MDTypography variant="subtitle2" fontWeight="bold" mb={1} color="success.main">
                        Top Performeurs
                      </MDTypography>
                      {analysis.performance_analysis.top_performers.map((perf, idx) => (
                        <MDBox key={idx} mb={1}>
                          <MDBox display="flex" justifyContent="space-between" alignItems="center">
                            <MDTypography variant="body2" fontWeight="bold">
                              {perf.ticker}
                            </MDTypography>
                            <MDTypography variant="body2" color="success.main" fontWeight="bold">
                              {formatPercentage(perf.pnl_pct)}
                            </MDTypography>
                          </MDBox>
                          <MDTypography variant="caption" color="text.secondary">
                            Contribution: {formatPercentage(perf.contribution)}
                          </MDTypography>
                        </MDBox>
                      ))}
                    </MDBox>
                  </Card>
                </Grid>
              )}
              {analysis.performance_analysis.underperformers && analysis.performance_analysis.underperformers.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <MDBox p={2}>
                      <MDTypography variant="subtitle2" fontWeight="bold" mb={1} color="error.main">
                        Sous-Performeurs
                      </MDTypography>
                      {analysis.performance_analysis.underperformers.map((perf, idx) => (
                        <MDBox key={idx} mb={1}>
                          <MDBox display="flex" justifyContent="space-between" alignItems="center">
                            <MDTypography variant="body2" fontWeight="bold">
                              {perf.ticker}
                            </MDTypography>
                            <MDTypography variant="body2" color="error.main" fontWeight="bold">
                              {formatPercentage(perf.pnl_pct)}
                            </MDTypography>
                          </MDBox>
                          <MDTypography variant="caption" color="text.secondary">
                            Contribution: {formatPercentage(perf.contribution)}
                          </MDTypography>
                        </MDBox>
                      ))}
                    </MDBox>
                  </Card>
                </Grid>
              )}
            </Grid>
          </MDBox>
        )}

        {/* Copy Trade Opportunities */}
        {analysis.copy_trade_opportunities && analysis.copy_trade_opportunities.length > 0 && (
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Opportunités de Copy Trade
            </MDTypography>
            <Grid container spacing={2}>
              {analysis.copy_trade_opportunities.map((opp, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Card
                    sx={{
                      height: "100%",
                      border: 2,
                      borderColor: opp.risk_level === "high" ? "error.main" : opp.risk_level === "medium" ? "warning.main" : "success.main",
                    }}
                  >
                    <MDBox p={2}>
                      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <MDTypography variant="h6" fontWeight="bold" color="primary">
                          {opp.ticker}
                        </MDTypography>
                        <Chip
                          label={opp.action.toUpperCase()}
                          color={opp.action === "buy" ? "success" : "error"}
                          size="small"
                        />
                      </MDBox>
                      <MDBox mb={1}>
                        <Chip
                          label={opp.risk_level?.toUpperCase() || "N/A"}
                          color={
                            opp.risk_level === "high"
                              ? "error"
                              : opp.risk_level === "medium"
                              ? "warning"
                              : "success"
                          }
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={opp.entry_strategy || "N/A"}
                          size="small"
                          variant="outlined"
                        />
                      </MDBox>
                      <MDTypography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                        {opp.reasoning}
                      </MDTypography>
                    </MDBox>
                  </Card>
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

        {/* Next Moves to Watch */}
        {analysis.next_moves_to_watch && analysis.next_moves_to_watch.length > 0 && (
          <MDBox>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Mouvements à Surveiller
            </MDTypography>
            <MDBox component="ul" sx={{ pl: 2 }}>
              {analysis.next_moves_to_watch.map((move, idx) => (
                <MDTypography
                  key={idx}
                  component="li"
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  {move}
                </MDTypography>
              ))}
            </MDBox>
          </MDBox>
        )}
      </MDBox>
    </Card>
  );
}

export default InstitutionMovesAnalysis;

