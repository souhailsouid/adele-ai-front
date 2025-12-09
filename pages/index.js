/**
 * Page d'accueil - Redirection vers le Dashboard Trading
 */

import { useEffect } from "react";
import { useRouter } from "next/router";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import CircularProgress from "@mui/material/CircularProgress";

function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers le dashboard trading
    router.replace("/dashboards/trading");
  }, [router]);

  // Afficher un loader pendant la redirection
  return (
    <DashboardLayout>
      <DashboardNavbar />
                        <MDBox
                          display="flex"
        flexDirection="column"
                          justifyContent="center"
                          alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress size={48} />
        <MDTypography variant="body1" color="text" sx={{ mt: 2 }}>
          Redirection vers le Dashboard Trading...
                    </MDTypography>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default HomePage;
