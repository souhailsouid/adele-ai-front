import { useState } from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MDInput from "/components/MDInput";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import alertService from "/services/alertService";

function ActiveAlerts({ data = [], onRefresh }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "price",
    symbol: "",
    condition: "above",
    targetPrice: "",
    threshold: "",
  });

  const handleCreateAlert = () => {
    if (!formData.symbol) {
      alert("Veuillez entrer un symbole");
      return;
    }

    const alert = {
      type: formData.type,
      symbol: formData.symbol.toUpperCase(),
      condition: formData.condition,
      targetPrice: formData.targetPrice ? parseFloat(formData.targetPrice) : null,
      threshold: formData.threshold ? parseFloat(formData.threshold) : null,
      name: `${formData.symbol} - ${formData.type} - ${formData.condition}`,
    };

    alertService.createAlert(alert);
    setOpen(false);
    setFormData({
      type: "price",
      symbol: "",
      condition: "above",
      targetPrice: "",
      threshold: "",
    });
    if (onRefresh) onRefresh();
  };

  const handleDelete = (alertId) => {
    if (confirm("Supprimer cette alerte ?")) {
      alertService.deleteAlert(alertId);
      if (onRefresh) onRefresh();
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      price: "primary",
      volume: "warning",
      rsi: "info",
      earnings: "success",
    };
    return colors[type] || "default";
  };

  return (
    <>
      <Card>
        <MDBox p={3}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h6">
              Alertes Actives ({data.length})
            </MDTypography>
            <MDButton
              variant="gradient"
              color="info"
              size="small"
              onClick={() => setOpen(true)}
            >
              <AddIcon fontSize="small" sx={{ mr: 0.5 }} />
              Nouvelle Alerte
            </MDButton>
          </MDBox>
          {data.length === 0 ? (
            <MDTypography variant="body2" color="text">
              Aucune alerte configurée
            </MDTypography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Symbole</TableCell>
                    <TableCell>Condition</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <Chip
                          label={alert.type}
                          color={getTypeColor(alert.type)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <MDTypography variant="button" fontWeight="bold">
                          {alert.symbol}
                        </MDTypography>
                      </TableCell>
                      <TableCell>
                        <MDTypography variant="body2">
                          {alert.condition}
                          {alert.targetPrice && ` @ $${alert.targetPrice}`}
                          {alert.threshold && ` (${alert.threshold}x)`}
                        </MDTypography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={alert.triggered ? "Déclenchée" : "Active"}
                          color={alert.triggered ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(alert.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </MDBox>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Créer une Nouvelle Alerte</DialogTitle>
        <DialogContent>
          <MDBox pt={2}>
            <MDBox mb={2}>
              <FormControl variant="standard" fullWidth>
                <InputLabel>Type d&apos;alerte</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Type d'alerte"
                >
                  <MenuItem value="price">Prix</MenuItem>
                  <MenuItem value="volume">Volume</MenuItem>
                  <MenuItem value="rsi">RSI</MenuItem>
                  <MenuItem value="earnings">Earnings</MenuItem>
                </Select>
              </FormControl>
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                label="Symbole"
                value={formData.symbol}
                onChange={(e) =>
                  setFormData({ ...formData, symbol: e.target.value.toUpperCase() })
                }
                fullWidth
                variant="standard"
                placeholder="AAPL"
              />
            </MDBox>
            {formData.type === "price" && (
              <>
                <MDBox mb={2}>
                  <FormControl variant="standard" fullWidth>
                    <InputLabel>Condition</InputLabel>
                    <Select
                      value={formData.condition}
                      onChange={(e) =>
                        setFormData({ ...formData, condition: e.target.value })
                      }
                      label="Condition"
                    >
                      <MenuItem value="above">Au-dessus de</MenuItem>
                      <MenuItem value="below">En-dessous de</MenuItem>
                      <MenuItem value="change_percent">Changement %</MenuItem>
                    </Select>
                  </FormControl>
                </MDBox>
                <MDBox mb={2}>
                  <MDInput
                    label="Prix cible"
                    type="number"
                    value={formData.targetPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, targetPrice: e.target.value })
                    }
                    fullWidth
                    variant="standard"
                  />
                </MDBox>
              </>
            )}
            {formData.type === "volume" && (
              <MDBox mb={2}>
                <MDInput
                  label="Seuil (multiplicateur)"
                  type="number"
                  value={formData.threshold}
                  onChange={(e) =>
                    setFormData({ ...formData, threshold: e.target.value })
                  }
                  fullWidth
                  variant="standard"
                  placeholder="3"
                />
              </MDBox>
            )}
            {formData.type === "rsi" && (
              <MDBox mb={2}>
                <FormControl variant="standard" fullWidth>
                  <InputLabel>Condition</InputLabel>
                  <Select
                    value={formData.condition}
                    onChange={(e) =>
                      setFormData({ ...formData, condition: e.target.value })
                    }
                    label="Condition"
                  >
                    <MenuItem value="oversold">Oversold (&lt; 30)</MenuItem>
                    <MenuItem value="overbought">Overbought (&gt; 70)</MenuItem>
                  </Select>
                </FormControl>
              </MDBox>
            )}
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setOpen(false)}>Annuler</MDButton>
          <MDButton onClick={handleCreateAlert} variant="gradient" color="info">
            Créer
          </MDButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ActiveAlerts;

