/**
 * Sector Analysis - Analyse de secteur
 * 
 * Analyse un secteur entier en combinant fundamentals (FMP) + sentiment (UW)
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
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import DataTable from "/examples/Tables/DataTable";
import { formatCurrency, formatPercentage } from "/utils/formatting";
import intelligenceClient from "/lib/api/intelligenceClient";
import { useRouter } from "next/router";
import { useAuth } from "/hooks/useAuth";
import withAuth from "/hocs/withAuth";
import SectorChart from "/pagesComponents/dashboards/intelligence/components/SectorChart";

const SECTORS = [
  "Technology",
  "Healthcare",
  "Financial",
  "Consumer Cyclical",
  "Energy",
  "Consumer Defensive",
  "Industrials",
  "Communication Services",
  "Utilities",
  "Real Estate",
  "Basic Materials",
];

function SectorAnalysis() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [sector, setSector] = useState("Technology");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger l'analyse
  const loadAnalysis = useCallback(async (selectedSector) => {
    if (!selectedSector) return;

    try {
      setLoading(true);
      setError(null);
      const response = await intelligenceClient.getSectorAnalysis(selectedSector);
      
      if (response.success && response.data) {
        setAnalysis(response.data);
      } else {
        throw new Error(response.error || "Erreur lors du chargement de l'analyse");
      }
    } catch (err) {
      console.error("Error loading sector analysis:", err);
      setError(err.message || "Erreur lors du chargement de l'analyse");
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger au changement de secteur
  useEffect(() => {
    if (sector && isAuthenticated()) {
      loadAnalysis(sector);
    }
  }, [sector, isAuthenticated, loadAnalysis]);

  // Colonnes pour le tableau des top performers
  const performersColumns = [
    { Header: "Ticker", accessor: "ticker", width: "15%" },
    { Header: "Name", accessor: "name", width: "25%" },
    { Header: "Price", accessor: "price", width: "15%" },
    { Header: "Change", accessor: "change", width: "15%" },
    { Header: "PE Ratio", accessor: "peRatio", width: "15%" },
    { Header: "Revenue Growth", accessor: "revenueGrowth", width: "15%" },
  ];

  const performersTableData = analysis?.topPerformers?.map((performer) => ({
    ticker: performer.ticker,
    name: performer.name,
    price: formatCurrency(performer.price),
    change: (
      <MDTypography
        variant="body2"
        color={performer.changePercent > 0 ? 'success' : 'error'}
      >
        {performer.changePercent > 0 ? '+' : ''}{formatPercentage(performer.changePercent)}
      </MDTypography>
    ),
    peRatio: performer.peRatio?.toFixed(2) || 'N/A',
    revenueGrowth: formatPercentage(performer.revenueGrowth),
  })) || [];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold">
            Sector Analysis
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Analyse complète d{`'`}un secteur (Fundamentals + Sentiment)
          </MDTypography>
        </MDBox>

        {/* Sélection de secteur */}
        <Card sx={{ mb: 3 }}>
          <MDBox p={3}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Secteur"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                >
                  {SECTORS.map((sec) => (
                    <MenuItem key={sec} value={sec}>
                      {sec}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDButton
                  variant="gradient"
                  color="info"
                  fullWidth
                  onClick={() => loadAnalysis(sector)}
                  disabled={loading}
                >
                  {loading ? "Chargement..." : "Analyser"}
                </MDButton>
              </Grid>
            </Grid>
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

        {/* Analyse */}
        {analysis && !loading && (
          <Grid container spacing={3}>
            {/* Header */}
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h5" fontWeight="bold" mb={2}>
                    {analysis.sector}
                  </MDTypography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <MDTypography variant="body2" color="text" mb={1}>
                        <strong>Average PE:</strong> {analysis.averagePE?.toFixed(2) || 'N/A'}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <MDTypography variant="body2" color="text" mb={1}>
                        <strong>Average Growth:</strong> {formatPercentage(analysis.averageGrowth)}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      {analysis.sentiment && (
                        <MDBox>
                          <MDTypography variant="body2" color="text" mb={1}>
                            <strong>Sentiment Score:</strong> {analysis.sentiment.score}/100
                          </MDTypography>
                          <Chip
                            label={analysis.sentiment.tide || 'NEUTRAL'}
                            color={analysis.sentiment.tide === 'bullish' ? 'success' : analysis.sentiment.tide === 'bearish' ? 'error' : 'default'}
                            size="small"
                          />
                        </MDBox>
                      )}
                    </Grid>
                  </Grid>
                </MDBox>
              </Card>
            </Grid>

            {/* Top Performers */}
            {analysis.topPerformers && analysis.topPerformers.length > 0 && (
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Top Performers
                    </MDTypography>
                    <DataTable
                      table={{
                        columns: performersColumns,
                        rows: performersTableData,
                      }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                    />
                  </MDBox>
                </Card>
              </Grid>
            )}

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Recommendations
                    </MDTypography>
                    {analysis.recommendations.map((rec, index) => (
                      <Alert
                        key={index}
                        severity={
                          rec.action === 'BUY' ? 'success' :
                          rec.action === 'SELL' ? 'error' : 'info'
                        }
                        sx={{ mb: 2 }}
                      >
                        <MDTypography variant="body2" fontWeight="medium">
                          {rec.ticker} - {rec.action}
                        </MDTypography>
                        <MDTypography variant="body2" color="text">
                          {rec.reason}
                        </MDTypography>
                      </Alert>
                    ))}
                  </MDBox>
                </Card>
              </Grid>
            )}
          </Grid>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default withAuth(SectorAnalysis);



