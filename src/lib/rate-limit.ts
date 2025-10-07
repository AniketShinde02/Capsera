import dbConnect from '@/lib/db';
import { connectToDatabase } from '@/lib/db';
import { NextRequest } from 'next/server';
import RateLimit from '@/models/RateLimit';
import BlockedCredentials from '@/models/BlockedCredentials';
import { ObjectId } from 'mongodb';

// In-memory stores for rate limiting and blocked credentials
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const blockedCredentialsStore = new Map<string, { blockedUntil: number; attempts: number }>();

// Rate limiting configuration - Daily quotas with soft limiting
// Default values that will be overridden by database values when available
export const RATE_LIMITS = {
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

/**
 * Detect user tier based on authentication and admin status
 */
export async function getUserTierInfo(userId?: string): Promise<UserTierInfo> {
  if (!userId) {
    return { tier: 'anonymous', isAdmin: false };
  }

  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (user?.isAdmin) {
      return { tier: 'pro', isAdmin: true };
    }

    // Check adminusers collection
    const adminUsersCollection = db.collection('adminusers');
    const adminUser = await adminUsersCollection.findOne({ 
      email: user?.email || userId,
      isAdmin: true 
    });
    
    if (adminUser) {
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
export function getNextMidnight(timezone: string = 'UTC'): Date {
  const now = new Date();
  const userTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  const nextMidnight = new Date(userTime);
  nextMidnight.setDate(nextMidnight.getDate() + 1);
  nextMidnight.setHours(0, 0, 0, 0);
  
  // Convert back to UTC
  const utcMidnight = new Date(nextMidnight.toLocaleString("en-US", { timeZone: "UTC" }));
  return utcMidnight;
}

/**
 * Get rate limit config based on user tier
 * This function will check the database for custom configurations first
 * and fall back to default values if not found
 */
export async function getRateLimitConfig(tier: UserTier) {
  // Check if we need to refresh the cache
  const now = new Date();
  const shouldRefreshCache = !rateLimitConfigCache.lastFetched || 
    (now.getTime() - rateLimitConfigCache.lastFetched.getTime() > CACHE_EXPIRATION_MS);
  
  // Fetch from database if cache is expired or empty
  if (shouldRefreshCache) {
    await refreshRateLimitConfigCache();
  }
  
  // Use cached values if available
  if (tier === 'anonymous' && rateLimitConfigCache.anonymous) {
    return {
      MAX_GENERATIONS: rateLimitConfigCache.anonymous.maxGenerations,
      WINDOW_HOURS: rateLimitConfigCache.anonymous.windowHours,
      USER_TYPE: 'anonymous' as const,
    };
  } else if (tier === 'registered' && rateLimitConfigCache.registered) {
    return {
      MAX_GENERATIONS: rateLimitConfigCache.registered.maxGenerations,
      WINDOW_HOURS: rateLimitConfigCache.registered.windowHours,
      USER_TYPE: 'registered' as const,
    };
  } else if (tier === 'pro' && rateLimitConfigCache.pro) {
    return {
      MAX_GENERATIONS: rateLimitConfigCache.pro.maxGenerations,
      WINDOW_HOURS: rateLimitConfigCache.pro.windowHours,
      USER_TYPE: 'pro' as const,
    };
  }
  
  // Fall back to default values
  switch (tier) {
    case 'anonymous':
      return RATE_LIMITS.ANONYMOUS;
    case 'registered':
      return RATE_LIMITS.REGISTERED;
    case 'pro':
      return RATE_LIMITS.PRO;
    default:
      return RATE_LIMITS.ANONYMOUS;
  }
}

/**
 * Refresh the rate limit configuration cache from the database
 */
async function refreshRateLimitConfigCache() {
  try {
    await dbConnect();
    const mongoose = (await import('mongoose')).default;
    // Ensure model registration (hot-reload safe)
    try {
      await import('@/models/RateLimitConfig');
    } catch (e) {
      console.warn('Could not dynamically import RateLimitConfig model:', e && (e as Error).message);
    }

    // Fetch all configurations
    const configs = await mongoose.model('RateLimitConfig').find({});
    
    // Reset cache
    rateLimitConfigCache = { lastFetched: new Date() };
    
    // Update cache with database values
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
    
    console.log('Rate limit configurations refreshed from database');
  } catch (error) {
    console.error('Error refreshing rate limit configurations:', error);
    // Keep using the existing cache or default values
  }
}

// Blocked credentials store (to prevent abuse)
// Already defined at the top of the file

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
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
export function generateRateLimitKey(userId?: string, ip?: string): string {
  if (userId) {
    return `user:${userId}`;
  }
  return `ip:${ip || 'unknown'}`;
}

/**
 * Check if user/IP has exceeded rate limit (database version) - Updated for daily limits
 */
export async function checkRateLimit(key: string, maxGenerations: number, windowHours: number, userId?: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
  userTier?: UserTier;
  isAdmin?: boolean;
}> {
  try {
    await dbConnect();
    
    // Get user tier info
    const userTierInfo = await getUserTierInfo(userId);
    const config = await getRateLimitConfig(userTierInfo.tier);
    
    // Admin bypass for pro users
    if (userTierInfo.isAdmin || userTierInfo.tier === 'pro') {
      console.log(`👑 Pro user ${userId} - bypassing rate limits`);
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: getNextMidnight().getTime(),
        userTier: userTierInfo.tier,
        isAdmin: userTierInfo.isAdmin,
      };
    }
    
    const now = new Date();
    const resetTime = getNextMidnight(); // Daily reset at midnight
    
    // Find existing rate limit record
    let rateLimitRecord = await (RateLimit as any).findOne({ key });
    
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
          resetTime,
        });
        await rateLimitRecord.save();
      }
      
      return {
        allowed: true,
        remaining: config.MAX_GENERATIONS - 1,
        resetTime: resetTime.getTime(),
        userTier: userTierInfo.tier,
        isAdmin: userTierInfo.isAdmin,
      };
    }
    
    if (rateLimitRecord.count >= config.MAX_GENERATIONS) {
      // Rate limit exceeded - but we'll allow with soft limiting
      return {
        allowed: false,
        remaining: 0,
        resetTime: rateLimitRecord.resetTime.getTime(),
        userTier: userTierInfo.tier,
        isAdmin: userTierInfo.isAdmin,
      };
    }
    
    // Increment count
    rateLimitRecord.count++;
    await rateLimitRecord.save();
    
    return {
      allowed: true,
      remaining: config.MAX_GENERATIONS - rateLimitRecord.count,
      resetTime: rateLimitRecord.resetTime.getTime(),
      userTier: userTierInfo.tier,
      isAdmin: userTierInfo.isAdmin,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fallback to in-memory store on database error
    return checkRateLimitInMemory(key, maxGenerations, windowHours, userId);
  }
}

