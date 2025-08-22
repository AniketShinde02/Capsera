import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { contentType, contentId, reason, description } = await req.json();

    // Validate required fields
    if (!contentType || !contentId || !reason || !description) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: contentType, contentId, reason, description'
      }, { status: 400 });
    }

    // Validate content type
    const validContentTypes = ['image', 'caption', 'comment', 'profile'];
    if (!validContentTypes.includes(contentType)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid content type. Must be one of: image, caption, comment, profile'
      }, { status: 400 });
    }

    // Validate reason
    const validReasons = ['inappropriate', 'sexual', 'violent', 'spam', 'hate_speech', 'other'];
    if (!validReasons.includes(reason)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid reason. Must be one of: inappropriate, sexual, violent, spam, hate_speech, other'
      }, { status: 400 });
    }

    // Get client IP
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    req.headers.get('cf-connecting-ip') || 
                    'unknown';

    // Connect to database
    const { db } = await connectToDatabase();

    // Create content report
    const report = {
      contentType,
      contentId,
      reportedBy: session?.user?.id || 'anonymous',
      reportedUser: 'unknown', // Will be updated if content has user info
      reason,
      description: description.trim(),
      severity: reason === 'sexual' || reason === 'violent' ? 'high' : 
                reason === 'hate_speech' ? 'critical' : 'medium',
      status: 'pending',
      createdAt: new Date(),
      ipAddress: clientIP,
      userAgent: req.headers.get('user-agent') || 'unknown'
    };

    // Try to get user info from the reported content
    try {
      if (contentType === 'image' || contentType === 'caption') {
        const post = await db.collection('posts').findOne({ 
          $or: [
            { _id: contentId },
            { image: contentId },
            { 'captions': { $in: [contentId] } }
          ]
        });
        
        if (post?.user) {
          report.reportedUser = post.user.toString();
        }
      }
    } catch (error) {
      console.warn('Could not find user info for reported content:', error);
    }

    // Insert report into database
    const result = await db.collection('content_reports').insertOne(report);

    if (!result.insertedId) {
      throw new Error('Failed to create content report');
    }

    console.log(`📝 Content report created: ${contentType} - ${reason} by ${session?.user?.email || 'anonymous'}`);

    // Return success
    return NextResponse.json({
      success: true,
      message: 'Content reported successfully. Our moderation team will review it.',
      reportId: result.insertedId
    });

  } catch (error: any) {
    console.error('❌ Error creating content report:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to report content. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only admins can view reports
    if (!session?.user || session.user.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const contentType = searchParams.get('contentType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const { db } = await connectToDatabase();

    // Build filter
    const filter: any = {};
    if (status && status !== 'all') filter.status = status;
    if (contentType && contentType !== 'all') filter.contentType = contentType;

    // Get total count
    const totalReports = await db.collection('content_reports').countDocuments(filter);

    // Get reports with pagination
    const reports = await db.collection('content_reports')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      reports,
      pagination: {
        page,
        limit,
        total: totalReports,
        pages: Math.ceil(totalReports / limit)
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching content reports:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch content reports.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
