// 🎯 NEW FREEMIUM RATE LIMITER - User-Friendly Strategy
// Implements daily limits with graceful degradation and upgrade prompts

import dbConnect from '@/lib/db';
import { connectToDatabase } from '@/lib/db';
import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';

const DEBUG_LOG_FILE = path.join(process.cwd(), 'debug-rate-limit.log');

function logDebug(message: string, data?: any) {
  try {
    const timestamp = new Date().toISOString();
    const logLine = `${timestamp} - ${message} ${data ? JSON.stringify(data) : ''}\n`;
    fs.appendFileSync(DEBUG_LOG_FILE, logLine);
  } catch (e) {
    // Ignore logging errors
  }
}

// 🎯 NEW FREEMIUM STRATEGY - Much Better Than Blocking!
export const FREEMIUM_LIMITS = {
  FREE_TIER: {
    DAILY_IMAGES: 5,        // 5 images per day (15 captions total)
    WEEKLY_GRACE: 1,          // 1 image per week after daily limit
    RESET_TYPE: 'daily' as const,
    USER_TYPE: 'free' as const,
  },
  BASIC_TIER: {
    DAILY_IMAGES: 20,       // 20 images per day (60 captions total)
    WEEKLY_GRACE: 5,          // 5 images per week after daily limit
    RESET_TYPE: 'daily' as const,
    USER_TYPE: 'basic' as const,
  },
  PRO_TIER: {
    DAILY_IMAGES: Infinity, // Unlimited for pro users
    WEEKLY_GRACE: Infinity,
    RESET_TYPE: 'daily' as const,
    USER_TYPE: 'pro' as const,
  },
} as const;

export type FreemiumTier = 'free' | 'basic' | 'pro';
export type ResetType = 'daily' | 'weekly';

export interface FreemiumUsage {
  userId?: string;
  ip?: string;
  tier: FreemiumTier;
  dailyUsage: number;
  weeklyUsage: number;
  dailyResetDate: Date;
  weeklyResetDate: Date;
  isAdmin: boolean;
  upgradePromptShown: boolean;
}

export interface FreemiumResult {
  allowed: boolean;
  reason?: string;
  remainingDaily: number;
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
    // Only query users collection if userId is a valid ObjectId
    if (ObjectId.isValid(userId)) {
      const usersCollection = db.collection('users');
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

      if (user?.isAdmin) {
        console.log('👑 User is admin in users collection:', user.email);
        return 'pro';
      }
    }

    // Check adminusers collection (uses email or string ID)
    const adminUsersCollection = db.collection('adminusers');
    const adminUser = await adminUsersCollection.findOne({
      email: userId, // Check if userId is actually an email (sometimes passed as ID)
      isAdmin: true
    });

    if (adminUser) {
      console.log('👑 User is admin in adminusers collection:', adminUser.email);
      return 'pro';
    }

    // Also check if userId matches an admin email directly
    const adminUserByEmail = await adminUsersCollection.findOne({
      email: userId,
      isAdmin: true
    });

    if (adminUserByEmail) {
      return 'pro';
    }

    // TODO: Check subscription status (future feature)
    // For now, all registered users are 'basic' tier
    return 'basic';
  } catch (error) {
    console.error('Error detecting freemium tier:', error);
    // If we have a userId but DB failed, they are still at least Basic (Registered)
    return 'basic';
  }
}

/**
 * 🎯 Get next daily reset date (midnight tomorrow)
 */
