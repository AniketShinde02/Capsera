/**
 * Development Error Recovery Utility
 * Provides safe wrappers for potentially problematic code during development
 */

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Module-level state to track bypass status
const devErrorBypassState = {
  isActive: false,
  consoleErrorOverride: null as any,
  originalConsoleError: null as any
};

/**
 * Development-safe function caller that logs errors instead of throwing
 */
export function devSafeCall<T>(
  fn: () => T,
  fallback: T,
  context?: string
): T {
  if (!isDevelopment) {
    return fn();
  }
  
  try {
    return fn();
  } catch (error) {
    console.warn(`[DEV] Safe call failed${context ? ` in ${context}` : ''}:`, error);
    console.warn('[DEV] Returning fallback value to continue development');
    return fallback;
  }
}

/**
 * Initialize development error bypass system
 * This function sets up error suppression mechanisms for development
 */
export function initErrorBypass(): void {
  if (!isDevelopment) {
    console.warn('[DEV] Error bypass only available in development mode');
    return;
  }
  
  if (devErrorBypassState.isActive) {
    console.warn('[DEV] Error bypass already active');
    return;
  }
  
  if (typeof window !== 'undefined') {
    // Override console.error to suppress specific development errors
    devErrorBypassState.originalConsoleError = console.error;
    devErrorBypassState.consoleErrorOverride = (...args: any[]) => {
      const errorMessage = args.join(' ');
      
      // Suppress common development errors
      if (errorMessage.includes('Cannot read properties of undefined') ||
          errorMessage.includes('Module not found') ||
          errorMessage.includes('webpack') ||
          errorMessage.includes('__webpack_require__')) {
        console.warn('[DEV] Suppressed development error:', errorMessage);
        return;
      }
      
      // Call original console.error for other errors
      devErrorBypassState.originalConsoleError?.apply(console, args);
    };
    
    console.error = devErrorBypassState.consoleErrorOverride;
    devErrorBypassState.isActive = true;
    
    console.log('[DEV] Error bypass initialized');
  }
}

/**
 * Enable development error bypass (explicit opt-in)
 * This is the recommended way to activate error bypass
 */
export function enableDevErrorBypass(): void {
  initErrorBypass();
}

/**
 * Disable development error bypass
 */
export function disableDevErrorBypass(): void {
  if (!devErrorBypassState.isActive) {
    return;
  }
  
  if (typeof window !== 'undefined' && devErrorBypassState.originalConsoleError) {
    console.error = devErrorBypassState.originalConsoleError;
  }
  
  devErrorBypassState.isActive = false;
  devErrorBypassState.consoleErrorOverride = null;
  devErrorBypassState.originalConsoleError = null;
  
  console.log('[DEV] Error bypass disabled');
}

/**
 * Check if development error bypass is active
 */
export function isDevErrorBypassActive(): boolean {
  return devErrorBypassState.isActive;
}

