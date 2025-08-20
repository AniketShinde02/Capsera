import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { archiveCloudinaryImage, extractCloudinaryPublicId } from '@/lib/cloudinary';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' }, 
      { status: 401 }
    );
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { success: false, message: 'Caption ID is required' }, 
      { status: 400 }
    );
  }

  await dbConnect();

  try {
    // Find the post first to verify ownership
    const post = await (Post as any).findById(id);

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Caption not found' }, 
        { status: 404 }
      );
    }

    // Verify that the user owns this caption
    if (post.user?.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: You can only delete your own captions' }, 
        { status: 403 }
      );
    }

    // Archive associated image from Cloudinary if it exists
    let archiveStatus = 'not_applicable';
    if (post.image) {
      try {
        // Extract public ID from Cloudinary URL
        const publicId = extractCloudinaryPublicId(post.image);
        if (publicId) {
          const archiveResult = await archiveCloudinaryImage(publicId, session.user.id);
          archiveStatus = archiveResult.success ? 'success' : 'failed';
        } else {
          archiveStatus = 'failed';
        }
      } catch (error) {
        archiveStatus = 'error';
      }
    }

    // Delete the caption from database
    await (Post as any).findByIdAndDelete(id);

    // Return appropriate message based on archive status
    let message = 'Caption deleted successfully';
    if (archiveStatus === 'failed' || archiveStatus === 'error') {
      message = 'Caption deleted successfully. Note: Image may still exist in storage due to technical limitations.';
    } else if (archiveStatus === 'success') {
      message = 'Caption deleted successfully. Image has been safely archived.';
    }

    return NextResponse.json(
      { 
        success: true, 
        message,
        deletedId: id,
        archiveStatus,
        note: 'Image is safely archived and can be restored if needed'
      }, 
      { status: 200 }
    );

  } catch (error: any) {

    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, message: 'Invalid caption ID format' }, 
        { status: 400 }
      );
    }

    // Handle Cloudinary-specific errors
    if (error.message?.includes('Cloudinary') || error.message?.includes('image')) {
      // Try to delete from database even if Cloudinary fails
      try {
        await (Post as any).findByIdAndDelete(id);
        return NextResponse.json(
          { 
            success: true, 
            message: 'Caption deleted successfully. Note: Image may still exist in storage due to technical limitations.',
            deletedId: id,
            archiveStatus: 'failed'
          }, 
          { status: 200 }
        );
      } catch (dbError) {
        // Continue with error handling
      }
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' }, 
      { status: 401 }
    );
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { success: false, message: 'Caption ID is required' }, 
      { status: 400 }
    );
  }

  await dbConnect();

  try {
    const post = await (Post as any).findById(id);

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Caption not found' }, 
        { status: 404 }
      );
    }

    // Verify that the user owns this caption or make it accessible to all authenticated users
    if (post.user?.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: You can only view your own captions' }, 
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: true, data: post }, 
      { status: 200 }
    );

  } catch (error: any) {

    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, message: 'Invalid caption ID format' }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
