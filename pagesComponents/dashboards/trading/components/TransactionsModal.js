/**
 * Modal réutilisable pour afficher les transactions/holdings
 */

import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import Icon from "@mui/material/Icon";
import LinearProgress from "@mui/material/LinearProgress";
import DataTable from "/examples/Tables/DataTable";
import Chip from "@mui/material/Chip";
import { formatCurrency, formatVolume, formatDate } from "/utils/formatting";

function TransactionsModal({
  open,
  onClose,
  title,
  loading = false,
  transactions = [],
  holdings = [],
  activity = [],
  columns,
  emptyMessage = "Aucune donnée disponible",
}) {
  const hasData = (transactions && transactions.length > 0) || 
                  (holdings && holdings.length > 0) || 
                  (activity && activity.length > 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
    >
      <DialogTitle>
        <MDBox display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h6" fontWeight="medium">
            {title}
          </MDTypography>
          <MDButton
            iconOnly
            variant="text"
            color="dark"
            onClick={onClose}
            sx={{ minWidth: "auto", p: 1 }}
          >
            <Icon>close</Icon>
          </MDButton>
        </MDBox>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <MDBox p={3} display="flex" justifyContent="center">
            <LinearProgress color="info" sx={{ width: "100%" }} />
          </MDBox>
        ) : hasData ? (
          <MDBox>
            {/* Holdings */}
            {holdings && holdings.length > 0 && (
              <MDBox mb={4}>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Holdings ({holdings.length})
                </MDTypography>
                <DataTable
                  table={{
                    columns: columns?.holdings || getDefaultHoldingsColumns(),
                    rows: holdings,
                  }}
                  canSearch={true}
                  entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
                  showTotalEntries={true}
                  pagination={{ variant: "gradient", color: "dark" }}
                  isSorted={true}
                  noEndBorder={false}
                />
              </MDBox>
            )}

            {/* Activity */}
            {activity && activity.length > 0 && (
              <MDBox mb={4}>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Activité Récente ({activity.length})
                </MDTypography>
                <DataTable
                  table={{
                    columns: columns?.activity || getDefaultActivityColumns(),
                    rows: activity,
                  }}
                  canSearch={true}
                  entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
                  showTotalEntries={true}
                  pagination={{ variant: "gradient", color: "dark" }}
                  isSorted={true}
                  noEndBorder={false}
                />
              </MDBox>
            )}

            {/* Transactions */}
            {transactions && transactions.length > 0 && (
              <MDBox>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Transactions ({transactions.length})
                </MDTypography>
                <DataTable
                  table={{
                    columns: columns?.transactions || getDefaultTransactionsColumns(),
                    rows: transactions,
                  }}
                  canSearch={true}
                  entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
                  showTotalEntries={true}
                  pagination={{ variant: "gradient", color: "dark" }}
                  isSorted={true}
                  noEndBorder={false}
                />
              </MDBox>
            )}
          </MDBox>
        ) : (
          <MDBox p={3} textAlign="center">
            <MDTypography variant="body2" color="text">
              {emptyMessage}
            </MDTypography>
          </MDBox>
        )}
      </DialogContent>
      <DialogActions>
        <MDButton onClick={onClose} color="dark">
          Fermer
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

