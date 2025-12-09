/**
 * Trading Dashboard - Institutions
 */

import { useState, useEffect, useMemo, useCallback } from "react";
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
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";

// Services
import unusualWhalesClient from "/lib/unusual-whales/client";
import intelligenceClient from "/lib/api/intelligenceClient";
import withAuth from "/hocs/withAuth";
import metricsService from "/services/metricsService";

// Composants
import InstitutionsList from "/pagesComponents/dashboards/trading/components/InstitutionsList";
import LatestFilings from "/pagesComponents/dashboards/trading/components/LatestFilings";
import InstitutionOwnership from "/pagesComponents/dashboards/trading/components/InstitutionOwnership";
import InstitutionSectors from "/pagesComponents/dashboards/trading/components/InstitutionSectors";
import InstitutionHoldings from "/pagesComponents/dashboards/trading/components/InstitutionHoldings";
import InstitutionActivity from "/pagesComponents/dashboards/trading/components/InstitutionActivity";
import Institution13FDetails from "/pagesComponents/dashboards/trading/arkham/Institution13FDetails";

function TradingInstitutions() {
  
  // Onglets internes
  const [internalTab, setInternalTab] = useState("list");
  
  // États pour chaque vue
  const [institutionsList, setInstitutionsList] = useState([]);
  const [allInstitutions, setAllInstitutions] = useState([]); // Liste complète pour l'Autocomplete
  const [latestFilings, setLatestFilings] = useState([]);
  const [ownership, setOwnership] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [activity, setActivity] = useState([]);
  
  // États de chargement
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filtres
  const [institutionName, setInstitutionName] = useState("");
  const [institutionInput, setInstitutionInput] = useState(""); // Input pour l'Autocomplete
  const [tickerInput, setTickerInput] = useState("");
  const [orderBy, setOrderBy] = useState("total_value");
  const [orderDirection, setOrderDirection] = useState("desc");
  
  // Filtres avancés pour Latest Filings
  const [filterType, setFilterType] = useState("all"); // all, hedge_fund, other
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [sortBy, setSortBy] = useState("filing_date"); // filing_date, name, cik
  const [sortDirection, setSortDirection] = useState("desc"); // asc, desc
  
  // État pour le dialog des détails 13F
  const [selectedFiling, setSelectedFiling] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);


  // Charger toutes les institutions pour l'Autocomplete (une seule fois au chargement)
  const loadAllInstitutions = async () => {
    try {
      const params = {
        limit: 1000, // Charger plus d'institutions pour l'Autocomplete
        order: "total_value",
        order_direction: "desc",
      };

      const data = await unusualWhalesClient.getInstitutions(params).catch((err) => {
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
      console.error("Error loading all institutions:", err);
    }
  };

  // Charger la liste des institutions
  const loadInstitutionsList = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        limit: 500,
        order: orderBy,
        order_direction: orderDirection,
      };

      if (institutionName.trim()) {
        params.name = institutionName.trim();
      }

      const data = await unusualWhalesClient.getInstitutions(params).catch((err) => {
        console.error("Error loading institutions:", err);
        return { data: [] };
      });

      const extractData = (response) => {
        if (Array.isArray(response)) return response;
        if (response?.data && Array.isArray(response.data)) return response.data;
        return [];
      };

      setInstitutionsList(extractData(data));
    } catch (err) {
      console.error("Error loading Institutions:", err);
      setError(err.message || "Erreur lors du chargement des institutions");
    } finally {
      setLoading(false);
    }
  };

  // Charger les derniers filings avec filtres (nouvel endpoint combiné FMP + UW)
  const loadLatestFilings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Utiliser le nouvel endpoint combiné 13F filings
      const response = await intelligenceClient.getLatest13FFilings().catch((err) => {
        console.error("Error loading latest 13F filings:", err);
        return { success: false, data: [] };
      });

      // Extraire les données de la réponse
      let filings = [];
      if (response.success && Array.isArray(response.data)) {
        filings = response.data;
      } else if (Array.isArray(response)) {
        filings = response;
      } else if (response?.data && Array.isArray(response.data)) {
        filings = response.data;
      }

      // Normaliser les données pour correspondre à la structure attendue
      filings = filings.map(filing => ({
        cik: filing.cik || filing.ciK || '',
        name: filing.institutionName && filing.institutionName !== 'None' 
          ? filing.institutionName 
          : (filing.name || filing.short_name || 'N/A'),
        institutionName: filing.institutionName && filing.institutionName !== 'None' 
          ? filing.institutionName 
          : (filing.name || filing.short_name || 'N/A'),
        filing_date: filing.filingDate || filing.filing_date || filing.reportDate || filing.report_date || '',
        report_date: filing.reportDate || filing.report_date || filing.filingDate || filing.filing_date || '',
        formType: filing.formType || filing.form_type || filing.form || '13F-HR',
        source: filing.source || 'FMP', // BOTH, FMP, ou UW
        url: filing.url || null,
        // Champs pour compatibilité avec l'ancien format
        short_name: filing.institutionName && filing.institutionName !== 'None' 
          ? filing.institutionName 
          : (filing.name || filing.short_name || 'N/A'),
        tags: filing.tags || [],
        is_hedge_fund: filing.is_hedge_fund || false,
      }));

      // Filtrer par nom d'institution si spécifié
      if (institutionName && institutionName.trim()) {
        const searchTerm = institutionName.toLowerCase().trim();
        filings = filings.filter(filing => {
          const name = (filing.name || filing.institutionName || '').toLowerCase();
          const cik = (filing.cik || '').toLowerCase();
          return name.includes(searchTerm) || cik.includes(searchTerm);
        });
      }
      
      // Appliquer les filtres côté client
      if (filterType !== "all") {
        filings = filings.filter(filing => {
          if (filterType === "hedge_fund") {
            return filing.is_hedge_fund === true;
          } else if (filterType === "other") {
            return filing.is_hedge_fund !== true;
          }
          return true;
        });
      }
      
      // Filtrer par date
      if (filterDateFrom) {
        filings = filings.filter(filing => {
          const filingDate = new Date(filing.filing_date || filing.report_date || 0);
          const fromDate = new Date(filterDateFrom);
          return filingDate >= fromDate;
        });
      }
      
      if (filterDateTo) {
        filings = filings.filter(filing => {
          const filingDate = new Date(filing.filing_date || filing.report_date || 0);
          const toDate = new Date(filterDateTo);
          toDate.setHours(23, 59, 59, 999); // Fin de journée
          return filingDate <= toDate;
        });
      }
      
      // Filtrer par tag
      if (filterTag.trim()) {
        const tagLower = filterTag.toLowerCase().trim();
        filings = filings.filter(filing => {
          if (!filing.tags || !Array.isArray(filing.tags)) return false;
          return filing.tags.some(tag => tag.toLowerCase().includes(tagLower));
        });
      }
      
      // Trier
      filings.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
          case "filing_date":
            aValue = new Date(a.filing_date || a.report_date || 0);
            bValue = new Date(b.filing_date || b.report_date || 0);
            break;
          case "name":
            aValue = (a.name || a.institutionName || a.short_name || "").toLowerCase();
            bValue = (b.name || b.institutionName || b.short_name || "").toLowerCase();
            break;
          case "cik":
            aValue = (a.cik || "").toLowerCase();
            bValue = (b.cik || "").toLowerCase();
            break;
          default:
            aValue = new Date(a.filing_date || a.report_date || 0);
            bValue = new Date(b.filing_date || b.report_date || 0);
        }
        
        if (sortBy === "filing_date") {
          return sortDirection === "desc" ? bValue - aValue : aValue - bValue;
        } else {
          if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
          if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
          return 0;
        }
      });

      setLatestFilings(filings);
    } catch (err) {
      console.error("Error loading Latest Filings:", err);
      setError(err.message || "Erreur lors du chargement des derniers filings");
    } finally {
      setLoading(false);
    }
  };

  // Charger l'ownership d'un ticker
  const loadOwnership = async () => {
    if (!tickerInput.trim()) {
      setError("Veuillez entrer un ticker");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await unusualWhalesClient.getInstitutionOwnership(tickerInput.trim().toUpperCase(), {
        limit: 500,
      }).catch((err) => {
        console.error("Error loading ownership:", err);
        throw err;
      });

      const extractData = (response) => {
        if (Array.isArray(response)) return response;
        if (response?.data && Array.isArray(response.data)) return response.data;
        return [];
      };

      setOwnership(extractData(data));
    } catch (err) {
      console.error("Error loading Ownership:", err);
      setError(err.message || "Erreur lors du chargement de l'ownership");
      setOwnership([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les secteurs d'une institution
  const loadSectors = async () => {
    if (!institutionName.trim()) {
      setError("Veuillez entrer un nom d'institution");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await unusualWhalesClient.getInstitutionSectors(institutionName.trim(), {
        limit: 500,
      }).catch((err) => {
        console.error("Error loading sectors:", err);
        throw err;
      });

      const extractData = (response) => {
        if (Array.isArray(response)) return response;
        if (response?.data) {
          // Si data est un tableau, le retourner
          if (Array.isArray(response.data)) return response.data;
          // Si data est un objet unique, le transformer en tableau
          if (typeof response.data === "object" && response.data !== null) {
            return [response.data];
          }
        }
        // Si la réponse est un objet unique (pas dans data), le transformer en tableau
        if (typeof response === "object" && response !== null && !Array.isArray(response) && response.sector) {
          return [response];
        }
        return [];
      };

      setSectors(extractData(data));
    } catch (err) {
      console.error("Error loading Sectors:", err);
      setError(err.message || "Erreur lors du chargement des secteurs");
      setSectors([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les holdings d'une institution
  const loadHoldings = async () => {
    if (!institutionName.trim()) {
      setError("Veuillez entrer un nom d'institution");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await unusualWhalesClient.getInstitutionHoldings(institutionName.trim(), {
        limit: 500,
      }).catch((err) => {
        console.error("Error loading holdings:", err);
        throw err;
      });

      const extractData = (response) => {
        if (Array.isArray(response)) return response;
        if (response?.data && Array.isArray(response.data)) return response.data;
        return [];
      };

      setHoldings(extractData(data));
    } catch (err) {
      console.error("Error loading Holdings:", err);
      setError(err.message || "Erreur lors du chargement des holdings");
      setHoldings([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger l'activité d'une institution
  const loadActivity = async () => {
    if (!institutionName.trim()) {
      setError("Veuillez entrer un nom d'institution");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await unusualWhalesClient.getInstitutionActivity(institutionName.trim(), {
        limit: 500,
      }).catch((err) => {
        console.error("Error loading activity:", err);
        throw err;
      });

      const extractData = (response) => {
        if (Array.isArray(response)) return response;
        if (response?.data && Array.isArray(response.data)) return response.data;
        return [];
      };

      setActivity(extractData(data));
    } catch (err) {
      console.error("Error loading Activity:", err);
      setError(err.message || "Erreur lors du chargement de l'activité");
      setActivity([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger toutes les institutions au montage du composant pour l'Autocomplete
  useEffect(() => {
    loadAllInstitutions();
    metricsService.trackFeatureUsage("institutions");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Charger les données selon l'onglet interne
  useEffect(() => {
    if (internalTab === "list") {
      loadInstitutionsList();
    } else if (internalTab === "filings") {
      // Charger automatiquement les derniers filings sans nécessiter de recherche
      loadLatestFilings();
    } else if (internalTab === "ownership") {
      // Ne charge pas automatiquement, nécessite un ticker
    } else if (internalTab === "sectors") {
      // Ne charge pas automatiquement, nécessite une institution
    } else if (internalTab === "holdings") {
      // Ne charge pas automatiquement, nécessite une institution
    } else if (internalTab === "activity") {
      // Ne charge pas automatiquement, nécessite une institution
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalTab, orderBy, orderDirection, filterType, filterDateFrom, filterDateTo, filterTag, sortBy, sortDirection]);

  const handleInternalTabChange = (event, newValue) => {
    setInternalTab(newValue);
  };

  // Fonction pour filtrer les institutions dans l'Autocomplete
  const searchInstitutions = useCallback((inputValue) => {
    if (!inputValue || inputValue.trim() === "") {
      return allInstitutions.slice(0, 20); // Limiter à 20 résultats par défaut
    }
    const searchTerm = inputValue.toLowerCase().trim();
    return allInstitutions
      .filter((inst) => {
        const name = (inst.name || "").toLowerCase();
        return name.includes(searchTerm);
      })
      .slice(0, 20); // Limiter à 20 résultats
  }, [allInstitutions]);

  // Options filtrées pour l'Autocomplete
  const institutionOptions = useMemo(() => {
    return searchInstitutions(institutionInput);
  }, [institutionInput, searchInstitutions]);

  const handleSearch = () => {
    if (internalTab === "ownership") {
      loadOwnership();
    } else if (internalTab === "sectors") {
      loadSectors();
    } else if (internalTab === "holdings") {
      loadHoldings();
    } else if (internalTab === "activity") {
      loadActivity();
    } else if (internalTab === "list") {
      loadInstitutionsList();
    } else if (internalTab === "filings") {
      loadLatestFilings();
    }
  };



  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold" mb={1}>
            Institutions
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Données institutionnelles : liste, holdings, secteurs, activité et ownership
          </MDTypography>
        </MDBox>

   
        {/* Onglets Internes */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={internalTab} onChange={handleInternalTabChange} aria-label="institutions internal tabs">
            <Tab label="Liste" value="list" />
            <Tab label="Latest Filings" value="filings" />
            <Tab label="Ownership (par Ticker)" value="ownership" />
            <Tab label="Sectors (par Institution)" value="sectors" />
            <Tab label="Holdings (par Institution)" value="holdings" />
            <Tab label="Activity (par Institution)" value="activity" />
          </Tabs>
        </Box>

        {/* Filtres */}
        <MDBox mb={3}>
          <Card>
            <MDBox p={2}>
              <Grid container spacing={2} alignItems="center">
                {(internalTab === "sectors" || internalTab === "holdings" || internalTab === "activity" || internalTab === "list") && (
                  <Grid item xs={12} md={4}>
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
                          label="Nom de l'institution"
                          placeholder="Ex: VANGUARD GROUP INC"
                          variant="standard"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSearch();
                            }
                            params.inputProps?.onKeyDown?.(e);
                          }}
                        />
                      )}
                      fullWidth
                    />
                  </Grid>
                )}
                {internalTab === "filings" && (
                  <Grid item xs={12} md={4}>
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
                          label="Nom de l'institution (optionnel)"
                          placeholder="Laisser vide pour voir tous les filings"
                          variant="standard"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSearch();
                            }
                            params.inputProps?.onKeyDown?.(e);
                          }}
                        />
                      )}
                      fullWidth
                    />
                  </Grid>
                )}
                {internalTab === "ownership" && (
                  <Grid item xs={12} md={4}>
                    <MDInput
                      label="Ticker"
                      placeholder="Ex: AAPL, MSFT"
                      value={tickerInput}
                      onChange={(e) => setTickerInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                      variant="standard"
                      fullWidth
                    />
                  </Grid>
                )}
                {internalTab === "list" && (
                  <>
                    <Grid item xs={12} md={3}>
                      <FormControl variant="standard" fullWidth>
                        <InputLabel>Tri par</InputLabel>
                        <Select value={orderBy} onChange={(e) => setOrderBy(e.target.value)} label="Tri par">
                          <MenuItem value="name">Nom</MenuItem>
                          <MenuItem value="total_value">Total Value</MenuItem>
                          <MenuItem value="share_value">Share Value</MenuItem>
                          <MenuItem value="buy_value">Buy Value</MenuItem>
                          <MenuItem value="sell_value">Sell Value</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl variant="standard" fullWidth>
                        <InputLabel>Direction</InputLabel>
                        <Select value={orderDirection} onChange={(e) => setOrderDirection(e.target.value)} label="Direction">
                          <MenuItem value="asc">Croissant</MenuItem>
                          <MenuItem value="desc">Décroissant</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}
                
                {/* Filtres avancés pour Latest Filings */}
                {internalTab === "filings" && (
                  <>
                    <Grid item xs={12} md={2}>
                      <FormControl variant="standard" fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label="Type">
                          <MenuItem value="all">Tous</MenuItem>
                          <MenuItem value="hedge_fund">Hedge Fund</MenuItem>
                          <MenuItem value="other">Autres</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <MDInput
                        type="date"
                        label="Date de début"
                        value={filterDateFrom}
                        onChange={(e) => setFilterDateFrom(e.target.value)}
                        variant="standard"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <MDInput
                        type="date"
                        label="Date de fin"
                        value={filterDateTo}
                        onChange={(e) => setFilterDateTo(e.target.value)}
                        variant="standard"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <MDInput
                        label="Tag"
                        placeholder="Ex: Technology"
                        value={filterTag}
                        onChange={(e) => setFilterTag(e.target.value)}
                        variant="standard"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl variant="standard" fullWidth>
                        <InputLabel>Tri par</InputLabel>
                        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} label="Tri par">
                          <MenuItem value="filing_date">Date de Filing</MenuItem>
                          <MenuItem value="name">Nom</MenuItem>
                          <MenuItem value="cik">CIK</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl variant="standard" fullWidth>
                        <InputLabel>Direction</InputLabel>
                        <Select value={sortDirection} onChange={(e) => setSortDirection(e.target.value)} label="Direction">
                          <MenuItem value="asc">Croissant</MenuItem>
                          <MenuItem value="desc">Décroissant</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}
                
                {internalTab === "filings" && (
                  <Grid item xs={12} md={2}>
                    <MDButton 
                      variant="outlined" 
                      color="secondary" 
                      onClick={() => {
                        setInstitutionName(""); // Réinitialiser aussi le nom d'institution
                        setFilterType("all");
                        setFilterDateFrom("");
                        setFilterDateTo("");
                        setFilterTag("");
                        setSortBy("filing_date");
                        setSortDirection("desc");
                        setTimeout(() => loadLatestFilings(), 100);
                      }} 
                      disabled={loading} 
                      fullWidth
                    >
                      Réinitialiser
                    </MDButton>
                  </Grid>
                )}
                <Grid item xs={12} md={internalTab === "ownership" ? 8 : internalTab === "list" ? 3 : internalTab === "filings" ? 2 : 8}>
                  <MDButton variant="gradient" color="dark" onClick={handleSearch} disabled={loading} fullWidth>
                    Rechercher
                  </MDButton>
                </Grid>
              </Grid>
            </MDBox>
          </Card>
        </MDBox>

        {error && (
          <MDBox mb={3}>
            <MDTypography variant="body2" color="error">
              {error}
            </MDTypography>
          </MDBox>
        )}

        {loading ? (
          <LinearProgress />
        ) : (
          <Grid container spacing={3}>
            {internalTab === "list" && (
              <Grid item xs={12}>
                <InstitutionsList data={institutionsList} loading={loading} />
              </Grid>
            )}
            {internalTab === "filings" && (
              <Grid item xs={12}>
                <MDBox mb={2}>
                  <Card>
                    <MDBox p={2}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={8}>
                          <MDTypography variant="h6" fontWeight="medium">
                            Résultats: {latestFilings.length} filing(s) 13F
                          </MDTypography>
                          {!institutionName && (
                            <MDTypography variant="caption" color="info" fontWeight="medium" display="block">
                              Affichage de tous les derniers filings 13F combinés (FMP + Unusual Whales)
                            </MDTypography>
                          )}
                          {institutionName && (
                            <MDTypography variant="caption" color="text.secondary" display="block">
                              Filtré par institution: {institutionName}
                            </MDTypography>
                          )}
                          {(filterType !== "all" || filterDateFrom || filterDateTo || filterTag) && (
                            <MDTypography variant="caption" color="text.secondary" display="block" mt={0.5}>
                              Filtres actifs: {filterType !== "all" && `Type: ${filterType === "hedge_fund" ? "Hedge Fund" : "Autres"}`}
                              {filterDateFrom && ` | Du: ${new Date(filterDateFrom).toLocaleDateString("fr-FR")}`}
                              {filterDateTo && ` | Au: ${new Date(filterDateTo).toLocaleDateString("fr-FR")}`}
                              {filterTag && ` | Tag: ${filterTag}`}
                            </MDTypography>
                          )}
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <MDBox display="flex" gap={1} flexWrap="wrap">
                            <Chip 
                              label={`FMP: ${latestFilings.filter(f => f.source === 'FMP' || f.source === 'BOTH').length}`}
                              size="small"
                              color="primary"
                            />
                            <Chip 
                              label={`UW: ${latestFilings.filter(f => f.source === 'UW' || f.source === 'BOTH').length}`}
                              size="small"
                              color="secondary"
                            />
                            <Chip 
                              label={`BOTH: ${latestFilings.filter(f => f.source === 'BOTH').length}`}
                              size="small"
                              color="success"
                            />
                          </MDBox>
                        </Grid>
                      </Grid>
                    </MDBox>
                  </Card>
                </MDBox>
                <LatestFilings 
                  data={latestFilings} 
                  loading={loading} 
                  onFilingClick={(filing) => {
                    setSelectedFiling(filing);
                    setDetailsOpen(true);
                  }}
                />
              </Grid>
            )}
            {internalTab === "ownership" && (
              <Grid item xs={12}>
                <InstitutionOwnership data={ownership} loading={loading} ticker={tickerInput} />
              </Grid>
            )}
            {internalTab === "sectors" && (
              <Grid item xs={12}>
                <InstitutionSectors data={sectors} loading={loading} institutionName={institutionName} />
              </Grid>
            )}
            {internalTab === "holdings" && (
              <Grid item xs={12}>
                <InstitutionHoldings data={holdings} loading={loading} institutionName={institutionName} />
              </Grid>
            )}
            {internalTab === "activity" && (
              <Grid item xs={12}>
                <InstitutionActivity data={activity} loading={loading} institutionName={institutionName} />
              </Grid>
            )}
          </Grid>
        )}
      </MDBox>

      {/* Dialog pour les détails du filing 13F */}
      <Institution13FDetails
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedFiling(null);
        }}
        filing={selectedFiling}
      />

      <Footer />
    </DashboardLayout>
  );
}

export default withAuth(TradingInstitutions);
