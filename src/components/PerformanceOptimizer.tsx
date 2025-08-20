'use client';

import { useEffect } from 'react';

export function PerformanceOptimizer() {
  useEffect(() => {
    // Performance monitoring
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          }
          if (entry.entryType === 'first-input') {
            console.log('FID:', entry.processingStart - entry.startTime);
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
      } catch (e) {
        // Fallback for older browsers
        console.log('Performance monitoring not supported');
      }
    }

    // Preload critical resources
    const preloadCriticalResources = () => {
      // Preload next page resources
      const links = [
        { href: '/api/health-check', as: 'fetch', crossorigin: 'anonymous' },
        { href: '/api/rate-limit-info', as: 'fetch', crossorigin: 'anonymous' }
      ];

      links.forEach(({ href, as, crossorigin }) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = as as any;
        if (crossorigin) link.crossOrigin = crossorigin;
        document.head.appendChild(link);
      });
    };

    // Delay preloading to avoid blocking initial render
    const timer = setTimeout(preloadCriticalResources, 1000);
    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything
}
