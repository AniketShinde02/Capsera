import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '@/lib/mail';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    await dbConnect();

    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json(
                { success: false, message: 'Email and OTP are required' },
                { status: 400 }
            );
        }

        // Find user with this email and include the hidden verification fields
        const user = await (User as any).findOne({ email }).select('+verificationToken +verificationTokenExpires');

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        if (user.isVerified) {
            return NextResponse.json(
                { success: true, message: 'Email already verified' },
                { status: 200 }
            );
        }

        if (!user.verificationToken || !user.verificationTokenExpires) {
            return NextResponse.json(
                { success: false, message: 'No verification pending' },
                { status: 400 }
            );
        }

        // Check expiration
        if (user.verificationTokenExpires < new Date()) {
            return NextResponse.json(
                { success: false, message: 'Verification code expired' },
                { status: 400 }
            );
        }

        // Verify OTP
        const isValid = await bcrypt.compare(otp, user.verificationToken);

        if (!isValid) {
            return NextResponse.json(
                { success: false, message: 'Invalid verification code' },
                { status: 400 }
            );
        }

        // Activate user
        user.isVerified = true;
        user.status = 'active';
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        user.emailVerified = new Date();

        // Send welcome email now that they are verified
        if (!user.welcomeEmailSent) {
            try {
                await sendWelcomeEmail({
                    name: email.split('@')[0],
                    email: user.email,
                    username: email.split('@')[0]
                });
                user.welcomeEmailSent = true;
            } catch (e) {
                console.error('Failed to send welcome email after verification', e);
            }
        }

        await user.save();

        return NextResponse.json({
            success: true,
            message: 'Email verified successfully'
        }, { status: 200 });

    } catch (error: any) {
        console.error('Verification Error:', error);
        return NextResponse.json({ success: false, message: error.message || 'An unexpected error occurred.' }, { status: 500 });
    }
}
