import { useState } from "react";
import MDBox from "/components/MDBox";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import MDTypography from "/components/MDTypography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";

import GreekExposureOverview from "./GreekExposureOverview";
import GreekExposureByExpiry from "./GreekExposureByExpiry";
import GreekExposureByStrike from "./GreekExposureByStrike";
import GreekExposureByStrikeAndExpiry from "./GreekExposureByStrikeAndExpiry";
import SpotExposures from "./SpotExposures";
import SpotExposuresByStrike from "./SpotExposuresByStrike";
import SpotExposuresByExpiryStrike from "./SpotExposuresByExpiryStrike";

function GreekExposureAnalysis({ ticker = "", date = "", onError = () => {}, onLoading = () => {} }) {
  const [subTab, setSubTab] = useState("overview");
  const [timeframe, setTimeframe] = useState("1Y");

  if (!ticker) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Veuillez sélectionner un ticker pour voir les analyses de Greek Exposure.
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  return (
    <MDBox>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Tabs value={subTab} onChange={(e, v) => setSubTab(v)} variant="scrollable" scrollButtons="auto">
              <Tab label="Overview" value="overview" />
              <Tab label="By Expiry" value="by-expiry" />
              <Tab label="By Strike" value="by-strike" />
              <Tab label="By Strike & Expiry" value="by-strike-expiry" />
              <Tab label="Spot Exposures" value="spot-exposures" />
              <Tab label="Spot by Strike" value="spot-by-strike" />
              <Tab label="Spot by Expiry & Strike" value="spot-by-expiry-strike" />
            </Tabs>
          </Grid>
          {subTab === "overview" && (
            <Grid item xs={12} md={4}>
              <FormControl variant="standard" fullWidth>
                <InputLabel>Timeframe</InputLabel>
                <Select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  label="Timeframe"
                >
                  <MenuItem value="YTD">YTD</MenuItem>
                  <MenuItem value="1D">1 Day</MenuItem>
                  <MenuItem value="1W">1 Week</MenuItem>
                  <MenuItem value="2W">2 Weeks</MenuItem>
                  <MenuItem value="1M">1 Month</MenuItem>
                  <MenuItem value="2M">2 Months</MenuItem>
                  <MenuItem value="3M">3 Months</MenuItem>
                  <MenuItem value="6M">6 Months</MenuItem>
                  <MenuItem value="1Y">1 Year</MenuItem>
                  <MenuItem value="2Y">2 Years</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </Box>
      {subTab === "overview" && <GreekExposureOverview key={`${ticker}-${date}-${timeframe}`} ticker={ticker} date={date} timeframe={timeframe} />}
      {subTab === "by-expiry" && <GreekExposureByExpiry key={`${ticker}-${date}-expiry`} ticker={ticker} date={date} />}
      {subTab === "by-strike" && <GreekExposureByStrike key={`${ticker}-${date}-strike`} ticker={ticker} date={date} />}
      {subTab === "by-strike-expiry" && <GreekExposureByStrikeAndExpiry key={`${ticker}-${date}-strike-expiry`} ticker={ticker} date={date} />}
      {subTab === "spot-exposures" && <SpotExposures key={`${ticker}-${date}-spot`} ticker={ticker} date={date} onError={onError} onLoading={onLoading} />}
      {subTab === "spot-by-strike" && <SpotExposuresByStrike key={`${ticker}-${date}-spot-strike`} ticker={ticker} date={date} onError={onError} onLoading={onLoading} />}
      {subTab === "spot-by-expiry-strike" && <SpotExposuresByExpiryStrike key={`${ticker}-${date}-spot-expiry-strike`} ticker={ticker} date={date} onError={onError} onLoading={onLoading} />}
    </MDBox>
  );
}

export default GreekExposureAnalysis;

