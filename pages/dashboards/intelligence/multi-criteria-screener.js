/**
 * Multi-Criteria Screener - Screening avec critères FMP + UW
 * 
 * Trouve des tickers qui matchent plusieurs critères simultanément
 */

import { useState, useEffect, useCallback } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import Chip from "@mui/material/Chip";
import MDButton from "/components/MDButton";
import MDInput from "/components/MDInput";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import DataTable from "/examples/Tables/DataTable";
import { formatCurrency, formatPercentage } from "/utils/formatting";
import intelligenceClient from "/lib/api/intelligenceClient";
import { useRouter } from "next/router";
import { useAuth } from "/hooks/useAuth";
import withAuth from "/hocs/withAuth";
import { exportToCSV } from "/utils/exportUtils";
import { showSuccess, showError } from "/utils/notifications";
import Icon from "@mui/material/Icon";

function MultiCriteriaScreener() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [criteria, setCriteria] = useState({
    minMarketCap: "",
    maxMarketCap: "",
    minPERatio: "",
    maxPERatio: "",
    minRevenueGrowth: "",
    maxDebtToEquity: "",
    sector: "",
    minSentimentScore: "",
    maxShortInterest: "",
    limit: 20,
    sortBy: "combinedScore",
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger les résultats
  const loadResults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Préparer les critères (enlever les valeurs vides)
      const cleanCriteria = {};
      Object.entries(criteria).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          if (typeof value === "string" && !isNaN(value) && value !== "") {
            cleanCriteria[key] = parseFloat(value);
          } else if (typeof value === "number") {
            cleanCriteria[key] = value;
          } else if (value) {
            cleanCriteria[key] = value;
          }
        }
      });

      const response = await intelligenceClient.multiCriteriaScreener(cleanCriteria);
      
      if (response.success && response.data) {
        setResults(Array.isArray(response.data) ? response.data : []);
      } else {
        throw new Error(response.error || "Erreur lors du screening");
      }
    } catch (err) {
      console.error("Error loading screener results:", err);
      setError(err.message || "Erreur lors du screening");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [criteria]);

  // Debounce pour éviter trop de requêtes
  useEffect(() => {
    const timer = setTimeout(() => {
      // Ne pas charger automatiquement, seulement quand l'utilisateur clique sur "Rechercher"
    }, 500);
    return () => clearTimeout(timer);
  }, [criteria]);

  // Colonnes pour le tableau
  const columns = [
    { Header: "Ticker", accessor: "symbol", width: "10%" },
    { Header: "Name", accessor: "name", width: "20%" },
    { Header: "F Score", accessor: "fundamentalScore", width: "10%" },
    { Header: "S Score", accessor: "sentimentScore", width: "10%" },
    { Header: "Combined", accessor: "combinedScore", width: "10%" },
    { Header: "Price", accessor: "currentPrice", width: "10%" },
    { Header: "Market Cap", accessor: "marketCap", width: "15%" },
    { Header: "PE Ratio", accessor: "peRatio", width: "10%" },
  ];

  const tableData = results.map((ticker) => ({
    symbol: ticker.symbol,
    name: ticker.name,
    fundamentalScore: ticker.fundamentalScore?.toFixed(0) || "N/A",
    sentimentScore: ticker.sentimentScore?.toFixed(0) || "N/A",
    combinedScore: ticker.combinedScore?.toFixed(0) || "N/A",
    currentPrice: formatCurrency(ticker.currentPrice),
    marketCap: formatCurrency(ticker.marketCap),
    peRatio: ticker.peRatio?.toFixed(2) || "N/A",
  }));

  const handleExport = () => {
    try {
      exportToCSV(tableData, `screener_results_${new Date().toISOString().split("T")[0]}.csv`);
      showSuccess("Export CSV réussi");
    } catch (err) {
      showError("Erreur lors de l'export");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold">
            Multi-Criteria Screener
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Trouvez des tickers qui matchent plusieurs critères (Fundamentals + Sentiment)
          </MDTypography>
        </MDBox>

        {/* Critères */}
        <Card sx={{ mb: 3 }}>
          <MDBox p={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={3}>
              Critères de Recherche
            </MDTypography>
            <Grid container spacing={3}>
              {/* Fundamentals */}
              <Grid item xs={12}>
                <MDTypography variant="subtitle2" fontWeight="medium" mb={2}>
                  Fundamentals
                </MDTypography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Market Cap Min ($)"
                  value={criteria.minMarketCap}
                  onChange={(e) => setCriteria({ ...criteria, minMarketCap: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Market Cap Max ($)"
                  value={criteria.maxMarketCap}
                  onChange={(e) => setCriteria({ ...criteria, maxMarketCap: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="PE Ratio Max"
                  value={criteria.maxPERatio}
                  onChange={(e) => setCriteria({ ...criteria, maxPERatio: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Revenue Growth Min (%)"
                  value={criteria.minRevenueGrowth}
                  onChange={(e) => setCriteria({ ...criteria, minRevenueGrowth: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Debt/Equity Max"
                  value={criteria.maxDebtToEquity}
                  onChange={(e) => setCriteria({ ...criteria, maxDebtToEquity: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Sector"
                  value={criteria.sector}
                  onChange={(e) => setCriteria({ ...criteria, sector: e.target.value })}
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="Technology">Technology</MenuItem>
                  <MenuItem value="Healthcare">Healthcare</MenuItem>
                  <MenuItem value="Financial">Financial</MenuItem>
                  <MenuItem value="Consumer Cyclical">Consumer Cyclical</MenuItem>
                  <MenuItem value="Energy">Energy</MenuItem>
                </TextField>
              </Grid>

              {/* Sentiment */}
              <Grid item xs={12} mt={2}>
                <MDTypography variant="subtitle2" fontWeight="medium" mb={2}>
                  Sentiment
                </MDTypography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Sentiment Score Min"
                  value={criteria.minSentimentScore}
                  onChange={(e) => setCriteria({ ...criteria, minSentimentScore: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Short Interest Max (%)"
                  value={criteria.maxShortInterest}
                  onChange={(e) => setCriteria({ ...criteria, maxShortInterest: e.target.value })}
                />
              </Grid>

              {/* Options */}
              <Grid item xs={12} mt={2}>
                <MDTypography variant="subtitle2" fontWeight="medium" mb={2}>
                  Options
                </MDTypography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Limit"
                  value={criteria.limit}
                  onChange={(e) => setCriteria({ ...criteria, limit: parseInt(e.target.value) || 20 })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Trier par"
                  value={criteria.sortBy}
                  onChange={(e) => setCriteria({ ...criteria, sortBy: e.target.value })}
                >
                  <MenuItem value="combinedScore">Combined Score</MenuItem>
                  <MenuItem value="fundamentalScore">Fundamental Score</MenuItem>
                  <MenuItem value="sentimentScore">Sentiment Score</MenuItem>
                  <MenuItem value="marketCap">Market Cap</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <MDBox mt={3} display="flex" gap={2}>
              <MDButton
                variant="gradient"
                color="info"
                onClick={loadResults}
                disabled={loading}
              >
                {loading ? "Recherche..." : "Rechercher"}
              </MDButton>
              {results.length > 0 && (
                <MDButton
                  variant="outlined"
                  color="info"
                  onClick={handleExport}
                >
                  <Icon>download</Icon>&nbsp;Exporter CSV
                </MDButton>
              )}
            </MDBox>
          </MDBox>
        </Card>

        {/* Loading */}
        {loading && (
          <Card>
            <MDBox p={3}>
              <Skeleton variant="text" height={40} />
              <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
            </MDBox>
          </Card>
        )}

        {/* Error */}
        {error && !loading && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Résultats */}
        {results.length > 0 && !loading && (
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Résultats ({results.length})
              </MDTypography>
              <DataTable
                table={{
                  columns,
                  rows: tableData,
                }}
                isSorted={false}
                entriesPerPage={false}
                showTotalEntries={false}
                noEndBorder
              />
            </MDBox>
          </Card>
        )}

        {results.length === 0 && !loading && !error && (
          <Alert severity="info">
            Utilisez les critères ci-dessus pour rechercher des tickers
          </Alert>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default withAuth(MultiCriteriaScreener);



