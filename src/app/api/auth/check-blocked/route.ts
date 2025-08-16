import { NextRequest, NextResponse } from 'next/server';
import { isCredentialsBlocked } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if credentials are blocked
    const blockStatus = await isCredentialsBlocked(email);

    return NextResponse.json({
      success: true,
      blocked: blockStatus.blocked,
      reason: blockStatus.reason,
      hoursRemaining: blockStatus.hoursRemaining,
      attempts: blockStatus.attempts,
    });

  } catch (error: any) {
    console.error('Error checking blocked status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check blocked status' },
      { status: 500 }
    );
  }
}
