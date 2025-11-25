import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/admin-middleware';
import { dbConnect } from '@/lib/db';
import { connectToDatabase } from '@/lib/db';
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
    const { db } = await connectToDatabase();

    let query = {};
    let freemiumQuery = {};
    let resetCount = 0;
    let freemiumResetCount = 0;

    // Build query based on parameters
    if (all) {
      // Reset all rate limits
      query = {};
      freemiumQuery = {};
    } else if (userId) {
      // Reset rate limits for a specific user
      query = { key: { $regex: `^user:${userId}` } };
      freemiumQuery = { key: { $regex: `^user:${userId}` } };
    } else if (userType) {
      if (userType === 'anonymous') {
        // Reset rate limits for anonymous users (IP-based)
        query = { key: { $regex: '^ip:' } };
        freemiumQuery = { key: { $regex: '^ip:' } };
      } else if (userType === 'registered' || userType === 'pro') {
        // Reset rate limits for registered or pro users (user-based)
        query = { key: { $regex: '^user:' } };
        freemiumQuery = { key: { $regex: '^user:' } };
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

    // Delete from OLD rate limit system (RateLimit collection)
    const result = await mongoose.model('RateLimit').deleteMany(query);
    resetCount = result.deletedCount;

    // Delete from NEW freemium system (freemium_usage collection) - THIS IS THE ACTIVE ONE
    const freemiumCollection = db.collection('freemium_usage');
    const freemiumResult = await freemiumCollection.deleteMany(freemiumQuery);
    freemiumResetCount = freemiumResult.deletedCount;

    console.log(`✅ Rate limit reset complete:`, {
      oldSystem: resetCount,
      newSystem: freemiumResetCount,
      parameters: { userId, userType, all }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully reset rate limits (${resetCount} old + ${freemiumResetCount} new = ${resetCount + freemiumResetCount} total records)`,
      data: {
        resetCount: resetCount + freemiumResetCount,
        oldSystemReset: resetCount,
        newSystemReset: freemiumResetCount,
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