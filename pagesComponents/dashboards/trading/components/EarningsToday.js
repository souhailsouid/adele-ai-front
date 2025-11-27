import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import DataTableHeadCell from "/examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "/examples/Tables/DataTable/DataTableBodyCell";

function EarningsToday({ data = [] }) {
  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" mb={2}>
          Earnings Aujourd&apos;hui ({data.length})
        </MDTypography>
        {data.length === 0 ? (
          <MDTypography variant="body2" color="text">
            Aucun earnings prévu aujourd&apos;hui
          </MDTypography>
        ) : (
          <TableContainer>
            <Table>
              <MDBox component="thead">
                <TableRow>
                  <DataTableHeadCell width="10%" align="left">
                    Symbole
                  </DataTableHeadCell>
                  <DataTableHeadCell width="25%" align="left">
                    Entreprise
                  </DataTableHeadCell>
                  <DataTableHeadCell width="15%" align="left">
                    Heure
                  </DataTableHeadCell>
                  <DataTableHeadCell width="20%" align="right">
                    EPS Estimé
                  </DataTableHeadCell>
                  <DataTableHeadCell width="30%" align="right">
                    Revenus Estimés
                  </DataTableHeadCell>
                </TableRow>
              </MDBox>
              <TableBody>
                {data.slice(0, 10).map((earning, index) => (
                  <TableRow 
                    key={index}
                    sx={{
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    <DataTableBodyCell align="left">
                      <MDTypography variant="button" fontWeight="bold" color="primary" noWrap>
                        {earning.symbol}
                      </MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left">
                      <MDTypography variant="body2">
                        {earning.name || earning.symbol || "N/A"}
                      </MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="left">
                      <MDTypography variant="body2" color="text.secondary">
                        {earning.time || "N/A"}
                      </MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="right">
                      <MDTypography variant="body2" fontWeight="medium">
                        {earning.epsEstimated
                          ? `$${earning.epsEstimated.toFixed(2)}`
                          : "N/A"}
                      </MDTypography>
                    </DataTableBodyCell>
                    <DataTableBodyCell align="right">
                      <MDTypography variant="body2" fontWeight="medium">
                        {earning.revenueEstimated
                          ? `$${(earning.revenueEstimated / 1_000_000).toFixed(2)}M`
                          : "N/A"}
                      </MDTypography>
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

export default EarningsToday;

