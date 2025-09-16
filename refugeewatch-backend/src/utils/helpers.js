/**
 * RefugeeWatch AI - Utility Helpers
 * 
 * Common utility functions for the application
 * 
 * @author RefugeeWatch AI Team
 * @version 1.0.0
 */

/**
 * Async error handling wrapper for Express routes
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * App Error class for operational errors
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Send formatted error response
 * @param {Error} err - Error object
 * @param {Object} res - Express response object
 */
const sendErrorResponse = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      data: null
    });
  }
  
  // Programming or other unknown error: don't leak error details
  console.error('ERROR 💥', err);
  
  return res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    data: null
  });
};

/**
 * Format country name for consistency
 * @param {string} name - Country name to format
 * @returns {string} Formatted country name
 */
const formatCountryName = (name) => {
  if (!name) return null;
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate random ID
 * @param {number} length - Length of ID
 * @returns {string} Random ID
 */
const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Clean and sanitize input
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Delay execution (for testing/throttling)
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Format response for consistent API structure
 * @param {boolean} success - Success status
 * @param {*} data - Response data
 * @param {string} message - Optional message
 * @param {*} metadata - Optional metadata
 * @returns {Object} Formatted response
 */
const formatResponse = (success, data, message = null, metadata = null) => {
  const response = {
    success,
    data
  };
  
  if (message) response.message = message;
  if (metadata) response.metadata = metadata;
  
  return response;
};

/**
 * Check if running in development mode
 * @returns {boolean} True if development
 */
const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Check if running in production mode
 * @returns {boolean} True if production
 */
const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Get current timestamp
 * @returns {string} ISO timestamp
 */
const getCurrentTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Calculate time difference in human readable format
 * @param {Date|string} startTime - Start time
 * @param {Date|string} endTime - End time (optional, defaults to now)
 * @returns {string} Human readable time difference
 */
const getTimeDifference = (startTime, endTime = new Date()) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end - start;
  
  if (diffMs < 1000) return `${diffMs}ms`;
  if (diffMs < 60000) return `${Math.round(diffMs / 1000)}s`;
  if (diffMs < 3600000) return `${Math.round(diffMs / 60000)}m`;
  
  return `${Math.round(diffMs / 3600000)}h`;
};

module.exports = {
  catchAsync,
  AppError,
  sendErrorResponse,
  formatCountryName,
  isValidEmail,
  generateId,
  sanitizeInput,
  delay,
  formatResponse,
  isDevelopment,
  isProduction,
  getCurrentTimestamp,
  getTimeDifference
};