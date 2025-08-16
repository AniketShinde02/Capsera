import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { EmailSubscription } from '@/lib/db/schema';
import { getEmailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    const { email, source = 'feature-development' } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingSubscription = await EmailSubscription.findOne({ email: email.toLowerCase() });
    
    if (existingSubscription) {
      if (existingSubscription.status === 'unsubscribed') {
        // Reactivate subscription
        existingSubscription.status = 'pending';
        existingSubscription.unsubscribedAt = undefined;
        await existingSubscription.save();
        
        console.log(`✅ Reactivated subscription for: ${email}`);
      } else {
        return NextResponse.json(
          { error: 'Email already subscribed' },
          { status: 409 }
        );
      }
    } else {
      // Create new subscription
      const subscription = new EmailSubscription({
        email: email.toLowerCase(),
        source,
        metadata: {
          userAgent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          timestamp: new Date()
        }
      });
      await subscription.save();
      
      console.log(`✅ New subscription created for: ${email}`);
    }

    // Send confirmation email using existing Brevo SMTP service
    const emailService = getEmailService();
    const confirmationLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/confirm-subscription?email=${encodeURIComponent(email)}`;
    
    const emailSent = await emailService.sendEmail({
      to: email,
      subject: '🎉 Welcome to Capsera! Confirm Your Subscription',
      body: `Thank you for subscribing to our feature updates! Please click the following link to confirm your subscription: ${confirmationLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin-bottom: 10px;">🎉 Welcome to Capsera!</h1>
            <p style="color: #666; font-size: 16px;">Thank you for subscribing to our feature updates!</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-bottom: 15px;">What happens next?</h2>
            <ul style="color: #555; line-height: 1.6; padding-left: 20px;">
              <li>We'll notify you when new features are ready</li>
              <li>Get early access to beta features</li>
              <li>Receive exclusive tips and updates</li>
              <li>Be the first to know about new AI capabilities</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationLink}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              ✅ Confirm Subscription
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 14px;">
              If you didn't sign up for this, you can safely ignore this email.
            </p>
          </div>
          
          <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px;">
              © 2024 Capsera. All rights reserved.
            </p>
          </div>
        </div>
      `
    });

    if (emailSent) {
      console.log(`✅ Confirmation email sent to: ${email}`);
    } else {
      console.error(`❌ Failed to send confirmation email to: ${email}`);
      // Don't fail the subscription if email fails
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Subscription created successfully! Please check your email to confirm.',
        email: email.toLowerCase()
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('❌ Email subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const subscription = await EmailSubscription.findOne({ email: email.toLowerCase() });
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      email: subscription.email,
      status: subscription.status,
      createdAt: subscription.createdAt,
      source: subscription.source
    });

  } catch (error) {
    console.error('❌ Get subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription' },
      { status: 500 }
    );
  }
}
