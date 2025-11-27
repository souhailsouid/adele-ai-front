/**
 * Composant pour comparer plusieurs entreprises
 */

import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import LinearProgress from "@mui/material/LinearProgress";
import { formatCurrency, formatPercent, formatRatio } from "./utils";

function CompanyComparison({ data = null, loading = false }) {
  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <LinearProgress />
        </MDBox>
      </Card>
    );
  }

  if (!data || !data.companies || data.companies.length === 0) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Aucune donnée de comparaison disponible
          </MDTypography>
        </MDBox>
      </Card>
    );
  }



  const companies = data.companies;

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" fontWeight="medium" mb={3}>
          Comparaison des Entreprises
        </MDTypography>

        <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <MDTypography variant="caption" fontWeight="medium">
                    Métrique
                  </MDTypography>
                </TableCell>
                {companies.map((company, index) => (
                  <TableCell key={index} align="right">
                    <MDTypography variant="caption" fontWeight="medium">
                      {company.symbol}
                    </MDTypography>
                    <MDTypography variant="caption" color="text" display="block">
                      {company.companyName}
                    </MDTypography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  <MDTypography variant="body2">Prix Actuel</MDTypography>
                </TableCell>
                {companies.map((company, index) => (
                  <TableCell key={index} align="right">
                    <MDTypography variant="body2" fontWeight="medium">
                      {formatCurrency(company.currentPrice)}
                    </MDTypography>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>
                  <MDTypography variant="body2">Capitalisation Boursière</MDTypography>
                </TableCell>
                {companies.map((company, index) => (
                  <TableCell key={index} align="right">
                    <MDTypography variant="body2">
                      {formatCurrency(company.marketCap)}
                    </MDTypography>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow sx={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                <TableCell>
                  <MDTypography variant="body2" fontWeight="medium">
                    Ratio P/E
                  </MDTypography>
                </TableCell>
                {companies.map((company, index) => (
                  <TableCell key={index} align="right">
                    <MDTypography variant="body2" fontWeight="medium">
                      {formatRatio(company.peRatio)}
                    </MDTypography>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>
                  <MDTypography variant="body2">P/E TTM</MDTypography>
                </TableCell>
                {companies.map((company, index) => (
                  <TableCell key={index} align="right">
                    <MDTypography variant="body2">
                      {formatRatio(company.peRatioTTM)}
                    </MDTypography>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>
                  <MDTypography variant="body2">Price-to-Sales</MDTypography>
                </TableCell>
                {companies.map((company, index) => (
                  <TableCell key={index} align="right">
                    <MDTypography variant="body2">
                      {formatRatio(company.priceToSales)}
                    </MDTypography>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow sx={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                <TableCell>
                  <MDTypography variant="body2" fontWeight="medium">
                    Croissance Revenus
                  </MDTypography>
                </TableCell>
                {companies.map((company, index) => (
                  <TableCell key={index} align="right">
                    <MDTypography
                      variant="body2"
                      fontWeight="medium"
                      color={
                        company.revenueGrowth > 0 ? "success" : "error"
                      }
                    >
                      {formatPercent(company.revenueGrowth)}
                    </MDTypography>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>
                  <MDTypography variant="body2">Croissance Bénéfice Net</MDTypography>
                </TableCell>
                {companies.map((company, index) => (
                  <TableCell key={index} align="right">
                    <MDTypography
                      variant="body2"
                      color={company.netIncomeGrowth > 0 ? "success" : "error"}
                    >
                      {formatPercent(company.netIncomeGrowth)}
                    </MDTypography>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>
                  <MDTypography variant="body2">Marge Brute</MDTypography>
                </TableCell>
                {companies.map((company, index) => (
                  <TableCell key={index} align="right">
                    <MDTypography variant="body2">
                      {formatPercent(company.grossProfitMargin)}
                    </MDTypography>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>
                  <MDTypography variant="body2">Marge Nette</MDTypography>
                </TableCell>
                {companies.map((company, index) => (
                  <TableCell key={index} align="right">
                    <MDTypography variant="body2">
                      {formatPercent(company.netProfitMargin)}
                    </MDTypography>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow sx={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                <TableCell>
                  <MDTypography variant="body2" fontWeight="medium">
                    ROE
                  </MDTypography>
                </TableCell>
                {companies.map((company, index) => (
                  <TableCell key={index} align="right">
                    <MDTypography variant="body2" fontWeight="medium">
                      {formatPercent(company.roe)}
                    </MDTypography>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>
                  <MDTypography variant="body2">ROA</MDTypography>
                </TableCell>
                {companies.map((company, index) => (
                  <TableCell key={index} align="right">
                    <MDTypography variant="body2">
                      {formatPercent(company.roa)}
                    </MDTypography>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </MDBox>
    </Card>
  );
}

export default CompanyComparison;

