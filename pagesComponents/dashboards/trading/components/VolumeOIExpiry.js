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

function VolumeOIExpiry({ ticker = "", date = "", onError = () => {}, onLoading = () => {} }) {
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
        const response = await unusualWhalesClient.getStockVolumeOIExpiry(ticker, params);
        const extracted = Array.isArray(response?.data) ? response.data : [];
        setData(extracted);
      } catch (err) {
        console.error("Error loading volume OI expiry:", err);
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
            Veuillez sélectionner un ticker pour voir le volume et OI par expiry.
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

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" mb={3}>
          Volume & OI per Expiry - {ticker}
        </MDTypography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <DataTableHeadCell>Expiry</DataTableHeadCell>
                <DataTableHeadCell align="right">Volume</DataTableHeadCell>
                <DataTableHeadCell align="right">Open Interest</DataTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={index}>
                  <DataTableBodyCell>{item.expires || item.expiry || "N/A"}</DataTableBodyCell>
                  <DataTableBodyCell align="right">{parseInt(item.volume || 0).toLocaleString()}</DataTableBodyCell>
                  <DataTableBodyCell align="right">{parseInt(item.oi || 0).toLocaleString()}</DataTableBodyCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </MDBox>
    </Card>
  );
}

export default VolumeOIExpiry;


