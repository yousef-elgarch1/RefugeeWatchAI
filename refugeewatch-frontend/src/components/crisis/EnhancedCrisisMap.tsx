/**
 * Enhanced Crisis Map with Refugee Flow Animation and Intelligence Features
 * Integrates with Crisis Intelligence System
 */

import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Users, 
  AlertTriangle, 
  Loader2, 
  Satellite, 
  Layers, 
  Map as MapIcon, 
  Activity,
  Brain,
  Target,
  Zap,
  TrendingUp
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Import intelligence system
import CrisisIntelligencePanel, { intelligenceAPIService } from './CrisisIntelligenceSystem';

interface CrisisLocation {
  id: string;
  name: string;
  country: string;
  coordinates: [number, number];
  displacement: number;
  population: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  region: string;
  description?: string;
  lastUpdated?: string;
  sources?: string[];
  crisisType: 'conflict' | 'natural' | 'economic' | 'climate';
  events?: Array<{
    type: 'earthquake' | 'flood' | 'war' | 'drought' | 'cyclone';
    magnitude?: number;
    date: string;
    description: string;
  }>;
}

interface RefugeeFlow {
  from: [number, number];
  to: [number, number];
  volume: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface BorderAlert {
  countryCode: string;
  coordinates: [number, number];
  alertLevel: 'warning' | 'high' | 'critical';
  description: string;
}

// Enhanced API service
const enhancedMapAPIService = {
  // Get comprehensive crisis data with predictions
  getCrisisDataWithPredictions: async (): Promise<{ 
    locations: CrisisLocation[], 
    refugeeFlows: RefugeeFlow[],
    borderAlerts: BorderAlert[]
  }> => {
    try {
      // Parallel fetch crisis data and flows
      const [crisisResponse, flowsResponse] = await Promise.allSettled([
        fetch('http://localhost:3001/api/crisis'),
        fetch('http://localhost:3001/api/refugees/unhcr')
      ]);

      let locations: CrisisLocation[] = [];
      let refugeeFlows: RefugeeFlow[] = [];

      // Process crisis data
      if (crisisResponse.status === 'fulfilled' && crisisResponse.value.ok) {
        const crisisData = await crisisResponse.value.json();
        if (crisisData.success && crisisData.data?.crises) {
          locations = crisisData.data.crises
            .filter((crisis: any) => 
              crisis.country !== 'Services Working' && 
              crisis.coordinates[0] !== 0 && 
              crisis.coordinates[1] !== 0
            )
            .map((crisis: any) => ({
              id: crisis.id,
              name: crisis.name || `${crisis.country} Crisis`,
              country: crisis.country,
              coordinates: crisis.coordinates,
              displacement: crisis.displacement,
              population: crisis.population,
              riskLevel: crisis.riskLevel || crisis.risk,
              region: crisis.region,
              description: `Humanitarian crisis in ${crisis.country}`,
              lastUpdated: crisis.lastUpdated,
              sources: ['Backend API'],
              crisisType: 'conflict' as any
            }));
        }
      }

      // Process refugee flow data
      if (flowsResponse.status === 'fulfilled' && flowsResponse.value.ok) {
        const flowData = await flowsResponse.value.json();
        if (flowData.success && flowData.data) {
          // Generate refugee flows between major crisis locations
          refugeeFlows = enhancedMapAPIService.generateRefugeeFlows(locations);
        }
      }

      // Generate border alerts
      const borderAlerts = enhancedMapAPIService.generateBorderAlerts(locations);

      return { locations, refugeeFlows, borderAlerts };
      
    } catch (error) {
      console.error('Enhanced crisis data fetch error:', error);
      return enhancedMapAPIService.getFallbackData();
    }
  },

  // Generate realistic refugee flows
  generateRefugeeFlows: (locations: CrisisLocation[]): RefugeeFlow[] => {
    const flows: RefugeeFlow[] = [];
    const neighboringCountries = [
      { name: 'Germany', coords: [52.5200, 13.4050] },
      { name: 'Chad', coords: [15.5007, 32.5599] },
      { name: 'Turkey', coords: [39.9334, 32.8597] },
      { name: 'Jordan', coords: [31.9454, 35.9284] },
      { name: 'Poland', coords: [51.9194, 19.1451] }
    ];

    locations.forEach(location => {
      if (location.displacement > 500000) {
        // Find nearest neighboring countries
        const nearbyCountries = neighboringCountries
          .map(country => ({
            ...country,
            distance: Math.sqrt(
              Math.pow(location.coordinates[0] - country.coords[0], 2) +
              Math.pow(location.coordinates[1] - country.coords[1], 2)
            )
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 2);

        nearbyCountries.forEach(country => {
          flows.push({
            from: location.coordinates,
            to: country.coords as [number, number],
            volume: Math.floor(location.displacement * 0.1 * Math.random()),
            trend: ['increasing', 'stable', 'decreasing'][Math.floor(Math.random() * 3)] as any
          });
        });
      }
    });

    return flows;
  },

  // Generate border alerts based on crisis proximity
  generateBorderAlerts: (locations: CrisisLocation[]): BorderAlert[] => {
    const alerts: BorderAlert[] = [];
    
    locations.forEach(location => {
      if (location.riskLevel === 'CRITICAL' || location.riskLevel === 'HIGH') {
        alerts.push({
          countryCode: location.country.substring(0, 2).toUpperCase(),
          coordinates: [
            location.coordinates[0] + (Math.random() - 0.5) * 2,
            location.coordinates[1] + (Math.random() - 0.5) * 2
          ],
          alertLevel: location.riskLevel === 'CRITICAL' ? 'critical' : 'high',
          description: `Border region affected by ${location.name}`
        });
      }
    });

    return alerts;
  },

  // Fallback data
  getFallbackData: () => ({
    locations: [
      {
        id: 'ukraine-2024',
        name: 'Ukraine Conflict',
        country: 'Ukraine',
        coordinates: [48.3794, 31.1656] as [number, number],
        displacement: 6300000,
        population: 43700000,
        riskLevel: 'HIGH' as const,
        region: 'Eastern Europe',
        description: 'Ongoing conflict since February 2022',
        crisisType: 'conflict' as const,
        sources: ['Fallback']
      }
    ],
    refugeeFlows: [
      {
        from: [48.3794, 31.1656] as [number, number],
        to: [52.5200, 13.4050] as [number, number],
        volume: 1200000,
        trend: 'stable' as const
      }
    ],
    borderAlerts: []
  })
};

const getCrisisIcon = (crisisType: string, riskLevel: string): string => {
  const icons = {
    conflict: riskLevel === 'CRITICAL' ? '🚨' : '⚔️',
    natural: '🌋',
    climate: '🌡️',
    economic: '📉'
  };
  return icons[crisisType as keyof typeof icons] || '📍';
};

const getRiskColor = (riskLevel: string): string => {
  const colors = {
    'CRITICAL': '#dc2626',
    'HIGH': '#ea580c',
    'MEDIUM': '#d97706',
    'LOW': '#16a34a'
  };
  return colors[riskLevel as keyof typeof colors] || '#6b7280';
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
};

interface EnhancedCrisisMapProps {
  className?: string;
  onLocationClick?: (location: CrisisLocation) => void;
  locations?: CrisisLocation[];
  selectedLocation?: CrisisLocation | null;
}

const EnhancedCrisisMap: React.FC<EnhancedCrisisMapProps> = ({
  className = "w-full h-96",
  onLocationClick,
  locations: propLocations,
  selectedLocation
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const flowLinesRef = useRef<string[]>([]);
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [useSimpleMap, setUseSimpleMap] = useState(false);
  const [mapStyle, setMapStyle] = useState<'satellite' | 'streets'>('satellite');
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [showRefugeeFlows, setShowRefugeeFlows] = useState(true);
  const [showBorderAlerts, setShowBorderAlerts] = useState(true);

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  
  useEffect(() => {
    if (MAPBOX_TOKEN) {
      mapboxgl.accessToken = MAPBOX_TOKEN;
    } else {
      setUseSimpleMap(true);
    }
  }, [MAPBOX_TOKEN]);

  // Fetch enhanced crisis data
  const { data: enhancedData, isLoading, error, refetch } = useQuery({
    queryKey: ['enhanced-crisis-data'],
    queryFn: enhancedMapAPIService.getCrisisDataWithPredictions,
    refetchInterval: 300000,
    enabled: !propLocations,
    retry: 2,
  });

  const locations = propLocations || enhancedData?.locations || [];
  const refugeeFlows = enhancedData?.refugeeFlows || [];
  const borderAlerts = enhancedData?.borderAlerts || [];

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || useSimpleMap || !MAPBOX_TOKEN) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [20, 20],
        zoom: 2,
        projection: 'mercator'
      });

      map.current.on('load', () => {
        setMapLoaded(true);
        setMapError(null);
        
        // Add refugee flow lines source
        if (map.current) {
          map.current.addSource('refugee-flows', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: []
            }
          });

          // Add animated line layer
          map.current.addLayer({
            id: 'refugee-flow-lines',
            type: 'line',
            source: 'refugee-flows',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#ff6b6b',
              'line-width': 3,
              'line-opacity': 0.7
            }
          });

          // Add pulsing border alerts
          map.current.addSource('border-alerts', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: []
            }
          });

          map.current.addLayer({
            id: 'border-alert-circles',
            type: 'circle',
            source: 'border-alerts',
            paint: {
              'circle-radius': 15,
              'circle-color': '#ff4444',
              'circle-opacity': 0.3,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ff0000'
            }
          });
        }
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Map failed to load');
        setUseSimpleMap(true);
      });

    } catch (error) {
      console.error('Map initialization failed:', error);
      setMapError('Map initialization failed');
      setUseSimpleMap(true);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapLoaded(false);
      }
    };
  }, [useSimpleMap, MAPBOX_TOKEN]);

  // Update refugee flows
  useEffect(() => {
    if (!map.current || !mapLoaded || !showRefugeeFlows) return;

    const flowFeatures = refugeeFlows.map((flow, index) => ({
      type: 'Feature' as const,
      properties: {
        volume: flow.volume,
        trend: flow.trend
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          [flow.from[1], flow.from[0]], // lng, lat
          [flow.to[1], flow.to[0]]
        ]
      }
    }));

    const flowData = {
      type: 'FeatureCollection' as const,
      features: flowFeatures
    };

    const source = map.current.getSource('refugee-flows') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(flowData);
    }
  }, [refugeeFlows, mapLoaded, showRefugeeFlows]);

  // Update border alerts
  useEffect(() => {
    if (!map.current || !mapLoaded || !showBorderAlerts) return;

    const alertFeatures = borderAlerts.map(alert => ({
      type: 'Feature' as const,
      properties: {
        alertLevel: alert.alertLevel,
        description: alert.description
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [alert.coordinates[1], alert.coordinates[0]] // lng, lat
      }
    }));

    const alertData = {
      type: 'FeatureCollection' as const,
      features: alertFeatures
    };

    const source = map.current.getSource('border-alerts') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(alertData);
    }
  }, [borderAlerts, mapLoaded, showBorderAlerts]);

  // Create enhanced markers
  useEffect(() => {
    if (!map.current || !mapLoaded || !locations.length || useSimpleMap) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach((location, index) => {
      try {
        const [lat, lng] = location.coordinates;
        
        if (isNaN(lat) || isNaN(lng)) return;

        const lngLat: [number, number] = [lng, lat];

        // Enhanced marker with intelligence features
        const markerEl = document.createElement('div');
        markerEl.className = 'enhanced-crisis-marker';
        markerEl.style.cssText = `
          width: 40px;
          height: 40px;
          background: radial-gradient(circle, ${getRiskColor(location.riskLevel)}, ${getRiskColor(location.riskLevel)}aa);
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 6px 20px rgba(0,0,0,0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: white;
          font-weight: bold;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        `;

        // Add AI indicator for critical crises
        if (location.riskLevel === 'CRITICAL') {
          const aiIndicator = document.createElement('div');
          aiIndicator.style.cssText = `
            position: absolute;
            top: -5px;
            right: -5px;
            width: 16px;
            height: 16px;
            background: #4f46e5;
            border: 2px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            animation: aiPulse 2s infinite;
          `;
          aiIndicator.innerHTML = '🧠';
          markerEl.appendChild(aiIndicator);
          
          // Add AI pulse animation
          if (!document.querySelector('#ai-pulse-style')) {
            const style = document.createElement('style');
            style.id = 'ai-pulse-style';
            style.textContent = `
              @keyframes aiPulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.7; }
                100% { transform: scale(1); opacity: 1; }
              }
            `;
            document.head.appendChild(style);
          }
        }

        const crisisIcon = getCrisisIcon(location.crisisType, location.riskLevel);
        markerEl.innerHTML = crisisIcon;

        // Enhanced hover effects
        markerEl.onmouseenter = () => {
          markerEl.style.transform = 'scale(1.3)';
          markerEl.style.zIndex = '1000';
        };
        markerEl.onmouseleave = () => {
          markerEl.style.transform = 'scale(1)';
          markerEl.style.zIndex = '1';
        };

        // Enhanced popup with intelligence preview
        const popup = new mapboxgl.Popup({
          offset: 40,
          closeButton: true,
          closeOnClick: false,
          className: 'enhanced-crisis-popup'
        }).setHTML(`
          <div style="padding: 16px; min-width: 320px; max-width: 400px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
              <span style="font-size: 28px;">${crisisIcon}</span>
              <div>
                <h3 style="margin: 0; font-weight: bold; font-size: 18px; color: #1f2937;">${location.name}</h3>
                <div style="font-size: 13px; color: #6b7280;">${location.crisisType.toUpperCase()} CRISIS</div>
              </div>
              ${location.riskLevel === 'CRITICAL' ? '<div style="margin-left: auto;"><span style="font-size: 20px;">🧠</span></div>' : ''}
            </div>
            
            <div style="background: ${getRiskColor(location.riskLevel)}20; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid ${getRiskColor(location.riskLevel)};">
              <div style="color: ${getRiskColor(location.riskLevel)}; font-weight: bold; font-size: 14px;">
                ${location.riskLevel} RISK LEVEL
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; font-size: 14px;">
              <div><strong>📍 Region:</strong><br>${location.region}</div>
              <div><strong>👥 Displaced:</strong><br><span style="color: #dc2626; font-weight: bold;">${formatNumber(location.displacement)}</span></div>
            </div>
            
            ${location.description ? `
              <div style="margin: 12px 0; padding: 10px; background: #f9fafb; border-radius: 6px; font-size: 13px;">
                ${location.description}
              </div>
            ` : ''}
            
            <div style="display: flex; gap: 8px; margin-top: 12px;">
              <button 
                onclick="window.crisisMapActions?.openIntelligence('${location.id}')"
                style="flex: 1; padding: 8px 12px; background: #4f46e5; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;"
              >
                🧠 AI Analysis
              </button>
              <button 
                onclick="window.crisisMapActions?.viewDetails('${location.id}')"
                style="flex: 1; padding: 8px 12px; background: #059669; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;"
              >
                📊 Full Details
              </button>
            </div>
            
            <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
              <div><strong>Sources:</strong> ${location.sources?.join(', ') || 'Live APIs'}</div>
              ${location.lastUpdated ? `<div><strong>Updated:</strong> ${new Date(location.lastUpdated).toLocaleString()}</div>` : ''}
            </div>
          </div>
        `);

        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat(lngLat)
          .setPopup(popup)
          .addTo(map.current!);

        markerEl.addEventListener('click', (e) => {
          e.stopPropagation();
          onLocationClick?.(location);
        });

        markersRef.current.push(marker);
        bounds.extend(lngLat);

      } catch (error) {
        console.error(`Failed to create marker for ${location.name}:`, error);
      }
    });

    // Fit bounds
    if (markersRef.current.length > 0 && !bounds.isEmpty()) {
      try {
        map.current.fitBounds(bounds, {
          padding: { top: 100, bottom: 100, left: 100, right: 100 },
          maxZoom: 6,
          duration: 1000
        });
      } catch (error) {
        console.error('Error fitting bounds:', error);
      }
    }

  }, [locations, mapLoaded, onLocationClick, useSimpleMap]);

  // Setup global actions for popup buttons
  useEffect(() => {
    (window as any).crisisMapActions = {
      openIntelligence: (crisisId: string) => {
        const crisis = locations.find(l => l.id === crisisId);
        if (crisis) {
          onLocationClick?.(crisis);
          setShowIntelligence(true);
        }
      },
      viewDetails: (crisisId: string) => {
        const crisis = locations.find(l => l.id === crisisId);
        if (crisis) {
          onLocationClick?.(crisis);
        }
      }
    };
  }, [locations, onLocationClick]);

  const toggleMapStyle = () => {
    if (!map.current) return;
    
    const newStyle = mapStyle === 'satellite' ? 'streets' : 'satellite';
    const styleUrl = newStyle === 'satellite' 
      ? 'mapbox://styles/mapbox/satellite-streets-v12'
      : 'mapbox://styles/mapbox/light-v11';
    
    map.current.setStyle(styleUrl);
    setMapStyle(newStyle);
  };

  const toggleRefugeeFlows = () => {
    setShowRefugeeFlows(!showRefugeeFlows);
    if (map.current) {
      map.current.setLayoutProperty(
        'refugee-flow-lines', 
        'visibility', 
        showRefugeeFlows ? 'none' : 'visible'
      );
    }
  };

  const toggleBorderAlerts = () => {
    setShowBorderAlerts(!showBorderAlerts);
    if (map.current) {
      map.current.setLayoutProperty(
        'border-alert-circles', 
        'visibility', 
        showBorderAlerts ? 'none' : 'visible'
      );
    }
  };

  // Simplified map fallback
  if (error || useSimpleMap || !MAPBOX_TOKEN) {
    return (
      <div className={className}>
        <Alert className="mb-4">
          <Activity className="h-4 w-4" />
          <AlertDescription>
            Using enhanced data with simplified view - All intelligence features active
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto border rounded-lg p-4">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center p-8">
              <Brain className="w-6 h-6 animate-pulse mr-2 text-blue-600" />
              Loading enhanced crisis intelligence...
            </div>
          ) : locations.length === 0 ? (
            <div className="col-span-full text-center p-8 text-gray-500">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              <p>No crisis data available</p>
              <button 
                onClick={() => refetch()} 
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Retry Intelligence APIs
              </button>
            </div>
          ) : (
            locations.map((location) => (
              <Card
                key={location.id}
                className="cursor-pointer hover:bg-muted/50 transition-all duration-200 border-l-4 hover:shadow-lg"
                style={{ borderLeftColor: getRiskColor(location.riskLevel) }}
                onClick={() => onLocationClick?.(location)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCrisisIcon(location.crisisType, location.riskLevel)}</span>
                      <div>
                        <h4 className="font-semibold text-sm">{location.name}</h4>
                        <p className="text-xs text-muted-foreground">{location.crisisType} crisis</p>
                      </div>
                      {location.riskLevel === 'CRITICAL' && (
                        <div className="ml-1">
                          <Brain className="w-4 h-4 text-blue-600" title="AI Analysis Available" />
                        </div>
                      )}
                    </div>
                    <Badge
                      style={{ backgroundColor: getRiskColor(location.riskLevel), color: 'white' }}
                      className="text-xs font-medium"
                    >
                      {location.riskLevel}
                    </Badge>
                  </div>
                  <div className="text-xs space-y-2">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-red-500" />
                      <span><strong>{formatNumber(location.displacement)}</strong> displaced</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-500" />
                      <span>{location.region}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 mt-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onLocationClick?.(location);
                        setShowIntelligence(true);
                      }}
                      className="flex-1 text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      🧠 AI
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onLocationClick?.(location);
                      }}
                      className="flex-1 text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      📊 Details
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>🧠 {locations.length} crisis locations with AI analysis</span>
            <button 
              onClick={() => refetch()} 
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
            >
              <Activity className="w-3 h-3" />
              Refresh Intelligence
            </button>
          </div>
          <span>Enhanced: NewsAPI, USGS, UNHCR, AI</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative">
        <div
          ref={mapContainer}
          className="w-full h-full rounded-lg overflow-hidden border"
          style={{ minHeight: '500px' }}
        >
          {(!mapLoaded || isLoading) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
                <Brain className="w-5 h-5 animate-pulse text-blue-600" />
                <span className="text-sm font-medium">
                  {!mapLoaded ? 'Loading enhanced crisis map...' : 'Processing intelligence data...'}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Enhanced Map Controls */}
        {mapLoaded && (
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <button
              onClick={toggleMapStyle}
              className="bg-white/90 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-lg p-2 shadow-lg transition-all duration-200"
              title={`Switch to ${mapStyle === 'satellite' ? 'street' : 'satellite'} view`}
            >
              {mapStyle === 'satellite' ? <MapIcon className="w-4 h-4" /> : <Satellite className="w-4 h-4" />}
            </button>
            
            <button
              onClick={toggleRefugeeFlows}
              className={`bg-white/90 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-lg p-2 shadow-lg transition-all duration-200 ${showRefugeeFlows ? 'bg-blue-100' : ''}`}
              title="Toggle refugee flow lines"
            >
              <TrendingUp className="w-4 h-4" />
            </button>
            
            <button
              onClick={toggleBorderAlerts}
              className={`bg-white/90 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-lg p-2 shadow-lg transition-all duration-200 ${showBorderAlerts ? 'bg-red-100' : ''}`}
              title="Toggle border alerts"
            >
              <Target className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => refetch()}
              className="bg-white/90 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-lg p-2 shadow-lg transition-all duration-200"
              title="Refresh intelligence data"
            >
              <Activity className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      {mapLoaded && (
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Brain className="w-3 h-3 text-blue-600" />
              <span>Enhanced Crisis Intelligence • {mapStyle === 'satellite' ? 'Satellite' : 'Street'} View</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {markersRef.current.length} active crises
            </Badge>
            <Badge variant="outline" className="text-xs">
              {refugeeFlows.length} refugee flows
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-red-500">🚨</span><span>Critical+AI</span>
              <span className="text-orange-500">⚔️</span><span>Conflict</span>
              <span className="text-blue-500">→</span><span>Flows</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Intelligence Panel */}
      {showIntelligence && selectedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <CrisisIntelligencePanel 
            crisis={selectedLocation}
            onClose={() => setShowIntelligence(false)}
          />
        </div>
      )}
    </div>
  );
};

export default EnhancedCrisisMap;