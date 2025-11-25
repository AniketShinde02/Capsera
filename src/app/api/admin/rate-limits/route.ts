import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/admin-middleware';
import { DEFAULT_RATE_LIMITS } from '@/lib/unified-rate-limiter';
import { dbConnect } from '@/lib/db';
import RateLimitConfig from '@/models/RateLimitConfig';
import mongoose from 'mongoose';

// Get current rate limit configuration
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminError = await verifyAdminAccess(request);
    if (adminError) return adminError;

    // Get rate limit configurations from database
    await dbConnect();
    const configs = await RateLimitConfig.find({});

    // Convert to frontend-friendly format with explicit typing to allow updates
    const rateLimits: Record<string, { MAX_GENERATIONS: number; WINDOW_HOURS: number; USER_TYPE: string }> = {
      ANONYMOUS: { ...DEFAULT_RATE_LIMITS.ANONYMOUS },
      REGISTERED: { ...DEFAULT_RATE_LIMITS.REGISTERED },
      PRO: { ...DEFAULT_RATE_LIMITS.PRO }
    };

    // Update with database values if available
    for (const config of configs) {
      if (config.tier === 'anonymous') {
        rateLimits.ANONYMOUS.MAX_GENERATIONS = config.maxGenerations;
        rateLimits.ANONYMOUS.WINDOW_HOURS = config.windowHours;
      } else if (config.tier === 'registered') {
        rateLimits.REGISTERED.MAX_GENERATIONS = config.maxGenerations;
        rateLimits.REGISTERED.WINDOW_HOURS = config.windowHours;
      } else if (config.tier === 'pro') {
        rateLimits.PRO.MAX_GENERATIONS = config.maxGenerations;
        rateLimits.PRO.WINDOW_HOURS = config.windowHours;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        rateLimits
      }
    });
  } catch (error: any) {
    console.error('Rate limits API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch rate limit configuration',
      message: error.message
    }, { status: 500 });
  }
}

// Update rate limit configuration
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminError = await verifyAdminAccess(request);
    if (adminError) return adminError;

    const body = await request.json();
    const { anonymous, registered, pro } = body;

    // Validate input
    if (!anonymous || !registered) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'Both anonymous and registered rate limits must be provided'
      }, { status: 400 });
    }

    if (typeof anonymous.MAX_GENERATIONS !== 'number' ||
      typeof registered.MAX_GENERATIONS !== 'number') {
      return NextResponse.json({
        success: false,
        error: 'Invalid rate limit values',
        message: 'Rate limit values must be numbers'
      }, { status: 400 });
    }

    // Connect to database
    await dbConnect();

    // Update anonymous tier
    await RateLimitConfig.findOneAndUpdate(
      { tier: 'anonymous' },
      {
        tier: 'anonymous',
        maxGenerations: anonymous.MAX_GENERATIONS,
        windowHours: anonymous.WINDOW_HOURS || 24
      },
      { upsert: true, new: true }
    );

    // Update registered tier
    await RateLimitConfig.findOneAndUpdate(
      { tier: 'registered' },
      {
        tier: 'registered',
        maxGenerations: registered.MAX_GENERATIONS,
        windowHours: registered.WINDOW_HOURS || 24
      },
      { upsert: true, new: true }
    );

    // Update pro tier if provided
    if (pro && typeof pro.MAX_GENERATIONS === 'number') {
      await RateLimitConfig.findOneAndUpdate(
        { tier: 'pro' },
        {
          tier: 'pro',
          maxGenerations: pro.MAX_GENERATIONS,
          windowHours: pro.WINDOW_HOURS || 24
        },
        { upsert: true, new: true }
      );
    }

    // Get updated configurations
    const configs = await RateLimitConfig.find().exec();

    // Convert to frontend-friendly format with explicit typing
    const rateLimits: Record<string, { MAX_GENERATIONS: number; WINDOW_HOURS: number; USER_TYPE: string }> = {
      ANONYMOUS: { ...DEFAULT_RATE_LIMITS.ANONYMOUS },
      REGISTERED: { ...DEFAULT_RATE_LIMITS.REGISTERED },
      PRO: { ...DEFAULT_RATE_LIMITS.PRO }
    };

    // Update with database values
    for (const config of configs) {
      if (config.tier === 'anonymous') {
        rateLimits.ANONYMOUS.MAX_GENERATIONS = config.maxGenerations;
        rateLimits.ANONYMOUS.WINDOW_HOURS = config.windowHours;
      } else if (config.tier === 'registered') {
        rateLimits.REGISTERED.MAX_GENERATIONS = config.maxGenerations;
        rateLimits.REGISTERED.WINDOW_HOURS = config.windowHours;
      } else if (config.tier === 'pro') {
        rateLimits.PRO.MAX_GENERATIONS = config.maxGenerations;
        rateLimits.PRO.WINDOW_HOURS = config.windowHours;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Rate limits updated successfully',
      data: {
        rateLimits
      }
    });
  } catch (error: any) {
    console.error('Update rate limits API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update rate limit configuration',
      message: error.message
    }, { status: 500 });
  }
}