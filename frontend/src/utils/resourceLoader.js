// Resource loading optimization for GeoLLM
// This file manages optimal loading of resources to improve performance

/**
 * Add prefetch and preload hints to the document head
 * Dynamically loads the prefetch hints from the JSON file
 */
export async function setupResourceHints() {
  try {
    const response = await fetch('/prefetch-hints.json');
    if (!response.ok) {
      throw new Error('Failed to load prefetch hints');
    }
    
    const hints = await response.json();
    
    hints.forEach(hint => {
      const linkElement = document.createElement('link');
      
      // Set attributes from the hint object
      Object.keys(hint).forEach(key => {
        linkElement.setAttribute(key, hint[key]);
      });
      
      // Add to document head
      document.head.appendChild(linkElement);
    });
  } catch (error) {
    console.warn('Could not set up resource hints:', error);
  }
}

/**
 * Dynamically loads the Material Icons font only when needed
 * This prevents unnecessary loading on low-end devices if icons aren't immediately visible
 */
export function loadIconsOnDemand() {
  const hasIcons = document.querySelector('.material-symbols-outlined');
  
  if (hasIcons) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
    document.head.appendChild(link);
  }
}

/**
 * Defers loading of non-critical images
 * Uses responsive loading and modern browser features
 */
export function optimizeImageLoading() {
  // Find all images that should be lazy loaded
  const images = document.querySelectorAll('img:not([loading])');
  
  // Add loading="lazy" and decoding="async" to images not in the viewport
  images.forEach(img => {
    // Skip images that are likely to be in the initial viewport
    const rect = img.getBoundingClientRect();
    if (rect.top > window.innerHeight) {
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
    }
  });
}

/**
 * Initialize all resource loading optimizations
 */
export function initResourceOptimizations() {
  // Set up resource hints for faster loading
  setupResourceHints();
  
  // Load icon font only when needed
  loadIconsOnDemand();
  
  // Optimize image loading
  if ('IntersectionObserver' in window) {
    // Modern browsers - wait for content to load first
    window.addEventListener('DOMContentLoaded', () => {
      optimizeImageLoading();
    });
  }
}
