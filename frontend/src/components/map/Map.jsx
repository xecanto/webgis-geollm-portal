import { h } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import ImageLayer from 'ol/layer/Image';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import ImageWMS from 'ol/source/ImageWMS';
import XYZ from 'ol/source/XYZ';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import { defaults as defaultControls } from 'ol/control';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Fill, Stroke, Circle, Text } from 'ol/style';
import { pointerMove } from 'ol/events/condition';
import Select from 'ol/interaction/Select';
import { GEOSERVER_URL, GEOSERVER_WORKSPACE, GEOSERVER_WMS_URL, GEOSERVER_WFS_URL, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../config/env';

export const MapComponent = ({ basemap, mapLabels, terrain, onMapInit }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [activeLayers, setActiveLayers] = useState({
    admin0: true,
    admin1: true,
    admin2: false,
    admin3: false,
    roads: false,
    buildings: false,
    waterways: false,
    railways: false,
    landuse: false
  });
  
  // Layer references to allow toggling visibility
  const layerRefs = useRef({});
  
  // Initialize map on component mount
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      initMap();
    }
    
    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(null);
        mapInstanceRef.current = null;
      }
    };
  }, []);
  
  // Listen for layer toggle events from sidebar
  useEffect(() => {
    const handler = (e) => {
      const { layer, visible } = e.detail;
      setActiveLayers(prev => ({ ...prev, [layer]: visible }));
    };
    window.addEventListener('map-toggle-layer', handler);
    return () => window.removeEventListener('map-toggle-layer', handler);
  }, []);

  // Handle basemap changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateBasemap();
    }
  }, [basemap, terrain]);
  
  // Handle layer visibility changes
  useEffect(() => {
    // This would be connected to the layer checkboxes in the LeftSidebar
    updateLayerVisibility();
  }, [activeLayers]);
  
  // Initialize OpenLayers map
  const initMap = () => {
    // Set up base map layers
    const basemapLayer = createBasemapLayer(basemap);
    
    // Create administrative boundary layers
    const admin0Layer = createWMSLayer(`${GEOSERVER_WORKSPACE}:admin0`, 'Country Boundary');
    const admin1Layer = createWMSLayer(`${GEOSERVER_WORKSPACE}:admin1`, 'Provinces');
    const admin2Layer = createWMSLayer(`${GEOSERVER_WORKSPACE}:admin2`, 'Districts');
    const admin3Layer = createWMSLayer(`${GEOSERVER_WORKSPACE}:admin3`, 'Tehsils', false);
    
    // Create OSM feature layers
    const roadsLayer = createWMSLayer(`${GEOSERVER_WORKSPACE}:roads`, 'Roads', false);
    const buildingsLayer = createWMSLayer(`${GEOSERVER_WORKSPACE}:buildings`, 'Buildings', false);
    const waterwaysLayer = createWMSLayer(`${GEOSERVER_WORKSPACE}:waterways`, 'Waterways', false);
    const railwaysLayer = createWMSLayer(`${GEOSERVER_WORKSPACE}:railways`, 'Railways', false);
    const landuseLayer = createWMSLayer(`${GEOSERVER_WORKSPACE}:landuse`, 'Land Use', false);
    
    // Save layer references
    layerRefs.current = {
      admin0: admin0Layer,
      admin1: admin1Layer,
      admin2: admin2Layer,
      admin3: admin3Layer,
      roads: roadsLayer,
      buildings: buildingsLayer,
      waterways: waterwaysLayer,
      railways: railwaysLayer,
      landuse: landuseLayer
    };
    
    // Create the map instance
    const mapInstance = new Map({
      target: mapRef.current,
      layers: [
        basemapLayer,
        landuseLayer,
        waterwaysLayer,
        admin0Layer,
        admin1Layer,
        admin2Layer,
        admin3Layer,
        railwaysLayer,
        roadsLayer,
        buildingsLayer
      ],
      view: new View({
        center: fromLonLat(DEFAULT_MAP_CENTER), // Center from env config
        zoom: DEFAULT_MAP_ZOOM, // Zoom from env config
        maxZoom: 19,
        minZoom: 4
      }),
      controls: defaultControls({
        attribution: true,
        zoom: true,
        rotate: false
      })
    });
    
    // Add hover interaction
    const selectInteraction = new Select({
      condition: pointerMove,
      style: function(feature) {
        return new Style({
          fill: new Fill({
            color: 'rgba(26, 147, 111, 0.2)'
          }),
          stroke: new Stroke({
            color: '#1A936F',
            width: 2
          }),
          text: new Text({
            text: feature.get('name_1') || feature.get('name_2') || feature.get('name'),
            font: '12px Open Sans',
            fill: new Fill({
              color: '#F0F3BD'
            }),
            stroke: new Stroke({
              color: '#1B263B',
              width: 3
            }),
            offsetY: -15
          })
        });
      }
    });
    
    mapInstance.addInteraction(selectInteraction);
    
    // Handle pointer move to update coordinates
    mapInstance.on('pointermove', function(evt) {
      const lonLat = toLonLat(evt.coordinate);
      const event = new CustomEvent('map-mousemove', {
        detail: { coordinates: { lng: lonLat[0], lat: lonLat[1] } }
      });
      window.dispatchEvent(event);
    });
    
    // Handle zoom changes
    mapInstance.getView().on('change:resolution', function() {
      const zoom = mapInstance.getView().getZoom();
      const event = new CustomEvent('map-zoomchange', {
        detail: { zoom: Math.round(zoom) }
      });
      window.dispatchEvent(event);
      
      // Auto-enable/disable layers based on zoom level
      autoAdjustLayersByZoom(Math.round(zoom));
    });
    
    // When selected feature changes
    selectInteraction.on('select', function(e) {
      if (e.selected.length > 0) {
        const feature = e.selected[0];
        setSelectedFeature({
          id: feature.getId() || 'unknown',
          type: feature.getGeometryName() || 'unknown',
          properties: feature.getProperties()
        });
      } else {
        setSelectedFeature(null);
      }
    });
    
    // Listen for GeoLLM map actions
    window.addEventListener('geollm-map-action', handleGeoLLMAction);
    
    // Store map instance
    mapInstanceRef.current = mapInstance;
    
    // Notify parent component that map is initialized
    if (onMapInit) {
      onMapInit(mapInstance);
    }
    
    // Dispatch initial status
    const statusEvent = new CustomEvent('map-status', {
      detail: { status: 'Ready' }
    });
    window.dispatchEvent(statusEvent);
  };
  
  // Create a WMS layer from GeoServer
  const createWMSLayer = (layerName, title, visible = true) => {
    return new ImageLayer({
      title: title,
      visible: visible,
      source: new ImageWMS({
        url: GEOSERVER_WMS_URL,
        params: {
          'LAYERS': layerName,
          'FORMAT': 'image/png',
          'TRANSPARENT': true
        },
        ratio: 1,
        serverType: 'geoserver'
      })
    });
  };
  
  // Create appropriate basemap layer based on selection
  const createBasemapLayer = (type) => {
    switch (type) {
      case 'dark':
        return new TileLayer({
          source: new XYZ({
            url: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            attribution: '© CARTO'
          })
        });
      case 'satellite':
        return new TileLayer({
          source: new XYZ({
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attribution: 'Tiles © Esri'
          })
        });
      case 'light':
      default:
        return new TileLayer({
          source: new OSM()
        });
    }
  };
  
  // Update basemap when selection changes
  const updateBasemap = () => {
    if (!mapInstanceRef.current) return;
    
    // Remove existing basemap (always at index 0)
    mapInstanceRef.current.getLayers().removeAt(0);
    
    // Add new basemap
    const newBasemap = createBasemapLayer(basemap);
    mapInstanceRef.current.getLayers().insertAt(0, newBasemap);
  };
  
  // Auto-adjust layer visibility based on zoom level
  const autoAdjustLayersByZoom = (zoom) => {
    // This function can be expanded to automatically adjust layer visibility
    // based on zoom level for better performance and UX
    
    const newActiveLayers = { ...activeLayers };
    
    // Only show buildings and detailed layers at higher zoom levels
    if (zoom >= 14) {
      newActiveLayers.buildings = true;
    } else if (zoom < 14 && newActiveLayers.buildings) {
      newActiveLayers.buildings = false;
    }
    
    // Always show admin boundaries, adjust detail level
    if (zoom >= 9) {
      newActiveLayers.admin2 = true;
    } else if (zoom < 9 && newActiveLayers.admin2) {
      newActiveLayers.admin2 = false;
    }
    
    // Show tehsils only at very high zoom
    if (zoom >= 11) {
      newActiveLayers.admin3 = true;
    } else if (zoom < 11 && newActiveLayers.admin3) {
      newActiveLayers.admin3 = false;
    }
    
    // Show roads based on zoom
    if (zoom >= 8) {
      newActiveLayers.roads = true;
    } else if (zoom < 8 && newActiveLayers.roads) {
      newActiveLayers.roads = false;
    }
    
    setActiveLayers(newActiveLayers);
  };
  
  // Update layer visibility based on active layers state
  const updateLayerVisibility = () => {
    if (!mapInstanceRef.current) return;
    
    // Update each layer's visibility
    Object.keys(layerRefs.current).forEach(key => {
      if (layerRefs.current[key]) {
        layerRefs.current[key].setVisible(activeLayers[key] || false);
      }
    });
  };
  
  // Handle GeoLLM map actions
  const handleGeoLLMAction = (event) => {
    if (!mapInstanceRef.current || !event.detail) return;
    
    const action = event.detail;
    
    // Update map status
    const statusEvent = new CustomEvent('map-status', {
      detail: { status: 'Processing GeoLLM Request...' }
    });
    window.dispatchEvent(statusEvent);
    
    switch (action.type) {
      case 'zoom_to_feature':
        zoomToFeature(action.layerName, action.propertyName, action.propertyValue);
        break;
      case 'zoom_to_coords':
        zoomToCoordinates(action.coordinates, action.zoom);
        break;
      case 'highlight_feature':
        highlightFeature(action.layerName, action.propertyName, action.propertyValue);
        break;
      // Add more actions as needed
    }
  };
  
  // Zoom to a specific feature
  const zoomToFeature = async (layerName, propertyName, propertyValue) => {
    try {
      // Fetch the feature from GeoServer WFS
      const url = `${GEOSERVER_WFS_URL}?service=WFS&version=1.0.0&request=GetFeature&typeName=${GEOSERVER_WORKSPACE}:${layerName}&outputFormat=application/json&CQL_FILTER=${propertyName}='${propertyValue}'`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        // Parse the GeoJSON
        const format = new GeoJSON();
        const features = format.readFeatures(data, {
          featureProjection: mapInstanceRef.current.getView().getProjection()
        });
        
        if (features.length > 0) {
          // Create a vector layer for the feature
          const vectorSource = new VectorSource({
            features: features
          });
          
          // Get feature extent and zoom to it
          const extent = vectorSource.getExtent();
          mapInstanceRef.current.getView().fit(extent, {
            padding: [50, 50, 50, 50],
            duration: 1000
          });
          
          // Update status
          setTimeout(() => {
            const statusEvent = new CustomEvent('map-status', {
              detail: { status: 'Ready' }
            });
            window.dispatchEvent(statusEvent);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error zooming to feature:', error);
      
      // Update status on error
      const statusEvent = new CustomEvent('map-status', {
        detail: { status: 'Error: Failed to zoom to feature' }
      });
      window.dispatchEvent(statusEvent);
    }
  };
  
  // Zoom to coordinates
  const zoomToCoordinates = (coordinates, zoom = 12) => {
    if (!mapInstanceRef.current) return;
    
    const view = mapInstanceRef.current.getView();
    
    // Animate zoom
    view.animate({
      center: fromLonLat([coordinates.lng, coordinates.lat]),
      zoom: zoom,
      duration: 1000
    });
    
    // Update status after animation
    setTimeout(() => {
      const statusEvent = new CustomEvent('map-status', {
        detail: { status: 'Ready' }
      });
      window.dispatchEvent(statusEvent);
    }, 1000);
  };
  
  // Highlight a specific feature
  const highlightFeature = async (layerName, propertyName, propertyValue) => {
    try {
      // Fetch the feature from GeoServer WFS
      const url = `${GEOSERVER_WFS_URL}?service=WFS&version=1.0.0&request=GetFeature&typeName=${GEOSERVER_WORKSPACE}:${layerName}&outputFormat=application/json&CQL_FILTER=${propertyName}='${propertyValue}'`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        // Parse the GeoJSON
        const format = new GeoJSON();
        const features = format.readFeatures(data, {
          featureProjection: mapInstanceRef.current.getView().getProjection()
        });
        
        if (features.length > 0) {
          // Remove any existing highlight layer
          const layers = mapInstanceRef.current.getLayers().getArray();
          const highlightLayer = layers.find(layer => layer.get('id') === 'highlight');
          if (highlightLayer) {
            mapInstanceRef.current.removeLayer(highlightLayer);
          }
          
          // Create a new highlight layer
          const highlightSource = new VectorSource({
            features: features
          });
          
          const newHighlightLayer = new VectorLayer({
            source: highlightSource,
            style: new Style({
              fill: new Fill({
                color: 'rgba(244, 211, 94, 0.3)'
              }),
              stroke: new Stroke({
                color: '#F4D35E',
                width: 3,
                lineDash: [5, 5]
              })
            }),
            id: 'highlight',
            zIndex: 1000
          });
          
          // Add the highlight layer
          mapInstanceRef.current.addLayer(newHighlightLayer);
          
          // Get feature extent and zoom to it
          const extent = highlightSource.getExtent();
          mapInstanceRef.current.getView().fit(extent, {
            padding: [50, 50, 50, 50],
            duration: 1000
          });
          
          // Update status
          setTimeout(() => {
            const statusEvent = new CustomEvent('map-status', {
              detail: { status: 'Ready' }
            });
            window.dispatchEvent(statusEvent);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error highlighting feature:', error);
      
      // Update status on error
      const statusEvent = new CustomEvent('map-status', {
        detail: { status: 'Error: Failed to highlight feature' }
      });
      window.dispatchEvent(statusEvent);
    }
  };

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="ol-map w-full h-full"></div>
      
      {/* Feature Info */}
      {selectedFeature && (
        <div className="absolute bottom-4 left-4 max-w-xs bg-[#1B263B]/95 rounded-md border border-[#1A936F]/40 shadow-lg p-3 text-sm">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-[#F4D35E]">Feature Info</h4>
            <button 
              className="text-[#BFC0C0] hover:text-[#F0F3BD]"
              onClick={() => setSelectedFeature(null)}
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-xs">
              <tbody>
                {selectedFeature.properties && Object.entries(selectedFeature.properties)
                  .filter(([key]) => key !== 'geometry' && key !== 'geom')
                  .map(([key, value]) => (
                    <tr key={key} className="border-b border-[#1A936F]/10">
                      <td className="py-1 font-medium text-[#BFC0C0]">{key}</td>
                      <td className="py-1 text-[#F0F3BD]">{value ? value.toString() : ''}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};