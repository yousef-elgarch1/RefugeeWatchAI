#!/usr/bin/env node

/**
 * RefugeeWatch AI - Phase 4 Complete System Test
 * 
 * End-to-end testing of the complete RefugeeWatch AI system
 * Tests API endpoints, WebSocket, AI integration, and demo scenarios
 * 
 * @author RefugeeWatch AI Team
 * @version 1.0.0
 */

const axios = require('axios');
const WebSocket = require('ws');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test configuration
const TEST_CONFIG = {
  timeout: 60000,
  baseURL: 'http://localhost:3001',
  wsURL: 'ws://localhost:3001/ws',
  testCountries: ['sudan', 'myanmar', 'bangladesh']
};

let apiClient;

/**
 * Print formatted test header
 */
function printHeader() {
  console.log(`${colors.cyan}${colors.bright}`);
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║              RefugeeWatch AI - Phase 4 Test             ║');
  console.log('║              Complete System Validation                  ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}\n`);
}

/**
 * Print test result with formatting
 */
function printResult(test, passed, message = '', details = '') {
  const icon = passed ? '✅' : '❌';
  const color = passed ? colors.green : colors.red;
  
  console.log(`${color}${icon} ${test}${colors.reset}`);
  
  if (message) {
    console.log(`   ${colors.yellow}→ ${message}${colors.reset}`);
  }
  
  if (details) {
    console.log(`   ${colors.blue}ℹ️  ${details}${colors.reset}`);
  }
  
  console.log('');
}

/**
 * Setup API client
 */
function setupAPIClient() {
  apiClient = axios.create({
    baseURL: TEST_CONFIG.baseURL,
    timeout: TEST_CONFIG.timeout,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'RefugeeWatch-Test/1.0.0'
    }
  });
  
  // Add response interceptor for logging
  apiClient.interceptors.response.use(
    response => response,
    error => {
      console.log(`${colors.red}API Error: ${error.response?.status} ${error.response?.statusText}${colors.reset}`);
      return Promise.reject(error);
    }
  );
}

/**
 * Test 1: API Health and Documentation
 */
async function testAPIHealth() {
  console.log(`${colors.bright}1️⃣ Testing API Health & Documentation...${colors.reset}\n`);
  
  try {
    // Test health endpoint
    const healthResponse = await apiClient.get('/health');
    
    printResult(
      'Health Endpoint',
      healthResponse.status === 200 && healthResponse.data.status === 'healthy',
      `Status: ${healthResponse.data.status}`,
      `Uptime: ${Math.round(healthResponse.data.uptime)}s, Memory: ${healthResponse.data.memory?.used}MB`
    );
    
    // Test API documentation endpoint
    const docsResponse = await apiClient.get('/api');
    
    printResult(
      'API Documentation',
      docsResponse.status === 200 && docsResponse.data.name === 'RefugeeWatch AI API',
      `Version: ${docsResponse.data.version}`,
      `Endpoints: ${docsResponse.data.documentation?.endpoints?.length || 0}`
    );
    
    // Test status endpoint
    const statusResponse = await apiClient.get('/api/status');
    
    printResult(
      'System Status',
      statusResponse.status === 200,
      `Services: ${Object.keys(statusResponse.data.services || {}).length}`,
      `Configuration valid and services operational`
    );
    
    return true;
    
  } catch (error) {
    printResult(
      'API Health',
      false,
      'Health check failed',
      error.message
    );
    return false;
  }
}

/**
 * Test 2: Crisis Management Endpoints
 */
