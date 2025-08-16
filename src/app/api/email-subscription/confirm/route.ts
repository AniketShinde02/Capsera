import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { EmailSubscription } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Find and update subscription
    const subscription = await EmailSubscription.findOne({ email: email.toLowerCase() });
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    if (subscription.status === 'confirmed') {
      return NextResponse.json(
        { message: 'Subscription already confirmed' },
        { status: 200 }
      );
    }

    // Update subscription status
    subscription.status = 'confirmed';
    subscription.confirmedAt = new Date();
    await subscription.save();

    console.log(`✅ Subscription confirmed for: ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Subscription confirmed successfully! You\'ll now receive updates about new features.',
      email: subscription.email,
      status: subscription.status,
      confirmedAt: subscription.confirmedAt
    });

  } catch (error) {
    console.error('❌ Confirm subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm subscription. Please try again.' },
      { status: 500 }
    );
  }
}
