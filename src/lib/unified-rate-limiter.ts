import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { connectToDatabase } from '@/lib/db';
import RateLimit from '@/models/RateLimit';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

// Rate limiting configuration - Daily quotas with soft limiting
// Default values that will be overridden by database values when available
export const DEFAULT_RATE_LIMITS = {
  ANONYMOUS: {
    MAX_GENERATIONS: 10, // 10 images per day (30 captions total)
    WINDOW_HOURS: 24, // 24 hours (daily reset)
    USER_TYPE: 'anonymous' as const,
  },
  REGISTERED: {
    MAX_GENERATIONS: 20, // 20 images per day (60 captions total)
    WINDOW_HOURS: 24, // 24 hours (daily reset)
    USER_TYPE: 'registered' as const,
  },
  PRO: {
    MAX_GENERATIONS: 50, // 50 images per day (150 captions total)
    WINDOW_HOURS: 24, // 24 hours (daily reset)
    USER_TYPE: 'pro' as const,
  },
  // Legacy support for existing authenticated users
  AUTHENTICATED: {
    MAX_GENERATIONS: 20, // 20 images per day (60 captions total)
    WINDOW_HOURS: 24, // 24 hours (daily reset)
    USER_TYPE: 'registered' as const,
  },
} as const;

// Cache for rate limit configurations to avoid frequent database lookups
let rateLimitConfigCache: {
  anonymous?: { maxGenerations: number; windowHours: number; updatedAt: Date };
  registered?: { maxGenerations: number; windowHours: number; updatedAt: Date };
  pro?: { maxGenerations: number; windowHours: number; updatedAt: Date };
  lastFetched?: Date;
} = {};

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION_MS = 5 * 60 * 1000;

// User tier detection and timezone handling
export type UserTier = 'anonymous' | 'registered' | 'pro';

export interface UserTierInfo {
  tier: UserTier;
  isAdmin: boolean;
  timezone?: string;
}

// Blocked credentials store (to prevent abuse)
const blockedCredentialsStore = new Map<string, { blockedUntil: number; attempts: number }>();

// Suspicious IPs tracking
const suspiciousIPs = new Set<string>();

// Violation statistics
let violationCount = 0;
let violationStats = {
  daily: 0,
  weekly: 0,
  monthly: 0,
  byUserType: {
    anonymous: 0,
    registered: 0,
    pro: 0
  }
};

/**
 * Unified Rate Limiter Class
 * Combines functionality from rate-limit.ts, rate-limit-simple.ts, and smart-rate-limiter.ts
 */
export class UnifiedRateLimiter {
  private trustedIPs: Set<string> = new Set();

  constructor() {
    // Load trusted IPs from environment
    const trustedIPsEnv = process.env.TRUSTED_IPS?.split(',') || [];
    trustedIPsEnv.forEach(ip => this.trustedIPs.add(ip.trim()));

    // Clean up blocked credentials periodically
    setInterval(() => this.cleanupBlockedCredentials(), 15 * 60 * 1000); // 15 minutes
  }

  /**
   * Get client IP address from request
   */
  getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');

    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    if (cfConnectingIP) {
      return cfConnectingIP;
    }

    if (realIP) {
      return realIP;
    }

