/**
 * Trading Dashboard - Crypto Whales Tracker
 * Suivi des baleines (gros détenteurs) de tokens crypto
 */

import { useState, useEffect, useMemo } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import LinearProgress from "@mui/material/LinearProgress";
import MDInput from "/components/MDInput";
import MDButton from "/components/MDButton";
import Card from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Autocomplete from "@mui/material/Autocomplete";
import Tooltip from "@mui/material/Tooltip";
import { useRouter } from "next/router";

// Composants Creative Tim
import DataTable from "/examples/Tables/DataTable";
import MiniStatisticsCard from "/examples/Cards/StatisticsCards/MiniStatisticsCard";

// Services
import moralisClient from "/lib/moralis/client";
import metricsService from "/services/metricsService";
import {
  CRYPTO_WHALES,
  getETHWhales,
  getWhalesByType,
  getWhalesByChain,
  searchWhale,
} from "/config/cryptoWhales";

// Formatage
const formatCurrency = (value) => {
  if (value === null || value === undefined) return "N/A";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(value);
};

const formatNumber = (value) => {
  if (value === null || value === undefined) return "N/A";
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }).format(value);
};

const formatPercent = (value) => {
  if (value === null || value === undefined) return "N/A";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
};

function CryptoWhalesTracker() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0); // 0 = Recherche Token, 1 = Baleines Suivies, 2 = Top 100 BTC, 3 = Top 100 ETH
  const [tokenAddress, setTokenAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [holdersData, setHoldersData] = useState(null);
  const [selectedChain, setSelectedChain] = useState("0x1");
  const [viewMode, setViewMode] = useState("holders"); // holders, owners, topTraders
  const [limit, setLimit] = useState(50);
  
  // États pour le suivi des baleines
  const [trackedWhales, setTrackedWhales] = useState([]);
  const [whaleLoading, setWhaleLoading] = useState({});
  const [selectedWhaleType, setSelectedWhaleType] = useState("all");
  const [selectedWhaleChain, setSelectedWhaleChain] = useState("all");
  const [whaleSearchQuery, setWhaleSearchQuery] = useState("");
  
  // États pour Top 100 BTC Wallets
  const [btcCategoryTab, setBtcCategoryTab] = useState("Exchange");
  
  // États pour Top 100 ETH Wallets
  const [ethCategoryTab, setEthCategoryTab] = useState("Exchange");
  const [ethViewMode, setEthViewMode] = useState("holders"); // holders ou movements

  const chains = [
    { value: "0x1", label: "Ethereum", icon: "🔷" },
    { value: "0x89", label: "Polygon", icon: "🟣" },
    { value: "0x38", label: "BSC", icon: "🟡" },
    { value: "0xa", label: "Optimism", icon: "🔴" },
    { value: "0xa4b1", label: "Arbitrum", icon: "🔵" },
  ];

  useEffect(() => {
    metricsService.trackFeatureUsage("crypto-whales");
    // Charger les baleines ETH au démarrage
    const ethWhales = getETHWhales();
    setTrackedWhales(ethWhales);
  }, []);

  const handleSearch = async () => {
    const address = tokenAddress.trim();
    if (!address) {
      setError("Veuillez entrer une adresse de token");
      return;
    }

    // Validation basique d'adresse Ethereum
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setError("Adresse de token invalide. Format attendu: 0x...");
      return;
    }

    setError(null);
    await loadHoldersData(address);
  };

  const loadHoldersData = async (address) => {
    try {
      setLoading(true);
      setError(null);

      let data;
      switch (viewMode) {
        case "holders":
          data = await moralisClient.getTokenHolders(address, selectedChain, {
            limit,
          });
          break;
        case "owners":
          data = await moralisClient.getTokenOwners(address, selectedChain, {
            limit,
          });
          break;
        case "topTraders":
          data = await moralisClient.getTopTradersForToken(
            address,
            selectedChain,
            { limit }
          );
          break;
        default:
          data = await moralisClient.getTokenHolders(address, selectedChain, {
            limit,
          });
      }

      // Gérer différents formats de réponse
      const holders = Array.isArray(data)
        ? data
        : data?.result || data?.data || data?.holders || [];

      if (!holders || holders.length === 0) {
        setError("Aucun détenteur trouvé pour ce token");
        setHoldersData(null);
        return;
      }

      setHoldersData({
        tokenAddress: address,
        holders,
        chain: selectedChain,
        viewMode,
      });
    } catch (err) {
      console.error("Error loading holders data:", err);
      setError(
        err.message || "Erreur lors du chargement des données des détenteurs"
      );
      setHoldersData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenAddress && holdersData) {
      loadHoldersData(tokenAddress);
    }
  }, [viewMode, limit]);

  const getEtherscanUrl = (address, chain) => {
    const chainMap = {
      "0x1": "etherscan.io",
      "0x89": "polygonscan.com",
      "0x38": "bscscan.com",
      "0xa": "optimistic.etherscan.io",
      "0xa4b1": "arbiscan.io",
    };
    const domain = chainMap[chain] || "etherscan.io";
    return `https://${domain}/address/${address}`;
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* En-tête */}
        <MDBox mb={4}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h4" fontWeight="bold" mb={1}>
                🐋 Crypto Whales Tracker
              </MDTypography>
              <MDTypography variant="body2" color="text" mb={2}>
                Suivez les baleines (gros détenteurs) de tokens crypto. Identifiez
                les wallets qui détiennent les plus grandes quantités de tokens et
                analysez leur comportement.
              </MDTypography>
              <MDBox display="flex" gap={1} flexWrap="wrap">
                <Chip
                  label="Token Holders"
                  color="primary"
                  size="small"
                  icon={<Icon fontSize="small">people</Icon>}
                />
                <Chip
                  label="Top Traders"
                  color="info"
                  size="small"
                  icon={<Icon fontSize="small">trending_up</Icon>}
                />
                <Chip
                  label="Whale Tracking"
                  color="success"
                  size="small"
                  icon={<Icon fontSize="small">account_balance</Icon>}
                />
              </MDBox>
            </MDBox>
          </Card>
        </MDBox>

        {/* Onglets */}
        <MDBox mb={3}>
          <Card>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ borderBottom: 1, borderColor: "divider" }}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Recherche de Token" icon={<Icon>search</Icon>} iconPosition="start" />
              <Tab label="Baleines Suivies" icon={<Icon>star</Icon>} iconPosition="start" />
              <Tab label="Top 100 BTC Wallets" icon={<Icon>account_balance_wallet</Icon>} iconPosition="start" />
              <Tab label="Top 100 ETH Wallets" icon={<Icon>account_balance</Icon>} iconPosition="start" />
            </Tabs>
          </Card>
        </MDBox>

        {/* Recherche de Token */}
        {activeTab === 0 && (
          <>
        <MDBox mb={3}>
          <Card>
            <MDBox p={2}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <MDInput
                    fullWidth
                    label="Adresse du Token"
                    placeholder="0x..."
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <Icon sx={{ mr: 1, color: "text.secondary" }}>
                          token
                        </Icon>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <MDBox
                    component="select"
                    fullWidth
                    value={selectedChain}
                    onChange={(e) => setSelectedChain(e.target.value)}
                    sx={{
                      padding: "12px 14px",
                      border: "1px solid rgba(0, 0, 0, 0.23)",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                      fontFamily: "inherit",
                      backgroundColor: "transparent",
                      "&:focus": {
                        borderColor: "primary.main",
                        outline: "none",
                      },
                    }}
                  >
                    {chains.map((chain) => (
                      <option key={chain.value} value={chain.value}>
                        {chain.icon} {chain.label}
                      </option>
                    ))}
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={2}>
                  <MDBox
                    component="select"
                    fullWidth
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    sx={{
                      padding: "12px 14px",
                      border: "1px solid rgba(0, 0, 0, 0.23)",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                      fontFamily: "inherit",
                      backgroundColor: "transparent",
                      "&:focus": {
                        borderColor: "primary.main",
                        outline: "none",
                      },
                    }}
                  >
                    <option value="holders">Holders</option>
                    <option value="owners">Owners</option>
                    <option value="topTraders">Top Traders</option>
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={2}>
                  <MDInput
                    fullWidth
                    type="number"
                    label="Limit"
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value) || 50)}
                    inputProps={{ min: 1, max: 100 }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <MDButton
                    variant="gradient"
                    color="dark"
                    onClick={handleSearch}
                    disabled={loading}
                    fullWidth
                  >
                    Rechercher
                  </MDButton>
                </Grid>
              </Grid>
            </MDBox>
          </Card>
        </MDBox>

        {error && (
          <MDBox mb={3}>
            <Alert severity="error">{error}</Alert>
          </MDBox>
        )}

        {loading && (
          <MDBox mb={3}>
            <LinearProgress />
            <MDTypography variant="body2" color="text" mt={1} textAlign="center">
              Chargement des données des baleines...
            </MDTypography>
          </MDBox>
        )}

        {holdersData && holdersData.holders && (
          <>
            {/* Statistiques */}
            <MDBox mb={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <MDBox p={2}>
                      <MDTypography variant="caption" color="text" display="block">
                        Total Détenteurs
                      </MDTypography>
                      <MDTypography variant="h6" fontWeight="bold">
                        {holdersData.holders.length}
                      </MDTypography>
                    </MDBox>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <MDBox p={2}>
                      <MDTypography variant="caption" color="text" display="block">
                        Chaîne
                      </MDTypography>
                      <MDTypography variant="h6" fontWeight="bold">
                        {chains.find((c) => c.value === holdersData.chain)?.label ||
                          "Unknown"}
                      </MDTypography>
                    </MDBox>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <MDBox p={2}>
                      <MDTypography variant="caption" color="text" display="block">
                        Mode
                      </MDTypography>
                      <MDTypography variant="h6" fontWeight="bold" textTransform="capitalize">
                        {holdersData.viewMode === "topTraders"
                          ? "Top Traders"
                          : holdersData.viewMode}
                      </MDTypography>
                    </MDBox>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <MDBox p={2}>
                      <MDTypography variant="caption" color="text" display="block">
                        Token
                      </MDTypography>
                      <MDTypography
                        variant="body2"
                        fontWeight="medium"
                        sx={{
                          wordBreak: "break-all",
                          fontFamily: "monospace",
                        }}
                      >
                        {holdersData.tokenAddress.slice(0, 6)}...
                        {holdersData.tokenAddress.slice(-4)}
                      </MDTypography>
                    </MDBox>
                  </Card>
                </Grid>
              </Grid>
            </MDBox>

            {/* Tableau des détenteurs */}
            <MDBox mb={3}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    🐋 Liste des Baleines
                  </MDTypography>
                  <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <strong>Rang</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Adresse</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>Balance</strong>
                          </TableCell>
                          {viewMode === "topTraders" && (
                            <>
                              <TableCell align="right">
                                <strong>Profit</strong>
                              </TableCell>
                              <TableCell align="right">
                                <strong>ROI</strong>
                              </TableCell>
                            </>
                          )}
                          <TableCell align="center">
                            <strong>Actions</strong>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {holdersData.holders
                          .sort((a, b) => {
                            const balanceA =
                              parseFloat(a.balance || a.value || 0) /
                              Math.pow(10, parseInt(a.decimals || 18));
                            const balanceB =
                              parseFloat(b.balance || b.value || 0) /
                              Math.pow(10, parseInt(b.decimals || 18));
                            return balanceB - balanceA;
                          })
                          .map((holder, index) => {
                            const balance =
                              parseFloat(holder.balance || holder.value || 0) /
                              Math.pow(10, parseInt(holder.decimals || 18));
                            const address =
                              holder.address || holder.owner_of || holder.wallet;

                            return (
                              <TableRow key={index} hover>
                                <TableCell>
                                  <Chip
                                    label={`#${index + 1}`}
                                    color={
                                      index < 10
                                        ? "error"
                                        : index < 50
                                        ? "warning"
                                        : "default"
                                    }
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Box
                                    sx={{
                                      fontFamily: "monospace",
                                      fontSize: "0.875rem",
                                    }}
                                  >
                                    {address
                                      ? `${address.slice(0, 6)}...${address.slice(-4)}`
                                      : "N/A"}
                                  </Box>
                                </TableCell>
                                <TableCell align="right">
                                  <MDTypography variant="body2" fontWeight="medium">
                                    {formatNumber(balance)}
                                  </MDTypography>
                                </TableCell>
                                {viewMode === "topTraders" && (
                                  <>
                                    <TableCell align="right">
                                      <MDTypography
                                        variant="body2"
                                        fontWeight="medium"
                                        color={
                                          (holder.profit || 0) >= 0
                                            ? "success.main"
                                            : "error.main"
                                        }
                                      >
                                        {formatCurrency(holder.profit || 0)}
                                      </MDTypography>
                                    </TableCell>
                                    <TableCell align="right">
                                      <MDTypography
                                        variant="body2"
                                        fontWeight="medium"
                                        color={
                                          (holder.roi || 0) >= 0
                                            ? "success.main"
                                            : "error.main"
                                        }
                                      >
                                        {formatPercent(holder.roi || 0)}
                                      </MDTypography>
                                    </TableCell>
                                  </>
                                )}
                                <TableCell align="center">
                                  {address && (
                                    <Link
                                      href={getEtherscanUrl(
                                        address,
                                        holdersData.chain
                                      )}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      <MDButton
                                        variant="outlined"
                                        size="small"
                                        color="info"
                                      >
                                        <Icon fontSize="small" sx={{ mr: 0.5 }}>
                                          open_in_new
                                        </Icon>
                                        Explorer
                                      </MDButton>
                                    </Link>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </MDBox>
              </Card>
            </MDBox>
          </>
        )}

        {!holdersData && !loading && (
          <MDBox>
            <Card>
              <MDBox p={3} textAlign="center">
                <Icon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}>
                  account_balance
                </Icon>
                <MDTypography variant="h6" fontWeight="medium" mb={1}>
                  Suivre les Baleines Crypto
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  Entrez une adresse de token pour voir les plus gros détenteurs
                  (baleines)
                </MDTypography>
              </MDBox>
            </Card>
          </MDBox>
        )}
          </>
        )}

        {/* Baleines Suivies */}
        {activeTab === 1 && (
          <>
            {/* Filtres */}
            <MDBox mb={3}>
              <Card>
                <MDBox p={2}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <Autocomplete
                        freeSolo
                        options={CRYPTO_WHALES.whales.map((whale) => whale.name)}
                        value={whaleSearchQuery}
                        onInputChange={(event, newValue) => {
                          setWhaleSearchQuery(newValue || "");
                        }}
                        renderInput={(params) => (
                          <MDInput
                            {...params}
                            label="Rechercher une baleine"
                            placeholder="Nom, adresse, type..."
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <Icon sx={{ mr: 1, color: "text.secondary" }}>
                                  search
                                </Icon>
                              ),
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <MDBox
                        component="select"
                        fullWidth
                        value={selectedWhaleType}
                        onChange={(e) => setSelectedWhaleType(e.target.value)}
                        sx={{
                          padding: "12px 14px",
                          border: "1px solid rgba(0, 0, 0, 0.23)",
                          borderRadius: "4px",
                          fontSize: "0.875rem",
                          fontFamily: "inherit",
                          backgroundColor: "transparent",
                          "&:focus": {
                            borderColor: "primary.main",
                            outline: "none",
                          },
                        }}
                      >
                        <option value="all">Tous les types</option>
                        <option value="Government">Government</option>
                        <option value="Institution">Institution</option>
                        <option value="Exchange">Exchange</option>
                        <option value="Foundation">Foundation</option>
                        <option value="DAO">DAO</option>
                        <option value="Founder">Founder</option>
                        <option value="Venture Fund">Venture Fund</option>
                        <option value="Trader">Trader</option>
                        <option value="Mining">Mining</option>
                        <option value="Early Miner">Early Miner</option>
                        <option value="Stablecoin">Stablecoin</option>
                        <option value="MEV Bot">MEV Bot</option>
                        <option value="MEV">MEV</option>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <MDBox
                        component="select"
                        fullWidth
                        value={selectedWhaleChain}
                        onChange={(e) => setSelectedWhaleChain(e.target.value)}
                        sx={{
                          padding: "12px 14px",
                          border: "1px solid rgba(0, 0, 0, 0.23)",
                          borderRadius: "4px",
                          fontSize: "0.875rem",
                          fontFamily: "inherit",
                          backgroundColor: "transparent",
                          "&:focus": {
                            borderColor: "primary.main",
                            outline: "none",
                          },
                        }}
                      >
                        <option value="all">Toutes les chaînes</option>
                        <option value="ETH">Ethereum</option>
                        <option value="BTC">Bitcoin</option>
                        <option value="SOL">Solana</option>
                        <option value="TRX">TRON</option>
                      </MDBox>
                    </Grid>
                  </Grid>
                </MDBox>
              </Card>
            </MDBox>

            {/* Liste des baleines */}
            <MDBox mb={3}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    🐋 Baleines Suivies ({trackedWhales.length})
                  </MDTypography>
                  <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Nom</strong></TableCell>
                          <TableCell><strong>Type</strong></TableCell>
                          <TableCell><strong>Chaîne</strong></TableCell>
                          <TableCell><strong>Adresse</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                          <TableCell align="center"><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {trackedWhales
                          .filter((whale) => {
                            if (selectedWhaleType !== "all" && whale.type !== selectedWhaleType) return false;
                            if (selectedWhaleChain !== "all" && whale.chain !== selectedWhaleChain) return false;
                            if (whaleSearchQuery) {
                              const query = whaleSearchQuery.toLowerCase();
                              return (
                                whale.name.toLowerCase().includes(query) ||
                                whale.address.toLowerCase().includes(query) ||
                                whale.type.toLowerCase().includes(query)
                              );
                            }
                            return true;
                          })
                          .map((whale, index) => (
                            <TableRow key={index} hover>
                              <TableCell>
                                <MDTypography variant="body2" fontWeight="medium">
                                  {whale.name}
                                </MDTypography>
                                {whale.notes && (
                                  <MDTypography variant="caption" color="text">
                                    {whale.notes}
                                  </MDTypography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={whale.type}
                                  size="small"
                                  color={
                                    whale.type === "Government" ? "error" :
                                    whale.type === "Exchange" ? "warning" :
                                    whale.type === "Foundation" ? "info" :
                                    whale.type === "Founder" ? "primary" :
                                    "default"
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={whale.chain}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}>
                                  {whale.incomplete ? (
                                    <Tooltip title="Adresse incomplète - À compléter">
                                      <span style={{ color: "orange" }}>
                                        {whale.address}...
                                      </span>
                                    </Tooltip>
                                  ) : (
                                    whale.address.length > 20
                                      ? `${whale.address.slice(0, 10)}...${whale.address.slice(-8)}`
                                      : whale.address
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                {whale.incomplete ? (
                                  <Chip label="Incomplet" color="warning" size="small" />
                                ) : whale.chain === "ETH" ? (
                                  <Chip label="Suivi" color="success" size="small" />
                                ) : (
                                  <Chip label="Non supporté" color="default" size="small" />
                                )}
                              </TableCell>
                              <TableCell align="center">
                                <MDBox display="flex" gap={1} justifyContent="center">
                                  {!whale.incomplete && whale.chain === "ETH" && (
                                    <>
                                      <MDButton
                                        variant="outlined"
                                        size="small"
                                        color="info"
                                        onClick={() => {
                                          router.push(`/dashboards/trading/wallet-details?address=${whale.address}`);
                                        }}
                                      >
                                        <Icon fontSize="small" sx={{ mr: 0.5 }}>
                                          account_balance_wallet
                                        </Icon>
                                        Détails
                                      </MDButton>
                                      <Link
                                        href={getEtherscanUrl(whale.address, "0x1")}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        <MDButton variant="outlined" size="small" color="secondary">
                                          <Icon fontSize="small" sx={{ mr: 0.5 }}>
                                            open_in_new
                                          </Icon>
                                          Etherscan
                                        </MDButton>
                                      </Link>
                                    </>
                                  )}
                                  {whale.chain === "BTC" && !whale.incomplete && (
                                    <Link
                                      href={`https://www.blockchain.com/explorer/addresses/btc/${whale.address}`}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      <MDButton variant="outlined" size="small" color="secondary">
                                        <Icon fontSize="small" sx={{ mr: 0.5 }}>
                                          open_in_new
                                        </Icon>
                                        Blockchain.com
                                      </MDButton>
                                    </Link>
                                  )}
                                </MDBox>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </MDBox>
              </Card>
            </MDBox>
          </>
        )}

        {/* Top 100 BTC Wallets par Catégorie */}
        {activeTab === 2 && (
          <>
            {/* En-tête */}
            <MDBox mb={3}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h4" fontWeight="bold" mb={1}>
                    ₿ Top 100 Bitcoin Wallets
                  </MDTypography>
                  <MDTypography variant="body2" color="text" mb={2}>
                    Liste des wallets Bitcoin les plus importants classés par catégorie (Source: BitInfoCharts Rich List)
                  </MDTypography>
                </MDBox>
              </Card>
            </MDBox>

            {/* Statistiques avec MiniStatisticsCard */}
            <MDBox mb={3}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <MiniStatisticsCard
                    title={{ text: "Total Wallets", fontWeight: "medium" }}
                    count={getWhalesByChain("BTC").filter(w => !w.incomplete).length}
                    percentage={{ color: "primary", text: "" }}
                    icon={{ color: "primary", component: "account_balance_wallet" }}
                    direction="right"
                    bgColor="white"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MiniStatisticsCard
                    title={{ text: "Exchanges", fontWeight: "medium" }}
                    count={getWhalesByChain("BTC").filter(w => !w.incomplete && w.type === "Exchange").length}
                    percentage={{ color: "warning", text: "" }}
                    icon={{ color: "warning", component: "account_balance" }}
                    direction="right"
                    bgColor="white"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MiniStatisticsCard
                    title={{ text: "Gouvernements", fontWeight: "medium" }}
                    count={getWhalesByChain("BTC").filter(w => !w.incomplete && w.type === "Government").length}
                    percentage={{ color: "error", text: "" }}
                    icon={{ color: "error", component: "gavel" }}
                    direction="right"
                    bgColor="white"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MiniStatisticsCard
                    title={{ text: "Mining", fontWeight: "medium" }}
                    count={getWhalesByChain("BTC").filter(w => !w.incomplete && w.type === "Mining").length}
                    percentage={{ color: "success", text: "" }}
                    icon={{ color: "success", component: "memory" }}
                    direction="right"
                    bgColor="white"
                  />
                </Grid>
              </Grid>
            </MDBox>

            {/* Onglets par catégorie */}
            <MDBox mb={3}>
              <Card>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                    value={btcCategoryTab}
                    onChange={(e, newValue) => setBtcCategoryTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    <Tab label="Exchange" value="Exchange" icon={<Icon>account_balance</Icon>} iconPosition="start" />
                    <Tab label="Government" value="Government" icon={<Icon>gavel</Icon>} iconPosition="start" />
                    <Tab label="Mining" value="Mining" icon={<Icon>memory</Icon>} iconPosition="start" />
                    <Tab label="Hack" value="Hack" icon={<Icon>security</Icon>} iconPosition="start" />
                    <Tab label="Stablecoin" value="Stablecoin" icon={<Icon>attach_money</Icon>} iconPosition="start" />
                    <Tab label="Trader" value="Trader" icon={<Icon>trending_up</Icon>} iconPosition="start" />
                    <Tab label="Institution" value="Institution" icon={<Icon>business</Icon>} iconPosition="start" />
                    <Tab label="Tous" value="all" icon={<Icon>list</Icon>} iconPosition="start" />
                  </Tabs>
                </Box>
              </Card>
            </MDBox>

            {/* DataTable avec les wallets BTC */}
            <MDBox mb={3}>
              <Card>
                <MDBox p={3}>
                  {(() => {
                    // Préparer les données pour DataTable
                    let filteredWhales = getWhalesByChain("BTC").filter(
                      whale => !whale.incomplete
                    );
                    
                    if (btcCategoryTab !== "all") {
                      filteredWhales = filteredWhales.filter(
                        whale => whale.type === btcCategoryTab
                      );
                    }
                    
                    // Limiter à 100 et trier par rang
                    filteredWhales = filteredWhales
                      .slice(0, 100)
                      .sort((a, b) => {
                        const getRank = (notes) => {
                          const match = notes?.match(/Rank #(\d+)/);
                          return match ? parseInt(match[1]) : 999;
                        };
                        return getRank(a.notes) - getRank(b.notes);
                      });

                    if (filteredWhales.length === 0) {
                      return (
                        <MDBox textAlign="center" py={6}>
                          <Icon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}>
                            account_balance_wallet
                          </Icon>
                          <MDTypography variant="h6" color="text.secondary" mb={1}>
                            Aucun wallet trouvé
                          </MDTypography>
                          <MDTypography variant="body2" color="text.secondary">
                            Aucun wallet Bitcoin trouvé pour la catégorie &quot;{btcCategoryTab}&quot;
                          </MDTypography>
                        </MDBox>
                      );
                    }

                    const columns = [
                      {
                        Header: "#",
                        accessor: "rank",
                        width: "8%",
                        Cell: ({ value }) => (
                          <Chip
                            label={`#${value}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ),
                      },
                      {
                        Header: "Nom",
                        accessor: "name",
                        width: "25%",
                        Cell: ({ value }) => (
                          <MDTypography variant="body2" fontWeight="medium">
                            {value}
                          </MDTypography>
                        ),
                      },
                      {
                        Header: "Adresse",
                        accessor: "address",
                        width: "30%",
                        Cell: ({ value }) => (
                          <Tooltip title={value}>
                            <MDTypography
                              variant="caption"
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "0.75rem",
                                wordBreak: "break-all",
                              }}
                            >
                              {value}
                            </MDTypography>
                          </Tooltip>
                        ),
                      },
                      {
                        Header: "Type",
                        accessor: "type",
                        width: "12%",
                        Cell: ({ value }) => (
                          <Chip
                            label={value}
                            size="small"
                            color={
                              value === "Government"
                                ? "error"
                                : value === "Exchange"
                                ? "warning"
                                : value === "Institution"
                                ? "info"
                                : value === "Mining"
                                ? "success"
                                : value === "Hack"
                                ? "error"
                                : "default"
                            }
                          />
                        ),
                      },
                      {
                        Header: "Notes",
                        accessor: "notes",
                        width: "20%",
                        Cell: ({ value }) => (
                          <Tooltip title={value || ""}>
                            <MDTypography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {value || "N/A"}
                            </MDTypography>
                          </Tooltip>
                        ),
                      },
                      {
                        Header: "Actions",
                        accessor: "actions",
                        width: "15%",
                        align: "center",
                        Cell: ({ row }) => (
                          <MDBox display="flex" gap={1} justifyContent="center">
                            <MDButton
                              variant="outlined"
                              size="small"
                              color="info"
                              onClick={() => {
                                router.push(
                                  `/dashboards/trading/wallet-details?address=${row.original.address}`
                                );
                              }}
                            >
                              <Icon fontSize="small" sx={{ mr: 0.5 }}>
                                account_balance_wallet
                              </Icon>
                              Détails
                            </MDButton>
                            <Link
                              href={`https://www.blockchain.com/explorer/addresses/btc/${row.original.address}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <MDButton variant="outlined" size="small" color="secondary">
                                <Icon fontSize="small" sx={{ mr: 0.5 }}>
                                  open_in_new
                                </Icon>
                                Explorer
                              </MDButton>
                            </Link>
                          </MDBox>
                        ),
                      },
                    ];

                    const rows = filteredWhales.map((whale, index) => {
                      const rankMatch = whale.notes?.match(/Rank #(\d+)/);
                      const rank = rankMatch ? rankMatch[1] : index + 1;

                      return {
                        rank: rank,
                        name: whale.name,
                        address: whale.address,
                        type: whale.type,
                        notes: whale.notes || "N/A",
                        actions: whale.address,
                      };
                    });

                    const btcWalletsTableData = { columns, rows };

                    return (
                      <DataTable
                        table={btcWalletsTableData}
                        canSearch={true}
                        entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50, 100] }}
                        showTotalEntries={true}
                        pagination={{ variant: "gradient", color: "dark" }}
                        isSorted={true}
                        noEndBorder={false}
                      />
                    );
                  })()}
                </MDBox>
              </Card>
            </MDBox>
          </>
        )}

        {/* Top 100 ETH Wallets par Catégorie */}
        {activeTab === 3 && (
          <>
            {/* En-tête */}
            <MDBox mb={3}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h4" fontWeight="bold" mb={1}>
                    🔷 Top 100 Ethereum Wallets
                  </MDTypography>
                  <MDTypography variant="body2" color="text" mb={2}>
                    Liste des wallets Ethereum les plus importants classés par catégorie (Source: OKLink Rich List)
                  </MDTypography>
                </MDBox>
              </Card>
            </MDBox>

            {/* Statistiques avec MiniStatisticsCard */}
            <MDBox mb={3}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <MiniStatisticsCard
                    title={{ text: "Total Wallets", fontWeight: "medium" }}
                    count={getETHWhales().length}
                    percentage={{ color: "primary", text: "" }}
                    icon={{ color: "primary", component: "account_balance" }}
                    direction="right"
                    bgColor="white"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MiniStatisticsCard
                    title={{ text: "Exchanges", fontWeight: "medium" }}
                    count={getETHWhales().filter(w => w.type === "Exchange").length}
                    percentage={{ color: "warning", text: "" }}
                    icon={{ color: "warning", component: "account_balance" }}
                    direction="right"
                    bgColor="white"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MiniStatisticsCard
                    title={{ text: "Founders", fontWeight: "medium" }}
                    count={getETHWhales().filter(w => w.type === "Founder").length}
                    percentage={{ color: "info", text: "" }}
                    icon={{ color: "info", component: "person" }}
                    direction="right"
                    bgColor="white"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MiniStatisticsCard
                    title={{ text: "Institutions", fontWeight: "medium" }}
                    count={getETHWhales().filter(w => w.type === "Institution" || w.type === "Venture Fund").length}
                    percentage={{ color: "success", text: "" }}
                    icon={{ color: "success", component: "business" }}
                    direction="right"
                    bgColor="white"
                  />
                </Grid>
              </Grid>
            </MDBox>

            {/* Mode d'affichage et Onglets par catégorie */}
            <MDBox mb={3}>
              <Card>
                <MDBox p={2}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <MDTypography variant="h6" fontWeight="medium">
                      Mode d&apos;affichage
                    </MDTypography>
                    <MDBox display="flex" gap={1}>
                      <MDButton
                        variant={ethViewMode === "holders" ? "gradient" : "outlined"}
                        color={ethViewMode === "holders" ? "info" : "secondary"}
                        size="small"
                        onClick={() => setEthViewMode("holders")}
                      >
                        <Icon fontSize="small" sx={{ mr: 0.5 }}>
                          list
                        </Icon>
                        Meilleurs Holders
                      </MDButton>
                      <MDButton
                        variant={ethViewMode === "movements" ? "gradient" : "outlined"}
                        color={ethViewMode === "movements" ? "info" : "secondary"}
                        size="small"
                        onClick={() => setEthViewMode("movements")}
                      >
                        <Icon fontSize="small" sx={{ mr: 0.5 }}>
                          swap_vert
                        </Icon>
                        Mouvements
                      </MDButton>
                    </MDBox>
                  </MDBox>
                  {ethViewMode === "holders" && (
                    <Box sx={{ borderTop: 1, borderColor: "divider", pt: 2 }}>
                      <Tabs
                        value={ethCategoryTab}
                        onChange={(e, newValue) => setEthCategoryTab(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                      >
                        <Tab label="Exchange" value="Exchange" icon={<Icon>account_balance</Icon>} iconPosition="start" />
                        <Tab label="Founder" value="Founder" icon={<Icon>person</Icon>} iconPosition="start" />
                        <Tab label="Institution" value="Institution" icon={<Icon>business</Icon>} iconPosition="start" />
                        <Tab label="Venture Fund" value="Venture Fund" icon={<Icon>trending_up</Icon>} iconPosition="start" />
                        <Tab label="DAO" value="DAO" icon={<Icon>groups</Icon>} iconPosition="start" />
                        <Tab label="Foundation" value="Foundation" icon={<Icon>corporate_fare</Icon>} iconPosition="start" />
                        <Tab label="Stablecoin" value="Stablecoin" icon={<Icon>attach_money</Icon>} iconPosition="start" />
                        <Tab label="Tous" value="all" icon={<Icon>list</Icon>} iconPosition="start" />
                      </Tabs>
                    </Box>
                  )}
                </MDBox>
              </Card>
            </MDBox>

            {/* DataTable avec les wallets ETH */}
            <MDBox mb={3}>
              <Card>
                <MDBox p={3}>
                  {(() => {
                    if (ethViewMode === "holders") {
                      // Mode: Meilleurs Holders
                      let filteredWhales = getETHWhales();
                      
                      if (ethCategoryTab !== "all") {
                        filteredWhales = filteredWhales.filter(
                          whale => whale.type === ethCategoryTab
                        );
                      }
                      
                      // Limiter à 100
                      filteredWhales = filteredWhales.slice(0, 100);

                      if (filteredWhales.length === 0) {
                        return (
                          <MDBox textAlign="center" py={6}>
                            <Icon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}>
                              account_balance
                            </Icon>
                            <MDTypography variant="h6" color="text.secondary" mb={1}>
                              Aucun wallet trouvé
                            </MDTypography>
                            <MDTypography variant="body2" color="text.secondary">
                              Aucun wallet Ethereum trouvé pour la catégorie &quot;{ethCategoryTab}&quot;
                            </MDTypography>
                          </MDBox>
                        );
                      }

                      const columns = [
                        {
                          Header: "#",
                          accessor: "rank",
                          width: "8%",
                          Cell: ({ value }) => (
                            <Chip
                              label={`#${value}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ),
                        },
                        {
                          Header: "Nom",
                          accessor: "name",
                          width: "25%",
                          Cell: ({ value }) => (
                            <MDTypography variant="body2" fontWeight="medium">
                              {value}
                            </MDTypography>
                          ),
                        },
                        {
                          Header: "Adresse",
                          accessor: "address",
                          width: "30%",
                          Cell: ({ value }) => (
                            <Tooltip title={value}>
                              <MDTypography
                                variant="caption"
                                sx={{
                                  fontFamily: "monospace",
                                  fontSize: "0.75rem",
                                  wordBreak: "break-all",
                                }}
                              >
                                {value}
                              </MDTypography>
                            </Tooltip>
                          ),
                        },
                        {
                          Header: "Type",
                          accessor: "type",
                          width: "12%",
                          Cell: ({ value }) => (
                            <Chip
                              label={value}
                              size="small"
                              color={
                                value === "Government"
                                  ? "error"
                                  : value === "Exchange"
                                  ? "warning"
                                  : value === "Institution" || value === "Venture Fund"
                                  ? "info"
                                  : value === "Founder"
                                  ? "primary"
                                  : value === "DAO" || value === "Foundation"
                                  ? "success"
                                  : "default"
                              }
                            />
                          ),
                        },
                        {
                          Header: "Notes",
                          accessor: "notes",
                          width: "20%",
                          Cell: ({ value }) => (
                            <Tooltip title={value || ""}>
                              <MDTypography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {value || "N/A"}
                              </MDTypography>
                            </Tooltip>
                          ),
                        },
                        {
                          Header: "Actions",
                          accessor: "actions",
                          width: "15%",
                          align: "center",
                          Cell: ({ row }) => (
                            <MDBox display="flex" gap={1} justifyContent="center">
                              <MDButton
                                variant="outlined"
                                size="small"
                                color="info"
                                onClick={() => {
                                  router.push(
                                    `/dashboards/trading/wallet-details?address=${row.original.address}`
                                  );
                                }}
                              >
                                <Icon fontSize="small" sx={{ mr: 0.5 }}>
                                  account_balance_wallet
                                </Icon>
                                Détails
                              </MDButton>
                              <Link
                                href={`https://etherscan.io/address/${row.original.address}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <MDButton variant="outlined" size="small" color="secondary">
                                  <Icon fontSize="small" sx={{ mr: 0.5 }}>
                                    open_in_new
                                  </Icon>
                                  Etherscan
                                </MDButton>
                              </Link>
                            </MDBox>
                          ),
                        },
                      ];

                      const rows = filteredWhales.map((whale, index) => ({
                        rank: index + 1,
                        name: whale.name,
                        address: whale.address,
                        type: whale.type,
                        notes: whale.notes || "N/A",
                        actions: whale.address,
                      }));

                      const ethWalletsTableData = { columns, rows };

                      return (
                        <DataTable
                          table={ethWalletsTableData}
                          canSearch={true}
                          entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50, 100] }}
                          showTotalEntries={true}
                          pagination={{ variant: "gradient", color: "dark" }}
                          isSorted={true}
                          noEndBorder={false}
                        />
                      );
                    } else {
                      // Mode: Mouvements (placeholder pour l'instant)
                      return (
                        <MDBox textAlign="center" py={6}>
                          <Icon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}>
                            swap_vert
                          </Icon>
                          <MDTypography variant="h6" color="text.secondary" mb={1}>
                            Mouvements des Holders
                          </MDTypography>
                          <MDTypography variant="body2" color="text.secondary" mb={3}>
                            Cette fonctionnalité affichera les mouvements récents des top holders Ethereum.
                          </MDTypography>
                          <MDTypography variant="caption" color="text.secondary">
                            Source: OKLink - Mouvements des meilleurs holders
                          </MDTypography>
                        </MDBox>
                      );
                    }
                  })()}
                </MDBox>
              </Card>
            </MDBox>
          </>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default CryptoWhalesTracker;

