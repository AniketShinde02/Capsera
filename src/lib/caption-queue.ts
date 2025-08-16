import { performanceMonitor } from './performance-monitor'

interface CaptionRequest {
  id: string
  imageUrl: string
  mood: string
  userId?: string
  priority: 'low' | 'normal' | 'high'
  retryCount: number
  maxRetries: number
  createdAt: Date
  expiresAt: Date
}

interface CaptionResponse {
  success: boolean
  caption?: string
  error?: string
  processingTime: number
}

class CaptionQueue {
  private queue: CaptionRequest[] = []
  private processing: Set<string> = new Set()
  private readonly MAX_CONCURRENT = 5
  private readonly MAX_QUEUE_SIZE = 100
  private readonly REQUEST_TIMEOUT = 30000 // 30 seconds
  private readonly RETRY_DELAYS = [1000, 2000, 5000, 10000, 30000] // Exponential backoff

  constructor() {
    // Start processing queue
    this.startProcessing()
  }

  // Add caption request to queue
  async addToQueue(
    imageUrl: string, 
    mood: string, 
    userId?: string, 
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Promise<string> {
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      throw new Error('Queue is full. Please try again later.')
    }

    const request: CaptionRequest = {
      id: this.generateId(),
      imageUrl,
      mood,
      userId,
      priority,
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.REQUEST_TIMEOUT)
    }

    // Insert based on priority
    if (priority === 'high') {
      this.queue.unshift(request)
    } else if (priority === 'low') {
      this.queue.push(request)
    } else {
      // Insert normal priority after high priority items
      const highPriorityCount = this.queue.filter(r => r.priority === 'high').length
      this.queue.splice(highPriorityCount, 0, request)
    }

    console.log(`📝 Added caption request to queue: ${request.id} (Priority: ${priority})`)
    return request.id
  }

  // Process queue items
  private async startProcessing() {
    setInterval(async () => {
      await this.processNextItem()
    }, 100) // Check every 100ms
  }

  private async processNextItem() {
    // Skip if at max concurrent or no items
    if (this.processing.size >= this.MAX_CONCURRENT || this.queue.length === 0) {
      return
    }

    // Get next item (prioritized)
    const request = this.queue.shift()
    if (!request) return

    // Check if expired
    if (request.expiresAt < new Date()) {
      console.log(`⏰ Request expired: ${request.id}`)
      return
    }

    // Mark as processing
    this.processing.add(request.id)

    try {
      console.log(`🔄 Processing caption request: ${request.id}`)
      const startTime = Date.now()

      // Process the caption request
      const result = await this.processCaptionRequest(request)
      const processingTime = Date.now() - startTime

      // Track performance
      performanceMonitor.trackApiCall(
        'caption-generation',
        processingTime,
        result.success ? 200 : 500,
        request.userId,
        result.error
      )

      if (result.success) {
        console.log(`✅ Caption generated successfully: ${request.id} (${processingTime}ms)`)
      } else {
        console.log(`❌ Caption generation failed: ${request.id} - ${result.error}`)
        
        // Retry logic
        if (request.retryCount < request.maxRetries) {
          await this.retryRequest(request)
        } else {
          console.log(`💀 Max retries exceeded for request: ${request.id}`)
        }
      }

    } catch (error) {
      console.error(`💥 Error processing request ${request.id}:`, error)
      
      // Retry logic
      if (request.retryCount < request.maxRetries) {
        await this.retryRequest(request)
      }
    } finally {
      // Remove from processing
      this.processing.delete(request.id)
    }
  }

  // Process individual caption request
  private async processCaptionRequest(request: CaptionRequest): Promise<CaptionResponse> {
    const startTime = Date.now()

    try {
      // Simulate API call to Gemini (replace with actual implementation)
      const caption = await this.callGeminiAPI(request.imageUrl, request.mood)
      
      return {
        success: true,
        caption,
        processingTime: Date.now() - startTime
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      // Check for quota errors
      if (errorMessage.includes('quota') || errorMessage.includes('quota exceeded')) {
        await performanceMonitor.trackGeminiQuotaError('caption-generation', errorMessage)
      }

      return {
        success: false,
        error: errorMessage,
        processingTime: Date.now() - startTime
      }
    }
  }

  // Call Gemini API with retry logic
  private async callGeminiAPI(imageUrl: string, mood: string): Promise<string> {
    // This would be your actual Gemini API call
    // For now, simulate the API call
    return new Promise((resolve, reject) => {
      const delay = Math.random() * 2000 + 500 // 500ms to 2.5s
      
      setTimeout(() => {
        // Simulate occasional failures
        if (Math.random() < 0.1) { // 10% failure rate
          reject(new Error('Simulated API failure'))
        } else {
          resolve(`Generated ${mood} caption for your amazing image! ✨`)
        }
      }, delay)
    })
  }

  // Retry failed request with exponential backoff
  private async retryRequest(request: CaptionRequest) {
    request.retryCount++
    const delay = this.RETRY_DELAYS[Math.min(request.retryCount - 1, this.RETRY_DELAYS.length - 1)]
    
    console.log(`🔄 Retrying request ${request.id} (Attempt ${request.retryCount}/${request.maxRetries}) in ${delay}ms`)
    
    // Add back to queue with delay
    setTimeout(() => {
      this.queue.unshift(request) // High priority for retries
    }, delay)
  }

  // Get queue status
  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing.size,
      maxConcurrent: this.MAX_CONCURRENT,
      maxQueueSize: this.MAX_QUEUE_SIZE,
      avgWaitTime: this.calculateAverageWaitTime()
    }
  }

  // Calculate average wait time
  private calculateAverageWaitTime(): number {
    if (this.queue.length === 0) return 0
    
    const now = new Date()
    const totalWaitTime = this.queue.reduce((sum, request) => {
      return sum + (now.getTime() - request.createdAt.getTime())
    }, 0)
    
    return Math.round(totalWaitTime / this.queue.length)
  }

  // Generate unique ID
  private generateId(): string {
    return `caption_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Clear expired requests
  clearExpiredRequests() {
    const now = new Date()
    const initialLength = this.queue.length
    
    this.queue = this.queue.filter(request => request.expiresAt > now)
    
    const clearedCount = initialLength - this.queue.length
    if (clearedCount > 0) {
      console.log(`🧹 Cleared ${clearedCount} expired requests`)
    }
  }

  // Emergency queue clear (for maintenance)
  clearQueue() {
    const clearedCount = this.queue.length
    this.queue = []
    this.processing.clear()
    console.log(`🚨 Emergency queue clear: ${clearedCount} requests cleared`)
  }
}

// Export singleton instance
export const captionQueue = new CaptionQueue()

// Clean up expired requests every minute
setInterval(() => {
  captionQueue.clearExpiredRequests()
}, 60 * 1000)

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Shutting down caption queue gracefully...')
  // Process remaining items before shutdown
  setTimeout(() => {
    process.exit(0)
  }, 5000)
})
