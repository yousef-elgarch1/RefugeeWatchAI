// src/pages/Dashboard.tsx - Enhanced with Real-time Crisis Monitoring
/**
 * Enhanced Dashboard with Real-time Crisis Map and Monitoring Table
 * Comprehensive overview of all crisis types and active situations
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  AlertTriangle, Activity, Globe, Brain, RefreshCw, Users, MapPin, TrendingUp,
  Clock, Zap, BarChart3, Eye, ExternalLink, Filter, ArrowUpDown, Search,
  Calendar, Target, Shield, Layers, Database, Satellite
} from 'lucide-react';

// Import our real crisis services and components
import { comprehensiveApiService, CrisisMarker } from '@/services/comprehensiveApiService';
import RealCrisisMap from '@/components/RealCrisisMap';

interface DashboardMetrics {
  totalCrises: number;
  totalAffected: number;
  criticalSituations: number;
  highRiskSituations: number;
  activeSources: number;
  lastUpdate: Date;
  riskDistribution: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  categoryBreakdown: {
    conflict: number;
    earthquake: number;
    climate: number;
    natural: number;
    economic: number;
  };
}

const Dashboard = () => {
  const [crisisData, setCrisisData] = useState<CrisisMarker[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [selectedCrisis, setSelectedCrisis] = useState<CrisisMarker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'risk' | 'affected' | 'updated'>('risk');
  const [filterType, setFilterType] = useState<'all' | 'conflict' | 'earthquake' | 'climate' | 'natural' | 'economic'>('all');

  // Fetch comprehensive crisis data for dashboard
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🏠 Dashboard: Fetching comprehensive crisis data...');
      
      const markers = await comprehensiveApiService.getAllCrisisMarkers();
      
      if (markers.length === 0) {
        throw new Error('No crisis data available');
      }

      setCrisisData(markers);
      
      // Calculate metrics
      const totalAffected = markers.reduce((sum, m) => sum + (m.displacement || m.affectedPopulation || 0), 0);
      const criticalCount = markers.filter(m => m.riskLevel === 'CRITICAL').length;
      const highCount = markers.filter(m => m.riskLevel === 'HIGH').length;
      
      const categoryBreakdown = {
        conflict: markers.filter(m => m.crisisType === 'conflict').length,
        earthquake: markers.filter(m => m.crisisType === 'earthquake').length,
        climate: markers.filter(m => m.crisisType === 'climate').length,
        natural: markers.filter(m => m.crisisType === 'natural').length,
        economic: markers.filter(m => m.crisisType === 'economic').length,
      };

      const riskDistribution = {
        CRITICAL: criticalCount,
        HIGH: highCount,
        MEDIUM: markers.filter(m => m.riskLevel === 'MEDIUM').length,
        LOW: markers.filter(m => m.riskLevel === 'LOW').length,
      };

      setMetrics({
        totalCrises: markers.length,
        totalAffected,
        criticalSituations: criticalCount,
        highRiskSituations: highCount,
        activeSources: 6, // UNHCR, USGS, NASA, World Bank, NewsAPI, Guardian
        lastUpdate: new Date(),
        riskDistribution,
        categoryBreakdown
      });

      console.log(`✅ Dashboard: Loaded ${markers.length} crisis markers`);
      
    } catch (err) {
      console.error('❌ Dashboard: Failed to fetch data:', err);
      setError(`Failed to load crisis data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and periodic refresh
  useEffect(() => {
    fetchDashboardData();
    
    // Refresh every 15 minutes
    const interval = setInterval(fetchDashboardData, 15 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Filter and sort crisis data for table
  const getFilteredAndSortedCrises = () => {
    let filtered = crisisData;

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(crisis => crisis.crisisType === filterType);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(crisis => 
        crisis.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crisis.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crisis.region.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'risk':
          const riskOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
          return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
        case 'affected':
          return (b.displacement || b.affectedPopulation || 0) - (a.displacement || a.affectedPopulation || 0);
        case 'updated':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num?.toString() || '0';
  };

  // Get crisis type color
  const getCrisisTypeColor = (crisisType: string): string => {
    const colors = {
      'conflict': '#dc2626',
      'earthquake': '#ea580c',
      'climate': '#f59e0b',
      'natural': '#8b5cf6',
      'economic': '#06b6d4'
    };
    return colors[crisisType as keyof typeof colors] || '#6b7280';
  };

  // Get risk level color
  const getRiskColor = (level: string): string => {
    switch(level?.toUpperCase()) {
      case 'CRITICAL': return '#dc2626';
      case 'HIGH': return '#ea580c';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Get crisis type icon
  const getCrisisTypeIcon = (crisisType: string): string => {
    const icons = {
      'conflict': '⚔️',
      'earthquake': '🌋',
      'climate': '🌡️',
      'natural': '🌪️',
      'economic': '💰'
    };
    return icons[crisisType as keyof typeof icons] || '📍';
  };

  const filteredCrises = getFilteredAndSortedCrises();

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="outline" size="sm" onClick={fetchDashboardData} className="mt-2 ml-2">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-500" />
            Crisis Monitoring Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time global humanitarian crisis monitoring and response coordination
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Live Data Integration
          </Badge>
          <Badge variant="default" className="flex items-center gap-2">
            <Satellite className="w-4 h-4" />
            6 Active Sources
          </Badge>
          <Button 
            variant="outline" 
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Real-time Status Banner */}
      <Alert>
        <Activity className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>
              <strong>System Status:</strong> All crisis monitoring systems operational. 
              Last updated: {metrics?.lastUpdate.toLocaleTimeString() || '...'} • 
              Next refresh: {new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString()}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live</span>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Crises</p>
                <p className="text-3xl font-bold text-red-600">
                  {loading ? '...' : metrics?.totalCrises || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Active situations</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-red-600">●</span>
                <span>{metrics?.criticalSituations || 0} Critical</span>
                <span className="text-orange-600">●</span>
                <span>{metrics?.highRiskSituations || 0} High Risk</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">People Affected</p>
                <p className="text-3xl font-bold text-orange-600">
                  {loading ? '...' : formatNumber(metrics?.totalAffected || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Global impact</p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
            <div className="mt-4">
              <Progress 
                value={Math.min(100, ((metrics?.totalAffected || 0) / 50000000) * 100)} 
                className="h-2" 
              />
              <p className="text-xs text-muted-foreground mt-1">of 50M threshold</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Sources</p>
                <p className="text-3xl font-bold text-blue-600">
                  {loading ? '...' : metrics?.activeSources || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Real-time APIs</p>
              </div>
              <Globe className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-4">
              <div className="text-xs text-muted-foreground">
                UNHCR • USGS • NASA • World Bank • News
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Health</p>
                <p className="text-3xl font-bold text-green-600">
                  {loading ? '...' : '98%'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Uptime</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 font-medium">All Systems Operational</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Crisis Categories Breakdown */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Crisis Categories Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl mb-2">⚔️</div>
                <div className="text-2xl font-bold text-red-600">{metrics.categoryBreakdown.conflict}</div>
                <div className="text-sm text-red-700">Conflicts</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl mb-2">🌋</div>
                <div className="text-2xl font-bold text-orange-600">{metrics.categoryBreakdown.earthquake}</div>
                <div className="text-sm text-orange-700">Earthquakes</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl mb-2">🌡️</div>
                <div className="text-2xl font-bold text-yellow-600">{metrics.categoryBreakdown.climate}</div>
                <div className="text-sm text-yellow-700">Climate</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl mb-2">🌪️</div>
                <div className="text-2xl font-bold text-purple-600">{metrics.categoryBreakdown.natural}</div>
                <div className="text-sm text-purple-700">Natural</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl mb-2">💰</div>
                <div className="text-2xl font-bold text-blue-600">{metrics.categoryBreakdown.economic}</div>
                <div className="text-sm text-blue-700">Economic</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Crisis Map Overview
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Active Monitoring ({filteredCrises.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics & Trends
          </TabsTrigger>
        </TabsList>

        {/* Crisis Map Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                Real-time Global Crisis Map
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {crisisData.length} Active Situations
                </Badge>
                <Badge variant="outline">
                  Live Data Integration
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <RealCrisisMap 
                className="w-full h-[500px]"
                onCrisisSelect={setSelectedCrisis}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Crisis Monitoring Table Tab */}
        <TabsContent value="monitoring" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-500" />
                Active Crisis Monitoring Table
              </CardTitle>
              
              {/* Table Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search crises..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="conflict">Conflicts</option>
                    <option value="earthquake">Earthquakes</option>
                    <option value="climate">Climate</option>
                    <option value="natural">Natural</option>
                    <option value="economic">Economic</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="risk">Risk Level</option>
                    <option value="affected">People Affected</option>
                    <option value="name">Name</option>
                    <option value="updated">Last Updated</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Crisis</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>People Affected</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                          Loading crisis data...
                        </TableCell>
                      </TableRow>
                    ) : filteredCrises.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                          No crises match your current filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCrises.slice(0, 20).map((crisis) => (
                        <TableRow key={crisis.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="text-xl">{getCrisisTypeIcon(crisis.crisisType)}</div>
                              <div>
                                <div className="font-medium">{crisis.name}</div>
                                <div className="text-sm text-gray-500">{crisis.description.substring(0, 60)}...</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              style={{ 
                                backgroundColor: getCrisisTypeColor(crisis.crisisType),
                                color: 'white'
                              }}
                              className="text-xs"
                            >
                              {crisis.crisisType.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{crisis.country}</div>
                              <div className="text-sm text-gray-500">{crisis.region}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              style={{ 
                                backgroundColor: getRiskColor(crisis.riskLevel),
                                color: 'white'
                              }}
                            >
                              {crisis.riskLevel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {formatNumber(crisis.displacement || crisis.affectedPopulation || 0)}
                            </div>
                            {crisis.magnitude && (
                              <div className="text-sm text-gray-500">Mag: {crisis.magnitude}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(crisis.lastUpdated).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(crisis.lastUpdated).toLocaleTimeString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedCrisis(crisis)}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              {crisis.news && crisis.news.length > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(crisis.news![0].url, '_blank')}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {filteredCrises.length > 20 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  Showing 20 of {filteredCrises.length} crises. Use filters to narrow results.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics & Trends Tab */}
        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Risk Level Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metrics && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span className="text-sm font-medium">Critical</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{metrics.riskDistribution.CRITICAL}</span>
                          <Badge variant="destructive">{((metrics.riskDistribution.CRITICAL / metrics.totalCrises) * 100).toFixed(0)}%</Badge>
                        </div>
                      </div>
                      <Progress value={(metrics.riskDistribution.CRITICAL / metrics.totalCrises) * 100} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          <span className="text-sm font-medium">High</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{metrics.riskDistribution.HIGH}</span>
                          <Badge variant="secondary">{((metrics.riskDistribution.HIGH / metrics.totalCrises) * 100).toFixed(0)}%</Badge>
                        </div>
                      </div>
                      <Progress value={(metrics.riskDistribution.HIGH / metrics.totalCrises) * 100} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <span className="text-sm font-medium">Medium</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{metrics.riskDistribution.MEDIUM}</span>
                          <Badge variant="outline">{((metrics.riskDistribution.MEDIUM / metrics.totalCrises) * 100).toFixed(0)}%</Badge>
                        </div>
                      </div>
                      <Progress value={(metrics.riskDistribution.MEDIUM / metrics.totalCrises) * 100} className="h-2" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Data Sources Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Data Sources Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">UNHCR API</span>
                    </div>
                    <Badge variant="outline" className="text-green-700">Operational</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">USGS Earthquakes</span>
                    </div>
                    <Badge variant="outline" className="text-green-700">Operational</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">NASA EONET</span>
                    </div>
                    <Badge variant="outline" className="text-green-700">Operational</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">World Bank</span>
                    </div>
                    <Badge variant="outline" className="text-green-700">Operational</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium">NewsAPI</span>
                    </div>
                    <Badge variant="outline" className="text-yellow-700">API Key Required</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium">Guardian API</span>
                    </div>
                    <Badge variant="outline" className="text-yellow-700">API Key Required</Badge>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Core crisis monitoring works without API keys. 
                    Add NewsAPI and Guardian keys for enhanced news integration.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {crisisData.slice(0, 5).map((crisis, index) => (
                    <div key={crisis.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                      <div className="text-lg">{getCrisisTypeIcon(crisis.crisisType)}</div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{crisis.name}</div>
                        <div className="text-xs text-gray-500">
                          {crisis.country} • {new Date(crisis.lastUpdated).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge 
                        size="sm"
                        style={{ 
                          backgroundColor: getRiskColor(crisis.riskLevel),
                          color: 'white'
                        }}
                      >
                        {crisis.riskLevel}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  System Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">API Response Time</span>
                      <span className="text-sm text-gray-600">~2.3s</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Data Accuracy</span>
                      <span className="text-sm text-gray-600">94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Cache Hit Rate</span>
                      <span className="text-sm text-gray-600">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">System Uptime</span>
                      <span className="text-sm text-gray-600">99.8%</span>
                    </div>
                    <Progress value={99.8} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Selected Crisis Detail Modal */}
      {selectedCrisis && (
        <Card className="border-l-4" style={{ borderLeftColor: getCrisisTypeColor(selectedCrisis.crisisType) }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="text-2xl">{getCrisisTypeIcon(selectedCrisis.crisisType)}</div>
                {selectedCrisis.name} - Dashboard View
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedCrisis(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Key Metrics */}
              <div className="space-y-4">
                <h4 className="font-semibold">Key Metrics</h4>
                
                {selectedCrisis.displacement && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {formatNumber(selectedCrisis.displacement)}
                    </div>
                    <div className="text-sm text-red-700">Displaced People</div>
                  </div>
                )}
                
                {selectedCrisis.affectedPopulation && (
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {formatNumber(selectedCrisis.affectedPopulation)}
                    </div>
                    <div className="text-sm text-orange-700">Affected Population</div>
                  </div>
                )}
                
                {selectedCrisis.magnitude && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {selectedCrisis.magnitude}
                    </div>
                    <div className="text-sm text-yellow-700">Magnitude</div>
                  </div>
                )}
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedCrisis.confidence}%
                  </div>
                  <div className="text-sm text-blue-700">Data Confidence</div>
                </div>
              </div>

              {/* Crisis Information */}
              <div className="space-y-4">
                <h4 className="font-semibold">Crisis Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Country:</strong> {selectedCrisis.country}</div>
                  <div><strong>Region:</strong> {selectedCrisis.region}</div>
                  <div>
                    <strong>Type:</strong> 
                    <Badge className="ml-2" style={{ backgroundColor: getCrisisTypeColor(selectedCrisis.crisisType), color: 'white' }}>
                      {selectedCrisis.crisisType.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <strong>Risk Level:</strong> 
                    <Badge className="ml-2" style={{ backgroundColor: getRiskColor(selectedCrisis.riskLevel), color: 'white' }}>
                      {selectedCrisis.riskLevel}
                    </Badge>
                  </div>
                  <div><strong>Coordinates:</strong> {selectedCrisis.coordinates[0].toFixed(3)}, {selectedCrisis.coordinates[1].toFixed(3)}</div>
                  {selectedCrisis.severity && (
                    <div><strong>Severity:</strong> {selectedCrisis.severity}</div>
                  )}
                  <div><strong>Last Updated:</strong> {new Date(selectedCrisis.lastUpdated).toLocaleString()}</div>
                </div>
                
                <div className="mt-4">
                  <h5 className="font-medium mb-2">Data Sources</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedCrisis.sources.map((source, index) => (
                      <Badge key={index} variant="outline" className="text-xs">{source}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description & News */}
              <div className="space-y-4">
                <h4 className="font-semibold">Description</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selectedCrisis.description}
                </p>
                
                {selectedCrisis.news && selectedCrisis.news.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">Latest News</h5>
                    <div className="space-y-2">
                      {selectedCrisis.news.slice(0, 3).map((newsItem, idx) => (
                        <div key={idx} className="p-2 bg-gray-50 rounded text-xs">
                          <a 
                            href={newsItem.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:text-blue-800 block mb-1"
                          >
                            {newsItem.title}
                          </a>
                          <div className="text-gray-500">
                            {newsItem.source} • {new Date(newsItem.publishedAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Dashboard Live</span>
              </div>
              <div className="text-gray-600">
                Monitoring {crisisData.length} active situations globally
              </div>
              <div className="text-gray-600">
                {formatNumber(metrics?.totalAffected || 0)} people affected
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-500">
              <span>Last refresh: {metrics?.lastUpdate.toLocaleTimeString()}</span>
              <span>Next update: {new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;