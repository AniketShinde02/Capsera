import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { generateCaptions } from '@/ai/flows/generate-caption';
import { consolidatedRateLimiter } from '@/lib/consolidated-rate-limiter';
import { CaptionCacheService } from '@/lib/caption-cache';
import { smartErrorHandler } from '@/lib/smart-error-handler';
import { connectToDatabase } from '@/lib/db';

// 💰 SPEND CONTROL HELPERS
const DAILY_SPEND_LIMIT = 0.50; // $0.50 per user/day

async function checkUserSpendLimit(userId: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    const today = new Date().toISOString().split('T')[0];
    const key = `spend:${userId}:${today}`;

    // Store spend in a dedicated simple collection or use freemium_usage
    // Using a dedicated simple tracking for safety/speed
    const record = await db.collection('daily_spend').findOne({ key });

    if (record && record.totalSpent >= DAILY_SPEND_LIMIT) {
      console.log(`💸 Spend limit hit for ${userId}: $${record.totalSpent.toFixed(4)} / $${DAILY_SPEND_LIMIT}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error checking spend limit:', error);
    return true; // Fail open to avoid blocking valid users on DB error, but log it
  }
}

async function trackUserSpend(userId: string, cost: number): Promise<void> {
  try {
    const { db } = await connectToDatabase();
    const today = new Date().toISOString().split('T')[0];
    const key = `spend:${userId}:${today}`;

    await db.collection('daily_spend').updateOne(
      { key },
      {
        $inc: { totalSpent: cost },
        $setOnInsert: { userId, date: today, createdAt: new Date() }
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error tracking spend:', error);
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
  // let keyResult: { key: string; index: number } | null = null;
  let rateLimitChecked = false;
  let rateLimitResult: any = null;

  // Get session for user authentication FIRST
  const session = await getServerSession(authOptions);

  try {
    // Parse request body first to avoid unnecessary rate limit checks
    const body = await req.json();
    const { mood, description, imageUrl, imageBase64, publicId } = body;

    console.log('🔍 API Received generate-captions request:', {
      hasMood: !!mood,
      imageUrlStart: imageUrl ? imageUrl.substring(0, 50) : 'missing',
      hasBase64: !!imageBase64,
      base64Length: imageBase64 ? imageBase64.length : 0
    });

    // Validate required fields and REJECT base64/file/id usage
    if (!mood) {
      return NextResponse.json({ success: false, message: 'Mood is required' }, { status: 400 });
    }

    // 🚨 INPUT VALIDATION STRATEGY:
    // 1. Check for valid Cloudinary URL explicitly
    // 2. If valid URL exists, USE IT (and ignore any accidental base64)
    // 3. If NO valid URL exists, and base64 IS present -> Reject (to save costs)

    let validUrlFound = false;
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
      validUrlFound = true;
    }

    if (!validUrlFound) {
      // Only if we don't have a valid URL do we check for forbiddden types
      if (imageBase64) {
        console.error('❌ Base64 image rejected (No valid URL provided).');
        return NextResponse.json({
          success: false,
          message: 'Base64 images are not allowed. Please provide a Cloudinary URL.',
          error: 'base64_rejected'
        }, { status: 400 });
      }

      console.error('❌ Invalid or missing imageUrl.');
      return NextResponse.json({
        success: false,
        message: 'Valid Cloudinary image URL is required.',
        error: 'invalid_image_url'
      }, { status: 400 });
    }

    // If we're here, we have a valid URL. We can safely ignore imageBase64 if it exists.

    // 🎯 OPTIMIZE CLOUDINARY URL: Force 512px width + auto quality
    let optimizedImageUrl = imageUrl;
    if (imageUrl && imageUrl.includes('cloudinary.com')) {
      // Check if already optimized
      if (!imageUrl.includes('w_512')) {
        // Insert transformation parameters before /upload/
        optimizedImageUrl = imageUrl.replace(
          '/upload/',
          '/upload/w_512,q_auto:eco,f_jpg/'
        );
        console.log('✅ Cloudinary URL optimized for AI:', optimizedImageUrl.substring(0, 80) + '...');
      }
    }

    // ⚡ SPEED OPTIMIZATION: Quick cache check with optimized query
    // Only check cache if we have a URL (Base64 is unique/new usually)
    if (imageUrl) {
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
    } else {
      console.log(`⏩ Skipping cache check (Base64 image provided)`);
    }

    // 🎯 CONSOLIDATED RATE LIMITER: Check usage limits with primary + secondary systems
    // Only check rate limit if we need to generate new captions
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



    // 🚨 DEFINE CONFIG
    // User requested switch to GPT model for better quality
    const useFreeModel = false; // process.env.USE_FREE_AI_MODEL === 'true';

    // 🚨 COST CEILING CHECK ($0.002 max per request)
    const estimatedCost = useFreeModel ? 0 : (optimizedImageUrl.includes('w_512') ? 0.0004 : 0.002);
    if (estimatedCost > 0.002) {
      return NextResponse.json({
        success: false,
        message: "Image is too large for processing. Please resize to 512px or smaller.",
        error: "cost_ceiling_exceeded"
      }, { status: 400 });
    }

    // 🚨 USER SPEND LIMIT CHECK ($0.50 daily cap)
    if (session?.user?.id && !useFreeModel) {
      const canSpend = await checkUserSpendLimit(session.user.id);
      if (!canSpend) {
        return NextResponse.json({
          success: false,
          message: "Daily AI usage limit reached. Please try again tomorrow or upgrade.",
          error: "daily_limit_exceeded"
        }, { status: 429 });
      }
    }

    console.log(`🤖 Sending image to OpenRouter... (Est. Cost: $${estimatedCost.toFixed(5)})`);

    let result;
    let finalCost = 0;

    try {
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      if (!openRouterKey) throw new Error('OpenRouter API Key is missing');

      // 1. Prepare Messages
      const messages: any[] = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are a viral social media ghostwriter. Analyze this image and write 3 captions that will stop the scroll.
  MOOD: ${mood}
  ${description ? `CONTEXT: ${description}` : ''}

  CRITICAL INSTRUCTIONS FOR HUMAN-LIKE TONE:
  1. �️ VOICE: Casual, authentic, "bestie" energy. Write like a real person, not a brand.
  2. 🚫 BAN LIST: Absolutely NO "unleash", "elevate", "symphony", "tapestry", "embark", "game-changer", "testament", "realm", "delve".
  3. 🔡 FORMAT: STRICTLY LOWERCASE ONLY. No capitalization at start of sentences. (aesthetic/gen-z style).
  4. � LENGTH: Punchy. 30-40 words maximum.
  5. 🎨 VISUALS: Mention specific details (colors, objects, lighting) you see in the photo.
  6. 🎣 HOOK: Start with a POV, a thought, or a "feeling when..." statement.

  OUTPUT FORMAT (CRITICAL):
  Return ONLY a JSON array with exactly 3 captions string:
  ["caption 1...", "caption 2...", "caption 3..."]`
            }
          ]
        } 
      ];

      // 2. Add Image
      messages[0].content.push({
        type: 'image_url',
        image_url: { url: optimizedImageUrl }
      });

      // 3. Call OpenRouter API
      const modelConfig = useFreeModel ? {
        model: 'qwen/qwen2.5-vl-3b-instruct:free',
        temperature: 0.8,
        max_tokens: 500
      } : {
        model: 'openai/gpt-4o-mini',
        temperature: 0.8,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      };

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://capsera.com',
          'X-Title': 'Capsera',
        },
        body: JSON.stringify({
          model: modelConfig.model,
          messages: messages,
          temperature: modelConfig.temperature,
          max_tokens: modelConfig.max_tokens,
          ...(modelConfig.response_format && { response_format: modelConfig.response_format })
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('❌ AI Provider Error:', response.status, errText);
        throw new Error(`AI Provider Error: ${response.status}`);
      }

      const data = await response.json();
      const contentText = data.choices[0]?.message?.content;

      // Track actual cost if provided, otherwise estimate
      // OpenRouter often returns 'usage' object
      if (!useFreeModel) {
        // Fallback to estimate if usage not provided: input($0.15/1M) + output($0.60/1M)
        // 512px image ~1500 tokens + 400 text tokens = 1900 input
        // 300 output tokens
        // (1900 * 0.15 + 300 * 0.60) / 1000000 = $0.000465
        finalCost = 0.0004;
        if (data.usage) {
          const inputCost = (data.usage.prompt_tokens || 1900) * 0.00000015;
          const outputCost = (data.usage.completion_tokens || 300) * 0.00000060;
          finalCost = inputCost + outputCost;
        }
      }

      // 4. Parse Response
      let captions: string[] = [];
      try {
        const cleanedText = contentText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedText);

        if (Array.isArray(parsed)) captions = parsed;
        else if (parsed.captions) captions = parsed.captions;
        else if (typeof parsed === 'object') captions = Object.values(parsed);

      } catch (e) {
        console.warn('⚠️ JSON parse failed, trying fallback parsing');
        const lines = contentText.split('\n').filter((l: string) => l.trim().length > 10);
        captions = lines.map((l: string) => l.replace(/^[\d\.\)\-\*\s]+/, '').trim()).slice(0, 3);
      }

      if (captions.length === 0) throw new Error('Failed to parse captions');

      // Ensure exactly 3 captions
      while (captions.length < 3) {
        captions.push(`${mood.split(' ')[0]} Caption ${captions.length + 1} - Try again`);
      }

      result = {
        captions,
        metadata: {
          model: modelConfig.model,
          isFreeModel: useFreeModel,
          cost: finalCost,
          usedFallback: false
        }
      };

      // 💰 TRACK SPEND AFTER SUCCESS
      if (session?.user?.id && !useFreeModel && finalCost > 0) {
        await trackUserSpend(session.user.id, finalCost);
      }

    } catch (error: any) {
      console.error('❌ Generation Failed:', error.message);
      return NextResponse.json({
        success: false,
        message: "AI service temporarily unavailable. Please try again.",
        error: error.message
      }, { status: 503 });
    }

    // ⚡ SPEED OPTIMIZATION: Store cache asynchronously
    if (result && result.captions && result.captions.length > 0 && imageUrl) {
      CaptionCacheService.storeCache(
        imageUrl,
        description || 'default',
        mood,
        result.captions,
        session?.user?.id
      ).catch(err => console.error('Cache save failed', err));
    }

    const processingTime = Date.now() - startTime;
    await consolidatedRateLimiter.incrementUsage(session?.user?.id, clientIP);
    const rateLimitInfo = await consolidatedRateLimiter.getRateLimitInfo(session?.user?.id, clientIP);

    return NextResponse.json({
      success: true,
      captions: result.captions,
      processingTime,
      rateLimit: {
        userTier: rateLimitInfo.userTier,
        remaining: rateLimitInfo.remaining,
      }
    });

  } catch (error: any) {
    console.error('❌ Generation Failed:', error.message);

    return NextResponse.json({
      success: false,
      message: error.message || "Failed to generate captions. Please try again later.",
      error: error.message,
      debug_info: "OpenRouter Provider Failed"
    }, { status: 502 }); // 502 Bad Gateway is appropriate here
  }
}