/**
 * Fallback in-memory rate limiting
 */
function checkRateLimitInMemory(key: string, maxGenerations: number, windowHours: number, userId?: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  // Note: In-memory fallback doesn't check admin status for performance
  // Admin users should always use the database version
  
  const now = Date.now();
  const windowMs = windowHours * 60 * 60 * 1000;
  
  const existing = rateLimitStore.get(key);
  
  if (!existing || now > existing.resetTime) {
    const resetTime = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    
    return {
      allowed: true,
      remaining: maxGenerations - 1,
      resetTime,
    };
  }
  
  if (existing.count >= maxGenerations) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: existing.resetTime,
    };
  }
  
  existing.count++;
  rateLimitStore.set(key, existing);
  
  return {
    allowed: true,
    remaining: maxGenerations - existing.count,
    resetTime: existing.resetTime,
  };
}

/**
 * Get current usage for a key
 */
export function getCurrentUsage(key: string): {
  count: number;
  resetTime: number;
} {
  const existing = rateLimitStore.get(key);
  const now = Date.now();
  
  if (!existing || now > existing.resetTime) {
    return { count: 0, resetTime: now };
  }
  
  return existing;
}

/**
 * Block credentials (email) to prevent abuse (database version)
 */
export async function blockCredentials(
  email: string, 
  reason: string = 'abuse_prevention',
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await dbConnect();
    
    const normalizedEmail = email.toLowerCase();
    const now = new Date();
    
    // Find existing block record
    let blockRecord = await (BlockedCredentials as any).findOne({ email: normalizedEmail });
    
    // Calculate block duration (escalating)
    const attempts = blockRecord ? blockRecord.attempts + 1 : 1;
    const blockDurationHours = Math.min(attempts * 24, 168); // Max 7 days
    const blockedUntil = new Date(now.getTime() + (blockDurationHours * 60 * 60 * 1000));
    
    if (blockRecord) {
      blockRecord.attempts = attempts;
      blockRecord.blockedUntil = blockedUntil;
      blockRecord.reason = reason;
      if (ipAddress) blockRecord.ipAddress = ipAddress;
      if (userAgent) blockRecord.userAgent = userAgent;
      await blockRecord.save();
    } else {
      const newBlockRecord = new BlockedCredentials({
        email: normalizedEmail,
        blockedUntil,
        attempts,
        reason,
        ipAddress,
        userAgent,
      });
      await newBlockRecord.save();
    }
    
    console.log(`🚫 Blocked credentials: ${email ? 'Email blocked' : 'IP blocked'} for ${blockDurationHours} hours (attempt ${attempts}). Reason: ${reason}`);
  } catch (error) {
    console.error('Error blocking credentials:', error);
    // Fallback to in-memory store
    blockCredentialsInMemory(email, reason);
  }
}

