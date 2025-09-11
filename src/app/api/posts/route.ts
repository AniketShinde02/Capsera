
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  console.log('🔍 /api/posts GET called');
  const session = await getServerSession(authOptions);
  console.log('🔍 Session in /api/posts:', {
    hasSession: !!session,
    hasUser: !!session?.user,
    userId: session?.user?.id,
    userEmail: session?.user?.email
  });

  if (!session?.user?.id) {
    console.log('❌ /api/posts: No session or user ID');
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }

  await dbConnect();

  try {
    const posts = await (Post as any).find({ user: session.user.id }).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: posts }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
