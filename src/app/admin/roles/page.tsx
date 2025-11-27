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
  { key: 'create', label: 'Create', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  { key: 'read', label: 'Read', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { key: 'update', label: 'Update', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  { key: 'delete', label: 'Delete', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  { key: 'manage', label: 'Manage', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' }
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

  const [createdCredentials, setCreatedCredentials] = useState<{ email: string, password: string } | null>(null);

  const handleQuickCreate = async () => {
    if (!quickCreateForm.email || !quickCreateForm.tier) {
      showNotification("Email and Tier are required", "error");
      return;
    }

    try {
      const res = await fetch('/api/admin/quick-create-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quickCreateForm)
      });

      const data = await res.json();

      if (res.ok) {
        setCreatedCredentials({
          email: data.user.email,
          password: data.user.password
        });
        showNotification("Tier account created successfully", "success");
        setQuickCreateForm({ email: '', username: '', tier: '' });
        fetchRoles();
      } else {
        showNotification(data.error || "Failed to create tier account", "error");
      }
    } catch (e) {
      showNotification("Network error", "error");
    }
  };

  // Filtered Roles
  const filteredRoles = roles.filter(r =>
    r.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 lg:p-8">

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
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Role Command Center</h1>
          <p className="text-muted-foreground">Manage access control and permissions with precision.</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-foreground text-background hover:bg-foreground/90 rounded-xl font-medium shadow-lg shadow-foreground/10 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Role
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MagicCard
          title="Total Roles"
          value={roles.length.toString()}
          icon={Shield}
          trend="neutral"
          trendValue="Defined"
          className="bg-card border-none"
        />
        <MagicCard
          title="System Roles"
          value={roles.filter(r => r.isSystem).length.toString()}
          icon={Lock}
          trend="neutral"
          trendValue="Protected"
          className="bg-card border-none"
        />
        <MagicCard
          title="Active Users"
          value={roles.reduce((acc, r) => acc + r.userCount, 0).toString()}
          icon={Users}
          trend="up"
          trendValue="Assigned"
          className="bg-card border-none"
        />
        <MagicCard
          title="Custom Roles"
          value={roles.filter(r => !r.isSystem).length.toString()}
          icon={Settings}
          trend="up"
          trendValue="Flexible"
          className="bg-card border-none"
        />
      </div>

      {/* Main Content Area - Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Role Deck (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card border-none h-12 rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 bg-[#18181b] p-1 rounded-xl">
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-10 w-10 p-0 rounded-lg", viewMode === 'grid' && "bg-muted text-foreground")}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-10 w-10 p-0 rounded-lg", viewMode === 'list' && "bg-muted text-foreground")}
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
                className="group relative overflow-hidden rounded-[2rem] bg-card p-6 transition-all duration-300 hover:bg-accent/5 hover:shadow-2xl hover:shadow-accent/10 border border-transparent hover:border-accent/20 hover:-translate-y-1"
              >
                {/* Role Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-3 rounded-xl",
                      role.isSystem ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                    )}>
                      {role.isSystem ? <Lock className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{role.displayName}</h3>
                      <p className="text-xs text-muted-foreground font-mono">{role.name}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                      <DropdownMenuItem onClick={() => { setEditingRole(role); setShowEditModal(true); }} className="focus:bg-muted focus:text-foreground cursor-pointer">
                        <Edit className="w-4 h-4 mr-2" /> Edit Role
                      </DropdownMenuItem>
                      {!role.isSystem && (
                        <DropdownMenuItem className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer" onClick={() => handleDeleteRole(role)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Role
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Role Description */}
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2 min-h-[40px]">
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
                      <Badge key={i} variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted/80 text-[10px] border-none">
                        {AVAILABLE_RESOURCES.find(r => r.key === perm.resource)?.label || perm.resource}
                      </Badge>
                    )
                  ))}
                  {role.permissions.filter(p => p.actions.length > 0).length > 3 && (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] border-none">
                      +{role.permissions.filter(p => p.actions.length > 0).length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Quick Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Quick Create Card */}
          <div className="bg-gradient-to-br from-purple-900/20 to-card rounded-[2rem] p-6 relative overflow-hidden border border-purple-500/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-yellow-400/10 rounded-lg">
                  <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Quick Tier Access</h3>
              </div>

              <div className="space-y-3">
                <Input
                  placeholder="Email Address"
                  value={quickCreateForm.email}
                  onChange={(e) => setQuickCreateForm({ ...quickCreateForm, email: e.target.value })}
                  className="bg-background/50 border-none text-foreground placeholder:text-muted-foreground h-10 rounded-xl"
                />
                <Input
                  placeholder="Username"
                  value={quickCreateForm.username}
                  onChange={(e) => setQuickCreateForm({ ...quickCreateForm, username: e.target.value })}
                  className="bg-[#09090b]/50 border-none text-white placeholder:text-gray-500 h-10 rounded-xl"
                />
                <Select
                  value={quickCreateForm.tier}
                  onValueChange={(val) => setQuickCreateForm({ ...quickCreateForm, tier: val })}
                >
                  <SelectTrigger className="bg-background/50 border-none text-foreground h-10 rounded-xl">
                    <SelectValue placeholder="Select Tier" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="content_editor">Content Editor</SelectItem>
                    <SelectItem value="support_agent">Support Agent</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleQuickCreate} className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-10 font-medium">
                  Grant Access
                </Button>
              </div>
            </div>
          </div>

          {/* System Status Card */}
          <div className="bg-card rounded-[2rem] p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Server className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground">System Roles</h3>
            </div>

            <div className="space-y-3">
              {roles.filter(r => r.isSystem).map(role => (
                <div key={role._id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-muted-foreground">{role.displayName}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-none bg-green-500/10 text-green-500">
                    Protected
                  </Badge>
                </div>
              ))}
            </div>
          </div>

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
        <DialogContent className="max-w-4xl bg-card border-border text-foreground max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">
              {showEditModal ? 'Edit Role Configuration' : 'Create New Role'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Define the access levels and permissions for this role.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-4">
            {/* Left: Basic Info */}
            <div className="md:col-span-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Display Name</label>
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
                  className="bg-muted border-none text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">System Name (ID)</label>
                <Input
                  value={showEditModal ? editingRole?.name : createForm.name}
                  disabled={showEditModal} // Cannot change ID after creation
                  readOnly
                  className="bg-muted/50 font-mono text-xs border-none text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <Textarea
                  value={showEditModal ? editingRole?.description : createForm.description}
                  onChange={(e) => {
                    if (showEditModal && editingRole) setEditingRole({ ...editingRole, description: e.target.value });
                    else setCreateForm({ ...createForm, description: e.target.value });
                  }}
                  placeholder="Describe the role's purpose..."
                  rows={4}
                  className="bg-muted border-none text-foreground resize-none"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted">
                <label className="text-sm font-medium text-muted-foreground">Active Status</label>
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
                      <div key={resource.key} className="p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-card">
                            <resource.icon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <span className="font-medium text-foreground">{resource.label}</span>
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
                                    : "bg-card text-muted-foreground border-transparent hover:bg-background hover:text-foreground"
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

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="ghost" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} className="text-muted-foreground hover:text-foreground hover:bg-muted">
              Cancel
            </Button>
            <Button
              onClick={showEditModal ? handleUpdateRole : handleCreateRole}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              {showEditModal ? 'Save Changes' : 'Create Role'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credentials Modal */}
      <Dialog open={!!createdCredentials} onOpenChange={(open) => !open && setCreatedCredentials(null)}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-green-500 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Account Created
            </DialogTitle>
            <DialogDescription>
              Share these credentials with the user. They will not be shown again.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 bg-muted/50 rounded-xl space-y-4 border border-border">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Email Address</label>
              <div className="p-3 bg-background rounded-lg border border-border font-mono text-sm select-all">
                {createdCredentials?.email}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Temporary Password</label>
              <div className="p-3 bg-background rounded-lg border border-border font-mono text-lg font-bold text-primary select-all">
                {createdCredentials?.password}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 p-3 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
              <span>User should change this password upon first login.</span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCreatedCredentials(null)}>
              Close
            </Button>
            <Button onClick={() => {
              if (createdCredentials) {
                navigator.clipboard.writeText(`Login Credentials:\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`);
                showNotification("Credentials copied to clipboard", "success");
              }
            }}>
              Copy Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
