/**
 * Utilities for handling webpack module cache issues
 * These help mitigate the "Cannot read properties of undefined (reading 'call')" error
 */

interface WebpackCache {
  [key: string]: any;
}

interface WebpackRequire {
  cache: WebpackCache;
  [key: string]: any;
}

declare global {
  interface Window {
    __webpack_require__?: WebpackRequire;
    __webpack_modules__?: any[];
    __webpack_chunk_load__?: any;
  }
}

/**
 * Clears the webpack module cache to resolve module loading issues
 */
export function clearWebpackCache(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    // Clear webpack require cache
    if (window.__webpack_require__?.cache) {
      const cacheKeys = Object.keys(window.__webpack_require__.cache);
      cacheKeys.forEach(key => {
        if (window.__webpack_require__?.cache) {
          delete window.__webpack_require__.cache[key];
        }
      });
      console.log(`🧹 Cleared ${cacheKeys.length} webpack module cache entries`);
      return true;
    }

    // Alternative: Clear all webpack-related caches
    if (window.__webpack_modules__) {
      // @ts-ignore - Clear webpack modules
      window.__webpack_modules__ = [];
      console.log('🧹 Cleared webpack modules array');
      return true;
    }

    return false;
  } catch (error) {
    console.warn('Failed to clear webpack cache:', error);
    return false;
  }
}

/**
 * Attempts to recover from module loading errors
 */
export function attemptModuleRecovery(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // Clear caches
      const cacheCleared = clearWebpackCache();
      
      if (cacheCleared) {
        // Wait a bit for cache clearing to take effect
        setTimeout(() => {
          console.log('🔄 Module recovery attempted - cache cleared');
          resolve(true);
        }, 100);
      } else {
        console.log('⚠️ Could not clear module cache');
        resolve(false);
      }
    } catch (error) {
      console.error('Module recovery failed:', error);
      resolve(false);
    }
  });
}

/**
 * Checks if the current error is a webpack module error
 */
export function isWebpackModuleError(error: Error | string): boolean {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  const webpackErrorPatterns = [
    /Cannot read properties of undefined \(reading 'call'\)/,
    /Cannot read properties of undefined \(reading 'default'\)/,
    /Cannot read properties of undefined \(reading 'exports'\)/,
    /Module not found/,
    /webpack.*require/,
    /__webpack_require__/,
  ];

  return webpackErrorPatterns.some(pattern => pattern.test(errorMessage));
}

/**
 * Provides user-friendly error messages for webpack errors
 */
export function getWebpackErrorHelp(error: Error | string): string {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  if (isWebpackModuleError(error)) {
    return 'This is a known issue with module loading. Try refreshing the page or clearing your browser cache.';
  }
  
  return 'An unexpected error occurred. Please try refreshing the page.';
}

/**
 * Forces a hard refresh to resolve persistent module issues
 */
export function forceHardRefresh(): void {
  if (typeof window !== 'undefined') {
    // Clear all caches first
    clearWebpackCache();
    
    // Force a hard refresh
    window.location.reload();
  }
}

/**
 * Sets up automatic module error detection and recovery
 */
export function setupModuleErrorRecovery(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Listen for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (isWebpackModuleError(event.reason)) {
      console.warn('🚨 Webpack module error detected in promise rejection');
      console.warn('💡 This error can often be resolved by refreshing the page');
      
      // Optionally attempt recovery
      attemptModuleRecovery();
    }
  });

  // Listen for global errors
  window.addEventListener('error', (event) => {
    if (isWebpackModuleError(event.error)) {
      console.warn('🚨 Webpack module error detected in global error handler');
      console.warn('💡 This error can often be resolved by refreshing the page');
      
      // Optionally attempt recovery
      attemptModuleRecovery();
    }
  });

  console.log('🔧 Module error recovery system initialized');
}

/**
 * Checks if webpack is available and provides debugging info
 */
export function getWebpackDebugInfo(): Record<string, any> {
  if (typeof window === 'undefined') {
    return { available: false, reason: 'Server-side rendering' };
  }

  const info: Record<string, any> = {
    available: false,
    webpackRequire: !!window.__webpack_require__,
    webpackModules: !!window.__webpack_modules__,
    webpackChunkLoad: !!window.__webpack_chunk_load__,
  };

  if (window.__webpack_require__?.cache) {
    info.cacheSize = Object.keys(window.__webpack_require__.cache).length;
    info.cacheKeys = Object.keys(window.__webpack_require__.cache).slice(0, 10); // First 10 keys
  }

  info.available = info.webpackRequire || info.webpackModules;
  
  return info;
}
