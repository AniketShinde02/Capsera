import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';

export async function GET(
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
    const { id } = await params;
    const postId = new ObjectId(id);

    // Find the post (which contains the image)
    const post = await db.collection('posts').findOne({
      _id: postId
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);

  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const { id } = await params;
    const postId = new ObjectId(id);

    // Find the post first to get image details
    const post = await db.collection('posts').findOne({
      _id: postId
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // --- CLOUDINARY DELETION LOGIC ---
    // Import dynamically to avoid circular deps if any, or just standard import at top
    const { deleteCloudinaryImage, extractCloudinaryPublicId } = await import('@/lib/cloudinary');

    let imageUrl = '';
    if (post.image && typeof post.image === 'object') {
      imageUrl = post.image.url || post.image.secure_url || post.image.publicUrl || '';
    } else if (typeof post.image === 'string') {
      imageUrl = post.image;
    } else {
      imageUrl = post.imageUrl || post.secure_url || '';
    }

    if (imageUrl) {
      try {
        const publicId = post.image?.publicId || extractCloudinaryPublicId(imageUrl);
        if (publicId) {
          console.log(`🗑️ Deleting Cloudinary image: ${publicId}`);
          await deleteCloudinaryImage(publicId);
        }
      } catch (cloudError) {
        console.error('❌ Failed to delete image from Cloudinary:', cloudError);
        // Continue with DB deletion even if cloud delete fails, but log it
      }
    }

    // Delete the post (which contains the image)
    const result = await db.collection('posts').deleteOne({
      _id: postId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    console.log(`🗑️ Deleted post with image: ${postId}`);

    return NextResponse.json({
      success: true,
      message: 'Image and post deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
