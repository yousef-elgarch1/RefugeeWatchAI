import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars } from '@react-three/drei';
import * as THREE from 'three';
import spaceBackground from '@/assets/space-background.jpg';
import { countriesData, CountryData } from '@/data/countries';

interface CrisisMarkerProps {
  position: [number, number, number];
  country: CountryData;
  onClick: () => void;
}

const CrisisMarker: React.FC<CrisisMarkerProps> = ({ position, country, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const colors = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
    stable: '#3b82f6'
  };

  const sizes = {
    critical: 0.08,
    high: 0.06,
    medium: 0.05,
    low: 0.04,
    stable: 0.03
  };

  useFrame((state) => {
    if (meshRef.current && country.crisis.level === 'critical') {
      const time = state.clock.getElapsedTime();
      meshRef.current.scale.setScalar(sizes[country.crisis.level] + Math.sin(time * 3) * 0.02);
    }
  });

  if (country.crisis.level === 'stable') return null;

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? sizes[country.crisis.level] * 1.5 : sizes[country.crisis.level]}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial 
          color={colors[country.crisis.level]} 
          transparent 
          opacity={country.crisis.level === 'critical' ? 0.9 : 0.8}
        />
      </mesh>
      {/* Outer glow ring for critical situations */}
      {country.crisis.level === 'critical' && (
        <mesh position={position} scale={sizes[country.crisis.level] * 2}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial 
            color={colors[country.crisis.level]} 
            transparent 
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
};

const Earth = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Load Earth textures
  const earthTexture = useLoader(THREE.TextureLoader, 'https://unpkg.com/three-globe/example/img/earth-day.jpg');
  const bumpTexture = useLoader(THREE.TextureLoader, 'https://unpkg.com/three-globe/example/img/earth-topology.png');
  const specularTexture = useLoader(THREE.TextureLoader, 'https://unpkg.com/three-globe/example/img/earth-water.png');

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <Sphere ref={meshRef} args={[2, 64, 64]}>
      <meshPhongMaterial
        map={earthTexture}
        bumpMap={bumpTexture}
        bumpScale={0.05}
        specularMap={specularTexture}
        specular={new THREE.Color('grey')}
        shininess={100}
      />
    </Sphere>
  );
};

const Globe3D = () => {
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);

  // Convert lat/lon to 3D coordinates
  const latLonToVector3 = (lat: number, lon: number, radius: number = 2.1) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    return [
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    ] as [number, number, number];
  };

  const handleMarkerClick = (country: CountryData) => {
    setSelectedCountry(country);
  };

  return (
    <div 
      className="w-full h-full globe-container rounded-lg relative overflow-hidden"
      style={{
        backgroundImage: `url(${spaceBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />
        
        <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade />
        
        <Earth />
        
        {countriesData.map((country) => (
          <CrisisMarker
            key={country.id}
            position={latLonToVector3(country.coordinates.lat, country.coordinates.lon)}
            country={country}
            onClick={() => handleMarkerClick(country)}
          />
        ))}
        
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={10}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Enhanced Country Detail Modal */}
      {selectedCountry && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 p-4">
          <div className="bg-card rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto elevated-card animate-in slide-in-from-bottom duration-300">
            <div className="p-6 border-b border-border">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedCountry.flag}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{selectedCountry.name}</h2>
                    <p className="text-muted-foreground">{selectedCountry.capital} • {selectedCountry.region}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCountry(null)}
                  className="text-2xl text-muted-foreground hover:text-foreground transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Crisis Status */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold">Crisis Status</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    selectedCountry.crisis.level === 'critical' ? 'bg-crisis-critical text-white' :
                    selectedCountry.crisis.level === 'high' ? 'bg-crisis-high text-white' :
                    selectedCountry.crisis.level === 'medium' ? 'bg-crisis-medium text-black' :
                    selectedCountry.crisis.level === 'low' ? 'bg-crisis-low text-white' :
                    'bg-primary text-white'
                  }`}>
                    {selectedCountry.crisis.level.toUpperCase()}
                  </span>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">{selectedCountry.crisis.type}</h4>
                  <p className="text-sm text-muted-foreground">{selectedCountry.crisis.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <div className="text-2xl font-bold text-crisis-critical">
                      {(selectedCountry.crisis.affectedPopulation / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-xs text-muted-foreground">Affected Population</div>
                  </div>
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {(selectedCountry.population / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-xs text-muted-foreground">Total Population</div>
                  </div>
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <div className="text-lg font-bold text-foreground">
                      {selectedCountry.crisis.timeline}
                    </div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Last Updated</div>
                    <div className="text-sm font-medium">
                      {selectedCountry.crisis.lastUpdated}
                    </div>
                  </div>
                </div>
              </div>

              {/* Urgent Needs */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-crisis-high">Urgent Needs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedCountry.crisis.urgentNeeds.map((need, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-crisis-critical/10 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-crisis-critical mt-2 flex-shrink-0"></div>
                      <span className="text-sm">{need}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Infrastructure & Resources */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Available Resources</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                      <span className="text-sm">🏥 Hospitals</span>
                      <span className="font-bold">{selectedCountry.resources.hospitals}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                      <span className="text-sm">🏠 Shelters</span>
                      <span className="font-bold">{selectedCountry.resources.shelters}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                      <span className="text-sm">🍽️ Food Centers</span>
                      <span className="font-bold">{selectedCountry.resources.foodCenters}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                      <span className="text-sm">🛡️ Safe Zones</span>
                      <span className="font-bold">{selectedCountry.resources.safeZones}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Infrastructure Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                      <span className="text-sm">🛣️ Roads</span>
                      <span className={`font-bold ${
                        selectedCountry.infrastructure.roadsCondition === 'good' ? 'text-crisis-low' :
                        selectedCountry.infrastructure.roadsCondition === 'fair' ? 'text-crisis-medium' :
                        'text-crisis-critical'
                      }`}>
                        {selectedCountry.infrastructure.roadsCondition.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                      <span className="text-sm">📡 Communication</span>
                      <span className="font-bold">{selectedCountry.infrastructure.communicationAccess}%</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                      <span className="text-sm">💧 Water Access</span>
                      <span className="font-bold">{selectedCountry.infrastructure.waterAccess}%</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                      <span className="text-sm">⚡ Electricity</span>
                      <span className="font-bold">{selectedCountry.infrastructure.electricityAccess}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contacts */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Emergency Contacts</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg text-center">
                    <div className="font-medium text-primary">UN Office</div>
                    <div className="text-sm">{selectedCountry.emergencyContacts.un}</div>
                  </div>
                  <div className="p-3 bg-crisis-critical/10 rounded-lg text-center">
                    <div className="font-medium text-crisis-critical">Red Cross</div>
                    <div className="text-sm">{selectedCountry.emergencyContacts.redCross}</div>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg text-center">
                    <div className="font-medium">Government</div>
                    <div className="text-sm">{selectedCountry.emergencyContacts.government}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Globe3D;