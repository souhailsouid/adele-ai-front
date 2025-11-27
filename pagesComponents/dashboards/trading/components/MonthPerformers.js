import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

function MonthPerformers({ data = [], loading = false, month = 1 }) {
  const formatNumber = (num) => {
    if (!num || num === 0) return "-";
    if (num >= 1_000_000_000_000) return `${(num / 1_000_000_000_000).toFixed(2)}T`;
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
    return num.toString();
  };

  const parseNumber = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const formatPercentage = (value) => {
    const num = parseNumber(value);
    return `${(num * 100).toFixed(2)}%`;
  };

  const getPercentageColor = (value) => {
    const num = parseNumber(value);
    if (num > 0) return "success";
    if (num < 0) return "error";
    return "text";
  };

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Month Performers
          </MDTypography>
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
            Meilleurs Performeurs - {monthNames[month - 1]} ({data.length})
          </MDTypography>
          <Tooltip title="Tickers avec les meilleures performances pour ce mois sur plusieurs années">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucun performeur disponible. Utilisez les filtres pour rechercher.
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="10%" align="left">Ticker</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="left">Sector</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Market Cap</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Avg Change %</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Median Change %</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Max Change %</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Min Change %</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Positive Months %</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">Positive Closes</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="right">Years</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.map((performer, index) => {
                  const avgChange = parseNumber(performer.avg_change);
                  const medianChange = parseNumber(performer.median_change);
                  const maxChange = parseNumber(performer.max_change);
                  const minChange = parseNumber(performer.min_change);
                  const positiveMonthsPerc = parseNumber(performer.positive_months_perc);
                  const marketcap = parseNumber(performer.marketcap);

                  return (
                    <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="button" fontWeight="bold" color="primary">
                          {performer.ticker || "N/A"}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        {performer.sector ? (
                          <Chip label={performer.sector} size="small" color="info" />
                        ) : (
                          <MDTypography variant="caption" color="text.secondary">
                            N/A
                          </MDTypography>
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary">
                          {formatNumber(marketcap)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography 
                          variant="body2" 
                          fontWeight="medium"
                          color={getPercentageColor(avgChange)}
                        >
                          {formatPercentage(avgChange)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography 
                          variant="body2" 
                          color={getPercentageColor(medianChange)}
                        >
                          {formatPercentage(medianChange)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="success.main">
                          {formatPercentage(maxChange)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="error.main">
                          {formatPercentage(minChange)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="medium" color="primary">
                          {formatPercentage(positiveMonthsPerc)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary">
                          {performer.positive_closes || 0}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary">
                          {performer.years || 0}
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

export default MonthPerformers;


