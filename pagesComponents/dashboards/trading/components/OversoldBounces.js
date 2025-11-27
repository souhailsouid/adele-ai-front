import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";

function OversoldBounces({ data = [] }) {
  const getStrengthColor = (strength) => {
    if (strength >= 80) return "success";
    if (strength >= 60) return "info";
    return "warning";
  };

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" mb={2}>
          Rebonds Oversold (RSI &lt; 30)
        </MDTypography>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucun setup oversold détecté
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Symbole</TableCell>
                  <TableCell>Prix</TableCell>
                  <TableCell>RSI</TableCell>
                  <TableCell>Volume Ratio</TableCell>
                  <TableCell>Force</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((bounce, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <MDTypography variant="button" fontWeight="bold">
                        {bounce.symbol}
                      </MDTypography>
                    </TableCell>
                    <TableCell>${bounce.price?.toFixed(2) || "N/A"}</TableCell>
                    <TableCell>
                      <MDTypography variant="body2" color="error" fontWeight="medium">
                        {bounce.rsi?.toFixed(1) || "N/A"}
                      </MDTypography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${bounce.volumeRatio}x`}
                        color="warning"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${bounce.strength}/100`}
                        color={getStrengthColor(bounce.strength)}
                        size="small"
                      />
                    </TableCell>
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

export default OversoldBounces;

