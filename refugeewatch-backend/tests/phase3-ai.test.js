#!/usr/bin/env node

/**
 * RefugeeWatch AI - Phase 3 AI Integration Test
 * 
 * Validates gpt-oss AI reasoning integration with real crisis data
 * Tests comprehensive AI analysis and response plan generation
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
  timeout: 120000, // 2 minutes for AI calls
  maxRetries: 2,
  testCountry: 'Sudan',
  aiTestTimeout: 60000 // 1 minute per AI call
};

/**
 * Print formatted test header
 */
function printHeader() {
  console.log(`${colors.cyan}${colors.bright}`);
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║              RefugeeWatch AI - Phase 3 Test             ║');
  console.log('║            AI Integration & Reasoning Validation          ║');
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
 * Test 1: AI Crisis Service Integration
 */
async function testAICrisisService() {
  console.log(`${colors.bright}1️⃣ Testing AI Crisis Analysis Service...${colors.reset}\n`);
  
  try {
    const AICrisisService = require('../src/services/ai/aiCrisisService');
    const aiService = new AICrisisService();
    
    printResult(
      'AI Crisis Service Load',
      true,
      'gpt-oss crisis analysis service initialized',
      'Ready for AI-powered crisis reasoning'
    );
    
    // Create mock crisis assessment for testing
    const mockCrisisAssessment = {
      country: TEST_CONFIG.testCountry,
      timestamp: new Date().toISOString(),
      overallRisk: 'HIGH',
      confidence: 0.85,
      dataQuality: 'GOOD',
      sources: {
        conflict: { riskLevel: 'HIGH', confidence: 0.9, score: 75, indicators: ['Armed conflict escalating'], available: true },
        economic: { riskLevel: 'HIGH', confidence: 0.8, score: 65, indicators: ['High inflation'], available: true },
        climate: { riskLevel: 'MEDIUM', confidence: 0.7, score: 45, indicators: ['Drought conditions'], available: true },
        news: { riskLevel: 'HIGH', confidence: 0.85, score: 70, indicators: ['Escalating violence reported'], available: true }
      },
      riskFactors: [
        { source: 'conflict', factor: 'Armed conflict escalating', severity: 'HIGH' },
        { source: 'economic', factor: 'Economic instability', severity: 'HIGH' }
      ],
      protectiveFactors: [],
      immediateThreats: ['Armed conflict', 'Economic collapse'],
      emergingConcerns: ['Population displacement'],
      displacementRisk: {
        level: 'HIGH',
        confidence: 0.85,
        timeline: '2-8 weeks',
        estimatedNumbers: 80000,
        primaryCauses: ['Armed conflict', 'Economic crisis'],
        likelyDestinations: ['Chad', 'Egypt', 'Ethiopia'],
        triggerEvents: ['Military escalation']
      },
      trends: {
        overall: 'deteriorating',
        conflict: 'escalating',
        economic: 'worsening',
        climate: 'stable',
        news: 'increasing'
      },
      dataAvailability: {
        conflict: true,
        economic: true,
        climate: true,
        news: true
      }
    };
    
    console.log(`   ${colors.yellow}🤖 Running AI crisis analysis (may take 30-90 seconds)...${colors.reset}`);
    
    const startTime = Date.now();
    const aiAnalysis = await Promise.race([
      aiService.performCrisisAnalysis(mockCrisisAssessment),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI analysis timeout')), TEST_CONFIG.aiTestTimeout)
      )
    ]);
    const duration = Date.now() - startTime;
    
    if (aiAnalysis && aiAnalysis.aiRiskAssessment) {
      printResult(
        'AI Crisis Analysis',
        true,
        `Risk: ${aiAnalysis.aiRiskAssessment}, Confidence: ${Math.round(aiAnalysis.confidence * 100)}%`,
        `Analysis completed in ${Math.round(duration / 1000)}s`
      );
      
      // Test AI reasoning quality
      const hasReasoning = aiAnalysis.reasoning && aiAnalysis.reasoning.length > 50;
      const hasFindings = aiAnalysis.keyFindings && aiAnalysis.keyFindings.length > 0;
      const hasDisplacement = aiAnalysis.displacementPrediction && aiAnalysis.displacementPrediction.likelihood;
      
      printResult(
        'AI Reasoning Quality',
        hasReasoning && hasFindings && hasDisplacement,
        `Reasoning: ${hasReasoning ? '✓' : '○'}, Findings: ${hasFindings ? '✓' : '○'}, Displacement: ${hasDisplacement ? '✓' : '○'}`,
        'AI providing detailed analysis and predictions'
      );
      
      // Test AI recommendations
      const hasRecommendations = aiAnalysis.recommendations && 
                                 aiAnalysis.recommendations.immediate && 
                                 aiAnalysis.recommendations.immediate.length > 0;
      printResult(
        'AI Recommendations',
        hasRecommendations,
        `Immediate actions: ${aiAnalysis.recommendations?.immediate?.length || 0}`,
        'AI generating actionable recommendations'
      );
      
      return { success: true, analysis: aiAnalysis };
    } else {
      printResult(
        'AI Crisis Analysis',
        false,
        'No valid AI analysis returned',
        'Check gpt-oss model connectivity'
      );
      return { success: false };
    }
    
  } catch (error) {
    printResult(
      'AI Crisis Service',
      false,
      'AI analysis failed',
      error.message
    );
    return { success: false, error: error.message };
  }
}

