const { MongoClient } = require('mongodb');
require('dotenv').config();

async function forceClearSessions() {
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
    
    // Clear all sessions from NextAuth
    const sessionsResult = await db.collection('sessions').deleteMany({});
    console.log(`🗑️  Deleted ${sessionsResult.deletedCount} sessions`);

    // Clear all JWT tokens
    const tokensResult = await db.collection('tokens').deleteMany({});
    console.log(`🗑️  Deleted ${tokensResult.deletedCount} JWT tokens`);

    // Clear all accounts
    const accountsResult = await db.collection('accounts').deleteMany({});
    console.log(`🗑️  Deleted ${accountsResult.deletedCount} accounts`);

    // Clear verification tokens
    const verificationTokensResult = await db.collection('verificationtokens').deleteMany({});
    console.log(`🗑️  Deleted ${verificationTokensResult.deletedCount} verification tokens`);

    // Clear any other NextAuth collections
    const collections = await db.listCollections().toArray();
    const nextAuthCollections = collections.filter(col => 
      col.name === 'sessions' || 
      col.name === 'tokens' || 
      col.name === 'accounts' || 
      col.name === 'verificationtokens' ||
      col.name.includes('nextauth') ||
      col.name.includes('NextAuth')
    );

    console.log('\n🗑️  Cleared NextAuth collections:');
    for (const collection of nextAuthCollections) {
      console.log(`   - ${collection.name}`);
    }

    console.log('\n✅ All sessions and authentication data cleared successfully!');
    console.log('📝 Next steps:');
    console.log('1. Restart your server');
    console.log('2. Clear your browser cookies and local storage');
    console.log('3. Go to /setup to create a new admin account');
    console.log('4. The persistent "welcome back" issue should now be resolved');

  } catch (error) {
    console.error('❌ Error clearing sessions:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

forceClearSessions();
