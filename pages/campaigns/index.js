
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

// @mui material components
import Card from "@mui/material/Card";
import Alert from "@mui/material/Alert";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import Icon from "@mui/material/Icon";
// NextJS Material Dashboard 2 PRO examples
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import DataTable from "/examples/Tables/DataTable";

// Data
import campaignsData from "/pagesComponents/campaigns/data-tables/data/dataTableData";

// API Client
import apiClient from "/lib/api/client";

// Auth
import { useAuth } from "/hooks/useAuth";

function Campaigns() {
    const router = useRouter();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [orgId, setOrgId] = useState(null);
    const [enrichmentStatus, setEnrichmentStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: null, text: null });

    // Vérifier l'authentification et rediriger si nécessaire
    useEffect(() => {
        if (!authLoading && !isAuthenticated()) {
            console.log("Not authenticated, redirecting to sign-in");
            router.push("/authentication/sign-in?redirect=/campaigns");
        }
    }, [authLoading, isAuthenticated, router]);

    // Récupérer l'org_id depuis localStorage
    useEffect(() => {
        if (!isAuthenticated() || authLoading) return;
        
        const storedOrgId = localStorage.getItem("current_org_id");
        console.log("Campaigns page loaded, storedOrgId:", storedOrgId);
        if (storedOrgId) {
            setOrgId(storedOrgId);
            // Charger le statut de l'organisation
            loadOrgStatus(storedOrgId).catch(err => {
                console.error("Failed to load org status:", err);
                // Si l'organisation n'existe plus, nettoyer le localStorage
                if (err.message && err.message.includes("404") || err.message.includes("not found")) {
                    console.warn("Organization not found, clearing localStorage");
                    localStorage.removeItem("current_org_id");
                    setOrgId(null);
                    setMessage({ 
                        type: "error", 
                        text: "No organization found. Please complete onboarding first." 
                    });
                }
            });
        } else {
            console.warn("No org_id found in localStorage");
            setEnrichmentStatus("unknown");
            setMessage({ 
                type: "error", 
                text: "No organization found. Please complete onboarding first." 
            });
        }
    }, [isAuthenticated, authLoading]);

    const loadOrgStatus = async (orgId) => {
        try {
            console.log("Loading org status for orgId:", orgId);
            const org = await apiClient.getOrganization(orgId);
            console.log("API response:", org);
            const status = org?.enrichment_status || "unknown";
            console.log("Loaded org status:", status, "full org object:", JSON.stringify(org, null, 2));
            setEnrichmentStatus(status);
        } catch (error) {
            console.error("Error loading org status:", error);
            console.error("Error details:", {
                message: error.message,
                response: error.response,
                stack: error.stack
            });
            setEnrichmentStatus("unknown");
        }
    };

    const handleRefreshEnrichment = async () => {
        // Utiliser orgId depuis state ou localStorage
        const currentOrgId = orgId || localStorage.getItem("current_org_id");
        
        if (!currentOrgId) {
            setMessage({ type: "error", text: "No organization found. Please complete onboarding first." });
            return;
        }

        try {
            setLoading(true);
            setMessage({ type: null, text: null });
            
            console.log("Calling refreshEnrichment with orgId:", currentOrgId);
            await apiClient.refreshEnrichment(currentOrgId, true); // force = true pour relancer
            
            setMessage({ type: "success", text: "Enrichment refresh started. This may take a few minutes." });
            setEnrichmentStatus("pending");
            
            // Recharger le statut après quelques secondes
            setTimeout(() => {
                loadOrgStatus(currentOrgId);
            }, 5000);
        } catch (error) {
            console.error("Error refreshing enrichment:", error);
            setMessage({ type: "error", text: error.message || "Failed to refresh enrichment. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    // Afficher un loader pendant la vérification de l'auth
    if (authLoading || !isAuthenticated()) {
        return (
            <DashboardLayout>
                <DashboardNavbar />
                <MDBox pt={6} pb={3} textAlign="center">
                    <MDTypography variant="h6">Loading...</MDTypography>
                </MDBox>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox pt={6} pb={8}>
                {/* Message d'alerte pour l'enrichissement */}
                {enrichmentStatus === "failed" && (
                    <MDBox mb={3}>
                        <Alert 
                            severity="warning" 
                            action={
                                <MDButton 
                                    size="small" 
                                    color="inherit" 
                                    onClick={handleRefreshEnrichment}
                                    disabled={loading}
                                >
                                    {loading ? "Refreshing..." : "Retry Enrichment"}
                                </MDButton>
                            }
                        >
                            Company enrichment failed. Click to retry.
                        </Alert>
                    </MDBox>
                )}
                {enrichmentStatus === "pending" && (
                    <MDBox mb={3}>
                        <Alert 
                            severity="info"
                            action={
                                <MDButton 
                                    size="small" 
                                    color="inherit" 
                                    onClick={handleRefreshEnrichment}
                                    disabled={loading}
                                >
                                    {loading ? "Refreshing..." : "Force Refresh"}
                                </MDButton>
                            }
                        >
                            Company enrichment in progress. This may take a few minutes.
                        </Alert>
                    </MDBox>
                )}
                {enrichmentStatus === "completed" && (
                    <MDBox mb={3}>
                        <Alert 
                            severity="success"
                            action={
                                <MDBox display="flex" gap={1}>
                                    <MDButton 
                                        size="small" 
                                        color="inherit" 
                                        onClick={() => router.push("/organization/enrichment")}
                                    >
                                        Modify
                                    </MDButton>
                                    <MDButton 
                                        size="small" 
                                        color="inherit" 
                                        onClick={handleRefreshEnrichment}
                                        disabled={loading}
                                    >
                                        {loading ? "Refreshing..." : "Restart"}
                                    </MDButton>
                                </MDBox>
                            }
                        >
                            Enrichment completed. You can modify the data manually (free) or restart the automatic enrichment.
                        </Alert>
                    </MDBox>
                )}
                {enrichmentStatus === "unknown" && (
                    <MDBox mb={3}>
                        <Alert 
                            severity="warning"
                            action={
                                <MDButton 
                                    size="small" 
                                    color="inherit" 
                                    onClick={handleRefreshEnrichment}
                                    disabled={loading}
                                >
                                    {loading ? "Refreshing..." : "Force Refresh"}
                                </MDButton>
                            }
                        >
                            Unable to load enrichment status. You can still force refresh the enrichment.
                        </Alert>
                    </MDBox>
                )}
                {message.text && (
                    <MDBox mb={3}>
                        <Alert 
                            severity={message.type} 
                            action={
                                message.type === "error" && message.text.includes("onboarding") ? (
                                    <MDButton 
                                        size="small" 
                                        color="inherit" 
                                        onClick={() => router.push("/authentication/onboarding")}
                                    >
                                        Go to Onboarding
                                    </MDButton>
                                ) : null
                            }
                            onClose={() => setMessage({ type: null, text: null })}
                        >
                            {message.text}
                        </Alert>
                    </MDBox>
                )}
                
                <Card>
                    <MDBox p={3} lineHeight={1} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                        <MDBox>
                            <MDTypography variant="h5" fontWeight="medium">
                                Campaigns
                            </MDTypography>
                            <MDTypography variant="button" color="text">
                                Manage and track your marketing campaigns.
                            </MDTypography>
                        </MDBox>
                        <MDBox display="flex" gap={2}>
                            {enrichmentStatus === "completed" && (
                                <MDButton 
                                    variant="outlined" 
                                    color="info"
                                    onClick={() => router.push("/organization/enrichment")}
                                >
                                    <Icon fontSize="small">edit</Icon>&nbsp;
                                    Modifier les données enrichies
                                </MDButton>
                            )}
                            {(enrichmentStatus === "failed" || enrichmentStatus === "pending" || enrichmentStatus === "unknown") && (
                                <MDButton 
                                    variant="outlined" 
                                    color={enrichmentStatus === "failed" ? "warning" : enrichmentStatus === "unknown" ? "error" : "info"}
                                    onClick={handleRefreshEnrichment}
                                    disabled={loading || !orgId}
                                >
                                    <Icon fontSize="small">refresh</Icon>&nbsp;
                                    {loading ? "Refreshing..." : enrichmentStatus === "failed" ? "Retry Enrichment" : "Force Refresh"}
                                </MDButton>
                            )}
                            <MDButton 
                                variant="contained" 
                                sx={{ 
                                    backgroundColor: "#0EB1EC", 
                                    color: "#fff",
                                    "&:hover": {
                                        backgroundColor: "#0C9DD4",
                                    },
                                }}
                                onClick={() => router.push("/campaigns/new")}
                            >
                                <Icon fontSize="medium">add</Icon>&nbsp;
                                New Campaign
                            </MDButton>
                        </MDBox>
                    </MDBox>
                    <DataTable table={campaignsData} canSearch />
                </Card>
            </MDBox>
            <Footer />
        </DashboardLayout>
    );
}

export default Campaigns;
