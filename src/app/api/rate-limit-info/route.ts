import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { consolidatedRateLimiter } from '@/lib/consolidated-rate-limiter';

export async function GET(request: NextRequest) {
  try {
    // Get session for authenticated users
    const session = await getServerSession(authOptions);
    
    // Get client IP for rate limiting
    const clientIP = consolidatedRateLimiter.getClientIP(request);
    
    // Get rate limit info
    const rateLimitInfo = await consolidatedRateLimiter.getRateLimitInfo(session?.user?.id, clientIP);

    return NextResponse.json(rateLimitInfo);

  } catch (error: any) {
    console.error('Rate limit info API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to get rate limit information'
      },
      { status: 500 }
    );
  }
}
