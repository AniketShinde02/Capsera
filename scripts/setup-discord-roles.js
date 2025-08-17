#!/usr/bin/env node

/**
 * Setup Discord-Like Role System
 * This script initializes the Discord-style role hierarchy in Capsera
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/capsera';

const DISCORD_ROLES = [
  {
    name: 'owner',
    displayName: 'Server Owner',
    description: 'Full system control - can do everything including managing other owners',
    color: '#FF6B6B',
    priority: 100,
    isSystem: true,
    isActive: true,
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
    ]
  },
  {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full administrative access - can manage users, content, and system settings',
    color: '#4ECDC4',
    priority: 90,
    isSystem: true,
    isActive: true,
    permissions: [
      { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'roles', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'posts', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'captions', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'data-recovery', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'archived-profiles', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'dashboard', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'system', actions: ['read', 'update'] },
      { resource: 'analytics', actions: ['create', 'read', 'update', 'delete', 'manage'] }
    ]
  },
  {
    name: 'moderator',
    displayName: 'Moderator',
    description: 'Content moderator - can manage posts, warn users, and moderate content',
    color: '#45B7D1',
    priority: 80,
    isSystem: true,
    isActive: true,
    permissions: [
      { resource: 'users', actions: ['read', 'update'] },
      { resource: 'posts', actions: ['read', 'update', 'delete'] },
      { resource: 'captions', actions: ['read', 'update', 'delete'] },
      { resource: 'data-recovery', actions: ['read'] },
      { resource: 'archived-profiles', actions: ['read'] },
      { resource: 'dashboard', actions: ['read'] },
      { resource: 'analytics', actions: ['read'] }
    ]
  },
  {
    name: 'editor',
    displayName: 'Content Editor',
    description: 'Can edit and manage content, but limited user management',
    color: '#96CEB4',
    priority: 70,
    isSystem: true,
    isActive: true,
    permissions: [
      { resource: 'posts', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'captions', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'dashboard', actions: ['read'] },
      { resource: 'analytics', actions: ['read'] }
    ]
  },
  {
    name: 'premium',
    displayName: 'Premium User',
    description: 'Enhanced features and access to premium content',
    color: '#FFEAA7',
    priority: 60,
    isSystem: true,
    isActive: true,
    permissions: [
      { resource: 'captions', actions: ['create', 'read'] },
      { resource: 'posts', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'analytics', actions: ['read'] }
    ]
  },
  {
    name: 'user',
    displayName: 'Standard User',
    description: 'Basic user with standard permissions',
    color: '#DDA0DD',
    priority: 50,
    isSystem: true,
    isActive: true,
    permissions: [
      { resource: 'captions', actions: ['create', 'read'] },
      { resource: 'posts', actions: ['create', 'read', 'update', 'delete'] }
    ]
  },
  {
    name: 'viewer',
    displayName: 'Viewer',
    description: 'Read-only access to public content',
    color: '#98D8C8',
    priority: 40,
    isSystem: true,
    isActive: true,
    permissions: [
      { resource: 'posts', actions: ['read'] },
      { resource: 'captions', actions: ['read'] }
    ]
  },
  {
    name: 'guest',
    displayName: 'Guest',
    description: 'Limited access for unregistered users',
    color: '#F7DC6F',
    priority: 30,
    isSystem: true,
    isActive: true,
    permissions: [
      { resource: 'posts', actions: ['read'] }
    ]
  }
];

async function setupDiscordRoles() {
  console.log('🎮 Setting up Discord-like role system...\n');
  
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const rolesCollection = db.collection('roles');
    
    // Clear existing system roles (but keep custom ones)
    console.log('🧹 Cleaning up existing system roles...');
    await rolesCollection.deleteMany({ isSystem: true });
    console.log('✅ Existing system roles removed');
    
    // Insert new Discord-style roles
    console.log('📝 Creating Discord-style roles...');
    
    for (const role of DISCORD_ROLES) {
      const roleData = {
        ...role,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await rolesCollection.insertOne(roleData);
      console.log(`  ✅ Created role: ${role.displayName} (${role.name}) - Priority: ${role.priority}`);
    }
    
    // Verify roles were created
    const totalRoles = await rolesCollection.countDocuments();
    const systemRoles = await rolesCollection.countDocuments({ isSystem: true });
    
    console.log(`\n🎉 Discord role system setup complete!`);
    console.log(`📊 Total roles: ${totalRoles}`);
    console.log(`🔧 System roles: ${systemRoles}`);
    
    // Show role hierarchy
    console.log('\n🏗️  Role Hierarchy (from highest to lowest priority):');
    DISCORD_ROLES.sort((a, b) => b.priority - a.priority).forEach(role => {
      console.log(`  ${role.priority.toString().padStart(3)} | ${role.displayName.padEnd(15)} | ${role.name.padEnd(10)} | ${role.description}`);
    });
    
    console.log('\n💡 Role Management Rules:');
    console.log('  • Owners can manage everyone');
    console.log('  • Admins can manage everyone except owners');
    console.log('  • Moderators can manage users and below');
    console.log('  • Editors can manage content but not users');
    console.log('  • Higher priority roles can manage lower priority ones');
    
  } catch (error) {
    console.error('❌ Error setting up Discord roles:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 MongoDB connection closed');
    }
  }
}

// Run the setup
if (require.main === module) {
  setupDiscordRoles()
    .then(() => {
      console.log('\n✨ Discord role system is ready!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupDiscordRoles, DISCORD_ROLES };
