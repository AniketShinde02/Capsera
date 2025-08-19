import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

// Maintenance status interface
interface MaintenanceStatus {
  enabled: boolean;
  message: string;
  estimatedTime: string;
  allowedIPs: string[];
  allowedEmails: string[];
  updatedAt: Date;
}

// Get maintenance status
export async function GET(request: NextRequest) {
  try {
    // Import the config function
    const { getMaintenanceConfig } = await import('@/lib/maintenance-config');
    const config = getMaintenanceConfig();
    
    // First try to get custom settings from database, fallback to environment variables
    let customMessage = "We're making things better! Capsera is currently under maintenance.";
    let customEstimatedTime = "2-3 hours";
    let maintenanceEnabled = config.maintenanceMode.enabled; // Default from environment
    
    try {
      const { db } = await connectToDatabase();
      const maintenanceDoc = await db.collection('system_settings').findOne({ 
        key: 'maintenance_mode' 
      });
      
      if (maintenanceDoc?.value) {
        // Use database values if available
        maintenanceEnabled = maintenanceDoc.value.enabled;
        customMessage = maintenanceDoc.value.message || customMessage;
        customEstimatedTime = maintenanceDoc.value.estimatedTime || customEstimatedTime;
      }
    } catch (dbError) {
      console.log('Using environment variables for maintenance settings');
    }
    
    // Get custom IPs and emails from database
    let customIPs = config.maintenanceMode.allowedIPs;
    let customEmails = config.maintenanceMode.allowedEmails;
    
    try {
      const { db } = await connectToDatabase();
      const maintenanceDoc = await db.collection('system_settings').findOne({ 
        key: 'maintenance_mode' 
      });
      
      if (maintenanceDoc?.value) {
        // Merge database IPs with environment IPs (no duplicates)
        if (maintenanceDoc.value.allowedIPs && maintenanceDoc.value.allowedIPs.length > 0) {
          customIPs = [...new Set([...config.maintenanceMode.allowedIPs, ...maintenanceDoc.value.allowedIPs])];
        }
        
        // Merge database emails with environment emails (no duplicates)
        if (maintenanceDoc.value.allowedEmails && maintenanceDoc.value.allowedEmails.length > 0) {
          customEmails = [...new Set([...config.maintenanceMode.allowedEmails, ...maintenanceDoc.value.allowedEmails])];
        }
      }
    } catch (dbError) {
      console.log('Using environment variables for IPs and emails');
    }
    
    const status: MaintenanceStatus = {
      enabled: maintenanceEnabled, // Use database value, not environment
      message: customMessage,
      estimatedTime: customEstimatedTime,
      allowedIPs: customIPs,
      allowedEmails: customEmails,
      updatedAt: new Date()
    };
    
    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('Error getting maintenance status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get maintenance status' },
      { status: 500 }
    );
  }
}

// Update maintenance status
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    
    // Validate required fields
    if (typeof body.enabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'enabled field is required' },
        { status: 400 }
      );
    }
    
    const maintenanceData: MaintenanceStatus = {
      enabled: body.enabled,
      message: body.message || "We're making things better! Capsera is currently under maintenance.",
      estimatedTime: body.estimatedTime || "2-3 hours",
      allowedIPs: body.allowedIPs || [],
      allowedEmails: body.allowedEmails || [],
      updatedAt: new Date()
    };
    
    // Update or insert maintenance status
    await db.collection('system_settings').updateOne(
      { key: 'maintenance_mode' },
      { 
        $set: { 
          key: 'maintenance_mode',
          value: maintenanceData,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    
    console.log('🔧 Maintenance mode updated:', maintenanceData);
    
    return NextResponse.json({ 
      success: true, 
      message: `Maintenance mode ${maintenanceData.enabled ? 'enabled' : 'disabled'}`,
      status: maintenanceData
    });
  } catch (error) {
    console.error('Error updating maintenance status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update maintenance status' },
      { status: 500 }
    );
  }
}

// Delete maintenance status (disable)
export async function DELETE() {
  try {
    const { db } = await connectToDatabase();
    
    // Remove maintenance mode
    await db.collection('system_settings').deleteOne({ key: 'maintenance_mode' });
    
    console.log('✅ Maintenance mode disabled');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Maintenance mode disabled' 
    });
  } catch (error) {
    console.error('Error disabling maintenance mode:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to disable maintenance mode' },
      { status: 500 }
    );
  }
}
