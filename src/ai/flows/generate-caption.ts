
'use server';

/**
 * @fileOverview Generates multiple captions for a social media post based on a user-provided description and mood.
 *
 * - generateCaptions - A function that generates captions.
 * - GenerateCaptionsInput - The input type for the generateCaptions function.
 * - GenerateCaptionsOutput - The return type for the generateCaptionsOutput function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import dbConnect from '@/lib/db';
import { Types } from 'mongoose';
import { clientPromise } from '@/lib/db';
import { checkRateLimit, generateRateLimitKey, DEFAULT_RATE_LIMITS } from '@/lib/unified-rate-limiter';
import { checkImageContentSafety, reportInappropriateContent } from '@/lib/content-safety';

const GenerateCaptionsInputSchema = z.object({
  mood: z.string().describe('The selected mood for the caption.'),
  description: z
    .string()
    .optional()
    .describe(
      'A description of the photo or video for which to generate captions.'
    ),
  imageUrl: z.string().describe('The URL of the uploaded image (required for analysis).'),
  publicId: z.string().optional().describe('The Cloudinary public ID for image deletion.'),
  userId: z.string().optional().describe("The ID of the user generating the captions."),
  ipAddress: z.string().optional().describe("The IP address of the user (for rate limiting)."),
  skipRateLimit: z.boolean().optional().describe('If true, skip the internal rate limit check (useful when caller already enforced limits).'),
});

export type GenerateCaptionsInput = z.infer<typeof GenerateCaptionsInputSchema>;

const GenerateCaptionsOutputSchema = z.object({
  captions: z.array(z.string()).describe('An array of three unique, engaging captions.'),
});

export type GenerateCaptionsOutput = z.infer<typeof GenerateCaptionsOutputSchema>;

// ⚡ PERFORMANCE OPTIMIZATION: Add caching layer
const captionCache = new Map<string, GenerateCaptionsOutput>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Generate cache key based on image URL and mood
function generateCacheKey(imageUrl: string, mood: string, description?: string): string {
  return `${imageUrl}_${mood}_${description || ''}`.replace(/[^a-zA-Z0-9]/g, '_');
}

export async function generateCaptions(input: GenerateCaptionsInput): Promise<GenerateCaptionsOutput> {
  // ⚡ SPEED OPTIMIZATION: Check cache first
  const cacheKey = generateCacheKey(input.imageUrl, input.mood, input.description);
  const cached = captionCache.get(cacheKey);

  if (cached) {
    console.log('🚀 Cache hit - returning cached captions');
    return cached;
  }

  // ⚡ SPEED OPTIMIZATION: Direct call to optimized flow
  const result = await generateCaptionsFlow(input);

  // Cache the result
  captionCache.set(cacheKey, result);

  // Clean up old cache entries periodically
  if (captionCache.size > 100) {
    const oldestKey = captionCache.keys().next().value;
    captionCache.delete(oldestKey);
  }

  return result;
}

// ⚡ PERFORMANCE OPTIMIZATION: Streaming response generator for faster perceived performance
export async function* generateCaptionsStream(input: GenerateCaptionsInput): AsyncGenerator<Partial<GenerateCaptionsOutput>, GenerateCaptionsOutput, unknown> {
  const startTime = Date.now();

  // Check cache first
  const cacheKey = generateCacheKey(input.imageUrl, input.mood, input.description);
  const cached = captionCache.get(cacheKey);

  if (cached) {
    console.log('🚀 Cache hit - streaming cached captions');
    yield cached;
    return cached;
  }

  // Stream progress updates
  yield { captions: ['Analyzing image...', 'Processing mood...', 'Generating captions...'] };

  try {
    const result = await generateCaptionsFlow(input);

    // Cache the result
    captionCache.set(cacheKey, result);

    const endTime = Date.now();
    console.log(`⚡ Caption generation completed in ${endTime - startTime}ms`);

    return result;
  } catch (error) {
    console.error('❌ Caption generation failed:', error);
    throw error;
  }
}

const generateCaptionsPrompt = ai.definePrompt({
  name: 'generateCaptionsPrompt',
  input: { schema: GenerateCaptionsInputSchema },
  output: { schema: GenerateCaptionsOutputSchema },
  prompt: `You are an expert social media content creator and image analyst specializing in viral captions for Gen Z audiences.

  STEP 1: ANALYZE THE IMAGE
  You have been provided with an image. Analyze its visual content carefully.
  
  IMPORTANT: You MUST analyze the actual image content you see. Do not generate generic captions.
  
  Describe what you actually see:
  - What is the main subject? (person, animal, object, landscape, etc.)
  - What are they doing or what's happening?
  - What's the setting/location/background?
  - What colors dominate the image?
  - What's the lighting like? (bright, dark, golden hour, etc.)
  - What's the composition and style?
  - What emotions or mood does the image convey?
  - Are there any text, brands, or notable details?
  - What's the overall aesthetic and vibe?

  STEP 2: MATCH THE MOOD
  Target mood: {{{mood}}}
  
  {{#if description}}
  Additional context provided: {{{description}}}
  {{/if}}

  STEP 3: CREATE CAPTIONS
  Generate exactly 3 unique, viral-worthy captions that:
  
  ✅ MUST directly reference what you see in the image (colors, objects, people, setting, etc.)
  ✅ MUST match the specified mood/tone perfectly
  ✅ MUST be engaging and shareable for TikTok, Instagram, and Snapchat
  ✅ MUST include relevant emojis (2-4 per caption)
  ✅ MUST include trending hashtags (3-5 per caption)
  ✅ MUST be concise (under 150 characters each)
  ✅ MUST feel authentic and relatable to Gen Z
  
  Each caption should have a different approach:
  - Caption 1: Direct and descriptive about what's in the image
  - Caption 2: Emotional/relatable angle based on the image content
  - Caption 3: Trendy/playful with popular phrases/slang
  
  CRITICAL REQUIREMENTS:
  - Your captions MUST prove you analyzed the image by mentioning specific visual elements
  - Reference actual colors, objects, people, actions, or settings you see
  - DO NOT use generic captions that could apply to any image
  - Each caption should feel like it was written by someone who actually saw this specific image
  
  EXAMPLES of what to reference:
  - "That golden sunset hitting different 🌅" (if you see a sunset)
  - "Coffee shop vibes with that cozy lighting ☕" (if you see a coffee shop)
  - "This blue dress is everything 💙" (if you see someone in a blue dress)
  - "Beach waves and good vibes 🌊" (if you see a beach scene)
  
  Return exactly 3 captions in an array format.
  `,
});

const generateCaptionsFlow = ai.defineFlow(
  {
    name: 'generateCaptionsFlow',
    inputSchema: GenerateCaptionsInputSchema,
    outputSchema: GenerateCaptionsOutputSchema,
  },
  async input => {
    const startTime = Date.now();

    // ⚡ PERFORMANCE MONITORING: Track timing for each phase
    const timings = {
      start: startTime,
      safetyCheck: 0,
      rateLimit: 0,
      aiGeneration: 0,
      parsing: 0,
      total: 0
    };

    // Sanitized logging - don't expose full URLs or sensitive data
    console.log('🔍 Caption Generation Input:', {
      mood: input.mood,
      imageUrl: input.imageUrl ? 'Image uploaded successfully' : 'NO IMAGE URL',
      description: input.description || 'No description provided',
      userId: input.userId ? 'Authenticated user' : 'Anonymous user',
      ipAddress: 'IP logged for rate limiting'
    });

    // Validate that we have an image URL
    if (!input.imageUrl) {
      throw new Error('Image URL is required for caption generation');
    }

    // ⚡ SPEED OPTIMIZATION: Fast content safety check with timeout
    let safetyCheckPromise: Promise<any> | null = null;
    try {
      console.log('🔍 Starting fast content safety check...');

      // Start safety check in parallel but don't wait for it
      safetyCheckPromise = checkImageContentSafety(input.imageUrl)
        .then(safetyResult => {
          if (!safetyResult.isAppropriate) {
            console.warn(`⚠️ Inappropriate content detected: ${safetyResult.flagged.join(', ')}`);

            // Report inappropriate content asynchronously
            reportInappropriateContent({
              imageUrl: input.imageUrl,
              userId: input.userId,
              ipAddress: input.ipAddress || 'unknown',
              reason: safetyResult.flagged.includes('adult') ? 'sexual' :
                safetyResult.flagged.includes('violence') ? 'violent' : 'inappropriate',
              description: `Content flagged during caption generation as ${safetyResult.flagged.join(', ')} with ${safetyResult.confidence} confidence`,
              timestamp: new Date()
            }).catch(err => console.error('Failed to report inappropriate content:', err));

            return { blocked: true, reason: 'inappropriate content' };
          }
          console.log('✅ Content safety check passed');
          return { blocked: false };
        })
        .catch(error => {
          console.error('❌ Content safety check failed:', error);
          return { blocked: false }; // Continue on error (fail-safe)
        });

      // Wait for safety check with timeout (max 3 seconds)
      const safetyResult = await Promise.race([
        safetyCheckPromise,
        new Promise(resolve => setTimeout(() => resolve({ blocked: false }), 3000))
      ]);

      if (safetyResult.blocked) {
        throw new Error('This image contains inappropriate content and cannot be processed. Please upload a family-friendly image.');
      }

      timings.safetyCheck = Date.now() - startTime;
      console.log(`⚡ Content safety check completed in ${timings.safetyCheck}ms`);

    } catch (safetyError) {
      if (safetyError.message.includes('inappropriate content')) {
        throw safetyError; // Re-throw content violation errors
      }
      console.error('❌ Content safety check failed:', safetyError);
      // Continue with caption generation if safety check fails (fail-safe approach)
      timings.safetyCheck = Date.now() - startTime;
    }

    // 🚦 RATE LIMITING CHECK
    const isAuthenticated = !!input.userId;
    const rateLimitConfig = isAuthenticated ? DEFAULT_RATE_LIMITS.REGISTERED : DEFAULT_RATE_LIMITS.ANONYMOUS;
    const rateLimitKey = generateRateLimitKey(input.userId, input.ipAddress);

    // If caller indicates the rate limit was already checked (skipRateLimit), avoid double-checking
    if (!input.skipRateLimit) {
      console.log(`🚦 Checking rate limit for ${isAuthenticated ? 'authenticated' : 'anonymous'} user...`);

      const rateLimitResult = await checkRateLimit(
        rateLimitKey,
        rateLimitConfig.MAX_GENERATIONS,
        rateLimitConfig.WINDOW_HOURS,
        input.userId,
        input.ipAddress
      );

      if (!rateLimitResult.allowed) {
        const hoursRemaining = Math.ceil((rateLimitResult.resetTime - Date.now()) / (60 * 60 * 1000));
        const userType = isAuthenticated ? 'registered users' : 'anonymous users';
        const maxAllowed = rateLimitConfig.MAX_GENERATIONS;

        console.log(`🚫 Rate limit exceeded for user type: ${isAuthenticated ? 'authenticated' : 'anonymous'}`);

        const daysRemaining = Math.ceil(hoursRemaining / 24);
        console.log(`🔍 Debug: hoursRemaining=${hoursRemaining}, daysRemaining=${daysRemaining}`);
        // Always show "tomorrow" for daily quotas to avoid confusion
        const resetMessage = "tomorrow";

        if (isAuthenticated) {
          throw new Error(
            `You've reached your daily limit of ${maxAllowed} images (${maxAllowed * 3} captions). ` +
            `Your quota will reset ${resetMessage}. Each image generates 3 unique captions!`
          );
        } else {
          throw new Error(
            `You've used all ${maxAllowed} free images today! That's ${maxAllowed * 3} captions total. ` +
            `Sign up for a free account to get ${DEFAULT_RATE_LIMITS.REGISTERED.MAX_GENERATIONS} daily images (${DEFAULT_RATE_LIMITS.REGISTERED.MAX_GENERATIONS * 3} captions). ` +
            `Your free quota resets ${resetMessage}.`
          );
        }
      }

      console.log(`✅ Rate limit check passed. Remaining: ${rateLimitResult.remaining}/${rateLimitConfig.MAX_GENERATIONS}`);
    } else {
      console.log('🚦 Skipping internal rate limit check (skipRateLimit=true)');
    }

    timings.rateLimit = Date.now() - startTime - timings.safetyCheck;
    console.log(`⚡ Rate limit check completed in ${timings.rateLimit}ms`);

    // 🤖 CRITICAL FIX: Use Genkit's proper image analysis method
    console.log('🤖 Sending image to AI for analysis using Genkit...');
    // API Key check is now handled by the Gemini key rotation system in genkit.ts
    console.log('🔑 Using Gemini key rotation system (configured in genkit.ts)');

    let output: any; // Declare output in outer scope

    try {
      // ⚡ SPEED OPTIMIZATION: Streamlined AI prompt for faster processing
      const result = await ai.generate([
        {
          text: `Create 3 viral social media captions for this image.

MOOD: ${input.mood}
${input.description ? `CONTEXT: ${input.description}` : ''}

REQUIREMENTS:
- Analyze the actual image content (colors, objects, people, setting)
- Match the mood perfectly
- Include 2-4 emojis and 3-5 hashtags per caption
- Keep under 150 characters each
- Make each caption completely different in style

CAPTION STYLES:
1. Direct & descriptive (what you see)
2. Emotional & relatable (how it feels) 
3. Trendy & creative (current slang/viral phrases)

Return as JSON array: ["caption1", "caption2", "caption3"]`
        },
        {
          media: { url: input.imageUrl }
        }
      ]);

      output = result.output; // Assign to outer scope variable

      timings.aiGeneration = Date.now() - startTime - timings.safetyCheck - timings.rateLimit;
      console.log(`⚡ AI generation completed in ${timings.aiGeneration}ms`);
      console.log('🔍 Full AI Result:', result);
      console.log('🔍 Output object:', output);
      console.log('✨ AI Generated Captions:', output?.text ? 'Captions generated' : 'No captions generated');
    } catch (error: any) {
      console.error('❌ AI Generation Error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      // Check for safety/content policy violations
      if (error.message && (
        error.message.includes('safety') ||
        error.message.includes('blocked') ||
        error.message.includes('content policy') ||
        error.message.includes('SAFETY')
      )) {
        throw new Error(`Content flagged by safety filters. Please adjust your description or try a different image.`);
      }

      throw new Error(`AI generation failed: ${error.message}`);
    }

    // ⚡ SPEED OPTIMIZATION: Fast response parsing
    let captions: string[] = [];

    if (output?.text) {
      // Try JSON first (most common case)
      try {
        const parsed = JSON.parse(output.text);
        if (Array.isArray(parsed)) {
          captions = parsed.slice(0, 3);
        } else {
          // Fallback: split by lines
          captions = output.text.split('\n').filter((line: string) => line.trim()).slice(0, 3);
        }
      } catch {
        // Fallback: split by lines
        captions = output.text.split('\n').filter((line: string) => line.trim()).slice(0, 3);
      }
    } else if (Array.isArray(output)) {
      // Direct array output
      captions = output.slice(0, 3).map((item: any) =>
        typeof item === 'string' ? item : (item.caption || item.text || String(item))
      );
    } else {
      throw new Error('AI generated unexpected output format');
    }

    // ⚡ SPEED OPTIMIZATION: Fast sanitization and validation
    captions = captions.map(caption => {
      const sanitized = caption.replace(/<[^>]*>/g, '').trim();
      return sanitized || `Amazing photo! ✨ #vibes #aesthetic #mood`;
    }).slice(0, 3);

    // Ensure we have exactly 3 captions
    while (captions.length < 3) {
      captions.push(`Caption ${captions.length + 1} - Please try again with a different image.`);
    }

    timings.parsing = Date.now() - startTime - timings.safetyCheck - timings.rateLimit - timings.aiGeneration;
    console.log(`⚡ Response parsing completed in ${timings.parsing}ms`);

    // Validate that we have valid captions
    if (captions.length === 0 || captions.every(caption => !caption || caption.trim() === '')) {
      console.error('❌ No valid captions generated');
      throw new Error('Failed to generate valid captions. Please try again.');
    }

    console.log(`✅ Generated ${captions.length} captions successfully`);
    console.log('📝 Final captions:', captions);
    console.log('📝 Caption types:', captions.map(c => typeof c));
    console.log('📝 Caption lengths:', captions.map(c => String(c).length));

    // ⚡ SPEED OPTIMIZATION: Non-blocking database save for authenticated users
    if (captions.length > 0 && input.userId) {
      // Start database save asynchronously - don't wait for it
      dbConnect()
        .then(async () => {
          const client = await clientPromise;
          const db = client.db();
          const postsCollection = db.collection('posts');

          const postToInsert = {
            captions: captions,
            image: input.imageUrl,
            mood: input.mood,
            description: input.description || null,
            createdAt: new Date(),
            user: new Types.ObjectId(input.userId),
          };

          return postsCollection.insertOne(postToInsert);
        })
        .then(result => {
          console.log(`✅ Caption set saved successfully with ID: ${result.insertedId}`);
        })
        .catch(error => {
          console.error('⚠️ Failed to save caption set to database (non-blocking):', error);
          // Don't throw - this is non-blocking
        });
    } else if (!input.userId) {
      console.log('👤 Anonymous user - captions generated but not saved to database (privacy protection)');
    }

    // ⚡ PERFORMANCE SUMMARY: Log total timing breakdown
    timings.total = Date.now() - startTime;
    console.log(`⚡ PERFORMANCE SUMMARY:`);
    console.log(`   Content Safety: ${timings.safetyCheck}ms`);
    console.log(`   Rate Limiting: ${timings.rateLimit}ms`);
    console.log(`   AI Generation: ${timings.aiGeneration}ms`);
    console.log(`   Response Parsing: ${timings.parsing}ms`);
    console.log(`   TOTAL TIME: ${timings.total}ms`);

    return { captions };
  }
);
