/**
 * RefugeeWatch AI - Economic Data Service
 * 
 * Real-time economic monitoring using World Bank API and other sources
 * Tracks economic indicators that correlate with displacement risk
 * 
 * @author RefugeeWatch AI Team
 * @version 1.0.0
 */

const axios = require('axios');
const moment = require('moment');
const logger = require('../../utils/logger');

// World Bank API Configuration (FREE - No API key required)
const WORLD_BANK_CONFIG = {
  baseURL: 'https://api.worldbank.org/v2',
  timeout: 10000,
  format: 'json',
  perPage: 100
};

// Key economic indicators that correlate with displacement risk
const ECONOMIC_INDICATORS = {
  // Core indicators
  'NY.GDP.PCAP.CD': 'GDP per capita',
  'FP.CPI.TOTL.ZG': 'Inflation rate',
  'SL.UEM.TOTL.ZS': 'Unemployment rate',
  'SI.POV.DDAY': 'Poverty headcount ratio',
  
  // Food security indicators  
  'SN.ITK.DEFC.ZS': 'Malnutrition prevalence',
  'AG.PRD.FOOD.XD': 'Food production index',
  
  // Economic stability
  'PA.NUS.FCRF': 'Exchange rate',
  'GC.BAL.CASH.GD.ZS': 'Cash surplus/deficit',
  'DT.DOD.DECT.GD.ZS': 'External debt stocks',
  
  // Development indicators
  'SE.PRM.ENRR': 'Primary education enrollment',
  'SH.XPD.CHEX.GD.ZS': 'Health expenditure',
  'SP.DYN.LE00.IN': 'Life expectancy'
};

// Crisis threshold values for indicators
const CRISIS_THRESHOLDS = {
  inflation: {
    critical: 50,    // >50% inflation
    high: 20,        // >20% inflation
    medium: 10       // >10% inflation
  },
  unemployment: {
    critical: 30,    // >30% unemployment
    high: 20,        // >20% unemployment  
    medium: 15       // >15% unemployment
  },
  poverty: {
    critical: 70,    // >70% below poverty line
    high: 50,        // >50% below poverty line
    medium: 30       // >30% below poverty line
  },
  gdpPerCapita: {
    critical: 500,   // <$500 GDP per capita
    high: 1000,      // <$1000 GDP per capita
    medium: 2000     // <$2000 GDP per capita
  }
};

/**
 * Economic Data Service Class
 */
class EconomicDataService {
  constructor() {
    this.wbClient = axios.create({
      baseURL: WORLD_BANK_CONFIG.baseURL,
      timeout: WORLD_BANK_CONFIG.timeout,
      headers: {
        'User-Agent': 'RefugeeWatch-AI/1.0.0'
      }
    });
    
    this.cache = new Map();
    this.lastUpdate = null;
  }

  /**
   * Get comprehensive economic data for a country
   * @param {string} countryCode - ISO3 country code
   * @param {number} years - Number of years to analyze (default: 5)
   * @returns {Promise<Object>} Economic analysis
   */
  async getCountryEconomicData(countryCode, years = 5) {
    try {
      const startTime = Date.now();
      const country = this.getCountryName(countryCode);
      
      logger.external('World Bank', `/country/${countryCode}`, true, 0, { 
        country, 
        indicators: Object.keys(ECONOMIC_INDICATORS).length 
      });
      
      // Get country basic info
      const countryInfo = await this.getCountryInfo(countryCode);
      
      // Get all economic indicators
      const indicators = await this.getAllIndicators(countryCode, years);
      
      // Analyze economic stability
      const analysis = this.analyzeEconomicStability(indicators, country);
      
      // Calculate displacement risk based on economic factors
      const displacementRisk = this.calculateEconomicDisplacementRisk(indicators);
      
      const duration = Date.now() - startTime;
      
      const result = {
        country,
        countryCode,
        ...countryInfo,
        indicators,
        analysis,
        displacementRisk,
        lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss'),
        dataSource: 'World Bank API'
      };
      
      // Cache the results
      this.cache.set(`economic_${countryCode}`, {
        data: result,
        timestamp: moment()
      });
      
      logger.external('World Bank', 'economic analysis', true, duration, {
        country,
        riskLevel: displacementRisk.riskLevel,
        confidence: displacementRisk.confidence
      });
      
      return result;
      
    } catch (error) {
      logger.external('World Bank', `/country/${countryCode}`, false, 0, { 
        error: error.message,
        countryCode 
      });
      
      // Return cached data if available
      const cached = this.getCachedData(`economic_${countryCode}`, 24);
      if (cached) {
        logger.warn(`Using cached economic data for ${countryCode}`);
        return cached;
      }
      
      return this.getEmptyEconomicData(countryCode);
    }
  }

