import { useState, useEffect, useMemo } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import LinearProgress from "@mui/material/LinearProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";
import MiniStatisticsCard from "/examples/Cards/StatisticsCards/MiniStatisticsCard";
import unusualWhalesClient from "/lib/unusual-whales/client";

function formatNumber(num, decimals = 4) {
  if (!num && num !== 0) return "0";
  const n = parseFloat(num);
  if (isNaN(n)) return "0";
  return (n * 100).toFixed(decimals) + "%";
}

function getCorrelationColor(correlation) {
  const corr = parseFloat(correlation);
  if (isNaN(corr)) return "default";
  if (corr >= 0.7) return "error"; // Forte corrélation positive (rouge)
  if (corr >= 0.3) return "warning"; // Corrélation modérée (orange)
  if (corr >= -0.3) return "info"; // Faible corrélation (bleu)
  if (corr >= -0.7) return "success"; // Corrélation négative modérée (vert)
  return "error"; // Forte corrélation négative (rouge)
}

function getCorrelationLabel(correlation) {
  const corr = parseFloat(correlation);
  if (isNaN(corr)) return "N/A";
  if (corr >= 0.7) return "Forte corrélation positive";
  if (corr >= 0.3) return "Corrélation modérée positive";
  if (corr >= -0.3) return "Faible corrélation";
  if (corr >= -0.7) return "Corrélation négative modérée";
  return "Forte corrélation négative";
}

