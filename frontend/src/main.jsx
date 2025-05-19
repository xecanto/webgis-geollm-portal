import { render } from 'preact';
import { initResourceOptimizations } from './utils/resourceLoader';
import { initPerformanceOptimizations } from './utils/performance';
import './index.css';
import { App } from './app.jsx';

// Initialize performance and resource optimizations
initResourceOptimizations();
initPerformanceOptimizations();

// Handle browser back/forward navigation for smoother transitions
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Remove initial loader if present
const initialLoader = document.getElementById('initial-loader');
if (initialLoader) {
  initialLoader.style.display = 'none';
}

// Render the app
render(<App />, document.getElementById('app'));

// Register service worker for offline capabilities if supported
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .catch(error => {
        console.warn('Service worker registration failed:', error);
      });
  });
}
