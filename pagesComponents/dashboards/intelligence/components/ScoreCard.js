/**
 * ScoreCard - Composant réutilisable pour afficher un score avec barre de progression
 */

import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import LinearProgress from "@mui/material/LinearProgress";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";

function ScoreCard({ 
  title, 
  score, 
  maxScore = 100, 
  color = "info", 
  recommendation = null,
  confidence = null,
  breakdown = null,
  icon = null,
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
        {title && (
          <MDBox display="flex" alignItems="center" mb={2}>
            {icon && (
              <Icon sx={{ mr: 1, color: `${color}.main` }}>{icon}</Icon>
            )}
            <MDTypography variant="h6" fontWeight="medium">
              {title}
            </MDTypography>
          </MDBox>
        )}
        
        <MDBox mb={2}>
          <MDBox display="flex" justifyContent="space-between" mb={1}>
            <MDTypography variant="body2" color="text">
              Score
            </MDTypography>
            <MDTypography variant="h5" fontWeight="bold" color={color}>
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

        {recommendation && (
          <MDBox mb={2}>
            <Chip
              icon={<Icon>{getRecommendationIcon(recommendation)}</Icon>}
              label={recommendation.replace('_', ' ')}
              color={getRecommendationColor(recommendation)}
              size="small"
            />
          </MDBox>
        )}

        {confidence !== null && (
          <MDTypography variant="body2" color="text" mb={1}>
            Confiance: <strong>{confidence}%</strong>
          </MDTypography>
        )}

        {breakdown && (
          <MDBox mt={2}>
            {Object.entries(breakdown).map(([key, value]) => (
              <MDBox key={key} mb={1}>
                <MDBox display="flex" justifyContent="space-between" mb={0.5}>
                  <MDTypography variant="caption" color="text" textTransform="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </MDTypography>
                  <MDTypography variant="caption" fontWeight="medium">
                    {value}/{maxScore}
                  </MDTypography>
                </MDBox>
                <LinearProgress
                  variant="determinate"
                  value={(value / maxScore) * 100}
                  color={getColor(value)}
                  sx={{ height: 4, borderRadius: 1 }}
                />
              </MDBox>
            ))}
          </MDBox>
        )}
      </MDBox>
    </Card>
  );
}

function getRecommendationColor(recommendation) {
  switch (recommendation) {
    case 'STRONG_BUY':
      return 'success';
    case 'BUY':
      return 'info';
    case 'HOLD':
      return 'warning';
    case 'SELL':
      return 'error';
    case 'STRONG_SELL':
      return 'error';
    default:
      return 'default';
  }
}

function getRecommendationIcon(recommendation) {
  switch (recommendation) {
    case 'STRONG_BUY':
    case 'BUY':
      return 'trending_up';
    case 'HOLD':
      return 'trending_flat';
    case 'SELL':
    case 'STRONG_SELL':
      return 'trending_down';
    default:
      return 'help';
  }
}

export default ScoreCard;



