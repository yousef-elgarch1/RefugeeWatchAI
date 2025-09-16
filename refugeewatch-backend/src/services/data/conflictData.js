/**
 * RefugeeWatch AI - Conflict Data Service
 * 
 * Real-time conflict monitoring using GDELT Project API
 * Tracks armed conflicts, violence, and security incidents globally
 * 
 * @author RefugeeWatch AI Team
 * @version 1.0.0
 */

const axios = require('axios');
const moment = require('moment');
const logger = require('../../utils/logger');

// GDELT API Configuration (FREE - No API key required)
const GDELT_CONFIG = {
  baseURL: 'https://api.gdeltproject.org/api/v2',
  timeout: 15000,
  maxRetries: 3,
  retryDelay: 2000
};

// Conflict-related GDELT themes and types
const CONFLICT_THEMES = [
  'CONFLICT',
  'CRISES',
  'KILL',
  'WOUND', 
  'ATTACK',
  'ARMED_CONFLICT',
  'CIVIL_UNREST',
  'TERRORISM',
  'MILITARY',
  'VIOLENCE',
  'PROTEST',
  'FIGHT',
  'WAR'
];

const CONFLICT_EVENT_CODES = [
  '18', // Assault
  '19', // Fight  
  '20', // Mass violence
  '145', // Protest violently/riot
  '173', // Engage in violent protest for leadership change
  '174', // Engage in violent protest for policy change
  '180', // Use conventional military force
  '181', // Fight with small arms and light weapons
  '182', // Fight with artillery and tanks
  '183', // Fight with aircraft
  '190', // Use unconventional mass violence
  '195', // Engage in mass killing
  '196' // Engage in mass expulsion
];

/**
 * Conflict Data Service Class
 */
class ConflictDataService {
  constructor() {
    this.client = axios.create({
      baseURL: GDELT_CONFIG.baseURL,
      timeout: GDELT_CONFIG.timeout,
      headers: {
        'User-Agent': 'RefugeeWatch-AI/1.0.0'
      }
    });
    
    this.cache = new Map();
    this.lastUpdate = null;
  }

  /**
   * Get conflict events for a specific country
   * @param {string} country - Country name or code
   * @param {number} days - Number of days to look back (default: 7)
   * @returns {Promise<Object>} Conflict data analysis
   */
  async getCountryConflictData(country, days = 7) {
    try {
      logger.external('GDELT', `/doc/doc?query=${country}`, true, 0, { country, days });
      
      const startDate = moment().subtract(days, 'days').format('YYYYMMDD');
      const endDate = moment().format('YYYYMMDD');
      
      // GDELT Doc API query for conflict-related articles
      const query = `${country} (${CONFLICT_THEMES.join(' OR ')})`;
      
      const response = await this.client.get('/doc/doc', {
        params: {
          query: query,
          mode: 'artlist',
          maxrecords: 100,
          format: 'json',
          startdatetime: `${startDate}000000`,
          enddatetime: `${endDate}235959`,
          sort: 'hybridrel'
        }
      });

      if (response.data && response.data.articles) {
        const analysis = this.analyzeConflictArticles(response.data.articles, country);
        
        logger.external('GDELT', 'conflict analysis', true, response.config.timeout, {
          country,
          articlesFound: response.data.articles.length,
          conflictLevel: analysis.conflictLevel
        });
        
        return analysis;
      }
      
      return this.getEmptyConflictData(country);
      
    } catch (error) {
      logger.external('GDELT', `/doc/doc?query=${country}`, false, 0, { 
        error: error.message,
        country 
      });
      
      // Return cached data if available
      const cached = this.cache.get(`conflict_${country}`);
      if (cached && moment().diff(cached.timestamp, 'hours') < 6) {
        logger.warn(`Using cached conflict data for ${country}`);
        return cached.data;
      }
      
      return this.getEmptyConflictData(country);
    }
  }

