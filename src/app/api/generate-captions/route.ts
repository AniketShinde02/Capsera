import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { generateCaptions } from '@/ai/flows/generate-caption';
import { consolidatedRateLimiter } from '@/lib/consolidated-rate-limiter';
import { getNextGeminiKey, getGeminiUsageStats } from '@/lib/gemini-keys';
import { CaptionCacheService } from '@/lib/caption-cache';
import { geminiManager } from '@/lib/smart-gemini-manager';
import { smartErrorHandler } from '@/lib/smart-error-handler';
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

// Groq caption generation function
async function generateGroqCaptions(mood: string, description: string, imageUrl: string): Promise<{ success: boolean; captions?: string[]; error?: string; processingTime: number }> {
  const startTime = Date.now();

  try {
    // Get Groq API key
    const groqKey1 = process.env.GROQ_API_KEY_1;
    const groqKey2 = process.env.GROQ_API_KEY_2;
    const groqKey = groqKey1 || groqKey2;

    console.log('🔑 Groq key check:', {
      hasKey1: !!groqKey1,
      hasKey2: !!groqKey2,
      hasAnyKey: !!groqKey,
      key1Prefix: groqKey1 ? groqKey1.substring(0, 10) + '...' : 'none',
      key2Prefix: groqKey2 ? groqKey2.substring(0, 10) + '...' : 'none'
    });

    if (!groqKey) {
      console.log('❌ No Groq API keys found in environment');
      return {
        success: false,
        error: 'No Groq API keys configured',
        processingTime: Date.now() - startTime
      };
    }

    console.log('🚀 Generating captions with Groq (primary provider)...');

    // Optimized prompt
    const prompt = `Generate 3 unique, engaging social media captions for an image with a ${mood} mood.${description ? ` Image description: ${description}` : ''
      }

Requirements:
- Each caption should be 10-25 words
- Include 2-3 relevant hashtags per caption
- Match the ${mood} mood perfectly
- Be engaging and shareable
- Format as numbered list (1., 2., 3.)

Generate exactly 3 captions:`;

    // Make Groq API call
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a professional social media caption generator. Generate exactly 3 unique, engaging captions for the given image and mood. Each caption should be 10-25 words, include relevant hashtags, and match the specified mood perfectly.'
          },
          {
            role: 'user',
            content: `${prompt}\n\nImage URL: ${imageUrl}`
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
        stream: false
      })
    });

    const processingTime = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Groq API error:', response.status, errorData);

      return {
        success: false,
        error: `Groq API error: ${response.status}`,
        processingTime
      };
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Extract captions
    const lines = content.split('\n').filter(line => line.trim());
    const captions = [];

    for (const line of lines) {
      const match = line.match(/^\d+[\.\)]\s*(.+)$/);
      if (match && match[1]) {
        captions.push(match[1].trim());
      }
    }

    // Fallback extraction
    if (captions.length === 0) {
      captions.push(...lines.filter(line => line.length > 10 && line.length < 200).slice(0, 3));
    }

    // Ensure 3 captions
    while (captions.length < 3) {
      captions.push(captions[captions.length - 1] || 'Great moment captured! 📸 #Life #Beautiful');
    }

    console.log(`✅ Groq captions generated in ${processingTime}ms`);

    return {
      success: true,
      captions: captions.slice(0, 3),
      processingTime
    };

  } catch (error: any) {
    console.error('❌ Groq generation error:', error);

    return {
      success: false,
      error: error.message,
      processingTime: Date.now() - startTime
    };
  }
}

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
  let keyResult: { key: string; index: number } | null = null;
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

    console.log(`🔍 Cache check result: found=${cacheResult.found}`);

    if (cacheResult.found && cacheResult.captions) {
      console.log(`🎯 Cache HIT! Serving ${cacheResult.captions.length} captions from cache`);
      console.log(`💰 API quota saved: ${cacheResult.savedQuota ? 'YES' : 'NO'}`);

      const processingTime = Date.now() - startTime;

      // Get rate limit info for display without incrementing usage
      const rateLimitInfo = await consolidatedRateLimiter.getRateLimitInfo(session?.user?.id, clientIP);

      return NextResponse.json({
        success: true,
        captions: cacheResult.captions,
        processingTime,
        fromCache: true,
        cacheHit: true,
        note: 'Served from cache - no API call needed! 🚀',
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

    console.log(`❌ Cache MISS - generating new captions with AI`);

    // 🎯 CONSOLIDATED RATE LIMITER: Check usage limits with primary + secondary systems
    // Only check rate limit if we need to generate new captions
    console.log('🔒 Checking rate limit...');
    logDebug('Checking Rate Limit in Route', { clientIP, userId: session?.user?.id });
    rateLimitResult = await consolidatedRateLimiter.checkRateLimit(
      session?.user?.id,
      clientIP
    );
    rateLimitChecked = true;

    if (!rateLimitResult.allowed) {
      console.log(`🚫 Rate limit exceeded: ${clientIP} - ${rateLimitResult.reason}`);

      // Get rate limit info for display
      const rateLimitInfo = await consolidatedRateLimiter.getRateLimitInfo(session?.user?.id, clientIP);

      return NextResponse.json({
        success: false,
        message: rateLimitResult.reason || 'Usage limit reached. Please upgrade for unlimited access.',
        error: 'rate_limit_exceeded',
        userTier: rateLimitResult.userTier,
        isAdmin: rateLimitResult.isAdmin,
        remaining: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime,
        resetMessage: rateLimitInfo.resetMessage
      }, {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(rateLimitInfo.maxGenerations),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(rateLimitResult.resetTime),
          'Retry-After': rateLimitResult.retryAfter ? String(rateLimitResult.retryAfter) : '3600'
        }
      });
    }

    // Log rate limit status
    console.log(`🎯 Rate limit check passed:`, {
      userTier: rateLimitResult.userTier,
      isAdmin: rateLimitResult.isAdmin,
      remaining: rateLimitResult.remaining,
      resetTime: rateLimitResult.resetTime
    });

    // SMART: Use intelligent key management
    keyResult = await geminiManager.getBestKey();
    if (!keyResult) {
      console.warn('⚠️ All Gemini API keys exhausted - enabling fallback mode');

      return NextResponse.json({
        success: false,
        message: "Our AI servers are currently at capacity. Please try again in a few hours.",
        error: 'all_keys_exhausted',
        status: geminiManager.getStatus()
      }, { status: 503 });
    }

    // Try Groq first (faster)
    console.log('🚀 Trying Groq first for faster generation...');
    const groqResult = await generateGroqCaptions(mood, description, imageUrl);
    console.log('🔍 Groq result:', { success: groqResult.success, error: groqResult.error, captionsCount: groqResult.captions?.length });

    let result;
    if (groqResult.success && groqResult.captions) {
      console.log(`✅ Groq generation successful in ${groqResult.processingTime}ms`);
      result = {
        success: true,
        captions: groqResult.captions,
        processingTime: groqResult.processingTime,
        provider: 'groq'
      };
    } else {
      console.log('⚠️ Groq failed, falling back to Gemini...');
      console.log(`🔑 Using Gemini key (Request #${Date.now()})`);

      // ⚡ SPEED OPTIMIZATION: Generate captions with optimized timeout
      result = await generateCaptions({
        mood,
        description,
        imageUrl,
        publicId,
        userId: session?.user?.id,
        ipAddress: clientIP,
        // We already performed unified rate limit checks in this route, so skip the internal flow check
        skipRateLimit: true,
      });
    }

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

    // Get rate limit info for display
    const rateLimitInfo = await consolidatedRateLimiter.getRateLimitInfo(session?.user?.id, clientIP);

    // Return success response with rate limit info
    return NextResponse.json({
      success: true,
      captions: result.captions,
      processingTime,
      note: 'Generated with love using Gemini AI ❤️',
      rateLimit: {
        userTier: rateLimitInfo.userTier,
        isAdmin: rateLimitInfo.isAdmin,
        maxGenerations: rateLimitInfo.maxGenerations,
        remaining: rateLimitInfo.remaining,
        resetTime: rateLimitInfo.resetTime,
        resetMessage: rateLimitInfo.resetMessage
      }
    });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;

    // SMART: Use intelligent error handling
    const categorized = smartErrorHandler.categorizeError(error, {
      clientIP,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });

    smartErrorHandler.trackError(error, { clientIP, userId: session?.user?.id });

    // Mark key as exhausted if it's a quota error
    if (categorized.category === 'quota_exceeded' && keyResult) {
      geminiManager.markKeyExhausted(keyResult.index, error);
    }

    console.error(`💥 Error details:`, {
      category: categorized.category,
      clientIP,
      userEmail: session?.user?.email || 'anonymous',
      processingTime,
      developerInfo: categorized.developerInfo
    });

    return NextResponse.json({
      success: false,
      message: categorized.userMessage,
      error: categorized.category,
      processingTime
    }, { status: 500 });
  }
}
