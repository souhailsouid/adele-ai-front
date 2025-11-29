

import { useState, useEffect } from "react";
import { useRouter } from "next/router";

// formik components
import { Formik, Form, Field, ErrorMessage, useField } from "formik";

// Auth
import { useAuth } from "/hooks/useAuth";

// API Client
import apiClient from "/lib/api/client";

// @mui material components
import Card from "@mui/material/Card";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Alert from "@mui/material/Alert";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDInput from "/components/MDInput";
import MDButton from "/components/MDButton";

// Authentication layout components
import CoverLayout from "/pagesComponents/authentication/components/CoverLayout";

// Onboarding schemas
import validations from "/pagesComponents/authentication/onboarding/schemas/validations";
import form from "/pagesComponents/authentication/onboarding/schemas/form";
import initialValues from "/pagesComponents/authentication/onboarding/schemas/initialValues";

const POSITION_OPTIONS = [
  "CEO / Founder",
  "CTO / Technical Director",
  "CMO / Marketing Director",
  "VP of Sales",
  "VP of Marketing",
  "VP of Engineering",
  "Marketing Manager",
  "Sales Manager",
  "Product Manager",
  "Business Development Manager",
  "Account Executive",
  "Sales Representative",
  "Marketing Specialist",
  "Growth Manager",
  "Operations Manager",
  "Other",
];

