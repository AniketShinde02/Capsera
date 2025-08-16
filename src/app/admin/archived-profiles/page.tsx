'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Archive, 
  Search, 
  Filter, 
  Eye, 
  RotateCcw, 
  Trash2,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface ArchivedProfile {
  _id: string;
  email: string;
  username?: string;
  deletionReason: string;
  deletedBy: string;
  deletedAt: string;
  recoveryRequested: boolean;
  recoveryStatus: 'pending' | 'approved' | 'denied' | 'none';
  retentionDays: number;
  dataSize: string;
  isRecoverable: boolean;
}

export default function ArchivedProfilesPage() {
  const [profiles, setProfiles] = useState<ArchivedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReason, setFilterReason] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch real data from database
  useEffect(() => {
    const fetchArchivedProfiles = async () => {
      try {
        setLoading(true);
        
        // Real API call to get archived profiles
        const response = await fetch('/api/admin/archived-profiles');
        
        if (response.ok) {
          const data = await response.json();
          setProfiles(data.profiles || []);
        } else {
          console.error('Failed to fetch archived profiles:', response.status);
          // NO MORE MOCK DATA - show empty state instead
          setProfiles([]);
        }
      } catch (error) {
        console.error('Error fetching archived profiles:', error);
        // NO MORE MOCK DATA - show empty state instead
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArchivedProfiles();
  }, []);

  // REMOVED: getMockArchivedProfiles function - no more mock data!

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (profile.username?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesReason = filterReason === 'all' || profile.deletionReason.toLowerCase().includes(filterReason.toLowerCase());
    const matchesStatus = filterStatus === 'all' || profile.recoveryStatus === filterStatus;
    return matchesSearch && matchesReason && matchesStatus;
  });

  const getRecoveryStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved': return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'denied': return <Badge variant="destructive">Denied</Badge>;
      default: return <Badge variant="outline">No Request</Badge>;
    }
  };

  const getDaysLeft = (deletedAt: string, retentionDays: number) => {
    const deletedDate = new Date(deletedAt);
    const expiryDate = new Date(deletedDate.getTime() + (retentionDays * 24 * 60 * 60 * 1000));
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return { text: 'Expired', color: 'text-red-600' };
    if (diffDays <= 7) return { text: `${diffDays} days left`, color: 'text-orange-600' };
    return { text: `${diffDays} days left`, color: 'text-green-600' };
  };

  const handleRecoverProfile = async (profileId: string) => {
    try {
      const response = await fetch(`/api/admin/archived-profiles/${profileId}/recover`, {
        method: 'POST'
      });
      
      if (response.ok) {
        // Update local state
        setProfiles(prev => prev.map(p => 
          p._id === profileId ? { ...p, recoveryStatus: 'approved' as const } : p
        ));
      } else {
        console.error('Failed to recover profile');
      }
    } catch (error) {
      console.error('Error recovering profile:', error);
    }
  };

  const handleDenyRecovery = async (profileId: string) => {
    try {
      const response = await fetch(`/api/admin/archived-profiles/${profileId}/deny`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setProfiles(prev => prev.map(p => 
          p._id === profileId ? { ...p, recoveryStatus: 'denied' as const } : p
        ));
      }
    } catch (error) {
      console.error('Error denying recovery:', error);
    }
  };

  const handlePermanentDelete = async (profileId: string) => {
    if (!confirm('Are you sure you want to permanently delete this profile? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/archived-profiles/${profileId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setProfiles(prev => prev.filter(p => p._id !== profileId));
      }
    } catch (error) {
      console.error('Error permanently deleting profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading archived profiles...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no profiles
  if (profiles.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Archived Profiles</h1>
            <p className="text-muted-foreground">Manage deleted user profiles and recovery requests</p>
          </div>
        </div>

        {/* Empty State */}
        <Card>
          <CardContent className="p-12 text-center">
            <Archive className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Archived Profiles</h3>
            <p className="text-muted-foreground mb-4">
              There are currently no archived profiles in the system.
            </p>
            <p className="text-sm text-muted-foreground">
              Profiles will appear here when users are deleted or accounts are deactivated.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalArchived = profiles.length;
  const recoverable = profiles.filter(p => p.isRecoverable).length;
  const pendingRecovery = profiles.filter(p => p.recoveryStatus === 'pending').length;
  const permanentlyDeleted = profiles.filter(p => !p.isRecoverable).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Archived Profiles</h1>
          <p className="text-muted-foreground">Manage deleted user profiles and recovery requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Archive className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Archived</p>
                <p className="text-2xl font-bold">{totalArchived}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recoverable</p>
                <p className="text-2xl font-bold">{recoverable}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Recovery</p>
                <p className="text-2xl font-bold">{pendingRecovery}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trash2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Permanently Deleted</p>
                <p className="text-2xl font-bold">{permanentlyDeleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search archived profiles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterReason}
                onChange={(e) => setFilterReason(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Reasons</option>
                <option value="user requested">User Requested</option>
                <option value="terms violation">Terms Violation</option>
                <option value="deactivation">Deactivation</option>
                <option value="admin action">Admin Action</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Profiles</option>
                <option value="pending">Pending Recovery</option>
                <option value="approved">Approved Recovery</option>
                <option value="denied">Denied Recovery</option>
                <option value="none">No Request</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Archived Profiles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Archived Profiles ({filteredProfiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Profile</th>
                  <th className="text-left py-3 px-4 font-medium">Deletion Info</th>
                  <th className="text-left py-3 px-4 font-medium">Recovery Status</th>
                  <th className="text-left py-3 px-4 font-medium">Data Retention</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map((profile) => {
                  const daysLeft = getDaysLeft(profile.deletedAt, profile.retentionDays);
                  return (
                    <tr key={profile._id} className="border-b border-border/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{profile.username || 'No username'}</p>
                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(profile.deletedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{profile.deletionReason}</p>
                          <p className="text-xs text-muted-foreground">
                            Deleted by: {profile.deletedBy}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(profile.deletedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="space-y-2">
                          {getRecoveryStatusBadge(profile.recoveryStatus)}
                          {profile.isRecoverable && profile.recoveryStatus === 'none' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRecoverProfile(profile._id)}
                              className="w-full"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Recoverable
                            </Button>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <p className={`text-sm font-medium ${daysLeft.color}`}>
                            {daysLeft.text}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Retention: {profile.retentionDays} days
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Data size: {profile.dataSize}
                          </p>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {profile.recoveryStatus === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleRecoverProfile(profile._id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDenyRecovery(profile._id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handlePermanentDelete(profile._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
