/**
 * Trading Dashboard - Calendrier Économique
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Grid from "@mui/material/Grid";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Card from "@mui/material/Card";
import EconomicCalendar from "/pagesComponents/dashboards/trading/components/EconomicCalendar";
import USFedCalendar from "/pagesComponents/dashboards/trading/components/USFedCalendar";
import JapanBoJCalendar from "/pagesComponents/dashboards/trading/components/JapanBoJCalendar";
import ChinaCalendar from "/pagesComponents/dashboards/trading/components/ChinaCalendar";
import metricsService from "/services/metricsService";
import { useAuth } from "/hooks/useAuth";

function TradingEconomic() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [calendarTab, setCalendarTab] = useState("zones"); // "zones" ou "complet"

  // Vérifier l'authentification
  useEffect(() => {
    if (!authLoading && !isAuthenticated()) {
      router.push("/authentication/sign-in?redirect=/dashboards/trading/economic");
    }
  }, [authLoading, isAuthenticated, router]);



  const handleCalendarTabChange = (event, newValue) => {
    setCalendarTab(newValue);
    // Track l'utilisation du calendrier économique
    metricsService.trackFeatureUsage("calendar");
  };

  // Afficher un loader pendant la vérification d'authentification
  if (authLoading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <LinearProgress />
          <MDTypography variant="body2" color="text" sx={{ mt: 2, textAlign: "center" }}>
            Vérification de l&apos;authentification...
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  // Si non authentifié, afficher un message (la redirection est en cours)
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
            Calendrier Économique
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Événements économiques importants
          </MDTypography>
        </MDBox>

       

        {/* Onglets pour les calendriers */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={calendarTab}
            onChange={handleCalendarTabChange}
            sx={{
              minHeight: 48,
              "& .MuiTab-root": {
                minHeight: 48,
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.875rem",
                padding: "12px 24px",
              },
              "& .Mui-selected": {
                fontWeight: 600,
              },
            }}
          >
            <Tab label="Calendriers par Zone" value="zones" />
            <Tab label="Calendrier Complet" value="complet" />
          </Tabs>
        </Box>

        {/* Contenu selon l'onglet sélectionné */}
        {calendarTab === "zones" && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <USFedCalendar />
            </Grid>
            <Grid item xs={12} md={4}>
              <ChinaCalendar />
            </Grid>
            <Grid item xs={12} md={4}>
              <JapanBoJCalendar />
            </Grid>
          </Grid>
        )}

        {calendarTab === "complet" && (
          <EconomicCalendar />
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TradingEconomic;

