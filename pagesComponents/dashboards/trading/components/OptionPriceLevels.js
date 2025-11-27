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

function OptionPriceLevels({ ticker = "", date = "", onError = () => {}, onLoading = () => {} }) {
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
        const response = await unusualWhalesClient.getStockOptionPriceLevels(ticker, params);
        const extracted = Array.isArray(response?.data) ? response.data : [];
        setData(extracted);
      } catch (err) {
        console.error("Error loading option price levels:", err);
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
            Veuillez sélectionner un ticker pour voir les niveaux de prix des options.
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
        label: "Call Volume",
        data: sortedData.map((item) => parseInt(item.call_volume || 0)),
        color: "success",
      },
      {
        label: "Put Volume",
        data: sortedData.map((item) => parseInt(item.put_volume || 0)),
        color: "error",
      },
    ],
  };

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" mb={3}>
          Option Price Levels - {ticker}
        </MDTypography>
        <MDBox mb={3}>
          <DefaultLineChart
            icon={{ component: "show_chart", color: "info" }}
            title="Call vs Put Volume by Price Level"
            description="Volume des options call et put par niveau de prix"
            chart={chartData}
          />
        </MDBox>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <DataTableHeadCell>Price Level</DataTableHeadCell>
                <DataTableHeadCell align="right">Call Volume</DataTableHeadCell>
                <DataTableHeadCell align="right">Put Volume</DataTableHeadCell>
                <DataTableHeadCell align="right">Total Volume</DataTableHeadCell>
                <DataTableHeadCell align="right">Call/Put Ratio</DataTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((item, index) => {
                const callVol = parseInt(item.call_volume || 0);
                const putVol = parseInt(item.put_volume || 0);
                const totalVol = callVol + putVol;
                const ratio = putVol > 0 ? (callVol / putVol).toFixed(2) : callVol > 0 ? "∞" : "0";
                return (
                  <TableRow key={index}>
                    <DataTableBodyCell>${item.price || "N/A"}</DataTableBodyCell>
                    <DataTableBodyCell align="right" color="success">
                      {callVol.toLocaleString()}
                    </DataTableBodyCell>
                    <DataTableBodyCell align="right" color="error">
                      {putVol.toLocaleString()}
                    </DataTableBodyCell>
                    <DataTableBodyCell align="right">{totalVol.toLocaleString()}</DataTableBodyCell>
                    <DataTableBodyCell align="right">{ratio}</DataTableBodyCell>
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

export default OptionPriceLevels;