function Correlations({ tickers = "", interval = "1Y", onError = () => {}, onLoading = () => {} }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedInterval, setSelectedInterval] = useState(interval);

  useEffect(() => {
    if (!tickers || tickers.trim() === "") {
      setData([]);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        onLoading(true);
        setError(null);
        
        const tickersList = tickers.split(",").map(t => t.trim().toUpperCase()).filter(t => t);
        if (tickersList.length < 2) {
          throw new Error("Au moins 2 tickers sont requis");
        }
        
        const tickersStr = tickersList.join(",");
        console.log("Fetching correlations for:", tickersStr, "with interval:", selectedInterval);
        
        const response = await unusualWhalesClient.getCorrelations(tickersStr, {
          interval: selectedInterval,
        });
        
        console.log("Correlations API response:", response);
        
        // L'API retourne { data: [...] }
        const extracted = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
        
        if (extracted.length === 0) {
          console.warn("No correlation data returned. Response:", response);
          throw new Error("Aucune donnée de corrélation disponible. Vérifiez que les tickers sont valides et qu'il existe des données historiques.");
        }
        
        setData(extracted);
      } catch (err) {
        console.error("Error loading correlations:", err);
        const errMsg = err.message || "Erreur lors du chargement";
        setError(errMsg);
        onError(errMsg);
        setData([]);
      } finally {
        setLoading(false);
        onLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickers, selectedInterval]);

  // Créer une matrice de corrélations unique (une seule entrée par paire)
  // TOUS LES HOOKS DOIVENT ÊTRE AVANT LES RETURNS CONDITIONNELS
  const uniqueCorrelations = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const seen = new Set();
    const unique = [];
    
    data.forEach((item) => {
      const pair = [item.fst, item.snd].sort().join("-");
      if (!seen.has(pair)) {
        seen.add(pair);
        unique.push(item);
      }
    });
    
    return unique.sort((a, b) => {
      const corrA = parseFloat(a.correlation);
      const corrB = parseFloat(b.correlation);
      return Math.abs(corrB) - Math.abs(corrA); // Trier par valeur absolue décroissante
    });
  }, [data]);

  // Extraire tous les tickers uniques
  const allTickers = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const tickerSet = new Set();
    data.forEach((item) => {
      tickerSet.add(item.fst);
      tickerSet.add(item.snd);
    });
    return Array.from(tickerSet).sort();
  }, [data]);

  // Créer une matrice de corrélations pour l'affichage
  const correlationMatrix = useMemo(() => {
    if (!data || data.length === 0 || allTickers.length === 0) return {};
    
    const matrix = {};
    allTickers.forEach((ticker) => {
      matrix[ticker] = {};
      allTickers.forEach((otherTicker) => {
        if (ticker === otherTicker) {
          matrix[ticker][otherTicker] = 1.0; // Auto-corrélation = 1
        } else {
          const correlation = data.find(
            (item) =>
              (item.fst === ticker && item.snd === otherTicker) ||
              (item.fst === otherTicker && item.snd === ticker)
          );
          matrix[ticker][otherTicker] = correlation
            ? parseFloat(correlation.correlation)
            : null;
        }
      });
    });
    return matrix;
  }, [data, allTickers]);

  // Maintenant on peut faire les returns conditionnels
  if (!tickers || tickers.trim() === "") {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Veuillez sélectionner au moins 2 tickers pour voir les corrélations.
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <LinearProgress />
        </MDBox>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="error">
            {error}
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Aucune donnée de corrélation disponible pour ces tickers.
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  return (
    <MDBox>
      <Card sx={{ mb: 3 }}>
        <MDBox p={3}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h6">
              Corrélations - {tickers.split(",").map(t => t.trim()).join(", ")}
            </MDTypography>
            <MDBox display="flex" gap={2} alignItems="center">
              <FormControl variant="standard" sx={{ minWidth: 150 }}>
                <InputLabel>Période</InputLabel>
                <Select
                  value={selectedInterval}
                  onChange={(e) => setSelectedInterval(e.target.value)}
                  label="Période"
                >
                  <MenuItem value="YTD">YTD</MenuItem>
                  <MenuItem value="1D">1 Jour</MenuItem>
                  <MenuItem value="1W">1 Semaine</MenuItem>
                  <MenuItem value="1M">1 Mois</MenuItem>
                  <MenuItem value="3M">3 Mois</MenuItem>
                  <MenuItem value="6M">6 Mois</MenuItem>
                  <MenuItem value="1Y">1 An</MenuItem>
                  <MenuItem value="2Y">2 Ans</MenuItem>
                </Select>
              </FormControl>
              <Tooltip title="La corrélation mesure la relation entre les mouvements de prix de deux actifs. Une corrélation proche de 1 indique qu'ils bougent ensemble, proche de -1 qu'ils bougent en sens inverse, et proche de 0 qu'ils sont indépendants.">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </MDBox>
          </MDBox>

          {/* Statistiques */}
          {uniqueCorrelations.length > 0 && (
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} sm={6} md={3}>
                <MiniStatisticsCard
                  title={{ text: "Corrélation moyenne" }}
                  count={formatNumber(
                    uniqueCorrelations.reduce(
                      (sum, item) => sum + parseFloat(item.correlation || 0),
                      0
                    ) / uniqueCorrelations.length
                  )}
                  icon={{ color: "info", component: "trending_up" }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                {(() => {
                  const maxCorr = Math.max(...uniqueCorrelations.map(item => parseFloat(item.correlation || 0)));
                  return (
                    <MiniStatisticsCard
                      title={{ text: "Corrélation max" }}
                      count={formatNumber(maxCorr)}
                      percentage={{ 
                        color: getCorrelationColor(maxCorr),
                        text: ""
                      }}
                      icon={{ color: getCorrelationColor(maxCorr), component: "arrow_upward" }}
                    />
                  );
                })()}
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                {(() => {
                  const minCorr = Math.min(...uniqueCorrelations.map(item => parseFloat(item.correlation || 0)));
                  return (
                    <MiniStatisticsCard
                      title={{ text: "Corrélation min" }}
                      count={formatNumber(minCorr)}
                      percentage={{ 
                        color: getCorrelationColor(minCorr),
                        text: ""
                      }}
                      icon={{ color: getCorrelationColor(minCorr), component: "arrow_downward" }}
                    />
                  );
                })()}
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MiniStatisticsCard
                  title={{ text: "Paires analysées" }}
                  count={uniqueCorrelations.length.toString()}
                  icon={{ color: "success", component: "compare_arrows" }}
                />
              </Grid>
            </Grid>
          )}

          {/* Matrice de corrélations */}
          {allTickers.length > 0 && (
            <MDBox mb={3}>
              <MDTypography variant="h6" mb={2}>
                Matrice de Corrélations
              </MDTypography>
              <TableContainer>
                <Table>
                  <MDBox component="thead">
                    <TableRow>
                      <DataTableHeadCell width="15%" align="left">
                        Ticker
                      </DataTableHeadCell>
                      {allTickers.map((ticker) => (
                        <DataTableHeadCell key={ticker} width={`${85 / allTickers.length}%`} align="center">
                          {ticker}
                        </DataTableHeadCell>
                      ))}
                    </TableRow>
                  </MDBox>
                  <TableBody>
                    {allTickers.map((ticker) => (
                      <TableRow 
                        key={ticker}
                        sx={{
                          "&:hover": { backgroundColor: "action.hover" },
                        }}
                      >
                        <DataTableBodyCell align="left">
                          <MDTypography variant="button" fontWeight="bold" color="primary">
                            {ticker}
                          </MDTypography>
                        </DataTableBodyCell>
                        {allTickers.map((otherTicker) => {
                          const correlation = correlationMatrix[ticker]?.[otherTicker];
                          const isDiagonal = ticker === otherTicker;
                          
                          return (
                            <DataTableBodyCell key={otherTicker} align="center">
                              {isDiagonal ? (
                                <Chip
                                  label="1.00"
                                  color="info"
                                  size="small"
                                  sx={{ minWidth: 70, fontWeight: "bold" }}
                                />
                              ) : correlation !== null && !isNaN(correlation) ? (
                                <Tooltip title={getCorrelationLabel(correlation)} arrow>
                                  <Chip
                                    label={formatNumber(correlation, 2)}
                                    color={getCorrelationColor(correlation)}
                                    size="small"
                                    sx={{ minWidth: 70, fontWeight: "medium" }}
                                  />
                                </Tooltip>
                              ) : (
                                <MDTypography variant="body2" color="text.secondary">
                                  -
                                </MDTypography>
                              )}
                            </DataTableBodyCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </MDBox>
          )}
        </MDBox>
      </Card>

      {/* Tableau détaillé */}
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Détails des Corrélations
          </MDTypography>
          {uniqueCorrelations.length === 0 ? (
            <MDTypography variant="body2" color="text">
              Aucune corrélation disponible
            </MDTypography>
          ) : (
            <TableContainer>
              <Table>
                <MDBox component="thead">
                  <TableRow>
                    <DataTableHeadCell width="15%" align="left">
                      Ticker 1
                    </DataTableHeadCell>
                    <DataTableHeadCell width="15%" align="left">
                      Ticker 2
                    </DataTableHeadCell>
                    <DataTableHeadCell width="20%" align="right">
                      Corrélation
                    </DataTableHeadCell>
                    <DataTableHeadCell width="35%" align="center">
                      Période
                    </DataTableHeadCell>
                    <DataTableHeadCell width="15%" align="right">
                      Points de données
                    </DataTableHeadCell>
                  </TableRow>
                </MDBox>
                <TableBody>
                  {uniqueCorrelations.map((item, index) => {
                    const correlation = parseFloat(item.correlation || 0);
                    
                    return (
                      <TableRow 
                        key={index} 
                        sx={{ 
                          "&:hover": { backgroundColor: "action.hover" },
                        }}
                      >
                        <DataTableBodyCell align="left">
                          <MDTypography variant="button" fontWeight="bold" color="primary">
                            {item.fst}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="left">
                          <MDTypography variant="button" fontWeight="bold" color="primary">
                            {item.snd}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <Chip
                            label={formatNumber(item.correlation)}
                            color={getCorrelationColor(item.correlation)}
                            size="small"
                            sx={{ minWidth: 90, fontWeight: "medium" }}
                          />
                        </DataTableBodyCell>
                        <DataTableBodyCell align="center">
                          {item.min_date && item.max_date ? (
                            <MDBox>
                              <MDTypography variant="body2" fontWeight="medium">
                                {new Date(item.min_date).toLocaleDateString("fr-FR", { 
                                  day: "2-digit", 
                                  month: "short", 
                                  year: "numeric" 
                                })}
                              </MDTypography>
                              <MDTypography variant="caption" color="text.secondary">
                                → {new Date(item.max_date).toLocaleDateString("fr-FR", { 
                                  day: "2-digit", 
                                  month: "short", 
                                  year: "numeric" 
                                })}
                              </MDTypography>
                            </MDBox>
                          ) : (
                            <MDTypography variant="body2" color="text.secondary">
                              N/A
                            </MDTypography>
                          )}
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" fontWeight="medium">
                            {item.rows ? item.rows.toLocaleString() : "N/A"}
                          </MDTypography>
                        </DataTableBodyCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </MDBox>
      </Card>
    </MDBox>
  );
}

export default Correlations;

