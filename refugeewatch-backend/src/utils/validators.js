// src/utils/validators.js - COMPLETE Input Validation System
const { body, query, param, validationResult } = require('express-validator');

// Validation result handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Crisis validation rules
const crisisValidation = [
  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters')
    .trim(),
    
  body('type')
    .isIn([
      'conflict', 'natural_disaster', 'economic_crisis', 'climate_migration',
      'health_emergency', 'political_instability', 'food_insecurity',
      'industrial_disaster', 'social_unrest', 'compound_crisis'
    ])
    .withMessage('Invalid crisis type'),
    
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters')
    .trim(),
    
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters')
    .trim(),
    
  body('severity')
    .isIn(['LOW', 'MODERATE', 'HIGH', 'CRITICAL'])
    .withMessage('Severity must be LOW, MODERATE, HIGH, or CRITICAL'),
    
  body('populationAffected')
    .isInt({ min: 1, max: 1000000000 })
    .withMessage('Population affected must be a positive integer'),
    
  body('coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [longitude, latitude]')
    .custom((coordinates) => {
      if (coordinates) {
        const [lng, lat] = coordinates;
        if (typeof lng !== 'number' || typeof lat !== 'number') {
          throw new Error('Coordinates must be numbers');
        }
        if (lng < -180 || lng > 180) {
          throw new Error('Longitude must be between -180 and 180');
        }
        if (lat < -90 || lat > 90) {
          throw new Error('Latitude must be between -90 and 90');
        }
      }
      return true;
    }),
    
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date')
    .custom((date) => {
      if (date && new Date(date) > new Date()) {
        throw new Error('Start date cannot be in the future');
      }
      return true;
    }),
    
  body('keyFactors')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Key factors must be an array with maximum 20 items'),
    
  body('affectedAreas')
    .optional()
    .isArray({ max: 50 })
    .withMessage('Affected areas must be an array with maximum 50 items'),
    
  body('vulnerableGroups')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Vulnerable groups must be an array with maximum 20 items')
];

// Crisis update validation (more lenient)
const crisisUpdateValidation = [
  body('severity')
    .optional()
    .isIn(['LOW', 'MODERATE', 'HIGH', 'CRITICAL'])
    .withMessage('Severity must be LOW, MODERATE, HIGH, or CRITICAL'),
    
  body('status')
    .optional()
    .isIn(['ACTIVE', 'RECOVERING', 'RESOLVED', 'MONITORING'])
    .withMessage('Status must be ACTIVE, RECOVERING, RESOLVED, or MONITORING'),
    
  body('populationAffected')
    .optional()
    .isInt({ min: 1, max: 1000000000 })
    .withMessage('Population affected must be a positive integer'),
    
  body('description')
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters')
    .trim()
];

// Prediction validation rules
const predictionValidation = [
  body('crisisId')
    .notEmpty()
    .withMessage('Crisis ID is required')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Crisis ID must contain only alphanumeric characters, hyphens, and underscores'),
    
  body('predictionType')
    .optional()
    .isIn(['displacement', 'escalation', 'duration', 'impact'])
    .withMessage('Prediction type must be displacement, escalation, duration, or impact'),
    
  body('timeframe')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('Timeframe must be between 3 and 50 characters'),
    
  body('confidence')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Confidence must be a number between 0 and 1'),
    
  body('estimatedNumbers')
    .optional()
    .isInt({ min: 0, max: 1000000000 })
    .withMessage('Estimated numbers must be a non-negative integer')
];

// Alert validation rules
const alertValidation = [
  body('crisisId')
    .notEmpty()
    .withMessage('Crisis ID is required'),
    
  body('type')
    .isIn(['URGENT', 'WARNING', 'INFO', 'UPDATE'])
    .withMessage('Alert type must be URGENT, WARNING, INFO, or UPDATE'),
    
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters')
    .trim(),
    
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
    .trim(),
    
  body('severity')
    .isIn(['LOW', 'MODERATE', 'HIGH', 'CRITICAL'])
    .withMessage('Severity must be LOW, MODERATE, HIGH, or CRITICAL'),
    
  body('targetAudience')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Target audience must be an array with maximum 20 items'),
    
  body('validUntil')
    .optional()
    .isISO8601()
    .withMessage('Valid until must be a valid ISO 8601 date')
    .custom((date) => {
      if (date && new Date(date) <= new Date()) {
        throw new Error('Valid until date must be in the future');
      }
      return true;
    }),
    
  body('recommendedActions')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Recommended actions must be an array with maximum 10 items')
];

