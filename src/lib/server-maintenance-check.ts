import { redirect } from 'next/navigation';
import { connectToDatabase } from './db';

/**
 * Server-side maintenance check that can be called from any page
 * This will redirect users to the maintenance page if maintenance mode is enabled
 */
export async function checkMaintenanceMode() {
  try {
    const { db } = await connectToDatabase();
    
    // Check if maintenance mode is enabled
    const maintenanceDoc = await db.collection('system_settings').findOne({ 
      key: 'maintenance_mode' 
    });
    
    if (maintenanceDoc && maintenanceDoc.value && maintenanceDoc.value.enabled) {
      console.log('🔧 Server: Maintenance mode is enabled, redirecting to maintenance page');
      redirect('/maintenance');
    }
  } catch (error) {
    console.error('❌ Server: Error checking maintenance status:', error);
    // If we can't check maintenance status, allow access to be safe
  }
}

/**
 * Check if maintenance mode is enabled without redirecting
 * Useful for conditional rendering or logging
 */
export async function isMaintenanceModeEnabled(): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    
    const maintenanceDoc = await db.collection('system_settings').findOne({ 
      key: 'maintenance_mode' 
    });
    
    return !!(maintenanceDoc && maintenanceDoc.value && maintenanceDoc.value.enabled);
  } catch (error) {
    console.error('❌ Server: Error checking maintenance status:', error);
    return false;
  }
}
