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
    const reportId = params.id;

    // Find the content report (post)
    const post = await db.collection('posts').findOne({
      _id: reportId
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Content report not found' }, 
        { status: 404 }
      );
    }

    // Update the post status to dismissed
    await db.collection('posts').updateOne(
      { _id: reportId },
      { 
        $set: { 
          moderationStatus: 'dismissed',
          moderatedAt: new Date(),
          moderatedBy: session.user.email
        }
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Content report dismissed' 
    });

  } catch (error) {
    console.error('Error dismissing content report:', error);
    return NextResponse.json(
      { error: 'Failed to dismiss content report' }, 
      { status: 500 }
    );
  }
}
