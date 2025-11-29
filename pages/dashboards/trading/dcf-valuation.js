/**
 * Trading Dashboard - Valorisation DCF
 * Page dédiée à la valorisation Discounted Cash Flow
 */

import { useState, useEffect, useCallback } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import Card from "@mui/material/Card";
import MDInput from "/components/MDInput";
import MDButton from "/components/MDButton";
import Autocomplete from "@mui/material/Autocomplete";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import DataTable from "/examples/Tables/DataTable";
import MiniStatisticsCard from "/examples/Cards/StatisticsCards/MiniStatisticsCard";

// Services
import fmpClient from "/lib/fmp/client";
import metricsService from "/services/metricsService";

function TradingDCFValuation() {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [dcf, setDCF] = useState(null);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Recherche d'entreprises
  const handleSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await fmpClient.searchCompanyByName(query);
      setSearchResults(results.slice(0, 10));
    } catch (err) {
      console.error("Error searching companies:", err);
      setSearchResults([]);
    }
  }, []);

  // Charger la valorisation DCF
  const loadDCF = useCallback(async (symbol = selectedSymbol) => {
    if (!symbol) return;
    try {
      setLoading(true);
      setError(null);
      const [dcfData, quoteData] = await Promise.allSettled([
        fmpClient.getDCF(symbol.toUpperCase()),
        fmpClient.getQuote(symbol.toUpperCase()),
      ]);
      
      if (dcfData.status === "fulfilled") {
        setDCF(dcfData.value);
      }
      if (quoteData.status === "fulfilled") {
        setQuote(quoteData.value);
      }
    } catch (err) {
      console.error("Error loading DCF:", err);
      setError(err.message || "Erreur lors du chargement de la valorisation DCF");
      setDCF(null);
    } finally {
      setLoading(false);
    }
  }, [selectedSymbol]);

  useEffect(() => {
    loadDCF();
    metricsService.trackFeatureUsage("dcf-valuation");
  }, [loadDCF]);

  // Calculer l'écart et le pourcentage
  const valuation = dcf && quote ? {
    currentPrice: quote.price || 0,
    dcfPrice: dcf.dcf || dcf.stockPrice || 0,
    difference: (dcf.dcf || dcf.stockPrice || 0) - (quote.price || 0),
    percentage: ((dcf.dcf || dcf.stockPrice || 0) - (quote.price || 0)) / (quote.price || 1) * 100,
    isUndervalued: (dcf.dcf || dcf.stockPrice || 0) > (quote.price || 0),
  } : null;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Valorisation DCF (Discounted Cash Flow)
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Évaluation de la valeur intrinsèque d&apos;une action basée sur les flux de trésorerie futurs
          </MDTypography>
        </MDBox>

        {/* Recherche */}
        <MDBox mb={3}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Autocomplete
                freeSolo
                options={searchResults.map((result) => ({
                  label: `${result.symbol} - ${result.name}`,
                  symbol: result.symbol,
                }))}
                onInputChange={(event, newValue) => {
                  setSearchQuery(newValue);
                  handleSearch(newValue);
                }}
                onChange={(event, newValue) => {
                  if (newValue && newValue.symbol) {
                    setSelectedSymbol(newValue.symbol);
                    loadDCF(newValue.symbol);
                  }
                }}
                renderInput={(params) => (
                  <MDInput
                    {...params}
                    label="Rechercher une entreprise"
                    placeholder="Ex: Apple, AAPL"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <MDInput
                label="Symbole"
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <MDButton
                variant="gradient"
                color="info"
                onClick={() => loadDCF()}
                disabled={loading}
                fullWidth
              >
                Calculer la Valorisation DCF
              </MDButton>
            </Grid>
          </Grid>
        </MDBox>

        {/* Erreur */}
        {error && (
          <MDBox mb={3}>
            <MDTypography variant="body2" color="error">
              {error}
            </MDTypography>
          </MDBox>
        )}

        {/* Statistiques de valorisation */}
        {valuation && (
          <MDBox mb={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <MiniStatisticsCard
                  title={{ text: "Prix Actuel", fontWeight: "medium" }}
                  count={`$${valuation.currentPrice.toFixed(2)}`}
                  percentage={{ color: "info", text: "" }}
                  icon={{ color: "info", component: "attach_money" }}
                  direction="right"
                  bgColor="white"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MiniStatisticsCard
                  title={{ text: "Prix Cible DCF", fontWeight: "medium" }}
                  count={`$${valuation.dcfPrice.toFixed(2)}`}
                  percentage={{ color: valuation.isUndervalued ? "success" : "error", text: "" }}
                  icon={{ color: valuation.isUndervalued ? "success" : "error", component: "trending_up" }}
                  direction="right"
                  bgColor="white"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MiniStatisticsCard
                  title={{ text: "Écart", fontWeight: "medium" }}
                  count={`$${Math.abs(valuation.difference).toFixed(2)}`}
                  percentage={{ color: valuation.isUndervalued ? "success" : "error", text: "" }}
                  icon={{ color: valuation.isUndervalued ? "success" : "error", component: valuation.isUndervalued ? "arrow_upward" : "arrow_downward" }}
                  direction="right"
                  bgColor="white"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MiniStatisticsCard
                  title={{ text: "Évaluation", fontWeight: "medium" }}
                  count={valuation.isUndervalued ? "Sous-évaluée" : "Sur-évaluée"}
                  percentage={{ color: valuation.isUndervalued ? "success" : "error", text: `${valuation.percentage > 0 ? "+" : ""}${valuation.percentage.toFixed(2)}%` }}
                  icon={{ color: valuation.isUndervalued ? "success" : "error", component: valuation.isUndervalued ? "trending_up" : "trending_down" }}
                  direction="right"
                  bgColor="white"
                />
              </Grid>
            </Grid>
          </MDBox>
        )}

        {/* Détails DCF */}
        {loading ? (
          <MDBox p={3}>
            <LinearProgress />
          </MDBox>
        ) : dcf ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Valorisation DCF - {selectedSymbol}
                  </MDTypography>
                  {valuation && (
                    <MDBox mb={3}>
                      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <MDTypography variant="body2" color="text.secondary">
                          Prix Actuel
                        </MDTypography>
                        <MDTypography variant="h5" fontWeight="bold">
                          ${valuation.currentPrice.toFixed(2)}
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <MDTypography variant="body2" color="text.secondary">
                          Prix Cible DCF
                        </MDTypography>
                        <MDTypography variant="h5" fontWeight="bold" color={valuation.isUndervalued ? "success.main" : "error.main"}>
                          ${valuation.dcfPrice.toFixed(2)}
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <MDTypography variant="body2" color="text.secondary">
                          Écart
                        </MDTypography>
                        <Chip
                          label={`${valuation.percentage > 0 ? "+" : ""}${valuation.percentage.toFixed(2)}%`}
                          color={valuation.isUndervalued ? "success" : "error"}
                          size="large"
                          icon={<Icon>{valuation.isUndervalued ? "trending_up" : "trending_down"}</Icon>}
                        />
                      </MDBox>
                      <MDBox>
                        <MDTypography variant="body2" color="text" fontWeight="medium" mb={1}>
                          Recommandation:
                        </MDTypography>
                        <MDTypography variant="body2" color={valuation.isUndervalued ? "success.main" : "error.main"}>
                          {valuation.isUndervalued
                            ? "L'action est sous-évaluée selon le modèle DCF. Potentiel d'appréciation."
                            : "L'action est sur-évaluée selon le modèle DCF. Risque de correction."}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  )}
                </MDBox>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Détails DCF
                  </MDTypography>
                  {dcf && typeof dcf === "object" ? (
                    <DataTable
                      table={{
                        columns: [
                          { Header: "Paramètre", accessor: "key", width: "50%" },
                          { Header: "Valeur", accessor: "value", width: "50%" },
                        ],
                        rows: Object.keys(dcf)
                          .filter((k) => !["dcf", "stockPrice"].includes(k))
                          .map((key) => ({
                            key: key.replace(/([A-Z])/g, " $1").trim(),
                            value:
                              typeof dcf[key] === "number"
                                ? dcf[key].toFixed(2)
                                : dcf[key] || "N/A",
                          })),
                      }}
                      canSearch={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder={false}
                    />
                  ) : (
                    <MDTypography variant="body2" color="text.secondary">
                      Détails non disponibles
                    </MDTypography>
                  )}
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <MDBox p={3}>
            <MDTypography variant="body2" color="text">
              {selectedSymbol
                ? `Aucune valorisation DCF disponible pour ${selectedSymbol}`
                : "Sélectionnez un symbole pour voir la valorisation DCF"}
            </MDTypography>
          </MDBox>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TradingDCFValuation;

