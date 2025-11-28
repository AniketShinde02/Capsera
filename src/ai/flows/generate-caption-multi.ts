'use server';

/**
 * Multi-Provider Caption Generation Flow
 * Uses the new Multi-Provider AI System for faster, more reliable caption generation
 */

import { z } from 'genkit';
import dbConnect from '@/lib/db';
import { clientPromise } from '@/lib/db';
import { checkRateLimit, generateRateLimitKey, DEFAULT_RATE_LIMITS } from '@/lib/unified-rate-limiter';
// Content safety removed - AI providers handle this automatically
import {
  generateCaptions as multiProviderGenerateCaptions,
  initializeMultiProviderSystem,
  getProviderStatus,
  AIProviderRequest
} from '@/lib/ai-providers';

const GenerateCaptionsInputSchema = z.object({
  mood: z.string().describe('The selected mood for the caption.'),
  description: z
    .string()
    .optional()
    .describe('A description of the photo or video for which to generate captions.'),
  imageUrl: z.string().describe('The URL of the uploaded image (required for analysis).'),
  publicId: z.string().optional().describe('The Cloudinary public ID for image deletion.'),
  userId: z.string().optional().describe("The ID of the user generating the captions."),
  ipAddress: z.string().optional().describe("The IP address of the user (for rate limiting)."),
  skipRateLimit: z.boolean().optional().describe('If true, skip the internal rate limit check.'),
});

export type GenerateCaptionsInput = z.infer<typeof GenerateCaptionsInputSchema>;

const GenerateCaptionsOutputSchema = z.object({
  captions: z.array(z.string()).describe('An array of three unique, engaging captions.'),
  provider: z.string().describe('The AI provider that generated the captions.'),
  processingTime: z.number().describe('Time taken to generate captions in milliseconds.'),
  cached: z.boolean().optional().describe('Whether the captions were served from cache.'),
});

export type GenerateCaptionsOutput = z.infer<typeof GenerateCaptionsOutputSchema>;

// ⚡ PERFORMANCE OPTIMIZATION: Enhanced caching layer
const captionCache = new Map<string, GenerateCaptionsOutput & { timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes (longer for multi-provider)

// Generate cache key based on image URL and mood
function generateCacheKey(imageUrl: string, mood: string, description?: string): string {
  return `${imageUrl}_${mood}_${description || ''}`.replace(/[^a-zA-Z0-9]/g, '_');
}

// Check cache with TTL
function getCachedCaptions(key: string): GenerateCaptionsOutput | null {
  const cached = captionCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`🎯 Cache HIT for key: ${key.substring(0, 50)}...`);
    return { ...cached, cached: true };
  }

  if (cached) {
    captionCache.delete(key); // Remove expired cache
  }

  return null;
}

// Store in cache with timestamp
function setCachedCaptions(key: string, result: GenerateCaptionsOutput): void {
  const cacheEntry = {
    ...result,
    timestamp: Date.now()
  };
  captionCache.set(key, cacheEntry);
  console.log(`💾 Cached captions for key: ${key.substring(0, 50)}...`);
}

/**
 * Multi-Provider Caption Generation Flow
 * Uses intelligent provider routing for optimal performance
 */
