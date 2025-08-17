import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: 'No session found'
      });
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.user.id,
        email: session.user.email,
        role: (session.user as any).role,
        isAdmin: (session.user as any).isAdmin,
        username: (session.user as any).username,
        canBrowseAsUser: (session.user as any).canBrowseAsUser,
        hasRegularUserAccount: (session.user as any).hasRegularUserAccount,
        regularUserId: (session.user as any).regularUserId
      }
    });

  } catch (error: any) {
    console.error('Test admin API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error checking session',
      error: error.message
    }, { status: 500 });
  }
}
