/**
 * OptionsFiveFactorsAnalysis — version refaite (UX + mapping API)
 * Stack: Creative Tim Material Dashboard (MDBox/MDTypography) + MUI
 *
 * Objectif: qualifier un signal options (pas trading)
 */

import { useEffect, useMemo, useState } from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import Divider from "@mui/material/Divider";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import BarChartIcon from "@mui/icons-material/BarChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import SecurityIcon from "@mui/icons-material/Security";
import PsychologyIcon from "@mui/icons-material/Psychology";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import intelligenceClient from "/lib/api/intelligenceClient";
import DataTable from "/examples/Tables/DataTable";

// ---------- helpers ----------
const safeNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const formatDateFR = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

const formatNumber = (v, decimals = 2) => {
  const n = safeNumber(v);
  if (n === null) return "—";
  return n.toFixed(decimals);
};

const formatInt = (v) => {
  const n = safeNumber(v);
  if (n === null) return "—";
  return n.toLocaleString();
};

const formatPct = (v, decimals = 1) => {
  const n = safeNumber(v);
  if (n === null) return "—";
  return `${n.toFixed(decimals)}%`;
};

// Helper: Flatten JSON object into key-value pairs for table display
const flattenObject = (obj, prefix = "", result = []) => {
  if (obj === null || obj === undefined) {
    result.push({ key: prefix || "root", value: String(obj), originalValue: obj });
    return result;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      result.push({ key: prefix || "root", value: "[] (vide)", originalValue: obj });
    } else {
      obj.forEach((item, index) => {
        const newKey = prefix ? `${prefix}[${index}]` : `[${index}]`;
        if (typeof item === "object" && item !== null) {
          flattenObject(item, newKey, result);
        } else {
          result.push({ key: newKey, value: formatValue(item), originalValue: item });
        }
      });
    }
    return result;
  }

  if (typeof obj === "object") {
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      result.push({ key: prefix || "root", value: "{} (vide)", originalValue: obj });
    } else {
      keys.forEach((key) => {
        const newKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          flattenObject(value, newKey, result);
        } else if (Array.isArray(value)) {
          flattenObject(value, newKey, result);
        } else {
          result.push({ key: newKey, value: formatValue(value), originalValue: value });
        }
      });
    }
    return result;
  }

  result.push({ key: prefix || "root", value: formatValue(obj), originalValue: obj });
  return result;
};

const formatValue = (value) => {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    // Format large numbers with locale string
    if (Math.abs(value) >= 1000) {
      return value.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
    }
    return value.toString();
  }
  if (typeof value === "string") {
    // Truncate very long strings
    if (value.length > 100) {
      return `${value.substring(0, 100)}...`;
    }
    return value;
  }
  return String(value);
};

