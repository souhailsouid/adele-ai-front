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

function StockVolumePriceLevels({ ticker = "", date = "", onError = () => {}, onLoading = () => {} }) {
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
        const response = await unusualWhalesClient.getStockVolumePriceLevels(ticker, params);
        const extracted = Array.isArray(response?.data) ? response.data : [];
        setData(extracted);
      } catch (err) {
        console.error("Error loading stock volume price levels:", err);
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
            Veuillez sélectionner un ticker pour voir le volume lit/off-lit par niveau de prix.
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

  // Trier par prix
  const sortedData = [...data].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

  const chartData = {
    labels: sortedData.map((item) => `$${item.price}`),
    datasets: [
      {
        label: "Lit Volume",
        data: sortedData.map((item) => parseInt(item.lit_vol || 0)),
        color: "success",
      },
      {
        label: "Off-Lit Volume",
        data: sortedData.map((item) => parseInt(item.off_vol || 0)),
        color: "warning",
      },
    ],
  };

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" mb={3}>
          Stock Volume Price Levels (Lit vs Off-Lit) - {ticker}
        </MDTypography>
        <MDBox mb={2}>
          <MDTypography variant="caption" color="text.secondary">
            Note: Le volume ne représente pas le volume quotidien complet du marché. Il représente uniquement les trades exécutés sur les exchanges opérés par Nasdaq et les exchanges off-lit FINRA.
          </MDTypography>
        </MDBox>
        <MDBox mb={3}>
          <DefaultLineChart
            icon={{ component: "bar_chart", color: "info" }}
            title="Lit vs Off-Lit Volume by Price Level"
            description="Volume lit et off-lit par niveau de prix"
            chart={chartData}
          />
        </MDBox>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <DataTableHeadCell>Price Level</DataTableHeadCell>
                <DataTableHeadCell align="right">Lit Volume</DataTableHeadCell>
                <DataTableHeadCell align="right">Off-Lit Volume</DataTableHeadCell>
                <DataTableHeadCell align="right">Total Volume</DataTableHeadCell>
                <DataTableHeadCell align="right">Off-Lit %</DataTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((item, index) => {
                const litVol = parseInt(item.lit_vol || 0);
                const offVol = parseInt(item.off_vol || 0);
                const totalVol = litVol + offVol;
                const offLitPercent = totalVol > 0 ? ((offVol / totalVol) * 100).toFixed(2) : "0";
                return (
                  <TableRow key={index}>
                    <DataTableBodyCell>${item.price || "N/A"}</DataTableBodyCell>
                    <DataTableBodyCell align="right" color="success">
                      {litVol.toLocaleString()}
                    </DataTableBodyCell>
                    <DataTableBodyCell align="right" color="warning">
                      {offVol.toLocaleString()}
                    </DataTableBodyCell>
                    <DataTableBodyCell align="right">{totalVol.toLocaleString()}</DataTableBodyCell>
                    <DataTableBodyCell align="right">{offLitPercent}%</DataTableBodyCell>
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

export default StockVolumePriceLevels;


