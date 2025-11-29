
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
  imageUrl: z.string().optional().describe('The URL of the uploaded image (required if imageBase64 is not provided).'),
  imageBase64: z.string().optional().describe('Base64 encoded image data (for faster processing).'),
  publicId: z.string().optional().describe('The Cloudinary public ID for image deletion.'),
  userId: z.string().optional().describe("The ID of the user generating the captions."),
  ipAddress: z.string().optional().describe("The IP address of the user (for rate limiting)."),
  skipRateLimit: z.boolean().optional().describe('If true, skip the internal rate limit check (useful when caller already enforced limits).'),
  skipSafetyCheck: z.boolean().optional().describe('If true, skip the external safety check (rely on AI provider safety).'),
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
  // ⚡ SPEED OPTIMIZATION: Check cache first (only if we have a URL)
  if (input.imageUrl) {
    const cacheKey = generateCacheKey(input.imageUrl, input.mood, input.description);
    const cached = captionCache.get(cacheKey);

    if (cached) {
      console.log('🚀 Cache hit - returning cached captions');
      return cached;
    }
  }

  // ⚡ SPEED OPTIMIZATION: Direct call to optimized flow
  const result = await generateCaptionsFlow(input);

  // Cache the result if we have a URL
  if (input.imageUrl) {
    const cacheKey = generateCacheKey(input.imageUrl, input.mood, input.description);
    captionCache.set(cacheKey, result);

    // Clean up old cache entries periodically
    if (captionCache.size > 100) {
      const oldestKey = captionCache.keys().next().value;
      captionCache.delete(oldestKey);
    }
  }

  return result;
}

