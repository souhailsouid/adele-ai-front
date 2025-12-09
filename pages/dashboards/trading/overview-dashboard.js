/**
 * Trading Dashboard - Vue d'ensemble avec Latest Filings et Calendrier High Impact
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Grid from "@mui/material/Grid";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import Skeleton from "@mui/material/Skeleton";
import Card from "@mui/material/Card";
import intelligenceClient from "/lib/api/intelligenceClient";
import LatestFilings from "/pagesComponents/dashboards/trading/components/LatestFilings";
import CombinedHighImpactCalendar from "/pagesComponents/dashboards/trading/components/CombinedHighImpactCalendar";
import OptionsFlow from "/pagesComponents/dashboards/trading/components/OptionsFlow";
import Institution13FDetails from "/pagesComponents/dashboards/trading/arkham/Institution13FDetails";
import { useAuth } from "/hooks/useAuth";
import metricsService from "/services/metricsService";

function TradingOverviewDashboard() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [latestFilings, setLatestFilings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFiling, setSelectedFiling] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Charger les derniers filings
  const loadLatestFilings = useCallback(async () => {
    if (!isAuthenticated()) return;

    try {
      setLoading(true);
      setError(null);

      const today = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 90); // 90 jours en arrière

      const response = await intelligenceClient.getLatest13FFilings({
        from: fromDate.toISOString().split("T")[0],
        to: today.toISOString().split("T")[0],
        limit: 50, // Limiter à 50 pour la vue d'ensemble
      });

      let filings = [];
      if (response.success && Array.isArray(response.data)) {
        filings = response.data;
      } else if (Array.isArray(response)) {
        filings = response;
      }

      // Normaliser les données de filings
      filings = filings.map((filing) => ({
        ...filing,
        institutionName: filing.institutionName || filing.name || filing.short_name || "N/A",
        filingDate: filing.filingDate || filing.filing_date || filing.reportDate || filing.report_date,
        reportDate: filing.reportDate || filing.report_date || filing.filingDate || filing.filing_date,
        formType: filing.formType || filing.form_type || "13F-HR",
        cik: filing.cik || "N/A",
        source: filing.source || "FMP",
        url: filing.url || null,
        tags: filing.tags || [],
      }));

      // Trier par date de filing (plus récent en premier)
      filings.sort((a, b) => {
        const dateA = new Date(a.filingDate || a.filing_date || 0);
        const dateB = new Date(b.filingDate || b.filing_date || 0);
        return dateB - dateA;
      });

      setLatestFilings(filings.slice(0, 50)); // Limiter à 50
    } catch (err) {
      console.error("Error loading latest filings:", err);
      setError(err.message || "Erreur lors du chargement des filings");
      setLatestFilings([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Vérifier l'authentification
  useEffect(() => {
    if (!authLoading && !isAuthenticated()) {
      router.push("/authentication/sign-in?redirect=/dashboards/trading/overview-dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  // Charger les données
  useEffect(() => {
    if (authLoading || !isAuthenticated()) return;

    loadLatestFilings();
    metricsService.trackFeatureUsage("overview-dashboard");
  }, [authLoading, isAuthenticated, loadLatestFilings]);

  // Afficher un skeleton pendant la vérification d'authentification
  if (authLoading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDBox mb={3}>
            <Skeleton variant="text" width={300} height={40} />
            <Skeleton variant="text" width={400} height={24} sx={{ mt: 1 }} />
          </MDBox>
          <Grid container spacing={3}>
            {/* Ligne 1: Latest Filings + Calendrier High Impact */}
            <Grid item xs={12} md={7}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <MDBox p={1.5} sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center">
                    <Skeleton variant="text" width={180} height={24} />
                    <MDBox display="flex" alignItems="center" gap={0.5}>
                      <Skeleton variant="rectangular" width={40} height={24} sx={{ borderRadius: 1 }} />
                      <Skeleton variant="circular" width={24} height={24} />
                    </MDBox>
                  </MDBox>
                </MDBox>
                <MDBox p={2}>
                  <Skeleton variant="rectangular" width="100%" height={400} />
                </MDBox>
              </Card>
            </Grid>
            <Grid item xs={12} md={5}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <MDBox p={1.5} sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center">
                    <Skeleton variant="text" width={180} height={24} />
                    <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 1 }} />
                  </MDBox>
                </MDBox>
                <MDBox p={2}>
                  <Skeleton variant="rectangular" width="100%" height={400} />
                </MDBox>
              </Card>
            </Grid>
            {/* Ligne 2: Options Flow (pleine largeur) */}
            <Grid item xs={6}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <MDBox p={1.5} sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center">
                    <Skeleton variant="text" width={180} height={24} />
                    <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 1 }} />
                  </MDBox>
                </MDBox>
                <MDBox p={2}>
                  <Skeleton variant="rectangular" width="100%" height={400} />
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  // Si non authentifié, afficher un message
  if (!isAuthenticated()) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="body2" color="text">
                Redirection vers la page de connexion...
              </MDTypography>
            </MDBox>
          </Card>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Vue d&apos;ensemble Trading
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Latest Filings, Calendrier Économique High Impact et Options Flow
          </MDTypography>
        </MDBox>

        <Grid container spacing={3}>
          {/* Ligne 1: Latest Filings + Calendrier High Impact */}
          <Grid item xs={12} md={7}>
            <LatestFilings
              data={latestFilings}
              loading={loading}
              onFilingClick={(filing) => {
                setSelectedFiling(filing);
                setDetailsOpen(true);
              }}
            />
          </Grid>

          <Grid item xs={12} md={5}>
            <CombinedHighImpactCalendar />
          </Grid>

          {/* Ligne 2: Options Flow (pleine largeur) */}
          <Grid item xs={7}>
            <OptionsFlow />
          </Grid>
        </Grid>
      </MDBox>

      {/* Dialog pour les détails du filing 13F */}
      <Institution13FDetails
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedFiling(null);
        }}
        filing={selectedFiling}
      />

      <Footer />
    </DashboardLayout>
  );
}

export default TradingOverviewDashboard;

