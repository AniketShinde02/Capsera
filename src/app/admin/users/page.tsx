'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserPlus,
  Shield,
  Calendar,
  Mail,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Download
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

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

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: '',
    role: '',
    isActive: true
  });
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    email: '',
    username: '',
    password: '',
    role: 'user',
    isAdmin: false
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(20);
  const [totalUsers, setTotalUsers] = useState(0);

  // Export user data functionality
  const exportUserData = async (format: 'csv' | 'json') => {
    try {
      if (!users || users.length === 0) {
        toast({
          title: "No Data",
          description: "No users to export",
          variant: "destructive"
        });
        return;
      }

      const exportData = {
        timestamp: new Date().toISOString(),
        totalUsers: users.length,
        users: users.map(user => ({
          id: user._id,
          email: user.email,
          username: user.username || 'N/A',
          role: user.role?.name || 'N/A',
          createdAt: user.createdAt,
          lastLogin: user.lastLogin || 'Never',
          isActive: user.isActive ? 'Yes' : 'No'
        }))
      };

      if (format === 'csv') {
        const headers = ['ID', 'Email', 'Username', 'Role', 'Created At', 'Last Login', 'Active'];
        const rows = exportData.users.map(user => [
          user.id || 'N/A',
          user.email || 'N/A',
          user.username || 'N/A',
          user.role || 'N/A',
          user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
          user.lastLogin === 'Never' ? 'Never' : (user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'),
          user.isActive || 'N/A'
        ]);

        // Helper function to safely escape CSV values
        const escapeCSV = (value: any): string => {
          if (value === null || value === undefined) return 'N/A';
          const stringValue = String(value);
          // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        };

        const csvContent = [headers.join(','), ...rows.map(row => row.map(escapeCSV).join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Export Successful",
          description: "User data exported as CSV file",
        });
      } else {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Export Successful",
          description: "User data exported as JSON file",
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export user data",
        variant: "destructive"
      });
    }
  };

  // Fetch REAL data from database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Real API call to get users from database
        const response = await fetch('/api/admin/users');
        
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        } else {
          console.error('Failed to fetch users:', response.status);
          // NO MORE MOCK DATA - show error state instead
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        // NO MORE MOCK DATA - show error state instead
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // CRUD Functions for User Management
  const handleCreateUser = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createFormData)
      });

      if (response.ok) {
        const data = await response.json();
        setUsers([...users, data.user]);
        setShowCreateModal(false);
        setCreateFormData({ email: '', username: '', password: '', role: 'user', isAdmin: false });
        toast({
          title: "Success",
          description: "User created successfully",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: `Failed to create user: ${errorData.error}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Error creating user",
        variant: "destructive"
      });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      username: user.username || '',
      role: user.role?.name || '',
      isActive: user.isActive
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${editingUser._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        // Update user in local state
        setUsers(users.map(u => 
          u._id === editingUser._id ? { 
            ...u, 
            username: editFormData.username,
            role: { 
              name: editFormData.role, 
              displayName: editFormData.role 
            },
            isActive: editFormData.isActive
          } : u
        ));
        setShowEditModal(false);
        setEditingUser(null);
        toast({
          title: "Success",
          description: "User updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update user",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Error updating user",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (confirm(`Are you sure you want to delete user: ${user.email}?`)) {
      try {
        const response = await fetch(`/api/admin/users/${user._id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
                  // Remove user from local state
        setUsers(users.filter(u => u._id !== user._id));
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Error deleting user",
        variant: "destructive"
      });
    }
    }
  };

  const handleViewUser = (user: User) => {
    setViewingUser(user);
    setShowViewModal(true);
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      const response = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !user.isActive
        })
      });
      
      if (response.ok) {
        // Update user status in local state
        setUsers(users.map(u => 
          u._id === user._id ? { ...u, isActive: !u.isActive } : u
        ));
        toast({
          title: "Success",
          description: `User ${user.isActive ? 'deactivated' : 'activated'} successfully`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update user status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Error updating user status",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesRole = filterRole === 'all' || user.role?.name === filterRole;
    return matchesSearch && matchesRole;
  });

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case 'admin': return 'destructive';
      case 'moderator': return 'secondary';
      case 'user': return 'default';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no users
  if (users.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header - Mobile First */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Manage user accounts and permissions</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="h-10 sm:h-9 text-sm">
            <UserPlus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add User</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {/* Empty State */}
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <Users className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">No Users Found</h3>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base">
              There are currently no users in the system.
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Users will appear here once they register or are created by administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile First */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage user accounts and permissions</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => exportUserData('csv')} 
            className="h-10 sm:h-9 text-sm"
          >
            📊 Export CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={() => exportUserData('json')} 
            className="h-10 sm:h-9 text-sm"
          >
            📈 Export JSON
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="h-10 sm:h-9 text-sm">
            <UserPlus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add User</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards - Mobile First */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-lg sm:text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Admins</p>
                <p className="text-lg sm:text-2xl font-bold">{users.filter(u => u.role?.name === 'admin').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Active Today</p>
                <p className="text-lg sm:text-2xl font-bold">{users.filter(u => u.lastLogin && new Date(u.lastLogin).toDateString() === new Date().toDateString()).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">New This Week</p>
                <p className="text-lg sm:text-2xl font-bold">{users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search - Mobile First */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by email or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 sm:h-9 text-sm"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background h-10 sm:h-9 text-sm"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="user">User</option>
              </select>
              
              <Button variant="outline" size="sm" className="h-10 sm:h-9 text-sm">
                <Filter className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">More Filters</span>
                <span className="sm:hidden">Filters</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table - Mobile First */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm">User</th>
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm">Role</th>
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm hidden sm:table-cell">Joined</th>
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm hidden sm:table-cell">Last Login</th>
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm">Status</th>
                  <th className="text-right py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user._id} className="border-b border-border/50">
                    <td className="py-3 px-2 sm:px-4">
                      <div>
                        <p className="font-medium text-sm sm:text-base">{user.username || 'No username'}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-2 sm:px-4">
                      <Badge variant={getRoleBadgeVariant(user.role?.name || '')} className="text-xs">
                        {user.role?.displayName || 'Unknown'}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-muted-foreground hidden sm:table-cell">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-muted-foreground hidden sm:table-cell">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-3 px-2 sm:px-4">
                      <Badge variant={user.isActive ? 'default' : 'secondary'} className="text-xs">
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewUser(user)}
                          title="View user details"
                          className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditUser(user)}
                          title="Edit user"
                          className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleToggleUserStatus(user)}
                          title={user.isActive ? 'Deactivate user' : 'Activate user'}
                          className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                        >
                          <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteUser(user)}
                          title="Delete user"
                          className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Modal - Mobile First */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Username</label>
              <Input
                value={editFormData.username}
                onChange={(e) => setEditFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter username"
                className="h-10 sm:h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <select
                value={editFormData.role}
                onChange={(e) => setEditFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-md bg-background h-10 sm:h-9 text-sm"
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={editFormData.isActive}
                onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <label className="text-sm font-medium">Active</label>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowEditModal(false)} className="h-10 sm:h-9 text-sm">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="h-10 sm:h-9 text-sm">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View User Modal - Mobile First */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">User Details</DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm">{viewingUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Username</label>
                <p className="text-sm">{viewingUser.username || 'No username set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <p className="text-sm">{viewingUser.role?.displayName || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <p className="text-sm">{viewingUser.isActive ? 'Active' : 'Inactive'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Joined</label>
                <p className="text-sm">{new Date(viewingUser.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                <p className="text-sm">{viewingUser.lastLogin ? new Date(viewingUser.lastLogin).toLocaleDateString() : 'Never'}</p>
              </div>
            </div>
          )}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setShowViewModal(false)} className="h-10 sm:h-9 text-sm">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create User Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={createFormData.email}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="User Email"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Username</label>
              <Input
                value={createFormData.username}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="username"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={createFormData.password}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Minimum 8 characters"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <select
                value={createFormData.role}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-md bg-background h-10 text-sm"
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAdmin"
                checked={createFormData.isAdmin}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, isAdmin: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="isAdmin" className="text-sm font-medium">Create as Admin User</label>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser}>
              Create User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
