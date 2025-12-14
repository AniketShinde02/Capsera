# 📁 Archive System Guide: Capsera Image Management

## 📋 **Overview**
Capsera now uses an intelligent archiving system instead of permanently deleting images. This provides better data recovery, user experience, and compliance while maintaining the appearance of deletion to users.

---

## 🎯 **How It Works**

### **User Experience**
1. **User clicks "Delete"** → Image appears to be deleted
2. **Frontend shows "Deleted successfully"** → User thinks it's gone
3. **Image is safely archived** → Stored in `capsera_archives/` folder
4. **Can be restored later** → By admins or through API calls

### **Technical Process**
1. **Archive Copy**: Copy to archive; verify checksum/bytes.
2. **Idempotency**: Use `Idempotency-Key` to make retries safe.
3. **Swap/Mark**: Mark DB record as archived (status=archived, archivedAt, archivedId).
4. **Original Delete**: Delete original after archive verification.
5. **Outbox/Event**: Emit ArchiveCreated event for downstream consumers.
6. **Compensation**: If any step fails, leave original intact; retry asynchronously.---

## 🗂️ **Archive Folder Structure**

```
capsera_archives/
├── user_id_1/
│   ├── 1703123456789_image1.jpg
│   ├── 1703123456790_image2.png
│   └── ...
├── user_id_2/
│   ├── 1703123456800_image3.jpg
│   └── ...
└── unknown_users/
    ├── 1703123456900_orphaned_image.jpg
    └── ...
```

### **Naming Convention**
- **Format**: `{timestamp}__{shortid}__{sanitized_original_filename}`
- **Sanitization**: Strip paths, control chars, and limit to `[a-zA-Z0-9._-]`; truncate to 64 chars.
- **Example**: `1703123456789__Xa9f2K__cat_photo.jpg`
- **Alternative**: `{timestamp}__{sha1(publicId)}.{ext}` to avoid PII in paths.
- **Benefits**: 
  - Easy chronological sorting
  - No filename conflicts
  - Clear audit trail---

## 🔧 **API Endpoints**

### **1. Archive Image (Instead of Delete)**
```http
DELETE /api/delete-image
Content-Type: application/json

{
  "imageUrl": "https://res.cloudinary.com/...",
  "userId": "user_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Image moved to archive successfully",
  "archivedId": "capsera_archives/user_id/timestamp_filename.jpg",
  "note": "Image is safely archived and can be restored if needed"
}
```

### **2. List Archived Images**
### **3. Restore Archived Image**
```http
POST /api/archive
Content-Type: application/json

{
  "archivedId": "capsera_archives/user_id/timestamp_filename.jpg",
  "originalPath": "capsera_uploads/filename.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Image restored successfully",
  "restoredId": "capsera_uploads/filename.jpg"
}
```

