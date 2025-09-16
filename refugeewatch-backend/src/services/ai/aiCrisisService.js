/**
 * RefugeeWatch AI - AI Crisis Analysis Service
 * 
 * Advanced crisis analysis using OpenAI's gpt-oss reasoning models
 * Processes real crisis data and generates AI-powered insights
 * 
 * @author RefugeeWatch AI Team
 * @version 1.0.0
 */

const moment = require('moment');
const logger = require('../../utils/logger').default;
const { chatCompletionWithRetry } = require('../../config/huggingface');

/**
 * AI Crisis Analysis Service Class
 */
class AICrisisService {
  constructor() {
    this.modelVersion = process.env.HUGGINGFACE_MODEL || 'openai/gpt-oss-20b:fireworks-ai';
    this.cache = new Map();
    this.analysisHistory = [];
  }

  /**
   * Perform comprehensive AI crisis analysis
   * @param {Object} crisisAssessment - Comprehensive crisis assessment from data aggregator
   * @returns {Promise<Object>} AI-powered crisis analysis
   */
  async performCrisisAnalysis(crisisAssessment) {
    try {
      const startTime = Date.now();
      
      logger.ai('crisis_analysis_start', {
        country: crisisAssessment.country,
        overallRisk: crisisAssessment.overallRisk,
        dataQuality: crisisAssessment.dataQuality
      });

      // Build comprehensive prompt for AI analysis
      const analysisPrompt = this.buildCrisisAnalysisPrompt(crisisAssessment);
      
      // Get AI analysis
      const aiResponse = await chatCompletionWithRetry([
        {
          role: 'system',
          content: this.getSystemPrompt()
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ], {
        temperature: 0.3,
        max_tokens: 2048,
        top_p: 0.9
      });

      if (!aiResponse.success) {
        throw new Error(`AI analysis failed: ${aiResponse.error || 'Unknown error'}`);
      }

      // Parse AI response
      const aiAnalysis = this.parseAIResponse(aiResponse.content);
      
      // Enhance with metadata
      const enhancedAnalysis = this.enhanceAnalysis(aiAnalysis, crisisAssessment);
      
      const duration = Date.now() - startTime;
      
      // Cache the analysis
      this.cache.set(`analysis_${crisisAssessment.country}`, {
        data: enhancedAnalysis,
        timestamp: moment()
      });
      
      // Store in history
      this.analysisHistory.push({
        country: crisisAssessment.country,
        timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
        riskLevel: enhancedAnalysis.aiRiskAssessment,
        confidence: enhancedAnalysis.confidence
      });

      logger.ai('crisis_analysis_complete', {
        country: crisisAssessment.country,
        aiRiskLevel: enhancedAnalysis.aiRiskAssessment,
        confidence: enhancedAnalysis.confidence,
        duration: duration,
        tokensUsed: aiResponse.usage?.total_tokens || 0
      });

      return enhancedAnalysis;

    } catch (error) {
      logger.ai('crisis_analysis_error', {
        country: crisisAssessment.country,
        error: error.message
      }, 'error');

      // Return fallback analysis
      return this.generateFallbackAnalysis(crisisAssessment);
    }
  }

  /**
   * Get system prompt for AI crisis analysis
   * @returns {string} System prompt
   */
  getSystemPrompt() {
    return `You are RefugeeWatch AI, an expert humanitarian crisis analyst specializing in predicting and analyzing refugee displacement patterns. You have access to real-time data from multiple sources including conflict monitoring, economic indicators, climate events, and news analysis.

Your role:
- Analyze complex crisis situations using advanced reasoning
- Predict displacement patterns and population movements
- Assess risk levels with high accuracy
- Provide actionable humanitarian insights
- Consider multiple factors simultaneously for comprehensive analysis

Key principles:
- Prioritize human life and dignity in all assessments
- Use evidence-based analysis over speculation
- Consider both immediate and long-term factors
- Account for interconnected crisis drivers
- Provide clear, actionable recommendations

Reasoning approach:
- Synthesize data from conflict, economic, climate, and news sources
- Identify crisis escalation patterns and triggers
- Assess population vulnerability and coping capacity
- Predict likely displacement scenarios and destinations
- Calculate confidence levels based on data quality and consistency

Output format: Respond with valid JSON containing your analysis and reasoning.`;
  }

  /**
   * Build comprehensive crisis analysis prompt
   * @param {Object} assessment - Crisis assessment data
   * @returns {string} Analysis prompt
   */
  buildCrisisAnalysisPrompt(assessment) {
    const prompt = `Analyze this comprehensive crisis situation for ${assessment.country}:

## CURRENT SITUATION OVERVIEW
- Overall Risk Level: ${assessment.overallRisk}
- System Confidence: ${Math.round(assessment.confidence * 100)}%
- Data Quality: ${assessment.dataQuality}
- Assessment Time: ${assessment.timestamp}

## DATA SOURCE ANALYSIS

### CONFLICT INDICATORS (GDELT Real-time Data)
- Risk Level: ${assessment.sources.conflict.riskLevel}
- Confidence: ${Math.round(assessment.sources.conflict.confidence * 100)}%
- Intensity Score: ${assessment.sources.conflict.score}
- Key Indicators: ${JSON.stringify(assessment.sources.conflict.indicators)}
- Recent Events: ${assessment.sources.conflict.recentEvents ? assessment.sources.conflict.recentEvents.length : 0} events tracked

### ECONOMIC INDICATORS (World Bank Data)
- Risk Level: ${assessment.sources.economic.riskLevel}
- Economic Stability: ${assessment.sources.economic.stability}
- Risk Score: ${assessment.sources.economic.score}
- Economic Pressures: ${JSON.stringify(assessment.sources.economic.indicators)}

### CLIMATE & DISASTER DATA (USGS/NASA/Open-Meteo)
- Risk Level: ${assessment.sources.climate.riskLevel}
- Active Hazards: ${assessment.sources.climate.hazards ? assessment.sources.climate.hazards.length : 0}
- Environmental Factors: ${JSON.stringify(assessment.sources.climate.indicators)}

### NEWS & MEDIA ANALYSIS (NewsAPI/Guardian)
- Crisis Level: ${assessment.sources.news.riskLevel}
- Media Attention: ${assessment.sources.news.mediaAttention}
- Urgency Score: ${assessment.sources.news.score}
- Breaking News: ${assessment.sources.news.breakingNews ? assessment.sources.news.breakingNews.length : 0} items
- Key Indicators: ${JSON.stringify(assessment.sources.news.indicators)}

## CURRENT RISK FACTORS
${assessment.riskFactors.map(factor => `- ${typeof factor === 'object' ? factor.factor : factor}`).join('\n')}

## PROTECTIVE FACTORS
${assessment.protectiveFactors.map(factor => `- ${factor}`).join('\n')}

## DISPLACEMENT PREDICTION (Current System)
- Risk Level: ${assessment.displacementRisk.level}
- Timeline: ${assessment.displacementRisk.timeline}
- Estimated Numbers: ${assessment.displacementRisk.estimatedNumbers}
- Primary Causes: ${JSON.stringify(assessment.displacementRisk.primaryCauses)}
- Likely Destinations: ${JSON.stringify(assessment.displacementRisk.likelyDestinations)}

## ANALYSIS REQUEST
Using advanced reasoning and considering all the above real-time data, provide a comprehensive AI analysis in the following JSON format:

{
  "aiRiskAssessment": "CRITICAL|HIGH|MEDIUM|LOW",
  "confidence": 0.0-1.0,
  "reasoning": "Detailed explanation of your analysis and logic",
  "keyFindings": [
    "Most important finding 1",
    "Most important finding 2",
    "Most important finding 3"
  ],
  "displacementPrediction": {
    "likelihood": "VERY_HIGH|HIGH|MEDIUM|LOW",
    "timeframe": "1-2 weeks|2-8 weeks|2-6 months|6+ months",
    "estimatedPopulation": number,
    "primaryTriggers": ["trigger1", "trigger2"],
    "likelyDestinations": ["country1", "country2"],
    "displacementType": "emergency_flight|planned_migration|gradual_exodus|internal_displacement"
  },
  "criticalFactors": [
    {
      "factor": "Factor name",
      "severity": "CRITICAL|HIGH|MEDIUM",
      "trend": "escalating|stable|improving",
      "impact": "Description of impact"
    }
  ],
  "earlyWarning": {
    "immediateThreats": ["threat1", "threat2"],
    "emergingConcerns": ["concern1", "concern2"],
    "timeToAction": "hours|days|weeks|months",
    "urgency": "immediate|high|medium|low"
  },
  "recommendations": {
    "immediate": ["action1", "action2"],
    "shortTerm": ["action1", "action2"],
    "longTerm": ["action1", "action2"]
  },
  "dataQualityAssessment": {
    "reliability": "high|medium|low",
    "completeness": "excellent|good|fair|poor",
    "freshness": "current|recent|outdated",
    "gaps": ["gap1", "gap2"]
  }
}

Provide your analysis considering:
1. Multi-source data correlation and consistency
2. Historical patterns and current trends
3. Population vulnerability and coping mechanisms
4. Regional stability and cross-border dynamics
5. Humanitarian access and response capacity`;

    return prompt;
  }

  /**
   * Parse AI response and validate structure
   * @param {string} response - Raw AI response
   * @returns {Object} Parsed analysis
   */
  parseAIResponse(response) {
    try {
      // Clean the response (remove any markdown formatting)
      const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(cleanResponse);
      
      // Validate required fields
      const required = ['aiRiskAssessment', 'confidence', 'reasoning', 'displacementPrediction'];
      for (const field of required) {
        if (!parsed[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
      
      // Validate risk assessment values
      const validRisks = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
      if (!validRisks.includes(parsed.aiRiskAssessment)) {
        throw new Error(`Invalid risk assessment: ${parsed.aiRiskAssessment}`);
      }
      
      // Validate confidence range
      if (parsed.confidence < 0 || parsed.confidence > 1) {
        throw new Error(`Invalid confidence value: ${parsed.confidence}`);
      }
      
      return parsed;
      
    } catch (error) {
      logger.warn('Failed to parse AI response:', error.message);
      
      // Attempt to extract key information even if JSON is malformed
      return this.extractBasicAnalysis(response);
    }
  }

  /**
   * Extract basic analysis from malformed AI response
   * @param {string} response - Raw AI response
   * @returns {Object} Basic analysis structure
   */
  extractBasicAnalysis(response) {
    const analysis = {
      aiRiskAssessment: 'MEDIUM',
      confidence: 0.6,
      reasoning: response.substring(0, 500) + '...',
      keyFindings: ['AI analysis completed with limited parsing'],
      displacementPrediction: {
        likelihood: 'MEDIUM',
        timeframe: '2-6 months',
        estimatedPopulation: 0,
        primaryTriggers: ['Multiple factors'],
        likelyDestinations: ['Regional destinations'],
        displacementType: 'gradual_exodus'
      },
      earlyWarning: {
        immediateThreats: [],
        emergingConcerns: ['Data parsing issues'],
        timeToAction: 'days',
        urgency: 'medium'
      },
      dataQualityAssessment: {
        reliability: 'medium',
        completeness: 'fair',
        freshness: 'current',
        gaps: ['AI response parsing']
      }
    };
    
    // Try to extract risk level from text
    const riskMatches = response.match(/(CRITICAL|HIGH|MEDIUM|LOW)/gi);
    if (riskMatches && riskMatches.length > 0) {
      analysis.aiRiskAssessment = riskMatches[0].toUpperCase();
    }
    
    return analysis;
  }

  /**
   * Enhance AI analysis with metadata and validation
   * @param {Object} aiAnalysis - Parsed AI analysis
   * @param {Object} originalAssessment - Original crisis assessment
   * @returns {Object} Enhanced analysis
   */
  enhanceAnalysis(aiAnalysis, originalAssessment) {
    const enhanced = {
      ...aiAnalysis,
      
      // Metadata
      metadata: {
        analysisTimestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
        modelUsed: this.modelVersion,
        country: originalAssessment.country,
        originalRiskLevel: originalAssessment.overallRisk,
        dataSourceCount: Object.values(originalAssessment.dataAvailability).filter(Boolean).length,
        analysisVersion: '1.0'
      },
      
      // Comparison with system assessment
      comparison: {
        systemRisk: originalAssessment.overallRisk,
        aiRisk: aiAnalysis.aiRiskAssessment,
        agreement: this.calculateAgreement(originalAssessment.overallRisk, aiAnalysis.aiRiskAssessment),
        systemConfidence: originalAssessment.confidence,
        aiConfidence: aiAnalysis.confidence,
        confidenceDelta: Math.abs(originalAssessment.confidence - aiAnalysis.confidence)
      },
      
      // Enhanced insights
      insights: {
        riskEscalation: this.assessRiskEscalation(originalAssessment, aiAnalysis),
        priorityScore: this.calculatePriorityScore(aiAnalysis),
        actionableItems: this.extractActionableItems(aiAnalysis),
        timeToReview: this.calculateReviewTime(aiAnalysis)
      }
    };
    
    return enhanced;
  }

  /**
   * Calculate agreement between system and AI assessments
   * @param {string} systemRisk - System risk level
   * @param {string} aiRisk - AI risk level
   * @returns {string} Agreement level
   */
  calculateAgreement(systemRisk, aiRisk) {
    if (systemRisk === aiRisk) return 'PERFECT';
    
    const riskOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    const systemLevel = riskOrder[systemRisk] || 2;
    const aiLevel = riskOrder[aiRisk] || 2;
    const diff = Math.abs(systemLevel - aiLevel);
    
    if (diff <= 1) return 'HIGH';
    if (diff <= 2) return 'MODERATE';
    return 'LOW';
  }

  /**
   * Assess risk escalation potential
   * @param {Object} assessment - Original assessment
   * @param {Object} aiAnalysis - AI analysis
   * @returns {Object} Risk escalation assessment
   */
  assessRiskEscalation(assessment, aiAnalysis) {
    const escalationFactors = [];
    let escalationRisk = 'LOW';
    
    // Check for escalation indicators
    if (aiAnalysis.aiRiskAssessment === 'CRITICAL') {
      escalationFactors.push('AI assessment indicates critical situation');
      escalationRisk = 'HIGH';
    }
    
    if (aiAnalysis.earlyWarning?.urgency === 'immediate') {
      escalationFactors.push('Immediate action required');
      escalationRisk = 'HIGH';
    }
    
    if (assessment.trends?.overall === 'deteriorating') {
      escalationFactors.push('Deteriorating trend across multiple indicators');
      escalationRisk = escalationRisk === 'HIGH' ? 'HIGH' : 'MEDIUM';
    }
    
    return {
      risk: escalationRisk,
      factors: escalationFactors,
      timeframe: aiAnalysis.displacementPrediction?.timeframe || 'unknown'
    };
  }

  /**
   * Calculate priority score for humanitarian response
   * @param {Object} aiAnalysis - AI analysis
   * @returns {number} Priority score (0-100)
   */
  calculatePriorityScore(aiAnalysis) {
    let score = 0;
    
    // Base score from risk level
    const riskScores = { 'CRITICAL': 40, 'HIGH': 30, 'MEDIUM': 20, 'LOW': 10 };
    score += riskScores[aiAnalysis.aiRiskAssessment] || 20;
    
    // Add urgency factor
    const urgencyScores = { 'immediate': 25, 'high': 20, 'medium': 10, 'low': 5 };
    score += urgencyScores[aiAnalysis.earlyWarning?.urgency] || 10;
    
    // Add displacement likelihood
    const likelihoodScores = { 'VERY_HIGH': 20, 'HIGH': 15, 'MEDIUM': 10, 'LOW': 5 };
    score += likelihoodScores[aiAnalysis.displacementPrediction?.likelihood] || 10;
    
    // Add confidence factor
    score += Math.round(aiAnalysis.confidence * 15);
    
    return Math.min(100, score);
  }

  /**
   * Extract actionable items from AI analysis
   * @param {Object} aiAnalysis - AI analysis
   * @returns {Array} Actionable items
   */
  extractActionableItems(aiAnalysis) {
    const items = [];
    
    if (aiAnalysis.recommendations?.immediate) {
      items.push(...aiAnalysis.recommendations.immediate.map(item => ({
        action: item,
        priority: 'IMMEDIATE',
        timeframe: '24-48 hours'
      })));
    }
    
    if (aiAnalysis.recommendations?.shortTerm) {
      items.push(...aiAnalysis.recommendations.shortTerm.map(item => ({
        action: item,
        priority: 'HIGH',
        timeframe: '1-2 weeks'
      })));
    }
    
    return items.slice(0, 5); // Top 5 actionable items
  }

  /**
   * Calculate when analysis should be reviewed/updated
   * @param {Object} aiAnalysis - AI analysis
   * @returns {string} Review timeframe
   */
  calculateReviewTime(aiAnalysis) {
    switch (aiAnalysis.earlyWarning?.urgency) {
      case 'immediate': return '6 hours';
      case 'high': return '24 hours';
      case 'medium': return '3 days';
      default: return '1 week';
    }
  }

  /**
   * Generate fallback analysis when AI fails
   * @param {Object} assessment - Original assessment
   * @returns {Object} Fallback analysis
   */
  generateFallbackAnalysis(assessment) {
    return {
      aiRiskAssessment: assessment.overallRisk || 'MEDIUM',
      confidence: Math.max(0.3, (assessment.confidence || 0.5) - 0.2),
      reasoning: 'Analysis completed using fallback logic due to AI service limitations',
      keyFindings: [
        'System assessment completed without AI enhancement',
        'Risk level based on multi-source data aggregation',
        'Recommend manual review of crisis situation'
      ],
      displacementPrediction: {
        likelihood: assessment.displacementRisk?.level || 'MEDIUM',
        timeframe: assessment.displacementRisk?.timeline || '2-6 months',
        estimatedPopulation: assessment.displacementRisk?.estimatedNumbers || 0,
        primaryTriggers: assessment.displacementRisk?.primaryCauses || [],
        likelyDestinations: assessment.displacementRisk?.likelyDestinations || [],
        displacementType: 'gradual_exodus'
      },
      earlyWarning: {
        immediateThreats: assessment.immediateThreats || [],
        emergingConcerns: assessment.emergingConcerns || [],
        timeToAction: 'days',
        urgency: 'medium'
      },
      recommendations: {
        immediate: ['Monitor situation closely', 'Verify data sources'],
        shortTerm: ['Enhance data collection', 'Prepare contingency plans'],
        longTerm: ['Strengthen early warning systems']
      },
      dataQualityAssessment: {
        reliability: 'medium',
        completeness: assessment.dataQuality?.toLowerCase() || 'fair',
        freshness: 'current',
        gaps: ['AI analysis unavailable']
      },
      metadata: {
        analysisTimestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
        modelUsed: 'Fallback Logic',
        country: assessment.country,
        originalRiskLevel: assessment.overallRisk,
        dataSourceCount: Object.values(assessment.dataAvailability || {}).filter(Boolean).length,
        analysisVersion: '1.0-fallback'
      },
      comparison: {
        systemRisk: assessment.overallRisk,
        aiRisk: assessment.overallRisk,
        agreement: 'PERFECT',
        systemConfidence: assessment.confidence,
        aiConfidence: assessment.confidence,
        confidenceDelta: 0
      },
      insights: {
        riskEscalation: { risk: 'MEDIUM', factors: [], timeframe: 'unknown' },
        priorityScore: 50,
        actionableItems: [],
        timeToReview: '1 week'
      }
    };
  }

  /**
   * Get analysis history
   * @param {number} limit - Number of records to return
   * @returns {Array} Recent analyses
   */
  getAnalysisHistory(limit = 10) {
    return this.analysisHistory
      .sort((a, b) => moment(b.timestamp).diff(moment(a.timestamp)))
      .slice(0, limit);
  }

  /**
   * Clear analysis cache
   */
  clearCache() {
    this.cache.clear();
    logger.info('AI analysis cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      analyses: this.analysisHistory.length,
      modelVersion: this.modelVersion
    };
  }
}

module.exports = AICrisisService;