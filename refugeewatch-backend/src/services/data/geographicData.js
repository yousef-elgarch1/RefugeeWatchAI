/**
 * RefugeeWatch AI - FINAL FIXED Geographic Data Service
 * Fixed based on actual REST Countries API documentation
 * 
 * @author RefugeeWatch AI Team
 * @version 2.1.0 (API-COMPLIANT)
 */

const axios = require('axios');
const logger = require('../../utils/logger');

class GeographicDataService {
  constructor() {
    // REST Countries API client - FIXED ENDPOINT
    this.clients = {
      restCountries: axios.create({
        baseURL: 'https://restcountries.com/v3.1',
        timeout: 15000,
        headers: {
          'User-Agent': 'RefugeeWatch-AI/2.1.0'
        }
      })
    };

    this.cache = new Map();
    this.cacheExpiry = 12 * 60 * 60 * 1000; // 12 hours
  }

  /**
   * Get all countries - FIXED: Removed invalid fields parameter
   */
  async getAllCountries() {
    try {
      const cacheKey = 'all_countries';
      const cachedData = this.getCachedData(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      logger.info('Fetching all countries from REST Countries API');
      
      // FIXED: Remove fields parameter that was causing 400 error
      const response = await this.clients.restCountries.get('/all');

      if (!response || !response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid REST Countries API response');
      }

      const countries = response.data.map(country => {
        try {
          return {
            name: country.name?.common || 'Unknown',
            officialName: country.name?.official || country.name?.common || 'Unknown',
            code: country.cca2 || null,
            code3: country.cca3 || null,
            capital: Array.isArray(country.capital) && country.capital.length > 0 ? 
                     country.capital[0] : null,
            region: country.region || null,
            subregion: country.subregion || null,
            population: country.population || 0,
            coordinates: Array.isArray(country.latlng) && country.latlng.length === 2 ? 
                        country.latlng : [0, 0],
            languages: country.languages ? Object.values(country.languages) : [],
            currencies: country.currencies ? Object.keys(country.currencies) : [],
            borders: Array.isArray(country.borders) ? country.borders : [],
            flag: country.flag || null,
            lastUpdated: new Date().toISOString()
          };
        } catch (countryError) {
          logger.warn(`Error processing country data:`, countryError.message);
          return null;
        }
      }).filter(country => country !== null);

      const result = {
        success: true,
        data: countries,
        count: countries.length,
        source: 'REST Countries API',
        lastUpdated: new Date().toISOString()
      };

      this.setCachedData(cacheKey, result);
      logger.info(`Successfully fetched ${countries.length} countries`);
      
      return result;

    } catch (error) {
      logger.error('Failed to fetch countries data:', error.message);
      
      // Return fallback data
      const fallbackCountries = this.getFallbackCountries();
      return {
        success: true,
        data: fallbackCountries,
        count: fallbackCountries.length,
        source: 'Fallback Data',
        error: error.message,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Get specific country data - FIXED: No fields parameter
   */
  async getCountryByName(countryName) {
    try {
      const cacheKey = `country_${countryName.toLowerCase()}`;
      const cachedData = this.getCachedData(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      logger.info(`Fetching data for country: ${countryName}`);
      
      // FIXED: Remove fields parameter, use correct endpoint
      const response = await this.clients.restCountries.get(`/name/${encodeURIComponent(countryName)}`);

      if (!response || !response.data || !Array.isArray(response.data) || response.data.length === 0) {
        throw new Error(`Country '${countryName}' not found`);
      }

      const country = response.data[0];
      const countryData = {
        name: country.name?.common || countryName,
        officialName: country.name?.official || country.name?.common || countryName,
        code: country.cca2 || null,
        code3: country.cca3 || null,
        capital: Array.isArray(country.capital) && country.capital.length > 0 ? 
                 country.capital[0] : null,
        region: country.region || null,
        subregion: country.subregion || null,
        population: country.population || 0,
        coordinates: Array.isArray(country.latlng) && country.latlng.length === 2 ? 
                    country.latlng : [0, 0],
        languages: country.languages ? Object.values(country.languages) : [],
        currencies: country.currencies ? Object.keys(country.currencies) : [],
        borders: Array.isArray(country.borders) ? country.borders : [],
        flag: country.flag || null,
        lastUpdated: new Date().toISOString()
      };

      const result = {
        success: true,
        data: countryData,
        source: 'REST Countries API'
      };

      this.setCachedData(cacheKey, result);
      return result;

    } catch (error) {
      logger.error(`Failed to get country ${countryName}:`, error.message);
      
      // Try fallback data first
      const fallbackCountry = this.getFallbackCountries().find(
        c => c.name.toLowerCase().includes(countryName.toLowerCase()) ||
             countryName.toLowerCase().includes(c.name.toLowerCase())
      );

      if (fallbackCountry) {
        return {
          success: true,
          data: fallbackCountry,
          source: 'Fallback Data'
        };
      }

      return {
        success: false,
        error: `Country '${countryName}' not found`,
        data: null
      };
    }
  }

  /**
   * Get countries by region
   */
  async getCountriesByRegion(regionName) {
    try {
      const allCountriesResult = await this.getAllCountries();
      
      if (!allCountriesResult || !allCountriesResult.success || !allCountriesResult.data) {
        throw new Error('Failed to get countries data');
      }

      const countriesInRegion = allCountriesResult.data.filter(country => 
        country.region && 
        country.region.toLowerCase().includes(regionName.toLowerCase())
      );

      return {
        success: true,
        data: countriesInRegion,
        count: countriesInRegion.length,
        region: regionName,
        source: allCountriesResult.source
      };

    } catch (error) {
      logger.error(`Failed to get countries in region ${regionName}:`, error.message);
      
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Cache management
   */
  getCachedData(key) {
    try {
      const cached = this.cache.get(key);
      if (cached && (Date.now() - cached.timestamp < this.cacheExpiry)) {
        return cached.data;
      }
      this.cache.delete(key);
      return null;
    } catch (error) {
      logger.warn(`Cache read error for key ${key}:`, error.message);
      return null;
    }
  }

  setCachedData(key, data) {
    try {
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });
    } catch (error) {
      logger.warn(`Cache write error for key ${key}:`, error.message);
    }
  }

  /**
   * Fallback countries data
   */
  getFallbackCountries() {
    return [
      {
        name: 'Syria',
        officialName: 'Syrian Arab Republic',
        code: 'SY',
        code3: 'SYR',
        capital: 'Damascus',
        region: 'Asia',
        subregion: 'Western Asia',
        population: 21324000,
        coordinates: [34.8021, 38.9968],
        languages: ['Arabic'],
        currencies: ['SYP'],
        borders: ['IRQ', 'ISR', 'JOR', 'LBN', 'TUR'],
        flag: '🇸🇾',
        lastUpdated: new Date().toISOString()
      },
      {
        name: 'Afghanistan',
        officialName: 'Islamic Emirate of Afghanistan',
        code: 'AF',
        code3: 'AFG',
        capital: 'Kabul',
        region: 'Asia',
        subregion: 'Southern Asia',
        population: 40218000,
        coordinates: [33.9391, 67.71],
        languages: ['Pashto', 'Dari'],
        currencies: ['AFN'],
        borders: ['IRN', 'PAK', 'TKM', 'UZB', 'TJK', 'CHN'],
        flag: '🇦🇫',
        lastUpdated: new Date().toISOString()
      },
      {
        name: 'Ukraine',
        officialName: 'Ukraine',
        code: 'UA',
        code3: 'UKR',
        capital: 'Kyiv',
        region: 'Europe',
        subregion: 'Eastern Europe',
        population: 44134000,
        coordinates: [48.3794, 31.1656],
        languages: ['Ukrainian'],
        currencies: ['UAH'],
        borders: ['BLR', 'HUN', 'MDA', 'POL', 'ROU', 'RUS', 'SVK'],
        flag: '🇺🇦',
        lastUpdated: new Date().toISOString()
      },
      {
        name: 'Sudan',
        officialName: 'Republic of the Sudan',
        code: 'SD',
        code3: 'SDN',
        capital: 'Khartoum',
        region: 'Africa',
        subregion: 'Northern Africa',
        population: 45657000,
        coordinates: [12.8628, 30.2176],
        languages: ['Arabic', 'English'],
        currencies: ['SDG'],
        borders: ['CAF', 'TCD', 'EGY', 'ERI', 'ETH', 'LBY', 'SSD'],
        flag: '🇸🇩',
        lastUpdated: new Date().toISOString()
      },
      {
        name: 'Myanmar',
        officialName: 'Republic of the Union of Myanmar',
        code: 'MM',
        code3: 'MMR',
        capital: 'Naypyidaw',
        region: 'Asia',
        subregion: 'South-Eastern Asia',
        population: 54409000,
        coordinates: [21.9162, 95.956],
        languages: ['Burmese'],
        currencies: ['MMK'],
        borders: ['BGD', 'CHN', 'IND', 'LAO', 'THA'],
        flag: '🇲🇲',
        lastUpdated: new Date().toISOString()
      }
    ];
  }

  /**
   * Get service health
   */
  async getServiceHealth() {
    const health = {
      service: 'GeographicData',
      status: 'operational',
      apis: {}
    };

    try {
      // Test REST Countries API with simple endpoint
      await this.clients.restCountries.get('/all?fields=name', { timeout: 5000 });
      health.apis.restCountries = 'operational';
    } catch (error) {
      health.apis.restCountries = 'error';
      health.status = 'degraded';
    }

    return health;
  }
}

module.exports = GeographicDataService;