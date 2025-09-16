/**
 * RefugeeWatch AI - Data Aggregator Service
 * 
 * Combines real-time data from all sources (Conflict, Economic, Climate, News)
 * Creates unified crisis assessments for AI analysis
 * 
 * @author RefugeeWatch AI Team
 * @version 1.0.0
 */

const moment = require('moment');
const logger = require('../../utils/logger');

// Import all data services
const ConflictDataService = require('../data/conflictData');
const EconomicDataService = require('../data/economicData');
const ClimateDataService = require('../data/climateData');
const NewsDataService = require('../data/newsData');

// Country coordinates for climate data
const COUNTRY_COORDINATES = {
  'Sudan': { lat: 15.5007, lon: 32.5599, code: 'SDN' },
  'Myanmar': { lat: 21.9162, lon: 95.9560, code: 'MMR' },
  'Syria': { lat: 34.8021, lon: 38.9968, code: 'SYR' },
  'Yemen': { lat: 15.5527, lon: 48.5164, code: 'YEM' },
  'Afghanistan': { lat: 33.9391, lon: 67.7100, code: 'AFG' },
  'Bangladesh': { lat: 23.6850, lon: 90.3563, code: 'BGD' },
  'Ethiopia': { lat: 9.1450, lon: 40.4897, code: 'ETH' },
  'Chad': { lat: 15.4542, lon: 18.7322, code: 'TCD' },
  'Iraq': { lat: 33.2232, lon: 43.6793, code: 'IRQ' },
  'Somalia': { lat: 5.1521, lon: 46.1996, code: 'SOM' }
};

/**
 * Data Aggregator Service Class
 */
class DataAggregatorService {
  constructor() {
    this.conflictService = new ConflictDataService();
    this.economicService = new EconomicDataService();
    this.climateService = new ClimateDataService();
    this.newsService = new NewsDataService();
    
    this.cache = new Map();
    this.lastUpdate = null;
    this.updateInterval = parseInt(process.env.UPDATE_INTERVAL) || 300000; // 5 minutes
  }

  /**
   * Get comprehensive crisis assessment for a country
   * @param {string} country - Country name
   * @returns {Promise<Object>} Complete crisis assessment
   */
  async getComprehensiveCrisisAssessment(country) {
    try {
      const startTime = Date.now();
      
      logger.info(`🔄 Starting comprehensive crisis assessment for ${country}`);
      
      // Get country coordinates and code
      const countryInfo = COUNTRY_COORDINATES[country];
      if (!countryInfo) {
        throw new Error(`Country coordinates not found for ${country}`);
      }
      
      // Parallel data collection from all sources
      const [
        conflictResult,
        economicResult,
        climateResult,
        newsResult
      ] = await Promise.allSettled([
        this.conflictService.getCountryConflictData(country, 14),
        this.economicService.getCountryEconomicData(countryInfo.code, 3),
        this.climateService.getCountryClimateData(country, countryInfo.lat, countryInfo.lon),
        this.newsService.getCountryNewsAnalysis(country, 7)
      ]);
      
      // Extract data or use empty defaults
      const conflictData = conflictResult.status === 'fulfilled' ? conflictResult.value : {};
      const economicData = economicResult.status === 'fulfilled' ? economicResult.value : {};
      const climateData = climateResult.status === 'fulfilled' ? climateResult.value : {};
      const newsData = newsResult.status === 'fulfilled' ? newsResult.value : {};
      
      // Aggregate and analyze all data
      const assessment = this.aggregateDataSources({
        conflict: conflictData,
        economic: economicData,
        climate: climateData,
        news: newsData
      }, country);
      
      const duration = Date.now() - startTime;
      
      // Cache the assessment
      this.cache.set(`assessment_${country}`, {
        data: assessment,
        timestamp: moment()
      });
      
      logger.info(`✅ Crisis assessment completed for ${country} (${duration}ms)`, {
        overallRisk: assessment.overallRisk,
        confidence: assessment.confidence,
        dataQuality: assessment.dataQuality
      });
      
      return assessment;
      
    } catch (error) {
      logger.error(`❌ Crisis assessment failed for ${country}:`, error.message);
      
      // Return cached data if available
      const cached = this.getCachedData(`assessment_${country}`, 6);
      if (cached) {
        logger.warn(`Using cached assessment for ${country}`);
        return cached;
      }
      
      return this.getEmptyAssessment(country);
    }
  }

