import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
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
  // Try primary session user ID first. If not found (possible when an admin
  // signs in with an admin account whose ID lives in a separate collection),
  // fall back to the regularUserId attached to the session (set during
  // the admin credentials authorize flow).
  const primaryUserId = session.user.id;
  let user = await (User as any).findById(primaryUserId).select('email username title bio image createdAt');

  if (!user) {
    const regularUserId = (session as any)?.user?.regularUserId;
    console.log('🔍 /api/user: Primary user not found, checking regularUserId:', regularUserId);
    if (regularUserId) {
      user = await (User as any).findById(regularUserId).select('email username title bio image createdAt');
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

  console.log('📊 User data being returned:', {
    id: user._id,
    email: user.email,
    username: user.username,
    createdAt: user.createdAt,
    hasCreatedAt: !!user.createdAt,
    createdAtType: typeof user.createdAt,
    createdAtString: user.createdAt ? user.createdAt.toString() : 'null'
  });

  return NextResponse.json({ success: true, data: user }, { status: 200 });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  await dbConnect();
  const body = await req.json();
  const { username, title, bio, image } = body || {};

  const updates: any = {};
  if (typeof username !== 'undefined') updates.username = username;
  if (typeof title !== 'undefined') updates.title = title;
  if (typeof bio !== 'undefined') updates.bio = bio;
  if (typeof image !== 'undefined') updates.image = image;

  const user = await (User as any).findByIdAndUpdate(
    session.user.id,
    { $set: updates },
    { new: true, runValidators: true, fields: 'email username title bio image createdAt' }
  );

  return NextResponse.json({ success: true, data: user }, { status: 200 });
}