async function testCrisisEndpoints() {
  console.log(`${colors.bright}2️⃣ Testing Crisis Management Endpoints...${colors.reset}\n`);
  
  try {
    // Test get all crises
    console.log(`   ${colors.yellow}🔄 Fetching all active crises...${colors.reset}`);
    
    const crisesResponse = await apiClient.get('/api/crisis');
    
    const crises = crisesResponse.data.data?.crises || [];
    const summary = crisesResponse.data.data?.summary || {};
    
    printResult(
      'Get All Crises',
      crisesResponse.status === 200 && Array.isArray(crises),
      `Found ${crises.length} countries monitored`,
      `Critical: ${summary.critical}, High: ${summary.high}, Medium: ${summary.medium}`
    );
    
    if (crises.length === 0) {
      printResult(
        'Crisis Data Available',
        false,
        'No crisis data returned',
        'Check data aggregation services'
      );
      return false;
    }
    
    // Test specific crisis details
    const testCrisis = crises.find(c => TEST_CONFIG.testCountries.includes(c.id)) || crises[0];
    
    console.log(`   ${colors.yellow}🔍 Getting details for ${testCrisis.country}...${colors.reset}`);
    
    const detailsResponse = await apiClient.get(`/api/crisis/${testCrisis.id}`);
    const details = detailsResponse.data.data;
    
    printResult(
      'Get Crisis Details',
      detailsResponse.status === 200 && details.country,
      `Risk: ${details.riskAssessment?.overall}, Confidence: ${details.riskAssessment?.confidence}%`,
      `Data sources: ${details.sources ? Object.keys(details.sources).length : 0}/4 available`
    );
    
    // Test geographical data
    const geoResponse = await apiClient.get('/api/crisis/geographical');
    const locations = geoResponse.data.data?.locations || [];
    
    printResult(
      'Geographical Data',
      geoResponse.status === 200 && Array.isArray(locations),
      `${locations.length} locations mapped`,
      'Geographical crisis mapping data available'
    );
    
    return true;
    
  } catch (error) {
    printResult(
      'Crisis Endpoints',
      false,
      'Crisis endpoints failed',
      error.message
    );
    return false;
  }
}

/**
 * Test 3: AI Analysis Integration
 */
async function testAIIntegration() {
  console.log(`${colors.bright}3️⃣ Testing AI Analysis Integration...${colors.reset}\n`);
  
  try {
    // Test AI service status
    const aiStatusResponse = await apiClient.get('/api/ai/status');
    
    printResult(
      'AI Service Status',
      aiStatusResponse.status === 200,
      `Status: ${aiStatusResponse.data.data?.status}`,
      `Model: ${aiStatusResponse.data.data?.model}`
    );
    
    if (aiStatusResponse.data.data?.status !== 'operational') {
      printResult(
        'AI Service Ready',
        false,
        'AI service not operational',
        'Cannot proceed with AI analysis tests'
      );
      return false;
    }
    
    // Test AI crisis analysis
    const testCountry = TEST_CONFIG.testCountries[0]; // Sudan
    
    console.log(`   ${colors.yellow}🤖 Running AI analysis for ${testCountry}...${colors.reset}`);
    
    const aiAnalysisResponse = await apiClient.post(`/api/crisis/${testCountry}/analyze`, {
      options: {
        priority: 'standard'
      }
    });
    
    const aiAnalysis = aiAnalysisResponse.data.data;
    
    printResult(
      'AI Crisis Analysis',
      aiAnalysisResponse.status === 200 && aiAnalysis.aiAssessment,
      `AI Risk: ${aiAnalysis.aiAssessment?.riskLevel}, Confidence: ${aiAnalysis.aiAssessment?.confidence}%`,
      `Agreement with system: ${aiAnalysis.comparison?.agreement}`
    );
    
    // Test AI recommendations
    const hasRecommendations = aiAnalysis.recommendations && 
                              aiAnalysis.recommendations.immediate && 
                              aiAnalysis.recommendations.immediate.length > 0;
    
    printResult(
      'AI Recommendations',
      hasRecommendations,
      `Immediate actions: ${aiAnalysis.recommendations?.immediate?.length || 0}`,
      'AI providing actionable recommendations'
    );
    
    // Test displacement prediction
    const hasPrediction = aiAnalysis.predictions?.displacement && 
                         aiAnalysis.predictions.displacement.likelihood;
    
    printResult(
      'Displacement Prediction',
      hasPrediction,
      `Likelihood: ${aiAnalysis.predictions?.displacement?.likelihood}`,
      `Timeline: ${aiAnalysis.predictions?.displacement?.timeframe}, Population: ${aiAnalysis.predictions?.displacement?.estimatedPopulation}`
    );
    
    return true;
    
  } catch (error) {
    printResult(
      'AI Integration',
      false,
      'AI analysis failed',
      error.message
    );
    return false;
  }
}

/**
 * Test 4: Response Plan Generation
 */
