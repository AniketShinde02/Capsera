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

    // Decode the ID (it might be encoded if it contains slashes)
    const rawId = (await params).id;
    const decodedId = decodeURIComponent(rawId);

    const { action, notes, status } = await request.json();

    console.log('🔄 Moderating image:', decodedId, 'with action:', action);

    // Determine query: Try ObjectId first, then fallback to public_id
    let query: any = {};
    try {
      query = { _id: new ObjectId(decodedId) };
    } catch (e) {
      // If not a valid ObjectId, treat as public_id (for orphan images)
      query = {
        $or: [
          { publicId: decodedId },
          { public_id: decodedId },
          { 'image.public_id': decodedId },
          { 'image.publicId': decodedId }
        ]
      };
    }

    // Prepare update data
    const updateData = {
      $set: {
        moderationStatus: action,
        moderationNotes: notes,
        moderationReason: notes,
        status: status || action,
        // Sync legacy fields for compatibility
        isApproved: action === 'approve',
        isFlagged: action === 'flag',
        moderatedAt: new Date(),
        moderatedBy: session.user.email,
        updatedAt: new Date()
      },
      // If creating a new document (upsert), set these fields
      $setOnInsert: {
        createdAt: new Date(),
        publicId: decodedId, // Ensure publicId is saved
        source: 'cloudinary_orphan', // Mark as adopted orphan
        image: {
          public_id: decodedId,
        }
      }
    };

    // Update or Insert (Upsert)
    const updateResult = await db.collection('posts').updateOne(
      query,
      updateData,
      { upsert: true } // Create if not exists!
    );

    console.log('✅ Post moderation updated:', updateResult.modifiedCount > 0 || updateResult.upsertedCount > 0);

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
