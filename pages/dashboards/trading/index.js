/**
 * Trading Dashboard - Page d'accueil avec navigation par cartes
 */

import { useState } from "react";
import { useRouter } from "next/router";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import DashboardLayout from "/examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/examples/Navbars/DashboardNavbar";
import Footer from "/examples/Footer";
import Icon from "@mui/material/Icon";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";

// Configuration des cartes de navigation organisées par catégories
const navigationCards = [
  // === VUE D'ENSEMBLE & INTELLIGENCE ===
  {
    id: "overview-dashboard",
    title: "Vue d'ensemble",
    description: "Latest Filings, Calendrier High Impact et Options Flow combinés",
    route: "/dashboards/trading/overview-dashboard",
    icon: "dashboard",
    color: "primary",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    category: "overview",
  },
  
  
  // === ACTIVITÉ PAR TICKER ===
  {
    id: "ticker-activity",
    title: "Ticker Activity",
    description: "Visualisez l'activité complète d'un ticker : options, insider, institutions, etc.",
    route: "/dashboards/trading/ticker-activity",
    icon: "trending_up",
    color: "primary",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    category: "ticker",
  },
  {
    id: "ai-ticker-analysis",
    title: "🤖 AI Ticker Analysis",
    description: "Analyse LLM enrichie de l'activité complète et du Options Flow d'un ticker",
    route: "/dashboards/trading/ai-ticker-analysis",
    icon: "psychology",
    color: "info",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    category: "ticker",
  },
  {
    id: "ticker-insights",
    title: "Ticker Insights",
    description: "Analyse approfondie d'un ticker avec insights et recommandations",
    route: "/dashboards/trading/ticker-insights",
    icon: "insights",
    color: "info",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    category: "ticker",
  },
  {
    id: "ticker-analysis",
    title: "Ticker Analysis",
    description: "Analyse technique et fondamentale complète d'un ticker",
    route: "/dashboards/trading/ticker-analysis",
    icon: "analytics",
    color: "info",
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    category: "ticker",
  },
  {
    id: "price-history",
    title: "Historique des Prix",
    description: "Historique des prix, graphiques et données historiques",
    route: "/dashboards/trading/price-history",
    icon: "timeline",
    color: "info",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    category: "ticker",
  },
  
  // === INSTITUTIONS & WHALES ===
  {
    id: "institutions",
    title: "Institutions",
    description: "Analysez les mouvements institutionnels, 13F filings, et holdings",
    route: "/dashboards/trading/institutions",
    icon: "account_balance",
    color: "info",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    category: "institutions",
  },
  {
    id: "ai-institution-analysis",
    title: "🤖 AI Institution Analysis",
    description: "Analyse LLM enrichie des mouvements institutionnels avec stratégies et opportunités",
    route: "/dashboards/trading/ai-institution-analysis",
    icon: "psychology",
    color: "info",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    category: "institutions",
  },
  {
    id: "13f-filings",
    title: "13F Filings",
    description: "Derniers dépôts 13F des institutions, holdings et changements",
    route: "/dashboards/trading/13f-filings",
    icon: "description",
    color: "info",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    category: "institutions",
  },
  {
    id: "whale-tracker",
    title: "Whale Tracker",
    description: "Suivez les baleines (gurus) qui peuvent faire trembler les marchés",
    route: "/dashboards/trading/whale-tracker",
    icon: "waves",
    color: "info",
    gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    category: "institutions",
  },
  {
    id: "guru-flow-tracker",
    title: "Guru Flow Tracker",
    description: "Suivez les mouvements des gurus et investisseurs célèbres",
    route: "/dashboards/trading/guru-flow-tracker",
    icon: "person",
    color: "info",
    gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    category: "institutions",
  },
  
  // === OPTIONS ===
  {
    id: "option-contracts",
    title: "Options Contracts",
    description: "Explorez les contrats d'options, chaînes d'options et flux",
    route: "/dashboards/trading/option-contracts",
    icon: "show_chart",
    color: "error",
    gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    category: "options",
  },
  {
    id: "greek-flow",
    title: "Greek Flow",
    description: "Analyse des grecs (Delta, Gamma, Theta, Vega) et flux d'options",
    route: "/dashboards/trading/greek-flow",
    icon: "functions",
    color: "error",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    category: "options",
  },
  {
    id: "radar-options",
    title: "📡 Radar Options",
    description: "Lecture qualitative options : exploitable ou à ignorer rapidement",
    route: "/dashboards/trading/radar-options",
    icon: "radar",
    color: "error",
    gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    category: "options",
  },
  {
    id: "options-analysis",
    title: "📊 Options Analysis",
    description: "Analyse complète avec bias, niveaux clés et rapport détaillé",
    route: "/dashboards/trading/options-analysis",
    icon: "analytics",
    color: "error",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    category: "options",
  },
  
  // === INSIDERS & CONGRESS ===
  {
    id: "insider-buysells",
    title: "Insider Buy/Sells",
    description: "Transactions des initiés : achats et ventes d'actions par les dirigeants",
    route: "/dashboards/trading/insider-buysells",
    icon: "person_pin",
    color: "warning",
    gradient: "linear-gradient(135deg, #fad961 0%, #f76b1c 100%)",
    category: "insiders",
  },
  {
    id: "congress",
    title: "Congress Trades",
    description: "Transactions des membres du Congrès américain",
    route: "/dashboards/trading/congress",
    icon: "gavel",
    color: "warning",
    gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    category: "insiders",
  },
  {
    id: "politician-portfolios",
    title: "Politician Portfolios",
    description: "Portefeuilles et transactions des politiciens",
    route: "/dashboards/trading/politician-portfolios",
    icon: "how_to_vote",
    color: "warning",
    gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    category: "insiders",
  },
  
  // === CALENDRIERS ===
  {
    id: "economic",
    title: "Calendrier Économique",
    description: "Événements économiques importants : FED, taux d'intérêt, indicateurs macro",
    route: "/dashboards/trading/economic",
    icon: "event",
    color: "success",
    gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    category: "calendars",
  },
  {
    id: "fda-calendar",
    title: "FDA Calendar",
    description: "Calendrier des décisions FDA et événements pharmaceutiques",
    route: "/dashboards/trading/fda-calendar",
    icon: "calendar_today",
    color: "success",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    category: "calendars",
  },
  
  // === ANALYSE & VALUATION ===
  {
    id: "analyst-estimates",
    title: "Estimations Analystes",
    description: "Estimations et recommandations des analystes financiers",
    route: "/dashboards/trading/analyst-estimates",
    icon: "assessment",
    color: "success",
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    category: "analysis",
  },
  {
    id: "dcf-valuation",
    title: "Valorisation DCF",
    description: "Modèle de valorisation Discounted Cash Flow",
    route: "/dashboards/trading/dcf-valuation",
    icon: "calculate",
    color: "success",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    category: "analysis",
  },
  
  // === SCREENERS & OPPORTUNITÉS ===
  {
    id: "opportunities-scanner",
    title: "Opportunities Scanner",
    description: "Scanner d'opportunités de trading et d'investissement",
    route: "/dashboards/trading/opportunities-scanner",
    icon: "search",
    color: "secondary",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    category: "screener",
  },
  {
    id: "unusual-whales-screener",
    title: "UW Screeners",
    description: "Screeners Unusual Whales pour identifier des opportunités",
    route: "/dashboards/trading/unusual-whales-screener",
    icon: "filter_list",
    color: "secondary",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    category: "screener",
  },
  
  // === DONNÉES MARCHÉ ===
  {
    id: "short-data",
    title: "Short Data",
    description: "Données de vente à découvert, ratios et tendances",
    route: "/dashboards/trading/short-data",
    icon: "trending_down",
    color: "secondary",
    gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    category: "market",
  },
  {
    id: "stock-state",
    title: "Stock State",
    description: "État actuel des actions, momentum et tendances",
    route: "/dashboards/trading/stock-state",
    icon: "bar_chart",
    color: "secondary",
    gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    category: "market",
  },
  {
    id: "correlations",
    title: "Correlations",
    description: "Analyse des corrélations entre différents actifs",
    route: "/dashboards/trading/correlations",
    icon: "compare_arrows",
    color: "secondary",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    category: "market",
  },
  {
    id: "seasonality",
    title: "Seasonality",
    description: "Analyse de saisonnalité et patterns récurrents",
    route: "/dashboards/trading/seasonality",
    icon: "calendar_view_month",
    color: "secondary",
    gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    category: "market",
  },
  
  // === CRYPTO ===
  {
    id: "crypto-overview",
    title: "Crypto Overview",
    description: "Vue d'ensemble du marché crypto et principales cryptomonnaies",
    route: "/dashboards/trading/crypto",
    icon: "currency_bitcoin",
    color: "warning",
    gradient: "linear-gradient(135deg, #fad961 0%, #f76b1c 100%)",
    category: "crypto",
  },
  {
    id: "crypto-whales",
    title: "Crypto Whales",
    description: "Suivez les baleines crypto et leurs transactions importantes",
    route: "/dashboards/trading/crypto-whales",
    icon: "waves",
    color: "warning",
    gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    category: "crypto",
  },
  
  // === INTELLIGENCE & PORTFOLIO ===
  {
    id: "portfolio-intelligence",
    title: "Portfolio Intelligence",
    description: "Intelligence artificielle pour l'analyse de portefeuille",
    route: "/dashboards/trading/portfolio-intelligence",
    icon: "folder_special",
    color: "primary",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    category: "intelligence",
  },
  
  // === NEWS & ACTUALITÉS ===
  {
    id: "news",
    title: "News",
    description: "Actualités financières et analyses de marché en temps réel",
    route: "/dashboards/trading/news",
    icon: "article",
    color: "warning",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    category: "news",
  },
];

