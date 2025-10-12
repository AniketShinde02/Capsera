/**
 * Hugging Face Inference API Provider Implementation
 * Fallback provider for when Groq/Gemini are unavailable
 */

import { BaseAIProvider } from './base-provider';
import { HuggingFaceConfig, AIProviderRequest, AIProviderResponse, AIProviderError } from './types';

export class HuggingFaceProvider extends BaseAIProvider {
  private apiKey: string;
  private model: string;
  private endpoint: string;
  private customModelEndpoint: string; // Your custom model endpoint

  constructor(config: HuggingFaceConfig) {
    super(config);
    this.apiKey = config.apiKey;
    this.model = config.model || 'microsoft/DialoGPT-medium';
    this.endpoint = config.endpoint || 'https://api-inference.huggingface.co/models';
    
    // Your custom model endpoint (replace with your actual space URL)
    this.customModelEndpoint = process.env.HUGGINGFACE_CUSTOM_MODEL_ENDPOINT || 
                              'https://your-username-capsera-caption-model.hf.space';

    if (!this.apiKey) {
      throw new Error('Hugging Face API key is required');
    }

    console.log(`🤗 Hugging Face provider initialized with model: ${this.model}`);
    if (this.customModelEndpoint.includes('your-username')) {
      console.log(`⚠️ Custom model endpoint not configured. Using default model.`);
    } else {
      console.log(`🚀 Custom model endpoint configured: ${this.customModelEndpoint}`);
    }
  }

  async generateCaptions(request: AIProviderRequest): Promise<AIProviderResponse> {
    const startTime = Date.now();

    return this.makeRequest(async () => {
      console.log(`🤗 Generating captions with Hugging Face...`);

      // Try custom model first, fallback to generic model
      const useCustomModel = !this.customModelEndpoint.includes('your-username');
      
      if (useCustomModel) {
        console.log(`🚀 Using custom Capsera model: ${this.customModelEndpoint}`);
        
        const response = await fetch(`${this.customModelEndpoint}/api/predict`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: [
              request.imageUrl,
              request.mood,
              request.description || ''
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const captions = this.extractCaptionsFromCustomModel(data);
          
          const processingTime = Date.now() - startTime;
          console.log(`✅ Custom model captions generated in ${processingTime}ms`);

          return {
            success: true,
            captions,
            provider: this.config.name,
            processingTime,
            cost: 0, // Free hosting
            cached: false
          };
        } else {
          console.log(`⚠️ Custom model failed, falling back to generic model`);
        }
      }

      // Fallback to generic Hugging Face model
      console.log(`🔄 Using generic Hugging Face model: ${this.model}`);
      const prompt = this.buildPrompt(request.mood, request.description);

      const response = await fetch(`${this.endpoint}/${this.model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.7,
            do_sample: true,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new HuggingFaceAPIError(
          `Hugging Face API error: ${response.status} ${response.statusText}`,
          response.status,
          errorData
        );
      }

      const data = await response.json();
      const captions = this.extractCaptions(data[0]?.generated_text || '');

      const processingTime = Date.now() - startTime;
      const cost = this.calculateCost(data);

      console.log(`✅ Hugging Face captions generated in ${processingTime}ms`);

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
      const response = await fetch(`${this.endpoint}/${this.model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: 'Health check',
          parameters: { max_new_tokens: 1 }
        })
      });

      return response.ok || response.status === 503; // 503 means model is loading
    } catch (error) {
      console.error('Hugging Face health check failed:', error);
      return false;
    }
  }