// ⚡ PERFORMANCE OPTIMIZATION: Streaming response generator for faster perceived performance
export async function* generateCaptionsStream(input: GenerateCaptionsInput): AsyncGenerator<Partial<GenerateCaptionsOutput>, GenerateCaptionsOutput, unknown> {
  const startTime = Date.now();

  // Check cache first
  if (input.imageUrl) {
    const cacheKey = generateCacheKey(input.imageUrl, input.mood, input.description);
    const cached = captionCache.get(cacheKey);

    if (cached) {
      console.log('🚀 Cache hit - streaming cached captions');
      yield cached;
      return cached;
    }
  }

  // Stream progress updates
  yield { captions: ['Analyzing image...', 'Processing mood...', 'Generating captions...'] };

  try {
    const result = await generateCaptionsFlow(input);

    // Cache the result
    if (input.imageUrl) {
      const cacheKey = generateCacheKey(input.imageUrl, input.mood, input.description);
      captionCache.set(cacheKey, result);
    }

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
  prompt: `You are a viral social media expert. Your goal is to write captions that sound 100% HUMAN and 0% AI.

  STEP 1: ANALYZE THE IMAGE
  Look closely at the image. Identify specific details: lighting, colors, objects, expressions, background.

  STEP 2: MATCH THE MOOD
  Target mood: {{{mood}}}
  {{#if description}}Context: {{{description}}}{{/if}}

  STEP 3: WRITE 3 "VIRAL" CAPTIONS
  
  🚫 **FORBIDDEN WORDS**: "Unleash", "Elevate", "Symphony", "Tapestry", "Testament", "Realm", "Embrace".
  
  ✅ **REQUIREMENTS**:
  - **Length**: 30-50 words per caption. (No short captions).
  - **Tone**: High energy, confident, relatable.
  - **Structure**: Hook -> Visual Detail -> Vibe -> Question/Closing.
  - **Emojis**: Use 3-5 relevant emojis mixed naturally into the text.
  - **Hashtags**: 3-5 mix of niche and popular hashtags.

  📝 **CAPTION STYLES**:
  
  1. **The "Hype" Caption**:
     - Focus on confidence and energy.
     - Mention specific colors or outfit details.
     - Example: "Obsessed with how this red dress turned out! 💃 The way the light hits this color is just magical. ✨ Feeling absolutely unstoppable today. What's your power color? ❤️"
  
  2. **The "Vibe" Caption**:
     - Focus on the atmosphere and feeling.
     - Describe the setting or lighting.
     - Example: "That golden hour glow is hitting different today. 🌅 Soaking up every bit of this peaceful energy. Sometimes you just need to pause and breathe. ✨🍃"
  
  3. **The "Story" Caption**:
     - A mini-story or relatable thought about the image.
     - Make it conversational.
     - Example: "POV: You finally found the perfect spot for coffee. ☕ The aesthetic here is unmatched and the vibes are immaculate. Who wants to join me next time? 🥐✨"

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
      imageUrl: input.imageUrl ? 'Image URL provided' : 'No Image URL',
      imageBase64: input.imageBase64 ? 'Base64 Image provided' : 'No Base64 Image',
      description: input.description || 'No description provided',
      userId: input.userId ? 'Authenticated user' : 'Anonymous user',
      ipAddress: 'IP logged for rate limiting'
    });

    // Validate that we have an image (either URL or Base64)
    if (!input.imageUrl && !input.imageBase64) {
      throw new Error('Image is required for caption generation (URL or Base64)');
    }

    // ⚡ SPEED OPTIMIZATION: Fast content safety check with timeout
    // Skip safety check if requested (e.g. for Base64 fast mode where we rely on AI provider safety)
    if (!input.skipSafetyCheck && input.imageUrl) {
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
                imageUrl: input.imageUrl!,
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

        // Wait for safety check with timeout (max 1.5 seconds - optimized for speed)
        const safetyResult = await Promise.race([
          safetyCheckPromise,
          new Promise(resolve => setTimeout(() => resolve({ blocked: false }), 1500))
        ]);

        if (safetyResult.blocked) {
          throw new Error('This image contains inappropriate content and cannot be processed. Please upload a family-friendly image.');
        }

        timings.safetyCheck = Date.now() - startTime;
        console.log(`⚡ Content safety check completed in ${timings.safetyCheck}ms`);

      } catch (safetyError: any) {
        if (safetyError.message.includes('inappropriate content')) {
          throw safetyError; // Re-throw content violation errors
        }
        console.error('❌ Content safety check failed:', safetyError);
        // Continue with caption generation if safety check fails (fail-safe approach)
        timings.safetyCheck = Date.now() - startTime;
      }
    } else {
      console.log('⏩ Skipping external safety check (using AI provider safety or Base64 mode)');
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
      // Use Base64 if available, otherwise URL
      const mediaPart = input.imageBase64
        ? { media: { url: input.imageBase64 } }
        : { media: { url: input.imageUrl! } };

      const result = await ai.generate([
        {
          text: `Create 3 viral social media captions for this image.

MOOD: ${input.mood}
${input.description ? `CONTEXT: ${input.description}` : ''}

STRICT GUIDELINES:
1. 🚫 NO AI WORDS: Avoid "unleash", "elevate", "tapestry", "symphony".
2. 📏 LENGTH: 30-50 words each.
3. 💎 STRUCTURE: Hook + Visuals + Vibe + Question.
4. 🗣️ TONE: Enthusiastic and authentic.

Return as JSON array: ["caption1", "caption2", "caption3"]`
        },
        mediaPart
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
        throw new Error(`Content flagged by safety filters.Please adjust your description or try a different image.`);
      }

      throw new Error(`AI generation failed: ${error.message} `);
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
    console.log(`⚡ Response parsing completed in ${timings.parsing} ms`);

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
    if (captions.length > 0 && input.userId && input.imageUrl) {
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
          console.log(`✅ Caption set saved successfully with ID: ${result.insertedId} `);
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
    console.log(`⚡ PERFORMANCE SUMMARY: `);
    console.log(`   Content Safety: ${timings.safetyCheck} ms`);
    console.log(`   Rate Limiting: ${timings.rateLimit} ms`);
    console.log(`   AI Generation: ${timings.aiGeneration} ms`);
    console.log(`   Response Parsing: ${timings.parsing} ms`);
    console.log(`   TOTAL TIME: ${timings.total} ms`);

    return { captions };
  }
);
