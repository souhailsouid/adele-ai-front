/**
=========================================================
* Target Persona Input Component
* Composant guidé pour aider à définir le profil client idéal (ICP)
=========================================================
*/

import { useState, useEffect } from "react";
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";

// formik components
import { Field, ErrorMessage, useFormikContext } from "formik";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";

// @mui icons
import Icon from "@mui/material/Icon";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

function TargetPersonaInput({ fieldName = "targetPersona", companyData = null }) {
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const [mode, setMode] = useState("simple"); // "simple" | "guided"
  
  // Détecter la langue sélectionnée
  const selectedLanguage = values.language || "French";
  const isEnglish = selectedLanguage === "English";
  
  // Traductions
  const t = {
    fr: {
      modeSimple: "Saisie libre",
      modeGuided: "Mode guidé",
      specifique: "Spécifique",
      mesurable: "Mesurable",
      audience: "Audience",
      delai: "Délai",
      label: "Profil client idéal (ICP)",
      placeholder: "Ex. : VPs d'Ingénierie dans des entreprises tech de plus de 500 employés en Californie.",
      helperText: "💡 Conseil : décrivez précisément votre client idéal (titre, secteur, taille, localisation).",
      examplesTitle: "💡 Exemples prêts à l'emploi (cliquez pour utiliser) :",
      previewTitle: "Aperçu généré :",
      tip: "💡 Un bon ICP = titre précis, secteur d'activité, taille d'entreprise, localisation.",
      reset: "Réinitialiser",
      orUseExample: "💡 Ou utilisez un exemple prêt à l'emploi :",
      finalTip: "💡 Astuce : Plus votre ICP est précis, plus l'IA pourra trouver des prospects pertinents. Précisez le titre, le secteur, la taille et la localisation.",
      jobTitle: "Titre du poste",
      industry: "Secteur d'activité",
      companySize: "Taille d'entreprise",
      location: "Localisation",
      jobTitles: ["VP d'Ingénierie", "Directeur Marketing", "CEO", "CTO", "Responsable Produit"],
      industries: ["Tech", "Finance", "Santé", "E-commerce", "SaaS"],
      companySizes: ["1-10 employés", "11-50 employés", "51-200 employés", "201-500 employés", "500+ employés"],
      locations: ["France", "Europe", "États-Unis", "Californie", "New York"],
    },
    en: {
      modeSimple: "Free input",
      modeGuided: "Guided mode",
      specifique: "Specific",
      mesurable: "Measurable",
      audience: "Audience",
      delai: "Timeframe",
      label: "Ideal Customer Profile (ICP)",
      placeholder: "E.g., VPs of Engineering at tech companies with over 500 employees in California.",
      helperText: "💡 Tip: describe your ideal customer precisely (title, industry, size, location).",
      examplesTitle: "💡 Ready-to-use examples (click to use):",
      previewTitle: "Generated preview:",
      tip: "💡 A good ICP = specific title, industry, company size, location.",
      reset: "Reset",
      orUseExample: "💡 Or use a ready-to-use example:",
      finalTip: "💡 Tip: The more specific your ICP, the better AI can find relevant prospects. Specify title, industry, size, and location.",
      jobTitle: "Job title",
      industry: "Industry",
      companySize: "Company size",
      location: "Location",
      jobTitles: ["VP of Engineering", "Marketing Director", "CEO", "CTO", "Product Manager"],
      industries: ["Tech", "Finance", "Healthcare", "E-commerce", "SaaS"],
      companySizes: ["1-10 employees", "11-50 employees", "51-200 employees", "201-500 employees", "500+ employees"],
      locations: ["France", "Europe", "United States", "California", "New York"],
    },
  };
  
  const translations = isEnglish ? t.en : t.fr;

  // Exemples prêts à l'emploi (adaptés selon les données de l'entreprise si disponibles)
  const getPresets = () => {
    if (isEnglish) {
      const basePresets = [
        "VPs of Engineering at tech companies with over 500 employees in California.",
        "Marketing Directors at SaaS companies with 50-200 employees in Europe.",
        "CEOs of e-commerce companies with 11-50 employees in the United States.",
      ];

      if (companyData?.enrichment_snapshot) {
        const snapshot = companyData.enrichment_snapshot;
        const targetCustomers = snapshot.targetCustomers?.[0] || "B2B companies";
        const industries = snapshot.industries?.[0] || "tech";

        return [
          `VPs of Engineering at ${industries} companies with over 500 employees.`,
          `Marketing Directors at ${targetCustomers} with 50-200 employees.`,
          `CEOs of ${industries} companies with 11-50 employees.`,
        ];
      }

      return basePresets;
    } else {
      const basePresets = [
        "VPs d'Ingénierie dans des entreprises tech de plus de 500 employés en Californie.",
        "Directeurs Marketing dans des entreprises SaaS de 50-200 employés en Europe.",
        "CEOs d'entreprises e-commerce de 11-50 employés aux États-Unis.",
      ];

      if (companyData?.enrichment_snapshot) {
        const snapshot = companyData.enrichment_snapshot;
        const targetCustomers = snapshot.targetCustomers?.[0] || "entreprises B2B";
        const industries = snapshot.industries?.[0] || "tech";

        return [
          `VPs d'Ingénierie dans des entreprises ${industries} de plus de 500 employés.`,
          `Directeurs Marketing dans des ${targetCustomers} de 50-200 employés.`,
          `CEOs d'entreprises ${industries} de 11-50 employés.`,
        ];
      }

      return basePresets;
    }
  };

  const presets = getPresets();

  // État pour le mode guidé (initialisé selon la langue)
  const getInitialGuided = () => {
    const defaultIndustry = companyData?.enrichment_snapshot?.industries?.[0] || 
      (isEnglish ? "Tech" : "Tech");
    const defaultSize = isEnglish ? "50-200 employees" : "50-200 employés";
    const defaultLocation = isEnglish ? "United States" : "France";
    const defaultJobTitle = isEnglish ? "VP of Engineering" : "VP d'Ingénierie";
    
    return {
      jobTitle: defaultJobTitle,
      industry: defaultIndustry,
      companySize: defaultSize,
      location: defaultLocation,
    };
  };
  
  const [guided, setGuided] = useState(getInitialGuided());
  
  // Mettre à jour les valeurs guidées quand la langue change
  useEffect(() => {
    setGuided(getInitialGuided());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnglish]);

  // Composer automatiquement le texte final
  const composePersona = (g) => {
    if (isEnglish) {
      return `${g.jobTitle} at ${g.industry} companies with ${g.companySize} in ${g.location}.`;
    }
    return `${g.jobTitle} dans des entreprises ${g.industry} de ${g.companySize} en ${g.location}.`;
  };

  // Mettre à jour le champ quand le mode guidé change
  useEffect(() => {
    if (mode === "guided") {
      const composed = composePersona(guided);
      if (values[fieldName] !== composed) {
        setFieldValue(fieldName, composed, false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guided, mode]);

  // Critères de qualité (score visuel)
  const getQualityChecks = () => {
    const currentValue = values[fieldName] || "";
    return {
      specifique: currentValue.length > 20,
      mesurable: (mode === "guided" ? guided.jobTitle && guided.industry : currentValue.length > 0),
      audience: currentValue.length > 0 && (mode === "guided" ? guided.companySize : true),
      delai: currentValue.length > 0 && (mode === "guided" ? guided.location : true),
    };
  };

  const quality = getQualityChecks();

  const resetGuided = () => {
    setGuided(getInitialGuided());
  };

  const handlePresetClick = (preset) => {
    setFieldValue(fieldName, preset, false);
    if (mode === "guided") {
      setMode("simple");
    }
  };

  return (
    <Grid item xs={12}>
      <MDBox mb={1.5}>
        {/* Header avec toggle et indicateurs de qualité */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <ToggleButtonGroup
            size="small"
            value={mode}
            exclusive
            onChange={(_, v) => v && setMode(v)}
            sx={{ 
              height: "36px",
              "& .MuiToggleButton-root": {
                borderColor: "#0EB1EC",
                backgroundColor: "#0EB1EC",
                color: "#fff",
                "&.Mui-selected": {
                  backgroundColor: "#fff",
                  color: "#0EB1EC",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                  },
                },
                "&:hover": {
                  backgroundColor: "#0A8BC0",
                },
              },
            }}
          >
            <ToggleButton value="simple">
              <Icon fontSize="small" sx={{ mr: 0.5 }}>edit</Icon>
              {translations.modeSimple}
            </ToggleButton>
            <ToggleButton value="guided">
              <Icon fontSize="small" sx={{ mr: 0.5 }}>tune</Icon>
              {translations.modeGuided}
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Indicateurs de qualité */}
          <MDBox display="flex" gap={0.5}>
            {Object.entries(quality).map(([key, ok]) => {
              const labels = {
                specifique: translations.specifique,
                mesurable: translations.mesurable,
                audience: translations.audience,
                delai: translations.delai,
              };
              return (
                <Tooltip key={key} title={labels[key]} arrow>
                  <Chip
                    icon={ok ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                    label={labels[key]}
                    size="small"
                    sx={{ 
                      height: "26px", 
                      fontSize: "0.7rem",
                      fontWeight: ok ? 600 : 400,
                      backgroundColor: ok ? "#0EB1EC" : "#fff",
                      color: ok ? "#fff" : "#0EB1EC",
                      border: ok ? "none" : "2px solid #0EB1EC",
                      "&:hover": {
                        backgroundColor: ok ? "#0A8BC0" : "#0EB1EC",
                        color: "#fff",
                        borderColor: "#0EB1EC",
                      },
                      "& .MuiChip-icon": {
                        color: ok ? "#fff" : "#0EB1EC",
                      },
                    }}
                  />
                </Tooltip>
              );
            })}
          </MDBox>
        </MDBox>

        {/* Mode simple */}
        {mode === "simple" && (
          <>
            <Field
              name={fieldName}
              as={TextField}
              label={translations.label}
              variant="standard"
              fullWidth
              multiline
              rows={3}
              placeholder={translations.placeholder}
              error={Boolean(errors[fieldName] && touched[fieldName])}
              helperText={
                errors[fieldName] && touched[fieldName]
                  ? errors[fieldName]
                  : translations.helperText
              }
            />

            {/* Exemples cliquables */}
            <MDBox mt={1.5}>
              <MDTypography variant="caption" color="text" fontWeight="medium" mb={0.5} display="block">
                {translations.examplesTitle}
              </MDTypography>
              <MDBox display="flex" gap={1} flexWrap="wrap">
                {presets.map((preset, index) => (
                  <Chip
                    key={index}
                    label={preset}
                    onClick={() => handlePresetClick(preset)}
                    icon={<ContentCopyIcon />}
                    variant="outlined"
                    size="small"
                    sx={{
                      cursor: "pointer",
                      borderColor: "#FF8C42",
                      backgroundColor: "#FF8C42",
                      color: "#fff",
                      fontWeight: 500,
                      "&:hover": {
                        backgroundColor: "transparent",
                        color: "#FF8C42",
                        borderColor: "#FF8C42",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  />
                ))}
              </MDBox>
            </MDBox>
          </>
        )}

        {/* Mode guidé */}
        {mode === "guided" && (
          <MDBox
            sx={{
              p: 2.5,
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              backgroundColor: "#fff",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={translations.jobTitle}
                  select
                  fullWidth
                  variant="standard"
                  value={guided.jobTitle}
                  onChange={(e) => setGuided({ ...guided, jobTitle: e.target.value })}
                  sx={{
                    "& .MuiInput-underline:after": { borderBottomColor: "#0EB1EC" },
                  }}
                >
                  {translations.jobTitles.map((title) => (
                    <MenuItem key={title} value={title}>
                      {title}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label={translations.industry}
                  select
                  fullWidth
                  variant="standard"
                  value={guided.industry}
                  onChange={(e) => setGuided({ ...guided, industry: e.target.value })}
                  sx={{
                    "& .MuiInput-underline:after": { borderBottomColor: "#0EB1EC" },
                  }}
                >
                  {translations.industries.map((industry) => (
                    <MenuItem key={industry} value={industry}>
                      {industry}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label={translations.companySize}
                  select
                  fullWidth
                  variant="standard"
                  value={guided.companySize}
                  onChange={(e) => setGuided({ ...guided, companySize: e.target.value })}
                  sx={{
                    "& .MuiInput-underline:after": { borderBottomColor: "#0EB1EC" },
                  }}
                >
                  {translations.companySizes.map((size) => (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label={translations.location}
                  select
                  fullWidth
                  variant="standard"
                  value={guided.location}
                  onChange={(e) => setGuided({ ...guided, location: e.target.value })}
                  sx={{
                    "& .MuiInput-underline:after": { borderBottomColor: "#0EB1EC" },
                  }}
                >
                  {translations.locations.map((location) => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Aperçu généré */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1.5 }} />
                <MDTypography variant="caption" color="text" fontWeight="medium" mb={1} display="block">
                  {translations.previewTitle}
                </MDTypography>
                <TextField
                  value={values[fieldName] || composePersona(guided)}
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#f5f5f5",
                      "& fieldset": {
                        borderColor: "#e0e0e0",
                      },
                    },
                  }}
                />
              </Grid>

              {/* Actions */}
              <Grid item xs={12}>
                <MDBox 
                  display="flex" 
                  justifyContent="space-between" 
                  alignItems="center"
                  sx={{
                    backgroundColor: "#f9f9f9",
                    p: 1.5,
                    borderRadius: 1,
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <MDBox display="flex" alignItems="center" gap={1}>
                    <InfoOutlinedIcon fontSize="small" sx={{ color: "#666" }} />
                    <MDTypography variant="caption" color="text" fontWeight="regular">
                      {translations.tip}
                    </MDTypography>
                  </MDBox>
                  <IconButton 
                    size="small" 
                    onClick={resetGuided} 
                    title={translations.reset}
                    sx={{
                      color: "#666",
                      "&:hover": {
                        backgroundColor: "rgba(14, 177, 236, 0.1)",
                        color: "#0EB1EC",
                      },
                    }}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </MDBox>
              </Grid>

              {/* Exemples aussi disponibles en mode guidé */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1.5 }} />
                <MDTypography variant="caption" color="text" fontWeight="medium" mb={0.5} display="block">
                  {translations.orUseExample}
                </MDTypography>
                <MDBox display="flex" gap={1} flexWrap="wrap">
                  {presets.map((preset, index) => (
                    <Chip
                      key={index}
                      label={preset}
                      onClick={() => handlePresetClick(preset)}
                      icon={<ContentCopyIcon />}
                      variant="outlined"
                      size="small"
                      sx={{
                        cursor: "pointer",
                        borderColor: "#FF8C42",
                        backgroundColor: "#FF8C42",
                        color: "#fff",
                        fontWeight: 500,
                        "&:hover": {
                          backgroundColor: "transparent",
                          color: "#FF8C42",
                          borderColor: "#FF8C42",
                        },
                        transition: "all 0.2s ease-in-out",
                      }}
                    />
                  ))}
                </MDBox>
              </Grid>
            </Grid>
          </MDBox>
        )}

        {/* Message d'aide contextuelle */}
        <MDBox 
          mt={1.5}
          sx={{
            backgroundColor: "#f9f9f9",
            p: 1.5,
            borderRadius: 1,
            borderLeft: "3px solid #0EB1EC",
          }}
        >
          <MDTypography variant="caption" color="text" fontWeight="regular">
            {translations.finalTip}
          </MDTypography>
        </MDBox>
      </MDBox>

      {/* Message d'erreur */}
      <MDBox mt={0.75}>
        <MDTypography
          component="div"
          variant="caption"
          color="error"
          fontWeight="regular"
        >
          <ErrorMessage name={fieldName} />
        </MDTypography>
      </MDBox>
    </Grid>
  );
}

TargetPersonaInput.propTypes = {
  fieldName: PropTypes.string,
  companyData: PropTypes.object,
};

export default TargetPersonaInput;



