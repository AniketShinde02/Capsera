export class SmartDBQueries {
  constructor(private db: any) {}

  // SMART: Get all dashboard stats in one optimized query
  async getDashboardStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    // SMART: Use aggregation pipeline for better performance
    const [userStats, postStats, systemStats] = await Promise.all([
      // User statistics
      this.db.collection('users').aggregate([
        {
          $facet: {
            total: [{ $match: { isDeleted: { $ne: true }, isAdmin: { $ne: true } } }, { $count: "count" }],
            thisWeek: [{ $match: { createdAt: { $gte: weekAgo }, isDeleted: { $ne: true }, isAdmin: { $ne: true } } }, { $count: "count" }],
            thisMonth: [{ $match: { createdAt: { $gte: monthAgo }, isDeleted: { $ne: true }, isAdmin: { $ne: true } } }, { $count: "count" }],
            online: [{ $match: { lastSeen: { $gte: new Date(now.getTime() - 5 * 60 * 1000) }, isDeleted: { $ne: true } } }, { $count: "count" }]
          }
        }
      ]).toArray(),

      // Post statistics  
      this.db.collection('posts').aggregate([
        {
          $facet: {
            total: [{ $match: { isDeleted: { $ne: true } } }, { $count: "count" }],
            thisWeek: [{ $match: { createdAt: { $gte: weekAgo }, isDeleted: { $ne: true } } }, { $count: "count" }],
            thisMonth: [{ $match: { createdAt: { $gte: monthAgo }, isDeleted: { $ne: true } } }, { $count: "count" }],
            withImages: [{ $match: { image: { $exists: true, $ne: null }, isDeleted: { $ne: true } } }, { $count: "count" }]
          }
        }
      ]).toArray(),

      // System statistics
      this.db.stats().catch(() => ({ objects: 0, dataSize: 0, avgObjSize: 0 }))
    ]);

    // SMART: Process results efficiently
    const userData = userStats[0];
    const postData = postStats[0];
    
    return {
      users: {
        total: userData.total[0]?.count || 0,
        newThisWeek: userData.thisWeek[0]?.count || 0,
        newThisMonth: userData.thisMonth[0]?.count || 0,
        online: userData.online[0]?.count || 0
      },
      posts: {
        total: postData.total[0]?.count || 0,
        newThisWeek: postData.thisWeek[0]?.count || 0,
        newThisMonth: postData.thisMonth[0]?.count || 0,
        withImages: postData.withImages[0]?.count || 0
      },
      system: {
        totalDocuments: systemStats.objects || 0,
        totalSize: (systemStats.dataSize / (1024 * 1024)).toFixed(2) + ' MB',
        avgDocumentSize: (systemStats.avgObjSize / 1024).toFixed(2) + ' KB'
      }
    };
  }

  // SMART: Cached user count for frequent queries
  private userCountCache: { count: number; timestamp: number } | null = null;
  
  async getCachedUserCount(): Promise<number> {
    const now = Date.now();
    
    // Return cached count if less than 5 minutes old
    if (this.userCountCache && (now - this.userCountCache.timestamp) < 5 * 60 * 1000) {
      return this.userCountCache.count;
    }
    
    // Fetch fresh count
    const count = await this.db.collection('users').countDocuments({ 
      isDeleted: { $ne: true },
      isAdmin: { $ne: true }
    });
    
    this.userCountCache = { count, timestamp: now };
    return count;
  }
}
