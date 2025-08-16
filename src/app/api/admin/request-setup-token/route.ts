import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import { sendAdminSetupToken } from '@/lib/email-service';

// Only allow requests from the specified admin email
const ALLOWED_EMAIL = 'sunnyshinde2601@gmail.com';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Security check: Only allow the specified admin email
    if (email !== ALLOWED_EMAIL) {
      console.log('❌ Unauthorized token request attempt from:', email);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unauthorized email address. Token requests are restricted to authorized administrators only.' 
        },
        { status: 403 }
      );
    }

    // Check if JWT_SECRET is available
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET environment variable not set');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Server configuration error. Please contact system administrator.' 
        },
        { status: 500 }
      );
    }

    // Generate a unique JWT token for setup
    const tokenPayload = {
      type: 'admin-setup',
      purpose: 'initial-admin-creation',
      email: email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      jti: `setup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // Unique token ID
    };

    const setupToken = sign(tokenPayload, jwtSecret);

    // Log the token generation for security tracking
    console.log('🔐 Production setup token generated for:', email);
    console.log('📝 Token ID:', tokenPayload.jti);
    console.log('⏰ Expires:', new Date(tokenPayload.exp * 1000).toISOString());

    // Send the token via email
    const emailSent = await sendAdminSetupToken(email, setupToken);
    
    if (!emailSent) {
      console.error('❌ Failed to send email with token');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token generated but failed to send email. Please contact system administrator.' 
        },
        { status: 500 }
      );
    }

    console.log('✅ Token sent successfully via email to:', email);

    return NextResponse.json({
      success: true,
      message: 'Setup token generated and sent to admin email',
      tokenId: tokenPayload.jti,
      expiresAt: new Date(tokenPayload.exp * 1000).toISOString()
    });

  } catch (error) {
    console.error('❌ Error generating setup token:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to generate setup token. Please try again or contact system administrator.' 
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
