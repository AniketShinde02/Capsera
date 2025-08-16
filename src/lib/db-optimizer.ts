import mongoose from 'mongoose'
import { performanceMonitor } from './performance-monitor'

interface ConnectionStats {
  activeConnections: number
  maxConnections: number
  connectionUtilization: number
  avgQueryTime: number
  totalQueries: number
  slowQueries: number
}

class DatabaseOptimizer {
  private connectionPool: mongoose.Connection[] = []
  private readonly MAX_POOL_SIZE = 10
  private readonly MIN_POOL_SIZE = 2
  private queryMetrics: Array<{ query: string; executionTime: number; timestamp: Date }> = []
  private readonly SLOW_QUERY_THRESHOLD = 1000 // 1 second

  constructor() {
    this.initializeConnectionPool()
    this.setupQueryMonitoring()
    this.startHealthCheck()
  }

  // Initialize connection pool
  private async initializeConnectionPool() {
    try {
      // Create initial connections
      for (let i = 0; i < this.MIN_POOL_SIZE; i++) {
        await this.createConnection()
      }
      
      console.log(`🔗 Database connection pool initialized with ${this.MIN_POOL_SIZE} connections`)
    } catch (error) {
      console.error('❌ Failed to initialize connection pool:', error)
    }
  }

  // Create new database connection
  private async createConnection(): Promise<mongoose.Connection> {
    const connection = mongoose.createConnection(process.env.MONGODB_URI!)
    
    // Connection event handlers
    connection.on('connected', () => {
      console.log('✅ Database connection established')
    })
    
    connection.on('error', (error) => {
      console.error('❌ Database connection error:', error)
      performanceMonitor.trackApiCall('database-connection', 0, 500, undefined, error.message)
    })
    
    connection.on('disconnected', () => {
      console.log('⚠️ Database connection disconnected')
    })

    this.connectionPool.push(connection)
    return connection
  }

  // Get available connection from pool
  async getConnection(): Promise<mongoose.Connection> {
    // Find available connection
    const availableConnection = this.connectionPool.find(conn => conn.readyState === 1)
    
    if (availableConnection) {
      return availableConnection
    }

    // Create new connection if pool is not full
    if (this.connectionPool.length < this.MAX_POOL_SIZE) {
      return await this.createConnection()
    }

    // Wait for connection to become available
    return new Promise((resolve) => {
      const checkConnection = () => {
        const conn = this.connectionPool.find(c => c.readyState === 1)
        if (conn) {
          resolve(conn)
        } else {
          setTimeout(checkConnection, 100)
        }
      }
      checkConnection()
    })
  }

  // Optimize database indexes
  async optimizeIndexes() {
    try {
      console.log('🔍 Optimizing database indexes...')
      
      const connection = await this.getConnection()
      const db = connection.db

      // Get all collections
      const collections = await db.listCollections().toArray()
      
      for (const collection of collections) {
        try {
          // Analyze collection performance
          const stats = await db.command({ collStats: collection.name })
          
          // Create indexes for frequently queried fields
          if (collection.name === 'users') {
            await this.ensureUserIndexes(connection)
          } else if (collection.name === 'posts') {
            await this.ensurePostIndexes(connection)
          } else if (collection.name === 'adminusers') {
            await this.ensureAdminIndexes(connection)
          }
          
          console.log(`✅ Optimized indexes for collection: ${collection.name}`)
        } catch (error) {
          console.warn(`⚠️ Could not optimize collection ${collection.name}:`, error)
        }
      }
      
      console.log('🎯 Database index optimization completed')
    } catch (error) {
      console.error('❌ Database optimization failed:', error)
    }
  }

  // Ensure user collection indexes
  private async ensureUserIndexes(connection: mongoose.Connection) {
    const userCollection = connection.collection('users')
    
    // Create compound index for email + username lookups
    await userCollection.createIndex(
      { email: 1, username: 1 },
      { background: true, unique: true }
    )
    
    // Create index for createdAt (for date-based queries)
    await userCollection.createIndex(
      { createdAt: -1 },
      { background: true }
    )
    
    // Create index for lastActivity (for activity tracking)
    await userCollection.createIndex(
      { lastActivity: -1 },
      { background: true }
    )
  }

  // Ensure post collection indexes
  private async ensurePostIndexes(connection: mongoose.Connection) {
    const postCollection = connection.collection('posts')
    
    // Create compound index for user + date lookups
    await postCollection.createIndex(
      { userId: 1, createdAt: -1 },
      { background: true }
    )
    
    // Create index for image URL lookups
    await postCollection.createIndex(
      { image: 1 },
      { background: true }
    )
    
    // Create text index for caption search
    await postCollection.createIndex(
      { caption: 'text' },
      { background: true }
    )
  }

