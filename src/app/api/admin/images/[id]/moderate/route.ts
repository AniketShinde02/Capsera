import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
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
    const imageId = new ObjectId(params.id);
    const { action, reason } = await request.json();

    // Find the image
    const image = await db.collection('images').findOne({
      _id: imageId
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' }, 
        { status: 404 }
      );
    }

    // Update the image moderation status
    await db.collection('images').updateOne(
      { _id: imageId },
      { 
        $set: { 
          moderationStatus: action,
          moderationReason: reason,
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
