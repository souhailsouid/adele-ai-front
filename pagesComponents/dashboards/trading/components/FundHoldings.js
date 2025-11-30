import { useMemo, useState, useEffect, useRef } from "react";
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
import DownloadIcon from "@mui/icons-material/Download";
import MDButton from "/components/MDButton";
import PieChart from "/examples/Charts/PieChart";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";
import HoldingsFilters from "./HoldingsFilters";

function FundHoldings({ data = [], loading = false, fundName = "" }) {
  const [filteredData, setFilteredData] = useState(data);
  const previousDataRef = useRef(data);
  const formatNumber = (num) => {
    if (!num || num === 0) return "-";
    const numValue = typeof num === "string" ? parseFloat(num) : num;
    if (isNaN(numValue)) return "-";
    // market_value est en centimes, diviser par 100 pour dollars
    const dollars = numValue / 100;
    if (dollars >= 1_000_000_000) return `$${(dollars / 1_000_000_000).toFixed(2)}B`;
    if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2)}M`;
    if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(2)}K`;
    return `$${dollars.toFixed(2)}`;
  };

  const parseNumber = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      STOCK: "success",
      CALL: "info",
      PUT: "error",
    };
    return colors[type] || "default";
  };

  // Calculer le total pour les pourcentages (doit être avant les return conditionnels)
  const totalValue = useMemo(() => {
    return data.reduce((sum, item) => sum + parseNumber(item.market_value), 0);
  }, [data]);

  // Préparer les données pour le pie chart (top 10) basé sur filteredData (doit être avant les return conditionnels)
  const pieChartData = useMemo(() => {
    // Regrouper les holdings par ticker (ou CUSIP si ticker n'est pas disponible)
    const grouped = {};
    
    filteredData.forEach((holding) => {
      const key = holding.ticker || holding.cusip || "N/A";
      if (!grouped[key]) {
        grouped[key] = {
          ticker: holding.ticker || "-",
          cusip: holding.cusip || "-",
          market_value: 0,
        };
      }
      // Agréger la valeur de marché
      grouped[key].market_value += parseNumber(holding.market_value);
    });

    // Convertir en tableau, trier par market_value décroissant, et prendre le top 10
    const sorted = Object.values(grouped)
      .sort((a, b) => b.market_value - a.market_value)
      .slice(0, 10);

    const colors = ["info", "primary", "dark", "secondary", "success", "warning", "error", "light"];

    return {
      labels: sorted.map((h) => h.ticker !== "-" ? h.ticker : (h.cusip !== "-" ? h.cusip : "N/A")),
      datasets: {
        label: "Market Value",
        backgroundColors: colors.slice(0, sorted.length),
        data: sorted.map((h) => h.market_value / 100), // Convertir en dollars
      },
    };
  }, [filteredData]);

  // Mettre à jour filteredData quand data change (seulement si c'est vraiment un nouveau jeu de données)
  useEffect(() => {
    // Vérifier si data a vraiment changé (nouveau fund ou données complètement différentes)
    const dataChanged = 
      previousDataRef.current.length !== data.length ||
      (data.length > 0 && previousDataRef.current.length > 0 && 
       (previousDataRef.current[0]?.id !== data[0]?.id || 
        previousDataRef.current[0]?.ticker !== data[0]?.ticker));
    
    if (dataChanged) {
      previousDataRef.current = data;
      setFilteredData(data);
    }
  }, [data]);

  // Trier par market_value décroissant (doit être avant les return conditionnels)
  const sortedHoldings = useMemo(() => {
    return [...filteredData].sort((a, b) => parseNumber(b.market_value) - parseNumber(a.market_value));
  }, [filteredData]);

  // Export CSV
  const exportToCSV = () => {
    const headers = ["Ticker", "CUSIP", "Shares", "Market Value ($)", "% Portfolio", "Type", "Filing Date"];
    const rows = sortedHoldings.map((h) => {
      const marketValue = parseNumber(h.market_value);
      const percentage = totalValue > 0 ? (marketValue / totalValue) * 100 : 0;
      return [
        h.ticker || "",
        h.cusip || "",
        parseNumber(h.shares).toLocaleString(),
        (marketValue / 100).toFixed(2), // Convertir en dollars
        percentage.toFixed(2),
        h.type || "",
        h.filing_date || "",
      ];
    });

    const csv = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const dateStr = new Date().toISOString().split("T")[0];
    a.download = `${fundName.replace(/[^a-z0-9]/gi, "_")}_holdings_${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Holdings
          </MDTypography>
          <LinearProgress />
        </MDBox>
      </Card>
    );
  }

  return (
    <MDBox>
      <Card sx={{ mb: 3 }}>
        <MDBox p={3}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h6">
              Holdings: {fundName} ({data.length})
            </MDTypography>
            <MDBox display="flex" gap={1} alignItems="center">
              {data.length > 0 && (
                <MDButton
                  variant="outlined"
                  color="dark"
                  size="small"
                  onClick={exportToCSV}
                  startIcon={<DownloadIcon />}
                >
                  Export CSV
                </MDButton>
              )}
              <Tooltip title="Holdings du fund avec leur valeur de marché et pourcentage du portfolio">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </MDBox>
          </MDBox>
          {data.length === 0 ? (
            <MDTypography variant="body2" color="text">
              Aucun holding disponible
            </MDTypography>
          ) : (
            <>
              {/* Filtres */}
              <HoldingsFilters holdings={data} onFilter={setFilteredData} />

              {/* Pie Chart pour top 10 holdings */}
              {pieChartData.labels.length > 0 && (
                <MDBox mb={3}>
                  <PieChart
                    icon={{ color: "info", component: "pie_chart" }}
                    title="Top 10 Holdings"
                    description="Répartition par valeur de marché"
                    chart={pieChartData}
                  />
                </MDBox>
              )}

              <MDBox mb={2}>
                <MDTypography variant="body2" color="text">
                  Affichage de {sortedHoldings.length} holding{sortedHoldings.length > 1 ? "s" : ""} sur {data.length}
                </MDTypography>
              </MDBox>

              <TableContainer>
                <Table size="small">
                  <MDBox component="thead">
                    <TableRow>
                      <DataTableHeadCell width="15%" align="left">Ticker</DataTableHeadCell>
                      <DataTableHeadCell width="15%" align="left">CUSIP</DataTableHeadCell>
                      <DataTableHeadCell width="15%" align="right">Shares</DataTableHeadCell>
                      <DataTableHeadCell width="20%" align="right">Market Value</DataTableHeadCell>
                      <DataTableHeadCell width="15%" align="right">% Portfolio</DataTableHeadCell>
                      <DataTableHeadCell width="10%" align="center">Type</DataTableHeadCell>
                      <DataTableHeadCell width="10%" align="left">Filing Date</DataTableHeadCell>
                    </TableRow>
                  </MDBox>
                  <TableBody>
                    {sortedHoldings.map((holding) => {
                      const marketValue = parseNumber(holding.market_value);
                      const percentage = totalValue > 0 ? (marketValue / totalValue) * 100 : 0;

                      return (
                        <TableRow
                          key={holding.id}
                          sx={{ "&:hover": { backgroundColor: "action.hover" } }}
                        >
                          <DataTableBodyCell align="left">
                            <MDTypography variant="body2" fontWeight="medium" color="primary">
                              {holding.ticker || "-"}
                            </MDTypography>
                          </DataTableBodyCell>
                          <DataTableBodyCell align="left">
                            <MDTypography variant="caption" color="text.secondary">
                              {holding.cusip || "-"}
                            </MDTypography>
                          </DataTableBodyCell>
                          <DataTableBodyCell align="right">
                            <MDTypography variant="body2">
                              {parseNumber(holding.shares).toLocaleString()}
                            </MDTypography>
                          </DataTableBodyCell>
                          <DataTableBodyCell align="right">
                            <MDTypography variant="body2" fontWeight="bold">
                              {formatNumber(marketValue)}
                            </MDTypography>
                          </DataTableBodyCell>
                          <DataTableBodyCell align="right">
                            <MDTypography variant="body2" fontWeight="medium">
                              {percentage.toFixed(2)}%
                            </MDTypography>
                          </DataTableBodyCell>
                          <DataTableBodyCell align="center">
                            <Chip
                              label={holding.type || "N/A"}
                              color={getTypeColor(holding.type)}
                              size="small"
                            />
                          </DataTableBodyCell>
                          <DataTableBodyCell align="left">
                            <MDTypography variant="caption" color="text.secondary">
                              {formatDate(holding.fund_filings.filing_date)}
                            </MDTypography>
                          </DataTableBodyCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </MDBox>
      </Card>
    </MDBox>
  );
}

export default FundHoldings;

