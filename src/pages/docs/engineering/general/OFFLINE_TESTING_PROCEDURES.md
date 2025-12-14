# 🧪 Offline Testing Procedures

## 📋 **Overview**

This guide provides comprehensive offline testing procedures for the Capsera system, including all endpoints, error scenarios, and performance benchmarks that can be tested without external dependencies.

---

## 🔧 **Prerequisites**

### **Required Setup:**
- ✅ **Local Development Server**: `npm run dev`
- ✅ **Environment Variables**: All API keys configured
- ✅ **Postman/Thunder Client**: API testing tool
- ✅ **Browser Developer Tools**: For frontend testing
- ✅ **Terminal/Command Line**: For script testing

### **Test Environment:**
```bash
# Start development server
npm run dev

# Server should be running on:
http://localhost:3000
```

---

## 🚀 **Core API Endpoints Testing**

### **1. Caption Generation - Main Route**

#### **Basic Test:**
```http
POST http://localhost:3000/api/generate-captions
Content-Type: application/json

{
  "imageUrl": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
  "mood": "professional",
  "description": "Business meeting room"
}
```

#### **Expected Response:**
```json
{
  "success": true,
  "captions": [
    "Strategic planning in action. Collaborating with like-minded individuals to drive business growth and success. #BusinessMeeting #ProfessionalSpace #Leadership",
    "Where ideas come to life. A collaborative workspace where creativity and innovation know no bounds. #OfficeDesign #ProductivitySpace #BusinessGoals",
    "The perfect blend of innovation and expertise. A space where professionals come together to shape the future of business. #BusinessStrategy #MeetingsThatMatter #ProfessionalDevelopment"
  ],
  "processingTime": 2234,
  "provider": "groq",
  "rateLimit": {
    "userTier": "anonymous",
    "isAdmin": false,
    "maxGenerations": 15,
    "remaining": 14,
    "resetTime": 1759948200000,
    "resetMessage": "in 3 hours"
  }
}
```

#### **Validation Tests:**
```javascript
// Postman Test Script
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response time is under 5 seconds", function () {
    pm.expect(pm.response.responseTime).to.be.below(5000);
});

pm.test("Success is true", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
});

pm.test("Provider is Groq", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.provider).to.eql("groq");
});

pm.test("Has 3 captions", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.captions).to.have.lengthOf(3);
});

pm.test("Each caption has content", function () {
    const jsonData = pm.response.json();
    jsonData.captions.forEach(caption => {
        pm.expect(caption).to.be.a('string');
        pm.expect(caption.length).to.be.above(10);
    });
});
```

---

### **2. Multi-Provider System Test**

#### **Advanced Route Test:**
```http
POST http://localhost:3000/api/generate-captions-multi
Content-Type: application/json

{
  "imageUrl": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500",
  "mood": "creative",
  "description": "Art studio with colorful paintings"
}
```

#### **Expected Response:**
```json
{
  "success": true,
  "captions": [
    "Creative caption 1",
    "Creative caption 2",
    "Creative caption 3"
  ],
  "provider": "groq",
  "processingTime": 1847,
  "fallbackUsed": false,
  "rateLimit": {
    "userTier": "anonymous",
    "isAdmin": false,
    "maxGenerations": 15,
    "remaining": 14,
    "resetTime": 1759948200000,
    "resetMessage": "in 3 hours"
  }
}
```

---

## 🎯 **Mood Testing Scenarios**

### **Complete Mood Test Suite:**

#### **1. Professional Mood:**
```json
{
  "imageUrl": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
  "mood": "professional",
  "description": "Corporate office meeting room"
}
```

#### **2. Creative Mood:**
```json
{
  "imageUrl": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500",
  "mood": "creative",
  "description": "Art studio with colorful paintings"
}
```

#### **3. Inspirational Mood:**
```json
{
  "imageUrl": "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=500",
  "mood": "inspirational",
  "description": "Mountain landscape at sunrise"
}
```

#### **4. Humorous Mood:**
```json
{
  "imageUrl": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500",
  "mood": "humorous",
  "description": "Funny cat in costume"
}
```

#### **5. Casual Mood:**
```json
{
  "imageUrl": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
  "mood": "casual",
  "description": "Coffee shop interior"
}
```

#### **6. Minimalist Mood:**
```json
{
  "imageUrl": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500",
  "mood": "minimalist",
  "description": "Clean modern interior"
}
```

---

## ⚡ **Performance Testing**

### **1. Speed Benchmark Test:**

#### **Batch Performance Test:**
```javascript
// Postman Collection Runner Script
// Run this 10 times to get average performance

const testData = {
  "imageUrl": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
  "mood": "professional",
  "description": "Performance test image"
};

pm.sendRequest({
    url: pm.environment.get("base_url") + "/api/generate-captions",
    method: 'POST',
    header: {
        'Content-Type': 'application/json'
    },
    body: {
        mode: 'raw',
        raw: JSON.stringify(testData)
    }
}, function (err, response) {
    console.log("Response time:", response.responseTime + "ms");
    console.log("Provider:", response.json().provider);
});
```

