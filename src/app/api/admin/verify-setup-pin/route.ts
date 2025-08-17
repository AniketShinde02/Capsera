import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { pin, email } = await request.json();

    if (!pin) {
      return NextResponse.json(
        { success: false, message: 'PIN is required' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Check if system lock is enabled
    const lockDoc = await db.collection('systemsettings').findOne({ 
      key: 'system_lock_pin' 
    });

    if (!lockDoc || !lockDoc.isActive) {
      return NextResponse.json(
        { success: false, message: 'System lock not configured. Please set up PIN protection first.' },
        { status: 400 }
      );
    }

    // Verify the PIN against the stored hashed PIN
    const isValid = await bcrypt.compare(pin, lockDoc.value);
    
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid PIN' },
        { status: 400 }
      );
    }

    console.log('✅ Setup PIN verified successfully for:', email);
    
    return NextResponse.json({
      success: true,
      message: 'PIN verified successfully'
    });
    
  } catch (error) {
    console.error('Setup PIN verification failed:', error);
    return NextResponse.json(
      { success: false, message: 'PIN verification failed' },
      { status: 500 }
    );
  }
}
