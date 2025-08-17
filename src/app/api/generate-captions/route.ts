import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { generateCaptions } from '@/ai/flows/generate-caption';
import { isRateLimited, getRemainingRequests, getResetTime } from '@/lib/rate-limit-simple';
import { getNextGeminiKey, getGeminiUsageStats } from '@/lib/gemini-keys';
import { CaptionCacheService } from '@/lib/caption-cache';

// Get client IP address
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return 'unknown';
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const clientIP = getClientIP(req);
  let session: any = null; // Declare session variable in function scope

  try {
    // Check rate limiting first
    const isLimited = await isRateLimited(clientIP, session?.user?.id);
    if (isLimited) {
      const resetTime = getResetTime(clientIP);
      const remainingTime = Math.ceil((resetTime - Date.now()) / 1000);
      
      console.log(`🚫 Rate limited: ${clientIP} - Reset in ${remainingTime}s`);
      
      return NextResponse.json({
        success: false,
        message: `Too many requests! Please try again in ${remainingTime} seconds ❤️`,
        error: 'rate_limit_exceeded',
        resetTime: remainingTime
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Reset': resetTime.toString(),
          'X-RateLimit-Remaining': '0'
        }
      });
    }

    // Get session for user authentication
    session = await getServerSession(authOptions);
    
    // Check if we have an available Gemini key
    const geminiKey = getNextGeminiKey();
    if (!geminiKey) {
      console.warn('⚠️ No available Gemini API keys - all may be rate limited');
      
      // Get usage stats for debugging
      const usageStats = getGeminiUsageStats();
      console.log('📊 Current usage stats:', usageStats);
      
      return NextResponse.json({
        success: false,
        message: "Our caption servers are resting — please try again in a few hours ❤️",
        error: 'all_keys_exhausted',
        note: 'All API keys are currently rate limited. This is normal for free tier usage.'
      }, { status: 503 });
    }

    // Parse request body
    const body = await req.json();
    const { mood, description, imageUrl, publicId } = body;

    // Validate required fields
    if (!mood || !imageUrl) {
      return NextResponse.json({
        success: false,
        message: 'Mood and image are required'
      }, { status: 400 });
    }

    // ⚡ SPEED OPTIMIZATION: Quick cache check with optimized query
    console.log(`🔍 Checking cache for existing captions...`);
    console.log(`📊 Cache key components:`, {
      imageUrl: imageUrl.substring(0, 100) + '...',
      description: description || 'default',
      mood: mood
    });
    
    const cacheResult = await CaptionCacheService.checkCache(
      imageUrl,
      description || 'default',
      mood
    );

    if (cacheResult.found && cacheResult.captions) {
      console.log(`🎯 Cache HIT! Serving ${cacheResult.captions.length} captions from cache`);
      console.log(`💰 API quota saved: ${cacheResult.savedQuota ? 'YES' : 'NO'}`);
      
      const processingTime = Date.now() - startTime;
      
      return NextResponse.json({
        success: true,
        captions: cacheResult.captions,
        processingTime,
        fromCache: true,
        cacheHit: true,
        note: 'Served from cache - no API call needed! 🚀'
      });
    }

    console.log(`❌ Cache MISS - generating new captions with AI`);
    console.log(`🔑 Using Gemini key (Request #${Date.now()})`);

    // ⚡ SPEED OPTIMIZATION: Generate captions with optimized timeout
    const result = await generateCaptions({
      mood,
      description,
      imageUrl,
      publicId,
      userId: session?.user?.id,
      ipAddress: clientIP,
    });

    // ⚡ SPEED OPTIMIZATION: Store cache asynchronously (don't wait for it)
    if (result.captions && result.captions.length > 0) {
      console.log(`💾 Storing new captions in cache (async)...`);
      // Don't await this - let it run in background
      CaptionCacheService.storeCache(
        imageUrl,
        description || 'default',
        mood,
        result.captions,
        session?.user?.id
      ).then(cacheResult => {
        if (cacheResult) {
          console.log(`✅ Captions cached successfully with ID: ${cacheResult._id}`);
        } else {
          console.log(`⚠️ Failed to cache captions`);
        }
      }).catch(err => {
        console.error('❌ Cache storage error:', err);
      });
    }

    const processingTime = Date.now() - startTime;
    
    console.log(`✅ Caption generated successfully in ${processingTime}ms`);
    console.log(`📊 Caption length: ${result.captions?.[0]?.length || 0} characters`);

    // Return success response
    return NextResponse.json({
      success: true,
      captions: result.captions,
      processingTime,
      note: 'Generated with love using Gemini AI ❤️'
    });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Caption generation error:', error);

    // Handle specific error types
    let errorMessage = 'Failed to generate captions. Please try again.';
    let statusCode = 500;
    let errorType = 'unknown_error';

    if (error.message?.includes('monthly limit') || 
        error.message?.includes('quota will reset next month') ||
        error.message?.includes('You\'ve used all') ||
        error.message?.includes('You\'ve reached your monthly limit')) {
      errorMessage = "You've used all 5 free images this month! That's 15 captions total. Sign up for a free account to get 25 monthly images (75 captions). Your free quota resets next month.";
      statusCode = 429;
      errorType = 'monthly_limit_exceeded';
    } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
      errorMessage = "Our caption servers are resting — please try again in a few hours ❤️";
      statusCode = 503;
      errorType = 'quota_exceeded';
    } else if (error.message?.includes('network') || error.message?.includes('timeout')) {
      errorMessage = 'Network issue. Please check your connection and try again.';
      statusCode = 503;
      errorType = 'network_error';
    } else if (error.message?.includes('invalid') || error.message?.includes('malformed')) {
      errorMessage = 'Invalid request. Please check your input and try again.';
      statusCode = 400;
      errorType = 'invalid_request';
    }

    // Log error details for debugging
    console.error(`💥 Error details:`, {
      errorType,
      clientIP,
      userEmail: session?.user?.email || 'anonymous',
      processingTime,
      errorMessage: error.message
    });

    return NextResponse.json({
      success: false,
      message: errorMessage,
      error: errorType,
      processingTime
    }, { status: statusCode });
  }
}
