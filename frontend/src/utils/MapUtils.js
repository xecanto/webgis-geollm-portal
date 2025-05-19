import { saveAs } from 'file-saver';

/**
 * Utility functions for working with OpenLayers maps
 */
class MapUtils {
  /**
   * Export map as an image or other formats
   * @param {Object} map - OpenLayers map instance
   * @param {String} format - Export format ('png', 'jpeg', 'svg', 'pdf')
   * @param {String} filename - Name of the file to save
   * @returns {Promise<String>} Data URL of exported map
   */
  static async exportMap(map, format = 'png', filename = 'map-export') {
    if (!map) {
      throw new Error('Map instance is required');
    }
    
    return new Promise((resolve, reject) => {
      try {
        map.once('rendercomplete', () => {
          // Get map canvas
          const mapCanvas = map.getTargetElement().querySelector('canvas');
          if (!mapCanvas) {
            reject(new Error('Map canvas not found'));
            return;
          }
          
          // Create canvas for export
          const exportCanvas = document.createElement('canvas');
          const context = exportCanvas.getContext('2d');
          
          // Set dimensions
          exportCanvas.width = mapCanvas.width;
          exportCanvas.height = mapCanvas.height;
          
          // Draw to canvas
          context.drawImage(mapCanvas, 0, 0);
          
          let dataUrl;
          let blob;
          
          // Create appropriate format
          if (format === 'png' || format === 'jpeg') {
            dataUrl = exportCanvas.toDataURL(`image/${format}`);
            fetch(dataUrl)
              .then(res => res.blob())
              .then(blobData => {
                if (filename) {
                  saveAs(blobData, `${filename}.${format}`);
                }
                resolve(dataUrl);
              });
          } else if (format === 'svg') {
            // SVG export - simplified version
            const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${exportCanvas.width}" height="${exportCanvas.height}">
              <image href="${exportCanvas.toDataURL('image/png')}" width="100%" height="100%" />
            </svg>`;
            
            blob = new Blob([svgContent], { type: 'image/svg+xml' });
            if (filename) {
              saveAs(blob, `${filename}.svg`);
            }
            resolve(URL.createObjectURL(blob));
          } else if (format === 'pdf') {
            // PDF export requires additional libraries like jsPDF
            // This is a simplified example
            import('jspdf').then(({ default: jsPDF }) => {
              const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [exportCanvas.width, exportCanvas.height]
              });
              
              const imgData = exportCanvas.toDataURL('image/jpeg', 1.0);
              pdf.addImage(imgData, 'JPEG', 0, 0, exportCanvas.width, exportCanvas.height);
              
              if (filename) {
                pdf.save(`${filename}.pdf`);
              }
              
              // Convert to blob URL
              const pdfBlob = pdf.output('blob');
              resolve(URL.createObjectURL(pdfBlob));
            }).catch(err => {
              reject(new Error(`PDF export failed: ${err.message}`));
            });
          } else {
            reject(new Error(`Unsupported format: ${format}`));
          }
        });
        
        // Force redraw
        map.renderSync();
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Generate a shareable URL for the current map view
   * @param {Object} map - OpenLayers map instance
   * @param {Object} options - Additional options to include in URL
   * @returns {String} Shareable URL
   */
  static generateShareableURL(map, options = {}) {
    if (!map) return null;
    
    // Get current view state
    const view = map.getView();
    const center = view.getCenter();
    const zoom = view.getZoom();
    
    // Convert to lon/lat
    const lonLat = ol.proj.toLonLat(center);
    
    // Create URL with parameters
    const url = new URL(window.location.href);
    url.searchParams.set('lon', lonLat[0].toFixed(6));
    url.searchParams.set('lat', lonLat[1].toFixed(6));
    url.searchParams.set('z', zoom.toFixed(2));
    
    // Add any additional options
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    });
    
    return url.toString();
  }
}

export default MapUtils;
