'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Archive, 
  Trash2, 
  Download, 
  Search, 
  RefreshCw, 
  FileImage,
  User,
  Calendar,
  HardDrive,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ArchiveStats {
  totalArchived: number;
  totalSize: number;
  oldestArchive: string;
  newestArchive: string;
  uniqueUsers: number;
  userBreakdown: { [key: string]: number };
  timestamp: string;
}

interface UserArchive {
  publicId: string;
  url: string;
  size: number;
  format: string;
  createdAt: string;
  width: number;
  height: number;
}

export default function AdminArchivesPage() {
  const [stats, setStats] = useState<ArchiveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [searchUserId, setSearchUserId] = useState('');
  const [userArchives, setUserArchives] = useState<UserArchive[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [cleanupDays, setCleanupDays] = useState(90);
  const { toast } = useToast();

  // Fetch archive statistics
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/archives');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch archive statistics",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching archive stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch archive statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Clean up old archived images
  const handleCleanup = async () => {
    if (!confirm(`Are you sure you want to delete archived images older than ${cleanupDays} days? This action cannot be undone.`)) {
      return;
    }

    try {
      setCleanupLoading(true);
      const response = await fetch('/api/admin/archives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cleanup',
          daysOld: cleanupDays
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });
        // Refresh stats after cleanup
        fetchStats();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to cleanup old archives",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
      toast({
        title: "Error",
        description: "Failed to cleanup old archives",
        variant: "destructive"
      });
    } finally {
      setCleanupLoading(false);
    }
  };

  // Search user archives
  const handleSearchUserArchives = async () => {
    if (!searchUserId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a user ID to search",
        variant: "destructive"
      });
      return;
    }

    try {
      setSearchLoading(true);
      const response = await fetch('/api/admin/archives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get-user-archives',
          userId: searchUserId.trim()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setUserArchives(data.archives);
        toast({
          title: "Success",
          description: `Found ${data.count} archived images for user ${searchUserId}`,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch user archives",
          variant: "destructive"
        });
        setUserArchives([]);
      }
    } catch (error) {
      console.error('Error searching user archives:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user archives",
        variant: "destructive"
      });
      setUserArchives([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Archive Management</h1>
          <p className="text-muted-foreground">
            Manage Cloudinary archives and cleanup old files
          </p>
        </div>
        <Button onClick={fetchStats} disabled={loading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Archive Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="w-5 h-5" />
            Archive Statistics
          </CardTitle>
          <CardDescription>
            Overview of archived images and storage usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Loading archive statistics...
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.totalArchived}</div>
                <div className="text-sm text-muted-foreground">Total Archived</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.totalSize} MB</div>
                <div className="text-sm text-muted-foreground">Total Size</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.uniqueUsers}</div>
                <div className="text-sm text-muted-foreground">Unique Users</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {stats.oldestArchive ? formatDate(stats.oldestArchive) : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Oldest Archive</div>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Failed to load archive statistics
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* User Breakdown */}
      {stats?.userBreakdown && Object.keys(stats.userBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              User Archive Breakdown
            </CardTitle>
            <CardDescription>
              Number of archived images per user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.userBreakdown)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([userId, count]) => (
                  <div key={userId} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-mono text-sm">{userId}</span>
                    <Badge variant="secondary">{count} images</Badge>
                  </div>
                ))}
              {Object.keys(stats.userBreakdown).length > 10 && (
                <div className="text-sm text-muted-foreground text-center pt-2">
                  Showing top 10 users. Total: {Object.keys(stats.userBreakdown).length} users
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cleanup Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Archive Cleanup
          </CardTitle>
          <CardDescription>
            Remove old archived images to free up storage space
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="cleanup-days">Delete archives older than (days)</Label>
              <Input
                id="cleanup-days"
                type="number"
                value={cleanupDays}
                onChange={(e) => setCleanupDays(Number(e.target.value))}
                min="1"
                max="365"
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleCleanup} 
              disabled={cleanupLoading}
              variant="destructive"
            >
              {cleanupLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Cleanup Old Archives
            </Button>
          </div>
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              This action will permanently delete archived images older than the specified number of days. 
              This cannot be undone.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* User Archive Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search User Archives
          </CardTitle>
          <CardDescription>
            Find archived images for a specific user
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="search-user-id">User ID</Label>
              <Input
                id="search-user-id"
                placeholder="Enter user ID to search"
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleSearchUserArchives} 
              disabled={searchLoading || !searchUserId.trim()}
            >
              {searchLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Search
            </Button>
          </div>

          {/* Search Results */}
          {userArchives.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Search Results</h3>
                <Badge variant="secondary">{userArchives.length} images found</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userArchives.map((archive) => (
                  <div key={archive.publicId} className="border rounded-lg p-4 space-y-2">
                    <div className="aspect-square bg-muted rounded overflow-hidden">
                      <img 
                        src={archive.url} 
                        alt="Archived image"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-mono truncate">{archive.publicId.split('/').pop()}</div>
                      <div className="text-xs text-muted-foreground">
                        {archive.width} × {archive.height} • {archive.format.toUpperCase()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(archive.size)} • {formatDate(archive.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last Updated */}
      {stats?.timestamp && (
        <div className="text-center text-sm text-muted-foreground">
          Last updated: {formatDate(stats.timestamp)}
        </div>
      )}
    </div>
  );
}
