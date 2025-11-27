

// prop-type is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

// formik components
import { ErrorMessage, useField, Field } from "formik";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDDatePicker from "/components/MDDatePicker";

// Campaign page components
import FormField from "/pagesComponents/campaigns/new/components/FormField";

function CampaignInfo({ formData }) {
  const { formField, values, errors, touched } = formData;
  const { campaignName, campaignStatus, contacts, campaignSentDate } = formField;
  const {
    campaignName: campaignNameV,
    campaignStatus: campaignStatusV,
    contacts: contactsV,
    campaignSentDate: campaignSentDateV,
  } = values;

  const [statusField, statusMeta] = useField(campaignStatus.name);

  return (
    <MDBox>
      <MDBox lineHeight={0}>
        <MDTypography variant="h5">Campaign Information</MDTypography>
        <MDTypography variant="button" color="text">
          Create a new marketing campaign
        </MDTypography>
      </MDBox>
      <MDBox mt={1.625}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormField
              type={campaignName.type}
              label={campaignName.label}
              name={campaignName.name}
              value={campaignNameV}
              placeholder={campaignName.placeholder}
              error={errors.campaignName && touched.campaignName}
              success={campaignNameV.length > 0 && !errors.campaignName}
            />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <MDBox mb={1.5}>
              <FormControl fullWidth variant="standard" error={statusMeta.touched && !!statusMeta.error}>
                <InputLabel id="campaign-status-label">
                  {campaignStatus.label}
                </InputLabel>
                <Select
                  {...statusField}
                  labelId="campaign-status-label"
                  label={campaignStatus.label}
                  value={statusField.value || ""}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Draft">Draft</MenuItem>
                </Select>
              </FormControl>
              <MDBox mt={0.75}>
                <MDTypography
                  component="div"
                  variant="caption"
                  color="error"
                  fontWeight="regular"
                >
                  <ErrorMessage name={campaignStatus.name} />
                </MDTypography>
              </MDBox>
            </MDBox>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              type={contacts.type}
              label={contacts.label}
              name={contacts.name}
              value={contactsV}
              placeholder={contacts.placeholder}
              error={errors.contacts && touched.contacts}
              success={contactsV && contactsV > 0 && !errors.contacts}
            />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <MDBox mb={1.5}>
              <Field name={campaignSentDate.name}>
                {({ field, form }) => (
                  <MDDatePicker
                    {...field}
                    input={{
                      label: campaignSentDate.label,
                      variant: "standard",
                      fullWidth: true,
                      error: errors.campaignSentDate && touched.campaignSentDate,
                      success:
                        campaignSentDateV &&
                        campaignSentDateV.length > 0 &&
                        !errors.campaignSentDate,
                    }}
                    options={{
                      dateFormat: "Y-m-d",
                    }}
                    onChange={(date) => {
                      form.setFieldValue(campaignSentDate.name, date[0] ? date[0].toISOString().split('T')[0] : '');
                    }}
                  />
                )}
              </Field>
              <MDBox mt={0.75}>
                <MDTypography
                  component="div"
                  variant="caption"
                  color="error"
                  fontWeight="regular"
                >
                  <ErrorMessage name={campaignSentDate.name} />
                </MDTypography>
              </MDBox>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
    </MDBox>
  );
}

// typechecking props for CampaignInfo
CampaignInfo.propTypes = {
  formData: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
};

export default CampaignInfo;

