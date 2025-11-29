/**
 * Trading Dashboard - Wallet Details (Arkham-like)
 * Vue complète d'un portefeuille avec toutes les données Moralis
 * Utilise les composants Creative Tim (DataTable, MiniStatisticsCard)
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
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Link from "@mui/material/Link";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Autocomplete from "@mui/material/Autocomplete";
import { useRouter } from "next/router";

// Composants Creative Tim
import DataTable from "/examples/Tables/DataTable";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";
import MiniStatisticsCard from "/examples/Cards/StatisticsCards/MiniStatisticsCard";

// Services
import moralisClient from "/lib/moralis/client";
import metricsService from "/services/metricsService";
import { CRYPTO_WHALES, getWhalesByChain } from "/config/cryptoWhales";

// Filtrer les baleines importantes qui font trembler les marchés
const getMarketMovingWhales = () => {
  return CRYPTO_WHALES.whales.filter(whale => {
    // Baleines qui ont un impact significatif sur les marchés
    const importantTypes = [
      "Government",
      "Exchange",
      "Institution",
      "Foundation",
      "DAO",
      "Founder",
      "Venture Fund",
      "Mining",
      "Early Miner"
    ];
    return importantTypes.includes(whale.type) && !whale.incomplete;
  }).sort((a, b) => {
    // Prioriser les Government et Exchange
    const priority = { "Government": 1, "Exchange": 2, "Institution": 3, "Foundation": 4 };
    return (priority[a.type] || 99) - (priority[b.type] || 99);
  });
};

// Obtenir tous les wallets BTC pour l'autocomplete
const getBTCWallets = () => {
  return getWhalesByChain("BTC").filter(whale => !whale.incomplete);
};

// Formatage
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatNumber = (value, decimals = 6) => {
  if (value === null || value === undefined || isNaN(value)) return "0";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
};

const formatPercent = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "0%";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
};

/**
 * Obtenir l'URL du scanner blockchain approprié
 */
const getBlockchainExplorerUrl = (address, chain = "ETH") => {
  const explorers = {
    ETH: {
      name: "Etherscan",
      url: `https://etherscan.io/address/${address}`,
      icon: "🔷",
    },
    BTC: {
      name: "Blockchain.com",
      url: `https://www.blockchain.com/explorer/addresses/btc/${address}`,
      icon: "₿",
    },
    BSC: {
      name: "BSCScan",
      url: `https://bscscan.com/address/${address}`,
      icon: "🟡",
    },
    POLYGON: {
      name: "Polygonscan",
      url: `https://polygonscan.com/address/${address}`,
      icon: "🟣",
    },
    ARBITRUM: {
      name: "Arbiscan",
      url: `https://arbiscan.io/address/${address}`,
      icon: "🔵",
    },
    OPTIMISM: {
      name: "Optimistic Etherscan",
      url: `https://optimistic.etherscan.io/address/${address}`,
      icon: "🔴",
    },
    SOL: {
      name: "Solscan",
      url: `https://solscan.io/account/${address}`,
      icon: "🟢",
    },
    TRX: {
      name: "TRONScan",
      url: `https://tronscan.org/#/address/${address}`,
      icon: "🔶",
    },
  };

  return explorers[chain.toUpperCase()] || explorers.ETH;
};

