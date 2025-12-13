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
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [period, setPeriod] = useState("3M");

  // Charger toutes les institutions pour l'Autocomplete (même méthode que dans institutions.js)
  useEffect(() => {
    const loadAllInstitutions = async () => {
      try {
        setLoadingInstitutions(true);
        
        const params = {
          limit: 1000,
          order: "total_value",
          order_direction: "desc",
        };

        const response = await fmpUWClient2.getUWInstitutions(params).catch((err) => {
          console.error("Error loading all institutions:", err);
          return null;
        });

        const extractData = (response) => {
          if (!response) {
            return [];
          }
          
          // Si c'est directement un tableau
          if (Array.isArray(response)) {
            return response;
          }
          
          // Si c'est un objet avec success et data
          if (response?.success && response?.data) {
            // Si data est directement un tableau
            if (Array.isArray(response.data)) {
              return response.data;
            }
            // Si data est un objet qui contient un tableau dans data.data
            if (response.data?.data && Array.isArray(response.data.data)) {
              return response.data.data;
            }
          }
          
          // Si c'est un objet avec une propriété data (format cache backend)
          if (response?.data && Array.isArray(response.data)) {
            return response.data;
          }
          
          // Si c'est un objet avec une propriété qui pourrait être un tableau
          const possibleArrayKeys = ['institutions', 'results', 'items'];
          for (const key of possibleArrayKeys) {
            if (response[key] && Array.isArray(response[key])) {
              return response[key];
            }
          }
          
          return [];
        };

        let institutions = extractData(response);
        
        // Normaliser les données pour s'assurer qu'elles ont le bon format
        institutions = institutions.map((inst) => {
          // Normaliser le CIK (format: 0001364742)
          let cik = inst.cik || inst.ciK || inst.CIK || "";
          if (cik && typeof cik === "string") {
            // Enlever les espaces et normaliser le format
            cik = cik.trim();
            // S'assurer que le CIK a 10 caractères avec des zéros en tête
            if (cik && cik.length < 10) {
              cik = cik.padStart(10, "0");
            }
          } else if (cik && typeof cik === "number") {
            cik = String(cik).padStart(10, "0");
          }
          
          const name = inst.name || inst.institutionName || inst.institution_name || inst.short_name || "";
          
          return {
            cik: cik || "",
            name: name,
            total_value: inst.total_value || inst.totalValue || 0,
          };
        }).filter((inst) => {
          // Filtrer les institutions sans nom ou CIK valide
          const hasName = inst.name && inst.name.trim().length > 0;
          const hasCik = inst.cik && inst.cik.trim().length > 0;
          return hasName && hasCik;
        });
        
        setAllInstitutions(institutions);
      } catch (err) {
        console.error("Error loading institutions:", err);
        setAllInstitutions([]);
      } finally {
        setLoadingInstitutions(false);
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
        const cik = (inst.cik || "").toLowerCase();
        return name.includes(searchTerm) || cik.includes(searchTerm);
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
    if (selectedInstitution && selectedInstitution.name) {
      // Si une institution est déjà sélectionnée, on l'utilise
      return;
    }
    
    if (institutionName) {
      // Chercher l'institution par nom (insensible à la casse)
      const institution = allInstitutions.find(
        (inst) => inst.name?.toLowerCase() === institutionName.toLowerCase()
      );

      if (institution) {
        setSelectedInstitution({
          cik: institution.cik || "",
          name: institution.name || institutionName,
        });
      } else {
        // Si on ne trouve pas l'institution, on utilise juste le nom (mais l'API nécessite un CIK)
        console.warn("Institution non trouvée dans la liste. CIK requis pour l'analyse.");
        setSelectedInstitution({
          cik: "",
          name: institutionName,
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
                  value={selectedInstitution || null}
                  loading={loadingInstitutions}
                  getOptionLabel={(option) => {
                    if (typeof option === "string") return option;
                    if (!option) return "";
                    const name = option.name || "";
                    const cik = option.cik ? ` (CIK: ${option.cik})` : "";
                    return `${name}${cik}`;
                  }}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    if (typeof option === "string" || typeof value === "string") {
                      return option === value;
                    }
                    return option.cik === value.cik || option.name === value.name;
                  }}
                  onInputChange={(event, newInputValue) => {
                    setInstitutionInput(newInputValue || "");
                  }}
                  onChange={(event, newValue) => {
                    if (newValue) {
                    if (typeof newValue === "string") {
                        // Si c'est une chaîne, chercher l'institution correspondante
                        const found = allInstitutions.find(
                          (inst) => inst.name?.toLowerCase() === newValue.toLowerCase()
                        );
                        if (found) {
                          setSelectedInstitution({
                            cik: found.cik || "",
                            name: found.name || newValue,
                          });
                          setInstitutionName(found.name || newValue);
                        } else {
                          setInstitutionName(newValue);
                          setSelectedInstitution(null);
                        }
                      } else if (newValue.name) {
                        // Si c'est un objet, l'utiliser directement
                        setSelectedInstitution({
                          cik: newValue.cik || "",
                          name: newValue.name || "",
                        });
                        setInstitutionName(newValue.name);
                      }
                    } else {
                      setSelectedInstitution(null);
                      setInstitutionName("");
                    }
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.cik || option.name || option}>
                      <MDBox>
                        <MDTypography variant="body2" fontWeight="bold">
                          {typeof option === "string" ? option : option.name || "N/A"}
                        </MDTypography>
                        {typeof option === "object" && option.cik && (
                          <MDTypography variant="caption" color="text.secondary">
                            CIK: {option.cik}
                          </MDTypography>
                        )}
                      </MDBox>
                    </li>
                  )}
                  renderInput={(params) => (
                    <MDInput
                      {...params}
                      label={loadingInstitutions ? "Chargement des institutions..." : "Rechercher une institution"}
                      placeholder={loadingInstitutions ? "Chargement..." : "Ex: BLACKROCK, INC., VANGUARD GROUP INC"}
                      variant="standard"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearch();
                        }
                      }}
                    />
                  )}
                  noOptionsText={loadingInstitutions ? "Chargement..." : allInstitutions.length === 0 ? "Aucune institution trouvée" : "Aucun résultat"}
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

