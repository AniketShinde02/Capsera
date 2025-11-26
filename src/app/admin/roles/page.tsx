'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Users,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  Lock,
  Unlock,
  Search,
  LayoutGrid,
  List,
  MoreVertical,
  Settings,
  Database,
  Server
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MagicCard } from '@/components/admin/dashboard/magic-card';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Types
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

// Constants
const AVAILABLE_RESOURCES = [
  { key: 'users', label: 'User Management', icon: Users },
  { key: 'roles', label: 'Role Management', icon: Shield },
  { key: 'posts', label: 'Content & Posts', icon: LayoutGrid },
  { key: 'database', label: 'Database', icon: Database },
  { key: 'system', label: 'System Settings', icon: Server },
  { key: 'analytics', label: 'Analytics', icon: Info },
];

const AVAILABLE_ACTIONS = [
  { key: 'create', label: 'Create', color: 'bg-green-500/20 text-green-500' },
  { key: 'read', label: 'Read', color: 'bg-blue-500/20 text-blue-500' },
  { key: 'update', label: 'Update', color: 'bg-orange-500/20 text-orange-500' },
  { key: 'delete', label: 'Delete', color: 'bg-red-500/20 text-red-500' },
  { key: 'manage', label: 'Manage', color: 'bg-purple-500/20 text-purple-500' }
];

