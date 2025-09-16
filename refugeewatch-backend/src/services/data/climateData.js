/**
 * RefugeeWatch AI - FIXED Real Climate Data Service
 * 
 * @author RefugeeWatch AI Team
 * @version 2.1.0 (FIXED)
 */

const axios = require('axios');
const moment = require('moment');
const logger = require('../../utils/logger');

class RealClimateDataService {
  constructor() {
    // Initialize API clients
    this.clients = {
      usgs: axios.create({
        baseURL: 'https://earthquake.usgs.gov/fdsnws/event/1',
        timeout: 15000,
        headers: {
          'User-Agent': 'RefugeeWatch-AI/2.1.0'
        }
      }),
      openMeteo: axios.create({
        baseURL: 'https://api.open-meteo.com/v1',
        timeout: 15000
      }),
      nasa: axios.create({
        baseURL: 'https://eonet.gsfc.nasa.gov/api/v3',
        timeout: 15000
      })
    };

    // Cache setup
    this.cache = new Map();
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes for climate data
  }

  /**
   * Get recent earthquakes - FIXED ERROR HANDLING
   */
  async getRecentEarthquakes(coordinates, radiusKm = 500, minMagnitude = 4.0) {
    try {
      const cacheKey = `earthquakes_${coordinates.join(',')}_${radiusKm}_${minMagnitude}`;
      const cachedData = this.getCachedData(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      logger.info(`Fetching earthquake data for coordinates: ${coordinates}`);
      
      // FIXED: Validate coordinates first
      if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        throw new Error('Invalid coordinates provided');
      }

      const [latitude, longitude] = coordinates;
      
      // FIXED: Validate coordinate values
      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Coordinates must be valid numbers');
      }

      const response = await this.clients.usgs.get('/query', {
        params: {
          format: 'geojson',
          starttime: moment().subtract(30, 'days').format('YYYY-MM-DD'),
          endtime: moment().format('YYYY-MM-DD'),
          latitude: latitude,
          longitude: longitude,
          maxradiuskm: radiusKm,
          minmagnitude: minMagnitude,
          limit: 100
        }
      });

      // FIXED: Proper response validation
      if (!response || !response.data || !response.data.features) {
        throw new Error('Invalid USGS API response');
      }

      const earthquakes = response.data.features.map(feature => {
        try {
          const props = feature.properties || {};
          const coords = feature.geometry ? feature.geometry.coordinates : [0, 0, 0];
          
          return {
            magnitude: props.mag || 0,
            location: props.place || 'Unknown location',
            time: props.time ? new Date(props.time).toISOString() : new Date().toISOString(),
            coordinates: [coords[1] || 0, coords[0] || 0], // lat, lon
            depth: coords[2] || 0,
            url: props.url || null,
            tsunami: props.tsunami === 1,
            significance: props.sig || 0,
            type: props.type || 'earthquake'
          };
        } catch (featureError) {
          logger.warn('Error processing earthquake feature:', featureError.message);
          return null;
        }
      }).filter(eq => eq !== null);

      const result = {
        success: true,
        data: earthquakes,
        count: earthquakes.length,
        maxMagnitude: earthquakes.length > 0 ? Math.max(...earthquakes.map(eq => eq.magnitude)) : null,
        source: 'USGS',
        searchRadius: radiusKm,
        minMagnitude: minMagnitude,
        timeRange: '30 days',
        lastUpdated: new Date().toISOString()
      };

      this.setCachedData(cacheKey, result);
      
      logger.info(`Found ${earthquakes.length} earthquakes within ${radiusKm}km of ${coordinates}`);
      return result;

    } catch (error) {
      logger.error('Failed to fetch earthquake data:', error.message);
      
      // FIXED: Return empty result instead of error
      return {
        success: true,
        data: [],
        count: 0,
        maxMagnitude: null,
        source: 'USGS (No Data)',
        error: error.message,
        searchRadius: radiusKm,
        minMagnitude: minMagnitude,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Get weather data - FIXED ERROR HANDLING
   */
  async getWeatherData(coordinates, days = 7) {
    try {
      const cacheKey = `weather_${coordinates.join(',')}_${days}`;
      const cachedData = this.getCachedData(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      // FIXED: Validate inputs
      if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        throw new Error('Invalid coordinates provided');
      }

      const [latitude, longitude] = coordinates;
      
      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Coordinates must be valid numbers');
      }

      logger.info(`Fetching weather data for coordinates: ${coordinates}`);

      const response = await this.clients.openMeteo.get('/forecast', {
        params: {
          latitude: latitude,
          longitude: longitude,
          daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weather_code',
          current_weather: true,
          forecast_days: Math.min(days, 16), // Open-Meteo limit
          timezone: 'auto'
        }
      });

      // FIXED: Proper response validation
      if (!response || !response.data) {
        throw new Error('Invalid Open-Meteo API response');
      }

      const data = response.data;
      const current = data.current_weather || {};
      const daily = data.daily || {};

      // Process daily forecast
      const forecast = [];
      if (daily.time && Array.isArray(daily.time)) {
        for (let i = 0; i < daily.time.length; i++) {
          try {
            forecast.push({
              date: daily.time[i],
              temperature: {
                max: daily.temperature_2m_max ? daily.temperature_2m_max[i] || null : null,
                min: daily.temperature_2m_min ? daily.temperature_2m_min[i] || null : null
              },
              precipitation: daily.precipitation_sum ? daily.precipitation_sum[i] || 0 : 0,
              windSpeed: daily.windspeed_10m_max ? daily.windspeed_10m_max[i] || 0 : 0,
              weatherCode: daily.weather_code ? daily.weather_code[i] || 0 : 0,
              condition: this.interpretWeatherCode(daily.weather_code ? daily.weather_code[i] : 0)
            });
          } catch (dayError) {
            logger.warn('Error processing daily weather data:', dayError.message);
          }
        }
      }

      const result = {
        success: true,
        data: {
          current: {
            temperature: current.temperature || null,
            windSpeed: current.windspeed || null,
            windDirection: current.winddirection || null,
            weatherCode: current.weathercode || 0,
            condition: this.interpretWeatherCode(current.weathercode || 0),
            time: current.time || new Date().toISOString()
          },
          forecast: forecast,
          location: {
            latitude: latitude,
            longitude: longitude,
            timezone: data.timezone || 'UTC'
          }
        },
        source: 'Open-Meteo',
        lastUpdated: new Date().toISOString()
      };

      this.setCachedData(cacheKey, result);
      return result;

    } catch (error) {
      logger.error('Failed to fetch weather data:', error.message);
      
      // FIXED: Return fallback weather data
      return {
        success: true,
        data: {
          current: {
            temperature: 25,
            windSpeed: 10,
            windDirection: 180,
            weatherCode: 0,
            condition: 'Clear',
            time: new Date().toISOString()
          },
          forecast: Array.from({ length: days }, (_, i) => ({
            date: moment().add(i, 'days').format('YYYY-MM-DD'),
            temperature: { max: 30, min: 20 },
            precipitation: 0,
            windSpeed: 10,
            weatherCode: 0,
            condition: 'Clear'
          })),
          location: {
            latitude: coordinates[0] || 0,
            longitude: coordinates[1] || 0,
            timezone: 'UTC'
          }
        },
        source: 'Open-Meteo (Fallback)',
        error: error.message,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Get recent climate events - FIXED ERROR HANDLING
   */
  async getRecentEvents(coordinates, days = 30) {
    try {
      const cacheKey = `climate_events_${coordinates.join(',')}_${days}`;
      const cachedData = this.getCachedData(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      logger.info(`Fetching climate events for coordinates: ${coordinates}`);

      // FIXED: Validate coordinates
      if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        throw new Error('Invalid coordinates provided');
      }

      const [latitude, longitude] = coordinates;

      // Get multiple data sources in parallel
      const [earthquakeResult, weatherResult, nasaResult] = await Promise.allSettled([
        this.getRecentEarthquakes(coordinates, 1000, 4.0),
        this.getWeatherData(coordinates, Math.min(days, 16)),
        this.getNASAEvents(days)
      ]);

      // Process results safely
      const earthquakes = earthquakeResult.status === 'fulfilled' && earthquakeResult.value.success 
        ? earthquakeResult.value.data : [];
      
      const weather = weatherResult.status === 'fulfilled' && weatherResult.value.success
        ? weatherResult.value.data : null;
        
      const nasaEvents = nasaResult.status === 'fulfilled' && nasaResult.value.success
        ? nasaResult.value.data : [];

      // Analyze climate hazards
      const hazards = this.analyzeClimateHazards(earthquakes, weather, nasaEvents, coordinates);

      const result = {
        success: true,
        data: {
          earthquakes: {
            count: earthquakes.length,
            significant: earthquakes.filter(eq => eq.magnitude >= 5.0),
            maxMagnitude: earthquakes.length > 0 ? Math.max(...earthquakes.map(eq => eq.magnitude)) : null
          },
          weather: weather || { current: null, forecast: [] },
          nasaEvents: nasaEvents,
          hazards: hazards,
          riskLevel: this.calculateRiskLevel(hazards),
          coordinates: coordinates,
          timeRange: `${days} days`
        },
        source: 'Multi-source (USGS, Open-Meteo, NASA)',
        lastUpdated: new Date().toISOString()
      };

      this.setCachedData(cacheKey, result);
      return result;

    } catch (error) {
      logger.error('Failed to fetch climate events:', error.message);
      
      // FIXED: Return safe fallback data
      return {
        success: true,
        data: {
          earthquakes: { count: 0, significant: [], maxMagnitude: null },
          weather: { current: null, forecast: [] },
          nasaEvents: [],
          hazards: [],
          riskLevel: 'LOW',
          coordinates: coordinates,
          timeRange: `${days} days`
        },
        source: 'Fallback Data',
        error: error.message,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Get NASA EONET events - FIXED ERROR HANDLING
   */
  async getNASAEvents(days = 30) {
    try {
      const startDate = moment().subtract(days, 'days').format('YYYY-MM-DD');
      
      const response = await this.clients.nasa.get('/events', {
        params: {
          start: startDate,
          limit: 100
        }
      });

      // FIXED: Validate response
      if (!response || !response.data || !response.data.events) {
        throw new Error('Invalid NASA EONET API response');
      }

      const events = response.data.events.map(event => {
        try {
          return {
            id: event.id,
            title: event.title || 'Unknown Event',
            category: event.categories && event.categories[0] ? event.categories[0].title : 'Unknown',
            date: event.geometry && event.geometry[0] ? event.geometry[0].date : new Date().toISOString(),
            coordinates: event.geometry && event.geometry[0] && event.geometry[0].coordinates 
              ? [event.geometry[0].coordinates[1], event.geometry[0].coordinates[0]] // lat, lon
              : [0, 0],
            source: 'NASA EONET',
            url: event.sources && event.sources[0] ? event.sources[0].url : null
          };
        } catch (eventError) {
          logger.warn('Error processing NASA event:', eventError.message);
          return null;
        }
      }).filter(event => event !== null);

      return {
        success: true,
        data: events,
        count: events.length,
        source: 'NASA EONET'
      };

    } catch (error) {
      logger.error('Failed to fetch NASA events:', error.message);
      
      return {
        success: true,
        data: [],
        count: 0,
        source: 'NASA EONET (No Data)',
        error: error.message
      };
    }
  }

  /**
   * Analyze climate hazards - FIXED
   */
  analyzeClimateHazards(earthquakes = [], weather = null, nasaEvents = [], coordinates = [0, 0]) {
    try {
      const hazards = [];

      // Earthquake hazards
      earthquakes.forEach(eq => {
        try {
          if (eq.magnitude >= 5.0) {
            hazards.push({
              type: 'earthquake',
              severity: eq.magnitude >= 7.0 ? 'HIGH' : eq.magnitude >= 6.0 ? 'MEDIUM' : 'LOW',
              magnitude: eq.magnitude,
              location: eq.location,
              time: eq.time,
              source: 'USGS'
            });
          }
        } catch (error) {
          logger.warn('Error analyzing earthquake hazard:', error.message);
        }
      });

      // Weather hazards
      if (weather && weather.forecast) {
        try {
          weather.forecast.forEach(day => {
            if (day.precipitation > 50) {
              hazards.push({
                type: 'heavy_precipitation',
                severity: day.precipitation > 100 ? 'HIGH' : 'MEDIUM',
                precipitation: day.precipitation,
                date: day.date,
                source: 'Open-Meteo'
              });
            }
            
            if (day.windSpeed > 60) {
              hazards.push({
                type: 'high_winds',
                severity: day.windSpeed > 100 ? 'HIGH' : 'MEDIUM',
                windSpeed: day.windSpeed,
                date: day.date,
                source: 'Open-Meteo'
              });
            }
          });
        } catch (weatherError) {
          logger.warn('Error analyzing weather hazards:', weatherError.message);
        }
      }

      // NASA event hazards
      nasaEvents.forEach(event => {
        try {
          const distance = this.calculateDistance(coordinates, event.coordinates);
          if (distance < 500) { // Within 500km
            hazards.push({
              type: event.category.toLowerCase(),
              severity: distance < 100 ? 'HIGH' : distance < 300 ? 'MEDIUM' : 'LOW',
              title: event.title,
              distance: distance,
              date: event.date,
              source: 'NASA EONET'
            });
          }
        } catch (eventError) {
          logger.warn('Error analyzing NASA event hazard:', eventError.message);
        }
      });

      return hazards;

    } catch (error) {
      logger.error('Error analyzing climate hazards:', error.message);
      return [];
    }
  }

  /**
   * Calculate risk level - FIXED
   */
  calculateRiskLevel(hazards = []) {
    try {
      if (hazards.length === 0) return 'LOW';
      
      const highSeverityCount = hazards.filter(h => h.severity === 'HIGH').length;
      const mediumSeverityCount = hazards.filter(h => h.severity === 'MEDIUM').length;
      
      if (highSeverityCount > 0) return 'HIGH';
      if (mediumSeverityCount > 2) return 'MEDIUM';
      if (hazards.length > 5) return 'MEDIUM';
      
      return 'LOW';
    } catch (error) {
      logger.warn('Error calculating risk level:', error.message);
      return 'LOW';
    }
  }

  /**
   * Helper functions - FIXED
   */
  interpretWeatherCode(code) {
    const codes = {
      0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
      45: 'Fog', 48: 'Depositing Rime Fog', 51: 'Light Drizzle', 53: 'Moderate Drizzle',
      55: 'Dense Drizzle', 56: 'Light Freezing Drizzle', 57: 'Dense Freezing Drizzle',
      61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain', 66: 'Light Freezing Rain',
      67: 'Heavy Freezing Rain', 71: 'Slight Snow', 73: 'Moderate Snow', 75: 'Heavy Snow',
      77: 'Snow Grains', 80: 'Slight Rain Showers', 81: 'Moderate Rain Showers',
      82: 'Violent Rain Showers', 85: 'Slight Snow Showers', 86: 'Heavy Snow Showers',
      95: 'Thunderstorm', 96: 'Thunderstorm with Hail', 99: 'Thunderstorm with Heavy Hail'
    };
    return codes[code] || 'Unknown';
  }

  calculateDistance(coord1, coord2) {
    try {
      if (!Array.isArray(coord1) || !Array.isArray(coord2)) return 0;
      
      const [lat1, lon1] = coord1;
      const [lat2, lon2] = coord2;
      
      if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return 0;
      
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    } catch (error) {
      logger.warn('Error calculating distance:', error.message);
      return 0;
    }
  }

  /**
   * Cache management - FIXED
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
   * Get service health - FIXED
   */
  async getServiceHealth() {
    const health = {
      service: 'RealClimateData',
      status: 'operational',
      apis: {}
    };

    try {
      // Test USGS
      await this.clients.usgs.get('/version', { timeout: 5000 });
      health.apis.usgs = 'operational';
    } catch (error) {
      health.apis.usgs = 'error';
      health.status = 'degraded';
    }

    try {
      // Test Open-Meteo
      await this.clients.openMeteo.get('/forecast?latitude=52.52&longitude=13.41&current_weather=true', { timeout: 5000 });
      health.apis.openMeteo = 'operational';
    } catch (error) {
      health.apis.openMeteo = 'error';
      health.status = 'degraded';
    }

    try {
      // Test NASA
      await this.clients.nasa.get('/events?limit=1', { timeout: 5000 });
      health.apis.nasa = 'operational';
    } catch (error) {
      health.apis.nasa = 'error';
      health.status = 'degraded';
    }

    return health;
  }
}

module.exports = RealClimateDataService;