  getProviderSpecificError(error: any): AIProviderError {
    if (error instanceof HuggingFaceAPIError) {
      switch (error.status) {
        case 429:
          return new AIProviderError(
            `Hugging Face rate limit exceeded`,
            'huggingface',
            'RATE_LIMIT',
            true,
            this.extractRetryAfter(error)
          );
        case 401:
          return new AIProviderError(
            `Hugging Face API key invalid`,
            'huggingface',
            'AUTH_ERROR',
            false
          );
        case 503:
          return new AIProviderError(
            `Hugging Face model is loading`,
            'huggingface',
            'MODEL_LOADING',
            true,
            30000 // Wait 30 seconds
          );
        case 422:
          return new AIProviderError(
            `Hugging Face model error`,
            'huggingface',
            'MODEL_ERROR',
            true
          );
        default:
          return new AIProviderError(
            `Hugging Face API error: ${error.message}`,
            'huggingface',
            'API_ERROR',
            error.status >= 500
          );
      }
    }

    return new AIProviderError(
      `Hugging Face error: ${error.message}`,
      'huggingface',
      'UNKNOWN_ERROR',
      true
    );
  }

  private buildPrompt(mood: string, description?: string): string {
    const moodDescriptions = {
      'professional': 'corporate and business-focused',
      'casual': 'relaxed and friendly',
      'creative': 'artistic and imaginative',
      'humorous': 'funny and entertaining',
      'inspirational': 'motivational and uplifting',
      'minimalist': 'clean and simple'
    };

    const moodDesc = moodDescriptions[mood as keyof typeof moodDescriptions] || mood;

    return `Generate a social media caption for an image with a ${moodDesc} mood.${
      description ? ` Image description: ${description}` : ''
    } Make it engaging, 10-25 words, include hashtags. Caption:`;
  }

  private extractCaptions(content: string): string[] {
    // Hugging Face typically returns one caption, so we generate variations
    const baseCaption = content.trim();
    
    if (!baseCaption) {
      return [
        'Amazing moment captured! ✨ #photography #life',
        'Perfect shot! 📸 #memories #beautiful',
        'Incredible view! 🌟 #nature #wonder'
      ];
    }

    // Create 3 variations of the base caption
    const captions = [baseCaption];
    
    // Variation 1: Add emoji
    const withEmoji = baseCaption + ' ✨';
    if (withEmoji !== baseCaption) {
      captions.push(withEmoji);
    }

    // Variation 2: Change hashtags
    const withDifferentHashtags = baseCaption.replace(/#\w+/g, '').trim() + ' #amazing #love';
    if (withDifferentHashtags !== baseCaption) {
      captions.push(withDifferentHashtags);
    }

    // Ensure we have exactly 3 captions
    while (captions.length < 3) {
      captions.push(captions[captions.length - 1] || 'Beautiful moment! 📸 #photography #life');
    }

    return captions.slice(0, 3);
  }

  private extractCaptionsFromCustomModel(data: any): string[] {
    // Extract captions from your custom model response
    try {
      // Your custom model should return data in this format:
      // { data: ["caption1", "caption2", "caption3"] }
      if (data.data && Array.isArray(data.data)) {
        const captions = data.data.slice(0, 3); // Take first 3 captions
        if (captions.length > 0) {
          return captions;
        }
      }
      
      // Fallback: try to extract from text response
      if (data.data && typeof data.data === 'string') {
        const text = data.data;
        const lines = text.split('\n').filter(line => line.trim());
        return lines.slice(0, 3);
      }
      
      // If no valid response, return default captions
      console.warn('⚠️ Custom model returned unexpected format, using fallback captions');
      return [
        'Amazing moment captured! ✨ #photography #life',
        'Perfect shot! 📸 #memories #beautiful', 
        'Incredible view! 🌟 #nature #wonder'
      ];
    } catch (error) {
      console.error('❌ Error extracting captions from custom model:', error);
      return [
        'Beautiful moment! 📸 #photography #life',
        'Great shot! ✨ #memories #amazing',
        'Wonderful view! 🌟 #nature #love'
      ];
    }
  }

  private calculateCost(usage: any): number {
    // Hugging Face pricing (approximate for free tier)
    return 0; // Free tier
  }
}

class HuggingFaceAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'HuggingFaceAPIError';
  }
}
