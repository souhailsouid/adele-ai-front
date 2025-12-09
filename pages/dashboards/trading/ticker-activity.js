/**
 * Ticker Activity - Vue agrégée de toutes les activités par ticker
 * 
 * Optimisé avec chargement asynchrone par onglet, skeletons, et affichage progressif
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
import DataTable from "/examples/Tables/DataTable";
import MiniStatisticsCard from "/examples/Cards/StatisticsCards/MiniStatisticsCard";
import Alert from "@mui/material/Alert";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { formatCurrency, formatVolume, formatDate, formatPercentage } from "/utils/formatting";
import { searchStocks } from "/config/stockSymbols";
import tickerActivityClient from "/lib/api/tickerActivityClient";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import { useRouter } from "next/router";
import { useAuth } from "/hooks/useAuth";
import withAuth from "/hocs/withAuth";

function TickerActivity() {
    const router = useRouter();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [symbol, setSymbol] = useState("");
    const [selectedSymbol, setSelectedSymbol] = useState(null);
    const [quote, setQuote] = useState(null);
    const [loadingQuote, setLoadingQuote] = useState(false);
    const [error, setError] = useState(null);
    const [currentTab, setCurrentTab] = useState(0);
    const [helpDialogOpen, setHelpDialogOpen] = useState({
        ownership: false,
        activity: false,
        hedgeFunds: false,
        insiders: false,
        congress: false,
        options: false,
        darkPool: false,
    });

    // États pour chaque onglet (chargement indépendant)
    const [tabData, setTabData] = useState({
        ownership: { data: [], loading: false, error: null, loaded: false },
        activity: { data: [], loading: false, error: null, loaded: false },
        hedgeFunds: { data: [], loading: false, error: null, loaded: false },
        insiders: { data: [], loading: false, error: null, loaded: false },
        congress: { data: [], loading: false, error: null, loaded: false },
        options: { data: [], loading: false, error: null, loaded: false },
        darkPool: { data: [], loading: false, error: null, loaded: false },
    });

    // Stats calculées
    const [stats, setStats] = useState(null);

    const tabs = [
        { id: "ownership", label: "Propriété" },
        { id: "activity", label: "Transactions" },
        { id: "hedgeFunds", label: "Hedge Funds" },
        { id: "insiders", label: "Insiders" },
        { id: "congress", label: "Congrès" },
        { id: "options", label: "Options Flow" },
        { id: "darkPool", label: "Dark Pool" },
    ];
// Vérifier l'authentification et rediriger si nécessaire
useEffect(() => {
    if (!authLoading && !isAuthenticated()) {
      console.log("Not authenticated, redirecting to sign-in");
      router.push("/authentication/sign-in?redirect=/dashboards/trading/ticker-activity");
    }
  }, [authLoading, isAuthenticated, router]);
  // Charger le quote immédiatement
  const loadQuote = useCallback(async (ticker) => {
    if (!ticker) return;

    try {
      setLoadingQuote(true);
      // Appel direct au backend (pas via route API Next.js)
      const result = await tickerActivityClient.getQuote(ticker);
      setQuote(result || null);
    } catch (err) {
      console.error("Error loading quote:", err);
    } finally {
      setLoadingQuote(false);
    }
  }, []);

    // Recalculer les statistiques
    const recalculateStats = useCallback(() => {
        const ownership = tabData.ownership.data || [];
        const activity = tabData.activity.data || [];
        const hedgeFunds = tabData.hedgeFunds.data || [];
        const insiders = tabData.insiders.data || [];
        const congress = tabData.congress.data || [];
        const options = tabData.options.data || [];
        const darkPool = tabData.darkPool.data || [];

        const currentPrice = parseFloat(quote?.price || quote?.close || 0);
        const totalInstitutionalShares = ownership.reduce((sum, inst) => {
            return sum + (parseFloat(inst.shares || inst.units || 0));
        }, 0);

        const recentBuys = activity.filter(t => {
            const change = parseFloat(t.units_change || t.change || 0);
            return change > 0;
        }).length;

        const recentSells = activity.filter(t => {
            const change = parseFloat(t.units_change || t.change || 0);
            return change < 0;
        }).length;

        const callPremium = options
            .filter(o => o.type === "call")
            .reduce((sum, o) => sum + (parseFloat(o.total_premium || o.premium || 0)), 0);

        const putPremium = options
            .filter(o => o.type === "put")
            .reduce((sum, o) => sum + (parseFloat(o.total_premium || o.premium || 0)), 0);

        const darkPoolVolume = darkPool.reduce((sum, t) => {
            return sum + (parseFloat(t.volume || t.size || 0));
        }, 0);

        setStats({
            totalInstitutions: ownership.length,
            totalHedgeFunds: hedgeFunds.length,
            totalInstitutionalShares,
            totalInstitutionalValue: totalInstitutionalShares * currentPrice,
            recentBuys,
            recentSells,
            netActivity: recentBuys - recentSells,
            insiderTrades: insiders.length,
            congressTrades: congress.length,
            optionsFlow: {
                totalAlerts: options.length,
                callPremium,
                putPremium,
                putCallRatio: callPremium > 0 ? putPremium / callPremium : 0,
            },
            darkPool: {
                totalTrades: darkPool.length,
                totalVolume: darkPoolVolume,
            },
        });
    }, [tabData, quote]);

  // Charger les données d'un onglet spécifique
  const loadTabData = useCallback(async (ticker, tabId) => {
    if (!ticker || !tabId) return;

    // Ne pas recharger si déjà chargé
    setTabData(prev => {
      if (prev[tabId]?.loaded && prev[tabId]?.data && Array.isArray(prev[tabId].data) && prev[tabId].data.length > 0) {
        return prev;
      }
      return {
        ...prev,
        [tabId]: { ...prev[tabId], loading: true, error: null },
      };
    });

    try {
      // Appel direct au backend (pas via route API Next.js)
      console.log(`[TickerActivity] Loading ${tabId} for ${ticker}...`);
      
      // Pour ownership, augmenter la limite pour voir plus d'institutions (ex: ARK Invest)
      const limit = tabId === "ownership" ? 200 : 100;
      
      const result = await tickerActivityClient.getActivityByType(ticker, tabId, {
        limit,
        forceRefresh: false,
      });
      console.log(`[TickerActivity] ${tabId} loaded:`, {
        count: result.count || 0,
        cached: result.cached || false,
        dataLength: result.data?.length || 0,
      });
      const data = result.data || [];

      setTabData(prev => ({
        ...prev,
        [tabId]: {
          data,
          loading: false,
          error: null,
          loaded: true,
        },
      }));

      // Recalculer les stats si nécessaire (déclenché par useEffect)
    } catch (err) {
      console.error(`Error loading ${tabId}:`, err);
      setTabData(prev => ({
        ...prev,
        [tabId]: {
          ...prev[tabId],
          loading: false,
          error: err.message,
          loaded: true,
        },
      }));
    }
  }, []);

    // Charger les données quand on change d'onglet
    useEffect(() => {
        if (selectedSymbol && tabs[currentTab]) {
            const tabId = tabs[currentTab].id;
            loadTabData(selectedSymbol, tabId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTab, selectedSymbol]);

    // Recalculer les stats quand les données changent
    useEffect(() => {
        if (quote && (tabData.ownership.loaded || tabData.activity.loaded)) {
            recalculateStats();
        }
    }, [tabData, quote, recalculateStats]);

    const handleSearch = () => {
        const ticker = symbol.toUpperCase().trim();
        if (!ticker) {
            setError("Veuillez entrer un symbole");
            return;
        }

        // Mettre à jour selectedSymbol mais garder symbol modifiable
        setSelectedSymbol(ticker);
        // Ne pas forcer symbol à ticker pour permettre la modification après
        setError(null);

        // Réinitialiser les données
        setTabData({
            ownership: { data: [], loading: false, error: null, loaded: false },
            activity: { data: [], loading: false, error: null, loaded: false },
            hedgeFunds: { data: [], loading: false, error: null, loaded: false },
            insiders: { data: [], loading: false, error: null, loaded: false },
            congress: { data: [], loading: false, error: null, loaded: false },
            options: { data: [], loading: false, error: null, loaded: false },
            darkPool: { data: [], loading: false, error: null, loaded: false },
        });
        setStats(null);

        // Charger le quote immédiatement
        loadQuote(ticker);

        // Charger l'onglet actuel
        const currentTabId = tabs[currentTab].id;
        loadTabData(ticker, currentTabId);
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
        if (selectedSymbol) {
            const tabId = tabs[newValue].id;
            loadTabData(selectedSymbol, tabId);
        }
    };

    // Skeleton pour les tableaux
    const TableSkeleton = () => (
        <MDBox>
            {[1, 2, 3, 4, 5].map((i) => (
                <MDBox key={i} display="flex" gap={2} mb={2}>
                    <Skeleton variant="rectangular" width="30%" height={40} />
                    <Skeleton variant="rectangular" width="20%" height={40} />
                    <Skeleton variant="rectangular" width="20%" height={40} />
                    <Skeleton variant="rectangular" width="15%" height={40} />
                    <Skeleton variant="rectangular" width="15%" height={40} />
                </MDBox>
            ))}
        </MDBox>
    );

    // Rendu du contenu par onglet
    const renderTabContent = (tabId, tabState) => {
        const data = tabState.data || [];
        const currentPrice = parseFloat(quote?.price || quote?.close || 0);
        
        switch (tabId) {
            case "ownership":
                return (
                    <Card>
                        <MDBox p={3}>
                            <MDBox display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                                <MDBox display="flex" alignItems="center" gap={1}>
                                    <MDTypography variant="h6" fontWeight="medium">
                                        Propriété Institutionnelle ({data.length})
                                    </MDTypography>
                                    <Tooltip title="En savoir plus sur cette donnée" arrow>
                                        <IconButton
                                            size="small"
                                            onClick={() => setHelpDialogOpen({ ...helpDialogOpen, ownership: true })}
                                            sx={{
                                                color: "text.secondary",
                                                "&:hover": {
                                                    color: "primary.main",
                                                },
                                            }}
                                        >
                                            <HelpOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </MDBox>
                                {selectedSymbol && (
                                    <MDButton
                                        size="small"
                                        variant="outlined"
                                        color="info"
                                        onClick={async () => {
                                            // Forcer le refresh pour voir les dernières données (ex: ARK Invest)
                                            setTabData(prev => ({
                                                ...prev,
                                                ownership: { ...prev.ownership, loading: true, loaded: false },
                                            }));
                                            try {
                                                const result = await tickerActivityClient.getActivityByType(selectedSymbol, "ownership", {
                                                    limit: 200,
                                                    forceRefresh: true,
                                                });
                                                setTabData(prev => ({
                                                    ...prev,
                                                    ownership: {
                                                        data: result.data || [],
                                                        loading: false,
                                                        error: null,
                                                        loaded: true,
                                                    },
                                                }));
                                            } catch (err) {
                                                console.error("Error refreshing ownership:", err);
                                                setTabData(prev => ({
                                                    ...prev,
                                                    ownership: {
                                                        ...prev.ownership,
                                                        loading: false,
                                                        error: err.message,
                                                    },
                                                }));
                                            }
                                        }}
                                        disabled={tabData.ownership.loading}
                                    >
                                        {tabData.ownership.loading ? "⏳" : "🔄"} Actualiser
                                    </MDButton>
                                )}
                            </MDBox>
                            {data.length > 0 ? (
                                <DataTable
                                    table={{
                                        columns: [
                                            {
                                                Header: () => (
                                                    <Tooltip
                                                        title="Nom de l'institution qui détient les actions (fonds, banques, assureurs, etc.)"
                                                        arrow
                                                        placement="top"
                                                    >
                                                        <span>Institution</span>
                                                    </Tooltip>
                                                ),
                                                accessor: "name",
                                                width: "30%",
                                            },
                                            {
                                                Header: () => (
                                                    <Tooltip
                                                        title="Nombre d'actions détenues par cette institution"
                                                        arrow
                                                        placement="top"
                                                    >
                                                        <span>Shares</span>
                                                    </Tooltip>
                                                ),
                                                accessor: "shares",
                                                width: "15%",
                                                Cell: ({ value }) => formatVolume(value || 0),
                                            },
                                            {
                                                Header: () => (
                                                    <Tooltip
                                                        title="Valeur actuelle de la position (shares × prix actuel du ticker)"
                                                        arrow
                                                        placement="top"
                                                    >
                                                        <span>Valeur</span>
                                                    </Tooltip>
                                                ),
                                                accessor: "value",
                                                width: "15%",
                                                Cell: ({ value, row }) => {
                                                    const shares = parseFloat(row.original.shares || row.original.units || 0);
                                                    return formatCurrency(shares * currentPrice);
                                                },
                                            },
                                        
                                            {
                                                Header: () => (
                                                    <Tooltip
                                                        title="Date de fin du trimestre pour lequel le rapport a été établi (ex: 30/09/2024 pour Q3)"
                                                        arrow
                                                        placement="top"
                                                    >
                                                        <span>Report Date</span>
                                                    </Tooltip>
                                                ),
                                                accessor: "report_date",
                                                width: "15%",
                                                Cell: ({ value }) => formatDate(value, "fr-FR", false),
                                            },
                                            {
                                                Header: () => (
                                                    <Tooltip
                                                        title="Date à laquelle le formulaire 13F a été déposé auprès de la SEC (dans les 45 jours après la fin du trimestre)"
                                                        arrow
                                                        placement="top"
                                                    >
                                                        <span>Filing Date</span>
                                                    </Tooltip>
                                                ),
                                                accessor: "filing_date",
                                                width: "15%",
                                                Cell: ({ value }) => formatDate(value, "fr-FR", false),
                                            },
                                        ],
                                        rows: data,
                                    }}
                                    canSearch={true}
                                    entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
                                    showTotalEntries={true}
                                    pagination={{ variant: "gradient", color: "dark" }}
                                    isSorted={true}
                                    noEndBorder={false}
                                />
                            ) : (
                                <MDTypography variant="body2" color="text.secondary">
                                    Aucune donn&eacute;e disponible
                                </MDTypography>
                            )}
                        </MDBox>
                    </Card>
                );

            case "activity":
                return (
                    <Card>
                        <MDBox p={3}>
                            <MDBox display="flex" alignItems="center" gap={1} mb={2}>
                                <MDTypography variant="h6" fontWeight="medium">
                                    Transactions Récentes ({data.length})
                                </MDTypography>
                                <Tooltip title="En savoir plus sur cette donnée" arrow>
                                    <IconButton
                                        size="small"
                                        onClick={() => setHelpDialogOpen({ ...helpDialogOpen, activity: true })}
                                        sx={{
                                            color: "text.secondary",
                                            "&:hover": {
                                                color: "primary.main",
                                            },
                                        }}
                                    >
                                        <HelpOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </MDBox>
                            {data.length > 0 ? (
                                <DataTable
                                    table={{
                                        columns: [
                                            {
                                                Header: () => (
                                                    <Tooltip title="Nom de l'institution qui a effectué la transaction" arrow placement="top">
                                                        <span>Institution</span>
                                                    </Tooltip>
                                                ),
                                                accessor: "institution_name",
                                                width: "25%",
                                            },
                                            {
                                                Header: () => (
                                                    <Tooltip title="Type de transaction : Achat (vert) ou Vente (rouge)" arrow placement="top">
                                                        <span>Type</span>
                                                    </Tooltip>
                                                ),
                                                accessor: "transaction_type",
                                                id: "transaction_type",
                                                width: "10%",
                                                Cell: ({ row }) => {
                                                    const change = parseFloat(row.original.units_change || row.original.change || 0);
                                                    return (
                                                        <Chip
                                                            label={change > 0 ? "Achat" : change < 0 ? "Vente" : "N/A"}
                                                            size="small"
                                                            color={change > 0 ? "success" : "error"}
                                                        />
                                                    );
                                                },
                                            },
                                            {
                                                Header: () => (
                                                    <Tooltip title="Nombre d'actions achetées (+) ou vendues (-)" arrow placement="top">
                                                        <span>Changement</span>
                                                    </Tooltip>
                                                ),
                                                accessor: "units_change",
                                                width: "15%",
                                                Cell: ({ value }) => {
                                                    const change = parseFloat(value || 0);
                                                    return (
                                                        <MDTypography
                                                            variant="body2"
                                                            fontWeight="medium"
                                                            color={change > 0 ? "success.main" : "error.main"}
                                                        >
                                                            {change > 0 ? "+" : ""}{formatVolume(change)}
                                                        </MDTypography>
                                                    );
                                                },
                                            },
                                            {
                                                Header: () => (
                                                    <Tooltip title="Prix moyen de la transaction (avg_price)" arrow placement="top">
                                                        <span>Prix</span>
                                                    </Tooltip>
                                                ),
                                                accessor: "avg_price",
                                                width: "15%",
                                                Cell: ({ value }) => formatCurrency(value),
                                            },
                                            {
                                                Header: () => (
                                                    <Tooltip title="Date de dépôt du formulaire 13F (filing_date)" arrow placement="top">
                                                        <span>Date</span>
                                                    </Tooltip>
                                                ),
                                                accessor: "filing_date",
                                                width: "15%",
                                                Cell: ({ value }) => formatDate(value, "fr-FR", false),
                                            },
                                        ],
                                        rows: data,
                                    }}
                                    canSearch={true}
                                    entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
                                    showTotalEntries={true}
                                    pagination={{ variant: "gradient", color: "dark" }}
                                    isSorted={true}
                                    noEndBorder={false}
                                />
                            ) : (
                                <MDTypography variant="body2" color="text.secondary">
                                    Aucune transaction récente disponible
                                </MDTypography>
                            )}
                        </MDBox>
                    </Card>
                );

            case "hedgeFunds":
                return (
                    <Card>
                        <MDBox p={3}>
                            <MDBox display="flex" alignItems="center" gap={1} mb={2}>
                                <MDTypography variant="h6" fontWeight="medium">
                                    Hedge Funds ({data.length})
                                </MDTypography>
                                <Tooltip title="En savoir plus sur cette donnée" arrow>
                                    <IconButton
                                        size="small"
                                        onClick={() => setHelpDialogOpen({ ...helpDialogOpen, hedgeFunds: true })}
                                        sx={{
                                            color: "text.secondary",
                                            "&:hover": {
                                                color: "primary.main",
                                            },
                                        }}
                                    >
                                        <HelpOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </MDBox>
                            {data.length > 0 ? (
                                <DataTable
                                    table={{
                                        columns: [
                                            { Header: "Hedge Fund", accessor: "name", width: "40%" },
                                            {
                                                Header: "Shares",
                                                accessor: "shares",
                                                width: "20%",
                                                Cell: ({ value }) => formatVolume(value || 0),
                                            },
                                            {
                                                Header: "Valeur",
                                                accessor: "value",
                                                width: "20%",
                                                Cell: ({ value, row }) => {
                                                    const shares = parseFloat(row.original.shares || row.original.units || 0);
                                                    return formatCurrency(shares * currentPrice);
                                                },
                                            },
                                            {
                                                Header: "Report Date",
                                                accessor: "report_date",
                                                width: "20%",
                                                Cell: ({ value }) => formatDate(value, "fr-FR", false),
                                            },
                                        ],
                                        rows: data,
                                    }}
                                    canSearch={true}
                                    entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
                                    showTotalEntries={true}
                                    pagination={{ variant: "gradient", color: "dark" }}
                                    isSorted={true}
                                    noEndBorder={false}
                                />
                            ) : (
                                <MDTypography variant="body2" color="text.secondary">
                                    Aucun hedge fund détecté
                                </MDTypography>
                            )}
                        </MDBox>
                    </Card>
                );

            case "insiders":
                return (
                    <Card>
                        <MDBox p={3}>
                            <MDBox display="flex" alignItems="center" gap={1} mb={2}>
                                <MDTypography variant="h6" fontWeight="medium">
                                    Transactions Insiders ({data.length})
                                </MDTypography>
                                <Tooltip title="En savoir plus sur cette donnée" arrow>
                                    <IconButton
                                        size="small"
                                        onClick={() => setHelpDialogOpen({ ...helpDialogOpen, insiders: true })}
                                        sx={{
                                            color: "text.secondary",
                                            "&:hover": {
                                                color: "primary.main",
                                            },
                                        }}
                                    >
                                        <HelpOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </MDBox>
                            {data.length > 0 ? (
                                <DataTable
                                    table={{
                                        columns: [
                                            { Header: "Nom", accessor: "owner_name", width: "25%" },
                                            { Header: "Titre", accessor: "officer_title", width: "20%" },
                                            {
                                                Header: "Type",
                                                accessor: "transaction_code",
                                                width: "10%",
                                                Cell: ({ value, row }) => {
                                                    const isBuy = value === "A" || value === "P" || row.original.acquisitionOrDisposition === "A";
                                                    return (
                                                        <Chip
                                                            label={isBuy ? "Achat" : "Vente"}
                                                            size="small"
                                                            color={isBuy ? "success" : "error"}
                                                        />
                                                    );
                                                },
                                            },
                                            {
                                                Header: "Montant",
                                                accessor: "amount",
                                                width: "15%",
                                                Cell: ({ value }) => formatCurrency(value || 0),
                                            },
                                            {
                                                Header: "Date",
                                                accessor: "transaction_date",
                                                width: "15%",
                                                Cell: ({ value }) => formatDate(value, "fr-FR", false),
                                            },
                                        ],
                                        rows: data,
                                    }}
                                    canSearch={true}
                                    entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
                                    showTotalEntries={true}
                                    pagination={{ variant: "gradient", color: "dark" }}
                                    isSorted={true}
                                    noEndBorder={false}
                                />
                            ) : (
                                <MDTypography variant="body2" color="text.secondary">
                                    Aucune transaction insider disponible
                                </MDTypography>
                            )}
                        </MDBox>
                    </Card>
                );

            case "congress":
                return (
                    <Card>
                        <MDBox p={3}>
                            <MDBox display="flex" alignItems="center" gap={1} mb={2}>
                                <MDTypography variant="h6" fontWeight="medium">
                                    Transactions Congrès ({data.length})
                                </MDTypography>
                                <Tooltip title="En savoir plus sur cette donnée" arrow>
                                    <IconButton
                                        size="small"
                                        onClick={() => setHelpDialogOpen({ ...helpDialogOpen, congress: true })}
                                        sx={{
                                            color: "text.secondary",
                                            "&:hover": {
                                                color: "primary.main",
                                            },
                                        }}
                                    >
                                        <HelpOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </MDBox>
                            {data.length > 0 ? (
                                <DataTable
                                    table={{
                                        columns: [
                                            { Header: "Nom", accessor: "name", width: "25%" },
                                            {
                                                Header: "Type",
                                                accessor: "member_type",
                                                width: "15%",
                                                Cell: ({ value }) => (
                                                    <Chip
                                                        label={value === "senate" ? "Sénat" : value === "house" ? "Chambre" : value || "N/A"}
                                                        size="small"
                                                        color={value === "senate" ? "info" : "primary"}
                                                        variant="outlined"
                                                    />
                                                ),
                                            },
                                            {
                                                Header: "Transaction",
                                                accessor: "txn_type",
                                                width: "15%",
                                                Cell: ({ value }) => (
                                                    <Chip
                                                        label={value || "N/A"}
                                                        size="small"
                                                        color={value === "Buy" ? "success" : "error"}
                                                    />
                                                ),
                                            },
                                            { Header: "Montant", accessor: "amounts", width: "20%" },
                                            {
                                                Header: "Date",
                                                accessor: "transaction_date",
                                                width: "15%",
                                                Cell: ({ value }) => formatDate(value, "fr-FR", false),
                                            },
                                        ],
                                        rows: data,
                                    }}
                                    canSearch={true}
                                    entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
                                    showTotalEntries={true}
                                    pagination={{ variant: "gradient", color: "dark" }}
                                    isSorted={true}
                                    noEndBorder={false}
                                />
                            ) : (
                                <MDTypography variant="body2" color="text.secondary">
                                    Aucune transaction du Congrès disponible
                                </MDTypography>
                            )}
                        </MDBox>
                    </Card>
                );

            case "options":
                return (
                    <Card>
                        <MDBox p={3}>
                            <MDBox display="flex" alignItems="center" gap={1} mb={2}>
                                <MDTypography variant="h6" fontWeight="medium">
                                    Options Flow ({data.length})
                                </MDTypography>
                                <Tooltip title="En savoir plus sur cette donnée" arrow>
                                    <IconButton
                                        size="small"
                                        onClick={() => setHelpDialogOpen({ ...helpDialogOpen, options: true })}
                                        sx={{
                                            color: "text.secondary",
                                            "&:hover": {
                                                color: "primary.main",
                                            },
                                        }}
                                    >
                                        <HelpOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </MDBox>
                            {data.length > 0 ? (
                                <>
                                    {stats?.optionsFlow && (
                                        <MDBox mb={2}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={4}>
                                                    <MDTypography variant="body2" color="text.secondary">
                                                        Call Premium: {formatCurrency(stats.optionsFlow.callPremium)}
                                                    </MDTypography>
                                                </Grid>
                                                <Grid item xs={12} md={4}>
                                                    <MDTypography variant="body2" color="text.secondary">
                                                        Put Premium: {formatCurrency(stats.optionsFlow.putPremium)}
                                                    </MDTypography>
                                                </Grid>
                                                <Grid item xs={12} md={4}>
                                                    <MDTypography variant="body2" color="text.secondary">
                                                        Put/Call Ratio: {stats.optionsFlow.putCallRatio.toFixed(2)}
                                                    </MDTypography>
                                                </Grid>
                                            </Grid>
                                        </MDBox>
                                    )}
                                    <DataTable
                                        table={{
                                            columns: [
                                                {
                                                    Header: "Type",
                                                    accessor: "type",
                                                    width: "10%",
                                                    Cell: ({ value }) => (
                                                        <Chip
                                                            label={value === "call" ? "CALL" : value === "put" ? "PUT" : value || "N/A"}
                                                            size="small"
                                                            color={value === "call" ? "success" : "error"}
                                                            variant="outlined"
                                                        />
                                                    ),
                                                },
                                                {
                                                    Header: "Strike",
                                                    accessor: "strike",
                                                    width: "10%",
                                                    Cell: ({ value }) => formatCurrency(value),
                                                },
                                                {
                                                    Header: "Premium",
                                                    accessor: "total_premium",
                                                    width: "15%",
                                                    Cell: ({ value }) => (
                                                        <MDTypography variant="body2" fontWeight="bold" color="info">
                                                            {formatCurrency(value)}
                                                        </MDTypography>
                                                    ),
                                                },
                                                { Header: "Volume", accessor: "volume", width: "10%" },
                                                {
                                                    Header: "Expiry",
                                                    accessor: "expiry",
                                                    width: "15%",
                                                    Cell: ({ value }) => formatDate(value, "fr-FR", false),
                                                },
                                                {
                                                    Header: "Date",
                                                    accessor: "created_at",
                                                    width: "15%",
                                                    Cell: ({ value }) => formatDate(value, "fr-FR", true),
                                                },
                                            ],
                                            rows: data,
                                        }}
                                        canSearch={true}
                                        entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
                                        showTotalEntries={true}
                                        pagination={{ variant: "gradient", color: "dark" }}
                                        isSorted={true}
                                        noEndBorder={false}
                                    />
                                </>
                            ) : (
                                <MDTypography variant="body2" color="text.secondary">
                                    Aucun flow d&apos;options disponible
                                </MDTypography>
                            )}
                        </MDBox>
                    </Card>
                );

            case "darkPool":
                return (
                    <Card>
                        <MDBox p={3}>
                            <MDBox display="flex" alignItems="center" gap={1} mb={2}>
                                <MDTypography variant="h6" fontWeight="medium">
                                    Dark Pool Trades ({data.length})
                                </MDTypography>
                                <Tooltip title="En savoir plus sur cette donnée" arrow>
                                    <IconButton
                                        size="small"
                                        onClick={() => setHelpDialogOpen({ ...helpDialogOpen, darkPool: true })}
                                        sx={{
                                            color: "text.secondary",
                                            "&:hover": {
                                                color: "primary.main",
                                            },
                                        }}
                                    >
                                        <HelpOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </MDBox>
                            {data.length > 0 ? (
                                <>
                                    {stats?.darkPool && (
                                        <MDBox mb={2}>
                                            <MDTypography variant="body2" color="text.secondary">
                                                Volume Total: {formatVolume(stats.darkPool.totalVolume)}
                                            </MDTypography>
                                        </MDBox>
                                    )}
                                    <DataTable
                                        table={{
                                            columns: [
                                                {
                                                    Header: "Date",
                                                    accessor: "date",
                                                    width: "20%",
                                                    Cell: ({ value }) => formatDate(value, "fr-FR", true),
                                                },
                                                {
                                                    Header: "Volume",
                                                    accessor: "volume",
                                                    width: "20%",
                                                    Cell: ({ value }) => formatVolume(value || 0),
                                                },
                                                {
                                                    Header: "Prix",
                                                    accessor: "price",
                                                    width: "15%",
                                                    Cell: ({ value }) => formatCurrency(value),
                                                },
                                                {
                                                    Header: "Valeur",
                                                    accessor: "value",
                                                    width: "15%",
                                                    Cell: ({ value, row }) => {
                                                        const volume = parseFloat(row.original.volume || 0);
                                                        const price = parseFloat(row.original.price || 0);
                                                        return formatCurrency(volume * price);
                                                    },
                                                },
                                            ],
                                            rows: data,
                                        }}
                                        canSearch={true}
                                        entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
                                        showTotalEntries={true}
                                        pagination={{ variant: "gradient", color: "dark" }}
                                        isSorted={true}
                                        noEndBorder={false}
                                    />
                                </>
                            ) : (
                                <MDTypography variant="body2" color="text.secondary">
                                    Aucun trade dark pool disponible
                                </MDTypography>
                            )}
                        </MDBox>
                    </Card>
                );

            default:
                return (
                    <Card>
                        <MDBox p={3}>
                            <MDTypography variant="body2" color="text.secondary">
                                Onglet non implémenté
                            </MDTypography>
                        </MDBox>
                    </Card>
                );
        }
    };

    // Composant réutilisable pour les modals d'aide
    const HelpDialog = ({ open, onClose, title, children }) => (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <MDBox display="flex" justifyContent="space-between" alignItems="center">
                    <MDTypography variant="h5" fontWeight="bold">
                        {title}
                    </MDTypography>
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{ color: "text.secondary" }}
                    >
                        <CloseIcon />
                    </IconButton>
                </MDBox>
            </DialogTitle>
            <DialogContent>
                {children}
            </DialogContent>
            <DialogActions>
                <MDButton onClick={onClose} color="dark">
                    Fermer
                </MDButton>
            </DialogActions>
        </Dialog>
    );

    // Modal d'aide pour l'onglet Ownership
    const OwnershipHelpDialog = () => (
        <HelpDialog
            open={helpDialogOpen.ownership}
            onClose={() => setHelpDialogOpen({ ...helpDialogOpen, ownership: false })}
            title="📊 Propriété Institutionnelle"
        >
            <MDBox>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                        Qu&apos;est-ce que la Propriété Institutionnelle ?
                    </MDTypography>
                    <MDTypography variant="body2" color="text.secondary" mb={3}>
                        La Propriété Institutionnelle représente <strong>qui détient les actions d&apos;une entreprise</strong> parmi les investisseurs institutionnels (fonds, banques, assureurs, hedge funds, etc.).
                    </MDTypography>

                    <Divider sx={{ my: 2 }} />

                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                        📋 Source des Données
                    </MDTypography>
                    <MDBox mb={2}>
                        <MDTypography variant="body2" color="text.secondary" mb={1}>
                            Les données proviennent des <strong>formulaires 13F</strong> déposés auprès de la SEC (Securities and Exchange Commission) :
                        </MDTypography>
                        <MDBox component="ul" pl={3} mb={2}>
                            <MDTypography component="li" variant="body2" color="text.secondary" mb={0.5}>
                                <strong>Obligation</strong> : Toute institution gérant plus de $100M doit déclarer ses positions
                            </MDTypography>
                            <MDTypography component="li" variant="body2" color="text.secondary" mb={0.5}>
                                <strong>Fréquence</strong> : Déclarations trimestrielles (Q1, Q2, Q3, Q4)
                            </MDTypography>
                            <MDTypography component="li" variant="body2" color="text.secondary">
                                <strong>Délai</strong> : Déclaration dans les 45 jours suivant la fin du trimestre
                            </MDTypography>
                        </MDBox>
                    </MDBox>

                    <Divider sx={{ my: 2 }} />

                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                        📊 Colonnes Explicatives
                    </MDTypography>
                    <MDBox mb={2}>
                        <MDBox mb={2}>
                            <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                                Institution
                            </MDTypography>
                            <MDTypography variant="body2" color="text.secondary">
                                Nom de l&apos;institution qui détient les actions (ex: &quot;Vanguard Group Inc&quot;, &quot;BlackRock Inc&quot;).
                            </MDTypography>
                        </MDBox>
                        <MDBox mb={2}>
                            <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                                Shares
                            </MDTypography>
                            <MDTypography variant="body2" color="text.secondary">
                                Nombre d&apos;actions détenues par cette institution. Formaté en K (milliers), M (millions), B (milliards).
                            </MDTypography>
                        </MDBox>
                        <MDBox mb={2}>
                            <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                                Valeur
                            </MDTypography>
                            <MDTypography variant="body2" color="text.secondary">
                                Valeur actuelle de la position calculée comme : <strong>shares × prix actuel du ticker</strong>. Cette valeur change avec le cours de l&apos;action.
                            </MDTypography>
                        </MDBox>
                        <MDBox mb={2}>
                            <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                                Hedge Fund
                            </MDTypography>
                            <MDTypography variant="body2" color="text.secondary">
                                Indique si cette institution est un hedge fund. Les hedge funds sont souvent considérés comme des investisseurs sophistiqués (&quot;smart money&quot;).
                            </MDTypography>
                        </MDBox>
                        <MDBox mb={2}>
                            <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                                Report Date
                            </MDTypography>
                            <MDTypography variant="body2" color="text.secondary">
                                Date de fin du trimestre pour lequel le rapport a été établi. Exemple : <strong>30/09/2024</strong> pour le Q3 2024.
                            </MDTypography>
                        </MDBox>
                        <MDBox mb={2}>
                            <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                                Filing Date
                            </MDTypography>
                            <MDTypography variant="body2" color="text.secondary">
                                Date à laquelle le formulaire 13F a été déposé auprès de la SEC. Doit être dans les <strong>45 jours</strong> après la fin du trimestre (Report Date).
                            </MDTypography>
                        </MDBox>
                    </MDBox>

                    <Divider sx={{ my: 2 }} />

                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                        ⚠️ Points Importants
                    </MDTypography>
                    <MDBox component="ul" pl={3} mb={2}>
                        <MDTypography component="li" variant="body2" color="text.secondary" mb={1}>
                            Les données sont <strong>trimestrielles</strong>, pas en temps réel. Il y a un délai de 45 jours après la fin du trimestre.
                        </MDTypography>
                        <MDTypography component="li" variant="body2" color="text.secondary" mb={1}>
                            La valeur affichée est calculée avec le <strong>prix actuel</strong> du ticker, pas le prix au moment du rapport.
                        </MDTypography>
                        <MDTypography component="li" variant="body2" color="text.secondary">
                            Les données sont mises en cache pendant <strong>24 heures</strong> pour optimiser les performances.
                        </MDTypography>
                    </MDBox>

                    <Divider sx={{ my: 2 }} />

                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                        🎯 Cas d&apos;Usage
                    </MDTypography>
                    <MDBox component="ul" pl={3}>
                        <MDTypography component="li" variant="body2" color="text.secondary" mb={1}>
                            <strong>Analyse de concentration</strong> : Identifier les actionnaires majoritaires
                        </MDTypography>
                        <MDTypography component="li" variant="body2" color="text.secondary" mb={1}>
                            <strong>Suivi des &quot;smart money&quot;</strong> : Filtrer par hedge funds pour voir les décisions des investisseurs sophistiqués
                        </MDTypography>
                        <MDTypography component="li" variant="body2" color="text.secondary">
                            <strong>Valeur des positions</strong> : Estimer l&apos;exposition totale des institutions
                        </MDTypography>
                    </MDBox>
                </MDBox>
        </HelpDialog>
    );

    // Modals d'aide pour tous les autres onglets
    const ActivityHelpDialog = () => (
        <HelpDialog
            open={helpDialogOpen.activity}
            onClose={() => setHelpDialogOpen({ ...helpDialogOpen, activity: false })}
            title="💼 Transactions Institutionnelles"
        >
            <MDBox>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Qu&apos;est-ce que les Transactions Institutionnelles ?
                </MDTypography>
                <MDTypography variant="body2" color="text.secondary" mb={3}>
                    Les transactions institutionnelles montrent les <strong>achats et ventes récents</strong> effectués par les institutions (fonds, banques, hedge funds) pour ce ticker. Ces données proviennent des formulaires 13F et permettent de suivre les mouvements des &quot;smart money&quot;.
                </MDTypography>

                <Divider sx={{ my: 2 }} />

                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    📋 Source des Données
                </MDTypography>
                <MDBox mb={2}>
                    <MDTypography variant="body2" color="text.secondary" mb={1}>
                        Les données sont récupérées en deux étapes :
                    </MDTypography>
                    <MDBox component="ul" pl={3} mb={2}>
                        <MDTypography component="li" variant="body2" color="text.secondary" mb={0.5}>
                            <strong>Étape 1</strong> : Récupération des institutions qui détiennent le ticker (max 10 institutions)
                        </MDTypography>
                        <MDTypography component="li" variant="body2" color="text.secondary">
                            <strong>Étape 2</strong> : Pour chaque institution, récupération de son activité récente via Unusual Whales API
                        </MDTypography>
                    </MDBox>
                </MDBox>

                <Divider sx={{ my: 2 }} />

                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    📊 Colonnes Explicatives
                </MDTypography>
                <MDBox mb={2}>
                    <MDBox mb={2}>
                        <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                            Institution
                        </MDTypography>
                        <MDTypography variant="body2" color="text.secondary">
                            Nom de l&apos;institution qui a effectué la transaction.
                        </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                        <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                            Type
                        </MDTypography>
                        <MDTypography variant="body2" color="text.secondary">
                            Type de transaction : <strong>Achat</strong> (vert) ou <strong>Vente</strong> (rouge), déterminé par le signe du changement.
                        </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                        <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                            Changement
                        </MDTypography>
                        <MDTypography variant="body2" color="text.secondary">
                            Nombre d&apos;actions achetées (+) ou vendues (-). Formaté en K/M/B.
                        </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                        <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                            Prix
                        </MDTypography>
                        <MDTypography variant="body2" color="text.secondary">
                            Prix moyen de la transaction (avg_price).
                        </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                        <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                            Date
                        </MDTypography>
                        <MDTypography variant="body2" color="text.secondary">
                            Date de dépôt du formulaire 13F (filing_date).
                        </MDTypography>
                    </MDBox>
                </MDBox>

                <Divider sx={{ my: 2 }} />

                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    ⚠️ Points Importants
                </MDTypography>
                <MDBox component="ul" pl={3} mb={2}>
                    <MDTypography component="li" variant="body2" color="text.secondary" mb={1}>
                        Limité à <strong>10 institutions maximum</strong> pour éviter les surcharges et respecter les rate limits.
                    </MDTypography>
                    <MDTypography component="li" variant="body2" color="text.secondary" mb={1}>
                        Les données sont <strong>trimestrielles</strong> (formulaires 13F), pas en temps réel.
                    </MDTypography>
                    <MDTypography component="li" variant="body2" color="text.secondary">
                        Cache de <strong>24 heures</strong> pour optimiser les performances.
                    </MDTypography>
                </MDBox>
            </MDBox>
        </HelpDialog>
    );

    const HedgeFundsHelpDialog = () => (
        <HelpDialog
            open={helpDialogOpen.hedgeFunds}
            onClose={() => setHelpDialogOpen({ ...helpDialogOpen, hedgeFunds: false })}
            title="🏦 Hedge Funds"
        >
            <MDBox>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Qu&apos;est-ce qu&apos;un Hedge Fund ?
                </MDTypography>
                <MDTypography variant="body2" color="text.secondary" mb={3}>
                    Les hedge funds sont des <strong>fonds d&apos;investissement privés</strong> gérés par des professionnels. Ils sont souvent considérés comme des investisseurs sophistiqués (&quot;smart money&quot;) car ils utilisent des stratégies avancées et ont accès à des informations privilégiées.
                </MDTypography>

                <Divider sx={{ my: 2 }} />

                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    📋 Source des Données
                </MDTypography>
                <MDTypography variant="body2" color="text.secondary" mb={2}>
                    Les données proviennent des formulaires 13F, filtrées pour ne montrer que les institutions identifiées comme hedge funds (is_hedge_fund = true).
                </MDTypography>

                <Divider sx={{ my: 2 }} />

                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    🎯 Pourquoi Suivre les Hedge Funds ?
                </MDTypography>
                <MDBox component="ul" pl={3}>
                    <MDTypography component="li" variant="body2" color="text.secondary" mb={1}>
                        <strong>Smart Money</strong> : Les hedge funds sont souvent en avance sur le marché
                    </MDTypography>
                    <MDTypography component="li" variant="body2" color="text.secondary" mb={1}>
                        <strong>Stratégies avancées</strong> : Utilisation de produits dérivés, short selling, etc.
                    </MDTypography>
                    <MDTypography component="li" variant="body2" color="text.secondary">
                        <strong>Influence sur le marché</strong> : Leurs mouvements peuvent influencer le prix
                    </MDTypography>
                </MDBox>
            </MDBox>
        </HelpDialog>
    );

    const InsidersHelpDialog = () => (
        <HelpDialog
            open={helpDialogOpen.insiders}
            onClose={() => setHelpDialogOpen({ ...helpDialogOpen, insiders: false })}
            title="👔 Transactions Insiders"
        >
            <MDBox>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Qu&apos;est-ce qu&apos;une Transaction Insider ?
                </MDTypography>
                <MDTypography variant="body2" color="text.secondary" mb={3}>
                    Les transactions insiders sont les <strong>achats et ventes d&apos;actions</strong> effectués par les dirigeants, administrateurs et employés clés d&apos;une entreprise. Ces transactions doivent être déclarées à la SEC via les formulaires 4, 3 et 5.
                </MDTypography>

                <Divider sx={{ my: 2 }} />

                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    📋 Source des Données
                </MDTypography>
                <MDTypography variant="body2" color="text.secondary" mb={2}>
                    Les données proviennent de l&apos;API Unusual Whales, qui agrège les formulaires SEC 4, 3 et 5 déposés par les insiders.
                </MDTypography>

                <Divider sx={{ my: 2 }} />

                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    📊 Colonnes Explicatives
                </MDTypography>
                <MDBox mb={2}>
                    <MDBox mb={2}>
                        <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                            Nom
                        </MDTypography>
                        <MDTypography variant="body2" color="text.secondary">
                            Nom de l&apos;insider (dirigeant, administrateur, employé clé).
                        </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                        <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                            Titre
                        </MDTypography>
                        <MDTypography variant="body2" color="text.secondary">
                            Fonction de l&apos;insider dans l&apos;entreprise (CEO, CFO, Director, etc.).
                        </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                        <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                            Type
                        </MDTypography>
                        <MDTypography variant="body2" color="text.secondary">
                            Type de transaction : <strong>Achat</strong> (code A ou P) ou <strong>Vente</strong> (code D).
                        </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                        <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                            Montant
                        </MDTypography>
                        <MDTypography variant="body2" color="text.secondary">
                            Valeur totale de la transaction en USD.
                        </MDTypography>
                    </MDBox>
                </MDBox>

                <Divider sx={{ my: 2 }} />

                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    🎯 Pourquoi Suivre les Insiders ?
                </MDTypography>
                <MDBox component="ul" pl={3}>
                    <MDTypography component="li" variant="body2" color="text.secondary" mb={1}>
                        <strong>Information privilégiée</strong> : Les insiders connaissent mieux l&apos;entreprise
                    </MDTypography>
                    <MDTypography component="li" variant="body2" color="text.secondary" mb={1}>
                        <strong>Signal d&apos;achat</strong> : Les achats massifs peuvent indiquer une confiance
                    </MDTypography>
                    <MDTypography component="li" variant="body2" color="text.secondary">
                        <strong>Signal de vente</strong> : Les ventes peuvent indiquer des préoccupations
                    </MDTypography>
                </MDBox>
            </MDBox>
        </HelpDialog>
    );

    const CongressHelpDialog = () => (
        <HelpDialog
            open={helpDialogOpen.congress}
            onClose={() => setHelpDialogOpen({ ...helpDialogOpen, congress: false })}
            title="🏛️ Transactions du Congrès"
        >
            <MDBox>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Qu&apos;est-ce que les Transactions du Congrès ?
                </MDTypography>
                <MDTypography variant="body2" color="text.secondary" mb={3}>
                    Les transactions du Congrès montrent les <strong>achats et ventes d&apos;actions</strong> effectués par les membres du Congrès américain (Sénat et Chambre des Représentants). Ces transactions sont publiques depuis le STOCK Act de 2012.
                </MDTypography>

                <Divider sx={{ my: 2 }} />

                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    📋 Source des Données
                </MDTypography>
                <MDTypography variant="body2" color="text.secondary" mb={2}>
                    Les données proviennent de l&apos;API Unusual Whales, qui agrège les déclarations publiques des membres du Congrès.
                </MDTypography>

                <Divider sx={{ my: 2 }} />

                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    📊 Colonnes Explicatives
                </MDTypography>
                <MDBox mb={2}>
                    <MDBox mb={2}>
                        <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                            Nom
                        </MDTypography>
                        <MDTypography variant="body2" color="text.secondary">
                            Nom du membre du Congrès.
                        </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                        <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                            Type
                        </MDTypography>
                        <MDTypography variant="body2" color="text.secondary">
                            Chambre : <strong>Sénat</strong> (senate) ou <strong>Chambre des Représentants</strong> (house).
                        </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                        <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                            Transaction
                        </MDTypography>
                        <MDTypography variant="body2" color="text.secondary">
                            Type : <strong>Buy</strong> (achat) ou <strong>Sell</strong> (vente).
                        </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                        <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                            Montant
                        </MDTypography>
                        <MDTypography variant="body2" color="text.secondary">
                            Fourchette de montant de la transaction (ex: &quot;$500,000 - $1,000,000&quot;).
                        </MDTypography>
                    </MDBox>
                </MDBox>

                <Divider sx={{ my: 2 }} />

                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    🎯 Pourquoi Suivre les Transactions du Congrès ?
                </MDTypography>
                <MDBox component="ul" pl={3}>
                    <MDTypography component="li" variant="body2" color="text.secondary" mb={1}>
                        <strong>Information privilégiée</strong> : Les membres du Congrès ont accès à des informations non publiques
                    </MDTypography>
                    <MDTypography component="li" variant="body2" color="text.secondary" mb={1}>
                        <strong>Influence réglementaire</strong> : Leurs décisions peuvent affecter les secteurs
                    </MDTypography>
                    <MDTypography component="li" variant="body2" color="text.secondary">
                        <strong>Transparence</strong> : Suivre les conflits d&apos;intérêts potentiels
                    </MDTypography>
                </MDBox>
            </MDBox>
        </HelpDialog>
    );

    const OptionsHelpDialog = () => (
        <HelpDialog
            open={helpDialogOpen.options}
            onClose={() => setHelpDialogOpen({ ...helpDialogOpen, options: false })}
            title="📈 Options Flow"
        >
            <MDBox>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Qu&apos;est-ce que le Options Flow ?
                </MDTypography>
                <MDTypography variant="body2" color="text.secondary" mb={3}>
                    Le Options Flow montre les <strong>transactions d&apos;options importantes</strong> (calls et puts) pour ce ticker. Les options sont des contrats qui donnent le droit (mais pas l&apos;obligation) d&apos;acheter ou vendre une action à un prix fixe avant une date d&apos;expiration.
                </MDTypography>

                <Divider sx={{ my: 2 }} />

                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    📋 Source des Données
                </MDTypography>
                <MDTypography variant="body2" color="text.secondary" mb={2}>
                    Les données proviennent de l&apos;API Unusual Whales, qui surveille les transactions d&apos;options avec un premium élevé (par défaut &gt; $10,000).
                </MDTypography>

                <Divider sx={{ my: 2 }} />

                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    📊 Colonnes Explicatives
                </MDTypography>
                <MDBox mb={2}>
                    <MDBox mb={2}>
                        <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                            Type
                        </MDTypography>
                        <MDTypography variant="body2" color="text.secondary">
                            <strong>CALL</strong> : Droit d&apos;acheter (haussiers) ou <strong>PUT</strong> : Droit de vendre (baissiers).
                        </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                        <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                            Strike
                        </MDTypography>
                        <MDTypography variant="body2" color="text.secondary">
                            Prix d&apos;exercice de l&apos;option (prix auquel l&apos;action peut être achetée/vendue).
                        </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                        <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                            Premium
                        </MDTypography>
                        <MDTypography variant="body2" color="text.secondary">
                            Montant total payé pour l&apos;option (total_premium). Plus le premium est élevé, plus la transaction est importante.
                        </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                        <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                            Volume
                        </MDTypography>
                        <MDTypography variant="body2" color="text.secondary">
                            Nombre de contrats d&apos;options échangés.
                        </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                        <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                            Expiry
                        </MDTypography>
                        <MDTypography variant="body2" color="text.secondary">
                            Date d&apos;expiration de l&apos;option.
                        </MDTypography>
                    </MDBox>
                </MDBox>

                <Divider sx={{ my: 2 }} />

                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    🎯 Pourquoi Suivre le Options Flow ?
                </MDTypography>
                <MDBox component="ul" pl={3}>
                    <MDTypography component="li" variant="body2" color="text.secondary" mb={1}>
                        <strong>Sentiment du marché</strong> : Les calls indiquent un sentiment haussier, les puts baissier
                    </MDTypography>
                    <MDTypography component="li" variant="body2" color="text.secondary" mb={1}>
                        <strong>Activité institutionnelle</strong> : Les grandes transactions sont souvent des institutions
                    </MDTypography>
                    <MDTypography component="li" variant="body2" color="text.secondary">
                        <strong>Prédiction de prix</strong> : Le strike price peut indiquer où les investisseurs pensent que le prix va aller
                    </MDTypography>
                </MDBox>
            </MDBox>
        </HelpDialog>
    );

    const DarkPoolHelpDialog = () => (
        <HelpDialog
            open={helpDialogOpen.darkPool}
            onClose={() => setHelpDialogOpen({ ...helpDialogOpen, darkPool: false })}
            title="🌊 Dark Pool Trades"
        >
            <MDBox>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Qu&apos;est-ce qu&apos;un Dark Pool ?
                </MDTypography>
                <MDTypography variant="body2" color="text.secondary" mb={3}>
                    Les dark pools sont des <strong>marchés privés</strong> où les grandes institutions peuvent échanger de gros volumes d&apos;actions sans révéler leurs intentions au marché public. Les transactions sont exécutées hors des bourses traditionnelles.
                </MDTypography>

                <Divider sx={{ my: 2 }} />

                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    📋 Source des Données
                </MDTypography>
                <MDTypography variant="body2" color="text.secondary" mb={2}>
                    Les données proviennent de l&apos;API Unusual Whales, qui surveille les transactions dark pool déclarées (certaines dark pools doivent déclarer leurs transactions avec un délai).
                </MDTypography>

                <Divider sx={{ my: 2 }} />

                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    📊 Colonnes Explicatives
                </MDTypography>
                <MDBox mb={2}>
                    <MDBox mb={2}>
                        <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                            Date
                        </MDTypography>
                        <MDTypography variant="body2" color="text.secondary">
                            Date de la transaction dark pool.
                        </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                        <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                            Volume
                        </MDTypography>
                        <MDTypography variant="body2" color="text.secondary">
                            Nombre d&apos;actions échangées dans la dark pool.
                        </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                        <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                            Prix
                        </MDTypography>
                        <MDTypography variant="body2" color="text.secondary">
                            Prix d&apos;exécution de la transaction.
                        </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                        <MDTypography variant="subtitle2" fontWeight="bold" mb={0.5}>
                            Valeur
                        </MDTypography>
                        <MDTypography variant="body2" color="text.secondary">
                            Valeur totale de la transaction (volume × prix).
                        </MDTypography>
                    </MDBox>
                </MDBox>

                <Divider sx={{ my: 2 }} />

                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    🎯 Pourquoi Suivre les Dark Pools ?
                </MDTypography>
                <MDBox component="ul" pl={3}>
                    <MDTypography component="li" variant="body2" color="text.secondary" mb={1}>
                        <strong>Activité institutionnelle</strong> : Les dark pools sont principalement utilisées par les grandes institutions
                    </MDTypography>
                    <MDTypography component="li" variant="body2" color="text.secondary" mb={1}>
                        <strong>Impact sur le prix</strong> : Les gros volumes peuvent influencer le prix même s&apos;ils ne sont pas visibles immédiatement
                    </MDTypography>
                    <MDTypography component="li" variant="body2" color="text.secondary">
                        <strong>Détection de mouvements</strong> : Identifier les grandes transactions avant qu&apos;elles n&apos;affectent le marché public
                    </MDTypography>
                </MDBox>

                <Divider sx={{ my: 2 }} />

                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    ⚠️ Points Importants
                </MDTypography>
                <MDBox component="ul" pl={3}>
                    <MDTypography component="li" variant="body2" color="text.secondary" mb={1}>
                        Les dark pools ne sont <strong>pas toutes transparentes</strong> - certaines transactions peuvent ne pas être déclarées
                    </MDTypography>
                    <MDTypography component="li" variant="body2" color="text.secondary">
                        Il y a un <strong>délai de déclaration</strong> - les données peuvent être retardées
                    </MDTypography>
                </MDBox>
            </MDBox>
        </HelpDialog>
    );

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <OwnershipHelpDialog />
            <ActivityHelpDialog />
            <HedgeFundsHelpDialog />
            <InsidersHelpDialog />
            <CongressHelpDialog />
            <OptionsHelpDialog />
            <DarkPoolHelpDialog />
            <MDBox py={3}>
                <MDBox mb={3}>
                    <MDTypography variant="h4" fontWeight="medium">
                        📊 Activité par Ticker
                    </MDTypography>
                    <MDTypography variant="body2" color="text.secondary">
                        Visualisez toutes les activités institutionnelles, hedge funds, whales pour un ticker
                    </MDTypography>
                </MDBox>

                {/* Recherche avec Autocomplete */}
                <Card sx={{ mb: 3 }} >
                    <MDBox p={3}  >
                        <MDBox display="flex" gap={2} alignItems="center">
                            <Autocomplete
                                sx={{ maxWidth: '300px', width: '100%' }}
                                freeSolo
                                options={searchStocks(symbol).slice(0, 20)}
                                value={null}
                                inputValue={symbol}
                                onInputChange={(event, newInputValue, reason) => {
                                    // Permettre la modification libre du texte à tout moment
                                    // reason peut être: "input", "clear", "reset", "blur"
                                    // On accepte tous les types de changements pour permettre la modification libre
                                    if (reason !== "reset") {
                                        setSymbol(newInputValue);
                                    }
                                }}
                                onChange={(event, newValue) => {
                                    // Ne mettre à jour que si une option est sélectionnée depuis la liste
                                    // Ne pas interférer avec la saisie libre
                                    if (newValue && typeof newValue !== "string" && newValue.symbol) {
                                        // Option sélectionnée depuis la liste
                                        setSymbol(newValue.symbol.toUpperCase().trim());
                                    } else if (newValue === null) {
                                        // Option effacée
                                        setSymbol("");
                                        setSelectedSymbol(null);
                                    }
                                    // Si newValue est une string, on laisse onInputChange gérer
                                }}
                                clearOnBlur={false}
                                selectOnFocus={false}
                                getOptionLabel={(option) => {
                                    if (typeof option === "string") return option;
                                    return option.symbol || option.name || "";
                                }}
                                renderInput={(params) => (
                                    <MDInput
                                        {...params}
                                        label="Symbole"
                                        placeholder="Ex: TSLA, AAPL, NVDA"
                                        onKeyPress={(e) => {
                                            if (e.key === "Enter") {
                                                handleSearch();
                                            }
                                        }}
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <Box component="li" {...props}>
                                        <MDBox>
                                            <MDTypography variant="body2" fontWeight="bold">
                                                {option.symbol}
                                            </MDTypography>
                                            <MDTypography variant="caption" color="text.secondary">
                                                {option.name}
                                            </MDTypography>
                                        </MDBox>
                                    </Box>
                                )}
                            />
                            <MDButton
                                variant="gradient"
                                color="info"
                                onClick={handleSearch}
                                disabled={!symbol.trim()}
                            >
                                <Icon>search</Icon>&nbsp;Rechercher
                            </MDButton>
                            {quote && (
                                <MDBox ml="auto">
                                    <MDTypography variant="h6" fontWeight="medium" color="text">
                                        {formatCurrency(quote.price || quote.close)}
                                    </MDTypography>
                                    {quote.changePercent && (
                                        <MDTypography
                                            variant="caption"
                                            color={quote.changePercent >= 0 ? "success" : "error"}
                                        >
                                            {formatPercentage(quote.changePercent)}
                                        </MDTypography>
                                    )}
                                </MDBox>
                            )}
                            {loadingQuote && <LinearProgress sx={{ width: 100 }} />}
                        </MDBox>
                    </MDBox>
                </Card>

                {/* Message d'erreur */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Statistiques */}
                {stats && (
                    <MDBox mb={3}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={3}>
                                <Tooltip
                                    title="Nombre total d'institutions (banques, fonds de pension, compagnies d'assurance, etc.) qui détiennent ce titre dans leurs portefeuilles selon les derniers dépôts 13F."
                                    arrow
                                    placement="top"
                                >
                                    <Box>
                                        <MiniStatisticsCard
                                            title="Institutions Détentrices"
                                            count={stats.totalInstitutions}
                                            icon={{ color: "info", component: "business" }}
                                        />
                                    </Box>
                                </Tooltip>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Tooltip
                                    title="Nombre de hedge funds parmi les institutions détentrices. Les hedge funds sont des fonds d'investissement alternatifs gérés activement."
                                    arrow
                                    placement="top"
                                >
                                    <Box>
                                        <MiniStatisticsCard
                                            title="Hedge Funds Détenteurs"
                                            count={stats.totalHedgeFunds}
                                            icon={{ color: "warning", component: "account_balance" }}
                                        />
                                    </Box>
                                </Tooltip>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Tooltip
                                    title="Valeur totale en dollars de toutes les positions institutionnelles détenues dans ce titre, calculée à partir des dernières données 13F et du prix actuel."
                                    arrow
                                    placement="top"
                                >
                                    <Box>
                                        <MiniStatisticsCard
                                            title="Valeur Institutionnelle Totale"
                                            count={formatCurrency(stats.totalInstitutionalValue)}
                                            icon={{ color: "success", component: "attach_money" }}
                                        />
                                    </Box>
                                </Tooltip>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Tooltip
                                    title="Activité nette récente : nombre de transactions d'achat moins le nombre de transactions de vente par les institutions au cours de la période récente. Positif = plus d'achats, Négatif = plus de ventes."
                                    arrow
                                    placement="top"
                                >
                                    <Box>
                                        <MiniStatisticsCard
                                            title="Activité Nette Récente"
                                            count={stats.netActivity > 0 ? `+${stats.netActivity}` : stats.netActivity}
                                            icon={{
                                                color: stats.netActivity > 0 ? "success" : "error",
                                                component: "trending_up"
                                            }}
                                        />
                                    </Box>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </MDBox>
                )}

                {/* Onglets */}
                {selectedSymbol && (
                    <>
                        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                            <Tabs value={currentTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                                {tabs.map((tab, index) => {
                                    const tabState = tabData[tab.id];
                                    const isLoading = tabState?.loading;
                                    const hasData = tabState?.loaded && tabState?.data && Array.isArray(tabState.data) && tabState.data.length > 0;
                                    const hasError = tabState?.error;

                                    return (
                                        <Tab
                                            key={index}
                                            label={
                                                <MDBox display="flex" alignItems="center" gap={1}>
                                                    {tab.label}
                                                    {isLoading && <LinearProgress sx={{ width: 20, height: 2 }} />}
                                                    {hasData && !isLoading && (
                                                        <Chip label={tabState.data.length} size="small" color="success" />
                                                    )}
                                                    {hasError && <Icon color="error" fontSize="small">error</Icon>}
                                                </MDBox>
                                            }
                                        />
                                    );
                                })}
                            </Tabs>
                        </Box>

                        {/* Contenu selon l'onglet */}
                        {(() => {
                            const currentTabId = tabs[currentTab].id;
                            const tabState = tabData[currentTabId];

                            if (tabState?.loading) {
                                return (
                                    <Card>
                                        <MDBox p={3}>
                                            <MDTypography variant="h6" fontWeight="medium" mb={2}>
                                                {tabs[currentTab].label}
                                            </MDTypography>
                                            <TableSkeleton />
                                        </MDBox>
                                    </Card>
                                );
                            }

                            if (tabState?.error) {
                                return (
                                    <Card>
                                        <MDBox p={3}>
                                            <Alert severity="error">{tabState.error}</Alert>
                                        </MDBox>
                                    </Card>
                                );
                            }

                            if (!tabState?.loaded) {
                                return (
                                    <Card>
                                        <MDBox p={3} textAlign="center">
                                            <MDTypography variant="body2" color="text.secondary">
                                                Cliquez sur un onglet pour charger les donn&eacute;es
                                            </MDTypography>
                                        </MDBox>
                                    </Card>
                                );
                            }

                            // Rendu spécifique par onglet
                            return renderTabContent(currentTabId, tabState);
                        })()}
                    </>
                )}

                {!selectedSymbol && (
                    <Card>
                        <MDBox p={3} textAlign="center">
                            <MDTypography variant="body2" color="text.secondary">
                                Recherchez un symbole pour commencer
                            </MDTypography>
                        </MDBox>
                    </Card>
                )}
            </MDBox>
            <Footer />
        </DashboardLayout>
    );
}

export default withAuth(TickerActivity);
