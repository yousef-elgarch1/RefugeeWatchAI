/**
 * RefugeeWatch AI - AI Response Plan Generation Service
 * 
 * Generates comprehensive humanitarian response plans using gpt-oss
 * Creates 3-phase implementation plans with resource calculations
 * 
 * @author RefugeeWatch AI Team
 * @version 1.0.0
 */

const moment = require('moment');
const logger = require('../../utils/logger').default;
const { chatCompletionWithRetry } = require('../../config/huggingface');

// Resource cost templates (USD)
const RESOURCE_COSTS = {
  // Emergency Phase (per person/day)
  emergency: {
    water: 2.50,           // 15L clean water per person
    food: 4.00,            // Basic food rations
    shelter: 3.00,         // Emergency shelter materials
    medical: 2.00,         // Basic medical care
    sanitation: 1.50,      // Sanitation facilities
    blankets: 0.75         // Bedding/warmth
  },
  
  // Stabilization Phase (per person/month)
  stabilization: {
    housing: 85.00,        // Temporary housing
    education: 25.00,      // Basic education services
    healthcare: 45.00,     // Expanded healthcare
    food: 120.00,          // Monthly food assistance
    utilities: 30.00,      // Water, electricity, waste
    psychosocial: 15.00    // Mental health support
  },
  
  // Integration Phase (per person/year)
  integration: {
    housing: 1200.00,      // Permanent housing solutions
    livelihood: 800.00,    // Job training/employment
    education: 400.00,     // Full education services
    healthcare: 600.00,    // Comprehensive healthcare
    integration: 300.00    // Language/cultural programs
  }
};

// Staff requirements (per 1000 people)
const STAFF_REQUIREMENTS = {
  emergency: {
    coordinators: 2,
    medical: 8,
    logistics: 5,
    protection: 3,
    wash: 4,
    food: 3
  },
  stabilization: {
    management: 3,
    social_workers: 6,
    teachers: 12,
    medical: 10,
    security: 5,
    logistics: 4
  },
  integration: {
    case_managers: 4,
    job_counselors: 3,
    teachers: 15,
    healthcare: 8,
    community_liaisons: 2
  }
};

/**
 * AI Response Plan Generation Service
 */
class ResponsePlanService {
  constructor() {
    this.modelVersion = process.env.HUGGINGFACE_MODEL || 'openai/gpt-oss-20b:fireworks-ai';
    this.cache = new Map();
    this.planHistory = [];
  }

  /**
   * Generate comprehensive response plan using AI
   * @param {Object} crisisAnalysis - AI crisis analysis
   * @param {Object} options - Plan generation options
   * @returns {Promise<Object>} Complete response plan
   */
  async generateResponsePlan(crisisAnalysis, options = {}) {
    try {
      const startTime = Date.now();
      
      logger.ai('plan_generation_start', {
        country: crisisAnalysis.metadata?.country,
        riskLevel: crisisAnalysis.aiRiskAssessment,
        estimatedPopulation: crisisAnalysis.displacementPrediction?.estimatedPopulation
      });

      // Build AI prompt for plan generation
      const planPrompt = this.buildPlanGenerationPrompt(crisisAnalysis, options);
      
      // Get AI-generated plan
      const aiResponse = await chatCompletionWithRetry([
        {
          role: 'system',
          content: this.getPlanSystemPrompt()
        },
        {
          role: 'user',
          content: planPrompt
        }
      ], {
        temperature: 0.2, // Lower temperature for more structured plans
        max_tokens: 3000,
        top_p: 0.8
      });

      if (!aiResponse.success) {
        throw new Error(`Plan generation failed: ${aiResponse.error || 'Unknown error'}`);
      }

      // Parse and enhance AI response
      const aiPlan = this.parseAIPlan(aiResponse.content);
      const enhancedPlan = this.enhancePlanWithCalculations(aiPlan, crisisAnalysis);
      
      const duration = Date.now() - startTime;
      
      // Cache the plan
      this.cache.set(`plan_${crisisAnalysis.metadata?.country}`, {
        data: enhancedPlan,
        timestamp: moment()
      });
      
      // Store in history
      this.planHistory.push({
        country: crisisAnalysis.metadata?.country,
        timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
        planType: enhancedPlan.planType,
        estimatedCost: enhancedPlan.totalCost
      });

      logger.ai('plan_generation_complete', {
        country: crisisAnalysis.metadata?.country,
        planType: enhancedPlan.planType,
        totalCost: enhancedPlan.totalCost,
        duration: duration,
        tokensUsed: aiResponse.usage?.total_tokens || 0
      });

      return enhancedPlan;

    } catch (error) {
      logger.ai('plan_generation_error', {
        country: crisisAnalysis.metadata?.country,
        error: error.message
      }, 'error');

      // Return fallback plan
      return this.generateFallbackPlan(crisisAnalysis);
    }
  }

