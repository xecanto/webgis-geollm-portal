/**
 * Environment variables configuration for GeoLLM frontend
 * Centralizes all configuration in one place for easier maintenance
 */

// API connection
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');

// Map configuration
export const GEOSERVER_URL = import.meta.env.VITE_GEOSERVER_URL || 'http://localhost:8070/geoserver';
export const GEOSERVER_WORKSPACE = import.meta.env.VITE_GEOSERVER_WORKSPACE || 'pakistan';
export const DEFAULT_MAP_CENTER = (import.meta.env.VITE_DEFAULT_MAP_CENTER || '69.3451,30.3753').split(',').map(Number);
export const DEFAULT_MAP_ZOOM = parseInt(import.meta.env.VITE_DEFAULT_MAP_ZOOM || '5');

// Feature flags
export const ENABLE_GEOLLM = import.meta.env.VITE_ENABLE_GEOLLM === 'true';
export const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

// UI configuration
export const DEFAULT_BASEMAP = import.meta.env.VITE_DEFAULT_BASEMAP || 'light';
export const DEFAULT_THEME = import.meta.env.VITE_DEFAULT_THEME || 'dark';

// Derived configuration
export const GEOSERVER_WMS_URL = `${GEOSERVER_URL}/${GEOSERVER_WORKSPACE}/wms`;
export const GEOSERVER_WFS_URL = `${GEOSERVER_URL}/${GEOSERVER_WORKSPACE}/ows`;

// API endpoints
export const API_ENDPOINTS = {
  CHAT: `${API_URL}/chat`,
  GEOSPATIAL_ANALYZE: `${API_URL}/geospatial/analyze`,
  HEALTH_CHECK: `${API_URL}/health`,
  LAYER_STATS: (layerName) => `${API_URL}/layer_stats/${layerName}`,
  SQL_QUERY: `${API_URL}/query`,
  JSON_QUERY: `${API_URL}/json_query`,
  MEASURE_DISTANCE: `${API_URL}/measure/distance`,
  MEASURE_AREA: `${API_URL}/measure/area`
};

// Default export for importing all config at once
export default {
  API_URL,
  API_TIMEOUT,
  GEOSERVER_URL,
  GEOSERVER_WORKSPACE,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  ENABLE_GEOLLM,
  ENABLE_ANALYTICS,
  DEFAULT_BASEMAP,
  DEFAULT_THEME,
  GEOSERVER_WMS_URL,
  GEOSERVER_WFS_URL,
  API_ENDPOINTS
};