function PositionField({ formField, values, errors, touched, setFieldValue }) {
  const [field, meta] = useField(formField.position.name);
  const isOther = field.value === "Other";

  return (
    <MDBox>
      <FormControl 
        fullWidth 
        variant="standard" 
        error={meta.touched && !!meta.error}
        sx={{ mb: isOther ? 2 : 0 }}
      >
        <InputLabel id="position-label" shrink>
          {formField.position.label}
        </InputLabel>
        <Select
          {...field}
          labelId="position-label"
          label={formField.position.label}
          value={field.value || ""}
          onChange={(e) => {
            const value = e.target.value;
            setFieldValue(formField.position.name, value);
            // Si "Other" n'est pas sélectionné, réinitialiser le champ custom
            if (value !== "Other") {
              setFieldValue("positionCustom", "");
            }
          }}
        >
          {POSITION_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <MDBox mt={0.75}>
        <MDTypography
          component="div"
          variant="caption"
          color="error"
          fontWeight="regular"
        >
          <ErrorMessage name={formField.position.name} />
        </MDTypography>
      </MDBox>
      {isOther && (
        <MDBox mt={2}>
          <Field
            as={MDInput}
            type="text"
            label="Specify your position"
            name="positionCustom"
            variant="standard"
            fullWidth
            InputLabelProps={{ shrink: true }}
            placeholder="Enter your position"
            error={errors.positionCustom && touched.positionCustom}
            success={values.positionCustom && !errors.positionCustom}
          />
          <MDBox mt={0.75}>
            <MDTypography
              component="div"
              variant="caption"
              color="error"
              fontWeight="regular"
            >
              <ErrorMessage name="positionCustom" />
            </MDTypography>
          </MDBox>
        </MDBox>
      )}
    </MDBox>
  );
}

function Onboarding() {
    const router = useRouter();
    const { formId, formField } = form;
    const { user, isAuthenticated, loading } = useAuth();
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Vérifier l'authentification au chargement
    useEffect(() => {
        if (!loading && !isAuthenticated()) {
            // Rediriger vers sign-in si pas authentifié
            router.push("/authentication/sign-in?redirect=/authentication/onboarding");
        }
    }, [loading, isAuthenticated, router]);

    // Fonction pour normaliser l'URL avant envoi
    const normalizeUrlForSubmission = (url) => {
        if (!url) return url;
        
        let normalized = url.trim();
        
        // Si pas de protocole, ajouter https://
        if (!normalized.match(/^https?:\/\//i)) {
            // Si commence par www., ajouter https://
            if (normalized.match(/^www\./i)) {
                normalized = `https://${normalized}`;
            } else {
                // Sinon, ajouter https://
                normalized = `https://${normalized}`;
            }
        }
        
        // Enlever le trailing slash
        normalized = normalized.replace(/\/$/, "");
        
        return normalized;
    };

    const handleSubmit = async (values, actions) => {
        try {
            setError(null);
            setSuccess(false);
            
            // Si "Other" est sélectionné, utiliser positionCustom, sinon utiliser position
            const finalPosition = values.position === "Other" ? values.positionCustom : values.position;
            
            // Normaliser l'URL avant l'envoi (double sécurité)
            const normalizedUrl = normalizeUrlForSubmission(values.companyUrl);
            
            // Créer l'organisation via l'API
            const result = await apiClient.createOrganization({
                company_website_url: normalizedUrl,
                user_position: finalPosition,
            });
            
            console.log("Organization created:", result);
            
            // Stocker l'org_id pour utilisation future
            if (result.org_id) {
                localStorage.setItem("current_org_id", result.org_id);
            }
            
            setSuccess(true);
            
            // L'enrichissement est déclenché automatiquement en arrière-plan
            // Attendre 1 seconde pour afficher le message de succès
            // setTimeout(() => {
            //     // router.push("/campaigns");
            // }, 1500);
        } catch (err) {
            console.error("Onboarding error:", err);
            setError(err.message || "Failed to create organization. Please try again.");
            actions.setSubmitting(false);
        }
    };

  // Afficher un loader pendant la vérification de l'auth
  if (loading || !isAuthenticated()) {
    return (
      <CoverLayout>
        <Card sx={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
          <MDBox p={4} textAlign="center">
            <MDTypography variant="h6">Loading...</MDTypography>
          </MDBox>
        </Card>
      </CoverLayout>
    );
  }

  return (
    <CoverLayout>
      <Card sx={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
        <MDBox
          bgColor="white"
          borderRadius="lg"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
          sx={{
            borderBottom: "2px solid #0EB1EC",
          }}
        >
          <MDTypography variant="h4" fontWeight="medium" color="dark" mt={1}>
            Complete Your Profile
          </MDTypography>
          <MDTypography display="block" variant="button" color="text" my={1}>
            Complete your profile to start creating campaigns
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          {/* Affichage des erreurs */}
          {error && (
            <MDBox mb={2}>
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            </MDBox>
          )}

          {/* Message de succès */}
          {success && (
            <MDBox mb={2}>
              <Alert severity="success">
                Organization created successfully! We&apos;re analyzing your company website in the background. Redirecting...
              </Alert>
            </MDBox>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validations}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, isSubmitting, setFieldValue }) => (
              <Form id={formId} autoComplete="off">
                <MDBox mb={2}>
                  <Field
                    as={MDInput}
                    type={formField.companyUrl.type}
                    label={formField.companyUrl.label}
                    name={formField.companyUrl.name}
                    variant="standard"
                    fullWidth
                    placeholder="https://yourcompany.com"
                    InputLabelProps={{ shrink: true }}
                    error={errors.companyUrl && touched.companyUrl}
                    success={values.companyUrl && !errors.companyUrl}
                  />
                  <MDBox mt={0.75}>
                    <MDTypography
                      component="div"
                      variant="caption"
                      color="error"
                      fontWeight="regular"
                    >
                      <ErrorMessage name={formField.companyUrl.name} />
                    </MDTypography>
                  </MDBox>
                </MDBox>
                <MDBox mb={2}>
                  <PositionField
                    formField={formField}
                    values={values}
                    errors={errors}
                    touched={touched}
                    setFieldValue={setFieldValue}
                  />
                </MDBox>
                <MDBox mt={4} mb={1}>
                  <MDButton
                    type="submit"
                    variant="contained"
                    sx={{ 
                      backgroundColor: "#0EB1EC", 
                      color: "#fff",
                      "&:hover": {
                        backgroundColor: "#0C9DD4",
                      },
                    }}
                    fullWidth
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Completing..." : "Complete Profile & Continue"}
                  </MDButton>
                </MDBox>
                <MDBox mt={2} mb={1}>
                  <MDTypography variant="caption" color="text" textAlign="center" display="block">
                    These details are required to create and manage your campaigns
                  </MDTypography>
                </MDBox>
              </Form>
            )}
          </Formik>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default Onboarding;

