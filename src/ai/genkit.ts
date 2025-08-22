import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { getNextGeminiKey } from '@/lib/gemini-keys';

// Lazy initialization to avoid module-level function calls
let aiInstance: any = null;

export function getAI() {
  if (!aiInstance) {
    try {
      const geminiKey = getNextGeminiKey();
      
      if (!geminiKey) {
        console.error('❌ No available Gemini API keys! All keys may be rate limited.');
        console.error('Please check your GEMINI_API_KEY_1 through GEMINI_API_KEY_4 environment variables');
        throw new Error('No Gemini API keys available');
      }
      
      console.log(`✅ Genkit initialized with Gemini key (length: ${geminiKey.length})`);
      
      aiInstance = genkit({
        plugins: [
          googleAI({
            apiKey: geminiKey,
          })
        ],
        model: 'googleai/gemini-2.0-flash-exp',
      });
    } catch (error) {
      console.error('❌ Failed to initialize Genkit:', error);
      // Return a mock AI instance for development
      aiInstance = {
        definePrompt: () => ({}),
        defineFlow: () => ({}),
        generate: async () => ({ text: 'AI not configured' })
      };
    }
  }
  return aiInstance;
}

// Export the AI instance getter
export const ai = {
  definePrompt: (...args: any[]) => getAI().definePrompt(...args),
  defineFlow: (...args: any[]) => getAI().defineFlow(...args),
  generate: async (...args: any[]) => getAI().generate(...args)
};

// Export a function to check if AI is properly configured
export function isAIConfigured(): boolean {
  try {
    const key = getNextGeminiKey();
    return !!key;
  } catch {
    return false;
  }
}
