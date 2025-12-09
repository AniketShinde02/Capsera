// 🚀 OPENROUTER CONFIGURATION (Free Tier Compatible)
import { genkit } from 'genkit';
import { openAI } from 'genkitx-openai';

const openRouterKey = process.env.OPENROUTER_API_KEY;

if (!openRouterKey) {
  console.error('❌ OPENROUTER_API_KEY is missing! Please set it in your .env file.');
} else {
  console.log(`✅ Genkit initialized with OpenRouter key (ending in ...${openRouterKey?.slice(-4)})`);
}

// NOTE: We don't use this directly in route.ts anymore for better control (we use direct fetch there)
// But we keep this valid for other parts of the app that might use Genkit
export const ai = genkit({
  plugins: [
    openAI({
      apiKey: openRouterKey,
      baseURL: 'https://openrouter.ai/api/v1',
    }),
  ],
  model: 'openai/google/gemini-2.0-flash-exp:free', // 🎁 The Free High-Speed Model
});

// Export a function to check if AI is properly configured
export function isAIConfigured(): boolean {
  return !!process.env.OPENROUTER_API_KEY;
}
