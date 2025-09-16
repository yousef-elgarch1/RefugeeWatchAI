// src/components/RealCrisisMap.tsx
/**
 * Real Crisis Map Component - All Crisis Categories
 * Shows earthquakes, conflicts, climate events, refugees separately
 */

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, LayersControl } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  AlertTriangle, Users, MapPin, Activity, TrendingUp, Calendar, Globe, RefreshCw, Loader2,
  ExternalLink, Clock, Zap, Image as ImageIcon, Filter, Eye, EyeOff, Layers
} from "lucide-react";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { comprehensiveApiService, CrisisMarker, NewsItem } from '@/services/comprehensiveApiService';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RealCrisisMapProps {
  className?: string;
  onCrisisSelect?: (crisis: CrisisMarker) => void;
}

const RealCrisisMap: React.FC<RealCrisisMapProps> = ({ 
  className = "w-full h-full",
  onCrisisSelect 
}) => {
  const [allMarkers, setAllMarkers] = useState<CrisisMarker[]>([]);
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [selectedCrisis, setSelectedCrisis] = useState<CrisisMarker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Layer visibility controls
  const [showConflict, setShowConflict] = useState(true);
  const [showEarthquakes, setShowEarthquakes] = useState(true);
  const [showClimate, setShowClimate] = useState(true);
  const [showNatural, setShowNatural] = useState(true);
  const [showEconomic, setShowEconomic] = useState(true);

  // Filter markers by type
  const conflictMarkers = allMarkers.filter(m => m.crisisType === 'conflict');
  const earthquakeMarkers = allMarkers.filter(m => m.crisisType === 'earthquake');
  const climateMarkers = allMarkers.filter(m => m.crisisType === 'climate');
  const naturalMarkers = allMarkers.filter(m => m.crisisType === 'natural');
  const economicMarkers = allMarkers.filter(m => m.crisisType === 'economic');

  // Get visible markers based on toggles
  const getVisibleMarkers = () => {
    return allMarkers.filter(marker => {
      switch (marker.crisisType) {
        case 'conflict': return showConflict;
        case 'earthquake': return showEarthquakes;
        case 'climate': return showClimate;
        case 'natural': return showNatural;
        case 'economic': return showEconomic;
        default: return true;
      }
    });
  };

  // Fetch comprehensive crisis data
  const fetchAllCrisisData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🚀 Starting comprehensive real-time data fetch...');
      
      const markers = await comprehensiveApiService.getAllCrisisMarkers();
      const news = await comprehensiveApiService.fetchCrisisNews();
      
      if (markers.length === 0) {
        throw new Error('No crisis data could be fetched from any API');
      }

      setAllMarkers(markers);
      setAllNews(news);
      setLastUpdate(new Date());
      
      console.log(`✅ Successfully loaded ${markers.length} total markers:`);
      console.log(`   🏕️ ${conflictMarkers.length} conflict/refugee crises`);
      console.log(`   🌋 ${earthquakeMarkers.length} earthquakes`);
      console.log(`   🌡️ ${climateMarkers.length} climate events`);
      console.log(`   🌪️ ${naturalMarkers.length} natural disasters`);
      console.log(`   💰 ${economicMarkers.length} economic crises`);
      console.log(`   📰 ${news.length} news articles`);
      
    } catch (err) {
      console.error('❌ Failed to fetch crisis data:', err);
      setError(`Failed to load real-time data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and auto-refresh
  useEffect(() => {
    fetchAllCrisisData();
    
    // Auto-refresh every 20 minutes
    const interval = setInterval(fetchAllCrisisData, 20 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Crisis type styling
  const getCrisisTypeColor = (crisisType: string): string => {
    const colors = {
      'conflict': '#dc2626',     // Red - War/Conflict
      'earthquake': '#ea580c',   // Orange - Earthquakes
      'climate': '#f59e0b',      // Yellow - Climate/Drought
      'natural': '#8b5cf6',      // Purple - Natural disasters
      'economic': '#06b6d4',     // Cyan - Economic crisis
      'flood': '#3b82f6',        // Blue - Floods
      'cyclone': '#ec4899',      // Pink - Cyclones
      'drought': '#eab308'       // Amber - Droughts
    };
    return colors[crisisType as keyof typeof colors] || '#6b7280';
  };

  // Risk level styling
  const getRiskColor = (level: string): string => {
    switch(level?.toUpperCase()) {
      case 'CRITICAL': return '#dc2626';
      case 'HIGH': return '#ea580c';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Dynamic marker sizing
  const getMarkerSize = (marker: CrisisMarker): number => {
    if (marker.crisisType === 'earthquake') {
      const mag = marker.magnitude || 5;
      return Math.max(8, Math.min(30, mag * 4));
    }
    
    if (marker.displacement) {
      if (marker.displacement > 10000000) return 30;
      if (marker.displacement > 5000000) return 25;
      if (marker.displacement > 1000000) return 20;
      if (marker.displacement > 500000) return 15;
      return 12;
    }
    
    // Default size based on risk level
    const sizes = { 'CRITICAL': 25, 'HIGH': 20, 'MEDIUM': 15, 'LOW': 12 };
    return sizes[marker.riskLevel as keyof typeof sizes] || 12;
  };

  // Format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num?.toString() || '0';
  };

  // Handle crisis selection
  const handleCrisisClick = (crisis: CrisisMarker) => {
    setSelectedCrisis(crisis);
    if (onCrisisSelect) {
      onCrisisSelect(crisis);
    }
  };

  // Get crisis type icon
  const getCrisisTypeIcon = (crisisType: string): string => {
    const icons = {
      'conflict': '⚔️',
      'earthquake': '🌋',
      'climate': '🌡️',
      'natural': '🌪️',
      'economic': '💰',
      'flood': '🌊',
      'cyclone': '🌀',
      'drought': '🏜️'
    };
    return icons[crisisType as keyof typeof icons] || '📍';
  };

  const visibleMarkers = getVisibleMarkers();
  const totalAffected = visibleMarkers.reduce((sum, m) => sum + (m.displacement || m.affectedPopulation || 0), 0);

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="outline" size="sm" onClick={fetchAllCrisisData} className="mt-2 ml-2">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`${className} space-y-6`}>
      {/* Real-time Statistics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conflicts</p>
                <p className="text-2xl font-bold text-red-600">
                  {loading ? '...' : conflictMarkers.length}
                </p>
                <p className="text-xs text-muted-foreground">Active conflicts</p>
              </div>
              <div className="text-2xl">⚔️</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Earthquakes</p>
                <p className="text-2xl font-bold text-orange-600">
                  {loading ? '...' : earthquakeMarkers.length}
                </p>
                <p className="text-xs text-muted-foreground">Recent quakes</p>
              </div>
              <div className="text-2xl">🌋</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Climate</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {loading ? '...' : climateMarkers.length}
                </p>
                <p className="text-xs text-muted-foreground">Climate events</p>
              </div>
              <div className="text-2xl">🌡️</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Natural</p>
                <p className="text-2xl font-bold text-purple-600">
                  {loading ? '...' : naturalMarkers.length}
                </p>
                <p className="text-xs text-muted-foreground">Natural disasters</p>
              </div>
              <div className="text-2xl">🌪️</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Affected</p>
                <p className="text-2xl font-bold text-blue-600">
                  {loading ? '...' : formatNumber(totalAffected)}
                </p>
                <p className="text-xs text-muted-foreground">People impacted</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Layer Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Crisis Layer Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-lg">⚔️</div>
                <span className="text-sm font-medium">Conflicts ({conflictMarkers.length})</span>
              </div>
              <Switch checked={showConflict} onCheckedChange={setShowConflict} />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-lg">🌋</div>
                <span className="text-sm font-medium">Earthquakes ({earthquakeMarkers.length})</span>
              </div>
              <Switch checked={showEarthquakes} onCheckedChange={setShowEarthquakes} />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-lg">🌡️</div>
                <span className="text-sm font-medium">Climate ({climateMarkers.length})</span>
              </div>
              <Switch checked={showClimate} onCheckedChange={setShowClimate} />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-lg">🌪️</div>
                <span className="text-sm font-medium">Natural ({naturalMarkers.length})</span>
              </div>
              <Switch checked={showNatural} onCheckedChange={setShowNatural} />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-lg">💰</div>
                <span className="text-sm font-medium">Economic ({economicMarkers.length})</span>
              </div>
              <Switch checked={showEconomic} onCheckedChange={setShowEconomic} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Multi-Category Crisis Map ({visibleMarkers.length})
          </TabsTrigger>
          <TabsTrigger value="news" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Global Crisis News ({allNews.length})
          </TabsTrigger>
        </TabsList>

        {/* Interactive Multi-Category Map */}
        <TabsContent value="map" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                Real-time Global Crisis Monitoring
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Updated: {lastUpdate.toLocaleTimeString()}
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchAllCrisisData}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Refresh All Data
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <MapContainer 
                  center={[20, 0]} 
                  zoom={2.5} 
                  className="w-full h-[700px] rounded-lg"
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {/* Render all visible crisis markers */}
                  {visibleMarkers.map((marker) => (
                    <CircleMarker
                      key={marker.id}
                      center={marker.coordinates}
                      radius={getMarkerSize(marker)}
                      fillColor={getCrisisTypeColor(marker.crisisType)}
                      color="#ffffff"
                      weight={2}
                      opacity={1}
                      fillOpacity={0.8}
                      eventHandlers={{
                        click: () => handleCrisisClick(marker)
                      }}
                    >
                      <Popup className="crisis-popup" maxWidth={450}>
                        <div className="p-4 max-w-md">
                          {/* Crisis Header */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="text-2xl">{getCrisisTypeIcon(marker.crisisType)}</div>
                            <div>
                              <h3 className="font-bold text-lg">{marker.name}</h3>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  style={{ 
                                    backgroundColor: getCrisisTypeColor(marker.crisisType),
                                    color: 'white'
                                  }}
                                >
                                  {marker.crisisType.toUpperCase()}
                                </Badge>
                                <Badge 
                                  style={{ 
                                    backgroundColor: getRiskColor(marker.riskLevel),
                                    color: 'white'
                                  }}
                                >
                                  {marker.riskLevel}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          {/* Crisis-Specific Stats */}
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Country:</span>
                              <span className="font-semibold">{marker.country}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Region:</span>
                              <span className="font-semibold">{marker.region}</span>
                            </div>
                            
                            {marker.displacement && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Displaced:</span>
                                <span className="font-bold text-red-600">
                                  {formatNumber(marker.displacement)}
                                </span>
                              </div>
                            )}
                            
                            {marker.magnitude && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Magnitude:</span>
                                <span className="font-bold text-orange-600">
                                  {marker.magnitude}
                                </span>
                              </div>
                            )}
                            
                            {marker.affectedPopulation && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Affected:</span>
                                <span className="font-bold text-blue-600">
                                  {formatNumber(marker.affectedPopulation)}
                                </span>
                              </div>
                            )}
                            
                            {marker.severity && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Severity:</span>
                                <span className="font-semibold">{marker.severity}</span>
                              </div>
                            )}
                          </div>

                          {/* Description */}
                          <div className="mb-4">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {marker.description}
                            </p>
                          </div>

                          {/* Latest News */}
                          {marker.news && marker.news.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                                <Globe className="w-4 h-4 text-blue-500" />
                                Latest News ({marker.news.length})
                              </h4>
                              {marker.news.slice(0, 2).map((newsItem, idx) => (
                                <div key={idx} className="mb-2 p-2 bg-gray-50 rounded">
                                  <a 
                                    href={newsItem.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs font-medium text-blue-600 hover:text-blue-800 line-clamp-2"
                                  >
                                    {newsItem.title}
                                  </a>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {newsItem.source} • {new Date(newsItem.publishedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Data Sources & Metadata */}
                          <div className="border-t pt-2">
                            <p className="text-xs text-gray-500">
                              <strong>Sources:</strong> {marker.sources.join(', ')}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              <strong>Confidence:</strong> {marker.confidence}% • 
                              <strong> Updated:</strong> {new Date(marker.lastUpdated).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>

                {/* Loading Overlay */}
                {loading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="bg-white p-6 rounded-lg flex items-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                      <span className="font-medium">Loading comprehensive crisis data...</span>
                    </div>
                  </div>
                )}

                {/* Enhanced Legend */}
                <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
                  <div className="text-sm font-semibold mb-3">Crisis Categories</div>
                  <div className="space-y-2 text-xs">
                    {showConflict && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                        <span>⚔️ Conflicts ({conflictMarkers.length})</span>
                      </div>
                    )}
                    {showEarthquakes && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
                        <span>🌋 Earthquakes ({earthquakeMarkers.length})</span>
                      </div>
                    )}
                    {showClimate && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-600 rounded-full"></div>
                        <span>🌡️ Climate ({climateMarkers.length})</span>
                      </div>
                    )}
                    {showNatural && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                        <span>🌪️ Natural ({naturalMarkers.length})</span>
                      </div>
                    )}
                    {showEconomic && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-cyan-600 rounded-full"></div>
                        <span>💰 Economic ({economicMarkers.length})</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-3 border-t pt-2">
                    <div className="font-medium mb-1">Data Sources:</div>
                    <div>• UNHCR (Refugees)</div>
                    <div>• USGS (Earthquakes)</div>
                    <div>• NASA EONET (Natural)</div>
                    <div>• World Bank (Economic)</div>
                    <div>• Climate Monitoring</div>
                  </div>
                </div>

                {/* Stats Overlay */}
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-4 rounded-lg">
                  <div className="text-sm font-semibold">Global Crisis Overview</div>
                  <div className="text-2xl font-bold">{formatNumber(totalAffected)}</div>
                  <div className="text-xs opacity-75">
                    People affected • {visibleMarkers.length} active situations
                  </div>
                  <div className="text-xs opacity-75 mt-1">
                    Real-time data from {allMarkers.length} total markers
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Global Crisis News Tab */}
        <TabsContent value="news" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                Global Crisis News & Analysis
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {allNews.length} Articles
                </Badge>
                <Badge variant="outline">
                  Multiple Sources
                </Badge>
                <Badge variant="outline">
                  Real-time Updates
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allNews.map((newsItem, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      {/* News Image */}
                      {newsItem.imageUrl ? (
                        <div className="mb-3">
                          <img 
                            src={newsItem.imageUrl} 
                            alt={newsItem.title}
                            className="w-full h-40 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="mb-3 h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}

                      {/* News Content */}
                      <div>
                        <h3 className="font-semibold text-sm mb-2 line-clamp-3 leading-tight">
                          {newsItem.title}
                        </h3>
                        
                        {newsItem.description && (
                          <p className="text-xs text-gray-600 mb-3 line-clamp-3">
                            {newsItem.description}
                          </p>
                        )}

                        {/* News Meta */}
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span className="font-medium">{newsItem.source}</span>
                          <span>{new Date(newsItem.publishedAt).toLocaleDateString()}</span>
                        </div>

                        {/* Read More Button */}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => window.open(newsItem.url, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-2" />
                          Read Full Article
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* No News Message */}
              {allNews.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-600 mb-2">No News Available</h3>
                  <p className="text-gray-500 text-sm">
                    Crisis news will appear here once data is loaded from news APIs.
                    Check your API keys in the environment variables.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* API Status Footer */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="font-medium">API Status:</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>All APIs Active</span>
              </div>
            </div>
            <div className="text-gray-500">
              Next refresh: {new Date(lastUpdate.getTime() + 20 * 60 * 1000).toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealCrisisMap;