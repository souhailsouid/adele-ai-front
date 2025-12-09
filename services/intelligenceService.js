/**
 * Service Intelligence - Logique métier pour les fonctionnalités d'intelligence
 * 
 * Encapsule les appels API et ajoute de la logique métier :
 * - Cache côté frontend
 * - Formatage des données
 * - Gestion d'erreurs
 * - Transformation des données pour l'affichage
 */

import intelligenceClient from "/lib/api/intelligenceClient";

class IntelligenceService {
  // Cache simple en mémoire (pourrait être amélioré avec localStorage)
  constructor() {
    this.cache = new Map();
    this.cacheTimeouts = {
      completeAnalysis: 10 * 60 * 1000, // 10 minutes
      tickerScore: 5 * 60 * 1000, // 5 minutes
      marketTide: 60 * 60 * 1000, // 1 heure
      sectorRotation: 60 * 60 * 1000, // 1 heure
      topFunds: 60 * 60 * 1000, // 1 heure
    };
  }

  /**
   * Obtenir une clé de cache
   */
  getCacheKey(type, ...params) {
    return `${type}_${params.join('_')}`;
  }

  /**
   * Vérifier si une donnée est en cache et valide
   */
  getCached(key, maxAge) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp < maxAge)) {
      return cached.data;
    }
    return null;
  }

  /**
   * Mettre en cache
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  // ==================== ANALYSE COMBINÉE ====================

  /**
   * Analyse complète avec cache
   */
  async getCompleteAnalysis(ticker, forceRefresh = false) {
    const cacheKey = this.getCacheKey('completeAnalysis', ticker);
    
    if (!forceRefresh) {
      const cached = this.getCached(cacheKey, this.cacheTimeouts.completeAnalysis);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await intelligenceClient.getCompleteAnalysis(ticker);
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data);
        return response.data;
      }
      throw new Error(response.error || "Erreur lors du chargement de l'analyse");
    } catch (error) {
      console.error(`[IntelligenceService] Error getting complete analysis for ${ticker}:`, error);
      throw error;
    }
  }

  /**
   * Détection de divergences
   */
  async getDivergenceAnalysis(ticker) {
    try {
      const response = await intelligenceClient.getDivergenceAnalysis(ticker);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Erreur lors du chargement de l'analyse de divergence");
    } catch (error) {
      console.error(`[IntelligenceService] Error getting divergence analysis for ${ticker}:`, error);
      throw error;
    }
  }

  /**
   * Valuation complète
   */
  async getComprehensiveValuation(ticker) {
    try {
      const response = await intelligenceClient.getComprehensiveValuation(ticker);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Erreur lors du chargement de la valuation");
    } catch (error) {
      console.error(`[IntelligenceService] Error getting valuation for ${ticker}:`, error);
      throw error;
    }
  }

  /**
   * Prédiction d'earnings
   */
  async getEarningsPrediction(ticker, earningsDate = null) {
    try {
      const response = await intelligenceClient.getEarningsPrediction(ticker, earningsDate);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Erreur lors du chargement de la prédiction");
    } catch (error) {
      console.error(`[IntelligenceService] Error getting earnings prediction for ${ticker}:`, error);
      throw error;
    }
  }

  /**
   * Analyse de risque
   */
  async getRiskAnalysis(ticker) {
    try {
      const response = await intelligenceClient.getRiskAnalysis(ticker);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Erreur lors du chargement de l'analyse de risque");
    } catch (error) {
      console.error(`[IntelligenceService] Error getting risk analysis for ${ticker}:`, error);
      throw error;
    }
  }

  // ==================== SCORING ====================

  /**
   * Score composite avec cache
   */
  async getTickerScore(ticker, forceRefresh = false) {
    const cacheKey = this.getCacheKey('tickerScore', ticker);
    
    if (!forceRefresh) {
      const cached = this.getCached(cacheKey, this.cacheTimeouts.tickerScore);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await intelligenceClient.getTickerScore(ticker);
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data);
        return response.data;
      }
      throw new Error(response.error || "Erreur lors du chargement du score");
    } catch (error) {
      console.error(`[IntelligenceService] Error getting ticker score for ${ticker}:`, error);
      throw error;
    }
  }

  /**
   * Breakdown détaillé
   */
  async getTickerBreakdown(ticker) {
    try {
      const response = await intelligenceClient.getTickerBreakdown(ticker);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Erreur lors du chargement du breakdown");
    } catch (error) {
      console.error(`[IntelligenceService] Error getting breakdown for ${ticker}:`, error);
      throw error;
    }
  }

  /**
   * Analyse gamma squeeze
   */
  async getGammaSqueezeAnalysis(ticker) {
    try {
      const response = await intelligenceClient.getGammaSqueezeAnalysis(ticker);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Erreur lors du chargement de l'analyse gamma squeeze");
    } catch (error) {
      console.error(`[IntelligenceService] Error getting gamma squeeze for ${ticker}:`, error);
      throw error;
    }
  }

  // ==================== MARKET ANALYSIS ====================

  /**
   * Market Tide avec cache
   */
  async getMarketTide(forceRefresh = false) {
    const cacheKey = this.getCacheKey('marketTide');
    
    if (!forceRefresh) {
      const cached = this.getCached(cacheKey, this.cacheTimeouts.marketTide);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await intelligenceClient.getMarketTide();
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data);
        return response.data;
      }
      throw new Error(response.error || "Erreur lors du chargement du market tide");
    } catch (error) {
      console.error(`[IntelligenceService] Error getting market tide:`, error);
      throw error;
    }
  }

  /**
   * Sector Rotation avec cache
   */
  async getSectorRotation(forceRefresh = false) {
    const cacheKey = this.getCacheKey('sectorRotation');
    
    if (!forceRefresh) {
      const cached = this.getCached(cacheKey, this.cacheTimeouts.sectorRotation);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await intelligenceClient.getSectorRotation();
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data);
        return response.data;
      }
      throw new Error(response.error || "Erreur lors du chargement de la rotation sectorielle");
    } catch (error) {
      console.error(`[IntelligenceService] Error getting sector rotation:`, error);
      throw error;
    }
  }

  // ==================== SMART MONEY ====================

  /**
   * Top hedge funds avec cache
   */
  async getTopHedgeFunds(period = '3M', forceRefresh = false) {
    const cacheKey = this.getCacheKey('topFunds', period);
    
    if (!forceRefresh) {
      const cached = this.getCached(cacheKey, this.cacheTimeouts.topFunds);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await intelligenceClient.getTopHedgeFunds(period);
      if (response.success && response.data) {
        this.setCache(cacheKey, response.data);
        return response.data;
      }
      throw new Error(response.error || "Erreur lors du chargement des hedge funds");
    } catch (error) {
      console.error(`[IntelligenceService] Error getting top hedge funds:`, error);
      throw error;
    }
  }

  /**
   * Copy trades
   */
  async getCopyTrades(institution, ticker) {
    try {
      const response = await intelligenceClient.getCopyTrades(institution, ticker);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Erreur lors du chargement des copy trades");
    } catch (error) {
      console.error(`[IntelligenceService] Error getting copy trades:`, error);
      throw error;
    }
  }

  /**
   * Institution tracking
   */
  async getInstitutionTracking(institutionName) {
    try {
      const response = await intelligenceClient.getInstitutionTracking(institutionName);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Erreur lors du chargement du tracking");
    } catch (error) {
      console.error(`[IntelligenceService] Error getting institution tracking:`, error);
      throw error;
    }
  }

  // ==================== SURVEILLANCE ====================

  /**
   * Liste des surveillances
   */
  async getSurveillances() {
    try {
      const response = await intelligenceClient.getSurveillances();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Erreur lors du chargement des surveillances");
    } catch (error) {
      console.error(`[IntelligenceService] Error getting surveillances:`, error);
      throw error;
    }
  }

  /**
   * Créer une surveillance
   */
  async createSurveillance(config) {
    try {
      const response = await intelligenceClient.createSurveillance(config);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || "Erreur lors de la création de la surveillance");
    } catch (error) {
      console.error(`[IntelligenceService] Error creating surveillance:`, error);
      throw error;
    }
  }

  /**
   * Récupérer les alertes d'une surveillance
   */
  async getSurveillanceAlerts(watchId) {
    try {
      const response = await intelligenceClient.getSurveillanceAlerts(watchId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Erreur lors du chargement des alertes");
    } catch (error) {
      console.error(`[IntelligenceService] Error getting surveillance alerts:`, error);
      throw error;
    }
  }

  /**
   * Supprimer une surveillance
   */
  async deleteSurveillance(watchId) {
    try {
      const response = await intelligenceClient.deleteSurveillance(watchId);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || "Erreur lors de la suppression");
    } catch (error) {
      console.error(`[IntelligenceService] Error deleting surveillance:`, error);
      throw error;
    }
  }

  /**
   * Déclencher manuellement la vérification d'une surveillance
   */
  async checkSurveillance(watchId) {
    try {
      const response = await intelligenceClient.checkSurveillance(watchId);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || "Erreur lors de la vérification");
    } catch (error) {
      console.error(`[IntelligenceService] Error checking surveillance:`, error);
      throw error;
    }
  }

  // ==================== ALERTES ====================

  /**
   * Liste des alertes
   */
  async getAlerts() {
    try {
      const response = await intelligenceClient.getAlerts();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Erreur lors du chargement des alertes");
    } catch (error) {
      console.error(`[IntelligenceService] Error getting alerts:`, error);
      throw error;
    }
  }

  /**
   * Créer une alerte
   */
  async createAlert(alertConfig) {
    try {
      const response = await intelligenceClient.createAlert(alertConfig);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || "Erreur lors de la création de l'alerte");
    } catch (error) {
      console.error(`[IntelligenceService] Error creating alert:`, error);
      throw error;
    }
  }

  // ==================== UTILITAIRES ====================

  /**
   * Formater une recommandation pour l'affichage
   */
  formatRecommendation(recommendation) {
    return recommendation?.replace('_', ' ') || 'N/A';
  }

  /**
   * Obtenir la couleur selon la recommandation
   */
  getRecommendationColor(recommendation) {
    switch (recommendation) {
      case 'STRONG_BUY':
        return 'success';
      case 'BUY':
        return 'info';
      case 'HOLD':
        return 'warning';
      case 'SELL':
        return 'error';
      case 'STRONG_SELL':
        return 'error';
      default:
        return 'text';
    }
  }

  /**
   * Obtenir l'icône selon la recommandation
   */
  getRecommendationIcon(recommendation) {
    switch (recommendation) {
      case 'STRONG_BUY':
      case 'BUY':
        return 'trending_up';
      case 'HOLD':
        return 'trending_flat';
      case 'SELL':
      case 'STRONG_SELL':
        return 'trending_down';
      default:
        return 'help';
    }
  }

  /**
   * Calculer le score global à partir du breakdown
   */
  calculateOverallScore(breakdown) {
    if (!breakdown) return 0;
    
    const weights = {
      options: 0.3,
      insiders: 0.2,
      darkPool: 0.2,
      shortInterest: 0.15,
      greeks: 0.15,
    };

    let total = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([key, weight]) => {
      if (breakdown[key] !== undefined) {
        total += breakdown[key] * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? Math.round(total / totalWeight) : 0;
  }
}

const intelligenceService = new IntelligenceService();
export default intelligenceService;

