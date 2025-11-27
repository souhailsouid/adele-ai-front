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

function CongressTrades({ data = [], loading = false, title = "Congress Trades" }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", { 
        year: "numeric", 
        month: "short", 
        day: "numeric",
        weekday: "short"
      });
    } catch {
      return dateString;
    }
  };

  const getTransactionColor = (txnType) => {
    if (!txnType) return "default";
    const type = txnType.toLowerCase();
    if (type.includes("buy") || type.includes("purchase") || type.includes("receive")) return "success";
    if (type.includes("sell") || type.includes("sale")) return "error";
    return "default";
  };

  const getTransactionLabel = (txnType) => {
    if (!txnType) return "N/A";
    const type = txnType.toLowerCase();
    if (type.includes("buy") || type.includes("purchase")) return "ACHAT";
    if (type.includes("sell") || type.includes("sale")) {
      if (type.includes("partial")) return "VENTE (PARTIEL)";
      if (type.includes("full")) return "VENTE (TOTAL)";
      return "VENTE";
    }
    if (type.includes("receive")) return "RECU";
    if (type.includes("exchange")) return "ECHANGE";
    return txnType.toUpperCase();
  };

  const getIssuerLabel = (issuer) => {
    if (!issuer) return "N/A";
    const iss = issuer.toLowerCase();
    if (iss === "spouse") return "Conjoint(e)";
    if (iss === "joint") return "Joint";
    if (iss === "not-disclosed") return "Non divulgué";
    return issuer;
  };

  const getMemberTypeLabel = (memberType) => {
    if (!memberType) return "N/A";
    return memberType === "house" ? "Chambre" : memberType === "senate" ? "Sénat" : memberType;
  };

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            {title}
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
            {title} ({data.length})
          </MDTypography>
          <Tooltip title="Transactions des membres du Congrès américain. Les membres du Congrès doivent déclarer leurs transactions boursières.">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucune transaction du Congrès disponible
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="12%" align="left">Date Transaction</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="left">Date Filing</DataTableHeadCell>
                  <DataTableHeadCell width="18%" align="left">Membre</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="left">Symbole</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="center">Type</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="left">Montant</DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="left">Exécuté par</DataTableHeadCell>
                  <DataTableHeadCell width="8%" align="center">Chambre</DataTableHeadCell>
                  <DataTableHeadCell width="6%" align="center">Actif</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.slice(0, 100).map((trade, index) => {
                  const txnType = trade.txn_type || trade.transaction_type || "N/A";
                  const isBuy = txnType.toLowerCase().includes("buy") || txnType.toLowerCase().includes("purchase") || txnType.toLowerCase().includes("receive");

                  return (
                    <TableRow key={index} sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="body2">{formatDate(trade.transaction_date)}</MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="caption" color="text.secondary">{formatDate(trade.filed_at_date)}</MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="body2" fontWeight="medium">{trade.name || "N/A"}</MDTypography>
                        {trade.reporter && trade.reporter !== trade.name && (
                          <MDTypography variant="caption" color="text.secondary" display="block">
                            Reporter: {trade.reporter}
                          </MDTypography>
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="button" fontWeight="bold" color="primary">{trade.ticker || "N/A"}</MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        <Chip
                          label={getTransactionLabel(txnType)}
                          color={getTransactionColor(txnType)}
                          size="small"
                        />
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography 
                          variant="body2" 
                          fontWeight="medium"
                          color={isBuy ? "success.main" : "error.main"}
                        >
                          {trade.amounts || "N/A"}
                        </MDTypography>
                        {trade.notes && (
                          <Tooltip title={trade.notes}>
                            <MDTypography variant="caption" color="text.secondary" display="block" noWrap sx={{ maxWidth: 150 }}>
                              {trade.notes.substring(0, 40)}...
                            </MDTypography>
                          </Tooltip>
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="caption" color="text.secondary">
                          {getIssuerLabel(trade.issuer)}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        <Chip
                          label={getMemberTypeLabel(trade.member_type)}
                          size="small"
                          color={trade.member_type === "house" ? "primary" : "info"}
                          sx={{ height: 20, fontSize: "0.7rem" }}
                        />
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        {trade.is_active !== undefined && (
                          <Chip
                            label={trade.is_active ? "Oui" : "Non"}
                            size="small"
                            color={trade.is_active ? "success" : "default"}
                            sx={{ height: 20, fontSize: "0.7rem" }}
                          />
                        )}
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

export default CongressTrades;

