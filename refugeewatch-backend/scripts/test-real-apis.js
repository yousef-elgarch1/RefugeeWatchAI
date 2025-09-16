#!/usr/bin/env node
/**
 * Final Debug Test Script - Complete Coverage
 */

require('dotenv').config();
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m'
};

async function testFinalImplementation(name, url, expectedKeys = [], shouldHaveData = true) {
  try {
    console.log(`${colors.cyan}Testing ${name}...${colors.reset}`);
    console.log(`${colors.dim}  URL: ${url}${colors.reset}`);
    
    const startTime = Date.now();
    const response = await axios.get(url, { 
      timeout: 20000,
      validateStatus: function (status) {
        return status < 600;
      }
    });
    const duration = Date.now() - startTime;
    
    console.log(`${colors.dim}  Status: ${response.status} (${duration}ms)${colors.reset}`);
    
    if (response.status === 200 && response.data) {
      const hasRealData = shouldHaveData ? 
        (response.data.data && (Array.isArray(response.data.data) ? response.data.data.length > 0 : true)) ||
        (response.data.success !== false) :
        true;
      
      if (hasRealData && response.data.success !== false) {
        console.log(`${colors.green}✅ ${name}: WORKING PERFECTLY${colors.reset}`);
        
        if (response.data.source) {
          console.log(`   Source: ${response.data.source}`);
        }
        if (response.data.count) {
          console.log(`   Count: ${response.data.count} items`);
        }
        if (response.data.totalDisplaced) {
          console.log(`   Total Displaced: ${response.data.totalDisplaced.toLocaleString()}`);
        }
        
        return true;
      }
    }
    
    console.log(`${colors.red}❌ ${name}: Failed${colors.reset}`);
    return false;
    
  } catch (error) {
    console.log(`${colors.red}❌ ${name}: Error - ${error.message}${colors.reset}`);
    return false;
  }
}

async function runFinalTests() {
  console.log(`${colors.cyan}${colors.bright}🏁 RefugeeWatch AI - Final Complete Test${colors.reset}\n`);
  
  const tests = [
    // Core Health
    ['Server Health', `${API_BASE}/health`, [], true],
    ['All Services Health', `${API_BASE}/health/services`, [], true],
    
    // Geographic Data
    ['All Countries', `${API_BASE}/countries`, [], true],
    ['Syria Geographic', `${API_BASE}/countries/Syria`, [], true],
    
    // UNHCR Data (Final Working Version)
    ['UNHCR All Data (Final)', `${API_BASE}/refugees/unhcr`, [], true],
    ['UNHCR Syria (Final)', `${API_BASE}/refugees/unhcr/Syria`, [], true],
    ['UNHCR Global Stats (Final)', `${API_BASE}/refugees/unhcr/stats/global`, [], true],
    
    // Climate & News (Working)
    ['Real Earthquakes', `${API_BASE}/climate/earthquakes`, [], false],
    ['Real Weather', `${API_BASE}/climate/weather?lat=33.5&lng=36.3`, [], true],
    ['Climate Events', `${API_BASE}/climate/events?lat=33.5&lng=36.3`, [], false],
    ['Crisis News', `${API_BASE}/news/crisis?q=Syria`, [], false],
    ['NewsAPI', `${API_BASE}/news/newsapi?q=refugee`, [], false],
    ['Guardian', `${API_BASE}/news/guardian?q=crisis`, [], false],
    
    // Enhanced Crisis Endpoints
    ['Crisis List (Enhanced)', `${API_BASE}/crisis`, [], true],
    ['Syria Crisis (Enhanced)', `${API_BASE}/crisis/Syria`, [], true],
    ['Global Metrics (Enhanced)', `${API_BASE}/crisis/metrics/global`, [], true],
    ['Geographical Data (FIXED)', `${API_BASE}/crisis/geographical`, [], true],
    
    // AI Status
    ['AI Service Status', `${API_BASE}/ai/status`, [], true]
  ];
  
  let passed = 0;
  
  for (const [name, url, expectedKeys, shouldHaveData] of tests) {
    const success = await testFinalImplementation(name, url, expectedKeys, shouldHaveData);
    if (success) passed++;
    console.log('');
  }
  
  console.log(`${colors.bright}🏆 FINAL RESULTS:${colors.reset}`);
  console.log(`Passed: ${colors.green}${passed}${colors.reset}/${tests.length}`);
  
  if (passed === tests.length) {
    console.log(`${colors.green}🎉 PERFECT! ALL TESTS PASS!${colors.reset}`);
    console.log(`${colors.green}🚀 Ready for Phase 3 (Frontend Integration)!${colors.reset}`);
  } else if (passed >= tests.length * 0.9) {
    console.log(`${colors.yellow}⚠️  Almost perfect - minor issues remain${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Some issues remain - check the failures above${colors.reset}`);
  }
  
  console.log(`\n${colors.cyan}Final System Status:${colors.reset}`);
  console.log(`• UNHCR Data: Real API + Reliable Fallback`);
  console.log(`• Geographic Data: REST Countries API`);
  console.log(`• Climate Data: USGS + Open-Meteo + NASA`);
  console.log(`• News Data: NewsAPI + Guardian`);
  console.log(`• AI Integration: Hugging Face Ready`);
}

runFinalTests().catch(console.error);