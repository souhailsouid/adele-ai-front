/**
 * Composant pour l'analyse LLM complète des options
 * Utilise POST /ai/options-analysis avec le payload de getOptionsFiveFactors
 * Design amélioré avec informations pertinentes en premier + onglets pour données détaillées
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
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import MDButton from "/components/MDButton";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import RemoveIcon from "@mui/icons-material/Remove";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import DataTable from "/examples/Tables/DataTable";
import intelligenceClient from "/lib/api/intelligenceClient";
import { formatCurrency, formatVolume, formatPercentage } from "/utils/formatting";

// Composant pour parser et afficher le rapport en sections
function ReportSections({ report }) {
  // Parser le rapport pour extraire les sections (format: "A) Titre\n- Contenu...")
  const parseReport = (text) => {
    if (!text) return [];
    
    const sections = [];
    const lines = text.split("\n");
    let currentSection = null;
    let currentContent = [];

    lines.forEach((line) => {
      // Détecter une nouvelle section (format: "A) Titre", "B) Titre", etc.)
      const sectionMatch = line.match(/^([A-Z])\)\s+(.+)$/);
      if (sectionMatch) {
        // Sauvegarder la section précédente
        if (currentSection) {
          sections.push({
            id: currentSection.id,
            title: currentSection.title,
            content: currentContent.join("\n").trim(),
          });
        }
        // Nouvelle section
        currentSection = {
          id: sectionMatch[1],
          title: sectionMatch[2].trim(),
        };
        currentContent = [];
      } else if (currentSection) {
        // Ajouter le contenu à la section courante
        currentContent.push(line);
      } else if (line.trim()) {
        // Contenu avant la première section
        if (sections.length === 0) {
          sections.push({
            id: "intro",
            title: "Introduction",
            content: line.trim(),
          });
        } else {
          sections[0].content += "\n" + line.trim();
        }
      }
    });

    // Ajouter la dernière section
    if (currentSection) {
      sections.push({
        id: currentSection.id,
        title: currentSection.title,
        content: currentContent.join("\n").trim(),
      });
    }

    return sections;
  };

  const sections = parseReport(report);

  // Mapping des sections aux icônes
  const getSectionIcon = (id, title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes("snapshot") || titleLower.includes("aperçu")) return "dashboard";
    if (titleLower.includes("contexte") || titleLower.includes("prix") || titleLower.includes("price")) return "trending_up";
    if (titleLower.includes("volatilité") || titleLower.includes("volatility") || titleLower.includes("iv")) return "show_chart";
    if (titleLower.includes("flow") || titleLower.includes("flux")) return "swap_horiz";
    if (titleLower.includes("interest") || titleLower.includes("oi")) return "bar_chart";
    if (titleLower.includes("greek") || titleLower.includes("exposure") || titleLower.includes("gamma")) return "functions";
    if (titleLower.includes("max pain") || titleLower.includes("pain")) return "gps_fixed";
    if (titleLower.includes("catalyst") || titleLower.includes("dark pool")) return "flash_on";
    if (titleLower.includes("conclusion") || titleLower.includes("opération")) return "check_circle";
    return "description";
  };

  if (sections.length === 0) {
    // Fallback: afficher le rapport tel quel si le parsing échoue
    return (
      <Card variant="outlined">
        <MDBox p={3}>
          <MDTypography
            variant="body1"
            color="text"
            sx={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.9,
              fontFamily: "inherit",
              fontSize: "0.95rem",
            }}
          >
            {report}
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  return (
    <MDBox>
      {sections.map((section, idx) => {
        // Couleur subtile selon l'index pour alterner
        const bgColor = idx % 2 === 0 ? "white" : "grey.50";
        const borderColor = "primary.light";

        return (
          <Card
            key={idx}
            variant="outlined"
            sx={{
              mb: 2.5,
              borderLeft: 3,
              borderLeftColor: borderColor,
              backgroundColor: bgColor,
              transition: "box-shadow 0.2s, transform 0.1s",
              "&:hover": {
                boxShadow: 2,
                transform: "translateX(2px)",
              },
            }}
          >
            <MDBox p={3}>
              {/* Header de section */}
              <MDBox display="flex" alignItems="flex-start" gap={2} mb={2.5}>
                <MDBox
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    backgroundColor: "primary.light",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "primary.main",
                    flexShrink: 0,
                  }}
                >
                  <Icon sx={{ fontSize: "1.75rem" }}>{getSectionIcon(section.id, section.title)}</Icon>
                </MDBox>
                <MDBox flex={1}>
                  <MDTypography variant="h6" fontWeight="bold" color="text" mb={0.5}>
                    {section.id !== "intro" && (
                      <MDBox component="span" sx={{ color: "primary.main", mr: 1 }}>
                        {section.id})
                      </MDBox>
                    )}
                    {section.title}
                  </MDTypography>
                </MDBox>
              </MDBox>

              {/* Contenu de section */}
              <MDBox
                sx={{
                  pl: { xs: 0, sm: 7 }, // Aligner avec le titre (48px icon + 16px gap = 64px, + padding)
                }}
              >
                <MDTypography
                  variant="body1"
                  sx={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.85,
                    fontSize: "0.95rem",
                    color: "text.secondary",
                    fontFamily: "inherit",
                  }}
                >
                  {section.content}
                </MDTypography>
              </MDBox>
            </MDBox>
          </Card>
        );
      })}
    </MDBox>
  );
}

