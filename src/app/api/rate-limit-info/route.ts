import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getRateLimitInfo, getClientIP } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    // Get session for authenticated users
    const session = await getServerSession(authOptions);
    
    // Get client IP for rate limiting
    const clientIP = getClientIP(request);
    
    // Get rate limit info
    const rateLimitInfo = await getRateLimitInfo(session?.user?.id, clientIP);

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
