/**
 * Utilitaires pour l'export de données (CSV, PDF)
 */

/**
 * Exporter des données en CSV
 */
export function exportToCSV(data, filename = "export.csv") {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Convertir les données en format CSV
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Gérer les valeurs avec virgules ou guillemets
          if (value === null || value === undefined) return "";
          const stringValue = String(value);
          if (stringValue.includes(",") || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(",")
    ),
  ].join("\n");

  // Créer un blob et télécharger
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exporter une analyse complète en CSV
 */
export function exportAnalysisToCSV(analysis, ticker) {
  if (!analysis) return;

  const data = [
    {
      Ticker: ticker,
      "Fundamental Score": analysis.fundamental?.score || 0,
      "Sentiment Score": analysis.sentiment?.score || 0,
      "Overall Score": ((analysis.fundamental?.score || 0) + (analysis.sentiment?.score || 0)) / 2,
      Recommendation: analysis.recommendation || "N/A",
      Confidence: analysis.confidence || 0,
      "PE Ratio": analysis.fundamental?.details?.peRatio || "N/A",
      "Debt/Equity": analysis.fundamental?.details?.debtToEquity || "N/A",
      "Revenue Growth": analysis.fundamental?.details?.revenueGrowth || "N/A",
      "Call/Put Ratio": analysis.sentiment?.details?.callPutRatio || "N/A",
      "Short % of Float": analysis.sentiment?.details?.shortPercentOfFloat || "N/A",
    },
  ];

  exportToCSV(data, `analysis_${ticker}_${new Date().toISOString().split("T")[0]}.csv`);
}

/**
 * Exporter un score en CSV
 */
export function exportScoreToCSV(score, ticker) {
  if (!score) return;

  const data = [
    {
      Ticker: ticker,
      "Overall Score": score.overall || 0,
      "Options Score": score.breakdown?.options || 0,
      "Insiders Score": score.breakdown?.insiders || 0,
      "Dark Pool Score": score.breakdown?.darkPool || 0,
      "Short Interest Score": score.breakdown?.shortInterest || 0,
      "Greeks Score": score.breakdown?.greeks || 0,
      Recommendation: score.recommendation || "N/A",
      Confidence: score.confidence || 0,
    },
  ];

  exportToCSV(data, `score_${ticker}_${new Date().toISOString().split("T")[0]}.csv`);
}

/**
 * Exporter en PDF (utilise window.print() pour l'instant)
 * Pour une vraie exportation PDF, il faudrait utiliser une librairie comme jsPDF
 */
export function exportToPDF(elementId, filename = "export.pdf") {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with id ${elementId} not found`);
    return;
  }

  // Créer une nouvelle fenêtre pour l'impression
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>${filename}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}

/**
 * Formater les données pour l'export
 */
export function formatDataForExport(data, type = "analysis") {
  if (!data) return [];

  switch (type) {
    case "analysis":
      return [
        {
          "Fundamental Score": data.fundamental?.score || 0,
          "Sentiment Score": data.sentiment?.score || 0,
          Recommendation: data.recommendation || "N/A",
          Confidence: data.confidence || 0,
        },
      ];
    case "score":
      return [
        {
          "Overall Score": data.overall || 0,
          "Options": data.breakdown?.options || 0,
          "Insiders": data.breakdown?.insiders || 0,
          "Dark Pool": data.breakdown?.darkPool || 0,
          "Short Interest": data.breakdown?.shortInterest || 0,
          "Greeks": data.breakdown?.greeks || 0,
        },
      ];
    default:
      return [];
  }
}



