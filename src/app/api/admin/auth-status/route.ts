import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check if NextAuth secret is configured
    const authSecret = process.env.NEXTAUTH_SECRET;
    
    if (!authSecret) {
      return NextResponse.json({ 
        success: false, 
        configured: false,
        error: 'NEXTAUTH_SECRET not configured' 
      }, { status: 400 });
    }

    // Check if we can get a session (basic auth test)
    try {
      const session = await getServerSession(authOptions);
      // Even if no session, the fact that authOptions works means auth is configured
      return NextResponse.json({ 
        success: true, 
        configured: true,
        message: 'Authentication properly configured',
        secretLength: authSecret.length // Show length for debugging without exposing secret
      });
    } catch (error) {
      return NextResponse.json({ 
        success: false, 
        configured: false,
        error: 'Authentication configuration error' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error checking auth status:', error);
    return NextResponse.json({ 
      success: false, 
      configured: false,
      error: 'Failed to check authentication status' 
    }, { status: 500 });
  }
}
