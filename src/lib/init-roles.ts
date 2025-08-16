import dbConnect from './db';
import Role from '@/models/Role';

export async function initializeDefaultRoles() {
  try {
    await dbConnect();

    // Define default system roles with correct permission format
    const defaultRoles = [
      {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Full system administrator with all permissions',
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
        isSystem: true,
        isActive: true,
        createdAt: new Date()
      },
      {
        name: 'moderator',
        displayName: 'Moderator',
        description: 'Content moderator with limited administrative permissions',
        permissions: [
          { resource: 'posts', actions: ['read', 'update', 'delete'] },
          { resource: 'users', actions: ['read', 'update'] },
          { resource: 'data-recovery', actions: ['read'] },
          { resource: 'dashboard', actions: ['read'] },
          { resource: 'analytics', actions: ['read'] }
        ],
        isSystem: true,
        isActive: true,
        createdAt: new Date()
      },
      {
        name: 'user',
        displayName: 'Standard User',
        description: 'Standard user with basic permissions',
        permissions: [
          { resource: 'captions', actions: ['create', 'read'] },
          { resource: 'posts', actions: ['create', 'read', 'update', 'delete'] }
        ],
        isSystem: true,
        isActive: true,
        createdAt: new Date()
      },
      {
        name: 'premium',
        displayName: 'Premium User',
        description: 'Premium user with enhanced features',
        permissions: [
          { resource: 'captions', actions: ['create', 'read'] },
          { resource: 'posts', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'analytics', actions: ['read'] }
        ],
        isSystem: true,
        isActive: true,
        createdAt: new Date()
      }
    ];

    // Check and create default roles
    for (const roleData of defaultRoles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      
      if (!existingRole) {
        console.log(`Creating default role: ${roleData.name}`);
        await Role.create(roleData);
      } else {
        // Update existing role permissions if needed (but preserve isSystem flag)
        if (existingRole.isSystem) {
          const needsUpdate = JSON.stringify(existingRole.permissions.sort()) !== 
                             JSON.stringify(roleData.permissions.sort());
          
          if (needsUpdate) {
            console.log(`Updating permissions for system role: ${roleData.name}`);
            await Role.findByIdAndUpdate(existingRole._id, {
              permissions: roleData.permissions,
              description: roleData.description,
              displayName: roleData.displayName
            });
          }
        }
      }
    }

    console.log('✅ Default roles initialized successfully');
    
  } catch (error) {
    console.error('❌ Error initializing default roles:', error);
  }
}

// Function to get role by name
export async function getRoleByName(roleName: string) {
  try {
    await dbConnect();
    return await Role.findOne({ name: roleName });
  } catch (error) {
    console.error(`Error getting role ${roleName}:`, error);
    return null;
  }
}

// Function to check if user has permission
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  try {
    await dbConnect();
    
    // TODO: Implement proper user-role relationship
    // For now, this is a placeholder that will need to be updated
    // when we implement the User model with role assignments
    
    // This should check the user's assigned role and verify permissions
    return false;
  } catch (error) {
    console.error(`Error checking permission ${permission} for user ${userId}:`, error);
    return false;
  }
}
