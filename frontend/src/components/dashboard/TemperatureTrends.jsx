import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

export const TemperatureTrends = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('temperature');
  const [timeframe, setTimeframe] = useState('monthly'); // monthly, yearly, historic
  const [selectedRegion, setSelectedRegion] = useState('pakistan'); // pakistan, custom, province
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chartContainerRef = useRef(null);
  
  // Create mock data for demonstration purposes
  useEffect(() => {
    if (isVisible) {
      setIsLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        try {
          // Generate mock data based on selected options
          const mockData = generateMockData(activeTab, timeframe, selectedRegion);
          setChartData(mockData);
          setError(null);
        } catch (err) {
          setError('Failed to load climate data');
          console.error('Error generating mock data:', err);
        } finally {
          setIsLoading(false);
        }
      }, 800);
    }
  }, [isVisible, activeTab, timeframe, selectedRegion]);
  
  // Draw chart when data is loaded
  useEffect(() => {
    if (chartData && chartContainerRef.current && isVisible) {
      drawChart();
    }
  }, [chartData, isVisible]);
  
  // Generate mock climate data
  const generateMockData = (dataType, timeframe, region) => {
    let labels = [];
    let data = [];
    let colors = [];
    
    // Generate appropriate x-axis labels based on timeframe
    if (timeframe === 'monthly') {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    } else if (timeframe === 'yearly') {
      labels = Array.from({ length: 10 }, (_, i) => (2016 + i).toString());
    } else { // historic
      labels = Array.from({ length: 7 }, (_, i) => (1980 + i * 10).toString());
    }
    
    // Generate mock data based on data type
    if (dataType === 'temperature') {
      // Temperature data in Celsius
      if (region === 'pakistan') {
        if (timeframe === 'monthly') {
          data = [14.2, 16.8, 22.1, 27.5, 32.3, 34.7, 32.6, 31.5, 29.8, 25.3, 20.1, 15.6];
          colors = data.map(val => getTemperatureColor(val));
        } else if (timeframe === 'yearly') {
          data = [27.2, 27.5, 27.8, 28.1, 28.3, 28.6, 28.9, 29.1, 29.3, 29.5];
          colors = data.map(val => getTemperatureColor(val));
        } else {
          data = [25.8, 26.1, 26.4, 26.9, 27.3, 28.1, 29.3];
          colors = data.map(val => getTemperatureColor(val));
        }
      } else if (region === 'punjab') {
        if (timeframe === 'monthly') {
          data = [15.1, 17.9, 23.2, 28.7, 33.6, 35.9, 33.8, 32.7, 30.9, 26.5, 21.3, 16.8];
          colors = data.map(val => getTemperatureColor(val));
        } else {
          // Other timeframes would be populated similarly
          data = [28.1, 28.4, 28.7, 29.0, 29.2, 29.5, 29.8, 30.0, 30.2, 30.4];
          colors = data.map(val => getTemperatureColor(val));
        }
      } else {
        // Custom region would have different data
        data = [16.5, 18.3, 24.1, 29.2, 34.1, 36.2, 34.3, 33.1, 31.2, 27.0, 22.1, 17.5];
        colors = data.map(val => getTemperatureColor(val));
      }
    } else if (dataType === 'rainfall') {
      // Rainfall data in mm
      if (region === 'pakistan') {
        if (timeframe === 'monthly') {
          data = [34, 42, 60, 46, 28, 15, 48, 67, 35, 22, 18, 30];
          colors = data.map(() => 'rgba(26, 147, 211, 0.7)');
        } else {
          data = [420, 445, 410, 435, 450, 425, 460, 440, 430, 445];
          colors = data.map(() => 'rgba(26, 147, 211, 0.7)');
        }
      } else {
        // Different data for other regions
        data = [42, 50, 72, 55, 33, 18, 58, 80, 42, 26, 21, 36];
        colors = data.map(() => 'rgba(26, 147, 211, 0.7)');
      }
    } else { // humidity
      // Humidity data in percentage
      if (region === 'pakistan') {
        if (timeframe === 'monthly') {
          data = [55, 52, 48, 43, 39, 42, 56, 62, 58, 53, 57, 58];
          colors = data.map(() => 'rgba(144, 238, 144, 0.7)');
        } else {
          data = [52, 51, 50, 49, 50, 51, 52, 53, 54, 55];
          colors = data.map(() => 'rgba(144, 238, 144, 0.7)');
        }
      } else {
        // Different data for other regions
        data = [58, 55, 51, 46, 42, 45, 59, 65, 61, 56, 60, 61];
        colors = data.map(() => 'rgba(144, 238, 144, 0.7)');
      }
    }
    
    return {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: colors.map(color => color.replace(/[^,]+(?=\))/, '1')),
        borderWidth: 1
      }]
    };
  };
  
  // Get color for temperature values
  const getTemperatureColor = (temp) => {
    if (temp < 15) return 'rgba(65, 105, 225, 0.7)'; // Blue for cold
    if (temp < 23) return 'rgba(135, 206, 250, 0.7)'; // Light blue
    if (temp < 28) return 'rgba(144, 238, 144, 0.7)'; // Light green
    if (temp < 33) return 'rgba(255, 215, 0, 0.7)';   // Gold/yellow
    return 'rgba(255, 99, 71, 0.7)';                  // Red for hot
  };
  
  // Draw chart using canvas and basic drawing
  const drawChart = () => {
    const canvas = chartContainerRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const padding = 40;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.fillStyle = 'rgba(27, 38, 59, 0.8)';
    ctx.fillRect(0, 0, width, height);
    
    if (!chartData || !chartData.labels || !chartData.datasets || chartData.datasets.length === 0) {
      return;
    }
    
    const data = chartData.datasets[0].data;
    const labels = chartData.labels;
    const colors = chartData.datasets[0].backgroundColor;
    
    // Find min and max for scaling
    const max = Math.max(...data) * 1.1;
    const min = Math.min(...data) > 0 ? 0 : Math.min(...data) * 1.1;
    
    // Draw axes
    ctx.strokeStyle = '#F0F3BD';
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Calculate bar width
    const barCount = data.length;
    const barSpacing = 4;
    const barWidth = (chartWidth / barCount) - barSpacing;
    
    // Draw bars
    data.forEach((value, index) => {
      const x = padding + (index * (barWidth + barSpacing));
      const barHeight = ((value - min) / (max - min)) * chartHeight;
      const y = height - padding - barHeight;
      
      // Draw bar
      ctx.fillStyle = colors[index];
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Draw outline
      ctx.strokeStyle = chartData.datasets[0].borderColor[index];
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, barWidth, barHeight);
      
      // Draw label
      ctx.fillStyle = '#F0F3BD';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[index], x + (barWidth / 2), height - padding + 15);
      
      // Draw value
      ctx.fillStyle = '#F0F3BD';
      ctx.fillText(value.toFixed(1), x + (barWidth / 2), y - 5);
    });
    
    // Draw title
    ctx.fillStyle = '#F0F3BD';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${activeTab === 'temperature' ? 'Temperature (°C)' : 
        activeTab === 'rainfall' ? 'Rainfall (mm)' : 'Humidity (%)'}`, 
      width / 2, 
      15
    );
    
    // Draw y-axis labels (min, mid, max)
    ctx.fillStyle = '#F0F3BD';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(max.toFixed(1), padding - 5, padding);
    ctx.fillText(((max + min) / 2).toFixed(1), padding - 5, (height - padding + padding) / 2);
    ctx.fillText(min.toFixed(1), padding - 5, height - padding);
  };
  
  // Toggle panel visibility
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="absolute top-4 right-4 max-w-xs">
      {/* Toggle Button */}
      <button 
        onClick={toggleVisibility}
        className="flex items-center gap-1 bg-[#1B263B]/95 border border-[#1A936F]/40 rounded-md px-3 py-1.5 text-sm shadow-md"
      >
        <span className="material-symbols-outlined text-sm">
          {isVisible ? 'close' : 'timeline'}
        </span>
        <span>{isVisible ? 'Close' : 'Climate Trends'}</span>
      </button>
      
      {/* Analysis Panel */}
      <div 
        className={`mt-2 bg-[#1B263B]/95 border border-[#1A936F]/40 rounded-md shadow-lg overflow-hidden transition-all duration-300 ${
          isVisible ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {/* Control Panel */}
        <div className="p-3 border-b border-[#1A936F]/40">
          {/* Data Type Tabs */}
          <div className="flex border-b border-[#1A936F]/20 mb-2">
            <button
              className={`flex-1 px-2 py-1 text-xs ${activeTab === 'temperature' ? 'border-b-2 border-[#F4D35E]' : ''}`}
              onClick={() => setActiveTab('temperature')}
            >
              Temperature
            </button>
            <button
              className={`flex-1 px-2 py-1 text-xs ${activeTab === 'rainfall' ? 'border-b-2 border-[#F4D35E]' : ''}`}
              onClick={() => setActiveTab('rainfall')}
            >
              Rainfall
            </button>
            <button
              className={`flex-1 px-2 py-1 text-xs ${activeTab === 'humidity' ? 'border-b-2 border-[#F4D35E]' : ''}`}
              onClick={() => setActiveTab('humidity')}
            >
              Humidity
            </button>
          </div>
          
          {/* Controls */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[#BFC0C0] mb-1">Timeframe:</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full bg-[#1B263B] border border-[#1A936F]/30 rounded px-2 py-1 text-[#F0F3BD]"
              >
                <option value="monthly">Monthly (2024)</option>
                <option value="yearly">Last Decade</option>
                <option value="historic">Historic Trend</option>
              </select>
            </div>
            <div>
              <label className="block text-[#BFC0C0] mb-1">Region:</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full bg-[#1B263B] border border-[#1A936F]/30 rounded px-2 py-1 text-[#F0F3BD]"
              >
                <option value="pakistan">All Pakistan</option>
                <option value="punjab">Punjab</option>
                <option value="sindh">Sindh</option>
                <option value="kpk">Khyber Pakhtunkhwa</option>
                <option value="balochistan">Balochistan</option>
                <option value="custom">Selected Area</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Chart Container */}
        <div className="p-3 h-52">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex gap-1.5 items-center">
                <div className="w-2 h-2 bg-[#1A936F] rounded-full animate-[bounce_1s_infinite_0.1s]"></div>
                <div className="w-2 h-2 bg-[#1A936F] rounded-full animate-[bounce_1s_infinite_0.2s]"></div>
                <div className="w-2 h-2 bg-[#1A936F] rounded-full animate-[bounce_1s_infinite_0.3s]"></div>
              </div>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center text-sm text-red-400">
              {error}
            </div>
          ) : (
            <canvas ref={chartContainerRef} width="300" height="200"></canvas>
          )}
        </div>
        
        {/* Legend/Summary */}
        <div className="p-2 border-t border-[#1A936F]/40">
          <div className="text-xs text-[#BFC0C0]">
            {activeTab === 'temperature' && (
              <p>Average temperature data for {selectedRegion === 'pakistan' ? 'Pakistan' : selectedRegion} shown as {timeframe} values. Data from Pakistan Meteorological Department.</p>
            )}
            {activeTab === 'rainfall' && (
              <p>Precipitation levels for {selectedRegion === 'pakistan' ? 'Pakistan' : selectedRegion} shown as {timeframe} accumulation. Data from Pakistan Meteorological Department.</p>
            )}
            {activeTab === 'humidity' && (
              <p>Average relative humidity for {selectedRegion === 'pakistan' ? 'Pakistan' : selectedRegion} shown as {timeframe} values. Data from Pakistan Meteorological Department.</p>
            )}
          </div>
          
          {/* Export Options */}
          <div className="flex justify-end gap-2 mt-1">
            <button className="text-xs flex items-center gap-1 hover:text-[#F4D35E]">
              <span className="material-symbols-outlined text-xs">download</span>
              <span>CSV</span>
            </button>
            <button className="text-xs flex items-center gap-1 hover:text-[#F4D35E]">
              <span className="material-symbols-outlined text-xs">image</span>
              <span>PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};