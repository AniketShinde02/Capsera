# 🔌 API ENDPOINTS COMPLETE - All Available Routes

## 📋 **API Overview**

This document covers **ALL API endpoints** available in the Capsera platform. Each endpoint includes:
- **HTTP Method** and **URL Path**
- **Request Parameters** and **Body**
- **Response Format** and **Status Codes**
- **Authentication Requirements**
- **Usage Examples**

## 🔐 **Authentication Endpoints**

### **1. NextAuth.js Authentication**
```
Base URL: /api/auth
```

#### **GET /api/auth/session**
- **Purpose**: Get current user session
- **Auth**: Required
- **Response**: User session data or null
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "image": "profile_image_url",
    "role": { "name": "admin", "displayName": "Administrator" },
    "isAdmin": true
  },
  "expires": "2025-01-23T..."
}
```

#### **POST /api/auth/signin**
- **Purpose**: Sign in with Google OAuth
- **Auth**: Not required
- **Redirects**: To Google OAuth flow

#### **POST /api/auth/signout**
- **Purpose**: Sign out current user
- **Auth**: Required
- **Response**: Success message

### **2. Custom Authentication**
#### **POST /api/auth/register**
- **Purpose**: Register new user account
- **Auth**: Not required
- **Body**:
```json
{
  "email": "user@example.com",
  "name": "User Name"
}
```
- **Response**: Success/error message

## 👤 **User Management Endpoints**

### **1. User Profile**
#### **GET /api/user**
- **Purpose**: Get current user profile data
- **Auth**: Required
- **Response**:
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "email": "user@example.com",
    "username": "username",
    "title": "User Title",
    "bio": "User bio",
    "image": "profile_image_url",
    "role": { "name": "user", "displayName": "User" },
    "createdAt": "2025-01-01T...",
    "updatedAt": "2025-01-01T..."
  }
}
```

#### **PUT /api/user**
- **Purpose**: Update user profile
- **Auth**: Required
- **Body**:
```json
{
  "username": "new_username",
  "title": "New Title",
  "bio": "New bio",
  "image": "new_image_url"
}
```
- **Response**: Success/error message

#### **DELETE /api/user**
- **Purpose**: Delete user account
- **Auth**: Required
- **Response**: Success/error message

### **2. Profile Image Management**
#### **POST /api/user/profile-image**
- **Purpose**: Update profile image
- **Auth**: Required
- **Body**:
```json
{
  "imageUrl": "cloudinary_image_url"
}
```
- **Response**: Success/error message

#### **DELETE /api/user/profile-image**
- **Purpose**: Remove profile image
- **Auth**: Required
- **Response**: Success/error message

### **3. Data Recovery**
#### **POST /api/user/data-recovery-request**
- **Purpose**: Submit data recovery request
- **Auth**: Required
- **Body**:
```json
{
  "reason": "Account Access",
  "details": "Lost access to account",
  "contactEmail": "contact@example.com"
}
```
- **Response**: Success/error message

## 🖼️ **Image & Caption Endpoints**

### **1. Image Upload**
#### **POST /api/upload**
- **Purpose**: Upload image for caption generation
- **Auth**: Required
- **Body**: FormData with image file
- **Response**:
```json
{
  "success": true,
  "url": "cloudinary_image_url",
  "publicId": "cloudinary_public_id"
}
```

### **2. Caption Generation**
#### **POST /api/generate-captions**
- **Purpose**: Generate AI captions for uploaded image
- **Auth**: Required
- **Body**:
```json
{
  "imageUrl": "image_url",
  "mood": "funny",
  "description": "Image description"
}
```
- **Response**:
```json
{
  "success": true,
  "captions": [
    "Generated caption 1",
    "Generated caption 2",
    "Generated caption 3"
  ],
  "postId": "created_post_id"
}
```

