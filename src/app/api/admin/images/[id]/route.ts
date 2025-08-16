import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';

export async function DELETE(
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

    // Soft delete the post by marking it as deleted
    await db.collection('posts').updateOne(
      { _id: imageId },
      { 
        $set: { 
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: session.user.email
        }
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Image deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' }, 
      { status: 500 }
    );
  }
}
