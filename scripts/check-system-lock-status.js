/**
 * Check System Lock Status
 * This script checks the current System Lock configuration and PIN status
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkSystemLockStatus() {
  console.log('🔍 Checking System Lock Status...\n');

  try {
    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const systemSettingsCollection = db.collection('systemsettings');

    // Check system lock configuration
    const lockDoc = await systemSettingsCollection.findOne({ 
      key: 'system_lock_pin' 
    });

    if (lockDoc) {
      console.log('🔒 System Lock Configuration Found:');
      console.log('   Key:', lockDoc.key);
      console.log('   Is Active:', lockDoc.isActive);
      console.log('   Has PIN:', !!lockDoc.value);
      console.log('   Created At:', lockDoc.createdAt);
      console.log('   Updated At:', lockDoc.updatedAt);
      
      if (lockDoc.isActive) {
        console.log('\n✅ System Lock is ACTIVE');
        console.log('   PIN verification is required for setup access');
        
        if (lockDoc.value) {
          console.log('   PIN is configured and stored (hashed)');
        } else {
          console.log('   ⚠️  PIN is not configured despite being active');
        }
      } else {
        console.log('\n❌ System Lock is INACTIVE');
        console.log('   PIN verification is NOT required');
      }
    } else {
      console.log('❌ No System Lock configuration found');
      console.log('   The system is not protected by PIN');
    }

    // Check if there are any other system settings
    const allSettings = await systemSettingsCollection.find({}).toArray();
    console.log('\n📋 All System Settings:');
    if (allSettings.length > 0) {
      allSettings.forEach(setting => {
        console.log(`   ${setting.key}: ${setting.value ? 'Set' : 'Not Set'} (Active: ${setting.isActive})`);
      });
    } else {
      console.log('   No system settings found');
    }

    // Check admin users to see if any have admin accounts
    const adminUsersCollection = db.collection('adminusers');
    const adminCount = await adminUsersCollection.countDocuments({ isAdmin: true });
    console.log(`\n👑 Admin Users: ${adminCount}`);

    if (adminCount > 0) {
      const adminUser = await adminUsersCollection.findOne({ isAdmin: true });
      console.log('   First Admin:', adminUser.email);
      console.log('   Username:', adminUser.username);
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    if (!lockDoc) {
      console.log('   1. System Lock is not configured');
      console.log('   2. Setup page should be accessible without PIN');
      console.log('   3. Consider setting up PIN protection for security');
    } else if (lockDoc.isActive && !lockDoc.value) {
      console.log('   1. System Lock is active but PIN is not set');
      console.log('   2. This is a configuration error - PIN should be set');
      console.log('   3. Setup page will fail PIN verification');
    } else if (lockDoc.isActive && lockDoc.value) {
      console.log('   1. System Lock is properly configured');
      console.log('   2. PIN verification is working correctly');
      console.log('   3. Setup page requires valid PIN');
    } else {
      console.log('   1. System Lock is inactive');
      console.log('   2. Setup page should be accessible without PIN');
    }

  } catch (error) {
    console.error('❌ Error checking system lock status:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Disconnected from MongoDB');
    }
  }
}

// Run the script
if (require.main === module) {
  checkSystemLockStatus();
}

module.exports = { checkSystemLockStatus };
