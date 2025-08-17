/**
 * Permission Checker Utility
 * Integrates with Discord-like role system to check user permissions
 */

import { getRoleByName, canManageRole, hasPermission } from './discord-roles';

export interface UserWithRole {
  id: string;
  email: string;
  role?: {
    name: string;
    displayName: string;
    priority: number;
  };
}

/**
 * Check if user has permission for a specific action on a resource
 */
export async function checkPermission(
  user: UserWithRole,
  resource: string,
  action: string
): Promise<boolean> {
  if (!user.role) return false;
  
  return hasPermission(user.role.name, resource, action);
}

/**
 * Check if user can manage another user based on role hierarchy
 */
export async function canManageUser(
  manager: UserWithRole,
  target: UserWithRole
): Promise<boolean> {
  if (!manager.role || !target.role) return false;
  
  return canManageRole(manager.role.name, target.role.name);
}

/**
 * Check if user can access admin dashboard
 */
export async function canAccessDashboard(user: UserWithRole): Promise<boolean> {
  return checkPermission(user, 'dashboard', 'read');
}

/**
 * Check if user can manage roles
 */
export async function canManageRoles(user: UserWithRole): Promise<boolean> {
  return checkPermission(user, 'roles', 'manage');
}

/**
 * Check if user can manage users
 */
export async function canManageUsers(user: UserWithRole): Promise<boolean> {
  return checkPermission(user, 'users', 'manage');
}

/**
 * Check if user can moderate content
 */
export async function canModerateContent(user: UserWithRole): Promise<boolean> {
  return checkPermission(user, 'posts', 'delete') || 
         checkPermission(user, 'captions', 'delete');
}

/**
 * Check if user can view analytics
 */
export async function canViewAnalytics(user: UserWithRole): Promise<boolean> {
  return checkPermission(user, 'analytics', 'read');
}

/**
 * Check if user can access data recovery
 */
export async function canAccessDataRecovery(user: UserWithRole): Promise<boolean> {
  return checkPermission(user, 'data-recovery', 'read');
}

/**
 * Check if user can manage archived profiles
 */
export async function canManageArchivedProfiles(user: UserWithRole): Promise<boolean> {
  return checkPermission(user, 'archived-profiles', 'read');
}

/**
 * Get user's role priority for comparison
 */
export function getUserRolePriority(user: UserWithRole): number {
  return user.role?.priority || 0;
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: UserWithRole, roleName: string): boolean {
  return user.role?.name === roleName;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: UserWithRole, roleNames: string[]): boolean {
  return roleNames.includes(user.role?.name || '');
}

/**
 * Check if user has all of the specified roles
 */
export function hasAllRoles(user: UserWithRole, roleNames: string[]): boolean {
  return roleNames.every(roleName => hasRole(user, roleName));
}

/**
 * Get user's effective permissions for display
 */
export function getUserPermissions(user: UserWithRole): Array<{
  resource: string;
  actions: string[];
}> {
  if (!user.role) return [];
  
  const role = getRoleByName(user.role.name);
  return role ? role.permissions : [];
}

/**
 * Check if user can perform action on specific content
 */
export async function canPerformActionOnContent(
  user: UserWithRole,
  action: string,
  contentType: 'post' | 'caption' | 'user' | 'role',
  contentOwnerId?: string
): Promise<boolean> {
  // Map content types to resources
  const resourceMap = {
    post: 'posts',
    caption: 'captions',
    user: 'users',
    role: 'roles'
  };
  
  const resource = resourceMap[contentType];
  if (!resource) return false;
  
  // Check basic permission
  const hasBasicPermission = await checkPermission(user, resource, action);
  if (!hasBasicPermission) return false;
  
  // If it's a user management action, check role hierarchy
  if (contentType === 'user' && contentOwnerId && contentOwnerId !== user.id) {
    // This would need the target user's role info
    // For now, just check if they can manage users
    return await checkPermission(user, 'users', 'manage');
  }
  
  return true;
}

/**
 * Get role-based access control for UI components
 */
export function getRoleBasedAccess(user: UserWithRole) {
  return {
    canViewDashboard: canAccessDashboard(user),
    canManageRoles: canManageRoles(user),
    canManageUsers: canManageUsers(user),
    canModerateContent: canModerateContent(user),
    canViewAnalytics: canViewAnalytics(user),
    canAccessDataRecovery: canAccessDataRecovery(user),
    canManageArchivedProfiles: canManageArchivedProfiles(user),
    rolePriority: getUserRolePriority(user),
    roleName: user.role?.name || 'guest',
    roleDisplayName: user.role?.displayName || 'Guest'
  };
}
