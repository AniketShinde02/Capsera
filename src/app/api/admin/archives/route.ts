import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { cleanupOldArchivedImages } from '@/lib/cloudinary-archive';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get archive statistics from Cloudinary
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'capsera_archives/',
        max_results: 1000,
        sort_by: 'created_at',
        sort_direction: 'desc'
      });

      const archives = result.resources || [];
      
      // Calculate statistics
      const totalArchived = archives.length;
      const totalSize = archives.reduce((sum: number, resource: any) => sum + (resource.bytes || 0), 0);
      const oldestArchive = archives.length > 0 ? archives[archives.length - 1]?.created_at : null;
      const newestArchive = archives.length > 0 ? archives[0]?.created_at : null;

      // Group by user ID
      const userArchives: { [key: string]: number } = {};
      archives.forEach((resource: any) => {
        const pathParts = resource.public_id.split('/');
        if (pathParts.length >= 3) {
          const userId = pathParts[2]; // capsera_archives/userId/...
          userArchives[userId] = (userArchives[userId] || 0) + 1;
        }
      });

      const archiveStats = {
        totalArchived,
        totalSize: Math.round(totalSize / 1024 / 1024 * 100) / 100, // MB
        oldestArchive,
        newestArchive,
        uniqueUsers: Object.keys(userArchives).length,
        userBreakdown: userArchives,
        timestamp: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        stats: archiveStats
      });

    } catch (cloudinaryError: any) {
      console.error('❌ Cloudinary API error:', cloudinaryError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch archive statistics from Cloudinary',
        details: cloudinaryError.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Archive stats error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch archive statistics'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case 'cleanup':
        const daysOld = params.daysOld || 90;
        const deletedCount = await cleanupOldArchivedImages(daysOld);
        
        return NextResponse.json({
          success: true,
          message: `Cleaned up ${deletedCount} old archived images older than ${daysOld} days`,
          deletedCount,
          cleanupDate: new Date().toISOString()
        });

      case 'get-user-archives':
        const { userId } = params;
        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'User ID is required for get-user-archives action'
          }, { status: 400 });
        }

        try {
          const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: `capsera_archives/${userId}/`,
            max_results: 1000,
            sort_by: 'created_at',
            sort_direction: 'desc'
          });

          const userArchives = result.resources || [];
          
          return NextResponse.json({
            success: true,
            userId,
            archives: userArchives.map((resource: any) => ({
              publicId: resource.public_id,
              url: resource.secure_url,
              size: resource.bytes,
              format: resource.format,
              createdAt: resource.created_at,
              width: resource.width,
              height: resource.height
            })),
            count: userArchives.length
          });

        } catch (cloudinaryError: any) {
          console.error('❌ Cloudinary API error for user archives:', cloudinaryError);
          return NextResponse.json({
            success: false,
            error: 'Failed to fetch user archives from Cloudinary',
            details: cloudinaryError.message
          }, { status: 500 });
        }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: cleanup, get-user-archives'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Archive management error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to perform archive operation'
    }, { status: 500 });
  }
}
