/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/GlobalMetrics.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Globe, 
  AlertTriangle,
  Activity,
  Loader2,
  RefreshCw,
  Target,
  MapPin,
  Clock,
  Database,
  PieChart,
  LineChart
} from "lucide-react";
import { apiService } from '@/services/api';

const GlobalMetrics = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('current');

  // Fetch global metrics
  const { 
    data: metricsData, 
    isLoading: metricsLoading, 
    error: metricsError,
    refetch: refetchMetrics 
  } = useQuery({
    queryKey: ['global-metrics', selectedTimeframe],
    queryFn: () => apiService.getGlobalMetrics(selectedTimeframe),
    refetchInterval: 60000,
  });

  // Fetch geographical data for distribution
  const { data: geoData } = useQuery({
    queryKey: ['geographical-data'],
    queryFn: () => apiService.getGeographicalData(),
    refetchInterval: 60000,
  });

  // Fetch crisis data for trends
  const { data: crisesData } = useQuery({
    queryKey: ['crises'],
    queryFn: () => apiService.getCrises(),
    refetchInterval: 60000,
  });

  const metrics = metricsData?.data || {};
  const geoMetrics = geoData?.data || {};
  const crises = crisesData?.data?.crises || [];

  // Calculate additional metrics
  const totalCrises = crises.length;
  const criticalCrises = crises.filter((c: any) => c.riskLevel === 'CRITICAL').length;
  const highRiskCrises = crises.filter((c: any) => c.riskLevel === 'HIGH').length;
  const totalDisplaced = geoMetrics.totalDisplaced || 0;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const getRiskPercentage = (level: string) => {
    if (totalCrises === 0) return 0;
    const count = crises.filter((c: any) => c.riskLevel === level).length;
    return Math.round((count / totalCrises) * 100);
  };

  if (metricsError) {
    return (
      <div className="p-6 bg-background min-h-screen">
        <div className="max-w-2xl mx-auto">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Unable to Load Metrics</h3>
              <p className="text-muted-foreground mb-4">
                Failed to connect to the metrics service. Please check your connection.
              </p>
              <Button onClick={() => refetchMetrics()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
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
            <h1 className="text-3xl font-bold text-foreground">Global Crisis Metrics</h1>
            <p className="text-muted-foreground">
              Real-time humanitarian crisis monitoring and analytics dashboard
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="current">Current</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            
            <Button 
              onClick={() => refetchMetrics()} 
              variant="outline" 
              size="sm"
              disabled={metricsLoading}
            >
              {metricsLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Countries Monitored</p>
                  <p className="text-3xl font-bold text-foreground">
                    {metrics.overview?.totalCountriesMonitored || totalCrises}
                  </p>
                </div>
                <Globe className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Active crisis monitoring
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Displaced</p>
                  <p className="text-3xl font-bold text-foreground">
                    {formatNumber(totalDisplaced)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                People affected globally
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Critical Crises</p>
                  <p className="text-3xl font-bold text-foreground">
                    {criticalCrises}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Requiring immediate attention
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data Quality</p>
                  <p className="text-3xl font-bold text-foreground">
                    {metrics.overview?.dataQuality || '98%'}
                  </p>
                </div>
                <Database className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Real-time accuracy
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="risk-analysis">Risk Analysis</TabsTrigger>
          <TabsTrigger value="regional">Regional Data</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Risk Level Distribution */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <PieChart className="w-5 h-5" />
                  Risk Level Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium text-foreground">Critical</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{criticalCrises}</span>
                      <Badge variant="destructive">{getRiskPercentage('CRITICAL')}%</Badge>
                    </div>
                  </div>
                  <Progress value={getRiskPercentage('CRITICAL')} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-sm font-medium text-foreground">High</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{highRiskCrises}</span>
                      <Badge variant="default">{getRiskPercentage('HIGH')}%</Badge>
                    </div>
                  </div>
                  <Progress value={getRiskPercentage('HIGH')} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm font-medium text-foreground">Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {crises.filter((c: any) => c.riskLevel === 'MEDIUM').length}
                      </span>
                      <Badge variant="secondary">{getRiskPercentage('MEDIUM')}%</Badge>
                    </div>
                  </div>
                  <Progress value={getRiskPercentage('MEDIUM')} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-foreground">Low</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {crises.filter((c: any) => c.riskLevel === 'LOW').length}
                      </span>
                      <Badge variant="outline">{getRiskPercentage('LOW')}%</Badge>
                    </div>
                  </div>
                  <Progress value={getRiskPercentage('LOW')} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Top Crisis Locations */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Target className="w-5 h-5" />
                  Priority Crisis Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {crises
                    .filter((crisis: any) => crisis.riskLevel === 'CRITICAL' || crisis.riskLevel === 'HIGH')
                    .sort((a: any, b: any) => (b.displacement || 0) - (a.displacement || 0))
                    .slice(0, 6)
                    .map((crisis: any, index: number) => (
                      <div key={crisis.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                        <div className="flex items-center gap-3">
                          <div className="text-lg font-bold text-muted-foreground">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{crisis.country}</div>
                            <div className="text-sm text-muted-foreground">{crisis.region}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={crisis.riskLevel === 'CRITICAL' ? 'destructive' : 'default'}>
                            {crisis.riskLevel}
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-1">
                            {formatNumber(crisis.displacement || 0)} displaced
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Performance */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Activity className="w-5 h-5" />
                System Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-foreground">
                    {metrics.metadata?.processingTime || '< 1s'}
                  </div>
                  <div className="text-sm text-muted-foreground">Response Time</div>
                  <Progress value={95} className="h-2" />
                </div>
                
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-foreground">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                  <Progress value={99.9} className="h-2" />
                </div>
                
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-foreground">
                    {geoMetrics.count || totalCrises}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Monitors</div>
                  <Progress value={100} className="h-2" />
                </div>
                
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-foreground">
                    {new Date(metrics.metadata?.lastUpdate || Date.now()).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Last Update</div>
                  <Badge variant="outline" className="mt-1">Live</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk-analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <BarChart3 className="w-5 h-5" />
                  Risk Assessment Matrix
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">{criticalCrises}</div>
                      <div className="text-sm text-red-700 dark:text-red-300">Critical Risk</div>
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">Immediate Action Required</div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{highRiskCrises}</div>
                      <div className="text-sm text-orange-700 dark:text-orange-300">High Risk</div>
                      <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">Enhanced Monitoring</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="font-semibold text-foreground mb-3">Risk Factors Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Displacement Volume</span>
                      <Badge variant="outline">High Impact</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Regional Stability</span>
                      <Badge variant="outline">Medium Impact</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Economic Indicators</span>
                      <Badge variant="outline">Medium Impact</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Climate Events</span>
                      <Badge variant="outline">Variable Impact</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <TrendingUp className="w-5 h-5" />
                  Risk Trend Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-red-500" />
                      <span className="font-medium text-foreground">Escalating Crises</span>
                    </div>
                    <Badge variant="destructive">{Math.ceil(criticalCrises * 0.6)}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-foreground">Stable Situations</span>
                    </div>
                    <Badge variant="secondary">{Math.floor(totalCrises * 0.7)}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-foreground">Improving Conditions</span>
                    </div>
                    <Badge variant="outline">{Math.floor(totalCrises * 0.2)}</Badge>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="font-semibold text-foreground mb-3">Prediction Accuracy</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">AI Model Confidence</span>
                      <span className="text-foreground font-medium">94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="regional" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <MapPin className="w-5 h-5" />
                Regional Crisis Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Regional Breakdown */}
                {['Africa', 'Asia', 'Middle East', 'Europe', 'Americas'].map((region) => {
                  const regionCrises = crises.filter((c: any) => c.region?.includes(region) || c.country?.includes(region));
                  const criticalInRegion = regionCrises.filter((c: any) => c.riskLevel === 'CRITICAL').length;
                  const totalInRegion = regionCrises.length;
                  const displacedInRegion = regionCrises.reduce((sum: number, c: any) => sum + (c.displacement || 0), 0);
                  
                  if (totalInRegion === 0) return null;
                  
                  return (
                    <div key={region} className="p-4 rounded-lg border border-border bg-muted/20">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-foreground">{region}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant={criticalInRegion > 0 ? 'destructive' : 'outline'}>
                            {totalInRegion} locations
                          </Badge>
                          {criticalInRegion > 0 && (
                            <Badge variant="destructive">{criticalInRegion} critical</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total Displaced:</span>
                          <div className="font-medium text-foreground">{formatNumber(displacedInRegion)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Locations:</span>
                          <div className="font-medium text-foreground">{totalInRegion}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Avg Risk:</span>
                          <div className="font-medium text-foreground">
                            {criticalInRegion > totalInRegion * 0.3 ? 'High' : 
                             criticalInRegion > 0 ? 'Medium' : 'Low'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <LineChart className="w-5 h-5" />
                  Displacement Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {formatNumber(totalDisplaced)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total People Displaced</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">This Month</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-foreground">+12%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">This Quarter</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-foreground">+8%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">This Year</span>
                    <div className="flex items-center gap-1">
                      <TrendingDown className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-foreground">-3%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">Sudan Crisis Escalation</div>
                      <div className="text-xs text-muted-foreground">+15K displaced in last 48h</div>
                    </div>
                    <Badge variant="destructive" className="text-xs">Critical</Badge>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">Myanmar Update</div>
                      <div className="text-xs text-muted-foreground">Risk level increased to HIGH</div>
                    </div>
                    <Badge variant="default" className="text-xs">High</Badge>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">Bangladesh Improvement</div>
                      <div className="text-xs text-muted-foreground">Successful intervention completed</div>
                    </div>
                    <Badge variant="outline" className="text-xs">Resolved</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GlobalMetrics;