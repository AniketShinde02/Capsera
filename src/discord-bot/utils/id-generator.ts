import crypto from 'crypto';

export class IDGenerator {
  private static instance: IDGenerator;

  private constructor() {}

  public static getInstance(): IDGenerator {
    if (!IDGenerator.instance) {
      IDGenerator.instance = new IDGenerator();
    }
    return IDGenerator.instance;
  }

  /**
   * Generate unique ID for image processing
   * Format: discord_YYYYMMDD_HHMMSS_<hash>
   */
  generateImageId(originalName: string, userId: string): string {
    const timestamp = new Date();
    const dateStr = timestamp.getFullYear().toString() +
                   (timestamp.getMonth() + 1).toString().padStart(2, '0') +
                   timestamp.getDate().toString().padStart(2, '0');
    
    const timeStr = timestamp.getHours().toString().padStart(2, '0') +
                   timestamp.getMinutes().toString().padStart(2, '0') +
                   timestamp.getSeconds().toString().padStart(2, '0');
    
    // Create hash from original filename and user ID
    const hash = crypto.createHash('md5')
      .update(`${originalName}_${userId}_${Date.now()}`)
      .digest('hex')
      .substring(0, 8);
    
    return `discord_${dateStr}_${timeStr}_${hash}`;
  }

  /**
   * Generate folder path for Cloudinary
   */
  generateFolderPath(userId: string): string {
    const timestamp = new Date();
    const year = timestamp.getFullYear();
    const month = (timestamp.getMonth() + 1).toString().padStart(2, '0');
    
    return `discord_bot/${userId}/${year}/${month}`;
  }

  /**
   * Generate public ID for Cloudinary
   */
  generatePublicId(imageId: string, originalName: string): string {
    const extension = originalName.split('.').pop() || 'jpg';
    const cleanName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
    
    return `${imageId}_${cleanName}`;
  }
}

export default IDGenerator;