  /**
   * Get system prompt for plan generation
   * @returns {string} System prompt
   */
  getPlanSystemPrompt() {
    return `You are RefugeeWatch AI Response Planner, an expert in humanitarian response planning and refugee assistance. You specialize in creating comprehensive, evidence-based response plans that save lives and provide dignity to displaced populations.

Your expertise includes:
- Emergency humanitarian response protocols
- Resource allocation and logistics planning
- Multi-phase intervention strategies
- Cost-effective humanitarian operations
- Cross-border coordination and legal frameworks
- Protection and safety considerations
- Community-based approaches

Planning principles:
- Prioritize immediate life-saving interventions
- Ensure protection and dignity for all displaced persons
- Plan for sustainable, long-term solutions
- Optimize resource utilization and cost-effectiveness
- Consider local capacity and cultural contexts
- Integrate cross-cutting issues (gender, age, disability)
- Plan for both prevention and response

Response phases:
1. EMERGENCY (Weeks 1-4): Life-saving interventions
2. STABILIZATION (Months 1-6): Establishing services and protection
3. INTEGRATION (Months 6-24): Durable solutions and self-reliance

Output format: Provide detailed, actionable plans in JSON format with specific resource requirements, timelines, and implementation steps.`;
  }

  /**
   * Build plan generation prompt
   * @param {Object} crisisAnalysis - AI crisis analysis
   * @param {Object} options - Plan options
   * @returns {string} Plan generation prompt
   */
  buildPlanGenerationPrompt(crisisAnalysis, options) {
    const estimatedPopulation = crisisAnalysis.displacementPrediction?.estimatedPopulation || 10000;
    const timeframe = crisisAnalysis.displacementPrediction?.timeframe || '2-8 weeks';
    const country = crisisAnalysis.metadata?.country || 'Unknown';
    
    return `Generate a comprehensive humanitarian response plan for the following crisis scenario:

## CRISIS SITUATION
**Country**: ${country}
**AI Risk Assessment**: ${crisisAnalysis.aiRiskAssessment}
**Confidence Level**: ${Math.round(crisisAnalysis.confidence * 100)}%
**Displacement Prediction**: ${estimatedPopulation} people
**Timeline**: ${timeframe}
**Displacement Type**: ${crisisAnalysis.displacementPrediction?.displacementType || 'unknown'}

## KEY CRISIS FACTORS
**Primary Triggers**: ${JSON.stringify(crisisAnalysis.displacementPrediction?.primaryTriggers || [])}
**Critical Factors**: ${JSON.stringify(crisisAnalysis.criticalFactors?.map(f => f.factor) || [])}
**Immediate Threats**: ${JSON.stringify(crisisAnalysis.earlyWarning?.immediateThreats || [])}

## DISPLACEMENT DETAILS
**Likely Destinations**: ${JSON.stringify(crisisAnalysis.displacementPrediction?.likelyDestinations || [])}
**Urgency Level**: ${crisisAnalysis.earlyWarning?.urgency || 'medium'}
**Time to Action**: ${crisisAnalysis.earlyWarning?.timeToAction || 'days'}

## AI RECOMMENDATIONS
**Immediate Actions**: ${JSON.stringify(crisisAnalysis.recommendations?.immediate || [])}
**Short-term Actions**: ${JSON.stringify(crisisAnalysis.recommendations?.shortTerm || [])}
**Long-term Actions**: ${JSON.stringify(crisisAnalysis.recommendations?.longTerm || [])}

## PLANNING REQUIREMENTS
Create a comprehensive 3-phase response plan considering:

1. **EMERGENCY PHASE (Weeks 1-4)**
   - Immediate life-saving interventions
   - Emergency shelter, water, food, medical care
   - Protection and safety measures
   - Rapid needs assessment

2. **STABILIZATION PHASE (Months 1-6)**
   - Temporary settlements and services
   - Education, healthcare, psychosocial support
   - Livelihood opportunities
   - Community engagement

3. **INTEGRATION PHASE (Months 6-24)**
   - Durable solutions (local integration, resettlement, return)
   - Self-reliance and independence
   - Long-term development support
   - Exit strategies

Respond with a detailed JSON plan in this exact format:

{
  "planOverview": {
    "planName": "Descriptive plan name",
    "planType": "EMERGENCY|COMPREHENSIVE|PREVENTION",
    "targetPopulation": number,
    "implementationPeriod": "timeframe",
    "priority": "CRITICAL|HIGH|MEDIUM|LOW",
    "coordinator": "Lead organization type"
  },
  "phases": {
    "emergency": {
      "duration": "weeks",
      "objectives": ["objective1", "objective2"],
      "activities": [
        {
          "category": "WASH|Shelter|Food|Medical|Protection|Logistics",
          "action": "Specific action",
          "quantity": "Amount needed",
          "timeline": "When to implement",
          "priority": "CRITICAL|HIGH|MEDIUM"
        }
      ],
      "resources": {
        "personnel": number,
        "budget": number,
        "materials": ["material1", "material2"]
      }
    },
    "stabilization": {
      "duration": "months",
      "objectives": ["objective1", "objective2"],
      "activities": [
        {
          "category": "Education|Healthcare|Livelihoods|Community|Protection",
          "action": "Specific action",
          "quantity": "Amount needed",
          "timeline": "When to implement",
          "priority": "HIGH|MEDIUM|LOW"
        }
      ],
      "resources": {
        "personnel": number,
        "budget": number,
        "infrastructure": ["item1", "item2"]
      }
    },
    "integration": {
      "duration": "months",
      "objectives": ["objective1", "objective2"],
      "activities": [
        {
          "category": "Housing|Employment|Education|Healthcare|Integration",
          "action": "Specific action",
          "quantity": "Amount needed",
          "timeline": "When to implement",
          "priority": "HIGH|MEDIUM|LOW"
        }
      ],
      "resources": {
        "personnel": number,
        "budget": number,
        "programs": ["program1", "program2"]
      }
    }
  },
  "crossCutting": {
    "protection": ["protection measure1", "protection measure2"],
    "genderAge": ["consideration1", "consideration2"],
    "environment": ["environmental consideration1"],
    "coordination": ["coordination mechanism1", "coordination mechanism2"]
  },
  "riskMitigation": [
    {
      "risk": "Risk description",
      "likelihood": "HIGH|MEDIUM|LOW",
      "impact": "HIGH|MEDIUM|LOW",
      "mitigation": "Mitigation strategy"
    }
  ],
  "implementation": {
    "leadAgencies": ["agency1", "agency2"],
    "partners": ["partner1", "partner2"],
    "timeline": {
      "week1": ["activity1", "activity2"],
      "month1": ["activity1", "activity2"],
      "month6": ["activity1", "activity2"]
    },
    "monitoringFramework": ["indicator1", "indicator2"]
  },
  "costEfficiency": {
    "preventiveCost": number,
    "reactiveCost": number,
    "savings": number,
    "costPerBeneficiary": number
  }
}

Consider the specific crisis context, cultural factors, regional dynamics, and available resources. Ensure the plan is realistic, evidence-based, and immediately actionable.`;
  }

