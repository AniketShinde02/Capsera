import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('🔍 Debug Session - Raw session:', session);
    
    if (!session) {
      return NextResponse.json({
        success: false,
        message: 'No session found',
        session: null
      });
    }
    
    const userInfo = {
      id: session.user?.id,
      email: session.user?.email,
      role: session.user?.role,
      roleName: session.user?.role?.name,
      roleDisplayName: session.user?.role?.displayName,
      username: session.user?.username,
      isVerified: session.user?.isVerified
    };
    
    console.log('🔍 Debug Session - User info:', userInfo);
    
    return NextResponse.json({
      success: true,
      message: 'Session debug info',
      session: {
        hasSession: true,
        user: userInfo
      }
    });
    
  } catch (error) {
    console.error('❌ Debug session error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Debug session failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