#### **Performance Validation:**
```javascript
// Performance test validation
pm.test("Response time is under 5 seconds", function () {
    pm.expect(pm.response.responseTime).to.be.below(5000);
});

pm.test("Groq provider is used", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.provider).to.eql("groq");
});

pm.test("Processing time is reasonable", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.processingTime).to.be.below(5000);
});
```

---

## 🔒 **Rate Limiting Tests**

### **1. Rate Limit Information:**
```http
GET http://localhost:3000/api/rate-limit-info
```

#### **Expected Response:**
```json
{
  "userTier": "anonymous",
  "isAdmin": false,
  "maxGenerations": 15,
  "remaining": 14,
  "resetTime": 1759948200000,
  "resetMessage": "in 3 hours"
}
```

### **2. Rate Limit Exhaustion Test:**
```javascript
// Postman Collection Runner
// Run 20 requests rapidly to test rate limiting

const requests = [];
for (let i = 0; i < 20; i++) {
    requests.push({
        url: pm.environment.get("base_url") + "/api/generate-captions",
        method: 'POST',
        header: {
            'Content-Type': 'application/json'
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
                mood: "test",
                description: "Rate limit test " + i
            })
        }
    });
}

// Execute all requests
requests.forEach((request, index) => {
    pm.sendRequest(request, function (err, response) {
        console.log(`Request ${index + 1}: ${response.status} - ${response.responseTime}ms`);
        if (response.status === 429) {
            console.log("Rate limit hit at request:", index + 1);
        }
    });
});
```

### **3. Rate Limit Error Response:**
```json
{
  "success": false,
  "message": "Rate limit exceeded. Reset at: 1/8/2025, 6:30:00 PM",
  "error": "rate_limit_exceeded",
  "rateLimit": {
    "userTier": "anonymous",
    "isAdmin": false,
    "maxGenerations": 15,
    "remaining": 0,
    "resetTime": 1759948200000,
    "resetMessage": "in 3 hours"
  }
}
```

---

## 🛡️ **Error Handling Tests**

### **1. Input Validation Tests:**

#### **Missing Required Fields:**
```http
POST http://localhost:3000/api/generate-captions
Content-Type: application/json

{
  "mood": "professional"
  // Missing imageUrl
}
```

#### **Expected Error:**
```json
{
  "success": false,
  "message": "Image URL is required",
  "error": "validation_error"
}
```

#### **Invalid Image URL:**
```http
POST http://localhost:3000/api/generate-captions
Content-Type: application/json

{
  "imageUrl": "invalid-url",
  "mood": "professional",
  "description": "Test with invalid URL"
}
```

#### **Invalid Mood:**
```http
POST http://localhost:3000/api/generate-captions
Content-Type: application/json

{
  "imageUrl": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
  "mood": "invalid-mood",
  "description": "Test with invalid mood"
}
```

### **2. Provider Failure Tests:**

#### **Groq Failure Simulation:**
```javascript
// Temporarily disable Groq keys in .env to test fallback
// Expected behavior: Should fall back to Gemini

pm.test("Fallback to Gemini works", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.provider).to.eql("gemini");
    pm.expect(jsonData.fallbackUsed).to.be.true;
});
```

#### **All Providers Failure Test:**
```javascript
// Disable all API keys to test complete failure handling
pm.test("Graceful failure handling", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error).to.be.a('string');
});
```

---

## 📊 **Admin Panel Tests**

### **1. System Health Check:**
```http
GET http://localhost:3000/api/system-health
```

#### **Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-08T15:30:00.000Z",
  "uptime": 3600,
  "database": "connected",
  "providers": {
    "groq": "healthy",
    "gemini": "healthy",
    "huggingface": "healthy"
  }
}
```

### **2. Admin Dashboard Stats:**
```http
GET http://localhost:3000/api/admin/dashboard-stats
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### **3. Provider Status:**
```http
GET http://localhost:3000/api/admin/keys
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## 🔄 **Fallback System Tests**

### **1. Groq to Gemini Fallback:**
```javascript
// Test script to verify fallback works
pm.test("Fallback system works", function () {
    const jsonData = pm.response.json();
    if (jsonData.fallbackUsed) {
        pm.expect(jsonData.provider).to.eql("gemini");
        pm.expect(jsonData.fallbackReason).to.be.a('string');
        console.log("Fallback reason:", jsonData.fallbackReason);
    }
});
```

### **2. Multi-Provider Routing:**
```javascript
// Test that different providers are used
pm.test("Provider routing works", function () {
    const jsonData = pm.response.json();
    pm.expect(["groq", "gemini", "huggingface"]).to.include(jsonData.provider);
});
```

---

## 📈 **Batch Testing Scripts**

### **1. Complete Test Suite:**
```javascript
// Postman Collection Runner - Complete Test Suite
const testCases = [
    {
        name: "Professional Mood",
        data: {
            imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
            mood: "professional",
            description: "Business meeting room"
        }
    },
    {
        name: "Creative Mood",
        data: {
            imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500",
            mood: "creative",
            description: "Art studio"
        }
    },
    {
        name: "Inspirational Mood",
        data: {
            imageUrl: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=500",
            mood: "inspirational",
            description: "Mountain landscape"
        }
    }
];

