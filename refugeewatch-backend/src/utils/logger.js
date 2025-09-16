/**
 * RefugeeWatch AI - Professional Logger System
 * 
 * Enhanced logging with colors, detailed error tracking, and structured output
 * Replace your existing utils/logger.js with this professional implementation
 * 
 * @version 2.0.0 - Professional Logging System
 */

const { format: _format, createLogger, transports: _transports } = require('winston');
const { bold, blue, gray, cyan, magenta, green, purple, orange, bgRed, bgYellow, bgBlue, bgGreen, yellow, white } = require('chalk');
const { join } = require('path');

// Color scheme for different log levels and contexts
const colors = {
  // Log levels
  error: bold.red,
  warn: bold.yellow,
  info: blue,
  debug: gray,
  success: bold.green,
  
  // Context colors
  api: cyan,
  database: magenta,
  service: green,
  ai: purple,
  external: orange,
  
  // Status colors
  critical: bgRed.white,
  high: bgYellow.black,
  medium: bgBlue.white,
  low: bgGreen.black,
  
  // Special colors
  timestamp: gray,
  endpoint: bold.cyan,
  duration: yellow,
  status: bold,
  data: white
};

// Professional log formatting
const createFormatter = (colorize = true) => {
  return _format.combine(
    _format.timestamp({ format: 'HH:mm:ss.SSS' }),
    _format.errors({ stack: true }),
    _format.json(),
    _format.printf((info) => {
      const { timestamp, level, message, service = 'refugeewatch', ...meta } = info;
      
      if (!colorize) {
        return `[${timestamp}] ${level.toUpperCase()}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
      }

      // Colored timestamp
      const coloredTimestamp = colors.timestamp(`[${timestamp}]`);
      
      // Colored level with icons
      const levelIcons = {
        error: '🚨',
        warn: '⚠️ ',
        info: 'ℹ️ ',
        debug: '🔍',
        success: '✅'
      };
      
      const levelColor = colors[level] || white;
      const coloredLevel = levelColor(`${levelIcons[level] || ''}${level.toUpperCase()}`);
      
      // Service context
      const serviceTag = colors.service(`[${service.toUpperCase()}]`);
      
      // Format message with context
      let formattedMessage = message;
      
      // Special formatting for API calls
      if (meta.method && meta.endpoint) {
        formattedMessage = `${colors.api(meta.method)} ${colors.endpoint(meta.endpoint)} ${colors.status(meta.status || '')}`;
        if (meta.duration) {
          formattedMessage += ` ${colors.duration(`(${meta.duration}ms)`)}`;
        }
      }
      
      // Special formatting for errors
      if (level === 'error' && meta.stack) {
        formattedMessage += `\n${colors.error('Stack Trace:')}\n${meta.stack}`;
      }
      
      // Special formatting for external API calls
      if (meta.apiName) {
        formattedMessage = `${colors.external('🌐 External API:')} ${colors.api(meta.apiName)} ${formattedMessage}`;
      }
      
      // Special formatting for database operations
      if (meta.query) {
        formattedMessage = `${colors.database('🗄️  Database:')} ${formattedMessage}`;
      }
      
      // Special formatting for AI operations
      if (meta.model || meta.aiOperation) {
        formattedMessage = `${colors.ai('🤖 AI:')} ${formattedMessage}`;
      }
      
      // Add metadata if present
      const metaString = Object.keys(meta).length > 0 ? 
        `\n${colors.data('📊 Data:')} ${JSON.stringify(meta, null, 2)}` : '';
      
      return `${coloredTimestamp} ${serviceTag} ${coloredLevel} ${formattedMessage}${metaString}`;
    })
  );
};

// Create Winston logger instance
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    // Console transport with colors
    new _transports.Console({
      format: createFormatter(true),
      handleExceptions: true,
      handleRejections: true
    }),
    
    // File transport for errors
    new _transports.File({
      filename: join(__dirname, '../logs/error.log'),
      level: 'error',
      format: createFormatter(false),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // File transport for all logs
    new _transports.File({
      filename: join(__dirname, '../logs/combined.log'),
      format: createFormatter(false),
      maxsize: 5242880, // 5MB
      maxFiles: 10
    })
  ]
});

// Enhanced logging methods with context
const enhancedLogger = {
  // Standard log levels
  error: (message, meta = {}) => {
    logger.error(message, {
      ...meta,
      timestamp: new Date().toISOString(),
      severity: 'HIGH'
    });
  },
  
  warn: (message, meta = {}) => {
    logger.warn(message, {
      ...meta,
      timestamp: new Date().toISOString(),
      severity: 'MEDIUM'
    });
  },
  
  info: (message, meta = {}) => {
    logger.info(message, {
      ...meta,
      timestamp: new Date().toISOString()
    });
  },
  
  debug: (message, meta = {}) => {
    if (process.env.DEBUG_MODE === 'true') {
      logger.debug(message, {
        ...meta,
        timestamp: new Date().toISOString()
      });
    }
  },
  
  success: (message, meta = {}) => {
    logger.log('success', message, {
      ...meta,
      timestamp: new Date().toISOString()
    });
  },

  // Specialized logging methods
  apiRequest: (method, endpoint, status, duration, meta = {}) => {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'success';
    const statusColor = status >= 400 ? colors.error : status >= 300 ? colors.warn : colors.success;
    
    enhancedLogger[level](`API Request Processed`, {
      method,
      endpoint,
      status,
      duration: `${duration}ms`,
      category: 'API',
      ...meta
    });
  },

  externalAPI: (apiName, endpoint, success, duration, meta = {}) => {
    const message = `External API Call: ${apiName}`;
    const level = success ? 'success' : 'error';
    
    enhancedLogger[level](message, {
      apiName,
      endpoint,
      duration: `${duration}ms`,
      success,
      category: 'EXTERNAL_API',
      ...meta
    });
  },

  databaseOperation: (operation, table, success, duration, meta = {}) => {
    const message = `Database ${operation}: ${table}`;
    const level = success ? 'info' : 'error';
    
    enhancedLogger[level](message, {
      operation,
      table,
      duration: `${duration}ms`,
      success,
      category: 'DATABASE',
      ...meta
    });
  },

  aiOperation: (operation, model, success, duration, meta = {}) => {
    const message = `AI Operation: ${operation}`;
    const level = success ? 'success' : 'error';
    
    enhancedLogger[level](message, {
      aiOperation: operation,
      model,
      duration: `${duration}ms`,
      success,
      category: 'AI',
      ...meta
    });
  },

  crisisAnalysis: (country, riskLevel, confidence, meta = {}) => {
    const message = `Crisis Analysis: ${country}`;
    const level = riskLevel === 'CRITICAL' ? 'warn' : 'info';
    
    enhancedLogger[level](message, {
      country,
      riskLevel,
      confidence: `${Math.round(confidence * 100)}%`,
      category: 'CRISIS_ANALYSIS',
      ...meta
    });
  },

  dataFetch: (source, success, count, duration, meta = {}) => {
    const message = `Data Fetch: ${source}`;
    const level = success ? 'success' : 'error';
    
    enhancedLogger[level](message, {
      dataSource: source,
      success,
      recordCount: count,
      duration: `${duration}ms`,
      category: 'DATA_FETCH',
      ...meta
    });
  },

  systemHealth: (component, status, meta = {}) => {
    const message = `System Health Check: ${component}`;
    const level = status === 'healthy' ? 'success' : status === 'degraded' ? 'warn' : 'error';
    
    enhancedLogger[level](message, {
      component,
      healthStatus: status,
      category: 'SYSTEM_HEALTH',
      ...meta
    });
  },

  securityEvent: (event, severity, meta = {}) => {
    const message = `Security Event: ${event}`;
    const level = severity === 'high' ? 'error' : 'warn';
    
    enhancedLogger[level](message, {
      securityEvent: event,
      severity: severity.toUpperCase(),
      category: 'SECURITY',
      ...meta
    });
  },

  performanceMetric: (operation, duration, threshold, meta = {}) => {
    const message = `Performance: ${operation}`;
    const level = duration > threshold ? 'warn' : 'info';
    const status = duration > threshold ? 'SLOW' : 'NORMAL';
    
    enhancedLogger[level](message, {
      operation,
      duration: `${duration}ms`,
      threshold: `${threshold}ms`,
      status,
      category: 'PERFORMANCE',
      ...meta
    });
  }
};

// Startup banner
const logStartupBanner = () => {
  const banner = `
${colors.success('╔══════════════════════════════════════════════════════════════╗')}
${colors.success('║')}                    ${colors.api('RefugeeWatch AI System')}                    ${colors.success('║')}
${colors.success('║')}                     ${colors.info('Professional Backend')}                     ${colors.success('║')}
${colors.success('╠══════════════════════════════════════════════════════════════╣')}
${colors.success('║')} ${colors.timestamp('Version:')} ${colors.data('2.0.0')}                                            ${colors.success('║')}
${colors.success('║')} ${colors.timestamp('Environment:')} ${colors.data(process.env.NODE_ENV || 'development')}                               ${colors.success('║')}
${colors.success('║')} ${colors.timestamp('Port:')} ${colors.data(process.env.PORT || '3001')}                                         ${colors.success('║')}
${colors.success('║')} ${colors.timestamp('Logging:')} ${colors.success('Enhanced Professional Mode')}                    ${colors.success('║')}
${colors.success('╚══════════════════════════════════════════════════════════════╝')}
  `;
  
  console.log(banner);
  enhancedLogger.success('RefugeeWatch AI Backend initialized with professional logging');
};

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  enhancedLogger.error('Uncaught Exception - System Critical Error', {
    error: error.message,
    stack: error.stack,
    category: 'SYSTEM_CRITICAL'
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  enhancedLogger.error('Unhandled Rejection - Async Error', {
    reason: reason,
    promise: promise.toString(),
    category: 'SYSTEM_CRITICAL'
  });
});

// Create logs directory if it doesn't exist
const { existsSync, mkdirSync } = require('fs');
const logsDir = join(__dirname, '../logs');
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

module.exports = {
  ...enhancedLogger,
  logStartupBanner,
  colors, // Export colors for use in other modules
  // Middleware for Express request logging
  requestLogger: (req, res, next) => {
    const startTime = Date.now();
    // Log incoming request
    enhancedLogger.info(`Incoming ${req.method} ${req.path}`, {
      method: req.method,
      endpoint: req.path,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      category: 'REQUEST_START'
    });
    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(...args) {
      const duration = Date.now() - startTime;
      enhancedLogger.apiRequest(
        req.method,
        req.path,
        res.statusCode,
        duration,
        {
          ip: req.ip || req.connection.remoteAddress,
          responseSize: res.get('content-length') || 0
        }
      );
      originalEnd.apply(res, args);
    };
    next();
  }
};