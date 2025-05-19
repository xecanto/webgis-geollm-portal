import { h } from 'preact';
import { useState } from 'preact/hooks';

export const ExportDialog = ({ isOpen, onClose, results, exportData }) => {
  const [exportFormat, setExportFormat] = useState('geojson');
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectAll, setSelectAll] = useState(true);
  
  if (!isOpen) return null;
  
  // Handle feature selection
  const toggleFeatureSelection = (index) => {
    if (selectedFeatures.includes(index)) {
      setSelectedFeatures(selectedFeatures.filter(i => i !== index));
    } else {
      setSelectedFeatures([...selectedFeatures, index]);
    }
  };
  
  // Toggle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedFeatures([]);
    } else {
      setSelectedFeatures(Array.from({ length: results.length }, (_, i) => i));
    }
    setSelectAll(!selectAll);
  };
  
  // Execute the export with selected features
  const handleExport = () => {
    // If all are selected or none are selected, export all
    const dataToExport = selectedFeatures.length > 0 
      ? results.filter((_, index) => selectedFeatures.includes(index))
      : results;
      
    exportData(dataToExport, exportFormat);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1B263B] border border-[#1A936F]/30 rounded-lg max-w-xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-[#1A936F]/30 flex justify-between items-center">
          <h3 className="text-[#F4D35E] font-medium">Export Data</h3>
          <button 
            onClick={onClose}
            className="text-[#BFC0C0] hover:text-[#F0F3BD] p-1"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-auto">
          <div className="mb-4">
            <label className="block text-[#F0F3BD] mb-1">Export Format</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="exportFormat" 
                  value="geojson" 
                  checked={exportFormat === 'geojson'} 
                  onChange={() => setExportFormat('geojson')}
                  className="accent-[#1A936F]"
                />
                <span className="text-[#BFC0C0]">GeoJSON</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="exportFormat" 
                  value="csv" 
                  checked={exportFormat === 'csv'} 
                  onChange={() => setExportFormat('csv')}
                  className="accent-[#1A936F]"
                />
                <span className="text-[#BFC0C0]">CSV</span>
              </label>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[#F0F3BD]">Select Features to Export</label>
              <button 
                onClick={handleSelectAll}
                className="text-xs text-[#1A936F] hover:underline"
              >
                {selectAll ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            <div className="max-h-60 overflow-y-auto border border-[#1A936F]/20 rounded p-1">
              {results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((result, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-2 p-2 rounded hover:bg-[#1A936F]/10 ${
                        selectedFeatures.includes(index) || selectAll ? 'bg-[#1A936F]/20' : ''
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedFeatures.includes(index) || selectAll}
                        onChange={() => toggleFeatureSelection(index)}
                        className="accent-[#1A936F]"
                      />
                      <div className="text-sm text-[#BFC0C0] truncate">
                        {Object.entries(result)
                          .filter(([key]) => key !== 'geom')
                          .slice(0, 3)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(' | ')}
                        {Object.keys(result).length > 4 ? '...' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 text-[#BFC0C0]">
                  No results to export
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-[#1A936F]/30 flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded border border-[#1A936F]/30 text-[#BFC0C0] hover:bg-[#1A936F]/10"
          >
            Cancel
          </button>
          <button 
            onClick={handleExport}
            className="px-4 py-2 rounded bg-[#1A936F] text-white hover:bg-[#1A936F]/80 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};
