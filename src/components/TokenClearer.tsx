'use client';

import { signOut } from 'next-auth/react';
import { clearAllNextAuthStorage } from '@/lib/session-utils';

/**
 * Utility component for manually clearing tokens and refreshing session
 * This can be used in development or for testing purposes
 */
export function TokenClearer() {
  const handleClearTokens = async () => {
    try {
      // Enhanced logout: Clear everything + cache busting
      clearAllNextAuthStorage();
      await signOut({ redirect: false });
      await fetch("/logout", { 
        method: "POST",
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      }).catch(() => {});
      
      // Clear all caches
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      
      window.location.replace(`/?cache-bust=${Date.now()}&logout=manual`);
    } catch (error) {
      console.error('Logout error:', error);
      window.location.replace(`/?cache-bust=${Date.now()}&logout=error`);
    }
  };

  return (
    <button
      onClick={handleClearTokens}
      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
    >
              Force Complete Logout
    </button>
  );
}
