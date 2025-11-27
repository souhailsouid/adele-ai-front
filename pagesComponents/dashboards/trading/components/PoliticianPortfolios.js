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
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

function PoliticianPortfolios({ data = [], loading = false, politicianId = "" }) {
  const formatNumber = (num) => {
    if (!num || num === 0) return "-";
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

  const getOwnerLabel = (owner) => {
    if (!owner) return "N/A";
    const ownerMap = {
      self: "Soi-même",
      spouse: "Conjoint(e)",
      joint: "Joint",
      child: "Enfant",
      undisclosed: "Non divulgué",
    };
    return ownerMap[owner.toLowerCase()] || owner;
  };

  const getOwnerColor = (owner) => {
    if (!owner) return "default";
    const ownerMap = {
      self: "primary",
      spouse: "secondary",
      joint: "info",
      child: "warning",
      undisclosed: "default",
    };
    return ownerMap[owner.toLowerCase()] || "default";
  };

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Politician Portfolios
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
            Politician Portfolios ({data.length})
          </MDTypography>
          <Tooltip title="Tous les portfolios et holdings d'un politicien">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucun portfolio disponible. Veuillez sélectionner un politicien.
          </MDTypography>
        ) : (
          <MDBox>
            {data.map((portfolio, index) => {
              const stockHoldings = portfolio.stock_holdings || [];
              const optionHoldings = portfolio.option_holdings || [];
              const cryptoHoldings = portfolio.crypto_holdings || [];

              return (
                <Accordion key={index} defaultExpanded={index === 0}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <MDBox display="flex" alignItems="center" gap={2} width="100%">
                      <Chip
                        label={getOwnerLabel(portfolio.owner)}
                        color={getOwnerColor(portfolio.owner)}
                        size="small"
                      />
                      <MDTypography variant="body2" fontWeight="medium">
                        Portfolio ID: {portfolio.id || "N/A"}
                      </MDTypography>
                      {portfolio.last_annual_disclosure && (
                        <MDTypography variant="caption" color="text.secondary">
                          Dernière déclaration: {portfolio.last_annual_disclosure}
                        </MDTypography>
                      )}
                      <MDBox ml="auto" display="flex" gap={1}>
                        {stockHoldings.length > 0 && (
                          <Chip label={`${stockHoldings.length} Stocks`} size="small" color="primary" />
                        )}
                        {optionHoldings.length > 0 && (
                          <Chip label={`${optionHoldings.length} Options`} size="small" color="info" />
                        )}
                        {cryptoHoldings.length > 0 && (
                          <Chip label={`${cryptoHoldings.length} Crypto`} size="small" color="warning" />
                        )}
                      </MDBox>
                    </MDBox>
                  </AccordionSummary>
                  <AccordionDetails>
                    {/* Stock Holdings */}
                    {stockHoldings.length > 0 && (
                      <MDBox mb={3}>
                        <MDTypography variant="h6" mb={2}>
                          Stock Holdings ({stockHoldings.length})
                        </MDTypography>
                        <TableContainer>
                          <Table size="small">
                            <MDBox component="thead">
                              <TableRow>
                                <DataTableHeadCell width="20%" align="left">Ticker</DataTableHeadCell>
                                <DataTableHeadCell width="20%" align="left">Type</DataTableHeadCell>
                                <DataTableHeadCell width="20%" align="right">Min Amount</DataTableHeadCell>
                                <DataTableHeadCell width="20%" align="right">Mid Amount</DataTableHeadCell>
                                <DataTableHeadCell width="20%" align="right">Max Amount</DataTableHeadCell>
                              </TableRow>
                            </MDBox>
                            <TableBody>
                              {stockHoldings.map((holding, idx) => {
                                const minAmount = parseNumber(holding.min_amount);
                                const midAmount = parseNumber(holding.mid_amount);
                                const maxAmount = parseNumber(holding.max_amount);

                                return (
                                  <TableRow key={idx} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                                    <DataTableBodyCell align="left">
                                      <MDTypography variant="button" fontWeight="bold" color="primary">
                                        {holding.ticker || "N/A"}
                                      </MDTypography>
                                    </DataTableBodyCell>
                                    <DataTableBodyCell align="left">
                                      <Chip label={holding.type || "stock"} size="small" />
                                    </DataTableBodyCell>
                                    <DataTableBodyCell align="right">
                                      <MDTypography variant="body2" color="error.main">
                                        {formatNumber(minAmount)}
                                      </MDTypography>
                                    </DataTableBodyCell>
                                    <DataTableBodyCell align="right">
                                      <MDTypography variant="body2" fontWeight="medium" color="primary">
                                        {formatNumber(midAmount)}
                                      </MDTypography>
                                    </DataTableBodyCell>
                                    <DataTableBodyCell align="right">
                                      <MDTypography variant="body2" color="success.main">
                                        {formatNumber(maxAmount)}
                                      </MDTypography>
                                    </DataTableBodyCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </MDBox>
                    )}

                    {/* Option Holdings */}
                    {optionHoldings.length > 0 && (
                      <MDBox mb={3}>
                        <MDTypography variant="h6" mb={2}>
                          Option Holdings ({optionHoldings.length})
                        </MDTypography>
                        <TableContainer>
                          <Table size="small">
                            <MDBox component="thead">
                              <TableRow>
                                <DataTableHeadCell width="25%" align="left">Ticker</DataTableHeadCell>
                                <DataTableHeadCell width="25%" align="right">Min Amount</DataTableHeadCell>
                                <DataTableHeadCell width="25%" align="right">Mid Amount</DataTableHeadCell>
                                <DataTableHeadCell width="25%" align="right">Max Amount</DataTableHeadCell>
                              </TableRow>
                            </MDBox>
                            <TableBody>
                              {optionHoldings.map((holding, idx) => {
                                const minAmount = parseNumber(holding.min_amount);
                                const midAmount = parseNumber(holding.mid_amount);
                                const maxAmount = parseNumber(holding.max_amount);

                                return (
                                  <TableRow key={idx} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                                    <DataTableBodyCell align="left">
                                      <MDTypography variant="button" fontWeight="bold" color="info">
                                        {holding.ticker || "N/A"}
                                      </MDTypography>
                                    </DataTableBodyCell>
                                    <DataTableBodyCell align="right">
                                      <MDTypography variant="body2" color="error.main">
                                        {formatNumber(minAmount)}
                                      </MDTypography>
                                    </DataTableBodyCell>
                                    <DataTableBodyCell align="right">
                                      <MDTypography variant="body2" fontWeight="medium" color="primary">
                                        {formatNumber(midAmount)}
                                      </MDTypography>
                                    </DataTableBodyCell>
                                    <DataTableBodyCell align="right">
                                      <MDTypography variant="body2" color="success.main">
                                        {formatNumber(maxAmount)}
                                      </MDTypography>
                                    </DataTableBodyCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </MDBox>
                    )}

                    {/* Crypto Holdings */}
                    {cryptoHoldings.length > 0 && (
                      <MDBox>
                        <MDTypography variant="h6" mb={2}>
                          Crypto Holdings ({cryptoHoldings.length})
                        </MDTypography>
                        <TableContainer>
                          <Table size="small">
                            <MDBox component="thead">
                              <TableRow>
                                <DataTableHeadCell width="25%" align="left">Symbol</DataTableHeadCell>
                                <DataTableHeadCell width="25%" align="right">Min Amount</DataTableHeadCell>
                                <DataTableHeadCell width="25%" align="right">Mid Amount</DataTableHeadCell>
                                <DataTableHeadCell width="25%" align="right">Max Amount</DataTableHeadCell>
                              </TableRow>
                            </MDBox>
                            <TableBody>
                              {cryptoHoldings.map((holding, idx) => {
                                const minAmount = parseNumber(holding.min_amount);
                                const midAmount = parseNumber(holding.mid_amount);
                                const maxAmount = parseNumber(holding.max_amount);

                                return (
                                  <TableRow key={idx} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                                    <DataTableBodyCell align="left">
                                      <MDTypography variant="button" fontWeight="bold" color="warning">
                                        {holding.symbol || holding.ticker || "N/A"}
                                      </MDTypography>
                                    </DataTableBodyCell>
                                    <DataTableBodyCell align="right">
                                      <MDTypography variant="body2" color="error.main">
                                        {formatNumber(minAmount)}
                                      </MDTypography>
                                    </DataTableBodyCell>
                                    <DataTableBodyCell align="right">
                                      <MDTypography variant="body2" fontWeight="medium" color="primary">
                                        {formatNumber(midAmount)}
                                      </MDTypography>
                                    </DataTableBodyCell>
                                    <DataTableBodyCell align="right">
                                      <MDTypography variant="body2" color="success.main">
                                        {formatNumber(maxAmount)}
                                      </MDTypography>
                                    </DataTableBodyCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </MDBox>
                    )}

                    {stockHoldings.length === 0 && optionHoldings.length === 0 && cryptoHoldings.length === 0 && (
                      <MDTypography variant="body2" color="text.secondary">
                        Aucun holding dans ce portfolio
                      </MDTypography>
                    )}
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </MDBox>
        )}
      </MDBox>
    </Card>
  );
}

export default PoliticianPortfolios;


