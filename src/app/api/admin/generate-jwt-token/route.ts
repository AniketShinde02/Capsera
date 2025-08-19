import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // JWT secret - in production, this should be a secure secret
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return NextResponse.json({ 
        error: 'JWT_SECRET environment variable not configured' 
      }, { status: 500 });
    }
    // Check if admin system is already set up
    const { db } = await connectToDatabase();
    const adminExists = await db.collection('users').countDocuments({ isAdmin: true });
    
    if (adminExists) {
      return NextResponse.json(
        { success: false, message: 'Admin system already exists. Cannot generate setup token.' },
        { status: 400 }
      );
    }

    // Generate JWT token with 24 hour expiration
    const payload = {
      type: 'admin-setup',
      purpose: 'initial-admin-creation',
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      iat: Math.floor(Date.now() / 1000),
      jti: `setup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    const token = jwt.sign(payload, JWT_SECRET);

    // Store token in database for tracking (optional)
    await db.collection('setup_tokens').insertOne({
      token,
      type: 'admin-setup',
      purpose: 'initial-admin-creation',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + (24 * 60 * 60 * 1000)),
      used: false,
      usedAt: null
    });

    return NextResponse.json({
      success: true,
      message: 'JWT setup token generated successfully',
      token,
      expiresAt: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString(),
      instructions: [
        '1. Share this token securely with the admin',
        '2. Admin should visit /setup page',
        '3. Enter the token to create admin account',
        '4. Token expires in 24 hours',
        '5. Token can only be used once'
      ]
    });

  } catch (error) {
    console.error('Error generating JWT token:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate JWT token' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Get setup token status
    const setupTokens = await db.collection('setup_tokens')
      .find({ type: 'admin-setup' })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    const activeTokens = setupTokens.filter(token => 
      !token.used && new Date(token.expiresAt) > new Date()
    );

    return NextResponse.json({
      success: true,
      activeTokens: activeTokens.length,
      lastGenerated: setupTokens[0]?.createdAt || null,
      message: activeTokens.length > 0 
        ? `${activeTokens.length} active setup token(s) available`
        : 'No active setup tokens'
    });

  } catch (error) {
    console.error('Error checking setup token status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check token status' },
      { status: 500 }
    );
  }
}
