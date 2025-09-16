/**
 * RefugeeWatch AI - Database Configuration
 * 
 * SQLite database setup for crisis data, predictions, and response plans.
 * Optimized for hackathon development with easy deployment.
 * 
 * @author RefugeeWatch AI Team
 * @version 1.0.0
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Database configuration
const DB_TYPE = process.env.DB_TYPE || 'sqlite';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/refugeewatch.db');

let db = null;

/**
 * Initialize database connection and create tables
 */
async function initializeDatabase() {
  try {
    logger.info('📊 Initializing SQLite database...');
    
    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      logger.info(`📁 Created data directory: ${dataDir}`);
    }
    
    // Create database connection
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        throw new Error(`Failed to connect to database: ${err.message}`);
      }
    });
    
    // Enable foreign keys
    await runQuery('PRAGMA foreign_keys = ON');
    
    // Create tables
    await createTables();
    
    // Insert demo data
    await insertDemoData();
    
    logger.info(`✅ Database initialized successfully: ${DB_PATH}`);
    return db;
    
  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Create all required database tables
 */
async function createTables() {
  const tables = [
    // Crises table
    `CREATE TABLE IF NOT EXISTS crises (
      id TEXT PRIMARY KEY,
      region TEXT NOT NULL,
      country TEXT NOT NULL,
      risk_level TEXT CHECK(risk_level IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'PREVENTED')) NOT NULL,
      confidence REAL CHECK(confidence >= 0 AND confidence <= 1),
      predicted_displacement INTEGER DEFAULT 0,
      timeline TEXT,
      causes TEXT, -- JSON string
      coordinates TEXT, -- JSON string [lat, lon]
      status TEXT CHECK(status IN ('ACTIVE', 'MONITORING', 'RESOLVED', 'PREVENTED')) DEFAULT 'ACTIVE',
      ai_analysis TEXT, -- JSON string with AI insights
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Predictions table
    `CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crisis_id TEXT NOT NULL,
      displacement_estimate INTEGER NOT NULL,
      confidence_level REAL NOT NULL,
      timeline_days INTEGER,
      destinations TEXT, -- JSON array of destination countries
      migration_routes TEXT, -- JSON array of route objects
      triggers TEXT, -- JSON array of trigger factors
      model_version TEXT DEFAULT 'gpt-oss-20b',
      accuracy_score REAL, -- Post-event accuracy validation
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (crisis_id) REFERENCES crises(id)
    )`,
    
    // Response Plans table
    `CREATE TABLE IF NOT EXISTS response_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crisis_id TEXT NOT NULL,
      plan_type TEXT CHECK(plan_type IN ('EMERGENCY', 'STABILIZATION', 'INTEGRATION')) NOT NULL,
      resources_needed TEXT NOT NULL, -- JSON object with resource requirements
      timeline_weeks INTEGER,
      estimated_cost INTEGER, -- Cost in USD
      cost_breakdown TEXT, -- JSON object with detailed costs
      implementation_status TEXT DEFAULT 'DRAFT',
      ai_generated BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (crisis_id) REFERENCES crises(id)
    )`,
    
    // Alerts table
    `CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crisis_id TEXT NOT NULL,
      alert_level TEXT CHECK(alert_level IN ('CRITICAL', 'HIGH', 'MEDIUM', 'INFO')) NOT NULL,
      message TEXT NOT NULL,
      alert_type TEXT DEFAULT 'PREDICTION',
      triggered_by TEXT, -- What triggered this alert
      acknowledged BOOLEAN DEFAULT 0,
      resolved BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (crisis_id) REFERENCES crises(id)
    )`,
    
    // Data Sources table - Track API data freshness
    `CREATE TABLE IF NOT EXISTS data_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_name TEXT UNIQUE NOT NULL,
      last_update DATETIME,
      status TEXT CHECK(status IN ('ONLINE', 'OFFLINE', 'ERROR')) DEFAULT 'ONLINE',
      error_message TEXT,
      requests_today INTEGER DEFAULT 0,
      rate_limit_remaining INTEGER,
      data_quality_score REAL DEFAULT 1.0
    )`,
    
    // Analytics table - Track system performance
    `CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      metric_name TEXT NOT NULL,
      metric_value REAL,
      metric_type TEXT, -- 'accuracy', 'performance', 'cost_savings', etc.
      related_crisis_id TEXT,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ];
  
  for (const tableSQL of tables) {
    await runQuery(tableSQL);
  }
  
  logger.info('✅ Database tables created successfully');
}

/**
 * Insert demo data for hackathon scenarios
 */
