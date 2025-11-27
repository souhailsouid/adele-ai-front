import { useState, useEffect, useMemo } from "react";
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
import MDInput from "/components/MDInput";
import MDButton from "/components/MDButton";
import MDDatePicker from "/components/MDDatePicker";
import unusualWhalesClient from "/lib/unusual-whales/client";
import DefaultLineChart from "/examples/Charts/LineCharts/DefaultLineChart";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

function RiskReversalSkew({ ticker = "", date = "", timeframe = "1Y" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deltaInput, setDeltaInput] = useState("10");
  const [selectedDelta, setSelectedDelta] = useState("10");
  const [selectedExpiry, setSelectedExpiry] = useState("");

  useEffect(() => {
    if (!ticker || !selectedDelta || !selectedExpiry) {
      setData([]);
      return;
    }
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = {
          delta: selectedDelta,
          expiry: selectedExpiry,
          timeframe,
        };
        if (date) params.date = date;
        
        const response = await unusualWhalesClient.getStockHistoricalRiskReversalSkew(ticker, params);
        const extracted = Array.isArray(response) ? response : (response?.data || []);
        // Trier par date
        extracted.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA - dateB;
        });
        setData(extracted);
      } catch (err) {
        console.error("Error loading risk reversal skew:", err);
        setError(err.message || "Erreur lors du chargement");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ticker, date, timeframe, selectedDelta, selectedExpiry]);

  const parseNumber = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", { 
        year: "numeric", 
        month: "short", 
        day: "numeric"
      });
    } catch {
      return dateString;
    }
  };

  // Préparer les données pour le graphique
  const chartData = useMemo(() => {
    const labels = data.map((item) => formatDate(item.date));
    const riskReversal = data.map((item) => parseNumber(item.risk_reversal) * 100);

    return {
      labels,
      datasets: [
        {
          label: "Risk Reversal %",
          color: "warning",
          data: riskReversal,
        },
      ],
    };
  }, [data]);

  const handleSearch = () => {
    if (deltaInput.trim() && selectedExpiry) {
      setSelectedDelta(deltaInput.trim());
    }
  };

  const handleExpiryChange = (date) => {
    let dateStr = "";
    if (date && Array.isArray(date) && date.length > 0) {
      dateStr = date[0].toISOString().split('T')[0];
    } else if (date && typeof date === 'string') {
      dateStr = date;
    } else if (date instanceof Date) {
      dateStr = date.toISOString().split('T')[0];
    }
    setSelectedExpiry(dateStr);
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
    <MDBox>
      {/* Filtres */}
      <Card sx={{ mb: 3 }}>
        <MDBox p={2}>
          <MDTypography variant="body2" color="text.secondary" mb={2}>
            Sélectionnez un delta et une date d&apos;expiration pour voir les données historiques
          </MDTypography>
          <MDBox display="flex" gap={2} alignItems="flex-end" flexWrap="wrap">
            <MDInput
              label="Delta (ex: 10, 25)"
              placeholder="10"
              value={deltaInput}
              onChange={(e) => setDeltaInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              sx={{ flex: { xs: "1 1 100%", sm: "1 1 200px" }, minWidth: "150px" }}
            />
            <MDDatePicker
              input={{
                label: "Expiry Date (Date d'expiration)",
                placeholder: "Sélectionner une date",
                variant: "standard",
                fullWidth: true,
              }}
              options={{
                dateFormat: "Y-m-d",
                mode: "single",
                allowInput: false,
              }}
              value={selectedExpiry || undefined}
              onChange={handleExpiryChange}
              sx={{ flex: { xs: "1 1 100%", sm: "1 1 200px" }, minWidth: "150px" }}
            />
            <MDButton 
              variant="gradient" 
              color="dark" 
              onClick={handleSearch} 
              disabled={loading || !selectedExpiry || !deltaInput.trim()}
              sx={{ flex: { xs: "1 1 100%", sm: "0 0 auto" }, minWidth: "120px", height: "40px" }}
            >
              Rechercher
            </MDButton>
          </MDBox>
        </MDBox>
      </Card>

      {data.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <MDBox p={3}>
            <DefaultLineChart
              icon={{ color: "warning", component: "trending_up" }}
              title={`${ticker} - Risk Reversal Skew (Delta: ${selectedDelta}, Expiry: ${selectedExpiry})`}
              description="Différence entre la volatilité implicite d'un put et d'un call avec des deltas similaires"
              chart={chartData}
            />
          </MDBox>
        </Card>
      )}

      <Card>
        <MDBox p={3}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h6">
              Historical Risk Reversal Skew ({ticker}) ({data.length})
            </MDTypography>
            <Tooltip title="Différence historique entre la volatilité implicite d'un put et d'un call avec des deltas similaires (25 ou 10)">
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
          {!selectedDelta || !selectedExpiry ? (
            <MDTypography variant="body2" color="text">
              Veuillez entrer un delta et une date d&apos;expiration pour voir les données.
            </MDTypography>
          ) : data.length === 0 ? (
            <MDTypography variant="body2" color="text">
              Aucune donnée disponible pour Delta: {selectedDelta}, Expiry: {selectedExpiry}
            </MDTypography>
          ) : (
            <>
              <MDTypography variant="body2" color="text.secondary" mb={2}>
                Delta: {selectedDelta}, Expiry: {selectedExpiry}
              </MDTypography>
              <TableContainer>
                <Table size="small">
                  <MDBox component="thead">
                    <TableRow>
                      <DataTableHeadCell width="25%" align="left">Date</DataTableHeadCell>
                      <DataTableHeadCell width="25%" align="right">Delta</DataTableHeadCell>
                      <DataTableHeadCell width="25%" align="right">Risk Reversal</DataTableHeadCell>
                      <DataTableHeadCell width="25%" align="left">Ticker</DataTableHeadCell>
                    </TableRow>
                  </MDBox>
                  <TableBody>
                    {data.map((item, index) => {
                      const riskReversal = parseNumber(item.risk_reversal);

                      return (
                        <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                          <DataTableBodyCell align="left">
                            <MDTypography variant="body2" fontWeight="medium">
                              {formatDate(item.date)}
                            </MDTypography>
                          </DataTableBodyCell>
                          <DataTableBodyCell align="right">
                            <MDTypography variant="body2" color="primary">
                              {item.delta || "N/A"}
                            </MDTypography>
                          </DataTableBodyCell>
                          <DataTableBodyCell align="right">
                            <Chip
                              label={`${(riskReversal * 100).toFixed(2)}%`}
                              color={riskReversal > 0 ? "error" : "success"}
                              size="small"
                            />
                          </DataTableBodyCell>
                          <DataTableBodyCell align="left">
                            <MDTypography variant="body2" color="text.secondary">
                              {item.ticker || ticker}
                            </MDTypography>
                          </DataTableBodyCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </MDBox>
      </Card>
    </MDBox>
  );
}

export default RiskReversalSkew;

