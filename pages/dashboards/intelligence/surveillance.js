/**
 * Surveillance - Surveillance continue avec alertes automatiques
 * 
 * Permet de :
 * - Créer des surveillances pour des tickers
 * - Configurer les seuils d'alertes
 * - Voir les alertes générées
 * - Gérer les surveillances actives
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
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import DataTable from "/examples/Tables/DataTable";
import { formatDate } from "/utils/formatting";
import intelligenceClient from "/lib/api/intelligenceClient";
import { useRouter } from "next/router";
import { useAuth } from "/hooks/useAuth";
import withAuth from "/hocs/withAuth";

function Surveillance() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [watches, setWatches] = useState([]);
  const [alerts, setAlerts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newWatch, setNewWatch] = useState({
    ticker: '',
    minPremium: 50000,
    callVolumeThreshold: 1000000,
    putVolumeThreshold: 500000,
    darkPoolVolumeThreshold: 5000000,
    shortInterestThreshold: 20,
    checkInterval: 5,
    active: true,
  });

  // Charger les surveillances
  const loadWatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await intelligenceClient.getSurveillances();
      
      if (response.success && response.data) {
        setWatches(response.data.watches || []);
        
        // Charger les alertes pour chaque surveillance
        const alertsPromises = (response.data.watches || []).map(async (watch) => {
          try {
            const alertsResponse = await intelligenceClient.getSurveillanceAlerts(watch.id);
            if (alertsResponse.success && alertsResponse.data) {
              return { watchId: watch.id, alerts: alertsResponse.data.alerts || [] };
            }
          } catch (err) {
            console.error(`Error loading alerts for watch ${watch.id}:`, err);
          }
          return { watchId: watch.id, alerts: [] };
        });
        
        const alertsResults = await Promise.all(alertsPromises);
        const alertsMap = {};
        alertsResults.forEach(({ watchId, alerts: watchAlerts }) => {
          alertsMap[watchId] = watchAlerts;
        });
        setAlerts(alertsMap);
      }
    } catch (err) {
      console.error("Error loading watches:", err);
      setError(err.message || "Erreur lors du chargement des surveillances");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated()) {
      loadWatches();
      
      // Poller les alertes toutes les 30 secondes
      const interval = setInterval(() => {
        loadWatches();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, loadWatches]);

  // Créer une surveillance
  const handleCreateWatch = async () => {
    try {
      setError(null);
      const response = await intelligenceClient.createSurveillance(newWatch);
      
      if (response.success) {
        setCreateDialogOpen(false);
        setNewWatch({
          ticker: '',
          minPremium: 50000,
          callVolumeThreshold: 1000000,
          putVolumeThreshold: 500000,
          darkPoolVolumeThreshold: 5000000,
          shortInterestThreshold: 20,
          checkInterval: 5,
          active: true,
        });
        loadWatches();
      } else {
        throw new Error(response.error || "Erreur lors de la création");
      }
    } catch (err) {
      console.error("Error creating watch:", err);
      setError(err.message || "Erreur lors de la création de la surveillance");
    }
  };

  // Supprimer une surveillance
  const handleDeleteWatch = async (watchId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette surveillance ?")) {
      return;
    }

    try {
      await intelligenceClient.deleteSurveillance(watchId);
      loadWatches();
    } catch (err) {
      console.error("Error deleting watch:", err);
      setError(err.message || "Erreur lors de la suppression");
    }
  };

  // Colonnes pour le tableau des surveillances
  const watchColumns = [
    { Header: "Ticker", accessor: "ticker", width: "15%" },
    { Header: "Status", accessor: "status", width: "10%" },
    { Header: "Dernière vérification", accessor: "lastChecked", width: "20%" },
    { Header: "Alertes", accessor: "alertsCount", width: "10%" },
    { Header: "Actions", accessor: "actions", width: "20%" },
  ];

  const watchTableData = watches.map((watch) => ({
    ticker: watch.ticker,
    status: watch.active ? (
      <Chip label="Actif" color="success" size="small" />
    ) : (
      <Chip label="Inactif" color="default" size="small" />
    ),
    lastChecked: watch.lastChecked ? formatDate(new Date(watch.lastChecked)) : 'Jamais',
    alertsCount: (alerts[watch.id] || []).length,
    actions: (
      <MDBox>
        <MDButton
          size="small"
          color="info"
          onClick={() => {
            intelligenceClient.checkSurveillance(watch.id).then(() => loadWatches());
          }}
        >
          Vérifier
        </MDButton>
        <MDButton
          size="small"
          color="error"
          onClick={() => handleDeleteWatch(watch.id)}
          sx={{ ml: 1 }}
        >
          Supprimer
        </MDButton>
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
              Surveillance
            </MDTypography>
            <MDTypography variant="body2" color="text">
              Surveillance continue avec alertes automatiques
            </MDTypography>
          </MDBox>
          <MDButton
            variant="gradient"
            color="info"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Icon>add</Icon>&nbsp;Nouvelle Surveillance
          </MDButton>
        </MDBox>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <Card>
            <MDBox p={3}>
              <Skeleton variant="text" height={40} />
              <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
            </MDBox>
          </Card>
        )}

        {/* Watches Table */}
        {!loading && (
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Surveillances Actives ({watches.length})
              </MDTypography>
              <DataTable
                table={{
                  columns: watchColumns,
                  rows: watchTableData,
                }}
                isSorted={false}
                entriesPerPage={false}
                showTotalEntries={false}
                noEndBorder
              />
            </MDBox>
          </Card>
        )}

        {/* Alerts */}
        {!loading && watches.length > 0 && (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {watches.map((watch) => (
              <Grid item xs={12} md={6} key={watch.id}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Alertes - {watch.ticker}
                    </MDTypography>
                    {(alerts[watch.id] || []).length === 0 ? (
                      <MDTypography variant="body2" color="text">
                        Aucune alerte
                      </MDTypography>
                    ) : (
                      (alerts[watch.id] || []).slice(0, 5).map((alert, index) => (
                        <Alert
                          key={alert.id || index}
                          severity="info"
                          sx={{ mb: 1 }}
                        >
                          <MDTypography variant="body2" fontWeight="medium">
                            {alert.type?.replace('_', ' ')}
                          </MDTypography>
                          <MDTypography variant="body2" color="text">
                            {alert.message}
                          </MDTypography>
                          <MDTypography variant="caption" color="text">
                            {formatDate(new Date(alert.triggeredAt))}
                          </MDTypography>
                        </Alert>
                      ))
                    )}
                  </MDBox>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Create Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Nouvelle Surveillance</DialogTitle>
          <DialogContent>
            <MDBox pt={2}>
              <TextField
                fullWidth
                label="Ticker"
                value={newWatch.ticker}
                onChange={(e) => setNewWatch({ ...newWatch, ticker: e.target.value.toUpperCase() })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="number"
                label="Premium Minimum ($)"
                value={newWatch.minPremium}
                onChange={(e) => setNewWatch({ ...newWatch, minPremium: parseInt(e.target.value) || 0 })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="number"
                label="Call Volume Threshold ($)"
                value={newWatch.callVolumeThreshold}
                onChange={(e) => setNewWatch({ ...newWatch, callVolumeThreshold: parseInt(e.target.value) || 0 })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="number"
                label="Short Interest Threshold (%)"
                value={newWatch.shortInterestThreshold}
                onChange={(e) => setNewWatch({ ...newWatch, shortInterestThreshold: parseInt(e.target.value) || 0 })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="number"
                label="Check Interval (minutes)"
                value={newWatch.checkInterval}
                onChange={(e) => setNewWatch({ ...newWatch, checkInterval: parseInt(e.target.value) || 5 })}
                sx={{ mb: 2 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={newWatch.active}
                    onChange={(e) => setNewWatch({ ...newWatch, active: e.target.checked })}
                  />
                }
                label="Actif"
              />
            </MDBox>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={() => setCreateDialogOpen(false)}>Annuler</MDButton>
            <MDButton variant="gradient" color="info" onClick={handleCreateWatch}>
              Créer
            </MDButton>
          </DialogActions>
        </Dialog>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default withAuth(Surveillance);



