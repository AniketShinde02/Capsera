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

      case 'get-all-archives':
        try {
          console.log('🔍 Searching for archives in capsera_archives/ folder...');
          
                     // Since capsera_archives/ doesn't exist, directly fetch from capsera_uploads/
           // These are the "archived" images from anonymous users
           console.log('🔍 Fetching images from capsera_uploads/ (these are archived anonymous images)...');
           let result = await cloudinary.api.resources({
             type: 'upload',
             prefix: 'capsera_uploads/',
             max_results: 1000,
             sort_by: 'created_at',
             sort_direction: 'desc'
           });
           console.log('📤 Found images in capsera_uploads/:', result.resources?.length || 0);

          console.log('📊 Cloudinary API Response:', {
            resources: result.resources?.length || 0,
            rate_limit_allowed: result.rate_limit_allowed,
            rate_limit_reset_at: result.rate_limit_reset_at
          });

          // If no archives found, let's check what folders exist
          if (!result.resources || result.resources.length === 0) {
            console.log('🔍 No archives found in capsera_archives/. Checking available folders...');
            
            try {
              const foldersResult = await cloudinary.api.root_folders();
              console.log('📁 Available root folders:', foldersResult.folders);
              
              // Also check if capsera_uploads folder exists (your main uploads)
              try {
                const uploadsResult = await cloudinary.api.resources({
                  type: 'upload',
                  prefix: 'capsera_uploads/',
                  max_results: 5
                });
                console.log('📤 Found uploads in capsera_uploads/:', uploadsResult.resources?.length || 0);
              } catch (uploadsError) {
                console.log('❌ Could not check capsera_uploads folder:', uploadsError);
              }
            } catch (folderError) {
              console.log('❌ Could not fetch root folders:', folderError);
            }
          }

          const allArchives = result.resources || [];
          
                     const archives = allArchives.map((resource: any) => {
             const pathParts = resource.public_id.split('/');
             const userId = pathParts.length >= 3 ? pathParts[2] : 'unknown';
             // Since we're fetching from capsera_uploads/, treat all as archived
             const isArchive = true;
             
             return {
               publicId: resource.public_id,
               url: resource.secure_url,
               thumbnailUrl: resource.secure_url.replace('/upload/', '/upload/w_200,h_200,c_fill,q_auto/'),
               size: resource.bytes || 0,
               format: resource.format || 'unknown',
               createdAt: resource.created_at,
               width: resource.width || 0,
               height: resource.height || 0,
               userId: userId,
               originalName: pathParts[pathParts.length - 1] || 'unknown',
               archiveDate: resource.created_at,
               isArchive: isArchive,
               folder: 'Archived Uploads' // These are archived anonymous images
             };
           });
          
          return NextResponse.json({
            success: true,
            archives,
            count: archives.length
          });

        } catch (cloudinaryError: any) {
          console.error('❌ Cloudinary API error for all archives:', cloudinaryError);
          return NextResponse.json({
            success: false,
            error: 'Failed to fetch all archives from Cloudinary',
            details: cloudinaryError.message
          }, { status: 500 });
        }

      case 'delete-archived-image':
        const { publicId: deletePublicId } = params;
        if (!deletePublicId) {
          return NextResponse.json({
            success: false,
            error: 'Public ID is required for delete-archived-image action'
          }, { status: 400 });
        }

        try {
          const deleteResult = await cloudinary.uploader.destroy(deletePublicId);
          
          if (deleteResult.result === 'ok') {
            console.log(`🗑️ Permanently deleted archived image: ${deletePublicId}`);
            return NextResponse.json({
              success: true,
              message: 'Archived image permanently deleted',
              publicId: deletePublicId
            });
          } else {
            return NextResponse.json({
              success: false,
              error: 'Failed to delete archived image from Cloudinary'
            }, { status: 500 });
          }
        } catch (cloudinaryError: any) {
          console.error('❌ Cloudinary API error for delete:', cloudinaryError);
          return NextResponse.json({
            success: false,
            error: 'Failed to delete archived image from Cloudinary',
            details: cloudinaryError.message
          }, { status: 500 });
        }

      case 'restore-archived-image':
        const { publicId: restorePublicId, originalUrl } = params;
        if (!restorePublicId || !originalUrl) {
          return NextResponse.json({
            success: false,
            error: 'Public ID and original URL are required for restore-archived-image action'
          }, { status: 400 });
        }

        try {
          // For now, we'll just return success since restoring requires moving the file
          // In a real implementation, you'd move the file from archives back to active storage
          console.log(`🔄 Restore requested for archived image: ${restorePublicId}`);
          
          return NextResponse.json({
            success: true,
            message: 'Restore functionality will be implemented in future updates',
            publicId: restorePublicId,
            note: 'This is a placeholder - actual restore requires moving files between Cloudinary folders'
          });
        } catch (cloudinaryError: any) {
          console.error('❌ Cloudinary API error for restore:', cloudinaryError);
          return NextResponse.json({
            success: false,
            error: 'Failed to restore archived image from Cloudinary',
            details: cloudinaryError.message
          }, { status: 500 });
        }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: cleanup, get-user-archives, get-all-archives, delete-archived-image, restore-archived-image'
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