// User validation rules
const userValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim()
    .matches(/^[a-zA-Z\s.\-']+$/)
    .withMessage('Name can only contain letters, spaces, periods, hyphens, and apostrophes'),
    
  body('email')
    .isEmail()
    .withMessage('Valid email address is required')
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage('Email address is too long'),
    
  body('role')
    .optional()
    .isIn([
      'Humanitarian Coordinator', 'Emergency Coordinator', 'Field Officer',
      'Analyst', 'Program Manager', 'Operations Manager', 'Protection Officer',
      'Logistics Officer', 'Communications Officer', 'Administrator'
    ])
    .withMessage('Invalid role'),
    
  body('organization')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Organization must be between 2 and 100 characters')
    .trim(),
    
  body('expertise')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Expertise must be an array with maximum 20 items'),
    
  body('regions')
    .optional()
    .isArray({ max: 50 })
    .withMessage('Regions must be an array with maximum 50 items'),
    
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences must be an object'),
    
  body('preferences.notifications')
    .optional()
    .isArray()
    .withMessage('Notification preferences must be an array'),
    
  body('preferences.crisisTypes')
    .optional()
    .isArray()
    .withMessage('Crisis type preferences must be an array'),
    
  body('preferences.alertChannels')
    .optional()
    .isArray()
    .withMessage('Alert channel preferences must be an array')
];

// Report validation rules
const reportValidation = [
  body('type')
    .isIn(['crisis_summary', 'displacement_analysis', 'response_plan', 'situation_update', 'donor_briefing'])
    .withMessage('Invalid report type'),
    
  body('crisisId')
    .optional()
    .notEmpty()
    .withMessage('Crisis ID cannot be empty if provided'),
    
  body('format')
    .optional()
    .isIn(['html', 'pdf', 'markdown', 'word', 'csv'])
    .withMessage('Format must be html, pdf, markdown, word, or csv'),
    
  body('includeAnalysis')
    .optional()
    .isBoolean()
    .withMessage('Include analysis must be a boolean'),
    
  body('includePredictions')
    .optional()
    .isBoolean()
    .withMessage('Include predictions must be a boolean'),
    
  body('customSections')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Custom sections must be an array with maximum 20 items')
];

// Scenario validation rules
const scenarioValidation = [
  body('baseDataId')
    .notEmpty()
    .withMessage('Base data ID is required'),
    
  body('modifications')
    .isObject()
    .withMessage('Modifications must be an object')
    .custom((modifications) => {
      const allowedKeys = [
        'name', 'severity', 'populationAffected', 'type', 'duration',
        'geographicSpread', 'externalFactors', 'interventions'
      ];
      const invalidKeys = Object.keys(modifications).filter(key => !allowedKeys.includes(key));
      if (invalidKeys.length > 0) {
        throw new Error(`Invalid modification keys: ${invalidKeys.join(', ')}`);
      }
      return true;
    }),
    
  body('name')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Scenario name must be between 3 and 200 characters')
    .trim(),
    
  body('description')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
    .trim(),
    
  body('simulationType')
    .optional()
    .isIn(['displacement', 'escalation', 'response', 'intervention'])
    .withMessage('Simulation type must be displacement, escalation, response, or intervention')
];

// Query parameter validations
const paginationValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
    
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
    
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('sortBy')
    .optional()
    .isIn(['date', 'severity', 'population', 'name', 'status', 'type'])
    .withMessage('Sort by must be date, severity, population, name, status, or type'),
    
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

const filterValidation = [
  query('type')
    .optional()
    .isIn([
      'conflict', 'natural_disaster', 'economic_crisis', 'climate_migration',
      'health_emergency', 'political_instability', 'food_insecurity',
      'industrial_disaster', 'social_unrest', 'compound_crisis'
    ])
    .withMessage('Invalid crisis type filter'),
    
  query('severity')
    .optional()
    .isIn(['LOW', 'MODERATE', 'HIGH', 'CRITICAL'])
    .withMessage('Severity filter must be LOW, MODERATE, HIGH, or CRITICAL'),
    
  query('status')
    .optional()
    .isIn(['ACTIVE', 'RECOVERING', 'RESOLVED', 'MONITORING'])
    .withMessage('Status filter must be ACTIVE, RECOVERING, RESOLVED, or MONITORING'),
    
  query('region')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Region filter must be between 2 and 100 characters'),
    
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date filter must be a valid ISO 8601 date'),
    
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date filter must be a valid ISO 8601 date')
    .custom((endDate, { req }) => {
      if (endDate && req.query.startDate && new Date(endDate) <= new Date(req.query.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
    
  query('minPopulation')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Minimum population must be a positive integer'),
    
  query('maxPopulation')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum population must be a positive integer')
    .custom((maxPop, { req }) => {
      if (maxPop && req.query.minPopulation && parseInt(maxPop) <= parseInt(req.query.minPopulation)) {
        throw new Error('Maximum population must be greater than minimum population');
      }
      return true;
    })
];

// ID parameter validation
const idValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID parameter is required')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('ID must contain only alphanumeric characters, hyphens, and underscores')
    .isLength({ min: 1, max: 100 })
    .withMessage('ID must be between 1 and 100 characters')
];

// Search validation
const searchValidation = [
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Search query must be between 2 and 200 characters')
    .trim()
    .escape() // Escape HTML characters for security
];

// Analysis request validation
const analysisValidation = [
  body('analysisType')
    .optional()
    .isIn(['comprehensive', 'displacement', 'quick', 'detailed'])
    .withMessage('Analysis type must be comprehensive, displacement, quick, or detailed'),
    
  body('includeProjections')
    .optional()
    .isBoolean()
    .withMessage('Include projections must be a boolean'),
    
  body('timeHorizon')
    .optional()
    .isIn(['short', 'medium', 'long'])
    .withMessage('Time horizon must be short, medium, or long'),
    
  body('confidenceThreshold')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Confidence threshold must be between 0 and 1')
];

// Notification preferences validation
const notificationPreferencesValidation = [
  body('channels')
    .isArray({ min: 1 })
    .withMessage('At least one notification channel must be selected'),
    
  body('channels.*')
    .isIn(['email', 'sms', 'push', 'webhook'])
    .withMessage('Invalid notification channel'),
    
  body('severityLevels')
    .isArray({ min: 1 })
    .withMessage('At least one severity level must be selected'),
    
  body('severityLevels.*')
    .isIn(['LOW', 'MODERATE', 'HIGH', 'CRITICAL'])
    .withMessage('Invalid severity level'),
    
  body('crisisTypes')
    .optional()
    .isArray()
    .withMessage('Crisis types must be an array'),
    
  body('regions')
    .optional()
    .isArray()
    .withMessage('Regions must be an array'),
    
  body('frequency')
    .optional()
    .isIn(['immediate', 'hourly', 'daily', 'weekly'])
    .withMessage('Frequency must be immediate, hourly, daily, or weekly'),
    
  body('quietHours')
    .optional()
    .isObject()
    .withMessage('Quiet hours must be an object'),
    
  body('quietHours.enabled')
    .optional()
    .isBoolean()
    .withMessage('Quiet hours enabled must be a boolean'),
    
  body('quietHours.start')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Quiet hours start must be in HH:MM format'),
    
  body('quietHours.end')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Quiet hours end must be in HH:MM format')
];

// File upload validation
const fileUploadValidation = [
  body('fileType')
    .optional()
    .isIn(['csv', 'excel', 'json', 'xml'])
    .withMessage('File type must be csv, excel, json, or xml'),
    
  body('maxSize')
    .optional()
    .isInt({ min: 1, max: 52428800 }) // 50MB max
    .withMessage('Max file size must be between 1 byte and 50MB')
];

// Custom validation functions
const validateCoordinates = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    return false;
  }
  const [lng, lat] = coordinates;
  return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
};

const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end && start <= new Date();
};

const validateSeverityLevel = (severity) => {
  const levels = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
  return levels.includes(severity);
};

const validateCrisisType = (type) => {
  const validTypes = [
    'conflict', 'natural_disaster', 'economic_crisis', 'climate_migration',
    'health_emergency', 'political_instability', 'food_insecurity',
    'industrial_disaster', 'social_unrest', 'compound_crisis'
  ];
  return validTypes.includes(type);
};

const validateEmailFormat = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/[<>'"&]/g, (match) => {
    const escapeMap = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;'
    };
    return escapeMap[match];
  });
};

