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
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import InfoIcon from "@mui/icons-material/Info";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";
function EarningsOpportunities({ data = [] }) {
  const getConfidenceColor = (score) => {
    if (score >= 80) return "success";
    if (score >= 60) return "info";
    return "warning";
  };

  const getTrendColor = (trend) => {
    if (trend === "bullish") return "success";
    if (trend === "bearish") return "error";
    return "default";
  };

  const getTrendIcon = (trend) => {
    if (trend === "bullish") return <TrendingUpIcon fontSize="small" />;
    if (trend === "bearish") return <TrendingDownIcon fontSize="small" />;
    return <TrendingFlatIcon fontSize="small" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const earningsDate = new Date(date);
      earningsDate.setHours(0, 0, 0, 0);
      
      const diffTime = earningsDate - today;
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (daysUntil === 0) return "Aujourd'hui";
      if (daysUntil === 1) return "Demain";
      if (daysUntil > 0 && daysUntil < 7) return `Dans ${daysUntil} jours`;
      if (daysUntil < 0) return "Passé";
      
      // Format: "25 Nov 2025"
      const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return dateString;
    }
  };

  const formatVolume = (volume, avgVolume) => {
    if (!volume || volume === 0) {
      return (
        <MDTypography variant="body2" color="text.secondary">
          N/A
        </MDTypography>
      );
    }
    if (avgVolume && avgVolume > 0) {
      const ratio = volume / avgVolume;
      if (ratio >= 2) {
        return (
          <MDBox>
            <Chip 
              label={`${ratio.toFixed(1)}x`} 
              color="warning" 
              size="small"
              sx={{ mb: 0.5 }}
            />
            <MDTypography variant="caption" color="text" display="block">
              {formatNumber(volume)}
            </MDTypography>
          </MDBox>
        );
      }
    }
    return (
      <MDTypography variant="body2">
        {formatNumber(volume)}
      </MDTypography>
    );
  };

  const formatNumber = (num) => {
    if (!num || num === 0) return "-";
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
    return num.toLocaleString();
  };

  const getRSIDisplay = (rsi) => {
    if (!rsi && rsi !== 0) {
      return (
        <Tooltip title="RSI non disponible">
          <MDTypography variant="caption" color="text.secondary">
            N/A
          </MDTypography>
        </Tooltip>
      );
    }
    
    const rsiValue = typeof rsi === "number" ? rsi : rsi;
    let color = "text";
    let label = rsiValue.toFixed(1);
    
    if (rsiValue < 30) {
      color = "error";
      label = `${rsiValue.toFixed(1)} (Oversold)`;
    } else if (rsiValue > 70) {
      color = "warning";
      label = `${rsiValue.toFixed(1)} (Overbought)`;
    } else {
      color = "success";
    }
    
    return (
      <MDTypography variant="body2" color={color} fontWeight="medium">
        {label}
      </MDTypography>
    );
  };

  return (
    <Card>
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDTypography variant="h6">
            Opportunités Earnings (7 prochains jours)
          </MDTypography>
          <Tooltip title="Score basé sur le momentum, RSI, tendance pré-earnings et volume">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        
        {data.length === 0 ? (
          <MDBox textAlign="center" py={4}>
            <MDTypography variant="body2" color="text">
              Aucune opportunité détectée dans la watchlist
            </MDTypography>
          </MDBox>
        ) : (
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="8%" align="left">
                    Symbole
                  </DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="left">
                    Date Earnings
                  </DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="right">
                    Prix
                  </DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="right">
                    Change %
                  </DataTableHeadCell>
                  <DataTableHeadCell width="10%" align="center">
                    RSI
                  </DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="center">
                    Tendance
                  </DataTableHeadCell>
                  <DataTableHeadCell width="13%" align="right">
                    Volume
                  </DataTableHeadCell>
                  <DataTableHeadCell width="20%" align="center">
                    Score
                  </DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.map((opp, index) => (
                  <TableRow 
                    key={index}
                    sx={{
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    <DataTableBodyCell align="left">
                      <MDTypography variant="button" fontWeight="bold" color="primary" noWrap>
                        {opp.symbol}
                      </MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left">
                      <MDBox>
                        <MDTypography variant="body2" fontWeight="medium">
                          {formatDate(opp.earningsDate)}
                        </MDTypography>
                        {opp.earningsTime && (
                          <MDTypography variant="caption" color="text.secondary" display="block">
                            {opp.earningsTime}
                          </MDTypography>
                        )}
                      </MDBox>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="right">
                      <MDTypography variant="body2" fontWeight="bold">
                        ${opp.currentPrice?.toFixed(2) || "N/A"}
                      </MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="right">
                      <MDBox display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                        {opp.changePercent >= 0 ? (
                          <TrendingUpIcon fontSize="small" color="success" />
                        ) : (
                          <TrendingDownIcon fontSize="small" color="error" />
                        )}
                        <MDTypography
                          variant="body2"
                          color={opp.changePercent >= 0 ? "success" : "error"}
                          fontWeight="bold"
                        >
                          {opp.changePercent?.toFixed(2) || "0.00"}%
                        </MDTypography>
                      </MDBox>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="center">
                      {getRSIDisplay(opp.rsi)}
                    </DataTableBodyCell>
                    <DataTableBodyCell align="center">
                      {opp.preEarningsTrend ? (
                        <Chip
                          icon={getTrendIcon(opp.preEarningsTrend)}
                          label={opp.preEarningsTrend}
                          color={getTrendColor(opp.preEarningsTrend)}
                          size="small"
                        />
                      ) : (
                        <Chip
                          icon={<TrendingFlatIcon fontSize="small" />}
                          label="Neutre"
                          color="default"
                          size="small"
                        />
                      )}
                    </DataTableBodyCell>
                    <DataTableBodyCell align="right">
                      {formatVolume(opp.volume, opp.avgVolume)}
                    </DataTableBodyCell>
                    <DataTableBodyCell align="center">
                      {opp.confidenceScore !== undefined && opp.confidenceScore !== null ? (
                        <MDBox minWidth={100} mx="auto">
                          <MDBox display="flex" alignItems="center" justifyContent="center" gap={0.5} mb={0.5}>
                            <MDTypography
                              variant="body2"
                              color={getConfidenceColor(opp.confidenceScore)}
                              fontWeight="bold"
                            >
                              {opp.confidenceScore}/100
                            </MDTypography>
                            {opp.confidenceScore >= 80 && (
                              <Chip label="🔥" size="small" sx={{ height: 20 }} />
                            )}
                          </MDBox>
                          <LinearProgress
                            variant="determinate"
                            value={opp.confidenceScore}
                            color={getConfidenceColor(opp.confidenceScore)}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </MDBox>
                      ) : (
                        <MDTypography variant="body2" color="text.secondary">
                          N/A
                        </MDTypography>
                      )}
                    </DataTableBodyCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </MDBox>
    </Card>
  );
}

export default EarningsOpportunities;

