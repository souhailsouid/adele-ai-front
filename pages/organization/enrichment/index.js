import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";

// @mui material components
import Card from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import MDInput from "/components/MDInput";
import Icon from "@mui/material/Icon";

// NextJS Material Dashboard 2 PRO examples
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";

// API Client
import apiClient from "/lib/api/client";

// Auth
import { useAuth } from "/hooks/useAuth";

// Composant pour éditer un tableau de strings
function ArrayField({ name, label, values, push, remove, formik }) {
  return (
    <MDBox mb={3}>
      <MDTypography variant="h6" fontWeight="medium" mb={1}>
        {label}
      </MDTypography>
      {values.map((item, index) => (
        <MDBox key={index} display="flex" gap={1} mb={1} alignItems="center">
          <MDInput
            fullWidth
            name={`${name}.${index}`}
            value={item}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched[name]?.[index] && formik.errors[name]?.[index]}
          />
          <IconButton onClick={() => remove(index)} color="error">
            <Icon>delete</Icon>
          </IconButton>
        </MDBox>
      ))}
      <MDButton
        variant="outlined"
        size="small"
        onClick={() => push("")}
        startIcon={<Icon>add</Icon>}
      >
        Ajouter
      </MDButton>
    </MDBox>
  );
}

const validationSchema = Yup.object({
  description: Yup.string().min(10, "Minimum 10 caractères"),
  industries: Yup.array().of(Yup.string()),
  techStack: Yup.array().of(Yup.string()),
  products: Yup.array().of(Yup.string()),
  targetCustomers: Yup.array().of(Yup.string()),
  pains: Yup.array().of(Yup.string()),
  competitors: Yup.array().of(Yup.string()),
  locations: Yup.array().of(Yup.string()),
  campaign: Yup.object({
    angle: Yup.string().min(1, "Requis"),
    talkingPoints: Yup.array().of(Yup.string()),
    firstMessage: Yup.string().min(1, "Requis"),
  }),
  size: Yup.object({
    employees: Yup.number().positive().nullable(),
    range: Yup.string().nullable(),
  }),
  socials: Yup.object({
    linkedin: Yup.string().url("URL invalide").nullable(),
    twitter: Yup.string().url("URL invalide").nullable(),
    github: Yup.string().url("URL invalide").nullable(),
    youtube: Yup.string().url("URL invalide").nullable(),
  }),
});

