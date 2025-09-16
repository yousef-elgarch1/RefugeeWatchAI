
// ================================
// 2. ADVANCED AI CRISIS SERVICE
// File: src/services/ai/advancedCrisisService.js
// ================================

class AdvancedAICrisisService {
  constructor() {
    this.currentModel = HF_CONFIG.models.primary;
    this.analysisHistory = [];
  }

  /**
   * COMPREHENSIVE CRISIS ANALYSIS - Based on UNHCR protocols
   */
  async performAdvancedCrisisAnalysis(crisisData) {
    try {
      const analysis = await this.runAnalysisWithFallback(crisisData);
      
      return {
        success: true,
        analysis: {
          ...analysis,
          metadata: {
            modelUsed: this.currentModel.model,
            analysisTimestamp: new Date().toISOString(),
            confidence: analysis.confidence || 0.75,
            protocolsApplied: ['UNHCR-L3', 'IASC-Cluster', 'RCM', 'NARE'],
            analysisId: `crisis_${Date.now()}`
          }
        }
      };
    } catch (error) {
      logger.error('Advanced crisis analysis failed:', error);
      return this.getFallbackAnalysis(crisisData);
    }
  }

  /**
   * AI ANALYSIS WITH AUTOMATIC FALLBACK
   */
  async runAnalysisWithFallback(crisisData) {
    const models = [HF_CONFIG.models.primary, HF_CONFIG.models.backup1, HF_CONFIG.models.backup2];
    
    for (const model of models) {
      try {
        logger.info(`Attempting analysis with ${model.model}`);
        const result = await this.callAIModel(model, crisisData);
        
        if (result.success) {
          this.currentModel = model;
          return result.analysis;
        }
      } catch (error) {
        logger.warn(`Model ${model.model} failed, trying next...`);
        continue;
      }
    }
    
    throw new Error('All AI models failed');
  }

