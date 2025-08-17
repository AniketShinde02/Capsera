import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { getClientIP } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const PASSWORD_HISTORY_LIMIT = 5;

export async function POST(req: NextRequest) {
  try {
    const { email, token, newPassword } = await req.json();
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
    
    if (!email || !token || !newPassword || !strong.test(newPassword)) {
      return NextResponse.json({ 
        message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.' 
      }, { status: 400 });
    }

    const clientIP = getClientIP(req);

    await dbConnect();
    
    // Find user with the reset token and check all security conditions
    const user = await User.findOne({ 
      email, 
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    }).select('+password +passwordHistory +resetPasswordRequests');

    if (!user) {
      console.log(`❌ Invalid or expired reset token for email: ${email} from IP: ${clientIP}`);
      return NextResponse.json({ 
        message: 'Invalid or expired reset token. Please request a new password reset link.' 
      }, { status: 400 });
    }

    // Check if this token has already been used
    const resetRequest = user.resetPasswordRequests.find((req: any) => req.token === token);
    if (!resetRequest) {
      console.log(`❌ Reset token not found in tracking for email: ${email} from IP: ${clientIP}`);
      return NextResponse.json({ 
        message: 'Invalid reset token. Please request a new password reset link.' 
      }, { status: 400 });
    }

    if (resetRequest.used) {
      console.log(`❌ Reset token already used for email: ${email} from IP: ${clientIP}`);
      return NextResponse.json({ 
        message: 'This reset link has already been used. Please request a new password reset link.' 
      }, { status: 400 });
    }

    // Check if the token was requested from a different IP (potential security issue)
    if (resetRequest.ipAddress !== clientIP) {
      console.log(`⚠️ Security warning: Reset token used from different IP. Original: ${resetRequest.ipAddress}, Current: ${clientIP} for email: ${email}`);
      
      // Log this as a potential security issue but allow the reset to proceed
      // The token is still valid and the user might be using a different network
    }

    // Prevent reuse against current and history
    if (await bcrypt.compare(newPassword, user.password)) {
      return NextResponse.json({ 
        message: 'You cannot reuse your previous password. Please choose a different one.' 
      }, { status: 400 });
    }

    if (Array.isArray((user as any).passwordHistory)) {
      for (const oldHash of (user as any).passwordHistory) {
        if (await bcrypt.compare(newPassword, oldHash)) {
          return NextResponse.json({ 
            message: 'You cannot reuse a previously used password. Please choose a new one.' 
          }, { status: 400 });
        }
      }
    }

    // Hash the new password
    const newHash = await bcrypt.hash(newPassword, 10);
    
    // Update password and history
    (user as any).passwordHistory = [user.password, ...((user as any).passwordHistory || [])].slice(0, PASSWORD_HISTORY_LIMIT);
    user.password = newHash;

    // Mark this reset token as used
    user.markResetTokenUsed(token);

    // Clear the reset token and expiry (single-use enforcement)
    user.resetPasswordToken = null as any;
    user.resetPasswordExpires = null as any;

    // Save the user
    await user.save();

    console.log(`✅ Password successfully reset for email: ${email} from IP: ${clientIP}. Token marked as used.`);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Reset-password error:', e);
    return NextResponse.json({ message: 'Failed to reset password' }, { status: 500 });
  }
}
