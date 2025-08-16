const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../src/models/User').default;
const Role = require('../src/models/Role').default;

async function setupSuperAdmin() {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('🔗 Connected to database');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ isSuperAdmin: true });
    if (existingSuperAdmin) {
      console.log('ℹ️ Super admin already exists:', existingSuperAdmin.email);
      console.log('Current super admin:', {
        email: existingSuperAdmin.email,
        username: existingSuperAdmin.username,
        isSuperAdmin: existingSuperAdmin.isSuperAdmin,
        isAdmin: existingSuperAdmin.isAdmin
      });
      return;
    }

    // Get or create super-admin role
    let superAdminRole = await Role.findOne({ name: 'super-admin' });
    if (!superAdminRole) {
      console.log('🎭 Creating super-admin role...');
      superAdminRole = new Role({
        name: 'super-admin',
        displayName: 'Super Administrator',
        description: 'Full system access with all permissions including admin management',
        isSystem: true,
        permissions: [
          { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'roles', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'posts', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'captions', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'data-recovery', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'archived-profiles', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'dashboard', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'system', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'analytics', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'admin-management', actions: ['create', 'read', 'update', 'delete', 'manage'] }
        ]
      });
      await superAdminRole.save();
      console.log('✅ Created super-admin role');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'shindeaniket085@gmail.com' });
    if (existingUser) {
      // Update existing user to be super admin
      existingUser.isSuperAdmin = true;
      existingUser.isAdmin = true;
      existingUser.role = superAdminRole._id;
      await existingUser.save();
      console.log('✅ Updated existing user to super admin:', existingUser.email);
    } else {
      // Create new super admin user
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('SuperAdmin123!', saltRounds); // Default password

      const superAdminUser = new User({
        email: 'shindeaniket085@gmail.com',
        password: hashedPassword,
        username: 'shindeaniket',
        isAdmin: true,
        isSuperAdmin: true,
        role: superAdminRole._id,
        status: 'active',
        emailVerified: new Date()
      });

      await superAdminUser.save();
      console.log('✅ Created super admin user:', superAdminUser.email);
      console.log('🔑 Default password: SuperAdmin123!');
      console.log('⚠️  Please change this password after first login!');
    }

    console.log('🎉 Super admin setup completed successfully!');
    console.log('📧 Email: shindeaniket085@gmail.com');
    console.log('👑 Status: Super Administrator');
    console.log('🔐 Access: Full system control');

  } catch (error) {
    console.error('❌ Error setting up super admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the setup
setupSuperAdmin();
