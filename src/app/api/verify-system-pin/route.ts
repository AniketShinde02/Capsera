import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();

    if (!pin) {
      return NextResponse.json({ 
        error: 'PIN is required' 
      }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Get stored PIN from system settings
    const storedPinDoc = await db.collection('systemsettings').findOne({ 
      key: 'system_lock_pin' 
    });

    if (!storedPinDoc || !storedPinDoc.isActive) {
      return NextResponse.json({ 
        error: 'System lock not configured. Please set a PIN in admin dashboard first.' 
      }, { status: 400 });
    }

    // Verify PIN
    const isValid = await bcrypt.compare(pin, storedPinDoc.value);
    
    if (!isValid) {
      return NextResponse.json({ 
        error: 'Invalid PIN' 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'PIN verified successfully',
      verified: true
    });

  } catch (error) {
    console.error('Error verifying system PIN:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
