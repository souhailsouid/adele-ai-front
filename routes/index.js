/**
=========================================================
* NextJS Material Dashboard 2 PRO - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/nextjs-material-dashboard-pro
* Copyright 2023Adele.ai(https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

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
import profilePicture from "/assets/images/team-3.jpg";

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
      displayName = `${user.firstName} ${user.lastName}`;
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
          name: "My Profile",
          key: "my-profile",
          route: "/pages/profile/profile-overview",
        },
        {
          name: "Settings",
          key: "profile-settings",
          route: "/pages/account/settings",
        },
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
        name: "Analytics",
        key: "analytics",
        route: "/dashboards/analytics",
      },
      {
        name: "Sales",
        key: "sales",
        route: "/dashboards/sales",
      },
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
          {
            name: "Unusual Whales",
            key: "trading-unusual-whales",
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
            name: "13F Filings",
            key: "trading-13f-filings",
            route: "/dashboards/trading/13f-filings",
          },
        ],
      },
    ],
  },
  { type: "title", title: "Pages", key: "title-pages" },
  {
    type: "collapse",
    name: "Pages",
    key: "pages",
    icon: <Icon fontSize="medium">image</Icon>,
    collapse: [
      {
        name: "Profile",
        key: "profile",
        collapse: [
          {
            name: "Profile Overview",
            key: "profile-overview",
            route: "/pages/profile/profile-overview",
          },
          {
            name: "All Projects",
            key: "all-projects",
            route: "/pages/profile/all-projects",
          },
        ],
      },
      {
        name: "Users",
        key: "users",
        collapse: [
          {
            name: "New User",
            key: "new-user",
            route: "/pages/users/new-user",
          },
        ],
      },
      {
        name: "Account",
        key: "account",
        collapse: [
          {
            name: "Settings",
            key: "settings",
            route: "/pages/account/settings",
          },
          {
            name: "Billing",
            key: "billing",
            route: "/pages/account/billing",
          },
          {
            name: "Invoice",
            key: "invoice",
            route: "/pages/account/invoice",
          },
        ],
      },
      {
        name: "Projects",
        key: "projects",
        collapse: [
          {
            name: "Timeline",
            key: "timeline",
            route: "/pages/projects/timeline",
          },
        ],
      },
      {
        name: "Pricing Page",
        key: "pricing-page",
        route: "/pages/pricing-page",
      },
      { name: "RTL", key: "rtl", route: "/pages/rtl" },
      {
        name: "Widgets",
        key: "widgets",
        route: "/pages/widgets",
      },
      {
        name: "Charts",
        key: "charts",
        route: "/pages/charts",
      },
      {
        name: "Notfications",
        key: "notifications",
        route: "/pages/notifications",
      },
    ],
  },
  {
    type: "collapse",
    name: "Applications",
    key: "applications",
    icon: <Icon fontSize="medium">apps</Icon>,
    collapse: [
      {
        name: "Kanban",
        key: "kanban",
        route: "/applications/kanban",
      },
      {
        name: "Wizard",
        key: "wizard",
        route: "/applications/wizard",
      },
      {
        name: "Data Tables",
        key: "data-tables",
        route: "/applications/data-tables",
      },
      {
        name: "Calendar",
        key: "calendar",
        route: "/applications/calendar",
      },
    ],
  },
  {
    type: "collapse",
    name: "Ecommerce",
    key: "ecommerce",
    icon: <Icon fontSize="medium">shopping_basket</Icon>,
    collapse: [
      {
        name: "Products",
        key: "products",
        collapse: [
          {
            name: "New Product",
            key: "new-product",
            route: "/ecommerce/products/new-product",
          },
          {
            name: "Edit Product",
            key: "edit-product",
            route: "/ecommerce/products/edit-product",
          },
          {
            name: "Product Page",
            key: "product-page",
            route: "/ecommerce/products/product-page",
          },
        ],
      },
      {
        name: "Orders",
        key: "orders",
        collapse: [
          {
            name: "Order List",
            key: "order-list",
            route: "/ecommerce/orders/order-list",
          },
          {
            name: "Order Details",
            key: "order-details",
            route: "/ecommerce/orders/order-details",
          },
        ],
      },
    ],
  },
  {
    type: "collapse",
    name: "Authentication",
    key: "authentication",
    icon: <Icon fontSize="medium">content_paste</Icon>,
    collapse: [
      {
        name: "Sign In",
        key: "sign-in",
        collapse: [
          {
            name: "Basic",
            key: "basic",
            route: "/authentication/sign-in/basic",
          },
          {
            name: "Cover",
            key: "cover",
            route: "/authentication/sign-in/cover",
          },
          {
            name: "Illustration",
            key: "illustration",
            route: "/authentication/sign-in/illustration",
          },
        ],
      },
      {
        name: "Sign Up",
        key: "sign-up",
        collapse: [
          {
            name: "Cover",
            key: "cover",
            route: "/authentication/sign-up/cover",
          },
        ],
      },
      {
        name: "Reset Password",
        key: "reset-password",
        collapse: [
          {
            name: "Cover",
            key: "cover",
            route: "/authentication/reset-password/cover",
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
    name: "Analytics",
    key: "analytics",
    route: "/dashboards/analytics",
    icon: <Icon sx={{ fontSize: "medium" }}>analytics</Icon>,
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
