'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Role {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: Array<{
    resource: string;
    actions: string[];
  }>;
  userCount: number;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
}

interface CreateRoleForm {
  name: string;
  displayName: string;
  description: string;
  permissions: Array<{
    resource: string;
    actions: string[];
  }>;
}

// Define available resources and actions
const AVAILABLE_RESOURCES = [
  {
    key: 'users',
    label: 'User Management',
    description: 'Manage user accounts, profiles, and settings'
  },
  {
    key: 'roles',
    label: 'Role Management',
    description: 'Create, edit, and manage user roles'
  },
  {
    key: 'posts',
    label: 'Posts & Content',
    description: 'Manage user posts and content'
  },
  {
    key: 'captions',
    label: 'Caption Generation',
    description: 'Manage caption generation features'
  },
  {
    key: 'data-recovery',
    label: 'Data Recovery',
    description: 'Access data recovery and restoration tools'
  },
  {
    key: 'archived-profiles',
    label: 'Archived Profiles',
    description: 'Manage archived and deleted user profiles'
  },
  {
    key: 'dashboard',
    label: 'Admin Dashboard',
    description: 'Access administrative dashboard and analytics'
  },
  {
    key: 'system',
    label: 'System Settings',
    description: 'Configure system-wide settings and preferences'
  },
  {
    key: 'analytics',
    label: 'Analytics & Reports',
    description: 'View system analytics and generate reports'
  }
];

const AVAILABLE_ACTIONS = [
  { key: 'create', label: 'Create' },
  { key: 'read', label: 'Read' },
  { key: 'update', label: 'Update' },
  { key: 'delete', label: 'Delete' },
  { key: 'manage', label: 'Manage' }
];

