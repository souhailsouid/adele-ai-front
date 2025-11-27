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

import InterpolatedIV from "./InterpolatedIV";
import IVRankTicker from "./IVRankTicker";
import RiskReversalSkew from "./RiskReversalSkew";
import RealizedVolatility from "./RealizedVolatility";
import VolatilityStats from "./VolatilityStats";
import VolatilityTermStructure from "./VolatilityTermStructure";

function VolatilityAnalysis({ ticker = "", date = "", onError = () => {}, onLoading = () => {} }) {
  const [subTab, setSubTab] = useState("interpolated-iv");
  const [timespan, setTimespan] = useState("1y");
  const [timeframe, setTimeframe] = useState("1Y");

  if (!ticker) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Veuillez sélectionner un ticker pour voir les analyses de volatilité.
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
              <Tab label="Interpolated IV" value="interpolated-iv" />
              <Tab label="IV Rank" value="iv-rank" />
              <Tab label="Risk Reversal Skew" value="risk-reversal" />
              <Tab label="Realized Volatility" value="realized" />
              <Tab label="Volatility Stats" value="stats" />
              <Tab label="Term Structure" value="term-structure" />
            </Tabs>
          </Grid>
          {subTab === "iv-rank" && (
            <Grid item xs={12} md={4}>
              <FormControl variant="standard" fullWidth>
                <InputLabel>Timespan</InputLabel>
                <Select
                  value={timespan}
                  onChange={(e) => setTimespan(e.target.value)}
                  label="Timespan"
                >
                  <MenuItem value="1y">1 Year</MenuItem>
                  <MenuItem value="6m">6 Months</MenuItem>
                  <MenuItem value="3m">3 Months</MenuItem>
                  <MenuItem value="1m">1 Month</MenuItem>
                  <MenuItem value="1w">1 Week</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
          {subTab === "risk-reversal" && (
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
                  <MenuItem value="1M">1 Month</MenuItem>
                  <MenuItem value="2M">2 Months</MenuItem>
                  <MenuItem value="3M">3 Months</MenuItem>
                  <MenuItem value="6M">6 Months</MenuItem>
                  <MenuItem value="1Y">1 Year</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </Box>
      {subTab === "interpolated-iv" && <InterpolatedIV key={`${ticker}-${date}-iv`} ticker={ticker} date={date} />}
      {subTab === "iv-rank" && <IVRankTicker key={`${ticker}-${date}-${timespan}`} ticker={ticker} date={date} timespan={timespan} />}
      {subTab === "risk-reversal" && <RiskReversalSkew key={`${ticker}-${date}-${timeframe}`} ticker={ticker} date={date} timeframe={timeframe} />}
      {subTab === "realized" && <RealizedVolatility key={`${ticker}-${date}-realized`} ticker={ticker} date={date} onError={onError} onLoading={onLoading} />}
      {subTab === "stats" && <VolatilityStats key={`${ticker}-${date}-stats`} ticker={ticker} date={date} onError={onError} onLoading={onLoading} />}
      {subTab === "term-structure" && <VolatilityTermStructure key={`${ticker}-${date}-term`} ticker={ticker} date={date} onError={onError} onLoading={onLoading} />}
    </MDBox>
  );
}

export default VolatilityAnalysis;

