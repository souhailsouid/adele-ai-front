/**
 * Composant pour afficher les ratios financiers
 */

import { Card, Grid } from "@mui/material";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import LinearProgress from "@mui/material/LinearProgress";
import { formatRatio, formatPercent } from "./utils";

function FinancialRatios({ analysis = null, loading = false }) {
  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <LinearProgress />
        </MDBox>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="body2" color="text">
            Aucune donnée disponible
          </MDTypography>
        </MDBox>
      </Card>
    );
  }


  const getRatioColor = (ratioName, value) => {
    if (value === null || value === undefined) return "text";

    switch (ratioName) {
      case "peRatio":
        if (value > 0 && value < 15) return "success";
        if (value >= 15 && value < 25) return "info";
        if (value >= 25 && value < 35) return "warning";
        return "error";
      case "roe":
      case "roa":
        if (value > 15) return "success";
        if (value > 10) return "info";
        if (value > 5) return "warning";
        return "error";
      default:
        return "text";
    }
  };

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" fontWeight="medium" mb={3}>
          Ratios Financiers
        </MDTypography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <MDBox>
              <MDTypography variant="caption" color="text" fontWeight="medium">
                Ratio P/E (Cours/Bénéfice)
              </MDTypography>
              <MDTypography
                variant="h5"
                fontWeight="bold"
                color={getRatioColor("peRatio", analysis.peRatio)}
              >
                {formatRatio(analysis.peRatio)}
              </MDTypography>
              {analysis.peRatioTTM && (
                <MDTypography variant="caption" color="text">
                  P/E TTM: {formatRatio(analysis.peRatioTTM)}
                </MDTypography>
              )}
            </MDBox>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <MDBox>
              <MDTypography variant="caption" color="text" fontWeight="medium">
                Price-to-Sales
              </MDTypography>
              <MDTypography variant="h5" fontWeight="bold" color="text">
                {formatRatio(analysis.priceToSales)}
              </MDTypography>
            </MDBox>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <MDBox>
              <MDTypography variant="caption" color="text" fontWeight="medium">
                Price-to-Book
              </MDTypography>
              <MDTypography variant="h5" fontWeight="bold" color="text">
                {formatRatio(analysis.priceToBook)}
              </MDTypography>
            </MDBox>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <MDBox>
              <MDTypography variant="caption" color="text" fontWeight="medium">
                ROE (Return on Equity)
              </MDTypography>
              <MDTypography
                variant="h5"
                fontWeight="bold"
                color={getRatioColor("roe", analysis.roe)}
              >
                {formatPercent(analysis.roe)}
              </MDTypography>
            </MDBox>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <MDBox>
              <MDTypography variant="caption" color="text" fontWeight="medium">
                ROA (Return on Assets)
              </MDTypography>
              <MDTypography
                variant="h5"
                fontWeight="bold"
                color={getRatioColor("roa", analysis.roa)}
              >
                {formatPercent(analysis.roa)}
              </MDTypography>
            </MDBox>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <MDBox>
              <MDTypography variant="caption" color="text" fontWeight="medium">
                Dette/Equité
              </MDTypography>
              <MDTypography variant="h5" fontWeight="bold" color="text">
                {formatRatio(analysis.debtToEquity)}
              </MDTypography>
            </MDBox>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <MDBox>
              <MDTypography variant="caption" color="text" fontWeight="medium">
                Ratio de Liquidité
              </MDTypography>
              <MDTypography variant="h5" fontWeight="bold" color="text">
                {formatRatio(analysis.currentRatio)}
              </MDTypography>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
    </Card>
  );
}

export default FinancialRatios;

