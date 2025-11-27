/**
=========================================================
* Detailed Objective Input Component
* Composant guidé pour aider à définir un objectif de campagne
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
import MDButton from "/components/MDButton";

// @mui icons
import Icon from "@mui/material/Icon";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

function DetailedObjectiveInput({ fieldName = "detailedObjective", companyData = null }) {
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
      label: "Objectif détaillé",
      placeholder: "Ex. : Obtenir 50 leads qualifiés auprès de responsables marketing en 30 jours.",
      helperText: "💡 Conseil : qui voulez-vous toucher ? Combien ? Dans quel délai ?",
      examplesTitle: "💡 Exemples prêts à l'emploi (cliquez pour utiliser) :",
      previewTitle: "Aperçu généré :",
      tip: "💡 Un bon objectif = spécifique, mesurable, avec audience et délai.",
      reset: "Réinitialiser",
      orUseExample: "💡 Ou utilisez un exemple prêt à l'emploi :",
      finalTip: "💡 Astuce : Un objectif clair aide l'IA à générer un contenu plus pertinent. Précisez qui, combien, et dans quel délai.",
      action: "Action",
      quantity: "Quantité",
      unit: "Unité",
      audienceLabel: "Audience ciblée (qui ?)",
      audiencePlaceholder: "ex. responsables marketing de PME (20-200 employés)",
      audienceHelper: "Décrivez votre public cible",
      timeframe: "Délai (jours)",
      outcome: "Résultat visé",
      actions: ["Générer", "Obtenir", "Augmenter", "Attirer", "Convertir"],
      units: ["leads qualifiés", "démos planifiées", "inscriptions", "rendez-vous", "ventes"],
      outcomes: ["des démos produit", "des rendez-vous commerciaux", "des essais gratuits", "des ventes", "des inscriptions"],
    },
    en: {
      modeSimple: "Free input",
      modeGuided: "Guided mode",
      specifique: "Specific",
      mesurable: "Measurable",
      audience: "Audience",
      delai: "Timeframe",
      label: "Detailed objective",
      placeholder: "E.g., Generate 50 qualified leads from marketing managers in 30 days.",
      helperText: "💡 Tip: who do you want to reach? How many? In what timeframe?",
      examplesTitle: "💡 Ready-to-use examples (click to use):",
      previewTitle: "Generated preview:",
      tip: "💡 A good objective = specific, measurable, with audience and timeframe.",
      reset: "Reset",
      orUseExample: "💡 Or use a ready-to-use example:",
      finalTip: "💡 Tip: A clear objective helps AI generate more relevant content. Specify who, how many, and in what timeframe.",
      action: "Action",
      quantity: "Quantity",
      unit: "Unit",
      audienceLabel: "Target audience (who?)",
      audiencePlaceholder: "e.g. marketing managers at SMEs (20-200 employees)",
      audienceHelper: "Describe your target audience",
      timeframe: "Timeframe (days)",
      outcome: "Desired outcome",
      actions: ["Generate", "Obtain", "Increase", "Attract", "Convert"],
      units: ["qualified leads", "scheduled demos", "sign-ups", "appointments", "sales"],
      outcomes: ["product demos", "sales meetings", "free trials", "sales", "sign-ups"],
    },
  };
  
  const translations = isEnglish ? t.en : t.fr;

  // Exemples prêts à l'emploi (adaptés selon les données de l'entreprise si disponibles)
  const getPresets = () => {
    if (isEnglish) {
      const basePresets = [
        "Get 30 scheduled demos with B2B marketing managers in 30 days.",
        "Generate 50 qualified leads interested in document automation this quarter.",
        "Attract 100 free trial sign-ups among SMEs with 20-200 employees in 45 days.",
      ];

      if (companyData?.enrichment_snapshot) {
        const snapshot = companyData.enrichment_snapshot;
        const targetCustomers = snapshot.targetCustomers?.[0] || "B2B companies";
        const products = snapshot.products?.[0] || "our solution";

        return [
          `Get 30 scheduled demos with ${targetCustomers} interested in ${products} in 30 days.`,
          `Generate 50 qualified leads for ${products} from ${targetCustomers} this quarter.`,
          `Attract 100 free trial sign-ups among ${targetCustomers} in 45 days.`,
        ];
      }

      return basePresets;
    } else {
      const basePresets = [
        "Obtenir 30 démos planifiées avec des responsables marketing B2B en 30 jours.",
        "Générer 50 leads qualifiés intéressés par l'automatisation de documents ce trimestre.",
        "Attirer 100 inscriptions à l'essai gratuit parmi des PME de 20-200 employés en 45 jours.",
      ];

      if (companyData?.enrichment_snapshot) {
        const snapshot = companyData.enrichment_snapshot;
        const targetCustomers = snapshot.targetCustomers?.[0] || "entreprises B2B";
        const products = snapshot.products?.[0] || "notre solution";

        return [
          `Obtenir 30 démos planifiées avec des ${targetCustomers} intéressés par ${products} en 30 jours.`,
          `Générer 50 leads qualifiés pour ${products} auprès de ${targetCustomers} ce trimestre.`,
          `Attirer 100 inscriptions à l'essai gratuit parmi des ${targetCustomers} en 45 jours.`,
        ];
      }

      return basePresets;
    }
  };

  const presets = getPresets();

  // État pour le mode guidé (initialisé selon la langue)
  const getInitialGuided = () => {
    const defaultAudience = companyData?.enrichment_snapshot?.targetCustomers?.[0] || 
      (isEnglish ? "B2B marketing managers" : "responsables marketing en B2B");
    
    return {
      action: isEnglish ? "Generate" : "Générer",
      qty: 30,
      unit: isEnglish ? "qualified leads" : "leads qualifiés",
      audience: defaultAudience,
      timeframe: 30,
      outcome: isEnglish ? "product demos" : "des démos produit",
    };
  };
  
  const [guided, setGuided] = useState(getInitialGuided());
  
  // Mettre à jour les valeurs guidées quand la langue change
  useEffect(() => {
    setGuided(getInitialGuided());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnglish]);

  // Composer automatiquement le texte final
  const composeObjective = (g) => {
    if (isEnglish) {
      return `${g.action} ${g.qty} ${g.unit} from ${g.audience} in ${g.timeframe} days, with the goal of ${g.outcome}.`;
    }
    return `${g.action} ${g.qty} ${g.unit} auprès de ${g.audience} en ${g.timeframe} jours, avec pour objectif ${g.outcome}.`;
  };

  // Mettre à jour le champ quand le mode guidé change
  useEffect(() => {
    if (mode === "guided") {
      const composed = composeObjective(guided);
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
      mesurable: /\d+/.test(currentValue) || (mode === "guided" && guided.qty > 0),
      audience: currentValue.length > 0 && (mode === "guided" ? guided.audience.length > 3 : true),
      delai: /\d+\s*(jour|jours|mois|semaine|semaines)/i.test(currentValue) || (mode === "guided" && guided.timeframe > 0),
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
                  label={translations.action}
                  select
                  fullWidth
                  variant="standard"
                  value={guided.action}
                  onChange={(e) => setGuided({ ...guided, action: e.target.value })}
                  sx={{
                    "& .MuiInput-underline:after": { borderBottomColor: "#0EB1EC" },
                  }}
                >
                  {translations.actions.map((action) => (
                    <MenuItem key={action} value={action}>
                      {action}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField
                  type="number"
                  label={translations.quantity}
                  fullWidth
                  variant="standard"
                  value={guided.qty}
                  onChange={(e) => setGuided({ ...guided, qty: Number(e.target.value) || 0 })}
                  inputProps={{ min: 1 }}
                  sx={{
                    "& .MuiInput-underline:after": { borderBottomColor: "#0EB1EC" },
                  }}
                />
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField
                  label={translations.unit}
                  select
                  fullWidth
                  variant="standard"
                  value={guided.unit}
                  onChange={(e) => setGuided({ ...guided, unit: e.target.value })}
                  sx={{
                    "& .MuiInput-underline:after": { borderBottomColor: "#0EB1EC" },
                  }}
                >
                  {translations.units.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label={translations.audienceLabel}
                  fullWidth
                  variant="standard"
                  value={guided.audience}
                  onChange={(e) => setGuided({ ...guided, audience: e.target.value })}
                  placeholder={translations.audiencePlaceholder}
                  helperText={translations.audienceHelper}
                  sx={{
                    "& .MuiInput-underline:after": { borderBottomColor: "#0EB1EC" },
                  }}
                />
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField
                  type="number"
                  label={translations.timeframe}
                  fullWidth
                  variant="standard"
                  value={guided.timeframe}
                  onChange={(e) => setGuided({ ...guided, timeframe: Number(e.target.value) || 0 })}
                  inputProps={{ min: 1 }}
                  sx={{
                    "& .MuiInput-underline:after": { borderBottomColor: "#0EB1EC" },
                  }}
                />
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField
                  label={translations.outcome}
                  select
                  fullWidth
                  variant="standard"
                  value={guided.outcome}
                  onChange={(e) => setGuided({ ...guided, outcome: e.target.value })}
                  sx={{
                    "& .MuiInput-underline:after": { borderBottomColor: "#0EB1EC" },
                  }}
                >
                  {translations.outcomes.map((outcome) => (
                    <MenuItem key={outcome} value={outcome}>
                      {outcome}
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
                  value={values[fieldName] || composeObjective(guided)}
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

DetailedObjectiveInput.propTypes = {
  fieldName: PropTypes.string,
  companyData: PropTypes.object,
};

export default DetailedObjectiveInput;

