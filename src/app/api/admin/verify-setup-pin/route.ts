import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();

    if (!pin) {
      return NextResponse.json(
        { success: false, message: 'PIN is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Get stored PIN from system settings (same as system lock)
    const storedPinDoc = await db.collection('systemsettings').findOne({ 
      key: 'system_lock_pin' 
    });

    if (!storedPinDoc || !storedPinDoc.isActive) {
      return NextResponse.json({
        success: false,
        message: 'System lock not configured. Please set a PIN in admin dashboard first.'
      }, { status: 400 });
    }

    // Verify PIN using the same bcrypt comparison as system lock
    const isValid = await bcrypt.compare(pin, storedPinDoc.value);
    
    if (!isValid) {
      return NextResponse.json({
        success: false,
        message: 'Invalid PIN'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'PIN verified successfully'
    });
    
  } catch (error) {
    console.error('Setup PIN verification failed:', error);
    return NextResponse.json(
      { success: false, message: 'PIN verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
