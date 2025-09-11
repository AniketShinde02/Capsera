import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/admin-middleware';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminError = await verifyAdminAccess(request);
    if (adminError) return adminError;

    // Mock Gemini API key status
    const keys = Array.from({ length: 5 }, (_, i) => ({
      index: i + 1,
      isActive: i < 3, // First 3 keys active
      requestCount: Math.floor(Math.random() * 1000),
      lastUsed: Date.now() - Math.floor(Math.random() * 3600000),
      timeSinceLastUse: Math.floor(Math.random() * 3600000)
    }));

    const usage = {
      totalRequests: 15420,
      dailyRequests: 1250,
      dailyLimit: 1500,
      remainingDaily: 250,
      activeKeys: 3,
      totalKeys: 5,
      efficiency: '3,140'
    };

    const rateLimits = {
      totalIPs: 2,
      activeLimits: [
        {
          ip: '192.168.1.100',
          count: 15,
          resetTime: Date.now() + 300000,
          remainingTime: 300
        },
        {
          ip: '10.0.0.50',
          count: 12,
          resetTime: Date.now() + 180000,
          remainingTime: 180
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: {
        keys: {
          totalKeys: 5,
          activeKeys: 3,
          dailyRequests: 1250,
          dailyLimit: 1500,
          currentKeyIndex: 0,
          keys
        },
        usage,
        rateLimits
      }
    });

  } catch (error: any) {
    console.error('Keys API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch key status',
      message: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminError = await verifyAdminAccess(request);
    if (adminError) return adminError;

    const body = await request.json();
    const { action, keyIndex } = body;

    switch (action) {
      case 'reactivate_all':
        return NextResponse.json({
          success: true,
          message: 'All keys reactivated successfully'
        });

      case 'deactivate':
        return NextResponse.json({
          success: true,
          message: `Key ${keyIndex} deactivated successfully`
        });

      case 'reset_rate_limits':
        return NextResponse.json({
          success: true,
          message: 'All rate limits reset successfully'
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Keys action error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to perform key action',
      message: error.message
    }, { status: 500 });
  }
}