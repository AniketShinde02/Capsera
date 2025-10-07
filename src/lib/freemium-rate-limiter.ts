// 🎯 NEW FREEMIUM RATE LIMITER - User-Friendly Strategy
// Implements monthly limits with graceful degradation and upgrade prompts

import dbConnect from '@/lib/db';
import { connectToDatabase } from '@/lib/db';
import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';

// 🎯 NEW FREEMIUM STRATEGY - Much Better Than Blocking!
export const FREEMIUM_LIMITS = {
  FREE_TIER: {
    MONTHLY_IMAGES: 5,        // 5 images per month (15 captions total)
    WEEKLY_GRACE: 1,          // 1 image per week after monthly limit
    RESET_TYPE: 'monthly' as const,
    USER_TYPE: 'free' as const,
  },
  BASIC_TIER: {
    MONTHLY_IMAGES: 50,       // 50 images per month (150 captions total)
    WEEKLY_GRACE: 5,          // 5 images per week after monthly limit
    RESET_TYPE: 'monthly' as const,
    USER_TYPE: 'basic' as const,
  },
  PRO_TIER: {
    MONTHLY_IMAGES: Infinity, // Unlimited for pro users
    WEEKLY_GRACE: Infinity,
    RESET_TYPE: 'monthly' as const,
    USER_TYPE: 'pro' as const,
  },
} as const;

export type FreemiumTier = 'free' | 'basic' | 'pro';
export type ResetType = 'monthly' | 'weekly';

export interface FreemiumUsage {
  userId?: string;
  ip?: string;
  tier: FreemiumTier;
  monthlyUsage: number;
  weeklyUsage: number;
  monthlyResetDate: Date;
  weeklyResetDate: Date;
  isAdmin: boolean;
  upgradePromptShown: boolean;
}

export interface FreemiumResult {
  allowed: boolean;
  reason?: string;
  remainingMonthly: number;
  remainingWeekly: number;
  resetTime: number;
  tier: FreemiumTier;
  upgradePrompt?: boolean;
  gracePeriod?: boolean;
  upgradeUrl?: string;
}

/**
 * 🎯 Get user's freemium tier based on authentication and subscription
 */
export async function getUserFreemiumTier(userId?: string): Promise<FreemiumTier> {
  if (!userId) {
    return 'free';
  }

  try {
    const { db } = await connectToDatabase();
    
    // Check if user is admin (gets pro tier)
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (user?.isAdmin) {
      return 'pro';
    }

    // Check adminusers collection
    const adminUsersCollection = db.collection('adminusers');
    const adminUser = await adminUsersCollection.findOne({ 
      email: user?.email || userId,
      isAdmin: true 
    });
    
    if (adminUser) {
      return 'pro';
    }

    // TODO: Check subscription status (future feature)
    // For now, all registered users are 'basic' tier
    return 'basic';
  } catch (error) {
    console.error('Error detecting freemium tier:', error);
    return 'free'; // Default to free tier on error
  }
}

/**
 * 🎯 Get next monthly reset date (1st of next month)
 */
export function getNextMonthlyReset(): Date {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  nextMonth.setHours(0, 0, 0, 0);
  return nextMonth;
}

/**
 * 🎯 Get next weekly reset date (next Monday)
 */
export function getNextWeeklyReset(): Date {
  const now = new Date();
  const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday;
}

/**
 * 🎯 Check freemium usage limits with graceful degradation
 */