function EnrichmentEditor() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orgId, setOrgId] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: null, text: null });
  const [refreshDialogOpen, setRefreshDialogOpen] = useState(false);

  // Vérifier l'authentification
  useEffect(() => {
    if (!authLoading && !isAuthenticated()) {
      router.push("/authentication/sign-in?redirect=/organization/enrichment");
    }
  }, [authLoading, isAuthenticated, router]);

  // Charger l'organisation
  useEffect(() => {
    if (!isAuthenticated() || authLoading) return;
    
    const storedOrgId = localStorage.getItem("current_org_id");
    if (storedOrgId) {
      setOrgId(storedOrgId);
      loadOrganization(storedOrgId);
    } else {
      setMessage({ type: "error", text: "Aucune organisation trouvée. Veuillez compléter l'onboarding." });
    }
  }, [isAuthenticated, authLoading]);

  const loadOrganization = async (orgId) => {
    try {
      setLoading(true);
      const data = await apiClient.getOrganization(orgId);
      setOrg(data);
    } catch (error) {
      console.error("Error loading organization:", error);
      setMessage({ type: "error", text: error.message || "Erreur lors du chargement" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    try {
      setSaving(true);
      setMessage({ type: null, text: null });
      
      // Nettoyer les valeurs vides
      const cleaned = {
        ...values,
        industries: values.industries?.filter(i => i.trim()),
        techStack: values.techStack?.filter(t => t.trim()),
        products: values.products?.filter(p => p.trim()),
        targetCustomers: values.targetCustomers?.filter(t => t.trim()),
        pains: values.pains?.filter(p => p.trim()),
        competitors: values.competitors?.filter(c => c.trim()),
        locations: values.locations?.filter(l => l.trim()),
        campaign: {
          ...values.campaign,
          talkingPoints: values.campaign?.talkingPoints?.filter(t => t.trim()),
        },
      };
      
      await apiClient.updateEnrichmentSnapshot(orgId, cleaned);
      setMessage({ type: "success", text: "Données enrichies mises à jour avec succès" });
      
      // Recharger pour voir les changements
      await loadOrganization(orgId);
    } catch (error) {
      console.error("Error saving enrichment:", error);
      setMessage({ type: "error", text: error.message || "Erreur lors de la sauvegarde" });
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setSaving(true);
      setMessage({ type: null, text: null });
      setRefreshDialogOpen(false);
      
      await apiClient.refreshEnrichment(orgId, true);
      setMessage({ 
        type: "info", 
        text: "Enrichissement relancé. Cela peut prendre quelques minutes. Les coûts OpenAI s'appliquent." 
      });
      
      // Recharger après quelques secondes
      setTimeout(() => {
        loadOrganization(orgId);
      }, 5000);
    } catch (error) {
      console.error("Error refreshing enrichment:", error);
      setMessage({ type: "error", text: error.message || "Erreur lors du rafraîchissement" });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !isAuthenticated()) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3} textAlign="center">
          <MDTypography variant="h6">Chargement...</MDTypography>
        </MDBox>
      </DashboardLayout>
    );
  }

  if (loading || !org) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3} textAlign="center">
          <MDTypography variant="h6">Chargement des données...</MDTypography>
        </MDBox>
      </DashboardLayout>
    );
  }

  const snapshot = org.enrichment_snapshot || {};
  const initialValues = {
    description: snapshot.description || "",
    industries: snapshot.industries || [],
    techStack: snapshot.techStack || [],
    products: snapshot.products || [],
    targetCustomers: snapshot.targetCustomers || [],
    pains: snapshot.pains || [],
    competitors: snapshot.competitors || [],
    locations: snapshot.locations || [],
    campaign: {
      angle: snapshot.campaign?.angle || "",
      talkingPoints: snapshot.campaign?.talkingPoints || [],
      firstMessage: snapshot.campaign?.firstMessage || "",
    },
    size: {
      employees: snapshot.size?.employees || null,
      range: snapshot.size?.range || "",
    },
    socials: {
      linkedin: snapshot.socials?.linkedin || "",
      twitter: snapshot.socials?.twitter || "",
      github: snapshot.socials?.github || "",
      youtube: snapshot.socials?.youtube || "",
    },
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDBox mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <MDBox>
            <MDTypography variant="h4" fontWeight="bold">
              Données d&apos;enrichissement
            </MDTypography>
            <MDTypography variant="body2" color="text">
              Consultez et modifiez manuellement les informations enrichies (gratuit)
            </MDTypography>
          </MDBox>
          <MDBox display="flex" gap={2}>
            <MDButton
              variant="outlined"
              color="warning"
              onClick={() => setRefreshDialogOpen(true)}
              startIcon={<Icon>refresh</Icon>}
            >
              Relancer l&apos;enrichissement
            </MDButton>
            <MDButton
              variant="gradient"
              color="info"
              onClick={() => router.push("/campaigns")}
              startIcon={<Icon>arrow_back</Icon>}
            >
              Retour
            </MDButton>
          </MDBox>
        </MDBox>

        {message.text && (
          <MDBox mb={3}>
            <Alert 
              severity={message.type} 
              onClose={() => setMessage({ type: null, text: null })}
            >
              {message.text}
            </Alert>
          </MDBox>
        )}

        {org.enrichment_status === "pending" && (
          <MDBox mb={3}>
            <Alert severity="info">
              L&apos;enrichissement est en cours. Vous pouvez modifier les données une fois terminé.
            </Alert>
          </MDBox>
        )}

        {org.enrichment_status === "failed" && (
          <MDBox mb={3}>
            <Alert severity="warning">
              L&apos;enrichissement a échoué. Vous pouvez modifier les données manuellement ou relancer l&apos;enrichissement.
            </Alert>
          </MDBox>
        )}

        <Card>
          <MDBox p={3}>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSave}
              enableReinitialize
            >
              {(formik) => (
                <Form>
                  {/* Description */}
                  <MDBox mb={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={1}>
                      Description
                    </MDTypography>
                    <MDInput
                      fullWidth
                      multiline
                      rows={4}
                      name="description"
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.description && !!formik.errors.description}
                      helperText={formik.touched.description && formik.errors.description}
                    />
                  </MDBox>

                  {/* Industries */}
                  <FieldArray
                    name="industries"
                    render={(arrayHelpers) => (
                      <ArrayField
                        name="industries"
                        label="Industries"
                        values={formik.values.industries}
                        push={arrayHelpers.push}
                        remove={arrayHelpers.remove}
                        formik={formik}
                      />
                    )}
                  />

                  {/* Tech Stack */}
                  <FieldArray
                    name="techStack"
                    render={(arrayHelpers) => (
                      <ArrayField
                        name="techStack"
                        label="Technologies"
                        values={formik.values.techStack}
                        push={arrayHelpers.push}
                        remove={arrayHelpers.remove}
                        formik={formik}
                      />
                    )}
                  />

                  {/* Products */}
                  <FieldArray
                    name="products"
                    render={(arrayHelpers) => (
                      <ArrayField
                        name="products"
                        label="Produits/Services"
                        values={formik.values.products}
                        push={arrayHelpers.push}
                        remove={arrayHelpers.remove}
                        formik={formik}
                      />
                    )}
                  />

                  {/* Target Customers */}
                  <FieldArray
                    name="targetCustomers"
                    render={(arrayHelpers) => (
                      <ArrayField
                        name="targetCustomers"
                        label="Clients cibles"
                        values={formik.values.targetCustomers}
                        push={arrayHelpers.push}
                        remove={arrayHelpers.remove}
                        formik={formik}
                      />
                    )}
                  />

                  {/* Pains */}
                  <FieldArray
                    name="pains"
                    render={(arrayHelpers) => (
                      <ArrayField
                        name="pains"
                        label="Défis/Douleurs"
                        values={formik.values.pains}
                        push={arrayHelpers.push}
                        remove={arrayHelpers.remove}
                        formik={formik}
                      />
                    )}
                  />

                  {/* Competitors */}
                  <FieldArray
                    name="competitors"
                    render={(arrayHelpers) => (
                      <ArrayField
                        name="competitors"
                        label="Concurrents"
                        values={formik.values.competitors}
                        push={arrayHelpers.push}
                        remove={arrayHelpers.remove}
                        formik={formik}
                      />
                    )}
                  />

                  {/* Locations */}
                  <FieldArray
                    name="locations"
                    render={(arrayHelpers) => (
                      <ArrayField
                        name="locations"
                        label="Localisations"
                        values={formik.values.locations}
                        push={arrayHelpers.push}
                        remove={arrayHelpers.remove}
                        formik={formik}
                      />
                    )}
                  />

                  {/* Size */}
                  <MDBox mb={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={1}>
                      Taille de l&apos;entreprise
                    </MDTypography>
                    <MDBox display="flex" gap={2}>
                      <MDInput
                        type="number"
                        label="Nombre d&apos;employés"
                        name="size.employees"
                        value={formik.values.size.employees || ""}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.size?.employees && !!formik.errors.size?.employees}
                        helperText={formik.touched.size?.employees && formik.errors.size?.employees}
                      />
                      <MDInput
                        label="Tranche (ex: 1-10)"
                        name="size.range"
                        value={formik.values.size.range}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.size?.range && !!formik.errors.size?.range}
                        helperText={formik.touched.size?.range && formik.errors.size?.range}
                      />
                    </MDBox>
                  </MDBox>

                  {/* Socials */}
                  <MDBox mb={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={1}>
                      Réseaux sociaux
                    </MDTypography>
                    <MDBox display="flex" flexDirection="column" gap={2}>
                      <MDInput
                        label="LinkedIn"
                        name="socials.linkedin"
                        value={formik.values.socials.linkedin}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.socials?.linkedin && !!formik.errors.socials?.linkedin}
                        helperText={formik.touched.socials?.linkedin && formik.errors.socials?.linkedin}
                      />
                      <MDInput
                        label="Twitter"
                        name="socials.twitter"
                        value={formik.values.socials.twitter}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.socials?.twitter && !!formik.errors.socials?.twitter}
                        helperText={formik.touched.socials?.twitter && formik.errors.socials?.twitter}
                      />
                      <MDInput
                        label="GitHub"
                        name="socials.github"
                        value={formik.values.socials.github}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.socials?.github && !!formik.errors.socials?.github}
                        helperText={formik.touched.socials?.github && formik.errors.socials?.github}
                      />
                      <MDInput
                        label="YouTube"
                        name="socials.youtube"
                        value={formik.values.socials.youtube}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.socials?.youtube && !!formik.errors.socials?.youtube}
                        helperText={formik.touched.socials?.youtube && formik.errors.socials?.youtube}
                      />
                    </MDBox>
                  </MDBox>

                  {/* Campaign */}
                  <MDBox mb={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={1}>
                      Campagne
                    </MDTypography>
                    <MDBox mb={2}>
                      <MDInput
                        fullWidth
                        label="Angle de campagne"
                        name="campaign.angle"
                        value={formik.values.campaign.angle}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.campaign?.angle && !!formik.errors.campaign?.angle}
                        helperText={formik.touched.campaign?.angle && formik.errors.campaign?.angle}
                      />
                    </MDBox>
                    <FieldArray
                      name="campaign.talkingPoints"
                      render={(arrayHelpers) => (
                        <ArrayField
                          name="campaign.talkingPoints"
                          label="Points de discussion"
                          values={formik.values.campaign.talkingPoints}
                          push={arrayHelpers.push}
                          remove={arrayHelpers.remove}
                          formik={formik}
                        />
                      )}
                    />
                    <MDBox mt={2}>
                      <MDInput
                        fullWidth
                        multiline
                        rows={4}
                        label="Premier message"
                        name="campaign.firstMessage"
                        value={formik.values.campaign.firstMessage}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.campaign?.firstMessage && !!formik.errors.campaign?.firstMessage}
                        helperText={formik.touched.campaign?.firstMessage && formik.errors.campaign?.firstMessage}
                      />
                    </MDBox>
                  </MDBox>

                  {/* Actions */}
                  <MDBox display="flex" justifyContent="flex-end" gap={2} mt={4}>
                    <MDButton
                      variant="outlined"
                      color="secondary"
                      onClick={() => router.push("/campaigns")}
                    >
                      Annuler
                    </MDButton>
                    <MDButton
                      variant="gradient"
                      color="info"
                      type="submit"
                      disabled={saving}
                    >
                      {saving ? "Sauvegarde..." : "Sauvegarder"}
                    </MDButton>
                  </MDBox>
                </Form>
              )}
            </Formik>
          </MDBox>
        </Card>
      </MDBox>

      {/* Dialog de confirmation pour refresh */}
      <Dialog open={refreshDialogOpen} onClose={() => setRefreshDialogOpen(false)}>
        <DialogTitle>Relancer l&apos;enrichissement</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Cette action va relancer l&apos;enrichissement automatique via OpenAI, ce qui engendre des coûts.
            Êtes-vous sûr de vouloir continuer ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefreshDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleRefresh} color="warning" variant="contained">
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default EnrichmentEditor;



