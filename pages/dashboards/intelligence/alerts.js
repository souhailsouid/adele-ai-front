/**
 * Alerts Management - Gestion complète des alertes multi-signaux
 * 
 * Créer, modifier, tester et supprimer des alertes personnalisées avec logique AND/OR
 */

import { useState, useEffect, useCallback } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import MDButton from "/components/MDButton";
import MDInput from "/components/MDInput";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import DataTable from "/examples/Tables/DataTable";
import { formatDate } from "/utils/formatting";
import intelligenceClient from "/lib/api/intelligenceClient";
import { useRouter } from "next/router";
import { useAuth } from "/hooks/useAuth";
import withAuth from "/hocs/withAuth";
import { showSuccess, showError } from "/utils/notifications";
import IconButton from "@mui/material/IconButton";
import Autocomplete from "@mui/material/Autocomplete";
import { POPULAR_STOCKS } from "/config/stockSymbols";

const SIGNALS = [
  { value: "options_flow", label: "Options Flow" },
  { value: "dark_pool_activity", label: "Dark Pool Activity" },
  { value: "short_interest", label: "Short Interest" },
  { value: "insider_activity", label: "Insider Activity" },
  { value: "price_change", label: "Price Change" },
  { value: "volume_spike", label: "Volume Spike" },
];

const OPERATORS = [
  { value: "gt", label: "Greater Than (>)", symbol: ">" },
  { value: "lt", label: "Less Than (<)", symbol: "<" },
  { value: "gte", label: "Greater or Equal (>=)", symbol: ">=" },
  { value: "lte", label: "Less or Equal (<=)", symbol: "<=" },
  { value: "eq", label: "Equal (=)", symbol: "=" },
];

