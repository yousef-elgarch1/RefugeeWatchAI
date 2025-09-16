// src/pages/CrisisMap.tsx - Updated with Real Multi-Category Crisis Data
/**
 * Enhanced Crisis Map Page with Real Multi-Category Data
 * Shows all crisis types: conflicts, earthquakes, climate, natural disasters, economic
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, AlertTriangle, Users, Activity, RefreshCw, Filter, Globe, TrendingUp, 
  Clock, Satellite, Zap, Brain, Layers, BarChart3, Info
} from 'lucide-react';

// Import the comprehensive real crisis map
import RealCrisisMap from '@/components/RealCrisisMap';
import { CrisisMarker } from '@/services/comprehensiveApiService';

const CrisisMap = () => {
  const [selectedCrisis, setSelectedCrisis] = useState<CrisisMarker | null>(null);

  const handleCrisisSelect = (crisis: CrisisMarker) => {
    setSelectedCrisis(crisis);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Zap className="w-8 h-8 text-blue-500" />
            Comprehensive Crisis Monitoring
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time tracking of all crisis types: conflicts, earthquakes, climate events, natural disasters, and economic crises
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Multi-Source Integration
          </Badge>
          <Badge variant="default" className="flex items-center gap-2">
            <Satellite className="w-4 h-4" />
            Real-time APIs
          </Badge>
        </div>
      </div>

      {/* Enhanced API Integration Notice */}
      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          <strong>Comprehensive Real-time Mode:</strong> This system fetches data directly from multiple authoritative sources:
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-sm">
            <div>• <strong>UNHCR API</strong> - Refugee data</div>
            <div>• <strong>USGS</strong> - Earthquake monitoring</div>
            <div>• <strong>NASA EONET</strong> - Natural disasters</div>
            <div>• <strong>World Bank</strong> - Economic indicators</div>
            <div>• <strong>NewsAPI</strong> - Crisis news</div>
            <div>• <strong>Guardian API</strong> - Quality journalism</div>
          </div>
          <div className="mt-2 text-sm">
            All data is fetched directly without backend processing delays. News integration included in markers and dedicated sections.
          </div>
        </AlertDescription>
      </Alert>

      {/* Crisis Categories Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Crisis Categories Monitored
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <div className="text-2xl">⚔️</div>
              <div>
                <div className="font-semibold text-red-700">Conflicts</div>
                <div className="text-sm text-red-600">Wars, civil unrest, refugee crises</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl">🌋</div>
              <div>
                <div className="font-semibold text-orange-700">Earthquakes</div>
                <div className="text-sm text-orange-600">Seismic activity, aftershocks</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl">🌡️</div>
              <div>
                <div className="font-semibold text-yellow-700">Climate</div>
                <div className="text-sm text-yellow-600">Droughts, extreme weather</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl">🌪️</div>
              <div>
                <div className="font-semibold text-purple-700">Natural</div>
                <div className="text-sm text-purple-600">Hurricanes, floods, wildfires</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl">💰</div>
              <div>
                <div className="font-semibold text-blue-700">Economic</div>
                <div className="text-sm text-blue-600">Financial instability, poverty</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Crisis Map Component */}
      <RealCrisisMap 
        className="w-full"
        onCrisisSelect={handleCrisisSelect}
      />

      {/* Selected Crisis Detailed Analysis */}
      {selectedCrisis && (
        <Card className="border-l-4" style={{ borderLeftColor: selectedCrisis.crisisType === 'conflict' ? '#dc2626' : 
                                                               selectedCrisis.crisisType === 'earthquake' ? '#ea580c' :
                                                               selectedCrisis.crisisType === 'climate' ? '#f59e0b' :
                                                               selectedCrisis.crisisType === 'natural' ? '#8b5cf6' :
                                                               '#06b6d4' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              {selectedCrisis.name} - Detailed Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Crisis Overview</TabsTrigger>
                <TabsTrigger value="data">Data & Statistics</TabsTrigger>
                <TabsTrigger value="news">Related News</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Crisis Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Country:</strong> {selectedCrisis.country}</div>
                      <div><strong>Region:</strong> {selectedCrisis.region}</div>
                      <div><strong>Type:</strong> 
                        <Badge className="ml-2" variant="outline">
                          {selectedCrisis.crisisType.toUpperCase()}
                        </Badge>
                      </div>
                      <div><strong>Risk Level:</strong> 
                        <Badge 
                          className="ml-2" 
                          variant={selectedCrisis.riskLevel === 'CRITICAL' ? 'destructive' : 'secondary'}
                        >
                          {selectedCrisis.riskLevel}
                        </Badge>
                      </div>
                      <div><strong>Confidence Level:</strong> {selectedCrisis.confidence}%</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Impact Assessment</h4>
                    <div className="space-y-2 text-sm">
                      {selectedCrisis.displacement && (
                        <div><strong>Displaced People:</strong> {selectedCrisis.displacement.toLocaleString()}</div>
                      )}
                      {selectedCrisis.affectedPopulation && (
                        <div><strong>Affected Population:</strong> {selectedCrisis.affectedPopulation.toLocaleString()}</div>
                      )}
                      {selectedCrisis.magnitude && (
                        <div><strong>Magnitude:</strong> {selectedCrisis.magnitude}</div>
                      )}
                      {selectedCrisis.severity && (
                        <div><strong>Severity:</strong> {selectedCrisis.severity}</div>
                      )}
                      <div><strong>Last Updated:</strong> {new Date(selectedCrisis.lastUpdated).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Description</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedCrisis.description}
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="data" className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedCrisis.coordinates[0].toFixed(3)}°
                      </div>
                      <div className="text-sm text-gray-600">Latitude</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedCrisis.coordinates[1].toFixed(3)}°
                      </div>
                      <div className="text-sm text-gray-600">Longitude</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedCrisis.confidence}%
                      </div>
                      <div className="text-sm text-gray-600">Data Confidence</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedCrisis.sources.length}
                      </div>
                      <div className="text-sm text-gray-600">Data Sources</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Data Sources</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCrisis.sources.map((source, index) => (
                      <Badge key={index} variant="outline">{source}</Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="news" className="mt-4">
                {selectedCrisis.news && selectedCrisis.news.length > 0 ? (
                  <div className="space-y-4">
                    {selectedCrisis.news.map((newsItem, idx) => (
                      <Card key={idx}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {newsItem.imageUrl && (
                              <img 
                                src={newsItem.imageUrl} 
                                alt={newsItem.title}
                                className="w-24 h-16 object-cover rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <div className="flex-1">
                              <a 
                                href={newsItem.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 block mb-2"
                              >
                                {newsItem.title}
                              </a>
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                {newsItem.description}
                              </p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{newsItem.source}</span>
                                <span>{new Date(newsItem.publishedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-600 mb-2">No Related News</h3>
                    <p className="text-gray-500 text-sm">
                      No specific news articles found for this crisis location.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Data Sources & API Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Real-time Data Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">API Endpoints (No Token Required)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span><strong>UNHCR API:</strong> api.unhcr.org/rsq/v1/demographics</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span><strong>USGS:</strong> earthquake.usgs.gov/earthquakes/feed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span><strong>NASA EONET:</strong> eonet.gsfc.nasa.gov/api/v3/events</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span><strong>World Bank:</strong> api.worldbank.org/v2/country</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span><strong>REST Countries:</strong> restcountries.com/v3.1/all</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">API Endpoints (Token Required)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span><strong>NewsAPI:</strong> newsapi.org (VITE_NEWS_API_KEY)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span><strong>Guardian:</strong> content.guardianapis.com (VITE_GUARDIAN_API_KEY)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span><strong>OpenWeather:</strong> openweathermap.org (Optional)</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Add your API keys to .env.local for enhanced features. 
                  The system works with free APIs even without tokens.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrisisMap;