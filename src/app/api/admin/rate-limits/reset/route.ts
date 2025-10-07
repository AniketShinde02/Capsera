import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/admin-middleware';
import { dbConnect } from '@/lib/db';
import RateLimit from '@/models/RateLimit';
import mongoose, { FilterQuery } from 'mongoose';

/**
 * Reset rate limits for users
 * 
 * POST /api/admin/rate-limits/reset
 * 
 * Body:
 * - userId (optional): Reset limits for a specific user
 * - userType (optional): Reset limits for a specific user type (anonymous, registered, pro)
 * - all (optional): Reset all rate limits if true
 */
export async function POST(req: NextRequest) {
  try {
    // Verify admin access
    const adminAccessError = await verifyAdminAccess(req);
    if (adminAccessError) {
      return adminAccessError; // Already returns a NextResponse with error
    }

    // Parse request body
    const body = await req.json();
    const { userId, userType, all } = body;

    // Connect to database
    await dbConnect();

    let query = {};
    let resetCount = 0;

    // Build query based on parameters
    if (all) {
      // Reset all rate limits
      query = {};
    } else if (userId) {
      // Reset rate limits for a specific user
      query = { key: { $regex: `^user:${userId}` } };
    } else if (userType) {
      if (userType === 'anonymous') {
        // Reset rate limits for anonymous users (IP-based)
        query = { key: { $regex: '^ip:' } };
      } else if (userType === 'registered' || userType === 'pro') {
        // Reset rate limits for registered or pro users (user-based)
        query = { key: { $regex: '^user:' } };
      } else {
        return NextResponse.json(
          { success: false, message: 'Invalid user type' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, message: 'No reset parameters provided' },
        { status: 400 }
      );
    }

    // Delete matching rate limit records
    const result = await mongoose.model('RateLimit').deleteMany(query);
    resetCount = result.deletedCount;

    return NextResponse.json({
      success: true,
      message: `Successfully reset ${resetCount} rate limit records`,
      data: {
        resetCount,
        parameters: { userId, userType, all }
      }
    });
  } catch (error: any) {
    console.error('Error resetting rate limits:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to reset rate limits' },
      { status: 500 }
    );
  }
}