# 🗄️ DATABASE SCHEMA - Complete MongoDB Structure

## 📊 **Database Overview**

Capsera uses **MongoDB** as the primary database with **Mongoose ODM** for data modeling. The database is designed to handle user management, content storage, and system administration efficiently.

## 🏗️ **Database Architecture**

```
📊 CAPSERA DATABASE
├── 📝 users (User accounts and profiles)
├── 🎭 roles (User roles and permissions)
├── 🖼️ posts (Caption posts and images)
├── 🔐 adminUsers (Admin authentication)
├── 🚫 blockedCredentials (Security management)
├── 📧 emailSubscriptions (Email marketing)
├── 🗄️ captionCache (AI response caching)
└── ⚙️ systemLock (Admin access control)
```

## 📝 **Users Collection**

### **Schema Definition**
```typescript
interface User {
  _id: ObjectId;
  email: string;           // Unique email address
  username?: string;       // Optional username
  title?: string;          // User title/headline
  bio?: string;            // User biography
  image?: string;          // Profile image URL (Cloudinary)
  role: ObjectId;          // Reference to roles collection
  createdAt: Date;         // Account creation timestamp
  updatedAt: Date;         // Last update timestamp
  isAdmin: boolean;        // Admin status flag
  lastLogin?: Date;        // Last login timestamp
  isActive: boolean;       // Account active status
  emailVerified: boolean;  // Email verification status
}
```

### **Indexes**
```javascript
// Primary indexes
{ email: 1 }                    // Unique email lookup
{ role: 1 }                     // Role-based queries
{ createdAt: -1 }               // Recent users

// Compound indexes
{ email: 1, isActive: 1 }       // Active user lookup
{ role: 1, createdAt: -1 }      // Role-based user lists
```

### **Sample Document**
```json
{
  "_id": ObjectId("68a41238196fa9f1f937830e"),
  "email": "user@example.com",
  "username": "creative_user",
  "title": "Content Creator",
  "bio": "Passionate about creating engaging content",
  "image": "https://res.cloudinary.com/.../profile.jpg",
  "role": ObjectId("689b6873ea3cbdbb3b2cc3d6"),
  "createdAt": ISODate("2025-01-01T10:00:00Z"),
  "updatedAt": ISODate("2025-01-15T14:30:00Z"),
  "isAdmin": false,
  "lastLogin": ISODate("2025-01-15T14:30:00Z"),
  "isActive": true,
  "emailVerified": true
}
```

## 🎭 **Roles Collection**

### **Schema Definition**
```typescript
interface Role {
  _id: ObjectId;
  name: string;            // Role identifier (admin, user, premium)
  displayName: string;     // Human-readable role name
  permissions: string[];   // Array of permission strings
  description?: string;    // Role description
  createdAt: Date;         // Role creation timestamp
  isActive: boolean;       // Role active status
  priority: number;        // Role priority level
}
```

### **Indexes**
```javascript
{ name: 1 }                // Unique role name
{ isActive: 1 }            // Active roles
{ priority: 1 }            // Role priority sorting
```

### **Sample Document**
```json
{
  "_id": ObjectId("689b6873ea3cbdbb3b2cc3d6"),
  "name": "admin",
  "displayName": "Administrator",
  "permissions": [
    "user:read",
    "user:write",
    "user:delete",
    "admin:access",
    "analytics:read",
    "system:manage"
  ],
  "description": "Full system access and management",
  "createdAt": ISODate("2025-01-01T00:00:00Z"),
  "isActive": true,
  "priority": 100
}
```

## 🖼️ **Posts Collection**

### **Schema Definition**
```typescript
interface Post {
  _id: ObjectId;
  userId: ObjectId;        // Reference to users collection
  image: string;           // Image URL (Cloudinary)
  captions: string[];      // Array of generated captions
  mood: string;            // Caption mood/style
  description?: string;    // User-provided description
  tags?: string[];         // Content tags
  likes?: number;          // Like count
  views?: number;          // View count
  isPublic: boolean;       // Public visibility
  createdAt: Date;         // Post creation timestamp
  updatedAt: Date;         // Last update timestamp
  aiModel?: string;        // AI model used (gemini, openai)
  processingTime?: number; // AI processing time in ms
}
```

