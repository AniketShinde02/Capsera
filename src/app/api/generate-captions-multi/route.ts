import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { generateCaptionsFlowMulti } from '@/ai/flows/generate-caption-multi';
import { consolidatedRateLimiter } from '@/lib/consolidated-rate-limiter';
import { CaptionCacheService } from '@/lib/caption-cache';
import { smartErrorHandler } from '@/lib/smart-error-handler';
import { getProviderStatus } from '@/lib/ai-providers';

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
  let rateLimitChecked = false;
  let rateLimitResult: any = null;

  // Get session for user authentication FIRST
  const session = await getServerSession(authOptions);

  try {
    // Parse request body first to avoid unnecessary rate limit checks
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
      console.log(`🎯 Cache HIT - returning cached captions`);

      // Get rate limit info for display
      const rateLimitInfo = await consolidatedRateLimiter.getRateLimitInfo(session?.user?.id, clientIP);

      return NextResponse.json({
        success: true,
        captions: cacheResult.captions,
        processingTime: Date.now() - startTime,
        note: 'Served from cache ⚡',
        cached: true,
        rateLimit: {
          userTier: rateLimitInfo.userTier,
          isAdmin: rateLimitInfo.isAdmin,
          maxGenerations: rateLimitInfo.maxGenerations,
          remaining: rateLimitInfo.remaining,
          resetTime: rateLimitInfo.resetTime,
          resetMessage: rateLimitInfo.resetMessage
        }
      });
    }

    console.log(`🎯 Cache MISS - generating new captions`);

    // 🚀 UNIFIED RATE LIMITING: Use consolidated rate limiter
    if (!rateLimitChecked) {
      console.log('🔒 Checking unified rate limits...');
      rateLimitResult = await consolidatedRateLimiter.checkRateLimit(
        session?.user?.id,
        clientIP
      );

      if (!rateLimitResult.allowed) {
        console.log(`❌ Rate limit exceeded:`, rateLimitResult);
        return NextResponse.json({
          success: false,
          message: rateLimitResult.message || 'Rate limit exceeded',
          rateLimit: {
            userTier: rateLimitResult.userTier,
            isAdmin: rateLimitResult.isAdmin,
            maxGenerations: rateLimitResult.maxGenerations,
            remaining: rateLimitResult.remaining,
            resetTime: rateLimitResult.resetTime,
            resetMessage: rateLimitResult.resetMessage
          }
        }, { status: 429 });
      }

      rateLimitChecked = true;
      console.log(`✅ Rate limit check passed:`, {
        userTier: rateLimitResult.userTier,
        remaining: rateLimitResult.remaining,
        isAdmin: rateLimitResult.isAdmin
      });
    }

    // 🎯 MULTI-PROVIDER GENERATION: Use new multi-provider system
    console.log('🚀 Starting multi-provider caption generation...');

    const result = await generateCaptionsFlowMulti({
      mood,
      description,
      imageUrl,
      publicId,
      userId: session?.user?.id,
      ipAddress: clientIP,
      skipRateLimit: true, // We already checked rate limits above
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

    console.log(`✅ Multi-provider caption generated successfully in ${processingTime}ms`);
    console.log(`📊 Caption length: ${result.captions?.[0]?.length || 0} characters`);
    console.log(`🎯 Provider used: ${result.provider}`);
    console.log(`⚡ Processing time: ${result.processingTime}ms`);

    // Get rate limit info for display
    const rateLimitInfo = await consolidatedRateLimiter.getRateLimitInfo(session?.user?.id, clientIP);

    // Get provider status for debugging
    const providerStatus = getProviderStatus();

    // Return success response with enhanced info
    return NextResponse.json({
      success: true,
      captions: result.captions,
      processingTime,
      note: `Generated with ${result.provider} AI 🚀`,
      provider: result.provider,
      cached: result.cached || false,
      rateLimit: {
        userTier: rateLimitInfo.userTier,
        isAdmin: rateLimitInfo.isAdmin,
        maxGenerations: rateLimitInfo.maxGenerations,
        remaining: rateLimitInfo.remaining,
        resetTime: rateLimitInfo.resetTime,
        resetMessage: rateLimitInfo.resetMessage
      },
      // Include provider status for admin users
      ...(session?.user?.isAdmin && providerStatus ? {
        providerStatus: {
          providers: Array.from(providerStatus.providers.keys()),
          healthChecks: Array.from(providerStatus.healthChecks.entries()).map(([name, health]) => ({
            name,
            isHealthy: health.isHealthy,
            responseTime: health.responseTime
          }))
        }
      } : {})
    });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;

    // SMART: Use intelligent error handling
    const categorized = smartErrorHandler.categorizeError(error, {
      clientIP,
      userId: session?.user?.id,
      endpoint: 'generate-captions-multi'
    });

    console.error(`❌ Multi-provider caption generation failed after ${processingTime}ms:`, {
      error: error.message,
      category: categorized.category,
      userTier: rateLimitResult?.userTier || 'unknown'
    });

    // Get rate limit info for error response
    const rateLimitInfo = await consolidatedRateLimiter.getRateLimitInfo(session?.user?.id, clientIP);

    // Return appropriate error response
    return NextResponse.json({
      success: false,
      message: categorized.userMessage,
      error: categorized.category,
      processingTime,
      rateLimit: {
        userTier: rateLimitInfo.userTier,
        isAdmin: rateLimitInfo.isAdmin,
        maxGenerations: rateLimitInfo.maxGenerations,
        remaining: rateLimitInfo.remaining,
        resetTime: rateLimitInfo.resetTime,
        resetMessage: rateLimitInfo.resetMessage
      }
    }, { status: 500 });
  }
}
