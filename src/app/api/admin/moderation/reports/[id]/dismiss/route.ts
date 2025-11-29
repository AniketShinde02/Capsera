import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const reportId = new ObjectId((await params).id);

    // Find the post
    const post = await db.collection('posts').findOne({
      _id: reportId
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Update the post moderation status
    await db.collection('posts').updateOne(
      { _id: reportId },
      {
        $set: {
          moderationStatus: 'dismissed',
          moderatedAt: new Date(),
          moderatedBy: session.user.email,
          isFlagged: false // Clear the flag
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Report dismissed successfully'
    });

  } catch (error) {
    console.error('Error dismissing report:', error);
    return NextResponse.json(
      { error: 'Failed to dismiss report' },
      { status: 500 }
    );
  }
}