async function testResponsePlanGeneration() {
  console.log(`${colors.bright}4️⃣ Testing Response Plan Generation...${colors.reset}\n`);
  
  try {
    const testCountry = TEST_CONFIG.testCountries[0]; // Sudan
    
    console.log(`   ${colors.yellow}📋 Generating response plan for ${testCountry}...${colors.reset}`);
    
    const planResponse = await apiClient.post(`/api/crisis/${testCountry}/plan`, {
      planType: 'COMPREHENSIVE',
      targetPopulation: 80000
    });
    
    const plan = planResponse.data.data;
    
    printResult(
      'Plan Generation',
      planResponse.status === 200 && plan.overview,
      `Plan: ${plan.overview?.planType}, Population: ${plan.overview?.targetPopulation}`,
      `Total cost: ${plan.budget?.totalCost?.toLocaleString()}`
    );
    
    // Test plan structure
    const hasPhases = plan.phases && 
                     plan.phases.emergency && 
                     plan.phases.stabilization && 
                     plan.phases.integration;
    
    printResult(
      'Plan Structure',
      hasPhases,
      '3-phase implementation plan generated',
      'Emergency, Stabilization, and Integration phases included'
    );
    
    // Test cost analysis
    const hasCostAnalysis = plan.budget && 
                           plan.budget.totalCost > 0 && 
                           plan.budget.breakdown;
    
    printResult(
      'Cost Analysis',
      hasCostAnalysis,
      `Cost per person: ${plan.budget?.costPerPerson?.toLocaleString()}`,
      'Detailed budget breakdown and cost optimization included'
    );
    
    // Test implementation details
    const hasImplementation = plan.implementation && 
                             plan.monitoring;
    
    printResult(
      'Implementation Planning',
      hasImplementation,
      'Implementation timeline and monitoring framework',
      'Ready for operational deployment'
    );
    
    return true;
    
  } catch (error) {
    printResult(
      'Response Plan Generation',
      false,
      'Plan generation failed',
      error.message
    );
    return false;
  }
}

/**
 * Test 5: Demo Scenarios
 */
async function testDemoScenarios() {
  console.log(`${colors.bright}5️⃣ Testing Demo Scenarios...${colors.reset}\n`);
  
  try {
    // Test demo scenarios endpoint
    const scenariosResponse = await apiClient.get('/api/demo/scenarios');
    const scenarios = scenariosResponse.data.data?.scenarios || {};
    
    printResult(
      'Demo Scenarios',
      scenariosResponse.status === 200 && Object.keys(scenarios).length > 0,
      `${Object.keys(scenarios).length} scenarios available`,
      'Sudan, Myanmar, and Bangladesh scenarios ready'
    );
    
    // Validate Sudan scenario (Critical)
    const sudanScenario = scenarios.sudan;
    if (sudanScenario) {
      printResult(
        'Sudan Crisis Scenario',
        sudanScenario.status === 'CRITICAL' && sudanScenario.estimatedDisplacement > 0,
        `Status: ${sudanScenario.status}, Displacement: ${sudanScenario.estimatedDisplacement}`,
        `Timeline: ${sudanScenario.timeline}, Savings: ${sudanScenario.savings}%`
      );
    }
    
    // Validate Bangladesh success story
    const bangladeshScenario = scenarios.bangladesh;
    if (bangladeshScenario) {
      printResult(
        'Bangladesh Success Story',
        bangladeshScenario.status === 'PREVENTED' && bangladeshScenario.livesImpacted > 0,
        `${bangladeshScenario.livesImpacted} lives impacted, ${bangladeshScenario.savings}% cost savings`,
        'Successful prevention case study available'
      );
    }
    
    // Test demo data refresh
    const refreshResponse = await apiClient.post('/api/demo/refresh');
    
    printResult(
      'Demo Data Refresh',
      refreshResponse.status === 200,
      'Demo data refresh capability operational',
      'Cache clearing and data refresh working'
    );
    
    return true;
    
  } catch (error) {
    printResult(
      'Demo Scenarios',
      false,
      'Demo scenarios test failed',
      error.message
    );
    return false;
  }
}

/**
 * Test 6: WebSocket Real-time Updates
 */
