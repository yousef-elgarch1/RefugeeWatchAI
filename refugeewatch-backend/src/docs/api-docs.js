



/**
 * RefugeeWatch AI - API Routes with Swagger Documentation
 * @swagger components and route definitions
 */

/**
 * @swagger
 * /api:
 *   get:
 *     summary: API Documentation and Information
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API information and available endpoints
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "RefugeeWatch AI API"
 *                 version:
 *                   type: string
 *                   example: "2.1.0"
 *                 description:
 *                   type: string
 *                 documentation:
 *                   type: object
 *                 dataSources:
 *                   type: array
 *                   items:
 *                     type: string
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health Check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: "2.1.0"
 *                 uptime:
 *                   type: number
 *                   description: "Server uptime in seconds"
 *                 memory:
 *                   type: object
 *                   properties:
 *                     used:
 *                       type: number
 *                     total:
 *                       type: number
 */

/**
 * @swagger
 * /api/crisis:
 *   get:
 *     summary: Get All Active Crises
 *     description: Retrieve all active refugee crises with real UNHCR and geographic data
 *     tags: [Crisis]
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Filter by geographic region
 *         example: "Asia"
 *       - in: query
 *         name: riskLevel
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *         description: Filter by crisis risk level
 *         example: "HIGH"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of results
 *         example: 10
 *     responses:
 *       200:
 *         description: List of active crises
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         crises:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Crisis'
 *                         summary:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: number
 *                             critical:
 *                               type: number
 *                             high:
 *                               type: number
 *                             medium:
 *                               type: number
 *                             low:
 *                               type: number
 *                             totalDisplaced:
 *                               type: number
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/crisis/geographical:
 *   get:
 *     summary: Get Geographical Crisis Data
 *     description: Retrieve crisis data formatted for mapping and geographical visualization
 *     tags: [Crisis]
 *     parameters:
 *       - in: query
 *         name: bounds
 *         schema:
 *           type: string
 *         description: Map bounds for filtering (lat1,lng1,lat2,lng2)
 *         example: "10,20,30,40"
 *       - in: query
 *         name: riskFilter
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *         description: Filter locations by risk level
 *     responses:
 *       200:
 *         description: Geographical crisis locations
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         locations:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               coordinates:
 *                                 type: array
 *                                 items:
 *                                   type: number
 *                               displacement:
 *                                 type: number
 *                               riskLevel:
 *                                 type: string
 *                         count:
 *                           type: number
 *                         totalDisplaced:
 *                           type: number
 *                         riskDistribution:
 *                           type: object
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/crisis/{id}:
 *   get:
 *     summary: Get Detailed Crisis Analysis
 *     description: Get comprehensive crisis information for a specific country
 *     tags: [Crisis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Country name or code
 *         example: "Sudan"
 *     responses:
 *       200:
 *         description: Detailed crisis information
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Crisis'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/crisis/metrics/global:
 *   get:
 *     summary: Get Global Crisis Metrics
 *     description: Retrieve global displacement statistics and crisis metrics
 *     tags: [Crisis]
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *         description: Time period for metrics
 *         example: "7d"
 *     responses:
 *       200:
 *         description: Global crisis metrics and statistics
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         overview:
 *                           type: object
 *                           properties:
 *                             totalCountriesMonitored:
 *                               type: number
 *                             totalDisplaced:
 *                               type: number
 *                             totalRefugees:
 *                               type: number
 *                             totalInternal:
 *                               type: number
 *                         displacement:
 *                           type: object
 *                         riskDistribution:
 *                           type: object
 *                         trends:
 *                           type: object
 */

/**
 * @swagger
 * /api/countries:
 *   get:
 *     summary: Get All Countries
 *     description: Retrieve all countries with real geographic coordinates from REST Countries API
 *     tags: [Geographic]
 *     responses:
 *       200:
 *         description: List of all countries with geographic data
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Country'
 *                     count:
 *                       type: number
 */

