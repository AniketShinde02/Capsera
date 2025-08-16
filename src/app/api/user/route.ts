import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  await dbConnect();
  const user = await User.findById(session.user.id).select('email username title bio image createdAt');
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }
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

  const user = await User.findByIdAndUpdate(
    session.user.id,
    { $set: updates },
    { new: true, runValidators: true, fields: 'email username title bio image createdAt' }
  );

  return NextResponse.json({ success: true, data: user }, { status: 200 });
}