  /**
   * Aggregate data from all sources into unified assessment
   * @param {Object} data - Data from all sources
   * @param {string} country - Country name
   * @returns {Object} Unified crisis assessment
   */
  aggregateDataSources(data, country) {
    const assessment = {
      country,
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      overallRisk: 'LOW',
      confidence: 0.7,
      dataQuality: 'GOOD',
      
      // Individual source assessments
      sources: {
        conflict: this.normalizeConflictData(data.conflict),
        economic: this.normalizeEconomicData(data.economic),
        climate: this.normalizeClimateData(data.climate),
        news: this.normalizeNewsData(data.news)
      },
      
      // Unified analysis
      riskFactors: [],
      protectiveFactors: [],
      immediateThreats: [],
      emergingConcerns: [],
      
      // Displacement prediction
      displacementRisk: {
        level: 'LOW',
        confidence: 0.6,
        timeline: '6+ months',
        estimatedNumbers: 0,
        primaryCauses: [],
        likelyDestinations: [],
        triggerEvents: []
      },
      
      // Trend analysis
      trends: {
        overall: 'stable',
        conflict: 'stable',
        economic: 'stable',
        climate: 'stable',
        news: 'stable'
      },
      
      // Data quality metrics
      dataAvailability: {
        conflict: true,
        economic: true,
        climate: true,
        news: true
      }
    };

    // Calculate unified risk assessment
    this.calculateUnifiedRisk(assessment);
    
    // Calculate displacement risk
    this.calculateDisplacementRisk(assessment);
    
    // Analyze trends
    this.analyzeTrends(assessment);
    
    // Determine data quality
    this.assessDataQuality(assessment);
    
    return assessment;
  }

  /**
   * Normalize conflict data to standard format
   * @param {Object} conflictData - Raw conflict data
   * @returns {Object} Normalized conflict data
   */
  normalizeConflictData(conflictData) {
    if (!conflictData || Object.keys(conflictData).length === 0) {
      return {
        riskLevel: 'UNKNOWN',
        confidence: 0.3,
        score: 0,
        indicators: ['No conflict data available'],
        available: false
      };
    }
    
    return {
      riskLevel: conflictData.conflictLevel || 'LOW',
      confidence: conflictData.confidence || 0.5,
      score: conflictData.intensityScore || 0,
      indicators: conflictData.threatIndicators || [],
      recentEvents: conflictData.recentEvents || [],
      trends: conflictData.trends || { stable: true },
      available: true
    };
  }

  /**
   * Normalize economic data to standard format
   * @param {Object} economicData - Raw economic data
   * @returns {Object} Normalized economic data
   */
  normalizeEconomicData(economicData) {
    if (!economicData || !economicData.displacementRisk) {
      return {
        riskLevel: 'UNKNOWN',
        confidence: 0.3,
        score: 0,
        indicators: ['No economic data available'],
        available: false
      };
    }
    
    const risk = economicData.displacementRisk;
    return {
      riskLevel: risk.riskLevel || 'LOW',
      confidence: risk.confidence || 0.5,
      score: risk.riskScore || 0,
      indicators: risk.riskFactors || [],
      stability: economicData.analysis?.overallStability || 'UNKNOWN',
      trends: economicData.analysis?.trends || {},
      available: true
    };
  }

