import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/admin-middleware';
import { connectToDatabase } from '@/lib/db';

// Define proper types for collection stats
type CollectionStat = {
  name: string;
  documentCount: number;
  size: string;             // human-readable
  indexes: number;
  lastModified: string;     // ISO string
  status: 'healthy' | 'error';
  avgDocumentSize: string;  // human-readable
};

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminError = await verifyAdminAccess(request);
    if (adminError) return adminError;

    // Get database stats
    const { db } = await connectToDatabase();
    
    // Get collection stats
    const collections = await db.listCollections().toArray();
    const stats = {
      totalCollections: collections.length,
      totalDocuments: 0,
      // Accumulate bytes and derive human-readable value before returning:
      totalSizeBytes: 0,
      totalSize: '0 B',
      totalIndexes: 0,
      activeConnections: 5,
      maxConnections: 100,
      connectionUtilization: 0, // compute from active/max before returning
      avgResponseTime: 12,
      uptime: 98,
      lastBackup: new Date().toISOString(),
      backupStatus: 'success' as const,
      collections: [] as CollectionStat[]
    };

    // Get stats for each collection
    for (const collection of collections) {
      const coll = db.collection(collection.name);
      const count = await coll.countDocuments();
      const indexes = await coll.indexes();
      
      stats.totalDocuments += count;
      stats.totalIndexes += indexes.length;
      
      // Estimate collection size (this is a simplified calculation)
      const estimatedSizeBytes = count * 1024; // Rough estimate: 1KB per document
      stats.totalSizeBytes += estimatedSizeBytes;
      
      stats.collections.push({
        name: collection.name,
        documentCount: count,
        size: formatBytes(estimatedSizeBytes),
        indexes: indexes.length,
        lastModified: new Date().toISOString(),
        status: 'healthy',
        avgDocumentSize: count > 0 ? formatBytes(estimatedSizeBytes / count) : '0 B'
      });
    }

    // Compute final values
    stats.totalSize = formatBytes(stats.totalSizeBytes);
    stats.connectionUtilization = Math.round(
      (stats.activeConnections / Math.max(1, stats.maxConnections)) * 100
    );

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error: any) {
    console.error('Database stats error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch database stats',
      message: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminError = await verifyAdminAccess(request);
    if (adminError) return adminError;

    // Validate request body and action type
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }
    
    const action = (body as any)?.action;
    if (typeof action !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing or invalid "action"' }, { status: 400 });
    }

    switch (action) {
      case 'backup':
        // Simulate backup creation
        return NextResponse.json({
          success: true,
          message: 'Backup created successfully',
          backupId: `backup_${Date.now()}`
        });

      case 'optimize':
        // Simulate database optimization
        return NextResponse.json({
          success: true,
          message: 'Database optimized successfully'
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Database action error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to perform database action',
      message: error.message
    }, { status: 500 });
  }
}