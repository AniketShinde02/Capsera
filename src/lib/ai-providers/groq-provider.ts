/**
 * Groq AI Provider Implementation
 * Follows the same patterns as SmartGeminiManager
 */

import { BaseAIProvider } from './base-provider';
import { GroqConfig, AIProviderRequest, AIProviderResponse, AIProviderError } from './types';
import { groqKeyManager } from './groq-key-manager';

export class GroqProvider extends BaseAIProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string = 'https://api.groq.com/openai/v1';

  constructor(config: GroqConfig) {
    super(config);
    this.apiKey = config.apiKey;
    this.model = config.model || 'llama-3.1-70b-versatile';
    // this.baseUrl = config.baseUrl || this.baseUrl; // baseUrl not in GroqConfig

    // Initialize with first available key (async)
    groqKeyManager.getBestKey().then(keyResult => {
      if (keyResult) {
        this.apiKey = keyResult.key;
        console.log(`🚀 Groq provider initialized with model: ${this.model}, using key ${keyResult.index + 1}`);
      } else {
        console.log(`⚠️ No Groq keys available, provider will be disabled`);
      }
    }).catch(error => {
      console.error('❌ Error initializing Groq provider:', error);
    });
  }

  async generateCaptions(request: AIProviderRequest): Promise<AIProviderResponse> {
    const startTime = Date.now();

    return this.makeRequest(async () => {
      console.log(`🔥 Generating captions with Groq (${this.model})...`);

      // Get the best available key
      const keyResult = await groqKeyManager.getBestKey();
      if (!keyResult) {
        throw new Error('No Groq API keys available');
      }

      const currentApiKey = keyResult.key;
      console.log(`🔑 Using Groq key ${keyResult.index + 1}`);

      // Optimized prompt for Groq (faster than Gemini)
      const prompt = this.buildPrompt(request.mood, request.description);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a professional social media caption generator. Generate exactly 3 unique, engaging captions that sound 100% HUMAN. Avoid AI cliches. Length: 30-50 words each. Structure: Hook + Visuals + Vibe + Question.'
            },
            {
              role: 'user',
              content: `${prompt}\n\nImage URL: ${request.imageUrl}`
            }
          ],
          max_tokens: 300,
          temperature: 0.7,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle content safety responses (400 Bad Request with safety flags)
        if (response.status === 400 && errorData.error?.message?.includes('safety')) {
          console.warn('⚠️ Content flagged by Groq safety filters');
          throw new AIProviderError(
            'This content was flagged by our safety filters. Please try with a different image.',
            'groq',
            'CONTENT_SAFETY_VIOLATION',
            false // Don't retry safety violations
          );
        }

        // Handle content policy violations
        if (response.status === 400 && errorData.error?.message?.includes('policy')) {
          console.warn('⚠️ Content policy violation detected by Groq');
          throw new AIProviderError(
            'This content violates our usage policies. Please try with a different image.',
            'groq',
            'CONTENT_POLICY_VIOLATION',
            false // Don't retry policy violations
          );
        }

        // Mark key as exhausted if rate limited
        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after');
          const retrySeconds = retryAfter ? parseInt(retryAfter) : 300;
          groqKeyManager.markKeyExhausted(keyResult.index, retrySeconds);
        }

        throw new GroqAPIError(
          `Groq API error: ${response.status} ${response.statusText}`,
          response.status,
          errorData
        );
      }

      const data = await response.json();
      const captions = this.extractCaptions(data.choices[0]?.message?.content || '');

      const processingTime = Date.now() - startTime;
      const cost = this.calculateCost(data.usage);

      console.log(`✅ Groq captions generated in ${processingTime}ms`);

      return {
        success: true,
        captions,
        provider: this.config.name,
        processingTime,
        cost,
        cached: false
      };
    }, request);
  }

  async checkHealth(): Promise<boolean> {
    try {
      // Check health of all keys
      await groqKeyManager.checkAllKeysHealth();
      const status = groqKeyManager.getStatus();
      return status.available > 0;
    } catch (error) {
      console.error('Groq health check failed:', error);
      return false;
    }
  }

  getProviderSpecificError(error: any): AIProviderError {
    if (error instanceof GroqAPIError) {
      switch (error.status) {
        case 429:
          return new AIProviderError(
            `Groq rate limit exceeded`,
            'groq',
            'RATE_LIMIT',
            true,
            this.extractRetryAfter(error)
          );
        case 401:
          return new AIProviderError(
            `Groq API key invalid`,
            'groq',
            'AUTH_ERROR',
            false
          );
        case 402:
          return new AIProviderError(
            `Groq quota exceeded`,
            'groq',
            'QUOTA_EXCEEDED',
            true
          );
        default:
          return new AIProviderError(
            `Groq API error: ${error.message}`,
            'groq',
            'API_ERROR',
            error.status >= 500
          );
      }
    }

    return new AIProviderError(
      `Groq error: ${error.message}`,
      'groq',
      'UNKNOWN_ERROR',
      true
    );
  }

  private buildPrompt(mood: string, description?: string): string {
    const moodDescriptions = {
      'professional': 'corporate, business-focused, authoritative',
      'casual': 'relaxed, friendly, approachable',
      'creative': 'artistic, imaginative, innovative',
      'humorous': 'funny, witty, entertaining',
      'inspirational': 'motivational, uplifting, empowering',
      'minimalist': 'clean, simple, elegant'
    };

    const moodDesc = moodDescriptions[mood as keyof typeof moodDescriptions] || mood;

    return `Generate 3 unique social media captions for an image with a ${moodDesc} mood.${description ? ` Image description: ${description}` : ''
      }

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
  }

  private extractCaptions(content: string): string[] {
    const lines = content.split('\n').filter(line => line.trim());
    const captions: string[] = [];

    for (const line of lines) {
      // Match numbered captions (1., 2., 3. or 1) 2) 3))
      const match = line.match(/^\d+[\.\)]\s*(.+)$/);
      if (match && match[1]) {
        captions.push(match[1].trim());
      }
    }

    // Fallback: split by lines if no numbered format
    if (captions.length === 0) {
      const fallbackCaptions = lines
        .filter(line => line.length > 10 && line.length < 200)
        .slice(0, 3);

      if (fallbackCaptions.length > 0) {
        return fallbackCaptions;
      }
    }

    // Ensure we have exactly 3 captions
    while (captions.length < 3) {
      captions.push(captions[captions.length - 1] || 'No caption generated');
    }

    return captions.slice(0, 3);
  }

  private calculateCost(usage: any): number {
    // Groq pricing (approximate)
    const costPerToken = 0.0000005; // $0.50 per 1M tokens
    const totalTokens = usage?.total_tokens || 300;
    return totalTokens * costPerToken;
  }
}

class GroqAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'GroqAPIError';
  }
}
