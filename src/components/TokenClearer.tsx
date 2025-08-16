'use client';

import { signOut } from 'next-auth/react';

/**
 * Utility component for manually clearing tokens and refreshing session
 * This can be used in development or for testing purposes
 */
export function TokenClearer() {
  const handleClearTokens = async () => {
    try {
      // Double-tap logout: NextAuth + hard-clear + redirect
      await signOut({ redirect: false });
      await fetch("/logout", { method: "POST" }).catch(() => {});
      window.location.replace("/");
    } catch (error) {
      console.error('Logout error:', error);
      window.location.replace("/");
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
