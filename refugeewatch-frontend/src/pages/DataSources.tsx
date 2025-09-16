// src/pages/DataSources.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Database, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  Wifi,
  WifiOff,
  Zap,
  Globe,
  BarChart3,
  Shield,
  TrendingUp,
  Server,
  ExternalLink
} from "lucide-react";
import { apiService } from '@/services/api';
import { useToast } from "@/hooks/use-toast";

interface DataSource {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  responseTime: number;
  uptime: number;
  lastChecked: string;
  endpoint: string;
  description: string;
  dataType: string;
  provider: string;
  errorRate: number;
}

const DataSources = () => {
  const [selectedSource, setSelectedSource] = useState<string>('');
  const { toast } = useToast();

  // Fetch service health data
  const { 
    data: healthData, 
    isLoading: healthLoading, 
    error: healthError,
    refetch: refetchHealth 
  } = useQuery({
    queryKey: ['health-services'],
    queryFn: () => fetch('/api/health/services').then(res => res.json()),
    refetchInterval: 30000,
  });

  // Fetch AI status for AI services monitoring
  const { data: aiStatus } = useQuery({
    queryKey: ['ai-status'],
    queryFn: () => apiService.getAIStatus(),
    refetchInterval: 60000,
  });

  // Mock additional data sources (in real implementation, this would come from backend)
  const dataSources: DataSource[] = [
    {
      name: 'UNHCR Refugee Data API',
      status: 'operational',
      responseTime: 420,
      uptime: 99.8,
      lastChecked: new Date().toISOString(),
      endpoint: '/api/refugees/unhcr',
      description: 'Global displacement and refugee statistics',
      dataType: 'Humanitarian',
      provider: 'UNHCR',
      errorRate: 0.2
    },
    {
      name: 'USGS Earthquake Data',
      status: 'operational',
      responseTime: 280,
      uptime: 99.9,
      lastChecked: new Date().toISOString(),
      endpoint: '/api/climate/earthquakes',
      description: 'Real-time seismic activity monitoring',
      dataType: 'Climate',
      provider: 'USGS',
      errorRate: 0.1
    },
    {
      name: 'NewsAPI Crisis Reports',
      status: 'operational',
      responseTime: 650,
      uptime: 98.5,
      lastChecked: new Date().toISOString(),
      endpoint: '/api/news/crisis',
      description: 'Real-time crisis news and media coverage',
      dataType: 'Media',
      provider: 'NewsAPI',
      errorRate: 1.5
    },
    {
      name: 'World Bank Economic Data',
      status: 'degraded',
      responseTime: 1200,
      uptime: 97.2,
      lastChecked: new Date().toISOString(),
      endpoint: '/api/economic/indicators',
      description: 'Economic indicators and development metrics',
      dataType: 'Economic',
      provider: 'World Bank',
      errorRate: 2.8
    },
    {
      name: 'REST Countries Geographic',
      status: 'operational',
      responseTime: 180,
      uptime: 99.95,
      lastChecked: new Date().toISOString(),
      endpoint: '/api/countries',
      description: 'Country information and geographic data',
      dataType: 'Geographic',
      provider: 'REST Countries',
      errorRate: 0.05
    },
    {
      name: 'GPT-OSS AI Analysis',
      status: aiStatus?.data?.status === 'operational' ? 'operational' : 'degraded',
      responseTime: aiStatus?.data?.performance?.averageResponseTime || 810,
      uptime: 99.9,
      lastChecked: new Date().toISOString(),
      endpoint: '/api/ai/analyze',
      description: 'AI-powered crisis analysis and predictions',
      dataType: 'AI/ML',
      provider: 'Hugging Face',
      errorRate: 0.1
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational': return <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-400">Operational</Badge>;
      case 'degraded': return <Badge variant="outline" className="border-yellow-500 text-yellow-700 dark:text-yellow-400">Degraded</Badge>;
      case 'down': return <Badge variant="destructive">Down</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const operationalSources = dataSources.filter(s => s.status === 'operational').length;
  const degradedSources = dataSources.filter(s => s.status === 'degraded').length;
  const downSources = dataSources.filter(s => s.status === 'down').length;
  const avgResponseTime = Math.round(dataSources.reduce((sum, s) => sum + s.responseTime, 0) / dataSources.length);
  const avgUptime = Math.round(dataSources.reduce((sum, s) => sum + s.uptime, 0) / dataSources.length * 10) / 10;

  if (healthError) {
    return (
      <div className="p-6 bg-background min-h-screen">
        <div className="max-w-2xl mx-auto">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Unable to Load Data Sources</h3>
              <p className="text-muted-foreground mb-4">
                Failed to connect to the health monitoring service.
              </p>
              <Button onClick={() => refetchHealth()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Connection
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-background min-h-screen">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Data Sources Monitoring</h1>
            <p className="text-muted-foreground">
              Real-time monitoring of external APIs and data integration health
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-2">
              <Activity className="w-3 h-3" />
              Live Monitoring
            </Badge>
            
            <Button 
              onClick={() => refetchHealth()} 
              variant="outline" 
              size="sm"
              disabled={healthLoading}
            >
              {healthLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Operational Sources</p>
                  <p className="text-3xl font-bold text-foreground">{operationalSources}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {Math.round((operationalSources / dataSources.length) * 100)}% of total sources
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                  <p className="text-3xl font-bold text-foreground">{avgResponseTime}ms</p>
                </div>
                <Zap className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Across all active sources
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">System Uptime</p>
                  <p className="text-3xl font-bold text-foreground">{avgUptime}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Last 30 days average
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Issues Detected</p>
                  <p className="text-3xl font-bold text-foreground">{degradedSources + downSources}</p>
                </div>
                <AlertTriangle className={`h-8 w-8 ${degradedSources + downSources > 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Requiring attention
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Active Alerts */}
          {(degradedSources > 0 || downSources > 0) && (
            <Alert className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                {degradedSources > 0 && `${degradedSources} data source${degradedSources > 1 ? 's' : ''} experiencing degraded performance. `}
                {downSources > 0 && `${downSources} data source${downSources > 1 ? 's' : ''} currently down.`}
                Check the details below for more information.
              </AlertDescription>
            </Alert>
          )}

          {/* Data Sources Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dataSources.map((source, index) => (
              <Card key={index} className="border-border bg-card hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      {source.name}
                    </CardTitle>
                    {getStatusBadge(source.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{source.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Response Time</div>
                      <div className="text-lg font-semibold text-foreground flex items-center gap-1">
                        {source.responseTime}ms
                        {source.responseTime < 500 ? (
                          <Wifi className="w-4 h-4 text-green-500" />
                        ) : source.responseTime < 1000 ? (
                          <Wifi className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <WifiOff className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Uptime</div>
                      <div className="text-lg font-semibold text-foreground">{source.uptime}%</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Reliability</span>
                      <span className="text-foreground font-medium">{source.uptime}%</span>
                    </div>
                    <Progress value={source.uptime} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Provider:</span>
                      <div className="font-medium text-foreground">{source.provider}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Data Type:</span>
                      <div className="font-medium text-foreground">{source.dataType}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="text-xs text-muted-foreground">
                      Last checked: {new Date(source.lastChecked).toLocaleTimeString()}
                    </div>
                    <Button variant="ghost" size="sm" className="h-8">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <BarChart3 className="w-5 h-5" />
                  Response Time Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {dataSources.map((source, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground font-medium">{source.name}</span>
                        <span className="text-muted-foreground">{source.responseTime}ms</span>
                      </div>
                      <Progress value={Math.min((source.responseTime / 2000) * 100, 100)} className="h-2" />
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {dataSources.filter(s => s.responseTime < 500).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Fast ({'<'} 500ms)</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                        {dataSources.filter(s => s.responseTime >= 500 && s.responseTime < 1000).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Moderate (500-1000ms)</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-red-600 dark:text-red-400">
                        {dataSources.filter(s => s.responseTime >= 1000).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Slow  ({'>'}1000ms)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Rate Analysis */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <AlertTriangle className="w-5 h-5" />
                  Error Rate Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {dataSources.map((source, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground font-medium">{source.name}</span>
                        <span className={`font-medium ${source.errorRate > 2 ? 'text-red-500' : source.errorRate > 1 ? 'text-yellow-500' : 'text-green-500'}`}>
                          {source.errorRate}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(source.errorRate * 10, 100)} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {(dataSources.reduce((sum, s) => sum + s.errorRate, 0) / dataSources.length).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Average Error Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Timeline */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Clock className="w-5 h-5" />
                Performance Timeline (Last 24 Hours)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: '00:00', performance: 98, issues: 0 },
                  { time: '06:00', performance: 97, issues: 1 },
                  { time: '12:00', performance: 95, issues: 2 },
                  { time: '18:00', performance: 99, issues: 0 },
                  { time: '24:00', performance: 98, issues: 0 }
                ].map((period, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center gap-4">
                      <div className="font-mono text-sm text-muted-foreground w-12">{period.time}</div>
                      <div className="flex-1">
                        <Progress value={period.performance} className="h-2 w-32" />
                      </div>
                      <div className="text-sm font-medium text-foreground">{period.performance}%</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {period.issues > 0 ? (
                        <Badge variant="destructive" className="text-xs">{period.issues} issues</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Stable</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* API Endpoints */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Globe className="w-5 h-5" />
                  API Endpoints Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dataSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(source.status).replace('text-', 'bg-')}`}></div>
                      <div>
                        <div className="font-medium text-foreground">{source.endpoint}</div>
                        <div className="text-xs text-muted-foreground">{source.provider}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(source.status)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Integration Health */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Server className="w-5 h-5" />
                  Integration Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg border border-border bg-muted/20">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{operationalSources}</div>
                    <div className="text-sm text-muted-foreground">Healthy Integrations</div>
                  </div>
                  
                  <div className="text-center p-4 rounded-lg border border-border bg-muted/20">
                    <div className="text-2xl font-bold text-foreground">{dataSources.length}</div>
                    <div className="text-sm text-muted-foreground">Total Integrations</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Overall Health</span>
                      <span className="text-foreground font-medium">
                        {Math.round((operationalSources / dataSources.length) * 100)}%
                      </span>
                    </div>
                    <Progress value={(operationalSources / dataSources.length) * 100} className="h-2" />
                  </div>

                  <div className="pt-2 border-t border-border">
                    <div className="text-sm text-muted-foreground mb-2">Data Types Coverage</div>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(dataSources.map(s => s.dataType))).map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">{type}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Shield className="w-5 h-5" />
                Security & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <div className="font-semibold text-foreground">SSL/TLS Encrypted</div>
                  <div className="text-sm text-muted-foreground">All API communications</div>
                </div>
                
                <div className="text-center p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
                  <Shield className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <div className="font-semibold text-foreground">API Key Security</div>
                  <div className="text-sm text-muted-foreground">Secure credential management</div>
                </div>
                
                <div className="text-center p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
                  <Activity className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <div className="font-semibold text-foreground">Rate Limiting</div>
                  <div className="text-sm text-muted-foreground">Prevents abuse & overload</div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="font-semibold text-foreground mb-3">Compliance Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">GDPR Compliance</span>
                    <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-400">Compliant</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Data Retention Policy</span>
                    <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-400">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Access Logging</span>
                    <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-400">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Audit Trail</span>
                    <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-400">Complete</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataSources;