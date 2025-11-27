import { useState, useEffect } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import LinearProgress from "@mui/material/LinearProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import MDDatePicker from "/components/MDDatePicker";
import unusualWhalesClient from "/lib/unusual-whales/client";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

function formatNumber(num) {
  if (!num) return "0";
  const n = parseFloat(num);
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return n.toFixed(2);
}

function SpotExposuresByExpiryStrike({ ticker = "", date = "", onError = () => {}, onLoading = () => {} }) {
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
        onLoading(true);
        setError(null);
        const params = { 
          limit: 500,
          expirations: [selectedExpiry]
        };
        if (date) params.date = date;
        const response = await unusualWhalesClient.getStockSpotExposuresByExpiryStrike(ticker, params);
        const extracted = Array.isArray(response?.data) ? response.data : [];
        setData(extracted);
      } catch (err) {
        console.error("Error loading spot exposures by expiry strike:", err);
        const errMsg = err.message || "Erreur lors du chargement";
        setError(errMsg);
        onError(errMsg);
        setData([]);
      } finally {
        setLoading(false);
        onLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, date, selectedExpiry]);

  if (!ticker) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Veuillez sélectionner un ticker pour voir les expositions GEX par expiry et strike.
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  // Trier par strike
  const sortedData = [...data].sort((a, b) => parseFloat(a.strike) - parseFloat(b.strike));

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" mb={3}>
          Spot GEX Exposures by Expiry & Strike - {ticker}
        </MDTypography>
        <MDBox mb={3}>
          <MDDatePicker
            input={{
              label: "Expiry Date",
              placeholder: "Sélectionner une date d'expiration",
              variant: "standard",
              fullWidth: true,
            }}
            options={{
              dateFormat: "Y-m-d",
              mode: "single",
              allowInput: false,
            }}
            value={selectedExpiry || undefined}
            onChange={(date) => {
              let dateStr = "";
              if (date && Array.isArray(date) && date.length > 0) {
                dateStr = date[0].toISOString().split('T')[0];
              } else if (date && typeof date === 'string') {
                dateStr = date;
              }
              setSelectedExpiry(dateStr);
            }}
          />
        </MDBox>
        {loading && (
          <MDBox mb={2}>
            <LinearProgress />
          </MDBox>
        )}
        {error && (
          <MDBox mb={2}>
            <MDTypography variant="body2" color="error">
              {error}
            </MDTypography>
          </MDBox>
        )}
        {!selectedExpiry ? (
          <MDTypography variant="body2" color="text">
            Veuillez sélectionner une date d&apos;expiration.
          </MDTypography>
        ) : data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucune donnée disponible pour cette expiration.
          </MDTypography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <DataTableHeadCell>Strike</DataTableHeadCell>
                  <DataTableHeadCell align="right">Call Gamma OI</DataTableHeadCell>
                  <DataTableHeadCell align="right">Put Gamma OI</DataTableHeadCell>
                  <DataTableHeadCell align="right">Net Gamma OI</DataTableHeadCell>
                  <DataTableHeadCell align="right">Call Delta OI</DataTableHeadCell>
                  <DataTableHeadCell align="right">Put Delta OI</DataTableHeadCell>
                  <DataTableHeadCell align="right">Net Delta OI</DataTableHeadCell>
                  <DataTableHeadCell align="right">Call Vanna OI</DataTableHeadCell>
                  <DataTableHeadCell align="right">Put Vanna OI</DataTableHeadCell>
                  <DataTableHeadCell align="right">Net Vanna OI</DataTableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedData.map((item, index) => {
                  const callGamma = parseFloat(item.call_gamma_oi || 0);
                  const putGamma = parseFloat(item.put_gamma_oi || 0);
                  const netGamma = callGamma + putGamma;
                  const callDelta = parseFloat(item.call_delta_oi || 0);
                  const putDelta = parseFloat(item.put_delta_oi || 0);
                  const netDelta = callDelta + putDelta;
                  const callVanna = parseFloat(item.call_vanna_oi || 0);
                  const putVanna = parseFloat(item.put_vanna_oi || 0);
                  const netVanna = callVanna + putVanna;
                  return (
                    <TableRow key={index}>
                      <DataTableBodyCell>${item.strike || "N/A"}</DataTableBodyCell>
                      <DataTableBodyCell align="right" color="success">{formatNumber(callGamma)}</DataTableBodyCell>
                      <DataTableBodyCell align="right" color="error">{formatNumber(putGamma)}</DataTableBodyCell>
                      <DataTableBodyCell align="right" color={netGamma >= 0 ? "success" : "error"}>
                        {formatNumber(netGamma)}
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right" color="success">{formatNumber(callDelta)}</DataTableBodyCell>
                      <DataTableBodyCell align="right" color="error">{formatNumber(putDelta)}</DataTableBodyCell>
                      <DataTableBodyCell align="right" color={netDelta >= 0 ? "success" : "error"}>
                        {formatNumber(netDelta)}
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right" color="success">{formatNumber(callVanna)}</DataTableBodyCell>
                      <DataTableBodyCell align="right" color="error">{formatNumber(putVanna)}</DataTableBodyCell>
                      <DataTableBodyCell align="right" color={netVanna >= 0 ? "success" : "error"}>
                        {formatNumber(netVanna)}
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

export default SpotExposuresByExpiryStrike;

