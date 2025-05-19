import { h } from 'preact';
import { useState } from 'preact/hooks';
import MapUtils from '../../utils/MapUtils';
import { MapExportTool } from './MapExportTool';

export const ExportTools = ({ map }) => {
  const [exporting, setExporting] = useState(false);
  const [format, setFormat] = useState('png');
  const [exportResult, setExportResult] = useState(null);
  const [copied, setCopied] = useState(false);
    // Export map as image
  const exportMap = async () => {
    if (!map) return;
    
    setExporting(true);
    
    try {
      const filename = `map-export-${new Date().toISOString().substring(0, 19).replace(/:/g, '-')}`;
      const dataUrl = await MapUtils.exportMap(map, format, filename);
      
      setExportResult({
        dataUrl,
        format,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error exporting map:', error);
      alert('Failed to export map: ' + error.message);
    } finally {
      setExporting(false);
    }
  };
    // Generate shareable link
  const generateShareableLink = async () => {
    if (!map) return;
    
    try {
      // Import the needed projection module
      const { toLonLat } = await import('ol/proj');
      
      // Get current map view state
      const view = map.getView();
      const center = view.getCenter();
      const zoom = view.getZoom();
      
      // Convert center to lon/lat
      const lonLat = toLonLat(center);
      
      // Get visible layers
      const layers = map.getLayers().getArray()
        .filter(layer => layer.get('title') && layer.getVisible())
        .map(layer => layer.get('title'))
        .join(',');
      
      // Build the share URL
      const shareUrl = new URL(window.location.href);
      shareUrl.searchParams.set('lon', lonLat[0].toFixed(6));
      shareUrl.searchParams.set('lat', lonLat[1].toFixed(6));
      shareUrl.searchParams.set('zoom', zoom.toFixed(2));
      shareUrl.searchParams.set('layers', layers);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      
      return shareUrl.toString();
    } catch (err) {
      console.error('Failed to generate or copy URL: ', err);
      return window.location.href; // Return current URL as fallback
    }
  };
  
  // Download the exported image
  const downloadExport = () => {
    if (!exportResult) return;
    
    const link = document.createElement('a');
    link.download = `map-export-${new Date().toISOString().substring(0, 19).replace(/:/g, '-')}.${exportResult.format}`;
    link.href = exportResult.dataUrl;
    link.click();
  };
    return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-[#F4D35E] font-medium flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">download</span>
          <span>Quick Export</span>
        </h3>
        <MapExportTool map={map} />
      </div>
      
      <div className="bg-[#1B263B]/50 border border-[#1A936F]/30 rounded-md p-3">
        <h3 className="text-[#F4D35E] font-medium mb-3 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">image</span>
          <span>Export Map</span>
        </h3>
        
        <div className="space-y-2">
          <div>
            <label className="block text-xs text-[#BFC0C0] mb-1">Choose Format:</label>
            <div className="flex gap-2">
              <label className="flex-1 flex items-center gap-1 bg-[#1B263B] border border-[#1A936F]/30 rounded p-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="format" 
                  value="png"
                  checked={format === 'png'} 
                  onChange={() => setFormat('png')} 
                  className="accent-[#1A936F]"
                />
                <span className="text-[#F0F3BD] text-sm">PNG Image</span>
              </label>
              <label className="flex-1 flex items-center gap-1 bg-[#1B263B] border border-[#1A936F]/30 rounded p-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="format" 
                  value="svg"
                  checked={format === 'svg'} 
                  onChange={() => setFormat('svg')}
                  className="accent-[#1A936F]"
                />
                <span className="text-[#F0F3BD] text-sm">SVG Vector</span>
              </label>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={exportMap} 
              disabled={exporting}
              className="flex-1 bg-[#1A936F]/20 hover:bg-[#1A936F]/30 text-[#F0F3BD] py-2 px-3 rounded flex items-center justify-center gap-1 transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-sm">image</span>
              <span>{exporting ? 'Exporting...' : 'Export Image'}</span>
            </button>
            <button 
              onClick={() => {
                setFormat('pdf');
                exportMap();
              }}
              disabled={exporting}
              className="flex-1 bg-[#1A936F]/20 hover:bg-[#1A936F]/30 text-[#F0F3BD] py-2 px-3 rounded flex items-center justify-center gap-1 transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-sm">description</span>
              <span>{exporting ? 'Exporting...' : 'Export PDF'}</span>
            </button>
          </div>
        </div>
        
        {exportResult && (
          <div className="mt-3 bg-[#1B263B]/80 border border-[#1A936F]/30 rounded p-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#F0F3BD] text-sm">Export Preview:</span>
              <button 
                onClick={downloadExport}
                className="text-xs bg-[#1A936F] hover:bg-[#1A936F]/80 text-white py-1 px-2 rounded flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">download</span>
                <span>Download</span>
              </button>
            </div>
            <div className="border border-[#1A936F]/20 rounded overflow-hidden">
              <img src={exportResult.dataUrl} alt="Map export" className="w-full h-auto" />
            </div>
            <div className="text-xs text-[#BFC0C0] mt-1">
              Exported at {new Date(exportResult.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-[#1B263B]/50 border border-[#1A936F]/30 rounded-md p-3">
        <h3 className="text-[#F4D35E] font-medium mb-3 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">share</span>
          <span>Share Map</span>
        </h3>
        
        <button 
          onClick={generateShareableLink}
          className="w-full bg-[#1A936F]/20 hover:bg-[#1A936F]/30 text-[#F0F3BD] py-2 px-3 rounded flex items-center justify-center gap-1 transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-sm">link</span>
          <span>{copied ? 'Link Copied!' : 'Generate Shareable Link'}</span>
        </button>
        
        <div className="text-xs text-[#BFC0C0] mt-2">
          This link captures the current map view and visible layers
        </div>
      </div>
    </div>
  );
};
