'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image as ImageIcon, Trash2, Download, Eye, AlertTriangle, CheckCircle, XCircle, Settings, Search, Filter, RefreshCw, Info, Database, HardDrive, Clock } from 'lucide-react';
import JSZip from 'jszip';
import { MagicCard } from '@/components/admin/dashboard/magic-card';
import { cn } from '@/lib/utils';

interface ImageItem {
  id: string;
  filename: string;
  originalName: string;
  size: string;
  dimensions: string;
  format: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'approved' | 'pending' | 'rejected' | 'flagged';
  tags: string[];
  url: string;
  thumbnailUrl: string;
  moderationNotes?: string;
  flaggedReason?: string;
  storageLocation: string;
  accessCount: number;
  lastAccessed: string;
}

interface StorageMetrics {
  totalImages: number;
  totalSize: string;
  usedStorage: string;
  availableStorage: string;
  storagePercentage: number;
  imagesToday: number;
  imagesThisWeek: number;
  imagesThisMonth: number;
  averageImageSize: string;
}

interface ModerationQueue {
  pending: number;
  flagged: number;
  rejected: number;
  approved: number;
}

export default function ImageManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [storageMetrics, setStorageMetrics] = useState<StorageMetrics>({
    totalImages: 0,
    totalSize: '0 MB',
    usedStorage: '0 MB',
    availableStorage: '0 GB',
    storagePercentage: 0,
    imagesToday: 0,
    imagesThisWeek: 0,
    imagesThisMonth: 0,
    averageImageSize: '0 MB'
  });
  const [moderationQueue, setModerationQueue] = useState<ModerationQueue>({
    pending: 0,
    flagged: 0,
    rejected: 0,
    approved: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [showModerationDialog, setShowModerationDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [moderationNotes, setModerationNotes] = useState('');
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject' | 'flag'>('approve');
  const [downloadingImage, setDownloadingImage] = useState<string | null>(null);
  const [exportingData, setExportingData] = useState(false);
  const [bulkDownloadProgress, setBulkDownloadProgress] = useState<{ current: number; total: number; zipSize?: string } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [imagesPerPage] = useState(12);
  const [totalImages, setTotalImages] = useState(0);

  // Plain text notification system
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Download image functionality
  const downloadImage = async (image: ImageItem) => {
    try {
      setDownloadingImage(image.id);
      console.log('🔄 Starting download for:', image.originalName);

      if (!image.url || image.url === 'https://placehold.co/400text=No+Image') {
        showNotification("Cannot download: Invalid image URL", "error");
        return;
      }

      const response = await fetch(image.url, {
        method: 'GET',
        mode: 'cors',
        headers: { 'Accept': 'image/*' }
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.originalName || image.filename || `image-${Date.now()}.png`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      showNotification(`Downloading ${image.originalName || 'image'}...`, "info");

    } catch (error) {
      console.error('❌ Download failed:', error);
      if (image.url.includes('cloudinary.com')) {
        try {
          window.open(image.url, '_blank');
          showNotification("Image opened in new tab for manual download", "info");
        } catch (altError) {
          showNotification("Download Failed. Please right-click the image and 'Save image as...'.", "error");
        }
      } else {
        showNotification("Download Failed. Please try again or contact support.", "error");
      }
    } finally {
      setDownloadingImage(null);
    }
  };

  // Download all images as ZIP
  const downloadAllImages = async () => {
    try {
      if (images.length === 0) {
        showNotification("No images available for download", "error");
        return;
      }

      showNotification("Preparing images for compression...", "info");

      const zip = new JSZip();
      let processedCount = 0;
      setBulkDownloadProgress({ current: 0, total: images.length });

      for (const image of images) {
        try {
          if (image.url && image.url !== 'https://via.placeholder.com/400x400/cccccc/666666?text=No+Image') {
            const response = await fetch(image.url, {
              method: 'GET',
              mode: 'cors',
              headers: { 'Accept': 'image/*' }
            });

            if (response.ok) {
              const blob = await response.blob();
              const extension = image.format.toLowerCase();
              const filename = `${image.originalName || image.filename || `image-${Date.now()}`}.${extension}`;
              zip.file(filename, blob);
              processedCount++;
              setBulkDownloadProgress({ current: processedCount, total: images.length });
            }
          }
        } catch (error) {
          console.error(`❌ Error processing ${image.originalName}:`, error);
        }
      }

      if (processedCount === 0) {
        showNotification("Failed to process any images for ZIP creation", "error");
        return;
      }

      showNotification("Compressing ZIP File...", "info");

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      const zipSizeMB = (zipBlob.size / 1024 / 1024).toFixed(2);
      setBulkDownloadProgress(prev => prev ? { ...prev, zipSize: `${zipSizeMB} MB` } : null);

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `images-bulk-download-${new Date().toISOString().split('T')[0]}.zip`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(url), 100);

      showNotification(`Successfully downloaded ${processedCount} images in compressed ZIP file`, "success");

    } catch (error) {
      console.error('Bulk download failed:', error);
      showNotification("ZIP Creation Failed. Please try individual downloads.", "error");
    } finally {
      setBulkDownloadProgress(null);
    }
  };

  // Export image data as CSV or JSON
  const exportImageData = async (format: 'csv' | 'json') => {
    try {
      if (images.length === 0) {
        showNotification("No data available for export", "error");
        return;
      }

      setExportingData(true);

      const exportData = {
        timestamp: new Date().toISOString(),
        totalImages: images.length,
        images: images.map(img => ({
          id: img.id,
          filename: img.filename,
          originalName: img.originalName,
          size: img.size,
          dimensions: img.dimensions,
          format: img.format,
          uploadedBy: img.uploadedBy,
          uploadedAt: img.uploadedAt,
          status: img.status,
          tags: img.tags.join(', '),
          url: img.url,
          storageLocation: img.storageLocation,
          accessCount: img.accessCount,
          lastAccessed: img.lastAccessed
        }))
      };

      if (format === 'csv') {
        const headers = ['ID', 'Filename', 'Original Name', 'Size', 'Dimensions', 'Format', 'Uploaded By', 'Uploaded At', 'Status', 'Tags', 'URL', 'Storage Location', 'Access Count', 'Last Accessed'];
        const rows = exportData.images.map(img => [
          img.id || 'N/A',
          img.filename || 'N/A',
          img.originalName || 'N/A',
          img.size || 'N/A',
          img.dimensions || 'N/A',
          img.format || 'N/A',
          img.uploadedBy || 'N/A',
          img.uploadedAt ? new Date(img.uploadedAt).toLocaleDateString() : 'N/A',
          img.status || 'N/A',
          Array.isArray(img.tags) ? img.tags.join(', ') : 'N/A',
          img.url || 'N/A',
          img.storageLocation || 'N/A',
          img.accessCount || 'N/A',
          img.lastAccessed === 'Never' ? 'Never' : (img.lastAccessed ? new Date(img.lastAccessed).toLocaleDateString() : 'N/A')
        ]);

        const escapeCSV = (value: any): string => {
          if (value === null || value === undefined) return 'N/A';
          const stringValue = String(value);
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
        a.download = `images-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification("Image data exported as CSV file", "success");
      } else {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `images-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification("Image data exported as JSON file", "success");
      }
    } catch (error) {
      console.error('Export failed:', error);
      showNotification("Failed to export image data", "error");
    } finally {
      setExportingData(false);
    }
  };

  // Fetch REAL data from database
  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/images');

      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
        setStorageMetrics(data.storageMetrics || storageMetrics);
        setModerationQueue(data.moderationQueue || moderationQueue);
      } else {
        console.error('Failed to fetch images:', response.status);
        setImages([]);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  // Silent background refresh function
  const fetchImagesSilently = async () => {
    try {
      const response = await fetch('/api/admin/images');
      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
        setStorageMetrics(data.storageMetrics || storageMetrics);
        setModerationQueue(data.moderationQueue || moderationQueue);
      }
    } catch (error) {
      console.error('❌ Silent refresh failed:', error);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchImages();
      const interval = setInterval(fetchImagesSilently, 30000);
      return () => clearInterval(interval);
    }
  }, [session, status]);

  // Filter images based on search and filters
  const filteredImages = images.filter(image => {
    const matchesSearch = searchTerm === '' ||
      image.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || image.status === statusFilter;
    const matchesFormat = formatFilter === 'all' || image.format.toLowerCase() === formatFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesFormat;
  });

  // Pagination logic
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = filteredImages.slice(indexOfFirstImage, indexOfLastImage);
  const totalPages = Math.ceil(filteredImages.length / imagesPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleModeration = async () => {
    if (!selectedImage) return;
    if (!moderationNotes.trim()) {
      showNotification("Please enter moderation notes", "error");
      return;
    }

    try {
      const response = await fetch(`/api/admin/images/${selectedImage.id}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: moderationAction,
          notes: moderationNotes,
          status: moderationAction === 'approve' ? 'approved' :
            moderationAction === 'reject' ? 'rejected' : 'flagged'
        })
      });

      if (response.ok) {
        showNotification(`Image ${moderationAction}d successfully`, "success");
        setTimeout(() => fetchImages(), 1000);
        setShowModerationDialog(false);
        setSelectedImage(null);
        setModerationNotes('');
        setModerationAction('approve');
      } else {
        const errorData = await response.json();
        showNotification(`Failed to moderate image: ${errorData.error || 'Unknown error'}`, "error");
      }
    } catch (error) {
      showNotification("Network error", "error");
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/admin/images/${imageId}`, { method: 'DELETE' });

      if (response.ok) {
        setImages(prev => prev.filter(img => img.id !== imageId));
        setTimeout(() => fetchImages(), 1000);
        setShowDeleteDialog(false);
        setSelectedImage(null);
        showNotification("Image deleted successfully", "success");
      } else {
        showNotification("Failed to delete image", "error");
      }
    } catch (error) {
      showNotification("Network error", "error");
    }
  };

  const getStatusColor = (status: ImageItem['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'flagged': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    }
  };

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
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
            notification.type === 'error' ? <AlertTriangle className="w-5 h-5" /> :
              <Info className="w-5 h-5" />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Image Vault</h1>
          <p className="text-muted-foreground">Manage and moderate user-uploaded content.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => { setLoading(true); fetchImages(); }}
            className="bg-card border-border text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button
            onClick={downloadAllImages}
            disabled={images.length === 0 || bulkDownloadProgress !== null}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {bulkDownloadProgress ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {bulkDownloadProgress ? `Zipping...` : `Download All`}
          </Button>
          <Button
            variant="outline"
            onClick={() => exportImageData('csv')}
            disabled={exportingData}
            className="bg-card border-border text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MagicCard
          title="Total Images"
          value={storageMetrics.totalImages.toLocaleString()}
          icon={ImageIcon}
          trend="neutral"
          trendValue="Stored"
          className="bg-card border-none"
        />
        <MagicCard
          title="Storage Used"
          value={storageMetrics.usedStorage}
          icon={Database}
          trend="neutral"
          trendValue={`of ${storageMetrics.totalSize}`}
          className="bg-card border-none"
        />
        <MagicCard
          title="Pending Review"
          value={moderationQueue.pending.toString()}
          icon={AlertTriangle}
          trend="down"
          trendValue="Queue"
          className="bg-card border-none"
        />
        <MagicCard
          title="New Today"
          value={storageMetrics.imagesToday.toString()}
          icon={Clock}
          trend="up"
          trendValue="Uploads"
          className="bg-card border-none"
        />
      </div>

      {/* Bulk Download Progress */}
      {bulkDownloadProgress && (
        <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Bulk Download Progress</span>
            <span className="text-sm text-blue-600 dark:text-blue-400">{bulkDownloadProgress.current} / {bulkDownloadProgress.total}</span>
          </div>
          <Progress value={(bulkDownloadProgress.current / bulkDownloadProgress.total) * 100} className="h-2 bg-blue-500/20" />
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            Creating ZIP file... {bulkDownloadProgress.zipSize && `Size: ${bulkDownloadProgress.zipSize}`}
          </p>
        </div>
      )}

      {/* Filters & Grid */}
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 p-4 rounded-[2rem] bg-card border border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-none text-foreground h-10 rounded-xl focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px] bg-background border-none text-foreground h-10 rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
          <Select value={formatFilter} onValueChange={setFormatFilter}>
            <SelectTrigger className="w-full md:w-[180px] bg-background border-none text-foreground h-10 rounded-xl">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              <SelectItem value="all">All Formats</SelectItem>
              <SelectItem value="JPEG">JPEG</SelectItem>
              <SelectItem value="PNG">PNG</SelectItem>
              <SelectItem value="GIF">GIF</SelectItem>
              <SelectItem value="WEBP">WEBP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Images Grid */}
        {filteredImages.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-[2rem] border border-border">
            <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">No images found</p>
            <p className="text-sm text-muted-foreground/80">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {currentImages.map((image) => (
              <div key={image.id} className="group relative bg-card rounded-xl overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all border border-border">
                <div className="aspect-square relative overflow-hidden bg-muted/20">
                  {image.thumbnailUrl && image.thumbnailUrl !== 'https://via.placeholder.com/400x400/cccccc/666666?text=No+Image' ? (
                    <img
                      src={image.thumbnailUrl}
                      alt={image.originalName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLElement).parentElement?.querySelector('.fallback')?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  <div className="fallback hidden w-full h-full absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
                    <ImageIcon className="w-8 h-8" />
                  </div>

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                      onClick={() => { setSelectedImage(image); setShowModerationDialog(true); }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                      onClick={() => downloadImage(image)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-400 hover:bg-red-500/20 rounded-full"
                      onClick={() => { setSelectedImage(image); setShowDeleteDialog(true); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="absolute top-2 left-2">
                    <Badge className={cn("text-[10px] border-none", getStatusColor(image.status))}>
                      {image.status}
                    </Badge>
                  </div>
                </div>

                <div className="p-3">
                  <p className="text-sm font-medium text-foreground truncate" title={image.originalName}>{image.originalName}</p>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{image.size}</span>
                    <span>{image.format}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredImages.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
            <div className="text-sm text-muted-foreground">
              Showing {indexOfFirstImage + 1}-{Math.min(indexOfLastImage, filteredImages.length)} of {filteredImages.length}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Moderation Dialog */}
      <Dialog open={showModerationDialog} onOpenChange={setShowModerationDialog}>
        <DialogContent className="max-w-2xl bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Image Moderation</DialogTitle>
            <DialogDescription className="text-muted-foreground">Review and moderate the selected image</DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <h4 className="font-medium text-foreground">Details</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Filename:</span> <span className="truncate text-foreground">{selectedImage.filename}</span>
                    <span className="text-muted-foreground">Size:</span> <span className="text-foreground">{selectedImage.size}</span>
                    <span className="text-muted-foreground">Uploaded:</span> <span className="text-foreground">{new Date(selectedImage.uploadedAt).toLocaleDateString()}</span>
                    <span className="text-muted-foreground">By:</span> <span className="text-foreground">{selectedImage.uploadedBy}</span>
                  </div>
                </div>
                <div className="aspect-video bg-background rounded-lg overflow-hidden flex items-center justify-center border border-border">
                  {selectedImage.thumbnailUrl ? (
                    <img src={selectedImage.thumbnailUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                  ) : <ImageIcon className="text-muted-foreground" />}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Action</label>
                <div className="flex gap-4">
                  {['approve', 'reject', 'flag'].map((action) => (
                    <label key={action} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="moderation"
                        value={action}
                        checked={moderationAction === action}
                        onChange={(e) => setModerationAction(e.target.value as any)}
                        className="accent-primary"
                      />
                      <span className="capitalize text-foreground">{action}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Notes</label>
                <Textarea
                  value={moderationNotes}
                  onChange={(e) => setModerationNotes(e.target.value)}
                  placeholder="Enter moderation notes..."
                  className="bg-background border-border text-foreground resize-none focus-visible:ring-primary"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" onClick={() => setShowModerationDialog(false)} className="text-muted-foreground hover:text-foreground">Cancel</Button>
                <Button onClick={handleModeration} className="bg-primary hover:bg-primary/90 text-primary-foreground">Apply Action</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete this image? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)} className="text-muted-foreground hover:text-foreground">Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => selectedImage && handleDeleteImage(selectedImage.id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
