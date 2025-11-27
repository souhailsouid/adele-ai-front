
// prop-type is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";

// formik components
import { ErrorMessage, useField, Field } from "formik";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";

// Campaign page components
import FormField from "/pagesComponents/campaigns/new/components/FormField";
import DetailedObjectiveInput from "/pagesComponents/campaigns/new/components/DetailedObjectiveInput";
import TargetPersonaInput from "/pagesComponents/campaigns/new/components/TargetPersonaInput";

function Campaign({ formData }) {
  const { formField, values, errors, touched, companyData } = formData;
  const {
    campaignName,
    companyWebsite,
    companyInfo,
    campaignObjective,
    detailedObjective,
    targetPersona,
    personalizationFocus,
    language,
  } = formField;
  const {
    campaignName: campaignNameV,
    companyWebsite: companyWebsiteV,
    companyInfo: companyInfoV,
    campaignObjective: campaignObjectiveV,
    detailedObjective: detailedObjectiveV,
    targetPersona: targetPersonaV,
    personalizationFocus: personalizationFocusV,
    language: languageV,
  } = values;

  const [objectiveField, objectiveMeta] = useField(campaignObjective.name);
  const [languageField, languageMeta] = useField(language.name);

  return (
    <MDBox>
      <MDBox lineHeight={0} mb={3}>
        <MDTypography variant="h5" fontWeight="medium">
          Step 2 Define Campaign & Generate Content
        </MDTypography>
        <MDTypography variant="button" color="text">
          Define your campaign, let AI generate the content, then review and approve it.
        </MDTypography>
      </MDBox>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormField
            type={campaignName.type}
            label={campaignName.label}
            name={campaignName.name}
            value={campaignNameV}
            placeholder={campaignName.placeholder}
            error={errors.campaignName && touched.campaignName}
            success={campaignNameV && campaignNameV.length > 0 && !errors.campaignName}
          />
        </Grid>

        <Grid item xs={12}>
          <FormField
            type={companyWebsite.type}
            label={companyWebsite.label}
            name={companyWebsite.name}
            value={companyWebsiteV}
            placeholder="https://yourcompany.com"
            error={errors.companyWebsite && touched.companyWebsite}
            success={companyWebsiteV && companyWebsiteV.length > 0 && !errors.companyWebsite}
          />
          <MDTypography variant="caption" color="text" mt={0.5}>
            Enter a URL and let AI generate the company info below.
          </MDTypography>
        </Grid>

        <Grid item xs={12}>
          <MDBox mb={1.5}>
            <Field
              name={companyInfo.name}
              as={TextField}
              label={companyInfo.label}
              variant="standard"
              fullWidth
              multiline
              rows={8}
              error={errors.companyInfo && touched.companyInfo}
              helperText={
                errors.companyInfo && touched.companyInfo
                  ? errors.companyInfo
                  : "Describe your company, its values, and key benefits for customers... This will be used to make the AI-generated script more authentic."
              }
            />
          </MDBox>
          <MDBox mt={0.75}>
            <MDTypography
              component="div"
              variant="caption"
              color="error"
              fontWeight="regular"
            >
              <ErrorMessage name={companyInfo.name} />
            </MDTypography>
          </MDBox>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth variant="standard" error={objectiveMeta.touched && !!objectiveMeta.error}>
            <InputLabel id="campaign-objective-label">
              {campaignObjective.label}
            </InputLabel>
            <Select
              {...objectiveField}
              labelId="campaign-objective-label"
              label={campaignObjective.label}
              value={objectiveField.value || ""}
            >
              <MenuItem value="Lead Generation">Lead Generation</MenuItem>
              <MenuItem value="Sales Outreach">Sales Outreach</MenuItem>
              <MenuItem value="Product Launch">Product Launch</MenuItem>
              <MenuItem value="Event Promotion">Event Promotion</MenuItem>
              <MenuItem value="Customer Retention">Customer Retention</MenuItem>
            </Select>
          </FormControl>
          <MDBox mt={0.75}>
            <MDTypography
              component="div"
              variant="caption"
              color="error"
              fontWeight="regular"
            >
              <ErrorMessage name={campaignObjective.name} />
            </MDTypography>
          </MDBox>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth variant="standard" error={languageMeta.touched && !!languageMeta.error}>
            <InputLabel id="language-label">
              {language.label}
            </InputLabel>
            <Select
              {...languageField}
              labelId="language-label"
              label={language.label}
              value={languageField.value || ""}
            >
              <MenuItem value="English">English</MenuItem>
              <MenuItem value="French">French</MenuItem>
              <MenuItem value="Spanish">Spanish</MenuItem>
              <MenuItem value="German">German</MenuItem>
              <MenuItem value="Italian">Italian</MenuItem>
            </Select>
          </FormControl>
          <MDBox mt={0.75}>
            <MDTypography
              component="div"
              variant="caption"
              color="error"
              fontWeight="regular"
            >
              <ErrorMessage name={language.name} />
            </MDTypography>
          </MDBox>
        </Grid>

        <DetailedObjectiveInput 
          fieldName={detailedObjective.name}
          companyData={formData.companyData || null}
        />

        <TargetPersonaInput 
          fieldName={targetPersona.name}
          companyData={formData.companyData || null}
        />

        <Grid item xs={12}>
          <MDBox mb={1.5}>
            <Field
              name={personalizationFocus.name}
              as={TextField}
              label={personalizationFocus.label}
              variant="standard"
              fullWidth
              multiline
              rows={3}
              placeholder="Guide the AI researcher. e.g., 'recent company acquisitions', 'their latest blog post on AI', 'hiring for engineering roles'"
              error={errors.personalizationFocus && touched.personalizationFocus}
              helperText="If left blank, the AI will find general key facts."
            />
          </MDBox>
        </Grid>
      </Grid>
    </MDBox>
  );
}

// typechecking props for Campaign
Campaign.propTypes = {
  formData: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
};

export default Campaign;