export function getNextDailyReset(): Date {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
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
        remainingDaily: Infinity,
        remainingWeekly: Infinity,
        resetTime: getNextDailyReset().getTime(),
        tier: 'pro',
      };
    }

    const key = userId ? `user:${userId}` : `ip:${ip || 'unknown'}`;
    logDebug('checkFreemiumLimits', { userId, ip, key, tier });
    const now = new Date();
    const dailyReset = getNextDailyReset();
    const weeklyReset = getNextWeeklyReset();

    // Get or create usage record
    const { db } = await connectToDatabase();
    const usageCollection = db.collection('freemium_usage');

    let usageRecord = await usageCollection.findOne({ key });
    logDebug('Usage Record Found', { key, found: !!usageRecord });

    if (!usageRecord || now > usageRecord.dailyResetDate) {
      // First usage or daily reset
      const newUsageRecord = {
        key,
        userId,
        ip,
        tier,
        dailyUsage: 0,
        weeklyUsage: 0,
        dailyResetDate: dailyReset,
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
              dailyUsage: 0,
              weeklyUsage: 0,
              dailyResetDate: dailyReset,
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

    const dailyLimit = typeof config?.DAILY_IMAGES === 'number' ? config.DAILY_IMAGES : (FREEMIUM_LIMITS.FREE_TIER.DAILY_IMAGES as number);
    const weeklyGrace = typeof config?.WEEKLY_GRACE === 'number' ? config.WEEKLY_GRACE : (FREEMIUM_LIMITS.FREE_TIER.WEEKLY_GRACE as number);

    const currentDailyUsage = usageRecord.dailyUsage || 0;
    const currentWeeklyUsage = usageRecord.weeklyUsage || 0;

    const remainingDaily = Math.max(0, (dailyLimit === Infinity ? Number.MAX_SAFE_INTEGER : dailyLimit) - currentDailyUsage);
    const remainingWeekly = Math.max(0, (weeklyGrace === Infinity ? Number.MAX_SAFE_INTEGER : weeklyGrace) - currentWeeklyUsage);

    // 🎯 GRACEFUL DEGRADATION LOGIC
    if (remainingDaily > 0) {
      // Within daily limit - increment usage and calculate remaining
      const updateResult = await usageCollection.findOneAndUpdate(
        { key },
        {
          $inc: { dailyUsage: 1 },
          $set: { updatedAt: now }
        },
        { returnDocument: 'after' }
      );

      logDebug('DB Update Result', {
        key,
        found: !!updateResult.value,
        dailyUsage: updateResult.value?.dailyUsage
      });

      // Calculate remaining images (starting from dailyLimit and counting down)
      const totalUsed = updateResult.value?.dailyUsage || (currentDailyUsage + 1);
      const actualRemainingDaily = Math.max(0, dailyLimit - totalUsed);

      console.log('📊 Usage update:', {
        totalUsed,
        dailyLimit,
        actualRemainingDaily,
        tier
      });

      return {
        allowed: true,
        remainingDaily: actualRemainingDaily,
        remainingWeekly,
        resetTime: dailyReset.getTime(),
        tier,
        upgradePrompt: actualRemainingDaily <= 1,
      };
    }

    // Daily limit exceeded - check weekly grace period
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
        remainingDaily: 0,
        remainingWeekly: remainingWeekly - 1,
        resetTime: weeklyReset.getTime(),
        tier,
        gracePeriod: true,
        reason: `Daily limit reached. Using weekly grace period (${remainingWeekly - 1} remaining this week).`,
        upgradePrompt: true,
      };
    }

    // Both limits exceeded - show upgrade prompt but still allow (soft limit)
    return {
      allowed: true, // 🎯 SOFT LIMIT - Don't block users!
      remainingDaily: 0,
      remainingWeekly: 0,
      resetTime: dailyReset.getTime(),
      tier,
      reason: 'Daily and weekly limits reached. Upgrade for unlimited access!',
      upgradePrompt: true,
      upgradeUrl: '/pricing',
    };

  } catch (error) {
    console.error('Freemium limit check error:', error);

    // Fallback to permissive mode on error
    return {
      allowed: true,
      remainingDaily: 5,
      remainingWeekly: 1,
      resetTime: getNextDailyReset().getTime(),
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
  dailyUsage: number;
  weeklyUsage: number;
  dailyLimit: number;
  weeklyLimit: number;
  remainingDaily: number;
  remainingWeekly: number;
  resetTime: number;
  isInGracePeriod: boolean;
  upgradePrompt: boolean;
}> {
  try {
    const tier = await getUserFreemiumTier(userId);
    const key = userId ? `user:${userId}` : `ip:${ip || 'unknown'}`;
    logDebug('getFreemiumUsageInfo', { userId, ip, key, tier });
    console.log('📊 Getting freemium usage info - userId:', userId, 'tier:', tier);
    const tierKeyMap: Record<string, keyof typeof FREEMIUM_LIMITS> = {
      free: 'FREE_TIER',
      basic: 'BASIC_TIER',
      pro: 'PRO_TIER'
    };
    const configKey = tierKeyMap[tier] || 'FREE_TIER';
    const config = FREEMIUM_LIMITS[configKey];
    console.log('📊 Config for tier:', tier, 'config:', config);

    if (tier === 'pro') {
      return {
        tier: 'pro',
        dailyUsage: 0,
        weeklyUsage: 0,
        dailyLimit: Infinity,
        weeklyLimit: Infinity,
        remainingDaily: Infinity,
        remainingWeekly: Infinity,
        resetTime: getNextDailyReset().getTime(),
        isInGracePeriod: false,
        upgradePrompt: false,
      };
    }

    const { db } = await connectToDatabase();
    const usageCollection = db.collection('freemium_usage');

    const usageRecord = await usageCollection.findOne({ key });
    logDebug('getFreemiumUsageInfo Record', {
      key,
      found: !!usageRecord,
      dailyUsage: usageRecord?.dailyUsage,
      resetDate: usageRecord?.dailyResetDate
    });

    const now = new Date();

    let dailyUsage = 0;
    let weeklyUsage = 0;

    if (usageRecord && now <= usageRecord.dailyResetDate) {
      dailyUsage = usageRecord.dailyUsage || 0;
    }

    if (usageRecord && now <= usageRecord.weeklyResetDate) {
      weeklyUsage = usageRecord.weeklyUsage || 0;
    }

    const dailyLimit = typeof config?.DAILY_IMAGES === 'number' ? config.DAILY_IMAGES : (FREEMIUM_LIMITS.FREE_TIER.DAILY_IMAGES as number);
    const weeklyGrace = typeof config?.WEEKLY_GRACE === 'number' ? config.WEEKLY_GRACE : (FREEMIUM_LIMITS.FREE_TIER.WEEKLY_GRACE as number);

    const remainingDaily = Math.max(0, (dailyLimit === Infinity ? Number.MAX_SAFE_INTEGER : dailyLimit) - dailyUsage);
    const remainingWeekly = Math.max(0, (weeklyGrace === Infinity ? Number.MAX_SAFE_INTEGER : weeklyGrace) - weeklyUsage);
    const isInGracePeriod = remainingDaily === 0 && remainingWeekly > 0;

    const result = {
      tier,
      dailyUsage,
      weeklyUsage,
      dailyLimit: config.DAILY_IMAGES,
      weeklyLimit: config.WEEKLY_GRACE,
      remainingDaily,
      remainingWeekly,
      resetTime: getNextDailyReset().getTime(),
      isInGracePeriod,
      upgradePrompt: remainingDaily <= 1 || isInGracePeriod,
    };
    console.log('📊 Returning freemium usage info:', result);
    return result;
  } catch (error) {
    console.error('Error getting freemium usage info:', error);

    // Fallback info
    return {
      tier: 'free',
      dailyUsage: 0,
      weeklyUsage: 0,
      dailyLimit: 5,
      weeklyLimit: 1,
      remainingDaily: 5,
      remainingWeekly: 1,
      resetTime: getNextDailyReset().getTime(),
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
