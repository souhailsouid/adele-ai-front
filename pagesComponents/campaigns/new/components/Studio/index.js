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

import { useState, useEffect } from "react";

// prop-type is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";

// Studio sub-components
import StyleTab from "/pagesComponents/campaigns/new/components/Studio/StyleTab";
import StructureTab from "/pagesComponents/campaigns/new/components/Studio/StructureTab";
import AssetsTab from "/pagesComponents/campaigns/new/components/Studio/AssetsTab";
import AnimationsTab from "/pagesComponents/campaigns/new/components/Studio/AnimationsTab";
import RecordTab from "/pagesComponents/campaigns/new/components/Studio/RecordTab";

function Studio({ formData }) {
  const { formField, values, errors, touched, setFieldValue } = formData;
  const [activeTab, setActiveTab] = useState(0);

  // Restaurer l'onglet actif depuis le formulaire et le mettre à jour quand il change
  useEffect(() => {
    if (values.studioActiveTab !== undefined) {
      setActiveTab(values.studioActiveTab);
    }
  }, [values.studioActiveTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setFieldValue("studioActiveTab", newValue);
  };

  const tabs = [
    { label: "Style", value: 0 },
    { label: "Structure", value: 1 },
    { label: "Assets", value: 2 },
    { label: "Animations", value: 3 },
    { label: "Record", value: 4 },
  ];

  const getTabContent = () => {
    switch (activeTab) {
      case 0:
        return <StyleTab formData={formData} />;
      case 1:
        return <StructureTab formData={formData} />;
      case 2:
        return <AssetsTab formData={formData} />;
      case 3:
        return <AnimationsTab formData={formData} />;
      case 4:
        return <RecordTab formData={formData} />;
      default:
        return <StructureTab formData={formData} />;
    }
  };

  return (
    <MDBox>
      <MDBox lineHeight={0} mb={3}>
        <MDBox display="flex" alignItems="center" gap={1} mb={1}>
          <MDBox
            sx={{
              bgcolor: "#0EB1EC",
              color: "#fff",
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            Step 4
          </MDBox>
          <MDTypography variant="h5" fontWeight="medium">
            Studio: Create Your Video Master
          </MDTypography>
        </MDBox>
        <MDTypography variant="button" color="text">
          Follow the steps to create a high-quality video master for your campaign.
        </MDTypography>
      </MDBox>

      {/* Tabs Navigation */}
      <MDBox mb={3}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
   
              "& .MuiTab-root": {
                color: "#0EB1EC !important",
              textTransform: "none",
              fontWeight: 500,
              minHeight: 48,
              "&.Mui-selected": {
                color: "#fff !important",
                fontWeight: 600,
              },
            },
              "& .MuiTabs-indicator": {
                
              backgroundColor: "#0EB1EC",
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} />
          ))}
        </Tabs>
      </MDBox>

      {/* Tab Content */}
      <MDBox>{getTabContent()}</MDBox>
    </MDBox>
  );
}

// typechecking props for Studio
Studio.propTypes = {
  formData: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
};

export default Studio;
