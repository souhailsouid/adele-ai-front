import { useState, useMemo } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import LinearProgress from "@mui/material/LinearProgress";
import Autocomplete from "@mui/material/Autocomplete";
import MDInput from "/components/MDInput";
import MDButton from "/components/MDButton";
import Chip from "@mui/material/Chip";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";
import { searchStocks } from "/config/stockSymbols";
import filings13FClient from "/lib/13f-filings/client";

function TickerSearch() {
  const [ticker, setTicker] = useState("");
  const [tickerInput, setTickerInput] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatNumber = (num) => {
    if (!num || num === 0) return "-";
    const numValue = typeof num === "string" ? parseFloat(num) : num;
    if (isNaN(numValue)) return "-";
    const dollars = numValue / 100;
    if (dollars >= 1_000_000_000) return `$${(dollars / 1_000_000_000).toFixed(2)}B`;
    if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2)}M`;
    if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(2)}K`;
    return `$${dollars.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const parseNumber = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Fonction pour vérifier si un texte contient les lettres d'un acronyme dans l'ordre
  const matchesAcronym = (text, acronym) => {
    const textUpper = text.toUpperCase();
    const acronymUpper = acronym.toUpperCase();
    let textIndex = 0;
    let acronymIndex = 0;
    
    while (textIndex < textUpper.length && acronymIndex < acronymUpper.length) {
      if (textUpper[textIndex] === acronymUpper[acronymIndex]) {
        acronymIndex++;
      }
      textIndex++;
    }
    
    return acronymIndex === acronymUpper.length;
  };

  const searchTicker = async () => {
    const tickerUpper = tickerInput.trim().toUpperCase();
    if (!tickerUpper) {
      setError("Veuillez entrer un ticker");
      return;
    }

    setTicker(tickerUpper);
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      // Récupérer tous les funds
      const funds = await filings13FClient.getFunds();
      console.log(`Searching ${tickerUpper} across ${funds.length} funds`);

      if (!funds || funds.length === 0) {
        setError("Aucun fund disponible");
        return;
      }

      // Rechercher le ticker dans chaque fund
      const allResults = await Promise.all(
        funds.map(async (fund) => {
          try {
            const response = await filings13FClient.getFundHoldings(fund.id, 1000);
            
            // Extraire les holdings (peut être un tableau direct ou dans response.data)
            let holdings = response;
            if (response && !Array.isArray(response) && response.data && Array.isArray(response.data)) {
              holdings = response.data;
            } else if (response && !Array.isArray(response) && Array.isArray(response.holdings)) {
              holdings = response.holdings;
            }
            
            // Vérifier que holdings est un tableau
            if (!Array.isArray(holdings)) {
              console.warn(`Holdings for fund ${fund.id} (${fund.name}) is not an array:`, typeof holdings, holdings);
              return null;
            }

            if (holdings.length === 0) {
              return null;
            }

            // Chercher le ticker (recherche flexible : exacte, partielle, ou par symbole)
            const holding = holdings.find(
              (h) => {
                if (!h) return false;
                
                // Chercher dans le ticker (nom de l'entreprise)
                if (h.ticker) {
                  const hTicker = String(h.ticker).trim().toUpperCase();
                  // Correspondance exacte
                  if (hTicker === tickerUpper) return true;
                  // Correspondance partielle (ex: "ALIBABA GR" contient "ALIBABA")
                  if (hTicker.includes(tickerUpper) || tickerUpper.includes(hTicker)) return true;
                  
                  // Extraire le premier mot du nom (ex: "ALIBABA GR" -> "ALIBABA")
                  const firstWord = hTicker.split(/\s+/)[0];
                  if (firstWord === tickerUpper || tickerUpper.includes(firstWord) || firstWord.includes(tickerUpper)) {
                    return true;
                  }
                  
                  // Chercher dans tous les mots du nom
                  const words = hTicker.split(/\s+/);
                  if (words.some(word => word === tickerUpper || word.includes(tickerUpper) || tickerUpper.includes(word))) {
                    return true;
                  }
                  
                  // Recherche par acronyme (ex: "BABA" dans "ALIBABA")
                  if (matchesAcronym(hTicker, tickerUpper) || matchesAcronym(tickerUpper, hTicker)) {
                    return true;
                  }
                  
                  // Recherche de sous-séquence (ex: "BABA" apparaît dans "ALIBABA")
                  if (hTicker.replace(/\s+/g, '').includes(tickerUpper.replace(/\s+/g, '')) || 
                      tickerUpper.replace(/\s+/g, '').includes(hTicker.replace(/\s+/g, ''))) {
                    return true;
                  }
                }
                
                // Chercher dans un champ symbol si disponible
                if (h.symbol) {
                  const hSymbol = String(h.symbol).trim().toUpperCase();
                  if (hSymbol === tickerUpper) return true;
                  if (hSymbol.includes(tickerUpper) || tickerUpper.includes(hSymbol)) return true;
                }
                
                // Chercher dans le CUSIP si c'est un identifiant de ticker
                if (h.cusip) {
                  const hCusip = String(h.cusip).trim().toUpperCase();
                  if (hCusip === tickerUpper) return true;
                }
                
                return false;
              }
            );

            if (holding) {
              console.log(`Found ${tickerUpper} in fund ${fund.name}:`, holding);
              return {
                fundId: fund.id,
                fundName: fund.name,
                fundCik: fund.cik,
                shares: parseNumber(holding.shares),
                marketValue: parseNumber(holding.market_value),
                filingDate: holding.filing_date,
                type: holding.type,
              };
            }
            return null;
          } catch (err) {
            console.error(`Error loading holdings for fund ${fund.id} (${fund.name}):`, err);
            return null;
          }
        })
      );

      const filteredResults = allResults.filter((r) => r !== null);
      console.log(`Found ${filteredResults.length} results for ${tickerUpper}`);
      
      if (filteredResults.length === 0) {
        // Afficher un message plus informatif avec des exemples de tickers
        const sampleTickers = new Set();
        try {
          // Essayer de récupérer quelques tickers d'exemple depuis les premiers funds
          for (const fund of funds.slice(0, 3)) {
            try {
              const response = await filings13FClient.getFundHoldings(fund.id, 10);
              let sampleHoldings = response;
              if (response && !Array.isArray(response) && response.data && Array.isArray(response.data)) {
                sampleHoldings = response.data;
              } else if (response && !Array.isArray(response) && Array.isArray(response.holdings)) {
                sampleHoldings = response.holdings;
              }
              
              if (Array.isArray(sampleHoldings) && sampleHoldings.length > 0) {
                sampleHoldings.forEach(h => {
                  // Extraire le symbole si disponible, sinon le nom
                  if (h) {
                    const symbol = h.symbol || h.ticker;
                    if (symbol) {
                      // Prendre les 3-5 premiers caractères pour avoir des symboles courts
                      const shortSymbol = String(symbol).trim().toUpperCase().split(' ')[0].substring(0, 5);
                      if (shortSymbol.length >= 2) {
                        sampleTickers.add(shortSymbol);
                      }
                    }
                  }
                });
              }
              if (sampleTickers.size >= 5) break; // On a assez d'exemples
            } catch (e) {
              // Ignorer les erreurs pour les exemples
            }
          }
        } catch (e) {
          // Ignorer les erreurs pour les exemples
        }
        
        const tickerList = Array.from(sampleTickers).slice(0, 5);
        if (tickerList.length > 0) {
          setError(
            `Aucun résultat trouvé pour ${tickerUpper}. Exemples de tickers disponibles: ${tickerList.join(", ")}`
          );
        } else {
          setError(`Aucun résultat trouvé pour ${tickerUpper}. Vérifiez que le ticker existe dans les données.`);
        }
      }
      
      setResults(filteredResults);
    } catch (err) {
      console.error("Error searching ticker:", err);
      setError(err.message || "Erreur lors de la recherche");
    } finally {
      setLoading(false);
    }
  };

  // Trier les résultats par market value décroissant
  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => b.marketValue - a.marketValue);
  }, [results]);

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" mb={2}>
          Recherche de Ticker
        </MDTypography>
        <MDTypography variant="body2" color="text" mb={3}>
          Recherchez un ticker dans tous les fonds pour voir qui le détient
        </MDTypography>

        <MDBox display="flex" gap={2} alignItems="center" mb={3}>
          <Autocomplete
            freeSolo
            options={searchStocks(tickerInput).slice(0, 10).map((stock) => stock.symbol)}
            value={tickerInput}
            onInputChange={(event, newValue) => {
              setTickerInput(newValue || "");
            }}
            renderInput={(params) => (
              <MDInput
                {...params}
                label="Ticker"
                placeholder="Ex: NVDA, TSLA, AAPL"
                variant="standard"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    searchTicker();
                  }
                }}
              />
            )}
            sx={{ flexGrow: 1 }}
          />
          <MDButton
            variant="gradient"
            color="dark"
            onClick={searchTicker}
            disabled={loading || !tickerInput.trim()}
          >
            Rechercher
          </MDButton>
        </MDBox>

        {error && (
          <MDBox mb={2}>
            <MDTypography variant="body2" color="error">
              {error}
            </MDTypography>
          </MDBox>
        )}

        {loading && <LinearProgress />}

        {!loading && ticker && results.length === 0 && (
          <MDBox>
            <MDTypography variant="body2" color="text">
              Aucun résultat trouvé pour {ticker}
            </MDTypography>
          </MDBox>
        )}

        {!loading && results.length > 0 && (
          <MDBox>
            <MDTypography variant="h6" mb={2}>
              Résultats pour {ticker} ({results.length} fonds)
            </MDTypography>
            <TableContainer>
              <Table size="small">
                <MDBox component="thead">
                  <TableRow>
                    <DataTableHeadCell width="30%" align="left">Fund</DataTableHeadCell>
                    <DataTableHeadCell width="15%" align="right">Shares</DataTableHeadCell>
                    <DataTableHeadCell width="20%" align="right">Market Value</DataTableHeadCell>
                    <DataTableHeadCell width="15%" align="center">Type</DataTableHeadCell>
                    <DataTableHeadCell width="20%" align="left">Filing Date</DataTableHeadCell>
                  </TableRow>
                </MDBox>
                <TableBody>
                  {sortedResults.map((result, index) => (
                    <TableRow
                      key={index}
                      sx={{ "&:hover": { backgroundColor: "action.hover" } }}
                    >
                      <DataTableBodyCell align="left">
                        <MDTypography variant="body2" fontWeight="medium" color="primary">
                          {result.fundName}
                        </MDTypography>
                        <MDTypography variant="caption" color="text.secondary">
                          CIK: {result.fundCik}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2">
                          {result.shares.toLocaleString()}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="bold">
                          {formatNumber(result.marketValue)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        <Chip
                          label={result.type || "N/A"}
                          color={result.type === "STOCK" ? "success" : result.type === "CALL" ? "info" : "error"}
                          size="small"
                        />
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="caption" color="text.secondary">
                          {formatDate(result.filingDate)}
                        </MDTypography>
                      </DataTableBodyCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </MDBox>
        )}
      </MDBox>
    </Card>
  );
}

export default TickerSearch;

