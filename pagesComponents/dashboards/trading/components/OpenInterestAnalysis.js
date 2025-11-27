import { useState } from "react";
import MDBox from "/components/MDBox";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import MDTypography from "/components/MDTypography";

import OIChangeTicker from "./OIChangeTicker";
import OIPerExpiryTicker from "./OIPerExpiryTicker";
import OIPerStrikeTicker from "./OIPerStrikeTicker";
import VolumeOIExpiry from "./VolumeOIExpiry";

function OpenInterestAnalysis({ ticker = "", date = "", onError = () => {}, onLoading = () => {} }) {
  const [subTab, setSubTab] = useState("change");

  if (!ticker) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Veuillez sélectionner un ticker pour voir les analyses d&apos;Open Interest.
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  return (
    <MDBox>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs value={subTab} onChange={(e, v) => setSubTab(v)} variant="scrollable" scrollButtons="auto">
              <Tab label="OI Change" value="change" />
              <Tab label="OI per Expiry" value="per-expiry" />
              <Tab label="OI per Strike" value="per-strike" />
              <Tab label="Volume & OI per Expiry" value="volume-oi-expiry" />
            </Tabs>
      </Box>
      {subTab === "change" && <OIChangeTicker key={`${ticker}-${date}-change`} ticker={ticker} date={date} />}
      {subTab === "per-expiry" && <OIPerExpiryTicker key={`${ticker}-${date}-expiry`} ticker={ticker} date={date} />}
      {subTab === "per-strike" && <OIPerStrikeTicker key={`${ticker}-${date}-strike`} ticker={ticker} date={date} />}
      {subTab === "volume-oi-expiry" && <VolumeOIExpiry key={`${ticker}-${date}-volume-oi`} ticker={ticker} date={date} onError={onError} onLoading={onLoading} />}
    </MDBox>
  );
}

export default OpenInterestAnalysis;

