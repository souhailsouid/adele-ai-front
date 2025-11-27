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
import unusualWhalesClient from "/lib/unusual-whales/client";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

function InsiderBuySellsTicker({ ticker = "" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticker) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await unusualWhalesClient.getStockInsiderBuySells(ticker);
        const extracted = Array.isArray(response) ? response : (response?.data || []);
        setData(extracted);
      } catch (err) {
        console.error("Error loading insider buy sells:", err);
        setError(err.message || "Erreur lors du chargement");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ticker]);

  const formatNumber = (num) => {
    if (!num || num === 0) return "-";
    const numValue = typeof num === "string" ? parseFloat(num) : num;
    if (isNaN(numValue)) return "-";
    if (Math.abs(numValue) >= 1_000_000_000) return `$${(Math.abs(numValue) / 1_000_000_000).toFixed(2)}B`;
    if (Math.abs(numValue) >= 1_000_000) return `$${(Math.abs(numValue) / 1_000_000).toFixed(2)}M`;
    if (Math.abs(numValue) >= 1_000) return `$${(Math.abs(numValue) / 1_000).toFixed(2)}K`;
    return `$${Math.abs(numValue).toFixed(2)}`;
  };

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
            Insider Buy/Sells ({ticker}) ({data.length})
          </MDTypography>
          <Tooltip title="Montant total des achats et ventes ainsi que les valeurs notionnelles pour les transactions d'insiders">
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
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucune donnée disponible
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="20%" align="left">Filing Date</DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="right">Purchases</DataTableHeadCell>
                  <DataTableHeadCell width="20%" align="right">Purchases Notional</DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="right">Sells</DataTableHeadCell>
                  <DataTableHeadCell width="20%" align="right">Sells Notional</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Net</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.map((item, index) => {
                  const purchases = parseNumber(item.purchases);
                  const purchasesNotional = parseNumber(item.purchases_notional);
                  const sells = parseNumber(item.sells);
                  const sellsNotional = parseNumber(item.sells_notional);
                  const net = purchasesNotional + sellsNotional; // sells_notional is already negative

                  return (
                    <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="body2" fontWeight="medium">
                          {formatDate(item.filing_date)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="success.main">
                          {purchases}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium" color="success.main">
                          {formatNumber(purchasesNotional)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="error.main">
                          {sells}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium" color="error.main">
                          {formatNumber(sellsNotional)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="bold" color={net >= 0 ? "success.main" : "error.main"}>
                          {formatNumber(net)}
                        </MDTypography>
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

export default InsiderBuySellsTicker;


