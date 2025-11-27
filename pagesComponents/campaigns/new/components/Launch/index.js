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

function Launch({ formData }) {
  return (
    <MDBox>
      <MDBox lineHeight={0} mb={3}>
        <MDTypography variant="h5" fontWeight="medium">
          Step 6 Launch
        </MDTypography>
        <MDTypography variant="button" color="text">
          Review and launch your campaign.
        </MDTypography>
      </MDBox>

      <MDBox>
        <MDTypography variant="body2" color="text">
          Launch settings and final review will be available here.
        </MDTypography>
      </MDBox>
    </MDBox>
  );
}

// typechecking props for Launch
Launch.propTypes = {
  formData: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
};

export default Launch;