  /**
   * Normalize climate data to standard format
   * @param {Object} climateData - Raw climate data
   * @returns {Object} Normalized climate data
   */
  normalizeClimateData(climateData) {
    if (!climateData || !climateData.displacementRisk) {
      return {
        riskLevel: 'UNKNOWN',
        confidence: 0.3,
        score: 0,
        indicators: ['No climate data available'],
        available: false
      };
    }
    
    const risk = climateData.displacementRisk;
    return {
      riskLevel: risk.riskLevel || 'LOW',
      confidence: risk.confidence || 0.5,
      score: risk.estimatedAffected || 0,
      indicators: risk.factors || [],
      hazards: climateData.activeHazards || [],
      trends: climateData.climateTrends || {},
      available: true
    };
  }

  /**
   * Normalize news data to standard format
   * @param {Object} newsData - Raw news data
   * @returns {Object} Normalized news data
   */
  normalizeNewsData(newsData) {
    if (!newsData || newsData.crisisLevel === undefined) {
      return {
        riskLevel: 'UNKNOWN',
        confidence: 0.3,
        score: 0,
        indicators: ['No news data available'],
        available: false
      };
    }
    
    return {
      riskLevel: newsData.crisisLevel || 'LOW',
      confidence: newsData.confidence || 0.5,
      score: newsData.urgencyScore || 0,
      indicators: newsData.keyIndicators || [],
      sentiment: newsData.sentiment || 'neutral',
      mediaAttention: newsData.mediaAttention || 'low',
      breakingNews: newsData.breakingNews || [],
      available: true
    };
  }

  /**
   * Calculate unified risk assessment
   * @param {Object} assessment - Assessment object to update
   */
  calculateUnifiedRisk(assessment) {
    const sources = assessment.sources;
    let totalRiskScore = 0;
    let validSources = 0;
    let riskLevels = [];

    // Convert risk levels to numeric scores for calculation
    const riskToScore = {
      'CRITICAL': 100,
      'HIGH': 75,
      'MEDIUM': 50,
      'LOW': 25,
      'UNKNOWN': 0
    };

    const scoreToRisk = {
      100: 'CRITICAL',
      75: 'HIGH', 
      50: 'MEDIUM',
      25: 'LOW',
      0: 'UNKNOWN'
    };

    // Weight different sources based on reliability and immediacy
    const sourceWeights = {
      conflict: 0.35,  // Highest weight - most direct indicator
      news: 0.25,      // High weight - real-time developments
      economic: 0.25,  // High weight - underlying causes
      climate: 0.15    // Lower weight - longer-term factors
    };

    Object.entries(sources).forEach(([source, data]) => {
      if (data.available && data.riskLevel !== 'UNKNOWN') {
        const score = riskToScore[data.riskLevel] || 0;
        const weight = sourceWeights[source] || 0.25;
        
        totalRiskScore += score * weight;
        validSources++;
        riskLevels.push(data.riskLevel);
        
        // Add source-specific risk factors
        if (data.indicators && data.indicators.length > 0) {
          assessment.riskFactors.push(...data.indicators.map(indicator => ({
            source,
            factor: indicator,
            severity: data.riskLevel
          })));
        }
      }
    });

    // Calculate overall risk level
    if (validSources > 0) {
      // Adjust for missing sources
      const completenessMultiplier = validSources / 4;
      totalRiskScore *= completenessMultiplier;
      
      // Determine overall risk level
      if (totalRiskScore >= 80) {
        assessment.overallRisk = 'CRITICAL';
        assessment.confidence = Math.min(0.95, 0.7 + (validSources * 0.06));
      } else if (totalRiskScore >= 60) {
        assessment.overallRisk = 'HIGH';
        assessment.confidence = Math.min(0.9, 0.65 + (validSources * 0.06));
      } else if (totalRiskScore >= 40) {
        assessment.overallRisk = 'MEDIUM';
        assessment.confidence = Math.min(0.85, 0.6 + (validSources * 0.06));
      } else if (totalRiskScore >= 20) {
        assessment.overallRisk = 'LOW';
        assessment.confidence = Math.min(0.8, 0.55 + (validSources * 0.06));
      } else {
        assessment.overallRisk = 'MINIMAL';
        assessment.confidence = Math.min(0.75, 0.5 + (validSources * 0.06));
      }
      
      // Check for critical alerts (any source reporting CRITICAL)
      if (riskLevels.includes('CRITICAL')) {
        assessment.overallRisk = 'CRITICAL';
        assessment.immediateThreats.push('Critical alert from one or more monitoring sources');
      }
      
    } else {
      assessment.overallRisk = 'UNKNOWN';
      assessment.confidence = 0.3;
    }

    // Identify protective factors
    Object.entries(sources).forEach(([source, data]) => {
      if (data.available && data.riskLevel === 'LOW') {
        if (source === 'economic' && data.stability === 'STABLE') {
          assessment.protectiveFactors.push('Economic stability maintained');
        }
        if (source === 'conflict' && data.trends?.stable) {
          assessment.protectiveFactors.push('Conflict situation stable');
        }
        if (source === 'news' && data.sentiment === 'positive') {
          assessment.protectiveFactors.push('Positive media sentiment');
        }
      }
    });
  }