export default function RolesPage() {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set());
  const [createForm, setCreateForm] = useState<CreateRoleForm>({
    name: '',
    displayName: '',
    description: '',
    permissions: []
  });

  // Fetch REAL data from database
  const fetchRoles = async () => {
    try {
      setLoading(true);
      
      // Real API call to get roles from database
      const response = await fetch('/api/admin/roles');
      
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles || []);
      } else {
        console.error('Failed to fetch roles:', response.status);
        setRoles([]);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Initialize permissions for create form
  useEffect(() => {
    if (showCreateModal) {
      const initialPermissions = AVAILABLE_RESOURCES.map(resource => ({
        resource: resource.key,
        actions: []
      }));
      setCreateForm(prev => ({ ...prev, permissions: initialPermissions }));
    }
  }, [showCreateModal]);

  const toggleResourceExpansion = (resourceKey: string) => {
    const newExpanded = new Set(expandedResources);
    if (newExpanded.has(resourceKey)) {
      newExpanded.delete(resourceKey);
    } else {
      newExpanded.add(resourceKey);
    }
    setExpandedResources(newExpanded);
  };

  const handlePermissionChange = (resourceKey: string, actionKey: string, checked: boolean) => {
    setCreateForm(prev => {
      const newPermissions = prev.permissions.map(permission => {
        if (permission.resource === resourceKey) {
          const newActions = checked
            ? [...permission.actions, actionKey]
            : permission.actions.filter(action => action !== actionKey);
          return { ...permission, actions: newActions };
        }
        return permission;
      });
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleSelectAllResource = (resourceKey: string) => {
    setCreateForm(prev => {
      const newPermissions = prev.permissions.map(permission => {
        if (permission.resource === resourceKey) {
          return { ...permission, actions: AVAILABLE_ACTIONS.map(action => action.key) };
        }
        return permission;
      });
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleClearResource = (resourceKey: string) => {
    setCreateForm(prev => {
      const newPermissions = prev.permissions.map(permission => {
        if (permission.resource === resourceKey) {
          return { ...permission, actions: [] };
        }
        return permission;
      });
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleCreateRole = async () => {
    // Validate form
    if (!createForm.name.trim() || !createForm.displayName.trim()) {
      toast({
        title: "Validation Error",
        description: "Role name and display name are required",
        variant: "destructive"
      });
      return;
    }

    // Validate role name format (lowercase, no spaces, alphanumeric and underscores only)
    const roleNameRegex = /^[a-z0-9_]+$/;
    if (!roleNameRegex.test(createForm.name.trim())) {
      toast({
        title: "Validation Error",
        description: "Role name must be lowercase with only letters, numbers, and underscores",
        variant: "destructive"
      });
      return;
    }

    // Check if role name already exists
    const existingRole = roles.find(role => role.name === createForm.name.trim());
    if (existingRole) {
      toast({
        title: "Validation Error",
        description: "A role with this name already exists",
        variant: "destructive"
      });
      return;
    }

    // Check if at least one permission is selected
    const hasPermissions = createForm.permissions.some(p => p.actions.length > 0);
    if (!hasPermissions) {
      toast({
        title: "Validation Error",
        description: "Please select at least one permission",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createForm)
      });

      if (response.ok) {
        const data = await response.json();
        setShowCreateModal(false);
        setCreateForm({ name: '', displayName: '', description: '', permissions: [] });
        setExpandedResources(new Set());
        toast({
          title: "Success",
          description: "Role created successfully",
        });
        // Refresh the roles list to show the new role
        fetchRoles();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: `Failed to create role: ${errorData.error}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating role:', error);
      toast({
        title: "Error",
        description: "Error creating role",
        variant: "destructive"
      });
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setShowEditModal(true);
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;

    try {
      const response = await fetch(`/api/admin/roles/${editingRole._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          displayName: editingRole.displayName,
          description: editingRole.description,
          permissions: editingRole.permissions,
          isActive: editingRole.isActive
        })
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingRole(null);
        toast({
          title: "Success",
          description: "Role updated successfully",
        });
        // Refresh the roles list to show updated data
        fetchRoles();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: `Failed to update role: ${errorData.error}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Error updating role",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.isSystem) {
      toast({
        title: "Cannot Delete",
        description: "System roles cannot be deleted",
        variant: "destructive"
      });
      return;
    }

    // Use a more user-friendly confirmation approach
    if (window.confirm(`Are you sure you want to delete the role "${role.displayName}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/admin/roles/${role._id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          toast({
            title: "Success",
            description: "Role deleted successfully",
          });
          // Refresh the roles list to show updated data
          fetchRoles();
        } else {
          const errorData = await response.json();
          toast({
            title: "Error",
            description: `Failed to delete role: ${errorData.error}`,
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error deleting role:', error);
        toast({
          title: "Error",
          description: "Error deleting role",
          variant: "destructive"
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading roles...</p>
        </div>
      </div>
    );
  }

  const totalRoles = roles.length;
  const totalUsers = roles.reduce((sum, role) => sum + role.userCount, 0);
  const activeRoles = roles.filter(role => role.isActive).length;
  const systemRoles = roles.filter(role => role.isSystem).length;
  const totalPermissions = roles.reduce((sum, role) => {
    return sum + role.permissions.reduce((permSum, perm) => permSum + (perm.actions?.length || 0), 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-muted-foreground">Create and manage user roles and permissions</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setLoading(true);
              fetchRoles();
            }}
            disabled={loading}
          >
            <Shield className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Roles</p>
                <p className="text-2xl font-bold">{totalRoles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Roles</p>
                <p className="text-2xl font-bold">{activeRoles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Roles</p>
                <p className="text-2xl font-bold">{systemRoles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Permissions</p>
                <p className="text-2xl font-bold">{totalPermissions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Roles ({roles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium">Description</th>
                  <th className="text-left py-3 px-4 font-medium">Permissions</th>
                  <th className="text-left py-3 px-4 font-medium">Users</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role._id} className="border-b border-border/50">
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{role.displayName}</p>
                          {role.isSystem && (
                            <Badge variant="secondary" className="text-xs">System</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{role.name}</p>
                      </div>
                    </td>
                    
                    <td className="py-3 px-4">
                      <p className="text-sm text-muted-foreground max-w-xs">
                        {role.description}
                      </p>
                    </td>
                    
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {role.permissions.length === 0 ? (
                          <span className="text-sm text-muted-foreground">No permissions</span>
                        ) : (
                          <div className="space-y-2">
                            {role.permissions.map((permission, index) => {
                              // Defensive programming: ensure permission has the expected structure
                              if (!permission || typeof permission !== 'object') {
                                return (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    Invalid permission
                                  </Badge>
                                );
                              }
                              
                              const resource = permission.resource || 'unknown';
                              const actions = permission.actions || [];
                              
                              if (!Array.isArray(actions) || actions.length === 0) {
                                return (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {resource}: No actions
                                  </Badge>
                                );
                              }
                              
                              const resourceInfo = AVAILABLE_RESOURCES.find(r => r.key === resource);
                              return (
                                <div key={index} className="space-y-1">
                                  <div className="text-xs font-medium text-muted-foreground">
                                    {resourceInfo?.label || resource}
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {actions.map(action => (
                                      <Badge key={action} variant="secondary" className="text-xs">
                                        {AVAILABLE_ACTIONS.find(a => a.key === action)?.label || action}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{role.userCount}</span>
                      </div>
                    </td>
                    
                    <td className="py-3 px-4">
                      <Badge variant={role.isActive ? 'default' : 'secondary'}>
                        {role.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditRole(role)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!role.isSystem && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive"
                            onClick={() => handleDeleteRole(role)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Role Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role-name" className="text-sm font-medium">Role Name</Label>
                <Input
                  id="role-name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., moderator"
                  className="mt-1 h-9"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lowercase, no spaces (e.g., content_moderator)
                </p>
              </div>
              <div>
                <Label htmlFor="role-display-name" className="text-sm font-medium">Display Name</Label>
                <Input
                  id="role-display-name"
                  value={createForm.displayName}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="e.g., Content Moderator"
                  className="mt-1 h-9"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Human-readable name for the role
                </p>
              </div>
            </div>
            <div>
              <Label htmlFor="role-description" className="text-sm font-medium">Description</Label>
              <Input
                id="role-description"
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of what this role can do..."
                className="mt-1 h-9"
              />
            </div>

            {/* Permissions Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Permissions</h3>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const allPermissions = AVAILABLE_RESOURCES.map(resource => ({
                        resource: resource.key,
                        actions: AVAILABLE_ACTIONS.map(action => action.key)
                      }));
                      setCreateForm(prev => ({ ...prev, permissions: allPermissions }));
                    }}
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const emptyPermissions = AVAILABLE_RESOURCES.map(resource => ({
                        resource: resource.key,
                        actions: []
                      }));
                      setCreateForm(prev => ({ ...prev, permissions: emptyPermissions }));
                    }}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
              {AVAILABLE_RESOURCES.map(resource => (
                <div key={resource.key} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between py-2 cursor-pointer" onClick={() => toggleResourceExpansion(resource.key)}>
                    <div className="flex items-center space-x-2">
                      <ChevronDown className={`h-4 w-4 transition-transform ${expandedResources.has(resource.key) ? 'rotate-180' : ''}`} />
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{resource.label}</span>
                    </div>
                    <ChevronRight className={`h-4 w-4 text-muted-foreground ${expandedResources.has(resource.key) ? 'rotate-90' : ''}`} />
                  </div>
                  {expandedResources.has(resource.key) && (
                    <div className="pl-4 space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`select-all-${resource.key}`} className="text-xs font-medium">
                          Select All
                        </Label>
                        <Checkbox
                          id={`select-all-${resource.key}`}
                          checked={createForm.permissions.find(p => p.resource === resource.key)?.actions.length === AVAILABLE_ACTIONS.length}
                          onCheckedChange={(checked) => {
                            if (checked === true) {
                              handleSelectAllResource(resource.key);
                            }
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`clear-${resource.key}`} className="text-xs font-medium">
                          Clear All
                        </Label>
                        <Checkbox
                          id={`clear-${resource.key}`}
                          checked={createForm.permissions.find(p => p.resource === resource.key)?.actions.length === 0}
                          onCheckedChange={(checked) => {
                            if (checked === true) {
                              handleClearResource(resource.key);
                            }
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {AVAILABLE_ACTIONS.map(action => (
                          <div key={action.key} className="flex items-center">
                            <Checkbox
                              id={`${resource.key}-${action.key}`}
                              checked={createForm.permissions.find(p => p.resource === resource.key)?.actions.includes(action.key)}
                              onCheckedChange={(checked) => handlePermissionChange(resource.key, action.key, checked === true)}
                            />
                            <Label htmlFor={`${resource.key}-${action.key}`} className="ml-2 text-xs">
                              {action.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Permissions Summary */}
            <div className="border-t pt-3">
              <h4 className="text-sm font-medium mb-2">Selected Permissions Summary</h4>
              <div className="bg-muted/50 rounded-lg p-3 max-h-32 overflow-y-auto">
                {(() => {
                  const selectedPermissions = createForm.permissions.filter(p => p.actions.length > 0);
                  if (selectedPermissions.length === 0) {
                    return <span className="text-sm text-muted-foreground">No permissions selected</span>;
                  }
                  
                  return (
                    <div className="space-y-2">
                      {selectedPermissions.map(permission => {
                        const resource = AVAILABLE_RESOURCES.find(r => r.key === permission.resource);
                        return (
                          <div key={permission.resource} className="flex items-center justify-between">
                            <span className="text-xs font-medium">{resource?.label || permission.resource}</span>
                            <div className="flex gap-1">
                              {permission.actions.map(action => (
                                <Badge key={action} variant="secondary" className="text-xs">
                                  {AVAILABLE_ACTIONS.find(a => a.key === action)?.label || action}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRole}>
              Create Role
            </Button>
          </div>
        </DialogContent>
      </Dialog>

             {/* Edit Role Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role: {editingRole?.displayName}</DialogTitle>
          </DialogHeader>
          {editingRole && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-display-name" className="text-sm font-medium">Display Name</Label>
                <Input
                  id="edit-display-name"
                  value={editingRole.displayName}
                  onChange={(e) => setEditingRole(prev => prev ? { ...prev, displayName: e.target.value } : null)}
                  className="mt-1 h-9"
                />
              </div>
              <div>
                <Label htmlFor="edit-description" className="text-sm font-medium">Description</Label>
                <Input
                  id="edit-description"
                  value={editingRole.description}
                  onChange={(e) => setEditingRole(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="mt-1 h-9"
                />
              </div>
              
              {/* Permissions Display (Read-only for system roles) */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold">Permissions</h3>
                {editingRole.isSystem ? (
                  <div className="text-sm text-muted-foreground">
                    System roles have predefined permissions that cannot be modified.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {AVAILABLE_RESOURCES.map(resource => {
                      const rolePermission = editingRole.permissions.find(p => p.resource === resource.key);
                      const hasActions = rolePermission && rolePermission.actions.length > 0;
                      
                      return (
                        <div key={resource.key} className="border rounded-lg p-2">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm font-medium">{resource.label}</span>
                            </div>
                            {hasActions && (
                              <Badge variant="outline" className="text-xs">
                                {rolePermission.actions.length} permissions
                              </Badge>
                            )}
                          </div>
                          {hasActions ? (
                            <div className="flex flex-wrap gap-1">
                              {rolePermission.actions.map(action => (
                                <Badge key={action} variant="secondary" className="text-xs">
                                  {AVAILABLE_ACTIONS.find(a => a.key === action)?.label || action}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No permissions granted</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole}>
              Update Role
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
