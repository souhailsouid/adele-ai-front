/**
 * Mini-avatar des fonds célèbres
 * Affiche les avatars des gestionnaires de fonds connus (Burry, Tepper, Buffett, etc.)
 */

import MDBox from "/components/MDBox";
import MDAvatar from "/components/MDAvatar";
import MDTypography from "/components/MDTypography";
import Tooltip from "@mui/material/Tooltip";

const FUND_AVATARS = {
  burry: { name: "Michael Burry", emoji: "🧠", color: "#1976d2" },
  tepper: { name: "David Tepper", emoji: "💰", color: "#388e3c" },
  buffett: { name: "Warren Buffett", emoji: "📈", color: "#f57c00" },
  ackman: { name: "Bill Ackman", emoji: "🎯", color: "#7b1fa2" },
  icahn: { name: "Carl Icahn", emoji: "⚡", color: "#c2185b" },
  dalio: { name: "Ray Dalio", emoji: "🌊", color: "#0288d1" },
  default: { name: "Institution", emoji: "🏛️", color: "#616161" },
};

function FundAvatar({ fundName, size = "md" }) {
  // Détecter le fond basé sur le nom
  const getFundInfo = (name) => {
    if (!name) return FUND_AVATARS.default;
    
    const nameLower = name.toLowerCase();
    if (nameLower.includes("burry") || nameLower.includes("scion")) {
      return FUND_AVATARS.burry;
    }
    if (nameLower.includes("tepper") || nameLower.includes("appaloosa")) {
      return FUND_AVATARS.tepper;
    }
    if (nameLower.includes("buffett") || nameLower.includes("berkshire")) {
      return FUND_AVATARS.buffett;
    }
    if (nameLower.includes("ackman") || nameLower.includes("pershing")) {
      return FUND_AVATARS.ackman;
    }
    if (nameLower.includes("icahn")) {
      return FUND_AVATARS.icahn;
    }
    if (nameLower.includes("dalio") || nameLower.includes("bridgewater")) {
      return FUND_AVATARS.dalio;
    }
    return FUND_AVATARS.default;
  };

  const fundInfo = getFundInfo(fundName);
  const sizeMap = {
    sm: 32,
    md: 40,
    lg: 56,
  };

  return (
    <Tooltip title={fundName || fundInfo.name} arrow>
      <MDBox
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: sizeMap[size] || 40,
          height: sizeMap[size] || 40,
          borderRadius: "50%",
          backgroundColor: fundInfo.color,
          color: "white",
          fontSize: size === "sm" ? "1rem" : size === "lg" ? "1.5rem" : "1.2rem",
          fontWeight: "bold",
          cursor: "pointer",
          transition: "transform 0.2s",
          "&:hover": {
            transform: "scale(1.1)",
          },
        }}
      >
        {fundInfo.emoji}
      </MDBox>
    </Tooltip>
  );
}

export default FundAvatar;