/**
 * @swagger
 * /api/countries/{name}:
 *   get:
 *     summary: Get Specific Country Data
 *     description: Retrieve detailed information for a specific country
 *     tags: [Geographic]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Country name
 *         example: "Syria"
 *     responses:
 *       200:
 *         description: Country information
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Country'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /api/countries/region/{region}:
 *   get:
 *     summary: Get Countries by Region
 *     description: Retrieve all countries in a specific geographic region
 *     tags: [Geographic]
 *     parameters:
 *       - in: path
 *         name: region
 *         required: true
 *         schema:
 *           type: string
 *         description: Region name
 *         example: "Africa"
 *     responses:
 *       200:
 *         description: Countries in the specified region
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Country'
 */

/**
 * @swagger
 * /api/refugees/unhcr:
 *   get:
 *     summary: Get All UNHCR Refugee Data
 *     description: Retrieve comprehensive refugee and displacement data from UNHCR official sources
 *     tags: [Refugee]
 *     responses:
 *       200:
 *         description: Complete UNHCR refugee dataset
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RefugeeData'
 *                     totalDisplaced:
 *                       type: number
 *                     totalRefugees:
 *                       type: number
 *                     totalInternal:
 *                       type: number
 *                     count:
 *                       type: number
 */

/**
 * @swagger
 * /api/refugees/unhcr/{country}:
 *   get:
 *     summary: Get UNHCR Data for Specific Country
 *     description: Retrieve refugee and displacement data for a specific country
 *     tags: [Refugee]
 *     parameters:
 *       - in: path
 *         name: country
 *         required: true
 *         schema:
 *           type: string
 *         description: Country name
 *         example: "Syria"
 *     responses:
 *       200:
 *         description: Country-specific refugee data
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/RefugeeData'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /api/refugees/unhcr/stats/global:
 *   get:
 *     summary: Get Global Displacement Statistics
 *     description: Retrieve global refugee and displacement statistics from UNHCR
 *     tags: [Refugee]
 *     responses:
 *       200:
 *         description: Global displacement statistics
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalDisplaced:
 *                           type: number
 *                         totalRefugees:
 *                           type: number
 *                         totalInternal:
 *                           type: number
 *                         countriesAffected:
 *                           type: number
 *                         topOriginCountries:
 *                           type: array
 */

/**
 * @swagger
 * /api/climate/earthquakes:
 *   get:
 *     summary: Get Earthquake Data
 *     description: Retrieve recent earthquake data from USGS for specified coordinates
 *     tags: [Climate]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude
 *         example: 34.8
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude
 *         example: 38.9
 *       - in: query
 *         name: radius
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 2000
 *         description: Search radius in kilometers
 *         example: 500
 *       - in: query
 *         name: minMagnitude
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 10
 *         description: Minimum earthquake magnitude
 *         example: 4.0
 *     responses:
 *       200:
 *         description: Earthquake data from USGS
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ClimateEvent'
 *                     count:
 *                       type: number
 *                     maxMagnitude:
 *                       type: number
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */

/**
 * @swagger
 * /api/climate/weather:
 *   get:
 *     summary: Get Weather Data
 *     description: Retrieve weather forecast from Open-Meteo API
 *     tags: [Climate]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 16
 *         description: Number of forecast days
 *         example: 7
 *     responses:
 *       200:
 *         description: Weather forecast data
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: object
 *                         forecast:
 *                           type: array
 *                         location:
 *                           type: object
 */

/**
 * @swagger
 * /api/climate/events:
 *   get:
 *     summary: Get Climate Events
 *     description: Retrieve comprehensive climate events from multiple sources (USGS, Open-Meteo, NASA)
 *     tags: [Climate]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 90
 *         description: Time range in days
 *         example: 30
 *     responses:
 *       200:
 *         description: Comprehensive climate events data
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         earthquakes:
 *                           type: object
 *                         weather:
 *                           type: object
 *                         nasaEvents:
 *                           type: array
 *                         hazards:
 *                           type: array
 *                         riskLevel:
 *                           type: string
 */

