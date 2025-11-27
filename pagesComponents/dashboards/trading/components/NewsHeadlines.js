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
import Link from "@mui/material/Link";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";
import { formatDateTime } from "./utils";

function NewsHeadlines({ data = [], loading = false }) {
  const getSentimentColor = (sentiment) => {
    if (!sentiment) return "default";
    const sent = sentiment.toLowerCase();
    if (sent === "positive") return "success";
    if (sent === "negative") return "error";
    return "default";
  };

  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            News Headlines
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
            News Headlines ({data.length})
          </MDTypography>
          <Tooltip title="Dernières actualités financières qui peuvent impacter les marchés. Inclut les actualités par entreprise, secteur et événements de marché.">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MDBox>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucune news disponible
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="15%" align="left">Date/Heure</DataTableHeadCell>
                  <DataTableHeadCell width="40%" align="left">Headline</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="left">Source</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="center">Sentiment</DataTableHeadCell>
                  <DataTableHeadCell width="12%" align="left">Tickers</DataTableHeadCell>
                  <DataTableHeadCell width="9%" align="center">Tags</DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.slice(0, 100).map((news, index) => {
                  const dateTime = formatDateTime(news.created_at);
                  
                  return (
                    <TableRow 
                      key={index} 
                      sx={{ 
                        "&:hover": { backgroundColor: "action.hover" },
                        bgcolor: news.is_major ? "warning.lighter" : "transparent"
                      }}
                    >
                      <DataTableBodyCell align="left">
                        <MDTypography variant="caption" color="text.secondary" display="block">
                          {dateTime.date}
                        </MDTypography>
                        <MDTypography variant="caption" color="text.secondary">
                          {dateTime.time}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDBox display="flex" alignItems="flex-start" gap={0.5}>
                          {news.is_major && (
                            <Chip 
                              label="MAJOR" 
                              size="small" 
                              color="warning" 
                              sx={{ height: 18, fontSize: "0.65rem", fontWeight: "bold" }}
                            />
                          )}
                          <MDTypography variant="body2" fontWeight={news.is_major ? "bold" : "regular"}>
                            {news.headline || "N/A"}
                          </MDTypography>
                        </MDBox>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        <MDTypography variant="caption" color="text.secondary">
                          {news.source || "N/A"}
                        </MDTypography>
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        {news.sentiment ? (
                          <Chip
                            label={news.sentiment.toUpperCase()}
                            color={getSentimentColor(news.sentiment)}
                            size="small"
                          />
                        ) : (
                          <MDTypography variant="caption" color="text.secondary">-</MDTypography>
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell align="left">
                        {news.tickers && news.tickers.length > 0 ? (
                          <MDBox display="flex" gap={0.5} flexWrap="wrap">
                            {news.tickers.slice(0, 3).map((ticker, idx) => (
                              <Chip
                                key={idx}
                                label={ticker}
                                size="small"
                                color="primary"
                                sx={{ height: 20, fontSize: "0.7rem" }}
                              />
                            ))}
                            {news.tickers.length > 3 && (
                              <MDTypography variant="caption" color="text.secondary">
                                +{news.tickers.length - 3}
                              </MDTypography>
                            )}
                          </MDBox>
                        ) : (
                          <MDTypography variant="caption" color="text.secondary">-</MDTypography>
                        )}
                      </DataTableBodyCell>
                      <DataTableBodyCell align="center">
                        {news.tags && news.tags.length > 0 ? (
                          <Tooltip title={news.tags.join(", ")}>
                            <MDBox display="flex" gap={0.5} flexWrap="wrap" justifyContent="center">
                              {news.tags.slice(0, 2).map((tag, idx) => (
                                <Chip
                                  key={idx}
                                  label={tag}
                                  size="small"
                                  color="default"
                                  sx={{ height: 18, fontSize: "0.65rem" }}
                                />
                              ))}
                              {news.tags.length > 2 && (
                                <MDTypography variant="caption" color="text.secondary">
                                  +{news.tags.length - 2}
                                </MDTypography>
                              )}
                            </MDBox>
                          </Tooltip>
                        ) : (
                          <MDTypography variant="caption" color="text.secondary">-</MDTypography>
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

export default NewsHeadlines;


