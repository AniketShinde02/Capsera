'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Activity,
  Download,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  FileText,
  Lock
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { MagicCard } from '@/components/admin/dashboard/magic-card';
import { cn } from '@/lib/utils';

interface User {
  _id: string;
  email: string;
  username?: string;
  role?: {
    name: string;
    displayName?: string;
  };
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

interface AuditLog {
  _id: string;
  action: string;
  adminName: string;
  targetModel: string;
  createdAt: string;
  status: string;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal States
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: '',
    role: '',
    isActive: true
  });
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    email: '',
    username: '',
    password: '',
    role: 'user',
    isAdmin: false
  });

  // Notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  const fetchData = async () => {
    try {
      setRefreshing(true);

      // Fetch Users
      const usersRes = await fetch('/api/admin/users');
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }

      // Fetch Audit Logs
      const logsRes = await fetch('/api/admin/audit-logs');
      if (logsRes.ok) {
        const data = await logsRes.json();
        setAuditLogs(data.logs || []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification("Failed to refresh data", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // CRUD Functions
  const handleCreateUser = async () => {
    if (!createFormData.email || !createFormData.password) {
      showNotification("Email and password are required", "error");
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createFormData)
      });

      if (response.ok) {
        showNotification("User created successfully", "success");
        setShowCreateModal(false);
        setCreateFormData({ email: '', username: '', password: '', role: 'user', isAdmin: false });
        fetchData();
      } else {
        const error = await response.json();
        showNotification(error.error || "Failed to create user", "error");
      }
    } catch (error) {
      showNotification("Network error", "error");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    try {
      const response = await fetch(`/api/admin/users/${editingUser._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        showNotification("User updated successfully", "success");
        setShowEditModal(false);
        fetchData();
      } else {
        const error = await response.json();
        showNotification(error.error || "Failed to update user", "error");
      }
    } catch (error) {
      showNotification("Network error", "error");
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.email}? This action cannot be undone.`)) return;

    try {
      const response = await fetch(`/api/admin/users/${user._id}`, { method: 'DELETE' });
      if (response.ok) {
        showNotification("User deleted successfully", "success");
        fetchData();
      } else {
        const error = await response.json();
        showNotification(error.error || "Failed to delete user", "error");
      }
    } catch (error) {
      showNotification("Network error", "error");
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const response = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive })
      });

      if (response.ok) {
        showNotification(`User ${!user.isActive ? 'activated' : 'deactivated'}`, "success");
        fetchData();
      } else {
        showNotification("Failed to update status", "error");
      }
    } catch (error) {
      showNotification("Network error", "error");
    }
  };

  const exportUserData = (format: 'csv' | 'json') => {
    const data = users.map(u => ({
      id: u._id,
      email: u.email,
      username: u.username,
      role: u.role?.name,
      status: u.isActive ? 'Active' : 'Inactive',
      joined: new Date(u.createdAt).toLocaleDateString()
    }));

    const blob = new Blob([format === 'csv'
      ? ['ID,Email,Username,Role,Status,Joined', ...data.map(d => Object.values(d).join(','))].join('\n')
      : JSON.stringify(data, null, 2)
    ], { type: format === 'csv' ? 'text/csv' : 'application/json' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showNotification("Export started", "success");
  };

  // Filtering & Pagination
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesRole = roleFilter === 'all' || user.role?.name === roleFilter;
    return matchesSearch && matchesRole;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground animate-pulse">Loading secure environment...</p>
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
          notification.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-500" :
            notification.type === 'error' ? "bg-red-500/10 border-red-500/20 text-red-500" :
              "bg-blue-500/10 border-blue-500/20 text-blue-500"
        )}>
          {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {notification.type === 'error' && <AlertTriangle className="w-5 h-5" />}
          {notification.type === 'info' && <Info className="w-5 h-5" />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">Securely manage users, roles, and permissions.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={refreshing}
            className={cn("transition-all", refreshing && "opacity-70")}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MagicCard
          title="Total Users"
          value={users.length.toString()}
          icon={Users}
          trend="neutral"
          trendValue="Total"
          className="bg-blue-500/5 border-blue-500/10"
        />
        <MagicCard
          title="Active Now"
          value={users.filter(u => u.isActive).length.toString()}
          icon={Activity}
          trend="up"
          trendValue="Live"
          className="bg-green-500/5 border-green-500/10"
        />
        <MagicCard
          title="New Today"
          value={users.filter(u => new Date(u.createdAt).toDateString() === new Date().toDateString()).length.toString()}
          icon={UserCheck}
          trend="up"
          trendValue="Growth"
          className="bg-purple-500/5 border-purple-500/10"
        />
        <MagicCard
          title="Admins"
          value={users.filter(u => u.role?.name === 'admin').length.toString()}
          icon={Shield}
          trend="neutral"
          trendValue="System"
          className="bg-orange-500/5 border-orange-500/10"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Users Table */}
        <div className="lg:col-span-8 space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-white/10 focus:ring-primary/20"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px] bg-background/50 border-white/10">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => exportUserData('csv')} title="Export CSV">
                <FileText className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Table */}
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left py-4 px-6 font-medium text-sm text-muted-foreground">User</th>
                    <th className="text-left py-4 px-6 font-medium text-sm text-muted-foreground">Role</th>
                    <th className="text-left py-4 px-6 font-medium text-sm text-muted-foreground hidden sm:table-cell">Status</th>
                    <th className="text-left py-4 px-6 font-medium text-sm text-muted-foreground hidden md:table-cell">Joined</th>
                    <th className="text-right py-4 px-6 font-medium text-sm text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {currentUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="group hover:bg-white/5 transition-colors duration-200"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-xs font-bold text-primary">
                            {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.username || 'No Username'}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="outline" className={cn(
                          "bg-background/50 backdrop-blur-sm border-white/10",
                          user.role?.name === 'admin' ? "text-red-400 border-red-500/20" :
                            user.role?.name === 'moderator' ? "text-orange-400 border-orange-500/20" :
                              "text-blue-400 border-blue-500/20"
                        )}>
                          {user.role?.displayName || 'User'}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full animate-pulse", user.isActive ? "bg-green-500" : "bg-red-500")} />
                          <span className="text-sm">{user.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground hidden md:table-cell">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button variant="ghost" size="sm" onClick={() => { setViewingUser(user); setShowViewModal(true); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => {
                            setEditingUser(user);
                            setEditFormData({ username: user.username || '', role: user.role?.name || 'user', isActive: user.isActive });
                            setShowEditModal(true);
                          }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(user)}>
                            <Lock className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-500" onClick={() => handleDeleteUser(user)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            <div className="p-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="lg:col-span-4">
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl h-full max-h-[800px] flex flex-col">
            <CardHeader className="border-b border-white/10 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              <div className="divide-y divide-white/5">
                {auditLogs.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No recent activity
                  </div>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log._id} className="p-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-2 h-2 mt-2 rounded-full",
                          log.action.includes('DELETE') ? "bg-red-500" :
                            log.action.includes('CREATE') ? "bg-green-500" :
                              "bg-blue-500"
                        )} />
                        <div>
                          <p className="text-sm font-medium">{log.action.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            by <span className="text-primary">{log.adminName || 'System'}</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-white/10">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label>Username</label>
              <Input
                value={editFormData.username}
                onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label>Role</label>
              <Select
                value={editFormData.role}
                onValueChange={(val) => setEditFormData({ ...editFormData, role: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <label>Active Status</label>
              <Switch
                checked={editFormData.isActive}
                onCheckedChange={(checked) => setEditFormData({ ...editFormData, isActive: checked })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-white/10">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label>Email</label>
              <Input
                type="email"
                value={createFormData.email}
                onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label>Password</label>
              <Input
                type="password"
                value={createFormData.password}
                onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label>Username</label>
              <Input
                value={createFormData.username}
                onChange={(e) => setCreateFormData({ ...createFormData, username: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label>Role</label>
              <Select
                value={createFormData.role}
                onValueChange={(val) => setCreateFormData({ ...createFormData, role: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <label>Is Admin?</label>
              <Switch
                checked={createFormData.isAdmin}
                onCheckedChange={(checked) => setCreateFormData({ ...createFormData, isAdmin: checked })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateUser}>Create User</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
