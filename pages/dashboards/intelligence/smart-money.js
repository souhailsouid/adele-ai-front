/**
 * Smart Money - Top hedge funds et copy trades
 * 
 * Affiche :
 * - Top hedge funds par performance
 * - Copy trades d'institutions pour des tickers
 */

import { useState, useEffect, useCallback } from "react";
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
import MDInput from "/components/MDInput";
import Autocomplete from "@mui/material/Autocomplete";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import DataTable from "/examples/Tables/DataTable";
import { formatCurrency, formatPercentage, formatDate } from "/utils/formatting";
import intelligenceClient from "/lib/api/intelligenceClient";
import { useRouter } from "next/router";
import { useAuth } from "/hooks/useAuth";
import withAuth from "/hocs/withAuth";

function SmartMoney() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [topFunds, setTopFunds] = useState([]);
  const [copyTrades, setCopyTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [period, setPeriod] = useState('3M');
  const [institution, setInstitution] = useState('');
  const [ticker, setTicker] = useState('');

  // Charger les top funds
  const loadTopFunds = useCallback(async (selectedPeriod = period) => {
    try {
      setLoading(true);
      setError(null);
      const response = await intelligenceClient.getTopHedgeFunds(selectedPeriod);
      
      if (response.success && response.data) {
        setTopFunds(response.data.funds || []);
      } else {
        throw new Error(response.error || "Erreur lors du chargement");
      }
    } catch (err) {
      console.error("Error loading top funds:", err);
      setError(err.message || "Erreur lors du chargement des hedge funds");
    } finally {
      setLoading(false);
    }
  }, [period]);

  // Charger les copy trades
  const loadCopyTrades = useCallback(async (inst, tick) => {
    if (!inst || !tick) return;

    try {
      setLoading(true);
      setError(null);
      const response = await intelligenceClient.getCopyTrades(inst, tick);
      
      if (response.success && response.data) {
        setCopyTrades(response.data.trades || []);
      } else {
        throw new Error(response.error || "Erreur lors du chargement");
      }
    } catch (err) {
      console.error("Error loading copy trades:", err);
      setError(err.message || "Erreur lors du chargement des copy trades");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated() && currentTab === 0) {
      loadTopFunds();
    }
  }, [isAuthenticated, currentTab, loadTopFunds]);

  // Colonnes pour le tableau des funds
  const fundsColumns = [
    { Header: "Nom", accessor: "name", width: "30%" },
    { Header: "Performance", accessor: "performance", width: "20%" },
    { Header: "Valeur Totale", accessor: "totalValue", width: "20%" },
    { Header: "Holdings", accessor: "holdingsCount", width: "15%" },
  ];

  const fundsTableData = topFunds.map((fund) => ({
    name: fund.name,
    performance: (
      <MDTypography
        variant="body2"
        color={fund.performance > 0 ? 'success' : 'error'}
        fontWeight="medium"
      >
        {formatPercentage(fund.performance)}
      </MDTypography>
    ),
    totalValue: fund.totalValue ? formatCurrency(fund.totalValue) : 'N/A',
    holdingsCount: fund.holdingsCount || 0,
  }));

  // Colonnes pour le tableau des copy trades
  const tradesColumns = [
    { Header: "Ticker", accessor: "ticker", width: "15%" },
    { Header: "Type", accessor: "tradeType", width: "15%" },
    { Header: "Shares", accessor: "shares", width: "15%" },
    { Header: "Valeur", accessor: "value", width: "20%" },
    { Header: "Date", accessor: "date", width: "15%" },
    { Header: "Recommandation", accessor: "recommendation", width: "20%" },
  ];

  const tradesTableData = copyTrades.map((trade) => ({
    ticker: trade.ticker,
    tradeType: (
      <Chip
        label={trade.tradeType}
        color={trade.tradeType === 'BUY' ? 'success' : trade.tradeType === 'SELL' ? 'error' : 'default'}
        size="small"
      />
    ),
    shares: trade.shares?.toLocaleString() || 'N/A',
    value: formatCurrency(trade.value),
    date: formatDate(new Date(trade.date)),
    recommendation: (
      <Chip
        label={trade.recommendation}
        color={trade.recommendation === 'FOLLOW' ? 'success' : trade.recommendation === 'AVOID' ? 'error' : 'warning'}
        size="small"
      />
    ),
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold">
            Smart Money
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Top hedge funds et copy trades des meilleurs gestionnaires
          </MDTypography>
        </MDBox>

        {/* Tabs */}
        <Card sx={{ mb: 3 }}>
          <MDBox p={2}>
            <Tabs
              value={currentTab}
              onChange={(e, newValue) => setCurrentTab(newValue)}
            >
              <Tab label="Top Hedge Funds" />
              <Tab label="Copy Trades" />
            </Tabs>
          </MDBox>
        </Card>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Top Hedge Funds */}
        {currentTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <MDTypography variant="h6" fontWeight="medium">
                      Top Hedge Funds
                    </MDTypography>
                    <MDBox>
                      {['1M', '3M', '6M', '1Y'].map((p) => (
                        <MDButton
                          key={p}
                          size="small"
                          variant={period === p ? 'gradient' : 'outlined'}
                          color={period === p ? 'info' : 'text'}
                          onClick={() => {
                            setPeriod(p);
                            loadTopFunds(p);
                          }}
                          sx={{ ml: 1 }}
                        >
                          {p}
                        </MDButton>
                      ))}
                    </MDBox>
                  </MDBox>
                  {loading ? (
                    <Skeleton variant="rectangular" height={200} />
                  ) : (
                    <DataTable
                      table={{
                        columns: fundsColumns,
                        rows: fundsTableData,
                      }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                    />
                  )}
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Copy Trades */}
        {currentTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={{ mb: 3 }}>
                <MDBox p={3}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={5}>
                      <MDInput
                        fullWidth
                        label="Institution (nom ou CIK)"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="Ex: Berkshire Hathaway ou 0001697748"
                      />
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <MDInput
                        fullWidth
                        label="Ticker"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value.toUpperCase())}
                        placeholder="Ex: AAPL, TSLA..."
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <MDButton
                        variant="gradient"
                        color="info"
                        fullWidth
                        onClick={() => loadCopyTrades(institution, ticker)}
                        disabled={!institution.trim() || !ticker.trim() || loading}
                      >
                        Rechercher
                      </MDButton>
                    </Grid>
                  </Grid>
                </MDBox>
              </Card>
            </Grid>

            {copyTrades.length > 0 && (
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Copy Trades
                    </MDTypography>
                    <DataTable
                      table={{
                        columns: tradesColumns,
                        rows: tradesTableData,
                      }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                    />
                  </MDBox>
                </Card>
              </Grid>
            )}

            {!loading && copyTrades.length === 0 && institution && ticker && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Aucun copy trade trouvé. Essayez avec un CIK si le nom ne fonctionne pas.
                  <br />
                  Exemples de CIK: Berkshire Hathaway: 0001697748, BlackRock: 0001364742
                </Alert>
              </Grid>
            )}
          </Grid>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default withAuth(SmartMoney);