// Validation rule sets for different endpoints
const validationRuleSets = {
  createCrisis: crisisValidation,
  updateCrisis: crisisUpdateValidation,
  createPrediction: predictionValidation,
  createAlert: alertValidation,
  createUser: userValidation,
  generateReport: reportValidation,
  createScenario: scenarioValidation,
  search: searchValidation,
  requestAnalysis: analysisValidation,
  updateNotificationPreferences: notificationPreferencesValidation,
  uploadFile: fileUploadValidation,
  pagination: paginationValidation,
  filter: filterValidation,
  id: idValidation
};

module.exports = {
  // Validation rule sets
  crisisValidation,
  crisisUpdateValidation,
  predictionValidation,
  alertValidation,
  userValidation,
  reportValidation,
  scenarioValidation,
  paginationValidation,
  filterValidation,
  searchValidation,
  analysisValidation,
  notificationPreferencesValidation,
  fileUploadValidation,
  idValidation,
  
  // Validation middleware
  handleValidationErrors,
  
  // Custom validation functions
  validateCoordinates,
  validateDateRange,
  validateSeverityLevel,
  validateCrisisType,
  validateEmailFormat,
  validatePhoneNumber,
  validateURL,
  sanitizeInput,
  
  // Rule sets for easy access
  validationRuleSets
};