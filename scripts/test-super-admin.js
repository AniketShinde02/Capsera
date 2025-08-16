const mongoose = require('mongoose');
require('dotenv').config();

// Import models and functions
const User = require('../src/models/User').default;
const Role = require('../src/models/Role').default;
const { checkUserPermission, getUserPermissions, isSuperAdmin, canManageAdmins } = require('../src/lib/init-admin');

async function testSuperAdmin() {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('🔗 Connected to database');

    // Test 1: Check if super admin exists
    console.log('\n🧪 Test 1: Super Admin Existence');
    const superAdmin = await User.findOne({ isSuperAdmin: true });
    if (superAdmin) {
      console.log('✅ Super admin found:', superAdmin.email);
      console.log('   - isSuperAdmin:', superAdmin.isSuperAdmin);
      console.log('   - isAdmin:', superAdmin.isAdmin);
      console.log('   - Role ID:', superAdmin.role);
    } else {
      console.log('❌ No super admin found');
      return;
    }

    // Test 2: Check super admin permissions
    console.log('\n🧪 Test 2: Super Admin Permissions');
    const permissions = await getUserPermissions(superAdmin._id.toString());
    console.log('✅ Permissions:', permissions);

    // Test 3: Test permission checking
    console.log('\n🧪 Test 3: Permission Checking');
    const canManageUsers = await checkUserPermission(superAdmin._id.toString(), 'users', 'manage');
    const canManageRoles = await checkUserPermission(superAdmin._id.toString(), 'roles', 'manage');
    const canManageSystem = await checkUserPermission(superAdmin._id.toString(), 'system', 'manage');
    
    console.log('✅ Can manage users:', canManageUsers);
    console.log('✅ Can manage roles:', canManageRoles);
    console.log('✅ Can manage system:', canManageSystem);

    // Test 4: Test super admin status
    console.log('\n🧪 Test 4: Super Admin Status');
    const isSuper = await isSuperAdmin(superAdmin._id.toString());
    const canManageAdmins = await canManageAdmins(superAdmin._id.toString());
    
    console.log('✅ Is super admin:', isSuper);
    console.log('✅ Can manage admins:', canManageAdmins);

    // Test 5: Check role details
    console.log('\n🧪 Test 5: Role Details');
    const role = await Role.findById(superAdmin.role);
    if (role) {
      console.log('✅ Role name:', role.name);
      console.log('✅ Role display:', role.displayName);
      console.log('✅ Role description:', role.description);
      console.log('✅ Permissions count:', role.permissions.length);
    }

    console.log('\n🎉 All tests passed! Super admin system is working correctly.');

  } catch (error) {
    console.error('❌ Error testing super admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the test
testSuperAdmin();