    // Fallback to connection remote address
    return 'unknown';
  }

  /**
   * Generate rate limit key based on user ID or IP
   */
  generateRateLimitKey(userId?: string, ip?: string): string {
    if (userId) {
      return `user:${userId}`;
    }
    return `ip:${ip || 'unknown'}`;
  }

  /**
   * Get suspicious IPs that have been flagged for rate limit violations
   */
  getSuspiciousIPs(): Set<string> {
    return suspiciousIPs;
  }

  /**
   * Get violation statistics for rate limiting
   */
  async getViolationStats() {
    return violationStats;
  }

  /**
   * Get total violation count
   */
  getViolationCount(): number {
    return violationCount;
  }

  /**
   * Detect user tier based on authentication and admin status
   */
  async getUserTierInfo(userId?: string): Promise<UserTierInfo> {
    if (!userId) {
      return { tier: 'anonymous', isAdmin: false };
    }

    try {
      const { db } = await connectToDatabase();

      // Check if userId is a valid MongoDB ObjectId
      let user = null;
      if (userId && userId.length === 24 && /^[0-9a-fA-F]{24}$/.test(userId)) {
        // Check regular users collection first
        const usersCollection = db.collection('users');
        user = await usersCollection.findOne({ _id: new ObjectId(userId) });

        if (user?.isAdmin) {
          console.log(`👑 Admin user detected from users collection: ${userId}`);
          return { tier: 'pro', isAdmin: true };
        }
      }

      // Check adminusers collection
      const adminUsersCollection = db.collection('adminusers');
      const adminUser = await adminUsersCollection.findOne({
        _id: (userId.length === 24 && /^[0-9a-fA-F]{24}$/.test(userId)) ? new ObjectId(userId) : userId
      });

      if (adminUser?.isAdmin) {
        console.log(`👑 Admin user detected from adminusers collection: ${userId}`);
        return { tier: 'pro', isAdmin: true };
      }

      // Check if user has pro subscription (future feature)
      // For now, all registered users are 'registered' tier
      return { tier: 'registered', isAdmin: false };
    } catch (error) {
      console.error('Error detecting user tier:', error);
      return { tier: 'registered', isAdmin: false };
    }
  }

  /**
   * Get next midnight in user's timezone
   */
  getNextMidnight(timezone: string = 'UTC'): Date {
    const now = new Date();
    const userTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    const nextMidnight = new Date(userTime);
    nextMidnight.setDate(nextMidnight.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);

    return nextMidnight;
  }

  /**
   * Get rate limit configuration for a specific tier
   */
  async getRateLimitConfig(tier: UserTier): Promise<typeof DEFAULT_RATE_LIMITS[keyof typeof DEFAULT_RATE_LIMITS]> {
    // Check if cache is valid
    const now = new Date();
    if (
      rateLimitConfigCache.lastFetched &&
      now.getTime() - rateLimitConfigCache.lastFetched.getTime() < CACHE_EXPIRATION_MS
    ) {
      // Use cached values if available
      if (tier === 'anonymous' && rateLimitConfigCache.anonymous) {
        return {
          ...DEFAULT_RATE_LIMITS.ANONYMOUS,
          MAX_GENERATIONS: rateLimitConfigCache.anonymous.maxGenerations as 10,
          WINDOW_HOURS: rateLimitConfigCache.anonymous.windowHours as 24,
        };
      } else if (tier === 'registered' && rateLimitConfigCache.registered) {
        return {
          ...DEFAULT_RATE_LIMITS.REGISTERED,
          MAX_GENERATIONS: rateLimitConfigCache.registered.maxGenerations as 20,
          WINDOW_HOURS: rateLimitConfigCache.registered.windowHours as 24,
        };
      } else if (tier === 'pro' && rateLimitConfigCache.pro) {
        return {
          ...DEFAULT_RATE_LIMITS.PRO,
          MAX_GENERATIONS: rateLimitConfigCache.pro.maxGenerations as 50,
          WINDOW_HOURS: rateLimitConfigCache.pro.windowHours as 24,
        };
      }
    }

    // Refresh cache
    await this.refreshRateLimitConfigCache();

    // Return appropriate config based on tier
    if (tier === 'anonymous' && rateLimitConfigCache.anonymous) {
      return {
        ...DEFAULT_RATE_LIMITS.ANONYMOUS,
        MAX_GENERATIONS: rateLimitConfigCache.anonymous.maxGenerations as 10,
        WINDOW_HOURS: rateLimitConfigCache.anonymous.windowHours as 24,
      };
    } else if (tier === 'registered' && rateLimitConfigCache.registered) {
      return {
        ...DEFAULT_RATE_LIMITS.REGISTERED,
        MAX_GENERATIONS: rateLimitConfigCache.registered.maxGenerations as 20,
        WINDOW_HOURS: rateLimitConfigCache.registered.windowHours as 24,
      };
    } else if (tier === 'pro' && rateLimitConfigCache.pro) {
      return {
        ...DEFAULT_RATE_LIMITS.PRO,
        MAX_GENERATIONS: rateLimitConfigCache.pro.maxGenerations as 50,
        WINDOW_HOURS: rateLimitConfigCache.pro.windowHours as 24,
      };
    }

    // Fallback to default values if no database config is available
    if (tier === 'anonymous') {
      return DEFAULT_RATE_LIMITS.ANONYMOUS;
    } else if (tier === 'registered') {
      return DEFAULT_RATE_LIMITS.REGISTERED;
    } else {
      return DEFAULT_RATE_LIMITS.PRO;
    }
  }

  /**
   * Refresh rate limit configuration cache from database
   */
  async refreshRateLimitConfigCache(): Promise<void> {
    try {
      await dbConnect();
      // Ensure the RateLimitConfig model is registered (hot-reload safe)
      try {
        await import('@/models/RateLimitConfig');
      } catch (e) {
        // If import fails, log and continue - mongoose.model may still work if registered elsewhere
        console.warn('Could not dynamically import RateLimitConfig model:', e && (e as Error).message);
      }

      // Get configurations from database
      const configs = await mongoose.model('RateLimitConfig').find({});

      // Update cache
      rateLimitConfigCache = {
        lastFetched: new Date()
      };

      for (const config of configs) {
        if (config.tier === 'anonymous') {
          rateLimitConfigCache.anonymous = {
            maxGenerations: config.maxGenerations,
            windowHours: config.windowHours,
            updatedAt: config.updatedAt
          };
        } else if (config.tier === 'registered') {
          rateLimitConfigCache.registered = {
            maxGenerations: config.maxGenerations,
            windowHours: config.windowHours,
            updatedAt: config.updatedAt
          };
        } else if (config.tier === 'pro') {
          rateLimitConfigCache.pro = {
            maxGenerations: config.maxGenerations,
            windowHours: config.windowHours,
            updatedAt: config.updatedAt
          };
        }
      }
    } catch (error) {
      console.error('Error refreshing rate limit config cache:', error);
      // Keep using existing cache or defaults if refresh fails
    }
  }

  /**
   * Check if user/IP has exceeded rate limit (database version) - Updated for daily limits
   */
  async checkRateLimit(key: string, maxGenerations: number, windowHours: number, userId?: string, ip?: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    userTier?: UserTier;
    isAdmin?: boolean;
    reason?: string;
    retryAfter?: number;
  }> {
    try {
      await dbConnect();

      // Check if IP is trusted
      const isTrusted = ip ? this.trustedIPs.has(ip) : false;

      // Get user tier info
      const userTierInfo = await this.getUserTierInfo(userId);
      const config = await this.getRateLimitConfig(userTierInfo.tier);

      // Admin bypass for pro users
      if (userTierInfo.isAdmin || userTierInfo.tier === 'pro' || isTrusted) {
        console.log(`👑 Pro/Admin/Trusted user ${userId || ip} - bypassing rate limits`);
        return {
          allowed: true,
          remaining: Infinity,
          resetTime: this.getNextMidnight().getTime(),
          userTier: userTierInfo.tier,
          isAdmin: userTierInfo.isAdmin,
        };
      }

      // Check if credentials are blocked
      if (this.isBlocked(key)) {
        const blockedInfo = blockedCredentialsStore.get(key);
        const retryAfter = Math.ceil((blockedInfo!.blockedUntil - Date.now()) / 1000);

        return {
          allowed: false,
          remaining: 0,
          resetTime: blockedInfo!.blockedUntil,
          userTier: userTierInfo.tier,
          isAdmin: userTierInfo.isAdmin,
          reason: `Temporarily blocked due to suspicious activity. Try again later.`,
          retryAfter
        };
      }

      const now = new Date();
      const resetTime = this.getNextMidnight(); // Daily reset at midnight

      // Find existing rate limit record
      let rateLimitRecord = await mongoose.model('RateLimit').findOne({ key });

      if (!rateLimitRecord || now > rateLimitRecord.resetTime) {
        // First request or window expired, create/update entry

        if (rateLimitRecord) {
          rateLimitRecord.count = 1;
          rateLimitRecord.resetTime = resetTime;
          await rateLimitRecord.save();
        } else {
          rateLimitRecord = new RateLimit({
            key,
            count: 1,
            resetTime
          });
          await rateLimitRecord.save();
        }

        return {
          allowed: true,
          remaining: maxGenerations - 1,
          resetTime: resetTime.getTime(),
          userTier: userTierInfo.tier,
          isAdmin: userTierInfo.isAdmin
        };
      }

      // Check if limit exceeded
      if (rateLimitRecord.count >= maxGenerations) {
        // Increment violation count for smart rate limiting
        if (ip) {
          this.recordViolation(ip);
        }

        return {
          allowed: false,
          remaining: 0,
          resetTime: rateLimitRecord.resetTime.getTime(),
          userTier: userTierInfo.tier,
          isAdmin: userTierInfo.isAdmin,
          reason: `Rate limit exceeded. Try again after reset.`,
          retryAfter: Math.ceil((rateLimitRecord.resetTime.getTime() - now.getTime()) / 1000)
        };
      }

      // Increment count - only increment if this is a new request, not a duplicate
      // This prevents double-counting when the same request is made multiple times
      const requestId = `${key}_${now.getTime()}`;
      const oldCount = rateLimitRecord.count;

      if (!rateLimitRecord.processedRequests || !rateLimitRecord.processedRequests.includes(requestId)) {
        rateLimitRecord.count += 1;

        console.log(`📊 Incrementing rate limit count:`, {
          key,
          oldCount,
          newCount: rateLimitRecord.count,
          requestId,
          processedRequests: rateLimitRecord.processedRequests?.length || 0
        });

        // Track this request to prevent double counting
        if (!rateLimitRecord.processedRequests) {
          rateLimitRecord.processedRequests = [];
        }

        // Keep only the last 10 processed requests to prevent memory issues
        if (rateLimitRecord.processedRequests.length >= 10) {
          rateLimitRecord.processedRequests.shift();
        }

        rateLimitRecord.processedRequests.push(requestId);

        try {
          await rateLimitRecord.save();
          console.log(`✅ Rate limit record saved successfully:`, {
            key,
            count: rateLimitRecord.count,
            resetTime: rateLimitRecord.resetTime
          });
        } catch (saveError) {
          console.error(`❌ Failed to save rate limit record:`, saveError);
        }
      } else {
        console.log(`📊 Request already processed, skipping increment:`, {
          key,
          requestId,
          currentCount: rateLimitRecord.count
        });
      }

      return {
        allowed: true,
        remaining: maxGenerations - rateLimitRecord.count,
        resetTime: rateLimitRecord.resetTime.getTime(),
        userTier: userTierInfo.tier,
        isAdmin: userTierInfo.isAdmin
      };
    } catch (error) {
      console.error('Error checking rate limit:', error);

      // Fallback to allowing the request in case of database errors
      return {
        allowed: true,
        remaining: maxGenerations - 1,
        resetTime: this.getNextMidnight().getTime()
      };
    }
  }

  /**
   * Get rate limit info for display to user
   */
  async getRateLimitInfo(userId?: string, ip?: string): Promise<{
    isAuthenticated: boolean;
    maxGenerations: number;
    currentUsage: number;
    remaining: number;
    resetTime: number;
    windowHours: number;
    isAdmin?: boolean;
    userTier?: UserTier;
    resetMessage?: string;
  }> {
    try {
      // Get user tier info
      const userTierInfo = await this.getUserTierInfo(userId);
      const config = await this.getRateLimitConfig(userTierInfo.tier);

      // Check if IP is trusted
      const isTrusted = ip ? this.trustedIPs.has(ip) : false;

      // Admin bypass for pro users and trusted IPs (MATCHES checkRateLimit logic)
      if (userTierInfo.isAdmin || userTierInfo.tier === 'pro' || isTrusted) {
        console.log(`👑 Pro/Admin/Trusted user ${userId || ip} - showing unlimited rate limit info`);
        return {
          isAuthenticated: !!userId,
          maxGenerations: Infinity,
          currentUsage: 0,
          remaining: Infinity,
          resetTime: this.getNextMidnight().getTime(),
          windowHours: 24,
          isAdmin: userTierInfo.isAdmin,
          userTier: userTierInfo.tier,
          resetMessage: 'Unlimited access',
        };
      }

      const key = this.generateRateLimitKey(userId, ip);

      await dbConnect();

      const now = new Date();
      const resetTime = this.getNextMidnight(); // Daily reset at midnight
      const rateLimitRecord = await mongoose.model('RateLimit').findOne({ key });

      let currentUsage = 0;
      let actualResetTime = resetTime.getTime();

      if (rateLimitRecord && now <= rateLimitRecord.resetTime) {
        currentUsage = rateLimitRecord.count;
        actualResetTime = rateLimitRecord.resetTime.getTime();
        console.log(`📊 Found rate limit record:`, {
          key,
          count: rateLimitRecord.count,
          resetTime: rateLimitRecord.resetTime,
          now
        });
      } else {
        console.log(`📊 No valid rate limit record found for key:`, key);
      }

      const remaining = Math.max(0, config.MAX_GENERATIONS - currentUsage);
      const hoursUntilReset = Math.ceil((actualResetTime - now.getTime()) / (60 * 60 * 1000));

      console.log(`📊 Rate limit info calculation:`, {
        userId: userId || 'anonymous',
        key,
        config: config.MAX_GENERATIONS,
        currentUsage,
        remaining,
        resetTime: actualResetTime,
        now: now.getTime()
      });

      // Generate friendly reset message
      let resetMessage = 'tomorrow';
      if (hoursUntilReset < 24) {
        if (hoursUntilReset < 1) {
          resetMessage = 'in less than an hour';
        } else {
          resetMessage = `in ${hoursUntilReset} hours`;
        }
      }

      return {
        isAuthenticated: !!userId,
        maxGenerations: config.MAX_GENERATIONS,
        currentUsage,
        remaining,
        resetTime: actualResetTime,
        windowHours: 24,
        isAdmin: userTierInfo.isAdmin,
        userTier: userTierInfo.tier,
        resetMessage,
      };
    } catch (error) {
      console.error('Error getting rate limit info:', error);

      // Fallback to default values
      return {
        isAuthenticated: !!userId,
        maxGenerations: userId ? DEFAULT_RATE_LIMITS.REGISTERED.MAX_GENERATIONS : DEFAULT_RATE_LIMITS.ANONYMOUS.MAX_GENERATIONS,
        currentUsage: 0,
        remaining: userId ? DEFAULT_RATE_LIMITS.REGISTERED.MAX_GENERATIONS : DEFAULT_RATE_LIMITS.ANONYMOUS.MAX_GENERATIONS,
        resetTime: this.getNextMidnight().getTime(),
        windowHours: 24,
        resetMessage: 'tomorrow',
      };
    }
  }

  /**
   * Record a violation for an IP address (for smart rate limiting)
   */
  private recordViolation(ip: string): void {
    // Mark as suspicious after multiple violations
    if (this.getViolationCountForIP(ip) > 5) {
      suspiciousIPs.add(ip);
      console.warn(`🚨 Suspicious IP detected: ${ip}`);

      // Block after too many violations
      if (this.getViolationCountForIP(ip) > 10) {
        this.blockCredentials(`ip:${ip}`, 'rate_limit_abuse', ip);
      }
    }
  }

  /**
   * Get violation count for an IP
   */
  private getViolationCountForIP(ip: string): number {
    // Simple implementation - could be enhanced with a proper counter
    return suspiciousIPs.has(ip) ? 6 : 0;
  }

  /**
   * Block credentials (user ID or IP) for a period of time
   */
  async blockCredentials(key: string, reason: string, ip?: string, userAgent?: string): Promise<void> {
    const now = Date.now();
    const entry = blockedCredentialsStore.get(key);

    if (!entry) {
      // First violation - block for 15 minutes
      blockedCredentialsStore.set(key, {
        blockedUntil: now + (15 * 60 * 1000),
        attempts: 1
      });
    } else {
      // Repeat violation - increase block time
      const blockDuration = Math.min(24 * 60 * 60 * 1000, (entry.attempts + 1) * 30 * 60 * 1000);
      entry.blockedUntil = now + blockDuration;
      entry.attempts += 1;
    }

    console.warn(`🚫 Blocked ${key} for ${reason}. IP: ${ip || 'unknown'}, UA: ${userAgent || 'unknown'}`);
  }

  /**
   * Check if credentials are blocked
   */
  isBlocked(key: string): boolean {
    const entry = blockedCredentialsStore.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now > entry.blockedUntil) {
      // Block expired
      blockedCredentialsStore.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clean up expired blocked credentials
   */
  private cleanupBlockedCredentials(): void {
    const now = Date.now();
    for (const [key, entry] of blockedCredentialsStore.entries()) {
      if (now > entry.blockedUntil) {
        blockedCredentialsStore.delete(key);
      }
    }
  }

  /**
   * Get rate limiting insights for admin dashboard
   */
  getInsights(): {
    suspiciousIPs: string[];
    blockedCount: number;
    recommendations: string[]
  } {
    const suspiciousIPsList = Array.from(suspiciousIPs);
    const blockedCount = blockedCredentialsStore.size;

    const recommendations: string[] = [];

    if (suspiciousIPsList.length > 0) {
      recommendations.push(`Consider blocking ${suspiciousIPsList.length} suspicious IPs`);
    }

    if (blockedCount > 10) {
      recommendations.push('High number of blocked credentials - consider reviewing security measures');
    }

    return {
      suspiciousIPs: suspiciousIPsList,
      blockedCount,
      recommendations
    };
  }
}

