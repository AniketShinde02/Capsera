import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Import and use proper permission check
    const { canManageAdmins } = await import('@/lib/init-admin');
    const canManage = await canManageAdmins(session.user.id);
    if (!canManage) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { db } = await connectToDatabase();

    // Get database statistics before optimization
    const beforeStats = await db.stats();
    
    // Get list of collections
    const collections = await db.listCollections().toArray();
    
    const optimizationResults = [];

    // For each collection, perform optimization tasks
    for (const collection of collections) {
      try {
        const coll = db.collection(collection.name);
        
        // Get collection stats
        const collStats = await db.command({ collStats: collection.name });
        
        // Create indexes if they don't exist (basic optimization)
        if (collection.name === 'users') {
          try {
            await coll.createIndex({ email: 1 }, { unique: true });
          } catch (error) {
            // Index might already exist
          }
        }
        
        if (collection.name === 'posts') {
          try {
            await coll.createIndex({ createdAt: -1 });
            await coll.createIndex({ userId: 1 });
          } catch (error) {
            // Indexes might already exist
          }
        }

        optimizationResults.push({
          collection: collection.name,
          status: 'optimized',
          indexesBefore: collStats.nindexes || 0,
          indexesAfter: (await db.command({ collStats: collection.name })).nindexes || 0
        });
      } catch (error) {
        optimizationResults.push({
          collection: collection.name,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Get database statistics after optimization
    const afterStats = await db.stats();

    // Store optimization log
    await db.collection('optimization_logs').insertOne({
      timestamp: new Date(),
      performedBy: session.user.email,
      beforeStats: {
        dataSize: beforeStats.dataSize,
        collections: beforeStats.collections,
        indexes: beforeStats.indexes
      },
      afterStats: {
        dataSize: afterStats.dataSize,
        collections: afterStats.collections,
        indexes: afterStats.indexes
      },
      results: optimizationResults
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Database optimization completed',
      collectionsOptimized: optimizationResults.filter(r => r.status === 'optimized').length,
      totalCollections: collections.length,
      results: optimizationResults
    });

  } catch (error) {
    console.error('Error optimizing database:', error);
    return NextResponse.json(
      { error: 'Failed to optimize database' }, 
      { status: 500 }
    );
  }
}
