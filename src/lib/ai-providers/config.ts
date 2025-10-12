/**
 * Multi-Provider AI Configuration
 * Centralized configuration for all AI providers
 */

import { MultiProviderConfig, GeminiConfig, GroqConfig, HuggingFaceConfig } from './types';

export function createMultiProviderConfig(): MultiProviderConfig {
  // Gemini Configuration (existing system)
  const geminiConfig: GeminiConfig = {
    name: 'gemini',
    priority: 2, // Second priority (after Groq)
    maxRequestsPerMinute: 60,
    maxRequestsPerDay: 1500,
    costPerRequest: 0.001,
    averageResponseTime: 5000,
    isEnabled: true,
    apiKeys: [
      process.env.GEMINI_API_KEY_1,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
      process.env.GEMINI_API_KEY_4,
      process.env.GEMINI_API_KEY_5,
    ].filter(Boolean) as string[],
    model: 'gemini-1.5-flash',
    maxTokens: 1000,
    temperature: 0.7
  };

  // Groq Configuration (primary provider) - 2 keys for load balancing
  const groqConfig: GroqConfig = {
    name: 'groq',
    priority: 1, // Highest priority (fastest)
    maxRequestsPerMinute: 60, // 2 keys = 2x capacity
    maxRequestsPerDay: 28800, // 2 keys = 2x daily limit (14,400 x 2)
    costPerRequest: 0.0000005,
    averageResponseTime: 2000,
    isEnabled: !!(process.env.GROQ_API_KEY_1 || process.env.GROQ_API_KEY_2),
    apiKey: process.env.GROQ_API_KEY_1 || process.env.GROQ_API_KEY_2 || '', // Use first available key
    model: 'llama-3.1-8b-instant',
    maxTokens: 300,
    temperature: 0.7
  };

  // Hugging Face Configuration (fallback)
  const huggingFaceConfig: HuggingFaceConfig = {
    name: 'huggingface',
    priority: 3, // Lowest priority (fallback)
    maxRequestsPerMinute: 10,
    maxRequestsPerDay: 1000,
    costPerRequest: 0, // Free tier
    averageResponseTime: 8000,
    isEnabled: !!process.env.HUGGINGFACE_API_KEY,
    apiKey: process.env.HUGGINGFACE_API_KEY || '',
    model: 'microsoft/DialoGPT-medium',
    maxTokens: 150,
    temperature: 0.7,
    endpoint: 'https://api-inference.huggingface.co/models'
  };

  return {
    providers: [
      groqConfig,
      geminiConfig,
      huggingFaceConfig
    ].filter(provider => provider.isEnabled), // Only include enabled providers

    loadBalancing: {
      strategy: 'fastest_response', // Use fastest available provider
      weights: {
        groq: 70,      // 70% of requests to Groq (fastest)
        gemini: 25,    // 25% to Gemini (reliable)
        huggingface: 5 // 5% to Hugging Face (fallback)
      },
      healthCheckInterval: 30000, // 30 seconds
      circuitBreakerThreshold: 5, // Open circuit after 5 failures
      circuitBreakerTimeout: 60000 // Keep circuit open for 1 minute
    },

    fallbackChain: ['groq', 'gemini', 'huggingface'],
    globalTimeout: 30000, // 30 seconds
    maxConcurrentRequests: 10,
    enableCaching: true,
    enableMetrics: true
  };
}

// Environment validation
export function validateProviderConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if at least one provider is configured
  const hasGroq = !!(process.env.GROQ_API_KEY_1 || process.env.GROQ_API_KEY_2);
  const hasGemini = !!process.env.GEMINI_API_KEY_1;
  const hasHuggingFace = !!process.env.HUGGINGFACE_API_KEY;

  if (!hasGroq && !hasGemini && !hasHuggingFace) {
    errors.push('No AI providers configured. Please set at least one API key.');
  }

  // Validate Groq configuration
  if (hasGroq) {
    if (!process.env.GROQ_API_KEY_1 && !process.env.GROQ_API_KEY_2) {
      errors.push('GROQ_API_KEY_1 or GROQ_API_KEY_2 is required when using Groq provider');
    }
  }

  // Validate Gemini configuration
  if (hasGemini) {
    const geminiKeys = [
      process.env.GEMINI_API_KEY_1,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
      process.env.GEMINI_API_KEY_4,
      process.env.GEMINI_API_KEY_5,
    ].filter(Boolean);

    if (geminiKeys.length === 0) {
      errors.push('At least one GEMINI_API_KEY is required when using Gemini provider');
    }
  }

  // Validate Hugging Face configuration
  if (hasHuggingFace) {
    if (!process.env.HUGGINGFACE_API_KEY) {
      errors.push('HUGGINGFACE_API_KEY is required when using Hugging Face provider');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Provider-specific configurations
export const PROVIDER_MODELS = {
  groq: [
    'llama-3.1-8b-instant',
    'llama-3.3-70b-versatile',
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'deepseek-r1-distill-llama-70b'
  ],
  gemini: [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-1.0-pro'
  ],
  huggingface: [
    'microsoft/DialoGPT-medium',
    'microsoft/DialoGPT-large',
    'facebook/blenderbot-400M-distill',
    'gpt2'
  ]
};

export const PROVIDER_PRICING = {
  groq: {
    freeTier: {
      requestsPerDay: 14400,
      requestsPerMinute: 30
    },
    paidTier: {
      costPerToken: 0.0000005, // $0.50 per 1M tokens
      requestsPerDay: 'unlimited'
    }
  },
  gemini: {
    freeTier: {
      requestsPerDay: 1500,
      requestsPerMinute: 60
    },
    paidTier: {
      costPerRequest: 0.001,
      requestsPerDay: 'unlimited'
    }
  },
  huggingface: {
    freeTier: {
      requestsPerMonth: 1000,
      requestsPerMinute: 10
    },
    proTier: {
      requestsPerMonth: 30000,
      requestsPerMinute: 20
    }
  }
};
