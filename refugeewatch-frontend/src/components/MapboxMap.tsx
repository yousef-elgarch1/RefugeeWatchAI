/**
 * RefugeeWatch AI - Enhanced Real-World Map Component
 * 
 * Displays real refugee displacement data with precise coordinates
 * Interactive features for crisis visualization
 */

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set your Mapbox token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface DisplacementData {
  country: string;
  countryCode: string;
  coordinates: [number, number]; // [lat, lng]
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedDisplaced: number;
  refugees: number;
  internal: number;
  destinations: string[];
  lastUpdated: string;
}

interface MapboxMapProps {
  displacementData: DisplacementData[];
  onCountryClick?: (country: DisplacementData) => void;
  className?: string;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ 
  displacementData = [], 
  onCountryClick,
  className = "w-full h-96" 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // Color scheme for risk levels
  const getRiskColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'CRITICAL': return '#dc2626'; // Red
      case 'HIGH': return '#ea580c';     // Orange  
      case 'MEDIUM': return '#ca8a04';   // Yellow
      case 'LOW': return '#16a34a';      // Green
      default: return '#6b7280';         // Gray
    }
  };

  // Get marker size based on displacement numbers
  const getMarkerSize = (displaced: number): number => {
    if (displaced > 10000000) return 25;      // 10M+ very large
    if (displaced > 5000000) return 20;       // 5M+ large
    if (displaced > 1000000) return 15;       // 1M+ medium
    if (displaced > 500000) return 12;        // 500K+ small
    return 8;                                 // <500K tiny
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    if (!mapboxgl.accessToken) {
      setMapError('Mapbox token not configured');
      setIsLoading(false);
      return;
    }

    try {
      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11', // Dark theme for crisis data
        center: [20, 20], // Center on Africa/Middle East
        zoom: 2,
        projection: 'naturalEarth' // Better world view
      });

      map.current.on('load', () => {
        setIsLoading(false);
        addDisplacementMarkers();
        addHeatmapLayer();
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError('Failed to load map');
        setIsLoading(false);
      });

    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError('Map initialization failed');
      setIsLoading(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (map.current && !isLoading) {
      addDisplacementMarkers();
      addHeatmapLayer();
    }
  }, [displacementData, isLoading]);

  const addDisplacementMarkers = () => {
    if (!map.current || !displacementData.length) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.displacement-marker');
    existingMarkers.forEach(marker => marker.remove());

    displacementData.forEach((location) => {
      const { coordinates, country, riskLevel, estimatedDisplaced, refugees, internal } = location;
      
      if (!coordinates || coordinates.length !== 2) return;

      // Create custom marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'displacement-marker cursor-pointer';
      markerEl.style.cssText = `
        width: ${getMarkerSize(estimatedDisplaced)}px;
        height: ${getMarkerSize(estimatedDisplaced)}px;
        background-color: ${getRiskColor(riskLevel)};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: bold;
        color: white;
        transition: transform 0.2s ease;
      `;

      // Add hover effect
      markerEl.addEventListener('mouseenter', () => {
        markerEl.style.transform = 'scale(1.2)';
      });
      markerEl.addEventListener('mouseleave', () => {
        markerEl.style.transform = 'scale(1)';
      });

      // Create popup with detailed information
      const popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false,
        className: 'displacement-popup'
      }).setHTML(`
        <div class="p-4 min-w-64">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-4 h-4 rounded-full" style="background-color: ${getRiskColor(riskLevel)}"></div>
            <h3 class="font-bold text-lg">${country}</h3>
          </div>
          
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Risk Level:</span>
              <span class="font-semibold text-${riskLevel === 'CRITICAL' ? 'red' : riskLevel === 'HIGH' ? 'orange' : riskLevel === 'MEDIUM' ? 'yellow' : 'green'}-600">
                ${riskLevel}
              </span>
            </div>
            
            <div class="border-t pt-2">
              <div class="flex justify-between">
                <span class="text-gray-600">Total Displaced:</span>
                <span class="font-bold text-red-600">${estimatedDisplaced.toLocaleString()}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Refugees:</span>
                <span class="font-semibold">${refugees.toLocaleString()}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Internally Displaced:</span>
                <span class="font-semibold">${internal.toLocaleString()}</span>
              </div>
            </div>
            
            ${location.destinations.length > 0 ? `
              <div class="border-t pt-2">
                <span class="text-gray-600">Main Destinations:</span>
                <div class="flex flex-wrap gap-1 mt-1">
                  ${location.destinations.slice(0, 4).map(dest => 
                    `<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-sm text-xs">${dest}</span>`
                  ).join('')}
                  ${location.destinations.length > 4 ? `<span class="text-xs text-gray-500">+${location.destinations.length - 4} more</span>` : ''}
                </div>
              </div>
            ` : ''}
            
            <div class="border-t pt-2 text-xs text-gray-500">
              Last updated: ${new Date(location.lastUpdated).toLocaleDateString()}
            </div>
          </div>
        </div>
      `);

      // Add marker to map
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([coordinates[1], coordinates[0]]) // Note: Mapbox uses [lng, lat]
        .setPopup(popup)
        .addTo(map.current!);

      // Handle marker click
      markerEl.addEventListener('click', () => {
        if (onCountryClick) {
          onCountryClick(location);
        }
        // Fly to location
        map.current!.flyTo({
          center: [coordinates[1], coordinates[0]],
          zoom: 6,
          duration: 1500
        });
      });
    });
  };

  const addHeatmapLayer = () => {
    if (!map.current || !displacementData.length) return;

    // Remove existing heatmap
    if (map.current.getLayer('displacement-heatmap')) {
      map.current.removeLayer('displacement-heatmap');
    }
    if (map.current.getSource('displacement-data')) {
      map.current.removeSource('displacement-data');
    }

    // Create GeoJSON data for heatmap
    const geojsonData = {
      type: 'FeatureCollection' as const,
      features: displacementData.map(location => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [location.coordinates[1], location.coordinates[0]] // [lng, lat]
        },
        properties: {
          displaced: location.estimatedDisplaced,
          country: location.country,
          risk: location.riskLevel
        }
      }))
    };

    // Add source
    map.current.addSource('displacement-data', {
      type: 'geojson',
      data: geojsonData
    });

    // Add heatmap layer
    map.current.addLayer({
      id: 'displacement-heatmap',
      type: 'heatmap',
      source: 'displacement-data',
      paint: {
        'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', 'displaced'],
          0, 0,
          1000000, 0.3,
          5000000, 0.7,
          10000000, 1
        ],
        'heatmap-intensity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 1,
          9, 3
        ],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(33,102,172,0)',
          0.2, 'rgb(103,169,207)',
          0.4, 'rgb(209,229,240)',
          0.6, 'rgb(253,219,199)',
          0.8, 'rgb(239,138,98)',
          1, 'rgb(178,24,43)'
        ],
        'heatmap-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 20,
          9, 40
        ],
        'heatmap-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          7, 1,
          9, 0.5
        ]
      }
    }, 'waterway-label');
  };

  if (mapError) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <div className="text-center p-6">
          <div className="text-red-500 mb-2">⚠️ Map Error</div>
          <div className="text-sm text-gray-600">{mapError}</div>
          <div className="text-xs text-gray-400 mt-2">
            Check Mapbox token configuration
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="text-white text-center">
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
            <div>Loading crisis map...</div>
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2">
        <div className="text-xs font-semibold mb-2">Displacement Scale</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-red-600 rounded"></div>
            <span>Critical (10M+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-3 bg-orange-600 rounded"></div>
            <span>High (5-10M)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-yellow-600 rounded"></div>
            <span>Medium (1-5M)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>Low (&lt;1M)</span>
          </div>
        </div>
      </div>

      {/* Stats Overlay */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded-lg">
        <div className="text-sm font-semibold">Global Displacement</div>
        <div className="text-lg font-bold">
          {displacementData.reduce((sum, d) => sum + d.estimatedDisplaced, 0).toLocaleString()}
        </div>
        <div className="text-xs opacity-75">
          {displacementData.length} crisis situations
        </div>
      </div>
    </div>
  );
};

export default MapboxMap;