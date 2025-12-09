/**
 * Market Intelligence - Sector Rotation et Market Tide
 * 
 * Affiche :
 * - Sector Rotation : Détection des rotations sectorielles (RISK_ON, RISK_OFF, VALUE, GROWTH)
 * - Market Tide : Sentiment global du marché
 */

import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import Card from "@mui/material/Card";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import MDButton from "/components/MDButton";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import DataTable from "/examples/Tables/DataTable";
import { formatCurrency, formatPercentage } from "/utils/formatting";
import intelligenceClient from "/lib/api/intelligenceClient";
import { useRouter } from "next/router";
import { useAuth } from "/hooks/useAuth";
import withAuth from "/hocs/withAuth";
import SectorChart from "/pagesComponents/dashboards/intelligence/components/SectorChart";

function MarketIntelligence() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [sectorRotation, setSectorRotation] = useState(null);
  const [marketTide, setMarketTide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Charger en parallèle
        const [rotationResponse, tideResponse] = await Promise.all([
          intelligenceClient.getSectorRotation(),
          intelligenceClient.getMarketTide(),
        ]);

        if (rotationResponse.success && rotationResponse.data) {
          setSectorRotation(rotationResponse.data);
        }

        if (tideResponse.success && tideResponse.data) {
          setMarketTide(tideResponse.data);
        }
      } catch (err) {
        console.error("Error loading market intelligence:", err);
        setError(err.message || "Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated()) {
      loadData();
    }
  }, [isAuthenticated]);

  // Récupérer la couleur selon la rotation
  const getRotationColor = (rotation) => {
    if (!rotation) return 'default';
    switch (rotation) {
      case 'RISK_ON':
        return 'success';
      case 'RISK_OFF':
        return 'error';
      case 'VALUE':
        return 'info';
      case 'GROWTH':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Récupérer la couleur selon le sentiment
  const getSentimentColor = (sentiment) => {
    if (!sentiment) return 'default';
    switch (sentiment) {
      case 'BULLISH':
        return 'success';
      case 'BEARISH':
        return 'error';
      default:
        return 'default';
    }
  };

  // Colonnes pour le tableau des secteurs
  const sectorColumns = [
    { Header: "Secteur", accessor: "sector", width: "25%" },
    { Header: "Tide", accessor: "tide", width: "15%" },
    { Header: "Changement", accessor: "change", width: "15%" },
    { Header: "Trend", accessor: "trend", width: "15%" },
    { Header: "ETF Flows", accessor: "etfFlows", width: "20%" },
  ];

  // Préparer les données pour le tableau
  const sectorTableData = sectorRotation?.sectors?.map((sector) => ({
    sector: sector.sector,
    tide: `${sector.currentTide > 0 ? '+' : ''}${sector.currentTide.toFixed(1)}`,
    change: `${sector.change > 0 ? '+' : ''}${sector.change.toFixed(1)}`,
    trend: sector.trend,
    etfFlows: sector.etfFlows ? formatCurrency(sector.etfFlows) : 'N/A',
  })) || [];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold">
            Market Intelligence
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Sector rotation et sentiment global du marché
          </MDTypography>
        </MDBox>

        {/* Loading */}
        {loading && (
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

        {/* Tabs */}
        {!loading && (
          <Card sx={{ mb: 3 }}>
            <MDBox p={2}>
              <Tabs
                value={currentTab}
                onChange={(e, newValue) => setCurrentTab(newValue)}
              >
                <Tab label="Market Tide" />
                <Tab label="Sector Rotation" />
              </Tabs>
            </MDBox>
          </Card>
        )}

        {/* Market Tide */}
        {marketTide && !loading && currentTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={3}>
                    Market Tide
                  </MDTypography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <MDBox mb={3}>
                        <MDTypography variant="body2" color="text" mb={1}>
                          Score Global
                        </MDTypography>
                        <MDBox display="flex" alignItems="center" mb={2}>
                          <MDTypography
                            variant="h2"
                            fontWeight="bold"
                            color={marketTide.overall > 0 ? 'success' : marketTide.overall < 0 ? 'error' : 'text'}
                          >
                            {marketTide.overall > 0 ? '+' : ''}{marketTide.overall.toFixed(1)}
                          </MDTypography>
                        </MDBox>
                        <LinearProgress
                          variant="determinate"
                          value={Math.abs(marketTide.overall)}
                          color={marketTide.overall > 0 ? 'success' : 'error'}
                          sx={{ height: 8, borderRadius: 1 }}
                        />
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDBox mb={2}>
                      <Chip
                        icon={<Icon>{marketTide.sentiment === 'BULLISH' ? 'trending_up' : marketTide.sentiment === 'BEARISH' ? 'trending_down' : 'trending_flat'}</Icon>}
                        label={marketTide.sentiment || 'NEUTRAL'}
                        color={getSentimentColor(marketTide.sentiment) || 'default'}
                        size="large"
                      />
                      </MDBox>
                      <MDBox mb={2}>
                        <MDTypography variant="body2" color="text">
                          <strong>Volatilité:</strong> {marketTide.volatility}
                        </MDTypography>
                      </MDBox>
                      {marketTide.sectors && (
                        <MDBox>
                          <MDTypography variant="body2" color="text" mb={1}>
                            <strong>Secteurs les plus forts:</strong> {marketTide.sectors.strongest?.join(', ') || 'N/A'}
                          </MDTypography>
                          <MDTypography variant="body2" color="text">
                            <strong>Secteurs les plus faibles:</strong> {marketTide.sectors.weakest?.join(', ') || 'N/A'}
                          </MDTypography>
                        </MDBox>
                      )}
                    </Grid>
                  </Grid>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Sector Rotati^on */}
        {sectorRotation && !loading && currentTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={3}>
                    Sector Rotation
                  </MDTypography>
                  <MDBox mb={3}>
                    <MDBox display="flex" alignItems="center" mb={2}>
                      <MDTypography variant="body2" color="text" mr={2}>
                        Rotation Actuelle:
                      </MDTypography>
                      <Chip
                        label={sectorRotation.currentRotation?.replace('_', ' ') || 'N/A'}
                        color={getRotationColor(sectorRotation.currentRotation) || 'default'}
                        size="medium"
                      />
                      {sectorRotation.predictedRotation && (
                        <>
                          <MDTypography variant="body2" color="text" mx={2}>
                            →
                          </MDTypography>
                          <Chip
                            label={sectorRotation.predictedRotation?.replace('_', ' ') || 'N/A'}
                            color="info"
                            size="medium"
                            variant="outlined"
                          />
                        </>
                      )}
                    </MDBox>
                  </MDBox>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <SectorChart
                        title="Performance par Secteur"
                        sectors={sectorRotation.sectors}
                        type="performance"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <SectorChart
                        title="Tide par Secteur"
                        sectors={sectorRotation.sectors}
                        type="tide"
                      />
                    </Grid>
                  </Grid>
                  <MDBox mt={3}>
                    <DataTable
                      table={{
                        columns: sectorColumns,
                        rows: sectorTableData,
                      }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                    />
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>

            {/* Recommendations */}
            {sectorRotation.recommendations && sectorRotation.recommendations.length > 0 && (
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Recommandations
                    </MDTypography>
                    {sectorRotation.recommendations.map((rec, index) => (
                      <Alert
                        key={index}
                        severity={
                          rec.action === 'BUY' ? 'success' :
                          rec.action === 'SELL' ? 'error' :
                          rec.action === 'AVOID' ? 'warning' : 'info'
                        }
                        sx={{ mb: 2 }}
                      >
                        <MDTypography variant="body2" fontWeight="medium">
                          {rec.sector} - {rec.action}
                        </MDTypography>
                        <MDTypography variant="body2" color="text">
                          {rec.reasoning}
                        </MDTypography>
                        {rec.timeframe && (
                          <MDTypography variant="body2" color="text" sx={{ mt: 1 }}>
                            <strong>Timeframe:</strong> {rec.timeframe}
                          </MDTypography>
                        )}
                      </Alert>
                    ))}
                  </MDBox>
                </Card>
              </Grid>
            )}
          </Grid>
        )}

        {/* Refresh Button */}
        {!loading && (
          <MDBox mt={3} display="flex" justifyContent="flex-end">
            <MDButton
              variant="gradient"
              color="info"
              onClick={() => {
                setLoading(true);
                const loadData = async () => {
                  try {
                    setError(null);
                    const [rotationResponse, tideResponse] = await Promise.all([
                      intelligenceClient.getSectorRotation(),
                      intelligenceClient.getMarketTide(),
                    ]);

                    if (rotationResponse.success && rotationResponse.data) {
                      setSectorRotation(rotationResponse.data);
                    }

                    if (tideResponse.success && tideResponse.data) {
                      setMarketTide(tideResponse.data);
                    }
                  } catch (err) {
                    console.error("Error refreshing data:", err);
                    setError(err.message || "Erreur lors du rafraîchissement");
                  } finally {
                    setLoading(false);
                  }
                };
                loadData();
              }}
            >
              <Icon>refresh</Icon>&nbsp;Rafraîchir
            </MDButton>
          </MDBox>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default withAuth(MarketIntelligence);

