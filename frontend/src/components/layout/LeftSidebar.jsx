import { h } from 'preact';
import { useState } from 'preact/hooks';

export const LeftSidebar = () => {
  const [activeTab, setActiveTab] = useState('layers');
  // Dispatch layer toggle events
  const handleToggle = (layerKey) => (e) => {
    window.dispatchEvent(new CustomEvent('map-toggle-layer', {
      detail: { layer: layerKey, visible: e.target.checked }
    }));
  };

  return (
    <aside className="w-64 bg-[#1B263B] border-r border-[#1A936F]/20 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-[#1A936F]/20">
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'layers'
              ? 'text-[#F4D35E] border-b-2 border-[#F4D35E]'
              : 'text-[#BFC0C0] hover:text-[#F0F3BD]'
          }`}
        >
          Layers
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'analysis'
              ? 'text-[#F4D35E] border-b-2 border-[#F4D35E]'
              : 'text-[#BFC0C0] hover:text-[#F0F3BD]'
          }`}
        >
          Analysis
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'bookmarks'
              ? 'text-[#F4D35E] border-b-2 border-[#F4D35E]'
              : 'text-[#BFC0C0] hover:text-[#F0F3BD]'
          }`}
        >
          Bookmarks
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-grow overflow-y-auto p-3">
        {activeTab === 'layers' && (
          <div className="space-y-3">
            <div className="bg-[#1B263B]/50 border border-[#1A936F]/30 rounded-md overflow-hidden">
              <div className="bg-[#1A936F]/20 py-2 px-3 font-medium text-[#F0F3BD] flex items-center justify-between">
                <span>Administrative</span>
                <span className="material-symbols-outlined text-sm cursor-pointer hover:text-[#F4D35E]">expand_more</span>
              </div>
              <div className="py-2 px-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked onChange={handleToggle('admin0')} className="accent-[#1A936F]" />
                    <span className="text-[#F0F3BD]">Country Boundary</span>
                  </label>
                  <button className="text-[#BFC0C0] hover:text-[#F0F3BD]">
                    <span className="material-symbols-outlined text-sm">info</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked onChange={handleToggle('admin1')} className="accent-[#1A936F]" />
                    <span className="text-[#F0F3BD]">Provinces</span>
                  </label>
                  <button className="text-[#BFC0C0] hover:text-[#F0F3BD]">
                    <span className="material-symbols-outlined text-sm">info</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked={false} onChange={handleToggle('admin2')} className="accent-[#1A936F]" />
                    <span className="text-[#F0F3BD]">Districts</span>
                  </label>
                  <button className="text-[#BFC0C0] hover:text-[#F0F3BD]">
                    <span className="material-symbols-outlined text-sm">info</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked={false} onChange={handleToggle('admin3')} className="accent-[#1A936F]" />
                    <span className="text-[#F0F3BD]">Tehsils</span>
                  </label>
                  <button className="text-[#BFC0C0] hover:text-[#F0F3BD]">
                    <span className="material-symbols-outlined text-sm">info</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#1B263B]/50 border border-[#1A936F]/30 rounded-md overflow-hidden">
              <div className="bg-[#1A936F]/20 py-2 px-3 font-medium text-[#F0F3BD] flex items-center justify-between">
                <span>OSM Features</span>
                <span className="material-symbols-outlined text-sm cursor-pointer hover:text-[#F4D35E]">expand_more</span>
              </div>
              <div className="py-2 px-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked={false} onChange={handleToggle('roads')} className="accent-[#1A936F]" />
                    <span className="text-[#F0F3BD]">Roads</span>
                  </label>
                  <button className="text-[#BFC0C0] hover:text-[#F0F3BD]">
                    <span className="material-symbols-outlined text-sm">info</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked={false} onChange={handleToggle('buildings')} className="accent-[#1A936F]" />
                    <span className="text-[#F0F3BD]">Buildings</span>
                  </label>
                  <button className="text-[#BFC0C0] hover:text-[#F0F3BD]">
                    <span className="material-symbols-outlined text-sm">info</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked={false} onChange={handleToggle('waterways')} className="accent-[#1A936F]" />
                    <span className="text-[#F0F3BD]">Waterways</span>
                  </label>
                  <button className="text-[#BFC0C0] hover:text-[#F0F3BD]">
                    <span className="material-symbols-outlined text-sm">info</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked={false} onChange={handleToggle('railways')} className="accent-[#1A936F]" />
                    <span className="text-[#F0F3BD]">Railways</span>
                  </label>
                  <button className="text-[#BFC0C0] hover:text-[#F0F3BD]">
                    <span className="material-symbols-outlined text-sm">info</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked={false} onChange={handleToggle('landuse')} className="accent-[#1A936F]" />
                    <span className="text-[#F0F3BD]">Land Use</span>
                  </label>
                  <button className="text-[#BFC0C0] hover:text-[#F0F3BD]">
                    <span className="material-symbols-outlined text-sm">info</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#1B263B]/50 border border-[#1A936F]/30 rounded-md overflow-hidden">
              <div className="bg-[#1A936F]/20 py-2 px-3 font-medium text-[#F0F3BD] flex items-center justify-between">
                <span>Raster Layers</span>
                <span className="material-symbols-outlined text-sm cursor-pointer hover:text-[#F4D35E]">expand_more</span>
              </div>
              <div className="py-2 px-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-[#1A936F]" />
                    <span className="text-[#F0F3BD]">Land Surface Temperature</span>
                  </label>
                  <button className="text-[#BFC0C0] hover:text-[#F0F3BD]">
                    <span className="material-symbols-outlined text-sm">info</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-[#1A936F]" />
                    <span className="text-[#F0F3BD]">Elevation</span>
                  </label>
                  <button className="text-[#BFC0C0] hover:text-[#F0F3BD]">
                    <span className="material-symbols-outlined text-sm">info</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" disabled className="accent-[#1A936F] opacity-50" />
                    <span className="text-[#BFC0C0]">Land Cover (Coming Soon)</span>
                  </label>
                  <button className="text-[#BFC0C0] hover:text-[#F0F3BD]">
                    <span className="material-symbols-outlined text-sm">info</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-4">
            <div className="bg-[#1B263B]/50 border border-[#1A936F]/30 rounded-md p-3">
              <h3 className="text-[#F4D35E] font-medium mb-2">Spatial Analysis</h3>
              
              <div className="space-y-2">
                <button className="w-full text-left text-sm bg-[#1A936F]/10 hover:bg-[#1A936F]/20 text-[#F0F3BD] py-2 px-3 rounded flex items-center gap-2 transition-colors">
                  <span className="material-symbols-outlined text-sm">select_all</span>
                  <span>Buffer Analysis</span>
                </button>
                
                <button className="w-full text-left text-sm bg-[#1A936F]/10 hover:bg-[#1A936F]/20 text-[#F0F3BD] py-2 px-3 rounded flex items-center gap-2 transition-colors">
                  <span className="material-symbols-outlined text-sm">join_full</span>
                  <span>Overlay Analysis</span>
                </button>
                
                <button className="w-full text-left text-sm bg-[#1A936F]/10 hover:bg-[#1A936F]/20 text-[#F0F3BD] py-2 px-3 rounded flex items-center gap-2 transition-colors">
                  <span className="material-symbols-outlined text-sm">polyline</span>
                  <span>Proximity Analysis</span>
                </button>
              </div>
            </div>
            
            <div className="bg-[#1B263B]/50 border border-[#1A936F]/30 rounded-md p-3">
              <h3 className="text-[#F4D35E] font-medium mb-2">Statistics</h3>
              
              <div className="space-y-2">
                <button className="w-full text-left text-sm bg-[#1A936F]/10 hover:bg-[#1A936F]/20 text-[#F0F3BD] py-2 px-3 rounded flex items-center gap-2 transition-colors">
                  <span className="material-symbols-outlined text-sm">query_stats</span>
                  <span>Zonal Statistics</span>
                </button>
                
                <button className="w-full text-left text-sm bg-[#1A936F]/10 hover:bg-[#1A936F]/20 text-[#F0F3BD] py-2 px-3 rounded flex items-center gap-2 transition-colors">
                  <span className="material-symbols-outlined text-sm">bar_chart</span>
                  <span>Generate Reports</span>
                </button>
              </div>
            </div>
            
            <div className="bg-[#1B263B]/50 border border-[#1A936F]/30 rounded-md p-3">
              <h3 className="text-[#F4D35E] font-medium mb-2">Tools</h3>
              
              <div className="space-y-2">
                <button className="w-full text-left text-sm bg-[#1A936F]/10 hover:bg-[#1A936F]/20 text-[#F0F3BD] py-2 px-3 rounded flex items-center gap-2 transition-colors">
                  <span className="material-symbols-outlined text-sm">draw</span>
                  <span>Draw & Measure</span>
                </button>
                
                <button className="w-full text-left text-sm bg-[#1A936F]/10 hover:bg-[#1A936F]/20 text-[#F0F3BD] py-2 px-3 rounded flex items-center gap-2 transition-colors">
                  <span className="material-symbols-outlined text-sm">file_download</span>
                  <span>Export Data</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div className="space-y-4">
            <div className="bg-[#1B263B]/50 border border-[#1A936F]/30 rounded-md overflow-hidden">
              <div className="bg-[#1A936F]/20 py-2 px-3 font-medium text-[#F0F3BD] flex items-center justify-between">
                <span>Saved Locations</span>
                <button className="text-[#BFC0C0] hover:text-[#F0F3BD]">
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
              
              <div className="py-2 px-3 space-y-2">
                <button className="w-full text-left text-sm bg-[#1A936F]/10 hover:bg-[#1A936F]/20 text-[#F0F3BD] py-2 px-3 rounded flex items-center gap-2 transition-colors">
                  <span className="material-symbols-outlined text-sm">bookmark</span>
                  <div>
                    <div>Islamabad Capital Territory</div>
                    <div className="text-xs text-[#BFC0C0]">Administrative Area</div>
                  </div>
                </button>
                
                <button className="w-full text-left text-sm bg-[#1A936F]/10 hover:bg-[#1A936F]/20 text-[#F0F3BD] py-2 px-3 rounded flex items-center gap-2 transition-colors">
                  <span className="material-symbols-outlined text-sm">bookmark</span>
                  <div>
                    <div>Lahore City</div>
                    <div className="text-xs text-[#BFC0C0]">Urban Area</div>
                  </div>
                </button>
                
                <button className="w-full text-left text-sm bg-[#1A936F]/10 hover:bg-[#1A936F]/20 text-[#F0F3BD] py-2 px-3 rounded flex items-center gap-2 transition-colors">
                  <span className="material-symbols-outlined text-sm">bookmark</span>
                  <div>
                    <div>Karachi Harbor</div>
                    <div className="text-xs text-[#BFC0C0]">Port Facility</div>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="bg-[#1B263B]/50 border border-[#1A936F]/30 rounded-md overflow-hidden">
              <div className="bg-[#1A936F]/20 py-2 px-3 font-medium text-[#F0F3BD] flex items-center justify-between">
                <span>Recent Views</span>
                <button className="text-[#BFC0C0] hover:text-[#F0F3BD]">
                  <span className="material-symbols-outlined text-sm">history</span>
                </button>
              </div>
              
              <div className="py-2 px-3 space-y-2">
                <button className="w-full text-left text-sm bg-[#1A936F]/10 hover:bg-[#1A936F]/20 text-[#F0F3BD] py-2 px-3 rounded flex items-center gap-2 transition-colors">
                  <span className="material-symbols-outlined text-sm">history</span>
                  <div>
                    <div>Sindh Province Overview</div>
                    <div className="text-xs text-[#BFC0C0]">5 minutes ago</div>
                  </div>
                </button>
                
                <button className="w-full text-left text-sm bg-[#1A936F]/10 hover:bg-[#1A936F]/20 text-[#F0F3BD] py-2 px-3 rounded flex items-center gap-2 transition-colors">
                  <span className="material-symbols-outlined text-sm">history</span>
                  <div>
                    <div>Punjab Roads Analysis</div>
                    <div className="text-xs text-[#BFC0C0]">Yesterday</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};