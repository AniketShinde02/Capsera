import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  getGeminiKeyStatus, 
  getGeminiUsageStats, 
  deactivateGeminiKey, 
  reactivateAllGeminiKeys 
} from '@/lib/gemini-keys';
import { 
  getRateLimitStatus, 
  resetAllRateLimits 
} from '@/lib/rate-limit-simple';

// GET: Get current key status and usage statistics
export async function GET(req: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session.user.isAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Admin access required'
      }, { status: 403 });
    }

    // Get comprehensive status
    const keyStatus = getGeminiKeyStatus();
    const usageStats = getGeminiUsageStats();
    const rateLimitStatus = getRateLimitStatus();

    return NextResponse.json({
      success: true,
      data: {
        keys: keyStatus,
        usage: usageStats,
        rateLimits: {
          totalIPs: rateLimitStatus.totalIPs,
          activeLimits: Array.from(rateLimitStatus.limits.entries()).map(([ip, limit]) => ({
            ip,
            count: limit.count,
            resetTime: limit.resetTime,
            remainingTime: Math.ceil((limit.resetTime - Date.now()) / 1000)
          }))
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Admin keys API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to get key status',
      error: error.message
    }, { status: 500 });
  }
}

// POST: Manage keys (deactivate/reactivate)
export async function POST(req: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session.user.isAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Admin access required'
      }, { status: 403 });
    }

    const body = await req.json();
    const { action, keyIndex } = body;

    if (action === 'deactivate' && typeof keyIndex === 'number') {
      deactivateGeminiKey(keyIndex);
      return NextResponse.json({
        success: true,
        message: `Key ${keyIndex + 1} deactivated successfully`
      });
    }

    if (action === 'reactivate_all') {
      reactivateAllGeminiKeys();
      return NextResponse.json({
        success: true,
        message: 'All keys reactivated successfully'
      });
    }

    if (action === 'reset_rate_limits') {
      resetAllRateLimits();
      return NextResponse.json({
        success: true,
        message: 'All rate limits reset successfully'
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid action specified'
    }, { status: 400 });

  } catch (error: any) {
    console.error('❌ Admin keys management error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to manage keys',
      error: error.message
    }, { status: 500 });
  }
}