  /**
   * Parse AI plan response
   * @param {string} response - Raw AI response
   * @returns {Object} Parsed plan
   */
  parseAIPlan(response) {
    try {
      // Clean the response
      const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanResponse);
      
      // Validate required structure
      if (!parsed.planOverview || !parsed.phases) {
        throw new Error('Invalid plan structure');
      }
      
      return parsed;
      
    } catch (error) {
      logger.warn('Failed to parse AI plan response:', error.message);
      return this.extractBasicPlan(response);
    }
  }

  /**
   * Extract basic plan from malformed response
   * @param {string} response - Raw response
   * @returns {Object} Basic plan structure
   */
  extractBasicPlan(response) {
    return {
      planOverview: {
        planName: "AI-Generated Crisis Response Plan",
        planType: "COMPREHENSIVE",
        targetPopulation: 10000,
        implementationPeriod: "24 months",
        priority: "HIGH",
        coordinator: "UNHCR"
      },
      phases: {
        emergency: {
          duration: "4 weeks",
          objectives: ["Provide immediate life-saving assistance", "Establish protection measures"],
          activities: [],
          resources: { personnel: 100, budget: 1000000, materials: [] }
        },
        stabilization: {
          duration: "6 months",
          objectives: ["Establish temporary services", "Support community structures"],
          activities: [],
          resources: { personnel: 200, budget: 5000000, infrastructure: [] }
        },
        integration: {
          duration: "18 months",
          objectives: ["Support durable solutions", "Promote self-reliance"],
          activities: [],
          resources: { personnel: 150, budget: 10000000, programs: [] }
        }
      },
      aiResponseExtract: response.substring(0, 500) + '...'
    };
  }

  /**
   * Enhance plan with detailed calculations
   * @param {Object} aiPlan - AI-generated plan
   * @param {Object} crisisAnalysis - Crisis analysis
   * @returns {Object} Enhanced plan
   */
  enhancePlanWithCalculations(aiPlan, crisisAnalysis) {
    const population = aiPlan.planOverview?.targetPopulation || 
                      crisisAnalysis.displacementPrediction?.estimatedPopulation || 
                      10000;

    // Calculate detailed costs
    const costBreakdown = this.calculateDetailedCosts(population, aiPlan);
    
    // Calculate staff requirements
    const staffRequirements = this.calculateStaffRequirements(population);
    
    // Generate implementation timeline
    const timeline = this.generateImplementationTimeline(aiPlan, crisisAnalysis);
    
    // Calculate cost comparison
    const costComparison = this.calculateCostComparison(costBreakdown.total, population);

    const enhanced = {
      ...aiPlan,
      
      // Enhanced metadata
      metadata: {
        generatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        modelUsed: this.modelVersion,
        targetPopulation: population,
        country: crisisAnalysis.metadata?.country,
        crisisRisk: crisisAnalysis.aiRiskAssessment,
        planVersion: '1.0'
      },
      
      // Detailed cost analysis
      costAnalysis: {
        breakdown: costBreakdown,
        comparison: costComparison,
        efficiency: this.calculateEfficiencyMetrics(costBreakdown, population),
        funding: this.generateFundingStrategy(costBreakdown)
      },
      
      // Staff planning
      staffPlan: staffRequirements,
      
      // Implementation details
      implementationPlan: timeline,
      
      // Resource optimization
      resourceOptimization: this.optimizeResources(aiPlan, population),
      
      // Monitoring framework
      monitoringFramework: this.generateMonitoringFramework(aiPlan),
      
      // Risk assessment
      implementationRisks: this.assessImplementationRisks(aiPlan, crisisAnalysis),
      
      // Summary metrics
      summary: {
        totalCost: costBreakdown.total,
        costPerPerson: Math.round(costBreakdown.total / population),
        implementationPeriod: aiPlan.planOverview?.implementationPeriod || '24 months',
        priority: aiPlan.planOverview?.priority || 'HIGH',
        readinessScore: this.calculateReadinessScore(aiPlan)
      }
    };

    // Add convenience fields
    enhanced.totalCost = costBreakdown.total;
    enhanced.planType = aiPlan.planOverview?.planType || 'COMPREHENSIVE';

    return enhanced;
  }

  /**
   * Calculate detailed costs for all phases
   * @param {number} population - Target population
   * @param {Object} plan - AI plan
   * @returns {Object} Cost breakdown
   */
  calculateDetailedCosts(population, plan) {
    const costs = {
      emergency: this.calculateEmergencyCosts(population),
      stabilization: this.calculateStabilizationCosts(population),
      integration: this.calculateIntegrationCosts(population),
      overhead: 0,
      contingency: 0,
      total: 0
    };

    // Calculate overhead (15% of operational costs)
    const operationalTotal = costs.emergency + costs.stabilization + costs.integration;
    costs.overhead = Math.round(operationalTotal * 0.15);
    
    // Calculate contingency (10% of total)
    costs.contingency = Math.round(operationalTotal * 0.10);
    
    // Calculate total
    costs.total = operationalTotal + costs.overhead + costs.contingency;

    return costs;
  }

  /**
   * Calculate emergency phase costs
   * @param {number} population - Population size
   * @returns {number} Emergency phase cost
   */
  calculateEmergencyCosts(population) {
    const days = 28; // 4 weeks
    const costs = RESOURCE_COSTS.emergency;
    
    const dailyCostPerPerson = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
    return Math.round(population * dailyCostPerPerson * days);
  }

  /**
   * Calculate stabilization phase costs
   * @param {number} population - Population size
   * @returns {number} Stabilization phase cost
   */
  calculateStabilizationCosts(population) {
    const months = 6;
    const costs = RESOURCE_COSTS.stabilization;
    
    const monthlyCostPerPerson = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
    return Math.round(population * monthlyCostPerPerson * months);
  }

  /**
   * Calculate integration phase costs
   * @param {number} population - Population size
   * @returns {number} Integration phase cost
   */
  calculateIntegrationCosts(population) {
    const years = 1.5; // 18 months
    const costs = RESOURCE_COSTS.integration;
    
    const yearlyCostPerPerson = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
    return Math.round(population * yearlyCostPerPerson * years);
  }

  /**
   * Calculate staff requirements
   * @param {number} population - Population size
   * @returns {Object} Staff requirements
   */
  calculateStaffRequirements(population) {
    const multiplier = Math.ceil(population / 1000);
    
    const staff = {
      emergency: {},
      stabilization: {},
      integration: {},
      total: { emergency: 0, stabilization: 0, integration: 0 }
    };

    // Calculate for each phase
    Object.entries(STAFF_REQUIREMENTS).forEach(([phase, roles]) => {
      Object.entries(roles).forEach(([role, count]) => {
        staff[phase][role] = count * multiplier;
        staff.total[phase] += count * multiplier;
      });
    });

    return staff;
  }

  /**
   * Generate implementation timeline
   * @param {Object} plan - AI plan
   * @param {Object} crisisAnalysis - Crisis analysis
   * @returns {Object} Implementation timeline
   */
  generateImplementationTimeline(plan, crisisAnalysis) {
    const urgency = crisisAnalysis.earlyWarning?.urgency || 'medium';
    const timeToAction = crisisAnalysis.earlyWarning?.timeToAction || 'days';
    
    const timeline = {
      preparation: this.getPreparationTime(urgency, timeToAction),
      phases: {
        emergency: { start: '0 days', end: '28 days', status: 'ready' },
        stabilization: { start: '29 days', end: '6 months', status: 'planned' },
        integration: { start: '6 months', end: '24 months', status: 'planned' }
      },
      milestones: [
        { week: 1, milestone: 'Emergency response activated', critical: true },
        { week: 2, milestone: 'Basic services operational', critical: true },
        { week: 4, milestone: 'Emergency phase evaluation', critical: false },
        { month: 2, milestone: 'Stabilization services launched', critical: true },
        { month: 6, milestone: 'Integration planning begins', critical: false },
        { month: 12, milestone: 'Self-reliance assessment', critical: false },
        { month: 24, milestone: 'Program evaluation and transition', critical: true }
      ]
    };

    return timeline;
  }

  /**
   * Get preparation time based on urgency
   * @param {string} urgency - Urgency level
   * @param {string} timeToAction - Time to action
   * @returns {string} Preparation time
   */
  getPreparationTime(urgency, timeToAction) {
    switch (urgency) {
      case 'immediate': return '24-48 hours';
      case 'high': return '3-7 days';
      case 'medium': return '1-2 weeks';
      default: return '2-4 weeks';
    }
  }

  /**
   * Calculate cost comparison (preventive vs reactive)
   * @param {number} preventiveCost - Preventive intervention cost
   * @param {number} population - Population size
   * @returns {Object} Cost comparison
   */
  calculateCostComparison(preventiveCost, population) {
    // Reactive response typically costs 60-80% more
    const reactiveCost = Math.round(preventiveCost * 1.7);
    const savings = reactiveCost - preventiveCost;
    const savingsPercentage = Math.round((savings / reactiveCost) * 100);

    return {
      preventive: preventiveCost,
      reactive: reactiveCost,
      savings: savings,
      savingsPercentage: savingsPercentage,
      costPerPersonPreventive: Math.round(preventiveCost / population),
      costPerPersonReactive: Math.round(reactiveCost / population)
    };
  }

  /**
   * Calculate efficiency metrics
   * @param {Object} costBreakdown - Cost breakdown
   * @param {number} population - Population size
   * @returns {Object} Efficiency metrics
   */
  calculateEfficiencyMetrics(costBreakdown, population) {
    return {
      costPerBeneficiary: Math.round(costBreakdown.total / population),
      operationalEfficiency: Math.round(((costBreakdown.total - costBreakdown.overhead) / costBreakdown.total) * 100),
      phaseDistribution: {
        emergency: Math.round((costBreakdown.emergency / costBreakdown.total) * 100),
        stabilization: Math.round((costBreakdown.stabilization / costBreakdown.total) * 100),
        integration: Math.round((costBreakdown.integration / costBreakdown.total) * 100)
      }
    };
  }

  /**
   * Generate funding strategy
   * @param {Object} costBreakdown - Cost breakdown
   * @returns {Object} Funding strategy
   */
  generateFundingStrategy(costBreakdown) {
    return {
      recommended: {
        bilateral: Math.round(costBreakdown.total * 0.4),    // 40%
        multilateral: Math.round(costBreakdown.total * 0.35), // 35%
        private: Math.round(costBreakdown.total * 0.15),      // 15%
        host_country: Math.round(costBreakdown.total * 0.1)   // 10%
      },
      timeline: {
        immediate: costBreakdown.emergency,
        shortTerm: costBreakdown.stabilization,
        longTerm: costBreakdown.integration
      },
      fundingSources: [
        'UN Central Emergency Response Fund (CERF)',
        'Country-based Pooled Funds',
        'Bilateral donor governments',
        'Private foundations and corporations',
        'Individual donations'
      ]
    };
  }

  /**
   * Optimize resources
   * @param {Object} plan - AI plan
   * @param {number} population - Population size
   * @returns {Object} Resource optimization
   */
  optimizeResources(plan, population) {
    return {
      procurement: {
        strategy: 'Local procurement prioritized where possible',
        timeline: 'Emergency items pre-positioned, others procured locally',
        suppliers: 'Pre-qualified supplier network activated'
      },
      logistics: {
        distribution: 'Decentralized distribution points',
        transportation: 'Multi-modal transport strategy',
        warehousing: 'Regional warehouse network'
      },
      efficiency: {
        sharing: 'Resource sharing with host communities',
        technology: 'Digital systems for tracking and accountability',
        coordination: 'Inter-agency resource coordination'
      }
    };
  }

  /**
   * Generate monitoring framework
   * @param {Object} plan - AI plan
   * @returns {Object} Monitoring framework
   */
  generateMonitoringFramework(plan) {
    return {
      indicators: [
        { indicator: 'People receiving life-saving assistance', target: '100%', frequency: 'Weekly' },
        { indicator: 'Crude mortality rate', target: '<1/10,000/day', frequency: 'Daily' },
        { indicator: 'Access to safe water', target: '15L/person/day', frequency: 'Daily' },
        { indicator: 'Children enrolled in education', target: '80%', frequency: 'Monthly' },
        { indicator: 'Reported protection incidents', target: '<5/week', frequency: 'Weekly' }
      ],
      reporting: {
        frequency: 'Weekly situation reports',
        dashboard: 'Real-time monitoring dashboard',
        evaluation: 'Monthly outcome evaluations'
      },
      accountability: {
        feedback: 'Community feedback mechanisms',
        complaints: '24/7 complaint hotline',
        transparency: 'Public reporting of resource utilization'
      }
    };
  }

  /**
   * Assess implementation risks
   * @param {Object} plan - AI plan
   * @param {Object} crisisAnalysis - Crisis analysis
   * @returns {Array} Implementation risks
   */
  assessImplementationRisks(plan, crisisAnalysis) {
    const risks = [
      {
        risk: 'Security constraints limiting access',
        likelihood: crisisAnalysis.aiRiskAssessment === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
        impact: 'HIGH',
        mitigation: 'Security protocols, remote programming, local partnerships'
      },
      {
        risk: 'Funding shortfalls',
        likelihood: 'MEDIUM',
        impact: 'HIGH',
        mitigation: 'Diversified funding strategy, contingency planning'
      },
      {
        risk: 'Rapid influx overwhelming capacity',
        likelihood: crisisAnalysis.displacementPrediction?.likelihood === 'VERY_HIGH' ? 'HIGH' : 'MEDIUM',
        impact: 'HIGH',
        mitigation: 'Scalable response model, surge capacity planning'
      },
      {
        risk: 'Host community tensions',
        likelihood: 'MEDIUM',
        impact: 'MEDIUM',
        mitigation: 'Community engagement, benefit sharing, conflict prevention'
      }
    ];

    return risks;
  }

  /**
   * Calculate readiness score
   * @param {Object} plan - AI plan
   * @returns {number} Readiness score (0-100)
   */
  calculateReadinessScore(plan) {
    let score = 70; // Base score
    
    // Add points for detailed planning
    if (plan.phases?.emergency?.activities?.length > 5) score += 10;
    if (plan.crossCutting?.protection?.length > 0) score += 10;
    if (plan.implementation?.timeline) score += 10;
    
    return Math.min(100, score);
  }

  /**
   * Generate fallback plan
   * @param {Object} crisisAnalysis - Crisis analysis
   * @returns {Object} Fallback plan
   */
  generateFallbackPlan(crisisAnalysis) {
    const population = crisisAnalysis.displacementPrediction?.estimatedPopulation || 10000;
    const country = crisisAnalysis.metadata?.country || 'Unknown';
    
    const fallbackPlan = {
      planOverview: {
        planName: `Emergency Response Plan for ${country}`,
        planType: 'EMERGENCY',
        targetPopulation: population,
        implementationPeriod: '12 months',
        priority: 'HIGH',
        coordinator: 'UNHCR'
      },
      phases: {
        emergency: {
          duration: '4 weeks',
          objectives: ['Provide life-saving assistance', 'Ensure protection'],
          activities: [
            { category: 'WASH', action: 'Provide clean water', quantity: '15L/person/day', timeline: 'Immediate', priority: 'CRITICAL' },
            { category: 'Shelter', action: 'Emergency shelter', quantity: '3.5m²/person', timeline: '48 hours', priority: 'CRITICAL' },
            { category: 'Food', action: 'Food distribution', quantity: '2100 kcal/person/day', timeline: 'Daily', priority: 'CRITICAL' }
          ],
          resources: { personnel: Math.ceil(population / 1000) * 25, budget: this.calculateEmergencyCosts(population), materials: ['Tents', 'Water containers', 'Food rations'] }
        }
      },
      metadata: {
        generatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        modelUsed: 'Fallback Logic',
        targetPopulation: population,
        country: country,
        planVersion: '1.0-fallback'
      },
      summary: {
        totalCost: this.calculateEmergencyCosts(population),
        costPerPerson: Math.round(this.calculateEmergencyCosts(population) / population),
        implementationPeriod: '4 weeks emergency response',
        priority: 'HIGH',
        readinessScore: 60
      },
      totalCost: this.calculateEmergencyCosts(population),
      planType: 'EMERGENCY',
      fallbackReason: 'AI plan generation unavailable'
    };

    return fallbackPlan;
  }

  /**
   * Get plan history
   * @param {number} limit - Number of records
   * @returns {Array} Recent plans
   */
  getPlanHistory(limit = 10) {
    return this.planHistory
      .sort((a, b) => moment(b.timestamp).diff(moment(a.timestamp)))
      .slice(0, limit);
  }

  /**
   * Clear plan cache
   */
  clearCache() {
    this.cache.clear();
    logger.info('Response plan cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      plans: this.planHistory.length,
      modelVersion: this.modelVersion
    };
  }
}

module.exports = ResponsePlanService;