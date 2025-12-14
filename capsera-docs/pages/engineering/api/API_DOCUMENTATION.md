# 🔌 Capsera API Documentation

## 📋 **Overview**

Capsera provides a comprehensive REST API for caption generation, user management, and administrative functions.

- **Base URL**: `https://capsera.online` (Production) or `http://localhost:3000` (Local)
- **Format**: JSON
- **Authentication**: Cookie-based (NextAuth.js) or Bearer Token (for specific admin tasks)

---

## 🔐 **Authentication**

Most endpoints require authentication via NextAuth.js session cookies.

### **1. Register User**
Create a new user account. Returns a success message and triggers an OTP email.

- **Endpoint**: `POST /api/auth/register`
- **Access**: Public

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "requireVerification": true,
  "message": "Verification code sent to your email."
}
```

**Local Testing (cURL):**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "TestPassword123!"}'
```

### **2. Verify Email**
Verify the user account using the OTP sent to email.

- **Endpoint**: `POST /api/auth/verify`
- **Access**: Public

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Local Testing (cURL):**
```bash
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "123456"}'
```

---

## 🚀 **Core API Endpoints**

### **1. Generate Captions**
The core endpoint for generating AI captions. Supports both Image URLs and Base64 images.

- **Endpoint**: `POST /api/generate-captions`
- **Access**: Public (Rate Limited) / Authenticated (Higher Limits)

**Request Body:**
```json
{
  
  "mood": "Funny",
  "description": "A cute cat sitting on a laptop",
  "imageUrl": "https://images.unsplash.com/photo-1517849845537-4d257902454a"

}
```

**Response:**
```json
{
  "success": true,
  "captions": [
    "Caption 1...",
    "Caption 2...",
    "Caption 3..."
  ],
  "processingTime": 1234,
  "rateLimit": {
    "remaining": 4,
    "resetTime": 1700000000
  }
}
```

**Local Testing (cURL):**
```bash
# Note: Sending a full Base64 string via curl is messy. 
# It's better to use a small test script or Postman.
# Here is a simplified example using a URL:

curl -X POST http://localhost:3000/api/generate-captions \
  -H "Content-Type: application/json" \
  -d '{
    "mood": "Funny",
    "imageUrl": "https://images.unsplash.com/photo-1517849845537-4d257902454a"
  }'
```

### **2. User Analytics**
Get detailed analytics about the user's generation history.

- **Endpoint**: `GET /api/user/analytics`
- **Access**: Authenticated (Requires Session Cookie)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCaptions": 15,
    "totalImages": 5,
    "moodDistribution": { "Funny": 10, "Serious": 5 },
    "averageCaptionLength": 45,
    "mostUsedMood": "Funny",
    "activityByDay": [ ... ],
    "recentActivity": [ ... ]
  }
}
```

**Local Testing (cURL):**
*Note: You need to grab your `next-auth.session-token` cookie from the browser dev tools.*

```bash
curl -X GET http://localhost:3000/api/user/analytics \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_COOKIE_HERE"
```

---

## �️ **Utility Endpoints**

### **1. Contact Form**
Submit a contact message.

- **Endpoint**: `POST /api/contact`
- **Access**: Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Support",
  "message": "I need help with..."
}
```

**Local Testing (cURL):**
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@test.com", "subject": "Hi", "message": "Test"}'
```

---

## � **Admin Endpoints**

*Requires Admin Privileges and Session Cookie.*

### **1. Dashboard Stats**
Get high-level system statistics.

- **Endpoint**: `GET /api/admin/dashboard-stats`
- **Access**: Admin Only

**Response:**
```json
{
  "totalUsers": 120,
  "totalGenerations": 5000,
  "activeUsersToday": 45,
  "revenue": 0
}
```

### **2. User Management**
Get list of all users.

- **Endpoint**: `GET /api/admin/users`
- **Access**: Admin Only

---

## ⚡ **Performance & Rate Limits**

- **Anonymous Users**: 3 generations / day
- **Free Users**: 5 generations / day
- **Pro Users**: Unlimited

**Headers Returned:**
- `X-RateLimit-Limit`: Total allowed requests
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## 🧪 **Testing Tips**

1.  **Postman / Insomnia**: Highly recommended for testing the `generate-captions` endpoint with Base64 images.
2.  **Browser DevTools**: Use the "Network" tab to copy requests as cURL commands (Right Click -> Copy -> Copy as cURL).
3.  **Environment Variables**: Ensure your `.env` file has valid API keys (`GEMINI_API_KEY_1`, `GROQ_API_KEY_1`) for the generation endpoints to work locally.