export async function checkFreemiumLimits(
  userId?: string, 
  ip?: string
): Promise<FreemiumResult> {
  try {
    await dbConnect();
    
    const tier = await getUserFreemiumTier(userId);
    // Map tier to the FREEMIUM_LIMITS key (FREE_TIER, BASIC_TIER, PRO_TIER)
    const tierKeyMap: Record<string, keyof typeof FREEMIUM_LIMITS> = {
      free: 'FREE_TIER',
      basic: 'BASIC_TIER',
      pro: 'PRO_TIER'
    };
    const configKey = tierKeyMap[tier] || 'FREE_TIER';
    const config = FREEMIUM_LIMITS[configKey];
    
    // Pro users get unlimited access
    if (tier === 'pro') {
      return {
        allowed: true,
        remainingMonthly: Infinity,
        remainingWeekly: Infinity,
        resetTime: getNextMonthlyReset().getTime(),
        tier: 'pro',
      };
    }

    const key = userId ? `user:${userId}` : `ip:${ip || 'unknown'}`;
    const now = new Date();
    const monthlyReset = getNextMonthlyReset();
    const weeklyReset = getNextWeeklyReset();

    // Get or create usage record
    const { db } = await connectToDatabase();
    const usageCollection = db.collection('freemium_usage');
    
    let usageRecord = await usageCollection.findOne({ key });
    
    if (!usageRecord || now > usageRecord.monthlyResetDate) {
      // First usage or monthly reset
      const newUsageRecord = {
        key,
        userId,
        ip,
        tier,
        monthlyUsage: 0,
        weeklyUsage: 0,
        monthlyResetDate: monthlyReset,
        weeklyResetDate: weeklyReset,
        isAdmin: false,
        upgradePromptShown: false,
        createdAt: now,
        updatedAt: now,
      };
      
      if (usageRecord) {
        // Update existing record
        await usageCollection.updateOne(
          { key },
          { 
            $set: {
              monthlyUsage: 0,
              weeklyUsage: 0,
              monthlyResetDate: monthlyReset,
              weeklyResetDate: weeklyReset,
              updatedAt: now
            }
          }
        );
        usageRecord = { ...usageRecord, ...newUsageRecord } as any;
      } else {
        // Insert new record
        await usageCollection.insertOne(newUsageRecord);
        usageRecord = newUsageRecord as any;
      }
    }

    // Reset weekly usage if needed
    if (now > usageRecord.weeklyResetDate) {
      usageRecord.weeklyUsage = 0;
      usageRecord.weeklyResetDate = weeklyReset;
      await usageCollection.updateOne(
        { key },
        { 
          $set: { 
            weeklyUsage: 0,
            weeklyResetDate: weeklyReset,
            updatedAt: now
          }
        }
      );
    }

  const monthlyLimit = typeof config?.MONTHLY_IMAGES === 'number' ? config.MONTHLY_IMAGES : (FREEMIUM_LIMITS.FREE_TIER.MONTHLY_IMAGES as number);
  const weeklyGrace = typeof config?.WEEKLY_GRACE === 'number' ? config.WEEKLY_GRACE : (FREEMIUM_LIMITS.FREE_TIER.WEEKLY_GRACE as number);

  const currentMonthlyUsage = usageRecord.monthlyUsage || 0;
  const currentWeeklyUsage = usageRecord.weeklyUsage || 0;

  const remainingMonthly = Math.max(0, (monthlyLimit === Infinity ? Number.MAX_SAFE_INTEGER : monthlyLimit) - currentMonthlyUsage);
  const remainingWeekly = Math.max(0, (weeklyGrace === Infinity ? Number.MAX_SAFE_INTEGER : weeklyGrace) - currentWeeklyUsage);

    // 🎯 GRACEFUL DEGRADATION LOGIC
    if (remainingMonthly > 0) {
      // Within monthly limit - allow and increment
      await usageCollection.updateOne(
        { key },
        { 
          $inc: { monthlyUsage: 1 },
          $set: { updatedAt: now }
        }
      );
      
      return {
        allowed: true,
        remainingMonthly: remainingMonthly - 1,
        remainingWeekly,
        resetTime: monthlyReset.getTime(),
        tier,
        upgradePrompt: remainingMonthly === 1, // Show upgrade prompt at last image
      };
    }

    // Monthly limit exceeded - check weekly grace period
    if (remainingWeekly > 0) {
      // Within weekly grace period - allow with warning
      await usageCollection.updateOne(
        { key },
        { 
          $inc: { weeklyUsage: 1 },
          $set: { updatedAt: now }
        }
      );
      
      return {
        allowed: true,
        remainingMonthly: 0,
        remainingWeekly: remainingWeekly - 1,
        resetTime: weeklyReset.getTime(),
        tier,
        gracePeriod: true,
        reason: `Monthly limit reached. Using weekly grace period (${remainingWeekly - 1} remaining this week).`,
        upgradePrompt: true,
      };
    }

    // Both limits exceeded - show upgrade prompt but still allow (soft limit)
    return {
      allowed: true, // 🎯 SOFT LIMIT - Don't block users!
      remainingMonthly: 0,
      remainingWeekly: 0,
      resetTime: monthlyReset.getTime(),
      tier,
      reason: 'Monthly and weekly limits reached. Upgrade for unlimited access!',
      upgradePrompt: true,
      upgradeUrl: '/pricing',
    };

  } catch (error) {
    console.error('Freemium limit check error:', error);
    
    // Fallback to permissive mode on error
    return {
      allowed: true,
      remainingMonthly: 5,
      remainingWeekly: 1,
      resetTime: getNextMonthlyReset().getTime(),
      tier: 'free',
      reason: 'System error - allowing access',
    };
  }
}

/**
 * 🎯 Get freemium usage info for display
 */
