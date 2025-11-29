import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    try {
        await dbConnect();
        const body = await req.json();
        const { captions, image, mood, description } = body;

        if (!captions || !image) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        const newPost = await (Post as any).create({
            captions,
            image,
            mood,
            description,
            user: session.user.id,
            createdAt: new Date()
        });

        return NextResponse.json({ success: true, data: newPost }, { status: 201 });
    } catch (error: any) {
        console.error('Error saving post:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
