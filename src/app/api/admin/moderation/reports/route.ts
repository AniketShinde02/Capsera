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

    // Get content reports from a reports collection (create if doesn't exist)
    // For now, we'll also check posts for flagged content
    const posts = await db.collection('posts').find({ 
      $or: [
        { isFlagged: true },
        { moderationStatus: { $exists: true } },
        { flags: { $exists: true, $ne: [] } }
      ]
    }).toArray();

    // Transform posts into content reports
    const contentReports = posts.map(post => ({
      _id: post._id.toString(),
      contentType: 'caption' as const,
      contentId: post._id.toString(),
      reportedBy: post.flaggedBy || 'system',
      reportedUser: post.userId || 'unknown',
      reason: post.flagReason || 'Content flagged for review',
      description: post.flagDescription || 'Content requires moderation review',
      status: post.moderationStatus || 'pending',
      severity: post.flagSeverity || 'medium',
      createdAt: post.flaggedAt || post.createdAt,
      reviewedAt: post.moderatedAt,
      reviewedBy: post.moderatedBy,
      action: post.moderationAction
    }));

    // If no real reports exist, return empty array
    // The frontend will fall back to mock data
    return NextResponse.json({ 
      success: true, 
      reports: contentReports 
    });

  } catch (error) {
    console.error('Error fetching content reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content reports' }, 
      { status: 500 }
    );
  }
}
