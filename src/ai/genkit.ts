import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { getNextGeminiKey } from '@/lib/gemini-keys';

// Get the first available Gemini API key for Genkit initialization
const geminiKey = getNextGeminiKey();

if (!geminiKey) {
  console.error('❌ No available Gemini API keys! All keys may be rate limited.');
  console.error('Please check your GEMINI_API_KEY_1 through GEMINI_API_KEY_4 environment variables');
} else {
  console.log(`✅ Genkit initialized with Gemini key (length: ${geminiKey.length})`);
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: geminiKey || 'missing-api-key',
    })
  ],
  model: 'googleai/gemini-2.0-flash-exp',
});

// Export a function to check if AI is properly configured
export function isAIConfigured(): boolean {
  try {
    const key = getNextGeminiKey();
    return !!key;
  } catch {
    return false;
  }
}
