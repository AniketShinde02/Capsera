  import CaptionCache, { ICaptionCache } from '../models/CaptionCache';
import { generateImageHash, generateImageUrlHash, generateCloudinaryHash } from './image-hash';

export interface CacheResult {
  found: boolean;
  captions?: string[];
  cacheEntry?: ICaptionCache;
  savedQuota?: boolean;
}

export interface CacheStats {
  totalEntries: number;
  totalUsage: number;
  averageUsage: number;
  oldestEntry: Date;
  newestEntry: Date;
  quotaSaved: number; // Estimated API calls saved
}

/**
 * Caption Cache Service
 * Manages caching of generated captions to avoid duplicate API calls
 */
export class CaptionCacheService {
  
  /**
   * Check if a caption exists in cache
   */
  static async checkCache(
    imageData: string | Buffer,
    prompt: string,
    mood: string
  ): Promise<CacheResult> {
    try {
      // Generate a more reliable cache key
      let cacheKey: string;
      
      if (typeof imageData === 'string') {
        if (imageData.startsWith('data:image/')) {
          // Base64 image data
          cacheKey = generateImageHash(imageData);
        } else if (imageData.includes('cloudinary.com')) {
          // Cloudinary URL - extract public ID for consistent hashing
          const publicId = imageData.split('/').pop()?.split('.')[0] || imageData;
          cacheKey = generateCloudinaryHash(publicId);
        } else {
          // Other URL or string
          cacheKey = generateImageUrlHash(imageData);
        }
      } else {
        // Buffer data
        cacheKey = generateImageHash(imageData);
      }
      
      // Normalize prompt to ensure consistency
      const normalizedPrompt = prompt || 'default';
      
      console.log(`🔑 Generated cache key: ${cacheKey.substring(0, 16)}...`);
      console.log(`🔍 Looking for cache entry with:`, {
        imageHash: cacheKey.substring(0, 8) + '...',
        prompt: normalizedPrompt,
        mood: mood
      });
      
      const cacheEntry = await CaptionCache.findOne({
        imageHash: cacheKey,
        prompt: normalizedPrompt,
        mood
      });
      
      if (cacheEntry) {
        // Increment usage count manually
        await CaptionCache.findByIdAndUpdate(cacheEntry._id, {
          $inc: { usageCount: 1 },
          $set: { lastUsed: new Date() }
        });
        
        console.log(`🎯 Cache HIT: Found existing captions for image hash ${cacheKey.substring(0, 8)}...`);
        
        return {
          found: true,
          captions: cacheEntry.captions,
          cacheEntry,
          savedQuota: true
        };
      }
      
      console.log(`❌ Cache MISS: No existing captions for image hash ${cacheKey.substring(0, 8)}...`);
      
      return {
        found: false,
        savedQuota: false
      };
      
    } catch (error) {
      console.error('❌ Cache check error:', error);
      return {
        found: false,
        savedQuota: false
      };
    }
  }
  
  /**
   * Store captions in cache
   */
  static async storeCache(
    imageData: string | Buffer,
    prompt: string,
    mood: string,
    captions: string[],
    userId?: string
  ): Promise<ICaptionCache | null> {
    try {
      // Generate the same cache key logic as checkCache
      let cacheKey: string;
      
      if (typeof imageData === 'string') {
        if (imageData.startsWith('data:image/')) {
          // Base64 image data
          cacheKey = generateImageHash(imageData);
        } else if (imageData.includes('cloudinary.com')) {
          // Cloudinary URL - extract public ID for consistent hashing
          const publicId = imageData.split('/').pop()?.split('.')[0] || imageData;
          cacheKey = generateCloudinaryHash(publicId);
        } else {
          // Other URL or string
          cacheKey = generateImageUrlHash(imageData);
        }
      } else {
        // Buffer data
        cacheKey = generateImageHash(imageData);
      }
      
      const cacheData = {
        imageHash: cacheKey,
        prompt,
        mood,
        captions,
        userId,
        usageCount: 1,
        lastUsed: new Date(),
        createdAt: new Date()
      };
      
      // Normalize prompt to ensure consistency
      const normalizedPrompt = prompt || 'default';
      
      // First try to find existing entry
      let cacheEntry = await CaptionCache.findOne({
        imageHash: cacheKey,
        prompt: normalizedPrompt,
        mood
      });

      if (cacheEntry) {
        // Update existing entry
        cacheEntry = await CaptionCache.findByIdAndUpdate(
          cacheEntry._id,
          {
            $set: {
              captions,
              userId,
              lastUsed: new Date()
            },
            $inc: { usageCount: 1 }
          },
          { new: true }
        );
      } else {
        // Create new entry
        cacheEntry = await CaptionCache.create({
          imageHash: cacheKey,
          prompt: normalizedPrompt,
          mood,
          captions,
          userId,
          usageCount: 1,
          lastUsed: new Date(),
          createdAt: new Date()
        });
      }
      
              if (cacheEntry) {
          console.log(`💾 Cache ${cacheEntry.usageCount > 1 ? 'UPDATED' : 'STORED'}: Entry for image hash ${cacheKey.substring(0, 8)}... (usage: ${cacheEntry.usageCount})`);
        }
      
      return cacheEntry;
      
    } catch (error) {
      console.error('❌ Cache store error:', error);
      return null;
    }
  }
  