  /**
   * Get country basic information
   * @param {string} countryCode - ISO3 country code
   * @returns {Promise<Object>} Country info
   */
  async getCountryInfo(countryCode) {
    try {
      const response = await this.wbClient.get(`/country/${countryCode}`, {
        params: { format: 'json' }
      });
      
      if (response.data && response.data[1] && response.data[1][0]) {
        const country = response.data[1][0];
        return {
          name: country.name,
          region: country.region?.value || 'Unknown',
          incomeLevel: country.incomeLevel?.value || 'Unknown',
          capitalCity: country.capitalCity || 'Unknown',
          latitude: country.latitude || null,
          longitude: country.longitude || null
        };
      }
      
      return {};
      
    } catch (error) {
      logger.warn(`Failed to get country info for ${countryCode}: ${error.message}`);
      return {};
    }
  }

  /**
   * Get all economic indicators for a country
   * @param {string} countryCode - ISO3 country code  
   * @param {number} years - Number of years
   * @returns {Promise<Object>} Indicators data
   */
  async getAllIndicators(countryCode, years) {
    const indicators = {};
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - years;
    
    for (const [code, name] of Object.entries(ECONOMIC_INDICATORS)) {
      try {
        const data = await this.getIndicator(countryCode, code, startYear, currentYear);
        indicators[code] = {
          name,
          code,
          data: data.values,
          trend: data.trend,
          latest: data.latest,
          change: data.change
        };
        
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        logger.warn(`Failed to get indicator ${code} for ${countryCode}: ${error.message}`);
        indicators[code] = {
          name,
          code,
          data: [],
          trend: 'unknown',
          latest: null,
          change: null
        };
      }
    }
    
    return indicators;
  }

  /**
   * Get specific economic indicator
   * @param {string} countryCode - ISO3 country code
   * @param {string} indicatorCode - World Bank indicator code
   * @param {number} startYear - Start year
   * @param {number} endYear - End year
   * @returns {Promise<Object>} Indicator data with analysis
   */
  async getIndicator(countryCode, indicatorCode, startYear, endYear) {
    const response = await this.wbClient.get(`/country/${countryCode}/indicator/${indicatorCode}`, {
      params: {
        format: 'json',
        date: `${startYear}:${endYear}`,
        per_page: 50
      }
    });
    
    if (response.data && response.data[1]) {
      const rawData = response.data[1];
      const values = rawData
        .filter(item => item.value !== null)
        .map(item => ({
          year: parseInt(item.date),
          value: parseFloat(item.value)
        }))
        .sort((a, b) => a.year - b.year);
      
      const analysis = this.analyzeIndicatorTrend(values);
      
      return {
        values,
        ...analysis
      };
    }
    
    return {
      values: [],
      trend: 'unknown',
      latest: null,
      change: null
    };
  }

  /**
   * Analyze indicator trend
   * @param {Array} values - Time series values
   * @returns {Object} Trend analysis
   */
  analyzeIndicatorTrend(values) {
    if (values.length < 2) {
      return {
        trend: 'insufficient_data',
        latest: values[0]?.value || null,
        change: null
      };
    }
    
    const latest = values[values.length - 1];
    const previous = values[values.length - 2];
    const change = ((latest.value - previous.value) / previous.value) * 100;
    
    // Determine trend over last 3 years
    let trend = 'stable';
    if (values.length >= 3) {
      const recent = values.slice(-3);
      const slopes = [];
      
      for (let i = 1; i < recent.length; i++) {
        slopes.push(recent[i].value - recent[i-1].value);
      }
      
      const avgSlope = slopes.reduce((a, b) => a + b, 0) / slopes.length;
      
      if (avgSlope > 0.05 * latest.value) {
        trend = 'increasing';
      } else if (avgSlope < -0.05 * latest.value) {
        trend = 'decreasing';
      }
    }
    
    return {
      trend,
      latest: latest.value,
      change: Math.round(change * 100) / 100
    };
  }

