import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Thermometer, Droplets, Wind, Building, Layers, Settings, BarChart3, AlertTriangle, Info, Search, Navigation, Play, BookOpen, Target, Users } from 'lucide-react';

// Geocoding service
class GeocodingService {
  static async searchLocation(query) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const locations = {
      'new york': { lat: 40.7589, lng: -73.9851, name: 'New York City, NY' },
      'san francisco': { lat: 37.7749, lng: -122.4194, name: 'San Francisco, CA' },
      'chicago': { lat: 41.8781, lng: -87.6298, name: 'Chicago, IL' },
      'miami': { lat: 25.7617, lng: -80.1918, name: 'Miami, FL' },
      'seattle': { lat: 47.6062, lng: -122.3321, name: 'Seattle, WA' },
      'boston': { lat: 42.3601, lng: -71.0589, name: 'Boston, MA' },
      'los angeles': { lat: 34.0522, lng: -118.2437, name: 'Los Angeles, CA' },
      'denver': { lat: 39.7392, lng: -104.9903, name: 'Denver, CO' }
    };
    
    const searchKey = query.toLowerCase();
    const match = Object.keys(locations).find(key => key.includes(searchKey) || searchKey.includes(key));
    
    if (match) {
      return [locations[match]];
    }
    
    return Object.values(locations).filter(loc => 
      loc.name.toLowerCase().includes(searchKey)
    );
  }
}

// Climate data service
class ClimateDataService {
  static async getTemperatureData(bounds, center) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const data = [];
    const { north, south, east, west } = bounds;
    const baseTemp = this.getBaseTemperature(center.lat);
    
    for (let lat = south; lat <= north; lat += 0.008) {
      for (let lng = west; lng <= east; lng += 0.008) {
        const temp = baseTemp + 
          Math.sin((lat - center.lat) * 100) * 3 + 
          Math.cos((lng - center.lng) * 100) * 2 + 
          Math.random() * 4;
        
        data.push({
          lat, lng,
          temperature: temp,
          heatIndex: temp + Math.random() * 5,
          type: 'temperature'
        });
      }
    }
    return data;
  }

  static async getFloodRiskData(bounds, center) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const data = [];
    const { north, south, east, west } = bounds;
    const coastalRisk = Math.abs(center.lng) > 70 ? 0.3 : 0.1;
    
    for (let lat = south; lat <= north; lat += 0.006) {
      for (let lng = west; lng <= east; lng += 0.006) {
        const distanceFromCenter = Math.sqrt(
          Math.pow(lat - center.lat, 2) + Math.pow(lng - center.lng, 2)
        );
        
        const elevation = Math.sin(distanceFromCenter * 200) * 50 + Math.random() * 20;
        const floodRisk = coastalRisk + Math.max(0, (20 - elevation) / 30) + Math.random() * 0.2;
        
        if (floodRisk > 0.15) {
          data.push({
            lat, lng,
            floodRisk: Math.min(floodRisk, 1),
            elevation,
            type: 'flood'
          });
        }
      }
    }
    return data;
  }

  static async getBuildingData(bounds, center) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const buildings = [];
    const { north, south, east, west } = bounds;
    const buildingCount = 60;
    
    for (let i = 0; i < buildingCount; i++) {
      const lat = south + Math.random() * (north - south);
      const lng = west + Math.random() * (east - west);
      const height = Math.max(10, 120 - Math.random() * 80);
      
      buildings.push({
        id: i, lat, lng, height,
        width: 15 + Math.random() * 25,
        depth: 15 + Math.random() * 25,
        carbonFootprint: height * 0.8 + Math.random() * 15,
        energyEfficiency: Math.random(),
        buildingType: height > 50 ? 'commercial' : 'residential',
        yearBuilt: 1950 + Math.floor(Math.random() * 70),
        type: 'building'
      });
    }
    return buildings;
  }

  static getBaseTemperature(lat) {
    if (lat > 45) return 8;
    if (lat > 35) return 15;
    if (lat > 25) return 22;
    return 28;
  }
}

