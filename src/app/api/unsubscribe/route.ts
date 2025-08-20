import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unsubscribe token is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user by unsubscribe token
    const user = await (User as any).findOne({ unsubscribeToken: token });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired unsubscribe token' },
        { status: 400 }
      );
    }

    // Unsubscribe user from promotional emails
    user.emailPreferences.promotional = false;
    user.unsubscribeToken = null;
    await user.save();

    // Redirect to a confirmation page
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      console.error('❌ Missing NEXTAUTH_URL or NEXT_PUBLIC_APP_URL environment variable');
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    const redirectUrl = `${baseUrl}/unsubscribe-confirmation?email=${encodeURIComponent(user.email)}`;

    return NextResponse.redirect(redirectUrl);

  } catch (error: any) {
    console.error('❌ Error processing unsubscribe request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process unsubscribe request' },
      { status: 500 }
    );
  }
}

// POST method for programmatic unsubscribe
export async function POST(req: NextRequest) {
  try {
    const { token, email } = await req.json();

    if (!token && !email) {
      return NextResponse.json(
        { success: false, message: 'Either unsubscribe token or email is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    let user;
    if (token) {
      user = await (User as any).findOne({ unsubscribeToken: token });
    } else if (email) {
              user = await (User as any).findOne({ email: email.toLowerCase() });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Unsubscribe user from promotional emails
    user.emailPreferences.promotional = false;
    user.unsubscribeToken = null;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from promotional emails',
      data: {
        email: user.email,
        unsubscribedAt: new Date()
      }
    });

  } catch (error: any) {
    console.error('❌ Error processing unsubscribe request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process unsubscribe request' },
      { status: 500 }
    );
  }
}
