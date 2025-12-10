/**
 * Page dédiée pour l'analyse AI d'une institution
 * Affiche InstitutionMovesAnalysis
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import MDInput from "/components/MDInput";
import MDButton from "/components/MDButton";
import Autocomplete from "@mui/material/Autocomplete";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import fmpUWClient2 from "/lib/api/fmpUWClient2";
import { useAuth } from "/hooks/useAuth";
import withAuth from "/hocs/withAuth";
import { InstitutionMovesAnalysis } from "/pagesComponents/dashboards/trading/components/ai";

function AIInstitutionAnalysis() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [institutionName, setInstitutionName] = useState("");
  const [institutionInput, setInstitutionInput] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [allInstitutions, setAllInstitutions] = useState([]);
  const [period, setPeriod] = useState("3M");

  // Charger toutes les institutions pour l'Autocomplete
  useEffect(() => {
    const loadAllInstitutions = async () => {
      try {
        const params = {
          limit: 1000,
          order: "total_value",
          order_direction: "desc",
        };

        const data = await fmpUWClient2.getUWInstitutions(params).catch((err) => {
          console.error("Error loading all institutions:", err);
          return { data: [] };
        });

        const extractData = (response) => {
          if (Array.isArray(response)) return response;
          if (response?.data && Array.isArray(response.data)) return response.data;
          return [];
        };

        setAllInstitutions(extractData(data));
      } catch (err) {
        console.error("Error loading institutions:", err);
      }
    };

    loadAllInstitutions();
  }, []);

  // Fonction pour filtrer les institutions dans l'Autocomplete
  const searchInstitutions = useCallback((inputValue) => {
    if (!inputValue || inputValue.trim() === "") {
      return allInstitutions.slice(0, 20);
    }
    const searchTerm = inputValue.toLowerCase().trim();
    return allInstitutions
      .filter((inst) => {
        const name = (inst.name || "").toLowerCase();
        return name.includes(searchTerm);
      })
      .slice(0, 20);
  }, [allInstitutions]);

  // Options filtrées pour l'Autocomplete
  const institutionOptions = useMemo(() => {
    return searchInstitutions(institutionInput);
  }, [institutionInput, searchInstitutions]);

  // Vérifier l'authentification après tous les hooks
  if (!authLoading && !isAuthenticated()) {
    router.push("/authentication/sign-in?redirect=/dashboards/trading/ai-institution-analysis");
    return null;
  }

  const handleSearch = () => {
    if (institutionName) {
      const institution = typeof institutionName === "string"
        ? allInstitutions.find((inst) => inst.name === institutionName)
        : institutionName;

      if (institution) {
        setSelectedInstitution({
          cik: institution.cik || "",
          name: institution.name || institutionName,
        });
      } else {
        // Si on ne trouve pas l'institution, on utilise juste le nom
        setSelectedInstitution({
          cik: "",
          name: typeof institutionName === "string" ? institutionName : institutionName.name || "",
        });
      }
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold" mb={1}>
            🤖 Analyse AI - Institution
          </MDTypography>
          <MDTypography variant="body2" color="text.secondary">
            Analyse LLM enrichie des mouvements institutionnels avec stratégies, performance et opportunités de copy trade
          </MDTypography>
        </MDBox>

        {/* Recherche d'institution */}
        <Card sx={{ mb: 3 }}>
          <MDBox p={3}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Autocomplete
                  freeSolo
                  options={institutionOptions}
                  value={institutionName ? (typeof institutionName === "string" ? institutionName : institutionName.name || institutionName) : ""}
                  getOptionLabel={(option) => {
                    if (typeof option === "string") return option;
                    return option.name || "";
                  }}
                  onInputChange={(event, newInputValue) => {
                    setInstitutionInput(newInputValue || "");
                  }}
                  onChange={(event, newValue) => {
                    if (typeof newValue === "string") {
                      setInstitutionName(newValue.trim());
                    } else if (newValue && newValue.name) {
                      setInstitutionName(newValue.name.trim());
                    } else {
                      setInstitutionName("");
                    }
                  }}
                  renderInput={(params) => (
                    <MDInput
                      {...params}
                      label="Rechercher une institution"
                      placeholder="Ex: BLACKROCK, INC., VANGUARD GROUP INC"
                      variant="standard"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearch();
                        }
                      }}
                    />
                  )}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl variant="standard" fullWidth>
                  <InputLabel>Période</InputLabel>
                  <Select value={period} onChange={(e) => setPeriod(e.target.value)} label="Période">
                    <MenuItem value="1M">1 Mois</MenuItem>
                    <MenuItem value="3M">3 Mois</MenuItem>
                    <MenuItem value="6M">6 Mois</MenuItem>
                    <MenuItem value="1Y">1 An</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <MDButton
                  variant="gradient"
                  color="dark"
                  onClick={handleSearch}
                  disabled={!institutionName}
                  fullWidth
                >
                  Analyser
                </MDButton>
              </Grid>
            </Grid>
          </MDBox>
        </Card>

        {/* Analyse AI */}
        {selectedInstitution && selectedInstitution.name ? (
          <InstitutionMovesAnalysis
            institution_cik={selectedInstitution.cik}
            institution_name={selectedInstitution.name}
            period={period}
            onAnalysisComplete={(data) => {
              console.log("Institution Moves Analysis completed:", data);
            }}
          />
        ) : (
          <Card>
            <MDBox p={3} textAlign="center">
              <MDTypography variant="body2" color="text.secondary">
                Recherchez une institution pour commencer l&apos;analyse AI
              </MDTypography>
            </MDBox>
          </Card>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default withAuth(AIInstitutionAnalysis);

