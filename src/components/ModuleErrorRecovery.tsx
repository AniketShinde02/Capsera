'use client';

import { useEffect } from 'react';
import { setupModuleErrorRecovery } from '@/lib/module-cache-utils';

/**
 * Component that sets up global module error recovery
 * This helps prevent and handle webpack module errors that cause
 * "Cannot read properties of undefined (reading 'call')" errors
 */
export default function ModuleErrorRecovery() {
  useEffect(() => {
    // Set up the module error recovery system
    setupModuleErrorRecovery();
    
    // Add additional error handling for development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Module error recovery system initialized in development mode');
      
      // Add helpful console messages for developers
      console.log('💡 If you encounter webpack module errors, try:');
      console.log('   1. Hard refresh the page (Ctrl+F5 / Cmd+Shift+R)');
      console.log('   2. Clear browser cache');
      console.log('   3. Restart the development server');
    }
  }, []);

  // This component doesn't render anything
  return null;
}
