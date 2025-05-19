import { h } from 'preact';

export const DashboardSummary = () => {
  return (
    <aside className="px-4 py-3 bg-[#1A936F]/10 rounded-lg mx-4 my-4 border border-[#1A936F]/30">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-[#F4D35E]">dashboard</span>
          Dashboard Summary
        </h3>
        <span className="text-xs text-[#BFC0C0]">Last updated: Today, 10:45 AM</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-[#1B263B]/60 rounded-lg border border-[#1A936F]/20 hover:border-[#1A936F]/50 transition-all transform hover:translate-y-[-2px]">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#BFC0C0]">Coverage Area</span>
            <span className="material-symbols-outlined text-[#F4D35E] text-sm">trending_up</span>
          </div>
          <div className="mt-1">
            <span className="text-xl font-bold">796,095</span>
            <span className="text-xs ml-1">km²</span>
          </div>
          <div className="mt-2 w-full h-1.5 bg-[#1B263B] rounded-full overflow-hidden">
            <div className="bg-[#1A936F] h-full w-[85%]"></div>
          </div>
        </div>
        <div className="p-3 bg-[#1B263B]/60 rounded-lg border border-[#1A936F]/20 hover:border-[#1A936F]/50 transition-all transform hover:translate-y-[-2px]">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#BFC0C0]">Data Points</span>
            <span className="material-symbols-outlined text-[#F4D35E] text-sm">data_array</span>
          </div>
          <div className="mt-1">
            <span className="text-xl font-bold">3.2M</span>
            <span className="text-xs ml-1">samples</span>
          </div>
          <div className="mt-2 w-full h-1.5 bg-[#1B263B] rounded-full overflow-hidden">
            <div className="bg-[#F4D35E] h-full w-[65%]"></div>
          </div>
        </div>
        <div className="p-3 bg-[#1B263B]/60 rounded-lg border border-[#1A936F]/20 hover:border-[#1A936F]/50 transition-all transform hover:translate-y-[-2px]">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#BFC0C0]">LST Average</span>
            <span className="material-symbols-outlined text-[#F4D35E] text-sm">device_thermostat</span>
          </div>
          <div className="mt-1">
            <span className="text-xl font-bold">32.7</span>
            <span className="text-xs ml-1">°C</span>
          </div>
          <div className="mt-2 w-full h-1.5 bg-[#1B263B] rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-red-500 h-full w-[72%]"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};