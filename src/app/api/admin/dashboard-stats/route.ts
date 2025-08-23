import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
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

    // Update user's lastSeen for real-time tracking
    try {
      await db.collection('users').updateOne(
        { _id: session.user.id },
        { $set: { lastSeen: new Date() } }
      );
    } catch (error) {
      console.log('Could not update lastSeen for user:', session.user.id);
    }

    const { db } = await connectToDatabase();

    console.log('📊 Fetching real dashboard stats from database...');

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

    // Get REAL data recovery requests
    const totalDataRecoveryRequests = await db.collection('datarecoveryrequests').countDocuments({}).catch(() => 0);

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

    // Get recent activity
    const recentUsers = await db.collection('users')
      .find({ 
        isDeleted: { $ne: true },
        isAdmin: { $ne: true }
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

    // Pending actions (recovery requests, contact forms, etc.)
    const pendingActions = await db.collection('datarecoveryrequests').countDocuments({
      status: { $in: ['pending', 'processing'] }
    }).catch(() => 0) + await db.collection('contacts').countDocuments({
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
      systemLoad = Math.min(100, Math.round((activeConnections / maxConnections) * 100));
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
        growthMonth: `${userGrowthMonth}%`
      },
      posts: {
        total: totalPosts,
        newThisWeek: newPostsThisWeek,
        newThisMonth: newPostsThisMonth,
        growthWeek: `${postGrowthWeek}%`,
        growthMonth: `${postGrowthMonth}%`
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
      dataRecovery: {
        total: totalDataRecoveryRequests
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