  /**
   * Analyze economic stability and crisis indicators
   * @param {Object} indicators - All economic indicators
   * @param {string} country - Country name
   * @returns {Object} Economic stability analysis
   */
  analyzeEconomicStability(indicators, country) {
    const analysis = {
      overallStability: 'STABLE',
      confidence: 0.7,
      crisisIndicators: [],
      strengths: [],
      weaknesses: [],
      riskFactors: [],
      stabilityScore: 70,
      trends: {}
    };

    let totalRiskScore = 0;
    let indicatorCount = 0;

    // Analyze inflation
    const inflation = indicators['FP.CPI.TOTL.ZG'];
    if (inflation && inflation.latest !== null) {
      indicatorCount++;
      const rate = inflation.latest;
      
      if (rate > CRISIS_THRESHOLDS.inflation.critical) {
        analysis.crisisIndicators.push(`Hyperinflation: ${rate.toFixed(1)}%`);
        totalRiskScore += 30;
      } else if (rate > CRISIS_THRESHOLDS.inflation.high) {
        analysis.riskFactors.push(`High inflation: ${rate.toFixed(1)}%`);
        totalRiskScore += 20;
      } else if (rate > CRISIS_THRESHOLDS.inflation.medium) {
        analysis.weaknesses.push(`Moderate inflation: ${rate.toFixed(1)}%`);
        totalRiskScore += 10;
      } else if (rate >= 0 && rate <= 5) {
        analysis.strengths.push(`Stable inflation: ${rate.toFixed(1)}%`);
      }
      
      analysis.trends.inflation = {
        current: rate,
        trend: inflation.trend,
        change: inflation.change
      };
    }

    // Analyze unemployment
    const unemployment = indicators['SL.UEM.TOTL.ZS'];
    if (unemployment && unemployment.latest !== null) {
      indicatorCount++;
      const rate = unemployment.latest;
      
      if (rate > CRISIS_THRESHOLDS.unemployment.critical) {
        analysis.crisisIndicators.push(`Mass unemployment: ${rate.toFixed(1)}%`);
        totalRiskScore += 25;
      } else if (rate > CRISIS_THRESHOLDS.unemployment.high) {
        analysis.riskFactors.push(`High unemployment: ${rate.toFixed(1)}%`);
        totalRiskScore += 15;
      } else if (rate > CRISIS_THRESHOLDS.unemployment.medium) {
        analysis.weaknesses.push(`Elevated unemployment: ${rate.toFixed(1)}%`);
        totalRiskScore += 8;
      } else if (rate <= 10) {
        analysis.strengths.push(`Manageable unemployment: ${rate.toFixed(1)}%`);
      }
      
      analysis.trends.unemployment = {
        current: rate,
        trend: unemployment.trend,
        change: unemployment.change
      };
    }

    // Analyze GDP per capita
    const gdpPerCapita = indicators['NY.GDP.PCAP.CD'];
    if (gdpPerCapita && gdpPerCapita.latest !== null) {
      indicatorCount++;
      const gdp = gdpPerCapita.latest;
      
      if (gdp < CRISIS_THRESHOLDS.gdpPerCapita.critical) {
        analysis.crisisIndicators.push(`Extreme poverty: $${gdp.toFixed(0)} GDP per capita`);
        totalRiskScore += 25;
      } else if (gdp < CRISIS_THRESHOLDS.gdpPerCapita.high) {
        analysis.riskFactors.push(`Low income: $${gdp.toFixed(0)} GDP per capita`);
        totalRiskScore += 15;
      } else if (gdp < CRISIS_THRESHOLDS.gdpPerCapita.medium) {
        analysis.weaknesses.push(`Lower-middle income: $${gdp.toFixed(0)} GDP per capita`);
        totalRiskScore += 5;
      } else {
        analysis.strengths.push(`Economic capacity: $${gdp.toFixed(0)} GDP per capita`);
      }
      
      analysis.trends.gdpPerCapita = {
        current: gdp,
        trend: gdpPerCapita.trend,
        change: gdpPerCapita.change
      };
    }

    // Analyze poverty rate
    const poverty = indicators['SI.POV.DDAY'];
    if (poverty && poverty.latest !== null) {
      indicatorCount++;
      const rate = poverty.latest;
      
      if (rate > CRISIS_THRESHOLDS.poverty.critical) {
        analysis.crisisIndicators.push(`Extreme poverty: ${rate.toFixed(1)}% below poverty line`);
        totalRiskScore += 20;
      } else if (rate > CRISIS_THRESHOLDS.poverty.high) {
        analysis.riskFactors.push(`High poverty: ${rate.toFixed(1)}% below poverty line`);
        totalRiskScore += 12;
      } else if (rate > CRISIS_THRESHOLDS.poverty.medium) {
        analysis.weaknesses.push(`Significant poverty: ${rate.toFixed(1)}% below poverty line`);
        totalRiskScore += 6;
      }
      
      analysis.trends.poverty = {
        current: rate,
        trend: poverty.trend,
        change: poverty.change
      };
    }

    // Calculate overall stability
    if (indicatorCount > 0) {
      analysis.stabilityScore = Math.max(0, 100 - (totalRiskScore / indicatorCount) * 100);
      analysis.confidence = Math.min(0.95, 0.5 + (indicatorCount * 0.1));
    }

    // Determine overall stability level
    if (analysis.crisisIndicators.length >= 2 || totalRiskScore > 50) {
      analysis.overallStability = 'CRITICAL';
    } else if (analysis.crisisIndicators.length >= 1 || totalRiskScore > 30) {
      analysis.overallStability = 'UNSTABLE';
    } else if (analysis.riskFactors.length >= 2 || totalRiskScore > 15) {
      analysis.overallStability = 'AT_RISK';
    } else {
      analysis.overallStability = 'STABLE';
    }

    return analysis;
  }

