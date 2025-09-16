#!/usr/bin/env node
/**
 * RefugeeWatch AI - Main Server Entry Point (UPDATED)
 * 
 * Complete server setup with WebSocket support, API endpoints,
 * and AI integration for humanitarian crisis monitoring
 * 
 * @author RefugeeWatch AI Team
 * @version 1.0.0
 */

const dotenv = require('dotenv');
const path = require('path');
const http = require('http');

// Load environment variables
dotenv.config();

// Import core modules
const app = require('./src/app');
const logger = require('./src/utils/logger');
const { initializeDatabase } = require('./src/config/database');
const { testHuggingFaceConnection } = require('./src/config/huggingface');
const WebSocketService = require('./src/services/external/websocket');

// Configuration
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Global WebSocket service instance
let wsService = null;

/**
 * Initialize all services and start the server
 */
async function startServer() {
  try {
    logger.info('🚀 Starting RefugeeWatch AI Backend Server...');
    
    // 1. Initialize Database
    logger.info('📊 Initializing database connection...');
    await initializeDatabase();
    logger.info('✅ Database connected successfully');
    
    // 2. Test AI Service Connection
    logger.info('🤖 Testing Hugging Face AI connection...');
    const aiStatus = await testHuggingFaceConnection();
    if (aiStatus.success) {
      logger.info(`✅ AI Service connected: ${aiStatus.model}`);
      logger.info(`⚡ Response time: ${aiStatus.responseTime}ms`);
    } else {
      logger.warn(`⚠️  AI Service connection failed: ${aiStatus.error}`);
      logger.warn('📝 System will use fallback analysis for demo');
    }
    
    // 3. Create HTTP Server (needed for WebSocket)
    const server = http.createServer(app);
    
    // 4. Initialize WebSocket Service
    logger.info('🔌 Initializing WebSocket service...');
    wsService = new WebSocketService(server);
    logger.info('✅ WebSocket service ready for real-time updates');
    
    // 5. Start HTTP Server
    server.listen(PORT, HOST, () => {
      logger.info('🌍 RefugeeWatch AI Backend Server Started');
      logger.info(`📍 Server running at: http://${HOST}:${PORT}`);
      logger.info(`🔧 Environment: ${NODE_ENV}`);
      logger.info(`🤖 AI Model: ${process.env.HUGGINGFACE_MODEL || 'Not configured'}`);
      logger.info(`🔌 WebSocket: ws://${HOST}:${PORT}/ws`);
      
      if (NODE_ENV === 'development') {
        logger.info('');
        logger.info('📋 Available endpoints:');
        logger.info(`   API Root:     http://${HOST}:${PORT}/`);
        logger.info(`   Health Check: http://${HOST}:${PORT}/health`);
        logger.info(`   API Status:   http://${HOST}:${PORT}/api/status`);
        logger.info(`   Crisis Data:  http://${HOST}:${PORT}/api/crisis`);
        logger.info(`   AI Analysis:  POST http://${HOST}:${PORT}/api/crisis/:id/analyze`);
        logger.info(`   Response Plan: POST http://${HOST}:${PORT}/api/crisis/:id/plan`);
        logger.info(`   Demo Scenarios: http://${HOST}:${PORT}/api/demo/scenarios`);
        logger.info(`   WebSocket:    ws://${HOST}:${PORT}/ws`);
        logger.info('');
        logger.info('🎯 Demo scenarios ready:');
        logger.info('   - Sudan Crisis (CRITICAL) - 80k displacement');
        logger.info('   - Myanmar Crisis (HIGH) - 35k displacement');
        logger.info('   - Bangladesh Success (PREVENTED) - 150k saved');
        logger.info('');
        logger.info('🤖 AI Features operational:');
        logger.info('   - gpt-oss crisis analysis and reasoning');
        logger.info('   - Automated response plan generation');
        logger.info('   - Real-time displacement prediction');
        logger.info('   - Cost-benefit analysis ($500M+ budgets)');
        logger.info('');
        logger.info('📡 Real-time features:');
        logger.info('   - WebSocket crisis updates');
        logger.info('   - Live AI analysis broadcasts');
        logger.info('   - Global metrics streaming');
        logger.info('   - Critical alert notifications');
        logger.info('');
      }
    });
    
    // 6. Setup background monitoring (optional for hackathon)
    if (process.env.ENABLE_BACKGROUND_MONITORING === 'true') {
      setupBackgroundMonitoring();
    }
    
    // 7. Graceful Shutdown Handlers
    setupGracefulShutdown(server);
    
    return { server, wsService };
    
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Setup background monitoring for demo
 */
function setupBackgroundMonitoring() {
  const DataAggregatorService = require('./src/services/processing/dataAggregator');
  const aggregator = new DataAggregatorService();
  
  // Monitor key countries every 5 minutes
  setInterval(async () => {
    try {
      const countries = ['Sudan', 'Myanmar'];
      logger.info('🔄 Running background monitoring for demo countries');
      
      for (const country of countries) {
        const assessment = await aggregator.getComprehensiveCrisisAssessment(country);
        
        if (assessment && assessment.overallRisk === 'CRITICAL') {
          // Send real-time update via WebSocket
          if (wsService) {
            wsService.sendCrisisUpdate(assessment);
            logger.info(`📡 WebSocket update sent for ${country} (${assessment.overallRisk})`);
          }
        }
      }
    } catch (error) {
      logger.warn('Background monitoring error:', error.message);
    }
  }, 5 * 60 * 1000); // 5 minutes
  
  logger.info('⏰ Background monitoring enabled (5-minute intervals)');
}

/**
 * Setup graceful shutdown handlers
 * @param {Object} server - HTTP server instance
 */
function setupGracefulShutdown(server) {
  const shutdown = (signal) => {
    logger.info(`📴 Received ${signal}. Starting graceful shutdown...`);
    
    // Close WebSocket service first
    if (wsService) {
      logger.info('🔌 Closing WebSocket connections...');
      wsService.close();
    }
    
    // Close HTTP server
    server.close((err) => {
      if (err) {
        logger.error('❌ Error during server shutdown:', err);
        process.exit(1);
      }
      
      logger.info('✅ HTTP server closed successfully');
      
      // Close database connections
      // TODO: Add database cleanup if needed
      
      // Close other connections
      // TODO: Add Redis, external API cleanup if needed
      
      logger.info('🏁 Graceful shutdown completed');
      process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('⏰ Shutdown timeout reached. Force closing...');
      process.exit(1);
    }, 10000);
  };
  
  // Handle shutdown signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('💥 Uncaught Exception:', error);
    if (wsService) wsService.close();
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    if (wsService) wsService.close();
    process.exit(1);
  });
}

/**
 * Health check for monitoring
 */
function performHealthCheck() {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: require('./package.json').version,
    environment: NODE_ENV,
    port: PORT,
    uptime: process.uptime(),
    features: {
      webSocket: !!wsService,
      aiIntegration: !!process.env.HUGGINGFACE_API_KEY,
      realTimeUpdates: process.env.ENABLE_REAL_TIME_UPDATES === 'true'
    }
  };
}

/**
 * Get WebSocket service instance (for external access)
 */
function getWebSocketService() {
  return wsService;
}

// Export for testing and external access
module.exports = {
  startServer,
  performHealthCheck,
  getWebSocketService
};

// Start server if this file is run directly
if (require.main === module) {
  startServer().catch((error) => {
    logger.error('💥 Fatal error starting server:', error);
    process.exit(1);
  });
}