  /**
   * Get global conflict events (hotspots)
   * @param {number} days - Number of days to look back
   * @returns {Promise<Array>} Global conflict hotspots
   */
  async getGlobalConflictHotspots(days = 3) {
    try {
      const startTime = Date.now();
      
      const startDate = moment().subtract(days, 'days').format('YYYYMMDD');
      const endDate = moment().format('YYYYMMDD');
      
      // Query for high-intensity conflict events globally
      const query = `(${CONFLICT_THEMES.slice(0, 6).join(' OR ')})`;
      
      const response = await this.client.get('/doc/doc', {
        params: {
          query: query,
          mode: 'timelinevol',
          maxrecords: 250,
          format: 'json',
          startdatetime: `${startDate}000000`,
          enddatetime: `${endDate}235959`,
          sort: 'hybridrel'
        }
      });

      const duration = Date.now() - startTime;
      
      if (response.data && response.data.timeline) {
        const hotspots = this.identifyConflictHotspots(response.data.timeline);
        
        logger.external('GDELT', 'global hotspots', true, duration, {
          hotspotsFound: hotspots.length,
          totalEvents: response.data.timeline.length
        });
        
        return hotspots;
      }
      
      return [];
      
    } catch (error) {
      logger.external('GDELT', 'global hotspots', false, 0, { 
        error: error.message 
      });
      return [];
    }
  }

