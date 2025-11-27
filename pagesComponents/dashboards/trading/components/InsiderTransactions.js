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
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";
import { formatDateTime } from "./utils";

function InsiderTransactions({ data = [], loading = false }) {
  const formatNumber = (num) => {
    if (!num || num === 0) return "-";
    if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const parseNumber = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const getTransactionColor = (transactionCode, amount) => {
    // Utiliser amount si disponible (négatif = vente, positif = achat)
    if (amount !== undefined && amount !== null) {
      return amount > 0 ? "success" : amount < 0 ? "error" : "default";
    }
    // Sinon utiliser transaction_code
    if (!transactionCode) return "default";
    if (transactionCode === "P" || transactionCode === "Purchase") return "success";
    if (transactionCode === "S" || transactionCode === "Sale") return "error";
    return "default";
  };

  const getTransactionLabel = (transactionCode, amount) => {
    // Utiliser amount si disponible
    if (amount !== undefined && amount !== null) {
      return amount > 0 ? "ACHAT" : amount < 0 ? "VENTE" : "N/A";
    }
    // Sinon utiliser transaction_code
    if (!transactionCode) return "N/A";
    if (transactionCode === "P" || transactionCode === "Purchase") return "ACHAT";
    if (transactionCode === "S" || transactionCode === "Sale") return "VENTE";
    return transactionCode;
  };

  const getTransactionIcon = (transactionCode, amount) => {
    // Utiliser amount si disponible
    if (amount !== undefined && amount !== null) {
      if (amount > 0) return <TrendingUpIcon fontSize="small" />;
      if (amount < 0) return <TrendingDownIcon fontSize="small" />;
      return null;
    }
    // Sinon utiliser transaction_code
    if (transactionCode === "P" || transactionCode === "Purchase") {
      return <TrendingUpIcon fontSize="small" />;
    }
    if (transactionCode === "S" || transactionCode === "Sale") {
      return <TrendingDownIcon fontSize="small" />;
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Transactions d&apos;Insiders
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
            Transactions d&apos;Insiders ({data.length})
          </MDTypography>
          <Tooltip title="Transactions d'achat et de vente effectuées par les insiders (dirigeants, employés clés)">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucune transaction d&apos;insider disponible
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="12%" align="left">
                    Date
                  </DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="left">
                    Symbole
                  </DataTableHeadCell>
                  <DataTableHeadCell width="20%" align="left">
                    Insider
                  </DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="center">
                    Type
                  </DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">
                    Montant
                  </DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">
                    Prix
                  </DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">
                    Valeur
                  </DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="center">
                    Rôle
                  </DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.slice(0, 20).map((transaction, index) => {
                  const dateTime = formatDateTime(transaction.transaction_date || transaction.filing_date);
                  const transactionCode = transaction.transaction_code;
                  const amount = parseNumber(transaction.amount || 0);
                  const price = parseNumber(transaction.price || transaction.stock_price || 0);
                  const value = Math.abs(amount * price);
                  const shares = Math.abs(amount);

                  // Déterminer le rôle
                  const roles = [];
                  if (transaction.is_director) roles.push("Directeur");
                  if (transaction.is_officer) roles.push("Officier");
                  if (transaction.is_ten_percent_owner) roles.push("10% Owner");
                  const roleLabel = roles.length > 0 ? roles.join(", ") : "N/A";

                  return (
                    <TableRow
                      key={transaction.id || index}
                      sx={{
                        "&:hover": { backgroundColor: "action.hover" },
                      }}
                    >
                      <DataTableBodyCell align="left">
                        <MDBox>
                          <MDTypography variant="caption" color="text.secondary" display="block">
                            {dateTime.date}
                          </MDTypography>
                          {transaction.formtype && (
                            <MDTypography variant="caption" color="text.secondary">
                              Form {transaction.formtype}
                            </MDTypography>
                          )}
                        </MDBox>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDBox>
                          <MDTypography variant="button" fontWeight="bold" color="primary">
                            {transaction.ticker || "N/A"}
                          </MDTypography>
                          {transaction.sector && (
                            <MDTypography variant="caption" color="text.secondary" display="block">
                              {transaction.sector}
                            </MDTypography>
                          )}
                        </MDBox>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDBox>
                          <MDTypography variant="body2" noWrap>
                            {transaction.owner_name || "N/A"}
                          </MDTypography>
                          {transaction.officer_title && (
                            <MDTypography variant="caption" color="text.secondary" display="block">
                              {transaction.officer_title}
                            </MDTypography>
                          )}
                        </MDBox>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        <MDBox display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                          {getTransactionIcon(transactionCode, amount)}
                          <Chip
                            label={getTransactionLabel(transactionCode, amount)}
                            color={getTransactionColor(transactionCode, amount)}
                            size="small"
                          />
                        </MDBox>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography 
                          variant="body2" 
                          fontWeight="medium"
                          color={amount > 0 ? "success.main" : amount < 0 ? "error.main" : "text"}
                        >
                          {amount > 0 ? "+" : ""}{formatNumber(shares)}
                        </MDTypography>
                        {transaction.transactions && transaction.transactions > 1 && (
                          <MDTypography variant="caption" color="text.secondary" display="block">
                            ({transaction.transactions} trades)
                          </MDTypography>
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" color="text.secondary">
                          ${price.toFixed(2)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="right">
                        <MDTypography variant="body2" fontWeight="bold" color="primary">
                          {formatNumber(value)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        <MDTypography variant="caption" color="text.secondary" noWrap>
                          {roleLabel}
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

export default InsiderTransactions;

