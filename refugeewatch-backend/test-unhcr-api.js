#!/usr/bin/env node
/**
 * Simple UNHCR API Test Script
 * Tests if UNHCR API works without authentication
 */

const axios = require('axios');

async function testUNHCRAPI() {
  console.log('🧪 Testing UNHCR API (No Authentication Required)');
  console.log('================================================\n');

  const client = axios.create({
    timeout: 20000,
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'RefugeeWatch-AI/3.0.0'
    }
  });

  // Test 1: Countries endpoint
  try {
    console.log('1. Testing /countries endpoint...');
    const countriesResponse = await client.get('https://api.unhcr.org/population/v1/countries?limit=5');
    console.log(`   ✅ Success: Got ${countriesResponse.data.length} countries`);
    console.log(`   Sample country: ${countriesResponse.data[0]?.country_name_en || 'N/A'}`);
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
  }

  // Test 2: Population endpoint
  try {
    console.log('\n2. Testing /population endpoint...');
    const populationResponse = await client.get('https://api.unhcr.org/population/v1/population?year=2023&limit=5');
    console.log(`   ✅ Success: Got ${populationResponse.data.length} records`);
    if (populationResponse.data[0]) {
      console.log(`   Sample record: ${populationResponse.data[0].coo_name || 'N/A'} -> ${populationResponse.data[0].coa_name || 'N/A'}`);
    }
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
  }

  // Test 3: Syria specific data
  try {
    console.log('\n3. Testing Syria-specific data...');
    const syriaResponse = await client.get('https://api.unhcr.org/population/v1/population?year=2023&coo=SYR&limit=10');
    console.log(`   ✅ Success: Got ${syriaResponse.data.length} Syria records`);
    const totalRefugees = syriaResponse.data.reduce((sum, record) => sum + (parseInt(record.refugees) || 0), 0);
    console.log(`   Syria refugees found: ${totalRefugees.toLocaleString()}`);
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
  }

  // Test 4: IDMC internal displacement
  try {
    console.log('\n4. Testing IDMC internal displacement...');
    const idmcResponse = await client.get('https://api.unhcr.org/population/v1/idmc?year=2023&limit=5');
    console.log(`   ✅ Success: Got ${idmcResponse.data.length} IDMC records`);
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
  }

  console.log('\n🏁 UNHCR API Test Complete');
  console.log('\nIf tests pass, the API requires NO authentication!');
}

testUNHCRAPI().catch(console.error);