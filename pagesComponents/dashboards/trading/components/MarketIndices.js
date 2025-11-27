import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

function MarketIndices({ data = [] }) {
  const getColor = (change) => {
    if (!change) return "text";
    return change >= 0 ? "success" : "error";
  };

  const getIcon = (change) => {
    if (!change) return null;
    return change >= 0 ? (
      <TrendingUpIcon fontSize="small" />
    ) : (
      <TrendingDownIcon fontSize="small" />
    );
  };

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" mb={2}>
          Indices Majeurs
        </MDTypography>
        <Grid container spacing={2}>
          {data.length === 0 ? (
            <Grid item xs={12}>
              <MDTypography variant="body2" color="text">
                Aucune donnée disponible
              </MDTypography>
            </Grid>
          ) : (
            data.map((index) => (
              <Grid item xs={6} md={3} key={index.symbol}>
                <MDBox>
                  <MDTypography variant="caption" color="text" fontWeight="medium">
                    {index.name || index.symbol}
                  </MDTypography>
                  <MDBox display="flex" alignItems="center" mt={0.5}>
                    <MDTypography
                      variant="h6"
                      color={getColor(index.changePercent)}
                      fontWeight="bold"
                    >
                      ${index.price?.toFixed(2) || "N/A"}
                    </MDTypography>
                  </MDBox>
                  <MDBox display="flex" alignItems="center" mt={0.5}>
                    {getIcon(index.changePercent)}
                    <MDTypography
                      variant="caption"
                      color={getColor(index.changePercent)}
                      ml={0.5}
                    >
                      {index.changePercent?.toFixed(2) || "0.00"}% (
                      {index.change?.toFixed(2) || "0.00"})
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Grid>
            ))
          )}
        </Grid>
      </MDBox>
    </Card>
  );
}

export default MarketIndices;