function TradingDashboard() {
  const router = useRouter();
  const theme = useTheme();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleCardClick = (route) => {
    router.push(route);
  };

  // Grouper les cartes par catégorie
  const categories = [
    { id: "all", label: "Toutes", icon: "apps" },
    { id: "overview", label: "Vue d'ensemble", icon: "dashboard" },
    { id: "ticker", label: "Activité Ticker", icon: "trending_up" },
    { id: "institutions", label: "Institutions", icon: "account_balance" },
    { id: "options", label: "Options", icon: "show_chart" },
    { id: "insiders", label: "Insiders", icon: "person_pin" },
    { id: "calendars", label: "Calendriers", icon: "event" },
    { id: "analysis", label: "Analyse", icon: "analytics" },
    { id: "screener", label: "Screeners", icon: "search" },
    { id: "market", label: "Marché", icon: "bar_chart" },
    { id: "crypto", label: "Crypto", icon: "currency_bitcoin" },
    { id: "intelligence", label: "Intelligence", icon: "psychology" },
    { id: "news", label: "Actualités", icon: "article" },
  ];

  // Filtrer les cartes par catégorie
  const filteredCards = selectedCategory === "all" 
    ? navigationCards 
    : navigationCards.filter(card => card.category === selectedCategory);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={4}>
          <MDTypography variant="h3" fontWeight="bold" mb={1}>
            Trading Dashboard
          </MDTypography>
          <MDTypography variant="body1" color="text.secondary">
            Accédez rapidement aux différentes fonctionnalités de trading et d&apos;analyse
          </MDTypography>
        </MDBox>

        {/* Filtres par catégorie */}
        <MDBox mb={3} sx={{ overflowX: "auto", pb: 1 }}>
          <MDBox display="flex" gap={1} sx={{ flexWrap: "nowrap", minWidth: "max-content" }}>
            {categories.map((category) => {
              const count = category.id === "all" 
                ? navigationCards.length 
                : navigationCards.filter(card => card.category === category.id).length;
              
              return (
                <Chip
                  key={category.id}
                  label={`${category.label} (${count})`}
                  icon={<Icon>{category.icon}</Icon>}
                  onClick={() => setSelectedCategory(category.id)}
                  clickable
                  color={selectedCategory === category.id ? "primary" : "default"}
                  variant={selectedCategory === category.id ? "filled" : "outlined"}
                  sx={{
                    cursor: "pointer",
                    fontWeight: selectedCategory === category.id ? "bold" : "normal",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 2,
                    },
                  }}
                />
              );
            })}
          </MDBox>
        </MDBox>

        {/* Compteur de résultats */}
        <MDBox mb={2}>
          <MDTypography variant="body2" color="text.secondary">
            {filteredCards.length} fonctionnalité{filteredCards.length > 1 ? "s" : ""} disponible{filteredCards.length > 1 ? "s" : ""}
            {selectedCategory !== "all" && ` dans la catégorie "${categories.find(c => c.id === selectedCategory)?.label}"`}
          </MDTypography>
        </MDBox>

        <Grid container spacing={3}>
          {filteredCards.map((card) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={card.id}>
              <Card
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  transition: "all 0.3s ease-in-out",
                  background: hoveredCard === card.id ? card.gradient : "white",
                  boxShadow: hoveredCard === card.id 
                    ? `0 8px 24px rgba(0, 0, 0, 0.15)` 
                    : `0 2px 8px rgba(0, 0, 0, 0.1)`,
                  transform: hoveredCard === card.id ? "translateY(-8px)" : "translateY(0)",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: `0 8px 24px rgba(0, 0, 0, 0.15)`,
                  },
                }}
                onClick={() => handleCardClick(card.route)}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <CardContent sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
                  <MDBox
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={2}
                  >
                    <MDBox
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: hoveredCard === card.id 
                          ? "rgba(255, 255, 255, 0.2)" 
                          : card.gradient,
                        transition: "all 0.3s ease-in-out",
                      }}
                    >
                      <Icon 
                        sx={{ 
                          fontSize: 32, 
                          color: hoveredCard === card.id ? "white" : "white",
                        }}
                      >
                        {card.icon}
                      </Icon>
                    </MDBox>
                    <Chip
                      label="Accéder"
                      size="small"
                      sx={{
                        backgroundColor: hoveredCard === card.id 
                          ? "rgba(255, 255, 255, 0.2)" 
                          : "grey.100",
                        color: hoveredCard === card.id ? "white" : "text.primary",
                        fontWeight: "bold",
                        transition: "all 0.3s ease-in-out",
                      }}
                    />
                  </MDBox>

                  <MDTypography
                    variant="h5"
                    fontWeight="bold"
                    mb={1}
                    sx={{
                      color: hoveredCard === card.id ? "white" : "text.primary",
                      transition: "color 0.3s ease-in-out",
                    }}
                  >
                    {card.title}
                  </MDTypography>

                  <MDTypography
                    variant="body2"
                    color={hoveredCard === card.id ? "rgba(255, 255, 255, 0.9)" : "text.secondary"}
                    sx={{
                      flexGrow: 1,
                      transition: "color 0.3s ease-in-out",
                    }}
                  >
                    {card.description}
                  </MDTypography>

                  <MDBox mt={2} display="flex" alignItems="center" gap={1}>
                    <MDTypography
                      variant="caption"
                      sx={{
                        color: hoveredCard === card.id ? "rgba(255, 255, 255, 0.8)" : "text.secondary",
                        fontWeight: "medium",
                        transition: "color 0.3s ease-in-out",
                      }}
                    >
                      Cliquer pour accéder
                    </MDTypography>
                    <Icon
                      sx={{
                        fontSize: 16,
                        color: hoveredCard === card.id ? "rgba(255, 255, 255, 0.8)" : "text.secondary",
                        transition: "all 0.3s ease-in-out",
                        transform: hoveredCard === card.id ? "translateX(4px)" : "translateX(0)",
                      }}
                    >
                      arrow_forward
                    </Icon>
                  </MDBox>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Section d'information supplémentaire */}
        <MDBox mt={4}>
          <Card sx={{ backgroundColor: "grey.50" }}>
            <MDBox p={3}>
              <MDBox display="flex" alignItems="center" gap={2} mb={2}>
                <Icon sx={{ fontSize: 32, color: "primary.main" }}>info</Icon>
                <MDTypography variant="h6" fontWeight="bold">
                  À propos du Trading Dashboard
                </MDTypography>
              </MDBox>
              <MDTypography variant="body2" color="text.secondary">
                Ce dashboard centralise l&apos;accès à toutes les fonctionnalités de trading et d&apos;analyse de marché. 
                Cliquez sur une carte pour accéder directement à la fonctionnalité souhaitée. 
                Chaque section offre des outils spécialisés pour l&apos;analyse technique, fondamentale et sentimentale.
              </MDTypography>
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TradingDashboard;
