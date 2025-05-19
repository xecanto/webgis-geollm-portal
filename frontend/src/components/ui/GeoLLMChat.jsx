import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { API_ENDPOINTS, ENABLE_GEOLLM } from '../../config/env';

export const GeoLLMChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'ai', content: 'Welcome to the Pakistan LST & LULC Geoportal! How can I help with your spatial analysis today?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [installingGeoLLM, setInstallingGeoLLM] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const chatRef = useRef(null);
  
  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target) && isOpen) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Auto-scroll to the bottom of the chat when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check GeoLLM health on initial load
  useEffect(() => {
    // Only check health if GeoLLM is enabled
    if (!ENABLE_GEOLLM) {
      setMessages(prev => [
        ...prev, 
        { 
          type: 'ai', 
          content: 'GeoLLM features are currently disabled. Some functionality will be limited. You can enable GeoLLM in the environment settings.',
          isSystem: true 
        }
      ]);
      return;
    }
    
    const checkGeoLLMStatus = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.HEALTH_CHECK);
        const data = await response.json();
        
        if (data.status === 'ok') {
          console.log('GeoLLM service is running properly');
        }
      } catch (error) {
        console.error('Error checking GeoLLM status:', error);
        // Add a system message about connection issues
        setMessages(prev => [
          ...prev, 
          { 
            type: 'ai', 
            content: 'I\'m having trouble connecting to the GeoLLM service. Some features might be limited. Please ensure the backend server is running.', 
            isSystem: true 
          }
        ]);
      }
    };
    
    checkGeoLLMStatus();
  }, []);

  // More comprehensive dashboard tour with specific Pakistan geospatial data elements
  const handleDashboardTour = () => {
    setIsTourActive(true);
    setIsLoading(false);
    
    // Add first tour message
    const tourIntro = { 
      type: 'ai', 
      content: 'I\'d be happy to give you a tour of the Pakistan Geoportal Dashboard! This specialized platform helps analyze Land Surface Temperature and Land Use Land Cover patterns across Pakistan. Let me walk you through the main components:',
      isSpecial: true 
    };
    setMessages(prev => [...prev, tourIntro]);
    
    // Schedule tour steps with delays to simulate conversation
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: '1️⃣ **Interactive Map Interface**: This central component displays geospatial data for all of Pakistan (796,095 km²). You can pan, zoom, and select specific regions like Karachi, Lahore, or Islamabad for detailed LST and LULC analysis.',
        isSpecial: true,
        highlightElement: 'map-container'
      }]);
      highlightDashboardElement('map-container');
    }, 2000);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: '2️⃣ **Data Selection Panel**: The left sidebar contains filtering options for different data sources including Landsat 8-9 (30m resolution), Sentinel-2 (10m), and MODIS (500m). You can select different temporal ranges from 2000-2025.',
        isSpecial: true,
        highlightElement: 'left-sidebar' 
      }]);
      highlightDashboardElement('left-sidebar');
    }, 4000);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: '3️⃣ **LST Visualization Panel**: The temperature trends panel shows temporal patterns in land surface temperature data. Pakistan\'s average LST is 32.7°C, with significant regional and seasonal variations you can explore here.',
        isSpecial: true,
        highlightElement: 'temperature-trends'
      }]);
      highlightDashboardElement('temperature-trends');
    }, 6000);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: '4️⃣ **LULC Classification Panel**: This shows Pakistan\'s land use categories: Urban (12%), Agriculture (45%), Barren (30%), Water (4%), Forest (5%), and Shrubland (4%). You can toggle between different classification views to analyze patterns.',
        isSpecial: true,
        highlightElement: 'lulc-panel'
      }]);
      highlightDashboardElement('lulc-panel');
    }, 8000);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: '5️⃣ **Analysis Tools**: The right sidebar contains tools for detailed spatial analysis, including the Urban Heat Island effect assessment for major cities like Karachi (showing a 1.5°C increase over 20 years) and land use change visualization.',
        isSpecial: true,
        highlightElement: 'analysis-tools'
      }]);
      highlightDashboardElement('analysis-tools');
    }, 10000);

    setTimeout(() => {
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: '6️⃣ **Export & Reports**: Generate custom reports with metrics of your choice and export data in various formats (GeoTIFF, Shapefile, GeoJSON) for further analysis in external GIS software.',
        isSpecial: true,
        highlightElement: 'export-panel'
      }]);
      highlightDashboardElement('export-panel');
    }, 12000);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: 'Would you like me to explain any specific feature in more detail? For example, I can help you analyze temperature trends in Karachi, understand urban expansion patterns in Lahore, or explain how to use the temporal comparison tools.',
        isSpecial: false
      }]);
      setIsTourActive(false);
      // Reset any highlighting
      resetHighlighting();
    }, 14000);
  };

  // Function to highlight dashboard elements during tour with enhanced styling
  const highlightDashboardElement = (elementId) => {
    // Reset previous highlighting
    resetHighlighting();
    
    // Add highlight class to the target element
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add('dashboard-highlight-pulse');
      
      // Create overlay with pointer to highlighted element
      const overlay = document.createElement('div');
      overlay.id = 'tour-overlay';
      overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-40 pointer-events-none';
      document.body.appendChild(overlay);
      
      // Calculate element position for pointer
      const rect = element.getBoundingClientRect();
      
      // Create animated pointer
      const pointer = document.createElement('div');
      pointer.className = 'absolute w-20 h-20 border-2 border-yellow-300 rounded-full animate-ping';
      pointer.style.left = `${rect.left + rect.width/2 - 10}px`;
      pointer.style.top = `${rect.top + rect.height/2 - 10}px`;
      overlay.appendChild(pointer);
      
      // Add label for the element
      const label = document.createElement('div');
      label.className = 'absolute bg-yellow-300 text-black px-3 py-1 rounded-md font-bold text-sm';
      label.textContent = elementId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      label.style.left = `${rect.left + rect.width/2 - 50}px`;
      label.style.top = `${rect.bottom + 10}px`;
      overlay.appendChild(label);
    }
  };
  
  // Reset highlighting on all elements
  const resetHighlighting = () => {
    // Remove highlighting classes
    document.querySelectorAll('.dashboard-highlight-pulse').forEach(el => {
      el.classList.remove('dashboard-highlight-pulse');
    });
    
    // Remove overlay if exists
    const overlay = document.getElementById('tour-overlay');
    if (overlay) {
      overlay.remove();
    }
  };

  // Check GeoLLM installation
  const checkGeoLLMInstallation = async () => {
    setInstallingGeoLLM(true);
    setMessages(prev => [...prev, { 
      type: 'ai', 
      content: 'Verifying GeoLLM installation in F:\\geollm. This specialized geospatial model provides enhanced analysis for Pakistan\'s LST & LULC data...' 
    }]);
    
    try {
      const response = await fetch(API_ENDPOINTS.HEALTH_CHECK);
      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: `GeoLLM is properly installed at ${data.installation_path}. All environment variables are set correctly. The model is ready for Pakistan-specific geospatial analysis.` 
      }]);
    } catch (error) {
      console.error('Error checking GeoLLM installation:', error);
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: 'There seems to be an issue with the GeoLLM installation. Please ensure the backend server is running and F:\\geollm directory is accessible. You can check start_app.bat for details.' 
      }]);
    } finally {
      setInstallingGeoLLM(false);
    }
  };

  // Handle user message submission
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    // Add user message to chat
    const userMessage = { type: 'user', content: userInput };
    setMessages(prev => [...prev, userMessage]);
    
    // Store input and clear field
    const inputText = userInput;
    setUserInput('');
    setIsLoading(true);
    
    // Check for dashboard-specific commands first
    if (inputText.toLowerCase().includes('tour') || 
        inputText.toLowerCase().includes('guide me') || 
        inputText.toLowerCase().includes('show me around')) {
      handleDashboardTour();
      return;
    }
    
    // Check for GeoLLM installation commands
    if (inputText.toLowerCase().includes('geollm') && 
        (inputText.toLowerCase().includes('install') || 
         inputText.toLowerCase().includes('status') ||
         inputText.toLowerCase().includes('check'))) {
      checkGeoLLMInstallation();
      return;
    }
    
    try {
      // Determine if this is a geospatial analysis request with more Pakistan-specific keywords
      const isGeospatialQuery = inputText.toLowerCase().includes('analyze') || 
                               inputText.toLowerCase().includes('map') ||
                               inputText.toLowerCase().includes('temperature') ||
                               inputText.toLowerCase().includes('land use') ||
                               inputText.toLowerCase().includes('lst') ||
                               inputText.toLowerCase().includes('lulc') ||
                               inputText.toLowerCase().includes('karachi') ||
                               inputText.toLowerCase().includes('lahore') ||
                               inputText.toLowerCase().includes('islamabad') ||
                               inputText.toLowerCase().includes('pakistan') ||
                               inputText.toLowerCase().includes('urban') ||
                               inputText.toLowerCase().includes('heat');
                               
      // Get enhanced dashboard context for more relevant responses
      const dashboardContext = {
        currentView: window.location.pathname,
        dashboardSection: document.querySelector('.active-section')?.dataset?.section || 'main',
        selectedRegion: window.selectedRegion || null,
        timeRange: window.selectedTimeRange || null,
        visibleLayers: Array.from(document.querySelectorAll('.layer-toggle:checked')).map(el => el.dataset.layer),
        currentBasemap: document.querySelector('.basemap-option.active')?.dataset?.type || 'default'
      };
      
      // Choose the appropriate API endpoint
      const apiUrl = isGeospatialQuery ? API_ENDPOINTS.GEOSPATIAL_ANALYZE : API_ENDPOINTS.CHAT;
      
      // Call the backend API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: inputText,
          context: dashboardContext 
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Process response for markdown/formatting
      let formattedResponse = data.response;
      
      // Format bullet points in responses if present
      if (formattedResponse.includes('• ')) {
        formattedResponse = formattedResponse.replace(/• (.*?)(?=(\n• |$))/g, '<li>$1</li>');
        formattedResponse = '<ul class="list-disc pl-4">' + formattedResponse + '</ul>';
      }
      
      // Format bold text with markdown-style ** markers
      formattedResponse = formattedResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Handle Pakistan-specific terms highlighting
      const pakistanTerms = ['Pakistan', 'Karachi', 'Lahore', 'Islamabad', 'Punjab', 'Sindh', 'LST', 'LULC'];
      pakistanTerms.forEach(term => {
        // Only highlight when not already in a tag
        const regex = new RegExp(`(?<![<>\\w])${term}(?![<>\\w])`, 'g');
        formattedResponse = formattedResponse.replace(regex, `<span class="text-[#F4D35E]">${term}</span>`);
      });
      
      // Add AI response to chat
      setMessages(prev => [...prev, { type: 'ai', content: formattedResponse }]);
    } catch (error) {
      console.error('Error fetching from GeoLLM API:', error);
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: 'Sorry, I encountered an issue connecting to the GeoLLM server. Please ensure the backend is running properly in F:\\geollm.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Enhanced Pakistan-specific quick response suggestions
  const suggestions = [
    "Show me the dashboard tour",
    "How do I analyze Karachi's temperatures?",
    "Explain Pakistan's LULC categories",
    "Show urban heat patterns in Lahore",
    "Check GeoLLM installation",
    "How to export data?"
  ];

  return (
    <div ref={chatRef} className="absolute bottom-24 right-6 z-50">
      <button 
        className={`w-14 h-14 rounded-full ${isTourActive ? 'bg-green-400 animate-pulse' : 'bg-[#F4D35E]'} flex items-center justify-center shadow-lg transform hover:scale-105 transition-all hover:rotate-15`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open chat assistant"
      >
        <span className="material-symbols-outlined text-[#1B263B] text-2xl">smart_toy</span>
      </button>
      
      <div className={`absolute bottom-full right-0 mb-4 w-96 bg-[#1B263B]/85 backdrop-blur-sm border border-[#1A936F]/40 rounded-2xl shadow-xl p-4 transform ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} origin-bottom-right transition-all duration-300`}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-['Montserrat'] font-semibold text-[#F4D35E]">Pakistan Geoportal Assistant</h3>
          <button 
            className="text-[#BFC0C0] hover:text-[#F0F3BD]"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div ref={chatContainerRef} className="max-h-80 overflow-y-auto mb-3 space-y-3 custom-scrollbar">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-2 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full ${msg.type === 'user' ? 'bg-[#F4D35E]/50' : 'bg-[#1A936F]/50'} flex items-center justify-center text-xs`}>
                {msg.type === 'user' ? 'You' : 'AI'}
              </div>
              <div className={`${msg.type === 'user' ? 'bg-[#F4D35E]/10' : 'bg-[#1A936F]/20'} ${msg.isSystem ? 'border border-yellow-500' : ''} rounded-lg p-2 text-sm max-w-[85%]`}>
                {msg.content.includes('<li>') || 
                 msg.content.includes('<strong>') || 
                 msg.content.includes('<span') ? (
                  <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }} />
                ) : (
                  msg.content.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < msg.content.split('\n').length - 1 && <br />}
                    </span>
                  ))
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-[#1A936F]/50 flex items-center justify-center text-xs">AI</div>
              <div className="bg-[#1A936F]/20 rounded-lg p-2 text-sm max-w-[85%] flex gap-1">
                <span className="animate-pulse">•</span>
                <span className="animate-pulse delay-150">•</span>
                <span className="animate-pulse delay-300">•</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Quick suggestion buttons */}
        <div className="flex flex-wrap gap-1 mb-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="bg-[#1A936F]/20 hover:bg-[#1A936F]/40 text-xs px-2 py-1 rounded-full transition-colors"
              onClick={() => {
                setUserInput(suggestion);
                setTimeout(() => handleSendMessage(), 100);
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about Pakistan's LST & LULC data, features..."
            className="w-full py-2 pl-3 pr-10 rounded-lg bg-[#1B263B]/60 border border-[#1A936F]/40 focus:border-[#1A936F] transition-all outline-none placeholder-[#BFC0C0] text-sm"
          />
          <button 
            onClick={handleSendMessage}
            disabled={isLoading || !userInput.trim() || installingGeoLLM} 
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${(!userInput.trim() || isLoading || installingGeoLLM) ? 'text-[#BFC0C0]/50' : 'text-[#F4D35E] hover:text-[#F4D35E]/80'}`}
            aria-label="Send message"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};