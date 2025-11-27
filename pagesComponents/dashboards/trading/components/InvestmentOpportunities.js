/**
 * Composant pour afficher les opportunités d'investissement
 */

import {
  Card,
  Table,
  TableBody,
  TableContainer,
  TableRow,
  Chip,
  Tooltip,
  IconButton,
} from "@mui/material";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import LinearProgress from "@mui/material/LinearProgress";
import InfoIcon from "@mui/icons-material/Info";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";
import { formatCurrency, formatPercent, formatRatio } from "./utils";

function InvestmentOpportunities({ data = [], loading = false }) {
  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <LinearProgress />
        </MDBox>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Aucune opportunité trouvée
          </MDTypography>
        </MDBox>
      </Card>
    );
  }


  const getScoreColor = (score) => {
    if (score >= 80) return "success";
    if (score >= 60) return "info";
    if (score >= 40) return "warning";
    return "error";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellente";
    if (score >= 60) return "Bonne";
    if (score >= 40) return "Moyenne";
    return "Faible";
  };

  const calculateAvgRevenueGrowth = (revenueGrowth) => {
    if (!revenueGrowth || revenueGrowth.length === 0) return 0;
    return revenueGrowth.reduce((a, b) => a + b, 0) / revenueGrowth.length;
  };

  const getLatestMargin = (margins) => {
    if (!margins || margins.length === 0) return 0;
    return margins[margins.length - 1];
  };

  return (
    <Card>
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDTypography variant="h6">
            Opportunités d&apos;Investissement ({data.length})
          </MDTypography>
          <Tooltip title="Score basé sur le ratio P/E, croissance des revenus/bénéfices, marges de profit, ROE/ROA et tendances">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>

        {data.length === 0 ? (
          <MDBox textAlign="center" py={4}>
            <MDTypography variant="body2" color="text">
              Aucune opportunité trouvée
            </MDTypography>
          </MDBox>
        ) : (
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="10%" align="left">
                    Symbole
                  </DataTableHeadCell>
                  <DataTableHeadCell width="20%" align="left">
                    Entreprise
                  </DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="center">
                    Score
                  </DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">
                    Prix
                  </DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">
                    P/E
                  </DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">
                    Croissance Revenus
                  </DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">
                    Marge Nette
                  </DataTableHeadCell>
                  <DataTableHeadCell width="14%" align="right">
                    ROE
                  </DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.map((opportunity, index) => {
                  const avgRevenueGrowth = calculateAvgRevenueGrowth(opportunity.revenueGrowth);
                  const latestMargin = getLatestMargin(opportunity.netProfitMargin);
                  
                  return (
                    <TableRow
                      key={index}
                      sx={{
                        "&:hover": { backgroundColor: "action.hover" },
                      }}
                    >
                      <DataTableBodyCell align="left">
                        <MDTypography variant="button" fontWeight="bold" color="primary" noWrap>
                          {opportunity.symbol}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="body2" noWrap>
                          {opportunity.companyName || opportunity.symbol}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        <Chip
                          label={`${opportunity.opportunityScore || 0} - ${getScoreLabel(
                            opportunity.opportunityScore || 0
                          )}`}
                          color={getScoreColor(opportunity.opportunityScore || 0)}
                          size="small"
                        />
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium">
                          {formatCurrency(opportunity.currentPrice)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2">
                          {formatRatio(opportunity.peRatio)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography
                          variant="body2"
                          color={avgRevenueGrowth > 0 ? "success" : avgRevenueGrowth < 0 ? "error" : "text"}
                          fontWeight={avgRevenueGrowth !== 0 ? "medium" : "regular"}
                        >
                          {formatPercent(avgRevenueGrowth)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2">
                          {formatPercent(latestMargin)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography
                          variant="body2"
                          color={opportunity.roe > 15 ? "success" : opportunity.roe > 10 ? "info" : "text"}
                          fontWeight={opportunity.roe > 15 ? "medium" : "regular"}
                        >
                          {formatPercent(opportunity.roe)}
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

export default InvestmentOpportunities;

