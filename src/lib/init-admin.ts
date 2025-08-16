import dbConnect from './db';
import Role from '@/models/Role';
import User from '@/models/User';
import AdminUser from '@/models/AdminUser';
import bcrypt from 'bcryptjs';

// Default roles configuration
const DEFAULT_ROLES = [
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
    ]
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
    ]
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
    ]
  },
  {
    name: 'user',
    displayName: 'Regular User',
    description: 'Standard user with basic permissions',
    isSystem: true,
    permissions: [
      { resource: 'posts', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'captions', actions: ['create', 'read', 'update', 'delete'] }
    ]
  }
];

export async function initializeAdminSystem() {
  try {
    await dbConnect();
    console.log('🔗 Connected to database');

    // Create default roles
    console.log('🎭 Creating default roles...');
    for (const roleData of DEFAULT_ROLES) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        const role = new Role(roleData);
        await role.save();
        console.log(`✅ Created role: ${roleData.displayName}`);
      } else {
        console.log(`ℹ️ Role already exists: ${roleData.displayName}`);
      }
    }

    // Check if admin user exists
    const adminExists = await User.findOne({ isAdmin: true });
    if (adminExists) {
      console.log('ℹ️ Admin user already exists');
      return { success: true, message: 'Admin system already initialized' };
    }

    console.log('👑 Admin system initialized successfully');
    return { success: true, message: 'Admin system initialized' };

  } catch (error) {
    console.error('❌ Error initializing admin system:', error);
    return { success: false, message: 'Failed to initialize admin system', error };
  }
}

export async function createAdminUser(email: string, password: string, username?: string) {
  try {
    await dbConnect();
    console.log('🔗 Connected to database');

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, message: 'User with this email already exists' };
    }

    // Get super-admin role
    const superAdminRole = await Role.findOne({ name: 'super-admin' });
    if (!superAdminRole) {
      return { success: false, message: 'Super admin role not found. Run initializeAdminSystem first.' };
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const adminUser = new User({
      email,
      password: hashedPassword,
      username: username || email.split('@')[0],
      isAdmin: true,
      role: superAdminRole._id,
      status: 'active',
      emailVerified: new Date()
    });

    await adminUser.save();
    console.log(`✅ Admin user created: ${email}`);

    return { 
      success: true, 
      message: 'Admin user created successfully',
      userId: adminUser._id,
      email: adminUser.email
    };

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    return { success: false, message: 'Failed to create admin user', error };
  }
}

// Function to check if user has permission
export async function checkUserPermission(userId: string, resource: string, action: string): Promise<boolean> {
  try {
    // First check AdminUser collection
    let user = await AdminUser.findById(userId).populate('role');
    
    // If not found in AdminUser, check User collection
    if (!user) {
      user = await User.findById(userId).populate('role');
    }
    
    if (!user) return false;

    // Super admin has all permissions
    if (user.isSuperAdmin) return true;

    if (!user.role) return false;

    const role = user.role as any;
    const permission = role.permissions.find((p: any) => p.resource === resource);
    
    if (!permission) return false;
    
    return permission.actions.includes(action) || permission.actions.includes('manage');
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
}

// Function to get user permissions
export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    // First check AdminUser collection
    let user = await AdminUser.findById(userId).populate('role');
    
    // If not found in AdminUser, check User collection
    if (!user) {
      user = await User.findById(userId).populate('role');
    }
    
    if (!user) return [];

    // Super admin has all permissions
    if (user.isSuperAdmin) {
      return [
        'users:manage', 'roles:manage', 'posts:manage', 'captions:manage',
        'data-recovery:manage', 'archived-profiles:manage', 'dashboard:manage',
        'system:manage', 'analytics:manage', 'admin-management:manage'
      ];
    }

    if (!user.role) return [];

    const role = user.role as any;
    return role.permissions.flatMap((p: any) => 
      p.actions.map((action: string) => `${p.resource}:${action}`)
    );
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

// Function to check if user is super admin
export async function isSuperAdmin(userId: string): Promise<boolean> {
  try {
    // First check AdminUser collection
    let user = await AdminUser.findById(userId);
    
    // If not found in AdminUser, check User collection
    if (!user) {
      user = await User.findById(userId);
    }
    
    return user?.isSuperAdmin || false;
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
}

// Function to check if user can manage admins
export async function canManageAdmins(userId: string): Promise<boolean> {
  try {
    // First check AdminUser collection
    let user = await AdminUser.findById(userId);
    
    // If not found in AdminUser, check User collection
    if (!user) {
      user = await User.findById(userId);
    }
    
    if (!user) return false;

    // Super admin can always manage admins
    if (user.isSuperAdmin) return true;

    // Admin users can manage admins
    if (user.isAdmin) return true;

    // Check if user has admin-management permission
    return await checkUserPermission(userId, 'admin-management', 'manage');
  } catch (error) {
    console.error('Error checking admin management permission:', error);
    return false;
  }
}
