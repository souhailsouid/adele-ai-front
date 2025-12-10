/**
 * Composant principal pour l'analyse LLM de l'activité complète d'un ticker
 */

import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import intelligenceClient from "/lib/api/intelligenceClient";
import AttentionLevelBadge from "./AttentionLevelBadge";

function TickerActivityAnalysis({ ticker, onAnalysisComplete }) {
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
        const response = await intelligenceClient.getTickerActivityAnalysis(ticker);
        
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
        console.error("Error loading ticker activity analysis:", err);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, hasLoaded]); // onAnalysisComplete est optionnel et peut changer souvent

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

  const { analysis } = data;

  return (
    <Card>
      <MDBox p={3}>
        {/* Header */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDBox>
            <MDTypography variant="h5" fontWeight="bold" mb={0.5}>
              Ticker Activity Analysis - {ticker}
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

        {/* Key Signals */}
        {analysis.key_signals && analysis.key_signals.length > 0 && (
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Signaux Clés
            </MDTypography>
            {analysis.key_signals.map((signal, idx) => (
              <MDBox
                key={idx}
                sx={{
                  p: 2,
                  mb: 1.5,
                  borderRadius: 1,
                  backgroundColor: "grey.50",
                  borderLeft: 3,
                  borderColor:
                    signal.impact === "critique"
                      ? "error.main"
                      : signal.impact === "élevé"
                      ? "warning.main"
                      : signal.impact === "moyen"
                      ? "info.main"
                      : "default",
                }}
              >
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <MDTypography variant="subtitle2" fontWeight="bold">
                    {signal.type}
                  </MDTypography>
                  <AttentionLevelBadge level={signal.impact} />
                </MDBox>
                <MDTypography variant="body2" color="text">
                  {signal.description}
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
      </MDBox>
    </Card>
  );
}

export default TickerActivityAnalysis;

