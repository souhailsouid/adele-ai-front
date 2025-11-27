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
import unusualWhalesClient from "/lib/unusual-whales/client";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";
import DefaultLineChart from "/examples/Charts/LineCharts/DefaultLineChart";
import { formatDateTime } from "./utils";

function formatNumber(num) {
  if (!num) return "0";
  const n = parseFloat(num);
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return n.toFixed(2);
}

function SpotExposures({ ticker = "", date = "", onError = () => {}, onLoading = () => {} }) {
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
        const response = await unusualWhalesClient.getStockSpotExposures(ticker, params);
        const extracted = Array.isArray(response?.data) ? response.data : [];
        setData(extracted);
      } catch (err) {
        console.error("Error loading spot exposures:", err);
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
  }, [ticker, date]);

  if (!ticker) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Veuillez sélectionner un ticker pour voir les expositions GEX spot.
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

  // Trier par temps
  const sortedData = [...data].sort((a, b) => new Date(a.time) - new Date(b.time));

  const chartData = {
    labels: sortedData.map((item) => {
      const time = formatDateTime(item.time);
      return time.time;
    }),
    datasets: [
      {
        label: "Gamma Exposure (OI)",
        data: sortedData.map((item) => parseFloat(item.gamma_per_one_percent_move_oi || 0)),
        color: "info",
      },
      {
        label: "Gamma Exposure (Vol)",
        data: sortedData.map((item) => parseFloat(item.gamma_per_one_percent_move_vol || 0)),
        color: "success",
      },
    ],
  };

  const latest = sortedData[sortedData.length - 1];

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" mb={3}>
          Spot GEX Exposures per Minute - {ticker}
        </MDTypography>
        {latest && (
          <MDBox mb={3}>
            <MDTypography variant="body2" color="text.secondary" mb={2}>
              Dernière mise à jour: {formatDateTime(latest.time).date} {formatDateTime(latest.time).time} | Price: ${latest.price}
            </MDTypography>
          </MDBox>
        )}
        <MDBox mb={3}>
          <DefaultLineChart
            icon={{ component: "insights", color: "info" }}
            title="Gamma Exposure Over Time"
            description="Exposition Gamma par minute (basée sur OI et Volume)"
            chart={chartData}
          />
        </MDBox>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <DataTableHeadCell>Time</DataTableHeadCell>
                <DataTableHeadCell align="right">Price</DataTableHeadCell>
                <DataTableHeadCell align="right">Gamma OI</DataTableHeadCell>
                <DataTableHeadCell align="right">Gamma Vol</DataTableHeadCell>
                <DataTableHeadCell align="right">Vanna OI</DataTableHeadCell>
                <DataTableHeadCell align="right">Charm OI</DataTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.slice(-20).map((item, index) => {
                const time = formatDateTime(item.time);
                return (
                  <TableRow key={index}>
                    <DataTableBodyCell>
                      {time.date} {time.time}
                    </DataTableBodyCell>
                    <DataTableBodyCell align="right">${item.price || "N/A"}</DataTableBodyCell>
                    <DataTableBodyCell align="right">{formatNumber(item.gamma_per_one_percent_move_oi)}</DataTableBodyCell>
                    <DataTableBodyCell align="right">{formatNumber(item.gamma_per_one_percent_move_vol)}</DataTableBodyCell>
                    <DataTableBodyCell align="right">{formatNumber(item.vanna_per_one_percent_move_oi)}</DataTableBodyCell>
                    <DataTableBodyCell align="right">{formatNumber(item.charm_per_one_percent_move_oi)}</DataTableBodyCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </MDBox>
    </Card>
  );
}

export default SpotExposures;

