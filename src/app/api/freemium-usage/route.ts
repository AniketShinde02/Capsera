import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getFreemiumUsageInfo } from '@/lib/freemium-rate-limiter';

// Get client IP address
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return 'unknown';
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const clientIP = getClientIP(req);
    console.log('📊 Freemium usage info for API response:', { clientIP, userId: session?.user?.id });

    // Get freemium usage information
    const usageInfo = await getFreemiumUsageInfo(session?.user?.id, clientIP);
    console.log('📊 Freemium usage info for API response:', usageInfo);

    // Calculate time until reset
    const now = Date.now();
    const timeUntilReset = usageInfo.resetTime - now;
    const hoursUntilReset = Math.ceil(timeUntilReset / (60 * 60 * 1000));

    // Generate friendly reset message
    let resetMessage = 'tomorrow';
    if (hoursUntilReset < 24) {
      if (hoursUntilReset < 1) {
        resetMessage = 'in less than an hour';
      } else {
        resetMessage = `in ${hoursUntilReset} hours`;
      }
    } else if (hoursUntilReset < 48) { // Less than 2 days
      resetMessage = 'tomorrow';
    }

    return NextResponse.json({
      success: true,
      usage: {
        ...usageInfo,
        resetMessage,
        timeUntilReset,
        isAuthenticated: !!session?.user?.id,
        userEmail: session?.user?.email || null,
      }
    });

  } catch (error) {
    console.error('Error getting freemium usage info:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to get usage information',
      usage: {
        tier: 'free',
        dailyUsage: 0,
        weeklyUsage: 0,
        dailyLimit: 5,
        weeklyLimit: 1,
        remainingDaily: 5,
        remainingWeekly: 1,
        resetTime: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
        isInGracePeriod: false,
        upgradePrompt: false,
        resetMessage: 'tomorrow',
        timeUntilReset: 24 * 60 * 60 * 1000,
        isAuthenticated: false,
        userEmail: null,
      }
    }, { status: 500 });
  }
}