function WalletDetails() {
  const router = useRouter();
  const { address: queryAddress } = router.query;
  
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedChain, setSelectedChain] = useState("ETH");
  
  // Données du portefeuille
  const [walletData, setWalletData] = useState({
    tokens: [],
    nfts: [],
    netWorth: null,
    defiPositions: [],
    transactions: [],
    swaps: [],
    stats: null,
    activeChains: [],
    profitability: null,
  });

  useEffect(() => {
    if (queryAddress) {
      setWalletAddress(queryAddress);
      handleLoadWallet(queryAddress);
    }
  }, [queryAddress]);

  useEffect(() => {
    metricsService.trackFeatureUsage("wallet-details");
  }, []);

  // Validation d'adresse Bitcoin
  const isValidBTCAddress = (address) => {
    if (!address) return false;
    // Adresses Bitcoin: Legacy (1...), P2SH (3...), Bech32 (bc1...)
    return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) || 
           /^bc1[a-z0-9]{39,59}$/.test(address);
  };

  // Validation d'adresse Ethereum
  const isValidETHAddress = (address) => {
    if (!address) return false;
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleLoadWallet = async (address) => {
    if (!address) {
      setError("Veuillez entrer une adresse de wallet");
      return;
    }

    // Détecter le type d'adresse
    const isBTC = isValidBTCAddress(address);
    const isETH = isValidETHAddress(address);

    if (!isBTC && !isETH) {
      setError("Adresse invalide. Format attendu: 0x... (Ethereum) ou 1/3/bc1... (Bitcoin)");
      return;
    }

    // Si c'est une adresse BTC, on ne peut pas charger via Moralis
    if (isBTC) {
      setError(null);
      setLoading(false);
      // Trouver la baleine correspondante
      const whale = CRYPTO_WHALES.whales.find(
        w => w.address.toLowerCase() === address.toLowerCase() && w.chain === "BTC"
      );
      if (whale) {
        setWalletData({
          tokens: [],
          nfts: [],
          netWorth: null,
          defiPositions: [],
          transactions: [],
          swaps: [],
          stats: null,
          activeChains: [],
          profitability: null,
          isBTC: true,
          whaleInfo: whale,
        });
        setSelectedChain("BTC");
      } else {
        setWalletData({
          tokens: [],
          nfts: [],
          netWorth: null,
          defiPositions: [],
          transactions: [],
          swaps: [],
          stats: null,
          activeChains: [],
          profitability: null,
          isBTC: true,
          whaleInfo: null,
        });
        setSelectedChain("BTC");
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Mapper la chaîne sélectionnée vers le format Moralis
      const chainMap = {
        ETH: "0x1",
        BSC: "0x38",
        POLYGON: "0x89",
        ARBITRUM: "0xa4b1",
        OPTIMISM: "0xa",
      };
      const moralisChain = chainMap[selectedChain] || "0x1";

      // Charger toutes les données en parallèle
      const [
        tokensData,
        nftsData,
        netWorthData,
        defiData,
        historyData,
        tokenTransfersData,
        swapsData,
        statsData,
        chainsData,
        profitabilityData,
      ] = await Promise.allSettled([
        moralisClient.getWalletTokenBalancesPrice(address, moralisChain),
        moralisClient.getWalletNFTs(address, moralisChain, { limit: 100 }),
        moralisClient.getWalletNetWorth(address),
        moralisClient.getWalletDefiPositions(address, moralisChain),
        moralisClient.getWalletHistory(address, moralisChain),
        moralisClient.getWalletTokenTransfers(address, moralisChain, { limit: 100 }),
        moralisClient.getWalletSwaps(address, moralisChain, { limit: 50 }),
        moralisClient.getWalletStats(address, moralisChain),
        moralisClient.getWalletActiveChains(address),
        moralisClient.getWalletProfitabilitySummary(address, moralisChain),
      ]);

      const tokens = tokensData.status === "fulfilled"
        ? (Array.isArray(tokensData.value) ? tokensData.value : tokensData.value?.result || tokensData.value?.data || [])
        : [];

      const nfts = nftsData.status === "fulfilled"
        ? (Array.isArray(nftsData.value) ? nftsData.value : nftsData.value?.result || nftsData.value?.data || [])
        : [];

      const netWorth = netWorthData.status === "fulfilled" ? netWorthData.value : null;
      const defiPositions = defiData.status === "fulfilled" ? (defiData.value?.result || defiData.value?.data || []) : [];
      
      // Traiter l'historique et les transferts de tokens pour obtenir les transactions du wallet
      const history = historyData.status === "fulfilled" 
        ? (Array.isArray(historyData.value) ? historyData.value : historyData.value?.result || historyData.value?.data || historyData.value?.transactions || [])
        : [];
      
      const tokenTransfers = tokenTransfersData.status === "fulfilled"
        ? (Array.isArray(tokenTransfersData.value) ? tokenTransfersData.value : tokenTransfersData.value?.result || tokenTransfersData.value?.data || [])
        : [];

      // Combiner et filtrer les transactions pour s'assurer qu'elles appartiennent au wallet
      const addressLower = address.toLowerCase();
      
      // Filtrer l'historique pour ne garder que les transactions du wallet
      const filteredHistory = history.filter(tx => {
        const txHash = tx.hash || tx.transaction_hash || tx.tx_hash;
        const fromAddr = tx.from_address || tx.from || tx.fromAddress;
        const toAddr = tx.to_address || tx.to || tx.toAddress;
        const walletAddr = tx.address || tx.wallet_address;
        
        return (
          (fromAddr && fromAddr.toLowerCase() === addressLower) ||
          (toAddr && toAddr.toLowerCase() === addressLower) ||
          (walletAddr && walletAddr.toLowerCase() === addressLower) ||
          txHash // Si on a un hash, on garde la transaction
        );
      });

      // Filtrer les transferts de tokens pour ne garder que ceux du wallet
      const filteredTokenTransfers = tokenTransfers.filter(tx => {
        const fromAddr = tx.from_address || tx.from || tx.fromAddress;
        const toAddr = tx.to_address || tx.to || tx.toAddress;
        const walletAddr = tx.address || tx.wallet_address;
        
        return (
          (fromAddr && fromAddr.toLowerCase() === addressLower) ||
          (toAddr && toAddr.toLowerCase() === addressLower) ||
          (walletAddr && walletAddr.toLowerCase() === addressLower)
        );
      }).map(tx => ({
        ...tx,
        category: "ERC20 Transfer",
        value: tx.value || tx.amount || "0",
        hash: tx.transaction_hash || tx.hash || tx.tx_hash,
        block_timestamp: tx.block_timestamp || tx.blockTimestamp || tx.timestamp,
      }));

      // Combiner toutes les transactions
      const allTransactions = [...filteredHistory, ...filteredTokenTransfers];

      // Dédupliquer par hash et trier par date (plus récentes en premier)
      const uniqueTransactions = Array.from(
        new Map(allTransactions.map(tx => {
          const hash = tx.hash || tx.transaction_hash || tx.tx_hash;
          return [hash, tx];
        })).values()
      ).sort((a, b) => {
        const dateA = new Date(a.block_timestamp || a.blockTimestamp || a.timestamp || 0);
        const dateB = new Date(b.block_timestamp || b.blockTimestamp || b.timestamp || 0);
        return dateB - dateA;
      }).slice(0, 100);

      const swaps = swapsData.status === "fulfilled" ? (swapsData.value?.result || swapsData.value?.data || []) : [];
      const stats = statsData.status === "fulfilled" ? statsData.value : null;
      const activeChains = chainsData.status === "fulfilled" ? (chainsData.value?.result || chainsData.value?.data || []) : [];
      const profitability = profitabilityData.status === "fulfilled" ? profitabilityData.value : null;

      setWalletData({
        tokens,
        nfts,
        netWorth,
        defiPositions,
        transactions: uniqueTransactions,
        swaps,
        stats,
        activeChains,
        profitability,
      });
    } catch (err) {
      console.error("Error loading wallet data:", err);
      setError(err.message || "Erreur lors du chargement des données du portefeuille");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    handleLoadWallet(walletAddress);
  };

  const totalTokenValue = walletData.tokens.reduce((sum, token) => {
    const price = parseFloat(token.usd_price || 0);
    const balance = parseFloat(token.balance || 0);
    const decimals = parseInt(token.decimals || 18);
    const adjustedBalance = balance / Math.pow(10, decimals);
    return sum + price * adjustedBalance;
  }, 0);

  const totalNFTValue = walletData.nfts.reduce((sum, nft) => {
    return sum + parseFloat(nft.usd_price || 0);
  }, 0);

  const totalValue = (walletData.netWorth?.total_networth_usd || 0) + totalTokenValue + totalNFTValue;

  // Trouver si c'est une baleine connue
  const knownWhale = CRYPTO_WHALES.whales.find(
    (whale) => whale.address.toLowerCase() === walletAddress.toLowerCase()
  );

  // Préparer les données pour DataTable (Tokens)
  const tokensTableData = useMemo(() => {
    const explorer = getBlockchainExplorerUrl(walletAddress, selectedChain);
    
    const columns = [
      {
        Header: "Token",
        accessor: "token",
        width: "30%",
        Cell: ({ value }) => (
          <MDBox display="flex" alignItems="center" gap={1}>
            {value.logo && (
              <Avatar src={value.logo} sx={{ width: 32, height: 32 }} />
            )}
            <MDBox>
              <MDTypography variant="button" fontWeight="bold" color="primary">
                {value.symbol || "Unknown"}
              </MDTypography>
              <MDTypography variant="caption" color="text" display="block">
                {value.name || "Token"}
              </MDTypography>
            </MDBox>
          </MDBox>
        ),
      },
      {
        Header: "Balance",
        accessor: "balance",
        align: "right",
        width: "20%",
        Cell: ({ value }) => (
          <MDTypography variant="body2" fontWeight="medium">
            {formatNumber(value)}
          </MDTypography>
        ),
      },
      {
        Header: "Prix",
        accessor: "price",
        align: "right",
        width: "20%",
        Cell: ({ value }) => (
          <MDTypography variant="body2">
            {formatCurrency(value)}
          </MDTypography>
        ),
      },
      {
        Header: "Valeur USD",
        accessor: "value",
        align: "right",
        width: "20%",
        Cell: ({ value }) => (
          <MDTypography variant="body2" fontWeight="bold" color="success.main">
            {formatCurrency(value)}
          </MDTypography>
        ),
      },
      {
        Header: "Actions",
        accessor: "actions",
        align: "center",
        width: "10%",
        Cell: ({ value }) => {
          const tokenUrl = explorer.url.includes("etherscan") 
            ? `https://etherscan.io/token/${value}`
            : explorer.url.includes("bscscan")
            ? `https://bscscan.com/token/${value}`
            : explorer.url.includes("polygonscan")
            ? `https://polygonscan.com/token/${value}`
            : explorer.url.includes("arbiscan")
            ? `https://arbiscan.io/token/${value}`
            : explorer.url.includes("optimistic")
            ? `https://optimistic.etherscan.io/token/${value}`
            : explorer.url;
          return (
            <Link
              href={tokenUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Icon fontSize="small" color="info">
                open_in_new
              </Icon>
            </Link>
          );
        },
      },
    ];

    const rows = walletData.tokens
      .map((token) => {
        const balance = parseFloat(token.balance || 0) / Math.pow(10, parseInt(token.decimals || 18));
        const price = parseFloat(token.usd_price || 0);
        const value = balance * price;

        return {
          token: {
            symbol: token.symbol || "Unknown",
            name: token.name || "Token",
            logo: token.logo,
            address: token.token_address,
          },
          balance: balance,
          price: price,
          value: value,
          actions: token.token_address,
        };
      })
      .sort((a, b) => b.value - a.value);

    return { columns, rows };
  }, [walletData.tokens, walletAddress, selectedChain]);

  // Préparer les données pour DataTable (Transactions)
  const transactionsTableData = useMemo(() => {
    const explorer = getBlockchainExplorerUrl(walletAddress, selectedChain);
    
    const columns = [
      {
        Header: "Hash",
        accessor: "hash",
        width: "25%",
        Cell: ({ value }) => {
          const txUrl = explorer.url.includes("etherscan") 
            ? `https://etherscan.io/tx/${value}`
            : explorer.url.includes("bscscan")
            ? `https://bscscan.com/tx/${value}`
            : explorer.url.includes("polygonscan")
            ? `https://polygonscan.com/tx/${value}`
            : explorer.url.includes("arbiscan")
            ? `https://arbiscan.io/tx/${value}`
            : explorer.url.includes("optimistic")
            ? `https://optimistic.etherscan.io/tx/${value}`
            : explorer.url;
          return (
            <Link
              href={txUrl}
              target="_blank"
              rel="noreferrer"
              sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}
            >
              {value?.slice(0, 10)}...
            </Link>
          );
        },
      },
      {
        Header: "Type",
        accessor: "type",
        width: "15%",
        Cell: ({ value, row }) => {
          const isERC20 = value === "ERC20 Transfer" || value?.includes("ERC20");
          return (
            <MDBox display="flex" alignItems="center" gap={0.5}>
              <Chip 
                label={value || "Transfer"} 
                size="small" 
                color={isERC20 ? "success" : "info"}
                icon={<Icon fontSize="small">{isERC20 ? "token" : "swap_horiz"}</Icon>}
              />
            </MDBox>
          );
        },
      },
      {
        Header: "Direction",
        accessor: "direction",
        width: "15%",
        Cell: ({ row }) => {
          const tx = row.original;
          const addressLower = walletAddress.toLowerCase();
          const fromAddr = tx.from_address || tx.from || "";
          const toAddr = tx.to_address || tx.to || "";
          const isFrom = fromAddr.toLowerCase() === addressLower;
          const isTo = toAddr.toLowerCase() === addressLower;
          
          if (isFrom && isTo) {
            return (
              <Chip 
                label="Self" 
                size="small" 
                color="default"
                icon={<Icon fontSize="small">sync</Icon>}
              />
            );
          } else if (isFrom) {
            return (
              <Chip 
                label="Sortant" 
                size="small" 
                color="error"
                icon={<Icon fontSize="small">arrow_upward</Icon>}
              />
            );
          } else if (isTo) {
            return (
              <Chip 
                label="Entrant" 
                size="small" 
                color="success"
                icon={<Icon fontSize="small">arrow_downward</Icon>}
              />
            );
          }
          return <MDTypography variant="caption">-</MDTypography>;
        },
      },
      {
        Header: "Valeur",
        accessor: "value",
        align: "right",
        width: "15%",
        Cell: ({ value }) => (
          <MDTypography variant="body2" fontWeight="medium">
            {formatCurrency(value)}
          </MDTypography>
        ),
      },
      {
        Header: "Date",
        accessor: "date",
        width: "15%",
        Cell: ({ value }) => (
          <MDTypography variant="caption" color="text">
            {value}
          </MDTypography>
        ),
      },
      {
        Header: "Actions",
        accessor: "actions",
        align: "center",
        width: "10%",
        Cell: ({ value }) => {
          const txUrl = explorer.url.includes("etherscan") 
            ? `https://etherscan.io/tx/${value}`
            : explorer.url.includes("bscscan")
            ? `https://bscscan.com/tx/${value}`
            : explorer.url.includes("polygonscan")
            ? `https://polygonscan.com/tx/${value}`
            : explorer.url.includes("arbiscan")
            ? `https://arbiscan.io/tx/${value}`
            : explorer.url.includes("optimistic")
            ? `https://optimistic.etherscan.io/tx/${value}`
            : explorer.url;
          return (
            <Link
              href={txUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Icon fontSize="small" color="info">
                open_in_new
              </Icon>
            </Link>
          );
        },
      },
    ];

    const rows = walletData.transactions.map((tx) => {
      // Gérer différents formats de hash et de valeur
      const txHash = tx.hash || tx.transaction_hash || tx.tx_hash;
      const txValue = tx.value || tx.amount || "0";
      const txDate = tx.block_timestamp || tx.blockTimestamp || tx.timestamp;
      
      // Convertir la valeur (peut être en wei ou déjà en ETH)
      let valueInEth = 0;
      if (typeof txValue === "string" && txValue.includes("e")) {
        valueInEth = parseFloat(txValue);
      } else {
        valueInEth = parseFloat(txValue) / 1e18;
      }

      return {
        hash: txHash,
        type: tx.category || tx.type || "Transfer",
        value: valueInEth,
        date: txDate ? new Date(txDate).toLocaleDateString() : "N/A",
        actions: txHash,
        from_address: tx.from_address || tx.from || "",
        to_address: tx.to_address || tx.to || "",
        original: tx, // Garder l'objet original pour accès aux données
      };
    });

    return { columns, rows };
  }, [walletData.transactions, walletAddress, selectedChain]);

  // Obtenir les scanners disponibles
  const availableExplorers = useMemo(() => {
    const explorers = [];
    if (walletAddress) {
      // Toujours ajouter Etherscan pour ETH
      if (selectedChain === "ETH" || !walletAddress.startsWith("bc1") && !walletAddress.startsWith("1") && !walletAddress.startsWith("3")) {
        explorers.push(getBlockchainExplorerUrl(walletAddress, "ETH"));
      }
      
      // Ajouter selon la chaîne sélectionnée
      if (selectedChain !== "ETH") {
        explorers.push(getBlockchainExplorerUrl(walletAddress, selectedChain));
      }

      // Ajouter Arkham si c'est une baleine connue
      if (knownWhale) {
        explorers.push({
          name: "Arkham",
          url: `https://intel.arkm.com/explorer/address/${walletAddress}`,
          icon: "🔍",
        });
      }
    }
    return explorers;
  }, [walletAddress, selectedChain, knownWhale]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* En-tête */}
        <MDBox mb={4}>
          <Card>
            <MDBox p={3}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <MDBox display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>
                      <Icon>account_balance_wallet</Icon>
                    </Avatar>
                    <MDBox>
                      <MDTypography variant="h4" fontWeight="bold">
                        {knownWhale ? knownWhale.name : "Wallet Explorer"}
                      </MDTypography>
                      <MDBox display="flex" alignItems="center" gap={1} mt={0.5}>
                        <MDTypography
                          variant="body2"
                          sx={{ fontFamily: "monospace" }}
                        >
                          {walletAddress || "0x..."}
                        </MDTypography>
                        {knownWhale && (
                          <Chip
                            label={knownWhale.type}
                            size="small"
                            color="primary"
                          />
                        )}
                      </MDBox>
                    </MDBox>
                  </MDBox>
                  {knownWhale?.notes && (
                    <MDTypography variant="body2" color="text">
                      {knownWhale.notes}
                    </MDTypography>
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  <MDBox display="flex" gap={1} flexWrap="wrap">
                    {availableExplorers.map((explorer, index) => (
                      <MDButton
                        key={index}
                        component="a"
                        href={explorer.url}
                        target="_blank"
                        rel="noreferrer"
                        variant="outlined"
                        color={index === 0 ? "info" : "secondary"}
                        size="small"
                      >
                        <Icon fontSize="small" sx={{ mr: 0.5 }}>
                          open_in_new
                        </Icon>
                        {explorer.icon} {explorer.name}
                      </MDButton>
                    ))}
                  </MDBox>
                </Grid>
              </Grid>
            </MDBox>
          </Card>
        </MDBox>

        {/* Recherche */}
        <MDBox mb={3}>
          <Card>
            <MDBox p={2}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    freeSolo
                    options={getMarketMovingWhales()}
                    value={knownWhale || null}
                    getOptionLabel={(option) => {
                      if (typeof option === "string") return option;
                      return option.name || option.address || "";
                    }}
                    onInputChange={(event, newInputValue, reason) => {
                      if (reason === "input" && newInputValue) {
                        setWalletAddress(newInputValue);
                      }
                    }}
                    onChange={(event, newValue, reason) => {
                      if (newValue && typeof newValue === "object") {
                        setWalletAddress(newValue.address);
                        setSelectedChain(newValue.chain || "ETH");
                        handleLoadWallet(newValue.address);
                      } else if (typeof newValue === "string") {
                        setWalletAddress(newValue);
                        // Détecter automatiquement la chaîne
                        if (newValue.startsWith("0x")) {
                          setSelectedChain("ETH");
                        } else if (newValue.startsWith("1") || newValue.startsWith("3") || newValue.startsWith("bc1")) {
                          setSelectedChain("BTC");
                        }
                      }
                    }}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <MDBox display="flex" alignItems="center" gap={1} width="100%">
                          <Chip
                            label={option.type}
                            size="small"
                            color={
                              option.type === "Government" ? "error" :
                              option.type === "Exchange" ? "warning" :
                              option.type === "Institution" ? "info" :
                              option.type === "Founder" ? "primary" :
                              "default"
                            }
                          />
                          <MDBox flex={1}>
                            <MDTypography variant="body2" fontWeight="bold">
                              {option.name}
                            </MDTypography>
                            <MDTypography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                              {option.address?.slice(0, 10)}...{option.address?.slice(-8)}
                            </MDTypography>
                          </MDBox>
                          <Chip
                            label={option.chain}
                            size="small"
                            variant="outlined"
                          />
                        </MDBox>
                      </Box>
                    )}
                    renderInput={(params) => (
                      <MDInput
                        {...params}
                        label="Rechercher une baleine ou entrer une adresse"
                        placeholder="Ex: Binance, Donald Trump, 0x..., bc1..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && walletAddress) {
                            handleSearch();
                          }
                        }}
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
                  <MDBox mt={1}>
                    <MDTypography variant="caption" color="text.secondary">
                      🐋 Baleines qui font trembler les marchés : Gouvernements, Exchanges, Institutions (BTC & ETH)
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={3} mt={-4}>
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
                    <option value="BTC">₿ Bitcoin</option>
                    <option value="ETH">🔷 Ethereum</option>
                    <option value="BSC">🟡 BSC</option>
                    <option value="POLYGON">🟣 Polygon</option>
                    <option value="ARBITRUM">🔵 Arbitrum</option>
                    <option value="OPTIMISM">🔴 Optimism</option>
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={3}>
                  <MDButton
                    variant="gradient"
                    color="dark"
                    onClick={handleSearch}
                    disabled={loading}
                    fullWidth
                  >
                    {loading ? "Chargement..." : "Analyser"}
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
              Chargement des données du portefeuille...
            </MDTypography>
          </MDBox>
        )}

        {!loading && walletAddress && (
          <>
            {/* Affichage spécial pour les wallets BTC */}
            {walletData.isBTC && (
              <MDBox mb={3}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h5" fontWeight="bold" mb={2}>
                      ₿ Bitcoin Wallet
                    </MDTypography>
                    {walletData.whaleInfo ? (
                      <>
                        <MDBox mb={2}>
                          <MDTypography variant="h6" fontWeight="medium">
                            {walletData.whaleInfo.name}
                          </MDTypography>
                          <MDBox display="flex" gap={1} mt={1} mb={2}>
                            <Chip
                              label={walletData.whaleInfo.type}
                              size="small"
                              color={
                                walletData.whaleInfo.type === "Government" ? "error" :
                                walletData.whaleInfo.type === "Exchange" ? "warning" :
                                walletData.whaleInfo.type === "Institution" ? "info" :
                                "default"
                              }
                            />
                            <Chip label="BTC" size="small" variant="outlined" />
                          </MDBox>
                          <MDTypography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace", mb: 2 }}>
                            {walletAddress}
                          </MDTypography>
                          {walletData.whaleInfo.notes && (
                            <MDTypography variant="body2" color="text">
                              {walletData.whaleInfo.notes}
                            </MDTypography>
                          )}
                        </MDBox>
                        <MDBox mt={2}>
                          <MDTypography variant="body2" color="text.secondary">
                            ℹ️ Les données détaillées des wallets Bitcoin ne sont pas disponibles via Moralis. 
                            Consultez les explorateurs blockchain pour plus d&apos;informations.
                          </MDTypography>
                        </MDBox>
                      </>
                    ) : (
                      <MDBox>
                        <MDTypography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace", mb: 2 }}>
                          {walletAddress}
                        </MDTypography>
                        <MDTypography variant="body2" color="text">
                          ℹ️ Wallet Bitcoin non reconnu dans notre base de données. 
                          Consultez les explorateurs blockchain pour plus d&apos;informations.
                        </MDTypography>
                      </MDBox>
                    )}
                    {/* Liens vers les explorateurs */}
                    <MDBox mt={3}>
                      <MDTypography variant="body2" fontWeight="medium" mb={1}>
                        Explorateurs Blockchain:
                      </MDTypography>
                      <MDBox display="flex" gap={1} flexWrap="wrap">
                        {availableExplorers.map((explorer, index) => (
                          <Link
                            key={index}
                            href={explorer.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ textDecoration: "none" }}
                          >
                            <Chip
                              label={`${explorer.icon} ${explorer.name}`}
                              size="small"
                              clickable
                              variant="outlined"
                            />
                          </Link>
                        ))}
                      </MDBox>
                    </MDBox>
                  </MDBox>
                </Card>
              </MDBox>
            )}

            {/* Statistiques principales avec MiniStatisticsCard - Uniquement pour ETH */}
            {!walletData.isBTC && (
            <MDBox mb={3}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} xl={3}>
                  <MiniStatisticsCard
                    title={{ text: "Valeur Totale", fontWeight: "medium" }}
                    count={formatCurrency(totalValue || walletData.netWorth?.total_networth_usd || 0)}
                    percentage={{ color: "success", text: "" }}
                    icon={{ color: "success", component: "account_balance_wallet" }}
                    direction="right"
                    bgColor="white"
                  />
                </Grid>
                <Grid item xs={12} sm={6} xl={3}>
                  <MiniStatisticsCard
                    title={{ text: "Tokens", fontWeight: "medium" }}
                    count={walletData.tokens.length}
                    percentage={{ color: "info", text: formatCurrency(totalTokenValue) }}
                    icon={{ color: "info", component: "token" }}
                    direction="right"
                    bgColor="white"
                  />
                </Grid>
                <Grid item xs={12} sm={6} xl={3}>
                  <MiniStatisticsCard
                    title={{ text: "NFTs", fontWeight: "medium" }}
                    count={walletData.nfts.length}
                    percentage={{ color: "warning", text: formatCurrency(totalNFTValue) }}
                    icon={{ color: "warning", component: "image" }}
                    direction="right"
                    bgColor="white"
                  />
                </Grid>
                <Grid item xs={12} sm={6} xl={3}>
                  <MiniStatisticsCard
                    title={{ text: "Chaînes Actives", fontWeight: "medium" }}
                    count={walletData.activeChains.length || 1}
                    percentage={{ color: "dark", text: "" }}
                    icon={{ color: "dark", component: "link" }}
                    direction="right"
                    bgColor="white"
                  />
                </Grid>
              </Grid>
            </MDBox>
            )}

            {/* Onglets - Uniquement pour ETH */}
            {!walletData.isBTC && (
            <MDBox mb={3}>
              <Card>
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  sx={{ borderBottom: 1, borderColor: "divider" }}
                >
                  <Tab label="Tokens" icon={<Icon>account_balance</Icon>} iconPosition="start" />
                  <Tab label="NFTs" icon={<Icon>image</Icon>} iconPosition="start" />
                  <Tab label="Transactions" icon={<Icon>swap_horiz</Icon>} iconPosition="start" />
                  <Tab label="DeFi" icon={<Icon>savings</Icon>} iconPosition="start" />
                  <Tab label="Swaps" icon={<Icon>swap_vert</Icon>} iconPosition="start" />
                  <Tab label="Stats" icon={<Icon>analytics</Icon>} iconPosition="start" />
                </Tabs>
              </Card>
            </MDBox>
            )}

            {/* Contenu des onglets - Uniquement pour ETH */}
            {!walletData.isBTC && (
              <>
            {activeTab === 0 && (
              <MDBox mb={3}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Tokens ({walletData.tokens.length})
                    </MDTypography>
                    {walletData.tokens.length === 0 ? (
                      <MDBox textAlign="center" py={4}>
                        <MDTypography variant="body2" color="text">
                          Aucun token trouvé
                        </MDTypography>
                      </MDBox>
                    ) : (
                      <DataTable
                        table={tokensTableData}
                        canSearch={true}
                        entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50, 100] }}
                        showTotalEntries={true}
                        pagination={{ variant: "gradient", color: "dark" }}
                        isSorted={true}
                        noEndBorder={false}
                      />
                    )}
                  </MDBox>
                </Card>
              </MDBox>
            )}

            {activeTab === 1 && (
              <MDBox mb={3}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      NFTs ({walletData.nfts.length})
                    </MDTypography>
                    {walletData.nfts.length === 0 ? (
                      <MDBox textAlign="center" py={4}>
                        <MDTypography variant="body2" color="text">
                          Aucun NFT trouvé
                        </MDTypography>
                      </MDBox>
                    ) : (
                      <Grid container spacing={2}>
                        {walletData.nfts.slice(0, 20).map((nft, index) => (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card>
                              <MDBox p={2}>
                                {nft.image && (
                                  <Box
                                    component="img"
                                    src={nft.image}
                                    alt={nft.name}
                                    sx={{
                                      width: "100%",
                                      height: 200,
                                      objectFit: "cover",
                                      borderRadius: 1,
                                      mb: 1,
                                    }}
                                  />
                                )}
                                <MDTypography variant="body2" fontWeight="medium">
                                  {nft.name || `#${nft.token_id}`}
                                </MDTypography>
                                <MDTypography variant="caption" color="text">
                                  {nft.collection_name || "Collection"}
                                </MDTypography>
                              </MDBox>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </MDBox>
                </Card>
              </MDBox>
            )}

            {activeTab === 2 && (
              <MDBox mb={3}>
                <Card>
                  <MDBox p={3}>
                    <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <MDBox>
                        <MDTypography variant="h6" fontWeight="medium">
                          Transactions du Wallet ({walletData.transactions.length})
                        </MDTypography>
                        <MDTypography variant="caption" color="text.secondary">
                          Transactions filtrées pour {walletAddress?.slice(0, 10)}...{walletAddress?.slice(-8)}
                        </MDTypography>
                      </MDBox>
                      <MDBox>
                        <Alert 
                          severity="info" 
                          icon={<Icon>account_balance_wallet</Icon>}
                          sx={{ py: 0.5 }}
                        >
                          <MDTypography variant="caption" fontWeight="bold">
                            Transactions du wallet uniquement
                          </MDTypography>
                        </Alert>
                      </MDBox>
                    </MDBox>
                    {walletData.transactions.length === 0 ? (
                      <MDBox textAlign="center" py={4}>
                        <Icon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}>
                          swap_horiz
                        </Icon>
                        <MDTypography variant="body2" color="text" mb={1}>
                          Aucune transaction trouvée pour ce wallet
                        </MDTypography>
                        <MDTypography variant="caption" color="text.secondary">
                          Les transactions affichées sont filtrées pour n&apos;inclure que celles du wallet sélectionné
                        </MDTypography>
                      </MDBox>
                    ) : (
                      <>
                        <MDBox mb={2}>
                          <Alert severity="success" icon={<Icon>check_circle</Icon>}>
                            <MDTypography variant="body2" fontWeight="medium">
                              ✅ {walletData.transactions.length} transaction(s) trouvée(s) pour ce wallet
                            </MDTypography>
                            <MDTypography variant="caption" display="block" mt={0.5}>
                              Ces transactions sont filtrées pour n&apos;inclure que celles où le wallet est expéditeur ou destinataire
                            </MDTypography>
                          </Alert>
                        </MDBox>
                        <DataTable
                          table={transactionsTableData}
                          canSearch={true}
                          entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
                          showTotalEntries={true}
                          pagination={{ variant: "gradient", color: "dark" }}
                          isSorted={true}
                          noEndBorder={false}
                        />
                      </>
                    )}
                  </MDBox>
                </Card>
              </MDBox>
            )}

            {activeTab === 3 && (
              <MDBox mb={3}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Positions DeFi ({walletData.defiPositions.length})
                    </MDTypography>
                    {walletData.defiPositions.length === 0 ? (
                      <MDBox textAlign="center" py={4}>
                        <MDTypography variant="body2" color="text">
                          Aucune position DeFi trouvée
                        </MDTypography>
                      </MDBox>
                    ) : (
                      <DataTable
                        table={{
                          columns: [
                            {
                              Header: "Protocol",
                              accessor: "protocol",
                              Cell: ({ value }) => (
                                <MDTypography variant="button" fontWeight="bold" color="primary">
                                  {value}
                                </MDTypography>
                              ),
                            },
                            {
                              Header: "Valeur",
                              accessor: "value",
                              align: "right",
                              Cell: ({ value }) => (
                                <MDTypography variant="body2" fontWeight="bold" color="success.main">
                                  {value}
                                </MDTypography>
                              ),
                            },
                          ],
                          rows: walletData.defiPositions.map((position) => ({
                            protocol: position.protocol || "Unknown",
                            value: formatCurrency(position.value_usd || 0),
                          })),
                        }}
                        canSearch={true}
                        entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25] }}
                        showTotalEntries={true}
                        pagination={{ variant: "gradient", color: "dark" }}
                        isSorted={true}
                        noEndBorder={false}
                      />
                    )}
                  </MDBox>
                </Card>
              </MDBox>
            )}

            {activeTab === 4 && (
              <MDBox mb={3}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Swaps ({walletData.swaps.length})
                    </MDTypography>
                    {walletData.swaps.length === 0 ? (
                      <MDBox textAlign="center" py={4}>
                        <MDTypography variant="body2" color="text">
                          Aucun swap trouvé
                        </MDTypography>
                      </MDBox>
                    ) : (
                      <DataTable
                        table={{
                          columns: [
                            {
                              Header: "Token In",
                              accessor: "tokenIn",
                              Cell: ({ value }) => (
                                <MDTypography variant="button" fontWeight="bold" color="error">
                                  {value}
                                </MDTypography>
                              ),
                            },
                            {
                              Header: "→",
                              accessor: "arrow",
                              width: "5%",
                              Cell: () => (
                                <MDTypography variant="h6" color="text.secondary">
                                  →
                                </MDTypography>
                              ),
                            },
                            {
                              Header: "Token Out",
                              accessor: "tokenOut",
                              Cell: ({ value }) => (
                                <MDTypography variant="button" fontWeight="bold" color="success">
                                  {value}
                                </MDTypography>
                              ),
                            },
                            {
                              Header: "Valeur",
                              accessor: "value",
                              align: "right",
                              Cell: ({ value }) => (
                                <MDTypography variant="body2" fontWeight="bold" color="info.main">
                                  {value}
                                </MDTypography>
                              ),
                            },
                          ],
                          rows: walletData.swaps.map((swap) => ({
                            tokenIn: swap.token_in?.symbol || "Unknown",
                            arrow: "→",
                            tokenOut: swap.token_out?.symbol || "Unknown",
                            value: formatCurrency(swap.value_usd || 0),
                          })),
                        }}
                        canSearch={true}
                        entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25] }}
                        showTotalEntries={true}
                        pagination={{ variant: "gradient", color: "dark" }}
                        isSorted={true}
                        noEndBorder={false}
                      />
                    )}
                  </MDBox>
                </Card>
              </MDBox>
            )}

            {activeTab === 5 && (
              <MDBox mb={3}>
                <Card>
                  <MDBox p={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Statistiques
                    </MDTypography>
                    {walletData.stats && (
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={4}>
                          <MiniStatisticsCard
                            title={{ text: "Total Transactions", fontWeight: "medium" }}
                            count={walletData.stats.total_transactions || 0}
                            percentage={{ color: "info", text: "" }}
                            icon={{ color: "info", component: "swap_horiz" }}
                            direction="right"
                            bgColor="white"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <MiniStatisticsCard
                            title={{ text: "Total NFTs", fontWeight: "medium" }}
                            count={walletData.stats.total_nfts || 0}
                            percentage={{ color: "warning", text: "" }}
                            icon={{ color: "warning", component: "image" }}
                            direction="right"
                            bgColor="white"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <MiniStatisticsCard
                            title={{ text: "Total Tokens", fontWeight: "medium" }}
                            count={walletData.stats.total_tokens || 0}
                            percentage={{ color: "success", text: "" }}
                            icon={{ color: "success", component: "token" }}
                            direction="right"
                            bgColor="white"
                          />
                        </Grid>
                      </Grid>
                    )}
                    {walletData.profitability && (
                      <MDBox mt={3}>
                        <MDTypography variant="h6" mb={2}>
                          Profit & Loss
                        </MDTypography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <MiniStatisticsCard
                              title={{ text: "Total Profit", fontWeight: "medium" }}
                              count={formatCurrency(walletData.profitability.total_profit_usd || 0)}
                              percentage={{
                                color: (walletData.profitability.total_profit_usd || 0) >= 0 ? "success" : "error",
                                text: "",
                              }}
                              icon={{
                                color: (walletData.profitability.total_profit_usd || 0) >= 0 ? "success" : "error",
                                component: "trending_up",
                              }}
                              direction="right"
                              bgColor="white"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <MiniStatisticsCard
                              title={{ text: "ROI", fontWeight: "medium" }}
                              count={formatPercent(walletData.profitability.total_roi || 0)}
                              percentage={{
                                color: (walletData.profitability.total_roi || 0) >= 0 ? "success" : "error",
                                text: "",
                              }}
                              icon={{
                                color: (walletData.profitability.total_roi || 0) >= 0 ? "success" : "error",
                                component: "show_chart",
                              }}
                              direction="right"
                              bgColor="white"
                            />
                          </Grid>
                        </Grid>
                      </MDBox>
                    )}
                  </MDBox>
                </Card>
              </MDBox>
            )}
              </>
            )}
          </>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default WalletDetails;
