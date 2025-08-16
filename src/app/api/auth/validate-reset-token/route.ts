import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, token } = await req.json();
    
    if (!email || !token) {
      return NextResponse.json({ 
        valid: false, 
        message: 'Email and token are required' 
      }, { status: 400 });
    }

    await dbConnect();
    
    // Find user with the reset token
    const user = await User.findOne({ 
      email, 
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    }).select('+resetPasswordRequests');

    if (!user) {
      return NextResponse.json({ 
        valid: false, 
        message: 'Invalid or expired reset token' 
      });
    }

    // Check if this token has already been used
    const resetRequest = user.resetPasswordRequests.find(req => req.token === token);
    if (!resetRequest) {
      return NextResponse.json({ 
        valid: false, 
        message: 'Invalid reset token' 
      });
    }

    if (resetRequest.used) {
      return NextResponse.json({ 
        valid: false, 
        message: 'This reset link has already been used' 
      });
    }

    // Token is valid and unused
    return NextResponse.json({ 
      valid: true, 
      message: 'Token is valid',
      expiresAt: user.resetPasswordExpires
    });

  } catch (e: any) {
    console.error('Validate reset token error:', e);
    return NextResponse.json({ 
      valid: false, 
      message: 'Failed to validate token' 
    }, { status: 500 });
  }
}
