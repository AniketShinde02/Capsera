/**
 * Multi-Provider AI System - Core Types & Interfaces
 * Follows the same robust patterns as SmartGeminiManager
 */

export interface AIProviderConfig {
  name: string;
  priority: number; // Lower number = higher priority
  maxRequestsPerMinute: number;
  maxRequestsPerDay: number;
  costPerRequest: number; // In USD
  averageResponseTime: number; // In milliseconds
  isEnabled: boolean;
  healthCheckEndpoint?: string;
  rateLimitHeaders?: string[];
  retryAfterHeader?: string;
}

export interface AIProviderStatus {
  name: string;
  isAvailable: boolean;
  isHealthy: boolean;
  lastCheck: Date;
  lastError?: string;
  retryAfter?: Date;
  requestsThisMinute: number;
  requestsToday: number;
  averageResponseTime: number;
  successRate: number; // Percentage
  totalRequests: number;
  totalErrors: number;
}

export interface AIProviderResponse {
  success: boolean;
  captions?: string[];
  error?: string;
  provider: string;
  processingTime: number;
  cost: number;
  cached?: boolean;
}

export interface AIProviderRequest {
  imageUrl: string;
  mood: string;
  description?: string;
  userId?: string;
  ipAddress?: string;
  maxRetries?: number;
  timeout?: number;
}

export interface ProviderHealthCheck {
  provider: string;
  isHealthy: boolean;
  responseTime: number;
  error?: string;
  timestamp: Date;
}

export interface LoadBalancingConfig {
  strategy: 'round_robin' | 'weighted' | 'least_connections' | 'fastest_response';
  weights?: Record<string, number>; // For weighted strategy
  healthCheckInterval: number; // In milliseconds
  circuitBreakerThreshold: number; // Number of consecutive failures
  circuitBreakerTimeout: number; // In milliseconds
}

export interface MultiProviderConfig {
  providers: AIProviderConfig[];
  loadBalancing: LoadBalancingConfig;
  fallbackChain: string[]; // Provider names in fallback order
  globalTimeout: number; // In milliseconds
  maxConcurrentRequests: number;
  enableCaching: boolean;
  enableMetrics: boolean;
}

// Provider-specific configurations
export interface GeminiConfig extends AIProviderConfig {
  name: 'gemini';
  apiKeys: string[];
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface GroqConfig extends AIProviderConfig {
  name: 'groq';
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface HuggingFaceConfig extends AIProviderConfig {
  name: 'huggingface';
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  endpoint: string;
}

export type ProviderConfig = GeminiConfig | GroqConfig | HuggingFaceConfig;

// Error types
export class AIProviderError extends Error {
  constructor(
    message: string,
    public provider: string,
    public code: string,
    public retryable: boolean = false,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}

export class RateLimitError extends AIProviderError {
  constructor(provider: string, retryAfter?: number) {
    super(`Rate limit exceeded for ${provider}`, provider, 'RATE_LIMIT', true, retryAfter);
  }
}

export class QuotaExceededError extends AIProviderError {
  constructor(provider: string) {
    super(`Quota exceeded for ${provider}`, provider, 'QUOTA_EXCEEDED', true);
  }
}

export class ProviderUnavailableError extends AIProviderError {
  constructor(provider: string) {
    super(`Provider ${provider} is unavailable`, provider, 'PROVIDER_UNAVAILABLE', true);
  }
}
