import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
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

    await dbConnect();

    // Find users eligible for promotional emails (every 3 days)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    
    const eligibleUsers = await User.find({
      'emailPreferences.promotional': true,
      $or: [
        { lastPromotionalEmailDate: { $lt: threeDaysAgo } },
        { lastPromotionalEmailDate: { $exists: false } }
      ],
      status: 'active'
    }).select('email name username unsubscribeToken');

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
          await User.findByIdAndUpdate(user._id, {
            $set: {
              lastPromotionalEmailDate: new Date(),
              promotionalEmailCount: { $inc: 1 },
              promotionalEmailSentAt: new Date()
            }
          });
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

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    // Get promotional email statistics
    const totalUsers = await User.countDocuments({ status: 'active' });
    const promotionalEnabledUsers = await User.countDocuments({
      'emailPreferences.promotional': true,
      status: 'active'
    });
    const eligibleForPromotional = await User.countDocuments({
      'emailPreferences.promotional': true,
      $or: [
        { lastPromotionalEmailDate: { $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } },
        { lastPromotionalEmailDate: { $exists: false } }
      ],
      status: 'active'
    });

    // Get recent promotional email activity
    const recentActivity = await User.find({
      promotionalEmailSentAt: { $exists: true }
    })
    .sort({ promotionalEmailSentAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('email name username promotionalEmailSentAt promotionalEmailCount lastPromotionalEmailDate');

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
