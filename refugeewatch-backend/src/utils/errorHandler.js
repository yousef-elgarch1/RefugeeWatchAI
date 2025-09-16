
// ========================================
// src/utils/errorHandler.js - Complete Error Handling
// ========================================
const logger = require('./logger');

// Custom error classes
class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.field = field;
  }
}

class NotFoundError extends Error {
  constructor(resource = 'Resource') {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
  }
}

class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

class ConflictError extends Error {
  constructor(message = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

class RateLimitError extends Error {
  constructor(message = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
    this.statusCode = 429;
  }
}

class ServiceUnavailableError extends Error {
  constructor(service = 'Service', message = null) {
    super(message || `${service} is currently unavailable`);
    this.name = 'ServiceUnavailableError';
    this.statusCode = 503;
    this.service = service;
  }
}

// Main error handler middleware
const errorHandler = (err, req, res, next) => {
  // Default error response
  let error = {
    message: err.message || 'Internal server error',
    status: err.statusCode || err.status || 500,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    requestId: req.id || req.headers['x-request-id']
  };

  // Log error details
  const logData = {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    },
    request: {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body,
      headers: req.headers,
      ip: req.ip
    }
  };

  // Handle specific error types
  switch (err.name) {
    case 'ValidationError':
      error.field = err.field;
      error.type = 'validation';
      logger.warn('Validation error:', logData);
      break;
      
    case 'CastError':
      error.message = 'Invalid data format';
      error.status = 400;
      error.type = 'cast';
      logger.warn('Cast error:', logData);
      break;
      
    case 'MongoError':
    case 'MongooseError':
      error.message = 'Database error';
      error.status = 500;
      error.type = 'database';
      logger.error('Database error:', logData);
      break;
      
    case 'JsonWebTokenError':
      error.message = 'Invalid token';
      error.status = 401;
      error.type = 'authentication';
      logger.warn('JWT error:', logData);
      break;
      
    case 'TokenExpiredError':
      error.message = 'Token expired';
      error.status = 401;
      error.type = 'authentication';
      logger.warn('Token expired:', logData);
      break;
      
    case 'MulterError':
      error.message = 'File upload error';
      error.status = 400;
      error.type = 'upload';
      logger.warn('Upload error:', logData);
      break;
      
    case 'TimeoutError':
      error.message = 'Request timeout';
      error.status = 408;
      error.type = 'timeout';
      logger.warn('Timeout error:', logData);
      break;
      
    default:
      // Log unknown errors as errors
      if (error.status >= 500) {
        logger.error('Server error:', logData);
      } else {
        logger.warn('Client error:', logData);
      }
  }

  // Add error details in development
  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack;
    error.details = err;
  }

  // Handle specific HTTP status codes
  if (error.status >= 500) {
    // Server errors - don't expose internal details
    error.message = process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message;
  }

  // Set appropriate headers
  res.set({
    'Content-Type': 'application/json',
    'X-Error-Type': error.type || 'unknown'
  });

  // Send error response
  res.status(error.status).json({ error });
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Not found handler
const notFoundHandler = (req, res) => {
  const error = {
    message: `Route ${req.originalUrl} not found`,
    status: 404,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  logger.warn('Route not found:', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });

  res.status(404).json({ error });
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  RateLimitError,
  ServiceUnavailableError
};
