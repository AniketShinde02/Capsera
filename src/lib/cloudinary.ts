import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

// Helper function to get Cloudinary URL
export function getCloudinaryUrl(publicId: string, options: any = {}) {
  return cloudinary.url(publicId, options);
}

// Helper function to delete image (now used for archive cleanup)
export async function deleteCloudinaryImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
}

// NEW: Archive image instead of deleting
export async function archiveCloudinaryImage(publicId: string, userId?: string): Promise<{ success: boolean; archivedId?: string; error?: string }> {
  try {
    if (!publicId || typeof publicId !== 'string') {
      return { success: false, error: 'Invalid public ID' };
    }

    console.log(`📁 Archiving image: ${publicId}`);

    // Create archive path with timestamp and user ID if available
    const timestamp = Date.now();
    const archivePath = userId 
      ? `capsera_archives/${userId}/${timestamp}_${publicId.split('/').pop()}`
      : `capsera_archives/unknown_users/${timestamp}_${publicId.split('/').pop()}`;

    // Copy image to archive folder
    const copyResult = await cloudinary.uploader.rename(publicId, archivePath);
    
    if (copyResult.public_id) {
      console.log(`✅ Image archived successfully: ${copyResult.public_id}`);
      
      // Delete the original image after successful archiving
      try {
        await cloudinary.uploader.destroy(publicId);
        console.log(`🗑️ Original image deleted after archiving: ${publicId}`);
      } catch (deleteError) {
        console.warn(`⚠️ Failed to delete original image after archiving: ${publicId}`, deleteError);
        // Still consider it a success since it was archived
      }
      
      return { 
        success: true, 
        archivedId: copyResult.public_id 
      };
    } else {
      console.error(`❌ Failed to archive image: ${publicId}`);
      return { success: false, error: 'Archive operation failed' };
    }

  } catch (error: any) {
    console.error(`❌ Error archiving image: ${publicId}`, error);
    return { 
      success: false, 
      error: error.message || 'Unknown error during archiving' 
    };
  }
}

// NEW: Restore image from archive
export async function restoreCloudinaryImage(archivedId: string, originalPath?: string): Promise<{ success: boolean; restoredId?: string; error?: string }> {
  try {
    if (!archivedId || typeof archivedId !== 'string') {
      return { success: false, error: 'Invalid archived ID' };
    }

    console.log(`🔄 Restoring image from archive: ${archivedId}`);

    // Determine the restore path
    const restorePath = originalPath || `capsera_uploads/${archivedId.split('/').pop()?.replace(/^\d+_/, '')}`;

    // Copy image back from archive to main folder
    const restoreResult = await cloudinary.uploader.rename(archivedId, restorePath);
    
    if (restoreResult.public_id) {
      console.log(`✅ Image restored successfully: ${restoreResult.public_id}`);
      
      // Delete the archived copy after successful restoration
      try {
        await cloudinary.uploader.destroy(archivedId);
        console.log(`🗑️ Archived copy deleted after restoration: ${archivedId}`);
      } catch (deleteError) {
        console.warn(`⚠️ Failed to delete archived copy after restoration: ${archivedId}`, deleteError);
        // Still consider it a success since it was restored
      }
      
      return { 
        success: true, 
        restoredId: restoreResult.public_id 
      };
    } else {
      console.error(`❌ Failed to restore image: ${archivedId}`);
      return { success: false, error: 'Restore operation failed' };
    }

  } catch (error: any) {
    console.error(`❌ Error restoring image: ${archivedId}`, error);
    return { 
      success: false, 
      error: error.message || 'Unknown error during restoration' 
    };
  }
}

// NEW: List archived images for a user
export async function listArchivedImages(userId?: string, limit: number = 50): Promise<{ success: boolean; images?: any[]; error?: string }> {
  try {
    const prefix = userId ? `capsera_archives/${userId}/` : 'capsera_archives/';
    
    console.log(`📋 Listing archived images for prefix: ${prefix}`);

    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: prefix,
      max_results: limit,
      sort_by: 'created_at',
      sort_direction: 'desc'
    });

    if (result.resources) {
      console.log(`✅ Found ${result.resources.length} archived images`);
      return { 
        success: true, 
        images: result.resources.map((img: any) => ({
          id: img.public_id,
          url: img.secure_url,
          created: img.created_at,
          size: img.bytes,
          format: img.format
        }))
      };
    } else {
      return { success: false, error: 'No archived images found' };
    }

  } catch (error: any) {
    console.error('Error listing archived images:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error listing archived images' 
    };
  }
}

// NEW: Clean up old archived images (for periodic maintenance)
export async function cleanupOldArchivedImages(daysOld: number = 90): Promise<{ success: boolean; deleted: number; errors: number; details?: any }> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    console.log(`🧹 Cleaning up archived images older than ${daysOld} days (before ${cutoffDate.toISOString()})`);

    // Get all archived images
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'capsera_archives/',
      max_results: 1000, // Adjust based on your needs
      sort_by: 'created_at',
      sort_direction: 'asc'
    });

    if (!result.resources || result.resources.length === 0) {
      return { success: true, deleted: 0, errors: 0, details: 'No archived images found' };
    }

    let deleted = 0;
    let errors = 0;
    const details: any[] = [];

    for (const image of result.resources) {
      const imageDate = new Date(image.created_at);
      
      if (imageDate < cutoffDate) {
        try {
          await cloudinary.uploader.destroy(image.public_id);
          deleted++;
          details.push({ id: image.public_id, action: 'deleted', reason: 'old' });
          console.log(`🗑️ Deleted old archived image: ${image.public_id}`);
        } catch (error) {
          errors++;
          details.push({ id: image.public_id, action: 'failed', error: error instanceof Error ? error.message : 'Unknown error' });
          console.error(`❌ Failed to delete old archived image: ${image.public_id}`, error);
        }
      }
    }

    console.log(`✅ Cleanup complete: ${deleted} deleted, ${errors} errors`);
    return { 
      success: true, 
      deleted, 
      errors, 
      details 
    };

  } catch (error: any) {
    console.error('Error during cleanup:', error);
    return { 
      success: false, 
      deleted: 0, 
      errors: 0, 
      details: { error: error.message } 
    };
  }
}

// Helper function to extract public ID from Cloudinary URL
export function extractCloudinaryPublicId(url: string): string | null {
  try {
    if (!url || typeof url !== 'string') {
      return null;
    }
    
    // Handle different Cloudinary URL formats
    // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/image_name.jpg
    const cloudinaryPattern = /\/upload\/(?:v\d+\/)?([^\/]+(?:\/[^\/]+)*?)(?:\.\w+)?$/;
    const match = url.match(cloudinaryPattern);
    
    if (match && match[1]) {
      // Remove file extension if present
      const publicId = match[1].replace(/\.\w+$/, '');
      return publicId;
    }
    
    // Fallback: try to extract from the end of the URL
    const urlParts = url.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    if (lastPart && lastPart.includes('.')) {
      return lastPart.split('.')[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting Cloudinary public ID:', error);
    return null;
  }
}
