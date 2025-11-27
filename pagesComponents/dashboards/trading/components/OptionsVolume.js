import { useState, useEffect } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import LinearProgress from "@mui/material/LinearProgress";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import unusualWhalesClient from "/lib/unusual-whales/client";
import { formatDateTime } from "./utils";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

function formatNumber(num) {
  if (!num) return "0";
  const n = parseFloat(num);
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return n.toFixed(2);
}

function OptionsVolume({ ticker = "", date = "", onError = () => {}, onLoading = () => {} }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticker) {
      setData([]);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        onLoading(true);
        setError(null);
        const params = {};
        if (date) params.date = date;
        const response = await unusualWhalesClient.getStockOptionsVolume(ticker, params);
        const extracted = Array.isArray(response?.data) ? response.data : (response?.data ? [response.data] : []);
        setData(extracted);
      } catch (err) {
        console.error("Error loading options volume:", err);
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
  }, [ticker, date]);

  if (!ticker) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Veuillez sélectionner un ticker pour voir le volume des options.
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <LinearProgress />
        </MDBox>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="error">
            {error}
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Aucune donnée disponible.
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  const item = data[0];

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" mb={3}>
          Options Volume & Premium - {ticker}
        </MDTypography>
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="caption" color="text.secondary">
                  Call Volume
                </MDTypography>
                <MDTypography variant="h6" color="success">
                  {parseInt(item.call_volume || 0).toLocaleString()}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="caption" color="text.secondary">
                  Put Volume
                </MDTypography>
                <MDTypography variant="h6" color="error">
                  {parseInt(item.put_volume || 0).toLocaleString()}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="caption" color="text.secondary">
                  Call Premium
                </MDTypography>
                <MDTypography variant="h6" color="success">
                  ${formatNumber(item.call_premium)}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="caption" color="text.secondary">
                  Put Premium
                </MDTypography>
                <MDTypography variant="h6" color="error">
                  ${formatNumber(item.put_premium)}
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <DataTableHeadCell>Métrique</DataTableHeadCell>
                <DataTableHeadCell align="right">Valeur</DataTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <DataTableBodyCell>Date</DataTableBodyCell>
                <DataTableBodyCell align="right">{item.date || "N/A"}</DataTableBodyCell>
              </TableRow>
              <TableRow>
                <DataTableBodyCell>Call Open Interest</DataTableBodyCell>
                <DataTableBodyCell align="right">{parseInt(item.call_open_interest || 0).toLocaleString()}</DataTableBodyCell>
              </TableRow>
              <TableRow>
                <DataTableBodyCell>Put Open Interest</DataTableBodyCell>
                <DataTableBodyCell align="right">{parseInt(item.put_open_interest || 0).toLocaleString()}</DataTableBodyCell>
              </TableRow>
              <TableRow>
                <DataTableBodyCell>Call Volume (Ask)</DataTableBodyCell>
                <DataTableBodyCell align="right">{parseInt(item.call_volume_ask_side || 0).toLocaleString()}</DataTableBodyCell>
              </TableRow>
              <TableRow>
                <DataTableBodyCell>Call Volume (Bid)</DataTableBodyCell>
                <DataTableBodyCell align="right">{parseInt(item.call_volume_bid_side || 0).toLocaleString()}</DataTableBodyCell>
              </TableRow>
              <TableRow>
                <DataTableBodyCell>Put Volume (Ask)</DataTableBodyCell>
                <DataTableBodyCell align="right">{parseInt(item.put_volume_ask_side || 0).toLocaleString()}</DataTableBodyCell>
              </TableRow>
              <TableRow>
                <DataTableBodyCell>Put Volume (Bid)</DataTableBodyCell>
                <DataTableBodyCell align="right">{parseInt(item.put_volume_bid_side || 0).toLocaleString()}</DataTableBodyCell>
              </TableRow>
              <TableRow>
                <DataTableBodyCell>Net Call Premium</DataTableBodyCell>
                <DataTableBodyCell align="right" color={parseFloat(item.net_call_premium || 0) >= 0 ? "success" : "error"}>
                  ${formatNumber(item.net_call_premium)}
                </DataTableBodyCell>
              </TableRow>
              <TableRow>
                <DataTableBodyCell>Net Put Premium</DataTableBodyCell>
                <DataTableBodyCell align="right" color={parseFloat(item.net_put_premium || 0) >= 0 ? "success" : "error"}>
                  ${formatNumber(item.net_put_premium)}
                </DataTableBodyCell>
              </TableRow>
              <TableRow>
                <DataTableBodyCell>Bullish Premium</DataTableBodyCell>
                <DataTableBodyCell align="right" color="success">
                  ${formatNumber(item.bullish_premium)}
                </DataTableBodyCell>
              </TableRow>
              <TableRow>
                <DataTableBodyCell>Bearish Premium</DataTableBodyCell>
                <DataTableBodyCell align="right" color="error">
                  ${formatNumber(item.bearish_premium)}
                </DataTableBodyCell>
              </TableRow>
              <TableRow>
                <DataTableBodyCell>Avg 3D Call Volume</DataTableBodyCell>
                <DataTableBodyCell align="right">{formatNumber(item.avg_3_day_call_volume)}</DataTableBodyCell>
              </TableRow>
              <TableRow>
                <DataTableBodyCell>Avg 3D Put Volume</DataTableBodyCell>
                <DataTableBodyCell align="right">{formatNumber(item.avg_3_day_put_volume)}</DataTableBodyCell>
              </TableRow>
              <TableRow>
                <DataTableBodyCell>Avg 7D Call Volume</DataTableBodyCell>
                <DataTableBodyCell align="right">{formatNumber(item.avg_7_day_call_volume)}</DataTableBodyCell>
              </TableRow>
              <TableRow>
                <DataTableBodyCell>Avg 7D Put Volume</DataTableBodyCell>
                <DataTableBodyCell align="right">{formatNumber(item.avg_7_day_put_volume)}</DataTableBodyCell>
              </TableRow>
              <TableRow>
                <DataTableBodyCell>Avg 30D Call Volume</DataTableBodyCell>
                <DataTableBodyCell align="right">{formatNumber(item.avg_30_day_call_volume)}</DataTableBodyCell>
              </TableRow>
              <TableRow>
                <DataTableBodyCell>Avg 30D Put Volume</DataTableBodyCell>
                <DataTableBodyCell align="right">{formatNumber(item.avg_30_day_put_volume)}</DataTableBodyCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </MDBox>
    </Card>
  );
}

export default OptionsVolume;

