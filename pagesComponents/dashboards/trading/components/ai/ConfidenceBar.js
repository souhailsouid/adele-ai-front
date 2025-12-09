/**
 * Barre de confiance pour afficher un niveau de confiance (0-1)
 */

import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import LinearProgress from "@mui/material/LinearProgress";

function ConfidenceBar({ confidence, label = "Confiance", showPercentage = true }) {
  const percentage = Math.round((confidence || 0) * 100);
  const color = percentage >= 70 ? "success" : percentage >= 50 ? "warning" : "error";

  return (
    <MDBox>
      {label && (
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
          <MDTypography variant="caption" color="text.secondary">
            {label}
          </MDTypography>
          {showPercentage && (
            <MDTypography variant="caption" fontWeight="bold" color={color}>
              {percentage}%
            </MDTypography>
          )}
        </MDBox>
      )}
      <LinearProgress
        variant="determinate"
        value={percentage}
        color={color}
        sx={{
          height: 8,
          borderRadius: 1,
          backgroundColor: "grey.200",
        }}
      />
    </MDBox>
  );
}

export default ConfidenceBar;

