import { h } from 'preact';
import { useState } from 'preact/hooks';
import { API_ENDPOINTS } from '../../config/env';

export const MapExportTool = ({ map }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState('png');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const exportMap = async () => {
    if (!map || isExporting) return;
    
    try {
      setIsExporting(true);
      
      // Wait for any ongoing rendering to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get the map canvas and convert to data URL
      const mapCanvas = map.getTargetElement().querySelector('canvas');
      if (!mapCanvas) {
        throw new Error('Map canvas not found');
      }
      
      // Create a data URL from the canvas
      const dataUrl = mapCanvas.toDataURL(`image/${format}`);
      
      // Send to server for download
      const response = await fetch(API_ENDPOINTS.JSON_QUERY + '/download_map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: dataUrl,
          format: format
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate map export');
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `map_export_${new Date().toISOString().slice(0,10)}.${format}`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting map:', err);
      alert(`Error exporting map: ${err.message}`);
    } finally {
      setIsExporting(false);
      setShowDropdown(false);
    }
  };
  
  const exportMapClient = () => {
    if (!map || isExporting) return;
    
    try {
      setIsExporting(true);
      
      // Get the map canvas
      const mapCanvas = map.getTargetElement().querySelector('canvas');
      if (!mapCanvas) {
        throw new Error('Map canvas not found');
      }
      
      // Create a download link for the canvas as an image
      const link = document.createElement('a');
      link.download = `map_export_${new Date().toISOString().slice(0,10)}.${format}`;
      link.href = mapCanvas.toDataURL(`image/${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting map:', err);
      alert(`Error exporting map: ${err.message}`);
    } finally {
      setIsExporting(false);
      setShowDropdown(false);
    }
  };
  
  return (
    <div className="relative">
      <button
        className="flex items-center gap-1 py-1 px-2 rounded bg-[#1B263B] text-[#F0F3BD] hover:bg-[#1A936F]"
        onClick={() => setShowDropdown(!showDropdown)}
        title="Export Map"
      >
        <span className="material-symbols-outlined text-sm">file_download</span>
        <span className="text-xs hidden sm:inline">Export</span>
      </button>
      
      {showDropdown && (
        <div className="absolute z-50 mt-1 right-0 bg-[#1B263B] rounded shadow-lg border border-[#1A936F]/30 p-2 min-w-40">
          <div className="mb-2">
            <label className="block text-xs text-[#BFC0C0] mb-1">Format:</label>
            <select 
              value={format} 
              onChange={(e) => setFormat(e.target.value)}
              className="w-full bg-[#0D1B2A] text-[#F0F3BD] text-xs p-1 rounded border border-[#1A936F]/30"
            >
              <option value="png">PNG Image</option>
              <option value="jpeg">JPEG Image</option>
            </select>
          </div>
          
          <button
            onClick={exportMapClient}
            disabled={isExporting}
            className="w-full py-1 px-2 rounded text-white bg-[#1A936F] hover:bg-[#1A936F]/80 text-xs flex items-center justify-center gap-1 mb-1"
          >
            {isExporting ? (
              <>
                <span className="animate-spin">◌</span>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Download Map Image</span>
              </>
            )}
          </button>
          
          <div className="text-xs text-[#BFC0C0] mt-1 italic">
            Current map view will be exported
          </div>
        </div>
      )}
    </div>
  );
};
