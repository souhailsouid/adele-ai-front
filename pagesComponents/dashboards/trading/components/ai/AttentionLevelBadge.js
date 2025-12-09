/**
 * Badge pour afficher le niveau d'attention
 */

import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";

function AttentionLevelBadge({ level }) {
  const config = {
    faible: {
      color: "default",
      icon: "info",
      label: "Faible",
    },
    moyen: {
      color: "warning",
      icon: "warning",
      label: "Moyen",
    },
    élevé: {
      color: "error",
      icon: "priority_high",
      label: "Élevé",
    },
    critique: {
      color: "error",
      icon: "error",
      label: "Critique",
    },
  };

  const levelConfig = config[level] || config.faible;

  return (
    <Chip
      icon={<Icon>{levelConfig.icon}</Icon>}
      label={levelConfig.label.toUpperCase()}
      color={levelConfig.color}
      size="small"
      sx={{
        fontWeight: "bold",
        fontSize: "0.75rem",
      }}
    />
  );
}

export default AttentionLevelBadge;

