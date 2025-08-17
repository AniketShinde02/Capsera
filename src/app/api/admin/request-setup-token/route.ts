import { NextRequest, NextResponse } from 'next/server';
import { otpDbService } from '@/lib/otp-db-service';
import { sendAdminSetupOTP } from '@/lib/email-service';

// Only allow requests from the specified admin email
const ALLOWED_EMAIL = 'sunnyshinde2601@gmail.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate email exists and is a string
    if (!body.email || typeof body.email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Valid email is required' },
        { status: 400 }
      );
    }

    // TypeScript should now know body.email is a string
    const email = body.email as string;

    // Security check: Only allow the specified admin email
    if (email !== ALLOWED_EMAIL) {
      console.log('❌ Unauthorized OTP request attempt from:', email);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unauthorized email address. OTP requests are restricted to authorized administrators only.' 
        },
        { status: 403 }
      );
    }

    // Generate a new 6-digit OTP
    const otpResult = await otpDbService.generateOTP(email);
    
    if (!otpResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: otpResult.message 
        },
        { status: 429 }
      );
    }

    const { otp } = otpResult;

    // Log the OTP generation for security tracking
    console.log('🔐 Production setup OTP generated for:', email);
    console.log('📝 OTP:', otp);
    console.log('⏰ Expires in 5 minutes');

    // Send the OTP via email - email is guaranteed to be a string at this point
    const emailSent = await sendAdminSetupOTP(email, otp as string);
    
    if (!emailSent) {
      console.error('❌ Failed to send email with OTP');
      return NextResponse.json(
        { 
          success: false, 
          message: 'OTP generated but failed to send email. Please contact system administrator.' 
        },
        { status: 500 }
      );
    }

    console.log('✅ OTP sent successfully via email to:', email);

    return NextResponse.json({
      success: true,
      message: 'Setup OTP generated and sent to admin email',
      expiresIn: '5 minutes',
      instructions: 'Check your email for the 6-digit OTP code'
    });

  } catch (error) {
    console.error('❌ Error generating setup OTP:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to generate setup OTP. Please try again or contact system administrator.' 
      },
      { status: 500 }
    );
  }
}

// Block GET requests for security
export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      message: 'Method not allowed. Use POST to request a setup token.' 
    },
    { status: 405 }
  );
}
