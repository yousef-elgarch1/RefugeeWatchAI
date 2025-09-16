/**
 * Test script for NEW Hugging Face Inference Providers API
 * This will test the CORRECT modern API for RefugeeWatch
 */

const axios = require('axios');

// Your API token
const API_KEY = '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';
const BASE_URL = 'https://router.huggingface.co/v1';

// Working models for 2024/2025
const WORKING_MODELS = [
  'meta-llama/Llama-3.3-70B-Instruct',
  'deepseek-ai/DeepSeek-R1', 
  'Qwen/Qwen2.5-7B-Instruct',
  'google/gemma-2-2b-it',
  'meta-llama/Llama-3.2-3B-Instruct'
];

// Refugee crisis test prompt
const REFUGEE_TEST_PROMPT = `Analyze this humanitarian crisis:

Country: Sudan
Situation: Armed conflict in Khartoum, 50,000 displaced
Risk Factors: Violence, food shortages, limited medical access
Timeline: Deteriorating over 2-4 weeks

Provide a brief risk assessment (CRITICAL/HIGH/MEDIUM/LOW) and explain your reasoning.`;

/**
 * Test a single model with the NEW API
 */
async function testModel(modelName) {
  try {
    console.log(`\n🧪 Testing: ${modelName}`);
    
    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      {
        model: modelName,
        messages: [
          {
            role: "user",
            content: REFUGEE_TEST_PROMPT
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 45000
      }
    );
    
    if (response.status === 200 && response.data.choices) {
      const content = response.data.choices[0]?.message?.content || 'No content';
      const usage = response.data.usage || {};
      
      console.log(`✅ SUCCESS - ${modelName}`);
      console.log(`   Response: "${content.substring(0, 100)}..."`);
      console.log(`   Tokens used: ${usage.total_tokens || 'N/A'}`);
      console.log(`   Model: ${response.data.model || modelName}`);
      
      return {
        success: true,
        model: modelName,
        response: content,
        usage: usage
      };
    }
    
  } catch (error) {
    const status = error.response?.status || 'Network Error';
    const errorMsg = error.response?.data?.error?.message || error.message;
    
    console.log(`❌ FAILED - ${modelName} (${status})`);
    console.log(`   Error: ${errorMsg}`);
    
    return {
      success: false,
      model: modelName,
      error: status,
      message: errorMsg
    };
  }
}

/**
 * Test API token validity first
 */
async function testAPIToken() {
  try {
    console.log('🔑 Testing API token validity...');
    
    const response = await axios.get('https://huggingface.co/api/whoami-v2', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    if (response.status === 200) {
      console.log(`✅ API Token Valid`);
      console.log(`   User: ${response.data.name}`);
      console.log(`   Type: ${response.data.type}`);
      return true;
    }
  } catch (error) {
    console.log(`❌ API Token Invalid: ${error.message}`);
    return false;
  }
}

/**
 * Main testing function
 */
async function runNewAPITest() {
  console.log('🚀 TESTING NEW HUGGING FACE INFERENCE PROVIDERS API');
  console.log('====================================================');
  console.log(`API Key: ${API_KEY.substring(0, 8)}...${API_KEY.substring(API_KEY.length - 4)}`);
  console.log(`Endpoint: ${BASE_URL}/chat/completions`);
  console.log(`Testing ${WORKING_MODELS.length} models with refugee crisis scenario\n`);
  
  // Test API token first
  const tokenValid = await testAPIToken();
  if (!tokenValid) {
    console.log('\n❌ Cannot proceed - invalid API token');
    return;
  }
  
  const results = [];
  const workingModels = [];
  
  // Test each model
  for (const model of WORKING_MODELS) {
    const result = await testModel(model);
    results.push(result);
    
    if (result.success) {
      workingModels.push(result);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('========================');
  console.log(`Working models: ${workingModels.length}/${WORKING_MODELS.length}`);
  console.log(`Failed models: ${results.length - workingModels.length}/${WORKING_MODELS.length}`);
  
  if (workingModels.length > 0) {
    console.log('\n🏆 WORKING MODELS FOR REFUGEEWATCH:');
    workingModels.forEach((model, index) => {
      console.log(`${index + 1}. ${model.model}`);
      console.log(`   Quality: ${model.response.length > 50 ? 'Good' : 'Basic'} response`);
    });
    
    console.log('\n⚙️ RECOMMENDED CONFIGURATION:');
    console.log(`HUGGINGFACE_MODEL=${workingModels[0].model}`);
    console.log(`HUGGINGFACE_BASE_URL=${BASE_URL}`);
    console.log(`HUGGINGFACE_API_KEY=${API_KEY}`);
    
    if (workingModels.length > 1) {
      console.log(`HUGGINGFACE_MODEL_BACKUP1=${workingModels[1].model}`);
    }
    if (workingModels.length > 2) {
      console.log(`HUGGINGFACE_MODEL_BACKUP2=${workingModels[2].model}`);
    }
  } else {
    console.log('\n❌ NO WORKING MODELS FOUND');
    console.log('Check your API token or try different models');
  }
  
  return workingModels;
}

// Run the test
if (require.main === module) {
  runNewAPITest().catch(console.error);
}

module.exports = { runNewAPITest, testModel, testAPIToken };