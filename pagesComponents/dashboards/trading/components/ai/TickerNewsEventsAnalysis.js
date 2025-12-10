/**
 * Composant pour l'analyse LLM enrichie des nouvelles et événements d'un ticker
 */

import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import intelligenceClient from "/lib/api/intelligenceClient";
import AttentionLevelBadge from "./AttentionLevelBadge";

function TickerNewsEventsAnalysis({ ticker, onAnalysisComplete }) {
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
      try {
        setLoading(true);
        setError(null);
        const response = await intelligenceClient.getTickerNewsEventsAnalysis(ticker);
        
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
        console.error("Error loading ticker news events analysis:", err);
        if (err.message && err.message.includes("503")) {
          setError("Service temporairement indisponible. Veuillez réessayer dans quelques instants.");
        } else {
          setError(err.message || "Erreur lors du chargement de l'analyse");
        }
        setHasLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [ticker, hasLoaded]); // Ajouter hasLoaded pour éviter les rechargements multiples

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
            Aucune analyse de nouvelles et événements disponible pour {ticker}
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  const { analysis } = data;

  return (
    <Card>
      <MDBox p={3}>
        {/* Header */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDBox>
            <MDTypography variant="h5" fontWeight="bold" mb={0.5}>
              Analyse Nouvelles & Événements - {ticker}
            </MDTypography>
            <AttentionLevelBadge level={analysis.attention_level} />
          </MDBox>
        </MDBox>

        {/* Overview */}
        <MDBox mb={3}>
          <MDTypography variant="h6" fontWeight="medium" mb={1}>
            Vue d&apos;ensemble
          </MDTypography>
          <MDTypography variant="body2" color="text" sx={{ lineHeight: 1.8 }}>
            {analysis.overview}
          </MDTypography>
        </MDBox>

        <Divider sx={{ my: 3 }} />

        {/* Convergent Signals */}
        {analysis.convergent_signals && analysis.convergent_signals.length > 0 && (
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Signaux Convergents
            </MDTypography>
            {analysis.convergent_signals.map((signal, idx) => {
              const signalText = typeof signal === 'string' ? signal : signal.description || signal.type || JSON.stringify(signal);
              const signalType = typeof signal === 'object' ? signal.type : null;
              const signalStrength = typeof signal === 'object' ? signal.strength : null;
              const signalEvidence = typeof signal === 'object' ? signal.evidence : null;
              
              return (
                <MDBox
                  key={idx}
                  sx={{
                    p: 2,
                    mb: 1.5,
                    borderRadius: 1,
                    backgroundColor: "success.50",
                    borderLeft: 3,
                    borderColor: "success.main",
                  }}
                >
                  {signalType && (
                    <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                      {signalType}
                    </MDTypography>
                  )}
                  <MDTypography variant="body2" color="text">
                    {signalText}
                  </MDTypography>
                  {signalStrength && (
                    <MDTypography variant="caption" color="text.secondary" mt={0.5} display="block">
                      Force: {signalStrength}
                    </MDTypography>
                  )}
                  {signalEvidence && (
                    <MDTypography variant="caption" color="text.secondary" mt={0.5} display="block">
                      Preuve: {signalEvidence}
                    </MDTypography>
                  )}
                </MDBox>
              );
            })}
          </MDBox>
        )}

        {/* Divergent Signals */}
        {analysis.divergent_signals && analysis.divergent_signals.length > 0 && (
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Signaux Divergents
            </MDTypography>
            {analysis.divergent_signals.map((signal, idx) => {
              const signalText = typeof signal === 'string' ? signal : signal.description || signal.type || JSON.stringify(signal);
              const signalType = typeof signal === 'object' ? signal.type : null;
              const signalStrength = typeof signal === 'object' ? signal.strength : null;
              const signalEvidence = typeof signal === 'object' ? signal.evidence : null;
              
              return (
                <MDBox
                  key={idx}
                  sx={{
                    p: 2,
                    mb: 1.5,
                    borderRadius: 1,
                    backgroundColor: "warning.50",
                    borderLeft: 3,
                    borderColor: "warning.main",
                  }}
                >
                  {signalType && (
                    <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                      {signalType}
                    </MDTypography>
                  )}
                  <MDTypography variant="body2" color="text">
                    {signalText}
                  </MDTypography>
                  {signalStrength && (
                    <MDTypography variant="caption" color="text.secondary" mt={0.5} display="block">
                      Force: {signalStrength}
                    </MDTypography>
                  )}
                  {signalEvidence && (
                    <MDTypography variant="caption" color="text.secondary" mt={0.5} display="block">
                      Preuve: {signalEvidence}
                    </MDTypography>
                  )}
                </MDBox>
              );
            })}
          </MDBox>
        )}

        {/* Trading Opportunities */}
        {analysis.trading_opportunities && analysis.trading_opportunities.length > 0 && (
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Opportunités de Trading
            </MDTypography>
            <Grid container spacing={2}>
              {analysis.trading_opportunities.map((opp, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Card variant="outlined" sx={{ p: 2, height: "100%" }}>
                    <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                      <Chip
                        label={opp.type?.toUpperCase()}
                        size="small"
                        color={
                          opp.type === "long" ? "success" : opp.type === "short" ? "error" : "info"
                        }
                      />
                      <Chip
                        label={`Risque: ${opp.risk_level?.toUpperCase()}`}
                        size="small"
                        color={
                          opp.risk_level === "faible" ? "success" : opp.risk_level === "élevé" ? "error" : "warning"
                        }
                        sx={{ ml: "auto" }}
                      />
                    </MDBox>
                    <MDTypography variant="body2" color="text" mb={1}>
                      {opp.description}
                    </MDTypography>
                    <MDTypography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      Stratégie: {opp.entry_strategy}
                    </MDTypography>
                    <MDTypography variant="caption" color="text.secondary">
                      Horizon: {opp.time_horizon}
                    </MDTypography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </MDBox>
        )}

        {/* Risks */}
        {analysis.risks && analysis.risks.length > 0 && (
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Risques
            </MDTypography>
            {analysis.risks.map((risk, idx) => (
              <Alert
                key={idx}
                severity={risk.probability === "élevé" ? "error" : risk.probability === "moyen" ? "warning" : "info"}
                sx={{ mb: 1 }}
              >
                <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                  {risk.type?.toUpperCase()}: {risk.description}
                </MDTypography>
                <MDTypography variant="caption" display="block">
                  Probabilité: {risk.probability} • Atténuation: {risk.mitigation}
                </MDTypography>
              </Alert>
            ))}
          </MDBox>
        )}

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
                      : "info.main",
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
              </MDBox>
            ))}
          </MDBox>
        )}

        {/* Narrative */}
        {analysis.narrative && (
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={1}>
              Récit
            </MDTypography>
            <MDTypography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, fontStyle: "italic" }}>
              {analysis.narrative}
            </MDTypography>
          </MDBox>
        )}

        {/* Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <MDBox>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Recommandations
            </MDTypography>
            <MDBox component="ul" sx={{ pl: 2 }}>
              {analysis.recommendations.map((rec, idx) => (
                <MDTypography
                  key={idx}
                  component="li"
                  variant="body2"
                  color="text"
                  sx={{ mb: 1, lineHeight: 1.8 }}
                >
                  {rec}
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

export default TickerNewsEventsAnalysis;