function OptionsFiveFactorsAnalysis({ ticker, refresh = true, onAnalysisComplete }) {
  const [payload, setPayload] = useState(null); // {success, ticker, data, analysis, timestamp}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // reset on ticker/refresh
  useEffect(() => {
    setPayload(null);
    setLoading(false);
    setError(null);
  }, [ticker, refresh]);

  useEffect(() => {
    if (!ticker) return;

    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError(null);

        const res = await intelligenceClient.getOptionsFiveFactors(ticker, refresh);

        if (cancelled) return;

        setPayload(res);
        if (onAnalysisComplete) onAnalysisComplete(res);
      } catch (err) {
        if (cancelled) return;
        const msg =
          err?.message?.includes("503")
            ? "Service temporairement indisponible. Réessaie dans quelques instants."
            : err?.message || "Erreur lors du chargement de l'analyse.";
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [ticker, refresh, onAnalysisComplete]);

  // --------- derived UI meta ---------
  const analysis = payload?.analysis;
  const data = payload?.data;

  const signalQualityMeta = useMemo(() => {
    const q = analysis?.signal_quality;
    if (!q) return null;
    if (q === "high") return { label: "🟢 Clear Signal", color: "success" };
    if (q === "medium") return { label: "🟡 Mixed / Caution", color: "warning" };
    if (q === "low") return { label: "🔴 Non exploitable", color: "error" };
    return { label: String(q), color: "default" };
  }, [analysis?.signal_quality]);

  const intentMeta = useMemo(() => {
    const intent = analysis?.dominant_intent;
    if (!intent) return null;

    const map = {
      hedging: { label: "🛡 Hedging", Icon: SecurityIcon },
      speculation: { label: "🎯 Speculation", Icon: PsychologyIcon },
      gamma_management: { label: "⚙️ Gamma Management", Icon: SettingsIcon },
      mixed: { label: "⚠️ Mixed", Icon: HelpOutlineIcon },
    };

    return map[intent] || { label: String(intent), Icon: InfoIcon };
  }, [analysis?.dominant_intent]);

  const freshnessMeta = useMemo(() => {
    const days = safeNumber(analysis?.data_quality?.staleness?.days_old);
    if (days === null) return null;
    if (days < 1) return { label: "🟢 Updated < 24h", color: "success" };
    if (days <= 3) return { label: "🟡 1-3 days", color: "warning" };
    return { label: "🔴 Stale", color: "error" };
  }, [analysis?.data_quality?.staleness?.days_old]);

  // TL;DR bullets (max 3)
  const tldr = useMemo(() => {
    const w = Array.isArray(analysis?.why_this_is_not_a_clear_signal)
      ? analysis.why_this_is_not_a_clear_signal
      : [];
    const r = Array.isArray(analysis?.risks) ? analysis.risks : [];

    const bullets = w.length ? w : r.length ? r : analysis?.observation ? [analysis.observation] : [];
    return bullets.slice(0, 3);
  }, [analysis]);

  // ---------- Core snapshot cards ----------
  const coreCards = useMemo(() => {
    const cards = [];

    // 1) Flow
    const cpr = safeNumber(data?.recent_flows?.call_put_ratio);
    const callVol = safeNumber(data?.recent_flows?.call_volume);
    const putVol = safeNumber(data?.recent_flows?.put_volume);
    const direction = data?.recent_flows?.direction;

    if (cpr !== null || callVol !== null || putVol !== null || direction) {
      const lines = [];

      if (cpr !== null) {
        const interp = cpr > 1.5 ? "calls dominants" : cpr < 0.67 ? "puts dominants" : "équilibré";
        lines.push(`Call/Put ratio: ${cpr.toFixed(2)} (${interp})`);
      }
      if (direction) lines.push(`Direction: ${direction}`);
      if (callVol !== null && putVol !== null) {
        lines.push(`Vol: calls ${callVol.toLocaleString()} / puts ${putVol.toLocaleString()}`);
      }

      cards.push({
        label: "Flow",
        Icon: cpr !== null && cpr < 1 ? TrendingDownIcon : TrendingUpIcon,
        lines,
      });
    }

    // 2) OI Change
    const totalChange = safeNumber(data?.oi_change?.total_change);
    const callChange = safeNumber(data?.oi_change?.call_oi_change);
    const putChange = safeNumber(data?.oi_change?.put_oi_change);

    if (totalChange !== null || callChange !== null || putChange !== null) {
      const lines = [];
      if (totalChange !== null) lines.push(`Total ΔOI: ${totalChange.toLocaleString()}`);
      if (callChange !== null && putChange !== null) {
        lines.push(`ΔOI calls ${callChange.toLocaleString()} / puts ${putChange.toLocaleString()}`);
      }
      cards.push({ label: "OI Change", Icon: BarChartIcon, lines });
    }

    // 3) IV Rank
    const iv1y = safeNumber(data?.iv_rank?.iv_rank_1y);
    const vol = safeNumber(data?.iv_rank?.volatility);

    if (iv1y !== null || vol !== null) {
      const lines = [];
      if (iv1y !== null) {
        const interp = iv1y < 30 ? "IV basse → options peu chères" : iv1y > 70 ? "IV élevée → options chères" : "IV modérée";
        lines.push(`IV Rank (1y): ${iv1y.toFixed(2)}% (${interp})`);
      }
      if (vol !== null) lines.push(`IV (volatility): ${(vol * 100).toFixed(1)}%`);
      cards.push({ label: "IV Rank", Icon: ShowChartIcon, lines });
    }

    // 4) Max Pain (nearest)
    const spot = safeNumber(data?.max_pain?.current_spot);
    const nearest = data?.max_pain?.nearest_expiry;
    const mp = safeNumber(nearest?.max_pain);
    const exp = nearest?.expiry;

    if (spot !== null || mp !== null) {
      const lines = [];
      if (exp) lines.push(`Nearest expiry: ${exp}`);
      if (spot !== null) lines.push(`Spot: ${spot.toFixed(2)}`);
      if (mp !== null) lines.push(`Max pain: ${mp.toFixed(2)}`);

      if (spot !== null && mp !== null && spot > 0) {
        const distPct = Math.abs(mp - spot) / spot;
        const pinRisk = distPct <= 0.02; // 2%
        lines.push(`Distance: ${(distPct * 100).toFixed(2)}% (${pinRisk ? "pin risk élevé" : "pin risk modéré"})`);
      }

      cards.push({ label: "Max Pain", Icon: WarningIcon, lines });
    }

    return cards.slice(0, 4);
  }, [data]);

  // ---------- render states ----------
  if (!ticker) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Sélectionne un ticker pour lancer l&apos;analyse.
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <Skeleton variant="text" width="55%" height={34} />
          <Skeleton variant="text" width="35%" height={20} />
          <Skeleton variant="rectangular" width="100%" height={220} sx={{ mt: 2, borderRadius: 1 }} />
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

  // API says success=false
  if (payload && payload.success === false) {
    return (
      <Card>
        <MDBox p={3}>
          <Alert severity="info" icon={<InfoIcon />}>
            <MDTypography variant="body2" fontWeight="bold" mb={0.5}>
              {payload.message || "Analyse indisponible"}
            </MDTypography>
            {payload.hint ? (
              <MDTypography variant="caption" color="text">
                {payload.hint}
              </MDTypography>
            ) : null}
          </Alert>
        </MDBox>
      </Card>
    );
  }

  if (!payload || !analysis) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Aucune analyse disponible pour {ticker}.
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  const asOf = data?.as_of || payload?.timestamp;
  const IntentIcon = intentMeta?.Icon;

  return (
    <Card>
      <MDBox p={3}>
        {/* 🥇 NIVEAU 1 — DÉCISION RAPIDE (≤ 5 secondes) */}
        <MDBox mb={4}>
          {/* Header: Ticker + Date */}
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
            <MDBox>
              <MDTypography variant="h4" fontWeight="bold">
                {ticker}
              </MDTypography>
              {asOf && (
                <MDTypography variant="caption" color="text">
                  Données au {formatDateFR(asOf)}
                </MDTypography>
              )}
            </MDBox>
            {freshnessMeta && (
              <Chip
                label={freshnessMeta.label}
                color={freshnessMeta.color}
                size="small"
                variant="outlined"
              />
            )}
          </MDBox>

          {/* Signal Badge (ULTRA IMPORTANT) */}
          {signalQualityMeta && (
            <MDBox mb={2}>
              <Chip
                label={signalQualityMeta.label}
                color={signalQualityMeta.color}
                size="large"
                sx={{ fontSize: "1rem", fontWeight: "bold", py: 2, px: 1 }}
              />
            </MDBox>
          )}

          {/* Intent Badge */}
          {intentMeta && IntentIcon && (
            <MDBox mb={2}>
              <Chip
                icon={<IntentIcon />}
                label={intentMeta.label}
                variant="outlined"
                size="medium"
              />
            </MDBox>
          )}

          {/* TL;DR (2-3 lignes MAX) */}
          {tldr.length > 0 && (
            <MDBox
              sx={{
                p: 2,
                borderRadius: 1,
                backgroundColor: "grey.50",
                borderLeft: 3,
                borderColor:
                  signalQualityMeta?.color === "error"
                    ? "error.main"
                    : signalQualityMeta?.color === "warning"
                    ? "warning.main"
                    : "info.main",
              }}
            >
              <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                Pourquoi je dois être prudent / confiant :
              </MDTypography>
              {tldr.map((point, idx) => (
                <MDTypography key={idx} variant="body2" color="text" sx={{ mb: 0.5 }}>
                  • {point}
                </MDTypography>
              ))}
            </MDBox>
          )}
        </MDBox>

        {/* 🥈 NIVEAU 2 — POURQUOI (analyse guidée) */}

        {/* Bloc 1 — Options Core */}
        {coreCards.length > 0 && (
          <MDBox mb={4}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Options Core
            </MDTypography>
            <Grid container spacing={2}>
              {coreCards.map((card, idx) => {
                const IconComponent = card.Icon;
                return (
                  <Grid item xs={12} sm={6} md={3} key={idx}>
                    <Card variant="outlined" sx={{ height: "100%" }}>
                      <MDBox p={2} display="flex" flexDirection="column" gap={1}>
                        <MDBox display="flex" alignItems="center" gap={1}>
                          <IconComponent fontSize="small" color="primary" />
                          <MDTypography variant="subtitle2" fontWeight="bold">
                            {card.label}
                          </MDTypography>
                        </MDBox>
                        {card.lines.map((line, lineIdx) => (
                          <MDTypography key={lineIdx} variant="body2" color="text">
                            {line}
                          </MDTypography>
                        ))}
                      </MDBox>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </MDBox>
        )}

        {/* Bloc 2 — Zones sensibles */}
        {analysis.zones_to_watch && analysis.zones_to_watch.length > 0 && (
          <MDBox mb={4}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Zones sensibles
            </MDTypography>
            <Grid container spacing={2}>
              {analysis.zones_to_watch.map((zone, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <Card variant="outlined">
                    <MDBox p={2}>
                      <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                        {zone.label || `Zone ${idx + 1}`}
                      </MDTypography>
                      <MDTypography variant="h6" color="primary.main" mb={1}>
                        {zone.zone}
                      </MDTypography>
                      {zone.reason && (
                        <MDTypography variant="body2" color="text">
                          {zone.reason}
                        </MDTypography>
                      )}
                    </MDBox>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </MDBox>
        )}

        {/* Bloc 3 — "Pourquoi ce signal peut tromper" */}
        {(analysis.why_this_is_not_a_clear_signal && analysis.why_this_is_not_a_clear_signal.length > 0) ||
        (analysis.risks && analysis.risks.length > 0) ? (
          <MDBox
            mb={4}
            sx={{
              p: 2,
              borderRadius: 1,
              backgroundColor: "error.50",
              borderLeft: 4,
              borderColor: "error.main",
            }}
          >
            <MDBox display="flex" alignItems="center" gap={1} mb={1.5}>
              <WarningIcon color="error" />
              <MDTypography variant="h6" fontWeight="bold" color="error.main">
                Pourquoi ce signal peut tromper
              </MDTypography>
            </MDBox>
            {analysis.why_this_is_not_a_clear_signal && analysis.why_this_is_not_a_clear_signal.length > 0 && (
              <MDBox mb={2}>
                {analysis.why_this_is_not_a_clear_signal.map((item, idx) => (
                  <MDTypography key={idx} variant="body2" color="text" sx={{ mb: 0.75 }}>
                    • {item}
                  </MDTypography>
                ))}
              </MDBox>
            )}
            {analysis.risks && analysis.risks.length > 0 && (
              <MDBox>
                {analysis.risks.map((risk, idx) => (
                  <MDTypography key={idx} variant="body2" color="text" sx={{ mb: 0.75 }}>
                    • {risk}
                  </MDTypography>
                ))}
              </MDBox>
            )}
          </MDBox>
        ) : null}

        {/* 🥉 NIVEAU 3 — DÉTAILS (OPTIONNEL / COLLAPSABLE) */}
        <Accordion defaultExpanded={false}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <MDTypography variant="subtitle2" fontWeight="bold">
              Détails avancés (power users)
            </MDTypography>
          </AccordionSummary>
          <AccordionDetails>
            <MDBox>
              {/* Evidence */}
              {analysis.evidence && analysis.evidence.length > 0 && (
                <MDBox mb={3}>
                  <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                    How this analysis was built
                  </MDTypography>
                  {analysis.evidence.map((evidence, idx) => {
                    const parts = evidence.split(":");
                    const type = parts[0]?.trim();
                    const content = parts.slice(1).join(":").trim();
                    return (
                      <MDBox key={idx} mb={1}>
                        <MDTypography variant="caption" fontWeight="bold" color="primary.main">
                          {type?.toUpperCase() || `Élément ${idx + 1}`}:
                        </MDTypography>
                        <MDTypography variant="body2" color="text">
                          {content || evidence}
                        </MDTypography>
                      </MDBox>
                    );
                  })}
                </MDBox>
              )}

              {/* Missing data */}
              {analysis.data_quality?.missing && analysis.data_quality.missing.length > 0 && (
                <MDBox mb={3}>
                  <Alert severity="info" icon={<InfoIcon />}>
                    <MDTypography variant="body2" fontWeight="bold" mb={0.5}>
                      Données partielles
                    </MDTypography>
                    <MDTypography variant="caption" color="text">
                      Modules manquants: {analysis.data_quality.missing.join(", ")}
                    </MDTypography>
                  </Alert>
                </MDBox>
              )}

              {/* JSON brut - DataTable format */}
              {data && (
                <MDBox>
                  <MDTypography variant="subtitle2" fontWeight="bold" mb={2}>
                    Données brutes
                  </MDTypography>
                  <DataTable
                    table={{
                      columns: [
                        {
                          Header: "Clé",
                          accessor: "key",
                          width: "35%",
                          Cell: ({ value }) => (
                            <MDTypography
                              variant="body2"
                              fontWeight="medium"
                              color="text"
                              sx={{
                                fontFamily: "monospace",
                                wordBreak: "break-word",
                                fontSize: "0.875rem",
                              }}
                            >
                              {value}
                            </MDTypography>
                          ),
                        },
                        {
                          Header: "Valeur",
                          accessor: "value",
                          width: "65%",
                          Cell: ({ value, row }) => {
                            const originalValue = row.original.originalValue;
                            const isNumber = typeof originalValue === "number";
                            const isBoolean = typeof originalValue === "boolean";
                            const isNull = originalValue === null;
                            const isUndefined = originalValue === undefined;

                            return (
                              <MDTypography
                                variant="body2"
                                color="text"
                                sx={{
                                  fontFamily: isNumber || isBoolean || isNull || isUndefined ? "monospace" : "inherit",
                                  wordBreak: "break-word",
                                  whiteSpace: "pre-wrap",
                                  fontSize: "0.875rem",
                                }}
                              >
                                {value}
                              </MDTypography>
                            );
                          },
                        },
                      ],
                      rows: flattenObject(data).map((item) => ({
                        key: item.key,
                        value: item.value,
                        originalValue: item.originalValue,
                      })),
                    }}
                    canSearch={true}
                    entriesPerPage={{ defaultValue: 20, entries: [10, 20, 50, 100] }}
                    showTotalEntries={true}
                    pagination={{ variant: "gradient", color: "dark" }}
                    isSorted={true}
                    noEndBorder={false}
                  />
                </MDBox>
              )}
            </MDBox>
          </AccordionDetails>
        </Accordion>
      </MDBox>
    </Card>
  );
}

export default OptionsFiveFactorsAnalysis;
