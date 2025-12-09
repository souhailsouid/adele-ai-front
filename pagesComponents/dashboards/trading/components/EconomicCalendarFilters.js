/**
 * Composant de filtres pour le calendrier économique
 * Filtres intuitifs pour les traders
 */

import { useState, useCallback } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Icon from "@mui/material/Icon";
import MDInput from "/components/MDInput";
import MDDatePicker from "/components/MDDatePicker";

function EconomicCalendarFilters({ onFilterChange, initialFilters = {}, onSearchChange, onSortChange }) {
  const [period, setPeriod] = useState(initialFilters.period || "next30Days");
  const [impact, setImpact] = useState(initialFilters.impact || "all");
  const [country, setCountry] = useState(initialFilters.country || "all");
  const [customFrom, setCustomFrom] = useState(initialFilters.customFrom || "");
  const [customTo, setCustomTo] = useState(initialFilters.customTo || "");
  const [search, setSearch] = useState(initialFilters.search || "");
  const [specificDate, setSpecificDate] = useState(initialFilters.specificDate || "");
  const [sortOrder, setSortOrder] = useState(initialFilters.sortOrder || "asc"); // "asc" ou "desc"

  // Calculer les dates selon la période sélectionnée (toujours dynamique à partir de la date du jour)
  const getPeriodDates = useCallback((periodValue) => {
    // Toujours utiliser la date du jour actuelle (dynamique)
    const today = new Date();
    // S'assurer que l'heure est à minuit pour éviter les problèmes de fuseau horaire
    today.setHours(0, 0, 0, 0);
    
    let from, to;
    
    switch (periodValue) {
      case "today":
        // Aujourd'hui uniquement
        from = today.toISOString().split("T")[0];
        to = today.toISOString().split("T")[0];
        break;
      case "thisWeek":
        // Cette semaine (lundi à dimanche)
        const monday = new Date(today);
        const dayOfWeek = today.getDay(); // 0 = dimanche, 1 = lundi, etc.
        const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        monday.setDate(today.getDate() + daysToMonday);
        monday.setHours(0, 0, 0, 0);
        from = monday.toISOString().split("T")[0];
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        to = sunday.toISOString().split("T")[0];
        break;
      case "nextWeek":
        // Semaine prochaine
        const nextMonday = new Date(today);
        const nextDayOfWeek = today.getDay();
        const nextDaysToMonday = nextDayOfWeek === 0 ? 1 : 8 - nextDayOfWeek;
        nextMonday.setDate(today.getDate() + nextDaysToMonday);
        nextMonday.setHours(0, 0, 0, 0);
        from = nextMonday.toISOString().split("T")[0];
        const nextSunday = new Date(nextMonday);
        nextSunday.setDate(nextMonday.getDate() + 6);
        to = nextSunday.toISOString().split("T")[0];
        break;
      case "thisMonth":
        // Mois en cours (du 1er au dernier jour du mois)
        from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0];
        break;
      case "nextMonth":
        // Mois prochain
        from = new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString().split("T")[0];
        to = new Date(today.getFullYear(), today.getMonth() + 2, 0).toISOString().split("T")[0];
        break;
      case "thisQuarter":
        // Trimestre en cours
        const quarter = Math.floor(today.getMonth() / 3);
        from = new Date(today.getFullYear(), quarter * 3, 1).toISOString().split("T")[0];
        to = new Date(today.getFullYear(), (quarter + 1) * 3, 0).toISOString().split("T")[0];
        break;
      case "next30Days":
        // 30 prochains jours à partir d'aujourd'hui
        from = today.toISOString().split("T")[0];
        const future30 = new Date(today);
        future30.setDate(today.getDate() + 30);
        to = future30.toISOString().split("T")[0];
        break;
      case "next90Days":
        // 90 prochains jours à partir d'aujourd'hui
        from = today.toISOString().split("T")[0];
        const future90 = new Date(today);
        future90.setDate(today.getDate() + 90);
        to = future90.toISOString().split("T")[0];
        break;
      case "custom":
        return { from: customFrom, to: customTo };
      default:
        // Par défaut : 30 prochains jours à partir d'aujourd'hui
        from = today.toISOString().split("T")[0];
        const defaultFuture = new Date(today);
        defaultFuture.setDate(today.getDate() + 30);
        to = defaultFuture.toISOString().split("T")[0];
    }
    
    return { from, to };
  }, [customFrom, customTo]);

  const handlePeriodChange = (event) => {
    const newPeriod = event.target.value;
    setPeriod(newPeriod);
    if (newPeriod !== "custom") {
      setCustomFrom("");
      setCustomTo("");
    }
    const dates = getPeriodDates(newPeriod);
    onFilterChange({
      period: newPeriod,
      impact,
      country,
      customFrom: dates.from || "",
      customTo: dates.to || "",
      search,
    });
  };

  const handleImpactChange = (event) => {
    const newImpact = event.target.value;
    setImpact(newImpact);
    const dates = getPeriodDates(period);
    onFilterChange({
      period,
      impact: newImpact,
      country,
      customFrom: dates.from || "",
      customTo: dates.to || "",
      search,
    });
  };

  const handleCountryChange = (event) => {
    const newCountry = event.target.value;
    setCountry(newCountry);
    const dates = getPeriodDates(period);
    onFilterChange({
      period,
      impact,
      country: newCountry,
      customFrom: dates.from || "",
      customTo: dates.to || "",
      search,
    });
  };

  const handleCustomDateChange = (field, value) => {
    if (field === "from") {
      setCustomFrom(value);
      onFilterChange({
        period,
        impact,
        country,
        customFrom: value,
        customTo,
        search,
      });
    } else {
      setCustomTo(value);
      onFilterChange({
        period,
        impact,
        country,
        customFrom,
        customTo: value,
        search,
      });
    }
  };

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
    const dates = getPeriodDates(period);
    onFilterChange({
      period,
      impact,
      country,
      customFrom: dates.from || "",
      customTo: dates.to || "",
      search: value,
      specificDate,
      sortOrder,
    });
  }, [period, impact, country, customFrom, customTo, specificDate, sortOrder, onSearchChange, onFilterChange, getPeriodDates]);

  const handleSpecificDateChange = (date) => {
    let dateStr = "";
    if (date && Array.isArray(date) && date.length > 0) {
      dateStr = date[0].toISOString().split('T')[0];
    } else if (date && typeof date === 'string') {
      dateStr = date;
    }
    setSpecificDate(dateStr);
    const dates = getPeriodDates(period);
    onFilterChange({
      period,
      impact,
      country,
      customFrom: dates.from || "",
      customTo: dates.to || "",
      search,
      specificDate: dateStr,
      sortOrder,
    });
  };

  const handleSortToggle = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);
    if (onSortChange) {
      onSortChange(newSortOrder);
    }
    const dates = getPeriodDates(period);
    onFilterChange({
      period,
      impact,
      country,
      customFrom: dates.from || "",
      customTo: dates.to || "",
      search,
      specificDate,
      sortOrder: newSortOrder,
    });
  };

  return (
    <MDBox mb={3}>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <MDTypography variant="h6">
          Filtres
        </MDTypography>
        <MDBox display="flex" alignItems="center" gap={2}>
          {/* Tri - Plus visible avec label */}
          <MDBox display="flex" alignItems="center" gap={1}>
            <MDTypography variant="caption" color="text" fontWeight="medium">
              Tri:
            </MDTypography>
            <Tooltip title={sortOrder === "asc" ? "Trier décroissant (plus récent en premier)" : "Trier croissant (plus ancien en premier)"}>
              <IconButton
                onClick={handleSortToggle}
                color={sortOrder === "asc" ? "primary" : "secondary"}
                sx={{
                  border: 1,
                  borderColor: sortOrder === "asc" ? "primary.main" : "secondary.main",
                  "&:hover": {
                    backgroundColor: sortOrder === "asc" ? "primary.lighter" : "secondary.lighter",
                  },
                }}
              >
                <Icon>
                  {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
                </Icon>
              </IconButton>
            </Tooltip>
            <MDTypography variant="caption" color="text.secondary">
              {sortOrder === "asc" ? "Croissant" : "Décroissant"}
            </MDTypography>
          </MDBox>
          {/* Recherche */}
          {onSearchChange && (
            <MDBox width="12rem">
              <MDInput
                placeholder="Rechercher..."
                value={search}
                size="small"
                fullWidth
                onChange={({ currentTarget }) => {
                  handleSearchChange(currentTarget.value);
                }}
              />
            </MDBox>
          )}
        </MDBox>
      </MDBox>
      <Grid container spacing={2}>
        {/* Période - Options plus intuitives */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth variant="standard" size="small">
            <InputLabel>Période</InputLabel>
            <Select
              value={period}
              label="Période"
              onChange={handlePeriodChange}
            >
              <MenuItem value="today">Aujourd&apos;hui</MenuItem>
              <MenuItem value="thisWeek">Cette semaine</MenuItem>
              <MenuItem value="next30Days">30 prochains jours</MenuItem>
              <MenuItem value="next90Days">90 prochains jours</MenuItem>
              <MenuItem value="nextWeek">Semaine prochaine</MenuItem>
              <MenuItem value="thisMonth">Ce mois</MenuItem>
              <MenuItem value="nextMonth">Mois prochain</MenuItem>
              <MenuItem value="thisQuarter">Ce trimestre</MenuItem>
              <MenuItem value="next30Days">30 prochains jours</MenuItem>
              <MenuItem value="custom">Personnalisé</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Impact */}
        <Grid item xs={12} sm={6} md={2.5}>
          <FormControl fullWidth variant="standard" size="small">
            <InputLabel>Impact</InputLabel>
            <Select
              value={impact}
              label="Impact"
              onChange={handleImpactChange}
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Pays */}
        <Grid item xs={12} sm={6} md={2.5}>
          <FormControl fullWidth variant="standard" size="small">
            <InputLabel>Pays</InputLabel>
            <Select
              value={country}
              label="Pays"
              onChange={handleCountryChange}
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="US">🇺🇸 US</MenuItem>
              <MenuItem value="CN">🇨🇳 Chine</MenuItem>
              <MenuItem value="JP">🇯🇵 Japon</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Dates personnalisées */}
        {period === "custom" && (
          <>
            <Grid item xs={12} sm={6} md={1.5}>
              <MDInput
                type="date"
                label="De"
                value={customFrom}
                onChange={(e) => handleCustomDateChange("from", e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={1.5}>
              <MDInput
                type="date"
                label="À"
                value={customTo}
                onChange={(e) => handleCustomDateChange("to", e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
          </>
        )}
        
        {/* Sélecteur de date spécifique - Toujours visible */}
        <Grid item xs={12} sm={6} md={period === "custom" ? 2 : 2.5}>
          <MDBox>
            <MDDatePicker
              input={{
                label: "Date spécifique",
                variant: "standard",
                fullWidth: true,
                placeholder: "Sélectionner une date",
                sx: specificDate ? {
                  "& .MuiInput-underline:before": {
                    borderBottomColor: "success.main",
                  },
                } : {},
              }}
              options={{
                dateFormat: "Y-m-d",
                mode: "single",
                allowInput: false,
              }}
              value={specificDate || undefined}
              onChange={handleSpecificDateChange}
            />
            {specificDate && (
              <MDBox mt={0.5} display="flex" alignItems="center" gap={0.5}>
                <Icon fontSize="small" color="success">check_circle</Icon>
                <MDTypography variant="caption" color="success" fontWeight="medium">
                  Filtre actif: {new Date(specificDate).toLocaleDateString('fr-FR')}
                </MDTypography>
                <IconButton
                  size="small"
                  onClick={() => {
                    setSpecificDate("");
                    const dates = getPeriodDates(period);
                    onFilterChange({
                      period,
                      impact,
                      country,
                      customFrom: dates.from || "",
                      customTo: dates.to || "",
                      search,
                      specificDate: "",
                      sortOrder,
                    });
                  }}
                  sx={{ ml: 0.5, p: 0.25 }}
                >
                  <Icon fontSize="small">close</Icon>
                </IconButton>
              </MDBox>
            )}
          </MDBox>
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default EconomicCalendarFilters;