  /**
   * Get cache statistics
   */
  static async getStats(): Promise<CacheStats | null> {
    try {
      const stats = await CaptionCache.aggregate([
        {
          $group: {
            _id: null,
            totalEntries: { $sum: 1 },
            totalUsage: { $sum: '$usageCount' },
            averageUsage: { $avg: '$usageCount' },
            oldestEntry: { $min: '$createdAt' },
            newestEntry: { $max: '$createdAt' }
          }
        }
      ]);
      
      if (stats && stats.length > 0) {
        const stat = stats[0];
        return {
          totalEntries: stat.totalEntries || 0,
          totalUsage: stat.totalUsage || 0,
          averageUsage: Math.round((stat.averageUsage || 0) * 100) / 100,
          oldestEntry: stat.oldestEntry || new Date(),
          newestEntry: stat.newestEntry || new Date(),
          quotaSaved: (stat.totalUsage || 0) - (stat.totalEntries || 0) // Each cache hit saves one API call
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Cache stats error:', error);
      return null;
    }
  }
  
  /**
   * Clean old cache entries
   */
  static async cleanOldCache(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const result = await CaptionCache.deleteMany({
        createdAt: { $lt: cutoffDate },
        usageCount: { $lt: 2 } // Only delete entries used less than 2 times
      });
      
      console.log(`🧹 Cache CLEANED: Removed ${result.deletedCount} old entries`);
      
      return result.deletedCount || 0;
      
    } catch (error) {
      console.error('❌ Cache cleanup error:', error);
      return 0;
    }
  }
  
  /**
   * Search cache by various criteria
   */
  static async searchCache(criteria: {
    userId?: string;
    mood?: string;
    prompt?: string;
    dateRange?: { start: Date; end: Date };
    minUsage?: number;
  }): Promise<ICaptionCache[]> {
    try {
      const query: any = {};
      
      if (criteria.userId) query.userId = criteria.userId;
      if (criteria.mood) query.mood = criteria.mood;
      if (criteria.prompt) query.prompt = { $regex: criteria.prompt, $options: 'i' };
      if (criteria.dateRange) {
        query.createdAt = {
          $gte: criteria.dateRange.start,
          $lte: criteria.dateRange.end
        };
      }
      if (criteria.minUsage) query.usageCount = { $gte: criteria.minUsage };
      
      const results = await CaptionCache.find(query)
        .sort({ lastUsed: -1 })
        .limit(100);
      
      return results;
      
    } catch (error) {
      console.error('❌ Cache search error:', error);
      return [];
    }
  }
  
  /**
   * Get cache entry by ID
   */
  static async getCacheById(id: string): Promise<ICaptionCache | null> {
    try {
      return await CaptionCache.findById(id);
    } catch (error) {
      console.error('❌ Cache get by ID error:', error);
      return null;
    }
  }
  
  /**
   * Delete specific cache entry
   */
  static async deleteCacheEntry(id: string): Promise<boolean> {
    try {
      const result = await CaptionCache.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('❌ Cache delete error:', error);
      return false;
    }
  }
  
  /**
   * Get cache hit rate (percentage of requests served from cache)
   */
  static async getHitRate(): Promise<number> {
    try {
      const stats = await this.getStats();
      
      if (!stats || stats.totalUsage === 0) {
        return 0;
      }
      
      // Hit rate = (total usage - total entries) / total usage
      const hitRate = ((stats.totalUsage - stats.totalEntries) / stats.totalUsage) * 100;
      
      return Math.round(hitRate * 100) / 100;
      
    } catch (error) {
      console.error('❌ Cache hit rate error:', error);
      return 0;
    }
  }
}
