import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const reportId = new ObjectId((await params).id);

    // Find the report
    const report = await db.collection('reports').findOne({
      _id: reportId
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' }, 
        { status: 404 }
      );
    }

    // Update the report status
    await db.collection('reports').updateOne(
      { _id: reportId },
      { 
        $set: { 
          status: 'dismissed',
          dismissedAt: new Date(),
          dismissedBy: session.user.email
        }
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Report dismissed successfully' 
    });

  } catch (error) {
    console.error('Error dismissing report:', error);
    return NextResponse.json(
      { error: 'Failed to dismiss report' }, 
      { status: 500 }
    );
  }
}
