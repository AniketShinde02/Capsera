'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const { data: session } = useSession();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: [] as any[],
    isSystem: false,
    isActive: true,
    autoCreateUsers: false,
    usersToCreate: [] as any[],
    sendEmailNotifications: true
  });
  const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set());
  const [bulkImportText, setBulkImportText] = useState('');

  // Plain text notification system
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2000); // 2 second timeout
  };

  // User creation form state
  const [userForm, setUserForm] = useState({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    phone: '',
    department: ''
  });

  // Add user to creation list
  const addUserToCreation = () => {
    if (userForm.email && userForm.username) {
      setCreateForm(prev => ({
        ...prev,
        usersToCreate: [...prev.usersToCreate, { ...userForm }]
      }));
      setUserForm({
        email: '',
        username: '',
        firstName: '',
        lastName: '',
        phone: '',
        department: ''
      });
    }
  };

  // Remove user from creation list
  const removeUserFromCreation = (index: number) => {
    setCreateForm(prev => ({
      ...prev,
      usersToCreate: prev.usersToCreate.filter((_, i) => i !== index)
    }));
  };

  // Bulk import users from CSV/text
  const importBulkUsers = () => {
    if (!bulkImportText.trim()) return;
    
    const lines = bulkImportText.trim().split('\n');
    const users: any[] = [];
    
    for (const line of lines) {
      const [email, username, firstName, lastName, phone, department] = line.split(',').map(s => s.trim());
      if (email && username) {
        users.push({
          email,
          username,
          firstName: firstName || '',
          lastName: lastName || '',
          phone: phone || '',
          department: department || ''
        });
      }
    }
    
    if (users.length > 0) {
      setCreateForm(prev => ({
        ...prev,
        usersToCreate: [...prev.usersToCreate, ...users]
      }));
      setBulkImportText('');
      showNotification("Users Imported", "success");
    }
  };

  // Quick Tier Management Forms
  const [quickCreateForm, setQuickCreateForm] = useState({
    email: '',
    username: '',
    tier: 'moderator' as 'moderator' | 'content_editor' | 'support_agent' | 'analyst'
  });

  const [quickDeleteForm, setQuickDeleteForm] = useState({
    identifier: '',
    confirm: 'no' as 'yes' | 'no'
  });

  const [bulkTierForm, setBulkTierForm] = useState({
    emails: '',
    operation: 'create' as 'create' | 'delete' | 'upgrade'
  });

  const [quickActionStatus, setQuickActionStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // System Lock Management Forms


  const handleQuickCreate = async () => {
    if (!quickCreateForm.email || !quickCreateForm.username || !quickCreateForm.tier) {
      showNotification("Email, Username, and Tier are required for quick create.", "error");
      return;
    }

    try {
      const response = await fetch('/api/admin/quick-create-tier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quickCreateForm)
      });

      if (response.ok) {
        const data = await response.json();
        setQuickActionStatus({ type: 'success', message: `Tier account created successfully for ${data.email}!` });
        fetchRoles(); // Refresh roles to show new user
      } else {
        const errorData = await response.json();
        setQuickActionStatus({ type: 'error', message: `Failed to create tier account: ${errorData.error}` });
      }
    } catch (error) {
      console.error('Error creating quick tier account:', error);
      setQuickActionStatus({ type: 'error', message: 'Error creating quick tier account' });
    }
  };

  const handleQuickDelete = async () => {
    if (!quickDeleteForm.identifier || quickDeleteForm.confirm !== 'yes') {
      showNotification("Please confirm deletion by selecting 'Yes, delete immediately'.", "error");
      return;
    }

    try {
      const response = await fetch('/api/admin/quick-delete-tier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quickDeleteForm)
      });

      if (response.ok) {
        const data = await response.json();
        setQuickActionStatus({ type: 'success', message: `Tier account deleted successfully for ${data.identifier}!` });
        fetchRoles(); // Refresh roles to show deleted user
      } else {
        const errorData = await response.json();
        setQuickActionStatus({ type: 'error', message: `Failed to delete tier account: ${errorData.error}` });
      }
    } catch (error) {
      console.error('Error deleting quick tier account:', error);
      setQuickActionStatus({ type: 'error', message: 'Error deleting quick tier account' });
    }
  };

  const handleBulkOperation = async () => {
    if (!bulkTierForm.emails.trim() || !bulkTierForm.operation) {
      showNotification("Emails and operation are required for bulk operations.", "error");
      return;
    }

    try {
      const response = await fetch('/api/admin/bulk-tier-operation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bulkTierForm)
      });

      if (response.ok) {
        const data = await response.json();
        setQuickActionStatus({ type: 'success', message: `Bulk operation completed: ${data.message}` });
        fetchRoles(); // Refresh roles to show updated users
      } else {
        const errorData = await response.json();
        setQuickActionStatus({ type: 'error', message: `Failed to execute bulk operation: ${errorData.error}` });
      }
    } catch (error) {
      console.error('Error executing bulk operation:', error);
      setQuickActionStatus({ type: 'error', message: 'Error executing bulk operation' });
    }
  };



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

  // Clear quick action status after 5 seconds
  useEffect(() => {
    if (quickActionStatus) {
      const timer = setTimeout(() => {
        setQuickActionStatus(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [quickActionStatus]);

  // Clear quick action status manually
  const clearQuickActionStatus = () => {
    setQuickActionStatus(null);
  };

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
            : permission.actions.filter((action: string) => action !== actionKey);
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
      showNotification("Role name and display name are required", "error");
      return;
    }

    // Validate role name format (allow more characters, just no spaces)
    const roleNameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!roleNameRegex.test(createForm.name.trim())) {
      showNotification("Role name can contain letters, numbers, hyphens, and underscores. No spaces allowed.", "error");
      return;
    }

    // Check if role name already exists
    const existingRole = roles.find(role => role.name === createForm.name.trim());
    if (existingRole) {
      showNotification("A role with this name already exists", "error");
      return;
    }

    // Check if at least one permission is selected
    const hasPermissions = createForm.permissions.some(p => p.actions.length > 0);
    if (!hasPermissions) {
      showNotification("Please select at least one permission", "error");
      return;
    }

    try {
      // Filter out permissions with no actions before sending
      const filteredPermissions = createForm.permissions.filter(p => p.actions.length > 0);
      
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...createForm,
          permissions: filteredPermissions
        })
      });

      if (response.ok) {
        const data = await response.json();
        setShowCreateModal(false);
                 setCreateForm({ name: '', displayName: '', description: '', permissions: [], isSystem: false, isActive: true, autoCreateUsers: false, usersToCreate: [], sendEmailNotifications: true });
        setExpandedResources(new Set());
        showNotification("Role created successfully", "success");
        // Refresh the roles list to show the new role
        fetchRoles();
      } else {
        const errorData = await response.json();
        showNotification(`Failed to create role: ${errorData.error}`, "error");
      }
    } catch (error) {
      console.error('Error creating role:', error);
      showNotification("Error creating role", "error");
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
        showNotification("Role updated successfully", "success");
        // Refresh the roles list to show updated data
        fetchRoles();
      } else {
        const errorData = await response.json();
        showNotification(`Failed to update role: ${errorData.error}`, "error");
      }
    } catch (error) {
      console.error('Error updating role:', error);
      showNotification("Error updating role", "error");
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.isSystem) {
      showNotification("System roles cannot be deleted", "error");
      return;
    }

    // Use a more user-friendly confirmation approach
    if (window.confirm(`Are you sure you want to delete the role "${role.displayName}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/admin/roles/${role._id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          showNotification("Role deleted successfully", "success");
          // Refresh the roles list to show updated data
          fetchRoles();
        } else {
          const errorData = await response.json();
          showNotification(`Failed to delete role: ${errorData.error}`, "error");
        }
      } catch (error) {
        console.error('Error deleting role:', error);
        showNotification("Error deleting role", "error");
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
    return sum + role.permissions.reduce((permSum: number, perm: any) => permSum + (perm.actions?.length || 0), 0);
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

      {/* Plain Text Notification Display */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-100 border border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300'
            : notification.type === 'error'
            ? 'bg-red-100 border border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300'
            : 'bg-blue-100 border border-blue-300 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' && <CheckCircle className="w-4 h-4" />}
            {notification.type === 'error' && <AlertTriangle className="w-4 h-4" />}
            {notification.type === 'info' && <Info className="w-4 h-4" />}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Quick Tier Management */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5" />
            🚀 Quick Tier Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Quickly create and manage tier accounts without going through the full role creation process.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quick Create Tier Account */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Quick Create Tier</h4>
              <div className="space-y-2">
                <Input
                  placeholder="Email"
                  value={quickCreateForm.email}
                  onChange={(e) => setQuickCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  className="h-9"
                />
                <Input
                  placeholder="Username"
                  value={quickCreateForm.username}
                  onChange={(e) => setQuickCreateForm(prev => ({ ...prev, username: e.target.value }))}
                  className="h-9"
                />
                                 <Select value={quickCreateForm.tier} onValueChange={(value) => setQuickCreateForm(prev => ({ ...prev, tier: value as 'moderator' | 'content_editor' | 'support_agent' | 'analyst' }))}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="content_editor">Content Editor</SelectItem>
                    <SelectItem value="support_agent">Support Agent</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleQuickCreate}
                  disabled={!quickCreateForm.email || !quickCreateForm.username || !quickCreateForm.tier}
                  size="sm"
                  className="w-full"
                >
                  🚀 Quick Create
                </Button>
              </div>
            </div>

            {/* Quick Delete Tier Account */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Quick Delete Tier</h4>
              <div className="space-y-2">
                <Input
                  placeholder="Email or Username"
                  value={quickDeleteForm.identifier}
                  onChange={(e) => setQuickDeleteForm(prev => ({ ...prev, identifier: e.target.value }))}
                  className="h-9"
                />
                                 <Select value={quickDeleteForm.confirm} onValueChange={(value) => setQuickDeleteForm(prev => ({ ...prev, confirm: value as 'yes' | 'no' }))}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Confirm deletion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes, delete immediately</SelectItem>
                    <SelectItem value="no">No, cancel</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleQuickDelete}
                  disabled={!quickDeleteForm.identifier || quickDeleteForm.confirm !== 'yes'}
                  size="sm"
                  variant="destructive"
                  className="w-full"
                >
                  🗑️ Quick Delete
                </Button>
              </div>
            </div>

            {/* Bulk Tier Operations */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Bulk Operations</h4>
              <div className="space-y-2">
                <Textarea
                  placeholder="emails, one per line&#10;user1@example.com&#10;user2@example.com"
                  value={bulkTierForm.emails}
                  onChange={(e) => setBulkTierForm(prev => ({ ...prev, emails: e.target.value }))}
                  rows={3}
                  className="text-xs"
                />
                                 <Select value={bulkTierForm.operation} onValueChange={(value) => setBulkTierForm(prev => ({ ...prev, operation: value as 'create' | 'delete' | 'upgrade' }))}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select operation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="create">Create Tier Accounts</SelectItem>
                    <SelectItem value="delete">Delete Tier Accounts</SelectItem>
                    <SelectItem value="upgrade">Upgrade to Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleBulkOperation}
                  disabled={!bulkTierForm.emails.trim() || !bulkTierForm.operation}
                  size="sm"
                  className="w-full"
                >
                  📦 Bulk Execute
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Actions Status */}
          {quickActionStatus && (
            <div className={`p-3 rounded-lg ${
              quickActionStatus.type === 'success' 
                ? 'bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800' 
                : 'bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center justify-between">
                <p className={`text-sm ${
                  quickActionStatus.type === 'success' 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {quickActionStatus.message}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearQuickActionStatus}
                  className="h-6 w-6 p-0 hover:bg-opacity-20"
                >
                  ×
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>



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
                            {role.permissions.map((permission: any, index: number) => {
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
                                    {actions.map((action: string) => (
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
                   Letters, numbers, hyphens, underscores. No spaces (e.g., Content-Moderator, content_moderator)
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
            
            {/* Auto User Creation Section */}
            <div className="border-t pt-4">
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="autoCreateUsers"
                  checked={createForm.autoCreateUsers}
                  onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, autoCreateUsers: !!checked }))}
                />
                <Label htmlFor="autoCreateUsers" className="font-semibold">
                  🚀 Auto-Create Users with This Role
                </Label>
              </div>
              
              {createForm.autoCreateUsers && (
                <div className="space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Users will be automatically created with this role and receive email notifications
                  </div>
                  
                  {/* Individual User Addition */}
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Email"
                      value={userForm.email}
                      onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                      className="h-9"
                    />
                    <Input
                      placeholder="Username"
                      value={userForm.username}
                      onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                      className="h-9"
                    />
                    <Input
                      placeholder="First Name (optional)"
                      value={userForm.firstName}
                      onChange={(e) => setUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="h-9"
                    />
                    <Input
                      placeholder="Last Name (optional)"
                      value={userForm.lastName}
                      onChange={(e) => setUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="h-9"
                    />
                    <Input
                      placeholder="Phone (optional)"
                      value={userForm.phone}
                      onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="h-9"
                    />
                    <Input
                      placeholder="Department (optional)"
                      value={userForm.department}
                      onChange={(e) => setUserForm(prev => ({ ...prev, department: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                  
                  <Button 
                    onClick={addUserToCreation} 
                    size="sm" 
                    className="w-full"
                    disabled={!userForm.email || !userForm.username}
                  >
                    ➕ Add User to Creation List
                  </Button>
                  
                  {/* Bulk Import */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">📥 Bulk Import (CSV format)</Label>
                    <Textarea
                      placeholder="email,username,firstName,lastName,phone,department&#10;john@example.com,johndoe,John,Doe,1234567890,IT&#10;jane@example.com,janedoe,Jane,Doe,0987654321,HR"
                      value={bulkImportText}
                      onChange={(e) => setBulkImportText(e.target.value)}
                      rows={4}
                      className="text-xs"
                    />
                    <Button 
                      onClick={importBulkUsers} 
                      size="sm" 
                      variant="outline"
                      className="w-full"
                      disabled={!bulkImportText.trim()}
                    >
                      📥 Import Users
                    </Button>
                  </div>
                  
                  {/* Users to Create List */}
                  {createForm.usersToCreate.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        👥 Users to Create ({createForm.usersToCreate.length})
                      </Label>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {createForm.usersToCreate.map((user, index) => (
                          <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-700 p-2 rounded border">
                            <div className="text-sm">
                              <div className="font-medium">{user.email}</div>
                              <div className="text-gray-500">@{user.username}</div>
                            </div>
                            <Button
                              onClick={() => removeUserFromCreation(index)}
                              size="sm"
                              variant="destructive"
                            >
                              ❌
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Email Notifications */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sendEmailNotifications"
                      checked={createForm.sendEmailNotifications}
                      onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, sendEmailNotifications: !!checked }))}
                    />
                    <Label htmlFor="sendEmailNotifications" className="text-sm">
                      📧 Send email notifications to new users
                    </Label>
                  </div>
                </div>
              )}
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
                      {selectedPermissions.map((permission: any) => {
                        const resource = AVAILABLE_RESOURCES.find(r => r.key === permission.resource);
                        return (
                          <div key={permission.resource} className="flex items-center justify-between">
                            <span className="text-xs font-medium">{resource?.label || permission.resource}</span>
                            <div className="flex gap-1">
                              {permission.actions.map((action: string) => (
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
                  onChange={(e) => setEditingRole((prev: any) => prev ? { ...prev, displayName: e.target.value } : null)}
                  className="mt-1 h-9"
                />
              </div>
              <div>
                <Label htmlFor="edit-description" className="text-sm font-medium">Description</Label>
                <Input
                  id="edit-description"
                  value={editingRole.description}
                  onChange={(e) => setEditingRole((prev: any) => prev ? { ...prev, description: e.target.value } : null)}
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
                      const rolePermission = editingRole.permissions.find((p: any) => p.resource === resource.key);
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
                              {rolePermission.actions.map((action: string) => (
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
