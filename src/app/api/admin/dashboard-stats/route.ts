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

    const { db } = await connectToDatabase();

    console.log('📊 Fetching real dashboard stats from database...');

    // Get REAL user counts from both collections
    const regularUserCount = await db.collection('users').countDocuments({ 
      isDeleted: { $ne: true },
      isAdmin: { $ne: true }
    });
    
    const adminUserCount = await db.collection('adminusers').countDocuments({ 
      status: 'active'
    });
    
    const totalUsers = regularUserCount + adminUserCount;

    // Get REAL post counts
    const totalPosts = await db.collection('posts').countDocuments({ 
      isDeleted: { $ne: true }
    });

    // Get REAL image counts (posts with images)
    const totalImages = await db.collection('posts').countDocuments({ 
      image: { $exists: true, $ne: null },
      isDeleted: { $ne: true }
    });

    // Get REAL role counts
    const totalRoles = await db.collection('roles').countDocuments({});

    // Get REAL contact form submissions
    const totalContacts = await db.collection('contacts').countDocuments({});

    // Get REAL data recovery requests
    const totalDataRecoveryRequests = await db.collection('datarecoveryrequests').countDocuments({});

    // Get REAL archived profiles
    const totalArchivedProfiles = await db.collection('deletedprofiles').countDocuments({});

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
    });

    const newUsersThisMonth = await db.collection('users').countDocuments({
      createdAt: { $gte: monthAgo },
      isDeleted: { $ne: true },
      isAdmin: { $ne: true }
    });

    // New posts this week/month
    const newPostsThisWeek = await db.collection('posts').countDocuments({
      createdAt: { $gte: weekAgo },
      isDeleted: { $ne: true }
    });

    const newPostsThisMonth = await db.collection('posts').countDocuments({
      createdAt: { $gte: monthAgo },
      isDeleted: { $ne: true }
    });

    // Calculate growth percentages
    const userGrowthWeek = totalUsers > 0 ? ((newUsersThisWeek / totalUsers) * 100).toFixed(1) : '0';
    const userGrowthMonth = totalUsers > 0 ? ((newUsersThisMonth / totalUsers) * 100).toFixed(1) : '0';
    const postGrowthWeek = totalPosts > 0 ? ((newPostsThisWeek / totalPosts) * 100).toFixed(1) : '0';
    const postGrowthMonth = totalPosts > 0 ? ((newPostsThisMonth / totalPosts) * 100).toFixed(1) : '0';

    // Get system health metrics
    const dbStats = await db.stats();
    const collections = await db.listCollections().toArray();
    
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
      .toArray();

    const recentPosts = await db.collection('posts')
      .find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

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
      recentActivity: {
        users: recentUsers.map(user => ({
          id: user._id.toString(),
          name: user.username || user.email || 'Unknown User',
          email: user.email,
          joined: user.createdAt || user.created_at || new Date().toISOString()
        })),
        posts: recentPosts.map(post => ({
          id: post._id.toString(),
          title: post.caption?.substring(0, 50) || 'No caption',
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