  /**
   * Calculate displacement risk prediction
   * @param {Object} assessment - Assessment object to update
   */
  calculateDisplacementRisk(assessment) {
    const sources = assessment.sources;
    let displacementFactors = [];
    let estimatedNumbers = 0;
    let timelineFactors = [];
    let destinations = new Set();
    let triggers = [];

    // Analyze each source for displacement indicators
    Object.entries(sources).forEach(([source, data]) => {
      if (!data.available) return;

      switch (source) {
        case 'conflict':
          if (data.riskLevel === 'CRITICAL' || data.riskLevel === 'HIGH') {
            displacementFactors.push(`Armed conflict escalation (${data.riskLevel})`);
            estimatedNumbers += data.score * 500; // Rough multiplier
            timelineFactors.push('immediate');
            triggers.push('Armed conflict escalation');
          }
          break;

        case 'economic':
          if (data.riskLevel === 'CRITICAL' || data.riskLevel === 'HIGH') {
            displacementFactors.push(`Economic crisis (${data.riskLevel})`);
            estimatedNumbers += data.score * 300;
            timelineFactors.push('short-term');
            triggers.push('Economic collapse');
          }
          break;

        case 'climate':
          if (data.hazards && data.hazards.length > 0) {
            data.hazards.forEach(hazard => {
              if (hazard.severity === 'CRITICAL') {
                displacementFactors.push(`Climate disaster: ${hazard.type}`);
                estimatedNumbers += 10000; // Base estimate for climate disasters
                timelineFactors.push('immediate');
                triggers.push(hazard.type);
              }
            });
          }
          break;

        case 'news':
          if (data.riskLevel === 'CRITICAL' && data.breakingNews.length > 0) {
            displacementFactors.push('Breaking news indicates crisis escalation');
            timelineFactors.push('immediate');
            triggers.push('Media reports of crisis escalation');
          }
          break;
      }
    });

    // Determine overall displacement risk
    if (displacementFactors.length >= 3 || triggers.includes('Armed conflict escalation')) {
      assessment.displacementRisk.level = 'CRITICAL';
      assessment.displacementRisk.confidence = 0.9;
      assessment.displacementRisk.timeline = '1-4 weeks';
    } else if (displacementFactors.length >= 2) {
      assessment.displacementRisk.level = 'HIGH';
      assessment.displacementRisk.confidence = 0.8;
      assessment.displacementRisk.timeline = '1-3 months';
    } else if (displacementFactors.length >= 1) {
      assessment.displacementRisk.level = 'MEDIUM';
      assessment.displacementRisk.confidence = 0.7;
      assessment.displacementRisk.timeline = '3-6 months';
    } else {
      assessment.displacementRisk.level = 'LOW';
      assessment.displacementRisk.confidence = 0.6;
      assessment.displacementRisk.timeline = '6+ months';
    }

    // Set displacement predictions
    assessment.displacementRisk.estimatedNumbers = Math.round(estimatedNumbers);
    assessment.displacementRisk.primaryCauses = displacementFactors.slice(0, 3);
    assessment.displacementRisk.triggerEvents = triggers.slice(0, 3);
    
    // Predict likely destinations (simplified)
    assessment.displacementRisk.likelyDestinations = this.predictDestinations(assessment.country);
  }

