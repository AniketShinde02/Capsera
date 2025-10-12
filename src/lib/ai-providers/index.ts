/**
 * Multi-Provider AI System - Main Export
 * Provides a unified interface for all AI providers
 */

import { MultiProviderManager } from './multi-provider-manager';
import { createMultiProviderConfig, validateProviderConfig } from './config';
import { AIProviderRequest, AIProviderResponse } from './types';

// Singleton instance
let multiProviderManager: MultiProviderManager | null = null;

export async function initializeMultiProviderSystem(): Promise<MultiProviderManager> {
  if (multiProviderManager) {
    return multiProviderManager;
  }

  console.log('🎯 Initializing Multi-Provider AI System...');

  // Validate configuration
  const validation = validateProviderConfig();
  if (!validation.isValid) {
    console.error('❌ Multi-Provider configuration validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    throw new Error(`Multi-Provider configuration invalid: ${validation.errors.join(', ')}`);
  }

  // Create configuration
  const config = createMultiProviderConfig();
  
  // Validate that we have at least one provider
  if (config.providers.length === 0) {
    throw new Error('No AI providers configured. Please set at least one API key.');
  }

  console.log(`✅ Found ${config.providers.length} configured providers:`, 
    config.providers.map(p => p.name).join(', ')
  );

  // Initialize manager
  multiProviderManager = new MultiProviderManager(config);
  
  console.log('🚀 Multi-Provider AI System initialized successfully');
  return multiProviderManager;
}

export async function generateCaptions(request: AIProviderRequest): Promise<AIProviderResponse> {
  if (!multiProviderManager) {
    await initializeMultiProviderSystem();
  }

  if (!multiProviderManager) {
    throw new Error('Failed to initialize Multi-Provider AI System');
  }

  return multiProviderManager.generateCaptions(request);
}

export function getMultiProviderManager(): MultiProviderManager | null {
  return multiProviderManager;
}

export function getProviderStatus() {
  if (!multiProviderManager) {
    return null;
  }
  
  return {
    providers: multiProviderManager.getProviderStatus(),
    healthChecks: multiProviderManager.getHealthChecks(),
    circuitBreakers: multiProviderManager.getCircuitBreakerStatus(),
    stats: multiProviderManager.getProviderStats()
  };
}

export function resetProvider(providerName: string) {
  if (multiProviderManager) {
    multiProviderManager.resetProvider(providerName);
  }
}

// Export types for external use
export type { AIProviderRequest, AIProviderResponse, MultiProviderConfig } from './types';

// Export individual providers for testing
export { GeminiProvider } from './gemini-provider';
export { GroqProvider } from './groq-provider';
export { HuggingFaceProvider } from './huggingface-provider';
export { BaseAIProvider } from './base-provider';

// Export configuration utilities
export { createMultiProviderConfig, validateProviderConfig, PROVIDER_MODELS, PROVIDER_PRICING } from './config';
