/**
 * Multi-Provider AI Manager
 * The central brain that manages all AI providers with intelligent routing
 * Follows the same robust patterns as SmartGeminiManager
 */

import { 
  MultiProviderConfig, 
  AIProviderRequest, 
  AIProviderResponse, 
  AIProviderStatus,
  ProviderHealthCheck,
  LoadBalancingConfig,
  AIProviderError
} from './types';
import { BaseAIProvider } from './base-provider';
import { GeminiProvider } from './gemini-provider';
import { GroqProvider } from './groq-provider';
import { HuggingFaceProvider } from './huggingface-provider';
import { GeminiConfig, GroqConfig, HuggingFaceConfig } from './types';

export class MultiProviderManager {
  private providers: Map<string, BaseAIProvider> = new Map();
  private config: MultiProviderConfig;
  private healthChecks: Map<string, ProviderHealthCheck> = new Map();
  private requestHistory: Array<{ provider: string; success: boolean; responseTime: number; timestamp: Date }> = [];
  private circuitBreakers: Map<string, { failures: number; lastFailure: Date; isOpen: boolean }> = new Map();

  constructor(config: MultiProviderConfig) {
    this.config = config;
    this.initializeProviders();
    this.startHealthMonitoring();
    this.initializeCircuitBreakers();
    
    console.log(`🎯 Multi-Provider Manager initialized with ${this.providers.size} providers`);
  }

  private initializeProviders(): void {
    for (const providerConfig of this.config.providers) {
      try {
        let provider: BaseAIProvider;

        switch (providerConfig.name) {
          case 'gemini':
            provider = new GeminiProvider(providerConfig as GeminiConfig);
            break;
          case 'groq':
            provider = new GroqProvider(providerConfig as GroqConfig);
            break;
          case 'huggingface':
            provider = new HuggingFaceProvider(providerConfig as HuggingFaceConfig);
            break;
          default:
            console.warn(`⚠️ Unknown provider: ${providerConfig.name}`);
            continue;
        }

        this.providers.set(providerConfig.name, provider);
        console.log(`✅ ${providerConfig.name} provider initialized`);
      } catch (error) {
        console.error(`❌ Failed to initialize ${providerConfig.name} provider:`, error);
      }
    }
  }

  private initializeCircuitBreakers(): void {
    for (const providerName of this.providers.keys()) {
      this.circuitBreakers.set(providerName, {
        failures: 0,
        lastFailure: new Date(0),
        isOpen: false
      });
    }
  }

  private startHealthMonitoring(): void {
    // Health check every 2 minutes (less frequent to reduce noise)
    setInterval(async () => {
      await this.performHealthChecks();
    }, 120000);

    // Cleanup old request history every 5 minutes
    setInterval(() => {
      this.cleanupRequestHistory();
    }, 300000);
  }

  private async performHealthChecks(): Promise<void> {
    const healthCheckPromises = Array.from(this.providers.entries()).map(async ([name, provider]) => {
      const startTime = Date.now();
      try {
        const isHealthy = await provider.checkHealth();
        const responseTime = Date.now() - startTime;
        
        this.healthChecks.set(name, {
          provider: name,
          isHealthy,
          responseTime,
          timestamp: new Date()
        });

        // Reset circuit breaker on successful health check
        if (isHealthy) {
          const breaker = this.circuitBreakers.get(name);
          if (breaker) {
            breaker.failures = 0;
            breaker.isOpen = false;
          }
        }
      } catch (error) {
        this.healthChecks.set(name, {
          provider: name,
          isHealthy: false,
          responseTime: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        });
      }
    });

    await Promise.allSettled(healthCheckPromises);
  }

  private cleanupRequestHistory(): void {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // Keep 24 hours
    this.requestHistory = this.requestHistory.filter(entry => entry.timestamp > cutoff);
  }

  public async generateCaptions(request: AIProviderRequest): Promise<AIProviderResponse> {
    const startTime = Date.now();
    let lastError: AIProviderError | null = null;

    // Get available providers in priority order
    const availableProviders = this.getAvailableProviders();

    if (availableProviders.length === 0) {
      throw new AIProviderError(
        'No AI providers available',
        'system',
        'NO_PROVIDERS_AVAILABLE',
        false
      );
    }

    console.log(`🎯 Routing request to ${availableProviders.length} available providers`);

    // Try providers in order of priority
    for (const providerName of availableProviders) {
      try {
        const provider = this.providers.get(providerName);
        if (!provider) continue;

        console.log(`🔄 Attempting ${providerName} provider...`);

        const result = await provider.generateCaptions(request);
        
        // Record successful request
        this.recordRequest(providerName, true, Date.now() - startTime);
        
        console.log(`✅ Success with ${providerName} in ${result.processingTime}ms`);
        return result;

      } catch (error) {
        console.error(`❌ ${providerName} failed:`, error);
        
        lastError = error instanceof AIProviderError ? error : new AIProviderError(
          error instanceof Error ? error.message : 'Unknown error',
          providerName,
          'UNKNOWN_ERROR',
          true
        );

        // Record failed request
        this.recordRequest(providerName, false, Date.now() - startTime);
        
        // Update circuit breaker
        this.updateCircuitBreaker(providerName, false);

        // If this is a non-retryable error, stop trying
        if (!lastError.retryable) {
          break;
        }
      }
    }

    // All providers failed
    throw lastError || new AIProviderError(
      'All AI providers failed',
      'system',
      'ALL_PROVIDERS_FAILED',
      false
    );
  }

