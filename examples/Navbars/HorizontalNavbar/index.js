/**
 * Navbar horizontale - Version horizontale de la Sidenav
 * Réutilise exactement les mêmes composants et styles que la Sidenav
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";

// @mui material components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import MuiLink from "@mui/material/Link";
import Icon from "@mui/material/Icon";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";

// NextJS Material Dashboard 2 PRO examples
import SidenavCollapse from "/examples/Sidenav/SidenavCollapse";
import SidenavItem from "/examples/Sidenav/SidenavItem";

// Custom styles for the Sidenav
import sidenavLogoLabel from "/examples/Sidenav/styles/sidenav";

// NextJS Material Dashboard 2 PRO context
import {
  useMaterialUIController,
} from "/context";

function HorizontalNavbar({ color, brand, brandName, routes, ...rest }) {
  const [openCollapse, setOpenCollapse] = useState(false);
  const [openNestedCollapse, setOpenNestedCollapse] = useState(false);
  const [controller] = useMaterialUIController();
  const { transparentSidenav, whiteSidenav, darkMode } = controller;
  const { pathname } = useRouter();
  const collapseName = pathname.split("/").slice(1)[0];
  const items = pathname.split("/").slice(1);
  const itemParentName = items[1];
  const itemName = items[items.length - 1];

  let textColor = "white";

  if (transparentSidenav || (whiteSidenav && !darkMode)) {
    textColor = "dark";
  } else if (whiteSidenav && darkMode) {
    textColor = "inherit";
  }

  useEffect(() => {
    setOpenCollapse(collapseName);
    setOpenNestedCollapse(itemParentName);
  }, [collapseName, itemParentName]);

  // Render all the nested collapse items from the routes.js (identique à la sidenav)
  const renderNestedCollapse = (collapse) => {
    const template = collapse.map(({ name, route, key, href }) =>
      href ? (
        <MuiLink
          key={key}
          href={href}
          target="_blank"
          rel="noreferrer"
          sx={{ textDecoration: "none" }}
        >
          <SidenavItem name={name} nested />
        </MuiLink>
      ) : (
        <Link href={route} key={key} sx={{ textDecoration: "none" }}>
          <SidenavItem name={name} active={route === pathname} nested />
        </Link>
      )
    );

    return template;
  };

  // Render the all the routes from the routes.js (All the visible items on the Sidenav)
  const renderRoutes = routes.map(
    ({ type, name, icon, title, collapse, route, key, href, noCollapse }) => {
      let returnValue;

      if (type === "collapse") {
        if (href) {
          returnValue = (
            <MuiLink
              href={href}
              key={key}
              target="_blank"
              rel="noreferrer"
              sx={{ textDecoration: "none" }}
            >
              <SidenavCollapse
                name={name}
                icon={icon}
                active={key === collapseName}
                noCollapse={noCollapse}
              />
            </MuiLink>
          );
        } else if (noCollapse && route) {
          returnValue = (
            <Link href={route} key={key} passHref>
              <SidenavCollapse
                name={name}
                icon={icon}
                noCollapse={noCollapse}
                active={key === collapseName}
              >
                {collapse ? renderNestedCollapse(collapse) : null}
              </SidenavCollapse>
            </Link>
          );
        } else {
          returnValue = (
            <SidenavCollapse
              key={key}
              name={name}
              icon={icon}
              active={key === collapseName}
              open={openCollapse === key}
              onClick={() =>
                openCollapse === key
                  ? setOpenCollapse(false)
                  : setOpenCollapse(key)
              }
            >
              {collapse ? renderNestedCollapse(collapse) : null}
            </SidenavCollapse>
          );
        }
      } else if (type === "title") {
        returnValue = (
          <MDTypography
            key={key}
            color={textColor}
            display="block"
            variant="caption"
            fontWeight="bold"
            textTransform="uppercase"
            pl={2}
            mt={1}
            mb={0.5}
          >
            {title}
          </MDTypography>
        );
      } else if (type === "divider") {
        returnValue = (
          <Divider
            key={key}
            light={
              (!darkMode && !whiteSidenav && !transparentSidenav) ||
              (darkMode && !transparentSidenav && whiteSidenav)
            }
            sx={{ my: 1 }}
          />
        );
      }

      return returnValue;
    }
  );

  // Déterminer le background (comme dans SidenavRoot)
  const getBackground = (theme) => {
    const { palette, functions } = theme;
    const { transparent, gradients, white, background } = palette;
    const { linearGradient } = functions;

    if (darkMode) {
      return background.sidenav;
    }
    if (transparentSidenav) {
      return transparent.main;
    }
    if (whiteSidenav) {
      return white.main;
    }
    // Gradient dark par défaut
    return linearGradient(gradients.dark.main, gradients.dark.state);
  };

  return (
    <AppBar
      position="fixed"
      sx={(theme) => ({
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        background: getBackground(theme),
        boxShadow: transparentSidenav ? "none" : theme.boxShadows.xxl,
        border: "none",
      })}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: "64px !important",
          px: 2,
        }}
      >
        {/* Brand - Identique à la sidenav */}
        <MDBox
          component={Link}
          href="/"
          display="flex"
          alignItems="center"
          gap={1}
          sx={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          {brand && (brand.src ? (
            <MDBox
              component="img"
              src={brand.src}
              alt={brandName}
              width="1.75rem"
            />
          ) : (
            brand
          ))}
          <MDBox
            sx={(theme) => sidenavLogoLabel(theme, { miniSidenav: false })}
          >
            <MDTypography
              component="h6"
              variant="button"
              fontWeight="medium"
              color={textColor}
            >
              {brandName}
            </MDTypography>
          </MDBox>
        </MDBox>

        {/* Navigation - Liste horizontale avec les mêmes composants que la sidenav */}
        <MDBox
          component="nav"
          sx={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
            overflowX: "auto",
            ml: 2,
            "&::-webkit-scrollbar": {
              display: "none",
            },
            scrollbarWidth: "none",
          }}
        >
          <List
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              p: 0,
              width: "100%",
              "& .MuiListItem-root": {
                width: "auto",
                minWidth: "auto",
                pl: 1.5,
                pr: 1.5,
                mt: 0,
                mb: 0,
                display: "inline-flex",
              },
              "& .MuiCollapse-root": {
                position: "absolute",
                top: "100%",
                left: 0,
                zIndex: 1300,
                mt: 0.5,
              },
            }}
          >
            {renderRoutes}
          </List>
        </MDBox>
      </Toolbar>
    </AppBar>
  );
}

// Setting default values for the props of HorizontalNavbar
HorizontalNavbar.defaultProps = {
  color: "dark",
  brand: "",
};

// Typechecking props for the HorizontalNavbar
HorizontalNavbar.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "dark",
    "light",
  ]),
  brand: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default HorizontalNavbar;
