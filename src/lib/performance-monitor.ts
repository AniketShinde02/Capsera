import { getEmailService } from './email-service'

interface PerformanceMetrics {
  endpoint: string
  responseTime: number
  statusCode: number
  timestamp: Date
  userId?: string
  error?: string
}

interface SystemHealth {
  cpu: number
  memory: number
  uptime: number
  activeConnections: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private readonly MAX_METRICS = 1000
  private readonly ALERT_THRESHOLD = 5000 // 5 seconds
  private readonly ERROR_ALERT_EMAIL = 'sunnyshinde2601@gmail.com'

  // Track API performance
  trackApiCall(endpoint: string, responseTime: number, statusCode: number, userId?: string, error?: string) {
    const metric: PerformanceMetrics = {
      endpoint,
      responseTime,
      statusCode,
      timestamp: new Date(),
      userId,
      error
    }

    this.metrics.push(metric)

    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS)
    }

    // Alert on slow responses
    if (responseTime > this.ALERT_THRESHOLD) {
      this.alertSlowResponse(endpoint, responseTime)
    }

    // Alert on errors
    if (error || statusCode >= 500) {
      this.alertError(endpoint, error || `HTTP ${statusCode}`, responseTime)
    }
  }

  // Track Gemini API quota issues
  async trackGeminiQuotaError(endpoint: string, error: string) {
    console.error(`🚨 Gemini API Quota Error: ${endpoint} - ${error}`)
    
    // Send immediate email alert
    try {
      const emailService = getEmailService()
      await emailService.sendEmail({
        to: this.ERROR_ALERT_EMAIL,
        subject: '🚨 URGENT: Gemini API Quota Exceeded',
        body: `Gemini API Quota Alert - Endpoint: ${endpoint}, Error: ${error}, Time: ${new Date().toISOString()}, Action Required: Please check and renew Gemini API quota immediately.`,
        html: `
          <h2>Gemini API Quota Alert</h2>
          <p><strong>Endpoint:</strong> ${endpoint}</p>
          <p><strong>Error:</strong> ${error}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p><strong>Action Required:</strong> Please check and renew Gemini API quota immediately.</p>
        `
      })
    } catch (emailError) {
      console.error('Failed to send quota alert email:', emailError)
    }
  }

  // Get performance statistics
  getPerformanceStats() {
    if (this.metrics.length === 0) return null

    const recentMetrics = this.metrics.filter(
      m => m.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    )

    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length
    const errorRate = recentMetrics.filter(m => m.error || m.statusCode >= 400).length / recentMetrics.length
    const totalRequests = recentMetrics.length

    return {
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: Math.round(errorRate * 100),
      totalRequests,
      lastUpdated: new Date().toISOString()
    }
  }

  // Get system health metrics
  async getSystemHealth(): Promise<SystemHealth> {
    const startTime = Date.now()
    
    // Simulate system metrics (in production, use actual system monitoring)
    const cpu = Math.random() * 30 + 10 // 10-40%
    const memory = Math.random() * 40 + 20 // 20-60%
    const uptime = process.uptime()
    const activeConnections = Math.random() * 50 + 10 // 10-60

    return {
      cpu: Math.round(cpu),
      memory: Math.round(memory),
      uptime: Math.round(uptime),
      activeConnections: Math.round(activeConnections)
    }
  }

  // Private methods for alerts
  private async alertSlowResponse(endpoint: string, responseTime: number) {
    console.warn(`🐌 Slow API Response: ${endpoint} took ${responseTime}ms`)
    
    if (responseTime > 10000) { // 10 seconds - critical
      try {
        const emailService = getEmailService()
        await emailService.sendEmail({
          to: this.ERROR_ALERT_EMAIL,
          subject: '⚠️ Slow API Response Alert',
          body: `Slow API Response Alert - Endpoint: ${endpoint}, Response Time: ${responseTime}ms, Time: ${new Date().toISOString()}, Action Required: Investigate performance degradation.`,
          html: `
            <h2>Slow API Response Alert</h2>
            <p><strong>Endpoint:</strong> ${endpoint}</p>
            <p><strong>Response Time:</strong> ${responseTime}ms</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            <p><strong>Action Required:</strong> Investigate performance degradation.</p>
          `
        })
      } catch (emailError) {
        console.error('Failed to send slow response alert:', emailError)
      }
    }
  }

  private async alertError(endpoint: string, error: string, responseTime: number) {
    console.error(`❌ API Error: ${endpoint} - ${error} (${responseTime}ms)`)
    
    try {
      const emailService = getEmailService()
      await emailService.sendEmail({
        to: this.ERROR_ALERT_EMAIL,
        subject: '❌ API Error Alert',
        body: `API Error Alert - Endpoint: ${endpoint}, Error: ${error}, Response Time: ${responseTime}ms, Time: ${new Date().toISOString()}, Action Required: Investigate and resolve API errors.`,
        html: `
          <h2>API Error Alert</h2>
          <p><strong>Endpoint:</strong> ${endpoint}</p>
          <p><strong>Error:</strong> ${error}</p>
          <p><strong>Response Time:</strong> ${responseTime}ms</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p><strong>Action Required:</strong> Investigate and resolve API errors.</p>
        `
      })
    } catch (emailError) {
      console.error('Failed to send error alert:', emailError)
    }
  }

  // Clear old metrics
  clearOldMetrics() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    this.metrics = this.metrics.filter(m => m.timestamp > oneWeekAgo)
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Clean up old metrics every hour
setInterval(() => {
  performanceMonitor.clearOldMetrics()
}, 60 * 60 * 1000)

// Performance tracking decorator
export function trackPerformance() {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now()
      let statusCode = 200
      let error: string | undefined

      try {
        const result = await method.apply(this, args)
        return result
      } catch (err) {
        error = err instanceof Error ? err.message : String(err)
        statusCode = 500
        throw err
      } finally {
        const responseTime = Date.now() - startTime
        performanceMonitor.trackApiCall(
          `${target.constructor.name}.${propertyName}`,
          responseTime,
          statusCode,
          undefined,
          error
        )
      }
    }

    return descriptor
  }
}