  /**
   * Calculate displacement risk based on economic factors
   * @param {Object} indicators - Economic indicators
   * @returns {Object} Displacement risk assessment
   */
  calculateEconomicDisplacementRisk(indicators) {
    let riskScore = 0;
    let factorCount = 0;
    const riskFactors = [];

    // Economic collapse indicators
    const inflation = indicators['FP.CPI.TOTL.ZG'];
    if (inflation && inflation.latest !== null) {
      factorCount++;
      if (inflation.latest > 100) {
        riskScore += 40;
        riskFactors.push(`Hyperinflation crisis (${inflation.latest.toFixed(1)}%)`);
      } else if (inflation.latest > 50) {
        riskScore += 25;
        riskFactors.push(`Severe inflation (${inflation.latest.toFixed(1)}%)`);
      } else if (inflation.latest > 20) {
        riskScore += 15;
        riskFactors.push(`High inflation (${inflation.latest.toFixed(1)}%)`);
      }
    }

    // Employment crisis
    const unemployment = indicators['SL.UEM.TOTL.ZS'];
    if (unemployment && unemployment.latest !== null) {
      factorCount++;
      if (unemployment.latest > 40) {
        riskScore += 35;
        riskFactors.push(`Mass unemployment (${unemployment.latest.toFixed(1)}%)`);
      } else if (unemployment.latest > 25) {
        riskScore += 20;
        riskFactors.push(`High unemployment (${unemployment.latest.toFixed(1)}%)`);
      }
    }

    // Extreme poverty
    const poverty = indicators['SI.POV.DDAY'];
    if (poverty && poverty.latest !== null) {
      factorCount++;
      if (poverty.latest > 70) {
        riskScore += 30;
        riskFactors.push(`Extreme poverty (${poverty.latest.toFixed(1)}% below poverty line)`);
      } else if (poverty.latest > 50) {
        riskScore += 20;
        riskFactors.push(`High poverty (${poverty.latest.toFixed(1)}% below poverty line)`);
      }
    }

    // Economic collapse (GDP per capita)
    const gdp = indicators['NY.GDP.PCAP.CD'];
    if (gdp && gdp.latest !== null) {
      factorCount++;
      if (gdp.latest < 500) {
        riskScore += 35;
        riskFactors.push(`Economic collapse ($${gdp.latest.toFixed(0)} GDP per capita)`);
      } else if (gdp.latest < 1000) {
        riskScore += 20;
        riskFactors.push(`Economic distress ($${gdp.latest.toFixed(0)} GDP per capita)`);
      }
    }

    // Food security
    const malnutrition = indicators['SN.ITK.DEFC.ZS'];
    if (malnutrition && malnutrition.latest !== null && malnutrition.latest > 20) {
      factorCount++;
      riskScore += 25;
      riskFactors.push(`Food insecurity (${malnutrition.latest.toFixed(1)}% malnourished)`);
    }

    // Calculate final risk assessment
    const avgRiskScore = factorCount > 0 ? riskScore / factorCount : 0;
    let riskLevel = 'LOW';
    let confidence = 0.6;

    if (avgRiskScore >= 30) {
      riskLevel = 'CRITICAL';
      confidence = 0.9;
    } else if (avgRiskScore >= 20) {
      riskLevel = 'HIGH';
      confidence = 0.85;
    } else if (avgRiskScore >= 10) {
      riskLevel = 'MEDIUM';
      confidence = 0.75;
    }

    // Adjust confidence based on data availability
    confidence = Math.min(confidence, 0.5 + (factorCount * 0.1));

    return {
      riskLevel,
      confidence,
      riskScore: Math.round(avgRiskScore),
      riskFactors,
      economicPressure: avgRiskScore,
      displacementPotential: this.calculateDisplacementPotential(avgRiskScore, riskFactors),
      recommendation: this.getEconomicRecommendation(riskLevel, riskFactors)
    };
  }