async function insertDemoData() {
  try {
    // Check if demo data already exists
    const existingCrises = await runQuery('SELECT COUNT(*) as count FROM crises');
    if (existingCrises[0].count > 0) {
      logger.info('📊 Demo data already exists, skipping insertion');
      return;
    }
    
    logger.info('📝 Inserting demo crisis scenarios...');
    
    // Demo crises data
    const demoCrises = [
      {
        id: 'sudan-2025',
        region: 'East Africa',
        country: 'Sudan',
        risk_level: 'CRITICAL',
        confidence: 0.95,
        predicted_displacement: 80000,
        timeline: '45-90 days',
        causes: JSON.stringify({ conflict: 0.7, economic: 0.2, climate: 0.1 }),
        coordinates: JSON.stringify([15.0, 30.0]),
        status: 'ACTIVE',
        ai_analysis: JSON.stringify({
          summary: 'Escalating armed conflict with severe economic deterioration',
          keyFactors: ['Armed clashes increasing', 'Inflation at 245%', 'Food insecurity rising'],
          destinations: ['Chad', 'Egypt', 'Ethiopia'],
          urgency: 'Immediate intervention required'
        })
      },
      {
        id: 'myanmar-2025',
        region: 'Southeast Asia', 
        country: 'Myanmar',
        risk_level: 'HIGH',
        confidence: 0.87,
        predicted_displacement: 35000,
        timeline: '60-120 days',
        causes: JSON.stringify({ conflict: 0.6, climate: 0.3, economic: 0.1 }),
        coordinates: JSON.stringify([22.0, 96.0]),
        status: 'MONITORING',
        ai_analysis: JSON.stringify({
          summary: 'Political instability with climate stress factors',
          keyFactors: ['Civil unrest', 'Monsoon season approaching', 'Border tensions'],
          destinations: ['Bangladesh', 'Thailand', 'India'],
          urgency: 'Prepare preventive measures'
        })
      },
      {
        id: 'bangladesh-2024',
        region: 'South Asia',
        country: 'Bangladesh',
        risk_level: 'PREVENTED',
        confidence: 0.93,
        predicted_displacement: 5000, // Actual vs 150,000 predicted
        timeline: 'Completed',
        causes: JSON.stringify({ climate: 0.8, economic: 0.2 }),
        coordinates: JSON.stringify([23.7, 90.4]),
        status: 'RESOLVED',
        ai_analysis: JSON.stringify({
          summary: 'Successful early intervention prevented major displacement',
          keyFactors: ['Flood prediction 4 months early', 'Pre-positioned resources', 'Community preparation'],
          destinations: ['Internal relocation only'],
          urgency: 'Case study for prevention success'
        })
      }
    ];
    
    // Insert crises
    const insertCrisisSQL = `
      INSERT INTO crises (
        id, region, country, risk_level, confidence, predicted_displacement,
        timeline, causes, coordinates, status, ai_analysis
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    for (const crisis of demoCrises) {
      await runQuery(insertCrisisSQL, [
        crisis.id, crisis.region, crisis.country, crisis.risk_level,
        crisis.confidence, crisis.predicted_displacement, crisis.timeline,
        crisis.causes, crisis.coordinates, crisis.status, crisis.ai_analysis
      ]);
    }
    
    // Insert demo predictions
    const demoPredictions = [
      {
        crisis_id: 'sudan-2025',
        displacement_estimate: 80000,
        confidence_level: 0.95,
        timeline_days: 67,
        destinations: JSON.stringify(['Chad', 'Egypt', 'Ethiopia']),
        migration_routes: JSON.stringify([
          { to: 'Chad', probability: 0.6, distance: 280, route: 'Western border' },
          { to: 'Egypt', probability: 0.25, distance: 1200, route: 'Nile corridor' },
          { to: 'Ethiopia', probability: 0.15, distance: 850, route: 'Eastern highlands' }
        ]),
        triggers: JSON.stringify(['Armed conflict escalation', 'Economic collapse', 'Food insecurity'])
      },
      {
        crisis_id: 'myanmar-2025',
        displacement_estimate: 35000,
        confidence_level: 0.87,
        timeline_days: 90,
        destinations: JSON.stringify(['Bangladesh', 'Thailand', 'India']),
        migration_routes: JSON.stringify([
          { to: 'Bangladesh', probability: 0.7, distance: 150, route: 'Cox\'s Bazar' },
          { to: 'Thailand', probability: 0.2, distance: 400, route: 'Mae Sot border' },
          { to: 'India', probability: 0.1, distance: 600, route: 'Mizoram border' }
        ]),
        triggers: JSON.stringify(['Political instability', 'Monsoon flooding', 'Economic sanctions'])
      }
    ];
    
    const insertPredictionSQL = `
      INSERT INTO predictions (
        crisis_id, displacement_estimate, confidence_level, timeline_days,
        destinations, migration_routes, triggers
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    for (const prediction of demoPredictions) {
      await runQuery(insertPredictionSQL, [
        prediction.crisis_id, prediction.displacement_estimate, prediction.confidence_level,
        prediction.timeline_days, prediction.destinations, prediction.migration_routes,
        prediction.triggers
      ]);
    }
    
    // Initialize data sources tracking
    const dataSources = [
      { source_name: 'GDELT', status: 'ONLINE', requests_today: 0 },
      { source_name: 'World_Bank', status: 'ONLINE', requests_today: 0 },
      { source_name: 'USGS', status: 'ONLINE', requests_today: 0 },
      { source_name: 'NewsAPI', status: 'ONLINE', requests_today: 0 },
      { source_name: 'NASA', status: 'ONLINE', requests_today: 0 },
      { source_name: 'ReliefWeb', status: 'ONLINE', requests_today: 0 }
    ];
    
    const insertSourceSQL = `INSERT INTO data_sources (source_name, status, requests_today) VALUES (?, ?, ?)`;
    
    for (const source of dataSources) {
      await runQuery(insertSourceSQL, [source.source_name, source.status, source.requests_today]);
    }
    
    logger.info('✅ Demo data inserted successfully');
    logger.info('🎯 Available demo scenarios:');
    logger.info('   • Sudan Crisis (CRITICAL) - 80k displacement predicted');
    logger.info('   • Myanmar Crisis (HIGH) - 35k displacement predicted');
    logger.info('   • Bangladesh Success (PREVENTED) - 150k displacement avoided');
    
  } catch (error) {
    logger.error('❌ Failed to insert demo data:', error);
    throw error;
  }
}

/**
 * Execute SQL query with parameters
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    } else {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    }
  });
}

/**
 * Get database connection (for use in other modules)
 */
function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

/**
 * Close database connection
 */
async function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          logger.error('Error closing database:', err);
          reject(err);
        } else {
          logger.info('✅ Database connection closed');
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

/**
 * Database utility functions for CRUD operations
 */
const DatabaseUtils = {
  /**
   * Get all active crises
   */
  async getAllCrises() {
    return await runQuery('SELECT * FROM crises WHERE status != "RESOLVED" ORDER BY confidence DESC');
  },
  
  /**
   * Get crisis by ID
   */
  async getCrisisById(id) {
    const results = await runQuery('SELECT * FROM crises WHERE id = ?', [id]);
    return results[0] || null;
  },
  
  /**
   * Get predictions for a crisis
   */
  async getPredictionsByCrisisId(crisisId) {
    return await runQuery('SELECT * FROM predictions WHERE crisis_id = ? ORDER BY created_at DESC', [crisisId]);
  },
  
  /**
   * Get response plans for a crisis
   */
  async getResponsePlansByCrisisId(crisisId) {
    return await runQuery('SELECT * FROM response_plans WHERE crisis_id = ? ORDER BY created_at DESC', [crisisId]);
  },
  
  /**
   * Update crisis risk level and confidence
   */
  async updateCrisisRisk(crisisId, riskLevel, confidence, analysis) {
    return await runQuery(
      'UPDATE crises SET risk_level = ?, confidence = ?, ai_analysis = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
      [riskLevel, confidence, JSON.stringify(analysis), crisisId]
    );
  },
  
  /**
   * Insert new prediction
   */
  async insertPrediction(prediction) {
    return await runQuery(
      `INSERT INTO predictions (
        crisis_id, displacement_estimate, confidence_level, timeline_days,
        destinations, migration_routes, triggers, model_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        prediction.crisis_id, prediction.displacement_estimate, prediction.confidence_level,
        prediction.timeline_days, JSON.stringify(prediction.destinations),
        JSON.stringify(prediction.migration_routes), JSON.stringify(prediction.triggers),
        prediction.model_version || 'gpt-oss-20b'
      ]
    );
  },
  
  /**
   * Insert response plan
   */
  async insertResponsePlan(plan) {
    return await runQuery(
      `INSERT INTO response_plans (
        crisis_id, plan_type, resources_needed, timeline_weeks,
        estimated_cost, cost_breakdown, ai_generated
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        plan.crisis_id, plan.plan_type, JSON.stringify(plan.resources_needed),
        plan.timeline_weeks, plan.estimated_cost, JSON.stringify(plan.cost_breakdown),
        plan.ai_generated || 1
      ]
    );
  },
  
  /**
   * Get system analytics
   */
  async getAnalytics(metricType = null) {
    const sql = metricType 
      ? 'SELECT * FROM analytics WHERE metric_type = ? ORDER BY recorded_at DESC LIMIT 100'
      : 'SELECT * FROM analytics ORDER BY recorded_at DESC LIMIT 100';
    const params = metricType ? [metricType] : [];
    return await runQuery(sql, params);
  },
  
  /**
   * Record analytics metric
   */
  async recordAnalytic(metricName, metricValue, metricType, relatedCrisisId = null) {
    return await runQuery(
      'INSERT INTO analytics (metric_name, metric_value, metric_type, related_crisis_id) VALUES (?, ?, ?, ?)',
      [metricName, metricValue, metricType, relatedCrisisId]
    );
  }
};

module.exports = {
  initializeDatabase,
  getDatabase,
  closeDatabase,
  runQuery,
  DatabaseUtils
};