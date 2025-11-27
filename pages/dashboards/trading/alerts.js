/**
 * Trading Dashboard - Alertes
 */

import { useState, useEffect, useCallback } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import ActiveAlerts from "/pagesComponents/dashboards/trading/components/ActiveAlerts";
import alertService from "/services/alertService";
import metricsService from "/services/metricsService";

function TradingAlerts() {
    const [alerts, setAlerts] = useState([]);


    const loadAlerts = useCallback(() => {
        const activeAlerts = alertService.getActiveAlerts();
        setAlerts(activeAlerts);
    }, []);


    useEffect(() => {
        loadAlerts();
        // Track l'utilisation des alertes
        metricsService.trackFeatureUsage("alerts");
    }, [loadAlerts]);

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox py={3}>
                <MDBox mb={3}>
                    <MDTypography variant="h4" fontWeight="medium">
                        Alertes Actives
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                        Gestion de vos alertes de trading
                    </MDTypography>
                </MDBox>



                <ActiveAlerts data={alerts} onRefresh={loadAlerts} />
            </MDBox>
            <Footer />
        </DashboardLayout>
    );
}

export default TradingAlerts;

