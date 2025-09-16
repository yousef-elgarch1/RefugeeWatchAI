#!/usr/bin/env node

/**
 * RefugeeWatch AI - Quick API Test Script
 * 
 * Tests all external APIs to ensure they work before Phase 2
 * 
 * @author RefugeeWatch AI Team
 * @version 1.0.0
 */

require('dotenv').config();
const axios = require('axios');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

console.log(`${colors.cyan}${colors.bright}🧪 RefugeeWatch AI - API Testing${colors.reset}\n`);

/**
 * Test NewsAPI
 */
async function testNewsAPI() {
  const apiKey = process.env.NEWS_API_KEY;
  
  if (!apiKey || apiKey === 'your_newsapi_key_here') {
    console.log(`${colors.yellow}⚠️  NewsAPI: Not configured${colors.reset}`);
    console.log(`   Get free key at: https://newsapi.org/register`);
    return false;
  }
  
  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'refugee OR crisis OR conflict',
        pageSize: 1,
        apiKey: apiKey
      },
      timeout: 10000
    });
    
    if (response.status === 200 && response.data.articles) {
      console.log(`${colors.green}✅ NewsAPI: Working${colors.reset}`);
      console.log(`   Articles found: ${response.data.totalResults}`);
      console.log(`   Requests remaining: ${response.headers['x-api-key-remaining'] || 'Unknown'}`);
      return true;
    }
  } catch (error) {
    console.log(`${colors.red}❌ NewsAPI: Error${colors.reset}`);
    console.log(`   ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test NASA API
 */
async function testNASA() {
  const apiKey = process.env.NASA_API_KEY;
  
  if (!apiKey || apiKey === 'your_nasa_key_here') {
    console.log(`${colors.yellow}⚠️  NASA API: Not configured${colors.reset}`);
    console.log(`   Get free key at: https://api.nasa.gov/`);
    return false;
  }
  
  try {
    const response = await axios.get('https://api.nasa.gov/planetary/apod', {
      params: {
        api_key: apiKey,
        count: 1
      },
      timeout: 10000
    });
    
    if (response.status === 200) {
      console.log(`${colors.green}✅ NASA API: Working${colors.reset}`);
      console.log(`   API key valid, requests working`);
      return true;
    }
  } catch (error) {
    console.log(`${colors.red}❌ NASA API: Error${colors.reset}`);
    console.log(`   ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

/**
 * Test Guardian API
 */
async function testGuardianAPI() {
  const apiKey = process.env.GUARDIAN_API_KEY;
  
  if (!apiKey || apiKey === 'your_guardian_key_here') {
    console.log(`${colors.yellow}⚠️  Guardian API: Not configured${colors.reset}`);
    console.log(`   Get free key at: https://open-platform.theguardian.com/access/`);
    return false;
  }
  
  try {
    const response = await axios.get('https://content.guardianapis.com/search', {
      params: {
        q: 'refugee',
        'page-size': 1,
        'api-key': apiKey
      },
      timeout: 10000
    });
    
    if (response.status === 200 && response.data.response) {
      console.log(`${colors.green}✅ Guardian API: Working${colors.reset}`);
      console.log(`   Articles found: ${response.data.response.total}`);
      return true;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Guardian API: Error${colors.reset}`);
    console.log(`   ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Test Free APIs (no key required)
 */
async function testFreeAPIs() {
  console.log(`${colors.cyan}Testing Free APIs (no keys required):${colors.reset}\n`);
  
  // Test GDELT
  try {
    const gdeltResponse = await axios.get('https://api.gdeltproject.org/api/v2/doc/doc', {
      params: {
        query: 'refugee',
        mode: 'artlist',
        maxrecords: 1,
        format: 'json'
      },
      timeout: 15000
    });
    
    if (gdeltResponse.status === 200) {
      console.log(`${colors.green}✅ GDELT: Working${colors.reset}`);
      console.log(`   Global conflict data available`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ GDELT: Error${colors.reset}`);
    console.log(`   ${error.message}`);
  }
  
  // Test World Bank
  try {
    const wbResponse = await axios.get('https://api.worldbank.org/v2/country/SDN/indicator/NY.GDP.MKTP.CD', {
      params: {
        format: 'json',
        date: '2020:2023'
      },
      timeout: 10000
    });
    
    if (wbResponse.status === 200) {
      console.log(`${colors.green}✅ World Bank: Working${colors.reset}`);
      console.log(`   Economic data available`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ World Bank: Error${colors.reset}`);
    console.log(`   ${error.message}`);
  }
  
  // Test USGS
  try {
    const usgsResponse = await axios.get('https://earthquake.usgs.gov/fdsnws/event/1/query', {
      params: {
        format: 'geojson',
        starttime: '2024-01-01',
        minmagnitude: 6,
        limit: 1
      },
      timeout: 10000
    });
    
    if (usgsResponse.status === 200) {
      console.log(`${colors.green}✅ USGS: Working${colors.reset}`);
      console.log(`   Earthquake data available`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ USGS: Error${colors.reset}`);
    console.log(`   ${error.message}`);
  }
}

/**
 * Main test function
 */
async function runAPITests() {
  console.log(`${colors.cyan}Testing APIs with Keys:${colors.reset}\n`);
  
  const results = [];
  
  results.push(['NewsAPI', await testNewsAPI()]);
  console.log('');
  
  results.push(['NASA API', await testNASA()]);
  console.log('');
  
  results.push(['Guardian API', await testGuardianAPI()]);
  console.log('\n');
  
  await testFreeAPIs();
  
  console.log(`\n${colors.bright}📋 API Test Summary:${colors.reset}`);
  
  const passed = results.filter(([, success]) => success).length;
  const total = results.length;
  
  for (const [name, success] of results) {
    const icon = success ? '✅' : '❌';
    console.log(`${icon} ${name}`);
  }
  
  console.log(`\n${colors.bright}Status:${colors.reset} ${passed}/${total} APIs with keys working`);
  console.log(`${colors.bright}Free APIs:${colors.reset} GDELT, World Bank, USGS (no keys needed)`);
  
  if (passed < total) {
    console.log(`\n${colors.yellow}📝 Missing API Keys Setup:${colors.reset}`);
    console.log(`1. NewsAPI: https://newsapi.org/register (1000 requests/month FREE)`);
    console.log(`2. NASA API: https://api.nasa.gov/ (1000 requests/hour FREE)`);
    console.log(`3. Guardian: https://open-platform.theguardian.com/access/ (5000 requests/day FREE)`);
    console.log(`\n${colors.cyan}💡 These are optional for Phase 1, required for Phase 2 real data${colors.reset}`);
  } else {
    console.log(`\n${colors.green}🎉 All API keys working! Ready for Phase 2 data integration${colors.reset}`);
  }
}

// Run tests
runAPITests().catch(console.error);