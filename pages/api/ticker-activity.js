/**
 * API Route: Ticker Activity
 * Récupère toutes les activités institutionnelles pour un ticker
 * 
 * GET /api/ticker-activity?symbol=TSLA
 */

import { tickerActivityService } from "/services/tickerActivityService";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { symbol } = req.query;

    if (!symbol) {
      return res.status(400).json({ error: "symbol parameter is required" });
    }

    const activity = await tickerActivityService.getTickerActivity(symbol.toUpperCase(), {
      includeInstitutions: true,
      includeHedgeFunds: true,
      includeInsiders: true,
      includeCongress: true,
      includeOptions: true,
      includeDarkPool: true,
      limit: 100,
    });

    return res.status(200).json({
      success: true,
      data: activity,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in /api/ticker-activity:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}





