import { v2 as cloudinary } from 'cloudinary';

/**
 * Cloudinary Image Archiving Service
 * Handles archiving images when user accounts are deleted
 */

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * Archive a single image to user's archive folder
 */
export async function archiveImageToCloudinary(
  imageUrl: string, 
  userId: string
): Promise<{ success: boolean; archivedUrl?: string; error?: string }> {
  try {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return { success: false, error: 'Invalid image URL' };
    }

    // Extract public ID from Cloudinary URL
    const publicId = extractCloudinaryPublicId(imageUrl);
    if (!publicId) {
      return { success: false, error: 'Could not extract Cloudinary public ID' };
    }

    console.log(`📁 Archiving image: ${publicId}`);

    // Create archive folder path
    const archivePath = `capsera_archives/${userId}/${Date.now()}_${publicId.split('/').pop()}`;

    // Move image to archive folder
    const result = await cloudinary.uploader.rename(publicId, archivePath);
    
    if (result.public_id) {
      console.log(`✅ Image archived successfully: ${result.public_id}`);
      
      // Get the archived image URL
      const archivedUrl = cloudinary.url(result.public_id, {
        secure: true,
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      });

      return { 
        success: true, 
        archivedUrl 
      };
    } else {
      return { success: false, error: 'Archive operation failed' };
    }

  } catch (error: any) {
    console.error(`❌ Error archiving image: ${imageUrl}`, error);
    return { 
      success: false, 
      error: error.message || 'Unknown error during archiving' 
    };
  }
}

/**
 * Batch archive multiple images for a user
 */
export async function batchArchiveImagesToCloudinary(
  imageUrls: string[], 
  userId: string
): Promise<{ 
  success: number; 
  failed: number; 
  archivedUrls: string[]; 
  errors: Array<{ url: string; error: string }> 
}> {
  let success = 0;
  let failed = 0;
  const archivedUrls: string[] = [];
  const errors: Array<{ url: string; error: string }> = [];

  console.log(`📁 Starting batch archive of ${imageUrls.length} images for user ${userId}`);

  for (const url of imageUrls) {
    try {
      const result = await archiveImageToCloudinary(url, userId);
      if (result.success && result.archivedUrl) {
        success++;
        archivedUrls.push(result.archivedUrl);
      } else {
        failed++;
        errors.push({ url, error: result.error || 'Archive operation failed' });
      }
    } catch (error: any) {
      failed++;
      errors.push({ url, error: error.message || 'Unknown error' });
      console.error(`❌ Error archiving image: ${url}`, error);
    }
  }

  console.log(`📊 Batch archive complete: ${success} success, ${failed} failed`);
  return { success, failed, archivedUrls, errors };
}

/**
 * Extract Cloudinary public ID from URL
 */
function extractCloudinaryPublicId(url: string): string | null {
  try {
    if (!url || typeof url !== 'string') {
      return null;
    }

    // Handle different Cloudinary URL formats
    // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/image_name.jpg
    const cloudinaryPattern = /\/upload\/[^\/]*\/([^\/]+(?:\/[^\/]+)*)/;
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

/**
 * Clean up old archived images (older than specified days)
 */
export async function cleanupOldArchivedImages(daysOld: number = 90): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    console.log(`🧹 Cleaning up archived images older than ${cutoffDate.toISOString()}`);

    // List all archived images
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'capsera_archives/',
      max_results: 1000,
      sort_by: 'created_at',
      sort_direction: 'asc'
    });

    let deletedCount = 0;
    const imagesToDelete = result.resources.filter((resource: any) => {
      const createdAt = new Date(resource.created_at);
      return createdAt < cutoffDate;
    });

    console.log(`📊 Found ${imagesToDelete.length} archived images older than ${daysOld} days`);

    // Delete old archived images
    for (const image of imagesToDelete) {
      try {
        await cloudinary.uploader.destroy(image.public_id);
        deletedCount++;
        console.log(`🗑️ Deleted old archived image: ${image.public_id}`);
      } catch (error) {
        console.error(`❌ Failed to delete old archived image: ${image.public_id}`, error);
      }
    }

    console.log(`🧹 Cleanup complete: Deleted ${deletedCount} old archived images`);
    return deletedCount;

  } catch (error) {
    console.error('❌ Error during cleanup of old archived images:', error);
    return 0;
  }
}