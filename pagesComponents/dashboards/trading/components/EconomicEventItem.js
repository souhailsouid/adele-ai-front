/**
 * Composant pour afficher un événement économique individuel
 * Style inspiré du composant Invoice
 */

import PropTypes from "prop-types";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Chip from "@mui/material/Chip";
import economicCalendarService from "/services/economicCalendarService";

function EconomicEventItem({ event, noGutter = false }) {
  if (!event) return null;

  const formatDate = (dateString, country) => {
    return economicCalendarService.formatEventDate(dateString, country);
  };

  const getCountryFlag = (country) => {
    const flags = {
      US: "🇺🇸",
      EU: "🇪🇺",
      GB: "🇬🇧",
      JP: "🇯🇵",
      CN: "🇨🇳",
      DE: "🇩🇪",
      FR: "🇫🇷",
      CA: "🇨🇦",
      AU: "🇦🇺",
    };
    return flags[country] || country;
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || typeof value !== 'number') {
      return "N/A";
    }
    return value.toFixed(2);
  };

  return (
    <MDBox
      component="li"
      display="flex"
      justifyContent="space-between"
      alignItems="flex-start"
      py={1.5}
      pr={1}
      mb={noGutter ? 0 : 1}
      sx={{
        borderBottom: noGutter ? "none" : "1px solid",
        borderColor: "divider",
      }}
    >
      <MDBox lineHeight={1.125} flex={1}>
        <MDBox display="flex" alignItems="center" gap={1} mb={0.5}>
          <MDTypography variant="button" fontWeight="medium">
            {getCountryFlag(event.country)} {event.country}
          </MDTypography>
          <Chip
            label={event.impact || "N/A"}
            color={economicCalendarService.getImpactColor(event.impact)}
            size="small"
            sx={{ height: 20 }}
          />
        </MDBox>
        <MDTypography display="block" variant="body2" fontWeight="medium" mb={0.5}>
          {event.event || "N/A"}
        </MDTypography>
        <MDTypography variant="caption" fontWeight="regular" color="text.secondary">
          {formatDate(event.date, event.country)}
          {event.currency && ` • ${event.currency}`}
        </MDTypography>
      </MDBox>
      <MDBox display="flex" flexDirection="column" alignItems="flex-end" gap={0.5} minWidth={120}>
        {event.actual !== null && event.actual !== undefined && typeof event.actual === 'number' ? (
          <>
            <MDTypography variant="button" fontWeight="bold" color="text">
              {formatValue(event.actual)}
            </MDTypography>
            {event.change !== null && event.change !== undefined && typeof event.change === 'number' && (
              <MDTypography
                variant="caption"
                color={event.change >= 0 ? "success" : "error"}
                fontWeight="medium"
              >
                {event.change >= 0 ? "+" : ""}{formatValue(event.change)}
              </MDTypography>
            )}
          </>
        ) : (
          <>
            {event.estimate !== null && event.estimate !== undefined && typeof event.estimate === 'number' ? (
              <MDTypography variant="button" fontWeight="regular" color="info">
                Est: {formatValue(event.estimate)}
              </MDTypography>
            ) : (
              <MDTypography variant="caption" color="text.secondary">
                À venir
              </MDTypography>
            )}
          </>
        )}
      </MDBox>
    </MDBox>
  );
}

EconomicEventItem.propTypes = {
  event: PropTypes.object.isRequired,
  noGutter: PropTypes.bool,
};

EconomicEventItem.defaultProps = {
  noGutter: false,
};

export default EconomicEventItem;

