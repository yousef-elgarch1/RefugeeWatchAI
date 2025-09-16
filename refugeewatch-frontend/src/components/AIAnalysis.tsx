// src/components/AIAnalysis.tsx - UPDATED WITH DIRECT HUGGING FACE
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  RefreshCw, 
  Target, 
  Users, 
  Clock, 
  Activity, 
  Globe, 
  FileText,
  AlertTriangle,
  CheckCircle,
  Zap,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import directAIService from '@/services/directAI';

// Mock crisis data - replace with your actual crisis data source
const availableCrises = [
  {
    id: 'sudan',
    country: 'Sudan',
    region: 'Northeast Africa',
    riskLevel: 'CRITICAL' as const,
    confidence: 85,
    coordinates: [15.5007, 32.5599] as [number, number],
    displacement: 6200000,
    population: 45000000,
    crisisType: 'conflict' as const,
    summary: {
      displacementRisk: 'CRITICAL',
      estimatedAffected: 2800000,
      timeline: '2-4 weeks',
      primaryCauses: ['Armed conflict', 'Economic collapse', 'Political instability'],
      displacement: {
        internal: 6200000,
        refugees: 1400000,
        returnees: 800000
      }
    },
    events: [
      { type: 'conflict', date: '2024-01-15', magnitude: 8.5, description: 'Military confrontation escalated' },
      { type: 'displacement', date: '2024-02-01', magnitude: 7.8, description: 'Mass population movement observed' }
    ]
  },
  {
    id: 'syria',
    country: 'Syria',
    region: 'Middle East',
    riskLevel: 'HIGH' as const,
    confidence: 78,
    coordinates: [34.8021, 38.9968] as [number, number],
    displacement: 13100000,
    population: 18300000,
    crisisType: 'conflict' as const,
    summary: {
      displacementRisk: 'HIGH',
      estimatedAffected: 15800000,
      timeline: '4-8 weeks',
      primaryCauses: ['Ongoing conflict', 'Economic crisis', 'Infrastructure damage'],
      displacement: {
        internal: 6200000,
        refugees: 6800000,
        returnees: 2100000
      }
    }
  },
  {
    id: 'afghanistan',
    country: 'Afghanistan',
    region: 'South Asia',
    riskLevel: 'HIGH' as const,
    confidence: 82,
    coordinates: [33.9391, 67.7100] as [number, number],
    displacement: 4000000,
    population: 38900000,
    crisisType: 'conflict' as const,
    summary: {
      displacementRisk: 'HIGH',
      estimatedAffected: 24400000,
      timeline: '3-6 weeks',
      primaryCauses: ['Political instability', 'Economic collapse', 'Humanitarian crisis'],
      displacement: {
        internal: 3500000,
        refugees: 2600000,
        returnees: 5700000
      }
    }
  }
];

