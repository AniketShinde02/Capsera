const { MongoClient } = require('mongodb');
require('dotenv').config();

async function clearAdminData() {
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
    
    // Clear admin_users collection (new separate collection for admins)
    const adminUsersResult = await db.collection('admin_users').deleteMany({});
    console.log(`🗑️  Deleted ${adminUsersResult.deletedCount} admin users from admin_users collection`);

    // Also clear any admin users from regular users collection (for backward compatibility)
    const regularUsersResult = await db.collection('users').deleteMany({
      'role.name': 'admin'
    });
    console.log(`🗑️  Deleted ${regularUsersResult.deletedCount} admin users from regular users collection`);

    // Clear admin roles
    const rolesResult = await db.collection('roles').deleteMany({
      name: 'admin'
    });
    console.log(`🗑️  Deleted ${rolesResult.deletedCount} admin roles`);

    // Clear used tokens
    const tokensResult = await db.collection('used_tokens').deleteMany({});
    console.log(`🗑️  Deleted ${tokensResult.deletedCount} used tokens`);

    // Clear any admin-related collections
    const collections = await db.listCollections().toArray();
    const adminCollections = collections.filter(col => 
      col.name.includes('admin') || 
      col.name.includes('Admin') ||
      col.name.includes('setup')
    );

    for (const collection of adminCollections) {
      try {
        await db.collection(collection.name).drop();
        console.log(`🗑️  Dropped collection: ${collection.name}`);
      } catch (error) {
        console.log(`⚠️  Could not drop collection ${collection.name}:`, error.message);
      }
    }

    console.log('\n✅ Admin data cleared successfully!');
    console.log('📝 Next steps:');
    console.log('1. Generate a new setup token: npm run generate-token');
    console.log('2. Update your .env file with the new token');
    console.log('3. Restart your server');
    console.log('4. Go to /setup to create a new admin account');
    console.log('5. IMPORTANT: Clear your browser cookies/session data to remove persistent sessions');

  } catch (error) {
    console.error('❌ Error clearing admin data:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

clearAdminData();
