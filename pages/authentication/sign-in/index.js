

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
import { useAuth } from "/hooks/useAuth";

// API Client
import apiClient from "/lib/api/client";

const signinValidation = Yup.object().shape({
    email: Yup.string()
        .required("Email address is required.")
        .email("Your email address is invalid"),
    password: Yup.string()
        .required("Password is required.")
        .min(6, "Your password should be more than 6 characters."),
});

function SignIn() {
    const router = useRouter();
    const { signIn, error: authError, clearError } = useAuth();
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Récupérer la redirection depuis l'URL si présente
    const redirectTo = router.query.redirect || null;

    const handleSubmit = async (values, actions) => {
        try {
            setError(null);
            clearError();

            // Connexion via Cognito (sans redirection automatique)
            await signIn(values.email, values.password, false);

            // Après connexion réussie, rediriger
            if (redirectTo) {
                router.push(redirectTo);
            } else {
                // Vérifier si l'utilisateur a une organisation
                const hasOrg = localStorage.getItem("current_org_id");

                if (hasOrg) {
                    router.push("/campaigns");
                } else {
                    router.push("/authentication/onboarding");
                }
            }
        } catch (err) {
            console.error("Sign in error:", err);
            setError(err.message || "Failed to sign in. Please check your credentials.");
            actions.setSubmitting(false);
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
                        Sign in
                    </MDTypography>
                    <MDTypography display="block" variant="button" color="white" my={1}>
                        Enter your email and password to Sign In
                    </MDTypography>
                </MDBox>
                <MDBox pt={4} pb={3} px={3}>
                    {/* Affichage des erreurs */}
                    {(error || authError) && (
                        <MDBox mb={2}>
                            <Alert severity="error" onClose={() => { setError(null); clearError(); }}>
                                {error || authError}
                            </Alert>
                        </MDBox>
                    )}

                    <Formik
                        initialValues={{ email: "", password: "" }}
                        validationSchema={signinValidation}
                        onSubmit={handleSubmit}
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
                                <MDBox mb={2}>
                                    <Field
                                        as={MDInput}
                                        type={showPassword ? "text" : "password"}
                                        label="Password"
                                        name="password"
                                        variant="standard"
                                        fullWidth
                                        placeholder="************"
                                        InputLabelProps={{ shrink: true }}
                                        error={errors.password && touched.password}
                                        success={values.password && !errors.password}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
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
                                            <ErrorMessage name="password" />
                                        </MDTypography>
                                    </MDBox>
                                </MDBox>
                                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>

                                    <Link href="/authentication/forgot-password">
                                        <MDTypography
                                            variant="button"
                                            fontWeight="medium"
                                            sx={{ cursor: "pointer" }}
                                        >
                                            Forgot password?
                                        </MDTypography>
                                    </Link>
                                </MDBox>
                                <MDBox mt={4} mb={1}>
                                    <MDButton
                                        type="submit"
                                        variant="contained"
                                        color="dark"
                                        fullWidth
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Signing in..." : "Sign In"}
                                    </MDButton>
                                </MDBox>
                                <MDBox mt={3} mb={1} textAlign="center">
                                    <MDTypography variant="button" color="text">
                                        Don&apos;t have an account?{" "}
                                        <Link href="/authentication/sign-up">
                                            <MDTypography
                                                variant="button"
                                                fontWeight="medium"
                                                textGradient
                                            >
                                                Sign up
                                            </MDTypography>
                                        </Link>
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

export default SignIn;

