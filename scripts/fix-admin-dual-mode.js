/**
 * Fix Admin Dual-Mode Setup
 * This script ensures the existing admin user has a regular user account for dual-mode functionality
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

async function fixAdminDualMode() {
  console.log('🔧 Fixing Admin Dual-Mode Setup...\n');

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

    // Check if regular user account already exists
    const existingRegularUser = await usersCollection.findOne({
      email: adminUser.email
    });

    if (existingRegularUser) {
      console.log('✅ Regular user account already exists for admin');
      console.log('📧 Email:', existingRegularUser.email);
      console.log('👤 Username:', existingRegularUser.username);
      console.log('🆔 ID:', existingRegularUser._id);
    } else {
      console.log('🔄 Creating regular user account for admin...');
      
      // Create regular user account
      const regularUserData = {
        email: adminUser.email,
        username: adminUser.username || adminUser.email.split('@')[0],
        password: adminUser.password, // Use same password for convenience
        firstName: adminUser.firstName || '',
        lastName: adminUser.lastName || '',
        phone: adminUser.phone || '',
        isAdmin: false, // Regular user account
        isVerified: true,
        role: 'user',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        profileImage: adminUser.profileImage || null,
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en'
        }
      };

      const result = await usersCollection.insertOne(regularUserData);
      if (result.insertedId) {
        console.log('✅ Regular user account created successfully');
        console.log('📧 Email:', regularUserData.email);
        console.log('👤 Username:', regularUserData.username);
        console.log('🆔 ID:', result.insertedId);
      }
    }

    // Update admin user to ensure dual-mode properties are set
    const regularUser = await usersCollection.findOne({
      email: adminUser.email
    });
    
    await adminUsersCollection.updateOne(
      { _id: adminUser._id },
      { 
        $set: { 
          hasRegularUserAccount: true,
          canBrowseAsUser: true,
          regularUserId: regularUser?._id?.toString(),
          updatedAt: new Date()
        } 
      }
    );

    console.log('✅ Admin user updated with dual-mode properties');

    // Test the setup
    console.log('\n🧪 Testing Dual-Mode Setup...');
    
    const updatedAdminUser = await adminUsersCollection.findOne({ _id: adminUser._id });
    const regularUser = await usersCollection.findOne({ email: adminUser.email });
    
    console.log('📊 Setup Summary:');
    console.log('   Admin User:', updatedAdminUser.email);
    console.log('   Admin ID:', updatedAdminUser._id);
    console.log('   Has Regular Account:', !!regularUser);
    console.log('   Regular User ID:', regularUser?._id);
    console.log('   Can Browse As User:', updatedAdminUser.canBrowseAsUser);

    if (updatedAdminUser.canBrowseAsUser && regularUser) {
      console.log('\n🎉 Dual-Mode Setup Complete!');
      console.log('   The admin can now switch between admin and user modes');
      console.log('   No logout required for mode switching');
    } else {
      console.log('\n❌ Dual-Mode Setup Failed');
      console.log('   Please check the configuration');
    }

  } catch (error) {
    console.error('❌ Error fixing admin dual-mode:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Disconnected from MongoDB');
    }
  }
}

// Run the script
if (require.main === module) {
  fixAdminDualMode();
}

module.exports = { fixAdminDualMode };