export default function RolesPage() {
  const { data: session } = useSession();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Form States
  const [createForm, setCreateForm] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: AVAILABLE_RESOURCES.map(r => ({ resource: r.key, actions: [] as string[] })),
    isSystem: false,
    isActive: true
  });

  // Quick Action States
  const [quickCreateForm, setQuickCreateForm] = useState({ email: '', username: '', tier: '' });
  const [quickDeleteForm, setQuickDeleteForm] = useState({ identifier: '', confirm: 'no' });
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch Data
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles || []);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Notifications
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handlers
  const handleCreateRole = async () => {
    if (!createForm.name || !createForm.displayName) {
      showNotification("Name and Display Name are required", "error");
      return;
    }

    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          permissions: createForm.permissions.filter(p => p.actions.length > 0)
        })
      });

      if (response.ok) {
        showNotification("Role created successfully", "success");
        setShowCreateModal(false);
        fetchRoles();
        // Reset form
        setCreateForm({
          name: '',
          displayName: '',
          description: '',
          permissions: AVAILABLE_RESOURCES.map(r => ({ resource: r.key, actions: [] })),
          isSystem: false,
          isActive: true
        });
      } else {
        const error = await response.json();
        showNotification(error.error || "Failed to create role", "error");
      }
    } catch (error) {
      showNotification("Network error", "error");
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;
    try {
      const response = await fetch(`/api/admin/roles/${editingRole._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: editingRole.displayName,
          description: editingRole.description,
          permissions: editingRole.permissions,
          isActive: editingRole.isActive
        })
      });

      if (response.ok) {
        showNotification("Role updated successfully", "success");
        setShowEditModal(false);
        setEditingRole(null);
        fetchRoles();
      } else {
        showNotification("Failed to update role", "error");
      }
    } catch (error) {
      showNotification("Network error", "error");
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.isSystem) {
      showNotification("Cannot delete system roles", "error");
      return;
    }
    if (role.userCount > 0) {
      showNotification(`Cannot delete role with ${role.userCount} active users`, "error");
      return;
    }
    if (!confirm(`Delete role ${role.displayName}?`)) return;

    try {
      const response = await fetch(`/api/admin/roles/${role._id}`, { method: 'DELETE' });
      if (response.ok) {
        showNotification("Role deleted", "success");
        fetchRoles();
      } else {
        showNotification("Failed to delete role", "error");
      }
    } catch (error) {
      showNotification("Network error", "error");
    }
  };

  const handleQuickCreate = async () => {
    if (!quickCreateForm.email || !quickCreateForm.tier) return;
    try {
      const res = await fetch('/api/admin/quick-create-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quickCreateForm)
      });
      if (res.ok) {
        showNotification("Tier account created", "success");
        setQuickCreateForm({ email: '', username: '', tier: '' });
        fetchRoles();
      } else {
        showNotification("Failed to create tier account", "error");
      }
    } catch (e) { showNotification("Network error", "error"); }
  };

  // Filtered Roles
  const filteredRoles = roles.filter(r =>
    r.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground animate-pulse">Loading secure roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-2 sm:p-8 min-h-screen bg-background/50 backdrop-blur-3xl animate-in fade-in duration-500">

      {/* Notification Toast */}
      {notification && (
        <div className={cn(
          "fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-right-10",
          notification.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
        )}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Role Command Center
          </h1>
          <p className="text-muted-foreground mt-1">Manage access control and permissions with precision.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/20 transition-all hover:scale-105">
          <Plus className="w-4 h-4 mr-2" />
          Create New Role
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MagicCard
          title="Total Roles"
          value={roles.length.toString()}
          icon={Shield}
          trend="neutral"
          trendValue="Defined"
          className="bg-purple-500/5 border-purple-500/10"
        />
        <MagicCard
          title="System Roles"
          value={roles.filter(r => r.isSystem).length.toString()}
          icon={Lock}
          trend="neutral"
          trendValue="Protected"
          className="bg-blue-500/5 border-blue-500/10"
        />
        <MagicCard
          title="Active Users"
          value={roles.reduce((acc, r) => acc + r.userCount, 0).toString()}
          icon={Users}
          trend="up"
          trendValue="Assigned"
          className="bg-green-500/5 border-green-500/10"
        />
        <MagicCard
          title="Custom Roles"
          value={roles.filter(r => !r.isSystem).length.toString()}
          icon={Settings}
          trend="up"
          trendValue="Flexible"
          className="bg-orange-500/5 border-orange-500/10"
        />
      </div>

      {/* Main Content Area - Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Role Deck (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Controls */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-white/10 focus:ring-purple-500/20"
              />
            </div>
            <div className="flex gap-2 bg-background/50 p-1 rounded-lg border border-white/10">
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-8 w-8 p-0", viewMode === 'grid' && "bg-white/10")}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-8 w-8 p-0", viewMode === 'list' && "bg-white/10")}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Roles Grid/List */}
          <div className={cn(
            "grid gap-4",
            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          )}>
            {filteredRoles.map((role) => (
              <div
                key={role._id}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1"
              >
                {/* Role Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      role.isSystem ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                    )}>
                      {role.isSystem ? <Lock className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{role.displayName}</h3>
                      <p className="text-xs text-muted-foreground font-mono">{role.name}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-xl border-white/10">
                      <DropdownMenuItem onClick={() => { setEditingRole(role); setShowEditModal(true); }}>
                        <Edit className="w-4 h-4 mr-2" /> Edit Role
                      </DropdownMenuItem>
                      {!role.isSystem && (
                        <DropdownMenuItem className="text-red-400 focus:text-red-400" onClick={() => handleDeleteRole(role)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Role
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Role Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
                  {role.description || "No description provided."}
                </p>

                {/* Stats & Tags */}
                <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{role.userCount} Users</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>{role.permissions.reduce((acc, p) => acc + p.actions.length, 0)} Permissions</span>
                  </div>
                </div>

                {/* Permission Preview */}
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 3).map((perm, i) => (
                    perm.actions.length > 0 && (
                      <Badge key={i} variant="secondary" className="bg-white/5 hover:bg-white/10 text-[10px] border-white/5">
                        {AVAILABLE_RESOURCES.find(r => r.key === perm.resource)?.label || perm.resource}
                      </Badge>
                    )
                  ))}
                  {role.permissions.filter(p => p.actions.length > 0).length > 3 && (
                    <Badge variant="secondary" className="bg-white/5 text-[10px] border-white/5">
                      +{role.permissions.filter(p => p.actions.length > 0).length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Quick Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Quick Create Card */}
          <Card className="border-white/10 bg-gradient-to-br from-purple-900/20 to-background/50 backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full -mr-16 -mt-16" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-yellow-400" />
                Quick Tier Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="space-y-2">
                <Input
                  placeholder="Email Address"
                  value={quickCreateForm.email}
                  onChange={(e) => setQuickCreateForm({ ...quickCreateForm, email: e.target.value })}
                  className="bg-background/50 border-white/10"
                />
                <Input
                  placeholder="Username"
                  value={quickCreateForm.username}
                  onChange={(e) => setQuickCreateForm({ ...quickCreateForm, username: e.target.value })}
                  className="bg-background/50 border-white/10"
                />
                <Select
                  value={quickCreateForm.tier}
                  onValueChange={(val) => setQuickCreateForm({ ...quickCreateForm, tier: val })}
                >
                  <SelectTrigger className="bg-background/50 border-white/10">
                    <SelectValue placeholder="Select Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="content_editor">Content Editor</SelectItem>
                    <SelectItem value="support_agent">Support Agent</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleQuickCreate} className="w-full bg-purple-600 hover:bg-purple-700">
                  Grant Access
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Status Card */}
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Server className="w-5 h-5 text-blue-400" />
                System Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {roles.filter(r => r.isSystem).map(role => (
                  <div key={role._id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm font-medium">{role.displayName}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-green-500/20 text-green-500">
                      Protected
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={showCreateModal || showEditModal} onOpenChange={(open) => {
        if (!open) {
          setShowCreateModal(false);
          setShowEditModal(false);
          setEditingRole(null);
        }
      }}>
        <DialogContent className="max-w-4xl bg-background/95 backdrop-blur-2xl border-white/10 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {showEditModal ? 'Edit Role Configuration' : 'Create New Role'}
            </DialogTitle>
            <DialogDescription>
              Define the access levels and permissions for this role.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-4">
            {/* Left: Basic Info */}
            <div className="md:col-span-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Name</label>
                <Input
                  value={showEditModal ? editingRole?.displayName : createForm.displayName}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (showEditModal && editingRole) {
                      setEditingRole({ ...editingRole, displayName: val });
                    } else {
                      setCreateForm({ ...createForm, displayName: val, name: val.toLowerCase().replace(/\s+/g, '_') });
                    }
                  }}
                  placeholder="e.g. Senior Editor"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">System Name (ID)</label>
                <Input
                  value={showEditModal ? editingRole?.name : createForm.name}
                  disabled={showEditModal} // Cannot change ID after creation
                  readOnly
                  className="bg-muted/50 font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={showEditModal ? editingRole?.description : createForm.description}
                  onChange={(e) => {
                    if (showEditModal && editingRole) setEditingRole({ ...editingRole, description: e.target.value });
                    else setCreateForm({ ...createForm, description: e.target.value });
                  }}
                  placeholder="Describe the role's purpose..."
                  rows={4}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                <label className="text-sm font-medium">Active Status</label>
                <Switch
                  checked={showEditModal ? editingRole?.isActive : createForm.isActive}
                  onCheckedChange={(c) => {
                    if (showEditModal && editingRole) setEditingRole({ ...editingRole, isActive: c });
                    else setCreateForm({ ...createForm, isActive: c });
                  }}
                />
              </div>
            </div>

            {/* Right: Permissions Matrix */}
            <div className="md:col-span-8 space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Permission Matrix</h3>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {AVAILABLE_RESOURCES.map((resource) => {
                    const currentPermissions = showEditModal ? editingRole?.permissions : createForm.permissions;
                    const resourcePerms = currentPermissions?.find(p => p.resource === resource.key)?.actions || [];

                    return (
                      <div key={resource.key} className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-background/50">
                            <resource.icon className="w-4 h-4" />
                          </div>
                          <span className="font-medium">{resource.label}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {AVAILABLE_ACTIONS.map((action) => {
                            const isSelected = resourcePerms.includes(action.key);
                            return (
                              <button
                                key={action.key}
                                onClick={() => {
                                  const updateFn = showEditModal ? setEditingRole : setCreateForm;
                                  const currentObj = showEditModal ? editingRole : createForm;
                                  if (!currentObj) return;

                                  const newPerms = currentObj.permissions.map(p => {
                                    if (p.resource === resource.key) {
                                      const newActions = isSelected
                                        ? p.actions.filter(a => a !== action.key)
                                        : [...p.actions, action.key];
                                      return { ...p, actions: newActions };
                                    }
                                    return p;
                                  });

                                  // If resource doesn't exist in permissions array yet (for create mode sometimes)
                                  if (!newPerms.find(p => p.resource === resource.key)) {
                                    newPerms.push({ resource: resource.key, actions: [action.key] });
                                  }

                                  updateFn({ ...currentObj, permissions: newPerms } as any);
                                }}
                                className={cn(
                                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all border",
                                  isSelected
                                    ? `${action.color} border-current`
                                    : "bg-background/50 text-muted-foreground border-transparent hover:bg-background hover:text-foreground"
                                )}
                              >
                                {action.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="outline" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}>
              Cancel
            </Button>
            <Button
              onClick={showEditModal ? handleUpdateRole : handleCreateRole}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {showEditModal ? 'Save Changes' : 'Create Role'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
