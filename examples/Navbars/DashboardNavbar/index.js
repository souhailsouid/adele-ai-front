
import { useState, useEffect, useMemo } from "react";
import React from "react";

import Link from "next/link";
import { useRouter } from "next/router";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDInput from "/components/MDInput";
import MDBadge from "/components/MDBadge";
import MDTypography from "/components/MDTypography";

// NextJS Material Dashboard 2 PRO examples
import Breadcrumbs from "/examples/Breadcrumbs";
import NotificationItem from "/examples/Items/NotificationItem";

// Custom styles for DashboardNavbar
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarDesktopMenu,
  navbarMobileMenu,
} from "/examples/Navbars/DashboardNavbar/styles";

// NextJS Material Dashboard 2 PRO context
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from "/context";

// Routes
import { getRoutes } from "/routes";
import { useAuth } from "/context/AuthContext";

function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    transparentNavbar,
    fixedNavbar,
    openConfigurator,
    darkMode,
  } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const [anchorEls, setAnchorEls] = useState({});
  const route = useRouter().pathname.split("/").slice(1);
  const { user } = useAuth();
  
  // Récupérer les routes
  const routes = useMemo(() => getRoutes(user), [user]);

  useEffect(() => {
    // Setting the navbar type
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    // Désactiver la transparence - toujours avoir un fond blanc solide
    setTransparentNavbar(dispatch, false);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleConfiguratorOpen = () =>
    setOpenConfigurator(dispatch, !openConfigurator);
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(false);
  
  const handleMenuOpen = (event, key) => {
    setAnchorEls((prev) => ({ ...prev, [key]: event.currentTarget }));
  };

  const handleMenuClose = (key) => {
    setAnchorEls((prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    }));
  };

  // Transformer les routes de la sidenav en format de menu pour la navbar
  const menuItems = useMemo(() => {
    if (!routes || routes.length === 0) return [];

    return routes
      .filter((route) => {
        // Filtrer les routes de type collapse avec des sous-routes
        // Exclure les routes utilisateur (avatar) et les dividers/titles
        return (
          route.type === "collapse" &&
          route.collapse &&
          route.collapse.length > 0 &&
          route.key !== "user-profile"
        );
      })
      .map((route) => {
        const collapseItems = route.collapse.map((subRoute) => ({
          label: subRoute.name,
          href: subRoute.route || subRoute.href || "#",
        }));

        // Extraire l'icône (peut être string ou composant React)
        let iconName = "dashboard";
        if (route.icon) {
          if (typeof route.icon === "string") {
            iconName = route.icon;
          } else if (React.isValidElement(route.icon)) {
            const iconProps = route.icon.props || {};
            iconName = iconProps.children || "dashboard";
          }
        }

        return {
          key: route.key,
          label: route.name,
          icon: iconName,
          items: collapseItems,
        };
      });
  }, [routes]);

  // Render the notifications menu
  const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{ mt: 2 }}
    >
      <NotificationItem icon={<Icon>email</Icon>} title="Check new messages" />
      <NotificationItem
        icon={<Icon>podcasts</Icon>}
        title="Manage Podcast sessions"
      />
      <NotificationItem
        icon={<Icon>shopping_cart</Icon>}
        title="Payment successfully completed"
      />
    </Menu>
  );

  // Styles for the navbar icons
  const iconsStyle = ({
    palette: { dark, white, text },
    functions: { rgba },
  }) => ({
    color: () => {
      console.log("transparentNavbar", transparentNavbar);
      let colorValue = light || darkMode ? white.main : dark.main;

      if (transparentNavbar && !light) {
        console.log("transparentNavbar and !light", transparentNavbar, !light);
        console.log("darkMode", darkMode);
        console.log('colorValue', colorValue);
        console.log("rgba(text.main, 0.6)", rgba(text.main, 0.6));
        console.log("text.main", text.main);
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }

      return colorValue;
    },
  });

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) =>
        navbar(theme, { transparentNavbar, absolute, light, darkMode })
      }
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <MDBox
          color="inherit"
          mb={{ xs: 1, md: 0 }}
          sx={(theme) => navbarRow(theme, { isMini })}
        >
          <Breadcrumbs
            icon="home"
            title={route[route.length - 1]}
            route={route}
            light={light}
          />
          {/* Bouton menu sidenav désactivé */}
        </MDBox>
        {isMini ? null : (
          <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
            {/* Menus déroulants des routes */}
            {menuItems.length > 0 && (
              <MDBox
                sx={{
                  display: { xs: "none", lg: "flex" },
                  alignItems: "center",
                  gap: 0.5,
                  mr: 2,
                }}
              >
                {menuItems.map((item) => {
                  const anchorEl = anchorEls[item.key];
                  const open = Boolean(anchorEl);

                  return (
                    <MDBox key={item.key}>
                      <Button
                        onClick={(e) => handleMenuOpen(e, item.key)}
                        endIcon={<Icon sx={{ fontSize: "1rem" }}>{open ? "expand_less" : "expand_more"}</Icon>}
                        sx={{
                          color: light || darkMode ? "white" : "inherit",
                          textTransform: "none",
                          fontWeight: 500,
                          fontSize: "0.875rem",
                          gap: 0.5,
                          px: 1.5,
                          "&:hover": {
                            backgroundColor: light || darkMode 
                              ? "rgba(255, 255, 255, 0.08)" 
                              : "rgba(0, 0, 0, 0.04)",
                          },
                        }}
                      >
                        <Icon sx={{ fontSize: "1.25rem", mr: 0.5 }}>{item.icon}</Icon>
                        {item.label}
                      </Button>
                      <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={() => handleMenuClose(item.key)}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "left",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "left",
                        }}
                        PaperProps={{
                          sx: {
                            mt: 1,
                            minWidth: 250,
                            maxHeight: 400,
                            overflowY: "auto",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                            borderRadius: 2,
                          },
                        }}
                      >
                        {item.items.map((subItem, idx) => (
                          <MenuItem
                            key={idx}
                            component={Link}
                            href={subItem.href || "#"}
                            onClick={() => handleMenuClose(item.key)}
                            sx={{
                              borderRadius: 1,
                              mb: 0.5,
                              fontSize: "0.875rem",
                              "&:hover": {
                                backgroundColor: darkMode 
                                  ? "rgba(255, 255, 255, 0.08)" 
                                  : "rgba(0, 0, 0, 0.04)",
                              },
                            }}
                          >
                            {subItem.label}
                          </MenuItem>
                        ))}
                      </Menu>
                    </MDBox>
                  );
                })}
              </MDBox>
            )}
            
            <MDBox color={light ? "white" : "inherit"}>
              <Link
                href="/authentication/sign-in/basic"
                passHref
                legacyBehavior
              >
                <IconButton sx={navbarIconButton} size="small" disableRipple>
                  <Icon sx={iconsStyle}>account_circle</Icon>
                </IconButton>
              </Link>
              {renderMenu()}
            </MDBox>
          </MDBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

// Setting default values for the props of DashboardNavbar
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
