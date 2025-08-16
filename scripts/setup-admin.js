#!/usr/bin/env node

/**
 * Admin System Setup Script
 * Run this script to initialize the admin system and create the first admin user
 * 
 * Usage:
 * node scripts/setup-admin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv/config');

// Configuration - update these values
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/captioncraft';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'shindeaniket085@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Aiket@2601';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'introvert_ani_26';

async function setupAdminSystem() {
  try {
    console.log('🚀 Starting Admin System Setup...\n');
    
    // Connect to MongoDB using Mongoose (same as your website)
    console.log('🔗 Connecting to MongoDB using Mongoose...');
    console.log('🔍 Using URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Step 1: Create default roles
    console.log('🎭 Creating default roles...');
    
    // Import Mongoose models
    const Role = require('../src/models/Role');
    const User = require('../src/models/User');
    
    const defaultRoles = [
      {
        name: 'super-admin',
        displayName: 'Super Administrator',
        description: 'Full system access with all permissions',
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
          { resource: 'analytics', actions: ['create', 'read', 'update', 'delete', 'manage'] }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'admin',
        displayName: 'Administrator',
        description: 'System administration with most permissions',
        isSystem: true,
        permissions: [
          { resource: 'users', actions: ['read', 'update', 'manage'] },
          { resource: 'roles', actions: ['read'] },
          { resource: 'posts', actions: ['read', 'update', 'delete'] },
          { resource: 'captions', actions: ['read', 'update', 'delete'] },
          { resource: 'data-recovery', actions: ['read', 'update', 'manage'] },
          { resource: 'archived-profiles', actions: ['read', 'update'] },
          { resource: 'dashboard', actions: ['read'] },
          { resource: 'system', actions: ['read'] },
          { resource: 'analytics', actions: ['read'] }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'moderator',
        displayName: 'Moderator',
        description: 'Content moderation and user management',
        isSystem: true,
        permissions: [
          { resource: 'users', actions: ['read', 'update'] },
          { resource: 'posts', actions: ['read', 'update', 'delete'] },
          { resource: 'captions', actions: ['read', 'update', 'delete'] },
          { resource: 'data-recovery', actions: ['read'] },
          { resource: 'archived-profiles', actions: ['read'] },
          { resource: 'dashboard', actions: ['read'] }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'user',
        displayName: 'Regular User',
        description: 'Standard user with basic permissions',
        isSystem: true,
        permissions: [
          { resource: 'posts', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'captions', actions: ['create', 'read', 'update', 'delete'] }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    for (const roleData of defaultRoles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        const role = new Role(roleData);
        await role.save();
        console.log(`✅ Created role: ${role.displayName}`);
      } else {
        console.log(`ℹ️ Role already exists: ${existingRole.displayName}`);
      }
    }
    console.log('');
    
    // Step 2: Create admin user
    console.log('👑 Creating admin user...');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Username: ${existingAdmin.username || 'N/A'}`);
      console.log(`   Created: ${existingAdmin.createdAt}`);
    } else {
      // Get super-admin role
      const superAdminRole = await Role.findOne({ name: 'super-admin' });
      if (!superAdminRole) {
        throw new Error('Super admin role not found');
      }
      
      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);
      
      // Create admin user
      const adminUser = new User({
        email: ADMIN_EMAIL,
        password: hashedPassword,
        username: ADMIN_USERNAME,
        isAdmin: true,
        role: superAdminRole._id,
        status: 'active',
        emailVerified: new Date(),
        createdAt: new Date(),
        lastLoginAt: new Date()
      });
      
      await adminUser.save();
      console.log('✅ Admin user created successfully!');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Username: ${ADMIN_USERNAME}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
      console.log(`   User ID: ${adminUser._id}`);
    }
    
    console.log('\n🎉 Admin system setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Login to the admin panel with the credentials above');
    console.log('2. Navigate to /admin to access the dashboard');
    console.log('3. Manage users, roles, and system settings');
    
  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('\n🔌 MongoDB connection closed');
    }
  }
}

// Run the setup
if (require.main === module) {
  setupAdminSystem();
}

module.exports = { setupAdminSystem };
