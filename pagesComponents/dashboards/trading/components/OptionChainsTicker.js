import { useState, useEffect } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import Chip from "@mui/material/Chip";
import unusualWhalesClient from "/lib/unusual-whales/client";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

function OptionChainsTicker({ ticker = "", date = "" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticker) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = {};
        if (date) params.date = date;
        
        const response = await unusualWhalesClient.getStockOptionChains(ticker, params);
        // L'API retourne un tableau de strings (symboles d'options)
        const extracted = Array.isArray(response) ? response : (response?.data || []);
        setData(extracted);
      } catch (err) {
        console.error("Error loading option chains:", err);
        setError(err.message || "Erreur lors du chargement");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ticker, date]);

  // Parser un symbole d'option pour extraire les informations
  // Format: TICKERYYMMDDC/PSTRIKE (ex: MSFT260102C00560000)
  const parseOptionSymbol = (optionSymbol) => {
    if (!optionSymbol || typeof optionSymbol !== "string") {
      return { ticker: "N/A", strike: "N/A", expiry: "N/A", type: "N/A", symbol: optionSymbol || "N/A" };
    }
    
    // Format: TICKERYYMMDDC/PSTRIKE (e.g., MSFT260102C00560000)
    // Exemple: MSFT260102C00560000
    // - MSFT = ticker
    // - 260102 = YYMMDD = 2026-01-02
    // - C = Call (P = Put)
    // - 00560000 = strike = 560.000
    
    // Trouver la position du C ou P (type d'option)
    const typeIndex = optionSymbol.search(/[CP]/);
    if (typeIndex === -1) {
      return { ticker: optionSymbol, strike: "N/A", expiry: "N/A", type: "N/A", symbol: optionSymbol };
    }
    
    const tickerPart = optionSymbol.substring(0, typeIndex);
    const dateTypePart = optionSymbol.substring(typeIndex);
    
    // Extraire le type (C ou P)
    const type = dateTypePart[0] === "C" ? "CALL" : "PUT";
    
    // Extraire la date (6 chiffres après le ticker, avant le C/P)
    const dateStr = optionSymbol.substring(tickerPart.length, typeIndex);
    if (dateStr.length === 6) {
      const year = "20" + dateStr.substring(0, 2);
      const month = dateStr.substring(2, 4);
      const day = dateStr.substring(4, 6);
      const expiry = `${year}-${month}-${day}`;
      
      // Extraire le strike (tout après le C/P)
      const strikeStr = dateTypePart.substring(1);
      const strikePrice = strikeStr ? (parseInt(strikeStr) / 1000).toFixed(2) : "N/A";
      
      return {
        ticker: tickerPart,
        strike: strikePrice,
        expiry,
        type,
        symbol: optionSymbol
      };
    }
    
    return { ticker: tickerPart, strike: "N/A", expiry: "N/A", type, symbol: optionSymbol };
  };

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <LinearProgress />
        </MDBox>
      </Card>
    );
  }

  return (
    <Card>
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDTypography variant="h6">
            Option Chains ({ticker}) ({data.length} symbols)
          </MDTypography>
          <Tooltip title="Tous les symboles d'options pour le ticker donné">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {error && (
          <MDTypography variant="body2" color="error" mb={2}>
            {error}
          </MDTypography>
        )}
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucune donnée disponible
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="30%" align="left">Option Symbol</DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="center">Type</DataTableHeadCell>
                  <DataTableHeadCell width="20%" align="left">Expiry</DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="right">Strike</DataTableHeadCell>
                  <DataTableHeadCell width="20%" align="left">Ticker</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.map((optionSymbol, index) => {
                  // data est un tableau de strings, pas d'objets
                  const parsed = parseOptionSymbol(optionSymbol);
                  const isCall = parsed.type === "CALL";

                  return (
                    <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="body2" fontWeight="medium" color="primary">
                          {parsed.symbol}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        <Chip
                          label={parsed.type}
                          color={isCall ? "success" : "error"}
                          size="small"
                        />
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="body2" color="text.secondary">
                          {parsed.expiry}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium" color="primary">
                          ${parsed.strike}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="body2" color="text.secondary">
                          {parsed.ticker}
                        </MDTypography>
                      </DataTableBodyCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </MDBox>
    </Card>
  );
}

export default OptionChainsTicker;

