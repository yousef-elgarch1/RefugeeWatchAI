/**
 * ADVANCED REFUGEEWATCH AI TESTING FRAMEWORK
 * Based on real UNHCR, IOM, and humanitarian protocols
 * Tests complex reasoning abilities for refugee crisis management
 * 
 * Sources: UNHCR Emergency Handbook, IASC Cluster Approach, IOM DTM, RCM Guidelines
 */

const axios = require('axios');
const fs = require('fs');

// Your working configuration
const CONFIG = {
  API_KEY: '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',
  BASE_URL: 'https://router.huggingface.co/v1',
  MODELS: [
    'meta-llama/Llama-3.3-70B-Instruct',
    'deepseek-ai/DeepSeek-R1',
    'Qwen/Qwen2.5-7B-Instruct',
    'google/gemma-2-2b-it',
    'meta-llama/Llama-3.2-3B-Instruct'
  ]
};

// Colors for output
const colors = {
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', blue: '\x1b[34m',
  cyan: '\x1b[36m', white: '\x1b[37m', bright: '\x1b[1m', reset: '\x1b[0m'
};

/**
 * COMPLEX HUMANITARIAN SCENARIOS BASED ON REAL PROTOCOLS
 * These test advanced reasoning, multi-factor analysis, and strategic planning
 */
const HARD_SCENARIOS = [
  {
    id: 'L3_EMERGENCY_RESPONSE',
    name: 'Level 3 Emergency Response - Multi-Country Crisis',
    difficulty: 'EXPERT',
    realWorldBasis: 'UNHCR L3 Emergency Response Protocol & Ukraine Crisis Evaluation',
    prompt: `**LEVEL 3 EMERGENCY DECLARATION SCENARIO**

You are the lead analyst for a Level 3 (L3) refugee emergency spanning multiple countries. Based on UNHCR's Emergency Response Policy and the Refugee Coordination Model (RCM):

**Crisis Details:**
- Country of Origin: Myanmar (Rakhine State)
- Affected Countries: Bangladesh (600,000 new arrivals), Thailand (150,000), Malaysia (80,000)
- Timeline: 72 hours since L3 declaration
- Population: 830,000 total new refugees + 400,000 existing Rohingya refugees
- Complicating Factors: Monsoon season approaching (8 weeks), limited camp capacity, host community tensions

**Your Tasks (respond in structured format):**

1. **INITIAL NEEDS ASSESSMENT (NARE Protocol)**
   - Apply the Needs Assessment for Refugee Emergencies framework
   - Identify 5 critical information gaps requiring immediate assessment
   - Propose assessment methodology for each country context

2. **REFUGEE RESPONSE PLAN (RRP) STRUCTURE**
   - Design initial Emergency RRP (first week target)
   - Define sector priorities using UNHCR's 15 standard protection risks
   - Estimate funding requirements (provide methodology)

3. **COORDINATION MECHANISM ACTIVATION**
   - Activate appropriate cluster system (specify which clusters)
   - Identify lead agencies per country and justify
   - Address coordination challenges in mixed displacement settings

4. **PROTECTION ANALYSIS & RISK MITIGATION**
   - Conduct rapid protection risk analysis using GPC framework
   - Prioritize the 5 highest protection risks from UNHCR's standard list
   - Propose immediate protection interventions

5. **RESOURCE MOBILIZATION STRATEGY**
   - Design 72-hour resource mobilization plan
   - Include both humanitarian and development funding streams
   - Address host community support requirements

**Evaluation Criteria:**
- Adherence to UNHCR/IOM protocols
- Multi-sector coordination understanding
- Protection-centered approach
- Realistic timeline and resource projections
- Host government capacity considerations`,
    
    evaluationCriteria: {
      protocolAdherence: 25,    // Knowledge of UNHCR/IOM frameworks
      complexReasoning: 25,     // Multi-factor analysis ability
      strategicPlanning: 25,    // Realistic and actionable plans
      protectionFocus: 25       // Protection mainstreaming
    },
    
    expectedElements: [
      'NARE methodology', 'RRP structure', 'cluster activation', 'protection risks',
      'resource mobilization', 'host community', 'coordination', 'timeline'
    ]
  },

  {
    id: 'URBAN_DISPLACEMENT_CCCM',
    name: 'Urban Displacement & CCCM Alternative Approaches',
    difficulty: 'EXPERT',
    realWorldBasis: 'IOM CCCM Cluster Guidelines & Urban Displacement Trends',
    prompt: `**COMPLEX URBAN DISPLACEMENT SCENARIO**

Based on IOM's CCCM Cluster approach and the shift towards area-based programming:

**Situation:**
- Location: Kampala, Uganda (urban setting)
- Population: 95,000 new IDPs from northern regions (conflict-induced)
- Displacement Pattern: 60% in host communities, 25% in informal settlements, 15% seeking formal camp placement
- Government Position: "No new camps policy" - promoting local integration
- Complications: Limited urban services, host community tensions, protection concerns in informal settlements

**Analysis Required:**

1. **AREA-BASED CCCM APPROACH DESIGN**
   - Apply IOM's area-based CCCM methodology
   - Design coordination structure for non-camp settings
   - Address protection concerns in informal settlements

2. **DTM (DISPLACEMENT TRACKING MATRIX) IMPLEMENTATION**
   - Design DTM data collection strategy for urban context
   - Identify key indicators for mobility tracking
   - Propose data sharing protocols with government/partners

3. **COMMUNITY ENGAGEMENT & PARTICIPATION**
   - Design IDP participation mechanisms in urban context
   - Address host community integration challenges
   - Propose conflict-sensitive programming approach

4. **ALTERNATIVE ACCOMMODATION STRATEGIES**
   - Evaluate alternatives to formal camps (per CCCM guidance)
   - Assess rental subsidy vs. host family support vs. collective sites
   - Include sustainability and exit strategy considerations

5. **MULTI-CLUSTER COORDINATION**
   - Coordinate with Education, Health, WASH, Protection clusters
   - Address urban-specific challenges (documentation, employment, services)
   - Design referral mechanisms for specialized protection cases

**Additional Complexity:**
- Government insists on 6-month maximum assistance
- Potential for secondary displacement to neighboring countries
- Seasonal flooding affects 40% of informal settlement areas

Provide detailed analysis with specific recommendations per CCCM standards.`,
    
    evaluationCriteria: {
      cccmKnowledge: 30,        // Understanding of CCCM principles
      urbanApproach: 25,        // Urban-specific considerations
      communityEngagement: 25,  // Participation and inclusion
      sustainability: 20        // Long-term solutions focus
    },
    
    expectedElements: [
      'area-based approach', 'DTM methodology', 'community participation',
      'alternatives to camps', 'multi-cluster', 'urban challenges', 'sustainability'
    ]
  },

  {
    id: 'MIXED_MOVEMENTS_COORDINATION',
    name: 'Mixed Movements & Multi-Agency Coordination',
    difficulty: 'EXPERT',
    realWorldBasis: 'UNHCR-OCHA Joint Note on Mixed Situations & Mediterranean Crisis',
    prompt: `**MIXED MOVEMENTS COORDINATION CRISIS**

Drawing from UNHCR-OCHA "Joint Note on Mixed Situations" and Mediterranean crisis patterns:

**Complex Emergency Context:**
- Location: Greek islands (Lesbos, Chios, Samos)
- Mixed Population: 45,000 people
  * 28,000 asylum seekers (various nationalities)
  * 12,000 irregular migrants (economic)
  * 5,000 unaccompanied minors
- Coordinating Bodies: UNHCR (refugee response), IOM (migration), Coast Guard (SAR), EU agencies
- Challenges: Overcrowded reception centers, winter conditions, COVID-19 protocols, pushback allegations

**Coordination Analysis Required:**

1. **APPLY UNHCR-OCHA JOINT NOTE FRAMEWORK**
   - Define respective roles: UNHCR vs. OCHA vs. IOM
   - Address coordination in mixed displacement settings
   - Propose decision-making structure for mixed populations

2. **DIFFERENTIAL TREATMENT PROTOCOLS**
   - Design screening and referral mechanisms
   - Address protection needs across different legal statuses
   - Balance asylum procedures with humanitarian assistance

3. **HUMANITARIAN-DEVELOPMENT NEXUS**
   - Link emergency response to longer-term integration programs
   - Coordinate with EU relocation schemes and national programs
   - Address host community support and capacity building

4. **PROTECTION MAINSTREAMING ACROSS AGENCIES**
   - Ensure protection standards across all interventions
   - Address specific vulnerabilities (UASC, GBV, trafficking)
   - Coordinate PSEA and AAP mechanisms

5. **REGIONAL COORDINATION MECHANISM**
   - Connect to broader Mediterranean response coordination
   - Link with departure and transit country responses
   - Address regional responsibility-sharing mechanisms

**Policy Constraints:**
- EU Dublin Regulation limitations
- National reception capacity constraints
- Political pressure for rapid processing
- Limited voluntary relocation commitments

Design comprehensive coordination framework addressing these multi-agency, multi-mandate challenges.`,
    
    evaluationCriteria: {
      coordinationFramework: 30, // Multi-agency coordination
      mixedMovements: 25,       // Understanding of mixed situations
      protectionMainstreaming: 25, // Protection across interventions
      regionalApproach: 20      // Regional coordination perspective
    },
    
    expectedElements: [
      'UNHCR-OCHA framework', 'mixed movements', 'differential treatment',
      'multi-agency coordination', 'protection mainstreaming', 'regional approach'
    ]
  },

  {
    id: 'CLIMATE_DISPLACEMENT_ANTICIPATORY',
    name: 'Climate-Induced Displacement & Anticipatory Action',
    difficulty: 'EXPERT',
    realWorldBasis: 'UNHCR Climate Action Strategy & Pacific Climate Mobility',
    prompt: `**CLIMATE DISPLACEMENT ANTICIPATORY RESPONSE**

Based on UNHCR's climate action framework and Pacific region climate mobility patterns:

**Scenario:**
- Location: Tuvalu and Kiribati (Pacific Island States)
- Climate Threat: Sea level rise + intensifying cyclones
- Timeline: 18-month prediction window for major displacement
- Population at Risk: 180,000 people across both countries
- Regional Context: Limited absorption capacity in neighboring countries (Fiji, Australia, NZ)

**Anticipatory Action Framework Required:**

1. **APPLY UNHCR CLIMATE-DISPLACEMENT NEXUS APPROACH**
   - Implement early warning and early action protocols
   - Design climate mobility tracking systems
   - Address planned relocation vs. emergency evacuation scenarios

2. **REGIONAL PROTECTION FRAMEWORK**
   - Develop regional cooperation mechanisms for climate mobility
   - Address legal gaps (no refugee status for climate displacement)
   - Design temporary protection schemes and mobility visas

3. **COMMUNITY-BASED ADAPTATION & MOBILITY**
   - Integrate displacement risk reduction with adaptation
   - Design community participation in relocation planning
   - Address cultural preservation and community cohesion

4. **MULTI-HAZARD CONTINGENCY PLANNING**
   - Plan for slow-onset vs. sudden-onset displacement triggers
   - Design flexible response mechanisms for different scenarios
   - Coordinate with disaster risk reduction and climate adaptation

5. **INNOVATIVE PROTECTION SOLUTIONS**
   - Explore regional mobility agreements
   - Design skills-based migration programs
   - Address loss and damage considerations for permanent displacement

**Specific Challenges:**
- Traditional refugee law doesn't cover climate displacement
- Limited land availability for relocation
- Cultural and spiritual connections to ancestral land
- Economic constraints of small island developing states

Provide comprehensive anticipatory action framework with specific mechanisms and timelines.`,
    
    evaluationCriteria: {
      climateNexusUnderstanding: 30, // Climate-displacement nexus
      anticipatoryApproach: 25,      // Forward-looking planning
      innovativeSolutions: 25,       // Creative protection approaches
      regionalCooperation: 20        // Multi-country coordination
    },
    
    expectedElements: [
      'climate nexus', 'anticipatory action', 'regional cooperation',
      'planned relocation', 'legal gaps', 'community participation', 'innovation'
    ]
  },

  {
    id: 'PROTRACTED_SOLUTIONS_COMPREHENSIVE',
    name: 'Protracted Displacement & Comprehensive Solutions',
    difficulty: 'EXPERT',
    realWorldBasis: 'Global Compact on Refugees & CRRF Implementation',
    prompt: `**PROTRACTED DISPLACEMENT SOLUTIONS SCENARIO**

Applying the Global Compact on Refugees and Comprehensive Refugee Response Framework (CRRF):

**Situation:**
- Location: Eastern Chad (hosting Sudanese refugees)
- Duration: 20+ years of displacement (protracted situation)
- Population: 350,000 Sudanese refugees + 180,000 Chadian returnees + host communities
- Context: Limited voluntary repatriation prospects, local integration challenges, third-country resettlement gaps

**Comprehensive Solutions Analysis Required:**

1. **GLOBAL COMPACT ON REFUGEES IMPLEMENTATION**
   - Apply the four key objectives of the Global Compact
   - Design burden and responsibility-sharing mechanisms
   - Implement CRRF whole-of-society approach

2. **SOLUTIONS STRATEGY ANALYSIS**
   - Assess viability of three durable solutions (return, integration, resettlement)
   - Design transitional solutions and livelihood programs
   - Address development-humanitarian nexus programming

3. **HOST COMMUNITY INTEGRATION**
   - Design area-based programming benefiting all populations
   - Address service delivery strengthening (health, education, WASH)
   - Promote social cohesion and conflict prevention

4. **PRIVATE SECTOR ENGAGEMENT**
   - Design economic opportunities and job creation programs
   - Explore innovative financing mechanisms
   - Address regulatory barriers to refugee economic participation

5. **REGIONAL DISPLACEMENT DYNAMICS**
   - Coordinate with broader regional displacement responses
   - Address cross-border movement and protection concerns
   - Link to regional economic integration opportunities

**Complex Considerations:**
- Limited natural resources and environmental degradation
- Governance challenges and limited state capacity
- Security concerns affecting programming
- Donor fatigue and funding gaps for protracted situations

Design comprehensive 5-year solutions strategy with specific indicators and milestones.`,
    
    evaluationCriteria: {
      globalCompactKnowledge: 30,  // GCR framework understanding
      solutionsApproach: 25,       // Durable solutions analysis
      nexusProgramming: 25,        // Humanitarian-development nexus
      comprehensiveResponse: 20    // Whole-of-society approach
    },
    
    expectedElements: [
      'Global Compact', 'CRRF', 'durable solutions', 'burden sharing',
      'local integration', 'private sector', 'nexus programming', 'regional approach'
    ]
  }
];

/**
 * Advanced AI Testing Function with Detailed Evaluation
 */
async function testModelAdvanced(modelName, scenario) {
  try {
    console.log(`\n${colors.bright}${colors.blue}🧠 ADVANCED TEST: ${scenario.name}${colors.reset}`);
    console.log(`${colors.cyan}Model: ${modelName} | Difficulty: ${scenario.difficulty}${colors.reset}`);
    console.log(`${colors.yellow}Real-World Basis: ${scenario.realWorldBasis}${colors.reset}`);
    
    const startTime = Date.now();
    
    const response = await axios.post(
      `${CONFIG.BASE_URL}/chat/completions`,
      {
        model: modelName,
        messages: [
          {
            role: "system",
            content: `You are a senior humanitarian analyst with expertise in UNHCR, IOM, and IASC frameworks. Provide detailed, protocol-based responses that demonstrate deep understanding of humanitarian coordination mechanisms. Reference specific frameworks and provide actionable recommendations.`
          },
          {
            role: "user",
            content: scenario.prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${CONFIG.API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );
    
    const responseTime = Date.now() - startTime;
    
    if (response.status === 200 && response.data.choices) {
      const content = response.data.choices[0]?.message?.content || '';
      const usage = response.data.usage || {};
      
      // Advanced evaluation
      const evaluation = evaluateAdvancedResponse(content, scenario);
      
      console.log(`\n${colors.green}✅ RESPONSE GENERATED (${responseTime}ms)${colors.reset}`);
      console.log(`${colors.cyan}Tokens: ${usage.total_tokens || 'N/A'} | Length: ${content.length} chars${colors.reset}`);
      
      // Display evaluation scores
      console.log(`\n${colors.bright}📊 EVALUATION SCORES:${colors.reset}`);
      for (const [criteria, score] of Object.entries(evaluation.scores)) {
        const color = score >= 80 ? colors.green : score >= 60 ? colors.yellow : colors.red;
        console.log(`${color}  ${criteria}: ${score}/100${colors.reset}`);
      }
      
      console.log(`\n${colors.bright}Overall Score: ${evaluation.overallScore}/100${colors.reset}`);
      console.log(`${colors.cyan}Protocol Elements Found: ${evaluation.protocolElements.found}/${evaluation.protocolElements.total}${colors.reset}`);
      
      // Show response preview
      console.log(`\n${colors.white}Response Preview:${colors.reset}`);
      console.log(`"${content.substring(0, 300)}..."\n`);
      
      return {
        success: true,
        model: modelName,
        scenario: scenario.id,
        response: content,
        evaluation: evaluation,
        responseTime: responseTime,
        usage: usage
      };
    }
    
  } catch (error) {
    const status = error.response?.status || 'Network Error';
    const errorMsg = error.response?.data?.error?.message || error.message;
    
    console.log(`${colors.red}❌ FAILED - ${modelName} (${status})${colors.reset}`);
    console.log(`${colors.red}   Error: ${errorMsg}${colors.reset}`);
    
    return {
      success: false,
      model: modelName,
      scenario: scenario.id,
      error: status,
      message: errorMsg
    };
  }
}

/**
 * Advanced Response Evaluation Based on Humanitarian Protocols
 */
function evaluateAdvancedResponse(response, scenario) {
  const lowerResponse = response.toLowerCase();
  const evaluation = {
    scores: {},
    protocolElements: {
      found: 0,
      total: scenario.expectedElements.length,
      details: []
    },
    overallScore: 0
  };
  
  // Check for expected protocol elements
  for (const element of scenario.expectedElements) {
    if (lowerResponse.includes(element.toLowerCase())) {
      evaluation.protocolElements.found++;
      evaluation.protocolElements.details.push(`✓ ${element}`);
    } else {
      evaluation.protocolElements.details.push(`✗ ${element}`);
    }
  }
  
  // Evaluate based on scenario-specific criteria
  for (const [criteria, weight] of Object.entries(scenario.evaluationCriteria)) {
    let score = 0;
    
    switch (criteria) {
      case 'protocolAdherence':
      case 'cccmKnowledge':
      case 'globalCompactKnowledge':
      case 'coordinationFramework':
        score = evaluateProtocolKnowledge(response, scenario);
        break;
        
      case 'complexReasoning':
      case 'strategicPlanning':
      case 'anticipatoryApproach':
        score = evaluateReasoningQuality(response);
        break;
        
      case 'protectionFocus':
      case 'protectionMainstreaming':
        score = evaluateProtectionFocus(response);
        break;
        
      case 'sustainability':
      case 'nexusProgramming':
        score = evaluateSustainabilityFocus(response);
        break;
        
      default:
        score = evaluateGenericCriteria(response, criteria);
    }
    
    evaluation.scores[criteria] = Math.min(100, score);
  }
  
  // Calculate overall score
  const totalWeight = Object.values(scenario.evaluationCriteria).reduce((a, b) => a + b, 0);
  evaluation.overallScore = Math.round(
    Object.entries(evaluation.scores).reduce((total, [criteria, score]) => {
      return total + (score * scenario.evaluationCriteria[criteria] / totalWeight);
    }, 0)
  );
  
  return evaluation;
}

/**
 * Specific evaluation functions
 */
function evaluateProtocolKnowledge(response, scenario) {
  const protocolKeywords = [
    'unhcr', 'iom', 'iasc', 'cluster', 'rrp', 'nare', 'rcm', 'cccm', 'dtm',
    'global compact', 'crrf', 'protection risks', 'durable solutions'
  ];
  
  let score = 0;
  for (const keyword of protocolKeywords) {
    if (response.toLowerCase().includes(keyword)) {
      score += 10;
    }
  }
  
  // Bonus for structured thinking
  if (response.includes('1.') && response.includes('2.') && response.includes('3.')) {
    score += 20;
  }
  
  return Math.min(100, score);
}

function evaluateReasoningQuality(response) {
  let score = 0;
  
  // Multi-factor analysis
  const reasoningWords = ['because', 'therefore', 'however', 'considering', 'given that', 'while'];
  score += reasoningWords.filter(word => response.toLowerCase().includes(word)).length * 8;
  
  // Evidence of planning
  const planningWords = ['phase', 'timeline', 'priority', 'sequence', 'coordinate'];
  score += planningWords.filter(word => response.toLowerCase().includes(word)).length * 6;
  
  // Length and detail (longer responses show more reasoning)
  if (response.length > 1500) score += 20;
  else if (response.length > 800) score += 10;
  
  return Math.min(100, score);
}

function evaluateProtectionFocus(response) {
  const protectionTerms = [
    'protection', 'vulnerable', 'safeguarding', 'do no harm', 'dignity',
    'rights', 'safety', 'security', 'gbv', 'child protection', 'inclusion'
  ];
  
  let score = 0;
  for (const term of protectionTerms) {
    if (response.toLowerCase().includes(term)) {
      score += 12;
    }
  }
  
  return Math.min(100, score);
}

function evaluateSustainabilityFocus(response) {
  const sustainabilityTerms = [
    'sustainability', 'long-term', 'development', 'capacity building',
    'local ownership', 'transition', 'exit strategy', 'resilience'
  ];
  
  let score = 0;
  for (const term of sustainabilityTerms) {
    if (response.toLowerCase().includes(term)) {
      score += 15;
    }
  }
  
  return Math.min(100, score);
}

function evaluateGenericCriteria(response, criteria) {
  // Basic evaluation for other criteria
  const wordCount = response.split(' ').length;
  const structureScore = response.includes('1.') ? 25 : 0;
  const lengthScore = Math.min(50, wordCount / 10);
  
  return structureScore + lengthScore;
}

/**
 * Run comprehensive advanced testing
 */
async function runAdvancedTesting() {
  console.log(`${colors.bright}${colors.cyan}🚀 ADVANCED REFUGEEWATCH AI TESTING FRAMEWORK${colors.reset}`);
  console.log(`${colors.cyan}Based on Real Humanitarian Protocols & Documentation${colors.reset}`);
  console.log(`${'='.repeat(80)}\n`);
  
  console.log(`${colors.yellow}📋 Testing Configuration:${colors.reset}`);
  console.log(`   Models: ${CONFIG.MODELS.length} advanced models`);
  console.log(`   Scenarios: ${HARD_SCENARIOS.length} expert-level humanitarian scenarios`);
  console.log(`   Framework: UNHCR Emergency Handbook, IASC Cluster Guidelines, IOM Frameworks`);
  console.log(`   Evaluation: Multi-criteria scoring based on protocol adherence\n`);
  
  const allResults = [];
  let testCount = 0;
  const totalTests = CONFIG.MODELS.length * HARD_SCENARIOS.length;
  
  for (const model of CONFIG.MODELS) {
    console.log(`\n${colors.bright}🤖 TESTING MODEL: ${model}${colors.reset}`);
    console.log(`${'─'.repeat(60)}`);
    
    const modelResults = [];
    
    for (const scenario of HARD_SCENARIOS) {
      testCount++;
      console.log(`\n${colors.yellow}[${testCount}/${totalTests}] ${scenario.name}${colors.reset}`);
      
      const result = await testModelAdvanced(model, scenario);
      modelResults.push(result);
      allResults.push(result);
      
      // Delay between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Model summary
    const successfulTests = modelResults.filter(r => r.success);
    if (successfulTests.length > 0) {
      const avgScore = successfulTests.reduce((sum, r) => sum + r.evaluation.overallScore, 0) / successfulTests.length;
      console.log(`\n${colors.bright}📊 ${model} Summary: Avg Score ${avgScore.toFixed(1)}/100 (${successfulTests.length}/${modelResults.length} tests)${colors.reset}`);
    }
  }
  
  // Generate comprehensive results
  generateAdvancedResults(allResults);
  
  return allResults;
}

/**
 * Generate comprehensive analysis and recommendations
 */
function generateAdvancedResults(allResults) {
  console.log(`\n${colors.bright}${colors.cyan}🏆 COMPREHENSIVE ANALYSIS & RECOMMENDATIONS${colors.reset}`);
  console.log(`${'='.repeat(80)}\n`);
  
  const successfulResults = allResults.filter(r => r.success);
  
  if (successfulResults.length === 0) {
    console.log(`${colors.red}❌ No successful tests completed${colors.reset}`);
    return;
  }
  
  // Model rankings
  const modelScores = {};
  for (const result of successfulResults) {
    if (!modelScores[result.model]) {
      modelScores[result.model] = { scores: [], tests: 0 };
    }
    modelScores[result.model].scores.push(result.evaluation.overallScore);
    modelScores[result.model].tests++;
  }
  
  // Calculate averages and rank models
  const modelRankings = Object.entries(modelScores)
    .map(([model, data]) => ({
      model,
      avgScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      testsCompleted: data.tests,
      maxScore: Math.max(...data.scores),
      minScore: Math.min(...data.scores)
    }))
    .sort((a, b) => b.avgScore - a.avgScore);
  
  console.log(`${colors.bright}🥇 MODEL RANKINGS FOR HUMANITARIAN AI:${colors.reset}\n`);
  
  modelRankings.forEach((ranking, index) => {
    const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📍';
    const color = ranking.avgScore >= 80 ? colors.green : ranking.avgScore >= 65 ? colors.yellow : colors.red;
    
    console.log(`${emoji} ${index + 1}. ${colors.bright}${ranking.model}${colors.reset}`);
    console.log(`${color}   Average Score: ${ranking.avgScore.toFixed(1)}/100${colors.reset}`);
    console.log(`   Performance Range: ${ranking.minScore}-${ranking.maxScore}`);
    console.log(`   Tests Completed: ${ranking.testsCompleted}/${HARD_SCENARIOS.length}`);
    console.log(`   ${getModelRecommendation(ranking)}\n`);
  });
  
  // Best model per scenario
  console.log(`${colors.bright}📋 BEST MODEL PER SCENARIO:${colors.reset}\n`);
  
  for (const scenario of HARD_SCENARIOS) {
    const scenarioResults = successfulResults
      .filter(r => r.scenario === scenario.id)
      .sort((a, b) => b.evaluation.overallScore - a.evaluation.overallScore);
    
    if (scenarioResults.length > 0) {
      const best = scenarioResults[0];
      console.log(`🎯 ${scenario.name}:`);
      console.log(`   Winner: ${colors.green}${best.model}${colors.reset} (${best.evaluation.overallScore}/100)`);
      console.log(`   Strengths: ${getScenarioStrengths(best.evaluation)}\n`);
    }
  }
  
  // Final recommendations
  console.log(`${colors.bright}🚀 FINAL RECOMMENDATIONS FOR REFUGEEWATCH:${colors.reset}\n`);
  
  if (modelRankings.length >= 3) {
    console.log(`${colors.green}✅ PRIMARY MODEL:${colors.reset} ${modelRankings[0].model}`);
    console.log(`   ${colors.cyan}→ Best overall performance across humanitarian scenarios${colors.reset}`);
    console.log(`   ${colors.cyan}→ Use for complex analysis and strategic planning${colors.reset}\n`);
    
    console.log(`${colors.yellow}⚠️  BACKUP MODEL:${colors.reset} ${modelRankings[1].model}`);
    console.log(`   ${colors.cyan}→ Strong alternative with good reasoning capabilities${colors.reset}`);
    console.log(`   ${colors.cyan}→ Use when primary model is unavailable${colors.reset}\n`);
    
    console.log(`${colors.blue}🔄 FALLBACK MODEL:${colors.reset} ${modelRankings[2].model}`);
    console.log(`   ${colors.cyan}→ Reliable baseline performance${colors.reset}`);
    console.log(`   ${colors.cyan}→ Use for simple assessments and basic analysis${colors.reset}\n`);
  }
  
  // Configuration recommendations
  console.log(`${colors.bright}⚙️ CONFIGURATION RECOMMENDATIONS:${colors.reset}\n`);
  console.log(`# Update your .env file:`);
  console.log(`HUGGINGFACE_MODEL=${modelRankings[0].model}`);
  console.log(`HUGGINGFACE_MODEL_BACKUP1=${modelRankings[1]?.model || 'deepseek-ai/DeepSeek-R1'}`);
  console.log(`HUGGINGFACE_MODEL_BACKUP2=${modelRankings[2]?.model || 'Qwen/Qwen2.5-7B-Instruct'}`);
  console.log(`HUGGINGFACE_BASE_URL=${CONFIG.BASE_URL}`);
  console.log(`HUGGINGFACE_API_KEY=${CONFIG.API_KEY}`);
  console.log(`AI_TEMPERATURE=0.3  # Lower for analytical tasks`);
  console.log(`AI_MAX_TOKENS=2000  # Higher for complex responses\n`);
  
  // Save detailed results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsFile = `refugeewatch_advanced_test_results_${timestamp}.json`;
  
  const detailedResults = {
    timestamp: new Date().toISOString(),
    testSummary: {
      totalTests: allResults.length,
      successfulTests: successfulResults.length,
      failureRate: ((allResults.length - successfulResults.length) / allResults.length * 100).toFixed(1) + '%'
    },
    modelRankings,
    scenarioResults: HARD_SCENARIOS.map(scenario => ({
      scenario: scenario.name,
      difficulty: scenario.difficulty,
      results: successfulResults.filter(r => r.scenario === scenario.id)
    })),
    recommendations: {
      primary: modelRankings[0]?.model,
      backup: modelRankings[1]?.model,
      fallback: modelRankings[2]?.model
    },
    fullResults: allResults
  };
  
  fs.writeFileSync(resultsFile, JSON.stringify(detailedResults, null, 2));
  console.log(`${colors.green}📄 Comprehensive results saved to: ${resultsFile}${colors.reset}\n`);
  
  // Performance insights
  console.log(`${colors.bright}🧠 PERFORMANCE INSIGHTS:${colors.reset}\n`);
  
  const avgScoreOverall = successfulResults.reduce((sum, r) => sum + r.evaluation.overallScore, 0) / successfulResults.length;
  console.log(`${colors.cyan}Overall AI Performance: ${avgScoreOverall.toFixed(1)}/100${colors.reset}`);
  
  const protocolAdherence = successfulResults
    .map(r => r.evaluation.protocolElements.found / r.evaluation.protocolElements.total * 100)
    .reduce((a, b) => a + b, 0) / successfulResults.length;
  console.log(`${colors.cyan}Protocol Knowledge: ${protocolAdherence.toFixed(1)}% of humanitarian frameworks recognized${colors.reset}`);
  
  const bestScenario = HARD_SCENARIOS.find(s => 
    successfulResults.filter(r => r.scenario === s.id).length > 0 &&
    Math.max(...successfulResults.filter(r => r.scenario === s.id).map(r => r.evaluation.overallScore)) === 
    Math.max(...successfulResults.map(r => r.evaluation.overallScore))
  );
  
  if (bestScenario) {
    console.log(`${colors.cyan}Strongest Capability: ${bestScenario.name}${colors.reset}`);
  }
  
  console.log(`\n${colors.bright}${colors.green}🎉 REFUGEEWATCH AI TESTING COMPLETE!${colors.reset}`);
  console.log(`${colors.green}Your models are now evaluated for humanitarian crisis analysis.${colors.reset}`);
  console.log(`${colors.green}Use the recommendations above to configure your production system.${colors.reset}\n`);
}

/**
 * Helper functions for generating recommendations
 */
function getModelRecommendation(ranking) {
  if (ranking.avgScore >= 80) {
    return `${colors.green}EXCELLENT: Suitable for complex humanitarian analysis${colors.reset}`;
  } else if (ranking.avgScore >= 65) {
    return `${colors.yellow}GOOD: Suitable for most refugee scenarios with supervision${colors.reset}`;
  } else if (ranking.avgScore >= 50) {
    return `${colors.orange}BASIC: Use for simple assessments only${colors.reset}`;
  } else {
    return `${colors.red}POOR: Not recommended for humanitarian use${colors.reset}`;
  }
}

function getScenarioStrengths(evaluation) {
  const strengths = [];
  for (const [criteria, score] of Object.entries(evaluation.scores)) {
    if (score >= 80) {
      strengths.push(criteria);
    }
  }
  return strengths.length > 0 ? strengths.join(', ') : 'Good overall performance';
}

// Export for use in other scripts
module.exports = {
  runAdvancedTesting,
  testModelAdvanced,
  HARD_SCENARIOS,
  CONFIG
};

// Run if called directly
if (require.main === module) {
  runAdvancedTesting().catch(console.error);
}