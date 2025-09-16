/**
 * RefugeeWatch AI - WebSocket Service
 * 
 * Real-time updates for crisis monitoring and alerts
 * Pushes live data updates to connected clients
 * 
 * @author RefugeeWatch AI Team
 * @version 1.0.0
 */

const WebSocket = require('ws');
const moment = require('moment');
const logger = require('../../utils/logger');

/**
 * WebSocket Service for Real-time Updates
 */
class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws',
      perMessageDeflate: false 
    });
    
    this.clients = new Map();
    this.rooms = new Map(); // For topic-based subscriptions
    this.heartbeatInterval = null;
    
    this.initialize();
  }

  /**
   * Initialize WebSocket server
   */
  initialize() {
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      const clientInfo = {
        id: clientId,
        ws: ws,
        ip: req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        connectedAt: moment(),
        subscriptions: new Set(),
        isAlive: true
      };
      
      this.clients.set(clientId, clientInfo);
      
      logger.info('WebSocket client connected', {
        clientId,
        ip: clientInfo.ip,
        totalClients: this.clients.size
      });
      
      // Send welcome message
      this.sendToClient(clientId, {
        type: 'connection',
        status: 'connected',
        clientId: clientId,
        timestamp: moment().toISOString(),
        message: 'Connected to RefugeeWatch AI real-time updates'
      });
      
      // Setup message handlers
      ws.on('message', (data) => this.handleMessage(clientId, data));
      ws.on('close', () => this.handleDisconnect(clientId));
      ws.on('error', (error) => this.handleError(clientId, error));
      ws.on('pong', () => this.handlePong(clientId));
    });
    
    // Start heartbeat to detect dead connections
    this.startHeartbeat();
    
    logger.info('WebSocket service initialized', {
      path: '/ws',
      heartbeatInterval: '30s'
    });
  }

  /**
   * Handle incoming messages from clients
   */
  handleMessage(clientId, data) {
    try {
      const message = JSON.parse(data);
      const client = this.clients.get(clientId);
      
      if (!client) return;
      
      logger.debug('WebSocket message received', {
        clientId,
        type: message.type,
        data: message.data
      });
      
      switch (message.type) {
        case 'subscribe':
          this.handleSubscription(clientId, message.data);
          break;
          
        case 'unsubscribe':
          this.handleUnsubscription(clientId, message.data);
          break;
          
        case 'ping':
          this.sendToClient(clientId, { 
            type: 'pong', 
            timestamp: moment().toISOString() 
          });
          break;
          
        case 'request_status':
          this.sendSystemStatus(clientId);
          break;
          
        default:
          logger.warn('Unknown WebSocket message type', {
            clientId,
            type: message.type
          });
      }
      
    } catch (error) {
      logger.error('WebSocket message parsing failed', {
        clientId,
        error: error.message
      });
      
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Invalid message format',
        timestamp: moment().toISOString()
      });
    }
  }

  /**
   * Handle client subscription to topics
   */
  handleSubscription(clientId, subscription) {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    const { topics } = subscription;
    
    if (!Array.isArray(topics)) {
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Topics must be an array',
        timestamp: moment().toISOString()
      });
      return;
    }
    
    const validTopics = [
      'crisis_updates',
      'ai_analysis',
      'global_metrics',
      'alerts',
      'system_status'
    ];
    
    const subscribedTopics = [];
    
    topics.forEach(topic => {
      if (validTopics.includes(topic)) {
        client.subscriptions.add(topic);
        
        // Add client to topic room
        if (!this.rooms.has(topic)) {
          this.rooms.set(topic, new Set());
        }
        this.rooms.get(topic).add(clientId);
        
        subscribedTopics.push(topic);
      }
    });
    
    logger.info('Client subscribed to topics', {
      clientId,
      topics: subscribedTopics,
      totalSubscriptions: client.subscriptions.size
    });
    
    this.sendToClient(clientId, {
      type: 'subscription_confirmed',
      topics: subscribedTopics,
      timestamp: moment().toISOString()
    });
  }

  /**
   * Handle client unsubscription from topics
   */
  handleUnsubscription(clientId, unsubscription) {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    const { topics } = unsubscription;
    const unsubscribedTopics = [];
    
    topics.forEach(topic => {
      if (client.subscriptions.has(topic)) {
        client.subscriptions.delete(topic);
        
        // Remove from topic room
        if (this.rooms.has(topic)) {
          this.rooms.get(topic).delete(clientId);
          
          // Clean up empty rooms
          if (this.rooms.get(topic).size === 0) {
            this.rooms.delete(topic);
          }
        }
        
        unsubscribedTopics.push(topic);
      }
    });
    
    logger.info('Client unsubscribed from topics', {
      clientId,
      topics: unsubscribedTopics
    });
    
    this.sendToClient(clientId, {
      type: 'unsubscription_confirmed',
      topics: unsubscribedTopics,
      timestamp: moment().toISOString()
    });
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(clientId) {
    const client = this.clients.get(clientId);
    
    if (client) {
      // Remove from all topic rooms
      client.subscriptions.forEach(topic => {
        if (this.rooms.has(topic)) {
          this.rooms.get(topic).delete(clientId);
          
          if (this.rooms.get(topic).size === 0) {
            this.rooms.delete(topic);
          }
        }
      });
      
      this.clients.delete(clientId);
      
      logger.info('WebSocket client disconnected', {
        clientId,
        connectedDuration: moment().diff(client.connectedAt, 'seconds'),
        totalClients: this.clients.size
      });
    }
  }

  /**
   * Handle WebSocket errors
   */
  handleError(clientId, error) {
    logger.error('WebSocket client error', {
      clientId,
      error: error.message
    });
  }

  /**
   * Handle pong response from client
   */
  handlePong(clientId) {
    const client = this.clients.get(clientId);
    if (client) {
      client.isAlive = true;
    }
  }

  /**
   * Send message to specific client
   */
  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    
    if (client && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        logger.error('Failed to send message to client', {
          clientId,
          error: error.message
        });
        return false;
      }
    }
    
    return false;
  }

  /**
   * Broadcast message to all subscribers of a topic
   */
  broadcastToTopic(topic, message) {
    const room = this.rooms.get(topic);
    
    if (!room || room.size === 0) {
      return 0;
    }
    
    let sentCount = 0;
    const messageWithTopic = {
      ...message,
      topic,
      timestamp: moment().toISOString()
    };
    
    room.forEach(clientId => {
      if (this.sendToClient(clientId, messageWithTopic)) {
        sentCount++;
      }
    });
    
    logger.debug('Broadcast sent to topic', {
      topic,
      subscribers: room.size,
      sent: sentCount,
      messageType: message.type
    });
    
    return sentCount;
  }

  /**
   * Broadcast to all connected clients
   */
  broadcastToAll(message) {
    let sentCount = 0;
    const messageWithTimestamp = {
      ...message,
      timestamp: moment().toISOString()
    };
    
    this.clients.forEach((client, clientId) => {
      if (this.sendToClient(clientId, messageWithTimestamp)) {
        sentCount++;
      }
    });
    
    logger.debug('Broadcast sent to all clients', {
      totalClients: this.clients.size,
      sent: sentCount,
      messageType: message.type
    });
    
    return sentCount;
  }

  /**
   * Send crisis update to subscribers
   */
  sendCrisisUpdate(crisisData) {
    this.broadcastToTopic('crisis_updates', {
      type: 'crisis_update',
      data: {
        country: crisisData.country,
        riskLevel: crisisData.overallRisk,
        confidence: Math.round(crisisData.confidence * 100),
        lastUpdate: crisisData.timestamp,
        summary: {
          displacementRisk: crisisData.displacementRisk.level,
          estimatedAffected: crisisData.displacementRisk.estimatedNumbers,
          timeline: crisisData.displacementRisk.timeline
        }
      }
    });
  }

  /**
   * Send AI analysis update to subscribers
   */
  sendAIAnalysisUpdate(country, aiAnalysis) {
    this.broadcastToTopic('ai_analysis', {
      type: 'ai_analysis_update',
      data: {
        country,
        aiRiskLevel: aiAnalysis.aiRiskAssessment,
        confidence: Math.round(aiAnalysis.confidence * 100),
        keyFindings: aiAnalysis.keyFindings?.slice(0, 3) || [],
        recommendations: aiAnalysis.recommendations?.immediate?.slice(0, 2) || [],
        model: aiAnalysis.metadata?.modelUsed || 'gpt-oss-20b'
      }
    });
  }

  /**
   * Send global metrics update
   */
  sendGlobalMetricsUpdate(metrics) {
    this.broadcastToTopic('global_metrics', {
      type: 'global_metrics_update',
      data: {
        summary: metrics.overview,
        riskDistribution: metrics.riskDistribution,
        totalAtRisk: metrics.displacement.totalAtRisk,
        trendsOverview: metrics.trends
      }
    });
  }

  /**
   * Send critical alert
   */
  sendCriticalAlert(alert) {
    this.broadcastToTopic('alerts', {
      type: 'critical_alert',
      priority: 'high',
      data: alert
    });
    
    // Also broadcast to all clients for critical alerts
    this.broadcastToAll({
      type: 'system_alert',
      priority: 'critical',
      message: `CRITICAL: ${alert.country} - ${alert.message}`,
      data: alert
    });
  }

  /**
   * Send system status to specific client
   */
  sendSystemStatus(clientId) {
    const status = {
      clients: {
        total: this.clients.size,
        rooms: this.rooms.size
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      },
      services: {
        websocket: 'operational',
        ai: 'operational',
        database: 'operational'
      }
    };
    
    this.sendToClient(clientId, {
      type: 'system_status',
      data: status
    });
  }

  /**
   * Start heartbeat to detect dead connections
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client, clientId) => {
        if (!client.isAlive) {
          logger.debug('Terminating dead WebSocket connection', { clientId });
          client.ws.terminate();
          this.handleDisconnect(clientId);
          return;
        }
        
        client.isAlive = false;
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.ping();
        }
      });
    }, 30000); // 30 seconds
    
    logger.info('WebSocket heartbeat started', { interval: '30s' });
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      logger.info('WebSocket heartbeat stopped');
    }
  }

  /**
   * Generate unique client ID
   */
  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get WebSocket service statistics
   */
  getStats() {
    const roomStats = {};
    this.rooms.forEach((clients, topic) => {
      roomStats[topic] = clients.size;
    });
    
    return {
      totalClients: this.clients.size,
      totalRooms: this.rooms.size,
      roomSubscriptions: roomStats,
      uptime: process.uptime()
    };
  }

  /**
   * Close all connections and cleanup
   */
  close() {
    this.stopHeartbeat();
    
    // Close all client connections
    this.clients.forEach((client, clientId) => {
      client.ws.close(1000, 'Server shutdown');
    });
    
    // Clear data structures
    this.clients.clear();
    this.rooms.clear();
    
    // Close WebSocket server
    this.wss.close();
    
    logger.info('WebSocket service closed');
  }
}

module.exports = WebSocketService;