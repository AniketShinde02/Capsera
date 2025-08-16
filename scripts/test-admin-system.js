const { MongoClient } = require('mongodb');

async function testAdminSystem() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/captioncraft';
  
  try {
    console.log('🧪 Testing Admin System...');
    console.log('=====================================');
    
    // Connect to database
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // Check collections
    const collections = await db.listCollections().toArray();
    console.log('📚 Collections found:', collections.map(c => c.name));
    
    // Check roles
    const rolesCollection = db.collection('roles');
    const adminRole = await rolesCollection.findOne({ name: 'admin' });
    if (adminRole) {
      console.log('✅ Admin role found:', {
        id: adminRole._id,
        name: adminRole.name,
        displayName: adminRole.displayName,
        permissions: adminRole.permissions?.length || 0
      });
    } else {
      console.log('❌ Admin role not found');
    }
    
    // Check users
    const usersCollection = db.collection('users');
    const adminUsers = await usersCollection.find({ 'role.name': 'admin' }).toArray();
    console.log('👥 Admin users found:', adminUsers.length);
    
    adminUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} (${user.username}) - Role: ${user.role?.name}`);
    });
    
    // Check total users
    const totalUsers = await usersCollection.countDocuments();
    console.log('📊 Total users in system:', totalUsers);
    
    // Test admin setup API
    console.log('\n🌐 Testing Admin Setup API...');
    try {
      const response = await fetch('http://localhost:3000/api/admin/setup');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Setup API response:', data);
      } else {
        console.log('❌ Setup API failed:', response.status);
      }
    } catch (error) {
      console.log('❌ Setup API error:', error.message);
    }
    
    await client.close();
    console.log('\n✅ Admin system test completed');
    
  } catch (error) {
    console.error('❌ Admin system test failed:', error);
  }
}

// Run the test
testAdminSystem();