const AIAnalysis = () => {
  const [selectedCrisis, setSelectedCrisis] = useState(availableCrises[0]);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [modelStatus, setModelStatus] = useState({ connected: false, model: '', responseTime: 0 });
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  // Test AI connection on component mount
  useEffect(() => {
    testAIConnection();
  }, []);

  const testAIConnection = async () => {
    try {
      const result = await directAIService.testConnection();
      setModelStatus({
        connected: result.success,
        model: result.model || 'Unknown',
        responseTime: result.responseTime || 0
      });
      
      if (!result.success) {
        toast({
          variant: "destructive",
          title: "AI Connection Issue",
          description: result.error || "Could not connect to AI models"
        });
      }
    } catch (error) {
      console.error('AI connection test failed:', error);
      setModelStatus({ connected: false, model: 'Error', responseTime: 0 });
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedCrisis) {
      toast({
        variant: "destructive",
        title: "No Crisis Selected",
        description: "Please select a crisis to analyze"
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setAnalysis(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 15, 85));
      }, 500);

      toast({
        title: "Analysis Started",
        description: `Running AI analysis for ${selectedCrisis.country}...`
      });

      // Call direct AI service
      const result = await directAIService.analyzeCrisis(selectedCrisis);
      
      clearInterval(progressInterval);
      setProgress(100);

      if (result.success && result.data) {
        setAnalysis(result.data);
        
        // Add to history
        const historyItem = {
          id: Date.now().toString(),
          crisis: selectedCrisis.country,
          riskLevel: result.data.aiRiskAssessment,
          timestamp: new Date().toISOString(),
          modelUsed: result.data.metadata.modelUsed,
          responseTime: result.data.metadata.responseTime
        };
        
        setAnalysisHistory(prev => [historyItem, ...prev.slice(0, 4)]);

        toast({
          title: "Analysis Complete",
          description: `${selectedCrisis.country} analyzed using ${result.data.metadata.modelUsed}`
        });
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message || "Could not complete AI analysis"
      });
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-600" />
            AI Crisis Intelligence Center
          </h1>
          <p className="text-gray-600 mt-1">
            Direct AI analysis powered by Hugging Face models
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={`px-4 py-2 ${modelStatus.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <Activity className="w-4 h-4 mr-2" />
            AI: {modelStatus.connected ? 'Connected' : 'Disconnected'}
          </Badge>
          {modelStatus.connected && (
            <Badge variant="outline" className="px-4 py-2">
              Response: {modelStatus.responseTime}ms
            </Badge>
          )}
        </div>
      </div>

      {/* Connection Status Alert */}
      {!modelStatus.connected && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            AI models not accessible. Check your Hugging Face API key in .env file.
            <Button variant="link" onClick={testAIConnection} className="p-0 ml-2">
              Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Panel - Crisis Selection & Controls */}
        <div className="space-y-6">
          {/* Crisis Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Select Crisis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableCrises.map((crisis) => (
                <div
                  key={crisis.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedCrisis?.id === crisis.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCrisis(crisis)}
                >
                  <div className="font-medium">{crisis.country}</div>
                  <div className="text-sm text-gray-600">{crisis.region}</div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge size="sm" className={getRiskColor(crisis.riskLevel)}>
                      {crisis.riskLevel}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {crisis.displacement?.toLocaleString()} displaced
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Analysis Button */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Direct AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full" 
                onClick={handleRunAnalysis}
                disabled={isAnalyzing || !modelStatus.connected}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Run AI Analysis
                  </>
                )}
              </Button>
              
              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing...</span>
                    <span>{modelStatus.model}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-gray-500">
                    Analyzing crisis data with AI models...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recent Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysisHistory.slice(0, 5).map((item) => (
                  <div key={item.id} className="p-2 bg-gray-50 rounded text-sm">
                    <div className="font-medium">{item.crisis}</div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                      <Badge size="sm" className={getRiskColor(item.riskLevel)}>
                        {item.riskLevel}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {item.modelUsed} • {item.responseTime}ms
                    </div>
                  </div>
                ))}
                {analysisHistory.length === 0 && (
                  <p className="text-sm text-gray-500">No recent analysis</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analysis Panel */}
        <div className="lg:col-span-3 space-y-6">
          
          {!analysis && !isAnalyzing && (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Brain className="w-16 h-16 text-gray-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-medium text-gray-600">
                    Direct AI Crisis Analysis Ready
                  </h3>
                  <p className="text-gray-500">
                    Select a crisis situation and click "Run AI Analysis" to begin
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Powered by Hugging Face • No backend required
                  </p>
                </div>
              </div>
            </Card>
          )}

          {analysis && (
            <>
              {/* Analysis Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      AI Risk Assessment
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getRiskColor(analysis.aiRiskAssessment)}>
                        {analysis.aiRiskAssessment} RISK
                      </Badge>
                      <Badge variant="outline">
                        {Math.round(analysis.confidence * 100)}% Confidence
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {analysis.metadata.modelUsed}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium mb-2">AI Analysis Summary</h4>
                      <p className="text-sm text-gray-700">{analysis.reasoning}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold">
                          {(analysis.displacementPrediction.estimatedAffected / 1000).toFixed(0)}K
                        </div>
                        <div className="text-sm text-gray-600">Estimated Affected</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold">
                          {analysis.displacementPrediction.timeframe}
                        </div>
                        <div className="text-sm text-gray-600">Timeline</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold">
                          {analysis.severityScore.toFixed(1)}/10
                        </div>
                        <div className="text-sm text-gray-600">Severity Score</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Displacement Prediction */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Displacement Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Likelihood:</span>
                        <Badge variant="outline">{analysis.displacementPrediction.likelihood}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Type:</span>
                        <span className="text-sm">{analysis.displacementPrediction.displacementType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Timeline:</span>
                        <span className="text-sm">{analysis.displacementPrediction.timeframe}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium">Likely Destinations:</span>
                        <div className="mt-1">
                          {analysis.displacementPrediction.destinations.map((dest, index) => (
                            <Badge key={index} variant="secondary" className="mr-1 mb-1">
                              {dest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Risk Factors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Key Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {analysis.keyFactors.map((factor, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                        <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                        <span className="text-sm">{factor}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2 text-red-600">Immediate Actions</h4>
                      <div className="space-y-1">
                        {analysis.recommendations.immediate.map((rec, index) => (
                          <div key={index} className="text-sm p-2 bg-red-50 rounded">
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2 text-orange-600">Short-term (1-3 months)</h4>
                      <div className="space-y-1">
                        {analysis.recommendations.shortTerm.map((rec, index) => (
                          <div key={index} className="text-sm p-2 bg-orange-50 rounded">
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2 text-blue-600">Long-term (3+ months)</h4>
                      <div className="space-y-1">
                        {analysis.recommendations.longTerm.map((rec, index) => (
                          <div key={index} className="text-sm p-2 bg-blue-50 rounded">
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Analysis Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Model Used:</span>
                      <div className="text-gray-600">{analysis.metadata.modelUsed}</div>
                    </div>
                    <div>
                      <span className="font-medium">Response Time:</span>
                      <div className="text-gray-600">{analysis.metadata.responseTime}ms</div>
                    </div>
                    <div>
                      <span className="font-medium">Analysis Time:</span>
                      <div className="text-gray-600">
                        {new Date(analysis.metadata.analysisTimestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Data Source:</span>
                      <div className="text-gray-600">Direct API</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis;