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

// prop-type is a library for typechecking of props
import PropTypes from "prop-types";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";

function StyleTab({ formData }) {
  return (
    <MDBox>
      <MDBox mb={3}>
        <MDTypography variant="h6" fontWeight="medium" mb={1}>
          1. Select Video Style
        </MDTypography>
        <MDTypography variant="body2" color="text">
          Choose the visual style for your video master.
        </MDTypography>
      </MDBox>

      <MDBox>
        <MDTypography variant="body2" color="text">
          Style selection will be available here.
        </MDTypography>
      </MDBox>
    </MDBox>
  );
}

// typechecking props for StyleTab
StyleTab.propTypes = {
  formData: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
};

export default StyleTab;


