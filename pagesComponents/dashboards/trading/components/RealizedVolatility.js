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
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import unusualWhalesClient from "/lib/unusual-whales/client";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";
import DefaultLineChart from "/examples/Charts/LineCharts/DefaultLineChart";

function RealizedVolatility({ ticker = "", date = "", onError = () => {}, onLoading = () => {} }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState("1Y");

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
        const params = { timeframe };
        if (date) params.date = date;
        const response = await unusualWhalesClient.getStockRealizedVolatility(ticker, params);
        const extracted = Array.isArray(response?.data) ? response.data : [];
        setData(extracted);
      } catch (err) {
        console.error("Error loading realized volatility:", err);
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
  }, [ticker, date, timeframe]);

  if (!ticker) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Veuillez sélectionner un ticker pour voir la volatilité réalisée.
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
    labels: data.map((item) => item.date),
    datasets: [
      {
        label: "Implied Volatility",
        data: data.map((item) => parseFloat(item.implied_volatility || 0) * 100),
        color: "info",
      },
      {
        label: "Realized Volatility",
        data: data.map((item) => parseFloat(item.realized_volatility || 0) * 100),
        color: "success",
      },
    ],
  };

  return (
    <Card>
      <MDBox p={3}>
        <Grid container spacing={2} mb={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <MDTypography variant="h6">
              Realized vs Implied Volatility - {ticker}
            </MDTypography>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl variant="standard" fullWidth>
              <InputLabel>Timeframe</InputLabel>
              <Select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} label="Timeframe">
                <MenuItem value="YTD">YTD</MenuItem>
                <MenuItem value="1D">1 Day</MenuItem>
                <MenuItem value="1W">1 Week</MenuItem>
                <MenuItem value="1M">1 Month</MenuItem>
                <MenuItem value="2M">2 Months</MenuItem>
                <MenuItem value="3M">3 Months</MenuItem>
                <MenuItem value="6M">6 Months</MenuItem>
                <MenuItem value="1Y">1 Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <MDBox mb={3}>
          <DefaultLineChart
            icon={{ component: "insights", color: "info" }}
            title="IV vs RV"
            description="Implied vs Realized Volatility"
            chart={chartData}
          />
        </MDBox>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <DataTableHeadCell>Date</DataTableHeadCell>
                <DataTableHeadCell align="right">Price</DataTableHeadCell>
                <DataTableHeadCell align="right">Implied Vol (%)</DataTableHeadCell>
                <DataTableHeadCell align="right">Realized Vol (%)</DataTableHeadCell>
                <DataTableHeadCell>RV Date</DataTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={index}>
                  <DataTableBodyCell>{item.date || "N/A"}</DataTableBodyCell>
                  <DataTableBodyCell align="right">${parseFloat(item.price || 0).toFixed(2)}</DataTableBodyCell>
                  <DataTableBodyCell align="right">
                    {(parseFloat(item.implied_volatility || 0) * 100).toFixed(2)}%
                  </DataTableBodyCell>
                  <DataTableBodyCell align="right">
                    {(parseFloat(item.realized_volatility || 0) * 100).toFixed(2)}%
                  </DataTableBodyCell>
                  <DataTableBodyCell>{item.unshifted_rv_date || "N/A"}</DataTableBodyCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </MDBox>
    </Card>
  );
}

export default RealizedVolatility;

