/**
 * RefugeeWatch AI - Complete Backend Test Suite (Single File)
 * 
 * Tests ALL your backend endpoints and AI functionality
 * Run with: node backend-test.js
 * 
 * @author RefugeeWatch AI Team
 * @version 1.0.0
 */

const axios = require('axios');
const WebSocket = require('ws');

// Test Configuration
const config = {
  baseURL: 'http://localhost:3001',
  timeout: 120000,
  testCountries: ['sudan', 'myanmar', 'bangladesh', 'ukraine', 'afghanistan'],
  wsTimeout: 10000
};

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

// Test Results Tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

/**
 * Log test result
 */
function logResult(testName, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`${colors.green}✅ ${testName}${colors.reset}`);
  } else {
    testResults.failed++;
    testResults.errors.push({ test: testName, details });
    console.log(`${colors.red}❌ ${testName}${colors.reset}`);
  }
  if (details) {
    console.log(`   ${colors.blue}→ ${details}${colors.reset}`);
  }
}

/**
 * Wait function
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Make HTTP request with error handling
 */
async function makeRequest(method, url, data = null) {
  try {
    const response = await axios({
      method,
      url: `${config.baseURL}${url}`,
      data,
      timeout: config.timeout,
      validateStatus: () => true // Don't throw on HTTP errors
    });
    return response;
  } catch (error) {
    return { 
      status: 500, 
      data: { error: error.message },
      error: error.message 
    };
  }
}

/**
 * TEST SUITE EXECUTION
 */