function OptionsAnalysis({ ticker, refresh = true, onAnalysisComplete }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [dataModalOpen, setDataModalOpen] = useState(false);
  const [rawPayload, setRawPayload] = useState(null);

  // Réinitialiser quand le ticker change
  useEffect(() => {
    setHasLoaded(false);
    setData(null);
    setError(null);
    setLoading(false);
    setCurrentTab(0);
  }, [ticker, refresh]);

  useEffect(() => {
    if (!ticker || hasLoaded) return;

    const loadAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);

        // D'abord récupérer le payload de getOptionsFiveFactors
        const fiveFactorsPayload = await intelligenceClient.getOptionsFiveFactors(ticker, refresh);
        setRawPayload(fiveFactorsPayload);

        // Ensuite appeler getOptionsAnalysis avec ce payload
        const response = await intelligenceClient.getOptionsAnalysis(ticker, fiveFactorsPayload, false);

        if (response.success) {
          setData(response);
          setHasLoaded(true);
          if (onAnalysisComplete) {
            onAnalysisComplete(response);
          }
        } else {
          setData(response);
          setHasLoaded(true);
          if (onAnalysisComplete) {
            onAnalysisComplete(response);
          }
        }
      } catch (err) {
        console.error("Error loading options analysis:", err);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, refresh, hasLoaded]);

  // Helper: Get bias color and icon
  const getBiasMeta = (bias) => {
    switch (bias?.toLowerCase()) {
      case "bullish":
        return { color: "success", icon: <TrendingUpIcon />, label: "Bullish", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" };
      case "bearish":
        return { color: "error", icon: <TrendingDownIcon />, label: "Bearish", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" };
      case "neutral":
        return { color: "warning", icon: <RemoveIcon />, label: "Neutral", gradient: "linear-gradient(135deg, #fad961 0%, #f76b1c 100%)" };
      default:
        return { color: "default", icon: <InfoIcon />, label: bias || "Unknown", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" };
    }
  };

  // Helper: Get signal quality color and icon
  const getSignalQualityMeta = (quality) => {
    switch (quality?.toLowerCase()) {
      case "haute":
      case "high":
        return { color: "success", icon: <CheckCircleIcon />, label: "Haute" };
      case "moyenne":
      case "medium":
        return { color: "warning", icon: <WarningIcon />, label: "Moyenne" };
      case "basse":
      case "low":
        return { color: "error", icon: <CancelIcon />, label: "Basse" };
      default:
        return { color: "default", icon: <InfoIcon />, label: quality || "Unknown" };
    }
  };

  // Helper: Extract and format key metrics from raw payload
  const getKeyMetrics = () => {
    if (!rawPayload?.data) return null;

    const rawData = rawPayload.data;
    const metrics = [];

    // Flow metrics
    if (rawData.recent_flows) {
      const flow = rawData.recent_flows;
      if (flow.call_volume !== undefined || flow.put_volume !== undefined) {
        metrics.push({
          category: "Flow",
          label: "Volume Calls",
          value: flow.call_volume ? formatVolume(flow.call_volume) : "N/A",
          explanation: "Nombre total de contrats CALL échangés. Les CALLs donnent le droit d'acheter l'action à un prix fixe. Un volume élevé de CALLs peut indiquer un sentiment haussier.",
        });
        metrics.push({
          category: "Flow",
          label: "Volume Puts",
          value: flow.put_volume ? formatVolume(flow.put_volume) : "N/A",
          explanation: "Nombre total de contrats PUT échangés. Les PUTs donnent le droit de vendre l'action à un prix fixe. Un volume élevé de PUTs peut indiquer un sentiment baissier ou de la couverture.",
        });
        if (flow.call_put_ratio !== undefined) {
          metrics.push({
            category: "Flow",
            label: "Ratio Call/Put",
            value: parseFloat(flow.call_put_ratio).toFixed(2),
            explanation: "Ratio entre les volumes de CALLs et PUTs. > 1.5 = sentiment haussier, < 0.67 = sentiment baissier, entre = équilibré.",
          });
        }
        if (flow.direction) {
          metrics.push({
            category: "Flow",
            label: "Direction",
            value: flow.direction,
            explanation: "Direction dominante du flux : 'bullish' (haussière), 'bearish' (baissière), ou 'neutral' (neutre).",
          });
        }
        if (flow.total_premium !== undefined) {
          metrics.push({
            category: "Flow",
            label: "Prime Totale",
            value: formatCurrency(flow.total_premium),
            explanation: "Montant total des primes payées pour tous les contrats d'options échangés.",
          });
        }
      }
    }

    // OI Change metrics
    if (rawData.oi_change) {
      const oi = rawData.oi_change;
      if (oi.total_change !== undefined) {
        metrics.push({
          category: "Open Interest",
          label: "Changement Total OI",
          value: formatVolume(oi.total_change),
          explanation: "Changement total de l'Open Interest (positions ouvertes). Une augmentation = nouvelles positions, une diminution = débouclement.",
        });
      }
      if (oi.call_oi_change !== undefined) {
        metrics.push({
          category: "Open Interest",
          label: "Changement OI Calls",
          value: formatVolume(oi.call_oi_change),
          explanation: "Changement de l'Open Interest sur les CALLs. Positif = nouvelles positions CALL ouvertes.",
        });
      }
      if (oi.put_oi_change !== undefined) {
        metrics.push({
          category: "Open Interest",
          label: "Changement OI Puts",
          value: formatVolume(oi.put_oi_change),
          explanation: "Changement de l'Open Interest sur les PUTs. Positif = nouvelles positions PUT ouvertes.",
        });
      }
    }

    // IV Rank
    if (rawData.iv_rank) {
      const iv = rawData.iv_rank;
      if (iv.iv_rank_1y !== undefined) {
        metrics.push({
          category: "Volatilité",
          label: "IV Rank (1 an)",
          value: `${parseFloat(iv.iv_rank_1y).toFixed(2)}%`,
          explanation: "Rang de volatilité implicite sur 1 an (0-100%). < 30% = IV basse (options peu chères), > 70% = IV élevée (options chères).",
        });
      }
      if (iv.volatility !== undefined) {
        metrics.push({
          category: "Volatilité",
          label: "Volatilité Implicite",
          value: `${(parseFloat(iv.volatility) * 100).toFixed(2)}%`,
          explanation: "Volatilité implicite actuelle du marché. Mesure l'anticipation de volatilité future par les traders.",
        });
      }
    }

    // Max Pain
    if (rawData.max_pain?.nearest_expiry) {
      const mp = rawData.max_pain.nearest_expiry;
      if (mp.max_pain !== undefined) {
        metrics.push({
          category: "Max Pain",
          label: "Max Pain (proche expiration)",
          value: `$${parseFloat(mp.max_pain).toFixed(2)}`,
          explanation: "Prix auquel le maximum de contrats d'options expirent sans valeur. Le prix a tendance à se rapprocher de ce niveau à l'expiration.",
        });
      }
      if (mp.distance_from_spot !== undefined) {
        metrics.push({
          category: "Max Pain",
          label: "Distance du Spot",
          value: `${(parseFloat(mp.distance_from_spot) * 100).toFixed(2)}%`,
          explanation: "Distance entre le prix actuel et le max pain. < 2% = risque de pinning (le prix reste proche du max pain).",
        });
      }
    }

    // Greeks
    if (rawData.greeks_aggregated) {
      const greeks = rawData.greeks_aggregated;
      if (greeks.net_gamma_exposure !== undefined) {
        metrics.push({
          category: "Greeks",
          label: "Exposition Nette Gamma",
          value: formatVolume(greeks.net_gamma_exposure),
          explanation: "Exposition nette au gamma. Positif = effet stabilisant (le prix bouge moins), négatif = effet accélérateur (le prix bouge plus).",
        });
      }
      if (greeks.net_delta_exposure !== undefined) {
        metrics.push({
          category: "Greeks",
          label: "Exposition Nette Delta",
          value: formatVolume(greeks.net_delta_exposure),
          explanation: "Exposition nette au delta. Mesure la sensibilité du prix des options aux mouvements du prix de l'action.",
        });
      }
    }

    return metrics;
  };

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
          <Alert severity="error" icon={<CancelIcon />}>
            {error}
          </Alert>
        </MDBox>
      </Card>
    );
  }

  if (data && !data.success) {
    return (
      <Card>
        <MDBox p={3}>
          <Alert severity="info" icon={<InfoIcon />}>
            <MDTypography variant="body2" fontWeight="bold" mb={1}>
              {data.message || "Aucune analyse disponible"}
            </MDTypography>
            {data.hint && (
              <MDTypography variant="body2" color="text">
                {data.hint}
              </MDTypography>
            )}
          </Alert>
        </MDBox>
      </Card>
    );
  }

  if (!data || !data.analysis) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Aucune analyse disponible pour {ticker}
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  const { analysis } = data;
  const asOf = analysis.as_of || data.timestamp;
  const biasMeta = getBiasMeta(analysis.bias);
  const signalMeta = getSignalQualityMeta(analysis.signal_quality);
  const keyMetrics = getKeyMetrics();

  return (
    <MDBox>
      {/* Header Card avec infos principales */}
      <Card sx={{ mb: 3 }}>
        <MDBox
          p={3}
          sx={{
            background: (theme) =>
              biasMeta.color === "success"
                ? theme.palette.success.light
                : biasMeta.color === "error"
                ? theme.palette.error.light
                : theme.palette.warning.light,
            borderRadius: "8px 8px 0 0",
            borderBottom: 2,
            borderBottomColor: (theme) =>
              biasMeta.color === "success"
                ? theme.palette.success.main
                : biasMeta.color === "error"
                ? theme.palette.error.main
                : theme.palette.warning.main,
          }}
        >
          <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
            <MDBox>
              <MDTypography variant="h4" fontWeight="bold" color="text" mb={0.5}>
                {ticker}
              </MDTypography>
              <MDBox display="flex" alignItems="center" gap={1} flexWrap="wrap" mt={1}>
                {analysis.spot && (
                  <MDTypography variant="h6" fontWeight="bold" color="text">
                    ${parseFloat(analysis.spot).toFixed(2)}
                  </MDTypography>
                )}
                {asOf && (
                  <MDTypography variant="caption" color="text.secondary">
                    • Données au {new Date(asOf).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </MDTypography>
                )}
              </MDBox>
            </MDBox>
            <MDBox display="flex" gap={1} flexWrap="wrap">
              {analysis.bias && (
                <Chip
                  icon={biasMeta.icon}
                  label={biasMeta.label}
                  color={biasMeta.color}
                  variant="outlined"
                  sx={{
                    fontWeight: "bold",
                  }}
                />
              )}
              {analysis.signal_quality && (
                <Chip
                  icon={signalMeta.icon}
                  label={`Signal: ${signalMeta.label}`}
                  color={signalMeta.color}
                  variant="outlined"
                  sx={{
                    fontWeight: "bold",
                  }}
                />
              )}
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>

      {/* Onglets pour organiser le contenu */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} variant="scrollable" scrollButtons="auto">
            <Tab label="Résumé" icon={<Icon>dashboard</Icon>} iconPosition="start" />
            <Tab label="Niveaux Clés" icon={<Icon>gps_fixed</Icon>} iconPosition="start" />
            <Tab label="Rapport" icon={<Icon>description</Icon>} iconPosition="start" />
            <Tab label="Données" icon={<Icon>data_object</Icon>} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Contenu selon l'onglet */}
        <MDBox p={3}>
          {/* Onglet Résumé */}
          {currentTab === 0 && (
            <MDBox>
              {/* Key Levels Cards - Version compacte */}
              {analysis.key_levels_structured && (
                <MDBox mb={4}>
                  <MDTypography variant="h6" fontWeight="bold" mb={2}>
                    Niveaux Clés
                  </MDTypography>
                  <Grid container spacing={2}>
                    {analysis.key_levels_structured.pivot && (
                      <Grid item xs={12} sm={4}>
                        <Card
                          variant="outlined"
                          sx={{
                            borderLeft: 3,
                            borderLeftColor: "primary.main",
                            backgroundColor: "primary.50",
                          }}
                        >
                          <MDBox p={2} textAlign="center">
                            <MDTypography variant="caption" color="text.secondary" mb={0.5} fontWeight="medium">
                              PIVOT
                            </MDTypography>
                            <MDTypography variant="h4" fontWeight="bold" color="primary.main">
                              ${analysis.key_levels_structured.pivot}
                            </MDTypography>
                          </MDBox>
                        </Card>
                      </Grid>
                    )}
                    {analysis.key_levels_structured.resistance && (
                      <Grid item xs={12} sm={4}>
                        <Card
                          variant="outlined"
                          sx={{
                            borderLeft: 3,
                            borderLeftColor: "error.main",
                            backgroundColor: "error.50",
                          }}
                        >
                          <MDBox p={2} textAlign="center">
                            <MDTypography variant="caption" color="text.secondary" mb={0.5} fontWeight="medium">
                              RÉSISTANCE
                            </MDTypography>
                            <MDTypography variant="h4" fontWeight="bold" color="error.main">
                              ${analysis.key_levels_structured.resistance}
                            </MDTypography>
                          </MDBox>
                        </Card>
                      </Grid>
                    )}
                    {analysis.key_levels_structured.risk_zone && (
                      <Grid item xs={12} sm={4}>
                        <Card
                          variant="outlined"
                          sx={{
                            borderLeft: 3,
                            borderLeftColor: "warning.main",
                            backgroundColor: "warning.50",
                          }}
                        >
                          <MDBox p={2} textAlign="center">
                            <MDTypography variant="caption" color="text.secondary" mb={0.5} fontWeight="medium">
                              ZONE DE RISQUE
                            </MDTypography>
                            <MDTypography variant="h4" fontWeight="bold" color="warning.main">
                              ${analysis.key_levels_structured.risk_zone}
                            </MDTypography>
                          </MDBox>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </MDBox>
              )}

              {/* Contradictions */}
              {analysis.contradictions && analysis.contradictions.length > 0 && (
                <MDBox mb={3}>
                  <MDBox display="flex" alignItems="center" gap={1} mb={2}>
                    <WarningIcon color="warning" />
                    <MDTypography variant="h6" fontWeight="bold">
                      Contradictions ({analysis.contradictions.length})
                    </MDTypography>
                  </MDBox>
                  {analysis.contradictions.map((contradiction, idx) => (
                    <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 1 }}>
                      <MDTypography variant="body2" fontWeight="medium">
                        {contradiction}
                      </MDTypography>
                    </Alert>
                  ))}
                </MDBox>
              )}

              {/* Bouton pour voir les données */}
              <MDBox display="flex" justifyContent="flex-end">
                <MDButton
                  variant="outlined"
                  color="info"
                  onClick={() => setDataModalOpen(true)}
                  startIcon={<Icon>info</Icon>}
                >
                  Voir les données utilisées
                </MDButton>
              </MDBox>
            </MDBox>
          )}

          {/* Onglet Niveaux Clés */}
          {currentTab === 1 && (
            <MDBox>
              {analysis.key_levels_structured && (
                <MDBox mb={4}>
                  <MDTypography variant="h6" fontWeight="bold" mb={2}>
                    Niveaux Structurés
                  </MDTypography>
                  <Grid container spacing={3}>
                    {analysis.key_levels_structured.pivot && (
                      <Grid item xs={12} sm={6} md={4}>
                        <Card
                          variant="outlined"
                          sx={{
                            height: "100%",
                            borderLeft: 3,
                            borderLeftColor: "primary.main",
                            backgroundColor: "primary.50",
                            transition: "box-shadow 0.2s",
                            "&:hover": {
                              boxShadow: 3,
                            },
                          }}
                        >
                          <MDBox p={3} textAlign="center">
                            <Icon sx={{ fontSize: "2.5rem", mb: 1, color: "primary.main" }}>gps_fixed</Icon>
                            <MDTypography variant="caption" color="text.secondary" mb={1} fontWeight="medium">
                              PIVOT
                            </MDTypography>
                            <MDTypography variant="h3" fontWeight="bold" color="primary.main">
                              ${analysis.key_levels_structured.pivot}
                            </MDTypography>
                            <MDTypography variant="caption" color="text.secondary" mt={1}>
                              Niveau de référence principal
                            </MDTypography>
                          </MDBox>
                        </Card>
                      </Grid>
                    )}
                    {analysis.key_levels_structured.resistance && (
                      <Grid item xs={12} sm={6} md={4}>
                        <Card
                          variant="outlined"
                          sx={{
                            height: "100%",
                            borderLeft: 3,
                            borderLeftColor: "error.main",
                            backgroundColor: "error.50",
                            transition: "box-shadow 0.2s",
                            "&:hover": {
                              boxShadow: 3,
                            },
                          }}
                        >
                          <MDBox p={3} textAlign="center">
                            <Icon sx={{ fontSize: "2.5rem", mb: 1, color: "error.main" }}>trending_up</Icon>
                            <MDTypography variant="caption" color="text.secondary" mb={1} fontWeight="medium">
                              RÉSISTANCE
                            </MDTypography>
                            <MDTypography variant="h3" fontWeight="bold" color="error.main">
                              ${analysis.key_levels_structured.resistance}
                            </MDTypography>
                            <MDTypography variant="caption" color="text.secondary" mt={1}>
                              Niveau de résistance à surveiller
                            </MDTypography>
                          </MDBox>
                        </Card>
                      </Grid>
                    )}
                    {analysis.key_levels_structured.risk_zone && (
                      <Grid item xs={12} sm={6} md={4}>
                        <Card
                          variant="outlined"
                          sx={{
                            height: "100%",
                            borderLeft: 3,
                            borderLeftColor: "warning.main",
                            backgroundColor: "warning.50",
                            transition: "box-shadow 0.2s",
                            "&:hover": {
                              boxShadow: 3,
                            },
                          }}
                        >
                          <MDBox p={3} textAlign="center">
                            <Icon sx={{ fontSize: "2.5rem", mb: 1, color: "warning.main" }}>warning</Icon>
                            <MDTypography variant="caption" color="text.secondary" mb={1} fontWeight="medium">
                              ZONE DE RISQUE
                            </MDTypography>
                            <MDTypography variant="h3" fontWeight="bold" color="warning.main">
                              ${analysis.key_levels_structured.risk_zone}
                            </MDTypography>
                            <MDTypography variant="caption" color="text.secondary" mt={1}>
                              Zone à risque à éviter
                            </MDTypography>
                          </MDBox>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </MDBox>
              )}

              {/* Tous les niveaux clés */}
              {analysis.key_levels && analysis.key_levels.length > 0 && (
                <MDBox>
                  <MDTypography variant="h6" fontWeight="bold" mb={2}>
                    Tous les Niveaux Clés
                  </MDTypography>
                  <MDBox display="flex" gap={1} flexWrap="wrap">
                    {analysis.key_levels.map((level, idx) => (
                      <Chip
                        key={idx}
                        label={`$${level}`}
                        color="primary"
                        size="medium"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                          height: "36px",
                        }}
                      />
                    ))}
                  </MDBox>
                </MDBox>
              )}
            </MDBox>
          )}

          {/* Onglet Rapport */}
          {currentTab === 2 && (
            <MDBox>
              {analysis.report ? (
                <ReportSections report={analysis.report} />
              ) : (
                <MDTypography variant="body2" color="text.secondary">
                  Aucun rapport disponible
                </MDTypography>
              )}
            </MDBox>
          )}

          {/* Onglet Données */}
          {currentTab === 3 && (
            <MDBox>
              {keyMetrics && keyMetrics.length > 0 ? (
                <MDBox>
                  <MDTypography variant="h6" fontWeight="bold" mb={2}>
                    Métriques Clés Utilisées
                  </MDTypography>
                  <DataTable
                    table={{
                      columns: [
                        {
                          Header: "Catégorie",
                          accessor: "category",
                          width: "15%",
                        },
                        {
                          Header: "Métrique",
                          accessor: "label",
                          width: "20%",
                        },
                        {
                          Header: "Valeur",
                          accessor: "value",
                          width: "15%",
                          Cell: ({ value }) => (
                            <MDTypography variant="body2" fontWeight="bold" color="primary">
                              {value}
                            </MDTypography>
                          ),
                        },
                        {
                          Header: "Explication",
                          accessor: "explanation",
                          width: "50%",
                          Cell: ({ value }) => (
                            <MDTypography variant="body2" color="text">
                              {value}
                            </MDTypography>
                          ),
                        },
                      ],
                      rows: keyMetrics,
                    }}
                    canSearch={true}
                    entriesPerPage={{ defaultValue: 20, entries: [10, 20, 50] }}
                    showTotalEntries={true}
                    pagination={{ variant: "gradient", color: "dark" }}
                    isSorted={true}
                    noEndBorder={false}
                  />
                </MDBox>
              ) : (
                <MDTypography variant="body2" color="text.secondary">
                  Aucune métrique disponible
                </MDTypography>
              )}
            </MDBox>
          )}
        </MDBox>
      </Card>

      {/* Modal pour données détaillées */}
      <Dialog
        open={dataModalOpen}
        onClose={() => setDataModalOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h5" fontWeight="bold">
              Données Utilisées pour l&apos;Analyse
            </MDTypography>
            <IconButton onClick={() => setDataModalOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </MDBox>
        </DialogTitle>
        <DialogContent dividers>
          {keyMetrics && keyMetrics.length > 0 ? (
            <MDBox>
              <MDTypography variant="h6" fontWeight="bold" mb={2}>
                Métriques Détaillées avec Explications
              </MDTypography>
              <Grid container spacing={2}>
                {keyMetrics.map((metric, idx) => (
                  <Grid item xs={12} key={idx}>
                    <Card variant="outlined">
                      <MDBox p={2}>
                        <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                          <MDBox>
                            <Chip
                              label={metric.category}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ mb: 1 }}
                            />
                            <MDTypography variant="subtitle2" fontWeight="bold">
                              {metric.label}
                            </MDTypography>
                          </MDBox>
                          <MDTypography variant="h6" fontWeight="bold" color="primary.main">
                            {metric.value}
                          </MDTypography>
                        </MDBox>
                        <MDTypography variant="body2" color="text.secondary">
                          {metric.explanation}
                        </MDTypography>
                      </MDBox>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </MDBox>
          ) : (
            <MDTypography variant="body2" color="text.secondary">
              Aucune donnée disponible
            </MDTypography>
          )}
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setDataModalOpen(false)} color="dark">
            Fermer
          </MDButton>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
}

export default OptionsAnalysis;
