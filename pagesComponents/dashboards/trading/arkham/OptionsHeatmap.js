/**
 * Heatmap des options
 * Visualisation des options par strike et expiration
 * Utilise premium pour l'intensité de couleur
 */

import { useState } from "react";
import React from "react";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";

function OptionsHeatmap({ data = [] }) {
  const [tooltipData, setTooltipData] = useState(null);

  // Normaliser les dates d'expiration pour les regrouper
  const normalizeExpiry = (expiry) => {
    if (!expiry) return "N/A";
    // Si c'est une date, extraire le format court
    if (typeof expiry === 'string' && expiry.includes("-")) {
      try {
        const date = new Date(expiry);
        const now = new Date();
        const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1) return "1D";
        if (diffDays <= 7) return "1W";
        if (diffDays <= 14) return "2W";
        if (diffDays <= 30) return "1M";
        if (diffDays <= 60) return "2M";
        return "3M+";
      } catch {
        return expiry;
      }
    }
    return expiry;
  };

  // Formater les dates d'expiration pour l'affichage (garder le format original si possible)
  const formatExpiryForDisplay = (expiry) => {
    if (!expiry) return "N/A";
    if (typeof expiry === 'string' && expiry.includes("-")) {
      try {
        const date = new Date(expiry);
        return date.toLocaleDateString("fr-FR", { month: "short", day: "numeric" });
      } catch {
        return expiry;
      }
    }
    return expiry;
  };

  // Utiliser les données fournies (déjà agrégées)
  const heatmapData = Array.isArray(data) ? data : [];

  // Normaliser les expiries pour le regroupement
  const processedData = heatmapData.map((d) => ({
    ...d,
    expiryNormalized: normalizeExpiry(d.expiry),
    expiryOriginal: d.expiry,
  }));

  // Créer la map pour l'accès rapide
  const heatmapMap = {};
  processedData.forEach((d) => {
    const key = `${d.strike}-${d.expiryNormalized}`;
    if (!heatmapMap[key]) {
      heatmapMap[key] = {
        strike: d.strike,
        expiry: d.expiryNormalized,
        expiryOriginal: d.expiryOriginal,
        premium: 0,
        volume: 0,
        count: 0,
        type: d.type || "CALL",
      };
    }
    heatmapMap[key].premium += d.premium || 0;
    heatmapMap[key].volume += d.volume || 0;
    heatmapMap[key].count += d.count || 1;
  });

  // Créer la matrice 2D : strikes (triés) et expiries (triées)
  const strikes = [...new Set(processedData.map((d) => d.strike))].sort((a, b) => a - b);
  const expiries = [...new Set(processedData.map((d) => d.expiryNormalized))].sort();

  // Trouver les valeurs min/max pour la normalisation (basé sur premium)
  const aggregatedValues = Object.values(heatmapMap);
  const premiums = aggregatedValues.map((d) => d.premium || 0);
  const maxPremium = Math.max(...premiums, 1);
  const minPremium = Math.min(...premiums, 0);

  const getIntensity = (premium) => {
    if (maxPremium === minPremium) return 0.5;
    return (premium - minPremium) / (maxPremium - minPremium);
  };

  const getColor = (intensity) => {
    // Gradient du bleu (froid) au rouge (chaud)
    const r = Math.floor(255 * intensity);
    const b = Math.floor(255 * (1 - intensity));
    return `rgb(${r}, 100, ${b})`;
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "$0";
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  // Créer la matrice 2D
  const matrix = expiries.map((expiry) =>
    strikes.map((strike) => {
      const key = `${strike}-${expiry}`;
      return heatmapMap[key] || null;
    })
  );

  if (strikes.length === 0 || expiries.length === 0) {
    return (
      <MDBox textAlign="center" py={4}>
        <MDTypography variant="body2" color="text.secondary">
          Aucune donnée disponible pour la heatmap
        </MDTypography>
      </MDBox>
    );
  }

  return (
    <MDBox>
      <MDBox
        sx={{
          display: "grid",
          gridTemplateColumns: `auto repeat(${expiries.length}, 1fr)`,
          gap: 1,
          p: 2,
          backgroundColor: "grey.100",
          borderRadius: 1,
          overflowX: "auto",
        }}
      >
        {/* En-tête */}
        <MDBox></MDBox>
        {expiries.map((expiry) => {
          // Trouver la première date originale pour cette expiry normalisée
          const firstOriginal = processedData.find((d) => d.expiryNormalized === expiry)?.expiryOriginal;
          return (
            <Tooltip key={expiry} title={firstOriginal ? formatExpiryForDisplay(firstOriginal) : expiry}>
              <MDTypography variant="caption" fontWeight="bold" textAlign="center">
                {expiry}
              </MDTypography>
            </Tooltip>
          );
        })}

        {/* Lignes de données */}
        {strikes.map((strike, strikeIdx) => {
          return (
            <React.Fragment key={`row-${strike}`}>
              <MDTypography variant="caption" fontWeight="medium" sx={{ py: 1, display: "flex", alignItems: "center" }}>
                ${strike}
              </MDTypography>
              {expiries.map((expiry, expiryIdx) => {
                const cell = matrix[expiryIdx][strikeIdx];
                const premium = cell ? cell.premium : 0;
                const intensity = getIntensity(premium);

                const tooltipContent = cell ? (
                  <MDBox>
                    <MDTypography variant="caption" fontWeight="bold" display="block">
                      Strike: ${cell.strike} | Expiry: {formatExpiryForDisplay(cell.expiryOriginal)}
                    </MDTypography>
                    <MDTypography variant="caption" display="block">
                      Premium: {formatCurrency(cell.premium)}
                    </MDTypography>
                    <MDTypography variant="caption" display="block">
                      Volume: {cell.volume.toLocaleString()}
                    </MDTypography>
                    <MDTypography variant="caption" display="block">
                      Count: {cell.count}
                    </MDTypography>
                    <Chip
                      label={cell.type}
                      size="small"
                      color={cell.type === "CALL" ? "success" : "error"}
                      sx={{ mt: 0.5, height: 18, fontSize: "0.65rem" }}
                    />
                  </MDBox>
                ) : (
                  "Aucune donnée"
                );

                return (
                  <Tooltip key={`${strike}-${expiry}`} title={tooltipContent} arrow>
                    <MDBox
                      sx={{
                        backgroundColor: cell ? getColor(intensity) : "grey.300",
                        color: cell && intensity > 0.5 ? "white" : "text.primary",
                        p: 1,
                        borderRadius: 0.5,
                        textAlign: "center",
                        minHeight: 50,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: cell ? "pointer" : "default",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: cell ? "scale(1.05)" : "none",
                          boxShadow: cell ? 3 : 0,
                          zIndex: 1,
                        },
                      }}
                    >
                      {cell ? (
                        <>
                          <MDTypography variant="caption" fontWeight="bold" sx={{ fontSize: "0.7rem" }}>
                            {formatCurrency(premium)}
                          </MDTypography>
                          <MDTypography variant="caption" sx={{ fontSize: "0.6rem", opacity: 0.8 }}>
                            {cell.count} trade{cell.count > 1 ? "s" : ""}
                          </MDTypography>
                        </>
                      ) : (
                        <MDTypography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                          -
                        </MDTypography>
                      )}
                    </MDBox>
                  </Tooltip>
                );
              })}
            </React.Fragment>
          );
        })}
      </MDBox>
      <MDBox mt={2} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <MDTypography variant="caption" color="text.secondary">
          Heatmap basée sur premium (intensité de couleur) • {aggregatedValues.length} combinaisons strike/expiry
        </MDTypography>
        <MDBox display="flex" gap={1} alignItems="center">
          <MDBox
            sx={{
              width: 100,
              height: 10,
              background: "linear-gradient(to right, rgb(0,100,255), rgb(255,100,0))",
              borderRadius: 1,
            }}
          />
          <MDTypography variant="caption" color="text.secondary">
            {formatCurrency(minPremium)} → {formatCurrency(maxPremium)}
          </MDTypography>
        </MDBox>
      </MDBox>
    </MDBox>
  );
}

export default OptionsHeatmap;

