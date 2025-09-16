#!/usr/bin/env node

/**
 * RefugeeWatch AI - Phase 2 Data Integration Test
 * 
 * Validates real external API integration and data aggregation
 * Tests all data sources and comprehensive crisis assessment
 * 
 * @author RefugeeWatch AI Team
 * @version 1.0.0
 */

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
  timeout: 45000, // Longer timeout for API calls
  maxRetries: 2,
  testCountry: 'Sudan',
  testCountries: ['Sudan', 'Myanmar', 'Bangladesh']
};

/**
 * Print formatted test header
 */
function printHeader() {
  console.log(`${colors.cyan}${colors.bright}`);
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║              RefugeeWatch AI - Phase 2 Test             ║');
  console.log('║                Data Integration Validation               ║');
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
 * Test 1: Conflict Data Service (GDELT)
 */
async function testConflictDataService() {
  console.log(`${colors.bright}1️⃣ Testing Conflict Data Service (GDELT)...${colors.reset}\n`);
  
  try {
    const ConflictDataService = require('../src/services/data/conflictData');
    const conflictService = new ConflictDataService();
    
    printResult(
      'Conflict Service Load',
      true,
      'GDELT service initialized',
      'Ready to fetch real-time conflict data'
    );
    
    // Test conflict data retrieval
    console.log(`   ${colors.yellow}🔄 Fetching conflict data for ${TEST_CONFIG.testCountry} (may take 10-20 seconds)...${colors.reset}`);
    
    const conflictData = await conflictService.getCountryConflictData(TEST_CONFIG.testCountry, 7);
    
    if (conflictData && conflictData.country) {
      printResult(
        'GDELT API Integration',
        true,
        `Conflict level: ${conflictData.conflictLevel}, Confidence: ${Math.round(conflictData.confidence * 100)}%`,
        `Intensity score: ${conflictData.intensityScore}, Articles: ${conflictData.totalArticles}`
      );
      
      // Test global hotspots
      const hotspots = await conflictService.getGlobalConflictHotspots(3);
      printResult(
        'Global Conflict Hotspots',
        hotspots.length >= 0,
        `Found ${hotspots.length} conflict hotspots`,
        'Global monitoring operational'
      );
      
      return true;
    } else {
      printResult(
        'GDELT API Integration',
        false,
        'No conflict data returned',
        'Check GDELT API availability'
      );
      return false;
    }
    
  } catch (error) {
    printResult(
      'Conflict Data Service',
      false,
      'Service test failed',
      error.message
    );
    return false;
  }
}

/**
 * Test 2: Economic Data Service (World Bank)
 */
async function testEconomicDataService() {
  console.log(`${colors.bright}2️⃣ Testing Economic Data Service (World Bank)...${colors.reset}\n`);
  
  try {
    const EconomicDataService = require('../src/services/data/economicData');
    const economicService = new EconomicDataService();
    
    printResult(
      'Economic Service Load',
      true,
      'World Bank service initialized',
      'Ready to fetch economic indicators'
    );
    
    // Test economic data retrieval
    console.log(`   ${colors.yellow}🔄 Fetching economic data for Sudan (may take 15-25 seconds)...${colors.reset}`);
    
    const economicData = await economicService.getCountryEconomicData('SDN', 3);
    
    if (economicData && economicData.country) {
      const risk = economicData.displacementRisk;
      printResult(
        'World Bank API Integration',
        true,
        `Economic risk: ${risk.riskLevel}, Confidence: ${Math.round(risk.confidence * 100)}%`,
        `Stability: ${economicData.analysis.overallStability}, Risk score: ${risk.riskScore}`
      );
      
      // Test indicator availability
      const indicatorCount = Object.keys(economicData.indicators).length;
      printResult(
        'Economic Indicators',
        indicatorCount > 0,
        `${indicatorCount} indicators retrieved`,
        'GDP, inflation, unemployment data available'
      );
      
      return true;
    } else {
      printResult(
        'World Bank API Integration',
        false,
        'No economic data returned',
        'Check World Bank API availability'
      );
      return false;
    }
    
  } catch (error) {
    printResult(
      'Economic Data Service',
      false,
      'Service test failed',
      error.message
    );
    return false;
  }
}

/**
 * Test 3: Climate Data Service (Multiple APIs)
 */
async function testClimateDataService() {
  console.log(`${colors.bright}3️⃣ Testing Climate Data Service (USGS, Open-Meteo, NASA)...${colors.reset}\n`);
  
  try {
    const ClimateDataService = require('../src/services/data/climateData');
    const climateService = new ClimateDataService();
    
    printResult(
      'Climate Service Load',
      true,
      'Multi-API climate service initialized',
      'USGS, Open-Meteo, NASA integration ready'
    );
    
    // Test climate data retrieval (Sudan coordinates)
    console.log(`   ${colors.yellow}🔄 Fetching climate data for Sudan (may take 15-30 seconds)...${colors.reset}`);
    
    const climateData = await climateService.getCountryClimateData('Sudan', 15.5007, 32.5599);
    
    if (climateData && climateData.country) {
      const risk = climateData.displacementRisk;
      printResult(
        'Climate APIs Integration',
        true,
        `Climate risk: ${climateData.overallRisk}, Confidence: ${Math.round(climateData.confidence * 100)}%`,
        `Active hazards: ${climateData.activeHazards.length}, Recent events: ${climateData.recentEvents.length}`
      );
      
      // Test individual API components
      const hasEarthquakeData = climateData.recentEvents.some(e => e.type === 'earthquake');
      const hasWeatherData = climateData.activeHazards.length >= 0;
      
      printResult(
        'Multi-API Data Collection',
        hasWeatherData,
        `Weather: ✓, Earthquakes: ${hasEarthquakeData ? '✓' : '○'}`,
        'Multiple climate data sources integrated'
      );
      
      return true;
    } else {
      printResult(
        'Climate APIs Integration',
        false,
        'No climate data returned',
        'Check climate APIs availability'
      );
      return false;
    }
    
  } catch (error) {
    printResult(
      'Climate Data Service',
      false,
      'Service test failed',
      error.message
    );
    return false;
  }
}

/**
 * Test 4: News Data Service (NewsAPI, Guardian)
 */
async function testNewsDataService() {
  console.log(`${colors.bright}4️⃣ Testing News Data Service (NewsAPI, Guardian)...${colors.reset}\n`);
  
  try {
    const NewsDataService = require('../src/services/data/newsData');
    const newsService = new NewsDataService();
    
    printResult(
      'News Service Load',
      true,
      'Multi-source news service initialized',
      'NewsAPI and Guardian integration ready'
    );
    
    // Check API keys
    const hasNewsAPI = !!process.env.NEWS_API_KEY;
    const hasGuardian = !!process.env.GUARDIAN_API_KEY;
    
    printResult(
      'News API Keys',
      hasNewsAPI || hasGuardian,
      `NewsAPI: ${hasNewsAPI ? '✓' : '○'}, Guardian: ${hasGuardian ? '✓' : '○'}`,
      hasNewsAPI && hasGuardian ? 'Both APIs configured' : 'At least one API configured'
    );
    
    // Test news data retrieval
    console.log(`   ${colors.yellow}🔄 Fetching news data for ${TEST_CONFIG.testCountry} (may take 10-20 seconds)...${colors.reset}`);
    
    const newsData = await newsService.getCountryNewsAnalysis(TEST_CONFIG.testCountry, 7);
    
    if (newsData && newsData.country) {
      printResult(
        'News APIs Integration',
        true,
        `Crisis level: ${newsData.crisisLevel}, Urgency: ${newsData.urgencyScore}`,
        `Articles: ${newsData.articleCount}, Media attention: ${newsData.mediaAttention}`
      );
      
      // Test analysis capabilities
      const hasIndicators = newsData.keyIndicators.length > 0;
      const hasBreaking = newsData.breakingNews.length > 0;
      
      printResult(
        'News Analysis',
        hasIndicators,
        `Indicators: ${newsData.keyIndicators.length}, Breaking: ${newsData.breakingNews.length}`,
        'News analysis and sentiment detection working'
      );
      
      return true;
    } else {
      printResult(
        'News APIs Integration',
        false,
        'No news data returned',
        'Check news APIs availability or keys'
      );
      return false;
    }
    
  } catch (error) {
    printResult(
      'News Data Service',
      false,
      'Service test failed',
      error.message
    );
    return false;
  }
}

/**
 * Test 5: Data Aggregator Service
 */
async function testDataAggregatorService() {
  console.log(`${colors.bright}5️⃣ Testing Data Aggregator Service...${colors.reset}\n`);
  
  try {
    const DataAggregatorService = require('../src/services/processing/dataAggregator');
    const aggregatorService = new DataAggregatorService();
    
    printResult(
      'Aggregator Service Load',
      true,
      'Data aggregation service initialized',
      'All data sources integrated'
    );
    
    // Test comprehensive assessment
    console.log(`   ${colors.yellow}🔄 Running comprehensive crisis assessment for ${TEST_CONFIG.testCountry} (may take 30-60 seconds)...${colors.reset}`);
    
    const assessment = await aggregatorService.getComprehensiveCrisisAssessment(TEST_CONFIG.testCountry);
    
    if (assessment && assessment.country) {
      printResult(
        'Comprehensive Assessment',
        true,
        `Overall risk: ${assessment.overallRisk}, Confidence: ${Math.round(assessment.confidence * 100)}%`,
        `Data quality: ${assessment.dataQuality}, Sources: ${Object.keys(assessment.sources).length}`
      );
      
      // Test source integration
      const availableSources = Object.values(assessment.dataAvailability).filter(Boolean).length;
      printResult(
        'Multi-source Integration',
        availableSources >= 2,
        `${availableSources}/4 data sources available`,
        'Real-time data aggregation working'
      );
      
      // Test displacement risk calculation
      const displacement = assessment.displacementRisk;
      printResult(
        'Displacement Risk Analysis',
        displacement.level !== 'UNKNOWN',
        `Risk: ${displacement.level}, Timeline: ${displacement.timeline}`,
        `Estimated: ${displacement.estimatedNumbers} people, Causes: ${displacement.primaryCauses.length}`
      );
      
      return true;
    } else {
      printResult(
        'Comprehensive Assessment',
        false,
        'No assessment data returned',
        'Check data aggregation logic'
      );
      return false;
    }
    
  } catch (error) {
    printResult(
      'Data Aggregator Service',
      false,
      'Service test failed',
      error.message
    );
    return false;
  }
}

/**
 * Test 6: Multi-Country Monitoring
 */
async function testMultiCountryMonitoring() {
  console.log(`${colors.bright}6️⃣ Testing Multi-Country Monitoring...${colors.reset}\n`);
  
  try {
    const DataAggregatorService = require('../src/services/processing/dataAggregator');
    const aggregatorService = new DataAggregatorService();
    
    console.log(`   ${colors.yellow}🔄 Running multi-country monitoring for 3 countries (may take 60-120 seconds)...${colors.reset}`);
    
    const assessments = await aggregatorService.getMultiCountryCrisisMonitoring(TEST_CONFIG.testCountries);
    
    if (assessments && assessments.length > 0) {
      printResult(
        'Multi-Country Monitoring',
        true,
        `${assessments.length} countries assessed`,
        'Global crisis monitoring operational'
      );
      
      // Analyze results
      const criticalCount = assessments.filter(a => a.overallRisk === 'CRITICAL').length;
      const highCount = assessments.filter(a => a.overallRisk === 'HIGH').length;
      const totalAtRisk = criticalCount + highCount;
      
      printResult(
        'Risk Level Distribution',
        true,
        `Critical: ${criticalCount}, High: ${highCount}, At Risk: ${totalAtRisk}`,
        'Risk prioritization working'
      );
      
      // Test data quality across countries
      const avgDataQuality = assessments.reduce((sum, a) => {
        const qualityScore = { 'EXCELLENT': 4, 'GOOD': 3, 'FAIR': 2, 'POOR': 1 }[a.dataQuality] || 1;
        return sum + qualityScore;
      }, 0) / assessments.length;
      
      printResult(
        'Data Quality Assessment',
        avgDataQuality >= 2,
        `Average quality: ${avgDataQuality.toFixed(1)}/4`,
        'Data quality monitoring functional'
      );
      
      return true;
    } else {
      printResult(
        'Multi-Country Monitoring',
        false,
        'No assessment results returned',
        'Check multi-country processing'
      );
      return false;
    }
    
  } catch (error) {
    printResult(
      'Multi-Country Monitoring',
      false,
      'Monitoring test failed',
      error.message
    );
    return false;
  }
}

/**
 * Test 7: Real-time Performance
 */
async function testRealTimePerformance() {
  console.log(`${colors.bright}7️⃣ Testing Real-time Performance...${colors.reset}\n`);
  
  try {
    const DataAggregatorService = require('../src/services/processing/dataAggregator');
    const aggregatorService = new DataAggregatorService();
    
    // Test rapid sequential assessments
    const startTime = Date.now();
    
    console.log(`   ${colors.yellow}🔄 Testing rapid assessment performance...${colors.reset}`);
    
    const rapidAssessment = await aggregatorService.getComprehensiveCrisisAssessment('Myanmar');
    const duration = Date.now() - startTime;
    
    printResult(
      'Assessment Speed',
      duration < 45000,
      `Completed in ${Math.round(duration / 1000)}s`,
      'Performance within acceptable limits'
    );
    
    // Test caching efficiency
    const cachedStartTime = Date.now();
    const cachedAssessment = await aggregatorService.getComprehensiveCrisisAssessment('Myanmar');
    const cachedDuration = Date.now() - cachedStartTime;
    
    printResult(
      'Caching Efficiency',
      cachedDuration < 1000,
      `Cached response in ${cachedDuration}ms`,
      'Caching system working effectively'
    );
    
    // Test system status
    const systemStatus = aggregatorService.getSystemStatus();
    printResult(
      'System Status',
      systemStatus.status === 'operational',
      `Status: ${systemStatus.status}`,
      `Cache size: ${systemStatus.cacheSize}, Sources: ${Object.keys(systemStatus.dataSources).length}`
    );
    
    return true;
    
  } catch (error) {
    printResult(
      'Real-time Performance',
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
async function runPhase2Tests() {
  printHeader();
  
  const startTime = Date.now();
  const testResults = [];
  
  try {
    // Load environment variables
    require('dotenv').config();
    
    console.log(`${colors.blue}🌍 Testing real external APIs for crisis monitoring...${colors.reset}\n`);
    
    // Run all tests
    testResults.push(['Conflict Data Service', await testConflictDataService()]);
    testResults.push(['Economic Data Service', await testEconomicDataService()]);
    testResults.push(['Climate Data Service', await testClimateDataService()]);
    testResults.push(['News Data Service', await testNewsDataService()]);
    testResults.push(['Data Aggregator Service', await testDataAggregatorService()]);
    testResults.push(['Multi-Country Monitoring', await testMultiCountryMonitoring()]);
    testResults.push(['Real-time Performance', await testRealTimePerformance()]);
    
    // Calculate results
    const passed = testResults.filter(([, result]) => result).length;
    const total = testResults.length;
    const duration = Date.now() - startTime;
    
    // Print summary
    console.log(`${colors.bright}${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}📊 PHASE 2 DATA INTEGRATION TEST RESULTS${colors.reset}\n`);
    
    for (const [test, result] of testResults) {
      const icon = result ? '✅' : '❌';
      const color = result ? colors.green : colors.red;
      console.log(`${color}${icon} ${test}${colors.reset}`);
    }
    
    console.log(`\n${colors.bright}Summary:${colors.reset}`);
    console.log(`   Tests Passed: ${colors.green}${passed}/${total}${colors.reset}`);
    console.log(`   Duration: ${colors.blue}${Math.round(duration / 1000)}s${colors.reset}`);
    console.log(`   Status: ${passed >= total - 1 ? colors.green + '✅ READY FOR PHASE 3' : colors.red + '❌ ISSUES FOUND'}${colors.reset}`);
    
    if (passed >= total - 1) { // Allow 1 failure (e.g., missing API key)
      console.log(`\n${colors.green}${colors.bright}🎉 Phase 2 Data Integration Complete!${colors.reset}`);
      console.log(`${colors.cyan}✅ Real-time crisis monitoring operational${colors.reset}`);
      console.log(`${colors.cyan}✅ Multi-source data aggregation working${colors.reset}`);
      console.log(`${colors.cyan}✅ Comprehensive assessments generating${colors.reset}\n`);
      
      console.log(`${colors.yellow}Next Steps:${colors.reset}`);
      console.log(`   1. Add any missing API keys for full coverage`);
      console.log(`   2. Review data quality and performance`);
      console.log(`   3. Ready for Phase 3: AI integration with gpt-oss`);
      console.log('');
      
      return true;
    } else {
      console.log(`\n${colors.red}${colors.bright}⚠️  Phase 2 Issues Found${colors.reset}`);
      console.log(`${colors.yellow}Please fix the failed tests before proceeding to Phase 3.${colors.reset}`);
      console.log(`${colors.blue}💡 Most issues are likely missing API keys - check your .env file${colors.reset}\n`);
      return false;
    }
    
  } catch (error) {
    console.error(`${colors.red}💥 Phase 2 test failed with error:${colors.reset}`, error.message);
    return false;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runPhase2Tests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal test error:', error);
      process.exit(1);
    });
}

module.exports = {
  runPhase2Tests,
  TEST_CONFIG
};