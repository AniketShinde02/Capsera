import dbConnect from '@/lib/db';
import { connectToDatabase } from '@/lib/db';
import { NextRequest } from 'next/server';
import RateLimit from '@/models/RateLimit';
import BlockedCredentials from '@/models/BlockedCredentials';

// Rate limiting configuration - Monthly quotas
export const RATE_LIMITS = {
  ANONYMOUS: {
    MAX_GENERATIONS: 5, // 5 images per month (15 captions total)
    WINDOW_HOURS: 24 * 30, // 30 days
  },
  AUTHENTICATED: {
    MAX_GENERATIONS: 25, // 25 images per month (75 captions total)
    WINDOW_HOURS: 24 * 30, // 30 days
  },
} as const;

// In-memory store for rate limiting (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Blocked credentials store (to prevent abuse)
const blockedCredentialsStore = new Map<string, { blockedUntil: number; attempts: number }>();

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
 * Check if user/IP has exceeded rate limit (database version)
 */
export async function checkRateLimit(key: string, maxGenerations: number, windowHours: number, userId?: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
}> {
  try {
    await dbConnect();
    
    // Check if user is admin - if so, bypass rate limiting
    if (userId) {
      try {
        // Use connectToDatabase for consistent connection handling
        const { db } = await connectToDatabase();
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ _id: userId });
        
        if (user?.isAdmin) {
          console.log(`👑 Admin user ${userId} - bypassing rate limits`);
          return {
            allowed: true,
            remaining: 999999, // Unlimited for admins
            resetTime: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
          };
        }
        
        // Also check adminusers collection
        const adminUsersCollection = db.collection('adminusers');
        const adminUser = await adminUsersCollection.findOne({ 
          email: user?.email || userId,
          isAdmin: true 
        });
        
        if (adminUser) {
          console.log(`👑 Admin user ${userId} found in adminusers collection - bypassing rate limits`);
          return {
            allowed: true,
            remaining: 999999, // Unlimited for admins
            resetTime: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
          };
        }
      } catch (error) {
        console.error('Error checking admin status in checkRateLimit:', error);
        // Continue with normal rate limiting if admin check fails
      }
    }
    
    const now = new Date();
    const windowMs = windowHours * 60 * 60 * 1000;
    
    // Find existing rate limit record
    let rateLimitRecord = await RateLimit.findOne({ key });
    
    if (!rateLimitRecord || now > rateLimitRecord.resetTime) {
      // First request or window expired, create/update entry
      const resetTime = new Date(now.getTime() + windowMs);
      
      if (rateLimitRecord) {
        rateLimitRecord.count = 1;
        rateLimitRecord.resetTime = resetTime;
        await rateLimitRecord.save();
      } else {
        rateLimitRecord = await RateLimit.create({
          key,
          count: 1,
          resetTime,
        });
      }
      
      return {
        allowed: true,
        remaining: maxGenerations - 1,
        resetTime: resetTime.getTime(),
      };
    }
    
    if (rateLimitRecord.count >= maxGenerations) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: rateLimitRecord.resetTime.getTime(),
      };
    }
    
    // Increment count
    rateLimitRecord.count++;
    await rateLimitRecord.save();
    
    return {
      allowed: true,
      remaining: maxGenerations - rateLimitRecord.count,
      resetTime: rateLimitRecord.resetTime.getTime(),
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
    let blockRecord = await BlockedCredentials.findOne({ email: normalizedEmail });
    
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
      await BlockedCredentials.create({
        email: normalizedEmail,
        blockedUntil,
        attempts,
        reason,
        ipAddress,
        userAgent,
      });
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
    
    const blockRecord = await BlockedCredentials.findOne({ email: normalizedEmail });
    
    if (!blockRecord || now > blockRecord.blockedUntil) {
      // Not blocked or block expired
      if (blockRecord && now > blockRecord.blockedUntil) {
        await BlockedCredentials.deleteOne({ _id: blockRecord._id });
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
 * Get rate limit info for display to user (database version)
 */
export async function getRateLimitInfo(userId?: string, ip?: string): Promise<{
  isAuthenticated: boolean;
  maxGenerations: number;
  currentUsage: number;
  remaining: number;
  resetTime: number;
  windowHours: number;
  isAdmin?: boolean;
}> {
  try {
    const isAuthenticated = !!userId;
    
    // Check if user is admin - if so, return unlimited status
    if (userId) {
      try {
        // Use connectToDatabase for consistent connection handling
        const { db } = await connectToDatabase();
        
        // First check the regular users collection using direct MongoDB query
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ _id: userId });
        
        // If not found in regular users, check adminusers collection
        if (!user || !user.isAdmin) {
          const adminUsersCollection = db.collection('adminusers');
          const adminUser = await adminUsersCollection.findOne({ 
            email: user?.email || userId,
            isAdmin: true 
          });
          
          if (adminUser) {
            console.log(`👑 Admin user ${userId} found in adminusers collection - showing unlimited rate limit info`);
            return {
              isAuthenticated: true,
              maxGenerations: 999999, // Unlimited for admins
              currentUsage: 0,
              remaining: 999999, // Unlimited remaining
              resetTime: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
              windowHours: 24,
              isAdmin: true,
            };
          }
        } else if (user?.isAdmin) {
          console.log(`👑 Admin user ${userId} found in users collection - showing unlimited rate limit info`);
          return {
            isAuthenticated: true,
            maxGenerations: 999999, // Unlimited for admins
            currentUsage: 0,
            remaining: 999999, // Unlimited remaining
            resetTime: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
            windowHours: 24,
            isAdmin: true,
          };
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    }
    
    const config = isAuthenticated ? RATE_LIMITS.AUTHENTICATED : RATE_LIMITS.ANONYMOUS;
    const key = generateRateLimitKey(userId, ip);
    
    await dbConnect();
    
    const now = new Date();
    const rateLimitRecord = await RateLimit.findOne({ key });
    
    let currentUsage = 0;
    let resetTime = now.getTime();
    
    if (rateLimitRecord && now <= rateLimitRecord.resetTime) {
      currentUsage = rateLimitRecord.count;
      resetTime = rateLimitRecord.resetTime.getTime();
    } else if (!rateLimitRecord) {
      // No usage yet, set reset time to 24 hours from now
      resetTime = now.getTime() + (config.WINDOW_HOURS * 60 * 60 * 1000);
    }
    
    return {
      isAuthenticated,
      maxGenerations: config.MAX_GENERATIONS,
      currentUsage,
      remaining: Math.max(0, config.MAX_GENERATIONS - currentUsage),
      resetTime,
      windowHours: config.WINDOW_HOURS,
      isAdmin: false,
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
