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

function VolatilityTermStructure({ ticker = "", date = "", onError = () => {}, onLoading = () => {} }) {
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
        const response = await unusualWhalesClient.getStockVolatilityTermStructure(ticker, params);
        const extracted = Array.isArray(response?.data) ? response.data : [];
        setData(extracted);
      } catch (err) {
        console.error("Error loading volatility term structure:", err);
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
            Veuillez sélectionner un ticker pour voir la structure à terme de la volatilité.
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

  const chartData = {
    labels: data.map((item) => `${item.dte} DTE`),
    datasets: [
      {
        label: "Volatility (%)",
        data: data.map((item) => parseFloat(item.volatility || 0) * 100),
        color: "info",
      },
      {
        label: "Implied Move (%)",
        data: data.map((item) => parseFloat(item.implied_move_perc || 0) * 100),
        color: "success",
      },
    ],
  };

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" mb={3}>
          Volatility Term Structure - {ticker}
        </MDTypography>
        <MDBox mb={3}>
          <DefaultLineChart
            icon={{ component: "insights", color: "info" }}
            title="Term Structure"
            description="Volatility and Implied Move by DTE"
            chart={chartData}
          />
        </MDBox>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <DataTableHeadCell>Date</DataTableHeadCell>
                <DataTableHeadCell>Expiry</DataTableHeadCell>
                <DataTableHeadCell align="right">DTE</DataTableHeadCell>
                <DataTableHeadCell align="right">Volatility (%)</DataTableHeadCell>
                <DataTableHeadCell align="right">Implied Move</DataTableHeadCell>
                <DataTableHeadCell align="right">Implied Move (%)</DataTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={index}>
                  <DataTableBodyCell>{item.date || "N/A"}</DataTableBodyCell>
                  <DataTableBodyCell>{item.expiry || "N/A"}</DataTableBodyCell>
                  <DataTableBodyCell align="right">{item.dte || "N/A"}</DataTableBodyCell>
                  <DataTableBodyCell align="right">
                    {(parseFloat(item.volatility || 0) * 100).toFixed(2)}%
                  </DataTableBodyCell>
                  <DataTableBodyCell align="right">${parseFloat(item.implied_move || 0).toFixed(2)}</DataTableBodyCell>
                  <DataTableBodyCell align="right">
                    {(parseFloat(item.implied_move_perc || 0) * 100).toFixed(2)}%
                  </DataTableBodyCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </MDBox>
    </Card>
  );
}

export default VolatilityTermStructure;


