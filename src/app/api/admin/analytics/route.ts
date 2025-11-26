import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { canManageAdmins } from '@/lib/init-admin';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const canManage = await canManageAdmins(session.user.id);
    if (!canManage) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { db } = await connectToDatabase();
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '7d';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (timeRange) {
      case '24h': startDate.setHours(now.getHours() - 24); break;
      case '7d': startDate.setDate(now.getDate() - 7); break;
      case '30d': startDate.setDate(now.getDate() - 30); break;
      case '90d': startDate.setDate(now.getDate() - 90); break;
      case '1y': startDate.setFullYear(now.getFullYear() - 1); break;
      default: startDate.setDate(now.getDate() - 7);
    }

    // 1. Overview Metrics
    const totalUsers = await db.collection('users').countDocuments({ isDeleted: { $ne: true } });
    const activeUsers = await db.collection('users').countDocuments({
      lastSeen: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }, // Active in last 30 days
      isDeleted: { $ne: true }
    });
    const totalPosts = await db.collection('posts').countDocuments({ isDeleted: { $ne: true } });
    const totalImages = await db.collection('posts').countDocuments({ image: { $exists: true, $ne: null }, isDeleted: { $ne: true } });

    // Calculate growth (vs previous period of same length)
    const periodLength = now.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);

    const previousUsers = await db.collection('users').countDocuments({
      createdAt: { $gte: previousStartDate, $lt: startDate },
      isDeleted: { $ne: true }
    });
    const currentUsers = await db.collection('users').countDocuments({
      createdAt: { $gte: startDate },
      isDeleted: { $ne: true }
    });
    const userGrowth = previousUsers > 0 ? Math.round(((currentUsers - previousUsers) / previousUsers) * 100) : 100;

    // 2. User Behavior - Popular Moods
    const popularMoods = await db.collection('posts').aggregate([
      { $match: { createdAt: { $gte: startDate }, isDeleted: { $ne: true }, mood: { $exists: true, $ne: null } } },
      { $group: { _id: "$mood", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).toArray();

    const totalMoodsCount = popularMoods.reduce((acc, curr) => acc + curr.count, 0);
    const formattedMoods = popularMoods.map(m => ({
      mood: m._id,
      count: m.count,
      percentage: totalMoodsCount > 0 ? Math.round((m.count / totalMoodsCount) * 100) : 0
    }));

    // 3. User Behavior - Top Captions (by usage count if identical, otherwise just recent)
    // Since we don't track "usage" of generated captions explicitly, we'll list recent ones
    const recentCaptions = await db.collection('posts').find({
      createdAt: { $gte: startDate },
      isDeleted: { $ne: true }
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    const formattedCaptions = recentCaptions.map(p => ({
      caption: p.captions?.[0]?.substring(0, 50) + (p.captions?.[0]?.length > 50 ? '...' : '') || 'No caption',
      count: 1, // Placeholder as we don't track re-use
      engagement: Math.floor(Math.random() * 20) + 80 // Mock engagement for now
    }));

    // 4. Real-time Activity Chart (Users & Posts over time)
    const chartData = await db.collection('posts').aggregate([
      { $match: { createdAt: { $gte: startDate }, isDeleted: { $ne: true } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          posts: { $sum: 1 },
          images: { $sum: { $cond: [{ $ifNull: ["$image", false] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    const userChartData = await db.collection('users').aggregate([
      { $match: { createdAt: { $gte: startDate }, isDeleted: { $ne: true } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          users: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    // Merge chart data
    const dateMap = new Map();
    chartData.forEach(d => dateMap.set(d._id, { date: d._id, posts: d.posts, images: d.images, users: 0 }));
    userChartData.forEach(d => {
      if (dateMap.has(d._id)) {
        dateMap.get(d._id).users = d.users;
      } else {
        dateMap.set(d._id, { date: d._id, posts: 0, images: 0, users: d.users });
      }
    });

    const mergedChartData = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // 5. User Journey (Simple Funnel)
    // Visitors (approx) -> Signups -> Generated Caption -> Uploaded Image
    const funnel = [
      { step: 'Total Users', users: totalUsers, conversion: 100 },
      { step: 'Active Users', users: activeUsers, conversion: Math.round((activeUsers / totalUsers) * 100) || 0 },
      { step: 'Generated Caption', users: await db.collection('posts').distinct('user', { isDeleted: { $ne: true } }).then(ids => ids.length), conversion: 0 },
      { step: 'Uploaded Image', users: await db.collection('posts').distinct('user', { image: { $exists: true }, isDeleted: { $ne: true } }).then(ids => ids.length), conversion: 0 }
    ];
    // Recalculate conversions based on previous step
    funnel[2].conversion = Math.round((funnel[2].users / funnel[1].users) * 100) || 0;
    funnel[3].conversion = Math.round((funnel[3].users / funnel[2].users) * 100) || 0;


    const analyticsData = {
      overview: {
        totalUsers,
        activeUsers,
        totalCaptions: totalPosts,
        totalImages,
        conversionRate: funnel[2].conversion, // Users who generated at least one caption
        bounceRate: 100 - (funnel[1].conversion), // Inactive users
        avgSessionDuration: 5.2, // Mock for now, requires session tracking
        userGrowth,
        captionGrowth: 0, // TODO: Implement similar to userGrowth
        imageGrowth: 0
      },
      userBehavior: {
        timeSpent: {
          average: 12,
          byDevice: { mobile: 65, desktop: 30, tablet: 5 }, // Mock
          byMood: {} // Populated below if needed, or skip
        },
        popularMoods: formattedMoods,
        deviceUsage: [ // Mock as we don't track devices yet
          { device: 'Mobile', count: Math.round(activeUsers * 0.65), percentage: 65 },
          { device: 'Desktop', count: Math.round(activeUsers * 0.30), percentage: 30 },
          { device: 'Tablet', count: Math.round(activeUsers * 0.05), percentage: 5 }
        ],
        topCaptions: formattedCaptions,
        userJourney: funnel
      },
      traffic: {
        sources: [ // Mock
          { source: 'Direct', users: Math.round(activeUsers * 0.4), percentage: 40 },
          { source: 'Social', users: Math.round(activeUsers * 0.3), percentage: 30 },
          { source: 'Organic', users: Math.round(activeUsers * 0.2), percentage: 20 },
          { source: 'Referral', users: Math.round(activeUsers * 0.1), percentage: 10 }
        ],
        regions: [ // Mock
          { region: 'North America', users: Math.round(activeUsers * 0.45), percentage: 45 },
          { region: 'Europe', users: Math.round(activeUsers * 0.30), percentage: 30 },
          { region: 'Asia', users: Math.round(activeUsers * 0.15), percentage: 15 },
          { region: 'Other', users: Math.round(activeUsers * 0.10), percentage: 10 }
        ]
      },
      performance: {
        aiResponseTime: 1.8, // Mock
        imageProcessingTime: 0.5, // Mock
        systemUptime: 99.9,
        errorRate: 0.05
      },
      insights: {
        trends: [],
        recommendations: [],
        alerts: []
      },
      realTimeActivity: {
        chartData: mergedChartData,
        // ... other real-time fields can be populated similarly
      }
    };

    return NextResponse.json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
