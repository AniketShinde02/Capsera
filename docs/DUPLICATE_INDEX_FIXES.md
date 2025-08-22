# 🔧 Duplicate MongoDB Index Fixes

## 🚨 **Issue Identified**

During Vercel build, the following warnings appeared:
```
[MONGOOSE] Warning: Duplicate schema index on {"expiresAt":1} found
[MONGOOSE] Warning: Duplicate schema index on {"email":1} found
```

## ✅ **Fixes Applied**

### **1. CaptionCache Model (`src/models/CaptionCache.ts`)**
- **Problem**: `expiresAt` field had both `index: true` AND `Schema.index()`
- **Fix**: Removed `index: true` from field definition
- **Result**: Only TTL index remains: `CaptionCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })`

### **2. User Model (`src/models/User.ts`)**
- **Problem**: `email` field had both `index: true` AND `Schema.index()` calls
- **Fix**: Removed `index: true` from field definition
- **Result**: Only unique constraint remains: `unique: true` (automatically creates index)

## 📋 **Root Cause**

The issue occurs when you define indexes in **two places**:

1. **Inline field definition**: `{ type: String, index: true }`
2. **Explicit schema index**: `Schema.index({ field: 1 })`

MongoDB/Mongoose treats these as duplicate index definitions.

## 🛡️ **Prevention Rules**

### **✅ DO: Use Inline Indexes For Simple Cases**
```typescript
// For simple single-field indexes
email: {
  type: String,
  unique: true,  // Creates index automatically
  index: true    // Creates index automatically
}
```

### **✅ DO: Use Schema.index() For Complex Cases**
```typescript
// For compound indexes
Schema.index({ field1: 1, field2: -1 });

// For TTL indexes
Schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// For sparse indexes
Schema.index({ field: 1 }, { sparse: true });
```

### **❌ DON'T: Mix Both Approaches**
```typescript
// ❌ WRONG - Duplicate index
email: {
  type: String,
  index: true  // Creates index
}
Schema.index({ email: 1 }); // Creates SAME index again
```

## 🔍 **Verification**

Run the verification script:
```bash
npm run verify:indexes
```

## 📊 **Current Index Status**

### **User Model**
- ✅ `email`: Unique constraint (auto-index)
- ✅ `resetPasswordToken`: Explicit index
- ✅ `resetPasswordExpires`: Explicit index
- ✅ `resetPasswordRequests.requestedAt`: Explicit index

### **CaptionCache Model**
- ✅ `imageHash`: Unique constraint (auto-index)
- ✅ `prompt`: Explicit index
- ✅ `userId`: Explicit index
- ✅ `expiresAt`: TTL index only
- ✅ Compound index: `{ imageHash: 1, prompt: 1, mood: 1 }`

## 🚀 **Next Steps**

1. **Test the build locally** to ensure no warnings
2. **Deploy to Vercel** to verify production build
3. **Monitor build logs** for any remaining warnings
4. **Use verification script** before major deployments

## 💡 **Best Practices**

1. **Single Field Indexes**: Use `unique: true` or `index: true` in field definition
2. **Compound Indexes**: Always use `Schema.index()`
3. **Special Indexes**: Use `Schema.index()` for TTL, sparse, text indexes
4. **Documentation**: Comment complex index logic
5. **Testing**: Verify indexes work as expected in development

## 🔗 **Related Files**

- `src/models/User.ts` - Fixed email duplicate index
- `src/models/CaptionCache.ts` - Fixed expiresAt duplicate index
- `scripts/verify-indexes.js` - Index verification script
- `docs/DUPLICATE_INDEX_FIXES.md` - This documentation

