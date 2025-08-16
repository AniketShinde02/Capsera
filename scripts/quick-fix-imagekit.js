#!/usr/bin/env node

/**
 * Quick Fix Script: Immediately clear old ImageKit URLs
 * This is a faster, simpler version of the migration script
 * Use this for immediate relief from ImageKit errors
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function quickFixImageKitUrls() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is required');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    
    // Target the posts collection first (most likely to have image URLs)
    const postsCollection = db.collection('posts');
    
    console.log('\n🔍 Finding posts with old ImageKit URLs...');
    
    // Count documents with old ImageKit URLs
    const count = await postsCollection.countDocuments({
      image: { $regex: /ik\.imagekit\.io/ }
    });
    
    console.log(`📊 Found ${count} posts with old ImageKit URLs`);
    
    if (count > 0) {
      console.log('🚀 Clearing old ImageKit URLs...');
      
      // Clear the image field for all posts with old ImageKit URLs
      const result = await postsCollection.updateMany(
        { image: { $regex: /ik\.imagekit\.io/ } },
        { 
          $set: { 
            image: null,
            imageKitCleared: true,
            clearedAt: new Date()
          } 
        }
      );
      
      console.log(`✅ Cleared ${result.modifiedCount} posts`);
      console.log('\n🎉 Quick fix completed!');
      console.log('\n💡 Next steps:');
      console.log('   1. Restart your application');
      console.log('   2. ImageKit errors should be gone');
      console.log('   3. Users can re-upload images if needed');
      
    } else {
      console.log('✅ No posts with old ImageKit URLs found');
    }

  } catch (error) {
    console.error('❌ Quick fix failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the quick fix
if (require.main === module) {
  quickFixImageKitUrls()
    .then(() => {
      console.log('\n✅ Quick fix script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Quick fix script failed:', error);
      process.exit(1);
    });
}

module.exports = { quickFixImageKitUrls };
