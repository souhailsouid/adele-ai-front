/**
 * AnalysisCard - Composant réutilisable pour afficher une analyse (fundamental ou sentiment)
 */

import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import LinearProgress from "@mui/material/LinearProgress";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";

function AnalysisCard({ 
  title,
  score,
  maxScore = 100,
  color = "info",
  indicators = [],
  details = null,
}) {
  const percentage = (score / maxScore) * 100;
  
  const getColor = (value) => {
    if (value >= 70) return 'success';
    if (value >= 50) return 'info';
    if (value >= 30) return 'warning';
    return 'error';
  };

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" fontWeight="medium" mb={2}>
          {title}
        </MDTypography>
        
        <MDBox mb={2}>
          <MDBox display="flex" justifyContent="space-between" mb={1}>
            <MDTypography variant="body2" color="text">
              Score
            </MDTypography>
            <MDTypography variant="body2" fontWeight="medium">
              {score}/{maxScore}
            </MDTypography>
          </MDBox>
          <LinearProgress
            variant="determinate"
            value={percentage}
            color={getColor(score)}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </MDBox>

        {indicators.length > 0 && (
          <Grid container spacing={2} mb={2}>
            {indicators.map((indicator, index) => (
              <Grid item xs={6} key={index}>
                <Chip
                  icon={<Icon>{indicator.value ? 'check_circle' : 'cancel'}</Icon>}
                  label={indicator.label}
                  color={indicator.value ? 'success' : 'default'}
                  size="small"
                />
              </Grid>
            ))}
          </Grid>
        )}

        {details && (
          <Box>
            <Divider sx={{ my: 2 }} />
            {Object.entries(details).map(([key, value]) => (
              <MDTypography key={key} variant="body2" color="text" mb={1}>
                <strong>{formatKey(key)}:</strong> {formatValue(value)}
              </MDTypography>
            ))}
          </Box>
        )}
      </MDBox>
    </Card>
  );
}

function formatKey(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function formatValue(value) {
  if (typeof value === 'number') {
    if (value > 1000) {
      return value.toLocaleString();
    }
    return value.toFixed(2);
  }
  return value || 'N/A';
}

export default AnalysisCard;



