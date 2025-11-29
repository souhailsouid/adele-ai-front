

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
    name: "Dashboards",
    key: "dashboards",
    icon: <Icon fontSize="medium">dashboard</Icon>,
    collapse: [  
      {
        name: "Trading",
        key: "trading",
        icon: <Icon fontSize="medium">trending_up</Icon>,
        collapse: [
          {
            name: "Vue d'ensemble",
            key: "trading-overview",
            route: "/dashboards/trading/overview",
          },
          {
            name: "Earnings",
            key: "trading-earnings",
            route: "/dashboards/trading/earnings",
          },
          {
            name: "Screener",
            key: "trading-screener",
            route: "/dashboards/trading/screener",
          },
          {
            name: "Calendrier Économique",
            key: "trading-economic",
            route: "/dashboards/trading/economic",
          },
          {
            name: "Alertes",
            key: "trading-alerts",
            route: "/dashboards/trading/alerts",
          },
          {
            name: "Analyse Financière",
            key: "trading-financial-analysis",
            route: "/dashboards/trading/financial-analysis",
          },
        ],
      },
      {
        name: "Unusual Whales",
        key: "trading-unusual-whales",
        icon: <Icon fontSize="medium">trending_up</Icon>,
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
        name: "Crypto",
        key: "crypto",
        icon: <Icon fontSize="medium">trending_up</Icon>,
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
    ],
    },
  

 


  { type: "divider", key: "divider-1" },
  { type: "title", title: "Docs", key: "title-docs" },
  {
    type: "collapse",
    name: "Basic",
    key: "basic",
    icon: <Icon fontSize="medium">upcoming</Icon>,
    collapse: [
      {
        name: "Getting Started",
        key: "getting-started",
        collapse: [
          {
            name: "Overview",
            key: "overview",
            href: "https://www.creative-tim.com/learning-lab/nextjs/overview/material-dashboard/",
          },
          {
            name: "License",
            key: "license",
            href: "https://www.creative-tim.com/learning-lab/nextjs/license/material-dashboard/",
          },
          {
            name: "Quick Start",
            key: "quick-start",
            href: "https://www.creative-tim.com/learning-lab/nextjs/quick-start/material-dashboard/",
          },
          {
            name: "Build Tools",
            key: "build-tools",
            href: "https://www.creative-tim.com/learning-lab/nextjs/build-tools/material-dashboard/",
          },
        ],
      },
      {
        name: "Foundation",
        key: "foundation",
        collapse: [
          {
            name: "Colors",
            key: "colors",
            href: "https://www.creative-tim.com/learning-lab/nextjs/colors/material-dashboard/",
          },
          {
            name: "Grid",
            key: "grid",
            href: "https://www.creative-tim.com/learning-lab/nextjs/grid/material-dashboard/",
          },
          {
            name: "Typography",
            key: "base-typography",
            href: "https://www.creative-tim.com/learning-lab/nextjs/base-typography/material-dashboard/",
          },
          {
            name: "Borders",
            key: "borders",
            href: "https://www.creative-tim.com/learning-lab/nextjs/borders/material-dashboard/",
          },
          {
            name: "Box Shadows",
            key: "box-shadows",
            href: "https://www.creative-tim.com/learning-lab/nextjs/box-shadows/material-dashboard/",
          },
          {
            name: "Functions",
            key: "functions",
            href: "https://www.creative-tim.com/learning-lab/nextjs/functions/material-dashboard/",
          },
          {
            name: "Routing System",
            key: "routing-system",
            href: "https://www.creative-tim.com/learning-lab/nextjs/routing-system/material-dashboard/",
          },
        ],
      },
    ],
  },
  {
    type: "collapse",
    name: "Components",
    key: "/components",
    icon: <Icon fontSize="medium">view_in_ar</Icon>,
    collapse: [
      {
        name: "Alerts",
        key: "alerts",
        href: "https://www.creative-tim.com/learning-lab/nextjs/alerts/material-dashboard/",
      },
      {
        name: "Avatar",
        key: "avatar",
        href: "https://www.creative-tim.com/learning-lab/nextjs/avatar/material-dashboard/",
      },
      {
        name: "Badge",
        key: "badge",
        href: "https://www.creative-tim.com/learning-lab/nextjs/badge/material-dashboard/",
      },
      {
        name: "Badge Dot",
        key: "badge-dot",
        href: "https://www.creative-tim.com/learning-lab/nextjs/badge-dot/material-dashboard/",
      },
      {
        name: "Box",
        key: "box",
        href: "https://www.creative-tim.com/learning-lab/nextjs/box/material-dashboard/",
      },
      {
        name: "Buttons",
        key: "buttons",
        href: "https://www.creative-tim.com/learning-lab/nextjs/buttons/material-dashboard/",
      },
      {
        name: "Date Picker",
        key: "date-picker",
        href: "https://www.creative-tim.com/learning-lab/nextjs/datepicker/material-dashboard/",
      },
      {
        name: "Dropzone",
        key: "dropzone",
        href: "https://www.creative-tim.com/learning-lab/nextjs/dropzone/material-dashboard/",
      },
      {
        name: "Editor",
        key: "editor",
        href: "https://www.creative-tim.com/learning-lab/nextjs/quill/material-dashboard/",
      },
      {
        name: "Input",
        key: "input",
        href: "https://www.creative-tim.com/learning-lab/nextjs/input/material-dashboard/",
      },
      {
        name: "Pagination",
        key: "pagination",
        href: "https://www.creative-tim.com/learning-lab/nextjs/pagination/material-dashboard/",
      },
      {
        name: "Progress",
        key: "progress",
        href: "https://www.creative-tim.com/learning-lab/nextjs/progress/material-dashboard/",
      },
      {
        name: "Snackbar",
        key: "snackbar",
        href: "https://www.creative-tim.com/learning-lab/nextjs/snackbar/material-dashboard/",
      },
      {
        name: "Social Button",
        key: "social-button",
        href: "https://www.creative-tim.com/learning-lab/nextjs/social-buttons/material-dashboard/",
      },
      {
        name: "Typography",
        key: "typography",
        href: "https://www.creative-tim.com/learning-lab/nextjs/typography/material-dashboard/",
      },
    ],
  },
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    route: "/dashboards/sales",
    icon: <Icon fontSize="medium">dashboard</Icon>,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Campaigns",
    key: "campaigns",
    route: "/campaigns",
    icon: <Icon fontSize="medium">apps</Icon>,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Contacts",
    key: "contacts",
    route: "/ecommerce/orders/order-details",
    icon: <Icon sx={{ fontSize: "medium" }}>account_circle</Icon>,
    noCollapse: true,
  },

  {
    type: "collapse",
    name: "Change Log",
    key: "changelog",
    route: "https://github.com/creativetimofficial/ct-nextjs-material-dashboard-pro/blob/main/CHANGELOG.md",
    icon: <Icon fontSize="medium">receipt_long</Icon>,
    noCollapse: true,
  },
  ];

  return routes;
}

// Export par défaut pour compatibilité (retourne les routes sans utilisateur)
const routes = getRoutes();
export default routes;

// Export de la fonction pour utilisation dynamique
export { getRoutes };