/**
 * Check if credentials are blocked (database version)
 */
export async function isCredentialsBlocked(email: string): Promise<{
  blocked: boolean;
  blockedUntil?: number;
  attempts?: number;
  hoursRemaining?: number;
  reason?: string;
}> {
  try {
    await dbConnect();
    
    const normalizedEmail = email.toLowerCase();
    const now = new Date();
    
    const blockRecord = await (BlockedCredentials as any).findOne({ email: normalizedEmail });
    
    if (!blockRecord || now > blockRecord.blockedUntil) {
      // Not blocked or block expired
      if (blockRecord && now > blockRecord.blockedUntil) {
        await (BlockedCredentials as any).deleteOne({ _id: blockRecord._id });
      }
      return { blocked: false };
    }
    
    const hoursRemaining = Math.ceil((blockRecord.blockedUntil.getTime() - now.getTime()) / (60 * 60 * 1000));
    
    return {
      blocked: true,
      blockedUntil: blockRecord.blockedUntil.getTime(),
      attempts: blockRecord.attempts,
      hoursRemaining,
      reason: blockRecord.reason,
    };
  } catch (error) {
    console.error('Error checking blocked credentials:', error);
    // Fallback to in-memory store
    return isCredentialsBlockedInMemory(email);
  }
}

/**
 * Fallback in-memory functions
 */
function blockCredentialsInMemory(email: string, reason: string): void {
  const key = `blocked:${email.toLowerCase()}`;
  const existing = blockedCredentialsStore.get(key);
  const now = Date.now();
  
  const attempts = existing ? existing.attempts + 1 : 1;
  const blockDurationHours = Math.min(attempts * 24, 168);
  const blockedUntil = now + (blockDurationHours * 60 * 60 * 1000);
  
  blockedCredentialsStore.set(key, { blockedUntil, attempts });
  console.log(`🚫 [Memory] Blocked credentials: ${email ? 'Email blocked' : 'IP blocked'} for ${blockDurationHours} hours (attempt ${attempts}). Reason: ${reason}`);
}

