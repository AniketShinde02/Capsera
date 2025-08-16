import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { CaptionCacheService } from '@/lib/caption-cache';
import { cleanupOldArchivedImages } from '@/lib/cloudinary-archive';
import dbConnect from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role (you can implement your own admin check)
    // For now, we'll allow any authenticated user to access cache stats
    
    await dbConnect();

    // Get cache statistics
    const stats = await CaptionCacheService.getStats();
    const hitRate = await CaptionCacheService.getHitRate();

    // Get archive statistics (basic info)
    const archiveInfo = {
      note: 'Archive cleanup available via POST /cleanup-archives action',
      defaultCleanupDays: 90,
      archiveFolder: 'capsera_archives/'
    };

    return NextResponse.json({
      success: true,
      stats,
      hitRate,
      archiveInfo,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Cache stats error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch cache statistics'
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

    await dbConnect();

    const { action, ...params } = await req.json();

    switch (action) {
      case 'clean':
        const daysOld = params.daysOld || 30;
        const deletedCount = await CaptionCacheService.cleanOldCache(daysOld);
        
        return NextResponse.json({
          success: true,
          message: `Cleaned ${deletedCount} old cache entries`,
          deletedCount
        });

      case 'search':
        const searchResults = await CaptionCacheService.searchCache(params);
        
        return NextResponse.json({
          success: true,
          results: searchResults,
          count: searchResults.length
        });

      case 'delete':
        const { id } = params;
        if (!id) {
          return NextResponse.json({
            success: false,
            error: 'Cache entry ID is required'
          }, { status: 400 });
        }

        const deleted = await CaptionCacheService.deleteCacheEntry(id);
        
        return NextResponse.json({
          success: deleted,
          message: deleted ? 'Cache entry deleted successfully' : 'Failed to delete cache entry'
        });

      case 'cleanup-archives':
        const archiveDaysOld = params.daysOld || 90;
        const archivedDeletedCount = await cleanupOldArchivedImages(archiveDaysOld);
        
        return NextResponse.json({
          success: true,
          message: `Cleaned up ${archivedDeletedCount} old archived images older than ${archiveDaysOld} days`,
          deletedCount: archivedDeletedCount
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: clean, search, delete, cleanup-archives'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Cache management error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to perform cache operation'
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Clear all cache entries
    const { confirm } = await req.json();
    
    if (confirm !== 'YES_DELETE_ALL_CACHE') {
      return NextResponse.json({
        success: false,
        error: 'Confirmation required. Send confirm: "YES_DELETE_ALL_CACHE" to proceed.'
      }, { status: 400 });
    }

    // This is a destructive operation - use with caution
    const result = await CaptionCacheService.cleanOldCache(0); // 0 days = all entries
    
    return NextResponse.json({
      success: true,
      message: 'All cache entries cleared successfully',
      clearedCount: result
    });

  } catch (error) {
    console.error('❌ Cache clear error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to clear cache'
    }, { status: 500 });
  }
}