  // Ensure admin user indexes
  private async ensureAdminIndexes(connection: mongoose.Connection) {
    const adminCollection = connection.collection('adminusers')
    
    // Create compound index for admin lookups
    await adminCollection.createIndex(
      { email: 1, username: 1 },
      { background: true, unique: true }
    )
    
    // Create index for role-based queries
    await adminCollection.createIndex(
      { 'role.name': 1 },
      { background: true }
    )
  }

  // Monitor query performance
  private setupQueryMonitoring() {
    // Monitor all mongoose queries
    mongoose.set('debug', (collectionName, methodName, ...methodArgs) => {
      const startTime = Date.now()
      
      // Track query execution time
      const originalCallback = methodArgs[methodArgs.length - 1]
      if (typeof originalCallback === 'function') {
        methodArgs[methodArgs.length - 1] = (...args: any[]) => {
          const executionTime = Date.now() - startTime
          
          // Record query metrics
          this.recordQueryMetric(collectionName, methodName, executionTime)
          
          // Alert on slow queries
          if (executionTime > this.SLOW_QUERY_THRESHOLD) {
            this.alertSlowQuery(collectionName, methodName, executionTime, methodArgs)
          }
          
          // Call original callback
          originalCallback(...args)
        }
      }
    })
  }

  // Record query performance metrics
  private recordQueryMetric(collection: string, method: string, executionTime: number) {
    this.queryMetrics.push({
      query: `${collection}.${method}`,
      executionTime,
      timestamp: new Date()
    })
    
    // Keep only recent metrics
    if (this.queryMetrics.length > 1000) {
      this.queryMetrics = this.queryMetrics.slice(-1000)
    }
  }

  // Alert on slow queries
  private async alertSlowQuery(collection: string, method: string, executionTime: number, args: any[]) {
    console.warn(`🐌 Slow query detected: ${collection}.${method} took ${executionTime}ms`)
    
    // Send alert for very slow queries (>5 seconds)
    if (executionTime > 5000) {
      try {
        await performanceMonitor.trackApiCall(
          'slow-database-query',
          executionTime,
          500,
          undefined,
          `Slow query: ${collection}.${method}`
        )
      } catch (error) {
        console.error('Failed to track slow query:', error)
      }
    }
  }

  // Get database performance statistics
  getPerformanceStats(): ConnectionStats {
    const recentMetrics = this.queryMetrics.filter(
      m => m.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    )
    
    const avgQueryTime = recentMetrics.length > 0 
      ? recentMetrics.reduce((sum, m) => sum + m.executionTime, 0) / recentMetrics.length
      : 0
    
    const slowQueries = recentMetrics.filter(m => m.executionTime > this.SLOW_QUERY_THRESHOLD).length
    
    return {
      activeConnections: this.connectionPool.filter(c => c.readyState === 1).length,
      maxConnections: this.MAX_POOL_SIZE,
      connectionUtilization: Math.round((this.connectionPool.filter(c => c.readyState === 1).length / this.MAX_POOL_SIZE) * 100),
      avgQueryTime: Math.round(avgQueryTime),
      totalQueries: recentMetrics.length,
      slowQueries
    }
  }

  // Health check for database connections
  private startHealthCheck() {
    setInterval(async () => {
      try {
        const stats = this.getPerformanceStats()
        
        // Alert if connection utilization is high
        if (stats.connectionUtilization > 80) {
          console.warn(`⚠️ High database connection utilization: ${stats.connectionUtilization}%`)
        }
        
        // Alert if too many slow queries
        if (stats.slowQueries > stats.totalQueries * 0.1) { // More than 10% slow queries
          console.warn(`⚠️ High slow query rate: ${stats.slowQueries}/${stats.totalQueries}`)
        }
        
        // Clean up dead connections
        this.cleanupDeadConnections()
        
      } catch (error) {
        console.error('❌ Database health check failed:', error)
      }
    }, 30000) // Every 30 seconds
  }

  // Clean up dead connections
  private cleanupDeadConnections() {
    const initialCount = this.connectionPool.length
    this.connectionPool = this.connectionPool.filter(conn => conn.readyState === 1)
    
    const cleanedCount = initialCount - this.connectionPool.length
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} dead database connections`)
      
      // Replenish pool if needed
      if (this.connectionPool.length < this.MIN_POOL_SIZE) {
        this.initializeConnectionPool()
      }
    }
  }

  // Graceful shutdown
  async shutdown() {
    console.log('🔄 Shutting down database optimizer...')
    
    // Close all connections
    await Promise.all(
      this.connectionPool.map(conn => conn.close())
    )
    
    console.log('✅ Database optimizer shutdown complete')
  }
}

// Export singleton instance
export const dbOptimizer = new DatabaseOptimizer()

// Graceful shutdown
process.on('SIGTERM', async () => {
  await dbOptimizer.shutdown()
  process.exit(0)
})

// Optimize indexes on startup (after a delay to ensure DB is ready)
setTimeout(() => {
  dbOptimizer.optimizeIndexes()
}, 10000) // 10 seconds after startup