// Colonnes par défaut pour Holdings
function getDefaultHoldingsColumns() {
  return [
    {
      Header: "Ticker",
      accessor: "ticker",
      width: "8%",
      Cell: ({ value }) => (
        <MDTypography variant="body2" fontWeight="medium" color="text">
          {value || "N/A"}
        </MDTypography>
      ),
    },
    {
      Header: "Type",
      accessor: "security_type",
      width: "8%",
      Cell: ({ value, row }) => {
        const securityType = value || "Share";
        const putCall = row.original.put_call;
        let label = securityType;
        let color = "default";
        
        if (securityType === "Option") {
          label = putCall === "call" ? "CALL" : putCall === "put" ? "PUT" : "Option";
          color = putCall === "call" ? "success" : "error";
        } else if (securityType === "Fund") {
          color = "info";
        } else if (securityType === "Share") {
          color = "primary";
        }
        
        return (
          <Chip
            label={label}
            size="small"
            color={color}
            variant="outlined"
          />
        );
      },
    },
    {
      Header: "Nom / Secteur",
      accessor: "full_name",
      width: "25%",
      Cell: ({ value, row }) => (
        <MDBox>
          <MDTypography variant="body2" fontWeight="medium" color="text">
            {value || row.original.name || "N/A"}
          </MDTypography>
          {row.original.sector && (
            <MDTypography variant="caption" color="text.secondary">
              {row.original.sector}
            </MDTypography>
          )}
        </MDBox>
      ),
    },
    {
      Header: "Units",
      accessor: "units",
      width: "10%",
      Cell: ({ value }) => formatVolume(value || 0),
    },
    {
      Header: "Changement",
      accessor: "units_change",
      width: "10%",
      Cell: ({ value }) => {
        const change = parseFloat(value) || 0;
        const color = change > 0 ? "success" : change < 0 ? "error" : "text";
        return (
          <MDTypography variant="body2" fontWeight="medium" color={color}>
            {change > 0 ? "+" : ""}{formatVolume(Math.abs(change))}
          </MDTypography>
        );
      },
    },
    {
      Header: "Prix",
      accessor: "close",
      width: "8%",
      Cell: ({ value, row }) => {
        const price = value || row.original.avg_price || "N/A";
        return (
          <MDTypography variant="body2" color="text">
            {typeof price === "number" ? formatCurrency(price) : price}
          </MDTypography>
        );
      },
    },
    {
      Header: "Valeur",
      accessor: "value",
      width: "12%",
      Cell: ({ value }) => (
        <MDTypography variant="body2" fontWeight="bold" color="info">
          {value ? formatCurrency(value) : "N/A"}
        </MDTypography>
      ),
    },
    {
      Header: "% Portfolio",
      accessor: "perc_of_share_value",
      width: "8%",
      Cell: ({ value }) => {
        if (!value) return "N/A";
        const perc = parseFloat(value) * 100;
        return (
          <MDTypography variant="body2" color="text">
            {perc.toFixed(2)}%
          </MDTypography>
        );
      },
    },
    {
      Header: "Date",
      accessor: "date",
      width: "8%",
      Cell: ({ value }) => formatDate(value, "fr-FR", false),
    },
  ];
}

// Colonnes par défaut pour Activity
function getDefaultActivityColumns() {
  return [
    {
      Header: "Ticker",
      accessor: "ticker",
      width: "8%",
    },
    {
      Header: "Type",
      accessor: "security_type",
      width: "10%",
      Cell: ({ value, row }) => {
        const securityType = value || "Share";
        const putCall = row.original.put_call;
        let label = securityType;
        let color = "default";
        
        if (securityType === "Option") {
          label = putCall === "call" ? "CALL" : putCall === "put" ? "PUT" : "Option";
          color = putCall === "call" ? "success" : "error";
        } else if (securityType === "Fund") {
          color = "info";
        } else if (securityType === "Share") {
          color = "primary";
        }
        
        return (
          <Chip
            label={label}
            size="small"
            color={color}
            variant="outlined"
          />
        );
      },
    },
    {
      Header: "Changement",
      accessor: "units_change",
      width: "12%",
      Cell: ({ value }) => {
        const change = parseFloat(value) || 0;
        const color = change > 0 ? "success" : change < 0 ? "error" : "text";
        return (
          <MDTypography variant="body2" fontWeight="medium" color={color}>
            {change > 0 ? "+" : ""}{formatVolume(Math.abs(change))}
          </MDTypography>
        );
      },
    },
    {
      Header: "Prix Actuel",
      accessor: "close",
      width: "10%",
      Cell: ({ value }) => (
        <MDTypography variant="body2" fontWeight="medium" color="text">
          {value ? formatCurrency(value) : "N/A"}
        </MDTypography>
      ),
    },
    {
      Header: "Prix Filing",
      accessor: "price_on_filing",
      width: "10%",
      Cell: ({ value }) => formatCurrency(value),
    },
    {
      Header: "Report Date",
      accessor: "report_date",
      width: "12%",
      Cell: ({ value }) => formatDate(value, "fr-FR", false),
    },
    {
      Header: "Filing Date",
      accessor: "filing_date",
      width: "12%",
      Cell: ({ value }) => formatDate(value, "fr-FR", false),
    },
  ];
}