### **3. Posts Management**
#### **GET /api/posts**
- **Purpose**: Get user's caption posts
- **Auth**: Required
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Posts per page (default: 10)
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "post_id",
      "image": "image_url",
      "captions": ["caption1", "caption2"],
      "mood": "funny",
      "description": "Post description",
      "createdAt": "2025-01-01T...",
      "updatedAt": "2025-01-01T..."
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalPosts": 50
  }
}
```

#### **GET /api/posts/[id]**
- **Purpose**: Get specific post details
- **Auth**: Required
- **Response**: Single post object

#### **DELETE /api/posts/[id]**
- **Purpose**: Delete specific post
- **Auth**: Required (post owner)
- **Response**: Success/error message

## 🔐 **Admin Endpoints**

### **1. Admin Authentication**
#### **POST /api/admin/setup**
- **Purpose**: Initial admin setup
- **Auth**: Not required (first time only)
- **Body**:
```json
{
  "email": "admin@example.com",
  "password": "admin_password",
  "pin": "1234"
}
```
- **Response**: Success/error message

#### **POST /api/admin/verify-setup-pin**
- **Purpose**: Verify admin setup PIN
- **Auth**: Not required
- **Body**:
```json
{
  "pin": "1234",
  "email": "admin@example.com"
}
```
- **Response**: Success/error message

### **2. Admin Dashboard**
#### **GET /api/admin/dashboard-stats**
- **Purpose**: Get dashboard statistics
- **Auth**: Admin required
- **Response**:
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalPosts": 450,
    "totalCaptions": 1350,
    "activeUsers": 89,
    "recentActivity": [...]
  }
}
```

#### **GET /api/admin/users**
- **Purpose**: Get all users (admin only)
- **Auth**: Admin required
- **Query Parameters**:
  - `page`: Page number
  - `limit`: Users per page
  - `search`: Search by email/username
- **Response**: Paginated users list

#### **GET /api/admin/users/[id]**
- **Purpose**: Get specific user details
- **Auth**: Admin required
- **Response**: User object with extended data

#### **PUT /api/admin/users/[id]**
- **Purpose**: Update user (admin only)
- **Auth**: Admin required
- **Body**: User update data
- **Response**: Success/error message

#### **DELETE /api/admin/users/[id]**
- **Purpose**: Delete user (admin only)
- **Auth**: Admin required
- **Response**: Success/error message

### **3. Admin Analytics**
#### **GET /api/admin/analytics**
- **Purpose**: Get comprehensive analytics
- **Auth**: Admin required
- **Response**: Detailed analytics data

#### **GET /api/admin/analytics/track**
- **Purpose**: Track user activity
- **Auth**: Not required
- **Query Parameters**:
  - `event`: Event type
  - `userId`: User ID
  - `data`: Additional data
- **Response**: Success/error message

### **4. Admin Management**
#### **GET /api/admin/roles**
- **Purpose**: Get all user roles
- **Auth**: Admin required
- **Response**: Roles list

#### **POST /api/admin/roles**
- **Purpose**: Create new role
- **Auth**: Admin required
- **Body**: Role data
- **Response**: Success/error message

#### **PUT /api/admin/roles/[id]**
- **Purpose**: Update role
- **Auth**: Admin required
- **Body**: Updated role data
- **Response**: Success/error message

#### **DELETE /api/admin/roles/[id]**
- **Purpose**: Delete role
- **Auth**: Admin required
- **Response**: Success/error message

### **5. Admin Operations**
#### **POST /api/admin/bulk-tier-operation**
- **Purpose**: Bulk user role operations
- **Auth**: Admin required
- **Body**:
```json
{
  "operation": "upgrade",
  "userIds": ["user1", "user2"],
  "newRole": "premium"
}
```
- **Response**: Success/error message

#### **POST /api/admin/quick-create-tier**
- **Purpose**: Quick create user tier
- **Auth**: Admin required
- **Body**: Tier creation data
- **Response**: Success/error message

#### **POST /api/admin/quick-delete-tier**
- **Purpose**: Quick delete user tier
- **Auth**: Admin required
- **Body**: Tier deletion data
- **Response**: Success/error message

## 📧 **Email & Communication Endpoints**

