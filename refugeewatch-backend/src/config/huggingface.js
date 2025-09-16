const axios = require('axios');
const logger = require('../utils/logger');

// UPDATED CONFIGURATION BASED ON YOUR TEST RESULTS
const HF_CONFIG = {
  apiKey: process.env.HUGGINGFACE_API_KEY || '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',
  baseURL: 'https://router.huggingface.co/v1',
  
  // PRIMARY MODEL: Winner from your tests
  models: {
    primary: {
      model: 'deepseek-ai/DeepSeek-R1',
      description: 'Best for complex humanitarian analysis (Score: 68.4/100)',
      maxTokens: 2000,
      temperature: 0.3
    },
    backup1: {
      model: 'Qwen/Qwen2.5-7B-Instruct', 
      description: 'Strong alternative (Score: 64.0/100)',
      maxTokens: 1500,
      temperature: 0.4
    },
    backup2: {
      model: 'meta-llama/Llama-3.3-70B-Instruct',
      description: 'Reliable fallback (Score: 61.0/100)', 
      maxTokens: 1500,
      temperature: 0.4
    }
  },
  
  timeout: 60000,
  maxRetries: 3,
  retryDelay: 2000
};

// Create HTTP client
function createHFClient() {
  return axios.create({
    baseURL: HF_CONFIG.baseURL,
    timeout: HF_CONFIG.timeout,
    headers: {
      'Authorization': `Bearer ${HF_CONFIG.apiKey}`,
      'Content-Type': 'application/json'
    }
  });
}

// Test connection using the primary model
async function testHuggingFaceConnection() {
  const startTime = Date.now();
  
  try {
    logger.info(`Testing connection to ${HF_CONFIG.models.primary.model}...`);
    
    if (!HF_CONFIG.apiKey) {
      return {
        success: false,
        error: 'Missing HUGGINGFACE_API_KEY',
        responseTime: 0
      };
    }
    
    const client = createHFClient();
    
    const testPayload = {
      model: HF_CONFIG.models.primary.model,
      messages: [
        {
          role: "user",
          content: "What is humanitarian crisis assessment?"
        }
      ],
      max_tokens: 50,
      temperature: 0.7
    };
    
    const response = await client.post('/chat/completions', testPayload);
    const responseTime = Date.now() - startTime;
    
    if (response.status === 200 && response.data.choices) {
      logger.info(`✅ Model connection successful (${responseTime}ms)`);
      return {
        success: true,
        model: HF_CONFIG.models.primary.model,
        responseTime: responseTime,
        testResponse: response.data.choices[0]?.message?.content || 'Success'
      };
    }
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    let errorMessage = error.response?.data?.error || error.message;
    
    logger.error(`❌ Model connection failed (${responseTime}ms):`, errorMessage);
    
    return {
      success: false,
      error: errorMessage,
      responseTime: responseTime
    };
  }
}

// Chat completion using the new API format
async function chatCompletion(messages, options = {}) {
  const client = createHFClient();
  
  // Use primary model or specified model
  const modelToUse = options.model || HF_CONFIG.models.primary.model;
  
  const payload = {
    model: modelToUse,
    messages: messages,
    max_tokens: options.max_tokens || HF_CONFIG.models.primary.maxTokens,
    temperature: options.temperature || HF_CONFIG.models.primary.temperature,
    stream: false
  };
  
  try {
    const response = await client.post('/chat/completions', payload);
    
    if (response.status === 200 && response.data.choices) {
      const content = response.data.choices[0]?.message?.content || '';
      
      return {
        success: true,
        content: content,
        model: modelToUse,
        usage: response.data.usage
      };
    }
    
  } catch (error) {
    logger.error('Chat completion failed:', error.message);
    
    // Try backup models
    for (const [key, modelConfig] of Object.entries(HF_CONFIG.models)) {
      if (modelConfig.model === modelToUse) continue;
      
      try {
        const backupPayload = { ...payload, model: modelConfig.model };
        const backupResponse = await client.post('/chat/completions', backupPayload);
        
        if (backupResponse.status === 200 && backupResponse.data.choices) {
          logger.info(`✅ Fallback to ${modelConfig.model} successful`);
          return {
            success: true,
            content: backupResponse.data.choices[0]?.message?.content || '',
            model: modelConfig.model,
            usage: backupResponse.data.usage
          };
        }
      } catch (backupError) {
        continue;
      }
    }
    
    // Return fallback response if all models fail
    return {
      success: false,
      content: "AI service temporarily unavailable. Using fallback analysis.",
      error: error.message
    };
  }
}

// Chat completion with retry logic
async function chatCompletionWithRetry(messages, options = {}) {
  let lastError;
  
  for (let attempt = 1; attempt <= HF_CONFIG.maxRetries; attempt++) {
    try {
      const result = await chatCompletion(messages, options);
      
      if (result.success || attempt === HF_CONFIG.maxRetries) {
        return result;
      }
      
    } catch (error) {
      lastError = error;
      
      if (attempt < HF_CONFIG.maxRetries) {
        const delay = HF_CONFIG.retryDelay * attempt;
        logger.warn(`⚠️ Retry ${attempt}/${HF_CONFIG.maxRetries} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // Return fallback if all retries fail
  return {
    success: false,
    content: "Using fallback AI analysis due to service issues.",
    error: lastError?.message
  };
}

// Export configuration info for debugging
function getHFConfig() {
  return {
    hasApiKey: !!HF_CONFIG.apiKey,
    baseURL: HF_CONFIG.baseURL,
    primaryModel: HF_CONFIG.models.primary.model,
    backupModels: Object.values(HF_CONFIG.models).map(m => m.model),
    timeout: HF_CONFIG.timeout
  };
}

module.exports = {
  HF_CONFIG,
  testHuggingFaceConnection,
  chatCompletion,
  chatCompletionWithRetry,
  createHFClient,
  getHFConfig
};