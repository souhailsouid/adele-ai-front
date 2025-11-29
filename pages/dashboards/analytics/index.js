/**
=========================================================
* NextJS Material Dashboard 2 PRO - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/nextjs-material-dashboard-pro
* Copyright 2023Adele.ai(https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// Next.js
import { useRouter } from "next/router";
import { useEffect } from "react";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";

// NextJS Material Dashboard 2 PRO examples
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";

function Analytics() {
  const router = useRouter();
  
  // Rediriger automatiquement vers la page d'accueil par défaut
  useEffect(() => {
    // Redirection immédiate vers la page d'accueil
    router.replace("/");
  }, [router]);
  
  // Afficher un message de chargement pendant la redirection
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <MDTypography variant="h6" color="text">
          Redirection vers la page d&apos;accueil...
        </MDTypography>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Analytics;
