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
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";

const pitchStructures = [
  {
    id: "problem-solution-proof-cta",
    name: "Problem → Solution → Proof → CTA",
    description: "A classic conversion-focused flow.",
    segments: [
      { name: "Problem", duration: "6s" },
      { name: "Solution", duration: "6s" },
      { name: "Proof", duration: "4s" },
      { name: "CTA", duration: "4s" },
    ],
  },
  {
    id: "hook-value-cta",
    name: "Hook → Value → CTA",
    description: "Quick and engaging for busy audiences.",
    segments: [
      { name: "Hook", duration: "5s" },
      { name: "Value", duration: "10s" },
      { name: "CTA", duration: "5s" },
    ],
  },
  {
    id: "story-transformation-cta",
    name: "Story → Transformation → CTA",
    description: "Narrative-driven approach for emotional connection.",
    segments: [
      { name: "Story", duration: "8s" },
      { name: "Transformation", duration: "7s" },
      { name: "CTA", duration: "5s" },
    ],
  },
];

function StructureTab({ formData }) {
  const { values, setFieldValue } = formData;
  const [selectedStructure, setSelectedStructure] = useState(
    values.videoStructure || null
  );

  useEffect(() => {
    if (values.videoStructure) {
      setSelectedStructure(values.videoStructure);
    }
  }, [values.videoStructure]);

  const handleSelectStructure = (structure) => {
    setSelectedStructure(structure.id);
    setFieldValue("videoStructure", structure.id);
    setFieldValue("videoStructureData", structure);
  };

  // Récupérer l'objectif de la campagne pour le contexte
  const campaignObjective = values.campaignObjective || "Lead Generation";

  return (
    <MDBox>
      <MDBox mb={3}>
        <MDTypography variant="h6" fontWeight="medium" mb={1}>
          2. Select Pitch Structure
        </MDTypography>
        <MDTypography variant="body2" color="text">
          Based on your campaign objective:{" "}
          <MDTypography
            component="span"
            variant="body2"
            
            fontWeight="medium"
          >
            {campaignObjective}
          </MDTypography>
        </MDTypography>
      </MDBox>

      <MDBox>
        {pitchStructures.map((structure) => (
          <Card
            key={structure.id}
            sx={{
              mb: 2,
              border: `2px solid ${
                selectedStructure === structure.id ? "#0EB1EC" : "#e0e0e0"
              }`,
              borderRadius: 2,
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "#0EB1EC",
                boxShadow: "0 2px 8px rgba(14, 177, 236, 0.15)",
              },
            }}
            onClick={() => handleSelectStructure(structure)}
          >
            <CardContent>
              <MDBox display="flex" justifyContent="space-between" alignItems="flex-start">
                <MDBox flex={1}>
                  <MDTypography variant="h6" fontWeight="medium" mb={1}>
                    {structure.name}
                  </MDTypography>
                  <MDTypography variant="body2" color="text" mb={2}>
                    {structure.description}
                  </MDTypography>
                  
                  {/* Segments */}
                  <MDBox display="flex" gap={1} flexWrap="wrap">
                    {structure.segments.map((segment, index) => (
                      <Box
                        key={index}
                        sx={{
                          bgcolor: "#f5f5f5",
                          borderRadius: 1,
                          px: 2,
                          py: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          minWidth: 80,
                        }}
                      >
                        <MDTypography variant="caption" fontWeight="medium">
                          {segment.name}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          {segment.duration}
                        </MDTypography>
                      </Box>
                    ))}
                  </MDBox>
                </MDBox>
                
                {selectedStructure === structure.id && (
                  <MDBox ml={2}>
                    <MDTypography
                      variant="caption"
                      
                      fontWeight="medium"
                    >
                      Selected
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </CardContent>
          </Card>
        ))}
      </MDBox>
    </MDBox>
  );
}

// typechecking props for StructureTab
StructureTab.propTypes = {
  formData: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
};

export default StructureTab;


