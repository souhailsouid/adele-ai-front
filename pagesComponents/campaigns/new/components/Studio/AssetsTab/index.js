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
import Icon from "@mui/material/Icon";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";

function AssetsTab({ formData }) {
  const { values, setFieldValue } = formData;
  const [assets, setAssets] = useState({
    problemIllustration: values.problemIllustration || null,
    solutionProductShot: values.solutionProductShot || null,
    socialProof: values.socialProof || null,
  });
  const [previews, setPreviews] = useState({
    problemIllustration: null,
    solutionProductShot: null,
    socialProof: null,
  });

  // Récupérer la structure sélectionnée pour déterminer les assets nécessaires
  const structureData = values.videoStructureData;
  const structureName = structureData?.name || "Problem → Solution → Proof → CTA";

  useEffect(() => {
    setAssets({
      problemIllustration: values.problemIllustration || null,
      solutionProductShot: values.solutionProductShot || null,
      socialProof: values.socialProof || null,
    });
  }, [values.problemIllustration, values.solutionProductShot, values.socialProof]);

  // Gérer les previews des images
  useEffect(() => {
    const newPreviews = {};
    
    Object.keys(assets).forEach((key) => {
      if (assets[key] instanceof File) {
        const objectUrl = URL.createObjectURL(assets[key]);
        newPreviews[key] = objectUrl;
      } else if (assets[key] && typeof assets[key] === 'string') {
        // Si c'est déjà une URL (après sauvegarde)
        newPreviews[key] = assets[key];
      } else {
        newPreviews[key] = null;
      }
    });
    
    setPreviews(newPreviews);
    
    // Cleanup function
    return () => {
      Object.values(newPreviews).forEach((url) => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [assets]);

  const handleFileUpload = (assetType, file) => {
    const newAssets = { ...assets, [assetType]: file };
    setAssets(newAssets);
    setFieldValue(assetType, file);
  };

  const handleFileSelect = (assetType) => (event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(assetType, file);
    }
  };

  const handleRemoveFile = (assetType) => {
    const newAssets = { ...assets, [assetType]: null };
    setAssets(newAssets);
    setFieldValue(assetType, null);
    if (previews[assetType] && previews[assetType].startsWith('blob:')) {
      URL.revokeObjectURL(previews[assetType]);
    }
    setPreviews({ ...previews, [assetType]: null });
  };

  const assetConfigs = [
    {
      key: "problemIllustration",
      title: "Problem Illustration",
      description: "Image representing the customer's pain point.",
      icon: "image",
    },
    {
      key: "solutionProductShot",
      title: "Solution/Product Shot",
      description: "Image showcasing your solution.",
      icon: "image",
    },
    {
      key: "socialProof",
      title: "Social Proof",
      description: "Logos of companies who trust you.",
      icon: "image",
    },
  ];

  return (
    <MDBox>
      <MDBox mb={3}>
        <MDTypography variant="h6" fontWeight="medium" mb={1}>
          3. Upload Required Assets
        </MDTypography>
        <MDTypography variant="body2" color="text">
          Upload the media needed for your selected pitch structure:{" "}
          <MDTypography
            component="span"
            variant="body2"
            fontWeight="medium"
          >
            {structureName}
          </MDTypography>
        </MDTypography>
      </MDBox>

      <MDBox mb={3}>
        {assetConfigs.map((config) => (
          <Card
            key={config.key}
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
                alignItems="flex-start"
                gap={2}
              >
                <MDBox flex={1}>
                  <MDTypography variant="h6" fontWeight="medium" mb={0.5}>
                    {config.title}
                  </MDTypography>
                  <MDTypography variant="body2" color="text" mb={2}>
                    {config.description}
                  </MDTypography>
                  
                  {/* Preview de l'image */}
                  {previews[config.key] ? (
                    <MDBox
                      sx={{
                        position: "relative",
                        display: "inline-block",
                        mb: 2,
                      }}
                    >
                      <Avatar
                        src={previews[config.key]}
                        alt={config.title}
                        variant="rounded"
                        sx={{
                          width: 200,
                          height: 120,
                          border: "2px solid #e0e0e0",
                          borderRadius: 2,
                          objectFit: "cover",
                        }}
                      />
                      {assets[config.key] && (
                        <MDTypography variant="caption" color="text" mt={1} display="block">
                          {assets[config.key].name || "File uploaded"}
                        </MDTypography>
                      )}
                    </MDBox>
                  ) : (
                    <MDBox
                      sx={{
                        width: 200,
                        height: 120,
                        border: "2px dashed #d2d6da",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "#fafafa",
                        mb: 2,
                      }}
                    >
                      <Icon sx={{ fontSize: 48, color: "#d2d6da" }}>
                        {config.icon}
                      </Icon>
                    </MDBox>
                  )}
                </MDBox>
                
                <MDBox display="flex" flexDirection="column" gap={1}>
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id={`upload-${config.key}`}
                    type="file"
                    onChange={handleFileSelect(config.key)}
                  />
                  <label htmlFor={`upload-${config.key}`}>
                    <MDButton
                      variant="contained"
                      component="span"
                      startIcon={<Icon>{assets[config.key] ? "edit" : "cloud_upload"}</Icon>}
                      size="small"
                    >
                      {assets[config.key] ? "CHANGE" : "UPLOAD IMAGE"}
                    </MDButton>
                  </label>
                  {assets[config.key] && (
                    <MDButton
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<Icon>delete</Icon>}
                      onClick={() => handleRemoveFile(config.key)}
                    >
                      Remove
                    </MDButton>
                  )}
                </MDBox>
              </MDBox>
            </CardContent>
          </Card>
        ))}
      </MDBox>

      {/* Asset Requirements */}
      <Alert severity="info" icon={<Icon>info</Icon>}>
        <MDTypography variant="h6" fontWeight="medium" mb={0.5}>
          Asset Requirements
        </MDTypography>
        <MDTypography variant="body2">
          Images must be 1920×1080 (16:9). Videos should be MP4 up to 25s.
        </MDTypography>
      </Alert>
    </MDBox>
  );
}

// typechecking props for AssetsTab
AssetsTab.propTypes = {
  formData: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
};

export default AssetsTab;