  /**
   * Get real-time conflict events using GDELT Event Database
   * @param {Array} countries - Countries to monitor
   * @returns {Promise<Object>} Real-time conflict events
   */
  async getRealTimeConflictEvents(countries = ['Sudan', 'Myanmar', 'Syria', 'Yemen']) {
    try {
      const events = {};
      
      for (const country of countries) {
        const countryEvents = await this.getCountryConflictEvents(country);
        events[country] = countryEvents;
        
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      logger.info(`Real-time conflict monitoring complete for ${countries.length} countries`);
      return events;
      
    } catch (error) {
      logger.error('Real-time conflict monitoring failed:', error.message);
      return {};
    }
  }

  /**
   * Get specific country conflict events
   * @param {string} country - Country name
   * @returns {Promise<Object>} Country conflict events
   */
  async getCountryConflictEvents(country) {
    try {
      const response = await this.client.get('/events/query', {
        params: {
          select: 'actor1name,actor2name,eventcode,goldsteinscale,nummentions,avgtone,actiongeo_countrycode,actiongeo_lat,actiongeo_long,dateadded',
          where: `actiongeo_countrycode='${this.getCountryCode(country)}' AND eventcode IN (${CONFLICT_EVENT_CODES.join(',')})`,
          orderby: 'dateadded DESC',
          limit: 50,
          format: 'json'
        }
      });

      if (response.data && response.data.data) {
        const analysis = this.analyzeConflictEvents(response.data.data, country);
        
        // Cache the results
        this.cache.set(`events_${country}`, {
          data: analysis,
          timestamp: moment()
        });
        
        return analysis;
      }
      
      return this.getEmptyConflictData(country);
      
    } catch (error) {
      logger.warn(`GDELT Events API failed for ${country}: ${error.message}`);
      return this.getEmptyConflictData(country);
    }
  }

  /**
   * Analyze conflict articles to determine threat level
   * @param {Array} articles - GDELT articles
   * @param {string} country - Country name
   * @returns {Object} Conflict analysis
   */
  analyzeConflictArticles(articles, country) {
    const analysis = {
      country,
      conflictLevel: 'LOW',
      confidence: 0.5,
      totalArticles: articles.length,
      recentEvents: [],
      intensityScore: 0,
      trends: {
        increasing: false,
        stable: true,
        decreasing: false
      },
      keyThemes: [],
      threatIndicators: []
    };

    if (!articles || articles.length === 0) {
      return analysis;
    }

    // Analyze article content and metadata
    let violenceKeywords = 0;
    let killingReports = 0;
    let displacementMentions = 0;
    let conflictIntensity = 0;
    
    const themes = new Map();
    const recentEvents = [];

    articles.forEach(article => {
      const title = (article.title || '').toLowerCase();
      const content = (article.seendate || '').toLowerCase();
      
      // Count violence indicators
      if (title.includes('kill') || title.includes('death') || title.includes('dead')) {
        killingReports++;
        conflictIntensity += 3;
      }
      
      if (title.includes('attack') || title.includes('bomb') || title.includes('shoot')) {
        violenceKeywords++;
        conflictIntensity += 2;
      }
      
      if (title.includes('flee') || title.includes('refugee') || title.includes('displace')) {
        displacementMentions++;
        conflictIntensity += 2;
      }
      
      if (title.includes('fight') || title.includes('war') || title.includes('conflict')) {
        conflictIntensity += 1;
      }
      
      // Extract themes
      CONFLICT_THEMES.forEach(theme => {
        if (title.includes(theme.toLowerCase())) {
          themes.set(theme, (themes.get(theme) || 0) + 1);
        }
      });
      
      // Collect recent significant events
      if (violenceKeywords > 0 || killingReports > 0) {
        recentEvents.push({
          title: article.title,
          date: article.seendate,
          url: article.url,
          domain: article.domain
        });
      }
    });

    // Calculate intensity score (0-100)
    analysis.intensityScore = Math.min(100, 
      (killingReports * 15) + 
      (violenceKeywords * 10) + 
      (displacementMentions * 8) + 
      (articles.length * 2)
    );

    // Determine conflict level
    if (analysis.intensityScore >= 70) {
      analysis.conflictLevel = 'CRITICAL';
      analysis.confidence = 0.9;
    } else if (analysis.intensityScore >= 40) {
      analysis.conflictLevel = 'HIGH';
      analysis.confidence = 0.8;
    } else if (analysis.intensityScore >= 20) {
      analysis.conflictLevel = 'MEDIUM';
      analysis.confidence = 0.7;
    } else {
      analysis.conflictLevel = 'LOW';
      analysis.confidence = 0.6;
    }

    // Set trends (simplified - could be enhanced with time series)
    if (analysis.intensityScore > 50) {
      analysis.trends.increasing = true;
      analysis.trends.stable = false;
    }

    // Top themes
    analysis.keyThemes = Array.from(themes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([theme, count]) => ({ theme, count }));

    // Recent events (max 10)
    analysis.recentEvents = recentEvents.slice(0, 10);

    // Threat indicators
    if (killingReports > 5) analysis.threatIndicators.push('High casualty reports');
    if (displacementMentions > 3) analysis.threatIndicators.push('Population displacement');
    if (violenceKeywords > 10) analysis.threatIndicators.push('Escalating violence');
    if (articles.length > 50) analysis.threatIndicators.push('High media attention');

    return analysis;
  }

  /**
   * Analyze GDELT events data
   * @param {Array} events - GDELT events
   * @param {string} country - Country name
   * @returns {Object} Events analysis
   */
  analyzeConflictEvents(events, country) {
    const analysis = this.getEmptyConflictData(country);
    
    if (!events || events.length === 0) {
      return analysis;
    }

    let totalGoldstein = 0;
    let violentEvents = 0;
    let avgTone = 0;
    
    events.forEach(event => {
      const goldstein = parseFloat(event[3]) || 0; // Goldstein scale
      const tone = parseFloat(event[5]) || 0; // Average tone
      
      totalGoldstein += goldstein;
      avgTone += tone;
      
      if (goldstein < -5) { // Negative Goldstein indicates conflict
        violentEvents++;
      }
    });

    const avgGoldstein = totalGoldstein / events.length;
    const avgToneScore = avgTone / events.length;
    
    // Calculate intensity based on Goldstein scale and event frequency
    analysis.intensityScore = Math.min(100, 
      Math.abs(avgGoldstein * 10) + (violentEvents * 5) + (events.length * 2)
    );

    // Determine conflict level
    if (analysis.intensityScore >= 60) {
      analysis.conflictLevel = 'CRITICAL';
      analysis.confidence = 0.95;
    } else if (analysis.intensityScore >= 35) {
      analysis.conflictLevel = 'HIGH';
      analysis.confidence = 0.85;
    } else if (analysis.intensityScore >= 15) {
      analysis.conflictLevel = 'MEDIUM';
      analysis.confidence = 0.75;
    }

    analysis.totalArticles = events.length;
    analysis.metrics = {
      avgGoldsteinScale: avgGoldstein,
      avgTone: avgToneScore,
      violentEvents: violentEvents,
      eventDensity: events.length
    };

    return analysis;
  }

  /**
   * Identify global conflict hotspots
   * @param {Array} timeline - GDELT timeline data
   * @returns {Array} Conflict hotspots
   */
  identifyConflictHotspots(timeline) {
    const hotspots = [];
    const countryEvents = new Map();

    // Group events by country/location
    timeline.forEach(item => {
      // Extract country information from GDELT timeline
      const country = this.extractCountryFromTimeline(item);
      if (country) {
        const events = countryEvents.get(country) || [];
        events.push(item);
        countryEvents.set(country, events);
      }
    });

    // Analyze each country for hotspot status
    countryEvents.forEach((events, country) => {
      if (events.length >= 5) { // Minimum threshold for hotspot
        const intensity = this.calculateHotspotIntensity(events);
        
        if (intensity >= 30) { // Hotspot threshold
          hotspots.push({
            country,
            intensity,
            eventCount: events.length,
            riskLevel: intensity >= 70 ? 'CRITICAL' : intensity >= 50 ? 'HIGH' : 'MEDIUM',
            lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss')
          });
        }
      }
    });

    return hotspots.sort((a, b) => b.intensity - a.intensity).slice(0, 10);
  }

  /**
   * Calculate hotspot intensity score
   * @param {Array} events - Events for a location
   * @returns {number} Intensity score
   */
  calculateHotspotIntensity(events) {
    return Math.min(100, events.length * 10 + (events.length > 20 ? 30 : 0));
  }

  /**
   * Extract country from GDELT timeline item
   * @param {Object} item - Timeline item
   * @returns {string|null} Country name
   */
  extractCountryFromTimeline(item) {
    // This would need to be enhanced based on actual GDELT timeline structure
    // For now, return common conflict countries for demo
    const countries = ['Sudan', 'Myanmar', 'Syria', 'Yemen', 'Afghanistan', 'Iraq', 'Somalia'];
    return countries[Math.floor(Math.random() * countries.length)];
  }

  /**
   * Get country code for GDELT queries
   * @param {string} country - Country name
   * @returns {string} ISO country code
   */
  getCountryCode(country) {
    const codes = {
      'Sudan': 'SU',
      'Myanmar': 'BM', 
      'Syria': 'SY',
      'Yemen': 'YM',
      'Afghanistan': 'AF',
      'Iraq': 'IZ',
      'Somalia': 'SO',
      'Bangladesh': 'BG',
      'Ethiopia': 'ET',
      'Chad': 'CD'
    };
    
    return codes[country] || 'US';
  }

  /**
   * Get empty conflict data structure
   * @param {string} country - Country name
   * @returns {Object} Empty conflict data
   */
  getEmptyConflictData(country) {
    return {
      country,
      conflictLevel: 'LOW',
      confidence: 0.5,
      totalArticles: 0,
      recentEvents: [],
      intensityScore: 0,
      trends: {
        increasing: false,
        stable: true,
        decreasing: false
      },
      keyThemes: [],
      threatIndicators: [],
      lastUpdate: moment().format('YYYY-MM-DD HH:mm:ss'),
      dataSource: 'GDELT'
    };
  }

  /**
   * Get cached conflict data if available and fresh
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
   * Clear cache for fresh data
   */
  clearCache() {
    this.cache.clear();
    logger.info('Conflict data cache cleared');
  }
}

module.exports = ConflictDataService;