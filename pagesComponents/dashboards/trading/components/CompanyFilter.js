import { useState, useMemo, useRef } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDInput from "/components/MDInput";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";
import { DEFAULT_WATCHLIST, getWatchlistSymbols } from "/config/watchlist";
import { searchStocks, getStockBySymbol } from "/config/stockSymbols";

function CompanyFilter({ onFilterChange, defaultSymbols = null }) {
  const [customSymbols, setCustomSymbols] = useState(
    defaultSymbols || getWatchlistSymbols()
  );
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputValueRef = useRef(inputValue);
  
  // Synchroniser la ref avec l'état
  if (inputValueRef.current !== inputValue) {
    inputValueRef.current = inputValue;
  }

  // Options pour l'autocomplete (tous les stocks populaires)
  const stockOptions = useMemo(() => {
    return searchStocks(inputValue);
  }, [inputValue]);

  const handleAddSymbol = (newValue, inputText = null) => {
    let symbol = null;
    
    // Si newValue est fourni (sélection depuis la liste)
    if (newValue) {
      symbol = typeof newValue === "string" 
        ? newValue.toUpperCase().trim() 
        : newValue.symbol.toUpperCase().trim();
    } 
    // Sinon, utiliser le texte de l'input (cas Enter avec freeSolo)
    else if (inputText) {
      const trimmed = inputText.trim().toUpperCase();
      // Chercher si c'est un symbole connu
      const stock = getStockBySymbol(trimmed);
      if (stock) {
        symbol = stock.symbol;
      } else {
        // Sinon, utiliser directement le texte comme symbole
        symbol = trimmed;
      }
    }
    
    if (symbol && symbol.length > 0 && !customSymbols.includes(symbol)) {
      const newSymbols = [...customSymbols, symbol];
      // Mettre à jour l'état local immédiatement pour que le chip apparaisse
      setCustomSymbols(newSymbols);
      setIsCustomMode(true);
      setInputValue("");
      inputValueRef.current = "";
      
      // Utiliser requestAnimationFrame pour s'assurer que l'UI est mise à jour avant le rechargement
      requestAnimationFrame(() => {
        onFilterChange(newSymbols);
      });
    } else if (symbol && customSymbols.includes(symbol)) {
      // Si déjà présent, juste vider l'input
      setInputValue("");
      inputValueRef.current = "";
    }
  };

  const handleRemoveSymbol = (symbolToRemove) => {
    const newSymbols = customSymbols.filter((s) => s !== symbolToRemove);
    setCustomSymbols(newSymbols);
    setIsCustomMode(true);
    onFilterChange(newSymbols);
  };

  const handleReset = () => {
    const defaultSymbols = getWatchlistSymbols();
    setCustomSymbols(defaultSymbols);
    setIsCustomMode(false);
    setInputValue("");
    onFilterChange(defaultSymbols);
  };

  return (
    <Card>
      <MDBox p={2}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDTypography variant="h6">
            Filtre de Compagnies
          </MDTypography>
          {isCustomMode && (
            <MDTypography
              variant="caption"
              color="info"
              sx={{ cursor: "pointer" }}
              onClick={handleReset}
            >
              Réinitialiser
            </MDTypography>
          )}
        </MDBox>

        <MDBox mb={2}>
          <Autocomplete
            freeSolo
            options={stockOptions}
            getOptionLabel={(option) => {
              if (typeof option === "string") {
                const stock = getStockBySymbol(option);
                return stock ? `${option} - ${stock.name}` : option;
              }
              return `${option.symbol} - ${option.name}`;
            }}
            onInputChange={(event, newInputValue, reason) => {
              setInputValue(newInputValue);
              inputValueRef.current = newInputValue;
            }}
            onChange={(event, newValue, reason) => {
              // reason peut être: 'createOption', 'selectOption', 'removeOption', 'clear'
              if (reason === 'selectOption' && newValue) {
                // Sélection depuis la liste
                handleAddSymbol(newValue);
              } else if (reason === 'createOption' && newValue) {
                // Création d'une nouvelle option (Enter avec freeSolo)
                handleAddSymbol(null, newValue);
              }
            }}
            onKeyDown={(event) => {
              // Gérer Enter explicitement pour freeSolo
              if (event.key === 'Enter') {
                const currentValue = inputValueRef.current?.trim() || inputValue.trim();
                if (currentValue) {
                  event.preventDefault();
                  event.stopPropagation();
                  handleAddSymbol(null, currentValue);
                }
              }
            }}
            inputValue={inputValue}
            renderInput={(params) => (
              <MDInput
                {...params}
                placeholder="Rechercher par symbole ou nom (ex: AAPL, Apple, TSLA...)"
                fullWidth
                onKeyDown={(e) => {
                  // Laisser l'autocomplete gérer, mais on a aussi notre handler
                  params.inputProps?.onKeyDown?.(e);
                }}
              />
            )}
            renderOption={(props, option) => {
              const stock = typeof option === "string" 
                ? getStockBySymbol(option) 
                : option;
              const displaySymbol = typeof option === "string" ? option : option.symbol;
              return (
                <li {...props} key={displaySymbol}>
                  <MDBox>
                    <MDTypography variant="button" fontWeight="bold">
                      {displaySymbol}
                    </MDTypography>
                    <MDTypography variant="caption" color="text" display="block">
                      {stock?.name || displaySymbol}
                    </MDTypography>
                  </MDBox>
                </li>
              );
            }}
            filterOptions={(options, params) => {
              const filtered = searchStocks(params.inputValue);
              return filtered;
            }}
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
          />
        </MDBox>

        <MDBox>
          <MDTypography variant="caption" color="text" mb={1} display="block">
            {isCustomMode
              ? `Mode personnalisé (${customSymbols.length} symboles)`
              : `Watchlist par défaut (${customSymbols.length} symboles)`}
          </MDTypography>
          <MDBox display="flex" flexWrap="wrap" gap={1}>
            {customSymbols.map((symbol) => {
              // Chercher d'abord dans la watchlist par défaut, puis dans la liste étendue
              const company = DEFAULT_WATCHLIST.find(
                (c) => c.symbol === symbol
              ) || getStockBySymbol(symbol);
              
              const label = company 
                ? `${symbol} - ${company.name}` 
                : symbol;
              
              return (
                <Chip
                  key={symbol}
                  label={label}
                  onDelete={() => handleRemoveSymbol(symbol)}
                  color={isCustomMode ? "info" : "default"}
                  size="small"
                />
              );
            })}
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default CompanyFilter;

