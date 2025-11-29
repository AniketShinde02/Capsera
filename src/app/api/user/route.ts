import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import emailOctopusService from '@/lib/email-providers/email-octopus';

export async function GET() {
  try {
    console.log('🔍 /api/user GET called');
    const session = await getServerSession(authOptions);
    console.log('🔍 Session in /api/user:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });

    if (!session?.user?.id) {
      console.log('❌ /api/user: No session or user ID');
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }
    await dbConnect();
    // Try primary session user ID first.
    const primaryUserId = session.user.id;
    let user = await (User as any).findById(primaryUserId).select('email username title bio image createdAt privacySettings userSettings notificationSettings');

    if (!user) {
      const regularUserId = (session as any)?.user?.regularUserId;
      console.log('🔍 /api/user: Primary user not found, checking regularUserId:', regularUserId);
      if (regularUserId) {
        user = await (User as any).findById(regularUserId).select('email username title bio image createdAt privacySettings userSettings notificationSettings');
      }
    }

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Ensure createdAt is always a valid date
    if (!user.createdAt) {
      console.log('⚠️ User missing createdAt, setting to current date');
      user.createdAt = new Date();

      // Update the database with the current date
      try {
        await (User as any).findByIdAndUpdate(user._id, { createdAt: user.createdAt });
        console.log('✅ Updated user createdAt in database');
      } catch (updateError) {
        console.error('❌ Failed to update createdAt in database:', updateError);
      }
    }

    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }
    await dbConnect();
    const body = await req.json();
    const { username, title, bio, image, privacySettings, userSettings, notificationSettings } = body || {};

    const updates: any = {};
    if (typeof username !== 'undefined') updates.username = username;
    if (typeof title !== 'undefined') updates.title = title;
    if (typeof bio !== 'undefined') updates.bio = bio;
    if (typeof image !== 'undefined') updates.image = image;
    if (typeof privacySettings !== 'undefined') updates.privacySettings = privacySettings;
    if (typeof userSettings !== 'undefined') updates.userSettings = userSettings;
    if (typeof notificationSettings !== 'undefined') updates.notificationSettings = notificationSettings;

    const user = await (User as any).findByIdAndUpdate(
      session.user.id,
      { $set: updates },
      { new: true, runValidators: true, fields: 'email username title bio image createdAt privacySettings userSettings notificationSettings name' }
    );

    // Sync with EmailOctopus if marketing emails are enabled
    // Check both userSettings.marketingEmails and notificationSettings.email.marketing
    const marketingEnabled =
      user?.userSettings?.marketingEmails ||
      user?.notificationSettings?.email?.marketing;

    if (user && marketingEnabled) {
      const nameParts = (user.name || user.username || '').split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Fire and forget - sync with EmailOctopus
      emailOctopusService.addContact(user.email, firstName, lastName).catch(err =>
        console.error('Failed to sync with EmailOctopus:', err)
      );
    }

    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }
    await dbConnect();

    // Delete the user
    await (User as any).findByIdAndDelete(session.user.id);

    return NextResponse.json({ success: true, message: 'Account deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