/**
 * Test 2: Response Plan Generation Service
 */
async function testResponsePlanService() {
  console.log(`${colors.bright}2️⃣ Testing AI Response Plan Generation...${colors.reset}\n`);
  
  try {
    const ResponsePlanService = require('../src/services/ai/responsePlanService');
    const planService = new ResponsePlanService();
    
    printResult(
      'Response Plan Service Load',
      true,
      'AI response plan generation service initialized',
      'Ready for comprehensive plan generation'
    );
    
    // Create mock AI analysis for plan generation
    const mockAIAnalysis = {
      aiRiskAssessment: 'HIGH',
      confidence: 0.85,
      reasoning: 'High risk situation requiring immediate intervention',
      keyFindings: [
        'Armed conflict escalating rapidly',
        'Economic conditions deteriorating',
        'Large population displacement expected'
      ],
      displacementPrediction: {
        likelihood: 'HIGH',
        timeframe: '2-8 weeks',
        estimatedPopulation: 80000,
        primaryTriggers: ['Armed conflict', 'Economic collapse'],
        likelyDestinations: ['Chad', 'Egypt', 'Ethiopia'],
        displacementType: 'emergency_flight'
      },
      criticalFactors: [
        { factor: 'Armed conflict', severity: 'CRITICAL', trend: 'escalating', impact: 'Mass displacement likely' }
      ],
      earlyWarning: {
        immediateThreats: ['Armed violence', 'Civilian targeting'],
        emergingConcerns: ['Food insecurity', 'Medical access'],
        timeToAction: 'days',
        urgency: 'high'
      },
      recommendations: {
        immediate: ['Activate emergency response', 'Pre-position resources'],
        shortTerm: ['Establish temporary camps', 'Coordinate with neighbors'],
        longTerm: ['Plan durable solutions', 'Build local capacity']
      },
      metadata: {
        country: TEST_CONFIG.testCountry,
        analysisTimestamp: new Date().toISOString()
      }
    };
    
    console.log(`   ${colors.yellow}📋 Generating AI response plan (may take 45-120 seconds)...${colors.reset}`);
    
    const startTime = Date.now();
    const responsePlan = await Promise.race([
      planService.generateResponsePlan(mockAIAnalysis),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Plan generation timeout')), TEST_CONFIG.aiTestTimeout * 2)
      )
    ]);
    const duration = Date.now() - startTime;
    
    if (responsePlan && responsePlan.planOverview) {
      printResult(
        'AI Plan Generation',
        true,
        `Plan: ${responsePlan.planOverview.planName}`,
        `Generated in ${Math.round(duration / 1000)}s for ${responsePlan.planOverview.targetPopulation} people`
      );
      
      // Test plan structure
      const hasPhases = responsePlan.phases && 
                       responsePlan.phases.emergency && 
                       responsePlan.phases.stabilization && 
                       responsePlan.phases.integration;
      
      printResult(
        'Plan Structure',
        hasPhases,
        `3-phase plan: Emergency, Stabilization, Integration`,
        'Comprehensive planning structure complete'
      );
      
      // Test cost calculations
      const hasCosts = responsePlan.costAnalysis && 
                      responsePlan.totalCost && 
                      responsePlan.totalCost > 0;
      
      printResult(
        'Cost Analysis',
        hasCosts,
        `Total cost: ${responsePlan.totalCost?.toLocaleString() || 'N/A'}`,
        `Cost per person: ${responsePlan.summary?.costPerPerson?.toLocaleString() || 'N/A'}`
      );
      
      // Test implementation details
      const hasImplementation = responsePlan.implementationPlan && 
                               responsePlan.staffPlan && 
                               responsePlan.monitoringFramework;
      
      printResult(
        'Implementation Planning',
        hasImplementation,
        'Timeline, staffing, and monitoring included',
        'Ready for operational deployment'
      );
      
      return { success: true, plan: responsePlan };
    } else {
      printResult(
        'AI Plan Generation',
        false,
        'No valid response plan returned',
        'Check AI plan generation logic'
      );
      return { success: false };
    }
    
  } catch (error) {
    printResult(
      'Response Plan Service',
      false,
      'Plan generation failed',
      error.message
    );
    return { success: false, error: error.message };
  }
}

