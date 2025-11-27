import { useState } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import Card from "@mui/material/Card";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";

function SectorPerformance({ data = {} }) {
  const [selectedExchange, setSelectedExchange] = useState("all");
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  const getColor = (change) => {
    if (!change) return "text";
    return change >= 0 ? "success" : "error";
  };

  // Gérer les anciennes données (array) et les nouvelles (object)
  const sectorsData = Array.isArray(data) 
    ? { all: data, byExchange: {}, exchanges: [] }
    : data;

  const { all = [], byExchange = {}, exchanges = [] } = sectorsData;

  // Déterminer les secteurs à afficher
  const sectorsToShow = selectedExchange === "all" 
    ? all 
    : (byExchange[selectedExchange] || []);

  // Préparer les onglets (All + chaque bourse)
  const tabs = [
    { value: "all", label: "Tous" },
    ...exchanges.map((exchange) => ({
      value: exchange,
      label: exchange,
    })),
  ];

  const handleTabChange = (event, newValue) => {
    setSelectedExchange(newValue);
  };

  return (
    <Card>
      <MDBox p={3}>
        <MDBox mb={2} display="flex" justifyContent="space-between" alignItems="flex-start">
          <MDBox>
            <MDBox display="flex" alignItems="center" gap={1} mb={0.5}>
              <MDTypography variant="h6">
                Performance par Secteur
              </MDTypography>
              <Tooltip title="En savoir plus sur l'interprétation des données">
                <IconButton
                  size="small"
                  onClick={() => setInfoModalOpen(true)}
                  sx={{ color: "text.secondary" }}
                >
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </MDBox>
            <MDTypography variant="caption" color="text">
              Variation moyenne des prix des actions par secteur. 
              Les valeurs élevées peuvent indiquer une forte volatilité ou une période de référence étendue.
            </MDTypography>
          </MDBox>
        </MDBox>
        
        {exchanges.length > 0 && (
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2, width: "100%" }}>
            <Tabs
              value={selectedExchange}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 48,
                "& .MuiTab-root": {
                  minHeight: 48,
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  padding: "12px 16px",
                },
                "& .Mui-selected": {
                  fontWeight: 600,
                },
              }}
            >
              {tabs.map((tab) => (
                <Tab 
                  key={tab.value} 
                  label={tab.label} 
                  value={tab.value}
                  sx={{
                    minWidth: { xs: 80, sm: 100 },
                  }}
                />
              ))}
            </Tabs>
          </Box>
        )}

        {sectorsToShow.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucune donnée disponible
          </MDTypography>
        ) : (
          <List>
            {sectorsToShow.slice(0, 10).map((sector, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemText
                  primary={sector.sector}
                  secondary={
                    <MDBox display="flex" alignItems="center" gap={1}>
                      <MDTypography
                        variant="body2"
                        color={getColor(sector.changesPercentage)}
                        fontWeight="medium"
                      >
                        {(sector.changesPercentage * 100)?.toFixed(2) || "0.00"}%
                      </MDTypography>
                      {selectedExchange === "all" && sector.exchange && (
                        <MDTypography variant="caption" color="text">
                          ({sector.exchange})
                        </MDTypography>
                      )}
                    </MDBox>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </MDBox>

      {/* Modal d'information */}
      <Dialog
        open={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h5" fontWeight="medium">
              Guide d&apos;interprétation : Performance par Secteur
            </MDTypography>
            <IconButton onClick={() => setInfoModalOpen(false)} size="small">
              ×
            </IconButton>
          </MDBox>
        </DialogTitle>
        <DialogContent>
          <MDBox>
            {/* Ce que représentent ces données */}
            <MDBox mb={3}>
              <MDTypography variant="h6" color="primary" mb={1}>
                📊 Ce que représentent ces données
              </MDTypography>
              <MDTypography variant="body2" color="text" mb={1}>
                Le <strong>averageChange</strong> indique la <strong>variation moyenne des prix</strong> des actions d&apos;un secteur sur une période donnée. 
                Les valeurs élevées (564%, 446%, etc.) peuvent indiquer :
              </MDTypography>
              <MDBox component="ul" sx={{ pl: 3, mb: 1 }}>
                <MDTypography component="li" variant="body2" color="text" mb={0.5}>
                  <strong>Volatilité élevée</strong> : Le secteur a connu de fortes variations de prix
                </MDTypography>
                <MDTypography component="li" variant="body2" color="text" mb={0.5}>
                  <strong>Période de référence</strong> : Peut être calculé sur une période plus longue que le jour
                </MDTypography>
                <MDTypography component="li" variant="body2" color="text" mb={0.5}>
                  <strong>Secteurs à faible liquidité</strong> : Sur AMEX notamment, quelques actions peuvent créer des variations importantes
                </MDTypography>
              </MDBox>
            </MDBox>

            <Divider sx={{ my: 2 }} />

            {/* Comment utiliser ces données */}
            <MDBox mb={3}>
              <MDTypography variant="h6" color="primary" mb={1}>
                🎯 Comment utiliser ces données pour le trading
              </MDTypography>
              
              <MDBox mb={2}>
                <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                  1. Identifier les secteurs performants
                </MDTypography>
                <MDBox component="ul" sx={{ pl: 3 }}>
                  <MDTypography component="li" variant="body2" color="text" mb={0.5}>
                    Les secteurs en <strong style={{ color: "#4caf50" }}>vert</strong> (positifs) sont en hausse
                  </MDTypography>
                  <MDTypography component="li" variant="body2" color="text" mb={0.5}>
                    Les secteurs en <strong style={{ color: "#f44336" }}>rouge</strong> (négatifs) sont en baisse
                  </MDTypography>
                </MDBox>
              </MDBox>

              <MDBox mb={2}>
                <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                  2. Comparer les bourses
                </MDTypography>
                <MDBox component="ul" sx={{ pl: 3 }}>
                  <MDTypography component="li" variant="body2" color="text" mb={0.5}>
                    <strong>NASDAQ</strong> : Souvent plus volatile, tech
                  </MDTypography>
                  <MDTypography component="li" variant="body2" color="text" mb={0.5}>
                    <strong>NYSE</strong> : Plus stable, grandes entreprises
                  </MDTypography>
                  <MDTypography component="li" variant="body2" color="text" mb={0.5}>
                    <strong>AMEX</strong> : Petites capitalisations, plus volatiles
                  </MDTypography>
                </MDBox>
              </MDBox>

              <MDBox mb={2}>
                <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                  3. Signaux de trading
                </MDTypography>
                <MDBox component="ul" sx={{ pl: 3 }}>
                  <MDTypography component="li" variant="body2" color="text" mb={0.5}>
                    <strong>Secteurs &gt; 100%</strong> : Forte volatilité, opportunités mais risques élevés
                  </MDTypography>
                  <MDTypography component="li" variant="body2" color="text" mb={0.5}>
                    <strong>Secteurs 10-50%</strong> : Mouvement modéré, plus stable
                  </MDTypography>
                  <MDTypography component="li" variant="body2" color="text" mb={0.5}>
                    <strong>Secteurs négatifs</strong> : Possible opportunité de rebond ou continuation
                  </MDTypography>
                </MDBox>
              </MDBox>
            </MDBox>

            <Divider sx={{ my: 2 }} />

            {/* Recommandations */}
            <MDBox>
              <MDTypography variant="h6" color="primary" mb={1}>
                ⚠️ Recommandations importantes
              </MDTypography>
              <MDBox component="ul" sx={{ pl: 3 }}>
                <MDTypography component="li" variant="body2" color="text" mb={0.5}>
                  Utiliser ces données comme <strong>indicateur de tendance</strong>, pas comme signal d&apos;achat/vente direct
                </MDTypography>
                <MDTypography component="li" variant="body2" color="text" mb={0.5}>
                  Combiner avec d&apos;autres indicateurs (RSI, volumes, actualités)
                </MDTypography>
                <MDTypography component="li" variant="body2" color="text" mb={0.5}>
                  Faire attention aux valeurs très élevées sur <strong>AMEX</strong> (peu d&apos;actions, plus volatiles)
                </MDTypography>
              </MDBox>
            </MDBox>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setInfoModalOpen(false)} variant="gradient" color="info">
            Compris
          </MDButton>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export default SectorPerformance;

