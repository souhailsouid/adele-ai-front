/**
 * Trading Dashboard - FDA Calendar
 */

import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import LinearProgress from "@mui/material/LinearProgress";

// Services
import unusualWhalesClient from "/lib/unusual-whales/client";
import metricsService from "/services/metricsService";

// Composants
import FDACalendar from "/pagesComponents/dashboards/trading/components/FDACalendar";

function TradingFDACalendar() {
    const [fdaEvents, setFdaEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const loadFDACalendar = async () => {
        try {
            setLoading(true);
            setError(null);

            const eventsData = await unusualWhalesClient.getFDACalendar({}).catch((err) => {
                console.error("Error loading FDA calendar:", err);
                return { data: [] };
            });

            // Extraire les données
            const extractData = (response) => {
                if (Array.isArray(response)) return response;
                if (response?.data && Array.isArray(response.data)) return response.data;
                if (response?.data && !Array.isArray(response.data)) return [response.data];
                return [];
            };

            setFdaEvents(extractData(eventsData));
        } catch (err) {
            console.error("Error loading FDA Calendar:", err);
            setError(err.message || "Erreur lors du chargement du calendrier FDA");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFDACalendar();
        metricsService.trackFeatureUsage("fda-calendar");
    }, []);


    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox py={3}>
                <MDBox mb={3}>
                    <MDTypography variant="h4" fontWeight="bold" mb={1}>
                        FDA Calendar
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                        Calendrier des décisions FDA (PDUFA dates, Advisory Committee meetings)
                    </MDTypography>
                </MDBox>



                {error && (
                    <MDBox mb={3}>
                        <MDTypography variant="body2" color="error">
                            {error}
                        </MDTypography>
                    </MDBox>
                )}

                {loading ? (
                    <LinearProgress />
                ) : (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FDACalendar data={fdaEvents} loading={loading} />
                        </Grid>
                    </Grid>
                )}
            </MDBox>
            <Footer />
        </DashboardLayout>
    );
}

export default TradingFDACalendar;

