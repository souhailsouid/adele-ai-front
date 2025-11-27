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
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

function UnusualVolume({ data = [] }) {
  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" mb={2}>
          Volume Anormal (&gt; 3x moyenne)
        </MDTypography>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucun volume anormal détecté
          </MDTypography>
        ) : (
          <TableContainer>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>Symbole</TableCell>
                  <TableCell>Prix</TableCell>
                  <TableCell>Change %</TableCell>
                  <TableCell>Volume Ratio</TableCell>
                  <TableCell>Direction</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <MDTypography variant="button" fontWeight="bold">
                        {item.symbol}
                      </MDTypography>
                    </TableCell>
                    <TableCell>${item.price?.toFixed(2) || "N/A"}</TableCell>
                    <TableCell>
                      <MDBox display="flex" alignItems="center">
                        {item.changePercent >= 0 ? (
                          <TrendingUpIcon fontSize="small" color="success" />
                        ) : (
                          <TrendingDownIcon fontSize="small" color="error" />
                        )}
                        <MDTypography
                          variant="body2"
                          color={item.changePercent >= 0 ? "success" : "error"}
                          ml={0.5}
                        >
                          {item.changePercent?.toFixed(2) || "0.00"}%
                        </MDTypography>
                      </MDBox>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${item.volumeRatio}x`}
                        color="warning"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.direction === "up" ? "↑" : "↓"}
                        color={item.direction === "up" ? "success" : "error"}
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

export default UnusualVolume;

