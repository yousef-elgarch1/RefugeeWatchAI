// src/components/InfoCards.tsx - UPDATED WITH DIRECT AI
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Globe, 
  Users, 
  AlertTriangle, 
  Activity,
  Brain,
  Zap,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import directAIService from '@/services/directAI';
import { useToast } from '@/hooks/use-toast';

interface InfoCardsProps {
  criticalCount?: number;
  highCount?: number;
  totalMonitored?: number;
  totalDisplaced?: number;
  loading?: boolean;
}

const InfoCards: React.FC<InfoCardsProps> = ({
  criticalCount = 4,
  highCount = 6,
  totalMonitored = 25,
  totalDisplaced = 117,
  loading = false
}) => {
  const [aiStatus, setAiStatus] = useState({
    connected: false,
    model: '',
    responseTime: 0,
    lastCheck: '',
    analyzing: false
  });
  const [quickAnalysisProgress, setQuickAnalysisProgress] = useState(0);
  const { toast } = useToast();

  // Global stats
  const globalStats = {
    countriesMonitored: totalMonitored,
    activeCrises: criticalCount + highCount,
    criticalSituations: criticalCount,
    peopleAtRisk: totalDisplaced
  };

  // Check AI status on mount
  useEffect(() => {
    checkAIStatus();
    
    // Set up periodic status checks every 5 minutes
    const interval = setInterval(checkAIStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkAIStatus = async () => {
    try {
      const result = await directAIService.testConnection();
      setAiStatus({
        connected: result.success,
        model: result.model || 'Unavailable',
        responseTime: result.responseTime || 0,
        lastCheck: new Date().toLocaleTimeString(),
        analyzing: false
      });
    } catch (error) {
      console.error('AI status check failed:', error);
      setAiStatus(prev => ({
        ...prev,
        connected: false,
        lastCheck: new Date().toLocaleTimeString()
      }));
    }
  };

  const runQuickAnalysis = async () => {
    if (!aiStatus.connected) {
      toast({
        variant: "destructive",
        title: "AI Not Available",
        description: "AI models are not connected. Please check your configuration."
      });
      return;
    }

    setAiStatus(prev => ({ ...prev, analyzing: true }));
    setQuickAnalysisProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setQuickAnalysisProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Mock crisis data for quick analysis
      const mockCrisis = {
        id: 'global_overview',
        country: 'Global Crisis Overview',
        region: 'Worldwide',
        riskLevel: 'HIGH' as const,
        confidence: 85,
        coordinates: [0, 0] as [number, number],
        displacement: totalDisplaced * 1000000,
        population: 8000000000,
        crisisType: 'conflict' as const,
        summary: {
          displacementRisk: 'HIGH',
          estimatedAffected: totalDisplaced * 1000000,
          timeline: '1-3 months',
          primaryCauses: ['Multiple conflicts', 'Climate change', 'Economic instability'],
          displacement: {
            internal: Math.floor(totalDisplaced * 1000000 * 0.6),
            refugees: Math.floor(totalDisplaced * 1000000 * 0.3),
            returnees: Math.floor(totalDisplaced * 1000000 * 0.1)
          }
        }
      };

      const result = await directAIService.analyzeCrisis(mockCrisis);
      
      clearInterval(progressInterval);
      setQuickAnalysisProgress(100);

      if (result.success) {
        toast({
          title: "Quick Analysis Complete",
          description: `Global risk assessment: ${result.data?.aiRiskAssessment} (${Math.round((result.data?.confidence || 0) * 100)}% confidence)`
        });
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Quick Analysis Failed",
        description: error.message || "Could not complete analysis"
      });
    } finally {
      setAiStatus(prev => ({ ...prev, analyzing: false }));
      setQuickAnalysisProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Global Overview Card */}
      <Card className="elevated-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="w-5 h-5 text-blue-600" />
            Global Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{globalStats.countriesMonitored}</div>
              <div className="text-xs text-muted-foreground">Countries Monitored</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-crisis-high">{globalStats.activeCrises}</div>
              <div className="text-xs text-muted-foreground">Active Crises</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-crisis-critical">{globalStats.criticalSituations}</div>
              <div className="text-xs text-muted-foreground">Critical Situations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{globalStats.peopleAtRisk}M</div>
              <div className="text-xs text-muted-foreground">At Risk</div>
            </div>
          </div>
          <Button className="w-full" size="sm">
            View Details
          </Button>
        </CardContent>
      </Card>

      {/* Direct AI Status Card */}
      <Card className="elevated-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5 text-primary" />
            AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status:</span>
              <div className="flex items-center gap-1">
                {aiStatus.connected ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <Badge variant={aiStatus.connected ? "default" : "destructive"} className="text-xs">
                  {aiStatus.connected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
            </div>
            
            {aiStatus.connected && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Model:</span>
                  <Badge variant="secondary" className="text-xs">{aiStatus.model}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Response:</span>
                  <span className="text-sm font-mono">{aiStatus.responseTime}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Check:</span>
                  <span className="text-xs text-gray-500">{aiStatus.lastCheck}</span>
                </div>
              </>
            )}
          </div>
          
          {aiStatus.analyzing && (
            <div className="space-y-2">
              <Progress value={quickAnalysisProgress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">Running quick analysis...</p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="flex-1" 
              onClick={runQuickAnalysis}
              disabled={!aiStatus.connected || aiStatus.analyzing}
            >
              {aiStatus.analyzing ? (
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Zap className="w-3 h-3 mr-1" />
              )}
              Quick Analysis
            </Button>
            <Button size="sm" variant="outline" onClick={checkAIStatus}>
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Monitoring Card */}
      <Card className="elevated-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-green-600" />
            Live Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Data Sources</span>
              <Badge className="bg-green-100 text-green-800">6/6 Online</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">News Feed</span>
              <Badge className="bg-blue-100 text-blue-800">Real-time</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Climate Data</span>
              <Badge className="bg-green-100 text-green-800">Updated</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">AI Models</span>
              <Badge 
                className={aiStatus.connected 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
                }
              >
                {aiStatus.connected ? "Active" : "Offline"}
              </Badge>
            </div>
          </div>
          <Button className="w-full" size="sm" variant="outline">
            <Activity className="w-3 h-3 mr-2" />
            Monitor Details
          </Button>
        </CardContent>
      </Card>

      {/* Crisis Alerts Card */}
      <Card className="elevated-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Active Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-red-50 rounded text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="flex-1">Sudan: Population displacement accelerating</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-orange-50 rounded text-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="flex-1">Syria: Humanitarian access limited</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="flex-1">Afghanistan: Food security concerns</span>
            </div>
          </div>
          <Button className="w-full" size="sm" variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-2" />
            View All Alerts
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfoCards;