/**
 * Composant pour afficher les états financiers d'une entreprise
 */

import { useState } from "react";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import LinearProgress from "@mui/material/LinearProgress";
import { formatCurrency, formatPercent } from "./utils";

function FinancialStatements({ data = [], loading = false }) {
  const [selectedPeriod, setSelectedPeriod] = useState("annual");

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
            Aucune donnée financière disponible
          </MDTypography>
        </MDBox>
      </Card>
    );
  }


  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" fontWeight="medium" mb={2}>
          États Financiers
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
                {data.map((stmt, index) => (
                  <TableCell key={index} align="right">
                    <MDTypography variant="caption" fontWeight="medium">
                      {stmt.date || "N/A"}
                    </MDTypography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  <MDTypography variant="body2">Revenus</MDTypography>
                </TableCell>
                {data.map((stmt, index) => (
                  <TableCell key={index} align="right">
                    <MDTypography variant="body2" fontWeight="medium">
                      {formatCurrency(stmt.revenue)}
                    </MDTypography>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>
                  <MDTypography variant="body2">Coût des Revenus</MDTypography>
                </TableCell>
                {data.map((stmt, index) => (
                  <TableCell key={index} align="right">
                    <MDTypography variant="body2">
                      {formatCurrency(stmt.costOfRevenue)}
                    </MDTypography>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow sx={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                <TableCell>
                  <MDTypography variant="body2" fontWeight="medium">
                    Bénéfice Brut
                  </MDTypography>
                </TableCell>
                {data.map((stmt, index) => (
                  <TableCell key={index} align="right">
                    <MDTypography variant="body2" fontWeight="medium" color="success">
                      {formatCurrency(stmt.grossProfit)}
                    </MDTypography>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>
                  <MDTypography variant="body2">Revenus d&apos;Exploitation</MDTypography>
                </TableCell>
                {data.map((stmt, index) => (
                  <TableCell key={index} align="right">
                    <MDTypography variant="body2">
                      {formatCurrency(stmt.operatingIncome)}
                    </MDTypography>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>
                  <MDTypography variant="body2">EBITDA</MDTypography>
                </TableCell>
                {data.map((stmt, index) => (
                  <TableCell key={index} align="right">
                    <MDTypography variant="body2">
                      {formatCurrency(stmt.ebitda)}
                    </MDTypography>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow sx={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                <TableCell>
                  <MDTypography variant="body2" fontWeight="medium">
                    Résultat Net
                  </MDTypography>
                </TableCell>
                {data.map((stmt, index) => (
                  <TableCell key={index} align="right">
                    <MDTypography
                      variant="body2"
                      fontWeight="medium"
                      color={stmt.netIncome >= 0 ? "success" : "error"}
                    >
                      {formatCurrency(stmt.netIncome)}
                    </MDTypography>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>
                  <MDTypography variant="body2">EPS (Bénéfice par Action)</MDTypography>
                </TableCell>
                {data.map((stmt, index) => (
                  <TableCell key={index} align="right">
                    <MDTypography variant="body2">
                      ${stmt.eps ? stmt.eps.toFixed(2) : "N/A"}
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

export default FinancialStatements;

