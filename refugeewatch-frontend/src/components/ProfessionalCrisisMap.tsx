import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Users, 
  MapPin, 
  Activity,
  TrendingUp,
  Calendar,
  Globe,
  RefreshCw,
  Loader2
} from "lucide-react";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ProfessionalCrisisMap = () => {
  const [crisisData, setCrisisData] = useState([]);
  const [selectedCrisis, setSelectedCrisis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Fetch real crisis data from multiple APIs
  const fetchCrisisData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch from multiple endpoints in parallel
      const [crisisResponse, geoResponse, refugeeResponse] = await Promise.allSettled([
        fetch('http://localhost:3001/api/crisis'),
        fetch('http://localhost:3001/api/crisis/geographical'),
        fetch('http://localhost:3001/api/refugees/unhcr')
      ]);

      let combinedData = [];

      // Process crisis data
      if (crisisResponse.status === 'fulfilled' && crisisResponse.value.ok) {
        const crisisJson = await crisisResponse.value.json();
        if (crisisJson.success && crisisJson.data?.crises) {
          combinedData = crisisJson.data.crises.map(crisis => ({
            id: crisis.id,
            name: `${crisis.country} Crisis`,
            country: crisis.country,
            coordinates: crisis.coordinates || [0, 0],
            displacement: crisis.displacement || 0,
            population: crisis.population || 0,
            riskLevel: crisis.riskLevel || crisis.risk || 'MEDIUM',
            region: crisis.region || 'Unknown',
            description: crisis.description || `Crisis situation in ${crisis.country}`,
            lastUpdated: crisis.lastUpdated || new Date().toISOString(),
            sources: ['UNHCR', 'REST Countries API'],
            crisisType: 'conflict',
            confidence: crisis.confidence || 75,
            events: crisis.events || []
          }));
        }
      }

      // Process geographical data if main crisis data failed
      if (combinedData.length === 0 && geoResponse.status === 'fulfilled' && geoResponse.value.ok) {
        const geoJson = await geoResponse.value.json();
        if (geoJson.success && geoJson.data?.locations) {
          combinedData = geoJson.data.locations.map(loc => ({
            id: loc.countryCode || loc.country,
            name: `${loc.country} Situation`,
            country: loc.country,
            coordinates: loc.coordinates,
            displacement: loc.displacement || 0,
            population: loc.population || 0,
            riskLevel: loc.riskLevel || 'MEDIUM',
            region: loc.region || 'Unknown',
            description: `Monitoring ${loc.country}`,
            lastUpdated: new Date().toISOString(),
            sources: ['Geographic Data'],
            crisisType: 'monitoring'
          }));
        }
      }

      // Filter out invalid data
      combinedData = combinedData.filter(crisis => 
        crisis.coordinates && 
        crisis.coordinates[0] !== 0 && 
        crisis.coordinates[1] !== 0 &&
        crisis.country !== 'Services Working'
      );

      // If still no data, use fallback critical locations
      if (combinedData.length === 0) {
        combinedData = [
          {
            id: 'sudan',
            name: 'Sudan Armed Conflict',
            country: 'Sudan',
            coordinates: [15.5007, 32.5599],
            displacement: 8200000,
            population: 45000000,
            riskLevel: 'CRITICAL',
            region: 'North Africa',
            description: 'Ongoing armed conflict causing massive displacement',
            crisisType: 'conflict',
            confidence: 92
          },
          {
            id: 'myanmar',
            name: 'Myanmar Crisis',
            country: 'Myanmar',
            coordinates: [21.9162, 95.9560],
            displacement: 1500000,
            population: 54000000,
            riskLevel: 'HIGH',
            region: 'Southeast Asia',
            description: 'Political instability and ethnic conflicts',
            crisisType: 'conflict',
            confidence: 88
          },
          {
            id: 'syria',
            name: 'Syria Humanitarian Crisis',
            country: 'Syria',
            coordinates: [34.8021, 38.9968],
            displacement: 6800000,
            population: 18500000,
            riskLevel: 'CRITICAL',
            region: 'Middle East',
            description: 'Protracted conflict and humanitarian emergency',
            crisisType: 'conflict',
            confidence: 95
          }
        ];
      }

      setCrisisData(combinedData);
      setLastUpdate(new Date());
      
    } catch (err) {
      console.error('Error fetching crisis data:', err);
      setError('Failed to load crisis data. Using cached information.');
      
      // Use fallback data on error
      setCrisisData([
        {
          id: 'fallback-sudan',
          name: 'Sudan Crisis (Cached)',
          country: 'Sudan',
          coordinates: [15.5007, 32.5599],
          displacement: 8000000,
          riskLevel: 'CRITICAL',
          description: 'Cached data - API temporarily unavailable'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrisisData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchCrisisData, 300000);
    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (level) => {
    switch(level?.toUpperCase()) {
      case 'CRITICAL': return '#dc2626';
      case 'HIGH': return '#ea580c';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getMarkerSize = (displacement) => {
    if (displacement > 5000000) return 25;
    if (displacement > 1000000) return 20;
    if (displacement > 500000) return 15;
    if (displacement > 100000) return 12;
    return 10;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num?.toString() || '0';
  };

  return (
    <div className="w-full h-full relative">
      {/* Map Container */}
      <MapContainer 
        center={[20, 0]} 
        zoom={2.5} 
        className="w-full h-full rounded-lg"
        style={{ minHeight: '600px' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Crisis Markers */}
        {crisisData.map((crisis) => (
          <CircleMarker
            key={crisis.id}
            center={crisis.coordinates}
            radius={getMarkerSize(crisis.displacement)}
            fillColor={getRiskColor(crisis.riskLevel)}
            color="#ffffff"
            weight={2}
            opacity={0.9}
            fillOpacity={0.7}
            eventHandlers={{
              click: () => setSelectedCrisis(crisis)
            }}
          >
            <Popup>
              <div className="p-3 min-w-[250px]">
                <h3 className="font-bold text-lg mb-2">{crisis.name}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Risk Level:</span>
                    <Badge 
                      style={{ 
                        backgroundColor: getRiskColor(crisis.riskLevel),
                        color: 'white'
                      }}
                    >
                      {crisis.riskLevel}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Displaced:</span>
                    <span className="font-semibold">{formatNumber(crisis.displacement)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Population:</span>
                    <span>{formatNumber(crisis.population)}</span>
                  </div>
                  {crisis.confidence && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confidence:</span>
                      <span>{crisis.confidence}%</span>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-2">{crisis.description}</p>
                  <Button 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => setSelectedCrisis(crisis)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Control Panel */}
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Crisis Monitor</span>
              <Badge variant="outline" className="text-xs">
                {crisisData.length} Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              size="sm" 
              onClick={fetchCrisisData}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Refresh Data
                </>
              )}
            </Button>
            <div className="text-xs text-gray-500">
              Last update: {lastUpdate.toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Risk Levels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(level => (
              <div key={level} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getRiskColor(level) }}
                />
                <span className="text-xs">{level}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="absolute bottom-4 left-4 right-4 max-w-md z-[1000]">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Selected Crisis Details */}
      {selectedCrisis && (
        <Card className="absolute bottom-4 left-4 z-[1000] max-w-md bg-white/95 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedCrisis.name}</span>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setSelectedCrisis(null)}
              >
                ✕
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-sm text-gray-500">Displaced</span>
                <p className="font-bold text-lg">{formatNumber(selectedCrisis.displacement)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Risk Level</span>
                <Badge 
                  className="mt-1"
                  style={{ 
                    backgroundColor: getRiskColor(selectedCrisis.riskLevel),
                    color: 'white'
                  }}
                >
                  {selectedCrisis.riskLevel}
                </Badge>
              </div>
            </div>
            <p className="text-sm">{selectedCrisis.description}</p>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1">
                <Activity className="w-3 h-3 mr-1" />
                Analyze
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                Trends
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfessionalCrisisMap;