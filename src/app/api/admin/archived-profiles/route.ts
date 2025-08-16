import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    // Get archived profiles from DeletedProfile collection
    const archivedProfiles = await db.collection('deletedprofiles').find({}).toArray();

    // Transform the data to match our interface
    const transformedProfiles = archivedProfiles.map(profile => ({
      _id: profile._id.toString(),
      email: profile.email,
      username: profile.username,
      deletionReason: profile.deletionReason || 'Account deleted',
      deletedBy: profile.deletedBy || 'system',
      deletedAt: profile.deletedAt || profile.createdAt,
      recoveryRequested: profile.recoveryRequested || false,
      recoveryStatus: profile.recoveryStatus || 'none',
      retentionDays: profile.retentionDays || 30,
      dataSize: profile.dataSize || '0 MB',
      isRecoverable: profile.isRecoverable !== false
    }));

    return NextResponse.json({ 
      success: true, 
      profiles: transformedProfiles 
    });

  } catch (error) {
    console.error('Error fetching archived profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch archived profiles' }, 
      { status: 500 }
    );
  }
}