### **4. Cleanup Old Archives**
```http
DELETE /api/archive
Content-Type: application/json

{
  "daysOld": 90
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cleanup completed: 15 deleted, 0 errors",
  "data": {
    "deleted": 15,
    "errors": 0,
    "details": [...]
  }
}
### **4. Cleanup Old Archives**- Cleans up archived copy

#### **List Archives**
```typescript
listArchivedImages(userId?: string, limit: number = 50)
```
- Lists all archived images for a user
- Supports pagination and filtering
- Returns detailed image information

#### **Cleanup Old Archives**
```typescript
cleanupOldArchivedImages(daysOld: number = 90)
```
- Removes archives older than specified days
- Configurable retention policy
- Detailed cleanup reporting

---

## 📊 **Benefits of Archiving System**

### **For Users**
- **Perceived Deletion**: Images appear to be deleted
- **Better UX**: No broken image links
- **Privacy**: Images are "gone" from their view

### **For Administrators**
- **Data Recovery**: Can restore images if needed
- **Audit Trail**: Complete history of user actions
- **Compliance**: Better data retention policies
- **Storage Management**: Controlled cleanup of old archives

### **For Business**
- **Customer Support**: Can recover accidentally "deleted" images
- **Legal Compliance**: Better data handling practices
- **Cost Control**: Periodic cleanup of old archives
- **Professional Image**: More sophisticated data management

---

## 🔄 **Migration from Deletion to Archiving**

### **What Changed**
- **API Endpoints**: Now use archiving functions
- **User Messages**: "Deleted" → "Moved to archive"
- **Storage**: Images go to archive folder
- **Recovery**: Full restore capability

### **Backward Compatibility**
- **Frontend**: Still shows "deleted" to users
- **Database**: Same deletion behavior
- **User Experience**: No visible changes
- **API**: Same endpoint names, different behavior

---

## 🛠️ **Maintenance & Operations**

### **Regular Tasks**
1. **Monitor Archive Size**: Check folder sizes monthly
2. **Cleanup Old Archives**: Run cleanup every 30-90 days
3. **Verify Restore Function**: Test restore capability monthly
4. **Storage Optimization**: Monitor Cloudinary usage

### **Cleanup Schedule**
- **30 Days**: Review archive growth
- **60 Days**: Clean up very old archives
- **90 Days**: Major cleanup operation
- **Quarterly**: Archive system health check

### **Monitoring Points**
- **Archive Growth**: Track folder size increases
- **Restore Success Rate**: Monitor restore operations
- **Storage Costs**: Watch Cloudinary usage
- **User Complaints**: Track "deleted" image issues

---

## 🚨 **Emergency Procedures**

### **If Archiving Fails**
1. **Fallback to Deletion**: Use original delete functions
2. **Manual Recovery**: Restore from Cloudinary dashboard
## 🔄 **Migration from Deletion to Archiving**

### **What Changed**
- **API Endpoints**: Now use archiving functions
- **User Messages**: "Deleted" → "Moved to archive"
- **Storage**: Images go to archive folder
- **Recovery**: Full restore capability

### **Backward Compatibility**
- **API**: `/v1` (delete) maintained; `/v2` introduces archiving. `/v1` sunset on 2026-06-30.
- **Deprecation Notice**: Responses include `Deprecation` and `Sunset` headers.
- **Changelog**: Document client-visible semantic changes and migration steps.

---- **Cleanup Efficiency**: Automated cleanup reduces long-term costs
- **CDN Benefits**: Archived images still benefit from Cloudinary CDN

### **API Performance**
- **Archive Operations**: Slightly slower than deletion (copy + delete)
- **Restore Operations**: Similar to archive operations
- **List Operations**: Fast with proper indexing
- **Cleanup Operations**: Batch processing for efficiency

---

## 🔒 **Security & Privacy**

### **Access Control**
- **User Isolation**: Users can only see their own archives
- **Admin Access**: Admins can manage all archives
- **API Security**: All endpoints require authentication
- **Audit Logging**: Complete operation history

### **Data Protection**
- **Encrypted Storage**: Cloudinary provides encryption
- **Access Logs**: Track all archive operations
- **User Privacy**: Archives respect user boundaries
- **Compliance**: GDPR and privacy regulation support

## 🚨 **Emergency Procedures**

### **If Archiving Fails**
1. **Queue & Retry**: Place operation in retry queue with exponential backoff.
2. **Block Deletion**: Do not delete original until archive is verified or admin override is approved.
3. **Alerting**: Page on repeated failures; include requestId and userId.
2. **Manual Recovery**: Restore from Cloudinary dashboard
3. **User Communication**: Explain temporary issues
4. **System Rollback**: Revert to deletion if needed
# Archive folder prefix
ARCHIVE_FOLDER_PREFIX=capsera_archives

# Maximum archive size per user (MB)
MAX_ARCHIVE_SIZE_MB=1000

# Cleanup schedule (cron format)
ARCHIVE_CLEANUP_SCHEDULE="0 2 * * 0"  # Weekly at 2 AM Sunday
```

### **Customization Options**
- **Retention Periods**: Different rules for different user types
- **Storage Limits**: Per-user archive size limits
- **Cleanup Policies**: Automated vs. manual cleanup
- **Notification Systems**: Alert admins about large archives

---

## 🎉 **Summary**

The Capsera archive system provides:

✅ **Better User Experience**: Images appear deleted but are safely stored  
✅ **Data Recovery**: Full restore capability for all archived images  
✅ **Professional Management**: Sophisticated data handling practices  
✅ **Cost Control**: Automated cleanup and storage optimization  
✅ **Compliance**: Better data retention and audit capabilities  
✅ **Zero Disruption**: Users see no changes in behavior  

**Result**: A professional, reliable image management system that protects data while maintaining excellent user experience.

---

**🚀 Ready to use!** The system automatically archives all "deleted" images and provides full management capabilities through the new API endpoints.
