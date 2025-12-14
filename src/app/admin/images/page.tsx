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
import { Image as ImageIcon, Trash2, Download, Eye, AlertTriangle, CheckCircle, XCircle, Settings, Search, Filter, RefreshCw, Info, Database, HardDrive, Clock, CheckSquare, Square, X, HelpCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import JSZip from 'jszip';
import { MagicCard } from '@/components/admin/dashboard/magic-card';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

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

  // Selection State
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Dialog States
  const [showModerationDialog, setShowModerationDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Action States
  const [moderationNotes, setModerationNotes] = useState('');
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject' | 'flag'>('approve');
  const [downloadingImage, setDownloadingImage] = useState<string | null>(null);
  const [exportingData, setExportingData] = useState(false);
  const [bulkDownloadProgress, setBulkDownloadProgress] = useState<{ current: number; total: number; zipSize?: string; compressing?: boolean; compressionPercent?: number } | null>(null);

  // Inline Feedback State
  const [inlineMessage, setInlineMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [imagesPerPage] = useState(12);
  const [totalImages, setTotalImages] = useState(0);

  // Plain text notification system (Global fallback)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- Selection Logic ---

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === currentImages.length) {
      setSelectedIds(new Set());
    } else {
      const newSelected = new Set(currentImages.map(img => img.id));
      setSelectedIds(newSelected);
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // --- Download Logic ---

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

  const downloadAllImages = async () => {
    try {
      if (images.length === 0) {
        showNotification("No images available for download", "error");
        return;
      }

      showNotification("Starting bulk download...", "info");

      const zip = new JSZip();
      let processedCount = 0;
      let failedCount = 0;
      setBulkDownloadProgress({ current: 0, total: images.length });

      // Filter valid images
      const validImages = images.filter(img =>
        img.url && img.url !== 'https://via.placeholder.com/400x400/cccccc/666666?text=No+Image'
      );

      console.log(`📦 Starting parallel download of ${validImages.length} images...`);

      // Parallel download with batching (10 concurrent downloads)
      const BATCH_SIZE = 10;
      const batches: ImageItem[][] = [];

      for (let i = 0; i < validImages.length; i += BATCH_SIZE) {
        batches.push(validImages.slice(i, i + BATCH_SIZE));
      }

      // Process batches sequentially, but images within each batch in parallel
      for (const batch of batches) {
        const downloadPromises = batch.map(async (image) => {
          try {
            const response = await fetch(image.url, {
              method: 'GET',
              mode: 'cors',
              headers: { 'Accept': 'image/*' },
              signal: AbortSignal.timeout(30000) // 30s timeout per image
            });

            if (response.ok) {
              const blob = await response.blob();
              const extension = image.format.toLowerCase();
              const filename = `${image.originalName || image.filename || `image-${Date.now()}`}.${extension}`;

              // Add to ZIP
              zip.file(filename, blob, {
                binary: true,
                compression: 'STORE' // Don't compress yet, do it all at once later
              });

              processedCount++;
              setBulkDownloadProgress({ current: processedCount, total: validImages.length });
              return true;
            } else {
              console.warn(`⚠️ Failed to fetch ${image.originalName}: ${response.status}`);
              failedCount++;
              return false;
            }
          } catch (error) {
            console.error(`❌ Error downloading ${image.originalName}:`, error);
            failedCount++;
            return false;
          }
        });

        // Wait for current batch to complete before moving to next
        await Promise.all(downloadPromises);
      }

      if (processedCount === 0) {
        showNotification("Failed to download any images", "error");
        setBulkDownloadProgress(null);
        return;
      }

      console.log(`✅ Downloaded ${processedCount} images, ${failedCount} failed`);
      showNotification(`Compressing ${processedCount} images into ZIP...`, "info");

      // Mark as compressing
      setBulkDownloadProgress({
        current: processedCount,
        total: validImages.length,
        compressing: true,
        compressionPercent: 0
      });

      // Generate ZIP with fast compression
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 3 }, // Reduced from 6 to 3 for speed
        streamFiles: true // Stream files for better memory usage
      }, (metadata) => {
        // Progress callback during compression
        const percent = Math.floor(metadata.percent);
        setBulkDownloadProgress({
          current: processedCount,
          total: validImages.length,
          compressing: true,
          compressionPercent: percent
        });
        console.log(`🗜️ Compressing: ${percent}%`);
      });

      const zipSizeMB = (zipBlob.size / 1024 / 1024).toFixed(2);
      console.log(`📦 ZIP created: ${zipSizeMB} MB`);

      // Download the ZIP
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `capsera-images-${new Date().toISOString().split('T')[0]}.zip`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(url), 100);

      const successMsg = failedCount > 0
        ? `Downloaded ${processedCount} images (${failedCount} failed) - ${zipSizeMB} MB`
        : `Successfully downloaded ${processedCount} images - ${zipSizeMB} MB`;

      showNotification(successMsg, failedCount > 0 ? "info" : "success");

    } catch (error) {
      console.error('❌ Bulk download failed:', error);
      showNotification("ZIP creation failed. Please try again.", "error");
    } finally {
      setBulkDownloadProgress(null);
    }
  };

  // --- Export Logic ---

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

  // --- Data Fetching ---

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

  // --- Filtering & Pagination ---

  const filteredImages = images.filter(image => {
    if (searchTerm === '') return true;

    const search = searchTerm.toLowerCase().trim();

    // Smart search: Check if it's a special query
    // Date search: "today", "yesterday", "this week", "this month"
    if (search === 'today') {
      const today = new Date().toDateString();
      return new Date(image.uploadedAt).toDateString() === today;
    }
    if (search === 'yesterday') {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      return new Date(image.uploadedAt).toDateString() === yesterday;
    }
    if (search === 'this week' || search === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 86400000);
      return new Date(image.uploadedAt) >= weekAgo;
    }
    if (search === 'this month' || search === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 86400000);
      return new Date(image.uploadedAt) >= monthAgo;
    }

    // Size search: "large" (>5MB), "medium" (1-5MB), "small" (<1MB)
    if (search === 'large') {
      const sizeMB = parseFloat(image.size);
      return sizeMB > 5;
    }
    if (search === 'medium') {
      const sizeMB = parseFloat(image.size);
      return sizeMB >= 1 && sizeMB <= 5;
    }
    if (search === 'small') {
      const sizeMB = parseFloat(image.size);
      return sizeMB < 1;
    }

    // Orphan search
    if (search === 'orphan' || search === 'orphans') {
      return image.storageLocation.toLowerCase().includes('orphan');
    }

    // Regular text search across multiple fields
    const matchesSearch =
      image.id.toLowerCase().includes(search) ||
      image.filename.toLowerCase().includes(search) ||
      image.originalName.toLowerCase().includes(search) ||
      image.uploadedBy.toLowerCase().includes(search) ||
      image.dimensions.toLowerCase().includes(search) ||
      image.format.toLowerCase().includes(search) ||
      image.storageLocation.toLowerCase().includes(search) ||
      image.tags.some(tag => tag.toLowerCase().includes(search)) ||
      (image.moderationNotes && image.moderationNotes.toLowerCase().includes(search)) ||
      (image.flaggedReason && image.flaggedReason.toLowerCase().includes(search));

    return matchesSearch;
  }).filter(image => {
    // Apply status filter
    const matchesStatus = statusFilter === 'all' || image.status === statusFilter;
    const matchesFormat = formatFilter === 'all' || image.format.toLowerCase() === formatFilter.toLowerCase();

    return matchesStatus && matchesFormat;
  });

  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = filteredImages.slice(indexOfFirstImage, indexOfLastImage);
  const totalPages = Math.ceil(filteredImages.length / imagesPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // --- Moderation Logic ---

  // Helper to sort images (Pending first, then Newest)
  const sortImages = (imgs: ImageItem[]) => {
    const statusPriority = { 'pending': 0, 'flagged': 1, 'approved': 2, 'rejected': 3 };
    return [...imgs].sort((a, b) => {
      const priorityA = statusPriority[a.status] ?? 99;
      const priorityB = statusPriority[b.status] ?? 99;
      if (priorityA !== priorityB) return priorityA - priorityB;
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });
  };

  const handleModeration = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setInlineMessage(null);

    // Optimistic Update (Instant)
    const previousImages = [...images];
    setImages(prev => {
      const updated = prev.map(img =>
        img.id === selectedImage.id
          ? { ...img, status: moderationAction === 'approve' ? 'approved' : moderationAction === 'reject' ? 'rejected' : 'flagged' } as ImageItem
          : img
      );
      return sortImages(updated);
    });

    // Close dialog immediately for speed
    setShowModerationDialog(false);
    setSelectedImage(null);
    setModerationNotes('');
    setModerationAction('approve');

    try {
      const response = await fetch(`/api/admin/images/${encodeURIComponent(selectedImage.id)}/moderate`, {
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
        setInlineMessage({ type: 'success', text: `Image ${moderationAction}d successfully!` });
        setInlineMessage(null);
      } else {
        // Revert on failure
        setImages(previousImages);
        const errorData = await response.json();
        showNotification(`Failed: ${errorData.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      // Revert on network error
      setImages(previousImages);
      showNotification("Network error occurred.", 'error');
    } finally {
      setIsProcessing(false);
    }
    setSelectedIds(new Set()); // Clear selection
    setIsProcessing(false);
  };

  const handleBulkModeration = async (action: 'approve' | 'reject' | 'flag' | 'delete') => {
    if (selectedIds.size === 0) return;

    setIsProcessing(true);

    // Optimistic Update (Instant)
    const previousImages = [...images];

    if (action === 'delete') {
      setImages(prev => prev.filter(img => !selectedIds.has(img.id)));
    } else {
      const newStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged';
      setImages(prev => {
        const updated = prev.map(img =>
          selectedIds.has(img.id) ? { ...img, status: newStatus } as ImageItem : img
        );
        return sortImages(updated);
      });
    }

    // Clear selection immediately
    const idsToProcess = new Set(selectedIds);
    setSelectedIds(new Set());

    // Process in background
    let successCount = 0;
    let failCount = 0;

    const promises = Array.from(idsToProcess).map(async (id) => {
      try {
        let response;
        if (action === 'delete') {
          response = await fetch(`/api/admin/images/${encodeURIComponent(id)}`, { method: 'DELETE' });
        } else {
          response = await fetch(`/api/admin/images/${encodeURIComponent(id)}/moderate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: action,
              notes: 'Bulk action applied',
              status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged'
            })
          });
        }

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (e) {
        failCount++;
      }
    });

    try {
      await Promise.all(promises);

      if (failCount > 0) {
        showNotification(`Bulk Action: ${successCount} successful, ${failCount} failed. Refreshing...`, 'error');
        fetchImages(); // Refresh to ensure consistency
      } else {
        showNotification(`Bulk Action Complete: ${successCount} processed`, 'success');
      }
    } catch (error) {
      // Major failure
      setImages(previousImages); // Revert all
      showNotification("Bulk action failed completely", 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/admin/images/${encodeURIComponent(imageId)}`, { method: 'DELETE' });

      if (response.ok) {
        setImages(prev => prev.filter(img => img.id !== imageId));
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
    <div className="min-h-screen bg-background text-foreground font-sans p-4 lg:p-8 relative">

      {/* Notification Toast (Global Fallback) */}
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
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {bulkDownloadProgress.compressing ? '🗜️ Compressing ZIP' : '📥 Downloading Images'}
            </span>
            <span className="text-sm text-blue-600 dark:text-blue-400">
              {bulkDownloadProgress.compressing
                ? `${bulkDownloadProgress.compressionPercent || 0}%`
                : `${bulkDownloadProgress.current} / ${bulkDownloadProgress.total}`
              }
            </span>
          </div>
          <Progress
            value={bulkDownloadProgress.compressing
              ? bulkDownloadProgress.compressionPercent || 0
              : (bulkDownloadProgress.current / bulkDownloadProgress.total) * 100
            }
            className="h-2 bg-blue-500/20"
          />
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            {bulkDownloadProgress.compressing
              ? `Compressing ${bulkDownloadProgress.current} images into ZIP file...`
              : `Downloading images in parallel (10 at a time)...`
            }
          </p>
        </div>
      )}

      {/* Filters & Grid */}
      <div className="space-y-6">
        {/* Filters & Selection Controls */}
        <div className="flex flex-col md:flex-row gap-4 p-4 rounded-[2rem] bg-card border border-border items-center transition-all duration-300">
          <div className="flex items-center gap-2 mr-2">
            <Checkbox
              checked={selectedIds.size === currentImages.length && currentImages.length > 0}
              onCheckedChange={selectAll}
              className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span className="text-sm text-muted-foreground whitespace-nowrap">Select All</span>
          </div>

          {selectedIds.size > 0 ? (
            <div className="flex-1 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-left-5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                  {selectedIds.size} Selected
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedIds(new Set())}
                  className="h-8 text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleBulkModeration('approve')}
                  className="bg-green-500 hover:bg-green-600 text-white border-none h-9"
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Approve
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleBulkModeration('reject')}
                  className="bg-red-500 hover:bg-red-600 text-white border-none h-9"
                >
                  <XCircle className="w-4 h-4 mr-2" /> Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleBulkModeration('flag')}
                  className="bg-orange-500 hover:bg-orange-600 text-white border-none h-9"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" /> Flag
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkModeration('delete')}
                  className="h-9"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative flex-1 w-full animate-in fade-in flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, user, tags, or try: today, orphan, large..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background border-none text-foreground h-10 rounded-xl focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>

                {/* Search Help Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl hover:bg-accent"
                    >
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 bg-card border-border text-foreground" align="start">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Search Guide
                      </h4>

                      <div className="space-y-2 text-xs">
                        <div>
                          <p className="font-medium text-muted-foreground mb-1">📝 Text Search</p>
                          <p className="text-muted-foreground/80">Search across: filename, user, tags, dimensions, format, notes</p>
                        </div>

                        <div>
                          <p className="font-medium text-muted-foreground mb-1">📅 Date Filters</p>
                          <div className="flex flex-wrap gap-1">
                            <code className="px-2 py-0.5 bg-primary/10 text-primary rounded">today</code>
                            <code className="px-2 py-0.5 bg-primary/10 text-primary rounded">yesterday</code>
                            <code className="px-2 py-0.5 bg-primary/10 text-primary rounded">week</code>
                            <code className="px-2 py-0.5 bg-primary/10 text-primary rounded">month</code>
                          </div>
                        </div>

                        <div>
                          <p className="font-medium text-muted-foreground mb-1">📏 Size Filters</p>
                          <div className="flex flex-wrap gap-1">
                            <code className="px-2 py-0.5 bg-primary/10 text-primary rounded">large</code>
                            <span className="text-muted-foreground/60">(&gt;5MB)</span>
                            <code className="px-2 py-0.5 bg-primary/10 text-primary rounded">medium</code>
                            <span className="text-muted-foreground/60">(1-5MB)</span>
                            <code className="px-2 py-0.5 bg-primary/10 text-primary rounded">small</code>
                            <span className="text-muted-foreground/60">(&lt;1MB)</span>
                          </div>
                        </div>

                        <div>
                          <p className="font-medium text-muted-foreground mb-1">🔍 Special</p>
                          <div className="flex flex-wrap gap-1">
                            <code className="px-2 py-0.5 bg-primary/10 text-primary rounded">orphan</code>
                            <span className="text-muted-foreground/60">(unlinked images)</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border">
                          <p className="text-muted-foreground/60 italic">
                            💡 Tip: Combine with status and format filters for precise results
                          </p>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
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
            </>
          )}
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
              <div
                key={image.id}
                className={cn(
                  "group relative bg-card rounded-xl overflow-hidden transition-all border",
                  selectedIds.has(image.id) ? "ring-2 ring-primary border-primary" : "border-border hover:ring-2 hover:ring-primary/50"
                )}
              >
                <div className="aspect-square relative overflow-hidden bg-muted/20">
                  {/* Selection Checkbox Overlay */}
                  <div className="absolute top-2 left-2 z-20">
                    <Checkbox
                      checked={selectedIds.has(image.id)}
                      onCheckedChange={() => toggleSelection(image.id)}
                      className="border-white/80 bg-black/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary h-5 w-5"
                    />
                  </div>

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
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
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

                  <div className="absolute top-2 right-2 z-0">
                    <Badge className={cn("text-[10px] border-none shadow-sm", getStatusColor(image.status))}>
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
              {/* Inline Feedback Message */}
              {inlineMessage && (
                <div className={cn(
                  "p-3 rounded-lg flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2",
                  inlineMessage.type === 'success' ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
                )}>
                  {inlineMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  {inlineMessage.text}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <h4 className="font-medium text-foreground">Details</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Filename:</span> <span className="truncate text-foreground">{selectedImage.filename}</span>
                    <span className="text-muted-foreground">Size:</span> <span className="text-foreground">{selectedImage.size}</span>
                    <span className="text-muted-foreground">Uploaded:</span> <span className="text-foreground">{new Date(selectedImage.uploadedAt).toLocaleDateString()}</span>
                    <span className="text-muted-foreground">By:</span> <span className="text-foreground">{selectedImage.uploadedBy}</span>
                    <span className="text-muted-foreground">Current Status:</span>
                    <Badge className={cn("w-fit text-[10px] border-none", getStatusColor(selectedImage.status))}>
                      {selectedImage.status}
                    </Badge>
                  </div>
                </div>
                <div className="aspect-video bg-background rounded-lg overflow-hidden flex items-center justify-center border border-border relative">
                  {/* Status Overlay on Image */}
                  <div className="absolute top-2 right-2">
                    <Badge className={cn("shadow-md", getStatusColor(selectedImage.status))}>
                      {selectedImage.status}
                    </Badge>
                  </div>
                  {selectedImage.thumbnailUrl ? (
                    <img src={selectedImage.thumbnailUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                  ) : <ImageIcon className="text-muted-foreground" />}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Action</label>
                <div className="flex gap-4">
                  {['approve', 'reject', 'flag'].map((action) => (
                    <label key={action} className={cn(
                      "flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border transition-all",
                      moderationAction === action
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-border hover:bg-accent"
                    )}>
                      <input
                        type="radio"
                        name="moderation"
                        value={action}
                        checked={moderationAction === action}
                        onChange={(e) => setModerationAction(e.target.value as any)}
                        className="hidden"
                      />
                      <span className="capitalize font-medium">{action}</span>
                      {action === 'approve' && <CheckCircle className="w-4 h-4" />}
                      {action === 'reject' && <XCircle className="w-4 h-4" />}
                      {action === 'flag' && <AlertTriangle className="w-4 h-4" />}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Notes</label>
                <Textarea
                  value={moderationNotes}
                  onChange={(e) => setModerationNotes(e.target.value)}
                  placeholder="Enter moderation notes (optional)..."
                  className="bg-background border-border text-foreground resize-none focus-visible:ring-primary"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" onClick={() => setShowModerationDialog(false)} className="text-muted-foreground hover:text-foreground">Cancel</Button>
                <Button
                  onClick={handleModeration}
                  disabled={isProcessing}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    "Apply Action"
                  )}
                </Button>
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
