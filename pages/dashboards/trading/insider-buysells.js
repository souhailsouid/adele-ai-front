/**
 * Trading Dashboard - Insider Buy/Sells (Agrégé)
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
import InsiderBuySells from "/pagesComponents/dashboards/trading/components/InsiderBuySells";

function TradingInsiderBuySells() {
    const [insiderData, setInsiderData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);





    const loadInsiderBuySells = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await unusualWhalesClient.getInsiderBuySells({
                limit: 100,
            }).catch((err) => {
                console.error("Error loading insider buy/sells:", err);
                return { data: [] };
            });

            // Extraire les données
            const extractData = (response) => {
                if (Array.isArray(response)) return response;
                if (response?.data && Array.isArray(response.data)) return response.data;
                if (response?.data && !Array.isArray(response.data)) return [response.data];
                return [];
            };

            setInsiderData(extractData(data));
        } catch (err) {
            console.error("Error loading Insider Buy/Sells:", err);
            setError(err.message || "Erreur lors du chargement des données Insider Buy/Sells");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInsiderBuySells();
        metricsService.trackFeatureUsage("insider-buysells");
    }, []);


    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox py={3}>
                <MDBox mb={3}>
                    <MDTypography variant="h4" fontWeight="bold" mb={1}>
                        Insider Buy/Sells
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                        Vue d&apos;ensemble agrégée des achats et ventes d&apos;insiders
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
                            <InsiderBuySells data={insiderData} loading={loading} />
                        </Grid>
                    </Grid>
                )}
            </MDBox>
            <Footer />
        </DashboardLayout>
    );
}

export default TradingInsiderBuySells;

