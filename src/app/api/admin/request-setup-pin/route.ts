import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Check if system lock is enabled
    const lockDoc = await db.collection('systemsettings').findOne({ 
      key: 'system_lock_pin' 
    });

    if (!lockDoc || !lockDoc.isActive) {
      return NextResponse.json({ 
        error: 'System lock not configured. Please set up PIN protection first.' 
      }, { status: 400 });
    }

    // Generate a 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the PIN temporarily (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    await db.collection('temp_pins').updateOne(
      { email },
      { 
        $set: { 
          pin,
          expiresAt,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    // TODO: Send PIN via email service
    // For now, we'll just return it (in production, send via email)
    
    return NextResponse.json({
      success: true,
      message: 'Setup PIN generated successfully',
      pin, // Remove this in production - only send via email
      expiresIn: '10 minutes'
    });

  } catch (error) {
    console.error('Error generating setup PIN:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
