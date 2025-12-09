/**
 * API Route: Ticker Analysis
 * Analyse complète d'un ticker avec tous les signaux
 * 
 * GET /api/aladdin/ticker-analysis?symbol=AAPL
 */

import { aladdinService } from "/services/aladdinService";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { symbol } = req.query;

    if (!symbol) {
      return res.status(400).json({ error: "symbol parameter is required" });
    }

    // Analyse complète du ticker
    const analysis = await aladdinService.getTickerAnalysis(symbol.toUpperCase());

    return res.status(200).json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in /api/aladdin/ticker-analysis:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}