/**
 * @swagger
 * /api/news/crisis:
 *   get:
 *     summary: Get Crisis News
 *     description: Search for crisis-related news from NewsAPI and Guardian
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         description: Search query
 *         example: "refugee crisis"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Maximum number of articles
 *         example: 20
 *     responses:
 *       200:
 *         description: Crisis news articles
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           url:
 *                             type: string
 *                           publishedAt:
 *                             type: string
 *                             format: date-time
 *                           source:
 *                             type: string
 *                     count:
 *                       type: number
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */

/**
 * @swagger
 * /api/ai/status:
 *   get:
 *     summary: Get AI Service Status
 *     description: Check the status of the AI analysis service
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: AI service status and capabilities
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: "operational"
 *                         model:
 *                           type: string
 *                         provider:
 *                           type: string
 *                         capabilities:
 *                           type: array
 *                           items:
 *                             type: string
 *                         performance:
 *                           type: object
 */


/**
 * @swagger
 * /api/ai/status:
 *   get:
 *     summary: Get AI Service Status
 *     description: Retrieve current status and capabilities of the AI analysis service
 *     tags: [AI Service]
 *     responses:
 *       200:
 *         description: AI service status information
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [operational, degraded, offline]
 *                           example: "operational"
 *                         model:
 *                           type: string
 *                           example: "gpt-oss-20b:fireworks-ai"
 *                         provider:
 *                           type: string
 *                           example: "Hugging Face Inference API"
 *                         capabilities:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["Crisis Analysis", "Response Planning", "Risk Assessment"]
 *                         performance:
 *                           type: object
 *                           properties:
 *                             averageResponseTime:
 *                               type: number
 *                               example: 2500
 *                             availability:
 *                               type: string
 *                               example: "99.9%"
 *                         lastTest:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-09-14T01:57:32.853Z"
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */

/**
 * @swagger
 * /api/crisis/{id}/analyze:
 *   post:
 *     summary: Run AI Analysis on Crisis
 *     description: Generate comprehensive AI-powered analysis for a specific crisis
 *     tags: [Crisis Analysis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Crisis/Country identifier
 *         example: "Sudan"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               analysisType:
 *                 type: string
 *                 enum: [full, quick, focused]
 *                 example: "full"
 *               focusAreas:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["displacement", "climate", "security"]
 *     responses:
 *       200:
 *         description: AI analysis results
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AIAnalysis'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */

