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

import { useEffect } from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";

// NextJS Material Dashboard 2 PRO examples
import PageLayout from "/examples/LayoutContainers/PageLayout";

function Error({ statusCode }) {
  const router = useRouter();

  useEffect(() => {
    // Log error for debugging
    console.error("Error page rendered with status code:", statusCode);
  }, [statusCode]);

  const handleGoHome = () => {
    router.push("/dashboards/trading/overview");
  };

  return (
    <PageLayout>
      <MDBox
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        textAlign="center"
        px={3}
      >
        <MDTypography variant="h1" color="error" fontWeight="bold" mb={2}>
          {statusCode || "Erreur"}
        </MDTypography>
        <MDTypography variant="h4" color="text" mb={3}>
          {statusCode === 404
            ? "Page non trouvée"
            : statusCode === 500
            ? "Erreur serveur"
            : "Une erreur s'est produite"}
        </MDTypography>
        <MDTypography variant="body1" color="text.secondary" mb={4} maxWidth="600px">
          {statusCode === 404
            ? "La page que vous recherchez n'existe pas ou a été déplacée."
            : "Une erreur inattendue s'est produite. Veuillez réessayer plus tard."}
        </MDTypography>
        <MDButton variant="gradient" color="dark" onClick={handleGoHome}>
          Retour à l'accueil
        </MDButton>
      </MDBox>
    </PageLayout>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

Error.propTypes = {
  statusCode: PropTypes.number,
};

export default Error;