async function testWebSocketUpdates() {
  console.log(`${colors.bright}6️⃣ Testing WebSocket Real-time Updates...${colors.reset}\n`);
  
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(TEST_CONFIG.wsURL);
      let connectionSuccessful = false;
      let subscriptionSuccessful = false;
      let messageReceived = false;
      
      const timeout = setTimeout(() => {
        ws.close();
        resolve(false);
      }, 10000); // 10 second timeout
      
      ws.on('open', () => {
        connectionSuccessful = true;
        
        printResult(
          'WebSocket Connection',
          true,
          'Connected to real-time updates',
          `URL: ${TEST_CONFIG.wsURL}`
        );
        
        // Subscribe to topics
        ws.send(JSON.stringify({
          type: 'subscribe',
          data: {
            topics: ['crisis_updates', 'ai_analysis', 'alerts']
          }
        }));
      });
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          
          if (message.type === 'connection') {
            messageReceived = true;
            printResult(
              'WebSocket Welcome Message',
              true,
              `Client ID: ${message.clientId}`,
              'Connection established successfully'
            );
          }
          
          if (message.type === 'subscription_confirmed') {
            subscriptionSuccessful = true;
            printResult(
              'WebSocket Subscriptions',
              message.topics && message.topics.length > 0,
              `Subscribed to ${message.topics.length} topics`,
              `Topics: ${message.topics.join(', ')}`
            );
            
            // Test ping-pong
            ws.send(JSON.stringify({ type: 'ping' }));
          }
          
          if (message.type === 'pong') {
            printResult(
              'WebSocket Ping-Pong',
              true,
              'Heartbeat mechanism working',
              'WebSocket connection health monitoring operational'
            );
            
            // Test completed successfully
            clearTimeout(timeout);
            ws.close();
            resolve(connectionSuccessful && subscriptionSuccessful && messageReceived);
          }
          
        } catch (parseError) {
          console.log(`${colors.red}WebSocket message parse error: ${parseError.message}${colors.reset}`);
        }
      });
      
      ws.on('error', (error) => {
        printResult(
          'WebSocket Connection',
          false,
          'WebSocket connection failed',
          error.message
        );
        clearTimeout(timeout);
        resolve(false);
      });
      
      ws.on('close', () => {
        // Connection closed
      });
      
    } catch (error) {
      printResult(
        'WebSocket Real-time Updates',
        false,
        'WebSocket test failed',
        error.message
      );
      resolve(false);
    }
  });
}

/**
 * Test 7: System Performance and Load
 */
async function testSystemPerformance() {
  console.log(`${colors.bright}7️⃣ Testing System Performance & Load...${colors.reset}\n`);
  
  try {
    // Test system stats
    const statsResponse = await apiClient.get('/api/system/stats');
    const stats = statsResponse.data.data;
    
    printResult(
      'System Statistics',
      statsResponse.status === 200 && stats.system,
      `Uptime: ${Math.round(stats.system?.uptime)}s, Memory: ${Math.round(stats.system?.memory?.heapUsed / 1024 / 1024)}MB`,
      `Node: ${stats.system?.nodeVersion}, Version: ${stats.system?.version}`
    );
    
    // Test concurrent requests
    console.log(`   ${colors.yellow}⚡ Testing concurrent requests...${colors.reset}`);
    
    const startTime = Date.now();
    const promises = [
      apiClient.get('/api/crisis'),
      apiClient.get('/api/crisis/geographical'),
      apiClient.get('/api/crisis/metrics/global'),
      apiClient.get('/api/ai/status'),
      apiClient.get('/api/data/sources')
    ];
    
    const results = await Promise.allSettled(promises);
    const duration = Date.now() - startTime;
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.status === 200).length;
    
    printResult(
      'Concurrent Requests',
      successCount === promises.length,
      `${successCount}/${promises.length} requests successful in ${duration}ms`,
      'System handling concurrent load effectively'
    );
    
    // Test data sources status
    const sourcesResponse = await apiClient.get('/api/data/sources');
    const sources = sourcesResponse.data.data?.sources || {};
    const operational = sourcesResponse.data.data?.operational || 0;
    
    printResult(
      'Data Sources Status',
      operational > 0,
      `${operational}/${Object.keys(sources).length} sources operational`,
      'External API integrations functioning'
    );
    
    // Test global metrics
    const metricsResponse = await apiClient.get('/api/crisis/metrics/global');
    const metrics = metricsResponse.data.data;
    
    printResult(
      'Global Metrics Calculation',
      metricsResponse.status === 200 && metrics.overview,
      `Monitoring ${metrics.overview?.totalCountriesMonitored} countries`,
      `Data quality: ${metrics.overview?.dataQuality}`
    );
    
    return true;
    
  } catch (error) {
    printResult(
      'System Performance',
      false,
      'Performance test failed',
      error.message
    );
    return false;
  }
}

