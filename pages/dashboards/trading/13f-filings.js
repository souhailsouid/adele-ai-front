/**
 * Trading Dashboard - 13F Filings
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Grid from "@mui/material/Grid";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import MDInput from "/components/MDInput";
import MDButton from "/components/MDButton";
import Card from "@mui/material/Card";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

// Auth
import { useAuth } from "/hooks/useAuth";

// Services
import filings13FClient from "/lib/13f-filings/client";
import metricsService from "/services/metricsService";

// Composants
import FundsList from "/pagesComponents/dashboards/trading/components/FundsList";
import FundHoldings from "/pagesComponents/dashboards/trading/components/FundHoldings";
import FundFilings from "/pagesComponents/dashboards/trading/components/FundFilings";
import TickerSearch from "/pagesComponents/dashboards/trading/components/TickerSearch";

function Trading13FFilings() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Onglets internes
  const [internalTab, setInternalTab] = useState("list");

  // États pour chaque vue
  const [funds, setFunds] = useState([]);
  const [selectedFund, setSelectedFund] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [filings, setFilings] = useState([]);

  // États de chargement
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // États pour le formulaire de création
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newFund, setNewFund] = useState({
    name: "",
    cik: "",
    tier_influence: 3,
    category: "hedge_fund",
  });

  // Charger la liste des fonds
  const loadFunds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await filings13FClient.getFunds();
      setFunds(data);
    } catch (err) {
      console.error("Error loading funds:", err);
      setError(err.message || "Erreur lors du chargement des fonds");
      setFunds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les holdings d'un fund
  const loadHoldings = useCallback(async (fundId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await filings13FClient.getFundHoldings(fundId, 500);
      setHoldings(data);
    } catch (err) {
      console.error("Error loading holdings:", err);
      setError(err.message || "Erreur lors du chargement des holdings");
      setHoldings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les filings d'un fund
  const loadFilings = useCallback(async (fundId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await filings13FClient.getFundFilings(fundId);
      setFilings(data);
    } catch (err) {
      console.error("Error loading filings:", err);
      setError(err.message || "Erreur lors du chargement des filings");
      setFilings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer un nouveau fund
  const handleCreateFund = async () => {
    if (!newFund.name.trim() || !newFund.cik.trim()) {
      setError("Veuillez remplir le nom et le CIK");
      return;
    }

    // Valider le format CIK (10 chiffres)
    const cikRegex = /^\d{10}$/;
    if (!cikRegex.test(newFund.cik)) {
      setError("Le CIK doit contenir exactement 10 chiffres");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await filings13FClient.createFund(newFund);
      setCreateDialogOpen(false);
      setNewFund({ name: "", cik: "", tier_influence: 3, category: "hedge_fund" });
      // Recharger la liste des fonds
      await loadFunds();
    } catch (err) {
      console.error("Error creating fund:", err);
      setError(err.message || "Erreur lors de la création du fund");
    } finally {
      setLoading(false);
    }
  };

  // Vérifier l'authentification et rediriger si nécessaire
  useEffect(() => {
    if (!authLoading && !isAuthenticated()) {
      console.log("Not authenticated, redirecting to sign-in");
      router.push("/authentication/sign-in?redirect=/dashboards/trading/13f-filings");
    }
  }, [authLoading, isAuthenticated, router]);

  // Gérer la sélection d'un fund
  const handleFundSelect = useCallback(
    (fund) => {
      setSelectedFund(fund);
      if (internalTab === "holdings") {
        loadHoldings(fund.id);
      } else if (internalTab === "filings") {
        loadFilings(fund.id);
      }
    },
    [internalTab, loadHoldings, loadFilings]
  );

  // Charger les données selon l'onglet interne (seulement si authentifié)
  useEffect(() => {
    if (authLoading || !isAuthenticated()) return;

    if (internalTab === "list") {
      loadFunds();
    } else if (internalTab === "holdings" && selectedFund) {
      loadHoldings(selectedFund.id);
    } else if (internalTab === "filings" && selectedFund) {
      loadFilings(selectedFund.id);
    }
    metricsService.trackFeatureUsage("13f-filings");
  }, [authLoading, isAuthenticated, internalTab, selectedFund, loadFunds, loadHoldings, loadFilings]);

  const handleInternalTabChange = (event, newValue) => {
    setInternalTab(newValue);
    // Si on change d'onglet et qu'on n'a pas de fund sélectionné, réinitialiser
    if (newValue !== "list" && !selectedFund) {
      setError("Veuillez sélectionner un fund depuis la liste");
    }
  };

  // Afficher un loader pendant la vérification d'authentification
  if (authLoading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <LinearProgress />
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  // Si non authentifié, afficher un message (la redirection est en cours)
  if (!isAuthenticated()) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="body2" color="text">
                Redirection vers la page de connexion...
              </MDTypography>
            </MDBox>
          </Card>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <MDBox>
              <MDTypography variant="h4" fontWeight="bold" mb={1}>
                13F Filings
              </MDTypography>
              <MDTypography variant="body2" color="text">
                Suivi des filings 13F des fonds institutionnels
              </MDTypography>
            </MDBox>
            <MDButton
              variant="gradient"
              color="dark"
              onClick={() => setCreateDialogOpen(true)}
            >
              Ajouter un Fund
            </MDButton>
          </MDBox>
        </MDBox>

        {/* Onglets Internes */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={internalTab}
            onChange={handleInternalTabChange}
            aria-label="13f filings internal tabs"
          >
            <Tab label="Liste des Funds" value="list" />
            <Tab label="Holdings" value="holdings" disabled={!selectedFund} />
            <Tab label="Filings" value="filings" disabled={!selectedFund} />
            <Tab label="Recherche Ticker" value="search" />
          </Tabs>
        </Box>

        {error && (
          <MDBox mb={3}>
            <MDTypography variant="body2" color="error">
              {error}
            </MDTypography>
          </MDBox>
        )}

        {loading && internalTab === "list" ? (
          <LinearProgress />
        ) : (
          <Grid container spacing={3}>
            {internalTab === "list" && (
              <Grid item xs={12}>
                <FundsList
                  data={funds}
                  loading={loading}
                  onFundSelect={handleFundSelect}
                />
              </Grid>
            )}
            {internalTab === "holdings" && selectedFund && (
              <Grid item xs={12}>
                <FundHoldings
                  data={holdings}
                  loading={loading}
                  fundName={selectedFund.name}
                />
              </Grid>
            )}
            {internalTab === "filings" && selectedFund && (
              <Grid item xs={12}>
                <FundFilings
                  data={filings}
                  loading={loading}
                  fundName={selectedFund.name}
                  fundCik={selectedFund.cik}
                />
              </Grid>
            )}
            {internalTab === "search" && (
              <Grid item xs={12}>
                <TickerSearch />
              </Grid>
            )}
            {internalTab !== "list" && internalTab !== "search" && !selectedFund && (
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="body2" color="text">
                      Veuillez sélectionner un fund depuis la liste pour voir ses holdings ou filings.
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
            )}
          </Grid>
        )}

        {/* Dialog de création de fund */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Ajouter un nouveau Fund</DialogTitle>
          <DialogContent>
            <MDBox pt={2}>
              <MDBox mb={2}>
                <MDInput
                  label="Nom du Fund"
                  placeholder="Ex: ARK Investment Management"
                  value={newFund.name}
                  onChange={(e) => setNewFund({ ...newFund, name: e.target.value })}
                  variant="standard"
                  fullWidth
                />
              </MDBox>
              <MDBox mb={2}>
                <MDInput
                  label="CIK (10 chiffres)"
                  placeholder="Ex: 0001697748"
                  value={newFund.cik}
                  onChange={(e) => setNewFund({ ...newFund, cik: e.target.value })}
                  variant="standard"
                  fullWidth
                  helperText="Le CIK doit contenir exactement 10 chiffres avec zéros à gauche"
                />
              </MDBox>
              <MDBox mb={2}>
                <FormControl variant="standard" fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newFund.category}
                    onChange={(e) => setNewFund({ ...newFund, category: e.target.value })}
                    label="Category"
                  >
                    <MenuItem value="hedge_fund">Hedge Fund</MenuItem>
                    <MenuItem value="family_office">Family Office</MenuItem>
                    <MenuItem value="mutual_fund">Mutual Fund</MenuItem>
                    <MenuItem value="pension_fund">Pension Fund</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </MDBox>
              <MDBox mb={2}>
                <MDInput
                  label="Tier Influence"
                  type="number"
                  value={newFund.tier_influence}
                  onChange={(e) =>
                    setNewFund({ ...newFund, tier_influence: parseInt(e.target.value) || 3 })
                  }
                  variant="standard"
                  fullWidth
                  inputProps={{ min: 1, max: 10 }}
                />
              </MDBox>
            </MDBox>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={() => setCreateDialogOpen(false)}>Annuler</MDButton>
            <MDButton variant="gradient" color="dark" onClick={handleCreateFund} disabled={loading}>
              Créer
            </MDButton>
          </DialogActions>
        </Dialog>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Trading13FFilings;

