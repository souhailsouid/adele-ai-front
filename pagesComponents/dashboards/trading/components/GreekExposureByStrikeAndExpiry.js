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
import MDButton from "/components/MDButton";
import MDDatePicker from "/components/MDDatePicker";
import unusualWhalesClient from "/lib/unusual-whales/client";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

function GreekExposureByStrikeAndExpiry({ ticker = "", date = "" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedExpiry, setSelectedExpiry] = useState("");

  useEffect(() => {
    if (!ticker || !selectedExpiry) {
      setData([]);
      return;
    }
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = { expiry: selectedExpiry };
        if (date) params.date = date;
        
        const response = await unusualWhalesClient.getStockGreekExposureByStrikeAndExpiry(ticker, params);
        const extracted = Array.isArray(response) ? response : (response?.data || []);
        // Trier par strike
        extracted.sort((a, b) => {
          const strikeA = parseFloat(a.strike) || 0;
          const strikeB = parseFloat(b.strike) || 0;
          return strikeA - strikeB;
        });
        setData(extracted);
      } catch (err) {
        console.error("Error loading greek exposure by strike and expiry:", err);
        setError(err.message || "Erreur lors du chargement");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ticker, date, selectedExpiry]);

  const formatNumber = (num) => {
    if (!num || num === 0) return "0";
    const numValue = typeof num === "string" ? parseFloat(num) : num;
    if (isNaN(numValue)) return "0";
    if (Math.abs(numValue) >= 1_000_000_000) return `${(numValue / 1_000_000_000).toFixed(2)}B`;
    if (Math.abs(numValue) >= 1_000_000) return `${(numValue / 1_000_000).toFixed(2)}M`;
    if (Math.abs(numValue) >= 1_000) return `${(numValue / 1_000).toFixed(2)}K`;
    return numValue.toFixed(2);
  };

  const parseNumber = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
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
    <Card>
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDTypography variant="h6">
            Greek Exposure by Strike & Expiry ({ticker})
          </MDTypography>
          <Tooltip title="Exposition aux grecs groupée par strike et expiry. Sélectionnez une date d'expiration pour voir les données.">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>

        {/* Filtre Expiry */}
        <MDBox mb={3} display="flex" gap={2} alignItems="flex-end">
          <MDDatePicker
            input={{
              label: "Expiry Date",
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
            sx={{ flex: { xs: "1 1 100%", sm: "1 1 300px" }, maxWidth: "400px" }}
          />
        </MDBox>

        {error && (
          <MDTypography variant="body2" color="error" mb={2}>
            {error}
          </MDTypography>
        )}
        {!selectedExpiry ? (
          <MDTypography variant="body2" color="text">
            Veuillez entrer une date d&apos;expiration pour voir les données.
          </MDTypography>
        ) : data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucune donnée disponible pour cette expiry ({selectedExpiry})
          </MDTypography>
        ) : (
          <>
            <MDTypography variant="body2" color="text.secondary" mb={2}>
              Expiry: {selectedExpiry} ({data.length} strikes)
            </MDTypography>
            <TableContainer>
              <Table size="small">
                <MDBox component="thead">
                  <TableRow>
                    <DataTableHeadCell width="10%" align="left">Strike</DataTableHeadCell>
                    <DataTableHeadCell width="11%" align="right">Call Delta</DataTableHeadCell>
                    <DataTableHeadCell width="11%" align="right">Put Delta</DataTableHeadCell>
                    <DataTableHeadCell width="11%" align="right">Net Delta</DataTableHeadCell>
                    <DataTableHeadCell width="11%" align="right">Call Gamma</DataTableHeadCell>
                    <DataTableHeadCell width="11%" align="right">Put Gamma</DataTableHeadCell>
                    <DataTableHeadCell width="11%" align="right">Net Gamma</DataTableHeadCell>
                    <DataTableHeadCell width="12%" align="right">Call Vanna</DataTableHeadCell>
                    <DataTableHeadCell width="12%" align="right">Put Vanna</DataTableHeadCell>
                  </TableRow>
                </MDBox>
                <TableBody>
                  {data.map((item, index) => {
                    // L'API retourne des strings, les parser correctement
                    const cDelta = parseNumber(item.call_delta);
                    const pDelta = parseNumber(item.put_delta);
                    const cGamma = parseNumber(item.call_gamma);
                    const pGamma = parseNumber(item.put_gamma);
                    const cVanna = parseNumber(item.call_vanna);
                    const pVanna = parseNumber(item.put_vanna);
                    const cCharm = parseNumber(item.call_charm);
                    const pCharm = parseNumber(item.put_charm);
                    const nDelta = cDelta + pDelta;
                    const nGamma = cGamma + pGamma;

                    return (
                      <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                        <DataTableBodyCell align="left">
                          <MDTypography variant="body2" fontWeight="bold" color="primary">
                            ${item.strike || "N/A"}
                          </MDTypography>
                          {item.expiry && (
                            <MDTypography variant="caption" color="text.secondary" display="block">
                              {item.expiry}
                            </MDTypography>
                          )}
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" color="success.main">
                            {formatNumber(cDelta)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" color="error.main">
                            {formatNumber(pDelta)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" fontWeight="medium" color={nDelta > 0 ? "success.main" : "error.main"}>
                            {formatNumber(nDelta)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" color="success.main">
                            {formatNumber(cGamma)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" color="error.main">
                            {formatNumber(pGamma)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" fontWeight="medium" color={nGamma > 0 ? "success.main" : "error.main"}>
                            {formatNumber(nGamma)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" color="info.main">
                            {formatNumber(cVanna)}
                          </MDTypography>
                        </DataTableBodyCell>
                        <DataTableBodyCell align="right">
                          <MDTypography variant="body2" color="info.main">
                            {formatNumber(pVanna)}
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
  );
}

export default GreekExposureByStrikeAndExpiry;

