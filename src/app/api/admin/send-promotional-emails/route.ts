import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { sendPromotionalEmail } from '@/lib/mail';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session.user.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();

    // Find users eligible for promotional emails (every 3 days)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    
    const eligibleUsers = await db.collection('users').find({
      'emailPreferences.promotional': true,
      $or: [
        { lastPromotionalEmailDate: { $lt: threeDaysAgo } },
        { lastPromotionalEmailDate: { $exists: false } }
      ],
      status: 'active'
    }).project({
      email: 1, 
      name: 1, 
      username: 1, 
      unsubscribeToken: 1
    }).toArray();

    if (eligibleUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users eligible for promotional emails at this time',
        data: { usersProcessed: 0 }
      });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Send promotional emails to eligible users
    for (const user of eligibleUsers) {
      try {
        const result = await sendPromotionalEmail({
          name: user.name || user.username || user.email.split('@')[0],
          email: user.email,
          username: user.username || user.email.split('@')[0],
          unsubscribeToken: user.unsubscribeToken || ''
        });

        if (result.queued) {
          // Mark promotional email as sent
          await db.collection('users').updateOne(
            { _id: user._id },
            {
              $set: {
                lastPromotionalEmailDate: new Date(),
                promotionalEmailSentAt: new Date()
              },
              $inc: {
                promotionalEmailCount: 1
              }
            }
          );
          successCount++;
        } else {
          errorCount++;
          errors.push(`Failed to send to ${user.email}: ${result.error || 'Unknown error'}`);
        }
      } catch (error) {
        errorCount++;
        errors.push(`Error processing ${user.email}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Promotional emails processed successfully`,
      data: {
        usersProcessed: eligibleUsers.length,
        successCount,
        errorCount,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error: any) {
    console.error('❌ Error sending promotional emails:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to send promotional emails' },
      { status: 500 }
    );
  }
}

// GET method to check promotional email status
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session.user.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    // Get promotional email statistics
    const totalUsers = await db.collection('users').countDocuments({ status: 'active' });
    const promotionalEnabledUsers = await db.collection('users').countDocuments({
      'emailPreferences.promotional': true,
      status: 'active'
    });
    const eligibleForPromotional = await db.collection('users').countDocuments({
      'emailPreferences.promotional': true,
      $or: [
        { lastPromotionalEmailDate: { $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } },
        { lastPromotionalEmailDate: { $exists: false } }
      ],
      status: 'active'
    });

    // Get recent promotional email activity
    const recentActivity = await db.collection('users').find({
      promotionalEmailSentAt: { $exists: true }
    })
    .sort({ promotionalEmailSentAt: -1 })
    .skip(skip)
    .limit(limit)
    .project({
      email: 1, 
      name: 1, 
      username: 1, 
      promotionalEmailSentAt: 1, 
      promotionalEmailCount: 1, 
      lastPromotionalEmailDate: 1
    }).toArray();

    return NextResponse.json({
      success: true,
      data: {
        statistics: {
          totalUsers,
          promotionalEnabledUsers,
          eligibleForPromotional,
          promotionalDisabledUsers: totalUsers - promotionalEnabledUsers
        },
        recentActivity,
        pagination: {
          current: page,
          total: Math.ceil(totalUsers / limit),
          count: recentActivity.length,
          totalRecords: totalUsers
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching promotional email status:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch promotional email status' },
      { status: 500 }
    );
  }
}
