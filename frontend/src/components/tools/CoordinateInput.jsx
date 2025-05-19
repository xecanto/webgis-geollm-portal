import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { fromLonLat } from 'ol/proj';

export const CoordinateInput = ({ map }) => {
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [error, setError] = useState('');
  
  // Validate coordinates
  const validateCoordinates = () => {
    setError('');
    
    // Parse values
    const lon = parseFloat(longitude);
    const lat = parseFloat(latitude);
    
    // Check if values are numbers
    if (isNaN(lon) || isNaN(lat)) {
      setError('Please enter valid numeric coordinates');
      return false;
    }
    
    // Check longitude range
    if (lon < -180 || lon > 180) {
      setError('Longitude must be between -180 and 180');
      return false;
    }
    
    // Check latitude range
    if (lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90');
      return false;
    }
    
    return true;
  };
  
  // Go to location
  const goToLocation = () => {
    if (!map || !validateCoordinates()) return;
    
    const lon = parseFloat(longitude);
    const lat = parseFloat(latitude);
    
    // Convert coordinates to map projection
    const coordinates = fromLonLat([lon, lat]);
    
    // Animation options
    const view = map.getView();
    const duration = 1000;
    const zoom = Math.max(view.getZoom(), 12); // Zoom in to at least level 12
    
    // Animate to the location
    view.animate({
      center: coordinates,
      duration: duration
    });
    
    // If current zoom is less than 12, also animate zoom
    if (view.getZoom() < zoom) {
      view.animate({
        zoom: zoom,
        duration: duration
      });
    }
    
    // Optional: Add a marker at the location
    addTemporaryMarker(coordinates);
  };
  
  // Add temporary marker at location
  const addTemporaryMarker = async (coordinates) => {
    try {
      // Import required modules
      const featureModule = await import('ol/Feature');
      const pointModule = await import('ol/geom/Point');
      const vectorLayerModule = await import('ol/layer/Vector');
      const vectorSourceModule = await import('ol/source/Vector');
      const styleModule = await import('ol/style');
      
      // Create a feature with the coordinates
      const feature = new featureModule.default({
        geometry: new pointModule.default(coordinates),
      });
      
      // Create vector source and layer
      const source = new vectorSourceModule.default({
        features: [feature],
      });
      
      const markerLayer = new vectorLayerModule.default({
        source: source,
        style: new styleModule.Style({
          image: new styleModule.Circle({
            radius: 8,
            fill: new styleModule.Fill({ color: '#F4D35E' }),
            stroke: new styleModule.Stroke({ color: '#1B263B', width: 2 })
          })
        })
      });
      
      // Add layer to map
      map.addLayer(markerLayer);
      
      // Remove marker after 5 seconds
      setTimeout(() => {
        map.removeLayer(markerLayer);
      }, 5000);
      
    } catch (error) {
      console.error('Error adding marker:', error);
    }
  };
  
  // Handle keydown event for Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      goToLocation();
    }
  };
  
  return (
    <div>
      <div className="space-y-2 mb-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-[#BFC0C0] mb-1">Longitude</label>
            <input 
              type="text" 
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., 69.3451"
              className="bg-[#1B263B] border border-[#1A936F]/30 rounded py-1 px-2 w-full text-sm text-[#F0F3BD] placeholder-[#BFC0C0] focus:outline-none focus:border-[#1A936F]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#BFC0C0] mb-1">Latitude</label>
            <input 
              type="text" 
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., 30.3753"
              className="bg-[#1B263B] border border-[#1A936F]/30 rounded py-1 px-2 w-full text-sm text-[#F0F3BD] placeholder-[#BFC0C0] focus:outline-none focus:border-[#1A936F]"
            />
          </div>
        </div>
        
        {error && (
          <div className="text-xs text-[#FF5733]">{error}</div>
        )}
        
        <button 
          onClick={goToLocation}
          className="w-full bg-[#1A936F] hover:bg-[#1A936F]/80 text-[#F0F3BD] py-1 px-3 rounded text-sm flex items-center justify-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">navigation</span>
          <span>Go to Location</span>
        </button>
      </div>
      
      <div className="text-xs text-[#BFC0C0] pt-1 border-t border-[#1A936F]/10">
        <p className="mb-1">Example formats:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Decimal degrees: 69.3451, 30.3753</li>
          <li>DMS: 69° 20' 42" E, 30° 22' 31" N</li>
        </ul>
      </div>
    </div>
  );
};