### **Indexes**
```javascript
{ userId: 1 }              // User's posts
{ createdAt: -1 }          // Recent posts
{ mood: 1 }                // Mood-based queries
{ tags: 1 }                // Tag-based search
{ userId: 1, createdAt: -1 } // User's recent posts
```

### **Sample Document**
```json
{
  "_id": ObjectId("68a41238196fa9f1f9378310"),
  "userId": ObjectId("68a41238196fa9f1f937830e"),
  "image": "https://res.cloudinary.com/.../funny_cat.jpg",
  "captions": [
    "When you finally understand the assignment at 3 AM",
    "This cat has seen things...",
    "Monday mood captured perfectly"
  ],
  "mood": "funny",
  "description": "A funny cat with a confused expression",
  "tags": ["cat", "funny", "meme", "confused"],
  "likes": 42,
  "views": 156,
  "isPublic": true,
  "createdAt": ISODate("2025-01-15T10:00:00Z"),
  "updatedAt": ISODate("2025-01-15T10:00:00Z"),
  "aiModel": "gemini",
  "processingTime": 2500
}
```

## 🔐 **AdminUsers Collection**

### **Schema Definition**
```typescript
interface AdminUser {
  _id: ObjectId;
  email: string;           // Admin email address
  password: string;        // Hashed password
  role: string;            // Admin role level
  isActive: boolean;       // Account active status
  lastLogin?: Date;        // Last login timestamp
  loginAttempts: number;   // Failed login attempts
  lockedUntil?: Date;      // Account lock timestamp
  createdAt: Date;         // Account creation timestamp
  updatedAt: Date;         // Last update timestamp
  permissions: string[];   // Specific permissions
  twoFactorEnabled: boolean; // 2FA status
}
```

### **Indexes**
```javascript
{ email: 1 }               // Unique email
{ isActive: 1 }            // Active admins
{ role: 1 }                // Role-based queries
```

### **Sample Document**
```json
{
  "_id": ObjectId("68a41238196fa9f1f9378312"),
  "email": "admin@capsera.com",
  "password": "$2b$10$hashedpassword...",
  "role": "super_admin",
  "isActive": true,
  "lastLogin": ISODate("2025-01-15T14:00:00Z"),
  "loginAttempts": 0,
  "lockedUntil": null,
  "createdAt": ISODate("2025-01-01T00:00:00Z"),
  "updatedAt": ISODate("2025-01-15T14:00:00Z"),
  "permissions": ["*"],
  "twoFactorEnabled": false
}
```

## 🚫 **BlockedCredentials Collection**

### **Schema Definition**
```typescript
interface BlockedCredentials {
  _id: ObjectId;
  email: string;           // Blocked email address
  reason: string;          // Block reason
  blockedAt: Date;         // Block timestamp
  blockedBy: ObjectId;     // Admin who blocked
  expiresAt?: Date;        // Block expiration
  isActive: boolean;       // Block active status
  notes?: string;          // Additional notes
}
```

### **Indexes**
```javascript
{ email: 1 }               // Blocked email lookup
{ isActive: 1 }            // Active blocks
{ blockedAt: -1 }          // Recent blocks
```

## 📧 **EmailSubscriptions Collection**

### **Schema Definition**
```typescript
interface EmailSubscription {
  _id: ObjectId;
  email: string;           // Subscriber email
  isConfirmed: boolean;    // Email confirmation status
  confirmationToken: string; // Confirmation token
  subscribedAt: Date;      // Subscription timestamp
  confirmedAt?: Date;      // Confirmation timestamp
  unsubscribedAt?: Date;   // Unsubscription timestamp
  preferences: {            // Email preferences
    marketing: boolean;
    updates: boolean;
    newsletters: boolean;
  };
  tags: string[];          // Subscription tags
}
```

### **Indexes**
```javascript
{ email: 1 }               // Unique email
{ isConfirmed: 1 }         // Confirmed subscriptions
{ subscribedAt: -1 }       // Recent subscriptions
```

## 🗄️ **CaptionCache Collection**

### **Schema Definition**
```typescript
interface CaptionCache {
  _id: ObjectId;
  imageHash: string;       // Image content hash
  mood: string;            // Caption mood
  captions: string[];      // Cached captions
  aiModel: string;         // AI model used
  createdAt: Date;         // Cache creation timestamp
  expiresAt: Date;         // Cache expiration timestamp
  hitCount: number;        // Cache hit count
  lastAccessed: Date;      // Last access timestamp
  processingTime: number;  // Original processing time
}
```