  private getAvailableProviders(): string[] {
    const available: string[] = [];

    for (const [name, provider] of this.providers) {
      const config = provider.getConfig();
      
      // Skip if disabled
      if (!config.isEnabled) continue;

      // Skip if circuit breaker is open
      const breaker = this.circuitBreakers.get(name);
      if (breaker?.isOpen) {
        // Check if we should try to close the circuit breaker
        const timeSinceLastFailure = Date.now() - breaker.lastFailure.getTime();
        if (timeSinceLastFailure > this.config.loadBalancing.circuitBreakerTimeout) {
          breaker.isOpen = false;
          breaker.failures = 0;
          console.log(`🔄 Circuit breaker for ${name} closed`);
        } else {
          continue;
        }
      }

      // Skip if provider is not available
      if (!provider.isAvailable()) continue;

      available.push(name);
    }

    // Sort by priority and load balancing strategy
    return this.sortProvidersByStrategy(available);
  }

  private sortProvidersByStrategy(providers: string[]): string[] {
    const strategy = this.config.loadBalancing.strategy;

    switch (strategy) {
      case 'round_robin':
        return this.roundRobinSort(providers);
      
      case 'weighted':
        return this.weightedSort(providers);
      
      case 'least_connections':
        return this.leastConnectionsSort(providers);
      
      case 'fastest_response':
        return this.fastestResponseSort(providers);
      
      default:
        // Default to priority-based sorting
        return providers.sort((a, b) => {
          const providerA = this.providers.get(a);
          const providerB = this.providers.get(b);
          return (providerA?.getPriority() || 999) - (providerB?.getPriority() || 999);
        });
    }
  }

  private roundRobinSort(providers: string[]): string[] {
    // Simple round-robin implementation
    const sorted = [...providers];
    const first = sorted.shift();
    if (first) sorted.push(first);
    return sorted;
  }

  private weightedSort(providers: string[]): string[] {
    const weights = this.config.loadBalancing.weights || {};
    
    return providers.sort((a, b) => {
      const weightA = weights[a] || 1;
      const weightB = weights[b] || 1;
      return weightB - weightA; // Higher weight first
    });
  }

  private leastConnectionsSort(providers: string[]): string[] {
    return providers.sort((a, b) => {
      const requestsA = this.requestHistory.filter(r => r.provider === a).length;
      const requestsB = this.requestHistory.filter(r => r.provider === b).length;
      return requestsA - requestsB;
    });
  }

  private fastestResponseSort(providers: string[]): string[] {
    return providers.sort((a, b) => {
      const providerA = this.providers.get(a);
      const providerB = this.providers.get(b);
      return (providerA?.getAverageResponseTime() || 999999) - (providerB?.getAverageResponseTime() || 999999);
    });
  }

  private recordRequest(provider: string, success: boolean, responseTime: number): void {
    this.requestHistory.push({
      provider,
      success,
      responseTime,
      timestamp: new Date()
    });
  }

  private updateCircuitBreaker(provider: string, success: boolean): void {
    const breaker = this.circuitBreakers.get(provider);
    if (!breaker) return;

    if (success) {
      breaker.failures = 0;
      breaker.isOpen = false;
    } else {
      breaker.failures++;
      breaker.lastFailure = new Date();
      
      if (breaker.failures >= this.config.loadBalancing.circuitBreakerThreshold) {
        breaker.isOpen = true;
        console.log(`🔴 Circuit breaker opened for ${provider} (${breaker.failures} failures)`);
      }
    }
  }

  // Public methods for monitoring and management
  public getProviderStatus(): Map<string, AIProviderStatus> {
    const statusMap = new Map<string, AIProviderStatus>();
    
    for (const [name, provider] of this.providers) {
      statusMap.set(name, provider.getStatus());
    }
    
    return statusMap;
  }

  public getHealthChecks(): Map<string, ProviderHealthCheck> {
    return new Map(this.healthChecks);
  }

  public getRequestHistory(): Array<{ provider: string; success: boolean; responseTime: number; timestamp: Date }> {
    return [...this.requestHistory];
  }

  public getCircuitBreakerStatus(): Map<string, { failures: number; lastFailure: Date; isOpen: boolean }> {
    return new Map(this.circuitBreakers);
  }

  public resetProvider(providerName: string): void {
    const provider = this.providers.get(providerName);
    if (provider) {
      provider.reset();
    }
    
    const breaker = this.circuitBreakers.get(providerName);
    if (breaker) {
      breaker.failures = 0;
      breaker.isOpen = false;
    }
    
    console.log(`🔄 Reset ${providerName} provider`);
  }

  public getProviderStats(): any {
    const stats: any = {};
    
    for (const [name, provider] of this.providers) {
      const status = provider.getStatus();
      const recentRequests = this.requestHistory
        .filter(r => r.provider === name && r.timestamp > new Date(Date.now() - 60 * 60 * 1000)) // Last hour
        .length;
      
      stats[name] = {
        status,
        recentRequests,
        circuitBreaker: this.circuitBreakers.get(name),
        healthCheck: this.healthChecks.get(name)
      };
    }
    
    return stats;
  }
}
