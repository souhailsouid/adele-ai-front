/**
 * Options Flow - Affiche les flows d'options récents pour les principales actions
 */

import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Skeleton from "@mui/material/Skeleton";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import intelligenceClient from "/lib/api/intelligenceClient";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";
import Icon from "@mui/material/Icon";
import { formatCurrency, formatDate } from "/utils/formatting";

function OptionsFlow() {
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOptionsFlow();
  }, []);

  const loadOptionsFlow = async () => {
    try {
      setLoading(true);
      setError(null);

      // Tickers populaires pour charger les options flow
      const topTickers = ["AAPL", "MSFT", "TSLA", "NVDA", "AMZN", "GOOGL", "META", "SPY", "QQQ"];

      // Charger les options flow pour tous les tickers en parallèle
      const results = await Promise.allSettled(
        topTickers.map(async (ticker) => {
          try {
            const response = await intelligenceClient.getTickerOptionsFlow(ticker, {
              limit: 10,
              min_premium: 50000, // Filtrer les flows significatifs (50k+)
            });
            if (response.success && Array.isArray(response.data)) {
              return response.data.map(flow => ({
                ...flow,
                ticker: ticker,
              }));
            }
            return [];
          } catch (err) {
            console.error(`Error loading options flow for ${ticker}:`, err);
            return [];
          }
        })
      );

      // Combiner tous les flows
      const allFlows = results
        .filter(r => r.status === "fulfilled")
        .flatMap(r => r.value || []);

      // Trier par date (plus récent en premier) puis par premium (plus élevé en premier)
      allFlows.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        if (dateB - dateA !== 0) {
          return dateB - dateA;
        }
        const premiumA = parseFloat(a.total_premium || a.premium || 0);
        const premiumB = parseFloat(b.total_premium || b.premium || 0);
        return premiumB - premiumA;
      });

      // Limiter à 30 flows les plus récents
      setFlows(allFlows.slice(0, 30));
    } catch (err) {
      console.error("Error loading options flow:", err);
      setError(err.message || "Erreur lors du chargement des options flow");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <MDBox p={1.5} sx={{ borderBottom: 1, borderColor: "divider" }}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <Skeleton variant="text" width={180} height={24} />
            <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 1 }} />
          </MDBox>
        </MDBox>
        <TableContainer sx={{ flexGrow: 1, overflowY: "auto", maxHeight: "calc(100vh - 300px)" }}>
          <Table size="small" sx={{ "& .MuiTableCell-root": { padding: "6px 8px" } }}>
            <MDBox component="thead">
              <TableRow>
                <DataTableHeadCell width="12%" align="left">
                  <Skeleton variant="text" width={50} height={20} />
                </DataTableHeadCell>
                <DataTableHeadCell width="10%" align="left">
                  <Skeleton variant="text" width={50} height={20} />
                </DataTableHeadCell>
                <DataTableHeadCell width="12%" align="left">
                  <Skeleton variant="text" width={60} height={20} />
                </DataTableHeadCell>
                <DataTableHeadCell width="15%" align="left">
                  <Skeleton variant="text" width={70} height={20} />
                </DataTableHeadCell>
                <DataTableHeadCell width="10%" align="left">
                  <Skeleton variant="text" width={50} height={20} />
                </DataTableHeadCell>
                <DataTableHeadCell width="15%" align="left">
                  <Skeleton variant="text" width={60} height={20} />
                </DataTableHeadCell>
                <DataTableHeadCell width="15%" align="left">
                  <Skeleton variant="text" width={60} height={20} />
                </DataTableHeadCell>
              </TableRow>
            </MDBox>
            <TableBody>
              {[...Array(8)].map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <DataTableBodyCell align="left">
                    <Skeleton variant="rectangular" width={50} height={22} sx={{ borderRadius: 1 }} />
                  </DataTableBodyCell>
                  <DataTableBodyCell align="left">
                    <Skeleton variant="rectangular" width={60} height={22} sx={{ borderRadius: 1 }} />
                  </DataTableBodyCell>
                  <DataTableBodyCell align="left">
                    <Skeleton variant="text" width={80} height={20} />
                  </DataTableBodyCell>
                  <DataTableBodyCell align="left">
                    <Skeleton variant="text" width={90} height={20} />
                  </DataTableBodyCell>
                  <DataTableBodyCell align="left">
                    <Skeleton variant="text" width={50} height={20} />
                  </DataTableBodyCell>
                  <DataTableBodyCell align="left">
                    <Skeleton variant="text" width={70} height={20} />
                  </DataTableBodyCell>
                  <DataTableBodyCell align="left">
                    <Skeleton variant="text" width={70} height={20} />
                  </DataTableBodyCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height: "100%" }}>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Options Flow
          </MDTypography>
          <MDTypography variant="body2" color="error">
            {error}
          </MDTypography>
        </MDBox>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <MDBox p={1.5} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h6" fontWeight="medium" sx={{ fontSize: "1rem" }}>
            Options Flow
          </MDTypography>
          <Chip
            label={`${flows.length}`}
            size="small"
            color="info"
            icon={<Icon fontSize="small" sx={{ fontSize: "0.875rem !important" }}>trending_up</Icon>}
            sx={{
              height: "24px",
              fontSize: "0.75rem",
              "& .MuiChip-label": { padding: "0 6px" }
            }}
          />
        </MDBox>
        <MDTypography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem", mt: 0.25 }}>
          Flows récents • Premium min: $50K
        </MDTypography>
      </MDBox>

      <TableContainer sx={{ flexGrow: 1, overflowY: "auto", maxHeight: "calc(100vh - 300px)" }}>
        <Table stickyHeader size="small" sx={{ "& .MuiTableCell-root": { padding: "6px 8px" } }}>
          <MDBox component="thead">
            <TableRow>
              <DataTableHeadCell width="12%" align="left" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>Ticker</DataTableHeadCell>
              <DataTableHeadCell width="10%" align="left" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>Type</DataTableHeadCell>
              <DataTableHeadCell width="12%" align="left" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>Strike</DataTableHeadCell>
              <DataTableHeadCell width="15%" align="left" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>Premium</DataTableHeadCell>
              <DataTableHeadCell width="10%" align="left" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>Volume</DataTableHeadCell>
              <DataTableHeadCell width="15%" align="left" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>Expiry</DataTableHeadCell>
              <DataTableHeadCell width="15%" align="left" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>Date</DataTableHeadCell>
            </TableRow>
          </MDBox>
          <TableBody>
            {flows.length === 0 ? (
              <TableRow>
                <DataTableBodyCell colSpan={7} align="center">
                  <MDTypography variant="body2" color="text.secondary" py={2} sx={{ fontSize: "0.8rem" }}>
                    Aucun flow d&apos;options disponible
                  </MDTypography>
                </DataTableBodyCell>
              </TableRow>
            ) : (
              flows.map((flow, index) => {
                const type = flow.type?.toLowerCase() || "";
                const premium = parseFloat(flow.total_premium || flow.premium || 0);
                
                return (
                  <TableRow
                    key={`flow-${index}-${flow.ticker}-${flow.created_at}`}
                    sx={{ "&:hover": { backgroundColor: "action.hover" } }}
                  >
                    <DataTableBodyCell align="left" sx={{ py: 0.75 }}>
                      <MDTypography variant="caption" fontWeight="bold" color="primary" sx={{ fontSize: "0.8rem" }}>
                        {flow.ticker || "N/A"}
                      </MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left" sx={{ py: 0.75 }}>
                      <Chip
                        label={type === "call" ? "CALL" : type === "put" ? "PUT" : type?.toUpperCase() || "N/A"}
                        size="small"
                        color={type === "call" ? "success" : "error"}
                        sx={{
                          fontSize: "0.7rem",
                          height: "22px",
                          "& .MuiChip-label": { padding: "0 6px" }
                        }}
                      />
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left" sx={{ py: 0.75 }}>
                      <MDTypography variant="caption" sx={{ fontSize: "0.75rem" }}>
                        {formatCurrency(flow.strike)}
                      </MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left" sx={{ py: 0.75 }}>
                      <MDTypography
                        variant="caption"
                        fontWeight="bold"
                        color="info"
                        sx={{ fontSize: "0.8rem" }}
                      >
                        {formatCurrency(premium)}
                      </MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left" sx={{ py: 0.75 }}>
                      <MDTypography variant="caption" sx={{ fontSize: "0.75rem" }}>
                        {flow.volume ? flow.volume.toLocaleString() : "N/A"}
                      </MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left" sx={{ py: 0.75 }}>
                      <MDTypography variant="caption" sx={{ fontSize: "0.75rem" }}>
                        {flow.expiry ? formatDate(flow.expiry, "fr-FR", false) : "N/A"}
                      </MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left" sx={{ py: 0.75 }}>
                      <MDTypography variant="caption" sx={{ fontSize: "0.75rem" }}>
                        {flow.created_at ? formatDate(flow.created_at, "fr-FR", true) : "N/A"}
                      </MDTypography>
                    </DataTableBodyCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

export default OptionsFlow;

