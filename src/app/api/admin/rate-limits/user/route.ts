import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/admin-middleware';
import { dbConnect } from '@/lib/db';
import mongoose from 'mongoose';
import RateLimit from '@/models/RateLimit';
import { UnifiedRateLimiter } from '@/lib/unified-rate-limiter';

/**
 * Get rate limit information for a specific user
 * 
 * GET /api/admin/rate-limits/user?userId=123
 */
export async function GET(req: NextRequest) {
  try {
    // Verify admin access
    const adminAccessError = await verifyAdminAccess(req);
    if (adminAccessError) {
      return adminAccessError; // Already returns a NextResponse with error
    }

    // Get userId from query params
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Get rate limit info for user
    const rateLimiter = new UnifiedRateLimiter();
    const rateLimitInfo = await rateLimiter.getRateLimitInfo(userId);
    
    // Get rate limit records for user
    const key = `user:${userId}`;
    const rateLimitRecord = await mongoose.model('RateLimit').findOne({ key });

    return NextResponse.json({
      success: true,
      data: {
        userId,
        rateLimitInfo,
        record: rateLimitRecord ? {
          count: rateLimitRecord.count,
          resetTime: rateLimitRecord.resetTime,
          createdAt: rateLimitRecord.createdAt,
          updatedAt: rateLimitRecord.updatedAt
        } : null
      }
    });
  } catch (error: any) {
    console.error('Error getting user rate limit info:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to get user rate limit info' },
      { status: 500 }
    );
  }
}

/**
 * Reset rate limit for a specific user
 * 
 * POST /api/admin/rate-limits/user
 * 
 * Body:
 * - userId: The user ID to reset
 */
export async function POST(req: NextRequest) {
  try {
    // Verify admin access
    const adminError = await verifyAdminAccess(req);
    if (adminError) {
      return adminError; // Already returns a NextResponse with error
    }

    // Parse request body
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Delete rate limit record for user
    const key = `user:${userId}`;
    const result = await mongoose.model('RateLimit').deleteOne({ key });

    return NextResponse.json({
      success: true,
      message: result.deletedCount > 0 
        ? `Successfully reset rate limit for user ${userId}` 
        : `No rate limit found for user ${userId}`,
      data: {
        userId,
        deleted: result.deletedCount > 0
      }
    });
  } catch (error: any) {
    console.error('Error resetting user rate limit:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to reset user rate limit' },
      { status: 500 }
    );
  }
}