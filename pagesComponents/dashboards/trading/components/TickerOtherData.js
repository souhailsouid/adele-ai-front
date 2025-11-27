import { useState } from "react";
import MDBox from "/components/MDBox";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import MDTypography from "/components/MDTypography";

import InsiderBuySellsTicker from "./InsiderBuySellsTicker";
import NetPremiumTicks from "./NetPremiumTicks";
import OHLCTicker from "./OHLCTicker";
import OptionChainsTicker from "./OptionChainsTicker";
import StockState from "./StockState";
import OptionsVolume from "./OptionsVolume";
import StockVolumePriceLevels from "./StockVolumePriceLevels";

function TickerOtherData({ ticker = "", date = "", onError = () => {}, onLoading = () => {} }) {
  const [subTab, setSubTab] = useState("insider");

  if (!ticker) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Veuillez sélectionner un ticker pour voir les autres données.
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  return (
    <MDBox>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs value={subTab} onChange={(e, v) => setSubTab(v)} variant="scrollable" scrollButtons="auto">
              <Tab label="Stock State" value="stock-state" />
              <Tab label="Options Volume" value="options-volume" />
              <Tab label="Stock Volume Price Levels" value="volume-price-levels" />
              <Tab label="Insider Buy/Sells" value="insider" />
              <Tab label="Net Premium Ticks" value="net-prem" />
              <Tab label="OHLC" value="ohlc" />
              <Tab label="Option Chains" value="chains" />
            </Tabs>
      </Box>
      {subTab === "stock-state" && <StockState key={`${ticker}-state`} ticker={ticker} onError={onError} onLoading={onLoading} />}
      {subTab === "options-volume" && <OptionsVolume key={`${ticker}-${date}-options-volume`} ticker={ticker} date={date} onError={onError} onLoading={onLoading} />}
      {subTab === "volume-price-levels" && <StockVolumePriceLevels key={`${ticker}-${date}-volume-price`} ticker={ticker} date={date} onError={onError} onLoading={onLoading} />}
      {subTab === "insider" && <InsiderBuySellsTicker key={`${ticker}-insider`} ticker={ticker} />}
      {subTab === "net-prem" && <NetPremiumTicks key={`${ticker}-${date}-net-prem`} ticker={ticker} date={date} />}
      {subTab === "ohlc" && <OHLCTicker key={`${ticker}-${date}-ohlc`} ticker={ticker} date={date} />}
      {subTab === "chains" && <OptionChainsTicker key={`${ticker}-${date}-chains`} ticker={ticker} date={date} />}
    </MDBox>
  );
}

export default TickerOtherData;

