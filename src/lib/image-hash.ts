import crypto from 'crypto';

/**
 * Generate a unique hash from image data
 * This creates a fingerprint that can be used to identify duplicate images
 */
export function generateImageHash(imageData: string | Buffer): string {
  // If it's a base64 string, convert to buffer
  let buffer: Buffer;
  
  if (typeof imageData === 'string') {
    // Remove data:image/...;base64, prefix if present
    const base64Data = imageData.includes('base64,') 
      ? imageData.split('base64,')[1] 
      : imageData;
    
    buffer = Buffer.from(base64Data, 'base64');
  } else {
    buffer = imageData;
  }
  
  // Generate SHA-256 hash
  const hash = crypto.createHash('sha256');
  hash.update(buffer);
  
  return hash.digest('hex');
}

/**
 * Generate a hash from image URL (for remote images)
 * This is less reliable but useful for tracking
 */
export function generateImageUrlHash(imageUrl: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(imageUrl);
  return hash.digest('hex');
}

/**
 * Generate a hash from Cloudinary public ID
 * This provides consistent hashing for Cloudinary images
 */
export function generateCloudinaryHash(publicId: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(publicId);
  return hash.digest('hex');
}

/**
 * Generate a hash from image metadata (size, dimensions, etc.)
 * This can be combined with content hash for better accuracy
 */
export function generateImageMetadataHash(metadata: {
  width?: number;
  height?: number;
  size?: number;
  format?: string;
  filename?: string;
}): string {
  const metadataString = JSON.stringify(metadata, Object.keys(metadata).sort());
  const hash = crypto.createHash('sha256');
  hash.update(metadataString);
  return hash.digest('hex');
}

/**
 * Generate a composite hash combining multiple factors
 * This provides the most accurate image identification
 */
export function generateCompositeImageHash(
  imageData: string | Buffer,
  metadata?: {
    width?: number;
    height?: number;
    size?: number;
    format?: string;
    filename?: string;
  }
): string {
  const contentHash = generateImageHash(imageData);
  
  if (!metadata) {
    return contentHash;
  }
  
  const metadataHash = generateImageMetadataHash(metadata);
  
  // Combine both hashes
  const combined = contentHash + metadataHash;
  const finalHash = crypto.createHash('sha256');
  finalHash.update(combined);
  
  return finalHash.digest('hex');
}

/**
 * Check if two image hashes are similar (for fuzzy matching)
 * This can be useful for detecting slightly modified images
 */
export function areHashesSimilar(hash1: string, hash2: string, threshold: number = 0.8): boolean {
  if (hash1 === hash2) return true;
  
  // Simple Hamming distance calculation
  let differences = 0;
  const maxLength = Math.max(hash1.length, hash2.length);
  
  for (let i = 0; i < maxLength; i++) {
    if (hash1[i] !== hash2[i]) {
      differences++;
    }
  }
  
  const similarity = 1 - (differences / maxLength);
  return similarity >= threshold;
}
