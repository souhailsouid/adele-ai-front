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
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import Icon from "@mui/material/Icon";
import Avatar from "@mui/material/Avatar";

// formik components
import { ErrorMessage, useField, Field } from "formik";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";

// Campaign page components
import FormField from "/pagesComponents/campaigns/new/components/FormField";

// Component for file upload with preview
function LogoUploadField({ field, form, label }) {
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (field.value instanceof File) {
            const objectUrl = URL.createObjectURL(field.value);
            setPreview(objectUrl);

            // Cleanup function
            return () => {
                URL.revokeObjectURL(objectUrl);
            };
        } else {
            setPreview(null);
            // Always return a cleanup function, even if it does nothing
            return () => {};
        }
    }, [field.value]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            form.setFieldValue(field.name, file);
        }
    };

    return (
        <MDBox>
            <input
                accept="image/*"
                style={{ display: "none" }}
                id="company-logo-upload"
                type="file"
                onChange={handleFileChange}
            />
            <label htmlFor="company-logo-upload">
                <Button
                    variant="contained"
                    component="span"
                    startIcon={<Icon>cloud_upload</Icon>}
                    sx={{ mb: 1 }}
                >
                    Choose File
                </Button>
            </label>
            
            {preview && (
                <MDBox mt={2} display="flex" flexDirection="column" alignItems="flex-start" gap={1}>
                    <Avatar
                        src={preview}
                        alt="Company Logo Preview"
                        variant="rounded"
                        sx={{
                            width: 150,
                            height: 150,
                            border: "2px solid #e0e0e0",
                            borderRadius: 2,
                        }}
                    />
                    <MDTypography variant="caption" color="text">
                        {field.value instanceof File ? field.value.name : "File selected"}
                    </MDTypography>
                </MDBox>
            )}
            
            {!preview && (
                <MDTypography variant="caption" color="text" display="block" mt={1}>
                    Aucun fichier choisi
                </MDTypography>
            )}
        </MDBox>
    );
}

LogoUploadField.propTypes = {
    field: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    label: PropTypes.string,
};

function Brand({ formData }) {
    const { formField, values, errors, touched } = formData;
    const { senderName, senderTitle, companyLogo, complianceMode } = formField;
    const {
        senderName: senderNameV,
        senderTitle: senderTitleV,
        complianceMode: complianceModeV,
    } = values;

    const [complianceField, complianceMeta] = useField(complianceMode.name);

    return (
        <MDBox>
            <MDBox lineHeight={0} mb={3}>
                <MDTypography variant="h5" fontWeight="medium">
                    Step 1 Brand & Compliance
                </MDTypography>
                <MDTypography variant="button" color="text">
                    Setup your brand assets, sender profile, and compliance settings.
                </MDTypography>
            </MDBox>
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <MDBox>
                        <MDTypography variant="h6" fontWeight="medium" mb={2}>
                            Sender Profile & Brand
                        </MDTypography>
                        <MDBox display="flex" flexDirection="column" gap={2}>
                            <FormField
                                type={senderName.type}
                                label={senderName.label}
                                name={senderName.name}
                                value={senderNameV}
                                placeholder={senderName.placeholder}
                                error={errors.senderName && touched.senderName}
                                success={senderNameV && senderNameV.length > 0 && !errors.senderName}
                            />
                            <FormField
                                type={senderTitle.type}
                                label={senderTitle.label}
                                name={senderTitle.name}
                                value={senderTitleV}
                                placeholder={senderTitle.placeholder}
                                error={errors.senderTitle && touched.senderTitle}
                                success={senderTitleV && senderTitleV.length > 0 && !errors.senderTitle}
                            />
                            <MDBox mb={1.5}>
                                <MDTypography variant="button" fontWeight="regular" mb={1}>
                                    {companyLogo.label}
                                </MDTypography>
                                <Field name={companyLogo.name}>
                                    {({ field, form }) => (
                                        <LogoUploadField field={field} form={form} label={companyLogo.label} />
                                    )}
                                </Field>
                            </MDBox>
                        </MDBox>
                    </MDBox>
                </Grid>

                <Grid item xs={12} md={6}>
                    <MDBox>
                        <MDTypography variant="h6" fontWeight="medium" mb={2}>
                            Compliance
                        </MDTypography>
                        <MDBox mb={2}>
                            <MDTypography variant="button" color="text" mb={2}>
                                Set gating rules for B2B or B2C outreach.
                            </MDTypography>
                            <FormControl fullWidth variant="standard" error={complianceMeta.touched && !!complianceMeta.error}>
                                <InputLabel id="compliance-mode-label">
                                    {complianceMode.label}
                                </InputLabel>
                                <Select
                                    {...complianceField}
                                    labelId="compliance-mode-label"
                                    label={complianceMode.label}
                                    value={complianceField.value || ""}
                                >
                                    <MenuItem value="B2B">B2B (Business-to-Business)</MenuItem>
                                    <MenuItem value="B2C">B2C (Business-to-Consumer)</MenuItem>
                                </Select>
                            </FormControl>
                            <MDBox mt={0.75}>
                                <MDTypography
                                    component="div"
                                    variant="caption"
                                    color="error"
                                    fontWeight="regular"
                                >
                                    <ErrorMessage name={complianceMode.name} />
                                </MDTypography>
                            </MDBox>
                            {complianceField.value === "B2B" && (
                                <MDBox mt={2} p={2} sx={{ backgroundColor: "rgba(0, 0, 0, 0.02)", borderRadius: 1 }}>
                                    <MDTypography variant="caption" color="text">
                                        <strong>B2B (Business-to-Business)</strong>
                                        <br />
                                        Recommended for corporate outreach.
                                    </MDTypography>
                                </MDBox>
                            )}
                        </MDBox>
                    </MDBox>
                </Grid>
            </Grid>

            <MDBox mt={3}>
                <MDTypography variant="button" color="text">
                    Next Step: Campaign
                </MDTypography>
            </MDBox>
        </MDBox>
    );
}

// typechecking props for Brand
Brand.propTypes = {
    formData: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
};

export default Brand;