// Colonnes par défaut pour Transactions
function getDefaultTransactionsColumns() {
  return [
    {
      Header: "Ticker",
      accessor: "ticker",
      width: "8%",
    },
    {
      Header: "Type",
      accessor: "transaction_type",
      width: "10%",
      Cell: ({ row }) => {
        const change = parseFloat(row.original.units_change) || 0;
        const isBuy = change > 0;
        const isSell = change < 0;
        return (
          <Chip
            label={isBuy ? "Achat" : isSell ? "Vente" : "N/A"}
            size="small"
            color={isBuy ? "success" : isSell ? "error" : "default"}
          />
        );
      },
    },
    {
      Header: "Changement",
      accessor: "units_change",
      width: "12%",
      Cell: ({ value }) => {
        const change = parseFloat(value) || 0;
        const color = change > 0 ? "success" : change < 0 ? "error" : "text";
        return (
          <MDTypography variant="body2" fontWeight="medium" color={color}>
            {change > 0 ? "+" : ""}{formatVolume(Math.abs(change))}
          </MDTypography>
        );
      },
    },
    {
      Header: "Prix Vente",
      accessor: "sell_price",
      width: "10%",
      Cell: ({ value }) => (
        <MDTypography variant="body2" color="error">
          {value ? formatCurrency(value) : "-"}
        </MDTypography>
      ),
    },
    {
      Header: "Prix Achat",
      accessor: "buy_price",
      width: "10%",
      Cell: ({ value }) => (
        <MDTypography variant="body2" color="success">
          {value ? formatCurrency(value) : "-"}
        </MDTypography>
      ),
    },
    {
      Header: "Prix Actuel",
      accessor: "close",
      width: "10%",
      Cell: ({ value }) => (
        <MDTypography variant="body2" fontWeight="medium" color="text">
          {value ? formatCurrency(value) : "N/A"}
        </MDTypography>
      ),
    },
    {
      Header: "Prix Report",
      accessor: "price_on_report",
      width: "10%",
      Cell: ({ value, row }) => {
        const priceReport = parseFloat(value) || 0;
        const priceFiling = parseFloat(row.original.price_on_filing) || 0;
        const close = parseFloat(row.original.close) || 0;
        return (
          <MDBox>
            <MDTypography variant="body2" fontWeight="medium">
              {formatCurrency(priceReport)}
            </MDTypography>
            {priceFiling > 0 && priceFiling !== priceReport && (
              <MDTypography variant="caption" color="text.secondary" display="block">
                Filing: {formatCurrency(priceFiling)}
              </MDTypography>
            )}
            {close > 0 && close !== priceReport && (
              <MDTypography variant="caption" color={close > priceReport ? "success" : "error"} display="block">
                Actuel: {formatCurrency(close)}
              </MDTypography>
            )}
          </MDBox>
        );
      },
    },
    {
      Header: "Prix Moyen",
      accessor: "avg_price",
      width: "10%",
      Cell: ({ value, row }) => {
        const avgPrice = parseFloat(value) || 0;
        const close = parseFloat(row.original.close) || 0;
        const profit = close > 0 && avgPrice > 0 ? ((close - avgPrice) / avgPrice) * 100 : 0;
        return (
          <MDBox>
            <MDTypography variant="body2" fontWeight="medium">
              {formatCurrency(avgPrice)}
            </MDTypography>
            {profit !== 0 && (
              <MDTypography 
                variant="caption" 
                color={profit > 0 ? "success" : "error"} 
                display="block"
              >
                {profit > 0 ? "+" : ""}{profit.toFixed(1)}%
              </MDTypography>
            )}
          </MDBox>
        );
      },
    },
    {
      Header: "Dates",
      width: "15%",
      Cell: ({ row }) => {
        const reportDate = row.original.report_date;
        const filingDate = row.original.filing_date;
        return (
          <MDBox>
            <MDBox mb={0.5}>
              <MDTypography variant="caption" color="text.secondary" display="block">
                Report:
              </MDTypography>
              <MDTypography variant="body2" fontWeight="medium">
                {formatDate(reportDate, "fr-FR", false)}
              </MDTypography>
            </MDBox>
            {filingDate && (
              <MDBox>
                <MDTypography variant="caption" color="text.secondary" display="block">
                  Filing:
                </MDTypography>
                <MDTypography variant="body2" color="text.secondary">
                  {formatDate(filingDate, "fr-FR", false)}
                </MDTypography>
              </MDBox>
            )}
          </MDBox>
        );
      },
    },
  ];
}

export default TransactionsModal;