  /**
   * CALL AI MODEL WITH HUMANITARIAN PROMPT
   */
  async callAIModel(model, crisisData) {
    const prompt = this.buildHumanitarianPrompt(crisisData);
    
    const response = await axios.post(
      `${HF_CONFIG.baseURL}/chat/completions`,
      {
        model: model.model,
        messages: [
          {
            role: "system",
            content: this.getHumanitarianSystemPrompt()
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        max_tokens: model.maxTokens,
        temperature: model.temperature,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${HF_CONFIG.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: HF_CONFIG.timeout
      }
    );

    if (response.status === 200 && response.data.choices) {
      const content = response.data.choices[0]?.message?.content || '';
      const analysis = this.parseAIResponse(content, crisisData);
      
      return {
        success: true,
        analysis: analysis,
        usage: response.data.usage
      };
    }

    throw new Error('Invalid AI response');
  }

  /**
   * HUMANITARIAN SYSTEM PROMPT - Based on your test scenarios
   */
  getHumanitarianSystemPrompt() {
    return `You are a senior humanitarian analyst with expertise in UNHCR, IOM, and IASC frameworks. 

Your expertise includes:
- UNHCR Level 3 Emergency Response protocols
- IASC Cluster Approach coordination 
- IOM CCCM and DTM methodologies
- NARE (Needs Assessment for Refugee Emergencies)
- RCM (Refugee Coordination Model)
- Global Compact on Refugees implementation

Analysis approach:
- Use evidence-based multi-factor analysis
- Apply protection-centered humanitarian principles
- Consider displacement patterns and population movements
- Assess coordination mechanisms and resource requirements
- Provide actionable recommendations with realistic timelines

Always respond with structured JSON containing:
- riskLevel (CRITICAL/HIGH/MEDIUM/LOW)
- confidence (0.0-1.0)
- reasoning (detailed explanation)
- displacementPrediction (numbers and patterns)
- recommendedActions (immediate and strategic)
- protectionConcerns (key risks and vulnerabilities)
- coordinationNeeds (agencies and mechanisms)
- resourceRequirements (estimated needs)`;
  }

  /**
   * BUILD COMPREHENSIVE HUMANITARIAN PROMPT
   */
  buildHumanitarianPrompt(crisisData) {
    return `HUMANITARIAN CRISIS ANALYSIS REQUEST

## CRISIS OVERVIEW
Country: ${crisisData.country}
Current Risk Level: ${crisisData.overallRisk}
Population at Risk: ${crisisData.population || 'Unknown'}
Crisis Type: ${crisisData.crisisType || 'Multi-factor'}

## DATA SOURCES ANALYSIS

### CONFLICT INDICATORS
- GDELT Risk Score: ${crisisData.sources?.conflict?.score || 'N/A'}
- Recent Events: ${crisisData.sources?.conflict?.recentEvents?.length || 0}
- Intensity Level: ${crisisData.sources?.conflict?.riskLevel || 'Unknown'}

### ECONOMIC FACTORS  
- Economic Stability: ${crisisData.sources?.economic?.stability || 'Unknown'}
- Risk Score: ${crisisData.sources?.economic?.score || 'N/A'}
- Key Indicators: ${JSON.stringify(crisisData.sources?.economic?.indicators || {})}

### CLIMATE & DISASTERS
- Environmental Risk: ${crisisData.sources?.climate?.riskLevel || 'Unknown'}
- Active Hazards: ${crisisData.sources?.climate?.hazards?.length || 0}
- Climate Factors: ${JSON.stringify(crisisData.sources?.climate?.indicators || {})}

### MEDIA & NEWS ANALYSIS
- Media Attention: ${crisisData.sources?.news?.mediaAttention || 'Low'}
- Crisis Coverage: ${crisisData.sources?.news?.riskLevel || 'Unknown'}
- Breaking News: ${crisisData.sources?.news?.breakingNews || false}

## ANALYSIS REQUIREMENTS

Based on humanitarian protocols, provide comprehensive analysis including:

1. **RISK ASSESSMENT** (Apply UNHCR emergency classification)
   - Overall risk level with justification
   - Confidence level based on data quality
   - Key risk factors and escalation potential

2. **DISPLACEMENT PREDICTION** (Use DTM methodology)
   - Estimated affected population
   - Likely displacement patterns and destinations  
   - Timeline for potential mass movements

3. **PROTECTION ANALYSIS** (Apply UNHCR 15 standard protection risks)
   - Primary protection concerns
   - Vulnerable population groups
   - Immediate protection interventions needed

4. **COORDINATION REQUIREMENTS** (Apply IASC Cluster approach)
   - Required cluster activations
   - Lead agency recommendations
   - Coordination mechanisms needed

5. **RESOURCE ESTIMATION** (Apply UNHCR RRP methodology)
   - Immediate resource requirements
   - Funding estimates for 3-6 month response
   - Key resource gaps and priorities

6. **STRATEGIC RECOMMENDATIONS** (Apply RCM framework)
   - Immediate actions (72 hours)
   - Short-term interventions (1-4 weeks)
   - Medium-term strategies (1-6 months)

Respond with detailed JSON analysis following humanitarian standards.`;
  }

  /**
   * PARSE AI RESPONSE INTO STRUCTURED DATA
   */
  parseAIResponse(content, originalData) {
    try {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return this.validateAndEnhanceAnalysis(parsed, originalData);
      }
    } catch (error) {
      logger.warn('Failed to parse JSON response, using text analysis');
    }

    // Fallback: Extract key information from text
    return this.extractFromText(content, originalData);
  }

  /**
   * VALIDATE AND ENHANCE AI ANALYSIS
   */
  validateAndEnhanceAnalysis(analysis, originalData) {
    return {
      // Core Assessment
      riskLevel: analysis.riskLevel || this.extractRiskLevel(originalData),
      confidence: analysis.confidence || 0.75,
      reasoning: analysis.reasoning || 'AI analysis completed',

      // Displacement Prediction
      displacementPrediction: {
        estimatedAffected: analysis.displacementPrediction?.estimatedAffected || 50000,
        likelyDestinations: analysis.displacementPrediction?.likelyDestinations || ['Neighboring regions'],
        timeframe: analysis.displacementPrediction?.timeframe || '2-8 weeks',
        movementPattern: analysis.displacementPrediction?.movementPattern || 'gradual_exodus'
      },

      // Protection Analysis
      protectionConcerns: {
        primaryRisks: analysis.protectionConcerns?.primaryRisks || ['Violence', 'Displacement', 'Loss of livelihoods'],
        vulnerableGroups: analysis.protectionConcerns?.vulnerableGroups || ['Women', 'Children', 'Elderly'],
        immediateNeeds: analysis.protectionConcerns?.immediateNeeds || ['Safety', 'Shelter', 'Healthcare']
      },

      // Coordination Requirements
      coordinationNeeds: {
        clustersToActivate: analysis.coordinationNeeds?.clustersToActivate || ['Protection', 'Shelter', 'Health'],
        leadAgencies: analysis.coordinationNeeds?.leadAgencies || ['UNHCR', 'IOM', 'WHO'],
        coordinationLevel: analysis.coordinationNeeds?.coordinationLevel || 'national'
      },

      // Resource Requirements
      resourceRequirements: {
        immediate: {
          funding: analysis.resourceRequirements?.immediate?.funding || 5000000,
          personnel: analysis.resourceRequirements?.immediate?.personnel || 150,
          supplies: analysis.resourceRequirements?.immediate?.supplies || ['Emergency kits', 'Medical supplies', 'Shelter materials']
        },
        sixMonth: {
          funding: analysis.resourceRequirements?.sixMonth?.funding || 25000000,
          personnel: analysis.resourceRequirements?.sixMonth?.personnel || 500,
          infrastructure: analysis.resourceRequirements?.sixMonth?.infrastructure || ['Temporary settlements', 'Healthcare facilities', 'Schools']
        }
      },

      // Strategic Recommendations
      recommendedActions: {
        immediate: analysis.recommendedActions?.immediate || [
          'Activate Emergency Response Protocol',
          'Deploy rapid assessment teams',
          'Establish coordination mechanisms'
        ],
        shortTerm: analysis.recommendedActions?.shortTerm || [
          'Scale up humanitarian response', 
          'Strengthen protection monitoring',
          'Enhance early warning systems'
        ],
        mediumTerm: analysis.recommendedActions?.mediumTerm || [
          'Develop durable solutions strategy',
          'Strengthen local capacity',
          'Address root causes'
        ]
      }
    };
  }

  /**
   * EXTRACT RISK LEVEL FROM DATA
   */
  extractRiskLevel(data) {
    const overallRisk = data.overallRisk?.toLowerCase();
    if (overallRisk?.includes('critical')) return 'CRITICAL';
    if (overallRisk?.includes('high')) return 'HIGH'; 
    if (overallRisk?.includes('medium')) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * EXTRACT ANALYSIS FROM TEXT (FALLBACK)
   */
  extractFromText(content, originalData) {
    const riskMatches = content.match(/(CRITICAL|HIGH|MEDIUM|LOW)/gi);
    const populationMatches = content.match(/(\d{1,3}(?:,\d{3})*)/g);
    
    return {
      riskLevel: riskMatches?.[0]?.toUpperCase() || this.extractRiskLevel(originalData),
      confidence: 0.65, // Lower confidence for text extraction
      reasoning: content.substring(0, 500) + '...',
      displacementPrediction: {
        estimatedAffected: populationMatches?.[0] ? parseInt(populationMatches[0].replace(/,/g, '')) : 50000,
        likelyDestinations: ['Neighboring regions'],
        timeframe: '2-8 weeks',
        movementPattern: 'gradual_exodus'
      },
      protectionConcerns: {
        primaryRisks: ['Displacement', 'Violence', 'Food insecurity'],
        vulnerableGroups: ['Women', 'Children', 'Elderly'],
        immediateNeeds: ['Safety', 'Shelter', 'Healthcare']
      },
      coordinationNeeds: {
        clustersToActivate: ['Protection', 'Shelter', 'Health', 'WASH'],
        leadAgencies: ['UNHCR', 'IOM', 'WHO'],
        coordinationLevel: 'national'
      },
      resourceRequirements: {
        immediate: {
          funding: 5000000,
          personnel: 150,
          supplies: ['Emergency kits', 'Medical supplies']
        },
        sixMonth: {
          funding: 25000000, 
          personnel: 500,
          infrastructure: ['Temporary settlements', 'Healthcare facilities']
        }
      },
      recommendedActions: {
        immediate: ['Activate Emergency Response', 'Deploy assessment teams'],
        shortTerm: ['Scale up response', 'Strengthen protection'],
        mediumTerm: ['Develop solutions strategy', 'Build local capacity']
      }
    };
  }

  /**
   * FALLBACK ANALYSIS WHEN AI FAILS
   */
  getFallbackAnalysis(crisisData) {
    logger.warn('Using fallback analysis - all AI models failed');
    
    return {
      success: false,
      analysis: {
        riskLevel: this.extractRiskLevel(crisisData),
        confidence: 0.5,
        reasoning: 'Analysis generated using system algorithms (AI temporarily unavailable)',
        displacementPrediction: {
          estimatedAffected: 25000,
          likelyDestinations: ['Regional destinations'],
          timeframe: '2-6 weeks',
          movementPattern: 'mixed'
        },
        protectionConcerns: {
          primaryRisks: ['Displacement risk', 'Protection concerns'],
          vulnerableGroups: ['At-risk populations'],
          immediateNeeds: ['Basic humanitarian assistance']
        },
        coordinationNeeds: {
          clustersToActivate: ['Protection', 'Shelter'],
          leadAgencies: ['UNHCR'],
          coordinationLevel: 'basic'
        },
        resourceRequirements: {
          immediate: { funding: 2000000, personnel: 50, supplies: ['Basic supplies'] },
          sixMonth: { funding: 10000000, personnel: 200, infrastructure: ['Basic facilities'] }
        },
        recommendedActions: {
          immediate: ['Assess situation', 'Coordinate response'],
          shortTerm: ['Monitor developments', 'Prepare response'],
          mediumTerm: ['Develop comprehensive strategy']
        },
        metadata: {
          modelUsed: 'fallback_system',
          analysisTimestamp: new Date().toISOString(),
          confidence: 0.5,
          protocolsApplied: ['basic_assessment'],
          analysisId: `fallback_${Date.now()}`
        }
      }
    };
  }
}

module.exports = AdvancedAICrisisService;
