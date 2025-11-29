/**
 * Trading Dashboard - Crypto
 * Section crypto avec intégration Moralis
 */

import { useState, useEffect } from "react";
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
import Link from "next/link";
import Image from "next/image";

// Services
import moralisClient from "/lib/moralis/client";
import metricsService from "/services/metricsService";

// Composants
import DefaultLineChart from "/examples/Charts/LineCharts/DefaultLineChart";

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

const formatPercent = (value) => {
  if (value === null || value === undefined) return "N/A";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
};

function TradingCrypto() {
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [selectedChain, setSelectedChain] = useState("0x1"); // Ethereum par défaut

  const chains = [
    { value: "0x1", label: "Ethereum", icon: "🔷" },
    { value: "0x89", label: "Polygon", icon: "🟣" },
    { value: "0x38", label: "BSC", icon: "🟡" },
    { value: "0xa", label: "Optimism", icon: "🔴" },
    { value: "0xa4b1", label: "Arbitrum", icon: "🔵" },
  ];

  useEffect(() => {
    metricsService.trackFeatureUsage("crypto");
  }, []);

  const handleSearch = async () => {
    const address = walletAddress.trim();
    if (!address) {
      setError("Veuillez entrer une adresse de wallet");
      return;
    }

    // Validation basique d'adresse Ethereum
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setError("Adresse de wallet invalide. Format attendu: 0x...");
      return;
    }

    setError(null);
    await loadWalletData(address);
  };

  const loadWalletData = async (address) => {
    try {
      setLoading(true);
      setError(null);

      const data = await moralisClient.getWalletTokenBalancesPrice(
        address,
        selectedChain
      );

      // La réponse de Moralis peut être soit un tableau directement, soit un objet avec result
      const tokens = Array.isArray(data) ? data : (data?.result || data?.data || []);

      if (!tokens || tokens.length === 0) {
        setError("Aucune donnée trouvée pour ce wallet");
        setWalletData(null);
        return;
      }

      setWalletData({
        address,
        tokens,
        chain: selectedChain,
      });
    } catch (err) {
      console.error("Error loading wallet data:", err);
      setError(
        err.message || "Erreur lors du chargement des données du wallet"
      );
      setWalletData(null);
    } finally {
      setLoading(false);
    }
  };

  const totalValue = walletData?.tokens?.reduce((sum, token) => {
    const price = parseFloat(token.usd_price || 0);
    const balance = parseFloat(token.balance || 0);
    const decimals = parseInt(token.decimals || 18);
    const adjustedBalance = balance / Math.pow(10, decimals);
    return sum + price * adjustedBalance;
  }, 0) || 0;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* En-tête avec logo Moralis */}
        <MDBox mb={4}>
          <Card>
            <MDBox p={3}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={3}>
                  <MDBox
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
                    {/* Logo Moralis - SVG inline avec design professionnel */}
                    <Box
                      component="svg"
                      width="140"
                      height="50"
                      viewBox="0 0 200 70"
                      sx={{ display: "block" }}
                    >
                      {/* Logo "M" stylisé */}
                      <path
                        d="M 20 20 L 20 50 L 30 50 L 30 35 L 40 50 L 50 50 L 50 20 L 40 20 L 40 35 L 30 20 Z"
                        fill="#1E88E5"
                      />
                      <path
                        d="M 60 20 L 60 50 L 70 50 L 70 35 L 80 50 L 90 50 L 90 20 L 80 20 L 80 35 L 70 20 Z"
                        fill="#42A5F5"
                      />
                      {/* Texte Moralis */}
                      <text
                        x="100"
                        y="42"
                        fontSize="28"
                        fontWeight="bold"
                        fill="#1E88E5"
                        fontFamily="'Inter', 'Arial', sans-serif"
                        letterSpacing="1"
                      >
                        Moralis
                      </text>
                    </Box>
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={9}>
                  <MDTypography variant="h4" fontWeight="bold" mb={1}>
                    Crypto Dashboard
                  </MDTypography>
                  <MDTypography variant="body2" color="text" mb={2}>
                    Explorez les données blockchain avec l&apos;API Moralis.
                    Obtenez les balances de tokens, les prix en temps réel et
                    bien plus encore.
                  </MDTypography>
                  <MDBox display="flex" gap={1} flexWrap="wrap">
                    <Chip
                      label="Wallet API"
                      color="primary"
                      size="small"
                      icon={<Icon fontSize="small">account_balance_wallet</Icon>}
                    />
                    <Chip
                      label="Token API"
                      color="info"
                      size="small"
                      icon={<Icon fontSize="small">token</Icon>}
                    />
                    <Chip
                      label="Price API"
                      color="success"
                      size="small"
                      icon={<Icon fontSize="small">trending_up</Icon>}
                    />
                    <Chip
                      label="NFT API"
                      color="warning"
                      size="small"
                      icon={<Icon fontSize="small">image</Icon>}
                    />
                  </MDBox>
                </Grid>
              </Grid>
            </MDBox>
          </Card>
        </MDBox>

        {/* Section Quick Start */}
        <MDBox mb={3}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Quick Start
              </MDTypography>
              <MDBox
                sx={{
                  backgroundColor: "rgba(0, 0, 0, 0.02)",
                  borderRadius: 1,
                  p: 2,
                  mb: 2,
                }}
              >
                <MDTypography variant="caption" color="text" display="block" mb={1}>
                  <strong>JavaScript</strong>
                </MDTypography>
                <Box
                  component="pre"
                  sx={{
                    margin: 0,
                    fontSize: "0.875rem",
                    fontFamily: "monospace",
                    overflow: "auto",
                  }}
                >
                  {`import Moralis from 'moralis';

await Moralis.start({
  apiKey: "*** *** ***"
});

const response = await Moralis.EvmApi.wallets
  .getWalletTokenBalancesPrice({
    "chain": "0x1",
    "address": "0xcB1C1FdE09f811B294172696404e88E658659905"
  });

console.log(response.raw);`}
                </Box>
              </MDBox>
              <MDBox display="flex" gap={2} flexWrap="wrap">
                <MDButton
                  component="a"
                  href="https://docs.moralis.io/"
                  target="_blank"
                  rel="noreferrer"
                  variant="outlined"
                  color="primary"
                  size="small"
                >
                  Documentation
                </MDButton>
                <MDButton
                  component="a"
                  href="https://moralis.io/api-reference/"
                  target="_blank"
                  rel="noreferrer"
                  variant="outlined"
                  color="info"
                  size="small"
                >
                  API Reference
                </MDButton>
                <MDButton
                  component="a"
                  href="https://moralis.io/supported-chains/"
                  target="_blank"
                  rel="noreferrer"
                  variant="outlined"
                  color="success"
                  size="small"
                >
                  Supported Chains
                </MDButton>
              </MDBox>
            </MDBox>
          </Card>
        </MDBox>

        {/* Recherche de wallet */}
        <MDBox mb={3}>
          <Card>
            <MDBox p={2}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <MDInput
                    fullWidth
                    label="Adresse du Wallet"
                    placeholder="0x..."
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <Icon sx={{ mr: 1, color: "text.secondary" }}>
                          account_balance_wallet
                        </Icon>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
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
              Chargement des données du wallet...
            </MDTypography>
          </MDBox>
        )}

        {walletData && walletData.tokens && (
          <>
            {/* Statistiques globales */}
            <MDBox mb={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <MDBox p={2}>
                      <MDTypography variant="caption" color="text" display="block">
                        Valeur Totale
                      </MDTypography>
                      <MDTypography variant="h6" fontWeight="bold" color="success.main">
                        {formatCurrency(totalValue)}
                      </MDTypography>
                    </MDBox>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <MDBox p={2}>
                      <MDTypography variant="caption" color="text" display="block">
                        Tokens
                      </MDTypography>
                      <MDTypography variant="h6" fontWeight="bold">
                        {walletData.tokens.length}
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
                        {chains.find((c) => c.value === walletData.chain)?.label ||
                          "Unknown"}
                      </MDTypography>
                    </MDBox>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <MDBox p={2}>
                      <MDTypography variant="caption" color="text" display="block">
                        Adresse
                      </MDTypography>
                      <MDTypography
                        variant="body2"
                        fontWeight="medium"
                        sx={{
                          wordBreak: "break-all",
                          fontFamily: "monospace",
                        }}
                      >
                        {walletData.address.slice(0, 6)}...
                        {walletData.address.slice(-4)}
                      </MDTypography>
                    </MDBox>
                  </Card>
                </Grid>
              </Grid>
            </MDBox>

            {/* Liste des tokens */}
            <MDBox mb={3}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Tokens du Wallet
                  </MDTypography>
                  {walletData.tokens.length === 0 ? (
                    <MDBox textAlign="center" py={4}>
                      <MDTypography variant="body2" color="text">
                        Aucun token trouvé dans ce wallet
                      </MDTypography>
                    </MDBox>
                  ) : (
                    <Grid container spacing={2}>
                      {walletData.tokens
                        .filter((token) => {
                          const price = parseFloat(token.usd_price || 0);
                          const balance = parseFloat(token.balance || 0);
                          const decimals = parseInt(token.decimals || 18);
                          const adjustedBalance = balance / Math.pow(10, decimals);
                          return price * adjustedBalance > 0.01; // Filtrer les tokens avec valeur > $0.01
                        })
                        .sort((a, b) => {
                          const valueA =
                            parseFloat(a.usd_price || 0) *
                            (parseFloat(a.balance || 0) /
                              Math.pow(10, parseInt(a.decimals || 18)));
                          const valueB =
                            parseFloat(b.usd_price || 0) *
                            (parseFloat(b.balance || 0) /
                              Math.pow(10, parseInt(b.decimals || 18)));
                          return valueB - valueA;
                        })
                        .map((token, index) => {
                          const price = parseFloat(token.usd_price || 0);
                          const balance = parseFloat(token.balance || 0);
                          const decimals = parseInt(token.decimals || 18);
                          const adjustedBalance = balance / Math.pow(10, decimals);
                          const value = price * adjustedBalance;

                          return (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                              <Card
                                sx={{
                                  height: "100%",
                                  "&:hover": {
                                    boxShadow: 4,
                                  },
                                }}
                              >
                                <MDBox p={2}>
                                  <MDBox
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    mb={1}
                                  >
                                    <MDTypography variant="h6" fontWeight="bold">
                                      {token.symbol || "Unknown"}
                                    </MDTypography>
                                    {token.logo && (
                                      <Box
                                        component="img"
                                        src={token.logo}
                                        alt={token.symbol}
                                        sx={{
                                          width: 32,
                                          height: 32,
                                          borderRadius: "50%",
                                        }}
                                      />
                                    )}
                                  </MDBox>
                                  <MDTypography
                                    variant="caption"
                                    color="text"
                                    display="block"
                                    mb={1}
                                  >
                                    {token.name || "Token"}
                                  </MDTypography>
                                  <MDBox mb={1}>
                                    <MDTypography variant="body2" color="text">
                                      Balance: {adjustedBalance.toFixed(6)}
                                    </MDTypography>
                                    <MDTypography variant="body2" color="text">
                                      Prix: {formatCurrency(price)}
                                    </MDTypography>
                                  </MDBox>
                                  <MDBox
                                    sx={{
                                      backgroundColor: "success.light",
                                      borderRadius: 1,
                                      p: 1,
                                      textAlign: "center",
                                    }}
                                  >
                                    <MDTypography
                                      variant="h6"
                                      fontWeight="bold"
                                      color="success.dark"
                                    >
                                      {formatCurrency(value)}
                                    </MDTypography>
                                  </MDBox>
                                </MDBox>
                              </Card>
                            </Grid>
                          );
                        })}
                    </Grid>
                  )}
                </MDBox>
              </Card>
            </MDBox>
          </>
        )}

        {!walletData && !loading && (
          <MDBox>
            <Card>
              <MDBox p={3} textAlign="center">
                <Icon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}>
                  account_balance_wallet
                </Icon>
                <MDTypography variant="h6" fontWeight="medium" mb={1}>
                  Explorer un Wallet
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  Entrez une adresse de wallet pour voir ses tokens et leurs
                  valeurs
                </MDTypography>
              </MDBox>
            </Card>
          </MDBox>
        )}

        {/* Section Resources */}
        <MDBox mb={3}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Resources
              </MDTypography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <MDBox
                    component="a"
                    href="https://docs.moralis.io/"
                    target="_blank"
                    rel="noreferrer"
                    sx={{ textDecoration: "none" }}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        cursor: "pointer",
                        "&:hover": { boxShadow: 4 },
                      }}
                    >
                      <MDBox p={2} textAlign="center">
                        <Icon sx={{ fontSize: 40, color: "primary.main", mb: 1 }}>
                          menu_book
                        </Icon>
                        <MDTypography variant="h6" fontWeight="medium">
                          Documentation
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Guides et tutoriels
                        </MDTypography>
                      </MDBox>
                    </Card>
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MDBox
                    component="a"
                    href="https://moralis.io/api-reference/"
                    target="_blank"
                    rel="noreferrer"
                    sx={{ textDecoration: "none" }}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        cursor: "pointer",
                        "&:hover": { boxShadow: 4 },
                      }}
                    >
                      <MDBox p={2} textAlign="center">
                        <Icon sx={{ fontSize: 40, color: "info.main", mb: 1 }}>
                          api
                        </Icon>
                        <MDTypography variant="h6" fontWeight="medium">
                          API Reference
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Référence complète des APIs
                        </MDTypography>
                      </MDBox>
                    </Card>
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MDBox
                    component="a"
                    href="https://moralis.io/supported-chains/"
                    target="_blank"
                    rel="noreferrer"
                    sx={{ textDecoration: "none" }}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        cursor: "pointer",
                        "&:hover": { boxShadow: 4 },
                      }}
                    >
                      <MDBox p={2} textAlign="center">
                        <Icon sx={{ fontSize: 40, color: "success.main", mb: 1 }}>
                          link
                        </Icon>
                        <MDTypography variant="h6" fontWeight="medium">
                          Supported Chains
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Blockchains supportées
                        </MDTypography>
                      </MDBox>
                    </Card>
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MDBox
                    component="a"
                    href="https://moralis.io/"
                    target="_blank"
                    rel="noreferrer"
                    sx={{ textDecoration: "none" }}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        cursor: "pointer",
                        "&:hover": { boxShadow: 4 },
                      }}
                    >
                      <MDBox p={2} textAlign="center">
                        <Icon sx={{ fontSize: 40, color: "warning.main", mb: 1 }}>
                          home
                        </Icon>
                        <MDTypography variant="h6" fontWeight="medium">
                          Platform
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Accéder à la plateforme
                        </MDTypography>
                      </MDBox>
                    </Card>
                  </MDBox>
                </Grid>
              </Grid>
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TradingCrypto;

