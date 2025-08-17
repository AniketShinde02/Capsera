import { NextResponse, NextRequest } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/mail';
import { getClientIP, checkRateLimit, blockCredentials, isCredentialsBlocked } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// Password reset rate limiting configuration
const RESET_RATE_LIMITS = {
  MAX_DAILY_RESETS: 3, // Maximum 3 reset requests per user per day
  MAX_IP_RESETS: 5,     // Maximum 5 reset requests per IP per day
  WINDOW_HOURS: 24,     // 24-hour window
};

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // Get client IP and user agent for security tracking
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Check if this IP is blocked from making reset requests
    const ipBlockStatus = await isCredentialsBlocked(`ip:${clientIP}`);
    if (ipBlockStatus.blocked) {
      console.log(`🚫 IP ${clientIP} is blocked from password reset requests until ${new Date(ipBlockStatus.blockedUntil!)}`);
      return NextResponse.json({ 
        message: 'Too many password reset attempts from this location. Please try again later.' 
      }, { status: 429 });
    }

    // Check if this email is blocked
    const emailBlockStatus = await isCredentialsBlocked(email);
    if (emailBlockStatus.blocked) {
      console.log(`🚫 Email ${email} is blocked from password reset requests until ${new Date(emailBlockStatus.blockedUntil!)}`);
      return NextResponse.json({ 
        message: 'Too many password reset attempts for this email. Please try again later.' 
      }, { status: 429 });
    }

    // Rate limit check for IP-based requests
    const ipRateLimitKey = `reset:ip:${clientIP}`;
    const ipRateLimit = await checkRateLimit(ipRateLimitKey, RESET_RATE_LIMITS.MAX_IP_RESETS, RESET_RATE_LIMITS.WINDOW_HOURS);
    
    if (!ipRateLimit.allowed) {
      console.log(`🚫 IP rate limit exceeded for ${clientIP}: ${RESET_RATE_LIMITS.MAX_IP_RESETS - ipRateLimit.remaining}/${RESET_RATE_LIMITS.MAX_IP_RESETS} requests`);
      
      // Block this IP if it's making too many requests
      await blockCredentials(`ip:${clientIP}`, 'password_reset_abuse', clientIP, userAgent);
      
      return NextResponse.json({ 
        message: 'Too many password reset requests from this location. Please try again later.' 
      }, { status: 429 });
    }

    await dbConnect();
    const user = await User.findOne({ email }).select('+resetPasswordRequests +dailyResetCount +lastResetRequestDate');

    // Always return success to avoid revealing whether the email exists
    if (!user) {
      console.log(`📧 Password reset requested for non-existent email: ${email} from IP: ${clientIP}`);
      return NextResponse.json({ success: true });
    }

    // Check if user has exceeded daily reset limit
    if (!user.canRequestPasswordReset()) {
      console.log(`🚫 Daily reset limit exceeded for user: ${email} (${user.dailyResetCount}/3 requests)`);
      return NextResponse.json({ 
        message: 'You have reached the maximum number of password reset requests for today. Please try again tomorrow.' 
      }, { status: 429 });
    }

    // Generate new secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with new reset token and tracking
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    user.incrementResetCounter();
    user.addResetRequest(token, clientIP, userAgent);
    user.cleanupOldResetRequests();
    
    await user.save();

    // Dynamically determine the base URL from the request
    const url = new URL(req.url);
    const baseUrl = process.env.NEXTAUTH_URL || 
                   process.env.NEXT_PUBLIC_APP_URL || 
                   `${url.protocol}//${url.host}`;
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

    // Send password reset email
    await sendPasswordResetEmail(email, resetUrl);

    console.log(`✅ Password reset email sent to ${email} from IP ${clientIP}. Daily count: ${user.dailyResetCount}/3`);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Forgot-password error:', e);
    return NextResponse.json({ message: 'Failed to send reset link' }, { status: 500 });
  }
}