  /**
   * Predict likely destination countries
   * @param {string} country - Origin country
   * @returns {Array} Likely destination countries
   */
  predictDestinations(country) {
    const destinationMap = {
      'Sudan': ['Chad', 'Egypt', 'Ethiopia', 'South Sudan'],
      'Myanmar': ['Bangladesh', 'Thailand', 'India', 'Malaysia'],
      'Syria': ['Turkey', 'Lebanon', 'Jordan', 'Germany'],
      'Yemen': ['Saudi Arabia', 'Oman', 'Djibouti', 'Somalia'],
      'Afghanistan': ['Pakistan', 'Iran', 'Turkey', 'Tajikistan'],
      'Bangladesh': ['India', 'Myanmar', 'Internal displacement'],
      'Ethiopia': ['Sudan', 'Kenya', 'Djibouti', 'Somalia'],
      'Chad': ['Cameroon', 'Central African Republic', 'Niger'],
      'Iraq': ['Turkey', 'Iran', 'Jordan', 'Syria'],
      'Somalia': ['Kenya', 'Ethiopia', 'Yemen', 'Uganda']
    };
    
    return destinationMap[country] || ['Neighboring countries', 'Regional destinations'];
  }

  /**
   * Analyze trends across all sources
   * @param {Object} assessment - Assessment object to update
   */
  analyzeTrends(assessment) {
    const sources = assessment.sources;
    
    // Determine overall trend
    let increasingCount = 0;
    let decreasingCount = 0;
    let stableCount = 0;

    Object.entries(sources).forEach(([source, data]) => {
      if (!data.available) return;

      let trend = 'stable';
      
      if (source === 'conflict' && data.trends) {
        trend = data.trends.increasing ? 'increasing' : 
               data.trends.decreasing ? 'decreasing' : 'stable';
      } else if (source === 'economic' && data.trends) {
        // Analyze economic trend indicators
        const economicTrends = Object.values(data.trends);
        if (economicTrends.some(t => t && t.trend === 'decreasing')) {
          trend = 'worsening'; // Economic indicators getting worse
        }
      } else if (source === 'news') {
        trend = data.score > 50 ? 'increasing' : 'stable';
      }
      
      assessment.trends[source] = trend;
      
      if (trend === 'increasing' || trend === 'worsening') {
        increasingCount++;
      } else if (trend === 'decreasing' || trend === 'improving') {
        decreasingCount++;
      } else {
        stableCount++;
      }
    });

    // Determine overall trend
    if (increasingCount >= 2) {
      assessment.trends.overall = 'deteriorating';
      assessment.emergingConcerns.push('Multiple indicators showing negative trends');
    } else if (decreasingCount >= 2) {
      assessment.trends.overall = 'improving';
      assessment.protectiveFactors.push('Multiple indicators showing positive trends');
    } else {
      assessment.trends.overall = 'stable';
    }
  }

  /**
   * Assess data quality and availability
   * @param {Object} assessment - Assessment object to update
   */
  assessDataQuality(assessment) {
    const sources = assessment.sources;
    let availableCount = 0;
    let totalSources = 4;

    Object.entries(sources).forEach(([source, data]) => {
      assessment.dataAvailability[source] = data.available;
      if (data.available) {
        availableCount++;
      }
    });

    const completeness = availableCount / totalSources;
    
    if (completeness >= 0.75) {
      assessment.dataQuality = 'EXCELLENT';
    } else if (completeness >= 0.5) {
      assessment.dataQuality = 'GOOD';
    } else if (completeness >= 0.25) {
      assessment.dataQuality = 'FAIR';
    } else {
      assessment.dataQuality = 'POOR';
    }

    // Adjust confidence based on data quality
    assessment.confidence *= completeness;
  }

