
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { isCredentialsBlocked, getClientIP } from '@/lib/rate-limit';
import { sendWelcomeEmail } from '@/lib/mail';
import crypto from 'crypto';

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
    
    const userExists = await User.findOne({ email });

    if (userExists) {
        return NextResponse.json(
            { success: false, message: 'User already exists' },
            { status: 409 }
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unsubscribe token for promotional emails
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      email,
      password: hashedPassword,
      passwordHistory: [],
      unsubscribeToken,
      emailPreferences: {
        promotional: true,
        welcome: true,
        requestConfirmations: true
      }
    });
    
    // Send welcome email
    try {
      await sendWelcomeEmail({
        name: email.split('@')[0], // Use email prefix as name
        email: user.email,
        username: email.split('@')[0]
      });
      
      // Mark welcome email as sent
      user.welcomeEmailSent = true;
      await user.save();
      
      console.log('📧 Welcome email sent to:', user.email);
    } catch (emailError) {
      console.error('📧 Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }
    
    return NextResponse.json({ success: true, data: { email: user.email } }, { status: 201 });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
