/**
 * Guru Flow Tracker - Détection des Mouvements Institutionnels
 * 
 * Détecte les ventes institutionnelles AVANT la publication des 13F
 * Analyse: options flow, dark pools, volumes, patterns
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
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import MDButton from "/components/MDButton";
import MDInput from "/components/MDInput";
import DataTable from "/examples/Tables/DataTable";
import MiniStatisticsCard from "/examples/Cards/StatisticsCards/MiniStatisticsCard";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Tooltip from "@mui/material/Tooltip";
import { formatCurrency, formatPercentage, formatVolume } from "/utils/formatting";
import withAuth from "/hocs/withAuth";

function GuruFlowTracker() {
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [detection, setDetection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistDetections, setWatchlistDetections] = useState([]);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  // Charger la watchlist depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem("guru_flow_watchlist");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setWatchlist(parsed);
      } catch (e) {
        console.error("Error loading watchlist:", e);
      }
    }
  }, []);

  // Sauvegarder la watchlist
  useEffect(() => {
    if (watchlist.length > 0) {
      localStorage.setItem("guru_flow_watchlist", JSON.stringify(watchlist));
    }
  }, [watchlist]);

  const analyzeSymbol = async () => {
    if (!selectedSymbol.trim()) {
      setError("Veuillez entrer un symbole");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/aladdin/guru-flow?symbol=${selectedSymbol.toUpperCase()}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      setDetection(result.data);
    } catch (err) {
      console.error("Error analyzing symbol:", err);
      setError(err.message || "Erreur lors de l'analyse");
    } finally {
      setLoading(false);
    }
  };

  const scanWatchlist = async () => {
    if (watchlist.length === 0) {
      setError("Ajoutez des symboles à votre watchlist");
      return;
    }

    try {
      setWatchlistLoading(true);
      setError(null);

      const response = await fetch("/api/aladdin/guru-flow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tickers: watchlist }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      setWatchlistDetections(result.data || []);
    } catch (err) {
      console.error("Error scanning watchlist:", err);
      setError(err.message || "Erreur lors du scan");
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleAddToWatchlist = () => {
    const symbol = selectedSymbol.toUpperCase().trim();
    if (symbol && !watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
    }
  };

  const handleRemoveFromWatchlist = (symbol) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
  };

  const getPatternColor = (pattern) => {
    const colorMap = {
      "BLOCK_TRADE": "error",
      "VWAP": "warning",
      "OPTIONS_HEDGE": "info",
      "AGGRESSIVE": "error",
      "NORMAL": "default",
    };
    return colorMap[pattern] || "default";
  };

  const getPatternLabel = (pattern) => {
    const labelMap = {
      "BLOCK_TRADE": "Bloc Institutionnel",
      "VWAP": "Vente Progressive (VWAP)",
      "OPTIONS_HEDGE": "Hedge Options",
      "AGGRESSIVE": "Vente Agressive",
      "NORMAL": "Normal",
    };
    return labelMap[pattern] || pattern;
  };

  const getUrgencyColor = (urgency) => {
    const colorMap = {
      "HIGH": "error",
      "MEDIUM": "warning",
      "LOW": "success",
    };
    return colorMap[urgency] || "default";
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            🔥 Guru Flow Tracker
          </MDTypography>
          <MDTypography variant="body2" color="text.secondary">
            Détection des mouvements institutionnels AVANT la publication des 13F
          </MDTypography>
        </MDBox>

        {/* Analyse d'un symbole */}
        <Card sx={{ mb: 3 }}>
          <MDBox p={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Analyser un Symbole
            </MDTypography>
            <MDBox display="flex" gap={2} alignItems="center" mb={2}>
              <MDInput
                label="Symbole"
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    analyzeSymbol();
                  }
                }}
                placeholder="Ex: TSLA"
                sx={{ maxWidth: 200 }}
              />
              <MDButton
                variant="gradient"
                color="info"
                onClick={analyzeSymbol}
                disabled={!selectedSymbol.trim() || loading}
              >
                <Icon>search</Icon>&nbsp;Analyser
              </MDButton>
              <MDButton
                variant="outlined"
                color="success"
                onClick={handleAddToWatchlist}
                disabled={!selectedSymbol.trim() || watchlist.includes(selectedSymbol.toUpperCase())}
              >
                <Icon>add</Icon>&nbsp;Ajouter à Watchlist
              </MDButton>
            </MDBox>

            {/* Watchlist */}
            {watchlist.length > 0 && (
              <MDBox mb={2}>
                <MDTypography variant="caption" color="text.secondary" display="block" mb={1}>
                  Watchlist ({watchlist.length})
                </MDTypography>
                <MDBox display="flex" flexWrap="wrap" gap={1} mb={2}>
                  {watchlist.map((symbol) => (
                    <Chip
                      key={symbol}
                      label={symbol}
                      onDelete={() => handleRemoveFromWatchlist(symbol)}
                      color="info"
                      variant="outlined"
                    />
                  ))}
                </MDBox>
                <MDButton
                  variant="gradient"
                  color="warning"
                  onClick={scanWatchlist}
                  disabled={watchlistLoading}
                  size="small"
                >
                  <Icon>scanner</Icon>&nbsp;Scanner Watchlist
                </MDButton>
              </MDBox>
            )}
          </MDBox>
        </Card>

        {/* Message d'erreur */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Résultats de l'analyse */}
        {loading ? (
          <LinearProgress />
        ) : detection ? (
          <Grid container spacing={3}>
            {/* Statistiques */}
            <Grid item xs={12} md={3}>
              <MiniStatisticsCard
                title="Score de Vente"
                count={formatPercentage(detection.sellingScore || 0)}
                icon={{ color: detection.sellingScore > 0.5 ? "error" : "info", component: "trending_down" }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <MiniStatisticsCard
                title="Confiance"
                count={formatPercentage(detection.confidence || 0)}
                icon={{ color: detection.confidence > 0.7 ? "success" : "warning", component: "assessment" }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <MiniStatisticsCard
                title="Pattern"
                count={getPatternLabel(detection.sellingPattern || "NORMAL")}
                icon={{ color: getPatternColor(detection.sellingPattern), component: "pattern" }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <MiniStatisticsCard
                title="Urgence"
                count={detection.recommendation?.urgency || "LOW"}
                icon={{ color: getUrgencyColor(detection.recommendation?.urgency), component: "warning" }}
              />
            </Grid>

            {/* Détails */}
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Détection pour {detection.symbol}
                  </MDTypography>

                  {/* Recommandation */}
                  <Alert 
                    severity={detection.recommendation?.urgency === "HIGH" ? "error" : detection.recommendation?.urgency === "MEDIUM" ? "warning" : "info"}
                    sx={{ mb: 3 }}
                  >
                    <MDTypography variant="h6" fontWeight="medium" mb={1}>
                      {detection.recommendation?.action}
                    </MDTypography>
                    <MDTypography variant="body2">
                      {detection.recommendation?.message}
                    </MDTypography>
                  </Alert>

                  {/* Signaux */}
                  <MDBox mb={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Signaux Détectés
                    </MDTypography>
                    <Grid container spacing={2}>
                      {/* Options Flow */}
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <MDBox p={2}>
                            <MDTypography variant="subtitle2" fontWeight="medium" mb={1}>
                              Options Flow
                            </MDTypography>
                            <MDTypography variant="body2" color="text.secondary" mb={1}>
                              Put/Call Ratio: {detection.signals?.options?.putCallRatio?.toFixed(2) || "N/A"}
                            </MDTypography>
                            <MDTypography variant="body2" color="text.secondary" mb={1}>
                              Alerts: {detection.signals?.options?.totalAlerts || 0}
                            </MDTypography>
                            <Chip
                              label={detection.signals?.options?.sellingSignal ? "Signal de Vente" : "Pas de Signal"}
                              size="small"
                              color={detection.signals?.options?.sellingSignal ? "error" : "default"}
                            />
                          </MDBox>
                        </Card>
                      </Grid>

                      {/* Dark Pool */}
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <MDBox p={2}>
                            <MDTypography variant="subtitle2" fontWeight="medium" mb={1}>
                              Dark Pool Activity
                            </MDTypography>
                            <MDTypography variant="body2" color="text.secondary" mb={1}>
                              Trades: {detection.signals?.darkPool?.totalTrades || 0}
                            </MDTypography>
                            <MDTypography variant="body2" color="text.secondary" mb={1}>
                              Pattern: {getPatternLabel(detection.signals?.darkPool?.pattern || "NORMAL")}
                            </MDTypography>
                            <Chip
                              label={detection.signals?.darkPool?.sellingSignal ? "Signal de Vente" : "Pas de Signal"}
                              size="small"
                              color={detection.signals?.darkPool?.sellingSignal ? "error" : "default"}
                            />
                          </MDBox>
                        </Card>
                      </Grid>

                      {/* Volume */}
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <MDBox p={2}>
                            <MDTypography variant="subtitle2" fontWeight="medium" mb={1}>
                              Volume Anomalies
                            </MDTypography>
                            <MDTypography variant="body2" color="text.secondary" mb={1}>
                              Ratio: {detection.signals?.volume?.volumeRatio?.toFixed(2) || "N/A"}x
                            </MDTypography>
                            <MDTypography variant="body2" color="text.secondary" mb={1}>
                              Pattern: {detection.signals?.volume?.details?.pattern || "NORMAL"}
                            </MDTypography>
                            <Chip
                              label={detection.signals?.volume?.sellingSignal ? "Signal de Vente" : "Pas de Signal"}
                              size="small"
                              color={detection.signals?.volume?.sellingSignal ? "error" : "default"}
                            />
                          </MDBox>
                        </Card>
                      </Grid>

                      {/* Price/Volume Pattern */}
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <MDBox p={2}>
                            <MDTypography variant="subtitle2" fontWeight="medium" mb={1}>
                              Price/Volume Pattern
                            </MDTypography>
                            <MDTypography variant="body2" color="text.secondary" mb={1}>
                              Pattern: {getPatternLabel(detection.signals?.priceVolume?.pattern || "NORMAL")}
                            </MDTypography>
                            <MDTypography variant="body2" color="text.secondary" mb={1}>
                              Trend: {detection.signals?.priceVolume?.details?.priceTrend?.toFixed(2) || "N/A"}%
                            </MDTypography>
                            <Chip
                              label={detection.signals?.priceVolume?.pattern !== "NORMAL" ? "Pattern Détecté" : "Normal"}
                              size="small"
                              color={detection.signals?.priceVolume?.pattern !== "NORMAL" ? "warning" : "default"}
                            />
                          </MDBox>
                        </Card>
                      </Grid>
                    </Grid>
                  </MDBox>

                  <MDButton
                    variant="outlined"
                    color="info"
                    onClick={() => setDetailModalOpen(true)}
                  >
                    <Icon>info</Icon>&nbsp;Voir Détails Complets
                  </MDButton>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        ) : null}

        {/* Résultats Watchlist */}
        {watchlistDetections.length > 0 && (
          <Card sx={{ mt: 3 }}>
            <MDBox p={3}>
              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Résultats Watchlist ({watchlistDetections.length})
              </MDTypography>
              <DataTable
                table={{
                  columns: [
                    {
                      Header: "Symbole",
                      accessor: "symbol",
                      width: "10%",
                    },
                    {
                      Header: "Score Vente",
                      accessor: "sellingScore",
                      width: "12%",
                      Cell: ({ value }) => {
                        const score = parseFloat(value) || 0;
                        return (
                          <Chip
                            label={formatPercentage(score)}
                            size="small"
                            color={score > 0.7 ? "error" : score > 0.4 ? "warning" : "default"}
                            variant="filled"
                          />
                        );
                      },
                    },
                    {
                      Header: "Pattern",
                      accessor: "sellingPattern",
                      width: "15%",
                      Cell: ({ value }) => (
                        <Chip
                          label={getPatternLabel(value || "NORMAL")}
                          size="small"
                          color={getPatternColor(value)}
                          variant="outlined"
                        />
                      ),
                    },
                    {
                      Header: "Confiance",
                      accessor: "confidence",
                      width: "12%",
                      Cell: ({ value }) => formatPercentage(value || 0),
                    },
                    {
                      Header: "Urgence",
                      accessor: "recommendation.urgency",
                      width: "12%",
                      Cell: ({ value }) => (
                        <Chip
                          label={value || "LOW"}
                          size="small"
                          color={getUrgencyColor(value)}
                        />
                      ),
                    },
                    {
                      Header: "Options",
                      accessor: "signals.options.sellingSignal",
                      width: "10%",
                      Cell: ({ value }) => (
                        <Chip
                          label={value ? "Oui" : "Non"}
                          size="small"
                          color={value ? "error" : "default"}
                          variant="outlined"
                        />
                      ),
                    },
                    {
                      Header: "Dark Pool",
                      accessor: "signals.darkPool.sellingSignal",
                      width: "10%",
                      Cell: ({ value }) => (
                        <Chip
                          label={value ? "Oui" : "Non"}
                          size="small"
                          color={value ? "error" : "default"}
                          variant="outlined"
                        />
                      ),
                    },
                    {
                      Header: "Volume",
                      accessor: "signals.volume.sellingSignal",
                      width: "10%",
                      Cell: ({ value }) => (
                        <Chip
                          label={value ? "Oui" : "Non"}
                          size="small"
                          color={value ? "error" : "default"}
                          variant="outlined"
                        />
                      ),
                    },
                  ],
                  rows: watchlistDetections.filter(d => !d.error),
                }}
                canSearch={true}
                entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
                showTotalEntries={true}
                pagination={{ variant: "gradient", color: "dark" }}
                isSorted={true}
                noEndBorder={false}
              />
            </MDBox>
          </Card>
        )}

        {/* Modal Détails */}
        <Dialog
          open={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <MDTypography variant="h6" fontWeight="medium">
              Détails Complets - {detection?.symbol}
            </MDTypography>
          </DialogTitle>
          <DialogContent dividers>
            {detection && (
              <MDBox>
                <pre style={{ fontSize: "12px", overflow: "auto" }}>
                  {JSON.stringify(detection, null, 2)}
                </pre>
              </MDBox>
            )}
          </DialogContent>
          <DialogActions>
            <MDButton onClick={() => setDetailModalOpen(false)} color="dark">
              Fermer
            </MDButton>
          </DialogActions>
        </Dialog>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default withAuth(GuruFlowTracker);

