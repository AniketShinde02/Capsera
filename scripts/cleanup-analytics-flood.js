const { MongoClient } = require('mongodb');
require('dotenv').config();

async function cleanupAnalyticsFlood() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const analyticsCollection = db.collection('analytics_events');
    
    console.log('🔍 Analyzing analytics events...');
    
    // Get count of all analytics events
    const totalCount = await analyticsCollection.countDocuments();
    console.log(`📊 Total analytics events: ${totalCount}`);
    
    // Get count of cookie consent events specifically
    const cookieConsentCount = await analyticsCollection.countDocuments({
      action: { $regex: /cookie_consent/ }
    });
    console.log(`🍪 Cookie consent events: ${cookieConsentCount}`);
    
    // Get breakdown by action type
    const actionBreakdown = await analyticsCollection.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('\n📈 Action breakdown:');
    actionBreakdown.forEach(item => {
      console.log(`  ${item._id}: ${item.count} events`);
    });
    
    // Clean up cookie consent events (keep only the most recent one per session)
    console.log('\n🧹 Cleaning up duplicate cookie consent events...');
    
    // Group by sessionId and action, keep only the latest
    const duplicateGroups = await analyticsCollection.aggregate([
      { $match: { action: { $regex: /cookie_consent/ } } },
      { $group: { 
          _id: { sessionId: '$sessionId', action: '$action' },
          count: { $sum: 1 },
          docs: { $push: '$$ROOT' }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    
    let deletedCount = 0;
    
    for (const group of duplicateGroups) {
      // Sort by timestamp, keep the latest
      const sortedDocs = group.docs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const toKeep = sortedDocs[0];
      const toDelete = sortedDocs.slice(1);
      
      // Delete duplicates
      const deleteIds = toDelete.map(doc => doc._id);
      if (deleteIds.length > 0) {
        const deleteResult = await analyticsCollection.deleteMany({
          _id: { $in: deleteIds }
        });
        deletedCount += deleteResult.deletedCount;
        console.log(`  🗑️ Deleted ${deleteResult.deletedCount} duplicates for ${group._id.action} (session: ${group._id.sessionId?.substring(0, 8)}...)`);
      }
    }
    
    // Also clean up very old analytics events (older than 90 days)
    console.log('\n🧹 Cleaning up old analytics events (older than 90 days)...');
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const oldEventsResult = await analyticsCollection.deleteMany({
      createdAt: { $lt: ninetyDaysAgo }
    });
    
    console.log(`🗑️ Deleted ${oldEventsResult.deletedCount} old events`);
    
    // Final count
    const finalCount = await analyticsCollection.countDocuments();
    const finalCookieConsentCount = await analyticsCollection.countDocuments({
      action: { $regex: /cookie_consent/ }
    });
    
    console.log('\n✅ Cleanup completed!');
    console.log(`📊 Final analytics events: ${finalCount}`);
    console.log(`🍪 Final cookie consent events: ${finalCookieConsentCount}`);
    console.log(`🗑️ Total deleted: ${deletedCount + oldEventsResult.deletedCount}`);
    
    // Create index to prevent future duplicates
    console.log('\n🔧 Creating indexes to prevent future duplicates...');
    try {
      await analyticsCollection.createIndex(
        { sessionId: 1, action: 1, timestamp: 1 },
        { 
          name: 'session_action_timestamp_idx',
          background: true 
        }
      );
      console.log('✅ Created compound index for deduplication');
    } catch (error) {
      console.log('⚠️ Index creation failed (may already exist):', error.message);
    }
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the cleanup
cleanupAnalyticsFlood().catch(console.error);
