export class SmartErrorHandler {
  private errorPatterns: Map<string, { count: number; lastSeen: Date; solutions: string[] }> = new Map();

  // SMART: Categorize errors and provide specific solutions
  categorizeError(error: Error, context: any): { category: string; userMessage: string; developerInfo: string; solution: string } {
    const errorMessage = error.message.toLowerCase();
    
    // Quota errors
    if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
      return {
        category: 'quota_exceeded',
        userMessage: 'You\'ve reached your daily limit! Sign up for a free account to get more captions.',
        developerInfo: `Quota exceeded for user ${context.userId || 'anonymous'}`,
        solution: 'Consider upgrading user limits or implementing better caching'
      };
    }
    
    // Network errors
    if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
      return {
        category: 'network_error',
        userMessage: 'Network issue detected. Please check your connection and try again.',
        developerInfo: `Network error: ${error.message}`,
        solution: 'Implement retry logic with exponential backoff'
      };
    }
    
    // Content safety errors
    if (errorMessage.includes('inappropriate') || errorMessage.includes('content')) {
      return {
        category: 'content_safety',
        userMessage: 'This image contains content that cannot be processed. Please try a different image.',
        developerInfo: `Content safety violation: ${error.message}`,
        solution: 'Review content safety thresholds'
      };
    }
    
    // Database errors
    if (errorMessage.includes('database') || errorMessage.includes('connection')) {
      return {
        category: 'database_error',
        userMessage: 'Service temporarily unavailable. Please try again in a few minutes.',
        developerInfo: `Database error: ${error.message}`,
        solution: 'Check database connection and implement connection pooling'
      };
    }
    
    // Default
    return {
      category: 'unknown_error',
      userMessage: 'Something went wrong. Please try again.',
      developerInfo: `Unknown error: ${error.message}`,
      solution: 'Investigate error pattern and implement specific handling'
    };
  }

  // SMART: Track error patterns to identify systemic issues
  trackError(error: Error, context: any) {
    const categorized = this.categorizeError(error, context);
    const pattern = `${categorized.category}:${error.message.substring(0, 50)}`;
    
    const existing = this.errorPatterns.get(pattern) || { count: 0, lastSeen: new Date(), solutions: [] };
    existing.count++;
    existing.lastSeen = new Date();
    existing.solutions.push(categorized.solution);
    
    this.errorPatterns.set(pattern, existing);
    
    // Alert on error spikes
    if (existing.count > 5) {
      console.warn(`🚨 Error spike detected: ${pattern} (${existing.count} occurrences)`);
    }
  }

  // SMART: Get actionable error insights
  getErrorInsights(): { critical: string[]; recommendations: string[] } {
    const critical: string[] = [];
    const recommendations: string[] = [];
    
    for (const [pattern, data] of this.errorPatterns.entries()) {
      if (data.count > 10) {
        critical.push(`${pattern}: ${data.count} occurrences`);
        recommendations.push(...data.solutions.slice(0, 2)); // Top 2 solutions
      }
    }
    
    return { critical, recommendations: [...new Set(recommendations)] };
  }
}

export const smartErrorHandler = new SmartErrorHandler();
