/**
 * Base AI Provider Class
 * Provides common functionality for all AI providers
 */

import { AIProviderConfig, AIProviderStatus, AIProviderRequest, AIProviderResponse, AIProviderError } from './types';

export abstract class BaseAIProvider {
  protected config: AIProviderConfig;
  protected status: AIProviderStatus;
  protected requestCounts: Map<string, number> = new Map();
  protected errorCounts: Map<string, number> = new Map();
  protected responseTimes: number[] = [];
  protected lastRequestTime: Date = new Date();

  constructor(config: AIProviderConfig) {
    this.config = config;
    this.status = {
      name: config.name,
      isAvailable: true,
      isHealthy: true,
      lastCheck: new Date(),
      requestsThisMinute: 0,
      requestsToday: 0,
      averageResponseTime: config.averageResponseTime,
      successRate: 100,
      totalRequests: 0,
      totalErrors: 0
    };

    // Start periodic health checks
    this.startHealthChecks();
  }

  // Abstract methods that must be implemented by each provider
  abstract generateCaptions(request: AIProviderRequest): Promise<AIProviderResponse>;
  abstract checkHealth(): Promise<boolean>;
  abstract getProviderSpecificError(error: any): AIProviderError;

  // Common functionality
  protected async makeRequest<T>(
    requestFn: () => Promise<T>,
    request: AIProviderRequest
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      // Check rate limits
      if (!this.canMakeRequest()) {
        throw new AIProviderError(
          `Rate limit exceeded for ${this.config.name}`,
          this.config.name,
          'RATE_LIMIT',
          true
        );
      }

      // Make the actual request
      const result = await Promise.race([
        requestFn(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new AIProviderError(
            `Request timeout for ${this.config.name}`,
            this.config.name,
            'TIMEOUT',
            true
          )), request.timeout || 30000)
        )
      ]);

      // Update metrics
      this.updateMetrics(startTime, true);
      return result;

    } catch (error) {
      this.updateMetrics(startTime, false);
      throw this.handleError(error);
    }
  }

  protected canMakeRequest(): boolean {
    const now = new Date();
    const minuteKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;
    const dayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

    const requestsThisMinute = this.requestCounts.get(minuteKey) || 0;
    const requestsToday = this.requestCounts.get(dayKey) || 0;

    return (
      requestsThisMinute < this.config.maxRequestsPerMinute &&
      requestsToday < this.config.maxRequestsPerDay &&
      this.status.isAvailable &&
      this.status.isHealthy
    );
  }

  protected updateMetrics(startTime: number, success: boolean): void {
    const responseTime = Date.now() - startTime;
    const now = new Date();
    const minuteKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;
    const dayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

    // Update request counts
    this.requestCounts.set(minuteKey, (this.requestCounts.get(minuteKey) || 0) + 1);
    this.requestCounts.set(dayKey, (this.requestCounts.get(dayKey) || 0) + 1);

    // Update response times (keep last 100)
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }

    // Update status
    this.status.totalRequests++;
    this.status.averageResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
    
    if (!success) {
      this.status.totalErrors++;
      this.errorCounts.set(minuteKey, (this.errorCounts.get(minuteKey) || 0) + 1);
    }

    this.status.successRate = ((this.status.totalRequests - this.status.totalErrors) / this.status.totalRequests) * 100;
    this.status.lastCheck = now;
    this.lastRequestTime = now;

    // Clean up old request counts (keep last 24 hours)
    this.cleanupOldCounts();
  }

  protected handleError(error: any): AIProviderError {
    console.error(`❌ ${this.config.name} provider error:`, error);
    
    // Check for specific error types
    if (error.status === 429 || error.code === 'RATE_LIMIT') {
      return new AIProviderError(
        `Rate limit exceeded for ${this.config.name}`,
        this.config.name,
        'RATE_LIMIT',
        true,
        this.extractRetryAfter(error)
      );
    }

    if (error.status === 403 || error.code === 'QUOTA_EXCEEDED') {
      return new AIProviderError(
        `Quota exceeded for ${this.config.name}`,
        this.config.name,
        'QUOTA_EXCEEDED',
        true
      );
    }

    // Let each provider handle its specific errors
    return this.getProviderSpecificError(error);
  }

  protected extractRetryAfter(error: any): number | undefined {
    if (error.headers?.['retry-after']) {
      return parseInt(error.headers['retry-after']) * 1000;
    }
    if (error.retryAfter) {
      return error.retryAfter;
    }
    return undefined;
  }

  protected cleanupOldCounts(): void {
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    for (const [key] of this.requestCounts) {
      const keyTime = new Date(key.replace(/-/g, '/'));
      if (keyTime < cutoffTime) {
        this.requestCounts.delete(key);
        this.errorCounts.delete(key);
      }
    }
  }

  protected startHealthChecks(): void {
    setInterval(async () => {
      try {
        const isHealthy = await this.checkHealth();
        this.status.isHealthy = isHealthy;
        this.status.isAvailable = isHealthy;
        this.status.lastCheck = new Date();
      } catch (error) {
        console.error(`❌ Health check failed for ${this.config.name}:`, error);
        this.status.isHealthy = false;
        this.status.lastError = error instanceof Error ? error.message : 'Unknown error';
        this.status.lastCheck = new Date();
      }
    }, 60000); // Check every minute
  }

  // Public methods
  public getStatus(): AIProviderStatus {
    return { ...this.status };
  }

  public getConfig(): AIProviderConfig {
    return { ...this.config };
  }

  public isAvailable(): boolean {
    return this.status.isAvailable && this.status.isHealthy && this.canMakeRequest();
  }

  public getPriority(): number {
    return this.config.priority;
  }

  public getAverageResponseTime(): number {
    return this.status.averageResponseTime;
  }

  public getSuccessRate(): number {
    return this.status.successRate;
  }

  public reset(): void {
    this.requestCounts.clear();
    this.errorCounts.clear();
    this.responseTimes = [];
    this.status.totalRequests = 0;
    this.status.totalErrors = 0;
    this.status.successRate = 100;
    this.status.isAvailable = true;
    this.status.isHealthy = true;
    this.status.lastError = undefined;
    this.status.retryAfter = undefined;
  }
}
