// Performance optimization utilities for GeoLLM
// This file contains functions to improve performance and loading times

/**
 * Dynamically load additional CSS files after the page content is loaded
 * @param {string} href - URL of the CSS file to load
 */
export function loadCssAsync(href) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

/**
 * Lazy load images when they enter the viewport
 * Uses IntersectionObserver API for better performance
 */
export function initLazyLoading() {
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    const lazyImages = document.querySelectorAll('[data-src]');
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
}

/**
 * Check if the user prefers reduced motion
 * @returns {boolean} true if the user prefers reduced motion
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Defer less important animations until after critical content is loaded
 * @param {number} delay - Time in ms to wait before enabling animations
 */
export function enableDeferredAnimations(delay = 1000) {
  setTimeout(() => {
    document.querySelectorAll('.animation-deferred').forEach(el => {
      el.classList.add('animation-enabled');
    });
  }, delay);
}

/**
 * Optimize animation performance by reducing animations when the page is not visible
 */
export function optimizeBackgroundPerformance() {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      document.body.classList.add('reduce-animations');
    } else {
      document.body.classList.remove('reduce-animations');
    }
  });
}

/**
 * Initialize all performance optimizations
 */
export function initPerformanceOptimizations() {
  // Wait until the page has loaded
  window.addEventListener('load', () => {
    // Load non-critical CSS
    loadCssAsync('/animations.css');
    
    // Initialize lazy loading for images
    initLazyLoading();
    
    // Enable deferred animations
    enableDeferredAnimations();
    
    // Optimize performance when tab is in background
    optimizeBackgroundPerformance();
  });
}
