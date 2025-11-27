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

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";

// formik components
import { Formik, Form } from "formik";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepConnector, { stepConnectorClasses } from "@mui/material/StepConnector";
import { styled } from "@mui/material/styles";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDButton from "/components/MDButton";


// NextJS Material Dashboard 2 PRO examples
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";

// NewCampaign page components
import Brand from "/pagesComponents/campaigns/new/components/Brand";
import Campaign from "/pagesComponents/campaigns/new/components/Campaign";
import Contacts from "/pagesComponents/campaigns/new/components/Contacts";
import Studio from "/pagesComponents/campaigns/new/components/Studio";
import Personalize from "/pagesComponents/campaigns/new/components/Personalize";
import Launch from "/pagesComponents/campaigns/new/components/Launch";

// NewCampaign layout schemas for form and form fields
import validations from "/pagesComponents/campaigns/new/schemas/validations";
import form from "/pagesComponents/campaigns/new/schemas/form";
import initialValues from "/pagesComponents/campaigns/new/schemas/initialValues";

// API Client
import apiClient from "/lib/api/client";

// Auth
import { useAuth } from "/hooks/useAuth";

//Adele.aicolored StepConnector
const PersonamyStepConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#0EB1EC",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#0EB1EC",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.mode === "dark" ? "#e0e0e0" : "#eaeaf0",
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

//Adele.aicolored StepIcon - Style sobre
const PersonamyStepIconRoot = styled("div")(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#e0e0e0" : "#f0f2f5",
  zIndex: 1,
  color: "#7b809a",
  width: 40,
  height: 40,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  border: "2px solid transparent",
  transition: "all 0.2s ease",
  ...(ownerState.active && {
    backgroundColor: "#0EB1EC",
    color: "#fff",
    borderColor: "#0EB1EC",
  }),
  ...(ownerState.completed && {
    backgroundColor: "#0EB1EC",
    color: "#fff",
    borderColor: "#0EB1EC",
  }),
}));

function PersonamyStepIcon(props) {
  const { active, completed, className, icon } = props;

  return (
    <PersonamyStepIconRoot ownerState={{ active, completed }} className={className}>
      {completed ? (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            fill="currentColor"
          />
        </svg>
      ) : (
        <span style={{ fontSize: "18px", fontWeight: "bold" }}>{icon}</span>
      )}
    </PersonamyStepIconRoot>
  );
}

function getSteps() {
  return ["Brand", "Campaign", "Contacts", "Studio", "Personalize", "Launch"];
}

function getStepContent(stepIndex, formData) {
  switch (stepIndex) {
    case 0:
      return <Brand formData={formData} />;
    case 1:
      return <Campaign formData={formData} />;
    case 2:
      return <Contacts formData={formData} />;
    case 3:
      return <Studio formData={formData} />;
    case 4:
      return <Personalize formData={formData} />;
    case 5:
      return <Launch formData={formData} />;
    default:
      return null;
  }
}

