#!/usr/bin/env node

/**
 * Clear used tokens from MongoDB Atlas cloud database
 * This script connects to the actual cloud database and clears used tokens
 */

require('dotenv/config');
const { MongoClient } = require('mongodb');

async function clearCloudTokens() {
  try {
    console.log('🌐 Connecting to MongoDB Atlas...');
    
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db();
    const usedTokensCollection = db.collection('used_tokens');
    
    // Check if collection exists and has documents
    const count = await usedTokensCollection.countDocuments();
    console.log(`📊 Found ${count} used tokens in database`);
    
    if (count > 0) {
      const result = await usedTokensCollection.deleteMany({});
      console.log(`🗑️  Cleared ${result.deletedCount} used tokens`);
    } else {
      console.log('ℹ️  No used tokens found to clear');
    }
    
    await client.close();
    console.log('✅ Disconnected from MongoDB Atlas');
    console.log('');
    console.log('🔄 You can now use your setup token again!');
    
  } catch (error) {
    console.error('❌ Error clearing cloud tokens:', error.message);
    console.error('Make sure your MONGODB_URI is correct in .env file');
  } finally {
    process.exit(0);
  }
}

clearCloudTokens();
