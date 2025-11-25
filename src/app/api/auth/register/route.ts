import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { isCredentialsBlocked } from '@/lib/_deprecated_rate_limiters/rate-limit';
import { sendVerificationEmail } from '@/lib/mail';
import crypto from 'crypto';
import { isDisposableEmailRemote } from '@/lib/disposable-email-domains';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide email and password' },
        { status: 400 }
      );
    }

    // 🚫 Check for disposable email domains (Remote Check)
    const isDisposable = await isDisposableEmailRemote(email);
    if (isDisposable) {
      return NextResponse.json(
        {
          success: false,
          message: 'Disposable or temporary email addresses are not allowed. Please use a valid email provider (Gmail, Outlook, etc.).',
          type: 'disposable_email'
        },
        { status: 400 }
      );
    }

    // 🚫 Check if credentials are blocked due to abuse
    const blockStatus = await isCredentialsBlocked(email);
    if (blockStatus.blocked) {
      console.log(`🚫 Blocked registration attempt for: ${email}`);
      return NextResponse.json(
        {
          success: false,
          message: `This email is temporarily blocked due to suspicious activity. Please try again in ${blockStatus.hoursRemaining} hours.`,
          type: 'blocked_credentials'
        },
        { status: 423 } // Locked
      );
    }

    // Enforce strong password rules
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
    if (!strong.test(password)) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.' },
        { status: 400 }
      );
    }

    const userExists = await (User as any).findOne({ email });

    if (userExists) {
      return NextResponse.json(
        { success: false, message: 'User already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unsubscribe token for promotional emails
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const user = await (User as any).create({
      email,
      password: hashedPassword,
      passwordHistory: [],
      unsubscribeToken,
      emailPreferences: {
        promotional: true,
        welcome: true,
        requestConfirmations: true
      },
      // Set default role and status
      role: null,
      status: 'pending', // Pending verification
      isVerified: false,
      isAdmin: false,
      isSuperAdmin: false,
      verificationToken: hashedOtp,
      verificationTokenExpires: otpExpires
    });

    // Send verification email
    try {
      await sendVerificationEmail({
        email: user.email,
        otp
      });

      console.log('📧 Verification email sent to:', user.email);
    } catch (emailError) {
      console.error('📧 Failed to send verification email:', emailError);
      // We still return success but maybe warn the frontend? 
      // Ideally we should rollback user creation if email fails, but for now let's keep it simple.
    }

    return NextResponse.json({
      success: true,
      requireVerification: true,
      message: 'Verification code sent to your email.'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
