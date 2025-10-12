import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { canManageAdmins } from '@/lib/init-admin';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can manage admins (has moderation permissions)
    const canManage = await canManageAdmins(session.user.id);
    if (!canManage) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { db } = await connectToDatabase();
    const imageId = new ObjectId((await params).id);
    const { action, notes, status } = await request.json();

    console.log('🔄 Moderating image:', imageId, 'with action:', action);

    // Find the post (which contains the image) in the posts collection
    const post = await db.collection('posts').findOne({
      _id: imageId
    });

    if (!post) {
      console.error('❌ Post not found:', imageId);
      return NextResponse.json(
        { error: 'Image not found' }, 
        { status: 404 }
      );
    }

    console.log('📊 Found post for moderation:', post._id);

    // Update the post moderation status
    const updateResult = await db.collection('posts').updateOne(
      { _id: imageId },
      { 
        $set: { 
          moderationStatus: action,
          moderationNotes: notes,
          moderationReason: notes,
          status: status || action,
          moderatedAt: new Date(),
          moderatedBy: session.user.email,
          updatedAt: new Date()
        }
      }
    );

    console.log('✅ Post moderation updated:', updateResult.modifiedCount > 0);

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