  /**
   * Get multi-country crisis monitoring
   * @param {Array} countries - Countries to monitor
   * @returns {Promise<Array>} Multi-country assessments
   */
  async getMultiCountryCrisisMonitoring(countries) {
    try {
      const startTime = Date.now();
      logger.info(`🌍 Starting multi-country crisis monitoring for ${countries.length} countries`);
      
      const assessments = [];
      
      for (const country of countries) {
        try {
          const assessment = await this.getComprehensiveCrisisAssessment(country);
          assessments.push(assessment);
          
          // Small delay between countries to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          logger.warn(`Failed to assess ${country}: ${error.message}`);
          assessments.push(this.getEmptyAssessment(country));
        }
      }
      
      // Sort by overall risk level
      assessments.sort((a, b) => {
        const riskOrder = { 'CRITICAL': 5, 'HIGH': 4, 'MEDIUM': 3, 'LOW': 2, 'MINIMAL': 1, 'UNKNOWN': 0 };
        return (riskOrder[b.overallRisk] || 0) - (riskOrder[a.overallRisk] || 0);
      });
      
      const duration = Date.now() - startTime;
      logger.info(`✅ Multi-country monitoring completed (${duration}ms)`, {
        countries: countries.length,
        critical: assessments.filter(a => a.overallRisk === 'CRITICAL').length,
        high: assessments.filter(a => a.overallRisk === 'HIGH').length
      });
      
      return assessments;
      
    } catch (error) {
      logger.error('Multi-country crisis monitoring failed:', error.message);
      return [];
    }
  }

  /**
   * Get empty assessment structure
   * @param {string} country - Country name
   * @returns {Object} Empty assessment
   */
  getEmptyAssessment(country) {
    return {
      country,
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      overallRisk: 'UNKNOWN',
      confidence: 0.3,
      dataQuality: 'POOR',
      sources: {
        conflict: { riskLevel: 'UNKNOWN', available: false },
        economic: { riskLevel: 'UNKNOWN', available: false },
        climate: { riskLevel: 'UNKNOWN', available: false },
        news: { riskLevel: 'UNKNOWN', available: false }
      },
      riskFactors: ['Insufficient data for assessment'],
      protectiveFactors: [],
      immediateThreats: [],
      emergingConcerns: ['Data collection issues'],
      displacementRisk: {
        level: 'UNKNOWN',
        confidence: 0.3,
        timeline: 'Unknown',
        estimatedNumbers: 0,
        primaryCauses: ['Data unavailable'],
        likelyDestinations: [],
        triggerEvents: []
      },
      trends: {
        overall: 'unknown',
        conflict: 'unknown',
        economic: 'unknown',
        climate: 'unknown',
        news: 'unknown'
      },
      dataAvailability: {
        conflict: false,
        economic: false,
        climate: false,
        news: false
      }
    };
  }

  /**
   * Get cached data if available and fresh
   * @param {string} key - Cache key
   * @param {number} maxAgeHours - Maximum age in hours
   * @returns {Object|null} Cached data or null
   */
  getCachedData(key, maxAgeHours = 1) {
    const cached = this.cache.get(key);
    if (cached && moment().diff(cached.timestamp, 'hours') < maxAgeHours) {
      return cached.data;
    }
    return null;
  }

  /**
   * Clear all caches
   */
  clearAllCaches() {
    this.cache.clear();
    this.conflictService.clearCache();
    this.economicService.clearCache();
    this.climateService.clearCache();
    this.newsService.clearCache();
    logger.info('All data caches cleared');
  }

  /**
   * Get system status
   * @returns {Object} System status
   */
  getSystemStatus() {
    return {
      status: 'operational',
      lastUpdate: this.lastUpdate,
      cacheSize: this.cache.size,
      updateInterval: this.updateInterval,
      dataSources: {
        conflict: 'GDELT',
        economic: 'World Bank',
        climate: 'USGS, Open-Meteo, NASA',
        news: 'NewsAPI, Guardian'
      }
    };
  }
}

module.exports = DataAggregatorService;