  /**
   * Calculate displacement potential based on economic factors
   * @param {number} riskScore - Economic risk score
   * @param {Array} riskFactors - Risk factors
   * @returns {Object} Displacement potential
   */
  calculateDisplacementPotential(riskScore, riskFactors) {
    let potential = 'LOW';
    let timeframe = '12+ months';
    let estimatedPopulation = 0;

    if (riskScore >= 30) {
      potential = 'HIGH';
      timeframe = '3-6 months';
      estimatedPopulation = Math.round(riskScore * 1000); // Rough estimate
    } else if (riskScore >= 20) {
      potential = 'MEDIUM';
      timeframe = '6-12 months';
      estimatedPopulation = Math.round(riskScore * 500);
    } else if (riskScore >= 10) {
      potential = 'LOW';
      timeframe = '12+ months';
      estimatedPopulation = Math.round(riskScore * 200);
    }

    return {
      level: potential,
      timeframe,
      estimatedPopulation,
      triggerFactors: riskFactors.slice(0, 3) // Top 3 factors
    };
  }

  /**
   * Get recommendation based on economic risk
   * @param {string} riskLevel - Risk level
   * @param {Array} riskFactors - Risk factors
   * @returns {string} Recommendation
   */
  getEconomicRecommendation(riskLevel, riskFactors) {
    switch (riskLevel) {
      case 'CRITICAL':
        return 'URGENT: Economic collapse imminent. Prepare immediate humanitarian response and cross-border coordination.';
      case 'HIGH':
        return 'HIGH PRIORITY: Severe economic distress. Pre-position resources and monitor population movements.';
      case 'MEDIUM':
        return 'MONITOR: Economic pressures building. Enhance early warning systems and prepare contingency plans.';
      default:
        return 'ROUTINE: Economic situation stable. Continue regular monitoring.';
    }
  }

  /**
   * Get country name from code
   * @param {string} code - Country code
   * @returns {string} Country name
   */
  getCountryName(code) {
    const names = {
      'SDN': 'Sudan',
      'MMR': 'Myanmar',
      'SYR': 'Syria',
      'YEM': 'Yemen',
      'AFG': 'Afghanistan',
      'BGD': 'Bangladesh',
      'ETH': 'Ethiopia',
      'TCD': 'Chad',
      'IRQ': 'Iraq',
      'SOM': 'Somalia'
    };
    
    return names[code] || code;
  }

  /**
   * Get empty economic data structure
   * @param {string} countryCode - Country code
   * @returns {Object} Empty economic data
   */
  getEmptyEconomicData(countryCode) {
    return {
      country: this.getCountryName(countryCode),
      countryCode,
      indicators: {},
      analysis: {
        overallStability: 'UNKNOWN',
        confidence: 0.3,
        crisisIndicators: [],
        strengths: [],
        weaknesses: [],
        riskFactors: ['Insufficient economic data'],
        stabilityScore: 50,
        trends: {}
      },
      displacementRisk: {
        riskLevel: 'UNKNOWN',
        confidence: 0.3,
        riskScore: 0,
        riskFactors: ['No economic data available'],
        economicPressure: 0,
        displacementPotential: {
          level: 'UNKNOWN',
          timeframe: 'Unknown',
          estimatedPopulation: 0,
          triggerFactors: []
        },
        recommendation: 'Unable to assess - economic data unavailable'
      },
      lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss'),
      dataSource: 'World Bank API (No Data)'
    };
  }

  /**
   * Get cached data if available and fresh
   * @param {string} key - Cache key
   * @param {number} maxAgeHours - Maximum age in hours
   * @returns {Object|null} Cached data or null
   */
  getCachedData(key, maxAgeHours = 6) {
    const cached = this.cache.get(key);
    if (cached && moment().diff(cached.timestamp, 'hours') < maxAgeHours) {
      return cached.data;
    }
    return null;
  }

  /**
   * Clear cache for fresh data
   */
  clearCache() {
    this.cache.clear();
    logger.info('Economic data cache cleared');
  }
}

module.exports = EconomicDataService;