// Create singleton instance
export const unifiedRateLimiter = new UnifiedRateLimiter();

// Export individual functions for easy use
export const getClientIP = (request: NextRequest) => unifiedRateLimiter.getClientIP(request);
export const generateRateLimitKey = (userId?: string, ip?: string) => unifiedRateLimiter.generateRateLimitKey(userId, ip);
export const getUserTierInfo = (userId?: string) => unifiedRateLimiter.getUserTierInfo(userId);
export const getNextMidnight = (timezone?: string) => unifiedRateLimiter.getNextMidnight(timezone);
export const getRateLimitConfig = (tier: UserTier) => unifiedRateLimiter.getRateLimitConfig(tier);
export const refreshRateLimitConfigCache = () => unifiedRateLimiter.refreshRateLimitConfigCache();
export const checkRateLimit = (key: string, maxGenerations: number, windowHours: number, userId?: string, ip?: string) =>
  unifiedRateLimiter.checkRateLimit(key, maxGenerations, windowHours, userId, ip);
export const getRateLimitInfo = (userId?: string, ip?: string) => unifiedRateLimiter.getRateLimitInfo(userId, ip);
export const blockCredentials = (key: string, reason: string, ip?: string, userAgent?: string) =>
  unifiedRateLimiter.blockCredentials(key, reason, ip, userAgent);
export const isBlocked = (key: string) => unifiedRateLimiter.isBlocked(key);
export const getInsights = () => unifiedRateLimiter.getInsights();