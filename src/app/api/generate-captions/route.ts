import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { generateCaptions } from '@/ai/flows/generate-caption';
import { consolidatedRateLimiter } from '@/lib/consolidated-rate-limiter';
// import { getNextGeminiKey, getGeminiUsageStats } from '@/lib/gemini-keys';
import { CaptionCacheService } from '@/lib/caption-cache';
import { smartErrorHandler } from '@/lib/smart-error-handler';

// Groq Vision caption generation function - NOW WITH IMAGE ANALYSIS! 🎯
async function generateGroqCaptions(mood: string, description: string, imageUrl: string, imageBase64?: string): Promise<{ success: boolean; captions?: string[]; error?: string; processingTime: number }> {
  const startTime = Date.now();

  try {
    // Get Groq API key
    const groqKey1 = process.env.GROQ_API_KEY_1;
    const groqKey2 = process.env.GROQ_API_KEY_2;
    const groqKey = groqKey1 || groqKey2;

    console.log('🔑 Groq Vision key check:', {
      hasKey1: !!groqKey1,
      hasKey2: !!groqKey2,
      hasAnyKey: !!groqKey,
      key1Prefix: groqKey1 ? groqKey1.substring(0, 10) + '...' : 'none',
      key2Prefix: groqKey2 ? groqKey2.substring(0, 10) + '...' : 'none'
    });

    if (!groqKey) {
      console.log('❌ No Groq API keys configured');
      return {
        success: false,
        error: 'No Groq API keys configured',
        processingTime: Date.now() - startTime
      };
    }

    console.log('🚀 Generating captions with Groq Vision (llama-3.2-90b-vision-preview)...');

    // Optimized prompt for vision model
    // Optimized prompt for "Human-like" captions - Pallyy Style
    const prompt = `Analyze this image and generate 3 unique, high-energy social media captions.

MOOD: ${mood}
${description ? `CONTEXT: ${description}` : ''}

STRICT GUIDELINES FOR "VIRAL" CAPTIONS:
1. 📏 **LENGTH**: All captions must be **30-50 words**. No short captions.
2. 🗣️ **TONE**: Enthusiastic, confident, and authentic. Use natural Gen Z/Millennial slang.
3. 💎 **STRUCTURE**:
   - **Hook**: Start with a catchy reaction or statement.
   - **Visuals**: Weave specific image details (colors, outfit, lighting) into the sentence.
   - **Vibe**: Express how it feels (confidence, joy, chill).
   - **Closing**: End with an engaging thought or question.
4. 🚫 **NO ROBOTIC WORDS**: Ban "unleash", "elevate", "symphony", "tapestry", "testament".

Generate exactly 3 captions formatted as a numbered list:`;

    // Make Groq Vision API call with image (with 8s timeout for fast fallback)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    // Prepare image content - use Base64 if available (faster), otherwise URL
    const imageContent = imageBase64
      ? { url: imageBase64 }
      : { url: imageUrl };

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.2-11b-vision-preview', // 🎯 11B VISION MODEL - Better for rate limits
          messages: [
            {
              role: 'system',
              content: 'You are a professional social media caption generator with image analysis capabilities. Analyze the image carefully and generate captions that reference specific visual elements you see.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: imageContent
                }
              ]
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const processingTime = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Groq Vision API error:', response.status, errorData);

        const errorMessage = errorData.error?.message || `Groq Vision API error: ${response.status}`;

        return {
          success: false,
          error: errorMessage,
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

      console.log(`✅ Groq Vision captions generated in ${processingTime}ms`);
      console.log(`🎯 Vision-based captions (analyzed actual image):`, captions.slice(0, 3));

      return {
        success: true,
        captions: captions.slice(0, 3),
        processingTime
      };

    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error('⏱️ Groq Vision timed out after 8s');
      } else {
        console.error('❌ Groq Vision error:', error);
      }

      // 🔄 FALLBACK: Try Text-Only Model if Vision fails
      console.log('🔄 Vision failed, falling back to Groq Text-Only (llama-3.1-70b-versatile)...');

      try {
        const textPrompt = `Generate 3 viral Instagram captions for a post.
MOOD: ${mood}
CONTEXT: ${description || 'A photo'}

STRICT RULES:
1. Length: 30-50 words.
2. Tone: Gen Z, authentic, high energy.
3. Structure: Hook + Vibe + Question.
4. No robotic words.

Format: Numbered list.`;

        const textResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-70b-versatile', // ⚡ Fast Text Model
            messages: [
              { role: 'system', content: 'You are a viral caption generator.' },
              { role: 'user', content: textPrompt }
            ],
            max_tokens: 300,
            temperature: 0.7
          })
        });

        if (textResponse.ok) {
          const data = await textResponse.json();
          const content = data.choices[0]?.message?.content || '';
          const lines = content.split('\n').filter((line: string) => line.trim()); // Explicit type
          const captions = lines
            .filter((line: string) => /^\d+[\.\)]/.test(line))
            .map((line: string) => line.replace(/^\d+[\.\)]\s*/, '').trim());

          if (captions.length > 0) {
            console.log('✅ Groq Text-Only fallback successful!');
            return {
              success: true,
              captions: captions.slice(0, 3),
              processingTime: Date.now() - startTime
            };
          }
        }
      } catch (textError) {
        console.error('❌ Groq Text-Only fallback failed:', textError);
      }

      return {
        success: false,
        error: 'Groq Vision and Text fallback failed',
        processingTime: Date.now() - startTime
      };
    }

  } catch (error: any) {
    console.error('❌ Groq Vision generation error:', error);

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
  // let keyResult: { key: string; index: number } | null = null;
  let rateLimitChecked = false;
  let rateLimitResult: any = null;

  // Get session for user authentication FIRST
  const session = await getServerSession(authOptions);

  try {
    // Parse request body first to avoid unnecessary rate limit checks
    const body = await req.json();
    const { mood, description, imageUrl, imageBase64, publicId } = body;

    // Validate required fields and REJECT base64 to save costs
    if (!mood || (!imageUrl && !imageBase64)) {
      return NextResponse.json({
        success: false,
        message: 'Mood and image are required'
      }, { status: 400 });
    }

    // 🔥 COST OPTIMIZATION: Reject base64, require Cloudinary URL
    if (imageBase64 && !imageUrl) {
      console.error('❌ Base64 image rejected - use Cloudinary URL to save 3-6× tokens');
      return NextResponse.json({
        success: false,
        message: 'Image must be uploaded to Cloudinary first. Base64 images consume excessive credits.',
        error: 'base64_rejected'
      }, { status: 400 });
    }

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


    // 🚀 SINGLE PROVIDER STRATEGY: OpenRouter (Reliable & Cheap)
    console.log('🤖 Sending image to OpenRouter...');

    let result;

    try {
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      if (!openRouterKey) throw new Error('OpenRouter API Key is missing in environment variables');

      // 1. Prepare Messages with OPTIMIZED VIRAL CAPTION PROMPT
      const messages: any[] = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are a viral social media caption expert. Analyze this image and create 3 unique, engaging captions.

MOOD: ${mood}
${description ? `CONTEXT: ${description}` : ''}

STRICT RULES:
1. 📏 LENGTH: 30-50 words each (MUST be complete sentences)
2. 🎯 HOOK: Start with attention-grabbing first sentence
3. 💬 TONE: ${mood.includes('Fun') || mood.includes('Playful') ? 'Playful, energetic, Gen-Z friendly' : mood.includes('Professional') ? 'Polished, confident, aspirational' : mood.includes('Thoughtful') ? 'Reflective, deep, meaningful' : 'Natural, authentic, relatable'}
4. 🚫 BANNED WORDS: Never use "unleash", "elevate", "symphony", "tapestry", "testament", "embark", "journey"
5. ✨ INCLUDE: Reference specific visual details you see in the image
6. 🎨 EMOJIS: Use 2-4 relevant emojis naturally (not at the start)
7. #️⃣ HASHTAGS: Include 3-5 trending hashtags at the end

OUTPUT FORMAT (CRITICAL):
Return ONLY a JSON array with exactly 3 captions:
["caption 1 here", "caption 2 here", "caption 3 here"]

Example output:
["Just caught golden hour doing its thing ✨ The way the light hits different when you're not even trying 📸 Sometimes the best moments are the unplanned ones #GoldenHour #NoFilter #Vibes", "Another day, another slay 💅 This outfit really said 'main character energy' and I'm here for it 🔥 Who else is living their best life this weekend? #OOTD #WeekendVibes #Confidence", "POV: You finally found your signature look 😌 Took forever but worth every second 💯 Drop a 🔥 if you're feeling this aesthetic #StyleInspo #FashionGoals #Aesthetic"]`
            }
          ]
        }
      ];

      // 2. Add Image - ALWAYS use optimized Cloudinary URL (never base64)
      if (optimizedImageUrl) {
        messages[0].content.push({
          type: 'image_url',
          image_url: { url: optimizedImageUrl }
        });
      } else {
        throw new Error('No valid image URL available');
      }

      // 3. Call OpenRouter API with Model Selection
      const useFreeModel = process.env.USE_FREE_AI_MODEL === 'true';
      const modelConfig = useFreeModel ? {
        model: 'qwen/qwen2.5-vl-3b-instruct:free',
        temperature: 0.8,
        max_tokens: 500,
        comment: '🆓 FREE MODEL - May return non-JSON formatted responses'
      } : {
        model: 'openai/gpt-4o-mini',
        temperature: 0.8,
        max_tokens: 500,
        response_format: { type: 'json_object' },
        comment: '💰 PAID MODEL ($0.001/image) - Guaranteed JSON output'
      };

      console.log(`🤖 Using ${useFreeModel ? 'FREE' : 'PAID'} model:`, modelConfig.model);

      let response;
      let contentText;
      let usedFallback = false;

      try {
        // 🎯 PRIMARY: Selected model based on config
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
          let errorData;
          try {
            errorData = JSON.parse(errText);
          } catch {
            errorData = { raw: errText };
          }

          // 🔴 CRITICAL LOGGING - Surface exact OpenRouter error
          console.error('❌ OPENROUTER PRIMARY FAILURE:', {
            status: response.status,
            statusText: response.statusText,
            model: 'google/gemini-flash-1.5',
            error: errorData,
            headers: {
              'content-type': response.headers.get('content-type'),
              'x-ratelimit-remaining': response.headers.get('x-ratelimit-remaining'),
            },
            diagnosis: response.status === 400
              ? 'BAD REQUEST - Likely model access denied or invalid parameter'
              : response.status === 401
                ? 'UNAUTHORIZED - Invalid API key'
                : response.status === 402
                  ? 'PAYMENT REQUIRED - Insufficient credits'
                  : response.status === 403
                    ? 'FORBIDDEN - Account restricted or model not allowed'
                    : response.status === 404
                      ? 'NOT FOUND - Model does not exist'
                      : 'UNKNOWN ERROR'
          });

          throw new Error(`Primary AI Provider Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        contentText = data.choices[0]?.message?.content;
        console.log('✅ Captions generated with Gemini (Primary - Paid)');

      } catch (primaryError: any) {
        console.warn(`⚠️ Primary (Gemini) failed: ${primaryError.message}`);

        // 🛡️ SECONDARY: Try Gemini 1.5 Flash 8B (Different providers usually)
        try {
          console.log('🔄 FALLBACK 1: Switching to Gemini 1.5 Flash 8B...');
          const secondaryResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openRouterKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://capsera.com',
              'X-Title': 'Capsera',
            },
            body: JSON.stringify({
              model: 'google/gemini-flash-1.5-8b',
              messages: messages,
              temperature: 0.7,
              response_format: { type: 'json_object' }
            })
          });

          if (!secondaryResponse.ok) throw new Error('Secondary invalid');

          const secData = await secondaryResponse.json();
          contentText = secData.choices[0]?.message?.content;
          usedFallback = true;
          console.log('✅ Captions generated with Gemini 8B (Fallback)');

        } catch (secError) {
          console.log('� FALLBACK 2: Switching to Llama 3.2 11B Vision...');
          // 🛡️ TERTIARY: Try Llama 3.2 11B Vision
          try {
            const fallbackResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openRouterKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://capsera.com',
                'X-Title': 'Capsera',
              },
              body: JSON.stringify({
                model: 'meta-llama/llama-3.2-11b-vision-instruct',
                messages: messages,
                temperature: 0.7,
              })
            });

            if (!fallbackResponse.ok) {
              const fbErr = await fallbackResponse.text();
              throw new Error(`All fallbacks failed. Last error: ${fbErr}`);
            }

            const fbData = await fallbackResponse.json();
            contentText = fbData.choices[0]?.message?.content;
            usedFallback = true;
            console.log('✅ Captions generated with Llama (Final Fallback)');

          } catch (fallbackError: any) {
            console.error(`❌ All providers failed:`, fallbackError.message);
            throw new Error(`All AI providers exhausted. Please try again later.`);
          }
        }
      }

      // 4. Parse Response - ENHANCED with debugging
      let captions: string[] = [];

      console.log('🔍 Raw AI Response:', contentText?.substring(0, 200));

      try {
        // Remove markdown code blocks and trim
        let cleanedText = contentText.replace(/```json/g, '').replace(/```/g, '').trim();

        // Try parsing as JSON
        const parsed = JSON.parse(cleanedText);

        if (Array.isArray(parsed)) {
          captions = parsed;
          console.log('✅ Parsed as direct array, length:', captions.length);
        } else if (parsed.captions && Array.isArray(parsed.captions)) {
          captions = parsed.captions;
          console.log('✅ Parsed from .captions property, length:', captions.length);
        } else if (typeof parsed === 'object') {
          // Handle case where model returns {0: "caption1", 1: "caption2", 2: "caption3"}
          captions = Object.values(parsed);
          console.log('✅ Parsed as object values, length:', captions.length);
        }
      } catch (e) {
        console.warn('⚠️ JSON parse failed, trying fallback parsing:', e);

        // Fallback: Split by newlines and filter
        const lines = contentText.split('\n').filter((l: string) => l.trim().length > 10);

        // Try to extract captions from numbered list
        captions = lines
          .map((line: string) => line.replace(/^[\d\.\)\-\*\s]+/, '').trim())
          .filter((line: string) => line.length > 20) // Only keep substantial captions
          .slice(0, 3);

        console.log('✅ Fallback parsing extracted:', captions.length, 'captions');
      }

      // Ensure we have exactly 3 captions
      if (captions.length === 0) {
        console.error('❌ No captions extracted! Raw response:', contentText);
        throw new Error('Failed to extract captions from AI response');
      }

      // Clean up captions (remove numbers, extra quotes, etc.)
      captions = captions
        .slice(0, 3)
        .map(c => {
          let cleaned = String(c).trim();
          // Remove leading numbers like "1. " or "1) "
          cleaned = cleaned.replace(/^[\d\.\)\-\*\s]+/, '');
          // Remove surrounding quotes if present
          cleaned = cleaned.replace(/^["']|["']$/g, '');
          return cleaned.trim();
        })
        .filter(c => c.length > 0);

      // Pad with fallback if needed
      while (captions.length < 3) {
        captions.push(`${mood.split(' ')[0]} Caption ${captions.length + 1} - Try generating again`);
      }

      console.log(`✅ Final captions (${captions.length}):`, captions.map(c => c.substring(0, 50) + '...'));
      result = {
        captions,
        metadata: {
          model: modelConfig.model,
          isFreeModel: useFreeModel,
          cost: useFreeModel ? 0 : 0.0004,
          usedFallback
        }
      };

    } catch (error: any) {
      console.error('❌ Generation Failed:', error.message);

      return NextResponse.json({
        success: false,
        message: error.message || "Failed to generate captions. Please try again later.",
        error: error.message,
        debug_info: "OpenRouter Provider Failed"
      }, { status: 502 }); // 502 Bad Gateway is appropriate here
    }

    // ⚡ SPEED OPTIMIZATION: Store cache asynchronously
    if (result && result.captions && result.captions.length > 0 && imageUrl) {
      // ... (Cache logic remains same) ...
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
    // Top Level Error Handler
    console.error('❌ Critical Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