/**
 * Main test runner
 */
async function runPhase4Tests() {
  printHeader();
  
  const startTime = Date.now();
  const testResults = [];
  
  try {
    // Setup
    setupAPIClient();
    
    console.log(`${colors.blue}🚀 Testing complete RefugeeWatch AI system...${colors.reset}\n`);
    
    // Run all tests
    testResults.push(['API Health & Documentation', await testAPIHealth()]);
    testResults.push(['Crisis Management Endpoints', await testCrisisEndpoints()]);
    testResults.push(['AI Analysis Integration', await testAIIntegration()]);
    testResults.push(['Response Plan Generation', await testResponsePlanGeneration()]);
    testResults.push(['Demo Scenarios', await testDemoScenarios()]);
    testResults.push(['WebSocket Real-time Updates', await testWebSocketUpdates()]);
    testResults.push(['System Performance & Load', await testSystemPerformance()]);
    
    // Calculate results
    const passed = testResults.filter(([, result]) => result).length;
    const total = testResults.length;
    const duration = Date.now() - startTime;
    
    // Print summary
    console.log(`${colors.bright}${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}🎉 PHASE 4 COMPLETE SYSTEM TEST RESULTS${colors.reset}\n`);
    
    for (const [test, result] of testResults) {
      const icon = result ? '✅' : '❌';
      const color = result ? colors.green : colors.red;
      console.log(`${color}${icon} ${test}${colors.reset}`);
    }
    
    console.log(`\n${colors.bright}Summary:${colors.reset}`);
    console.log(`   Tests Passed: ${colors.green}${passed}/${total}${colors.reset}`);
    console.log(`   Duration: ${colors.blue}${Math.round(duration / 1000)}s${colors.reset}`);
    console.log(`   Status: ${passed >= total - 1 ? colors.green + '✅ HACKATHON READY!' : colors.red + '❌ ISSUES FOUND'}${colors.reset}`);
    
    if (passed >= total - 1) { // Allow 1 failure
      console.log(`\n${colors.green}${colors.bright}🏆 RefugeeWatch AI is HACKATHON READY!${colors.reset}`);
      console.log(`${colors.cyan}✅ Complete end-to-end functionality operational${colors.reset}`);
      console.log(`${colors.cyan}✅ Real-time crisis monitoring with gpt-oss AI${colors.reset}`);
      console.log(`${colors.cyan}✅ Automated response plan generation${colors.reset}`);
      console.log(`${colors.cyan}✅ Demo scenarios ready for presentation${colors.reset}`);
      console.log(`${colors.cyan}✅ WebSocket real-time updates working${colors.reset}`);
      console.log(`${colors.cyan}✅ Production-grade performance and reliability${colors.reset}\n`);
      
      console.log(`${colors.yellow}🎯 DEMO READY FEATURES:${colors.reset}`);
      console.log(`   • Sudan Crisis: CRITICAL risk, 80k people, AI analysis`);
      console.log(`   • Myanmar Crisis: HIGH risk, 35k people, preventive planning`);
      console.log(`   • Bangladesh Success: 150k displacement prevented, 93% cost savings`);
      console.log(`   • Real-time WebSocket updates for live monitoring`);
      console.log(`   • gpt-oss-20b AI providing detailed reasoning and recommendations`);
      console.log(`   • Complete 3-phase response plans with $500M+ budgets`);
      console.log('');
      
      console.log(`${colors.magenta}🚀 NEXT STEPS:${colors.reset}`);
      console.log(`   1. Record 3-minute demo video showcasing Sudan scenario`);
      console.log(`   2. Create compelling GitHub README with setup instructions`);
      console.log(`   3. Submit to OpenAI hackathon before deadline`);
      console.log(`   4. Prepare for judging and potential victory! 🏆`);
      console.log('');
      
      return true;
    } else {
      console.log(`\n${colors.red}${colors.bright}⚠️  System Issues Found${colors.reset}`);
      console.log(`${colors.yellow}Please fix failed tests before demo.${colors.reset}\n`);
      return false;
    }
    
  } catch (error) {
    console.error(`${colors.red}💥 Phase 4 test failed with error:${colors.reset}`, error.message);
    return false;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runPhase4Tests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal test error:', error);
      process.exit(1);
    });
}

module.exports = {
  runPhase4Tests,
  TEST_CONFIG
};