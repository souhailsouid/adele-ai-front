/**
 * API Route: Opportunities Scanner
 * Scan l'univers pour trouver des opportunités selon différents setups
 * 
 * GET /api/aladdin/opportunities?strategy=squeeze&limit=20
 */

import { aladdinService } from "/services/aladdinService";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { strategy = "all", limit = 20, sector, minMarketCap } = req.query;

    // Scanner les opportunités
    const opportunities = await aladdinService.scanOpportunities({
      strategy,
      limit: parseInt(limit),
      sector,
      minMarketCap: minMarketCap ? parseFloat(minMarketCap) : undefined,
    });

    return res.status(200).json({
      success: true,
      data: opportunities,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in /api/aladdin/opportunities:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}





