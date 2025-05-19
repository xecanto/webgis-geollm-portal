import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

export const Footer = () => {
  const [coordinates, setCoordinates] = useState({ lat: 30.3753, lng: 69.3451 });
  const [scale, setScale] = useState('1:1,000,000');
  const [mapStatus, setMapStatus] = useState('Ready');
  const [zoomLevel, setZoomLevel] = useState(5);
  const [crs, setCrs] = useState('EPSG:4326');
  
  // Listen for mouse move events on the map to update coordinates
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (e.detail && e.detail.coordinates) {
        setCoordinates(e.detail.coordinates);
      }
    };
    
    // Listen for custom events from the map component
    window.addEventListener('map-mousemove', handleMouseMove);
    
    // Listen for zoom changes
    const handleZoomChange = (e) => {
      if (e.detail) {
        setZoomLevel(e.detail.zoom);
        setScale(calculateScale(e.detail.zoom));
      }
    };
    
    window.addEventListener('map-zoomchange', handleZoomChange);
    
    // Listen for map status changes
    const handleStatusChange = (e) => {
      if (e.detail && e.detail.status) {
        setMapStatus(e.detail.status);
      }
    };
    
    window.addEventListener('map-status', handleStatusChange);
    
    return () => {
      window.removeEventListener('map-mousemove', handleMouseMove);
      window.removeEventListener('map-zoomchange', handleZoomChange);
      window.removeEventListener('map-status', handleStatusChange);
    };
  }, []);
  
  // Calculate approximate scale from zoom level
  const calculateScale = (zoom) => {
    // Very rough approximation of scale based on zoom level
    const scales = {
      0: '1:500,000,000',
      1: '1:250,000,000',
      2: '1:150,000,000',
      3: '1:70,000,000',
      4: '1:35,000,000',
      5: '1:15,000,000',
      6: '1:10,000,000',
      7: '1:4,000,000',
      8: '1:2,000,000',
      9: '1:1,000,000',
      10: '1:500,000',
      11: '1:250,000',
      12: '1:150,000',
      13: '1:70,000',
      14: '1:35,000',
      15: '1:15,000',
      16: '1:8,000',
      17: '1:4,000',
      18: '1:2,000',
      19: '1:1,000'
    };
    
    return scales[zoom] || 'Unknown';
  };
  
  // Format coordinates with appropriate precision
  const formatCoordinate = (value) => {
    return value.toFixed(6);
  };

  return (
    <footer className="h-20 bg-[#1B263B] border-t border-[#1A936F]/20 flex flex-col">
      {/* Status bar */}
      <div className="h-6 bg-[#1A936F]/10 border-b border-[#1A936F]/20 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2 text-xs text-[#BFC0C0]">
          <span className="flex items-center">
            <span className="material-symbols-outlined text-sm mr-1">info</span>
            Status:
          </span>
          <span className={`text-[#F0F3BD] ${mapStatus !== 'Ready' ? 'animate-pulse' : ''}`}>
            {mapStatus}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1 text-[#BFC0C0]">
            <span className="material-symbols-outlined text-sm">fullscreen</span>
            <span>Zoom:</span>
            <span className="text-[#F0F3BD]">{zoomLevel}</span>
          </div>
          
          <div className="flex items-center gap-1 text-[#BFC0C0]">
            <span className="material-symbols-outlined text-sm">straighten</span>
            <span>Scale:</span>
            <span className="text-[#F0F3BD]">{scale}</span>
          </div>
          
          <div className="flex items-center gap-1 text-[#BFC0C0]">
            <span className="material-symbols-outlined text-sm">grid_3x3</span>
            <span>CRS:</span>
            <span className="text-[#F0F3BD]">{crs}</span>
          </div>
        </div>
      </div>
      
      {/* Main footer area */}
      <div className="flex-grow flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* Coordinate display */}
          <div className="bg-[#1B263B]/70 border border-[#1A936F]/30 rounded px-3 py-1 flex items-center gap-2">
            <span className="text-[#BFC0C0] text-sm">Longitude:</span>
            <span className="text-[#F0F3BD] text-sm font-mono">{formatCoordinate(coordinates.lng)}°</span>
            <span className="text-[#BFC0C0] text-sm ml-2">Latitude:</span>
            <span className="text-[#F0F3BD] text-sm font-mono">{formatCoordinate(coordinates.lat)}°</span>
          </div>
          
          {/* CRS Selector */}
          <div className="flex items-center gap-2">
            <label className="text-[#BFC0C0] text-sm">Coordinate System:</label>
            <select 
              className="bg-[#1B263B] border border-[#1A936F]/30 rounded px-2 py-1 text-sm text-[#F0F3BD]"
              value={crs}
              onChange={(e) => setCrs(e.target.value)}
            >
              <option value="EPSG:4326">WGS84 (EPSG:4326)</option>
              <option value="EPSG:3857">Web Mercator (EPSG:3857)</option>
              <option value="EPSG:32642">UTM Zone 42N (EPSG:32642)</option>
              <option value="EPSG:32643">UTM Zone 43N (EPSG:32643)</option>
            </select>
          </div>
        </div>
        
        {/* Credits and links */}
        <div className="flex items-center gap-4 text-xs text-[#BFC0C0]">
          <span>© 2025 Pakistan GeoLLM SDI</span>
          <span>|</span>
          <a href="#" className="hover:text-[#F0F3BD] transition-colors">Terms of Use</a>
          <span>|</span>
          <a href="#" className="hover:text-[#F0F3BD] transition-colors">Privacy Policy</a>
          <span>|</span>
          <span className="flex items-center">
            <span className="material-symbols-outlined text-sm mr-1">pin_drop</span>
            Data Sources: GADM, Pakistan SDI
          </span>
        </div>
      </div>
    </footer>
  );
};