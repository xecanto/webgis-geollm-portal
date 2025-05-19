import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Header } from '../components/layout/Header';
import { LeftSidebar } from '../components/layout/LeftSidebar';
import { RightSidebar } from '../components/layout/RightSidebar';
import { Footer } from '../components/layout/Footer';
import { MapComponent } from '../components/map/Map';
import { TemperatureTrends } from '../components/dashboard/TemperatureTrends';
import { GeoLLMChat } from '../components/ui/GeoLLMChat';

export const Dashboard = () => {
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [mapLabels, setMapLabels] = useState(false);
  const [terrain, setTerrain] = useState(false);
  const [basemap, setBasemap] = useState('light');
  const [mapInstance, setMapInstance] = useState(null);

  return (
    <div className="w-full min-h-screen bg-[#1B263B] font-sans text-[#F0F3BD] p-0">
      <Header 
        onMapLabelsChange={setMapLabels}
        onTerrainChange={setTerrain}
        onBasemapChange={setBasemap}
        mapLabels={mapLabels}
        terrain={terrain}
        basemap={basemap}
      />
      
      <div className="flex h-[calc(100vh-64px-80px)]">
        <LeftSidebar />
        
        <main className="flex-grow relative bg-[#1B263B]/70">
          <div className="absolute inset-4 rounded-lg overflow-hidden border border-[#1A936F]/20 bg-[#1B263B]/30">
            <MapComponent 
              basemap={basemap} 
              mapLabels={mapLabels} 
              terrain={terrain}
              onMapInit={setMapInstance}
            />
            
            <TemperatureTrends />
            
            {/* Swipe handle - would be visible when swipe mode is active */}
            <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 bg-[#F4D35E] opacity-0 hover:opacity-100 cursor-ew-resize transition-opacity flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#F4D35E] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#1B263B]">sync_alt</span>
              </div>
            </div>
            
            {/* Animation overlay - would be visible when animation mode is active */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#1B263B]/85 rounded-full py-1 px-4 border border-[#1A936F]/40 opacity-0 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#1A936F]/20 transition-all">
                  <span className="material-symbols-outlined">skip_previous</span>
                </button>
                <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#1A936F]/20 transition-all">
                  <span className="material-symbols-outlined">play_arrow</span>
                </button>
                <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#1A936F]/20 transition-all">
                  <span className="material-symbols-outlined">skip_next</span>
                </button>
              </div>
            </div>
            
            {/* Toast notification */}
            <div className="absolute top-4 left-4 bg-[#1A936F]/90 text-[#F0F3BD] py-2 px-4 rounded-md shadow-lg transform transition-all duration-500 flex items-center gap-2 opacity-0 hover:opacity-100">
              <span className="material-symbols-outlined">info</span>
              <span className="text-sm">Analysis complete for selected region</span>
              <button className="ml-2 opacity-70 hover:opacity-100">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            
            <GeoLLMChat />
          </div>
        </main>
        
        <RightSidebar isOpen={rightSidebarOpen} map={mapInstance} />
      </div>
      
      <Footer />
    </div>
  );
};