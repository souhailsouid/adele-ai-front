/**
 * Opportunities Scanner - Scanner d'opportunités Aladdin
 * Trouve des setups intéressants selon différentes stratégies
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
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import MDButton from "/components/MDButton";
import DataTable from "/examples/Tables/DataTable";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import { formatPercentage } from "/utils/formatting";
import withAuth from "/hocs/withAuth";

function OpportunitiesScanner() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [strategy, setStrategy] = useState("all");
  const [limit, setLimit] = useState(20);

  const strategies = [
    { value: "all", label: "Toutes les Opportunités" },
    { value: "squeeze", label: "Squeeze / Momentum" },
    { value: "smart_money", label: "Smart Money Accumulation" },
    { value: "congress", label: "Congress Alignment" },
  ];

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/aladdin/opportunities?strategy=${strategy}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      setOpportunities(result.data || []);
    } catch (err) {
      console.error("Error loading opportunities:", err);
      setError(err.message || "Erreur lors du chargement des opportunités");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Ne pas charger automatiquement au montage pour éviter les appels API inutiles
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            🔍 Opportunities Scanner - Aladdin
          </MDTypography>
          <MDTypography variant="body2" color="text.secondary">
            Scanner d&apos;opportunités basé sur les signaux Unusual Whales + FMP
          </MDTypography>
        </MDBox>

        {/* Contrôles */}
        <Card sx={{ mb: 3 }}>
          <MDBox p={3}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <FormControl variant="standard" fullWidth>
                  <InputLabel>Stratégie</InputLabel>
                  <Select
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value)}
                    label="Stratégie"
                  >
                    {strategies.map((s) => (
                      <MenuItem key={s.value} value={s.value}>
                        {s.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl variant="standard" fullWidth>
                  <InputLabel>Limite</InputLabel>
                  <Select
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    label="Limite"
                  >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <MDButton
                  variant="gradient"
                  color="info"
                  onClick={loadOpportunities}
                  disabled={loading}
                  fullWidth
                >
                  <Icon>search</Icon>&nbsp;Scanner
                </MDButton>
              </Grid>
            </Grid>
          </MDBox>
        </Card>

        {/* Message d'erreur */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Résultats */}
        {loading ? (
          <LinearProgress />
        ) : opportunities.length > 0 ? (
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Opportunités Trouvées ({opportunities.length})
              </MDTypography>
              <DataTable
                table={{
                  columns: [
                    {
                      Header: "Ticker",
                      accessor: "symbol",
                      width: "10%",
                      Cell: ({ value }) => (
                        <MDTypography variant="body2" fontWeight="bold" color="text">
                          {value}
                        </MDTypography>
                      ),
                    },
                    {
                      Header: "Score",
                      accessor: "recommendation.composite_score",
                      width: "10%",
                      Cell: ({ value }) => {
                        const score = parseFloat(value) || 0;
                        const color = score > 0.4 ? "success" : score < -0.4 ? "error" : "warning";
                        return (
                          <Chip
                            label={formatPercentage(score)}
                            size="small"
                            color={color}
                            variant="filled"
                          />
                        );
                      },
                    },
                    {
                      Header: "Décision",
                      accessor: "recommendation.decision",
                      width: "12%",
                      Cell: ({ value }) => {
                        const colorMap = {
                          "RENFORCER": "success",
                          "SURVEILLER": "warning",
                          "ALLÉGER": "error",
                        };
                        return (
                          <Chip
                            label={value || "N/A"}
                            size="small"
                            color={colorMap[value] || "default"}
                          />
                        );
                      },
                    },
                    {
                      Header: "Options Flow",
                      accessor: "features.options_unusual_score",
                      width: "10%",
                      Cell: ({ value }) => (
                        <MDTypography variant="body2" color="info" fontWeight="medium">
                          {formatPercentage(value || 0)}
                        </MDTypography>
                      ),
                    },
                    {
                      Header: "Smart Money",
                      accessor: "features.smart_money_score",
                      width: "10%",
                      Cell: ({ value }) => (
                        <MDTypography variant="body2" color="info" fontWeight="medium">
                          {formatPercentage(value || 0)}
                        </MDTypography>
                      ),
                    },
                    {
                      Header: "Insiders",
                      accessor: "features.insider_score",
                      width: "10%",
                      Cell: ({ value }) => {
                        const score = parseFloat(value) || 0;
                        const color = score > 0 ? "success" : score < 0 ? "error" : "text";
                        return (
                          <MDTypography variant="body2" color={color} fontWeight="medium">
                            {formatPercentage(score)}
                          </MDTypography>
                        );
                      },
                    },
                    {
                      Header: "Congress",
                      accessor: "features.congress_buy_score",
                      width: "10%",
                      Cell: ({ value }) => (
                        <MDTypography variant="body2" color="info" fontWeight="medium">
                          {formatPercentage(value || 0)}
                        </MDTypography>
                      ),
                    },
                    {
                      Header: "Momentum",
                      accessor: "features.momentum_score",
                      width: "10%",
                      Cell: ({ value }) => {
                        const score = parseFloat(value) || 0;
                        const color = score > 0 ? "success" : score < 0 ? "error" : "text";
                        return (
                          <MDTypography variant="body2" color={color} fontWeight="medium">
                            {formatPercentage(score)}
                          </MDTypography>
                        );
                      },
                    },
                    {
                      Header: "Risque",
                      accessor: "recommendation.risk_level",
                      width: "10%",
                      Cell: ({ value }) => {
                        const colorMap = {
                          "LOW": "success",
                          "MEDIUM": "warning",
                          "HIGH": "error",
                        };
                        return (
                          <Chip
                            label={value || "N/A"}
                            size="small"
                            color={colorMap[value] || "default"}
                            variant="outlined"
                          />
                        );
                      },
                    },
                  ],
                  rows: opportunities,
                }}
                canSearch={true}
                entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
                showTotalEntries={true}
                pagination={{ variant: "gradient", color: "dark" }}
                isSorted={true}
                noEndBorder={false}
              />
            </MDBox>
          </Card>
        ) : (
          <Card>
            <MDBox p={3} textAlign="center">
              <MDTypography variant="body2" color="text.secondary">
                Sélectionnez une stratégie et cliquez sur &quot;Scanner&quot; pour trouver des opportunités
              </MDTypography>
            </MDBox>
          </Card>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default withAuth(OpportunitiesScanner);

