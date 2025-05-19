import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

export const MeasurementTools = ({ map }) => {
  const [activeTool, setActiveTool] = useState(null);
  const [measuring, setMeasuring] = useState(false);
  const [result, setResult] = useState(null);
  const [pointCount, setPointCount] = useState(0);
  const drawingLayerRef = useRef(null);
  const sourceRef = useRef(null);
  const interactionRef = useRef(null);
  const overlayRef = useRef(null);
  
  // Set up drawing layers and interactions when component mounts
  useEffect(() => {
    if (!map) return;
    
    // Import OpenLayers modules dynamically
    const setupMeasurement = async () => {
      try {
        // Import needed OpenLayers modules
        const VectorLayer = (await import('ol/layer/Vector')).default;
        const VectorSource = (await import('ol/source/Vector')).default;
        const Style = (await import('ol/style/Style')).default;
        const Fill = (await import('ol/style/Fill')).default;
        const Stroke = (await import('ol/style/Stroke')).default;
        const Circle = (await import('ol/style/Circle')).default;
        const Overlay = (await import('ol/Overlay')).default;
        
        // Create the vector source and layer for measurements
        const source = new VectorSource();
        sourceRef.current = source;
        
        const vector = new VectorLayer({
          source: source,
          style: new Style({
            fill: new Fill({
              color: 'rgba(26, 147, 111, 0.3)'
            }),
            stroke: new Stroke({
              color: '#1A936F',
              width: 3
            }),
            image: new Circle({
              radius: 7,
              fill: new Fill({
                color: '#1A936F'
              })
            })
          })
        });
        
        // Create an overlay for measurement tooltips
        const measureTooltipElement = document.createElement('div');
        measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure bg-[#1B263B] text-[#F0F3BD] px-2 py-1 rounded text-xs';
        
        const measureTooltip = new Overlay({
          element: measureTooltipElement,
          offset: [0, -15],
          positioning: 'bottom-center',
          stopEvent: false,
          insertFirst: false
        });
        
        map.addOverlay(measureTooltip);
        map.addLayer(vector);
        
        drawingLayerRef.current = vector;
        overlayRef.current = measureTooltip;
        
        // Clean up when component unmounts
        return () => {
          if (interactionRef.current) {
            map.removeInteraction(interactionRef.current);
          }
          if (drawingLayerRef.current) {
            map.removeLayer(drawingLayerRef.current);
          }
          if (overlayRef.current) {
            map.removeOverlay(overlayRef.current);
          }
        };
      } catch (error) {
        console.error("Error setting up measurement tools:", error);
      }
    };
    
    setupMeasurement();
  }, [map]);
  
  // Start measuring when tool is activated
  useEffect(() => {
    if (!map || !activeTool || !sourceRef.current) return;
    
    const startMeasuring = async () => {
      try {
        // Reset previous measurements
        clearMeasurement();
        setMeasuring(true);
        setPointCount(0);
        setResult(null);
        
        // Import needed modules
        const Draw = (await import('ol/interaction/Draw')).default;
        const Overlay = (await import('ol/Overlay')).default;
        const {getLength, getArea} = await import('ol/sphere');
        const {LineString, Polygon} = await import('ol/geom');
        const Style = (await import('ol/style/Style')).default;
        const Fill = (await import('ol/style/Fill')).default;
        const Stroke = (await import('ol/style/Stroke')).default;
        const Circle = (await import('ol/style/Circle')).default;
        
        // Create the drawing interaction based on active tool
        const type = activeTool === 'distance' ? 'LineString' : 'Polygon';
        
        const interaction = new Draw({
          source: sourceRef.current,
          type: type,
          style: new Style({
            fill: new Fill({
              color: 'rgba(26, 147, 111, 0.2)'
            }),
            stroke: new Stroke({
              color: '#1A936F',
              width: 3,
              lineDash: [5, 5]
            }),
            image: new Circle({
              radius: 6,
              fill: new Fill({
                color: '#1A936F'
              })
            })
          })
        });
        
                // Add interaction to map
        map.addInteraction(interaction);
        interactionRef.current = interaction;
        
        // Set up measurement tooltip
        const measureTooltipElement = overlayRef.current.getElement();
        
        let listener;
        let sketch;
        let measureValue;
        
        // Handle drawing start event
        interaction.on('drawstart', (evt) => {
          sketch = evt.feature;
          setPointCount(1);
          
          // Create listener for geometry change
          listener = sketch.getGeometry().on('change', (e) => {
            const geom = e.target;
            let output;
            let tooltipCoord;
            
            if (activeTool === 'distance') {
              const length = getLength(geom);
              output = formatLength(length);
              tooltipCoord = geom.getLastCoordinate();
              measureValue = {
                distance_meters: length,
                distance_km: length / 1000,
                units: 'metric'
              };
            } else if (activeTool === 'area') {
              const area = getArea(geom);
              output = formatArea(area);
              tooltipCoord = geom.getInteriorPoint().getCoordinates();
              measureValue = {
                area_square_meters: area,
                area_hectares: area / 10000,
                area_square_km: area / 1000000,
                units: 'metric'
              };
            }
            
            measureTooltipElement.innerHTML = output;
            overlayRef.current.setPosition(tooltipCoord);
            
            // Update point count
            if (activeTool === 'distance') {
              setPointCount(geom.getCoordinates().length);
            } else {
              setPointCount(geom.getCoordinates()[0].length - 1); // -1 because the first and last points are the same
            }
          });
        });
        
        // Handle drawing end event
        interaction.on('drawend', () => {
          measureTooltipElement.className = 'ol-tooltip ol-tooltip-static bg-[#1B263B] text-[#F0F3BD] px-2 py-1 rounded text-xs';
          overlayRef.current.setOffset([0, -7]);
          sketch = null;
          setMeasuring(false);
          setResult(measureValue);
        });
        
      } catch (error) {
        console.error("Error starting measurement:", error);
        setMeasuring(false);
      }
    };
    
    startMeasuring();
  }, [activeTool, map]);
  
  // Format length to string with units
  const formatLength = (length) => {
    let output;
    if (length > 1000) {
      output = `${(length / 1000).toFixed(2)} km`;
    } else {
      output = `${length.toFixed(2)} m`;
    }
    return output;
  };
  
  // Format area to string with units
  const formatArea = (area) => {
    let output;
    if (area > 1000000) {
      output = `${(area / 1000000).toFixed(2)} km²`;
    } else if (area > 10000) {
      output = `${(area / 10000).toFixed(2)} ha`;
    } else {
      output = `${area.toFixed(2)} m²`;
    }
    return output;
  };
  
  // Clear measurement
  const clearMeasurement = () => {
    if (sourceRef.current) {
      sourceRef.current.clear();
    }
    
    // Reset overlay
    if (overlayRef.current) {
      overlayRef.current.setPosition(undefined);
    }
    
    setPointCount(0);
    setResult(null);
    
    // Remove interaction from map
    if (interactionRef.current && map) {
      map.removeInteraction(interactionRef.current);
      interactionRef.current = null;
    }
    
    setMeasuring(false);
    setActiveTool(null);
  };
    // Format measurement results
  const formatResult = () => {
    if (!result) return null;
    
    if (result.distance_meters !== undefined) {
      return (
        <div>
          <div className="font-medium mb-1">Distance:</div>
          <div className="grid grid-cols-2 gap-1 text-sm">
            <span className="text-[#BFC0C0]">Meters:</span>
            <span className="text-[#F0F3BD]">{result.distance_meters.toLocaleString(undefined, { maximumFractionDigits: 2 })} m</span>
            <span className="text-[#BFC0C0]">Kilometers:</span>
            <span className="text-[#F0F3BD]">{result.distance_km.toLocaleString(undefined, { maximumFractionDigits: 2 })} km</span>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <div className="font-medium mb-1">Area:</div>
          <div className="grid grid-cols-2 gap-1 text-sm">
            <span className="text-[#BFC0C0]">Square Meters:</span>
            <span className="text-[#F0F3BD]">{result.area_square_meters.toLocaleString(undefined, { maximumFractionDigits: 2 })} m²</span>
            <span className="text-[#BFC0C0]">Hectares:</span>
            <span className="text-[#F0F3BD]">{result.area_hectares.toLocaleString(undefined, { maximumFractionDigits: 2 })} ha</span>
            <span className="text-[#BFC0C0]">Square Kilometers:</span>
            <span className="text-[#F0F3BD]">{result.area_square_km.toLocaleString(undefined, { maximumFractionDigits: 2 })} km²</span>
          </div>
        </div>
      );
    }
  };
  
  return (
    <div className="space-y-2 text-sm">
      <button 
        onClick={() => setActiveTool('distance')} 
        className={`w-full py-2 px-3 rounded flex items-center gap-2 transition-colors ${
          activeTool === 'distance' 
            ? 'bg-[#1A936F] text-white' 
            : 'bg-[#1A936F]/10 hover:bg-[#1A936F]/20 text-[#F0F3BD]'
        }`}
      >
        <span className="material-symbols-outlined text-sm">straighten</span>
        <span>Measure Distance</span>
      </button>
      
      <button 
        onClick={() => setActiveTool('area')} 
        className={`w-full py-2 px-3 rounded flex items-center gap-2 transition-colors ${
          activeTool === 'area' 
            ? 'bg-[#1A936F] text-white' 
            : 'bg-[#1A936F]/10 hover:bg-[#1A936F]/20 text-[#F0F3BD]'
        }`}
      >
        <span className="material-symbols-outlined text-sm">area_chart</span>
        <span>Measure Area</span>
      </button>
      
      <button 
        onClick={clearMeasurement} 
        className={`w-full py-2 px-3 rounded flex items-center gap-2 transition-colors ${
          !activeTool && !measuring && !result
            ? 'bg-gray-500/30 text-[#BFC0C0] cursor-not-allowed'
            : 'bg-[#1A936F]/10 hover:bg-[#1A936F]/20 text-[#F0F3BD] cursor-pointer'
        }`}
        disabled={!activeTool && !measuring && !result}
      >
        <span className="material-symbols-outlined text-sm">delete</span>
        <span>Clear All</span>
      </button>
      
      {measuring && (
        <div className="bg-[#1B263B]/80 border border-[#1A936F]/30 rounded-md p-3">
          <div className="text-center text-[#F0F3BD] animate-pulse">
            <span className="material-symbols-outlined mb-2 text-3xl">touch_app</span>
            <p className="text-sm">
              {activeTool === 'distance' 
                ? 'Click to add points. Double-click to finish line.'
                : 'Click to draw polygon. Double-click to close and finish.'}
            </p>
          </div>
        </div>
      )}
      
      {result && (
        <div className="bg-[#1B263B]/50 border border-[#1A936F]/30 rounded-md p-3">
          {formatResult()}
        </div>
      )}
      
      {pointCount > 0 && (
        <div className="text-right mt-1 text-xs">
          <span className="text-[#BFC0C0]">
            {pointCount} point{pointCount !== 1 && 's'} recorded
          </span>
        </div>
      )}
    </div>
  );
};
