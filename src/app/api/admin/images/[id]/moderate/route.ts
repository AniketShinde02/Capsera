import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const imageId = params.id;
    const { action, notes, status } = await request.json();

    // Find the image/post
    const post = await db.collection('posts').findOne({
      _id: imageId
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Image not found' }, 
        { status: 404 }
      );
    }

    // Update the post with moderation status
    await db.collection('posts').updateOne(
      { _id: imageId },
      { 
        $set: { 
          moderationStatus: status,
          moderationAction: action,
          moderationNotes: notes,
          moderatedAt: new Date(),
          moderatedBy: session.user.email
        }
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: `Image ${action} successfully` 
    });

  } catch (error) {
    console.error('Error moderating image:', error);
    return NextResponse.json(
      { error: 'Failed to moderate image' }, 
      { status: 500 }
    );
  }
}
