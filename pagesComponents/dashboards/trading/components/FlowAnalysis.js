import { useState } from "react";
import MDBox from "/components/MDBox";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import MDTypography from "/components/MDTypography";
import FlowPerExpiry from "./FlowPerExpiry";
import FlowPerStrike from "./FlowPerStrike";
import FlowRecent from "./FlowRecent";
// Note: FlowAlerts component already exists, we'll create a wrapper
import FlowAlertsWrapper from "./FlowAlertsWrapper";
import OptionPriceLevels from "./OptionPriceLevels";

function FlowAnalysis({ ticker = "", date = "", onError = () => {}, onLoading = () => {} }) {
  const [subTab, setSubTab] = useState("per-expiry");

  if (!ticker) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Veuillez sélectionner un ticker pour voir les analyses de flow.
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  return (
    <MDBox>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs value={subTab} onChange={(e, v) => setSubTab(v)} variant="scrollable" scrollButtons="auto">
              <Tab label="Flow per Expiry" value="per-expiry" />
              <Tab label="Flow per Strike" value="per-strike" />
              <Tab label="Flow Recent" value="recent" />
              <Tab label="Flow Alerts" value="alerts" />
              <Tab label="Option Price Levels" value="price-levels" />
            </Tabs>
      </Box>
      {subTab === "per-expiry" && <FlowPerExpiry key={`${ticker}-expiry`} ticker={ticker} />}
      {subTab === "per-strike" && <FlowPerStrike key={`${ticker}-strike-${date}`} ticker={ticker} date={date} />}
      {subTab === "recent" && <FlowRecent key={`${ticker}-recent`} ticker={ticker} />}
      {subTab === "alerts" && <FlowAlertsWrapper key={`${ticker}-alerts`} ticker={ticker} />}
      {subTab === "price-levels" && <OptionPriceLevels key={`${ticker}-${date}-price-levels`} ticker={ticker} date={date} onError={onError} onLoading={onLoading} />}
    </MDBox>
  );
}

export default FlowAnalysis;

