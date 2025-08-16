// ⚠️ DEPRECATED: This file is kept for backup purposes only
// The system has been migrated to Cloudinary
// Do not use these functions in production code
// All ImageKit functionality has been replaced with Cloudinary equivalents

// import ImageKit from 'imagekit';

// Configure ImageKit (DEPRECATED - use Cloudinary instead)
// const imagekit = new ImageKit({
//   publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
//   privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
//   urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
// });

// export { imagekit };

// ⚠️ DEPRECATED FUNCTIONS - Use Cloudinary equivalents instead
// Helper function to delete image from ImageKit by file ID
// export async function deleteImageFromImageKit(fileId: string): Promise<boolean> {
//   try {
//     if (!fileId || typeof fileId !== 'string') {
//       console.error('Invalid fileId provided for deletion:', fileId);
//       return false;
//     }
    
//     // Check if fileId looks like a valid ImageKit file ID
//     if (!/^[a-zA-Z0-9_-]+$/.test(fileId)) {
//       console.error('Invalid fileId format for ImageKit deletion:', fileId);
//       return false;
//     }
    
//     console.log(`🗑️ Attempting to delete image from ImageKit: ${fileId}`);
    
//     await imagekit.deleteFile(fileId);
    
//     console.log(`✅ Successfully deleted image from ImageKit: ${fileId}`);
//     return true;
//   } catch (error: any) {
//     console.error(`❌ Failed to delete image from ImageKit (${fileId}):`, error);
    
//     // Log specific error details for debugging
//     if (error.message) {
//       console.error(`Error message: ${error.message}`);
//     }
//     if (error.response?.data) {
//       console.error(`API response:`, error.response.data);
//     }
    
//     // Don't throw error - we want to continue with database deletion even if ImageKit fails
//     return false;
//   }
// }

// Helper function to delete image from ImageKit by URL
// export async function deleteImageFromImageKitByUrl(url: string): Promise<boolean> {
//   if (!url || typeof url !== 'string') {
//     console.log('No URL provided for ImageKit deletion');
//     return false;
//   }
  
//   console.log(`🔍 Extracting file ID from URL: ${url}`);
//   const fileId = extractImageKitFileId(url);
  
//   if (!fileId) {
//     console.error('Could not extract file ID from URL for deletion:', url);
//     console.error('URL analysis failed - this may indicate an invalid ImageKit URL format');
//     return false;
//   }
  
//   console.log(`📋 Extracted file ID: ${fileId}`);
//   console.log(`🗑️ Proceeding with deletion using file ID: ${fileId}`);
  
//   return await deleteImageFromImageKit(fileId);
// }

// Helper function to extract ImageKit file ID from URL
// export function extractImageKitFileId(url: string): string | null {
//   try {
//     if (!url || typeof url !== 'string') {
//       return null;
//     }
    
//     // Handle different ImageKit URL formats
//     // Format: https://ik.imagekit.io/username/folder/image_name.jpg
//     const imageKitPattern = /\/captioncraft_uploads\/([^\/]+)$/;
//     const match = url.match(imageKitPattern);
    
//     if (match && match[1]) {
//       // Remove file extension if present
//       const fileId = match[1].replace(/\.\w+$/, '');
//       return fileId;
//     }
    
//     // Fallback: try to extract from the end of the URL
//     const urlParts = url.split('/');
//     const lastPart = urlParts[urlParts.length - 1];
//     if (lastPart && lastPart.includes('.')) {
//       return lastPart.split('.')[0];
//     }
    
//     return null;
//   } catch (error) {
//     console.error('Error extracting ImageKit file ID:', error);
//     return null;
//   }
// }

// Batch delete multiple images from ImageKit
// export async function batchDeleteImagesFromImageKit(urls: string[]): Promise<{ success: number; failed: number }> {
//   let success = 0;
//   let failed = 0;
  
//   console.log(`🗑️ Starting batch deletion of ${urls.length} images from ImageKit`);
  
//   for (const url of urls) {
//     try {
//       const deleted = await deleteImageFromImageKitByUrl(url);
//       if (deleted) {
//         success++;
//       } else {
//         failed++;
//       }
//     } catch (error) {
//       console.error(`❌ Error deleting image from ImageKit: ${url}`, error);
//       failed++;
//     }
//   }
  
//   console.log(`📊 Batch deletion complete: ${success} success, ${failed} failed`);
//   return { success, failed };
// }

// Move image to archive folder (for account deletion scenarios)
// export async function moveImageToArchive(url: string, userId: string): Promise<boolean> {
//   try {
//     if (!url || typeof url !== 'string') {
//       return false;
//     }
    
//     const fileId = extractImageKitFileId(url);
//     if (!fileId) {
//       return false;
//     }
    
//     console.log(`📁 Moving image to archive: ${fileId}`);
    
//     // Copy to archive folder
//     const archiveResponse = await imagekit.copyFile({
//       sourceFilePath: `captioncraft_uploads/${fileId}`,
//       destinationPath: `archived_accounts/${userId}/captioncraft_uploads/${fileId}`,
//     });
    
//     // Check if the copy operation was successful
//     // The copyFile method doesn't return a fileId, so we check for successful completion
//     if (archiveResponse && !archiveResponse.$ResponseMetadata?.error) {
//       console.log(`✅ Image archived successfully: ${fileId}`);
      
//       // Delete from original location
//       const deleted = await deleteImageFromImageKit(fileId);
//       if (deleted) {
//         console.log(`🗑️ Original image deleted after archiving: ${fileId}`);
//         return true;
//       } else {
//         console.warn(`⚠️ Original image not deleted after archiving: ${fileId}`);
//         return true; // Still consider it a success since it was archived
//       }
//     } else {
//       console.error(`❌ Failed to archive image: ${fileId}`);
//       return false;
//     }
//   } catch (error) {
//     console.error(`❌ Error archiving image: ${url}`, error);
//     return false;
//   }
// }

// Batch move images to archive
// export async function batchMoveImagesToArchive(urls: string[], userId: string): Promise<{ 
//   success: number; 
//   failed: number; 
//   archivedUrls: string[]; 
//   errors: Array<{ url: string; error: string }> 
// }> {
//   let success = 0;
//   let failed = 0;
//   const archivedUrls: string[] = [];
//   const errors: Array<{ url: string; error: string }> = [];
  
//   console.log(`📁 Starting batch archive of ${urls.length} images for user ${userId}`);
  
//   for (const url of urls) {
//     try {
//       const archived = await moveImageToArchive(url, userId);
//       if (archived) {
//         success++;
//         archivedUrls.push(url);
//       } else {
//         failed++;
//         errors.push({ url, error: 'Archive operation failed' });
//       }
//     } catch (error: any) {
//       failed++;
//       errors.push({ url, error: error.message || 'Unknown error' });
//       console.error(`❌ Error archiving image: ${url}`, error);
//     }
//   }
  
//   console.log(`📊 Batch archive complete: ${success} success, ${failed} failed`);
//   return { success, failed, archivedUrls, errors };
// }

// 🚀 CLOUDINARY MIGRATION COMPLETE
// All image operations now use Cloudinary:
// - Image uploads: /api/upload (Cloudinary)
// - Image archiving: src/lib/cloudinary-archive.ts
// - Image deletion: Cloudinary API
// - Archive management: /api/admin/archives

// 📚 For reference, see:
// - src/lib/cloudinary.ts - Cloudinary configuration
// - src/lib/cloudinary-archive.ts - Archive operations
// - src/app/api/admin/archives/route.ts - Archive management API