export const generateCaptionsFlowMulti =
  async (input: GenerateCaptionsInput): Promise<GenerateCaptionsOutput> => {
    const startTime = Date.now();
    const timings: Record<string, number> = {};

    console.log('🚀 Starting Multi-Provider Caption Generation Flow');
    console.log(`📊 Input: mood="${input.mood}", description="${input.description || 'none'}"`);

    try {
      // Initialize multi-provider system if not already done
      await initializeMultiProviderSystem();

      // ⚡ SPEED OPTIMIZATION: Check cache first
      const cacheKey = generateCacheKey(input.imageUrl, input.mood, input.description);
      const cachedResult = getCachedCaptions(cacheKey);
      if (cachedResult) {
        console.log(`⚡ Cache HIT - returning cached captions in ${Date.now() - startTime}ms`);
        return cachedResult;
      }

      // Rate limiting check (unless skipped)
      if (!input.skipRateLimit) {
        console.log('🔒 Checking rate limits...');
        const rateLimitKey = generateRateLimitKey(input.userId, input.ipAddress);
        const rateLimitResult = await checkRateLimit(rateLimitKey, 20, 24, input.userId || '', input.ipAddress || '');

        if (!rateLimitResult.allowed) {
          const resetTime = new Date(rateLimitResult.resetTime).toLocaleString();
          throw new Error(`Rate limit exceeded. Reset at: ${resetTime}`);
        }

        timings.rateLimit = Date.now() - startTime;
        console.log(`✅ Rate limit check passed in ${timings.rateLimit}ms`);
      }

      // ⚡ SKIP CONTENT SAFETY: AI providers handle this automatically
      console.log('⚡ Skipping content safety check - AI providers handle this automatically');
      timings.safetyCheck = Date.now() - startTime;

      // 🎯 MULTI-PROVIDER GENERATION: Use intelligent provider routing
      console.log('🎯 Generating captions with multi-provider system...');

      const providerRequest: AIProviderRequest = {
        imageUrl: input.imageUrl,
        mood: input.mood,
        description: input.description,
        userId: input.userId,
        ipAddress: input.ipAddress,
        maxRetries: 3,
        timeout: 25000, // 25 seconds timeout
        temperature: 0.7, // Add some creativity while keeping focused
        systemPrompt: `Analyze this image and create viral social media captions.

STEP 1: IMAGE ANALYSIS
Examine and describe:
- Main subject/focus
- Actions/activities shown
- Location/setting
- Dominant colors
- Lighting conditions
- Overall aesthetic/style
- Unique details or standout elements

STEP 2: CAPTION CREATION
Create 3 distinct captions that sound 100% HUMAN and 0% AI.

🚫 **FORBIDDEN WORDS**:
"Unleash", "Elevate", "Symphony", "Tapestry", "Testament", "Realm", "Embrace", "Breathtaking".

✅ **REQUIREMENTS**:
- Write like a real Gen Z/Millennial.
- Use natural slang/lingo.
- Include 2-3 relevant emojis.
- Add 3-5 mix of niche and popular hashtags.

📝 **CAPTION STYLES**:
1. **Short & Aesthetic** (5-10 words): Minimalist, cool.
2. **Relatable & Witty** (10-20 words): Conversational, fun.
3. **Storytelling** (20-35 words): Detailed, sets the scene.

RULES:
✓ MUST mention actual things from the image
✓ MUST match the requested mood perfectly
✓ Make each caption completely different
✓ Be authentic and engaging for social media`

      };

      const result = await multiProviderGenerateCaptions(providerRequest);

      if (!result.success || !result.captions || result.captions.length === 0) {
        throw new Error(`Caption generation failed: ${result.error || 'Unknown error'}`);
      }

      timings.generation = Date.now() - startTime;
      console.log(`✅ Captions generated with ${result.provider} in ${timings.generation}ms`);

      // Prepare output
      const output: GenerateCaptionsOutput = {
        captions: result.captions,
        provider: result.provider,
        processingTime: result.processingTime,
        cached: false
      };

      // ⚡ SPEED OPTIMIZATION: Cache the result asynchronously
      setCachedCaptions(cacheKey, output);

      // ⚡ SPEED OPTIMIZATION: Save to database asynchronously (don't wait)
      saveCaptionToDatabase(input, output, result.provider)
        .then(() => console.log('💾 Caption saved to database'))
        .catch(err => console.error('❌ Failed to save caption to database:', err));

      const totalTime = Date.now() - startTime;
      console.log(`🎯 Multi-Provider Caption Generation completed in ${totalTime}ms`);
      console.log(`📊 Performance breakdown:`, timings);
      console.log(`🎯 Provider used: ${result.provider}`);
      console.log(`💰 Cost: $${result.cost.toFixed(6)}`);

      return output;

    } catch (error: any) {
      const totalTime = Date.now() - startTime;
      console.error(`❌ Multi-Provider Caption Generation failed after ${totalTime}ms:`, error);

      // Log provider status for debugging
      const status = getProviderStatus();
      if (status) {
        console.log('📊 Provider Status:', {
          providers: Array.from(status.providers.keys()),
          healthChecks: Array.from(status.healthChecks.entries()).map(([name, health]) => ({
            name,
            isHealthy: health.isHealthy,
            responseTime: health.responseTime
          }))
        });
      }

      throw error;
    }
  };

// Save caption to database (async, non-blocking)
async function saveCaptionToDatabase(
  input: GenerateCaptionsInput,
  output: GenerateCaptionsOutput,
  provider: string
): Promise<void> {
  try {
    await dbConnect();
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE || 'capsera');

    const captionData = {
      imageUrl: input.imageUrl,
      publicId: input.publicId,
      mood: input.mood,
      description: input.description,
      captions: output.captions,
      provider,
      processingTime: output.processingTime,
      userId: input.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('posts').insertOne(captionData);
    console.log('✅ Caption data saved to database');
  } catch (error) {
    console.error('❌ Database save error:', error);
    // Don't throw - this is non-critical
  }
}

// Export the main function
export { generateCaptionsFlowMulti as generateCaptionsFlow };