// Map Visualization Component
const GeoVisualization3D = ({ viewport, activeLayer, climateData, currentLocation, onDataUpdate, isDemo }) => {
  const [selectedPoint, setSelectedPoint] = useState(null);

  return (
    <div className="relative w-full h-full bg-green-50">
      {/* Terrain Base Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-blue-100 to-tan-100">
        
        {/* Geographic Features */}
        <div className="absolute inset-0">
          {/* Water Bodies */}
          <div className="absolute bottom-0 left-0 w-full h-20 bg-blue-300 opacity-80">
            <div className="absolute bottom-2 left-4 text-xs text-blue-800 font-medium opacity-70">
              🌊 Water Bodies
            </div>
          </div>
          <div className="absolute top-20 right-10 w-32 h-48 bg-blue-200 opacity-70 rounded-lg">
            <div className="absolute top-2 left-2 text-xs text-blue-800 font-medium opacity-70">
              Lake/Bay
            </div>
          </div>
          
          {/* Parks & Green Spaces */}
          <div className="absolute top-1/3 left-1/4 w-24 h-20 bg-green-400 opacity-70 rounded-lg">
            <div className="absolute top-2 left-2 text-xs text-green-800 font-medium opacity-70">
              🌳 Park
            </div>
          </div>
          <div className="absolute bottom-1/3 right-1/4 w-20 h-16 bg-green-300 opacity-70 rounded-lg">
            <div className="absolute top-1 left-1 text-xs text-green-800 font-medium opacity-70">
              Green Space
            </div>
          </div>
          
          {/* Urban Center */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gray-200 opacity-60 rounded">
            <div className="absolute top-2 left-2 text-xs text-gray-700 font-medium opacity-70">
              🏙️ Downtown
            </div>
          </div>
          
          {/* Road Network */}
          <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-400"></div>
          <div className="absolute left-1/2 top-0 w-1 h-full bg-gray-400"></div>
          <div className="absolute left-0 top-1/3 w-full h-0.5 bg-gray-300"></div>
          <div className="absolute left-0 top-2/3 w-full h-0.5 bg-gray-300"></div>
          <div className="absolute left-1/3 top-0 w-0.5 h-full bg-gray-300"></div>
          <div className="absolute left-2/3 top-0 w-0.5 h-full bg-gray-300"></div>
        </div>

        {/* Climate Data Overlay */}
        <div className="absolute inset-0">
          {(climateData[activeLayer] || []).slice(0, 30).map((point, index) => {
            const row = Math.floor(index / 6);
            const col = index % 6;
            const x = 15 + col * 12 + Math.random() * 8;
            const y = 15 + row * 15 + Math.random() * 8;

            if (activeLayer === 'temperature') {
              const temp = point.temperature || 20;
              const intensity = (temp - 10) / 25;
              const hue = 240 - intensity * 240;
              
              return (
                <div
                  key={`temp-${index}`}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer hover:scale-150 transition-all duration-200"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    width: `${10 + intensity * 8}px`,
                    height: `${10 + intensity * 8}px`,
                    backgroundColor: `hsl(${hue}, 80%, 60%)`,
                    boxShadow: `0 0 ${8 + intensity * 12}px hsla(${hue}, 80%, 60%, 0.6)`,
                    border: '2px solid white',
                    zIndex: 10
                  }}
                  onClick={() => setSelectedPoint(point)}
                  title={`Temperature: ${temp.toFixed(1)}°C`}
                />
              );
            }

            if (activeLayer === 'buildings') {
              const height = point.height || 50;
              const efficiency = point.energyEfficiency || 0.5;
              const buildingHeight = Math.max(8, height * 0.3);
              const hue = efficiency * 120;
              
              return (
                <div
                  key={`building-${index}`}
                  className="absolute cursor-pointer hover:scale-110 transition-all duration-200"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    width: '6px',
                    height: `${buildingHeight}px`,
                    backgroundColor: `hsl(${hue}, 70%, 50%)`,
                    transform: 'translateX(-50%) translateY(-100%)',
                    border: '1px solid rgba(0,0,0,0.2)',
                    borderRadius: '1px 1px 0 0',
                    boxShadow: '1px 1px 3px rgba(0,0,0,0.2)',
                    zIndex: Math.floor(buildingHeight)
                  }}
                  onClick={() => setSelectedPoint(point)}
                  title={`Building: ${height.toFixed(0)}m, ${(efficiency * 100).toFixed(0)}% efficient`}
                />
              );
            }

            if (activeLayer === 'flood') {
              const risk = point.floodRisk || 0.3;
              const size = 8 + risk * 12;
              
              return (
                <div
                  key={`flood-${index}`}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer hover:scale-125 transition-all duration-200"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: `rgba(33, 150, 243, ${0.4 + risk * 0.4})`,
                    border: `2px solid rgba(33, 150, 243, ${0.6 + risk * 0.4})`,
                    animation: risk > 0.7 ? 'pulse 2s infinite' : 'none',
                    zIndex: 5
                  }}
                  onClick={() => setSelectedPoint(point)}
                  title={`Flood Risk: ${(risk * 100).toFixed(0)}%`}
                />
              );
            }

            return null;
          })}
        </div>

        {/* City Label */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-white/90 px-3 py-1 rounded-full text-sm font-medium text-gray-700 shadow-md">
            📍 {currentLocation.name.split(',')[0]}
          </div>
        </div>

        {/* Visual Guide Overlay (for demo mode) */}
        {isDemo && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Arrows pointing to features */}
            <div className="absolute top-20 left-20 bg-white/95 p-2 rounded-lg shadow-lg text-xs">
              <div className="font-bold text-blue-600">💧 Water Bodies</div>
              <div>Rivers, lakes, coastlines</div>
            </div>
            <div className="absolute top-40 left-60 bg-white/95 p-2 rounded-lg shadow-lg text-xs">
              <div className="font-bold text-green-600">🌳 Green Spaces</div>
              <div>Parks, forests, open areas</div>
            </div>
            <div className="absolute bottom-40 right-40 bg-white/95 p-2 rounded-lg shadow-lg text-xs">
              <div className="font-bold text-gray-600">🏙️ Urban Areas</div>
              <div>Dense city centers</div>
            </div>
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2">
        <div className="space-y-1">
          <button className="block w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded">+</button>
          <button className="block w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded">−</button>
          <button className="block w-10 h-10 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs">🎯</button>
        </div>
      </div>

      {/* Map Info Panel */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
        <div className="font-bold text-gray-800 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          {currentLocation.name}
        </div>
        <div className="text-sm text-blue-600 mt-1">🗺️ Interactive Climate Map</div>
        <div className="text-xs text-green-600 mt-1">✓ {(climateData[activeLayer] || []).length} active data points</div>
        
        {/* What you're seeing explanation */}
        <div className="mt-3 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-600">
            <div className="font-medium mb-1">Map Features:</div>
            <div>• Blue areas = water bodies</div>
            <div>• Green areas = parks/forests</div>
            <div>• Gray areas = urban centers</div>
            <div>• Lines = road networks</div>
          </div>
        </div>
      </div>

      {/* Data Layer Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
        <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
          {activeLayer === 'temperature' && <><Thermometer className="w-4 h-4 text-red-500" /> Temperature Monitoring</>}
          {activeLayer === 'buildings' && <><Building className="w-4 h-4 text-gray-600" /> Building Analysis</>}
          {activeLayer === 'flood' && <><Droplets className="w-4 h-4 text-blue-500" /> Flood Risk Assessment</>}
        </h4>
        
        {activeLayer === 'temperature' && (
          <div className="space-y-2">
            <div className="text-xs text-gray-600 mb-2">
              Colored dots show temperature readings across the city. Warmer areas appear red, cooler areas appear blue.
            </div>
            <div className="h-3 bg-gradient-to-r from-blue-500 to-red-500 rounded mb-2"></div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>5°C (Cold)</span>
              <span>35°C (Hot)</span>
            </div>
            <div className="text-xs text-gray-500 italic">
              Click any dot to see detailed temperature data
            </div>
          </div>
        )}
        
        {activeLayer === 'buildings' && (
          <div className="space-y-2">
            <div className="text-xs text-gray-600 mb-2">
              Vertical bars represent buildings. Height shows building size, color shows energy efficiency.
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-4 bg-green-500"></div>
                <span>High Efficiency</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-4 bg-red-500"></div>
                <span>Low Efficiency</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 italic">
              Click any building to see efficiency details
            </div>
          </div>
        )}
        
        {activeLayer === 'flood' && (
          <div className="space-y-2">
            <div className="text-xs text-gray-600 mb-2">
              Blue circles show flood risk zones. Larger, darker circles indicate higher risk areas.
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-300 rounded-full border border-blue-500"></div>
                <span>Low Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full border border-blue-800"></div>
                <span>High Risk</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 italic">
              Click any zone to see risk assessment
            </div>
          </div>
        )}
      </div>

      {/* Interactive Guide */}
      <div className="absolute bottom-4 right-4 bg-black/80 text-white rounded-lg p-3 text-xs">
        <div className="font-medium mb-1 flex items-center gap-2">
          <Play className="w-3 h-3" />
          Try the Demo
        </div>
        <div className="space-y-0.5 opacity-90">
          <div>• Click colored data points</div>
          <div>• Switch layers in sidebar</div>
          <div>• Search different cities</div>
          <div>• View live analytics</div>
        </div>
      </div>

      {/* Data Point Details Modal */}
      {selectedPoint && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {selectedPoint.temperature && <><Thermometer className="w-5 h-5 text-red-500" /> Temperature Reading</>}
                {selectedPoint.height && <><Building className="w-5 h-5 text-gray-600" /> Building Information</>}
                {selectedPoint.floodRisk && <><Droplets className="w-5 h-5 text-blue-500" /> Flood Risk Data</>}
              </h3>
              <button
                onClick={() => setSelectedPoint(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              {selectedPoint.temperature && (
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-red-50 rounded-lg">
                  <div className="text-3xl font-bold mb-1" style={{
                    color: `hsl(${240 - ((selectedPoint.temperature - 10) / 25) * 240}, 80%, 50%)`
                  }}>
                    {selectedPoint.temperature.toFixed(1)}°C
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Current Temperature</div>
                  <div className="text-xs text-gray-500">
                    Heat Index: {selectedPoint.heatIndex?.toFixed(1)}°C
                  </div>
                  <div className="text-xs text-gray-500 mt-2 p-2 bg-white/50 rounded">
                    This data point represents a temperature sensor reading from this location in the city.
                  </div>
                </div>
              )}
              
              {selectedPoint.height && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-700 mb-1">
                    {selectedPoint.height.toFixed(0)}m
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Building Height</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><strong>Efficiency:</strong> {(selectedPoint.energyEfficiency * 100).toFixed(0)}%</div>
                    <div><strong>Type:</strong> {selectedPoint.buildingType}</div>
                    <div><strong>Built:</strong> {selectedPoint.yearBuilt}</div>
                    <div><strong>Carbon:</strong> {selectedPoint.carbonFootprint.toFixed(1)}t</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 p-2 bg-white rounded">
                    Building data includes energy efficiency ratings, carbon footprint, and structural information.
                  </div>
                </div>
              )}
              
              {selectedPoint.floodRisk && (
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {(selectedPoint.floodRisk * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600 mb-2">Flood Risk Level</div>
                  <div className="text-xs">
                    <strong>Elevation:</strong> {selectedPoint.elevation?.toFixed(1)}m above sea level
                  </div>
                  <div className="text-xs text-gray-500 mt-2 p-2 bg-white/50 rounded">
                    Risk assessment based on elevation, proximity to water, and historical flood data.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Location Search Component
const LocationSearch = ({ onLocationSelect, currentLocation }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = async (searchQuery) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await GeocodingService.searchLocation(searchQuery);
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSuggestions([]);
    }
    setIsSearching(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  const selectLocation = (location) => {
    setQuery(location.name);
    setShowSuggestions(false);
    onLocationSelect(location);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Try: Miami, San Francisco, Chicago..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((location, index) => (
            <button
              key={index}
              onClick={() => selectLocation(location)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900">{location.name}</div>
                  <div className="text-sm text-gray-500">
                    {location.lat.toFixed(4)}°N, {Math.abs(location.lng).toFixed(4)}°{location.lng < 0 ? 'W' : 'E'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Demo Application
const ResilientCitiesApp = () => {
  const [activeLayer, setActiveLayer] = useState('temperature');
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [showCaseStudy, setShowCaseStudy] = useState(true);
  
  const [viewport, setViewport] = useState({
    center: { lat: 40.7589, lng: -73.9851 },
    zoom: 12,
    bounds: { north: 40.8, south: 40.7, east: -73.9, west: -74.1 }
  });
  
  const [currentLocation, setCurrentLocation] = useState({
    lat: 40.7589, lng: -73.9851, name: 'New York City, NY'
  });
  
  const [climateData, setClimateData] = useState({
    temperature: [], buildings: [], flood: [], loading: false
  });

  const [analytics, setAnalytics] = useState({
    avgTemperature: 0, floodRiskArea: 0, buildingCount: 0, carbonTotal: 0
  });

  const calculateBounds = (center) => {
    const offset = 0.05;
    return {
      north: center.lat + offset, south: center.lat - offset,
      east: center.lng + offset, west: center.lng - offset
    };
  };

  const handleLocationSelect = (location) => {
    setCurrentLocation(location);
    const newBounds = calculateBounds(location);
    setViewport({ center: location, zoom: 12, bounds: newBounds });
  };

  const loadClimateData = async () => {
    setClimateData(prev => ({ ...prev, loading: true }));

    try {
      const [tempData, buildingData, floodData] = await Promise.all([
        ClimateDataService.getTemperatureData(viewport.bounds, viewport.center),
        ClimateDataService.getBuildingData(viewport.bounds, viewport.center),
        ClimateDataService.getFloodRiskData(viewport.bounds, viewport.center)
      ]);

      setClimateData({
        temperature: tempData, buildings: buildingData, flood: floodData, loading: false
      });

      const avgTemp = tempData.length > 0 
        ? tempData.reduce((sum, point) => sum + point.temperature, 0) / tempData.length : 0;
      const floodArea = floodData.length * 0.01;
      const totalCarbon = buildingData.reduce((sum, building) => sum + building.carbonFootprint, 0);

      setAnalytics({
        avgTemperature: avgTemp.toFixed(1),
        floodRiskArea: floodArea.toFixed(2),
        buildingCount: buildingData.length,
        carbonTotal: totalCarbon.toFixed(0)
      });
    } catch (error) {
      console.error('Failed to load climate data:', error);
      setClimateData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    loadClimateData();
  }, [viewport]);

  const layers = [
    { id: 'temperature', label: 'Temperature', icon: Thermometer, color: 'text-red-500', desc: 'Heat distribution across urban areas' },
    { id: 'buildings', label: 'Buildings', icon: Building, color: 'text-gray-600', desc: 'Energy efficiency & carbon footprint' },
    { id: 'flood', label: 'Flood Risk', icon: Droplets, color: 'text-blue-500', desc: 'Climate change flood vulnerability' },
  ];

  const metrics = [
    { label: 'Avg Temperature', value: `${analytics.avgTemperature}°C`, icon: Thermometer, trend: '+2.3°C since 1990' },
    { label: 'Buildings Analyzed', value: analytics.buildingCount, icon: Building, trend: '15% energy efficient' },
    { label: 'At-Risk Area', value: `${analytics.floodRiskArea} km²`, icon: Droplets, trend: 'High flood zones' },
    { label: 'Carbon Impact', value: `${analytics.carbonTotal}t CO₂`, icon: Wind, trend: '12% above target' }
  ];

  if (showCaseStudy) {
    return (
      <div className="w-full h-screen bg-white overflow-y-auto font-sans">
        {/* Simple Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="flex justify-end items-start mb-6">
              <div className="text-right text-sm text-gray-500">
                <div>Product Design Engineer, 2022</div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Resilient Cities Platform</h1>
            <p className="text-xl text-gray-600 max-w-3xl mb-8">
              An internal climate visualization tool that helps architects, planners, and sustainability teams 
              understand climate data through interactive maps.
            </p>
            
            <button 
              onClick={() => setShowCaseStudy(false)}
              className="text-green-600 hover:text-green-700 text-2xl font-medium underline decoration-2 underline-offset-4 transition-colors"
            >
              Interactive Demo
            </button>
          </div>
        </div>

        {/* Case Study Content */}
        <div className="max-w-5xl mx-auto px-6 py-12">
          
          {/* Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">TIMELINE</h3>
              <p className="text-gray-600">6 months</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">MY ROLE</h3>
              <p className="text-gray-600">Product Design Engineer</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">TEAM</h3>
              <p className="text-gray-600">6 people: Design, Engineering, Data Science</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">IMPACT</h3>
              <p className="text-gray-600">4 min site analysis (down from 6-12 hours)</p>
            </div>
          </div>

          {/* Problem Section */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">The Problem</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                Architects, urban planners, and sustainability consultants spend 20-30% of early project time 
                manually gathering environmental data from fragmented sources, leading to delayed insights 
                and suboptimal design decisions.
              </p>
              <p className="text-gray-600 mb-8">
                Through interviews with 24 design and sustainability professionals within an architecture and planning company, we discovered that teams regularly make initial site 
                decisions based on intuition rather than data simply because accessing comprehensive 
                environmental information takes too long.
              </p>
            </div>
            
            {/* Problem Stats */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Findings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-2xl font-bold text-gray-900">6-12 hours</div>
                  <div className="text-gray-600 text-sm">spent gathering baseline environmental data per project</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">73%</div>
                  <div className="text-gray-600 text-sm">make initial decisions on "gut feel" due to data access friction</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">5-8</div>
                  <div className="text-gray-600 text-sm">different platforms needed for complete environmental picture</div>
                </div>
              </div>
            </div>
          </section>

          {/* User Research */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">User Research</h2>
            <p className="text-xl text-gray-700 mb-8">
              We interviewed 24 professionals to understand current workflows and identify intervention opportunities.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Participants</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Architects</span>
                    <span className="font-medium">8 participants</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Urban Planners</span>
                    <span className="font-medium">6 participants</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Sustainability Experts</span>
                    <span className="font-medium">5 participants</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Landscape/Urban Designers</span>
                    <span className="font-medium">5 participants</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Pain Points</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>Data scattered across multiple proprietary platforms</li>
                  <li>No visualization tools that show spatial relationships</li>
                  <li>Static PDFs impossible to interpret for non-technical stakeholders</li>
                  <li>Critical environmental constraints discovered too late in design process</li>
                  <li>Manual data compilation prevents iterative design exploration</li>
                </ul>
              </div>
            </div>
          </section>

          {/* User Flow Diagram */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">User Journey Analysis</h2>
            
            <div className="space-y-16">
              {/* Current State */}
              <div>
                <h3 className="text-lg font-semibold text-red-600 mb-6">Current User Flow</h3>
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-6">
                  
                  {/* Step 1 */}
                  <div className="flex-1">
                    <div className="border border-gray-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Data Request</h4>
                      <p className="text-gray-700 text-sm mb-1">Email multiple departments for climate data</p>
                      <p className="text-gray-600 text-xs">Wait 2-3 days for responses</p>
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <div className="hidden md:block text-gray-400">
                    <svg className="w-8 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="flex-1">
                    <div className="border border-gray-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">PDF Collection</h4>
                      <p className="text-gray-700 text-sm mb-1">Receive static documents from 5-8 sources</p>
                      <p className="text-gray-600 text-xs">No spatial context or integration</p>
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <div className="hidden md:block text-gray-400">
                    <svg className="w-8 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  {/* Step 3 */}
                  <div className="flex-1">
                    <div className="border border-gray-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Manual Assembly</h4>
                      <p className="text-gray-700 text-sm mb-1">Attempt to overlay disparate data sources</p>
                      <p className="text-gray-600 text-xs">Critical insights lost in translation</p>
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <div className="hidden md:block text-gray-400">
                    <svg className="w-8 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  {/* Step 4 */}
                  <div className="flex-1">
                    <div className="border border-gray-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Design with Gaps</h4>
                      <p className="text-gray-700 text-sm mb-1">Begin design with incomplete information</p>
                      <p className="text-gray-600 text-xs">High risk of costly redesigns</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <p className="text-gray-800 text-sm font-medium">Timeline: 6-12 hours spread over 1-2 weeks</p>
                  <p className="text-gray-700 text-xs mt-1">Result: 73% of decisions made on "gut feel" due to data access friction</p>
                </div>
              </div>

              {/* Proposed State */}
              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-6">Proposed User Flow</h3>
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-6">
                  
                  {/* Step 1 */}
                  <div className="flex-1">
                    <div className="border border-gray-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Open Platform</h4>
                      <p className="text-gray-700 text-sm mb-1">Launch unified application</p>
                      <p className="text-gray-600 text-xs">Instant access to all data sources</p>
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <div className="hidden md:block text-gray-400">
                    <svg className="w-8 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="flex-1">
                    <div className="border border-gray-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Search Location</h4>
                      <p className="text-gray-700 text-sm mb-1">Enter site address or coordinates</p>
                      <p className="text-gray-600 text-xs">Auto-load all relevant environmental data</p>
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <div className="hidden md:block text-gray-400">
                    <svg className="w-8 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  {/* Step 3 */}
                  <div className="flex-1">
                    <div className="border border-gray-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Explore & Analyze</h4>
                      <p className="text-gray-700 text-sm mb-1">Toggle between data layers and investigate patterns</p>
                      <p className="text-gray-600 text-xs">Visual insights with spatial context</p>
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <div className="hidden md:block text-gray-400">
                    <svg className="w-8 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  {/* Step 4 */}
                  <div className="flex-1">
                    <div className="border border-gray-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Export & Design</h4>
                      <p className="text-gray-700 text-sm mb-1">Generate comprehensive site analysis</p>
                      <p className="text-gray-600 text-xs">Informed design decisions from day one</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <p className="text-gray-800 text-sm font-medium">Timeline: 4 minutes total</p>
                  <p className="text-gray-700 text-xs mt-1">Result: Complete environmental analysis ready for design team collaboration</p>
                </div>
              </div>
            </div>
          </section>

          {/* Design Process */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Design Process</h2>
            <p className="text-xl text-gray-700 mb-12">
              We iterated through three major design approaches based on user testing feedback.
            </p>

            <div className="space-y-12">
              {/* Iteration 1 */}
              <div className="border-l-4 border-red-500 pl-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Iteration 1: Dashboard Approach</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">What we built</h4>
                    <ul className="text-gray-700 space-y-1">
                      <li>Traditional dashboard with charts and graphs</li>
                      <li>Tabular data display with filtering capabilities</li>
                      <li>Small map view in corner of interface</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-600 mb-3">What failed</h4>
                    <ul className="text-red-600 space-y-1">
                      <li>Users completely ignored charts, went straight to map</li>
                      <li>8 out of 10 participants called it "confusing"</li>
                      <li>"This feels like every other data tool"</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Iteration 2 */}
              <div className="border-l-4 border-yellow-500 pl-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Iteration 2: Map-First Interface</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium text-green-600 mb-3">What worked</h4>
                    <ul className="text-green-600 space-y-1">
                      <li>Users immediately understood spatial relationships</li>
                      <li>90% of testing time spent exploring the map</li>
                      <li>"Finally, a tool that thinks like we think"</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-600 mb-3">Remaining problems</h4>
                    <ul className="text-red-600 space-y-1">
                      <li>Data overlays were too cluttered</li>
                      <li>Couldn't compare different data types effectively</li>
                      <li>Performance issues with large datasets</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Iteration 3 */}
              <div className="border-l-4 border-green-500 pl-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Iteration 3: Layered Exploration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium text-green-600 mb-3">Key breakthroughs</h4>
                    <ul className="text-green-600 space-y-1">
                      <li>Layer switching behavior familiar from CAD software</li>
                      <li>Click-to-explore instead of overwhelming hover states</li>
                      <li>Smart data placement based on geographic context</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Testing results</h4>
                    <ul className="text-gray-700 space-y-1">
                      <li>85% task completion rate (vs 45% in iteration 1)</li>
                      <li>Average 4 minutes to complete site analysis</li>
                      <li>9 out of 10 users said they would use regularly</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Final Solution */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Final Solution</h2>
            
            {/* Screenshot of main interface */}
            <div className="mb-12">
              <img 
                src="/images/main-interface.png" 
                alt="Main interface showing map-first layout with geographic features, data layer controls, and search functionality"
                className="w-full rounded-lg shadow-xl border border-gray-200"
              />
              <p className="text-sm text-gray-500 text-center mt-4">
                Complete interface showing map visualization, layer controls, search, analytics, and export features
              </p>
            </div>

            {/* Key Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Design Principles</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Map-first thinking</h4>
                    <p className="text-gray-600 text-sm">Spatial professionals think geographically, not in spreadsheets</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Contextual data placement</h4>
                    <p className="text-gray-600 text-sm">Flood zones appear near water bodies, heat islands in urban cores</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Progressive disclosure</h4>
                    <p className="text-gray-600 text-sm">Overview first, details available on demand</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Technical Implementation</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Real-time data aggregation</h4>
                    <p className="text-gray-600 text-sm">Climate, building, and flood data from multiple API sources</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">ML-powered placement</h4>
                    <p className="text-gray-600 text-sm">Algorithm positions data points based on geographic context</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Performance optimization</h4>
                    <p className="text-gray-600 text-sm">Progressive loading and interaction latency under 200ms</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Features */}
            <div className="mt-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Core Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Data Layer Switching</h4>
                  <p className="text-sm text-gray-600">Toggle between temperature, building, and flood data</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Detail Modal</h4>
                  <p className="text-sm text-gray-600">Click any data point for comprehensive information</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Search Interface</h4>
                  <p className="text-sm text-gray-600">Real-time city search with suggestions</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Analytics Panel</h4>
                  <p className="text-sm text-gray-600">Real-time environmental metrics</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Export Features</h4>
                  <p className="text-sm text-gray-600">Comprehensive site analysis reports</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Interactive Map</h4>
                  <p className="text-sm text-gray-600">Geographic visualization with climate data overlays</p>
                </div>
              </div>
            </div>
          </section>

          {/* Results */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Measuring Impact</h2>
            
            <p className="text-xl text-gray-700 mb-8">
              We measured the platform's real-world impact through post-deployment studies with early adopter firms, focusing on behavioral changes and workflow improvements rather than just usability metrics.
            </p>

            {/* Impact Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Workflow Transformation</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Reduced Decision Latency</h4>
                    <p className="text-gray-600 text-sm">Teams now make initial site assessments within the first project meeting instead of waiting weeks for data compilation. This shift enables earlier stakeholder alignment and faster project kickoffs.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Increased Design Iterations</h4>
                    <p className="text-gray-600 text-sm">With instant access to environmental constraints, teams explore 3-4x more design alternatives during early phases, leading to more innovative and site-appropriate solutions.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Enhanced Client Communication</h4>
                    <p className="text-gray-600 text-sm">Visual data presentations replace technical PDFs in client meetings, improving stakeholder understanding and reducing revision cycles.</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Organizational Changes</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Cross-Team Collaboration</h4>
                    <p className="text-gray-600 text-sm">Sustainability consultants now join project kickoffs instead of being brought in during later design phases, creating more integrated team workflows.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Proactive Risk Management</h4>
                    <p className="text-gray-600 text-sm">Teams identify environmental constraints before site visits, reducing costly design pivots and enabling more strategic site analysis time.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Knowledge Democratization</h4>
                    <p className="text-gray-600 text-sm">Junior team members can now perform preliminary environmental assessments independently, reducing bottlenecks around senior staff availability.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quantified Outcomes */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Measured Outcomes</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">4 min</div>
                  <div className="text-gray-700 font-medium mb-1">Average site analysis time</div>
                  <div className="text-gray-600 text-sm">Previously required 6-12 hours of manual data gathering</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">85%</div>
                  <div className="text-gray-700 font-medium mb-1">Task completion rate in testing</div>
                  <div className="text-gray-600 text-sm">Compared to 45% with existing fragmented tools</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">9/10</div>
                  <div className="text-gray-700 font-medium mb-1">Teams report regular usage</div>
                  <div className="text-gray-600 text-sm">Platform became integral to project workflows</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-50 flex">
      {/* Enhanced Sidebar with Demo Context */}
      <div className="w-80 bg-white shadow-lg flex flex-col">
        {/* Header with Demo Toggle */}
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Resilient Cities</h1>
          <p className="text-sm text-gray-600 mb-4">Climate Impact Visualization Platform</p>
          
          {/* Prominent Case Study Button */}
          <button
            onClick={() => setShowCaseStudy(true)}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 mb-4 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            Return to Case Study
          </button>
          
          {/* Demo Instructions */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800 mb-1">
              <Play className="w-4 h-4" />
              <span className="text-sm font-medium">Interactive Demo</span>
            </div>
            <p className="text-xs text-yellow-700">
              This is a working prototype. Try switching cities, data layers, and clicking data points to explore the interface.
            </p>
          </div>
          
          <LocationSearch 
            onLocationSelect={handleLocationSelect}
            currentLocation={currentLocation}
          />
          
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <Navigation className="w-4 h-4" />
              <span className="text-sm font-medium">{currentLocation.name}</span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {currentLocation.lat.toFixed(4)}°N, {Math.abs(currentLocation.lng).toFixed(4)}°{currentLocation.lng < 0 ? 'W' : 'E'}
            </p>
          </div>
        </div>

        {/* Enhanced Layer Controls with Descriptions */}
        <div className="p-6 border-b">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Climate Data Layers
          </h3>
          
          <div className="space-y-3">
            {layers.map(layer => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  activeLayer === layer.id 
                    ? 'bg-blue-100 border-2 border-blue-300' 
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <layer.icon className={`w-5 h-5 ${layer.color}`} />
                  <span className="font-medium text-gray-900">{layer.label}</span>
                </div>
                <p className="text-xs text-gray-600 pl-8">{layer.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Analytics with Context */}
        <div className="p-6 flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Live Analytics
          </h3>
          
          <div className="space-y-4">
            {metrics.map((metric, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">{metric.label}</span>
                  <metric.icon className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-lg font-bold text-gray-900">{metric.value}</div>
                <div className="text-xs text-gray-500 mt-1">{metric.trend}</div>
              </div>
            ))}
          </div>

          {climateData.loading && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-700">
                <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Loading climate data...</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t bg-gray-50">
          <button 
            onClick={loadClimateData}
            disabled={climateData.loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-2"
          >
            {climateData.loading ? 'Loading...' : 'Refresh Data'}
          </button>
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Main Visualization with Enhanced Context */}
      <div className="flex-1 relative">
        <GeoVisualization3D 
          viewport={viewport}
          activeLayer={activeLayer}
          climateData={climateData}
          currentLocation={currentLocation}
          onDataUpdate={setClimateData}
          isDemo={isDemoMode}
        />
        
        {/* Demo Overlay */}
        {isDemoMode && (
          <div className="absolute top-4 right-20 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg p-4 shadow-xl max-w-sm">
            <div className="flex items-center gap-2 mb-2">
              <Play className="w-5 h-5" />
              <span className="font-bold">Live Demo</span>
            </div>
            <p className="text-sm opacity-90 mb-3">
              You're viewing an interactive climate visualization platform. The map shows real geographic features with simulated climate data overlays.
            </p>
            <button
              onClick={() => setIsDemoMode(false)}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-colors"
            >
              Hide Demo Info
            </button>
          </div>
        )}
        
        {/* Settings Panel */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3">
          <div className="flex gap-2">
            <button 
              onClick={() => setIsDemoMode(!isDemoMode)}
              className="p-2 hover:bg-gray-100 rounded-md" 
              title="Toggle Demo Mode"
            >
              <Info className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-md" title="Settings">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResilientCitiesApp;