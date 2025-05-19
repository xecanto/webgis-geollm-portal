import { h } from 'preact';

export const Header = ({ 
  mapLabels, 
  terrain, 
  basemap,
  onMapLabelsChange,
  onTerrainChange,
  onBasemapChange
}) => {
  return (
    <header className="h-16 bg-[#1B263B] border-b border-[#1A936F]/20 flex items-center justify-between px-4">
      {/* Logo & Title */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-[#1A936F] rounded-lg flex items-center justify-center text-[#F0F3BD]">
          <span className="material-symbols-outlined">location_on</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#F0F3BD]">MapStore</h1>
          <p className="text-xs text-[#BFC0C0]">Spatial Data Infrastructure</p>
        </div>
      </div>
      
      {/* Map Controls */}
      <div className="flex items-center gap-4">
        {/* Basemap selector */}
        <div className="flex items-center gap-2">
          <span className="text-[#BFC0C0] text-sm">Basemap:</span>
          <div className="flex bg-[#1B263B]/70 rounded-md border border-[#1A936F]/20 overflow-hidden">
            <button 
              className={`px-3 py-1 text-sm ${basemap === 'light' ? 'bg-[#1A936F] text-[#F0F3BD]' : 'text-[#BFC0C0] hover:bg-[#1A936F]/20'}`}
              onClick={() => onBasemapChange('light')}
            >
              Light
            </button>
            <button 
              className={`px-3 py-1 text-sm ${basemap === 'dark' ? 'bg-[#1A936F] text-[#F0F3BD]' : 'text-[#BFC0C0] hover:bg-[#1A936F]/20'}`}
              onClick={() => onBasemapChange('dark')}
            >
              Dark
            </button>
            <button 
              className={`px-3 py-1 text-sm ${basemap === 'satellite' ? 'bg-[#1A936F] text-[#F0F3BD]' : 'text-[#BFC0C0] hover:bg-[#1A936F]/20'}`}
              onClick={() => onBasemapChange('satellite')}
            >
              Satellite
            </button>
          </div>
        </div>
        
        {/* Toggle for map labels */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={mapLabels} 
            onChange={(e) => onMapLabelsChange(e.target.checked)}
            className="accent-[#1A936F]"
          />
          <span className="text-[#BFC0C0] text-sm">Labels</span>
        </label>
        
        {/* Toggle for terrain */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={terrain} 
            onChange={(e) => onTerrainChange(e.target.checked)}
            className="accent-[#1A936F]"
          />
          <span className="text-[#BFC0C0] text-sm">Terrain</span>
        </label>
      </div>
      
      {/* User Menu */}
      <div className="flex items-center gap-2">
        <button className="w-9 h-9 rounded-full bg-[#1B263B]/70 border border-[#1A936F]/30 text-[#1A936F] flex items-center justify-center hover:bg-[#1A936F]/10 transition-colors">
          <span className="material-symbols-outlined">help</span>
        </button>
        <button className="w-9 h-9 rounded-full bg-[#1B263B]/70 border border-[#1A936F]/30 text-[#1A936F] flex items-center justify-center hover:bg-[#1A936F]/10 transition-colors">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="w-9 h-9 rounded-full bg-[#F4D35E] flex items-center justify-center text-[#1B263B] font-bold">U</div>
      </div>
    </header>
  );
};