export async function getFreemiumUsageInfo(
  userId?: string, 
  ip?: string
): Promise<{
  tier: FreemiumTier;
  monthlyUsage: number;
  weeklyUsage: number;
  monthlyLimit: number;
  weeklyLimit: number;
  remainingMonthly: number;
  remainingWeekly: number;
  resetTime: number;
  isInGracePeriod: boolean;
  upgradePrompt: boolean;
}> {
  try {
    const tier = await getUserFreemiumTier(userId);
    const tierKeyMap: Record<string, keyof typeof FREEMIUM_LIMITS> = {
      free: 'FREE_TIER',
      basic: 'BASIC_TIER',
      pro: 'PRO_TIER'
    };
    const configKey = tierKeyMap[tier] || 'FREE_TIER';
    const config = FREEMIUM_LIMITS[configKey];
    
    if (tier === 'pro') {
      return {
        tier: 'pro',
        monthlyUsage: 0,
        weeklyUsage: 0,
        monthlyLimit: Infinity,
        weeklyLimit: Infinity,
        remainingMonthly: Infinity,
        remainingWeekly: Infinity,
        resetTime: getNextMonthlyReset().getTime(),
        isInGracePeriod: false,
        upgradePrompt: false,
      };
    }

    const key = userId ? `user:${userId}` : `ip:${ip || 'unknown'}`;
    const { db } = await connectToDatabase();
    const usageCollection = db.collection('freemium_usage');
    
    const usageRecord = await usageCollection.findOne({ key });
    const now = new Date();
    
    let monthlyUsage = 0;
    let weeklyUsage = 0;
    
    if (usageRecord && now <= usageRecord.monthlyResetDate) {
      monthlyUsage = usageRecord.monthlyUsage || 0;
    }
    
    if (usageRecord && now <= usageRecord.weeklyResetDate) {
      weeklyUsage = usageRecord.weeklyUsage || 0;
    }

  const monthlyLimit = typeof config?.MONTHLY_IMAGES === 'number' ? config.MONTHLY_IMAGES : (FREEMIUM_LIMITS.FREE_TIER.MONTHLY_IMAGES as number);
  const weeklyGrace = typeof config?.WEEKLY_GRACE === 'number' ? config.WEEKLY_GRACE : (FREEMIUM_LIMITS.FREE_TIER.WEEKLY_GRACE as number);

  const remainingMonthly = Math.max(0, (monthlyLimit === Infinity ? Number.MAX_SAFE_INTEGER : monthlyLimit) - monthlyUsage);
  const remainingWeekly = Math.max(0, (weeklyGrace === Infinity ? Number.MAX_SAFE_INTEGER : weeklyGrace) - weeklyUsage);
  const isInGracePeriod = remainingMonthly === 0 && remainingWeekly > 0;

    return {
      tier,
      monthlyUsage,
      weeklyUsage,
      monthlyLimit: config.MONTHLY_IMAGES,
      weeklyLimit: config.WEEKLY_GRACE,
      remainingMonthly,
      remainingWeekly,
      resetTime: getNextMonthlyReset().getTime(),
      isInGracePeriod,
      upgradePrompt: remainingMonthly <= 1 || isInGracePeriod,
    };
  } catch (error) {
    console.error('Error getting freemium usage info:', error);
    
    // Fallback info
    return {
      tier: 'free',
      monthlyUsage: 0,
      weeklyUsage: 0,
      monthlyLimit: 5,
      weeklyLimit: 1,
      remainingMonthly: 5,
      remainingWeekly: 1,
      resetTime: getNextMonthlyReset().getTime(),
      isInGracePeriod: false,
      upgradePrompt: false,
    };
  }
}

/**
 * 🎯 Mark upgrade prompt as shown (to avoid spam)
 */
export async function markUpgradePromptShown(userId?: string, ip?: string): Promise<void> {
  try {
    const key = userId ? `user:${userId}` : `ip:${ip || 'unknown'}`;
    const { db } = await connectToDatabase();
    const usageCollection = db.collection('freemium_usage');
    
    await usageCollection.updateOne(
      { key },
      { 
        $set: { 
          upgradePromptShown: true,
          updatedAt: new Date()
        }
      }
    );
  } catch (error) {
    console.error('Error marking upgrade prompt as shown:', error);
  }
}

/**
 * 🎯 Clean up old usage records (run periodically)
 */
export async function cleanupOldUsageRecords(): Promise<void> {
  try {
    const { db } = await connectToDatabase();
    const usageCollection = db.collection('freemium_usage');
    
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 3); // Keep 3 months of data
    
    const result = await usageCollection.deleteMany({
      updatedAt: { $lt: cutoffDate }
    });
    
    console.log(`🧹 Cleaned up ${result.deletedCount} old freemium usage records`);
  } catch (error) {
    console.error('Error cleaning up old usage records:', error);
  }
}

// Run cleanup every 24 hours
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupOldUsageRecords, 24 * 60 * 60 * 1000);
}
