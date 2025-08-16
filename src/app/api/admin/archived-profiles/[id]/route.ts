import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const profileId = params.id;

    // Find the archived profile
    const archivedProfile = await db.collection('deletedprofiles').findOne({
      _id: profileId
    });

    if (!archivedProfile) {
      return NextResponse.json(
        { error: 'Archived profile not found' }, 
        { status: 404 }
      );
    }

    // Permanently delete the archived profile
    await db.collection('deletedprofiles').deleteOne({
      _id: profileId
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Archived profile permanently deleted' 
    });

  } catch (error) {
    console.error('Error permanently deleting archived profile:', error);
    return NextResponse.json(
      { error: 'Failed to delete archived profile' }, 
      { status: 500 }
    );
  }
}
