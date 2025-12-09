/**
 * Service d'analyse financière pour analyser les états financiers
 * et calculer les ratios financiers (P/E, etc.)
 */

import fmpUWClient from "/lib/api/fmpUnusualWhalesClient";

export class FinancialAnalysisService {
  /**
   * Analyser les états financiers d'une entreprise
   * @param {string} symbol - Symbole boursier
   * @param {string} period - "annual" ou "quarter"
   * @param {number} limit - Nombre de périodes
   */
  async analyzeFinancialStatements(symbol, period = "annual", limit = 5) {
    try {
      const [incomeStatements, quote, profile, ratios] = await Promise.all([
        fmpUWClient.getFMPIncomeStatement(symbol, period, limit).catch(() => []),
        fmpUWClient.getFMPQuote(symbol).catch(() => null),
        fmpUWClient.getFMPCompanyProfile(symbol).catch(() => null),
        fmpUWClient.getFMPRatios(symbol, period, limit).catch(() => []),
      ]);

      if (!incomeStatements || incomeStatements.length === 0) {
        throw new Error(`Aucun état financier trouvé pour ${symbol}`);
      }

      // Calculer les ratios et métriques
      const analysis = {
        symbol,
        companyName: profile?.companyName || symbol,
        currentPrice: quote?.price || null,
        marketCap: profile?.mktCap || quote?.marketCap || null,
        
        // États financiers
        incomeStatements: incomeStatements.map((stmt) => ({
          date: stmt.date || stmt.calendarYear,
          revenue: stmt.revenue || 0,
          netIncome: stmt.netIncome || 0,
          operatingIncome: stmt.operatingIncome || 0,
          costOfRevenue: stmt.costOfRevenue || 0,
          grossProfit: stmt.grossProfit || 0,
          ebitda: stmt.ebitda || 0,
          eps: stmt.eps || 0,
          epsDiluted: stmt.epsDiluted || 0,
        })),

        // Évolution des métriques
        revenueGrowth: this.calculateGrowthRate(
          incomeStatements,
          "revenue"
        ),
        netIncomeGrowth: this.calculateGrowthRate(
          incomeStatements,
          "netIncome"
        ),
        costGrowth: this.calculateGrowthRate(
          incomeStatements,
          "costOfRevenue"
        ),
        grossProfitMargin: this.calculateProfitMargin(
          incomeStatements,
          "grossProfit",
          "revenue"
        ),
        netProfitMargin: this.calculateProfitMargin(
          incomeStatements,
          "netIncome",
          "revenue"
        ),

        // Ratios financiers
        peRatio: this.calculatePERatio(quote, incomeStatements[0]),
        peRatioTTM: this.calculatePERatioTTM(quote, incomeStatements),
        priceToSales: this.calculatePriceToSales(quote, incomeStatements[0]),
        priceToBook: this.getRatioFromData(ratios, "priceToBookRatio"),
        debtToEquity: this.getRatioFromData(ratios, "debtEquityRatio"),
        roe: this.getRatioFromData(ratios, "returnOnEquity"),
        roa: this.getRatioFromData(ratios, "returnOnAssets"),
        currentRatio: this.getRatioFromData(ratios, "currentRatio"),

        // Tendances
        trends: this.analyzeTrends(incomeStatements),
      };

      return analysis;
    } catch (error) {
      console.error(`Error analyzing financial statements for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Comparer plusieurs entreprises
   * @param {Array<string>} symbols - Liste des symboles à comparer
   */
  async compareCompanies(symbols) {
    try {
      const analyses = await Promise.all(
        symbols.map((symbol) =>
          this.analyzeFinancialStatements(symbol).catch((err) => {
            console.error(`Error analyzing ${symbol}:`, err);
            return null;
          })
        )
      );

      // Filtrer les nulls
      const validAnalyses = analyses.filter((a) => a !== null);

      // Créer un tableau comparatif
      const comparison = {
        companies: validAnalyses.map((analysis) => ({
          symbol: analysis.symbol,
          companyName: analysis.companyName,
          currentPrice: analysis.currentPrice,
          marketCap: analysis.marketCap,
          peRatio: analysis.peRatio,
          peRatioTTM: analysis.peRatioTTM,
          priceToSales: analysis.priceToSales,
          revenueGrowth: analysis.revenueGrowth,
          netIncomeGrowth: analysis.netIncomeGrowth,
          grossProfitMargin: analysis.grossProfitMargin[analysis.grossProfitMargin.length - 1],
          netProfitMargin: analysis.netProfitMargin[analysis.netProfitMargin.length - 1],
          roe: analysis.roe,
          roa: analysis.roa,
        })),
        timestamp: new Date().toISOString(),
      };

      return comparison;
    } catch (error) {
      console.error("Error comparing companies:", error);
      throw error;
    }
  }

  /**
   * Identifier les opportunités d'investissement basées sur les ratios
   * @param {Array<string>} symbols - Liste des symboles à analyser
   */
  async findInvestmentOpportunities(symbols) {
    try {
      const analyses = await Promise.all(
        symbols.map((symbol) =>
          this.analyzeFinancialStatements(symbol).catch(() => null)
        )
      );

      const validAnalyses = analyses.filter((a) => a !== null);

      // Calculer un score d'opportunité pour chaque entreprise
      const opportunities = validAnalyses.map((analysis) => {
        const score = this.calculateOpportunityScore(analysis);
        return {
          ...analysis,
          opportunityScore: score,
        };
      });

      // Trier par score (les meilleures opportunités en premier)
      return opportunities.sort(
        (a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0)
      );
    } catch (error) {
      console.error("Error finding investment opportunities:", error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Calculer le taux de croissance d'une métrique
   */
  calculateGrowthRate(statements, metric) {
    if (!statements || statements.length < 2) return [];

    const growthRates = [];
    for (let i = 0; i < statements.length - 1; i++) {
      const current = statements[i][metric] || 0;
      const previous = statements[i + 1][metric] || 0;

      if (previous === 0) {
        growthRates.push(0);
      } else {
        const growth = ((current - previous) / Math.abs(previous)) * 100;
        growthRates.push(growth);
      }
    }

    return growthRates;
  }

  /**
   * Calculer la marge de profit
   */
  calculateProfitMargin(statements, profitMetric, revenueMetric) {
    return statements.map((stmt) => {
      const revenue = stmt[revenueMetric] || 0;
      const profit = stmt[profitMetric] || 0;

      if (revenue === 0) return 0;
      return (profit / revenue) * 100;
    });
  }

  /**
   * Calculer le ratio P/E (Price-to-Earnings)
   */
  calculatePERatio(quote, incomeStatement) {
    if (!quote || !quote.price || !incomeStatement) return null;

    const eps = incomeStatement.eps || incomeStatement.epsDiluted || 0;
    if (eps === 0) return null;

    return quote.price / eps;
  }

  /**
   * Calculer le ratio P/E TTM (Trailing Twelve Months)
   */
  calculatePERatioTTM(quote, incomeStatements) {
    if (!quote || !quote.price || !incomeStatements || incomeStatements.length === 0) {
      return null;
    }

    // Pour annual, prendre les 4 dernières années
    // Pour quarter, prendre les 4 derniers trimestres
    const periods = incomeStatements.slice(0, 4);
    const totalEps = periods.reduce((sum, stmt) => {
      return sum + (stmt.eps || stmt.epsDiluted || 0);
    }, 0);

    if (totalEps === 0) return null;

    return quote.price / totalEps;
  }

  /**
   * Calculer le ratio Price-to-Sales
   */
  calculatePriceToSales(quote, incomeStatement) {
    if (!quote || !quote.price || !incomeStatement) return null;

    const revenue = incomeStatement.revenue || 0;
    if (revenue === 0) return null;

    // Market cap / Revenue
    const marketCap = quote.marketCap || quote.mktCap || 0;
    if (marketCap > 0) {
      return marketCap / revenue;
    }

    // Si pas de market cap, on ne peut pas calculer
    return null;
  }

  /**
   * Extraire un ratio depuis les données de ratios
   */
  getRatioFromData(ratios, ratioName) {
    if (!ratios || ratios.length === 0) return null;

    const latest = ratios[0];
    return latest[ratioName] || null;
  }

  /**
   * Analyser les tendances
   */
  analyzeTrends(statements) {
    if (!statements || statements.length < 2) {
      return {
        revenue: "insufficient_data",
        netIncome: "insufficient_data",
        profitability: "insufficient_data",
      };
    }

    const revenueTrend = this.getTrend(
      statements.map((s) => s.revenue || 0)
    );
    const netIncomeTrend = this.getTrend(
      statements.map((s) => s.netIncome || 0)
    );

    // Analyser la profitabilité
    const margins = statements.map((s) => {
      const revenue = s.revenue || 0;
      const netIncome = s.netIncome || 0;
      return revenue > 0 ? (netIncome / revenue) * 100 : 0;
    });

    const profitabilityTrend = this.getTrend(margins);

    return {
      revenue: revenueTrend,
      netIncome: netIncomeTrend,
      profitability: profitabilityTrend,
    };
  }

  /**
   * Déterminer la tendance d'une série de valeurs
   */
  getTrend(values) {
    if (values.length < 2) return "insufficient_data";

    const first = values[values.length - 1]; // Plus ancien
    const last = values[0]; // Plus récent

    if (first === 0) return "insufficient_data";

    const change = ((last - first) / Math.abs(first)) * 100;

    if (change > 10) return "strong_growth";
    if (change > 5) return "moderate_growth";
    if (change > -5) return "stable";
    if (change > -10) return "moderate_decline";
    return "strong_decline";
  }

  /**
   * Calculer un score d'opportunité d'investissement
   */
  calculateOpportunityScore(analysis) {
    let score = 50; // Score de base

    // P/E ratio (plus bas = mieux, mais pas trop bas)
    if (analysis.peRatio) {
      if (analysis.peRatio > 0 && analysis.peRatio < 15) score += 15;
      else if (analysis.peRatio >= 15 && analysis.peRatio < 25) score += 10;
      else if (analysis.peRatio >= 25 && analysis.peRatio < 35) score += 5;
      else if (analysis.peRatio >= 35) score -= 10;
    }

    // Croissance des revenus
    if (analysis.revenueGrowth && analysis.revenueGrowth.length > 0) {
      const avgGrowth = analysis.revenueGrowth.reduce((a, b) => a + b, 0) / analysis.revenueGrowth.length;
      if (avgGrowth > 20) score += 20;
      else if (avgGrowth > 10) score += 15;
      else if (avgGrowth > 5) score += 10;
      else if (avgGrowth < 0) score -= 15;
    }

    // Croissance du bénéfice net
    if (analysis.netIncomeGrowth && analysis.netIncomeGrowth.length > 0) {
      const avgGrowth = analysis.netIncomeGrowth.reduce((a, b) => a + b, 0) / analysis.netIncomeGrowth.length;
      if (avgGrowth > 20) score += 15;
      else if (avgGrowth > 10) score += 10;
      else if (avgGrowth < 0) score -= 10;
    }

    // Marge de profit nette
    if (analysis.netProfitMargin && analysis.netProfitMargin.length > 0) {
      const latestMargin = analysis.netProfitMargin[analysis.netProfitMargin.length - 1];
      if (latestMargin > 20) score += 15;
      else if (latestMargin > 10) score += 10;
      else if (latestMargin > 5) score += 5;
      else if (latestMargin < 0) score -= 20;
    }

    // ROE (Return on Equity)
    if (analysis.roe) {
      if (analysis.roe > 20) score += 10;
      else if (analysis.roe > 15) score += 5;
      else if (analysis.roe < 5) score -= 5;
    }

    // Tendances
    if (analysis.trends) {
      if (analysis.trends.revenue === "strong_growth") score += 10;
      else if (analysis.trends.revenue === "strong_decline") score -= 15;

      if (analysis.trends.netIncome === "strong_growth") score += 10;
      else if (analysis.trends.netIncome === "strong_decline") score -= 15;
    }

    return Math.min(Math.max(score, 0), 100);
  }
}

export const financialAnalysisService = new FinancialAnalysisService();
export default financialAnalysisService;

