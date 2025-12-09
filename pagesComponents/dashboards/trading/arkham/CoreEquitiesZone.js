/**
 * Zone Core Equities
 * Affiche les principales actions avec sparklines animés
 */

import { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import LinearProgress from "@mui/material/LinearProgress";
import SparklineChart from "/pagesComponents/dashboards/trading/arkham/SparklineChart";
import FundAvatar from "/pagesComponents/dashboards/trading/arkham/FundAvatar";

function CoreEquitiesZone({ data = [], loading = false }) {
  if (loading) {
    return (
      <Card>
        <MDBox p={3}>
          <MDTypography variant="h6" mb={2}>
            Core Equities
          </MDTypography>
          <LinearProgress />
        </MDBox>
      </Card>
    );
  }

  const formatPrice = (price) => {
    if (!price) return "N/A";
    return `$${Number(price).toFixed(2)}`;
  };

  const formatChange = (change, changePercent) => {
    if (change === null || change === undefined) return null;
    const isPositive = change >= 0;
    return {
      value: `${isPositive ? "+" : ""}${Number(change).toFixed(2)} (${isPositive ? "+" : ""}${Number(changePercent || 0).toFixed(2)}%)`,
      color: isPositive ? "success" : "error",
    };
  };

  return (
    <Card>
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDTypography variant="h6" fontWeight="bold">
            Core Equities
          </MDTypography>
          <Chip
            icon={<Icon>trending_up</Icon>}
            label={`${data.length} tickers`}
            size="small"
            color="info"
          />
        </MDBox>

        <Grid container spacing={2}>
          {data.map((equity, index) => {
            const change = formatChange(
              equity.quote?.change,
              equity.quote?.changesPercentage
            );

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={equity.symbol || index}>
                <Card
                  sx={{
                    height: "100%",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <MDBox p={2}>
                    {/* En-tête avec symbole et score */}
                    <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <MDBox>
                        <MDTypography variant="h6" fontWeight="bold">
                          {equity.symbol}
                        </MDTypography>
                        {equity.quote?.name && (
                          <MDTypography variant="caption" color="text.secondary" noWrap>
                            {equity.quote.name.substring(0, 20)}...
                          </MDTypography>
                        )}
                      </MDBox>
                      {equity.score !== null && equity.score !== undefined && (
                        <Chip
                          label={equity.score.toFixed(0)}
                          size="small"
                          color={
                            equity.score >= 70
                              ? "success"
                              : equity.score >= 50
                              ? "warning"
                              : "error"
                          }
                          sx={{ fontWeight: "bold" }}
                        />
                      )}
                    </MDBox>

                    {/* Prix et changement */}
                    <MDBox mb={2}>
                      <MDTypography variant="h5" fontWeight="bold">
                        {formatPrice(equity.quote?.price)}
                      </MDTypography>
                      {change && (
                        <MDTypography
                          variant="caption"
                          color={change.color}
                          fontWeight="medium"
                        >
                          {change.value}
                        </MDTypography>
                      )}
                    </MDBox>

                    {/* Sparkline */}
                    {equity.quote && (
                      <MDBox height={60} mb={1}>
                        <SparklineChart
                          symbol={equity.symbol}
                          price={equity.quote.price}
                          change={equity.quote.change}
                        />
                      </MDBox>
                    )}

                    {/* Volume */}
                    {equity.quote?.volume && (
                      <MDBox display="flex" alignItems="center" gap={0.5}>
                        <Icon fontSize="small" color="text.secondary">
                          bar_chart
                        </Icon>
                        <MDTypography variant="caption" color="text.secondary">
                          Vol: {(equity.quote.volume / 1000000).toFixed(2)}M
                        </MDTypography>
                      </MDBox>
                    )}
                  </MDBox>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {data.length === 0 && (
          <MDBox textAlign="center" py={4}>
            <MDTypography variant="body2" color="text.secondary">
              Aucune donnée disponible
            </MDTypography>
          </MDBox>
        )}
      </MDBox>
    </Card>
  );
}

export default CoreEquitiesZone;