### **Indexes**
```javascript
{ imageHash: 1, mood: 1 } // Image + mood lookup
{ expiresAt: 1 }           // Expired cache cleanup
{ hitCount: -1 }           // Popular cache entries
```

## ⚙️ **SystemLock Collection**

### **Schema Definition**
```typescript
interface SystemLock {
  _id: ObjectId;
  isActive: boolean;       // Lock active status
  pin: string;             // Hashed PIN
  maxAttempts: number;     // Maximum PIN attempts
  lockoutDuration: number; // Lockout duration (minutes)
  createdAt: Date;         // Lock creation timestamp
  updatedAt: Date;         // Last update timestamp
  lastFailedAttempt?: Date; // Last failed attempt
  failedAttempts: number;  // Current failed attempts
  lockedUntil?: Date;      // Lockout until timestamp
}
```

### **Indexes**
```javascript
{ isActive: 1 }            // Active lock status
```

## 🔗 **Database Relationships**

### **One-to-Many Relationships**
```
User (1) → Posts (Many)
User (1) → EmailSubscriptions (Many)
Role (1) → Users (Many)
```

### **Referential Integrity**
```javascript
// User references Role
users.role → roles._id

// Post references User
posts.userId → users._id

// BlockedCredentials references Admin
blockedCredentials.blockedBy → adminUsers._id
```

## 📊 **Database Performance**

### **Indexing Strategy**
```javascript
// Primary indexes for fast lookups
{ email: 1 }                    // User authentication
{ userId: 1, createdAt: -1 }    // User content
{ imageHash: 1, mood: 1 }       // Cache lookups

// Compound indexes for complex queries
{ role: 1, isActive: 1 }        // Active users by role
{ mood: 1, createdAt: -1 }      // Recent posts by mood
{ tags: 1, isPublic: 1 }        // Public posts by tags
```

### **Query Optimization**
```javascript
// Efficient user queries
db.users.find({ email: "user@example.com" }).hint({ email: 1 })

// Fast post retrieval
db.posts.find({ userId: ObjectId("...") })
  .sort({ createdAt: -1 })
  .hint({ userId: 1, createdAt: -1 })

// Cache optimization
db.captionCache.find({ 
  imageHash: "...", 
  mood: "funny" 
}).hint({ imageHash: 1, mood: 1 })
```

## 🗃️ **Data Migration & Backup**

### **Backup Commands**
```bash
# MongoDB Atlas backup
mongodump --uri="mongodb+srv://..." --out=./backup

# Local MongoDB backup
mongodump --db=capsera --out=./backup

# Restore from backup
mongorestore --uri="mongodb+srv://..." --db=capsera ./backup/capsera
```

### **Data Export**
```bash
# Export users collection
mongoexport --uri="mongodb+srv://..." --collection=users --out=users.json

# Export posts collection
mongoexport --uri="mongodb+srv://..." --collection=posts --out=posts.json
```

## 🔒 **Security Considerations**

### **Data Encryption**
- Passwords are hashed using bcrypt
- Sensitive data is encrypted at rest
- API keys are stored in environment variables

### **Access Control**
- Role-based permissions
- IP whitelisting for admin access
- Session-based authentication

### **Audit Trail**
```javascript
// Track important operations
{
  operation: "user_login",
  userId: ObjectId("..."),
  timestamp: new Date(),
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0..."
}
```

## 📈 **Monitoring & Analytics**

### **Database Metrics**
```javascript
// Monitor collection sizes
db.stats()

// Check index usage
db.users.getIndexes()

// Monitor query performance
db.users.find().explain("executionStats")
```

### **Performance Alerts**
- Slow query detection (>100ms)
- Index usage monitoring
- Connection pool monitoring
- Storage space alerts

---

**🔑 Key Database Points:**
- **MongoDB Atlas** for production, **Local MongoDB** for development
- **Mongoose ODM** for data modeling and validation
- **Indexes** for query performance optimization
- **Caching** for AI response optimization
- **Backup** and **migration** scripts available
- **Security** through role-based access control
- **Monitoring** for performance and health

This database schema provides a robust foundation for the Capsera platform with efficient data storage, retrieval, and management capabilities.
