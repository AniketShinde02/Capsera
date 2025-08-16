import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { 
  listArchivedImages, 
  restoreCloudinaryImage, 
  cleanupOldArchivedImages 
} from '@/lib/cloudinary';

// GET: List archived images for a user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const userId = searchParams.get('userId') || session.user.id;

    console.log(`📋 Listing archived images for user: ${userId}`);

    const result = await listArchivedImages(userId, limit);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.images,
        count: result.images?.length || 0
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.error || 'Failed to list archived images'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ List archived images error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Restore an archived image
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { archivedId, originalPath } = await req.json();

    if (!archivedId) {
      return NextResponse.json(
        { success: false, message: 'Archived image ID is required' },
        { status: 400 }
      );
    }

    console.log(`🔄 Restoring archived image: ${archivedId}`);

    const result = await restoreCloudinaryImage(archivedId, originalPath);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Image restored successfully',
        restoredId: result.restoredId
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.error || 'Failed to restore image'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Restore image error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Clean up old archived images (admin only)
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user is admin (you can implement your own admin check)
    // For now, we'll allow any authenticated user to run cleanup
    // You can add admin role checking here

    const { daysOld } = await req.json();
    const cleanupDays = daysOld || 90; // Default to 90 days

    console.log(`🧹 Cleaning up archived images older than ${cleanupDays} days`);

    const result = await cleanupOldArchivedImages(cleanupDays);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Cleanup completed: ${result.deleted} deleted, ${result.errors} errors`,
        data: {
          deleted: result.deleted,
          errors: result.errors,
          details: result.details
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Cleanup failed',
        error: result.details?.error
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Cleanup error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
