import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class DiscordCloudinary {
  private static instance: DiscordCloudinary;

  private constructor() {}

  public static getInstance(): DiscordCloudinary {
    if (!DiscordCloudinary.instance) {
      DiscordCloudinary.instance = new DiscordCloudinary();
    }
    return DiscordCloudinary.instance;
  }

  /**
   * Upload image to Cloudinary with pre-generated ID and folder
   */
  async uploadImageWithId(imageUrl: string, imageId: string, originalName: string, discordUserId: string): Promise<{
    publicId: string;
    secureUrl: string;
    folder: string;
    imageId: string;
  }> {
    try {
      console.log('☁️ Uploading image to Cloudinary with ID:', imageId);
      
      // Generate folder and public ID using the same imageId
      const folder = `discord_bot/${discordUserId}/${new Date().getFullYear()}/${new Date().getMonth() + 1}`;
      const publicId = `${imageId}_${originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_')}`;
      
      // Upload image with consistent ID
      const result = await cloudinary.uploader.upload(imageUrl, {
        folder: folder,
        public_id: publicId,
        resource_type: 'auto',
        overwrite: false,
        unique_filename: false, // Use our custom ID
        use_filename: false,    // Don't use original filename
        discard_original_filename: true,
        tags: ['discord_bot', 'capsera', discordUserId, imageId],
        context: {
          caption: `Discord Bot Upload - ${originalName}`,
          user_id: discordUserId,
          source: 'discord_bot',
          image_id: imageId
        }
      });

      console.log('✅ Image uploaded to Cloudinary successfully');
      console.log('📁 Folder:', result.folder);
      console.log('🆔 Public ID:', result.public_id);
      console.log('🔗 URL:', result.secure_url);
      console.log('🆔 Image ID:', imageId);

      return {
        publicId: result.public_id,
        secureUrl: result.secure_url,
        folder: result.folder || folder,
        imageId: imageId
      };
    } catch (error) {
      console.error('❌ Failed to upload image to Cloudinary:', error);
      throw new Error(`Cloudinary upload failed: ${error}`);
    }
  }

  /**
   * Upload image to Cloudinary with Discord bot specific folder (legacy method)
   */
  async uploadImage(imageUrl: string, imageName: string, discordUserId: string): Promise<{
    publicId: string;
    secureUrl: string;
    folder: string;
  }> {
    try {
      console.log('☁️ Uploading image to Cloudinary...');
      
      // Create Discord-specific folder structure
      const folder = `discord_bot/${discordUserId}/${new Date().getFullYear()}/${new Date().getMonth() + 1}`;
      
      // Upload image with Discord bot folder
      const result = await cloudinary.uploader.upload(imageUrl, {
        folder: folder,
        public_id: `discord_${Date.now()}_${imageName.replace(/\.[^/.]+$/, '')}`,
        resource_type: 'auto',
        overwrite: false,
        unique_filename: true,
        use_filename: true,
        discard_original_filename: false,
        tags: ['discord_bot', 'capsera', discordUserId],
        context: {
          caption: `Discord Bot Upload - ${imageName}`,
          user_id: discordUserId,
          source: 'discord_bot'
        }
      });

      console.log('✅ Image uploaded to Cloudinary successfully');
      console.log('📁 Folder:', result.folder);
      console.log('🆔 Public ID:', result.public_id);
      console.log('🔗 URL:', result.secure_url);

      return {
        publicId: result.public_id,
        secureUrl: result.secure_url,
        folder: result.folder || folder
      };
    } catch (error) {
      console.error('❌ Failed to upload image to Cloudinary:', error);
      throw new Error(`Cloudinary upload failed: ${error}`);
    }
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      console.log('🗑️ Image deleted from Cloudinary:', publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('❌ Failed to delete image from Cloudinary:', error);
      return false;
    }
  }

  /**
   * Get image info from Cloudinary
   */
  async getImageInfo(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      console.error('❌ Failed to get image info from Cloudinary:', error);
      return null;
    }
  }
}

export default DiscordCloudinary;