function isCredentialsBlockedInMemory(email: string): {
  blocked: boolean;
  blockedUntil?: number;
  attempts?: number;
  hoursRemaining?: number;
} {
  const key = `blocked:${email.toLowerCase()}`;
  const existing = blockedCredentialsStore.get(key);
  const now = Date.now();
  
  if (!existing || now > existing.blockedUntil) {
    if (existing && now > existing.blockedUntil) {
      blockedCredentialsStore.delete(key);
    }
    return { blocked: false };
  }
  
  const hoursRemaining = Math.ceil((existing.blockedUntil - now) / (60 * 60 * 1000));
  
  return {
    blocked: true,
    blockedUntil: existing.blockedUntil,
    attempts: existing.attempts,
    hoursRemaining,
  };
}

/**
 * Clean up expired entries (should be run periodically)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  
  // Clean up rate limit entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
  
  // Clean up blocked credentials
  for (const [key, value] of blockedCredentialsStore.entries()) {
    if (now > value.blockedUntil) {
      blockedCredentialsStore.delete(key);
    }
  }
  
  console.log('🧹 Cleaned up expired rate limit entries');
}

/**
 * Get rate limit info for display to user (database version) - Updated for daily limits
 */
export async function getRateLimitInfo(userId?: string, ip?: string): Promise<{
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
    const userTierInfo = await getUserTierInfo(userId);
    const config = await getRateLimitConfig(userTierInfo.tier);
    
    // Admin bypass for pro users
    if (userTierInfo.isAdmin || userTierInfo.tier === 'pro') {
      console.log(`👑 Pro user ${userId} - showing unlimited rate limit info`);
      return {
        isAuthenticated: !!userId,
        maxGenerations: Infinity,
        currentUsage: 0,
        remaining: Infinity,
        resetTime: getNextMidnight().getTime(),
        windowHours: 24,
        isAdmin: userTierInfo.isAdmin,
        userTier: userTierInfo.tier,
        resetMessage: 'Unlimited access',
      };
    }
    
    const key = generateRateLimitKey(userId, ip);
    
    await dbConnect();
    
    const now = new Date();
    const resetTime = getNextMidnight(); // Daily reset at midnight
    const rateLimitRecord = await (RateLimit as any).findOne({ key });
    
    let currentUsage = 0;
    let actualResetTime = resetTime.getTime();
    
    if (rateLimitRecord && now <= rateLimitRecord.resetTime) {
      currentUsage = rateLimitRecord.count;
      actualResetTime = rateLimitRecord.resetTime.getTime();
    }
    
    const remaining = Math.max(0, config.MAX_GENERATIONS - currentUsage);
    const hoursUntilReset = Math.ceil((actualResetTime - now.getTime()) / (60 * 60 * 1000));
    
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
    // Fallback to in-memory version
    return getRateLimitInfoInMemory(userId, ip);
  }
}

/**
 * Fallback in-memory rate limit info
 */
function getRateLimitInfoInMemory(userId?: string, ip?: string): {
  isAuthenticated: boolean;
  maxGenerations: number;
  currentUsage: number;
  remaining: number;
  resetTime: number;
  windowHours: number;
  isAdmin?: boolean;
} {
  const isAuthenticated = !!userId;
  const config = isAuthenticated ? RATE_LIMITS.AUTHENTICATED : RATE_LIMITS.ANONYMOUS;
  const key = generateRateLimitKey(userId, ip);
  const usage = getCurrentUsage(key);
  
  return {
    isAuthenticated,
    maxGenerations: config.MAX_GENERATIONS,
    currentUsage: usage.count,
    remaining: Math.max(0, config.MAX_GENERATIONS - usage.count),
    resetTime: usage.resetTime,
    windowHours: config.WINDOW_HOURS,
    isAdmin: false, // In-memory fallback doesn't check admin status
  };
}

// Cleanup expired entries every hour
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 60 * 60 * 1000); // Every hour
}