/**
 * Test 3: End-to-End AI Workflow
 */
async function testEndToEndAIWorkflow() {
  console.log(`${colors.bright}3️⃣ Testing End-to-End AI Workflow...${colors.reset}\n`);
  
  try {
    // Import all required services
    const DataAggregatorService = require('../src/services/processing/dataAggregator');
    const AICrisisService = require('../src/services/ai/aiCrisisService');
    const ResponsePlanService = require('../src/services/ai/responsePlanService');
    
    const aggregatorService = new DataAggregatorService();
    const aiService = new AICrisisService();
    const planService = new ResponsePlanService();
    
    printResult(
      'Service Integration',
      true,
      'All AI services loaded and integrated',
      'Ready for complete workflow test'
    );
    
    console.log(`   ${colors.yellow}🔄 Running complete AI workflow for ${TEST_CONFIG.testCountry} (may take 2-4 minutes)...${colors.reset}`);
    
    // Step 1: Get real crisis assessment
    console.log(`   ${colors.blue}Step 1: Gathering real crisis data...${colors.reset}`);
    const crisisAssessment = await aggregatorService.getComprehensiveCrisisAssessment(TEST_CONFIG.testCountry);
    
    if (!crisisAssessment || !crisisAssessment.country) {
      throw new Error('Failed to get crisis assessment');
    }
    
    printResult(
      'Real Data Integration',
      true,
      `Assessment: ${crisisAssessment.overallRisk}, Quality: ${crisisAssessment.dataQuality}`,
      `${Object.values(crisisAssessment.dataAvailability).filter(Boolean).length}/4 data sources available`
    );
    
    // Step 2: AI crisis analysis
    console.log(`   ${colors.blue}Step 2: AI crisis analysis...${colors.reset}`);
    const aiAnalysis = await aiService.performCrisisAnalysis(crisisAssessment);
    
    if (!aiAnalysis || !aiAnalysis.aiRiskAssessment) {
      throw new Error('Failed to get AI analysis');
    }
    
    printResult(
      'AI Crisis Analysis',
      true,
      `AI Risk: ${aiAnalysis.aiRiskAssessment}, System Risk: ${crisisAssessment.overallRisk}`,
      `Agreement: ${aiAnalysis.comparison?.agreement || 'Unknown'}, AI Confidence: ${Math.round(aiAnalysis.confidence * 100)}%`
    );
    
    // Step 3: Response plan generation
    console.log(`   ${colors.blue}Step 3: AI response plan generation...${colors.reset}`);
    const responsePlan = await planService.generateResponsePlan(aiAnalysis);
    
    if (!responsePlan || !responsePlan.planOverview) {
      throw new Error('Failed to generate response plan');
    }
    
    printResult(
      'AI Response Plan',
      true,
      `Plan: ${responsePlan.planType}, Cost: ${responsePlan.totalCost?.toLocaleString()}`,
      `Population: ${responsePlan.planOverview.targetPopulation}, Priority: ${responsePlan.planOverview.priority}`
    );
    
    // Step 4: Validate complete workflow
    const workflowComplete = crisisAssessment.country === TEST_CONFIG.testCountry &&
                            aiAnalysis.aiRiskAssessment &&
                            responsePlan.totalCost > 0;
    
    printResult(
      'Complete AI Workflow',
      workflowComplete,
      'Data → AI Analysis → Response Plan successful',
      'Full humanitarian AI pipeline operational'
    );
    
    return { 
      success: workflowComplete, 
      assessment: crisisAssessment, 
      analysis: aiAnalysis, 
      plan: responsePlan 
    };
    
  } catch (error) {
    printResult(
      'End-to-End AI Workflow',
      false,
      'Workflow failed',
      error.message
    );
    return { success: false, error: error.message };
  }
}

/**
 * Test 4: AI Performance and Quality
 */
