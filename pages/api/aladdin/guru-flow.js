/**
 * API Route: Guru Flow Detection
 * Détecte les mouvements institutionnels en temps réel
 * 
 * GET /api/aladdin/guru-flow?symbol=AAPL
 * POST /api/aladdin/guru-flow (body: { tickers: ["AAPL", "NVDA"] })
 */

import { institutionalFlowDetector } from "/services/institutionalFlowDetector";

export default async function handler(req, res) {
  if (req.method === "GET") {
    // Analyse d'un seul ticker
    const { symbol } = req.query;

    if (!symbol) {
      return res.status(400).json({ error: "symbol parameter is required" });
    }

    try {
      const detection = await institutionalFlowDetector.detectInstitutionalSelling(
        symbol.toUpperCase()
      );

      return res.status(200).json({
        success: true,
        data: detection,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in /api/aladdin/guru-flow:", error);
      return res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  } else if (req.method === "POST") {
    // Scan de plusieurs tickers
    const { tickers } = req.body;

    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
      return res.status(400).json({ error: "tickers array is required" });
    }

    try {
      const results = await institutionalFlowDetector.scanMultipleTickers(tickers);

      return res.status(200).json({
        success: true,
        data: results,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in /api/aladdin/guru-flow (POST):", error);
      return res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}