function NewCampaign() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [activeStep, setActiveStep] = useState(2);
  const [orgData, setOrgData] = useState(null);
  const [loadingOrg, setLoadingOrg] = useState(false);
  const formikRef = useRef(null);
  const steps = getSteps();
  const { formId, formField } = form;
  const currentValidation = validations[activeStep];
  const isLastStep = activeStep === steps.length - 1;

  const sleep = (ms) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });

  // Charger les données de l'organisation quand on arrive à l'étape 2 (Campaign)
  useEffect(() => {
    const loadOrganizationData = async () => {
      if (activeStep === 1 && isAuthenticated() && !orgData && !loadingOrg) {
        try {
          setLoadingOrg(true);
          const orgId = localStorage.getItem("current_org_id");
          if (orgId) {
            const org = await apiClient.getOrganization(orgId);
            setOrgData(org);
          }
        } catch (error) {
          console.error("Error loading organization:", error);
        } finally {
          setLoadingOrg(false);
        }
      }
    };
    
    loadOrganizationData();
  }, [activeStep, isAuthenticated, orgData, loadingOrg]);

  // Pré-remplir les champs avec les données enrichies quand on arrive à l'étape 2
  useEffect(() => {
    if (activeStep === 1 && orgData && formikRef.current) {
      const snapshot = orgData.enrichment_snapshot || {};
      const { setFieldValue, values } = formikRef.current;
      
      // Pré-remplir companyWebsite si vide
      if (orgData.company_website_url && !values[formField.companyWebsite.name]) {
        setFieldValue(formField.companyWebsite.name, orgData.company_website_url, false);
      }
      
      // Pré-remplir companyInfo si vide
      if (snapshot.description && !values[formField.companyInfo.name]) {
        let companyInfoText = snapshot.description;
        
        // Ajouter les industries si disponibles
        if (snapshot.industries && snapshot.industries.length > 0) {
          companyInfoText += `\n\nIndustries: ${snapshot.industries.join(", ")}`;
        }
        
        // Ajouter les produits si disponibles
        if (snapshot.products && snapshot.products.length > 0) {
          companyInfoText += `\n\nProducts/Services: ${snapshot.products.join(", ")}`;
        }
        
        // Ajouter les clients cibles si disponibles
        if (snapshot.targetCustomers && snapshot.targetCustomers.length > 0) {
          companyInfoText += `\n\nTarget Customers: ${snapshot.targetCustomers.join(", ")}`;
        }
        
        setFieldValue(formField.companyInfo.name, companyInfoText, false);
      }
    }
  }, [activeStep, orgData, formField]);

  const handleBack = () => setActiveStep(activeStep - 1);

  const submitForm = async (values, actions) => {
    await sleep(1000);

    // eslint-disable-next-line no-alert
    alert(JSON.stringify(values, null, 2));

    actions.setSubmitting(false);
    actions.resetForm();

    setActiveStep(0);

    // Redirect to campaigns list
    router.push("/campaigns");
  };

  const handleSubmit = (values, actions) => {
    if (isLastStep) {
      submitForm(values, actions);
    } else {
      // Si on est dans l'étape Studio (step 3), gérer la navigation entre les tabs
      if (activeStep === 3) {
        const currentStudioTab = values.studioActiveTab || 1; // Par défaut Structure (tab 1)
        const lastStudioTab = 4; // Record est le dernier tab
        
        if (currentStudioTab < lastStudioTab) {
          // Passer au tab suivant dans Studio
          actions.setFieldValue("studioActiveTab", currentStudioTab + 1);
          actions.setTouched({});
          actions.setSubmitting(false);
          return; // Ne pas passer à l'étape suivante
        }
        // Si on est sur le dernier tab du Studio, passer à l'étape suivante
      }
      
      setActiveStep(activeStep + 1);
      actions.setTouched({});
      actions.setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} pb={10}>
        <Grid
          container
          justifyContent="center"
          alignItems="flex-start"
          sx={{ mt: 8 }}
        >
          <Grid item xs={12} lg={10}>
            <Formik
              innerRef={formikRef}
              initialValues={initialValues}
              validationSchema={currentValidation}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, errors, touched, isSubmitting, setFieldValue }) => (
                <Form id={formId} autoComplete="off">
                  <Card sx={{ height: "100%" }}>
                    <MDBox mx={2} mt={-3}>
                      <Stepper 
                        activeStep={activeStep} 
                        alternativeLabel 
                        connector={<PersonamyStepConnector />}
                        sx={{
                          background: "#fff",
                          padding: "24px 0 40px",
                          borderRadius: "0.75rem",
                          border: "1px solid rgba(0, 0, 0, 0.08)",
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05), 0 2px 8px rgba(14, 177, 236, 0.08)",
                          "& .MuiStepLabel-root": {
                            "& .MuiStepLabel-label": {
                              color: "#344767 !important",
                              fontSize: "0.75rem",
                              fontWeight: 500,
                              "&.Mui-active": {
                                color: "#0EB1EC !important",
                                fontWeight: 600,
                              },
                              "&.Mui-completed": {
                                color: "#344767 !important",
                                fontWeight: 500,
                              },
                            },
                            "& .MuiStepLabel-alternativeLabel": {
                              marginTop: "8px",
                            },
                          },
                        }}
                      >
                        {steps.map((label, index) => (
                          <Step key={label}>
                            <StepLabel
                              StepIconComponent={PersonamyStepIcon}
                              StepIconProps={{ icon: index + 1 }}
                            >
                              {label}
                            </StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                    </MDBox>
                    <MDBox p={3}>
                      <MDBox>
                        {getStepContent(activeStep, {
                          values,
                          touched,
                          formField,
                          errors,
                          companyData: orgData,
                          setFieldValue,
                        })}
                        <MDBox
                          mt={2}
                          width="100%"
                          display="flex"
                          justifyContent="space-between"
                        >
                          {activeStep === 0 ? (
                            <MDButton
                              variant="outlined"
                              color="dark"
                              onClick={() => router.push("/campaigns")}
                            >
                              Cancel
                            </MDButton>
                          ) : (
                            <MDButton
                              variant="outlined"
                              sx={{ 
                                borderColor: "#d2d6da",
                                color: "#344767",
                                "&:hover": {
                                  borderColor: "#0EB1EC",
                                  color: "#0EB1EC",
                                },
                              }}
                              onClick={() => {
                                // Si on est dans Studio et pas sur le premier tab, revenir au tab précédent
                                if (activeStep === 3) {
                                  const currentStudioTab = values.studioActiveTab || 1;
                                  if (currentStudioTab > 0) {
                                    setFieldValue("studioActiveTab", currentStudioTab - 1);
                                    return;
                                  }
                                }
                                handleBack();
                              }}
                            >
                              {(() => {
                                if (activeStep === 3) {
                                  const currentStudioTab = values.studioActiveTab || 1;
                                  if (currentStudioTab > 0) {
                                    const studioTabs = ["Style", "Structure", "Assets", "Animations", "Record"];
                                    return `Previous: ${studioTabs[currentStudioTab - 1]}`;
                                  }
                                }
                                return "Previous Step";
                              })()}
                            </MDButton>
                          )}
                          <MDButton
                            disabled={isSubmitting}
                            type="submit"
                            variant="contained"
                            sx={{ 
                              backgroundColor: "#0EB1EC", 
                              color: "#fff",
                              "&:hover": {
                                backgroundColor: "#0C9DD4",
                              },
                            }}
                          >
                            {(() => {
                              if (isLastStep) return "Launch Campaign";
                              if (activeStep === 3) {
                                // Dans Studio, afficher le nom du prochain tab
                                const currentStudioTab = values.studioActiveTab || 1;
                                const studioTabs = ["Style", "Structure", "Assets", "Animations", "Record"];
                                const nextTabIndex = currentStudioTab + 1;
                                if (nextTabIndex < studioTabs.length) {
                                  return `Next: ${studioTabs[nextTabIndex]}`;
                                }
                                return "Next Step";
                              }
                              return "Next Step";
                            })()}
                          </MDButton>
                        </MDBox>
                      </MDBox>
                    </MDBox>
                  </Card>
                </Form>
              )}
            </Formik>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default NewCampaign;

