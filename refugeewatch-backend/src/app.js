/**
 * RefugeeWatch AI - Express Application (FINAL WORKING VERSION)
 * 
 * Main Express.js application setup with middleware and routes
 * This version fixes all import and middleware issues
 * 
 * @author RefugeeWatch AI Team
 * @version 1.0.0
 */

const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { swaggerSpec, swaggerUi } = require('./config/swagger');


// Import utilities and middleware
const logger = require('./utils/logger');
const { globalErrorHandler } = require('./middleware/errorHandler');

// Create Express application
const app = express();

// ===========================================
// SWAGGER OPENAPI SETUP
// ===========================================
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RefugeeWatch AI API',
      version: '2.1.0',
      description: 'AI-powered refugee crisis prediction and response system with real data',
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Local server' }
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API docs (JSDoc comments)
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }'
}));
// ===========================================
// SECURITY MIDDLEWARE
// ===========================================

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: [
        "'self'", 
        "https://api.gdeltproject.org", 
        "https://api.worldbank.org", 
        "https://earthquake.usgs.gov",
        "https://api.open-meteo.com",
        "https://newsapi.org",
        "https://content.guardianapis.com",
        "https://router.huggingface.co"
      ]
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:8080',  // Your frontend port
    'http://localhost:5173',
    'http://localhost:4173',
    process.env.CORS_ORIGIN || 'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['X-Request-ID']
};

app.use(cors(corsOptions));

// ===========================================
// GENERAL MIDDLEWARE
// ===========================================

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging with Morgan
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Request timing and tracking
app.use((req, res, next) => {
  req.startTime = Date.now();
  req.requestId = require('uuid').v4().substring(0, 8);
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', req.requestId);
  
  next();
});

// ===========================================
// HEALTH CHECK ENDPOINTS
// ===========================================

/**
 * Basic health check endpoint
 */
app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    version: require('../package.json').version,
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    }
  };
  
  res.json(healthStatus);
});

/**
 * Root endpoint - API information
 */
app.get('/', (req, res) => {
  res.json({
    name: 'RefugeeWatch AI Backend',
    version: require('../package.json').version,
    description: 'AI-powered refugee crisis prediction and response system',
    status: 'operational',
    features: [
      'Real-time crisis monitoring',
      'gpt-oss AI analysis and reasoning', 
      'Automated response plan generation',
      'Multi-source data aggregation',
      'WebSocket real-time updates',
      'Global displacement prediction'
    ],
    aiModels: {
      primary: process.env.HUGGINGFACE_MODEL || 'gpt-oss-20b:fireworks-ai',
      provider: 'Hugging Face Inference API',
      capabilities: ['Crisis analysis', 'Displacement prediction', 'Response planning']
    },
    endpoints: {
      health: '/health',
      api: '/api',
      crises: '/api/crisis',
      analysis: '/api/crisis/:id/analyze',
      plans: '/api/crisis/:id/plan'
    },
    timestamp: new Date().toISOString()
  });
});

// ===========================================
// API ROUTES
// ===========================================

// Try to load API routes, with fallback if they fail
let apiRoutes = null;
try {
  apiRoutes = require('./routes/api');
  app.use('/api', apiRoutes);
  logger.info('✅ API routes loaded successfully');
} catch (error) {
  logger.warn('⚠️ API routes failed to load, using minimal fallback:', error.message);
  
  // Minimal fallback API endpoints
  app.get('/api/status', (req, res) => {
    res.json({
      success: true,
      data: {
        status: 'operational',
        message: 'API routes in fallback mode',
        timestamp: new Date().toISOString()
      }
    });
  });

  // Crisis endpoint fallback
  app.get('/api/crisis', (req, res) => {
    res.json({
      success: true,
      data: {
        crises: [
          {
            id: 'sudan',
            country: 'Sudan',
            riskLevel: 'CRITICAL',
            confidence: 85,
            lastUpdate: new Date().toISOString(),
            summary: {
              displacementRisk: 'CRITICAL',
              estimatedAffected: 80000,
              timeline: '2-4 weeks',
              primaryCauses: ['Armed conflict', 'Economic collapse']
            }
          }
        ],
        summary: { total: 1, critical: 1, high: 0, medium: 0, low: 0 }
      },
      metadata: {
        dataQuality: 'FALLBACK',
        warnings: ['Using minimal fallback data']
      }
    });
  });

  // AI status endpoint
  app.get('/api/ai/status', async (req, res) => {
    try {
      const { testHuggingFaceConnection } = require('./config/huggingface');
      const connectionTest = await testHuggingFaceConnection();
      
      res.json({
        success: true,
        data: {
          status: connectionTest.success ? 'operational' : 'degraded',
          model: process.env.HUGGINGFACE_MODEL || 'gpt-oss-20b:fireworks-ai',
          provider: 'Hugging Face Inference API',
          performance: {
            averageResponseTime: connectionTest.responseTime || 0,
            availability: connectionTest.success ? '99.9%' : 'degraded'
          },
          lastTest: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: 'AI service health check failed',
        details: error.message
      });
    }
  });
}

// ===========================================
// 404 HANDLER FOR UNDEFINED ROUTES
// ===========================================

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: [
      'GET / - API information',
      'GET /health - Health check',
      'GET /api/status - System status',
      'GET /api/crisis - All crises',
      'GET /api/ai/status - AI service status'
    ],
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  });
});

// ===========================================
// GLOBAL ERROR HANDLER (MUST BE LAST)
// ===========================================

app.use(globalErrorHandler);

module.exports = app;