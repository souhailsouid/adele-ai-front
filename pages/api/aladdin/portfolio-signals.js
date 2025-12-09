/**
 * API Route: Portfolio Signals
 * Retourne les signaux agrégés pour un portefeuille de tickers
 * 
 * POST /api/aladdin/portfolio-signals
 * Body: { tickers: ["AAPL", "NVDA", ...] }
 */

import { aladdinService } from "/services/aladdinService";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { tickers } = req.body;

    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
      return res.status(400).json({ error: "tickers array is required" });
    }

    // Calculer les signaux pour chaque ticker
    const signals = await aladdinService.getPortfolioSignals(tickers);

    return res.status(200).json({
      success: true,
      data: signals,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in /api/aladdin/portfolio-signals:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}





