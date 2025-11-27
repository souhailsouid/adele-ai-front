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

// @mui material components
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Icon from "@mui/material/Icon";
import Alert from "@mui/material/Alert";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";

function AnimationsTab({ formData }) {
  const { values } = formData;
  
  // Récupérer la structure sélectionnée pour afficher les segments
  const structureData = values.videoStructureData;
  const segments = structureData?.segments || [];

  return (
    <MDBox>
      <MDBox mb={3}>
        <MDBox display="flex" alignItems="center" gap={1} mb={1}>
          <Icon sx={{ color: "#0EB1EC" }}>animation</Icon>
          <MDTypography variant="h6" fontWeight="medium">
            4. Choose Scene Animations
          </MDTypography>
        </MDBox>
        <MDTypography variant="body2" color="text">
          Select a transition or effect for each scene in your video.
        </MDTypography>
      </MDBox>

      {/* Liste des scènes avec animations */}
      {segments.length > 0 ? (
        <MDBox mb={3}>
          {segments.map((segment, index) => (
            <Card
              key={index}
              sx={{
                mb: 2,
                border: "1px solid #e0e0e0",
                borderRadius: 2,
              }}
            >
              <CardContent>
                <MDBox
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <MDBox>
                    <MDTypography variant="h6" fontWeight="medium" mb={0.5}>
                      {segment.name}
                    </MDTypography>
                    <MDTypography variant="caption" color="text">
                      Duration: {segment.duration}
                    </MDTypography>
                  </MDBox>
                  <MDBox
                    sx={{
                      px: 2,
                      py: 1,
                      border: "1px solid #d2d6da",
                      borderRadius: 1,
                      bgcolor: "#fafafa",
                      cursor: "not-allowed",
                      opacity: 0.6,
                    }}
                  >
                    <MDTypography variant="body2" color="text">
                      Default Animation
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </CardContent>
            </Card>
          ))}
        </MDBox>
      ) : (
        <MDBox mb={3}>
          <Alert severity="info" icon={<Icon>info</Icon>}>
            <MDTypography variant="body2" color="dark">
              Please selecjjt a pitch structure first to configure animations.
            </MDTypography>
          </Alert>
        </MDBox>
      )}

      {/* Info Box */}
      <Alert severity="info" icon={<Icon>build</Icon>}>
        <MDTypography variant="h6" fontWeight="medium" mb={0.5}>
          Motion Kit
        </MDTypography>
        <MDTypography variant="body2">
          All animations use a common motion kit for a professional and consistent feel.
        </MDTypography>
      </Alert>

      {/* Coming Soon Notice */}
      <MDBox mt={3}>
        <Alert severity="warning" icon={<Icon>schedule</Icon>}>
          <MDTypography variant="body2" color="text">
            <strong>Coming Soon:</strong> Animation customization will be available after backend integration with HeyGen API.
          </MDTypography>
        </Alert>
      </MDBox>
    </MDBox>
  );
}

// typechecking props for AnimationsTab
AnimationsTab.propTypes = {
  formData: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
};

export default AnimationsTab;

