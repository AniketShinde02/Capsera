#!/usr/bin/env node

/**
 * Migration Script: Clean up old ImageKit URLs
 * This script removes or updates old ImageKit URLs in the database
 * Run this after migrating to Cloudinary
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function migrateImageKitUrls() {
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
    
    // Find all collections that might contain image URLs
    const collections = ['posts', 'users', 'deletedprofiles'];
    
    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      
      console.log(`\n🔍 Processing collection: ${collectionName}`);
      
      // Find documents with old ImageKit URLs
      const oldImageKitDocs = await collection.find({
        $or: [
          { image: { $regex: /ik\.imagekit\.io/ } },
          { imageUrl: { $regex: /ik\.imagekit\.io/ } },
          { profileImage: { $regex: /ik\.imagekit\.io/ } }
        ]
      }).toArray();

      console.log(`📊 Found ${oldImageKitDocs.length} documents with old ImageKit URLs`);

      if (oldImageKitDocs.length > 0) {
        console.log('📝 Sample old URLs:');
        oldImageKitDocs.slice(0, 3).forEach(doc => {
          console.log(`  - ${doc.image || doc.imageUrl || doc.profileImage}`);
        });

        // Update strategy: Set image fields to null for old ImageKit URLs
        const updateResult = await collection.updateMany(
          {
            $or: [
              { image: { $regex: /ik\.imagekit\.io/ } },
              { imageUrl: { $regex: /ik\.imagekit\.io/ } },
              { profileImage: { $regex: /ik\.imagekit\.io/ } }
            ]
          },
          {
            $set: {
              image: null,
              imageUrl: null,
              profileImage: null,
              imageKitMigrated: true,
              migratedAt: new Date()
            }
          }
        );

        console.log(`✅ Updated ${updateResult.modifiedCount} documents in ${collectionName}`);
      }
    }

    // Also check for any other fields that might contain ImageKit URLs
    console.log('\n🔍 Checking for other fields with ImageKit URLs...');
    
    const allCollections = await db.listCollections().toArray();
    
    for (const col of allCollections) {
      const collection = db.collection(col.name);
      
      // Find documents with any field containing ImageKit URLs
      const docsWithImageKit = await collection.find({
        $text: { $search: 'ik.imagekit.io' }
      }).toArray();

      if (docsWithImageKit.length > 0) {
        console.log(`⚠️  Found ${docsWithImageKit.length} documents in ${col.name} with potential ImageKit URLs`);
        console.log('   Consider manual review of these documents');
      }
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Old ImageKit URLs have been cleared from image fields');
    console.log('   - Documents marked with imageKitMigrated: true');
    console.log('   - Users will see placeholder images for old content');
    console.log('\n💡 Next steps:');
    console.log('   1. Restart your application');
    console.log('   2. Old ImageKit URLs will no longer cause errors');
    console.log('   3. Users can re-upload images if needed');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the migration
if (require.main === module) {
  migrateImageKitUrls()
    .then(() => {
      console.log('\n✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateImageKitUrls };
