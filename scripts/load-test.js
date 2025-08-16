#!/usr/bin/env node

/**
 * Load Testing Script for Caption Generation API
 * Tests the system with 100+ concurrent users
 */

const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')

class LoadTester {
  constructor() {
    this.results = []
    this.startTime = Date.now()
    this.totalRequests = 0
    this.successfulRequests = 0
    this.failedRequests = 0
    this.responseTimes = []
    this.concurrentUsers = 100
    this.requestsPerUser = 5
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000'
    this.testImageUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
  }

  // Generate test image data
  generateTestImage() {
    return {
      image: this.testImageUrl,
      mood: 'excited',
      style: 'casual'
    }
  }

  // Make HTTP request
  makeRequest(url, options, data) {
    return new Promise((resolve, reject) => {
      const isHttps = url.startsWith('https')
      const client = isHttps ? https : http
      
      const req = client.request(url, options, (res) => {
        let body = ''
        res.on('data', (chunk) => body += chunk)
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          })
        })
      })

      req.on('error', reject)
      
      if (data) {
        req.write(JSON.stringify(data))
      }
      
      req.end()
    })
  }

  // Simulate single user making requests
  async simulateUser(userId) {
    const userResults = []
    
    for (let i = 0; i < this.requestsPerUser; i++) {
      const startTime = Date.now()
      
      try {
        // Simulate image upload and caption generation
        const response = await this.makeRequest(
          `${this.baseUrl}/api/generate-captions`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': `LoadTest-User-${userId}`
            }
          },
          this.generateTestImage()
        )
        
        const responseTime = Date.now() - startTime
        const success = response.statusCode >= 200 && response.statusCode < 300
        
        const result = {
          userId,
          requestId: i + 1,
          statusCode: response.statusCode,
          responseTime,
          success,
          timestamp: new Date().toISOString()
        }
        
        userResults.push(result)
        this.recordResult(result)
        
        // Random delay between requests (100ms to 500ms)
        await this.delay(Math.random() * 400 + 100)
        
      } catch (error) {
        const responseTime = Date.now() - startTime
        const result = {
          userId,
          requestId: i + 1,
          statusCode: 0,
          responseTime,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
        
        userResults.push(result)
        this.recordResult(result)
      }
    }
    
    return userResults
  }

  // Record test result
  recordResult(result) {
    this.totalRequests++
    this.responseTimes.push(result.responseTime)
    
    if (result.success) {
      this.successfulRequests++
    } else {
      this.failedRequests++
    }
    
    this.results.push(result)
  }

  // Calculate statistics
  calculateStats() {
    const avgResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
    const sortedTimes = [...this.responseTimes].sort((a, b) => a - b)
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)]
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)]
    
    const successRate = (this.successfulRequests / this.totalRequests) * 100
    const totalTime = Date.now() - this.startTime
    const requestsPerSecond = this.totalRequests / (totalTime / 1000)
    
    return {
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      failedRequests: this.failedRequests,
      successRate: Math.round(successRate * 100) / 100,
      avgResponseTime: Math.round(avgResponseTime),
      p95ResponseTime: Math.round(p95),
      p99ResponseTime: Math.round(p99),
      minResponseTime: Math.min(...this.responseTimes),
      maxResponseTime: Math.max(...this.responseTimes),
      requestsPerSecond: Math.round(requestsPerSecond * 100) / 100,
      totalTime: Math.round(totalTime / 1000),
      concurrentUsers: this.concurrentUsers
    }
  }

  // Generate detailed report
  generateReport() {
    const stats = this.calculateStats()
    const report = {
      summary: stats,
      detailedResults: this.results,
      timestamp: new Date().toISOString()
    }
    
    // Save report to file
    const reportPath = path.join(__dirname, `load-test-report-${Date.now()}.json`)
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    return { report, reportPath }
  }

  // Print results to console
  printResults() {
    const stats = this.calculateStats()
    
    console.log('\n' + '='.repeat(60))
    console.log('🚀 LOAD TEST RESULTS')
    console.log('='.repeat(60))
    console.log(`📊 Total Requests: ${stats.totalRequests}`)
    console.log(`✅ Successful: ${stats.successfulRequests}`)
    console.log(`❌ Failed: ${stats.failedRequests}`)
    console.log(`📈 Success Rate: ${stats.successRate}%`)
    console.log(`⏱️  Total Time: ${stats.totalTime}s`)
    console.log(`🔄 Requests/Second: ${stats.requestsPerSecond}`)
    console.log(`👥 Concurrent Users: ${stats.concurrentUsers}`)
    console.log('\n📊 Response Time Statistics:')
    console.log(`   Average: ${stats.avgResponseTime}ms`)
    console.log(`   95th Percentile: ${stats.p95ResponseTime}ms`)
    console.log(`   99th Percentile: ${stats.p99ResponseTime}ms`)
    console.log(`   Min: ${stats.minResponseTime}ms`)
    console.log(`   Max: ${stats.maxResponseTime}ms`)
    console.log('='.repeat(60))
    
    // Performance assessment
    if (stats.successRate >= 99 && stats.avgResponseTime < 2000) {
      console.log('🎉 EXCELLENT: System handles high load perfectly!')
    } else if (stats.successRate >= 95 && stats.avgResponseTime < 5000) {
      console.log('✅ GOOD: System handles high load well with minor issues.')
    } else if (stats.successRate >= 90) {
      console.log('⚠️  ACCEPTABLE: System handles load but needs optimization.')
    } else {
      console.log('❌ POOR: System struggles under high load. Immediate attention required.')
    }
  }

  // Utility function for delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Run the load test
  async run() {
    console.log('🚀 Starting Load Test...')
    console.log(`📡 Testing URL: ${this.baseUrl}`)
    console.log(`👥 Concurrent Users: ${this.concurrentUsers}`)
    console.log(`📝 Requests per User: ${this.requestsPerUser}`)
    console.log(`🎯 Total Expected Requests: ${this.concurrentUsers * this.requestsPerUser}`)
    console.log('⏳ Starting in 3 seconds...\n')
    
    await this.delay(3000)
    
    const startTime = Date.now()
    
    // Create concurrent user simulations
    const userPromises = []
    for (let i = 1; i <= this.concurrentUsers; i++) {
      userPromises.push(this.simulateUser(i))
    }
    
    // Wait for all users to complete
    await Promise.all(userPromises)
    
    const totalTime = Date.now() - startTime
    
    console.log(`\n⏱️  Load test completed in ${Math.round(totalTime / 1000)}s`)
    
    // Print results
    this.printResults()
    
    // Generate and save report
    const { reportPath } = this.generateReport()
    console.log(`\n📄 Detailed report saved to: ${reportPath}`)
    
    return this.calculateStats()
  }
}

// Run load test if script is executed directly
if (require.main === module) {
  const loadTester = new LoadTester()
  
  // Handle command line arguments
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Load Testing Script for Caption Generation API

Usage: node load-test.js [options]

Options:
  --users <number>     Number of concurrent users (default: 100)
  --requests <number>  Requests per user (default: 5)
  --url <url>          Base URL to test (default: http://localhost:3000)
  --help, -h          Show this help message

Environment Variables:
  BASE_URL             Base URL for testing

Examples:
  node load-test.js --users 50 --requests 10
  BASE_URL=https://yourdomain.com node load-test.js
    `)
    process.exit(0)
  }
  
  // Parse command line arguments
  const userIndex = process.argv.indexOf('--users')
  if (userIndex !== -1 && process.argv[userIndex + 1]) {
    loadTester.concurrentUsers = parseInt(process.argv[userIndex + 1])
  }
  
  const requestsIndex = process.argv.indexOf('--requests')
  if (requestsIndex !== -1 && process.argv[requestsIndex + 1]) {
    loadTester.requestsPerUser = parseInt(process.argv[requestsIndex + 1])
  }
  
  const urlIndex = process.argv.indexOf('--url')
  if (urlIndex !== -1 && process.argv[urlIndex + 1]) {
    loadTester.baseUrl = process.argv[urlIndex + 1]
  }
  
  // Run the test
  loadTester.run().catch(error => {
    console.error('❌ Load test failed:', error)
    process.exit(1)
  })
}

module.exports = LoadTester
