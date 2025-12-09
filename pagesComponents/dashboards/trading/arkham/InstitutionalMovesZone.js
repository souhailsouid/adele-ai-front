/**
 * Zone Institutional Moves
 * Affiche les mouvements institutionnels : 13F filings, whales, options
 */

import { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import LinearProgress from "@mui/material/LinearProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableContainer from "@mui/material/TableContainer";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";
import FundAvatar from "./FundAvatar";
import Institution13FDetails from "./Institution13FDetails";

function InstitutionalMovesZone({ data = {}, loading = false }) {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedFiling, setSelectedFiling] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Institutional Moves
          </MDTypography>
          <LinearProgress />
        </MDBox>
      </Card>
    );
  }

  const filings = data.filings || [];
  const topFunds = data.topFunds || [];
  const flowAlerts = data.flowAlerts || [];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return dateString;
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Card>
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDTypography variant="h6" fontWeight="bold">
            Institutional Moves
          </MDTypography>
          <MDBox display="flex" gap={1}>
            <Chip
              icon={<Icon>description</Icon>}
              label={`${filings.length} 13F`}
              size="small"
              color="primary"
            />
            <Chip
              icon={<Icon>account_balance</Icon>}
              label={`${topFunds.length} Funds`}
              size="small"
              color="secondary"
            />
            <Chip
              icon={<Icon>swap_horiz</Icon>}
              label={`${flowAlerts.length} Alerts`}
              size="small"
              color="info"
            />
          </MDBox>
        </MDBox>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="13F Filings" />
            <Tab label="Top Funds" />
            <Tab label="Options Flow" />
          </Tabs>
        </Box>

        {/* Tab 0: 13F Filings */}
        {activeTab === 0 && (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="8%">Fund</DataTableHeadCell>
                  <DataTableHeadCell width="22%">Institution</DataTableHeadCell>
                  <DataTableHeadCell width="12%">Form</DataTableHeadCell>
                  <DataTableHeadCell width="12%">Filing Date</DataTableHeadCell>
                  <DataTableHeadCell width="12%">Report Date</DataTableHeadCell>
                  <DataTableHeadCell width="10%">Source</DataTableHeadCell>
                  <DataTableHeadCell width="12%">Value</DataTableHeadCell>
                  <DataTableHeadCell width="12%">Actions</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {filings.slice(0, 10).map((filing, index) => (
                  <TableRow key={`filing-${index}-${filing.cik}-${filing.filingDate}`} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                    <DataTableBodyCell>
                      <FundAvatar
                        fundName={filing.institutionName}
                        size="sm"
                      />
                    </DataTableBodyCell>
                    <DataTableBodyCell>
                      <MDTypography variant="body2" fontWeight="medium">
                        {filing.institutionName && filing.institutionName !== "None"
                          ? filing.institutionName
                          : "N/A"}
                      </MDTypography>
                      <MDTypography variant="caption" color="text.secondary">
                        CIK: {filing.cik}
                      </MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell>
                      <Chip label={filing.formType || "13F-HR"} size="small" color="info" />
                    </DataTableBodyCell>
                    <DataTableBodyCell>
                      <MDTypography variant="body2">{formatDate(filing.filingDate)}</MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell>
                      <MDTypography variant="body2">{formatDate(filing.reportDate)}</MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell>
                      <Chip
                        label={filing.source || "FMP"}
                        size="small"
                        color={
                          filing.source === "BOTH"
                            ? "success"
                            : filing.source === "UW"
                            ? "secondary"
                            : "primary"
                        }
                      />
                    </DataTableBodyCell>
                    <DataTableBodyCell>
                      {filing.totalValue && (
                        <MDBox>
                          <MDTypography variant="body2" fontWeight="medium">
                            ${(filing.totalValue / 1000000000).toFixed(2)}B
                          </MDTypography>
                          {filing.holdingsCount && (
                            <MDTypography variant="caption" color="text.secondary">
                              {filing.holdingsCount} holdings
                            </MDTypography>
                          )}
                        </MDBox>
                      )}
                    </DataTableBodyCell>
                    <DataTableBodyCell>
                      <MDBox display="flex" gap={0.5} justifyContent="center">
                        <Chip
                          icon={<Icon fontSize="small">visibility</Icon>}
                          label="Détails"
                          size="small"
                          color="primary"
                          onClick={() => {
                            setSelectedFiling(filing);
                            setDetailsOpen(true);
                          }}
                          clickable
                          sx={{ cursor: "pointer" }}
                        />
                        {filing.url && (
                          <Chip
                            icon={<Icon fontSize="small">launch</Icon>}
                            label="SEC"
                            size="small"
                            component="a"
                            href={filing.url}
                            target="_blank"
                            rel="noopener"
                            clickable
                          />
                        )}
                      </MDBox>
                    </DataTableBodyCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Tab 1: Top Funds */}
        {activeTab === 1 && (
          <Grid container spacing={2}>
            {topFunds.slice(0, 8).map((fund, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    p: 2,
                    textAlign: "center",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "translateY(-4px)" },
                  }}
                >
                  <FundAvatar fundName={fund.name} size="lg" />
                  <MDTypography variant="body2" fontWeight="bold" mt={1}>
                    {fund.name || "N/A"}
                  </MDTypography>
                  {fund.performance && (
                    <MDTypography
                      variant="caption"
                      color={fund.performance >= 0 ? "success" : "error"}
                    >
                      {fund.performance >= 0 ? "+" : ""}
                      {fund.performance.toFixed(2)}%
                    </MDTypography>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Tab 2: Options Flow */}
        {activeTab === 2 && (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="12%">Ticker</DataTableHeadCell>
                  <DataTableHeadCell width="10%">Type</DataTableHeadCell>
                  <DataTableHeadCell width="18%">Premium</DataTableHeadCell>
                  <DataTableHeadCell width="12%">Strike</DataTableHeadCell>
                  <DataTableHeadCell width="12%">Expiry</DataTableHeadCell>
                  <DataTableHeadCell width="12%">Volume</DataTableHeadCell>
                  <DataTableHeadCell width="12%">OI</DataTableHeadCell>
                  <DataTableHeadCell width="12%">DTE</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {flowAlerts.slice(0, 20).map((flow, index) => {
                  const premium = flow.premium || flow.total_premium || 0;
                  const type = flow.type || flow.option_type || "CALL";
                  const expiry = flow.expiry || flow.expiry_date || "N/A";
                  
                  // Calculer les jours jusqu'à expiration
                  const getDTE = (expiryStr) => {
                    if (!expiryStr || expiryStr === "N/A") return "N/A";
                    try {
                      const expiryDate = new Date(expiryStr);
                      const today = new Date();
                      const diffTime = expiryDate - today;
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays >= 0 ? `${diffDays}d` : "Expired";
                    } catch {
                      return expiryStr;
                    }
                  };

                  return (
                    <TableRow 
                      key={`flow-${index}-${flow.ticker}-${flow.strike}-${expiry}`} 
                      sx={{ "&:hover": { backgroundColor: "action.hover" } }}
                    >
                      <DataTableBodyCell>
                        <MDTypography variant="body2" fontWeight="bold">
                          {flow.ticker || "N/A"}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell>
                        <Chip
                          label={type}
                          size="small"
                          color={type === "CALL" || type === "call" ? "success" : "error"}
                        />
                      </DataTableBodyCell>
                      <DataTableBodyCell>
                        <MDTypography variant="body2" fontWeight="medium" color={premium >= 100000 ? "success" : "text"}>
                          ${premium.toLocaleString()}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell>
                        <MDTypography variant="body2">${flow.strike || "N/A"}</MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell>
                        <MDTypography variant="caption">
                          {expiry}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell>
                        <MDTypography variant="body2">
                          {(flow.volume || 0).toLocaleString()}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell>
                        <MDTypography variant="body2" color="text.secondary">
                          {(flow.open_interest || flow.openInterest || 0).toLocaleString()}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell>
                        <MDTypography variant="caption" color="text.secondary">
                          {getDTE(expiry)}
                        </MDTypography>
                      </DataTableBodyCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {activeTab === 0 && filings.length === 0 && (
          <MDBox textAlign="center" py={4}>
            <MDTypography variant="body2" color="text.secondary">
              Aucun filing 13F disponible
            </MDTypography>
          </MDBox>
        )}
        {activeTab === 1 && topFunds.length === 0 && (
          <MDBox textAlign="center" py={4}>
            <MDTypography variant="body2" color="text.secondary">
              Aucun fond disponible
            </MDTypography>
          </MDBox>
        )}
        {activeTab === 2 && flowAlerts.length === 0 && (
          <MDBox textAlign="center" py={4}>
            <MDTypography variant="body2" color="text.secondary">
              Aucune alerte de flow disponible
            </MDTypography>
          </MDBox>
        )}
      </MDBox>

      {/* Dialog pour les détails du filing */}
      <Institution13FDetails
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedFiling(null);
        }}
        filing={selectedFiling}
      />
    </Card>
  );
}

export default InstitutionalMovesZone;

