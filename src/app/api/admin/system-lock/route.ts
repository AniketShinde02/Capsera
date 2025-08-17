import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, pin, currentPin } = await request.json();

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    switch (action) {
      case 'set-pin':
        if (!pin || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
          return NextResponse.json({ 
            error: 'PIN must be 4-6 digits only' 
          }, { status: 400 });
        }

        // Hash the PIN
        const hashedPin = await bcrypt.hash(pin, 12);
        
        // Store or update the PIN
        await db.collection('systemsettings').updateOne(
          { key: 'system_lock_pin' },
          { 
            $set: { 
              value: hashedPin,
              setBy: session.user.email,
              setAt: new Date(),
              isActive: true
            }
          },
          { upsert: true }
        );

        return NextResponse.json({
          success: true,
          message: 'System lock PIN set successfully'
        });

      case 'verify-pin':
        if (!pin) {
          return NextResponse.json({ error: 'PIN is required' }, { status: 400 });
        }

        // Get stored PIN
        const storedPinDoc = await db.collection('systemsettings').findOne({ 
          key: 'system_lock_pin' 
        });

        if (!storedPinDoc || !storedPinDoc.isActive) {
          return NextResponse.json({ 
            error: 'System lock not configured' 
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
          message: 'PIN verified successfully'
        });

      case 'change-pin':
        if (!currentPin || !pin) {
          return NextResponse.json({ 
            error: 'Current PIN and new PIN are required' 
          }, { status: 400 });
        }

        // Verify current PIN first
        const currentPinDoc = await db.collection('systemsettings').findOne({ 
          key: 'system_lock_pin' 
        });

        if (!currentPinDoc || !currentPinDoc.isActive) {
          return NextResponse.json({ 
            error: 'System lock not configured' 
          }, { status: 400 });
        }

        const isCurrentValid = await bcrypt.compare(currentPin, currentPinDoc.value);
        if (!isCurrentValid) {
          return NextResponse.json({ 
            error: 'Current PIN is incorrect' 
          }, { status: 400 });
        }

        // Set new PIN
        const newHashedPin = await bcrypt.hash(pin, 12);
        await db.collection('systemsettings').updateOne(
          { key: 'system_lock_pin' },
          { 
            $set: { 
              value: newHashedPin,
              setBy: session.user.email,
              setAt: new Date(),
              isActive: true
            }
          }
        );

        return NextResponse.json({
          success: true,
          message: 'System lock PIN changed successfully'
        });

      case 'disable-lock':
        // Disable the system lock
        await db.collection('systemsettings').updateOne(
          { key: 'system_lock_pin' },
          { $set: { isActive: false } }
        );

        return NextResponse.json({
          success: true,
          message: 'System lock disabled'
        });

      case 'get-status':
        // Get lock status
        const lockDoc = await db.collection('systemsettings').findOne({ 
          key: 'system_lock_pin' 
        });

        return NextResponse.json({
          success: true,
          isLocked: lockDoc?.isActive || false,
          setBy: lockDoc?.setBy || null,
          setAt: lockDoc?.setAt || null
        });

      default:
        return NextResponse.json({ 
          error: 'Invalid action' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Error managing system lock:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
