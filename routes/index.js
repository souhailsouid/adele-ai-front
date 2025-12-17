

/** 
  All of the routes for the NextJS Material Dashboard 2 PRO are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that contains other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
*/

// NextJS Material Dashboard 2 PRO components
import MDAvatar from "/components/MDAvatar";

// @mui icons
import Icon from "@mui/material/Icon";

// Images
import profilePicture from "/avatar.jpg";

/**
 * Génère les routes avec les informations utilisateur dynamiques
 * @param {Object} user - Informations de l'utilisateur connecté
 * @param {string} user.firstName - Prénom de l'utilisateur
 * @param {string} user.lastName - Nom de l'utilisateur
 * @param {string} user.email - Email de l'utilisateur (fallback si pas de nom/prénom)
 * @returns {Array} Tableau de routes
 */
function getRoutes(user = null) {
  // Construire le nom d'affichage
  let displayName = "User";
  if (user) {
    if (user.firstName && user.lastName) {
      displayName = `${user.firstName.split(" ")[0]}`;
    } else if (user.firstName) {
      displayName = user.firstName;
    } else if (user.lastName) {
      displayName = user.lastName;
    } else if (user.email) {
      // Utiliser l'email comme fallback
      displayName = user.email.split("@")[0];
    }
  }

  const routes = [
    {
      type: "collapse",
      name: displayName,
      key: "user-profile",
      icon: <MDAvatar src={profilePicture.src} alt={displayName} size="sm" />,
      collapse: [
        {
          name: "Logout",
          key: "logout",
          route: "/authentication/sign-in/basic",
        },
      ],
    },
    { type: "divider", key: "divider-0" },
    {
      type: "collapse",
      name: "Trading",
      key: "trading",
      icon: <Icon fontSize="medium">dashboard</Icon>,
      collapse: [
        {
          name: "Accueil",
          key: "trading-home",
          route: "/dashboards/trading",
        },
        {
          name: "Vue d'ensemble",
          key: "trading-overview-dashboard",
          route: "/dashboards/trading/overview-dashboard",
        },
        {
          name: "Calendrier Économique",
          key: "trading-economic",
          route: "/dashboards/trading/economic",
        },
      
      
      
        {
          name: "Estimations Analystes",
          key: "trading-analyst-estimates",
          route: "/dashboards/trading/analyst-estimates",
        },
        {
          name: "Valorisation DCF",
          key: "trading-dcf-valuation",
          route: "/dashboards/trading/dcf-valuation",
        }

      ],
    },
    {
      type: "collapse",
      name: "Unusual Whales",
      key: "unusual-whales",
      icon: <Icon fontSize="medium">Whale</Icon>,
      collapse: [

        {
          name: "Unusual Whales Overview",
          key: "trading-unusual-whales-overview",
          route: "/dashboards/trading/unusual-whales",
        },
        {
          name: "Congress",
          key: "trading-congress",
          route: "/dashboards/trading/congress",
        },
        {
          name: "Correlations",
          key: "trading-correlations",
          route: "/dashboards/trading/correlations",
        },
        {
          name: "Greek Flow",
          key: "trading-greek-flow",
          route: "/dashboards/trading/greek-flow",
        },
        {
          name: "Stock State",
          key: "trading-stock-state",
          route: "/dashboards/trading/stock-state",
        },
        {
          name: "Institutions",
          key: "trading-institutions",
          route: "/dashboards/trading/institutions",
        },
        {
          name: "Insider Buy/Sells",
          key: "trading-insider-buysells",
          route: "/dashboards/trading/insider-buysells",
        },
      {
        name: "🐋 Whale Tracker",
        key: "trading-whale-tracker",
        route: "/dashboards/trading/whale-tracker",
      },
      {
        name: "🧠 Portfolio Intelligence",
        key: "trading-portfolio-intelligence",
        route: "/dashboards/trading/portfolio-intelligence",
      },
      {
        name: "🔍 Opportunities Scanner",
        key: "trading-opportunities-scanner",
        route: "/dashboards/trading/opportunities-scanner",
      },
      {
        name: "🔥 Guru Flow Tracker",
        key: "trading-guru-flow-tracker",
        route: "/dashboards/trading/guru-flow-tracker",
      },
      {
        name: "📊 Activité par Ticker",
        key: "trading-ticker-activity",
        route: "/dashboards/trading/ticker-activity",
      },
      {
        name: "🔍 Ticker Insights",
        key: "trading-ticker-insights",
        route: "/dashboards/trading/ticker-insights",
      },
        {
          name: "FDA Calendar",
          key: "trading-fda-calendar",
          route: "/dashboards/trading/fda-calendar",
        },
        {
          name: "News",
          key: "trading-news",
          route: "/dashboards/trading/news",
        },
        {
          name: "Option Contracts",
          key: "trading-option-contracts",
          route: "/dashboards/trading/option-contracts",
        },
        {
          name: "Politician Portfolios",
          key: "trading-politician-portfolios",
          route: "/dashboards/trading/politician-portfolios",
        },
        {
          name: "UW Screeners",
          key: "trading-unusual-whales-screener",
          route: "/dashboards/trading/unusual-whales-screener",
        },
        {
          name: "Seasonality",
          key: "trading-seasonality",
          route: "/dashboards/trading/seasonality",
        },
        {
          name: "Short Data",
          key: "trading-short-data",
          route: "/dashboards/trading/short-data",
        },
        {
          name: "Ticker Analysis",
          key: "trading-ticker-analysis",
          route: "/dashboards/trading/ticker-analysis",
        },
        {
          name: "Historique des Prix",
          key: "trading-price-history",
          route: "/dashboards/trading/price-history",
        },
        {
          name: "13F Filings",
          key: "trading-13f-filings",
          route: "/dashboards/trading/13f-filings",
        },
      ],
    },
    {
      type: "collapse",
      name: "Crypto",
      key: "crypto",
      icon: <Icon fontSize="medium">currency_bitcoin</Icon>,
      collapse: [

        {
          name: "Crypto Overview",
          key: "crypto-overview",
          route: "/dashboards/trading/crypto",
        },
        {
          name: "Crypto Whales",
          key: "trading-crypto-whales",
          route: "/dashboards/trading/crypto-whales",
        },
        {
          name: "Wallet Details",
          key: "trading-wallet-details",
          route: "/dashboards/trading/wallet-details",
        },


      ],
    },
    {
      type: "collapse",
      name: "Intelligence",
      key: "intelligence",
      icon: <Icon fontSize="medium">psychology</Icon>,
      collapse: [
        {
          name: "Vue d'ensemble",
          key: "intelligence-overview",
          route: "/dashboards/intelligence/overview",
        },
        {
          name: "Analyse Complète",
          key: "intelligence-complete-analysis",
          route: "/dashboards/intelligence/complete-analysis",
        },
        {
          name: "Divergence Analysis",
          key: "intelligence-divergence",
          route: "/dashboards/intelligence/divergence-analysis",
        },
        {
          name: "Valuation Complète",
          key: "intelligence-valuation",
          route: "/dashboards/intelligence/valuation",
        },
        {
          name: "Earnings Prediction",
          key: "intelligence-earnings-prediction",
          route: "/dashboards/intelligence/earnings-prediction",
        },
        {
          name: "Risk Analysis",
          key: "intelligence-risk-analysis",
          route: "/dashboards/intelligence/risk-analysis",
        },
        {
          name: "Sector Analysis",
          key: "intelligence-sector-analysis",
          route: "/dashboards/intelligence/sector-analysis",
        },
        {
          name: "Multi-Criteria Screener",
          key: "intelligence-screener",
          route: "/dashboards/intelligence/multi-criteria-screener",
        },
        {
          name: "Scoring Ticker",
          key: "intelligence-ticker-scoring",
          route: "/dashboards/intelligence/ticker-scoring",
        },
        {
          name: "Gamma Squeeze",
          key: "intelligence-gamma-squeeze",
          route: "/dashboards/intelligence/gamma-squeeze",
        },
        {
          name: "Market Intelligence",
          key: "intelligence-market",
          route: "/dashboards/intelligence/market",
        },
        {
          name: "Surveillance",
          key: "intelligence-surveillance",
          route: "/dashboards/intelligence/surveillance",
        },
        {
          name: "Alerts Management",
          key: "intelligence-alerts",
          route: "/dashboards/intelligence/alerts",
        },
        {
          name: "Smart Money",
          key: "intelligence-smart-money",
          route: "/dashboards/intelligence/smart-money",
        },
        {
          name: "Radar Options",
          key: "trading-radar-options",
          route: "/dashboards/trading/radar-options",
        },
        {
          name: "Options Analysis",
          key: "trading-options-analysis",
          route: "/dashboards/trading/options-analysis",
        },
      ],
    },





    { type: "divider", key: "divider-1" },








  ];

  return routes;
}

// Export par défaut pour compatibilité (retourne les routes sans utilisateur)
const routes = getRoutes();
export default routes;

// Export de la fonction pour utilisation dynamique
export { getRoutes };
