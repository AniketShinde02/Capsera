'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';

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
  thumbnailUrl?: string;
  userId?: string;
  originalName?: string;
}

interface ArchivedImage {
  publicId: string;
  url: string;
  thumbnailUrl: string;
  size: number;
  format: string;
  createdAt: string;
  width: number;
  height: number;
  userId: string;
  originalName: string;
  archiveDate: string;
  isArchive?: boolean;
  folder?: string;
}

export default function AdminArchivesPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<ArchiveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [searchUserId, setSearchUserId] = useState('');
  const [userArchives, setUserArchives] = useState<UserArchive[]>([]);
  const [archivedImages, setArchivedImages] = useState<ArchivedImage[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [cleanupDays, setCleanupDays] = useState(90);
  const [showImageGrid, setShowImageGrid] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ArchivedImage | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2000); // 2 second timeout
  };

  // Fetch archive statistics
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/archives');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else {
        showNotification("Error", "error");
      }
    } catch (error) {
      console.error('Error fetching archive stats:', error);
      showNotification("Failed to fetch archive statistics", "error");
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
        showNotification("Success", "success");
        // Refresh stats after cleanup
        fetchStats();
      } else {
        showNotification("Error", "error");
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
      showNotification("Failed to cleanup old archives", "error");
    } finally {
      setCleanupLoading(false);
    }
  };

  // Fetch all archived images
  const fetchArchivedImages = async () => {
    try {
      console.log('🔄 Fetching archived images...');
      const response = await fetch('/api/admin/archives?action=get-all-archives');
      const data = await response.json();
      
      console.log('📊 API Response:', data);
      console.log('📁 Archives array:', data.archives);
      console.log('🔢 Count:', data.count);
      
      if (data.success) {
        setArchivedImages(data.archives || []);
        setShowImageGrid(true);
        console.log('✅ Set archived images:', data.archives?.length || 0);
      } else {
        console.error('❌ API Error:', data.error);
        showNotification("Failed to fetch archived images", "error");
      }
    } catch (error) {
      console.error('Error fetching archived images:', error);
      showNotification("Failed to fetch archived images", "error");
    }
  };

  // Search user archives
  const handleSearchUserArchives = async () => {
    if (!searchUserId.trim()) {
      showNotification("Please enter a user ID to search", "error");
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
        showNotification(`Found ${data.count} archived images for user ${searchUserId}`, "success");
      } else {
        showNotification("Failed to fetch user archives", "error");
        setUserArchives([]);
      }
    } catch (error) {
      console.error('Error searching user archives:', error);
      showNotification("Failed to fetch user archives", "error");
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

  // Handle permanent deletion of archived image
  const handleDeleteArchivedImage = async (image: ArchivedImage) => {
    if (!confirm(`Are you sure you want to PERMANENTLY delete this archived image? This action cannot be undone and will free up storage space.`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/archives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-archived-image',
          publicId: image.publicId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        showNotification("Archived image permanently deleted", "success");
        // Remove from local state
        setArchivedImages(prev => prev.filter(img => img.publicId !== image.publicId));
        // Refresh stats
        fetchStats();
      } else {
        showNotification("Failed to delete archived image", "error");
      }
    } catch (error) {
      console.error('Error deleting archived image:', error);
      showNotification("Failed to delete archived image", "error");
    }
  };

  // Handle restore of archived image
  const handleRestoreArchivedImage = async (image: ArchivedImage) => {
    if (!confirm(`Are you sure you want to restore this archived image? It will be moved back to active storage.`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/archives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restore-archived-image',
          publicId: image.publicId,
          originalUrl: image.url
        })
      });

      const data = await response.json();
      
      if (data.success) {
        showNotification("Archived image restored successfully", "success");
        // Remove from local state
        setArchivedImages(prev => prev.filter(img => img.publicId !== image.publicId));
        // Refresh stats
        fetchStats();
      } else {
        showNotification("Failed to restore archived image", "error");
      }
    } catch (error) {
      console.error('Error restoring archived image:', error);
      showNotification("Failed to restore archived image", "error");
    }
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

      {/* Archived Images Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="w-5 h-5" />
            Archived Images Management
          </CardTitle>
          <CardDescription>
            View, restore, or permanently delete archived images
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
                     <div className="flex items-center gap-4">
             <Button 
               onClick={fetchArchivedImages}
               variant="outline"
             >
               <RefreshCw className="w-4 h-4 mr-2" />
               Load Archived Images
             </Button>
             <Button 
               onClick={async () => {
                 try {
                   console.log('🧪 Testing Cloudinary connection...');
                   const response = await fetch('/api/admin/archives?action=get-all-archives');
                   const data = await response.json();
                   console.log('🧪 Test Response:', data);
                   alert(`Test Result: ${data.success ? 'SUCCESS' : 'FAILED'}\nCount: ${data.count}\nError: ${data.error || 'None'}`);
                 } catch (error) {
                   console.error('🧪 Test Error:', error);
                   alert('Test failed: ' + error);
                 }
               }}
               variant="secondary"
               size="sm"
             >
               🧪 Test API
             </Button>
             {archivedImages.length > 0 && (
               <Badge variant="secondary">
                 {archivedImages.length} archived images
               </Badge>
             )}
           </div>

          {/* Image Grid */}
          {showImageGrid && archivedImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {archivedImages.map((image) => (
                <div key={image.publicId} className="group relative">
                  {/* Image Card */}
                  <div className="relative overflow-hidden rounded-lg border bg-background hover:shadow-md transition-shadow">
                    {/* Image */}
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={image.thumbnailUrl || image.url} 
                        alt={image.originalName || 'Archived image'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    
                    {/* Action Buttons - Hidden by default, shown on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRestoreArchivedImage(image)}
                        className="h-8 w-8 p-0"
                        title="Restore Image"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteArchivedImage(image)}
                        className="h-8 w-8 p-0"
                        title="Permanently Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Image Info */}
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium truncate" title={image.originalName || image.publicId.split('/').pop()}>
                      {image.originalName || image.publicId.split('/').pop()}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(image.size)}</span>
                      <span>{image.format.toUpperCase()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      User: {image.userId || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(image.archiveDate || image.createdAt)}
                    </p>
                    {image.folder && (
                      <Badge variant={image.isArchive ? "secondary" : "outline"} className="text-xs">
                        {image.folder}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

                     {/* Debug Info */}
           {showImageGrid && (
             <div className="bg-muted p-4 rounded-lg">
               <h4 className="font-medium mb-2">Debug Information:</h4>
               <div className="text-sm space-y-1">
                 <p>• Show Image Grid: {showImageGrid ? '✅ Yes' : '❌ No'}</p>
                 <p>• Archived Images Count: {archivedImages.length}</p>
                 <p>• Image Grid Visible: {showImageGrid && archivedImages.length > 0 ? '✅ Yes' : '❌ No'}</p>
                 <p>• Last API Call: {new Date().toLocaleTimeString()}</p>
                 <p>• Images from API: {JSON.stringify(archivedImages.slice(0, 2).map(img => ({ publicId: img.publicId, folder: img.folder })))}</p>
                 <p>• API Endpoint: /api/admin/archives?action=get-all-archives</p>
                 <p>• Cloudinary Status: {archivedImages.length > 0 ? '✅ Connected' : '❌ No Images'}</p>
               </div>
             </div>
           )}

           {/* No Images Message */}
           {showImageGrid && archivedImages.length === 0 && (
             <div className="text-center py-12 text-muted-foreground">
               <FileImage className="h-16 w-16 mx-auto mb-4 text-gray-300" />
               <p className="text-lg font-medium">No archived images found</p>
               <p className="text-sm">All archived images have been processed or no images are currently archived.</p>
               <p className="text-xs mt-2 text-blue-500">Check console for debug information</p>
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
