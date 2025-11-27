

import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

// formik components
import { Formik, Form, Field, ErrorMessage } from "formik";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
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

// Signup schemas
import validations from "/pagesComponents/authentication/signup/schemas/validations";
import form from "/pagesComponents/authentication/signup/schemas/form";
import initialValues from "/pagesComponents/authentication/signup/schemas/initialValues";

// Auth
import { useAuth } from "/hooks/useAuth";

function SignUp() {
    const router = useRouter();
    const { formId, formField } = form;
    const { signUp, error: authError, clearError } = useAuth();
    const [success, setSuccess] = useState(false);
    const [pendingEmail, setPendingEmail] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (values, actions) => {
        try {
            clearError();
            setSuccess(false);
            
            // Appeler le service d'inscription Cognito
            const result = await signUp(
                values.email,
                values.password,
                {
                    firstName: values.firstName,
                    lastName: values.lastName,
                }
            );

            if (result.success) {
                setSuccess(true);
                setPendingEmail(values.email);
                actions.setSubmitting(false);
                
                // Rediriger vers la page de confirmation
                router.push({
                    pathname: "/authentication/verify-email",
                    query: { email: values.email },
                });
            }
        } catch (error) {
            console.error("Error during signup:", error);
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
                        Join us today
                    </MDTypography>
                    <MDTypography display="block" variant="button" color="white" my={1}>
                        Create your account to get started
                    </MDTypography>
                </MDBox>
                <MDBox pt={4} pb={3} px={3}>
                    {/* Display errors */}
                    {authError && (
                        <MDBox mb={2}>
                            <Alert severity="error" onClose={clearError}>
                                {authError}
                            </Alert>
                        </MDBox>
                    )}
                    
                    {/* Success message */}
                    {success && (
                        <MDBox mb={2}>
                            <Alert severity="success">
                                Check your email to proceed with the verification.
                            </Alert>
                        </MDBox>
                    )}

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validations}
                        onSubmit={handleSubmit}
                    >
                        {({ values, errors, touched, isSubmitting }) => (
                            <Form id={formId} autoComplete="off">
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <MDBox mb={2}>
                                            <Field
                                                as={MDInput}
                                                type={formField.firstName.type}
                                                label={formField.firstName.label}
                                                name={formField.firstName.name}
                                                variant="standard"
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                                error={errors.firstName && touched.firstName}
                                                success={values.firstName && !errors.firstName}
                                            />
                                            <MDBox mt={0.75}>
                                                <MDTypography
                                                    component="div"
                                                    variant="caption"
                                                    color="error"
                                                    fontWeight="regular"
                                                >
                                                    <ErrorMessage name={formField.firstName.name} />
                                                </MDTypography>
                                            </MDBox>
                                        </MDBox>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <MDBox mb={2}>
                                            <Field
                                                as={MDInput}
                                                type={formField.lastName.type}
                                                label={formField.lastName.label}
                                                name={formField.lastName.name}
                                                variant="standard"
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                                error={errors.lastName && touched.lastName}
                                                success={values.lastName && !errors.lastName}
                                            />
                                            <MDBox mt={0.75}>
                                                <MDTypography
                                                    component="div"
                                                    variant="caption"
                                                    color="error"
                                                    fontWeight="regular"
                                                >
                                                    <ErrorMessage name={formField.lastName.name} />
                                                </MDTypography>
                                            </MDBox>
                                        </MDBox>
                                    </Grid>
                                </Grid>
                                <MDBox mb={2}>
                                    <Field
                                        as={MDInput}
                                        type={formField.email.type}
                                        label={formField.email.label}
                                        name={formField.email.name}
                                        variant="standard"
                                        fullWidth
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
                                            <ErrorMessage name={formField.email.name} />
                                        </MDTypography>
                                    </MDBox>
                                </MDBox>
                                <MDBox mb={2}>
                                    <Field
                                        as={MDInput}
                                        type={showPassword ? "text" : "password"}
                                        label={formField.password.label}
                                        name={formField.password.name}
                                        variant="standard"
                                        fullWidth
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
                                            <ErrorMessage name={formField.password.name} />
                                        </MDTypography>
                                    </MDBox>
                                </MDBox>
                                <MDBox mb={2}>
                                    <Field
                                        as={MDInput}
                                        type={showConfirmPassword ? "text" : "password"}
                                        label={formField.confirmPassword.label}
                                        name={formField.confirmPassword.name}
                                        variant="standard"
                                        fullWidth
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
                                            <ErrorMessage name={formField.confirmPassword.name} />
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
                                        {isSubmitting ? "Creating Account..." : "Sign Up"}
                                    </MDButton>
                                </MDBox>
                                <MDBox mt={3} mb={1} textAlign="center">
                                    <MDTypography variant="button" color="text">
                                        Already have an account?{" "}
                                        <Link href="/authentication/sign-in">
                                            <MDTypography
                                                variant="button"
                                                fontWeight="medium"
                                                textGradient
                                            >
                                                Sign In
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

export default SignUp;

