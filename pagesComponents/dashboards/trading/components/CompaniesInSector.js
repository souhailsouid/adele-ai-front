import { useState, useEffect } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import unusualWhalesClient from "/lib/unusual-whales/client";

function CompaniesInSector({ sector = "", onError = () => {}, onLoading = () => {} }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (!sector) {
      setData([]);
      setIsInitialLoad(true);
      setLoading(false);
      onLoading(false);
      return;
    }
    
    let isCancelled = false;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        onLoading(true);
        
        // Délai minimal pour permettre au rendu de se stabiliser et éviter les saccades
        await new Promise(resolve => setTimeout(resolve, 150));
        
        if (isCancelled) {
          onLoading(false);
          return;
        }
        
        const response = await unusualWhalesClient.getCompaniesInSector(sector);
        
        if (isCancelled) {
          onLoading(false);
          return;
        }
        
        // Extraire les données correctement
        let extracted = [];
        if (Array.isArray(response)) {
          extracted = response;
        } else if (response?.data) {
          extracted = Array.isArray(response.data) ? response.data : [];
        }
        
        setData(extracted);
        setIsInitialLoad(false);
      } catch (err) {
        if (isCancelled) {
          onLoading(false);
          return;
        }
        
        console.error("Error loading companies in sector:", err);
        const errMsg = err.message || "Erreur lors du chargement";
        setError(errMsg);
        onError(errMsg);
        setData([]);
        setIsInitialLoad(false);
      } finally {
        if (!isCancelled) {
          setLoading(false);
          onLoading(false);
        }
      }
    };

    loadData();
    
    return () => {
      isCancelled = true;
      onLoading(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sector]);

  return (
    <Card>
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDTypography variant="h6">
            Companies in Sector {sector ? `(${sector})` : ""} {!loading && `(${data.length})`}
          </MDTypography>
          <Tooltip title="Liste de tous les tickers dans le secteur sélectionné">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {loading && (
          <MDBox mb={2}>
            <LinearProgress />
            <MDTypography variant="caption" color="text.secondary" mt={1} display="block">
              Chargement des tickers...
            </MDTypography>
          </MDBox>
        )}
        {error && (
          <MDTypography variant="body2" color="error" mb={2}>
            {error}
          </MDTypography>
        )}
        {!sector ? (
          <MDTypography variant="body2" color="text">
            Veuillez sélectionner un secteur pour voir les tickers.
          </MDTypography>
        ) : loading && isInitialLoad ? (
          <MDTypography variant="body2" color="text.secondary">
            Chargement en cours...
          </MDTypography>
        ) : data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucun ticker disponible pour ce secteur.
          </MDTypography>
        ) : (
          <Grid container spacing={1} sx={{ minHeight: "100px" }}>
            {data.map((ticker, index) => (
              <Grid item key={`${ticker}-${index}`}>
                <Chip
                  label={ticker}
                  color="primary"
                  variant="outlined"
                  sx={{ 
                    cursor: "pointer", 
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: 2
                    }
                  }}
                  onClick={() => {
                    // Could navigate to ticker analysis or copy to clipboard
                    navigator.clipboard?.writeText(ticker);
                  }}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </MDBox>
    </Card>
  );
}

export default CompaniesInSector;