### **1. Email Subscriptions**
#### **POST /api/email-subscription**
- **Purpose**: Subscribe to email updates
- **Auth**: Not required
- **Body**:
```json
{
  "email": "user@example.com"
}
```
- **Response**: Success/error message

#### **GET /api/email-subscription/confirm/[token]**
- **Purpose**: Confirm email subscription
- **Auth**: Not required
- **Response**: Confirmation page

#### **POST /api/unsubscribe**
- **Purpose**: Unsubscribe from emails
- **Auth**: Not required
- **Body**:
```json
{
  "email": "user@example.com"
}
```
- **Response**: Success/error message

### **2. Promotional Emails**
#### **POST /api/admin/send-promotional-emails**
- **Purpose**: Send promotional emails (admin only)
- **Auth**: Admin required
- **Body**:
```json
{
  "subject": "Email Subject",
  "content": "Email content",
  "recipients": ["user1@example.com", "user2@example.com"]
}
```
- **Response**: Success/error message

## 🛠️ **System & Utility Endpoints**

### **1. Health Checks**
#### **GET /api/health-check**
- **Purpose**: System health monitoring
- **Auth**: Not required
- **Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T...",
  "database": "connected",
  "services": {
    "mongodb": "connected",
    "cloudinary": "connected",
    "ai": "connected"
  }
}
```

### **2. Rate Limiting Info**
#### **GET /api/rate-limit-info**
- **Purpose**: Get rate limiting information
- **Auth**: Required
- **Response**:
```json
{
  "success": true,
  "data": {
    "remaining": 95,
    "reset": "2025-01-01T...",
    "limit": 100
  }
}
```

### **3. Contact Form**
#### **POST /api/contact**
- **Purpose**: Submit contact form
- **Auth**: Not required
- **Body**:
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "subject": "Contact Subject",
  "message": "Contact message"
}
```
- **Response**: Success/error message

### **4. Debug & Testing**
#### **GET /api/debug-session**
- **Purpose**: Debug session data (development)
- **Auth**: Required
- **Response**: Session debugging information

#### **GET /api/test-env**
- **Purpose**: Test environment variables
- **Auth**: Not required
- **Response**: Environment configuration status

## 📊 **Response Format Standards**

### **Success Response**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### **Error Response**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### **Paginated Response**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🔒 **Authentication Requirements**

### **Public Endpoints** (No Auth Required)
- `/api/auth/signin`
- `/api/auth/register`
- `/api/health-check`
- `/api/contact`
- `/api/email-subscription`
- `/api/unsubscribe`

### **User Authentication Required**
- `/api/user/*`
- `/api/posts/*`
- `/api/upload`
- `/api/generate-captions`

### **Admin Authentication Required**
- `/api/admin/*` (all admin endpoints)

## 🚨 **Rate Limiting**

- **Default Limit**: 100 requests per hour per IP
- **Upload Endpoints**: 10 requests per hour per user
- **AI Generation**: 20 requests per hour per user
- **Admin Endpoints**: 1000 requests per hour per admin

## 📝 **Usage Examples**

### **Complete User Registration Flow**
```javascript
// 1. Register user
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'User Name'
  })
});

// 2. Sign in (redirects to Google OAuth)
window.location.href = '/api/auth/signin';

// 3. Get user profile
const profileResponse = await fetch('/api/user');
const profileData = await profileResponse.json();
```

### **Complete Caption Generation Flow**
```javascript
// 1. Upload image
const formData = new FormData();
formData.append('file', imageFile);
const uploadResponse = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
const { url: imageUrl } = await uploadResponse.json();

// 2. Generate captions
const captionResponse = await fetch('/api/generate-captions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageUrl,
    mood: 'funny',
    description: 'A funny image'
  })
});
const { captions } = await captionResponse.json();
```

---

**🔑 Key Points:**
- **All endpoints return JSON responses**
- **Authentication is handled via NextAuth.js sessions**
- **Admin endpoints require admin role verification**
- **Rate limiting is applied to prevent abuse**
- **Error handling follows consistent format**
- **File uploads use FormData format**

This comprehensive API documentation covers all available endpoints for the Capsera platform.
