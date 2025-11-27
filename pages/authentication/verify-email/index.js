/**
 * Page de vérification d'email
 * Permet à l'utilisateur de confirmer son compte avec le code reçu par email
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

// formik components
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

// @mui material components
import Card from "@mui/material/Card";
import Alert from "@mui/material/Alert";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDInput from "/components/MDInput";
import MDButton from "/components/MDButton";

// Authentication layout components
import CoverLayout from "/pagesComponents/authentication/components/CoverLayout";

// Auth
import { useAuth } from "/hooks/useAuth";

const validationSchema = Yup.object().shape({
  code: Yup.string()
    .required("The verification code is required")
    .length(6, "The code must contain 6 characters"),
});

function VerifyEmail() {
  const router = useRouter();
  const { email } = router.query;
  const { confirmSignUp, resendConfirmationCode, error: authError, clearError } = useAuth();
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push("/authentication/sign-up");
    }
  }, [email, router]);

  const handleSubmit = async (values, actions) => {
    try {
      clearError();
      setSuccess(false);
      
      const result = await confirmSignUp(email, values.code);

      if (result.success) {
        setSuccess(true);
        actions.setSubmitting(false);
        
        // Redirect to the login page after 2 seconds
        setTimeout(() => {
          router.push("/authentication/sign-in?verified=true");
        }, 2000);
      }
    } catch (error) {
      console.error("Error verifying the email:", error);
      actions.setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setResending(true);
      setResendSuccess(false);
      clearError();
      
      await resendConfirmationCode(email);
      setResendSuccess(true);
    } catch (error) {
      console.error("Error resending the code:", error);
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <CoverLayout>
      <Card sx={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
        <MDBox
          variant="gradient"
          borderRadius="lg"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Verify your email
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Enter the verification code sent to {email}
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          {/* Affichage des erreurs */}
          {authError && (
            <MDBox mb={2}>
              <Alert severity="error" onClose={clearError}>
                {authError}
              </Alert>
            </MDBox>
          )}
          
          {/* Message de succès */}
          {success && (
            <MDBox mb={2}>
              <Alert severity="success">
                 Email verified successfully! Redirecting to the login page...
              </Alert>
            </MDBox>
          )}

          {/* Message de renvoi réussi */}
          {resendSuccess && (
            <MDBox mb={2}>
              <Alert severity="success">
                 Code resent! Check your email.
              </Alert>
            </MDBox>
          )}

          <Formik
            initialValues={{ code: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, isSubmitting }) => (
              <Form autoComplete="off">
                <MDBox mb={2}>
                  <Field
                    as={MDInput}
                    type="text"
                    label="Verification Code"
                    name="code"
                    variant="standard"
                    fullWidth
                    placeholder="000000"
                    InputLabelProps={{ shrink: true }}
                    error={errors.code && touched.code}
                    success={values.code && !errors.code}
                    inputProps={{ maxLength: 6 }}
                  />
                  <MDBox mt={0.75}>
                    <MDTypography
                      component="div"
                      variant="caption"
                      color="error"
                      fontWeight="regular"
                    >
                      <ErrorMessage name="code" />
                    </MDTypography>
                  </MDBox>
                </MDBox>

                <MDBox mt={4} mb={1}>
                  <MDButton
                    type="submit"
                    variant="gradient"
                    fullWidth
                    disabled={isSubmitting || success}
                  >
                    {isSubmitting ? "Verification..." : success ? "Verified!" : "Verify"}
                  </MDButton>
                </MDBox>

                <MDBox mt={2} mb={1} textAlign="center">
                  <MDTypography variant="button" color="text">
                    You didn&apos;t receive the code?{" "}
                    <MDTypography
                      component="span"
                      variant="button"
                      fontWeight="medium"
                      textGradient
                      sx={{ cursor: "pointer" }}
                      onClick={handleResendCode}
                    >
                      {resending ? "Sending..." : "Resend"}
                    </MDTypography>
                  </MDTypography>
                </MDBox>

                <MDBox mt={3} mb={1} textAlign="center">
                  <Link href="/authentication/sign-in">
                    <MDTypography
                      variant="button"
                      fontWeight="medium"
                      textGradient
                    >
                      Back to login
                    </MDTypography>
                  </Link>
                </MDBox>
              </Form>
            )}
          </Formik>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default VerifyEmail;


