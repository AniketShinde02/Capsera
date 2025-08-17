'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
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
import { Image, Trash2, Download, Eye, AlertTriangle, CheckCircle, XCircle, Settings, Search, Filter, RefreshCw } from 'lucide-react';
import JSZip from 'jszip';

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
  const { toast } = useToast();
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

  // Download image functionality
  const downloadImage = async (image: ImageItem) => {
    try {
      setDownloadingImage(image.id);
      console.log('🔄 Starting download for:', image.originalName);
      console.log('📥 Image URL:', image.url);
      
      // Check if URL is valid
      if (!image.url || image.url === 'https://placehold.co/400text=No+Image') {
        console.error('❌ Invalid image URL for download');
        toast({
          title: "Download Error",
          description: "Cannot download: Invalid image URL",
          variant: "destructive"
        });
        return;
      }

      // Add CORS headers and use mode: 'cors'
      const response = await fetch(image.url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'image/*',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Image fetched successfully, creating blob...');
      const blob = await response.blob();
      console.log('📦 Blob created, size:', blob.size, 'bytes');

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.originalName || image.filename || `image-${Date.now()}.png`;
      a.style.display = 'none';
      
      // Append to body and trigger download
      document.body.appendChild(a);
      console.log('🔗 Download link created, triggering download...');
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('🧹 Cleanup completed');
      }, 100);

      console.log('✅ Download initiated successfully!');
      toast({
        title: "Download Started",
        description: `Downloading ${image.originalName || 'image'}...`,
      });
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      
      // Try alternative method for Cloudinary URLs
      if (image.url.includes('cloudinary.com')) {
        console.log('🔄 Trying alternative download method for Cloudinary...');
        try {
          // Open in new tab for manual download
          window.open(image.url, '_blank');
          console.log('✅ Opened image in new tab for manual download');
          toast({
            title: "Alternative Download",
            description: "Image opened in new tab for manual download",
          });
        } catch (altError) {
          console.error('❌ Alternative method also failed:', altError);
          toast({
            title: "Download Failed",
            description: "Please right-click the image and 'Save image as...'",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Download Failed",
          description: "Please try again or contact support",
          variant: "destructive"
        });
      }
    } finally {
      setDownloadingImage(null);
    }
  };

  // Download all images as ZIP
  const downloadAllImages = async () => {
    try {
      if (images.length === 0) {
        toast({
          title: "No Images",
          description: "No images available for download",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Creating ZIP File",
        description: `Preparing ${images.length} images for compression...`,
      });

      // Initialize JSZip
      const zip = new JSZip();
      let processedCount = 0;
      setBulkDownloadProgress({ current: 0, total: images.length });

      // Process each image and add to ZIP
      for (const image of images) {
        try {
          if (image.url && image.url !== 'https://via.placeholder.com/400x400/cccccc/666666?text=No+Image') {
            console.log(`🔄 Processing image: ${image.originalName}`);
            
            // Fetch the image
            const response = await fetch(image.url, {
              method: 'GET',
              mode: 'cors',
              headers: {
                'Accept': 'image/*',
              }
            });

            if (response.ok) {
              const blob = await response.blob();
              
              // Generate filename with extension
              const extension = image.format.toLowerCase();
              const filename = `${image.originalName || image.filename || `image-${Date.now()}`}.${extension}`;
              
              // Add image to ZIP
              zip.file(filename, blob);
              console.log(`✅ Added to ZIP: ${filename}`);
              
              processedCount++;
              setBulkDownloadProgress({ current: processedCount, total: images.length });
            } else {
              console.warn(`⚠️ Failed to fetch image: ${image.originalName}`);
            }
          }
        } catch (error) {
          console.error(`❌ Error processing ${image.originalName}:`, error);
        }
      }

      if (processedCount === 0) {
        toast({
          title: "No Images Processed",
          description: "Failed to process any images for ZIP creation",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Compressing ZIP File",
        description: `Compressing ${processedCount} images...`,
      });

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 6 // Good balance between speed and compression
        }
      });

      const zipSizeMB = (zipBlob.size / 1024 / 1024).toFixed(2);
      console.log(`📦 ZIP created successfully! Size: ${zipSizeMB} MB`);

      // Update progress with ZIP size
      setBulkDownloadProgress(prev => prev ? { ...prev, zipSize: `${zipSizeMB} MB` } : null);

      // Download the ZIP file
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `images-bulk-download-${new Date().toISOString().split('T')[0]}.zip`;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Cleanup
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);

      toast({
        title: "ZIP Download Complete!",
        description: `Successfully downloaded ${processedCount} images in compressed ZIP file`,
      });

    } catch (error) {
      console.error('Bulk download failed:', error);
      toast({
        title: "ZIP Creation Failed",
        description: "Failed to create ZIP file. Please try individual downloads.",
        variant: "destructive"
      });
    } finally {
      setBulkDownloadProgress(null);
    }
  };

  // Export image data as CSV or JSON
  const exportImageData = async (format: 'csv' | 'json') => {
    try {
      if (images.length === 0) {
        toast({
          title: "No Data",
          description: "No images available for export",
          variant: "destructive"
        });
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
        // Create CSV content
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
        a.download = `images-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Export Successful",
          description: "Image data exported as CSV file",
        });
      } else {
        // Export as JSON
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `images-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Export Successful",
          description: "Image data exported as JSON file",
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export image data",
        variant: "destructive"
      });
    } finally {
      setExportingData(false);
    }
  };
  
  // Fetch REAL data from database
  const fetchImages = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching images from API...');
      const response = await fetch('/api/admin/images');
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Received image data:', data);
        console.log('🖼️ Images array:', data.images);
        console.log('📊 Storage metrics:', data.storageMetrics);
        console.log('⚖️ Moderation queue:', data.moderationQueue);
        
        setImages(data.images || []);
        setStorageMetrics(data.storageMetrics || storageMetrics);
        setModerationQueue(data.moderationQueue || moderationQueue);
        
        // Debug: Check first few images for thumbnail URLs
        if (data.images && data.images.length > 0) {
          console.log('🔍 First 3 images thumbnail URLs:');
          data.images.slice(0, 3).forEach((img: any, index: number) => {
            console.log(`  Image ${index + 1}:`, {
              id: img.id,
              thumbnailUrl: img.thumbnailUrl,
              url: img.url,
              originalName: img.originalName
            });
          });
        }
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
      console.log('🔄 Silent background refresh of images...');
      const response = await fetch('/api/admin/images');
      
      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
        setStorageMetrics(data.storageMetrics || storageMetrics);
        setModerationQueue(data.moderationQueue || moderationQueue);
        console.log('✅ Silent refresh completed');
      }
    } catch (error) {
      console.error('❌ Silent refresh failed:', error);
      // Don't show errors to user during background refresh
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchImages(); // Initial fetch with loading
      
      // Set up auto-refresh every 30 seconds (silent)
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
    if (!selectedImage || !moderationNotes) return;

    try {
      // Call backend API to update image moderation status
      const response = await fetch(`/api/admin/images/${selectedImage.id}/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: moderationAction,
          notes: moderationNotes,
          status: moderationAction === 'approve' ? 'approved' : 
                  moderationAction === 'reject' ? 'rejected' : 'flagged'
        })
      });

      if (response.ok) {
        // Update local state after successful API call
        const updatedImage = { ...selectedImage };
        
        if (moderationAction === 'approve') {
          updatedImage.status = 'approved';
          updatedImage.storageLocation = 'primary';
          setModerationQueue(prev => ({ ...prev, approved: prev.approved + 1, pending: prev.pending - 1 }));
        } else if (moderationAction === 'reject') {
          updatedImage.status = 'rejected';
          updatedImage.storageLocation = 'quarantine';
          setModerationQueue(prev => ({ ...prev, rejected: prev.rejected + 1, pending: prev.pending - 1 }));
        } else if (moderationAction === 'flag') {
          updatedImage.status = 'flagged';
          updatedImage.storageLocation = 'quarantine';
          updatedImage.flaggedReason = moderationNotes;
          setModerationQueue(prev => ({ ...prev, flagged: prev.flagged + 1, pending: prev.pending - 1 }));
        }

        updatedImage.moderationNotes = moderationNotes;
        setImages(prev => prev.map(img => img.id === selectedImage.id ? updatedImage : img));
        
        // Refresh data after moderation
        setTimeout(() => fetchImages(), 1000);
        
        setShowModerationDialog(false);
        setSelectedImage(null);
        setModerationNotes('');
      } else {
        console.error('Failed to moderate image:', response.status);
        toast({
          title: "Moderation Failed",
          description: "Failed to moderate image. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error moderating image:', error);
      toast({
        title: "Moderation Error",
        description: "Error moderating image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      // Call backend API to delete image
      const response = await fetch(`/api/admin/images/${imageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const image = images.find(img => img.id === imageId);
        if (image) {
          // Update storage metrics
          const sizeInMB = parseFloat(image.size);
          setStorageMetrics(prev => ({
            ...prev,
            totalImages: prev.totalImages - 1,
            totalSize: `${(parseFloat(prev.totalSize) - sizeInMB / 1024).toFixed(1)} GB`
          }));

          // Update moderation queue
          if (image.status === 'pending') {
            setModerationQueue(prev => ({ ...prev, pending: prev.pending - 1 }));
          } else if (image.status === 'flagged') {
            setModerationQueue(prev => ({ ...prev, flagged: prev.flagged - 1 }));
          } else if (image.status === 'rejected') {
            setModerationQueue(prev => ({ ...prev, rejected: prev.rejected - 1 }));
          } else if (image.status === 'approved') {
            setModerationQueue(prev => ({ ...prev, approved: prev.approved - 1 }));
          }
        }

        setImages(prev => prev.filter(img => img.id !== imageId));
        
        // Refresh data after deletion
        setTimeout(() => fetchImages(), 1000);
        
        setShowDeleteDialog(false);
        setSelectedImage(null);
      } else {
        console.error('Failed to delete image:', response.status);
        toast({
          title: "Delete Failed",
          description: "Failed to delete image. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Delete Error",
        description: "Error deleting image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: ImageItem['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'flagged': return 'bg-orange-100 text-orange-800';
    }
  };

  const getStatusIcon = (status: ImageItem['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'flagged': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading images...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Image Management</h1>
          <p className="text-muted-foreground">
            Manage and moderate user-uploaded images • {loading ? 'Loading...' : `${images.length} total images`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => {
              setLoading(true);
              fetchImages();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
                     <Button 
             variant="default"
             onClick={downloadAllImages}
             className="bg-blue-600 hover:bg-blue-700"
             disabled={images.length === 0 || bulkDownloadProgress !== null}
           >
             {bulkDownloadProgress ? (
               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
             ) : (
               <Download className="h-4 w-4 mr-2" />
             )}
                           {bulkDownloadProgress ? `Creating ZIP... (${bulkDownloadProgress.current}/${bulkDownloadProgress.total})` : `Download as ZIP (${images.length})`}
           </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
                     <Button 
             variant="outline" 
             onClick={() => exportImageData('csv')}
             disabled={exportingData}
           >
             {exportingData ? (
               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
             ) : (
               <Download className="h-4 w-4 mr-2" />
             )}
             Export CSV
           </Button>
           <Button 
             variant="outline" 
             onClick={() => exportImageData('json')}
             disabled={exportingData}
           >
             {exportingData ? (
               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
             ) : (
               <Download className="h-4 w-4 mr-2" />
             )}
             Export JSON
           </Button>
                 </div>
       </div>

       {/* Bulk Download Progress */}
       {bulkDownloadProgress && (
         <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
           <CardContent className="pt-4">
             <div className="flex items-center justify-between mb-2">
               <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                 Bulk Download Progress
               </span>
               <span className="text-sm text-blue-600 dark:text-blue-400">
                 {bulkDownloadProgress.current} / {bulkDownloadProgress.total}
               </span>
             </div>
             <Progress 
               value={(bulkDownloadProgress.current / bulkDownloadProgress.total) * 100} 
               className="h-2 bg-blue-100 dark:bg-blue-900"
             />
                           <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Processing images and creating ZIP file... Please wait.
                {bulkDownloadProgress.zipSize && (
                  <span className="block mt-1 font-medium">
                    ZIP Size: {bulkDownloadProgress.zipSize}
                  </span>
                )}
              </p>
           </CardContent>
         </Card>
       )}

       {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Images</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{storageMetrics.totalImages.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total uploaded</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-20 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{storageMetrics.usedStorage}</div>
                <p className="text-xs text-muted-foreground">of {storageMetrics.totalSize}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-28"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-yellow-600">{moderationQueue.pending}</div>
                <p className="text-xs text-muted-foreground">Awaiting moderation</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="text-xs text-muted-foreground">New images today</div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{storageMetrics.imagesToday}</div>
                <p className="text-xs text-muted-foreground">New images today</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Storage Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="h-6 bg-gray-200 rounded w-16 mx-auto mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
                  </div>
                  <div>
                    <div className="h-6 bg-gray-200 rounded w-20 mx-auto mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                  </div>
                  <div>
                    <div className="h-6 bg-gray-200 rounded w-16 mx-auto mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Storage Used</span>
                    <span>Unknown Limit</span>
                  </div>
                  <Progress value={0} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">Storage limit not configured</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold">{storageMetrics.usedStorage}</div>
                    <div className="text-xs text-muted-foreground">Used</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">Unknown</div>
                    <div className="text-xs text-muted-foreground">Storage Limit</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{storageMetrics.averageImageSize}</div>
                    <div className="text-xs text-muted-foreground">Avg Size</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:col-span-2"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
            <Select value={formatFilter} onValueChange={setFormatFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Formats</SelectItem>
                <SelectItem value="JPEG">JPEG</SelectItem>
                <SelectItem value="PNG">PNG</SelectItem>
                <SelectItem value="GIF">GIF</SelectItem>
                <SelectItem value="WEBP">WEBP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Images Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Images ({filteredImages.length})</CardTitle>
          <CardDescription>
            Manage and moderate user-uploaded images
            <span className="ml-2 text-xs text-green-600 dark:text-green-400">
              🔄 Auto-refresh every 30s
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Image className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No images found</p>
              <p className="text-sm">No images match the current filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredImages.map((image) => (
                <div key={image.id} className="group relative">
                  {/* Image Card */}
                  <div className="relative overflow-hidden rounded-lg border bg-background hover:shadow-md transition-shadow">
                    {/* Image */}
                    <div className="aspect-square overflow-hidden">
                                             {image.thumbnailUrl && image.thumbnailUrl !== 'https://via.placeholder.com/400x400/cccccc/666666?text=No+Image' ? (
                         <img 
                           src={image.thumbnailUrl} 
                           alt={image.originalName}
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                           loading="lazy"
                           decoding="async"
                           onError={(e) => {
                             console.log('❌ Image failed to load:', image.thumbnailUrl);
                             // Fallback to placeholder if image fails to load
                             e.currentTarget.style.display = 'none';
                             (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                           }}
                           onLoad={() => {
                             console.log('✅ Image loaded successfully:', image.thumbnailUrl);
                           }}
                         />
                       ) : null}
                      <div className="w-full h-full flex items-center justify-center bg-muted" style={{ display: (image.thumbnailUrl && image.thumbnailUrl !== 'https://via.placeholder.com/400x400/cccccc/666666?text=No+Image') ? 'none' : 'flex' }}>
                        <Image className="h-8 w-8 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground ml-2">No Image</span>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge className={`text-xs ${getStatusColor(image.status)}`}>
                        {image.status}
                      </Badge>
                    </div>
                    
                    {/* Action Buttons - Hidden by default, shown on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedImage(image);
                          setShowModerationDialog(true);
                        }}
                        className="h-8 w-8 p-0"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => downloadImage(image)}
                        className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700"
                        title="Download Image"
                        disabled={downloadingImage === image.id}
                      >
                        {downloadingImage === image.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedImage(image);
                          setShowDeleteDialog(true);
                        }}
                        className="h-8 w-8 p-0"
                        title="Delete Image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Image Info */}
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium truncate" title={image.originalName}>
                      {image.originalName}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{image.size}</span>
                      <span>{image.format}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      by {image.uploadedBy}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(image.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {!loading && filteredImages.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * imagesPerPage) + 1} to {Math.min(currentPage * imagesPerPage, totalImages)} of {totalImages} images
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {Math.ceil(totalImages / imagesPerPage)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= Math.ceil(totalImages / imagesPerPage)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Moderation Dialog */}
      <Dialog open={showModerationDialog} onOpenChange={setShowModerationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Image Moderation</DialogTitle>
            <DialogDescription>Review and moderate the selected image</DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Image Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Filename:</strong> {selectedImage.filename}</div>
                    <div><strong>Size:</strong> {selectedImage.size}</div>
                    <div><strong>Dimensions:</strong> {selectedImage.dimensions}</div>
                    <div><strong>Format:</strong> {selectedImage.format}</div>
                    <div><strong>Uploaded by:</strong> {selectedImage.uploadedBy}</div>
                    <div><strong>Uploaded:</strong> {new Date(selectedImage.uploadedAt).toLocaleString()}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Preview</h4>
                  <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                    {selectedImage.thumbnailUrl ? (
                      <img 
                        src={selectedImage.thumbnailUrl} 
                        alt={selectedImage.originalName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full flex items-center justify-center bg-gray-100" style={{ display: selectedImage.thumbnailUrl ? 'none' : 'flex' }}>
                      <Image className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedImage.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Moderation Action</h4>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="moderation"
                      value="approve"
                      checked={moderationAction === 'approve'}
                      onChange={(e) => setModerationAction(e.target.value as any)}
                    />
                    <span>Approve</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="moderation"
                      value="reject"
                      checked={moderationAction === 'reject'}
                      onChange={(e) => setModerationAction(e.target.value as any)}
                    />
                    <span>Reject</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="moderation"
                      value="flag"
                      checked={moderationAction === 'flag'}
                      onChange={(e) => setModerationAction(e.target.value as any)}
                    />
                    <span>Flag</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Moderation Notes</label>
                <Textarea
                  value={moderationNotes}
                  onChange={(e) => setModerationNotes(e.target.value)}
                  placeholder="Enter moderation notes..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowModerationDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleModeration}>Apply Action</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="text-sm">
                <strong>Image:</strong> {selectedImage.originalName}
                <br />
                <strong>Size:</strong> {selectedImage.size}
                <br />
                <strong>Uploaded by:</strong> {selectedImage.uploadedBy}
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    if (selectedImage) {
                      handleDeleteImage(selectedImage.id);
                      setShowDeleteDialog(false);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
