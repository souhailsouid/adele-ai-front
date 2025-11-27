/**
 * Trading Dashboard - News Headlines
 */

import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import LinearProgress from "@mui/material/LinearProgress";
import MDInput from "/components/MDInput";
import MDButton from "/components/MDButton";
import Card from "@mui/material/Card";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

// Services
import unusualWhalesClient from "/lib/unusual-whales/client";
import metricsService from "/services/metricsService";

// Composants
import NewsHeadlines from "/pagesComponents/dashboards/trading/components/NewsHeadlines";

function TradingNews() {
    const [newsHeadlines, setNewsHeadlines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [majorOnly, setMajorOnly] = useState(false);
    const [sources, setSources] = useState("");





    const loadNewsHeadlines = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                limit: 100,
            };

            if (searchTerm.trim()) {
                params.search_term = searchTerm.trim();
            }

            if (majorOnly) {
                params.major_only = true;
            }

            if (sources.trim()) {
                params.sources = sources.trim();
            }

            const newsData = await unusualWhalesClient.getNewsHeadlines(params).catch((err) => {
                console.error("Error loading news headlines:", err);
                return { data: [] };
            });

            // Extraire les données
            const extractData = (response) => {
                if (Array.isArray(response)) return response;
                if (response?.data && Array.isArray(response.data)) return response.data;
                if (response?.data && !Array.isArray(response.data)) return [response.data];
                return [];
            };

            setNewsHeadlines(extractData(newsData));
        } catch (err) {
            console.error("Error loading News Headlines:", err);
            setError(err.message || "Erreur lors du chargement des news");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNewsHeadlines();
        metricsService.trackFeatureUsage("news");
    }, []);

    const handleSearch = () => {
        loadNewsHeadlines();
    };



    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox py={3}>
                <MDBox mb={3}>
                    <MDTypography variant="h4" fontWeight="bold" mb={1}>
                        News Headlines
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                        Dernières actualités financières qui peuvent impacter les marchés
                    </MDTypography>
                </MDBox>



                {/* Filtres */}
                <MDBox mb={3}>
                    <Card>
                        <MDBox p={2}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={4}>
                                    <MDInput
                                        label="Recherche"
                                        placeholder="Ex: earnings, fed, inflation"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                                        variant="standard"
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <MDInput
                                        label="Sources (séparées par virgule)"
                                        placeholder="Ex: Reuters,Bloomberg"
                                        value={sources}
                                        onChange={(e) => setSources(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                                        variant="standard"
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={majorOnly}
                                                onChange={(e) => setMajorOnly(e.target.checked)}
                                            />
                                        }
                                        label="Major Only"
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <MDButton variant="gradient" color="dark" onClick={handleSearch} disabled={loading} fullWidth>
                                        Rechercher
                                    </MDButton>
                                </Grid>
                            </Grid>
                        </MDBox>
                    </Card>
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
                            <NewsHeadlines data={newsHeadlines} loading={loading} />
                        </Grid>
                    </Grid>
                )}
            </MDBox>
            <Footer />
        </DashboardLayout>
    );
}

export default TradingNews;

