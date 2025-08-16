
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }

  await dbConnect();

  try {
    const posts = await Post.find({ user: session.user.id }).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: posts }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
