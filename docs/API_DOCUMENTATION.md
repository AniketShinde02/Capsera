# 🔌 CaptionCraft API Documentation

## 📋 **Overview**

CaptionCraft provides a comprehensive REST API for caption generation, user management, and administrative functions. All endpoints are RESTful and return JSON responses.

## 🔐 **Authentication**

### **Public Endpoints**
- `POST /api/auth/register` - User registration
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `GET /api/auth/validate-reset-token` - Token validation
- `POST /api/contact` - Contact form submission

### **Protected Endpoints**
- All other endpoints require valid authentication
- Use NextAuth.js session cookies
- JWT tokens for admin operations

## 🚀 **Core API Endpoints**

### **1. Authentication Endpoints**

#### **POST /api/auth/register**
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "email": "user@example.com"
  },
  "message": "User created successfully"
}
```

**Status Codes:**
- `201` - User created successfully
- `400` - Missing email or password
- `409` - User already exists
- `500` - Server error

#### **POST /api/auth/forgot-password**
Request a password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

**Rate Limiting:**
- 3 requests per user per day
- 5 requests per IP per day

#### **POST /api/auth/reset-password**
Reset password using token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "token": "reset-token-here",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

#### **GET /api/auth/validate-reset-token**
Validate reset token before showing form.

**Query Parameters:**
- `token` - Reset token
- `email` - User email

---

### **3. Maintenance Mode Endpoints**

#### **GET /api/maintenance**
Get current maintenance mode status.

**Response:**
```json
{
  "success": true,
  "status": {
    "enabled": true,
    "message": "System maintenance in progress",
    "estimatedTime": "2 hours",
    "allowedIPs": ["127.0.0.1", "192.168.1.1"],
    "allowedEmails": ["admin@example.com"],
    "updatedAt": "2025-08-19T10:59:37.328Z"
  }
}
```

**Status Codes:**
- `200` - Maintenance status retrieved successfully
- `500` - Server error

#### **POST /api/maintenance**
Enable or disable maintenance mode.

**Request Body:**
```json
{
  "enabled": true,
  "message": "System maintenance in progress",
  "estimatedTime": "2 hours",
  "allowedIPs": ["127.0.0.1", "192.168.1.1"],
  "allowedEmails": ["admin@example.com"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Maintenance mode enabled",
  "status": {
    "enabled": true,
    "message": "System maintenance in progress",
    "estimatedTime": "2 hours",
    "allowedIPs": ["127.0.0.1", "192.168.1.1"],
    "allowedEmails": ["admin@example.com"],
    "updatedAt": "2025-08-19T10:59:37.328Z"
  }
}
```

**Status Codes:**
- `200` - Maintenance mode updated successfully
- `400` - Invalid request body
- `401` - Unauthorized (admin access required)
- `500` - Server error

#### **POST /api/maintenance/emergency-access**
Emergency access control during maintenance.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "ipAddress": "192.168.1.100"
}
```

**Response:**
```json
{
  "success": true,
  "access": true,
  "message": "Emergency access granted"
}
```

**Status Codes:**
- `200` - Emergency access granted
- `403` - Access denied
- `400` - Invalid request
- `500` - Server error

**Notes:**
- Only works when maintenance mode is enabled
- Requires valid email and IP address in allowed lists
- Used for emergency system access during maintenance

**Response:**
```json
{
```json
{
  "systemHealth": {
    "uptime": 99.8,
    "responseTime": 45,
    "memoryUsage": 65.2,
    "cpuUsage": 23.1,
    "diskUsage": 45.8,
    "activeConnections": 12
  },
  "alerts": [
    {
      "id": "alert-id",
      "type": "warning",
      "message": "High memory usage detected",
      "severity": "medium",
      "createdAt": "2024-01-01T00:00:00Z",
      "acknowledged": false
    }
  ]
}
```

#### **GET /api/admin/database/stats**
Get comprehensive database statistics (admin only).

**Response:**
```json
{
  "stats": {
    "totalCollections": 8,
    "totalDocuments": 1250,
    "totalSize": "2.8GB",
    "totalIndexes": 24,
    "activeConnections": 12,
    "maxConnections": 100,
    "connectionUtilization": 12,
    "avgResponseTime": 23,
    "uptime": 99.5,
    "collections": [
      {
        "name": "users",
        "documentCount": 150,
        "size": "1.2MB",
        "indexes": 3,
        "lastModified": "2024-01-01T00:00:00Z",
        "status": "healthy",
        "avgDocumentSize": "8KB"
      }
    ]
  }
}
```

### **12. Enhanced Image Management Endpoints**

#### **GET /api/admin/images**
Get all images with metadata (admin only).

**Response:**
```json
{
  "images": [
    {
      "id": "image-id",
      "url": "https://imagekit.io/...",
      "thumbnail": "https://imagekit.io/...",
      "uploadedBy": "user@example.com",
      "uploadDate": "2024-01-01T00:00:00Z",
      "size": "2.5MB",
      "dimensions": "1920x1080",
      "format": "JPEG",
      "accessCount": 45,
      "status": "active"
    }
  ],
  "storageMetrics": {
    "totalImages": 450,
    "totalSizeMB": 1250.5,
    "availableStorage": "50GB",
    "storageUsed": "2.5%"
  }
}
```

#### **POST /api/admin/images/[id]/moderate**
Moderate image (admin only).

**Request Body:**
```json
{
  "action": "approve", // approve, reject, flag
  "reason": "Content meets guidelines"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Image moderated successfully"
}
```

## 🔧 **Utility Endpoints**

### **1. Contact Endpoint**

#### **POST /api/contact**
Submit contact form.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "General Inquiry",
  "message": "Hello, I have a question..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

### **2. Debug Endpoints**

#### **GET /api/debug-session**
Debug session information (development only).

**Response:**
```json
{
  "session": {
    "user": {
      "id": "user-id",
      "email": "user@example.com"
    },
    "expires": "2024-01-08T00:00:00Z"
  }
}
```

#### **GET /api/test-admin**
Test admin system (development only).

**Response:**
```json
{
  "success": true,
  "adminCount": 2,
  "databaseStatus": "connected"
}
```

## 📊 **Error Handling**

### **Standard Error Response Format**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

### **Common Error Codes**
- `AUTH_REQUIRED` - Authentication required
- `INSUFFICIENT_PERMISSIONS` - Insufficient permissions
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded
- `INVALID_TOKEN` - Invalid or expired token
- `USER_NOT_FOUND` - User not found
- `VALIDATION_ERROR` - Request validation failed
- `INTERNAL_ERROR` - Internal server error

### **HTTP Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found

## ⚡ **Recent API Improvements (January 2025)**

### **Timeout Configuration**
All external API calls now include proper timeout configuration:

- **Brevo Email API**: 30-second timeout
- **Gemini AI API**: 60-second timeout  
- **Image Fetching**: 15-second timeout
- **Internal API Calls**: 10-second timeout

### **User-Agent Headers**
External API calls include proper User-Agent headers:
```javascript
headers: {
  'User-Agent': 'Capsera/1.0',
  'Accept': 'application/json'
}
```

### **Cloudinary Resource Type Consistency**
Archive operations now use consistent resource types:
```javascript
// Function signature updated
archiveCloudinaryImage(publicId: string, userId?: string, resourceType: string = 'auto')

// All calls now pass appropriate resource type
await archiveCloudinaryImage(publicId, userId, 'image');
```

### **Dynamic Year Implementation**
Copyright notices now use dynamic years:
```javascript
// React/JSX
© {new Date().getFullYear()} Capsera. All rights reserved.

// JavaScript
© ${new Date().getFullYear()} Capsera. All rights reserved.
```
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

## 🔒 **Security Features**

### **Rate Limiting**
- IP-based rate limiting
- User-based rate limiting
- Automatic abuse detection
- Escalating timeouts for violations

### **Input Validation**
- Request body validation
- File type and size validation
- SQL injection prevention
- XSS protection

### **Authentication**
- JWT token-based sessions
- Secure cookie handling
- Session expiration
- Automatic logout on inactivity

## 📱 **Client Integration Examples**

### **JavaScript/TypeScript**
```typescript
// Generate captions
const formData = new FormData();
formData.append('image', imageFile);
formData.append('mood', '🎉 Celebratory / Festive');

const response = await fetch('/api/generate-captions', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result.captions);
```

### **Python**
```python
import requests

# Generate captions
files = {'image': open('image.jpg', 'rb')}
data = {'mood': '🎉 Celebratory / Festive'}

response = requests.post(
    'http://localhost:9002/api/generate-captions',
    files=files,
    data=data
)

result = response.json()
print(result['captions'])
```

### **cURL**
```bash
# Generate captions
curl -X POST http://localhost:9002/api/generate-captions \
  -F "image=@image.jpg" \
  -F "mood=🎉 Celebratory / Festive"

# Get user profile (with authentication)
curl -H "Cookie: next-auth.session-token=..." \
  http://localhost:9002/api/user
```

## 🚀 **Performance Considerations**

### **Best Practices**
- Use appropriate image sizes (max 10MB)
- Implement client-side caching
- Use pagination for large datasets
- Monitor rate limits

### **Rate Limits**
- Anonymous: 3 generations/day
- Authenticated: 10 generations/day
- Admin operations: 100 requests/hour

## 📞 **Support & Feedback**

For API support or questions:
- Check this documentation
- Review error responses
- Check server logs
- Contact development team

---

**Last Updated**: January 2025  
**API Version**: v1.0  
**Status**: Production Ready 🚀
