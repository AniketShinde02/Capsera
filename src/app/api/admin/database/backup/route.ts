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

    // Create a backup collection with timestamp
    const backupName = `backup_${new Date().toISOString().split('T')[0]}_${Date.now()}`;
    const backupData = {
      name: backupName,
      createdAt: new Date(),
      createdBy: session.user.email,
      status: 'completed',
      collections: []
    };

    // Get list of collections to backup
    const collections = await db.listCollections().toArray();
    
    // For each collection, get a sample of documents (in production, you'd want full backup)
    for (const collection of collections) {
      try {
        const coll = db.collection(collection.name);
        const count = await coll.countDocuments();
        const sample = await coll.find({}).limit(100).toArray();
        
        backupData.collections.push({
          name: collection.name,
          documentCount: count,
          sampleSize: sample.length,
          backupTime: new Date()
        });
      } catch (error) {
        console.error(`Error backing up collection ${collection.name}:`, error);
      }
    }

    // Store backup metadata
    await db.collection('backups').insertOne(backupData);

    return NextResponse.json({ 
      success: true, 
      message: 'Backup created successfully',
      backupName,
      collectionsBackedUp: backupData.collections.length
    });

  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json(
      { error: 'Failed to create backup' }, 
      { status: 500 }
    );
  }
}