/**
 * @swagger
 * /api/crisis/{id}/plan:
 *   post:
 *     summary: Generate Response Plan
 *     description: Create AI-generated humanitarian response plan for a crisis
 *     tags: [Response Planning]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Crisis/Country identifier
 *         example: "Sudan"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planType:
 *                 type: string
 *                 enum: [emergency, comprehensive, long-term]
 *                 example: "comprehensive"
 *               budget:
 *                 type: number
 *                 description: Available budget in USD
 *                 example: 20000000
 *               timeline:
 *                 type: string
 *                 description: Desired timeline for plan execution
 *                 example: "12 months"
 *               priorities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["shelter", "healthcare", "education"]
 *     responses:
 *       200:
 *         description: Generated response plan
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/APIResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ResponsePlan'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AIAnalysis:
 *       type: object
 *       properties:
 *         overallRisk:
 *           type: string
 *           enum: [CRITICAL, HIGH, MEDIUM, LOW]
 *           example: "HIGH"
 *         confidence:
 *           type: number
 *           minimum: 0
 *           maximum: 1
 *           example: 0.87
 *         keyFindings:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Displacement levels have increased 23% in past 6 months", "Climate events increasing displacement pressure"]
 *         recommendations:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Increase emergency aid allocation by 40%", "Establish temporary refugee processing centers"]
 *         priorityActions:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Immediate food and medical supply distribution", "Emergency shelter construction"]
 *         lastAnalyzed:
 *           type: string
 *           format: date-time
 *           example: "2025-09-14T01:57:32.853Z"
 *     
 *     ResponsePlan:
 *       type: object
 *       properties:
 *         planId:
 *           type: string
 *           example: "PLAN-Sudan-1726270652853"
 *         crisis:
 *           type: string
 *           example: "Sudan"
 *         priority:
 *           type: string
 *           enum: [CRITICAL, HIGH, MEDIUM, LOW]
 *           example: "HIGH"
 *         estimatedCost:
 *           type: number
 *           description: Total estimated cost in USD
 *           example: 15000000
 *         timeline:
 *           type: string
 *           example: "6 months"
 *         phases:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PlanPhase'
 *         generatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-09-14T01:57:32.853Z"
 *     
 *     PlanPhase:
 *       type: object
 *       properties:
 *         phase:
 *           type: string
 *           example: "Immediate Response (0-30 days)"
 *         actions:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Deploy emergency response teams", "Establish refugee registration centers"]
 *         budget:
 *           type: number
 *           example: 5000000
 *     
 *     ClimateEvents:
 *       type: object
 *       properties:
 *         earthquakes:
 *           type: object
 *           properties:
 *             count:
 *               type: integer
 *               example: 3
 *             significant:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EarthquakeEvent'
 *             maxMagnitude:
 *               type: number
 *               nullable: true
 *               example: 5.2
 *         weather:
 *           type: object
 *           properties:
 *             current:
 *               $ref: '#/components/schemas/CurrentWeather'
 *             forecast:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WeatherForecast'
 *             location:
 *               $ref: '#/components/schemas/WeatherLocation'
 *         nasaEvents:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               coordinates:
 *                 type: array
 *                 items:
 *                   type: number
 *         riskLevel:
 *           type: string
 *           enum: [CRITICAL, HIGH, MEDIUM, LOW]
 *           example: "MEDIUM"
 *         hazards:
 *           type: array
 *           items:
 *             type: string
 *           example: []
 *         coordinates:
 *           type: array
 *           items:
 *             type: number
 *           minItems: 2
 *           maxItems: 2
 *           example: [34.8, 38.9]
 *         timeRange:
 *           type: string
 *           example: "30 days"
 *     
 *     EarthquakeEvent:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           example: "earthquake"
 *         magnitude:
 *           type: number
 *           example: 5.2
 *         location:
 *           type: string
 *           example: "Central Turkey"
 *         time:
 *           type: string
 *           format: date-time
 *           example: "2025-09-12T14:30:00Z"
 *         coordinates:
 *           type: array
 *           items:
 *             type: number
 *           minItems: 2
 *           maxItems: 2
 *           example: [37.166, 37.032]
 *     
 *     CurrentWeather:
 *       type: object
 *       properties:
 *         temperature:
 *           type: number
 *           example: 27
 *         windSpeed:
 *           type: number
 *           example: 10
 *         windDirection:
 *           type: number
 *           example: 300
 *         weatherCode:
 *           type: integer
 *           example: 0
 *         condition:
 *           type: string
 *           example: "Clear"
 *         time:
 *           type: string
 *           example: "2025-09-14T04:45"
 *     
 *     WeatherForecast:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *           example: "2025-09-14"
 *         temperature:
 *           type: object
 *           properties:
 *             max:
 *               type: number
 *               example: 35.6
 *             min:
 *               type: number
 *               example: 26.3
 *         precipitation:
 *           type: number
 *           example: 0
 *         windSpeed:
 *           type: number
 *           example: 20.8
 *         weatherCode:
 *           type: integer
 *           example: 0
 *         condition:
 *           type: string
 *           example: "Clear"
 *     
 *     WeatherLocation:
 *       type: object
 *       properties:
 *         latitude:
 *           type: number
 *           example: 34.8
 *         longitude:
 *           type: number
 *           example: 38.9
 *         timezone:
 *           type: string
 *           example: "Asia/Damascus"
 *   
 *   responses:
 *     ServiceUnavailable:
 *       description: Service temporarily unavailable
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/APIResponse'
 *               - type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: false
 *                   error:
 *                     type: string
 *                     example: "AI service unavailable"
 *                   details:
 *                     type: string
 *                     example: "Service initialization failed"
 * */