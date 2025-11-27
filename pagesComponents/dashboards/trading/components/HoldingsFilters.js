import { useState, useEffect } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDInput from "/components/MDInput";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

function HoldingsFilters({ holdings = [], onFilter }) {
  const [filters, setFilters] = useState({
    minValue: "",
    maxValue: "",
    type: "all",
    ticker: "",
  });

  useEffect(() => {
    if (!holdings || holdings.length === 0) {
      onFilter([]);
      return;
    }

    const filtered = holdings.filter((h) => {
      // Filtre par ticker
      if (filters.ticker && filters.ticker.trim()) {
        const tickerFilter = filters.ticker.trim().toUpperCase();
        const holdingTicker = h.ticker ? String(h.ticker).trim().toUpperCase() : "";
        if (!holdingTicker.includes(tickerFilter)) {
          return false;
        }
      }

      // Filtre par type
      if (filters.type !== "all" && h.type !== filters.type) {
        return false;
      }

      // Filtre par valeur (market_value est en centimes)
      const value = (h.market_value || 0) / 100; // Convertir en dollars
      const valueInMillions = value / 1_000_000; // Convertir en millions de dollars
      
      if (filters.minValue && filters.minValue.trim()) {
        const minValue = parseFloat(filters.minValue);
        if (isNaN(minValue) || valueInMillions < minValue) {
          return false;
        }
      }
      
      if (filters.maxValue && filters.maxValue.trim()) {
        const maxValue = parseFloat(filters.maxValue);
        if (isNaN(maxValue) || valueInMillions > maxValue) {
          return false;
        }
      }

      return true;
    });

    onFilter(filtered);
  }, [holdings, filters, onFilter]);

  return (
    <Card sx={{ mb: 3 }}>
      <MDBox p={2}>
        <MDBox mb={2}>
          <MDTypography variant="h6">Filtres</MDTypography>
        </MDBox>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <MDInput
              label="Valeur min (M$)"
              type="number"
              value={filters.minValue}
              onChange={(e) => setFilters({ ...filters, minValue: e.target.value })}
              variant="standard"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MDInput
              label="Valeur max (M$)"
              type="number"
              value={filters.maxValue}
              onChange={(e) => setFilters({ ...filters, maxValue: e.target.value })}
              variant="standard"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl variant="standard" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                label="Type"
              >
                <MenuItem value="all">Tous</MenuItem>
                <MenuItem value="STOCK">Stock</MenuItem>
                <MenuItem value="CALL">Call</MenuItem>
                <MenuItem value="PUT">Put</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MDInput
              label="Rechercher ticker"
              value={filters.ticker}
              onChange={(e) => setFilters({ ...filters, ticker: e.target.value })}
              placeholder="NVDA, TSLA..."
              variant="standard"
              fullWidth
            />
          </Grid>
        </Grid>
      </MDBox>
    </Card>
  );
}

export default HoldingsFilters;

