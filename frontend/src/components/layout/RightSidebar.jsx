import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { API_ENDPOINTS } from '../../config/env';
import { SqlQueryPanel } from '../query/SqlQueryPanel';
import { MeasurementTools } from '../tools/MeasurementTools';
import { ExportTools } from '../tools/ExportTools';
import { CoordinateInput } from '../tools/CoordinateInput';

export const RightSidebar = ({ isOpen, map }) => {
  const [activeTab, setActiveTab] = useState('stats');
  const [layerStats, setLayerStats] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState('admin1');
  const [isLoading, setIsLoading] = useState(false);
  const [queryResults, setQueryResults] = useState(null);

  // Fetch layer statistics when the selected layer changes
  useEffect(() => {
    if (isOpen && selectedLayer) {
      fetchLayerStats(selectedLayer);
    }
  }, [isOpen, selectedLayer]);

  // Fetch layer statistics from the backend
  const fetchLayerStats = async (layerName) => {
    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.LAYER_STATS(layerName));
      
      if (!response.ok) {
        throw new Error('Failed to fetch layer statistics');
      }
      
      const data = await response.json();
      setLayerStats(data);
    } catch (error) {
      console.error('Error fetching layer statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle layer selection change
  const handleLayerChange = (e) => {
    setSelectedLayer(e.target.value);
  };

  return (
    <aside className={`w-80 bg-[#1B263B] border-l border-[#1A936F]/20 flex flex-col transition-all duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      {/* Tabs */}
      <div className="flex border-b border-[#1A936F]/20">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'stats'
              ? 'text-[#F4D35E] border-b-2 border-[#F4D35E]'
              : 'text-[#BFC0C0] hover:text-[#F0F3BD]'
          }`}
        >
          Statistics
        </button>
        <button
          onClick={() => setActiveTab('query')}
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'query'
              ? 'text-[#F4D35E] border-b-2 border-[#F4D35E]'
              : 'text-[#BFC0C0] hover:text-[#F0F3BD]'
          }`}
        >
          Query
        </button>
        <button
          onClick={() => setActiveTab('attributes')}
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'attributes'
              ? 'text-[#F4D35E] border-b-2 border-[#F4D35E]'
              : 'text-[#BFC0C0] hover:text-[#F0F3BD]'
          }`}
        >
          Attributes
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'tools'
              ? 'text-[#F4D35E] border-b-2 border-[#F4D35E]'
              : 'text-[#BFC0C0] hover:text-[#F0F3BD]'
          }`}
        >
          Tools
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-grow overflow-y-auto p-3">
        {activeTab === 'stats' && (
          <div className="space-y-4">
            {/* Layer selector */}
            <div className="bg-[#1B263B]/50 border border-[#1A936F]/30 rounded-md p-3">
              <label className="block text-sm text-[#BFC0C0] mb-2">Select Layer:</label>
              <select
                value={selectedLayer}
                onChange={handleLayerChange}
                className="w-full bg-[#1B263B] border border-[#1A936F]/40 rounded px-2 py-1 text-[#F0F3BD]"
              >
                <option value="admin0">Country Boundary</option>
                <option value="admin1">Provinces</option>
                <option value="admin2">Districts</option>
                <option value="admin3">Tehsils</option>
                <option value="roads">Roads</option>
                <option value="buildings">Buildings</option>
                <option value="waterways">Waterways</option>
                <option value="railways">Railways</option>
                <option value="landuse">Land Use</option>
              </select>
            </div>

            {/* Statistics Content */}
            <div className="bg-[#1B263B]/50 border border-[#1A936F]/30 rounded-md p-3">
              <h3 className="text-[#F4D35E] font-medium mb-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">analytics</span>
                <span>Layer Statistics</span>
              </h3>

              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-pulse text-[#BFC0C0]">Loading statistics...</div>
                </div>
              ) : layerStats ? (
                <div className="space-y-3">
                  {/* Layer info */}
                  <div className="bg-[#1A936F]/10 rounded p-2">
                    <h4 className="text-[#F0F3BD] text-sm font-medium mb-2">General Info</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-[#BFC0C0]">Name:</div>
                      <div className="text-[#F0F3BD]">{layerStats.name}</div>
                      <div className="text-[#BFC0C0]">Geometry Type:</div>
                      <div className="text-[#F0F3BD]">{layerStats.geometry_type}</div>
                      <div className="text-[#BFC0C0]">Feature Count:</div>
                      <div className="text-[#F0F3BD]">{layerStats.count.toLocaleString()}</div>
                      {layerStats.measure && (
                        <>
                          <div className="text-[#BFC0C0]">Total {layerStats.measure_unit === 'km²' ? 'Area' : 'Length'}:</div>
                          <div className="text-[#F0F3BD]">{layerStats.measure.toLocaleString()} {layerStats.measure_unit}</div>
                        </>
                      )}
                      <div className="text-[#BFC0C0]">SRID:</div>
                      <div className="text-[#F0F3BD]">{layerStats.srid}</div>
                    </div>
                  </div>

                  {/* Bounds */}
                  {layerStats.bounds && (
                    <div className="bg-[#1A936F]/10 rounded p-2">
                      <h4 className="text-[#F0F3BD] text-sm font-medium mb-2">Extent (Lon/Lat)</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-[#BFC0C0]">West:</div>
                        <div className="text-[#F0F3BD]">{layerStats.bounds.minX.toFixed(4)}°</div>
                        <div className="text-[#BFC0C0]">East:</div>
                        <div className="text-[#F0F3BD]">{layerStats.bounds.maxX.toFixed(4)}°</div>
                        <div className="text-[#BFC0C0]">South:</div>
                        <div className="text-[#F0F3BD]">{layerStats.bounds.minY.toFixed(4)}°</div>
                        <div className="text-[#BFC0C0]">North:</div>
                        <div className="text-[#F0F3BD]">{layerStats.bounds.maxY.toFixed(4)}°</div>
                      </div>
                    </div>
                  )}

                  {/* Column info */}
                  {layerStats.columns && layerStats.columns.length > 0 && (
                    <div className="bg-[#1A936F]/10 rounded p-2">
                      <h4 className="text-[#F0F3BD] text-sm font-medium mb-2">Attributes ({layerStats.columns.length})</h4>
                      <div className="max-h-40 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead className="text-[#BFC0C0]">
                            <tr>
                              <th className="text-left py-1">Column</th>
                              <th className="text-left py-1">Type</th>
                            </tr>
                          </thead>
                          <tbody>
                            {layerStats.columns.map((column, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-[#1A936F]/5' : ''}>
                                <td className="py-1">{column.name}</td>
                                <td className="py-1 text-[#BFC0C0]">{column.type}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 bg-[#1A936F]/20 hover:bg-[#1A936F]/30 text-[#F0F3BD] py-1 px-3 rounded text-xs flex items-center justify-center gap-1 transition-colors">
                      <span className="material-symbols-outlined text-sm">description</span>
                      <span>Export Report</span>
                    </button>
                    <button className="flex-1 bg-[#1A936F]/20 hover:bg-[#1A936F]/30 text-[#F0F3BD] py-1 px-3 rounded text-xs flex items-center justify-center gap-1 transition-colors">
                      <span className="material-symbols-outlined text-sm">zoom_in</span>
                      <span>Zoom to Extent</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-[#BFC0C0] text-sm">
                  No statistics available for this layer.
                </div>
              )}
            </div>

            {/* Display Chart */}
            {layerStats && layerStats.name.startsWith('admin') && (
              <div className="bg-[#1B263B]/50 border border-[#1A936F]/30 rounded-md p-3">
                <h3 className="text-[#F4D35E] font-medium mb-3 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">equalizer</span>
                  <span>Area Comparison</span>
                </h3>
                
                <div className="relative h-36 mt-4">
                  {/* Simulated bar chart - would be replaced with actual data in a production app */}
                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-1 h-28">
                    <div className="flex-1 bg-[#1A936F] h-[60%] rounded-t relative group">
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1B263B] text-[#F0F3BD] text-xs py-1 px-2 rounded whitespace-nowrap">
                        Punjab: 205,344 km²
                      </div>
                    </div>
                    <div className="flex-1 bg-[#F4D35E] h-[85%] rounded-t relative group">
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1B263B] text-[#F0F3BD] text-xs py-1 px-2 rounded whitespace-nowrap">
                        Balochistan: 347,190 km²
                      </div>
                    </div>
                    <div className="flex-1 bg-[#FF5733] h-[45%] rounded-t relative group">
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1B263B] text-[#F0F3BD] text-xs py-1 px-2 rounded whitespace-nowrap">
                        Sindh: 140,914 km²
                      </div>
                    </div>
                    <div className="flex-1 bg-[#3357FF] h-[35%] rounded-t relative group">
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1B263B] text-[#F0F3BD] text-xs py-1 px-2 rounded whitespace-nowrap">
                        KPK: 101,741 km²
                      </div>
                    </div>
                    <div className="flex-1 bg-[#FF33F3] h-[5%] rounded-t relative group">
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1B263B] text-[#F0F3BD] text-xs py-1 px-2 rounded whitespace-nowrap">
                        ICT: 906 km²
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-[#BFC0C0] text-xs text-center mt-2">
                  Hover over bars to see province areas
                </div>
              </div>
            )}
            
            {layerStats && (layerStats.name === 'roads' || layerStats.name === 'railways' || layerStats.name === 'waterways') && (
              <div className="bg-[#1B263B]/50 border border-[#1A936F]/30 rounded-md p-3">
                <h3 className="text-[#F4D35E] font-medium mb-3 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">straighten</span>
                  <span>Length Distribution</span>
                </h3>
                
                {/* Simple pie chart for demo purposes */}
                <div className="flex justify-center my-2">
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {/* These would be calculated values in a real implementation */}
                      <circle r="25" cx="50" cy="50" fill="transparent" stroke="#1A936F" stroke-width="50" stroke-dasharray="40 160" transform="rotate(-90 50 50)" />
                      <circle r="25" cx="50" cy="50" fill="transparent" stroke="#F4D35E" stroke-width="50" stroke-dasharray="25 160" transform="rotate(-50 50 50)" stroke-dashoffset="0" />
                      <circle r="25" cx="50" cy="50" fill="transparent" stroke="#FF5733" stroke-width="50" stroke-dasharray="20 160" transform="rotate(-25 50 50)" stroke-dashoffset="0" />
                      <circle r="25" cx="50" cy="50" fill="transparent" stroke="#3357FF" stroke-width="50" stroke-dasharray="15 160" transform="rotate(-5 50 50)" stroke-dashoffset="0" />
                      <circle r="15" cx="50" cy="50" fill="#1B263B" />
                    </svg>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="grid grid-cols-2 gap-1 text-xs mt-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-[#1A936F] rounded-sm"></div>
                    <span className="text-[#F0F3BD]">Primary (40%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-[#F4D35E] rounded-sm"></div>
                    <span className="text-[#F0F3BD]">Secondary (25%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-[#FF5733] rounded-sm"></div>
                    <span className="text-[#F0F3BD]">Tertiary (20%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-[#3357FF] rounded-sm"></div>
                    <span className="text-[#F0F3BD]">Other (15%)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'query' && (
          <SqlQueryPanel onResultsGenerated={setQueryResults} map={map} />
        )}
        
        {activeTab === 'attributes' && (
          <div className="space-y-4">
            <div className="bg-[#1B263B]/50 border border-[#1A936F]/30 rounded-md p-3">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-[#F4D35E] font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">table_view</span>
                  <span>Attribute Table</span>
                </h3>
                
                <div className="flex gap-1">
                  <button className="text-[#BFC0C0] hover:text-[#F0F3BD] p-1 rounded hover:bg-[#1A936F]/20">
                    <span className="material-symbols-outlined text-sm">filter_alt</span>
                  </button>
                  <button className="text-[#BFC0C0] hover:text-[#F0F3BD] p-1 rounded hover:bg-[#1A936F]/20">
                    <span className="material-symbols-outlined text-sm">search</span>
                  </button>
                  <button className="text-[#BFC0C0] hover:text-[#F0F3BD] p-1 rounded hover:bg-[#1A936F]/20">
                    <span className="material-symbols-outlined text-sm">download</span>
                  </button>
                </div>
              </div>
              
              <div className="mb-2">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-[#BFC0C0]">
                    <span className="material-symbols-outlined text-sm">search</span>
                  </span>
                  <input 
                    type="text" 
                    placeholder="Search features..."
                    className="bg-[#1B263B] border border-[#1A936F]/30 rounded py-1 pl-8 pr-2 w-full text-sm text-[#F0F3BD] placeholder-[#BFC0C0] focus:outline-none focus:border-[#1A936F]"
                  />
                </div>
              </div>
              
              {/* Sample attribute table */}
              <div className="max-h-96 overflow-auto border border-[#1A936F]/20 rounded">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#1A936F]/20 text-[#F0F3BD]">
                    <tr>
                      <th className="py-2 px-3 font-medium text-xs">FID</th>
                      <th className="py-2 px-3 font-medium text-xs">Name</th>
                      <th className="py-2 px-3 font-medium text-xs">Type</th>
                      <th className="py-2 px-3 font-medium text-xs">Area (km²)</th>
                    </tr>
                  </thead>
                  <tbody className="text-[#F0F3BD] text-xs">
                    <tr className="bg-[#1A936F]/5 hover:bg-[#1A936F]/10 cursor-pointer">
                      <td className="py-1 px-3">1</td>
                      <td className="py-1 px-3">Punjab</td>
                      <td className="py-1 px-3">Province</td>
                      <td className="py-1 px-3">205,344</td>
                    </tr>
                    <tr className="hover:bg-[#1A936F]/10 cursor-pointer">
                      <td className="py-1 px-3">2</td>
                      <td className="py-1 px-3">Sindh</td>
                      <td className="py-1 px-3">Province</td>
                      <td className="py-1 px-3">140,914</td>
                    </tr>
                    <tr className="bg-[#1A936F]/5 hover:bg-[#1A936F]/10 cursor-pointer">
                      <td className="py-1 px-3">3</td>
                      <td className="py-1 px-3">Khyber Pakhtunkhwa</td>
                      <td className="py-1 px-3">Province</td>
                      <td className="py-1 px-3">101,741</td>
                    </tr>
                    <tr className="hover:bg-[#1A936F]/10 cursor-pointer">
                      <td className="py-1 px-3">4</td>
                      <td className="py-1 px-3">Balochistan</td>
                      <td className="py-1 px-3">Province</td>
                      <td className="py-1 px-3">347,190</td>
                    </tr>
                    <tr className="bg-[#1A936F]/5 hover:bg-[#1A936F]/10 cursor-pointer">
                      <td className="py-1 px-3">5</td>
                      <td className="py-1 px-3">Islamabad Capital Territory</td>
                      <td className="py-1 px-3">Federal Territory</td>
                      <td className="py-1 px-3">906</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-between items-center mt-2 text-xs text-[#BFC0C0]">
                <div>Showing 5 of 5 features</div>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-[#1A936F]/20 disabled:opacity-50" disabled>
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <button className="p-1 rounded hover:bg-[#1A936F]/20 disabled:opacity-50" disabled>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-4">
            <div className="bg-[#1B263B]/50 border border-[#1A936F]/30 rounded-md p-3">
              <h3 className="text-[#F4D35E] font-medium mb-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">draw</span>
                <span>Drawing Tools</span>
              </h3>
              
              <div className="grid grid-cols-4 gap-2 mb-3">
                <button className="bg-[#1A936F]/10 hover:bg-[#1A936F]/20 text-[#F0F3BD] p-2 rounded flex flex-col items-center gap-1 transition-colors text-xs">
                  <span className="material-symbols-outlined">edit</span>
                  <span>Point</span>
                </button>
                <button className="bg-[#1A936F]/10 hover:bg-[#1A936F]/20 text-[#F0F3BD] p-2 rounded flex flex-col items-center gap-1 transition-colors text-xs">
                  <span className="material-symbols-outlined">polyline</span>
                  <span>Line</span>
                </button>
                <button className="bg-[#1A936F]/10 hover:bg-[#1A936F]/20 text-[#F0F3BD] p-2 rounded flex flex-col items-center gap-1 transition-colors text-xs">
                  <span className="material-symbols-outlined">square</span>
                  <span>Polygon</span>
                </button>
                <button className="bg-[#1A936F]/10 hover:bg-[#1A936F]/20 text-[#F0F3BD] p-2 rounded flex flex-col items-center gap-1 transition-colors text-xs">
                  <span className="material-symbols-outlined">circle</span>
                  <span>Circle</span>
                </button>
              </div>
              
              {/* Measurement Tools */}
              <MeasurementTools map={map} />
            </div>
            
            <div className="bg-[#1B263B]/50 border border-[#1A936F]/30 rounded-md p-3">
              <h3 className="text-[#F4D35E] font-medium mb-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">share</span>
                <span>Export & Share</span>
              </h3>
              
              {/* Export Tools */}
              <ExportTools map={map} />
            </div>
            
            <div className="bg-[#1B263B]/50 border border-[#1A936F]/30 rounded-md p-3">
              <h3 className="text-[#F4D35E] font-medium mb-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">gps_fixed</span>
                <span>Coordinate Input</span>
              </h3>
              
              {/* Coordinate Input */}
              <CoordinateInput map={map} />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};