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
    
    // Get freemium usage information
    const usageInfo = await getFreemiumUsageInfo(session?.user?.id, clientIP);
    
    // Calculate time until reset
    const now = Date.now();
    const timeUntilReset = usageInfo.resetTime - now;
    const hoursUntilReset = Math.ceil(timeUntilReset / (60 * 60 * 1000));
    
    // Generate friendly reset message
    let resetMessage = 'next month';
    if (hoursUntilReset < 24) {
      if (hoursUntilReset < 1) {
        resetMessage = 'in less than an hour';
      } else {
        resetMessage = `in ${hoursUntilReset} hours`;
      }
    } else if (hoursUntilReset < 168) { // Less than a week
      const daysUntilReset = Math.ceil(hoursUntilReset / 24);
      resetMessage = `in ${daysUntilReset} days`;
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
        monthlyUsage: 0,
        weeklyUsage: 0,
        monthlyLimit: 5,
        weeklyLimit: 1,
        remainingMonthly: 5,
        remainingWeekly: 1,
        resetTime: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
        isInGracePeriod: false,
        upgradePrompt: false,
        resetMessage: 'next month',
        timeUntilReset: 30 * 24 * 60 * 60 * 1000,
        isAuthenticated: false,
        userEmail: null,
      }
    }, { status: 500 });
  }
}
