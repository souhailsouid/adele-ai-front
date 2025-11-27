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

import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

// formik components
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

// @mui material components
import Card from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDInput from "/components/MDInput";
import MDButton from "/components/MDButton";

// Authentication layout components
import CoverLayout from "/pagesComponents/authentication/components/CoverLayout";

// Auth
import { useAuth } from "/context/AuthContext";

const codeAndPasswordValidation = Yup.object().shape({
  code: Yup.string()
    .required("Verification code is required.")
    .length(6, "Code must be 6 digits."),
  newPassword: Yup.string()
    .required("New password is required.")
    .min(8, "Password must be at least 8 characters."),
  confirmPassword: Yup.string()
    .required("Please confirm your password.")
    .oneOf([Yup.ref("newPassword")], "Passwords do not match."),
});

function ForgotPassword() {
  const router = useRouter();
  const { forgotPassword, confirmForgotPassword } = useAuth();
  const [step, setStep] = useState(1); // 1: email, 2: code + new password
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleStep1 = async (values, actions) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      
      await forgotPassword(values.email);
      
      setEmail(values.email);
      setSuccessMessage("Verification code sent to your email. Please check your inbox.");
      actions.setSubmitting(false);
      setStep(2);
    } catch (error) {
      setErrorMessage(error.message || "Error sending verification code. Please try again.");
      actions.setSubmitting(false);
    }
  };

  const handleStep2 = async (values, actions) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      
      await confirmForgotPassword(email, values.code, values.newPassword);
      
      setSuccessMessage("Password reset successfully! Redirecting to sign in...");
      actions.setSubmitting(false);
      
      // Redirect to sign in after successful password reset
      setTimeout(() => {
        router.push("/authentication/sign-in");
      }, 2000);
    } catch (error) {
      setErrorMessage(error.message || "Error resetting password. Please check your code and try again.");
      actions.setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      
      await forgotPassword(email);
      setSuccessMessage("Verification code resent to your email.");
    } catch (error) {
      setErrorMessage(error.message || "Error resending code. Please try again.");
    }
  };

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
            backgroundColor: "dark.main",
          }}
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Reset Password
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            {step === 1
              ? "Enter your email to receive a verification code"
              : "Enter the code and your new password"}
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          {errorMessage && (
            <MDBox mb={2}>
              <Alert severity="error" onClose={() => setErrorMessage("")}>
                {errorMessage}
              </Alert>
            </MDBox>
          )}
          {successMessage && (
            <MDBox mb={2}>
              <Alert severity="success" onClose={() => setSuccessMessage("")}>
                {successMessage}
              </Alert>
            </MDBox>
          )}
          {step === 1 ? (
            <Formik
              initialValues={{ email: "" }}
              validationSchema={Yup.object().shape({
                email: Yup.string()
                  .required("Email address is required.")
                  .email("Your email address is invalid"),
              })}
              onSubmit={handleStep1}
            >
              {({ values, errors, touched, isSubmitting }) => (
                <Form autoComplete="off">
                  <MDBox mb={2}>
                    <Field
                      as={MDInput}
                      type="email"
                      label="Email"
                      name="email"
                      variant="standard"
                      fullWidth
                      placeholder="john@example.com"
                      InputLabelProps={{ shrink: true }}
                      error={errors.email && touched.email}
                      success={values.email && !errors.email}
                    />
                    <MDBox mt={0.75}>
                      <MDTypography
                        component="div"
                        variant="caption"
                        color="error"
                        fontWeight="regular"
                      >
                        <ErrorMessage name="email" />
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                  <MDBox mt={4} mb={1}>
                    <MDButton
                      type="submit"
                      variant="contained"
                      color="dark"
                      fullWidth
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending Code..." : "Send Verification Code"}
                    </MDButton>
                  </MDBox>
                  <MDBox mt={3} mb={1} textAlign="center">
                    <Link href="/authentication/sign-in">
                      <MDTypography
                        variant="button"
                        fontWeight="medium"
                        sx={{ cursor: "pointer" }}
                      >
                        Back to Sign In
                      </MDTypography>
                    </Link>
                  </MDBox>
                </Form>
              )}
            </Formik>
          ) : (
            <Formik
              initialValues={{ code: "", newPassword: "", confirmPassword: "" }}
              validationSchema={codeAndPasswordValidation}
              onSubmit={handleStep2}
            >
              {({ values, errors, touched, isSubmitting }) => (
                <Form autoComplete="off">
                  <MDBox mb={2}>
                    <MDInput
                      type="email"
                      label="Email"
                      value={email}
                      variant="standard"
                      fullWidth
                      disabled
                      InputLabelProps={{ shrink: true }}
                    />
                  </MDBox>
                  <MDBox mb={2}>
                    <Field
                      as={MDInput}
                      type="text"
                      label="Verification Code"
                      name="code"
                      variant="standard"
                      fullWidth
                      placeholder="123456"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ maxLength: 6 }}
                      error={errors.code && touched.code}
                      success={values.code && !errors.code}
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
                    <MDTypography variant="caption" color="text" mt={1}>
                      Enter the 6-digit code sent to your email
                    </MDTypography>
                  </MDBox>
                  <MDBox mb={2}>
                    <Field
                      as={MDInput}
                      type={showNewPassword ? "text" : "password"}
                      label="New Password"
                      name="newPassword"
                      variant="standard"
                      fullWidth
                      placeholder="************"
                      InputLabelProps={{ shrink: true }}
                      error={errors.newPassword && touched.newPassword}
                      success={values.newPassword && !errors.newPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle new password visibility"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              edge="end"
                            >
                              {showNewPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <MDBox mt={0.75}>
                      <MDTypography
                        component="div"
                        variant="caption"
                        color="error"
                        fontWeight="regular"
                      >
                        <ErrorMessage name="newPassword" />
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                  <MDBox mb={2}>
                    <Field
                      as={MDInput}
                      type={showConfirmPassword ? "text" : "password"}
                      label="Confirm New Password"
                      name="confirmPassword"
                      variant="standard"
                      fullWidth
                      placeholder="************"
                      InputLabelProps={{ shrink: true }}
                      error={errors.confirmPassword && touched.confirmPassword}
                      success={values.confirmPassword && !errors.confirmPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle confirm password visibility"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <MDBox mt={0.75}>
                      <MDTypography
                        component="div"
                        variant="caption"
                        color="error"
                        fontWeight="regular"
                      >
                        <ErrorMessage name="confirmPassword" />
                      </MDTypography>
                    </MDBox>
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
                      {isSubmitting ? "Resetting Password..." : "Reset Password"}
                    </MDButton>
                  </MDBox>
                  <MDBox mt={2} mb={1} textAlign="center">
                    <MDTypography
                      variant="button"
                      fontWeight="medium"
                      sx={{ cursor: "pointer" }}
                      onClick={handleResendCode}
                    >
                      Resend code
                    </MDTypography>
                  </MDBox>
                  <MDBox mt={2} mb={1} textAlign="center">
                    <Link href="/authentication/sign-in">
                      <MDTypography
                        variant="button"
                        color="text"
                        fontWeight="regular"
                        sx={{ cursor: "pointer" }}
                      >
                        Back to Sign In
                      </MDTypography>
                    </Link>
                  </MDBox>
                </Form>
              )}
            </Formik>
          )}
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default ForgotPassword;