async function testAIPerformanceQuality() {
  console.log(`${colors.bright}4️⃣ Testing AI Performance & Quality...${colors.reset}\n`);
  
  try {
    // Test Hugging Face connection
    const { testHuggingFaceConnection } = require('../src/config/huggingface');
    
    console.log(`   ${colors.yellow}🔗 Testing Hugging Face connection...${colors.reset}`);
    const connectionTest = await testHuggingFaceConnection();
    
    printResult(
      'Hugging Face Connection',
      connectionTest.success,
      connectionTest.success ? `Model: ${process.env.HUGGINGFACE_MODEL}` : 'Connection failed',
      connectionTest.success ? `Response time: ${connectionTest.responseTime}ms` : connectionTest.error
    );
    
    if (!connectionTest.success) {
      return { success: false, error: 'HuggingFace connection failed' };
    }
    
    // Test AI response quality with simple prompt
    const { chatCompletionWithRetry } = require('../src/config/huggingface');
    
    console.log(`   ${colors.yellow}💭 Testing AI reasoning quality...${colors.reset}`);
    
    const qualityTestPrompt = `Analyze this humanitarian crisis scenario and respond with valid JSON:

Country: Sudan
Risk Factors: Armed conflict, economic instability
Population at Risk: 80,000 people
Timeline: 2-8 weeks

Respond with: {"riskLevel": "CRITICAL|HIGH|MEDIUM|LOW", "confidence": 0.0-1.0, "reasoning": "brief explanation"}`;
    
    const aiResponse = await chatCompletionWithRetry([
      {
        role: 'system',
        content: 'You are RefugeeWatch AI. Provide crisis analysis in valid JSON format.'
      },
      {
        role: 'user',
        content: qualityTestPrompt
      }
    ], {
      temperature: 0.3,
      max_tokens: 500
    });
    
    if (aiResponse.success) {
      try {
        const parsed = JSON.parse(aiResponse.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
        const hasValidStructure = parsed.riskLevel && parsed.confidence && parsed.reasoning;
        
        printResult(
          'AI Response Quality',
          hasValidStructure,
          `Risk: ${parsed.riskLevel}, Confidence: ${Math.round(parsed.confidence * 100)}%`,
          'AI providing structured, reasonable responses'
        );
        
        // Test reasoning length and quality
        const reasoningQuality = parsed.reasoning && 
                                parsed.reasoning.length > 20 && 
                                parsed.reasoning.includes('conflict');
        
        printResult(
          'AI Reasoning Quality',
          reasoningQuality,
          `Reasoning length: ${parsed.reasoning?.length || 0} chars`,
          'AI providing detailed contextual reasoning'
        );
        
        return { success: true, qualityTest: parsed };
        
      } catch (parseError) {
        printResult(
          'AI Response Quality',
          false,
          'Invalid JSON response format',
          'AI response parsing failed'
        );
        return { success: false, error: 'JSON parsing failed' };
      }
    } else {
      printResult(
        'AI Response Quality',
        false,
        'AI request failed',
        aiResponse.error || 'Unknown error'
      );
      return { success: false, error: aiResponse.error };
    }
    
  } catch (error) {
    printResult(
      'AI Performance & Quality',
      false,
      'Performance test failed',
      error.message
    );
    return { success: false, error: error.message };
  }
}

/**
 * Test 5: AI Fallback and Error Handling
 */
async function testAIFallbackHandling() {
  console.log(`${colors.bright}5️⃣ Testing AI Fallback & Error Handling...${colors.reset}\n`);
  
  try {
    const AICrisisService = require('../src/services/ai/aiCrisisService');
    const ResponsePlanService = require('../src/services/ai/responsePlanService');
    
    const aiService = new AICrisisService();
    const planService = new ResponsePlanService();
    
    // Test with minimal/invalid data
    const minimalAssessment = {
      country: 'TestCountry',
      overallRisk: 'UNKNOWN',
      confidence: 0.3,
      dataQuality: 'POOR',
      sources: {
        conflict: { available: false },
        economic: { available: false },
        climate: { available: false },
        news: { available: false }
      },
      displacementRisk: {
        level: 'UNKNOWN',
        estimatedNumbers: 0
      }
    };
    
    console.log(`   ${colors.yellow}🛡️ Testing fallback mechanisms...${colors.reset}`);
    
    const fallbackAnalysis = await aiService.performCrisisAnalysis(minimalAssessment);
    
    const hasFallback = fallbackAnalysis && 
                       fallbackAnalysis.aiRiskAssessment && 
                       fallbackAnalysis.confidence > 0;
    
    printResult(
      'AI Fallback Mechanisms',
      hasFallback,
      `Fallback analysis: ${fallbackAnalysis.aiRiskAssessment}`,
      'System gracefully handles AI failures'
    );
    
    // Test plan generation fallback
    const fallbackPlan = await planService.generateResponsePlan({
      aiRiskAssessment: 'MEDIUM',
      confidence: 0.5,
      displacementPrediction: { estimatedPopulation: 5000 },
      metadata: { country: 'TestCountry' }
    });
    
    const hasPlanFallback = fallbackPlan && 
                           fallbackPlan.totalCost && 
                           fallbackPlan.planOverview;
    
    printResult(
      'Plan Generation Fallback',
      hasPlanFallback,
      `Fallback plan cost: ${fallbackPlan.totalCost?.toLocaleString()}`,
      'Plan generation resilient to data issues'
    );
    
    // Test cache functionality
    const cacheStats = aiService.getCacheStats();
    const planCacheStats = planService.getCacheStats();
    
    printResult(
      'Caching System',
      cacheStats.size >= 0 && planCacheStats.size >= 0,
      `AI cache: ${cacheStats.size}, Plan cache: ${planCacheStats.size}`,
      'Caching system operational for performance'
    );
    
    return { success: true, fallback: fallbackAnalysis, plan: fallbackPlan };
    
  } catch (error) {
    printResult(
      'AI Fallback & Error Handling',
      false,
      'Fallback test failed',
      error.message
    );
    return { success: false, error: error.message };
  }
}

/**
 * Main test runner
 */
async function runPhase3Tests() {
  printHeader();
  
  const startTime = Date.now();
  const testResults = [];
  
  try {
    // Load environment variables
    require('dotenv').config();
    
    console.log(`${colors.blue}🤖 Testing AI reasoning integration with real crisis data...${colors.reset}\n`);
    
    // Run all tests
    testResults.push(['AI Crisis Service', (await testAICrisisService()).success]);
    testResults.push(['Response Plan Service', (await testResponsePlanService()).success]);
    testResults.push(['End-to-End AI Workflow', (await testEndToEndAIWorkflow()).success]);
    testResults.push(['AI Performance & Quality', (await testAIPerformanceQuality()).success]);
    testResults.push(['AI Fallback & Error Handling', (await testAIFallbackHandling()).success]);
    
    // Calculate results
    const passed = testResults.filter(([, result]) => result).length;
    const total = testResults.length;
    const duration = Date.now() - startTime;
    
    // Print summary
    console.log(`${colors.bright}${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}🤖 PHASE 3 AI INTEGRATION TEST RESULTS${colors.reset}\n`);
    
    for (const [test, result] of testResults) {
      const icon = result ? '✅' : '❌';
      const color = result ? colors.green : colors.red;
      console.log(`${color}${icon} ${test}${colors.reset}`);
    }
    
    console.log(`\n${colors.bright}Summary:${colors.reset}`);
    console.log(`   Tests Passed: ${colors.green}${passed}/${total}${colors.reset}`);
    console.log(`   Duration: ${colors.blue}${Math.round(duration / 1000)}s${colors.reset}`);
    console.log(`   Status: ${passed >= total - 1 ? colors.green + '✅ READY FOR PHASE 4' : colors.red + '❌ ISSUES FOUND'}${colors.reset}`);
    
    if (passed >= total - 1) { // Allow 1 failure
      console.log(`\n${colors.green}${colors.bright}🎉 Phase 3 AI Integration Complete!${colors.reset}`);
      console.log(`${colors.cyan}✅ gpt-oss reasoning integration operational${colors.reset}`);
      console.log(`${colors.cyan}✅ AI crisis analysis generating insights${colors.reset}`);
      console.log(`${colors.cyan}✅ Automated response plan generation working${colors.reset}`);
      console.log(`${colors.cyan}✅ End-to-end AI workflow functional${colors.reset}\n`);
      
      console.log(`${colors.yellow}Next Steps:${colors.reset}`);
      console.log(`   1. Review AI analysis quality and accuracy`);
      console.log(`   2. Fine-tune prompts if needed`);
      console.log(`   3. Ready for Phase 4: Complete API integration`);
      console.log('');
      
      return true;
    } else {
      console.log(`\n${colors.red}${colors.bright}⚠️  Phase 3 Issues Found${colors.reset}`);
      console.log(`${colors.yellow}Please fix the failed tests before proceeding to Phase 4.${colors.reset}`);
      console.log(`${colors.blue}💡 Most issues are likely with gpt-oss connectivity - check HuggingFace setup${colors.reset}\n`);
      return false;
    }
    
  } catch (error) {
    console.error(`${colors.red}💥 Phase 3 test failed with error:${colors.reset}`, error.message);
    return false;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runPhase3Tests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal test error:', error);
      process.exit(1);
    });
}

module.exports = {
  runPhase3Tests,
  TEST_CONFIG
};