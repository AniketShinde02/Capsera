import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import DataRecoveryRequest from '@/models/DataRecoveryRequest';
import { sendRequestConfirmationEmail } from '@/lib/mail';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { reason, details, contactEmail } = await req.json();

    if (!reason || !details) {
      return NextResponse.json(
        { success: false, message: 'Reason and details are required' },
        { status: 400 }
      );
    }

    // Get user details for email
    const user = await User.findById(session.user.id).select('name username email emailPreferences');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Create recovery request
    const recoveryRequest = await DataRecoveryRequest.create({
      userId: session.user.id,
      userEmail: session.user.email,
      reason,
      details,
      contactEmail: contactEmail || session.user.email,
      status: 'pending',
      submittedAt: new Date(),
    });

    // Send confirmation email to user if enabled
    if (user.emailPreferences?.requestConfirmations) {
      try {
        await sendRequestConfirmationEmail({
          name: user.name || user.username || user.email.split('@')[0],
          email: user.email,
          requestType: 'data_recovery',
          requestId: recoveryRequest._id.toString(),
          estimatedTime: '3-5 business days',
          nextSteps: [
            'Our team will review your request within 24 hours',
            'We may contact you for additional verification if needed',
            'Once approved, your data will be prepared for recovery',
            'You\'ll receive a secure download link when ready'
          ]
        });
        console.log('📧 Data recovery confirmation email sent to:', user.email);
      } catch (emailError) {
        console.error('📧 Failed to send data recovery confirmation email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // TODO: Send notification to admin team
    console.log(`📧 Data recovery request submitted: ${session.user.email} - ${reason}`);

    return NextResponse.json({
      success: true,
      message: 'Recovery request submitted successfully',
      requestId: recoveryRequest._id,
    });

  } catch (error: any) {
    console.error('Error submitting recovery request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit recovery request' },
      { status: 500 }
    );
  }
}