function AlertsManagement() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [testingAlert, setTestingAlert] = useState(null);
  const [testResult, setTestResult] = useState(null);

  // Formulaire
  const [formData, setFormData] = useState({
    ticker: "",
    name: "",
    description: "",
    conditions: [{ signal: "", operator: "", value: "", params: {} }],
    logic: "AND",
    active: true,
  });

  // Charger les alertes
  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await intelligenceClient.getAlerts();
      
      if (response.success && response.data) {
        setAlerts(Array.isArray(response.data) ? response.data : []);
      } else {
        throw new Error(response.error || "Erreur lors du chargement des alertes");
      }
    } catch (err) {
      console.error("Error loading alerts:", err);
      setError(err.message || "Erreur lors du chargement des alertes");
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated()) {
      loadAlerts();
    }
  }, [isAuthenticated, loadAlerts]);

  // Ouvrir le dialog de création
  const handleCreate = () => {
    setEditingAlert(null);
    setFormData({
      ticker: "",
      name: "",
      description: "",
      conditions: [{ signal: "", operator: "", value: "", params: {} }],
      logic: "AND",
      active: true,
    });
    setDialogOpen(true);
  };

  // Ouvrir le dialog d'édition
  const handleEdit = (alert) => {
    setEditingAlert(alert);
    setFormData({
      ticker: alert.ticker || "",
      name: alert.name || "",
      description: alert.description || "",
      conditions: alert.conditions || [{ signal: "", operator: "", value: "", params: {} }],
      logic: alert.logic || "AND",
      active: alert.active !== undefined ? alert.active : true,
    });
    setDialogOpen(true);
  };

  // Sauvegarder l'alerte
  const handleSave = async () => {
    try {
      setLoading(true);
      const cleanConditions = formData.conditions.filter(
        (c) => c.signal && c.operator && c.value
      );

      if (cleanConditions.length === 0) {
        showError("Au moins une condition est requise");
        return;
      }

      const alertData = {
        ...formData,
        conditions: cleanConditions,
      };

      let response;
      if (editingAlert) {
        response = await intelligenceClient.updateAlert(editingAlert.id, alertData);
      } else {
        response = await intelligenceClient.createAlert(alertData);
      }

      if (response.success) {
        showSuccess(editingAlert ? "Alerte mise à jour" : "Alerte créée");
        setDialogOpen(false);
        loadAlerts();
      } else {
        throw new Error(response.error || "Erreur lors de la sauvegarde");
      }
    } catch (err) {
      console.error("Error saving alert:", err);
      showError(err.message || "Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  // Tester une alerte
  const handleTest = async (alert) => {
    try {
      setTestingAlert(alert);
      setTestResult(null);
      const response = await intelligenceClient.testAlert(alert.id);
      
      if (response.success && response.data) {
        setTestResult(response.data);
      } else {
        throw new Error(response.error || "Erreur lors du test");
      }
    } catch (err) {
      console.error("Error testing alert:", err);
      showError(err.message || "Erreur lors du test");
    }
  };

  // Supprimer une alerte
  const handleDelete = async (alertId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette alerte ?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await intelligenceClient.deleteAlert(alertId);
      
      if (response.success) {
        showSuccess("Alerte supprimée");
        loadAlerts();
      } else {
        throw new Error(response.error || "Erreur lors de la suppression");
      }
    } catch (err) {
      console.error("Error deleting alert:", err);
      showError(err.message || "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  // Ajouter une condition
  const addCondition = () => {
    setFormData({
      ...formData,
      conditions: [...formData.conditions, { signal: "", operator: "", value: "", params: {} }],
    });
  };

  // Supprimer une condition
  const removeCondition = (index) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter((_, i) => i !== index),
    });
  };

  // Colonnes pour le tableau
  const columns = [
    { Header: "Name", accessor: "name", width: "20%" },
    { Header: "Ticker", accessor: "ticker", width: "10%" },
    { Header: "Conditions", accessor: "conditions", width: "30%" },
    { Header: "Logic", accessor: "logic", width: "10%" },
    { Header: "Status", accessor: "status", width: "10%" },
    { Header: "Actions", accessor: "actions", width: "20%" },
  ];

  const tableData = alerts.map((alert) => ({
    name: alert.name,
    ticker: alert.ticker,
    conditions: `${alert.conditions?.length || 0} condition(s)`,
    logic: alert.logic || "AND",
    status: (
      <Chip
        label={alert.active ? "Active" : "Inactive"}
        color={alert.active ? "success" : "default"}
        size="small"
      />
    ),
    actions: (
      <MDBox display="flex" gap={1}>
        <IconButton size="small" onClick={() => handleTest(alert)}>
          <Icon fontSize="small">play_arrow</Icon>
        </IconButton>
        <IconButton size="small" onClick={() => handleEdit(alert)}>
          <Icon fontSize="small">edit</Icon>
        </IconButton>
        <IconButton size="small" onClick={() => handleDelete(alert.id)}>
          <Icon fontSize="small">delete</Icon>
        </IconButton>
      </MDBox>
    ),
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <MDBox>
            <MDTypography variant="h4" fontWeight="bold">
              Alerts Management
            </MDTypography>
            <MDTypography variant="body2" color="text">
              Créer et gérer des alertes multi-signaux personnalisées
            </MDTypography>
          </MDBox>
          <MDButton variant="gradient" color="info" onClick={handleCreate}>
            <Icon>add</Icon>&nbsp;Nouvelle Alerte
          </MDButton>
        </MDBox>

        {/* Loading */}
        {loading && !dialogOpen && (
          <Card>
            <MDBox p={3}>
              <Skeleton variant="text" height={40} />
              <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
            </MDBox>
          </Card>
        )}

        {/* Error */}
        {error && !loading && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Liste des alertes */}
        {alerts.length > 0 && !loading && (
          <Card>
            <MDBox p={3}>
              <DataTable
                table={{
                  columns,
                  rows: tableData,
                }}
                isSorted={false}
                entriesPerPage={false}
                showTotalEntries={false}
                noEndBorder
              />
            </MDBox>
          </Card>
        )}

        {alerts.length === 0 && !loading && !error && (
          <Alert severity="info">
            Aucune alerte. Cliquez sur {`"`}Nouvelle Alerte{`"`} pour en créer une.
          </Alert>
        )}

        {/* Dialog de création/édition */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingAlert ? "Modifier l'alerte" : "Nouvelle alerte"}
          </DialogTitle>
          <DialogContent>
            <MDBox pt={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    freeSolo
                    options={POPULAR_STOCKS.map((stock) => stock.symbol)}
                    value={formData.ticker}
                    onInputChange={(event, newValue) =>
                      setFormData({ ...formData, ticker: newValue })
                    }
                    renderInput={(params) => (
                      <MDInput {...params} label="Ticker" fullWidth />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <MDInput
                    label="Nom de l'alerte"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <MDInput
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    multiline
                    rows={2}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <MDTypography variant="subtitle2" fontWeight="medium" mb={2}>
                    Conditions
                  </MDTypography>
                  {formData.conditions.map((condition, index) => (
                    <MDBox key={index} mb={2} p={2} sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                          <TextField
                            select
                            label="Signal"
                            value={condition.signal}
                            onChange={(e) => {
                              const newConditions = [...formData.conditions];
                              newConditions[index].signal = e.target.value;
                              setFormData({ ...formData, conditions: newConditions });
                            }}
                            fullWidth
                          >
                            {SIGNALS.map((sig) => (
                              <MenuItem key={sig.value} value={sig.value}>
                                {sig.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField
                            select
                            label="Opérateur"
                            value={condition.operator}
                            onChange={(e) => {
                              const newConditions = [...formData.conditions];
                              newConditions[index].operator = e.target.value;
                              setFormData({ ...formData, conditions: newConditions });
                            }}
                            fullWidth
                          >
                            {OPERATORS.map((op) => (
                              <MenuItem key={op.value} value={op.value}>
                                {op.symbol} {op.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <MDInput
                            label="Valeur"
                            value={condition.value}
                            onChange={(e) => {
                              const newConditions = [...formData.conditions];
                              newConditions[index].value = e.target.value;
                              setFormData({ ...formData, conditions: newConditions });
                            }}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} md={1}>
                          <IconButton onClick={() => removeCondition(index)}>
                            <Icon>delete</Icon>
                          </IconButton>
                        </Grid>
                      </Grid>
                    </MDBox>
                  ))}
                  <MDButton variant="outlined" color="info" onClick={addCondition}>
                    <Icon>add</Icon>&nbsp;Ajouter une condition
                  </MDButton>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Logique"
                    value={formData.logic}
                    onChange={(e) => setFormData({ ...formData, logic: e.target.value })}
                    fullWidth
                  >
                    <MenuItem value="AND">AND (toutes les conditions)</MenuItem>
                    <MenuItem value="OR">OR (au moins une condition)</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      />
                    }
                    label="Active"
                  />
                </Grid>
              </Grid>
            </MDBox>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={() => setDialogOpen(false)}>Annuler</MDButton>
            <MDButton variant="gradient" color="info" onClick={handleSave} disabled={loading}>
              {loading ? "Sauvegarde..." : "Sauvegarder"}
            </MDButton>
          </DialogActions>
        </Dialog>

        {/* Dialog de test */}
        {testingAlert && (
          <Dialog open={!!testingAlert} onClose={() => setTestingAlert(null)} maxWidth="sm" fullWidth>
            <DialogTitle>Tester l{`'`}alerte: {testingAlert.name}</DialogTitle>
            <DialogContent>
              {testResult ? (
                <MDBox pt={2}>
                  <Alert severity={testResult.triggered ? "success" : "info"} sx={{ mb: 2 }}>
                    {testResult.triggered ? "Alerte déclenchée!" : "Alerte non déclenchée"}
                  </Alert>
                  {testResult.conditions && (
                    <MDBox>
                      <MDTypography variant="subtitle2" fontWeight="medium" mb={1}>
                        État des conditions:
                      </MDTypography>
                      {testResult.conditions.map((cond, index) => (
                        <MDBox key={index} mb={1}>
                          <Chip
                            label={cond.met ? "✓ Satisfaite" : "✗ Non satisfaite"}
                            color={cond.met ? "success" : "default"}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <MDTypography variant="body2" color="text" component="span">
                            {cond.condition?.signal} {cond.condition?.operator} {cond.value}
                          </MDTypography>
                        </MDBox>
                      ))}
                    </MDBox>
                  )}
                </MDBox>
              ) : (
                <MDBox pt={2}>
                  <MDTypography variant="body2" color="text">
                    Test en cours...
                  </MDTypography>
                </MDBox>
              )}
            </DialogContent>
            <DialogActions>
              <MDButton onClick={() => {
                setTestingAlert(null);
                setTestResult(null);
              }}>
                Fermer
              </MDButton>
            </DialogActions>
          </Dialog>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default withAuth(AlertsManagement);



