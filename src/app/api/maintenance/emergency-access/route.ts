import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { 
  getMaintenanceConfig, 
  generateSecureToken, 
  calculateTokenExpiry,
  isValidEmail 
} from '@/lib/maintenance-config';

// Emergency access interface
interface EmergencyAccess {
  token: string;
  email: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
  ipAddress: string;
}

// Generate emergency access token
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    
    if (!body.email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get configuration from environment
    const config = getMaintenanceConfig();
    
    // Check if maintenance mode is enabled
    const maintenanceDoc = await db.collection('system_settings').findOne({ 
      key: 'maintenance_mode' 
    });
    
    if (!maintenanceDoc?.value?.enabled) {
      return NextResponse.json(
        { success: false, error: 'Maintenance mode is not enabled' },
        { status: 400 }
      );
    }

    // Check if email is in allowed list
    const allowedEmails = maintenanceDoc.value.allowedEmails || [];
    if (!allowedEmails.includes(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Email not in allowed list' },
        { status: 403 }
      );
    }

    // Check rate limiting per IP
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentTokensForIP = await db.collection('emergency_access').countDocuments({
      ipAddress: clientIP,
      createdAt: { $gte: oneHourAgo }
    });

    if (recentTokensForIP >= config.emergencyAccess.rateLimitPerIP) {
      return NextResponse.json(
        { success: false, error: `Rate limit exceeded. Maximum ${config.emergencyAccess.rateLimitPerIP} tokens per hour per IP.` },
        { status: 429 }
      );
    }

    // Check maximum tokens per email
    const activeTokensForEmail = await db.collection('emergency_access').countDocuments({
      email: body.email,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (activeTokensForEmail >= config.emergencyAccess.maxTokensPerEmail) {
      return NextResponse.json(
        { success: false, error: `Maximum ${config.emergencyAccess.maxTokensPerEmail} active tokens allowed per email. Please use existing tokens or wait for expiration.` },
        { status: 429 }
      );
    }

    // Generate emergency access token with configurable length
    const token = generateSecureToken(config.emergencyAccess.tokenLength);
    
    // Calculate expiration with configurable hours
    const expiresAt = calculateTokenExpiry(config.emergencyAccess.tokenExpiryHours);
    
    const emergencyAccess: EmergencyAccess = {
      token,
      email: body.email,
      expiresAt,
      used: false,
      createdAt: new Date(),
      ipAddress: clientIP
    };

    // Store emergency access token
    await db.collection('emergency_access').insertOne(emergencyAccess);

    console.log(`🔑 Emergency access token generated for: ${body.email} (IP: ${clientIP})`);
    console.log(`⏰ Token expires in: ${config.emergencyAccess.tokenExpiryHours} hours`);
    console.log(`🔢 Token length: ${config.emergencyAccess.tokenLength} characters`);

    return NextResponse.json({ 
      success: true, 
      message: 'Emergency access token generated',
      token,
      expiresAt,
      config: {
        expiryHours: config.emergencyAccess.tokenExpiryHours,
        maxTokensPerEmail: config.emergencyAccess.maxTokensPerEmail,
        rateLimitPerIP: config.emergencyAccess.rateLimitPerIP
      }
    });
  } catch (error) {
    console.error('Error generating emergency access:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate emergency access' },
      { status: 500 }
    );
  }
}

// Verify emergency access token
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    // Find emergency access token
    const emergencyDoc = await db.collection('emergency_access').findOne({ 
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!emergencyDoc) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 403 }
      );
    }

    // Mark token as used
    await db.collection('emergency_access').updateOne(
      { token },
      { $set: { used: true, usedAt: new Date() } }
    );

    console.log(`🔑 Emergency access granted for: ${emergencyDoc.email}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Emergency access granted',
      email: emergencyDoc.email,
      grantedAt: new Date()
    });
  } catch (error) {
    console.error('Error verifying emergency access:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify emergency access' },
      { status: 500 }
    );
  }
}

// Get emergency access statistics (admin only)
export async function PUT(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    
    if (body.action === 'get-stats') {
      const config = getMaintenanceConfig();
      
      // Get statistics
      const totalTokens = await db.collection('emergency_access').countDocuments();
      const activeTokens = await db.collection('emergency_access').countDocuments({
        used: false,
        expiresAt: { $gt: new Date() }
      });
      const usedTokens = await db.collection('emergency_access').countDocuments({ used: true });
      const expiredTokens = await db.collection('emergency_access').countDocuments({
        expiresAt: { $lte: new Date() }
      });

      return NextResponse.json({
        success: true,
        stats: {
          totalTokens,
          activeTokens,
          usedTokens,
          expiredTokens
        },
        config: {
          tokenExpiryHours: config.emergencyAccess.tokenExpiryHours,
          maxTokensPerEmail: config.emergencyAccess.maxTokensPerEmail,
          tokenLength: config.emergencyAccess.tokenLength,
          rateLimitPerIP: config.emergencyAccess.rateLimitPerIP
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error getting emergency access stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get statistics' },
      { status: 500 }
    );
  }
}
