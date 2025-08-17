/**
 * Verify Admin Dual-Mode Setup
 * This script checks the current state of the admin user's dual-mode properties
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

async function verifyAdminDualMode() {
  console.log('🔍 Verifying Admin Dual-Mode Setup...\n');

  try {
    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const adminUsersCollection = db.collection('adminusers');
    const usersCollection = db.collection('users');

    // Find the existing admin user
    const adminUser = await adminUsersCollection.findOne({ 
      email: 'admin@capsersa.com',
      isAdmin: true 
    });

    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('✅ Found admin user:', adminUser.email);
    console.log('📊 Admin User Properties:');
    console.log('   ID:', adminUser._id);
    console.log('   Email:', adminUser.email);
    console.log('   Username:', adminUser.username);
    console.log('   Role:', adminUser.role);
    console.log('   isAdmin:', adminUser.isAdmin);
    console.log('   hasRegularUserAccount:', adminUser.hasRegularUserAccount);
    console.log('   canBrowseAsUser:', adminUser.canBrowseAsUser);
    console.log('   regularUserId:', adminUser.regularUserId);

    // Check if regular user account exists
    const regularUser = await usersCollection.findOne({
      email: adminUser.email
    });

    if (regularUser) {
      console.log('\n✅ Regular user account found:');
      console.log('   ID:', regularUser._id);
      console.log('   Email:', regularUser.email);
      console.log('   Username:', regularUser.username);
      console.log('   Role:', regularUser.role);
      console.log('   isAdmin:', regularUser.isAdmin);
    } else {
      console.log('\n❌ Regular user account NOT found');
    }

    // Check what the auth system would return
    console.log('\n🧪 Auth System Simulation:');
    const authResult = {
      id: adminUser._id.toString(),
      email: adminUser.email,
      username: adminUser.username || adminUser.name,
      role: adminUser.role,
      isAdmin: adminUser.isAdmin,
      isVerified: adminUser.isVerified || false,
      image: adminUser.image || null,
      hasRegularUserAccount: adminUser.hasRegularUserAccount !== undefined ? adminUser.hasRegularUserAccount : !!regularUser,
      regularUserId: adminUser.regularUserId || regularUser?._id?.toString(),
      canBrowseAsUser: adminUser.canBrowseAsUser !== undefined ? adminUser.canBrowseAsUser : true
    };

    console.log('   Auth Result:', JSON.stringify(authResult, null, 2));

    // Check if dual-mode should work
    if (authResult.canBrowseAsUser && authResult.hasRegularUserAccount) {
      console.log('\n🎉 Dual-Mode SHOULD work!');
      console.log('   The issue might be in the session refresh');
    } else {
      console.log('\n❌ Dual-Mode will NOT work');
      console.log('   Missing properties:', {
        canBrowseAsUser: authResult.canBrowseAsUser,
        hasRegularUserAccount: authResult.hasRegularUserAccount
      });
    }

  } catch (error) {
    console.error('❌ Error verifying admin dual-mode:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Disconnected from MongoDB');
    }
  }
}

// Run the script
if (require.main === module) {
  verifyAdminDualMode();
}

module.exports = { verifyAdminDualMode };
