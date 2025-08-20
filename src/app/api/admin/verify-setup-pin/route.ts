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

    // If no system lock is configured, allow access for authorized admin email
    if (!lockDoc || !lockDoc.isActive) {
      // Check if this is the authorized admin email
      const authorizedEmail = 'sunnyshinde2601@gmail.com';
      
      if (email === authorizedEmail) {
        console.log('✅ System lock not configured, allowing access for authorized admin:', email);
        return NextResponse.json({
          success: true,
          message: 'Access granted for authorized admin (system lock not configured)'
        });
      } else {
        return NextResponse.json(
          { success: false, message: 'System lock not configured and email not authorized' },
          { status: 403 }
        );
      }
    }

    // If system lock is enabled, verify the PIN
    const isValid = await bcrypt.compare(pin, lockDoc.value);
    
    if (!isValid) {
      console.log('❌ Invalid PIN attempt for email:', email);
      return NextResponse.json(
        { success: false, message: 'Invalid PIN' },
        { status: 400 }
      );
    }

    console.log('✅ Setup PIN verified successfully for email:', email);
    
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