async function runAllTests() {
  console.log(`${colors.cyan}${colors.bright}`);
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║         RefugeeWatch AI - Backend Test Suite            ║');
  console.log('║              Testing ALL Endpoints & AI                 ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}\n`);

  const startTime = Date.now();

  // 1. HEALTH & FOUNDATION TESTS
  console.log(`${colors.yellow}1️⃣ Testing Health & Foundation...${colors.reset}`);
  await testHealthEndpoints();

  // 2. CRISIS ENDPOINTS
  console.log(`\n${colors.yellow}2️⃣ Testing Crisis Endpoints...${colors.reset}`);
  await testCrisisEndpoints();

  // 3. AI INTEGRATION (CORE FUNCTIONALITY)
  console.log(`\n${colors.yellow}3️⃣ Testing AI Integration (GPT-OSS)...${colors.reset}`);
  await testAIIntegration();

  // 4. RESPONSE PLAN GENERATION
  console.log(`\n${colors.yellow}4️⃣ Testing AI Response Plans...${colors.reset}`);
  await testResponsePlans();

  // 5. DATA SOURCES
  console.log(`\n${colors.yellow}5️⃣ Testing Data Sources...${colors.reset}`);
  await testDataSources();

  // 6. WEBSOCKET
  console.log(`\n${colors.yellow}6️⃣ Testing WebSocket...${colors.reset}`);
  await testWebSocket();

  // 7. PERFORMANCE & EDGE CASES
  console.log(`\n${colors.yellow}7️⃣ Testing Performance & Edge Cases...${colors.reset}`);
  await testPerformanceAndErrors();

  // FINAL RESULTS
  const duration = Date.now() - startTime;
  printFinalResults(duration);
}

/**
 * Test health and foundation endpoints
 */
async function testHealthEndpoints() {
  // Health check
  const health = await makeRequest('GET', '/health');
  logResult(
    'Health Check', 
    health.status === 200 && health.data.status === 'healthy',
    health.status === 200 ? `Uptime: ${Math.floor(health.data.uptime)}s` : health.data.error
  );

  // Root API info
  const root = await makeRequest('GET', '/');
  logResult(
    'API Information',
    root.status === 200 && root.data.name === 'RefugeeWatch AI Backend',
    root.status === 200 ? `AI Model: ${root.data.aiModels?.primary}` : root.data.error
  );

  // API documentation
  const apiDocs = await makeRequest('GET', '/api');
  logResult(
    'API Documentation',
    apiDocs.status === 200 && apiDocs.data.endpoints,
    apiDocs.status === 200 ? `${Object.keys(apiDocs.data.endpoints).length} endpoint categories` : apiDocs.data.error
  );
}

/**
 * Test crisis management endpoints
 */
async function testCrisisEndpoints() {
  // Get all crises
  const crises = await makeRequest('GET', '/api/crisis');
  logResult(
    'Crisis List',
    crises.status === 200 && crises.data.success && Array.isArray(crises.data.data.crises),
    crises.status === 200 ? `${crises.data.data.crises.length} countries monitored` : crises.data.error
  );

  // Test specific crisis
  for (const country of config.testCountries.slice(0, 3)) {
    const crisis = await makeRequest('GET', `/api/crisis/${country}`);
    logResult(
      `Crisis Details - ${country.toUpperCase()}`,
      crisis.status === 200 && crisis.data.success && crisis.data.data.country,
      crisis.status === 200 ? `Risk: ${crisis.data.data.riskLevel}, Confidence: ${Math.round(crisis.data.data.confidence * 100)}%` : crisis.data.error
    );
  }

  // Global metrics
  const metrics = await makeRequest('GET', '/api/crisis/metrics/global');
  logResult(
    'Global Metrics',
    metrics.status === 200 && metrics.data.success && metrics.data.data.overview,
    metrics.status === 200 ? `${metrics.data.data.overview.totalCountriesMonitored} countries, ${metrics.data.data.totalDisplaced} displaced` : metrics.data.error
  );

  // Geographical data
  const geo = await makeRequest('GET', '/api/crisis/geographical');
  logResult(
    'Geographical Data',
    geo.status === 200 && geo.data.success && Array.isArray(geo.data.data.locations),
    geo.status === 200 ? `${geo.data.data.locations.length} locations mapped` : geo.data.error
  );

  // Test filters
  const filtered = await makeRequest('GET', '/api/crisis?riskLevel=HIGH&limit=5');
  logResult(
    'Crisis Filtering',
    filtered.status === 200 && filtered.data.success,
    filtered.status === 200 ? `${filtered.data.data.crises.length} high-risk countries` : filtered.data.error
  );
}

/**
 * Test AI integration (MOST IMPORTANT)
 */
async function testAIIntegration() {
  // AI service status
  const aiStatus = await makeRequest('GET', '/api/ai/status');
  logResult(
    'AI Service Status',
    aiStatus.status === 200 && aiStatus.data.success,
    aiStatus.status === 200 ? `Model: ${aiStatus.data.data?.model}, Status: ${aiStatus.data.data?.status}` : aiStatus.data.error
  );

  // Test AI analysis for different countries
  for (const country of config.testCountries.slice(0, 3)) {
    console.log(`   ${colors.blue}🤖 Running AI analysis for ${country}... (may take 30-90 seconds)${colors.reset}`);
    
    const aiAnalysis = await makeRequest('POST', `/api/crisis/${country}/analyze`, {
      options: {
        temperature: 0.7,
        priority: 'standard'
      }
    });

    if (aiAnalysis.status === 200 && aiAnalysis.data.success) {
      const analysis = aiAnalysis.data.data;
      const hasValidAI = analysis.aiAssessment && 
                        analysis.aiAssessment.riskLevel &&
                        analysis.aiAssessment.confidence &&
                        analysis.aiAssessment.reasoning &&
                        analysis.keyFindings &&
                        analysis.recommendations;

      logResult(
        `AI Analysis - ${country.toUpperCase()}`,
        hasValidAI,
        hasValidAI ? 
          `AI Risk: ${analysis.aiAssessment.riskLevel}, Confidence: ${Math.round(analysis.aiAssessment.confidence * 100)}%, Reasoning: ${analysis.aiAssessment.reasoning.length} chars` :
          'Invalid AI response structure'
      );

      // Test AI reasoning quality
      if (hasValidAI) {
        const reasoning = analysis.aiAssessment.reasoning;
        const hasQualityReasoning = reasoning.length > 100 && 
                                   (reasoning.toLowerCase().includes('conflict') || 
                                    reasoning.toLowerCase().includes('economic') || 
                                    reasoning.toLowerCase().includes('crisis') ||
                                    reasoning.toLowerCase().includes('displacement'));

        logResult(
          `AI Reasoning Quality - ${country.toUpperCase()}`,
          hasQualityReasoning,
          `${reasoning.length} characters, Contains context: ${hasQualityReasoning}`
        );

        // Test recommendations
        const hasGoodRecs = analysis.recommendations.immediate.length > 0 &&
                           analysis.recommendations.shortTerm.length > 0;
        
        logResult(
          `AI Recommendations - ${country.toUpperCase()}`,
          hasGoodRecs,
          `Immediate: ${analysis.recommendations.immediate.length}, Short-term: ${analysis.recommendations.shortTerm.length}`
        );
      }
    } else {
      logResult(
        `AI Analysis - ${country.toUpperCase()}`,
        false,
        aiAnalysis.data.error || `HTTP ${aiAnalysis.status}`
      );
    }

    // Wait between AI calls to avoid overwhelming
    await delay(2000);
  }

  // Test AI with different parameters
  console.log(`   ${colors.blue}🧪 Testing AI parameter sensitivity...${colors.reset}`);
  const paramTest = await makeRequest('POST', '/api/crisis/bangladesh/analyze', {
    options: {
      temperature: 0.1, // Low temperature for consistency
      priority: 'immediate'
    }
  });

  logResult(
    'AI Parameter Testing',
    paramTest.status === 200 && paramTest.data.success,
    paramTest.status === 200 ? 'Low temperature analysis successful' : paramTest.data.error
  );
}

/**
 * Test AI response plan generation
 */
async function testResponsePlans() {
  // Test plan generation for different scenarios
  const planScenarios = [
    { country: 'sudan', type: 'emergency' },
    { country: 'bangladesh', type: 'comprehensive' },
    { country: 'myanmar', type: 'rapid' }
  ];

  for (const scenario of planScenarios) {
    console.log(`   ${colors.blue}📋 Generating ${scenario.type} plan for ${scenario.country}... (may take 60-120 seconds)${colors.reset}`);
    
    const planResponse = await makeRequest('POST', `/api/crisis/${scenario.country}/plan`, {
      planType: scenario.type,
      includeCosting: true
    });

    if (planResponse.status === 200 && planResponse.data.success) {
      const plan = planResponse.data.data;
      const hasValidPlan = plan.overview && 
                          plan.phases && 
                          plan.costAnalysis && 
                          plan.totalCost > 0 &&
                          plan.phases.emergency &&
                          plan.phases.stabilization &&
                          plan.phases.integration;

      logResult(
        `AI Response Plan - ${scenario.country.toUpperCase()} (${scenario.type})`,
        hasValidPlan,
        hasValidPlan ? 
          `Cost: $${plan.totalCost.toLocaleString()}, Beneficiaries: ${plan.overview.estimatedBeneficiaries.toLocaleString()}` :
          'Invalid plan structure'
      );

      // Test plan quality
      if (hasValidPlan) {
        const totalActivities = Object.values(plan.phases).reduce((sum, phase) => 
          sum + (phase.activities ? phase.activities.length : 0), 0
        );
        
        logResult(
          `Plan Quality - ${scenario.country.toUpperCase()}`,
          totalActivities > 5 && plan.costAnalysis.breakdown,
          `${totalActivities} activities, Cost breakdown: ${Object.keys(plan.costAnalysis.breakdown).length} categories`
        );
      }
    } else {
      logResult(
        `AI Response Plan - ${scenario.country.toUpperCase()}`,
        false,
        planResponse.data.error || `HTTP ${planResponse.status}`
      );
    }

    await delay(3000);
  }

  // Plan history
  const history = await makeRequest('GET', '/api/plans/history?limit=10');
  logResult(
    'Plan History',
    history.status === 200 && history.data.success,
    history.status === 200 ? `${history.data.data.plans.length} plans in history` : history.data.error
  );
}

/**
 * Test data sources integration
 */
async function testDataSources() {
  const sources = await makeRequest('GET', '/api/data/sources');
  logResult(
    'Data Sources Status',
    sources.status === 200 && sources.data.success && sources.data.data.sources,
    sources.status === 200 ? 
      `${sources.data.data.operational}/${sources.data.data.totalSources} sources operational` :
      sources.data.error
  );

  // Test demo scenarios
  const demo = await makeRequest('GET', '/api/demo/scenarios');
  logResult(
    'Demo Scenarios',
    demo.status === 200 && demo.data.success,
    demo.status === 200 ? `${demo.data.data.scenarios.length} demo scenarios` : demo.data.error
  );
}

/**
 * Test WebSocket functionality
 */
async function testWebSocket() {
  return new Promise((resolve) => {
    // WebSocket info endpoint
    makeRequest('GET', '/api/websocket/info').then(wsInfo => {
      logResult(
        'WebSocket Info',
        wsInfo.status === 200 && wsInfo.data.success && wsInfo.data.data.topics,
        wsInfo.status === 200 ? `${wsInfo.data.data.topics.length} topics available` : wsInfo.data.error
      );
    });

    // Test WebSocket connection
    const wsUrl = `ws://localhost:3001/ws`;
    const ws = new WebSocket(wsUrl);
    let connectionSuccessful = false;

    ws.on('open', () => {
      connectionSuccessful = true;
      
      // Subscribe to topics
      ws.send(JSON.stringify({
        type: 'subscribe',
        data: { topics: ['crisis_updates', 'ai_analysis'] }
      }));
    });

    ws.on('message', (data) => {
      const message = JSON.parse(data);
      if (message.type === 'subscription_confirmed') {
        logResult(
          'WebSocket Connection & Subscription',
          true,
          `Subscribed to ${message.data.topics.length} topics`
        );
        ws.close();
        resolve();
      }
    });

    ws.on('error', (error) => {
      logResult(
        'WebSocket Connection',
        false,
        `Connection failed: ${error.message}`
      );
      resolve();
    });

    setTimeout(() => {
      if (!connectionSuccessful) {
        logResult('WebSocket Connection', false, 'Connection timeout');
      }
      ws.close();
      resolve();
    }, config.wsTimeout);
  });
}

/**
 * Test performance and error handling
 */
async function testPerformanceAndErrors() {
  // Performance test endpoint
  const perf = await makeRequest('GET', '/api/test/performance');
  logResult(
    'Performance Test',
    perf.status === 200 && perf.data.success,
    perf.status === 200 ? `Processing time: ${perf.data.data.processingTime}` : perf.data.error
  );

  // Bulk operations
  const bulk = await makeRequest('POST', '/api/crisis/bulk', {
    countries: ['sudan', 'myanmar', 'bangladesh']
  });
  logResult(
    'Bulk Operations',
    bulk.status === 200 && bulk.data.success,
    bulk.status === 200 ? `Processed ${bulk.data.data.results.length} countries` : bulk.data.error
  );

  // Error handling - invalid country
  const invalid = await makeRequest('GET', '/api/crisis/invalidcountry');
  logResult(
    'Error Handling (404)',
    invalid.status === 404 && invalid.data.error,
    'Properly returns 404 for invalid country'
  );

  // Error handling - invalid route
  const invalidRoute = await makeRequest('GET', '/api/nonexistent/route');
  logResult(
    'Error Handling (Route Not Found)',
    invalidRoute.status === 404 && invalidRoute.data.error,
    'Properly returns 404 for invalid routes'
  );

  // Test concurrent requests
  console.log(`   ${colors.blue}⚡ Testing concurrent requests...${colors.reset}`);
  const concurrentPromises = [
    makeRequest('GET', '/api/crisis'),
    makeRequest('GET', '/api/crisis/sudan'),
    makeRequest('GET', '/api/data/sources'),
    makeRequest('GET', '/health'),
    makeRequest('GET', '/api/crisis/metrics/global')
  ];

  const concurrentResults = await Promise.allSettled(concurrentPromises);
  const successCount = concurrentResults.filter(r => 
    r.status === 'fulfilled' && r.value.status === 200
  ).length;

  logResult(
    'Concurrent Requests',
    successCount >= 4,
    `${successCount}/5 requests successful`
  );
}

/**
 * Print final test results
 */
function printFinalResults(duration) {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.bright}${colors.cyan}FINAL TEST RESULTS${colors.reset}`);
  console.log('='.repeat(60));
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  const durationSeconds = (duration / 1000).toFixed(1);
  
  console.log(`${colors.bright}Total Tests: ${testResults.total}${colors.reset}`);
  console.log(`${colors.green}✅ Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${testResults.failed}${colors.reset}`);
  console.log(`${colors.yellow}Success Rate: ${successRate}%${colors.reset}`);
  console.log(`${colors.blue}Duration: ${durationSeconds} seconds${colors.reset}`);

  if (testResults.failed > 0) {
    console.log(`\n${colors.red}${colors.bright}FAILED TESTS:${colors.reset}`);
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}`);
      if (error.details) {
        console.log(`   ${colors.yellow}→ ${error.details}${colors.reset}`);
      }
    });
  }

  console.log('\n' + '='.repeat(60));
  
  if (successRate >= 80) {
    console.log(`${colors.green}${colors.bright}🎉 BACKEND TEST SUITE PASSED!${colors.reset}`);
    console.log(`${colors.green}Your RefugeeWatch AI backend is working properly with AI integration!${colors.reset}`);
  } else if (successRate >= 60) {
    console.log(`${colors.yellow}${colors.bright}⚠️  BACKEND PARTIALLY WORKING${colors.reset}`);
    console.log(`${colors.yellow}Most functionality works, but some issues need attention.${colors.reset}`);
  } else {
    console.log(`${colors.red}${colors.bright}❌ BACKEND NEEDS ATTENTION${colors.reset}`);
    console.log(`${colors.red}Multiple critical issues found. Please check your backend setup.${colors.reset}`);
  }

  console.log('\n' + '='.repeat(60));
}

/**
 * Main execution
 */
async function main() {
  try {
    await runAllTests();
    process.exit(0);
  } catch (error) {
    console.error(`${colors.red}Test runner error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Check if running as main script
if (require.main === module) {
  main();
}

module.exports = { runAllTests };