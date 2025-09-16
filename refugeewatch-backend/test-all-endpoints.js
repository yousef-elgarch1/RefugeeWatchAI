#!/usr/bin/env node
/**
 * RefugeeWatch AI - Full Endpoint & Frontend Connectivity Test
 *
 * This script tests all major backend endpoints and simulates frontend API calls.
 * Run with: node test-all-endpoints.js
 */

require('dotenv').config();
const axios = require('axios');

const API_BASE = process.env.TEST_API_BASE_URL || 'http://localhost:3001';
const endpoints = [
  { name: 'Health', url: '/health', method: 'GET' },
  { name: 'API Info', url: '/', method: 'GET' },
  { name: 'API Docs', url: '/api', method: 'GET' },
  { name: 'Crisis List', url: '/api/crisis', method: 'GET' },
  { name: 'Global Metrics', url: '/api/crisis/metrics/global', method: 'GET' },
  { name: 'AI Status', url: '/api/ai/status', method: 'GET' },
  { name: 'Data Sources', url: '/api/data/sources', method: 'GET' },
  // Add more endpoints as needed
];

async function testEndpoint({ name, url, method }) {
  try {
    const response = await axios({
      method,
      url: API_BASE + url,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`✅ ${name}: ${response.status} ${response.statusText}`);
    if (response.data) {
      console.log(`   Data:`, JSON.stringify(response.data, null, 2));
    }
    return true;
  } catch (error) {
    console.log(`❌ ${name}:`, error.response ? `${error.response.status} ${error.response.statusText}` : error.message);
    if (error.response && error.response.data) {
      console.log(`   Error Data:`, JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

async function runAllTests() {
  console.log('--- RefugeeWatch AI Endpoint & Frontend Connectivity Test ---');
  let allPassed = true;
  for (const ep of endpoints) {
    const passed = await testEndpoint(ep);
    if (!passed) allPassed = false;
  }
  if (allPassed) {
    console.log('\n🎉 All endpoints responded successfully! Your backend and frontend should work.');
  } else {
    console.log('\n⚠️ Some endpoints failed. Please share the output so I can help you fix them.');
  }
}

runAllTests();
