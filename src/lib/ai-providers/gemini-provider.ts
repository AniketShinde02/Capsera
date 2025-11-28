/**
 * Gemini Provider Adapter
 * Wraps existing SmartGeminiManager to work with new multi-provider system
 */

import { BaseAIProvider } from './base-provider';
import { GeminiConfig, AIProviderRequest, AIProviderResponse, AIProviderError } from './types';
import { geminiManager } from '@/lib/smart-gemini-manager';
// import { generateCaptionsFlow } from '@/ai/flows/generate-caption';

export class GeminiProvider extends BaseAIProvider {
  private apiKeys: string[];
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(config: GeminiConfig) {
    super(config);
    this.apiKeys = config.apiKeys;
    this.model = config.model || 'gemini-1.5-flash';
    this.maxTokens = config.maxTokens || 1000;
    this.temperature = config.temperature || 0.7;

    if (!this.apiKeys || this.apiKeys.length === 0) {
      throw new Error('Gemini API keys are required');
    }

    console.log(`🔮 Gemini provider initialized with ${this.apiKeys.length} keys`);
  }

  async generateCaptions(request: AIProviderRequest): Promise<AIProviderResponse> {
    const startTime = Date.now();

    return this.makeRequest(async () => {
      console.log(`🔮 Generating captions with Gemini (${this.model})...`);

      try {
        // Use SmartGeminiManager directly
        const bestKey = geminiManager.getBestKey();
        if (!bestKey) {
          throw new Error('No Gemini API keys available');
        }

        // Build the prompt
        const prompt = this.buildPrompt(request);

        // Make direct API call to Gemini
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${bestKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              maxOutputTokens: this.maxTokens,
              temperature: this.temperature,
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Gemini API error: ${response.status} ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
          throw new Error('Invalid response from Gemini API');
        }

        const content = data.candidates[0].content.parts[0].text;
        const captions = this.extractCaptions(content);

        if (captions.length === 0) {
          throw new Error('No captions extracted from Gemini response');
        }

        const processingTime = Date.now() - startTime;
        const cost = this.calculateCost();

        console.log(`✅ Gemini captions generated in ${processingTime}ms`);

        return {
          success: true,
          captions,
          provider: this.config.name,
          processingTime,
          cost,
          cached: false
        };

      } catch (error) {
        console.error('Gemini generation error:', error);
        throw new GeminiAPIError(
          `Gemini generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          500,
          error
        );
      }
    }, request);
  }

  async checkHealth(): Promise<boolean> {
    try {
      // Use existing Gemini manager health check
      const keyResult = await geminiManager.getBestKey();
      return keyResult !== null;
    } catch (error) {
      console.error('Gemini health check failed:', error);
      return false;
    }
  }

  getProviderSpecificError(error: any): AIProviderError {
    if (error instanceof GeminiAPIError) {
      // Map Gemini-specific errors
      if (error.message.includes('quota') || error.message.includes('QUOTA_EXCEEDED')) {
        return new AIProviderError(
          `Gemini quota exceeded`,
          'gemini',
          'QUOTA_EXCEEDED',
          true
        );
      }

      if (error.message.includes('rate limit') || error.message.includes('RATE_LIMIT')) {
        return new AIProviderError(
          `Gemini rate limit exceeded`,
          'gemini',
          'RATE_LIMIT',
          true
        );
      }

      if (error.message.includes('API key') || error.message.includes('AUTH_ERROR')) {
        return new AIProviderError(
          `Gemini API key invalid`,
          'gemini',
          'AUTH_ERROR',
          false
        );
      }

      return new AIProviderError(
        `Gemini API error: ${error.message}`,
        'gemini',
        'API_ERROR',
        true
      );
    }

    // Handle generic errors
    if (error.message?.includes('quota')) {
      return new AIProviderError(
        `Gemini quota exceeded`,
        'gemini',
        'QUOTA_EXCEEDED',
        true
      );
    }

    if (error.message?.includes('rate limit')) {
      return new AIProviderError(
        `Gemini rate limit exceeded`,
        'gemini',
        'RATE_LIMIT',
        true
      );
    }

    return new AIProviderError(
      `Gemini error: ${error.message}`,
      'gemini',
      'UNKNOWN_ERROR',
      true
    );
  }

  private calculateCost(): number {
    // Gemini pricing (approximate)
    const costPerRequest = 0.001; // $0.001 per request
    return costPerRequest;
  }

  private buildPrompt(request: AIProviderRequest): string {
    return `Generate 3 unique social media captions for an image with a ${request.mood} mood.${request.description ? ` Image description: ${request.description}` : ''
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
      captions.push(captions[captions.length - 1] || 'Great moment captured! 📸');
    }

    return captions.slice(0, 3);
  }

  // Override to use Gemini manager for key selection
  protected canMakeRequest(): boolean {
    // Check if we can get a key from Gemini manager
    try {
      const status = geminiManager.getStatus();
      return status.available > 0 && super.canMakeRequest();
    } catch (error) {
      console.error('Error checking Gemini availability:', error);
      return false;
    }
  }
}

class GeminiAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'GeminiAPIError';
  }
}