testCases.forEach((testCase, index) => {
    pm.sendRequest({
        url: pm.environment.get("base_url") + "/api/generate-captions",
        method: 'POST',
        header: {
            'Content-Type': 'application/json'
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify(testCase.data)
        }
    }, function (err, response) {
        console.log(`Test ${index + 1} (${testCase.name}):`);
        console.log(`- Status: ${response.status}`);
        console.log(`- Response Time: ${response.responseTime}ms`);
        console.log(`- Provider: ${response.json().provider}`);
        console.log(`- Success: ${response.json().success}`);
        console.log("---");
    });
});
```

### **2. Performance Benchmark:**
```javascript
// Performance benchmark test
const startTime = Date.now();
let successCount = 0;
let totalResponseTime = 0;

for (let i = 0; i < 10; i++) {
    pm.sendRequest({
        url: pm.environment.get("base_url") + "/api/generate-captions",
        method: 'POST',
        header: {
            'Content-Type': 'application/json'
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
                mood: "professional",
                description: "Benchmark test " + i
            })
        }
    }, function (err, response) {
        totalResponseTime += response.responseTime;
        if (response.json().success) {
            successCount++;
        }
        
        if (i === 9) { // Last request
            const endTime = Date.now();
            const totalTime = endTime - startTime;
            const avgResponseTime = totalResponseTime / 10;
            const successRate = (successCount / 10) * 100;
            
            console.log("=== PERFORMANCE BENCHMARK RESULTS ===");
            console.log(`Total Test Time: ${totalTime}ms`);
            console.log(`Average Response Time: ${avgResponseTime}ms`);
            console.log(`Success Rate: ${successRate}%`);
            console.log(`Successful Requests: ${successCount}/10`);
        }
    });
}
```

---

## 🎯 **Test Results Validation**

### **Success Criteria:**
- ✅ **Response Time**: Under 5 seconds (preferably 1-3 seconds with Groq)
- ✅ **Success Rate**: 99%+ for normal requests
- ✅ **Provider Usage**: Groq used 70%+ of the time
- ✅ **Fallback Working**: Graceful fallback to Gemini when Groq fails
- ✅ **Error Handling**: Clear error messages for invalid inputs
- ✅ **Rate Limiting**: Proper enforcement of usage limits
- ✅ **Admin Endpoints**: All admin functions working correctly

### **Performance Benchmarks:**
- **Target Response Time**: 1-3 seconds (Groq), 5-10 seconds (Gemini fallback)
- **Target Success Rate**: 99.9%
- **Target Provider Distribution**: 70% Groq, 25% Gemini, 5% Hugging Face
- **Target Error Rate**: <0.1%

---

## 🚀 **Automated Testing Setup**

### **1. Postman Collection Export:**
```json
{
  "info": {
    "name": "Capsera Offline Tests",
    "description": "Complete offline testing collection for Capsera",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000"
    }
  ],
  "item": [
    {
      "name": "Caption Generation Tests",
      "item": [
        {
          "name": "Basic Caption Generation",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"imageUrl\": \"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500\",\n  \"mood\": \"professional\",\n  \"description\": \"Business meeting room\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/generate-captions",
              "host": ["{{base_url}}"],
              "path": ["api", "generate-captions"]
            }
          }
        }
      ]
    }
  ]
}
```

### **2. Newman CLI Testing:**
```bash
# Install Newman
npm install -g newman

# Run collection
newman run capsera-offline-tests.postman_collection.json \
  --environment capsera-local.postman_environment.json \
  --reporters cli,html \
  --reporter-html-export test-results.html
```

---

## 🎉 **Testing Summary**

### **What to Test:**
✅ **Core Functionality**: Caption generation with all moods  
✅ **Performance**: Response times and throughput  
✅ **Error Handling**: Invalid inputs and provider failures  
✅ **Rate Limiting**: Usage limits and enforcement  
✅ **Fallback System**: Provider failure and recovery  
✅ **Admin Functions**: System monitoring and management  

### **Expected Results:**
- **Speed**: 1-3 seconds with Groq (2-5x faster than before)
- **Reliability**: 99.9% success rate with fallbacks
- **Quality**: Consistent, high-quality captions for all moods
- **Stability**: Graceful handling of all error scenarios

**Your system is ready for comprehensive offline testing!** 🚀
