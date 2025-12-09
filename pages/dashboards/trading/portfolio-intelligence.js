/**
 * Portfolio Intelligence - Vue Aladdin
 * Analyse intelligente du portefeuille avec signaux agrégés
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
import { formatCurrency, formatPercentage } from "/utils/formatting";
import withAuth from "/hocs/withAuth";

function PortfolioIntelligence() {
  const [tickers, setTickers] = useState([]);
  const [newTicker, setNewTicker] = useState("");
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Charger les tickers depuis le localStorage ou config
  useEffect(() => {
    const saved = localStorage.getItem("portfolio_tickers");
    if (saved) {
      try {
        setTickers(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading saved tickers:", e);
      }
    }
  }, []);

  // Sauvegarder les tickers
  useEffect(() => {
    if (tickers.length > 0) {
      localStorage.setItem("portfolio_tickers", JSON.stringify(tickers));
    }
  }, [tickers]);

  const loadSignals = useCallback(async () => {
    if (tickers.length === 0) {
      setError("Ajoutez au moins un ticker à votre portefeuille");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/aladdin/portfolio-signals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tickers }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      setSignals(result.data || []);
    } catch (err) {
      console.error("Error loading signals:", err);
      setError(err.message || "Erreur lors du chargement des signaux");
    } finally {
      setLoading(false);
    }
  }, [tickers]);

  const handleAddTicker = () => {
    const ticker = newTicker.toUpperCase().trim();
    if (ticker && !tickers.includes(ticker)) {
      setTickers([...tickers, ticker]);
      setNewTicker("");
    }
  };

  const handleRemoveTicker = (tickerToRemove) => {
    setTickers(tickers.filter(t => t !== tickerToRemove));
  };

  const handleViewDetails = async (ticker) => {
    try {
      setLoading(true);
      setSelectedTicker(ticker);
      
      const response = await fetch(`/api/aladdin/ticker-analysis?symbol=${ticker}`);
      const result = await response.json();
      
      if (result.success) {
        setSelectedTicker({ ...ticker, analysis: result.data });
        setDetailModalOpen(true);
      }
    } catch (err) {
      console.error("Error loading details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculer les stats globales
  const stats = signals.reduce((acc, signal) => {
    if (signal.recommendation) {
      acc.total++;
      if (signal.recommendation.composite_score > 0.4) acc.positive++;
      if (signal.recommendation.composite_score < -0.4) acc.negative++;
      acc.avgScore += signal.recommendation.composite_score || 0;
    }
    return acc;
  }, { total: 0, positive: 0, negative: 0, avgScore: 0 });

  const avgScore = stats.total > 0 ? stats.avgScore / stats.total : 0;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            🧠 Portfolio Intelligence - Aladdin
          </MDTypography>
          <MDTypography variant="body2" color="text.secondary">
            Analyse intelligente de votre portefeuille avec signaux agrégés (Unusual Whales + FMP)
          </MDTypography>
        </MDBox>

        {/* Gestion du portefeuille */}
        <Card sx={{ mb: 3 }}>
          <MDBox p={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              Mon Portefeuille
            </MDTypography>
            <MDBox display="flex" gap={2} mb={2} alignItems="center">
              <MDInput
                label="Ajouter un ticker"
                value={newTicker}
                onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddTicker();
                  }
                }}
                placeholder="Ex: AAPL"
                sx={{ maxWidth: 200 }}
              />
              <MDButton
                variant="gradient"
                color="info"
                onClick={handleAddTicker}
                disabled={!newTicker.trim()}
              >
                <Icon>add</Icon>&nbsp;Ajouter
              </MDButton>
              <MDButton
                variant="gradient"
                color="success"
                onClick={loadSignals}
                disabled={tickers.length === 0 || loading}
              >
                <Icon>analytics</Icon>&nbsp;Analyser
              </MDButton>
            </MDBox>

            {/* Liste des tickers */}
            {tickers.length > 0 && (
              <MDBox display="flex" flexWrap="wrap" gap={1}>
                {tickers.map((ticker) => (
                  <Chip
                    key={ticker}
                    label={ticker}
                    onDelete={() => handleRemoveTicker(ticker)}
                    color="info"
                    variant="outlined"
                  />
                ))}
              </MDBox>
            )}
          </MDBox>
        </Card>

        {/* Statistiques globales */}
        {signals.length > 0 && (
          <MDBox mb={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <MiniStatisticsCard
                  title="Tickers Analysés"
                  count={stats.total}
                  icon={{ color: "info", component: "analytics" }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <MiniStatisticsCard
                  title="Signaux Positifs"
                  count={stats.positive}
                  icon={{ color: "success", component: "trending_up" }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <MiniStatisticsCard
                  title="Signaux Négatifs"
                  count={stats.negative}
                  icon={{ color: "error", component: "trending_down" }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <MiniStatisticsCard
                  title="Score Moyen"
                  count={formatPercentage(avgScore)}
                  icon={{ color: "warning", component: "assessment" }}
                />
              </Grid>
            </Grid>
          </MDBox>
        )}

        {/* Message d'erreur */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tableau des signaux */}
        {loading ? (
          <LinearProgress />
        ) : signals.length > 0 ? (
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Signaux par Ticker ({signals.length})
              </MDTypography>
              <DataTable
                table={{
                  columns: [
                    {
                      Header: "Ticker",
                      accessor: "ticker",
                      width: "10%",
                      Cell: ({ value }) => (
                        <MDTypography variant="body2" fontWeight="bold" color="text">
                          {value}
                        </MDTypography>
                      ),
                    },
                    {
                      Header: "Score Composite",
                      accessor: "recommendation.composite_score",
                      width: "12%",
                      Cell: ({ value }) => {
                        const score = parseFloat(value) || 0;
                        const color = score > 0.4 ? "success" : score < -0.4 ? "error" : "warning";
                        return (
                          <Chip
                            label={formatPercentage(score)}
                            size="small"
                            color={color}
                            variant="filled"
                          />
                        );
                      },
                    },
                    {
                      Header: "Décision",
                      accessor: "recommendation.decision",
                      width: "12%",
                      Cell: ({ value }) => {
                        const colorMap = {
                          "RENFORCER": "success",
                          "SURVEILLER": "warning",
                          "ALLÉGER": "error",
                        };
                        return (
                          <Chip
                            label={value || "N/A"}
                            size="small"
                            color={colorMap[value] || "default"}
                          />
                        );
                      },
                    },
                    {
                      Header: "Options Flow",
                      accessor: "features.options_bullish_score",
                      width: "10%",
                      Cell: ({ value, row }) => {
                        const bullish = parseFloat(value) || 0;
                        const bearish = parseFloat(row.original.features?.options_bearish_score) || 0;
                        const color = bullish > bearish ? "success" : "error";
                        return (
                          <MDTypography variant="body2" color={color} fontWeight="medium">
                            {formatPercentage(bullish - bearish)}
                          </MDTypography>
                        );
                      },
                    },
                    {
                      Header: "Smart Money",
                      accessor: "features.smart_money_score",
                      width: "10%",
                      Cell: ({ value }) => (
                        <MDTypography variant="body2" color="info" fontWeight="medium">
                          {formatPercentage(value || 0)}
                        </MDTypography>
                      ),
                    },
                    {
                      Header: "Insiders",
                      accessor: "features.insider_score",
                      width: "10%",
                      Cell: ({ value }) => {
                        const score = parseFloat(value) || 0;
                        const color = score > 0 ? "success" : score < 0 ? "error" : "text";
                        return (
                          <MDTypography variant="body2" color={color} fontWeight="medium">
                            {formatPercentage(score)}
                          </MDTypography>
                        );
                      },
                    },
                    {
                      Header: "Congress",
                      accessor: "features.congress_buy_score",
                      width: "10%",
                      Cell: ({ value, row }) => {
                        const buy = parseFloat(value) || 0;
                        const sell = parseFloat(row.original.features?.congress_sell_score) || 0;
                        const net = buy - sell;
                        const color = net > 0 ? "success" : net < 0 ? "error" : "text";
                        return (
                          <MDTypography variant="body2" color={color} fontWeight="medium">
                            {formatPercentage(net)}
                          </MDTypography>
                        );
                      },
                    },
                    {
                      Header: "Risque",
                      accessor: "recommendation.risk_level",
                      width: "10%",
                      Cell: ({ value }) => {
                        const colorMap = {
                          "LOW": "success",
                          "MEDIUM": "warning",
                          "HIGH": "error",
                        };
                        return (
                          <Chip
                            label={value || "N/A"}
                            size="small"
                            color={colorMap[value] || "default"}
                            variant="outlined"
                          />
                        );
                      },
                    },
                    {
                      Header: "Actions",
                      width: "10%",
                      Cell: ({ row }) => (
                        <MDButton
                          variant="outlined"
                          color="info"
                          size="small"
                          onClick={() => handleViewDetails(row.original.ticker)}
                        >
                          <Icon>info</Icon>
                        </MDButton>
                      ),
                    },
                  ],
                  rows: signals.sort((a, b) => {
                    const scoreA = a.recommendation?.composite_score || 0;
                    const scoreB = b.recommendation?.composite_score || 0;
                    return scoreB - scoreA;
                  }),
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
        ) : (
          <Card>
            <MDBox p={3} textAlign="center">
              <MDTypography variant="body2" color="text.secondary">
                Ajoutez des tickers à votre portefeuille et cliquez sur "Analyser" pour voir les signaux
              </MDTypography>
            </MDBox>
          </Card>
        )}

        {/* Modal de détails */}
        <Dialog
          open={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <MDBox display="flex" justifyContent="space-between" alignItems="center">
              <MDTypography variant="h6" fontWeight="medium">
                Analyse détaillée - {selectedTicker?.ticker || selectedTicker}
              </MDTypography>
              <MDButton
                iconOnly
                variant="text"
                color="dark"
                onClick={() => setDetailModalOpen(false)}
              >
                <Icon>close</Icon>
              </MDButton>
            </MDBox>
          </DialogTitle>
          <DialogContent dividers>
            {selectedTicker?.analysis ? (
              <MDBox>
                <MDBox mb={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={1}>
                    Recommandation
                  </MDTypography>
                  <Chip
                    label={selectedTicker.analysis.recommendation.decision}
                    color={selectedTicker.analysis.recommendation.decision === "RENFORCER" ? "success" : "warning"}
                    size="large"
                    sx={{ mb: 1 }}
                  />
                  <MDTypography variant="body2" color="text" mb={1}>
                    Score Composite: {formatPercentage(selectedTicker.analysis.recommendation.composite_score)}
                  </MDTypography>
                  <MDTypography variant="body2" color="text" mb={1}>
                    Niveau de Risque: {selectedTicker.analysis.recommendation.risk_level}
                  </MDTypography>
                </MDBox>

                <MDBox mb={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={1}>
                    Raisonnement
                  </MDTypography>
                  <ul>
                    {selectedTicker.analysis.recommendation.reasoning.map((reason, idx) => (
                      <li key={idx}>
                        <MDTypography variant="body2" color="text">
                          {reason}
                        </MDTypography>
                      </li>
                    ))}
                  </ul>
                </MDBox>

                <MDBox mb={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={1}>
                    Actions Recommandées
                  </MDTypography>
                  <ul>
                    {selectedTicker.analysis.recommendation.actions.map((action, idx) => (
                      <li key={idx}>
                        <MDTypography variant="body2" color="text">
                          {action}
                        </MDTypography>
                      </li>
                    ))}
                  </ul>
                </MDBox>

                <MDBox>
                  <MDTypography variant="h6" fontWeight="medium" mb={1}>
                    Scores Détaillés
                  </MDTypography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <MDTypography variant="caption" color="text.secondary">
                        Options Bullish: {formatPercentage(selectedTicker.analysis.features.options_bullish_score)}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={6}>
                      <MDTypography variant="caption" color="text.secondary">
                        Options Unusual: {formatPercentage(selectedTicker.analysis.features.options_unusual_score)}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={6}>
                      <MDTypography variant="caption" color="text.secondary">
                        Smart Money: {formatPercentage(selectedTicker.analysis.features.smart_money_score)}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={6}>
                      <MDTypography variant="caption" color="text.secondary">
                        Insider Score: {formatPercentage(selectedTicker.analysis.features.insider_score)}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={6}>
                      <MDTypography variant="caption" color="text.secondary">
                        Congress Buy: {formatPercentage(selectedTicker.analysis.features.congress_buy_score)}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={6}>
                      <MDTypography variant="caption" color="text.secondary">
                        Momentum: {formatPercentage(selectedTicker.analysis.features.momentum_score)}
                      </MDTypography>
                    </Grid>
                  </Grid>
                </MDBox>
              </MDBox>
            ) : (
              <LinearProgress />
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

export default withAuth(PortfolioIntelligence);

