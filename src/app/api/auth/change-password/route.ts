import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

const PASSWORD_HISTORY_LIMIT = 5;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  const { currentPassword, newPassword } = await req.json();
  // Server-side validation: min 8 chars with upper, lower, number, special
  const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
  if (!currentPassword || !newPassword || !strong.test(newPassword)) {
    return NextResponse.json({ success: false, message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.' }, { status: 400 });
  }
  await dbConnect();
  const user = await (User as any).findById(session.user.id).select('+password +passwordHistory');
  if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) return NextResponse.json({ success: false, message: 'Current password incorrect' }, { status: 400 });

  // Prevent reuse of the current password and any in history
  if (await bcrypt.compare(newPassword, user.password)) {
    return NextResponse.json({ success: false, message: 'You cannot reuse your previous password. Please choose a different one.' }, { status: 400 });
  }
  if (Array.isArray((user as any).passwordHistory)) {
    for (const oldHash of (user as any).passwordHistory) {
      if (await bcrypt.compare(newPassword, oldHash)) {
        return NextResponse.json({ success: false, message: 'You cannot reuse a previously used password. Please choose a new one.' }, { status: 400 });
      }
    }
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  (user as any).passwordHistory = [user.password, ...((user as any).passwordHistory || [])].slice(0, PASSWORD_HISTORY_LIMIT);
  user.password = newHash;
  await user.save();

  return NextResponse.json({ success: true }, { status: 200 });
}
