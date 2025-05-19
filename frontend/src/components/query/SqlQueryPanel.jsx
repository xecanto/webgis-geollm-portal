import { h } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';
import { API_ENDPOINTS } from '../../config/env';

export const SqlQueryPanel = ({ onResultsGenerated, map }) => {
  const [query, setQuery] = useState('{"layer": "roads", "where": {"type": "primary"}, "limit": 10}');
  const [naturalQuery, setNaturalQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [queryHistory, setQueryHistory] = useState([]);
  const [queryMode, setQueryMode] = useState('json'); // 'json', 'sql', or 'natural'
  const [queryTemplates, setQueryTemplates] = useState([
    { name: 'All Primary Roads', query: '{"layer": "roads", "where": {"type": "primary"}, "limit": 10}' },
    { name: 'Buildings in Lahore', query: '{"layer": "buildings", "where": {"city": "Lahore"}, "limit": 50}' },
    { name: 'Punjab Province', query: '{"layer": "admin1", "where": {"name_1": "Punjab"}, "limit": 1}' },
    { name: 'Waterways by Type', query: '{"layer": "waterways", "where": {"type": "river"}, "limit": 20}' }
  ]);
  
  const textareaRef = useRef(null);
    // Execute query
  const executeQuery = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let endpoint = API_ENDPOINTS.SQL_QUERY;
      let requestBody;
      
      if (queryMode === 'json') {
        // Parse JSON query and validate
        let jsonQuery;
        try {
          jsonQuery = JSON.parse(query);
          
          // Validate JSON structure
          if (!jsonQuery.layer) {
            throw new Error('JSON query must include "layer" property');
          }
        } catch (parseErr) {
          throw new Error(`Invalid JSON format: ${parseErr.message}`);
        }
        
        requestBody = jsonQuery;
        endpoint = API_ENDPOINTS.JSON_QUERY;
      } else if (queryMode === 'natural') {
        // Natural language query
        if (!naturalQuery.trim()) {
          throw new Error('Please enter a natural language query');
        }
        requestBody = { natural_query: naturalQuery };
        endpoint = API_ENDPOINTS.SQL_QUERY;
      } else {
        // SQL mode
        requestBody = { sql: query };
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to execute query');
      }
      
      const data = await response.json();
      setResults(data);
      
      // Add to query history if not already present
      if (!queryHistory.includes(query)) {
        setQueryHistory(prev => [query, ...prev].slice(0, 10));
      }
      
      // Pass results to parent component
      if (onResultsGenerated) {
        onResultsGenerated(data);
      }
      
      // If there's geographic data and a map instance, zoom to it
      zoomToResults(data);
    } catch (err) {
      setError(err.message);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };
    // Load a query from history or template
  const loadQuery = (predefinedQuery) => {
    setQuery(predefinedQuery);
    adjustTextareaHeight();
  };
  
  // Set textarea height based on content
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(200, textareaRef.current.scrollHeight)}px`;
    }
  };
  
  // Handle query change
  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    adjustTextareaHeight();
  };
    // Switch query mode between SQL, JSON and Natural Language
  const toggleQueryMode = () => {
    if (queryMode === 'sql') {
      setQueryMode('natural');
      setNaturalQuery('Show me all primary roads');
    } else if (queryMode === 'natural') {
      setQueryMode('json');
      setQuery('{"layer": "roads", "where": {"type": "primary"}, "limit": 10}');
    } else {
      setQueryMode('sql');
      setQuery('SELECT * FROM roads WHERE type = \'primary\' LIMIT 10');
    }
    adjustTextareaHeight();
  };
  
  // Handle natural query change
  const handleNaturalQueryChange = (e) => {
    setNaturalQuery(e.target.value);
  };
  
  // Format GeoJSON for display in table
  const formatGeoJSON = (value) => {
    if (typeof value === 'object' && value !== null) {
      try {
        return JSON.stringify(value, null, 2).substring(0, 50) + '...';
      } catch (e) {
        return 'Complex GeoJSON';
      }
    }
    return value;
  };
  // Check if SQL query contains forbidden operations
  const hasForbiddenOperations = () => {
    // Only check for SQL mode
    if (queryMode !== 'sql') return false;
    
    const forbiddenTerms = ['delete', 'drop', 'update', 'insert', 'alter', 'truncate', 'grant', 'revoke', 'create'];
    const lowercaseQuery = query.toLowerCase();
    
    for (const term of forbiddenTerms) {
      // Check for full words using word boundaries
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      if (regex.test(lowercaseQuery)) {
        return true;
      }
    }
    
    return false;
  };
  
  // Download query results in specified format
  const downloadResults = async (format) => {
    if (!results || results.length === 0) return;
    
    try {
      setIsLoading(true);
      
      if (queryMode === 'json') {
        // For JSON mode, use the API's export functionality
        let jsonQuery;
        try {
          jsonQuery = JSON.parse(query);
          // Add export format
          jsonQuery.export_format = format;
        } catch (parseErr) {
          throw new Error(`Invalid JSON format: ${parseErr.message}`);
        }
        
        // Create a form to submit as POST
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = API_ENDPOINTS.JSON_QUERY;
        form.target = '_blank';
        
        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.name = 'data';
        hiddenField.value = JSON.stringify(jsonQuery);
        
        form.appendChild(hiddenField);
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      } else {
        // For SQL mode, handle export on client-side
        if (format === 'csv') {
          // Convert data to CSV
          const replacer = (key, value) => value === null ? '' : value;
          const header = Object.keys(results[0]).filter(key => key !== 'geom');
          const csv = [
            header.join(','),
            ...results.map(row => header.map(fieldName => 
              JSON.stringify(row[fieldName], replacer)).join(','))
          ].join('\r\n');
          
          // Download CSV file
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `query_results_${new Date().toISOString().slice(0,10)}.csv`;
          link.click();
          URL.revokeObjectURL(link.href);
        } else if (format === 'geojson') {
          // Convert to GeoJSON
          const features = results.map(row => {
            const properties = {...row};
            const geometry = properties.geom;
            delete properties.geom;
            
            return {
              type: 'Feature',
              geometry: geometry || null,
              properties
            };
          });
          
          const geojson = {
            type: 'FeatureCollection',
            features
          };
          
          // Download GeoJSON file
          const blob = new Blob([JSON.stringify(geojson)], { type: 'application/geo+json' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `query_results_${new Date().toISOString().slice(0,10)}.geojson`;
          link.click();
          URL.revokeObjectURL(link.href);
        }
      }
    } catch (err) {
      setError(`Error exporting data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
    // Check if JSON is valid
  const hasInvalidJSON = () => {
    if (queryMode !== 'json') return false;
    
    try {
      JSON.parse(query);
      return false;
    } catch (e) {
      return true;
    }
  };
    // Download query results as GeoJSON
  const downloadAsGeoJSON = async () => {
    if (!results || results.length === 0) {
      setError("No results to export");
      return;
    }
    
    setIsLoading(true);
    try {
      // Create a direct download using the current results
      // This is more reliable than making another API call
      const features = results.map(row => {
        const properties = {...row};
        const geometry = properties.geom;
        delete properties.geom;
        
        return {
          type: 'Feature',
          geometry: geometry || null,
          properties
        };
      });
      
      const geojson = {
        type: 'FeatureCollection',
        features
      };
      
      // Create and download the file
      const blob = new Blob([JSON.stringify(geojson, null, 2)], 
        { type: 'application/geo+json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `query_export_${new Date().toISOString().slice(0,10)}.geojson`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
        
      } else {
        // For SQL or natural language mode
        requestBody = {
          sql: queryMode === 'sql' ? query : undefined,
          natural_query: queryMode === 'natural' ? naturalQuery : undefined,
          export_format: 'geojson'
        };
        
        const response = await fetch(API_ENDPOINTS.SQL_QUERY, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        if (!response.ok) throw new Error('Failed to export data');
        
        // Get the blob
        const blob = await response.blob();
        
        // Create a link to download it
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `query_export_${new Date().toISOString().slice(0,10)}.geojson`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError(`Error exporting data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Execute query on Ctrl+Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!hasForbiddenOperations() && !hasInvalidJSON()) {
        executeQuery();
      }
    }
  };
  
  // Zoom to results on the map if they have geospatial data
  const zoomToResults = (data) => {
    if (!map || !data || data.length === 0) return;
    
    try {
      // Find if any results have geometry
      const geometryResults = data.filter(item => item.geom);
      
      if (geometryResults.length === 0) return;
      
      // Import required OpenLayers modules
      import('ol/format/GeoJSON').then(({default: GeoJSON}) => {
        import('ol/extent').then(({buffer, createEmpty, extend}) => {
          const format = new GeoJSON();
          let extent = createEmpty();
          
          // Collect all geometries and extend the bounding box
          geometryResults.forEach(item => {
            const feature = format.readFeature(item.geom, {
              dataProjection: 'EPSG:4326',
              featureProjection: map.getView().getProjection()
            });
            
            const geomExtent = feature.getGeometry().getExtent();
            extent = extend(extent, geomExtent);
          });
          
          // Add a buffer around the extent
          extent = buffer(extent, 100);
          
          // Animate to the extent
          map.getView().fit(extent, {
            duration: 1000,
            padding: [50, 50, 50, 50]
          });
          
          // Highlight the features on the map temporarily
          highlightFeatures(geometryResults);
        });
      });
    } catch (error) {
      console.error("Error zooming to results:", error);
    }
  };
  
  // Highlight features on map temporarily
  const highlightFeatures = (results) => {
    if (!map) return;
    
    // Import required OpenLayers modules
    import('ol/layer/Vector').then(({default: VectorLayer}) => {
      import('ol/source/Vector').then(({default: VectorSource}) => {
        import('ol/format/GeoJSON').then(({default: GeoJSON}) => {
          import('ol/style/Style').then(({default: Style}) => {
            import('ol/style/Fill').then(({default: Fill}) => {
              import('ol/style/Stroke').then(({default: Stroke}) => {
                import('ol/style/Circle').then(({default: Circle}) => {
                  // Create source and layer for highlights
                  const source = new VectorSource();
                  const layer = new VectorLayer({
                    source: source,
                    style: new Style({
                      fill: new Fill({
                        color: 'rgba(244, 211, 94, 0.4)'
                      }),
                      stroke: new Stroke({
                        color: '#F4D35E',
                        width: 3
                      }),
                      image: new Circle({
                        radius: 7,
                        fill: new Fill({
                          color: '#F4D35E'
                        })
                      })
                    }),
                    zIndex: 999
                  });
                  
                  // Add features to source
                  const format = new GeoJSON();
                  results.forEach(item => {
                    if (item.geom) {
                      const feature = format.readFeature(item.geom, {
                        dataProjection: 'EPSG:4326',
                        featureProjection: map.getView().getProjection()
                      });
                      source.addFeature(feature);
                    }
                  });
                  
                  // Add layer to map
                  map.addLayer(layer);
                  
                  // Remove after 5 seconds
                  setTimeout(() => {
                    map.removeLayer(layer);
                  }, 5000);
                });
              });
            });
          });
        });
      });
    });
  };
    return (
    <div className="space-y-4">
      <div className="bg-[#1B263B]/50 border border-[#1A936F]/30 rounded-md p-3">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[#F4D35E] font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">code</span>
            <span>Geospatial Query</span>
          </h3>
          <div className="flex gap-1">
            <button 
              className="text-[#BFC0C0] hover:text-[#F0F3BD] p-1 rounded hover:bg-[#1A936F]/20"
              title="Clear"
              onClick={() => setQuery('')}
            >
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
            <button 
              className="text-[#BFC0C0] hover:text-[#F0F3BD] p-1 rounded hover:bg-[#1A936F]/20"
              title="Toggle Query Mode"
              onClick={toggleQueryMode}
            >
              <span className="material-symbols-outlined text-sm">
                {queryMode === 'sql' ? 'data_object' : queryMode === 'natural' ? 'chat' : 'terminal'}
              </span>
            </button>
          </div>
        </div>
          <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs text-[#BFC0C0]">
              {queryMode === 'json' 
                ? 'Enter JSON query (automatically zooms to results):'
                : queryMode === 'natural'
                ? 'Describe what data you want in plain language:'
                : 'Enter SQL query (like Turbo Overpass - only SELECT operations allowed):'}
            </label>
            <span className="text-xs text-[#F4D35E] bg-[#1A936F]/20 px-2 py-0.5 rounded">
              {queryMode === 'json' ? 'JSON' : queryMode === 'natural' ? 'Natural Language' : 'SQL'}
            </span>
          </div>
          
          {queryMode === 'natural' ? (
            <textarea 
              ref={textareaRef}
              value={naturalQuery} 
              onChange={handleNaturalQueryChange}
              onKeyDown={handleKeyDown}
              className="w-full h-32 bg-[#1B263B] border border-[#1A936F]/30 rounded p-2 text-sm text-[#F0F3BD] resize-none focus:outline-none focus:border-[#1A936F] placeholder-[#BFC0C0]"
              placeholder="Example: Show me all the primary roads in Punjab province"
              spellCheck="true"
            />
          ) : (
            <textarea 
              ref={textareaRef}
              value={query} 
              onChange={handleQueryChange}
              onKeyDown={handleKeyDown}
              className="w-full h-32 bg-[#1B263B] border border-[#1A936F]/30 rounded p-2 text-sm text-[#F0F3BD] font-mono resize-none focus:outline-none focus:border-[#1A936F] placeholder-[#BFC0C0]"
              placeholder={queryMode === 'json' 
                ? '{"layer": "roads", "where": {"type": "primary"}, "limit": 10}'
                : "SELECT * FROM roads WHERE type = 'primary' LIMIT 10"
              }
              spellCheck="false"
            />
          )}
            <div className="flex justify-between items-center mt-1">
            <div className="text-xs text-[#BFC0C0] italic">
              Ctrl+Enter to run
            </div>
            {queryMode === 'sql' && hasForbiddenOperations() && (
              <div className="text-[#FF5733] text-xs">
                Unsafe SQL operations detected
              </div>
            )}
            {queryMode === 'json' && hasInvalidJSON() && (
              <div className="text-[#FF5733] text-xs">
                Invalid JSON format
              </div>
            )}
            {queryMode === 'natural' && naturalQuery.length < 3 && (
              <div className="text-[#FF5733] text-xs">
                Please enter a more detailed query
              </div>
            )}
          </div>
        </div>

        {queryMode === 'json' && (
          <div className="mb-3">
            <label className="block text-xs text-[#BFC0C0] mb-1">Query Templates:</label>
            <div className="grid grid-cols-2 gap-2">
              {queryTemplates.map((template, index) => (
                <button 
                  key={index}
                  onClick={() => loadQuery(template.query)}
                  className="text-left text-xs text-[#F0F3BD] py-1 px-2 bg-[#1A936F]/10 hover:bg-[#1A936F]/20 rounded truncate"
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {queryHistory.length > 0 && (
          <div className="mb-3">
            <label className="block text-xs text-[#BFC0C0] mb-1">Recent Queries:</label>
            <div className="max-h-32 overflow-y-auto">
              {queryHistory.map((histQuery, index) => (
                <button 
                  key={index}
                  onClick={() => loadQuery(histQuery)}
                  className="w-full text-left text-xs text-[#F0F3BD] py-1 px-2 hover:bg-[#1A936F]/10 rounded truncate block"
                >
                  {histQuery.length > 60 ? histQuery.substring(0, 60) + '...' : histQuery}
                </button>
              ))}
            </div>
          </div>
        )}
          <button 
          onClick={executeQuery}
          disabled={isLoading || 
            (queryMode === 'sql' && (hasForbiddenOperations() || !query.trim())) || 
            (queryMode === 'json' && (hasInvalidJSON() || !query.trim())) ||
            (queryMode === 'natural' && (!naturalQuery.trim() || naturalQuery.length < 3))
          }
          className={`w-full py-2 px-4 rounded text-white ${
            (queryMode === 'sql' && (hasForbiddenOperations() || !query.trim())) || 
            (queryMode === 'json' && (hasInvalidJSON() || !query.trim())) ||
            (queryMode === 'natural' && (!naturalQuery.trim() || naturalQuery.length < 3))
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-[#1A936F] hover:bg-[#1A936F]/80'
          } transition-colors flex items-center justify-center gap-2`}
        >
          {isLoading ? (
            <>
              <span className="animate-spin">◌</span>
              <span>Running Query...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">play_arrow</span>
              <span>Execute Query & Zoom to Results</span>
            </>
          )}
        </button>
      </div>
      
      {error && (
        <div className="bg-[#FF5733]/10 border border-[#FF5733]/30 rounded-md p-3 text-sm text-[#FF5733]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>Error:</span>
          </div>
          <pre className="mt-1 text-xs overflow-auto">{error}</pre>
        </div>
      )}
      
      {results && results.length > 0 && (
        <div className="bg-[#1B263B]/50 border border-[#1A936F]/30 rounded-md p-3">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[#F4D35E] font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">table_view</span>
              <span>Results ({results.length} rows)</span>
            </h3>            <div className="flex gap-1">
              <button 
                onClick={() => downloadAsGeoJSON()}
                className="text-[#BFC0C0] hover:text-[#F0F3BD] p-1 rounded hover:bg-[#1A936F]/20 flex items-center gap-1"
                title="Export as GeoJSON"
                disabled={isLoading}
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span className="text-xs hidden sm:inline">GeoJSON</span>
              </button>
              <button 
                className="text-[#BFC0C0] hover:text-[#F0F3BD] p-1 rounded hover:bg-[#1A936F]/20"
                title="Show on Map"
              >
                <span className="material-symbols-outlined text-sm">map</span>
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-auto border border-[#1A936F]/20 rounded">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#1A936F]/20 text-[#F0F3BD]">
                <tr>
                  {Object.keys(results[0]).map((key) => (
                    <th key={key} className="py-2 px-3 font-medium text-xs">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[#F0F3BD] text-xs">
                {results.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-[#1A936F]/5' : ''}>
                    {Object.entries(row).map(([key, value]) => (
                      <td key={key} className="py-1 px-3">
                        {key === 'geom' ? formatGeoJSON(value) : String(value !== null ? value : '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {results && results.length === 0 && (
        <div className="bg-[#1B263B]/50 border border-[#1A936F]/30 rounded-md p-3 text-center">
          <p className="text-[#BFC0C0] text-sm">Query executed successfully but returned no results</p>
        </div>
      )}
    </div>
  );
};
