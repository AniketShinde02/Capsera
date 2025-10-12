import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/admin-middleware';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminError = await verifyAdminAccess(request);
    if (adminError) return adminError;

    // Get environment configuration (only safe, non-sensitive values)
    const config = {
      mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/capsera",
      nextAuthUrl: process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length || 0,
      cloudinaryCloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "Not configured",
      geminiApiKeys: process.env.GEMINI_API_KEY_1 ? 
        Array.from({ length: 5 }, (_, i) => {
          const key = process.env[`GEMINI_API_KEY_${i + 1}`];
          return key ? `Key ${i + 1}: ${key.substring(0, 8)}...` : `Key ${i + 1}: Not configured`;
        }) : ["No Gemini API keys configured"],
      maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
      maintenanceAllowedIPs: process.env.MAINTENANCE_ALLOWED_IPS?.split(',') || [],
      maintenanceAllowedEmails: process.env.MAINTENANCE_ALLOWED_EMAILS?.split(',') || []
    };

    console.log('📋 Admin config requested:', {
      hasNextAuthSecret: config.hasNextAuthSecret,
      nextAuthSecretLength: config.nextAuthSecretLength,
      geminiKeysCount: config.geminiApiKeys.filter(key => !key.includes('Not configured')).length,
      maintenanceMode: config.maintenanceMode
    });

    return NextResponse.json({
      success: true,
      config
    });

  } catch (error: any) {
    console.error('Config API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch configuration',
      message: error.message
    }, { status: 500 });
  }
}
