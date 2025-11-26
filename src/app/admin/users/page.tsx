'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
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
  Lock,
  MoreHorizontal,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 lg:p-8">

      {/* Notification Toast */}
      {notification && (
        <div className={cn(
          "fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-right-10",
          notification.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-500" :
            notification.type === 'error' ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-500" :
              "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-500"
        )}>
          {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {notification.type === 'error' && <AlertTriangle className="w-5 h-5" />}
          {notification.type === 'info' && <Info className="w-5 h-5" />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and permissions securely.</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={refreshing}
            className="border-none bg-card text-foreground hover:bg-accent rounded-xl"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-card p-6 rounded-[2rem] relative overflow-hidden group hover:bg-accent/50 transition-colors border border-border">
          <div className="flex justify-between items-start mb-4">
            <span className="font-medium text-muted-foreground">Total Users</span>
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <h2 className="text-4xl font-bold text-foreground">{users.length.toLocaleString()}</h2>
            <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-500 hover:bg-blue-500/20 mb-1 border-none">Total</Badge>
          </div>
        </div>

        {/* Active Now */}
        <div className="bg-card p-6 rounded-[2rem] relative overflow-hidden group hover:bg-accent/50 transition-colors border border-border">
          <div className="flex justify-between items-start mb-4">
            <span className="font-medium text-muted-foreground">Active Now</span>
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <h2 className="text-4xl font-bold text-foreground">{users.filter(u => u.isActive).length.toLocaleString()}</h2>
            <Badge className="bg-green-500/10 text-green-600 dark:text-green-500 hover:bg-green-500/20 mb-1 border-none">Live</Badge>
          </div>
        </div>

        {/* New Today */}
        <div className="bg-card p-6 rounded-[2rem] relative overflow-hidden group hover:bg-accent/50 transition-colors border border-border">
          <div className="flex justify-between items-start mb-4">
            <span className="font-medium text-muted-foreground">New Today</span>
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <h2 className="text-4xl font-bold text-foreground">
              {users.filter(u => new Date(u.createdAt).toDateString() === new Date().toDateString()).length.toString()}
            </h2>
            <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-500 hover:bg-purple-500/20 mb-1 border-none">Growth</Badge>
          </div>
        </div>

        {/* Admins */}
        <div className="bg-card p-6 rounded-[2rem] relative overflow-hidden group hover:bg-accent/50 transition-colors border border-border">
          <div className="flex justify-between items-start mb-4">
            <span className="font-medium text-muted-foreground">Admins</span>
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <h2 className="text-4xl font-bold text-foreground">
              {users.filter(u => u.role?.name === 'admin').length.toString()}
            </h2>
            <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-500 hover:bg-orange-500/20 mb-1 border-none">System</Badge>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Users Table */}
        <div className="lg:col-span-8 space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card border-none h-12 rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px] bg-card border-none h-12 rounded-xl text-muted-foreground">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => exportUserData('csv')}
              className="h-12 w-12 bg-card border-none rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent"
              title="Export CSV"
            >
              <Download className="w-5 h-5" />
            </Button>
          </div>

          {/* Table */}
          <div className="bg-card rounded-[2rem] overflow-hidden border border-border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-6 font-medium text-sm text-muted-foreground">User</th>
                    <th className="text-left py-4 px-6 font-medium text-sm text-muted-foreground">Role</th>
                    <th className="text-left py-4 px-6 font-medium text-sm text-muted-foreground hidden sm:table-cell">Status</th>
                    <th className="text-left py-4 px-6 font-medium text-sm text-muted-foreground hidden md:table-cell">Joined</th>
                    <th className="text-right py-4 px-6 font-medium text-sm text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="group hover:bg-accent/50 transition-colors duration-200"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-sm font-bold text-foreground">
                            {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">{user.username || 'No Username'}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="outline" className={cn(
                          "border-none",
                          user.role?.name === 'admin' ? "bg-red-500/10 text-red-600 dark:text-red-500" :
                            user.role?.name === 'moderator' ? "bg-orange-500/10 text-orange-600 dark:text-orange-500" :
                              "bg-blue-500/10 text-blue-600 dark:text-blue-500"
                        )}>
                          {user.role?.displayName || 'User'}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", user.isActive ? "bg-green-500" : "bg-red-500")} />
                          <span className="text-sm text-muted-foreground">{user.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground hidden md:table-cell">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => { setViewingUser(user); setShowViewModal(true); }} className="focus:bg-accent focus:text-accent-foreground cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setEditingUser(user);
                              setEditFormData({ username: user.username || '', role: user.role?.name || 'user', isActive: user.isActive });
                              setShowEditModal(true);
                            }} className="focus:bg-accent focus:text-accent-foreground cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" /> Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(user)} className="focus:bg-accent focus:text-accent-foreground cursor-pointer">
                              <Lock className="mr-2 h-4 w-4" /> {user.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem onClick={() => handleDeleteUser(user)} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-border flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-none bg-muted text-foreground hover:bg-accent"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-none bg-muted text-foreground hover:bg-accent"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="lg:col-span-4">
          <div className="bg-card rounded-[2rem] p-6 h-full max-h-[800px] flex flex-col border border-border">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-foreground" />
              <h3 className="text-xl font-bold text-foreground">Recent Activity</h3>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {auditLogs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No recent activity
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log._id} className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors border border-border">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-2 h-2 mt-2 rounded-full flex-shrink-0",
                        log.action.includes('DELETE') ? "bg-red-500" :
                          log.action.includes('CREATE') ? "bg-green-500" :
                            "bg-blue-500"
                      )} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{log.action.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          by <span className="text-foreground">{log.adminName || 'System'}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">Username</label>
              <Input
                value={editFormData.username}
                onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                className="bg-background border-none text-foreground"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">Role</label>
              <Select
                value={editFormData.role}
                onValueChange={(val) => setEditFormData({ ...editFormData, role: val })}
              >
                <SelectTrigger className="bg-background border-none text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Active Status</label>
              <Switch
                checked={editFormData.isActive}
                onCheckedChange={(checked) => setEditFormData({ ...editFormData, isActive: checked })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowEditModal(false)} className="text-muted-foreground hover:text-foreground hover:bg-accent">Cancel</Button>
            <Button onClick={handleSaveEdit} className="bg-primary text-primary-foreground hover:bg-primary/90">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Create New User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">Email</label>
              <Input
                type="email"
                value={createFormData.email}
                onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                className="bg-background border-none text-foreground"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">Password</label>
              <Input
                type="password"
                value={createFormData.password}
                onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                className="bg-background border-none text-foreground"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">Username</label>
              <Input
                value={createFormData.username}
                onChange={(e) => setCreateFormData({ ...createFormData, username: e.target.value })}
                className="bg-background border-none text-foreground"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">Role</label>
              <Select
                value={createFormData.role}
                onValueChange={(val) => setCreateFormData({ ...createFormData, role: val })}
              >
                <SelectTrigger className="bg-background border-none text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Is Admin?</label>
              <Switch
                checked={createFormData.isAdmin}
                onCheckedChange={(checked) => setCreateFormData({ ...createFormData, isAdmin: checked })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground hover:bg-accent">Cancel</Button>
            <Button onClick={handleCreateUser} className="bg-primary text-primary-foreground hover:bg-primary/90">Create User</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
