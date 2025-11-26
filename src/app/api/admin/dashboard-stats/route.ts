import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { canManageAdmins } from '@/lib/init-admin';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can manage admins
    const canManage = await canManageAdmins(session.user.id);
    if (!canManage) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Connect to database early so we can update lastSeen
    const { db } = await connectToDatabase();

    // Update user's lastSeen for real-time tracking
    try {
      const userIdFilter = ObjectId.isValid(String(session.user.id)) ? new ObjectId(String(session.user.id)) : (session.user.id as any);
      await db.collection('users').updateOne(
        { _id: userIdFilter },
        { $set: { lastSeen: new Date() } }
      );
    } catch (error) {
      console.log('Could not update lastSeen for user:', session.user.id, error);
    }

    console.log('📊 Fetching real dashboard stats from database...');
    console.log('📊 Session user ID:', session.user.id);

    // Get REAL user counts from both collections
    const regularUserCount = await db.collection('users').countDocuments({
      isDeleted: { $ne: true },
      isAdmin: { $ne: true }
    }).catch(() => 0);

    const adminUserCount = await db.collection('adminusers').countDocuments({
      status: 'active'
    }).catch(() => 0);

    const totalUsers = regularUserCount + adminUserCount;

    // Get REAL post counts
    const totalPosts = await db.collection('posts').countDocuments({
      isDeleted: { $ne: true }
    }).catch(() => 0);

    // Get REAL image counts (posts with images)
    const totalImages = await db.collection('posts').countDocuments({
      image: { $exists: true, $ne: null },
      isDeleted: { $ne: true }
    }).catch(() => 0);

    // Get REAL role counts
    const totalRoles = await db.collection('roles').countDocuments({}).catch(() => 0);

    // Get REAL contact form submissions
    const totalContacts = await db.collection('contacts').countDocuments({}).catch(() => 0);


    // Get REAL archived profiles
    const totalArchivedProfiles = await db.collection('deletedprofiles').countDocuments({}).catch(() => 0);

    // Calculate real-time metrics
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    // New users this week/month
    const newUsersThisWeek = await db.collection('users').countDocuments({
      createdAt: { $gte: weekAgo },
      isDeleted: { $ne: true },
      isAdmin: { $ne: true }
    }).catch(() => 0);

    const newUsersThisMonth = await db.collection('users').countDocuments({
      createdAt: { $gte: monthAgo },
      isDeleted: { $ne: true },
      isAdmin: { $ne: true }
    }).catch(() => 0);

    // New posts this week/month
    const newPostsThisWeek = await db.collection('posts').countDocuments({
      createdAt: { $gte: weekAgo },
      isDeleted: { $ne: true }
    }).catch(() => 0);

    const newPostsThisMonth = await db.collection('posts').countDocuments({
      createdAt: { $gte: monthAgo },
      isDeleted: { $ne: true }
    }).catch(() => 0);

    // Calculate growth percentages
    const userGrowthWeek = totalUsers > 0 ? ((newUsersThisWeek / totalUsers) * 100).toFixed(1) : '0';
    const userGrowthMonth = totalUsers > 0 ? ((newUsersThisMonth / totalUsers) * 100).toFixed(1) : '0';
    const postGrowthWeek = totalPosts > 0 ? ((newPostsThisWeek / totalPosts) * 100).toFixed(1) : '0';
    const postGrowthMonth = totalPosts > 0 ? ((newPostsThisMonth / totalPosts) * 100).toFixed(1) : '0';

    // Get system health metrics
    const dbStats = await db.stats().catch(() => ({ objects: 0, dataSize: 0, avgObjSize: 0 }));
    const collections = await db.listCollections().toArray().catch(() => []);

    // Calculate database performance metrics
    const totalCollections = collections.length;
    const totalDocuments = dbStats.objects || 0;
    const totalSize = (dbStats.dataSize / (1024 * 1024)).toFixed(2); // Convert to MB
    const avgDocumentSize = totalDocuments > 0 ? (dbStats.avgObjSize / 1024).toFixed(2) : '0'; // Convert to KB

    // Get recent activity (include all users including admins)
    const recentUsers = await db.collection('users')
      .find({
        isDeleted: { $ne: true }
        // Removed isAdmin filter to include admin users in recent activity
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()
      .catch(() => []);

    const recentPosts = await db.collection('posts')
      .find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()
      .catch(() => []);

    // Get 7-day history for sparklines
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const userHistory = await db.collection('users').aggregate([
      {
        $match: {
          createdAt: { $gte: weekAgo },
          isDeleted: { $ne: true }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const postHistory = await db.collection('posts').aggregate([
      {
        $match: {
          createdAt: { $gte: weekAgo },
          isDeleted: { $ne: true }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    // Fill in missing days with 0
    const userSparkline = last7Days.map(date => ({
      date,
      value: userHistory.find(h => h._id === date)?.count || 0
    }));

    const postSparkline = last7Days.map(date => ({
      date,
      value: postHistory.find(h => h._id === date)?.count || 0
    }));

    // Calculate real-time metrics
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Online users (active in last 5 minutes)
    const onlineUsers = await db.collection('users').countDocuments({
      lastSeen: { $gte: fiveMinutesAgo },
      isDeleted: { $ne: true }
    }).catch(() => 0);

    // Active sessions (logged in within last hour)
    const activeSessions = await db.collection('users').countDocuments({
      lastLogin: { $gte: oneHourAgo },
      isDeleted: { $ne: true }
    }).catch(() => 0);

    // Pending actions (contact forms, etc.) - removed data recovery requests
    const pendingActions = await db.collection('contacts').countDocuments({
      status: { $in: ['unread', 'processing'] }
    }).catch(() => 0);

    // Server system load (simulated based on database performance)
    const dbPerformance = await db.command({ serverStatus: 1 }).catch(() => null);
    let systemLoad = 0;

    if (dbPerformance) {
      // Calculate load based on database connections and operations
      const connections = dbPerformance.connections || {};
      const activeConnections = connections.active || 0;
      const maxConnections = connections.available || 100;
      // More realistic load calculation: (Active / Max) * 100, but scaled to be visible
      systemLoad = Math.min(100, Math.round((activeConnections / Math.max(10, activeConnections + 10)) * 100));
    } else {
      // Fallback: calculate load based on recent activity
      const recentActivity = await db.collection('posts').countDocuments({
        createdAt: { $gte: fiveMinutesAgo }
      }).catch(() => 0);
      systemLoad = Math.min(100, Math.round((recentActivity / 10) * 20)); // Scale based on recent posts
    }

    const stats = {
      users: {
        total: totalUsers,
        regular: regularUserCount,
        admin: adminUserCount,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth,
        growthWeek: `${userGrowthWeek}%`,
        growthMonth: `${userGrowthMonth}%`,
        history: userSparkline
      },
      posts: {
        total: totalPosts,
        newThisWeek: newPostsThisWeek,
        newThisMonth: newPostsThisMonth,
        growthWeek: `${postGrowthWeek}%`,
        growthMonth: `${postGrowthMonth}%`,
        history: postSparkline
      },
      images: {
        total: totalImages
      },
      roles: {
        total: totalRoles
      },
      contacts: {
        total: totalContacts
      },
      archivedProfiles: {
        total: totalArchivedProfiles
      },
      database: {
        collections: totalCollections,
        documents: totalDocuments,
        size: `${totalSize} MB`,
        avgDocumentSize: `${avgDocumentSize} KB`
      },
      realTimeData: {
        onlineUsers,
        activeSessions,
        pendingActions,
        systemLoad
      },
      recentActivity: {
        users: recentUsers.map(user => ({
          id: user._id?.toString() || 'unknown',
          name: user.username || user.email?.split('@')[0] || 'Unknown User',
          email: user.email || 'No email',
          joined: user.createdAt || user.created_at || new Date().toISOString()
        })),
        posts: recentPosts.map(post => ({
          id: post._id?.toString() || 'unknown',
          title: post.caption?.substring(0, 50) || post.captions?.[0]?.substring(0, 50) || 'No caption',
          created: post.createdAt || post.created_at || new Date().toISOString(),
          hasImage: !!post.image
        }))
      }
    };

    console.log(`📊 Dashboard stats: ${totalUsers} users, ${totalPosts} posts, ${totalImages} images`);
    console.log('📊 Recent users found:', recentUsers.length);
    console.log('📊 Recent posts found:', recentPosts.length);
    console.log('📊 Recent users sample:', recentUsers.slice(0, 3).map(u => ({ email: u.email, createdAt: u.createdAt })));

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
