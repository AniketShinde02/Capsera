/**
 * Discord-Like Role System for Capsera
 * Predefined roles with specific permissions for different user types
 */

export interface DiscordRole {
  name: string;
  displayName: string;
  description: string;
  color: string;
  permissions: Array<{
    resource: string;
    actions: string[];
  }>;
  isSystem: boolean;
  isActive: boolean;
  priority: number; // Higher number = higher priority
}

export const DISCORD_ROLES: DiscordRole[] = [
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

/**
 * Get role by name
 */
export function getRoleByName(name: string): DiscordRole | undefined {
  return DISCORD_ROLES.find(role => role.name === name);
}

/**
 * Get role by priority
 */
export function getRoleByPriority(priority: number): DiscordRole | undefined {
  return DISCORD_ROLES.find(role => role.priority === priority);
}

/**
 * Get all roles above a certain priority
 */
export function getRolesAbovePriority(priority: number): DiscordRole[] {
  return DISCORD_ROLES.filter(role => role.priority > priority);
}

/**
 * Check if a role has permission for a specific action
 */
export function hasPermission(roleName: string, resource: string, action: string): boolean {
  const role = getRoleByName(roleName);
  if (!role) return false;
  
  const permission = role.permissions.find(p => p.resource === resource);
  if (!permission) return false;
  
  return permission.actions.includes(action) || permission.actions.includes('manage');
}

/**
 * Get role hierarchy (who can manage whom)
 */
export function canManageRole(managerRole: string, targetRole: string): boolean {
  const manager = getRoleByName(managerRole);
  const target = getRoleByName(targetRole);
  
  if (!manager || !target) return false;
  
  // Owners can manage everyone
  if (manager.name === 'owner') return true;
  
  // Admins can manage everyone except owners
  if (manager.name === 'admin' && target.name !== 'owner') return true;
  
  // Moderators can manage users and below
  if (manager.name === 'moderator' && target.priority < 80) return true;
  
  // Editors can manage content but not users
  if (manager.name === 'editor' && target.priority < 70) return true;
  
  return false;
}

/**
 * Get available actions for a role on a specific resource
 */
export function getAvailableActions(roleName: string, resource: string): string[] {
  const role = getRoleByName(roleName);
  if (!role) return [];
  
  const permission = role.permissions.find(p => p.resource === resource);
  return permission ? permission.actions : [];
}

/**
 * Get role color for UI display
 */
export function getRoleColor(roleName: string): string {
  const role = getRoleByName(roleName);
  return role ? role.color : '#6B7280';
}

/**
 * Get role priority for sorting
 */
export function getRolePriority(roleName: string): number {
  const role = getRoleByName(roleName);
  return role ? role.priority : 0;
}
